import { readFileSync } from "node:fs";
import { GuardError, VendorError, type Guards } from "./core.js";

export const DISCLOSURE_LINE = "Disclosure: AI-assisted adaptation from an original source.";

export const PLATFORM_LIMITS = {
  "x-thread": { chars: 280, hashtags: 2 },
  linkedin: { chars: 3000, hashtags: 5 },
  "instagram-caption": { chars: 2200, hashtags: 30 },
  "carousel-outline": { chars: 2200, hashtags: 0 },
  "short-video-script": { chars: 2200, hashtags: 0 },
  "reddit-post": { chars: 40000, hashtags: 0 },
} as const;

export type Platform = keyof typeof PLATFORM_LIMITS;
export const PLATFORMS = Object.keys(PLATFORM_LIMITS) as Platform[];

export interface ListingFields {
  title?: string;
  description?: string;
  price?: string | number;
  location?: string;
  [key: string]: string | number | undefined;
}

export type SourceInput = string | ListingFields;
export interface SourceLoadOptions { fetchFn?: typeof fetch; readFile?: (path: string) => string; }
export interface LoadedSource { text: string; kind: "text" | "file" | "url" | "listing"; }

export async function loadSource(source: SourceInput, options: SourceLoadOptions = {}): Promise<LoadedSource> {
  if (typeof source !== "string") {
    const text = Object.entries(source).filter(([, value]) => value !== undefined && value !== "")
      .map(([key, value]) => `${key}: ${value}`).join("\n");
    return { text, kind: "listing" };
  }
  if (/^https?:\/\//i.test(source)) {
    const fetchFn = options.fetchFn ?? fetch;
    let response: Response;
    try { response = await fetchFn(source); } catch (error) {
      throw new VendorError(`source URL request failed: ${String(error)}`, { cause: error });
    }
    if (!response.ok) throw new VendorError(`source URL got status ${response.status}`, { status: response.status });
    try { return { text: await response.text(), kind: "url" }; } catch (error) {
      throw new VendorError(`source URL body failed: ${String(error)}`, { cause: error });
    }
  }
  return { text: source, kind: "text" };
}

export function loadSourceFile(path: string, readFile: (path: string) => string = (p) => readFileSync(p, "utf8")): LoadedSource {
  return { text: readFile(path), kind: "file" };
}

export interface CutReport { originalChars: number; finalChars: number; cutChars: number; truncated: boolean; }
export interface RepurposedVariant { platform: Platform; content: string; disclosure: string; report: CutReport; }
export interface RepurposeOptions { guards?: Guards; }

function normalize(text: string): string { return text.replace(/\s+/g, " ").trim(); }
function sentences(text: string): string[] {
  return normalize(text).match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((s) => s.trim()).filter(Boolean) ?? [];
}
function hashtags(text: string, cap: number): string {
  if (cap === 0) return "";
  const words = [...new Set((text.match(/[A-Za-z][A-Za-z0-9]{3,}/g) ?? []).map((w) => w.toLowerCase()))]
    .filter((w) => !["this", "that", "with", "from", "your", "have", "will", "into", "about"].includes(w)).slice(0, cap);
  return words.length ? `\n\n${words.map((w) => `#${w}`).join(" ")}` : "";
}
function template(platform: Platform, source: string): string {
  const parts = sentences(source);
  const lead = parts[0] ?? source;
  const body = parts.slice(1).join(" ") || lead;
  switch (platform) {
    case "x-thread": return `1/ ${lead}\n\n2/ ${body}\n\n3/ What would you add?`;
    case "linkedin": return `${lead}\n\n${body}\n\nWhat is your experience?`;
    case "instagram-caption": return `${lead}\n\n${body}\n\nSave this for later and share your take.`;
    case "carousel-outline": return `Slide 1: ${lead}\nSlide 2: The context\nSlide 3: ${body}\nSlide 4: Key takeaway\nSlide 5: Next step`;
    case "short-video-script": return `HOOK: ${lead}\n\nBODY: ${body}\n\nCTA: Follow for more practical takeaways.`;
    case "reddit-post": return `Title: ${lead}\n\n${body}\n\nWhat do you think?`;
  }
}
function truncateSafely(content: string, limit: number): { content: string; report: CutReport } {
  const originalChars = content.length;
  if (content.length <= limit) return { content, report: { originalChars, finalChars: content.length, cutChars: 0, truncated: false } };
  const budget = Math.max(0, limit - 1);
  let cut = content.slice(0, budget);
  const boundary = Math.max(cut.lastIndexOf(" "), cut.lastIndexOf("\n"));
  if (boundary > Math.floor(budget * 0.55)) cut = cut.slice(0, boundary);
  const result = `${cut.trimEnd()}…`;
  return { content: result, report: { originalChars, finalChars: result.length, cutChars: originalChars - result.length, truncated: true } };
}

export function repurpose(source: SourceInput, platforms: Platform[] = PLATFORMS, options: RepurposeOptions = {}): RepurposedVariant[] {
  const text = typeof source === "string" ? source : Object.entries(source).map(([k, v]) => `${k}: ${v}`).join("\n");
  if (!text.trim()) throw new GuardError("source must not be empty");
  const invalid = platforms.find((platform) => !(platform in PLATFORM_LIMITS));
  if (invalid) throw new GuardError(`unsupported platform "${invalid}"`);
  options.guards?.checkDispatch(text);
  const variants = platforms.map((platform) => {
    const limit = PLATFORM_LIMITS[platform];
    const suffix = `${hashtags(text, limit.hashtags)}\n\n${DISCLOSURE_LINE}`;
    const available = Math.max(1, limit.chars - suffix.length - 2);
    const base = truncateSafely(template(platform, text), available);
    const content = `${base.content}${suffix}`;
    return { platform, content, disclosure: DISCLOSURE_LINE, report: { originalChars: base.report.originalChars + suffix.length, finalChars: content.length, cutChars: base.report.cutChars, truncated: base.report.truncated } };
  });
  options.guards?.recordDispatch();
  return variants;
}

export interface VariantScore { score: number; reasons: string[]; }
export function scoreVariant(variant: RepurposedVariant): VariantScore {
  const limit = PLATFORM_LIMITS[variant.platform].chars;
  const reasons: string[] = [];
  let score = 100;
  if (!variant.content.includes(DISCLOSURE_LINE)) { score -= 40; reasons.push("missing disclosure"); }
  if (variant.content.length > limit) { score -= 50; reasons.push("exceeds platform character limit"); }
  if (variant.report.truncated) { score -= 5; reasons.push("source was truncated"); }
  if (reasons.length === 0) reasons.push("within platform limits and disclosed");
  return { score: Math.max(0, score), reasons };
}
