#!/usr/bin/env node
import { readFileSync, realpathSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { getCostReport, GuardError, VendorError } from "./core.js";
import { DEFAULT_BRAND, loadSourceFile, PLATFORMS, repurpose, scoreVariant, type Platform } from "./index.js";
import { VERSION } from "./version.js";

export class UsageError extends Error { constructor(message: string) { super(message); this.name = "UsageError"; } }
export type CliCommand = "repurpose" | "costs" | "mcp" | "help" | "version";
export interface CliRequest { command: CliCommand; text?: string; file?: string; platforms?: Platform[]; dryRun: boolean; live: boolean; approved: boolean; }
export function parseArgs(argv: string[]): CliRequest {
  const request: CliRequest = { command: "help", dryRun: true, live: false, approved: false };
  const args = [...argv]; const first = args.shift();
  if (first === undefined || first === "--help" || first === "-h") return request;
  if (first === "--version" || first === "-V") { request.command = "version"; return request; }
  if (!["repurpose", "costs", "mcp"].includes(first)) throw new UsageError(`unknown command "${first}"`);
  request.command = first as CliCommand;
  while (args.length) {
    const flag = args.shift()!;
    if (flag === "--live") { request.live = true; request.dryRun = false; continue; }
    if (flag === "--dry-run") { request.dryRun = true; request.live = false; continue; }
    if (flag === "--approve") { request.approved = true; continue; }
    if (["--text", "--file", "--platforms"].includes(flag) && args.length) {
      const value = args.shift()!;
      if (flag === "--text") request.text = value;
      if (flag === "--file") request.file = value;
      if (flag === "--platforms") {
        const names = value.split(",").map((x) => x.trim()).filter(Boolean);
        const bad = names.find((x) => !PLATFORMS.includes(x as Platform));
        if (bad) throw new UsageError(`unsupported platform "${bad}"`);
        request.platforms = names as Platform[];
      }
      continue;
    }
    throw new UsageError(`unknown flag "${flag}" for "${request.command}"`);
  }
  if (request.command === "repurpose" && request.text === undefined && request.file === undefined) throw new UsageError("repurpose needs --text or --file");
  if (request.live && !request.approved) throw new UsageError("live actions need --approve");
  return request;
}
export interface CliIo { out(line: string): void; err(line: string): void; readFile(path: string): string; }
function defaultIo(): CliIo { return { out: console.log, err: console.error, readFile: (path) => readFileSync(path, "utf8") }; }
function helpText(): string { return [`${DEFAULT_BRAND.name} ${VERSION}`, DEFAULT_BRAND.description, "", `Usage: ${DEFAULT_BRAND.command} repurpose --text <t>|--file <p> [--platforms x-thread,linkedin] [--live --approve]`, "", "Commands:", "  repurpose  Create disclosed platform variants (dry-run by default).", "  costs      Print the cost report as JSON.", "  mcp        Start the MCP server on stdio.", "", "Flags:", "  --live --approve  Explicitly approve a live action.", "  --dry-run         Preview only (default).", "  --help, -h        Print this help.", "  --version, -V     Print the version."].join("\n"); }
export async function runCli(argv: string[], io: CliIo = defaultIo()): Promise<number> {
  let request: CliRequest; try { request = parseArgs(argv); } catch (error) { io.err(error instanceof Error ? error.message : String(error)); return 2; }
  try {
    if (request.command === "help") { io.out(helpText()); return 0; }
    if (request.command === "version") { io.out(VERSION); return 0; }
    if (request.command === "costs") { io.out(JSON.stringify(getCostReport())); return 0; }
    if (request.command === "mcp") { const { startMcp } = await import("./mcp.js"); await startMcp(); return 0; }
    const source = request.file ? loadSourceFile(request.file, io.readFile).text : request.text!;
    const variants = repurpose(source, request.platforms);
    io.out(JSON.stringify({ dryRun: request.dryRun, variants: variants.map((variant) => ({ ...variant, score: scoreVariant(variant) })) }));
    return 0;
  } catch (error) {
    if (error instanceof GuardError || error instanceof VendorError || error instanceof UsageError) { io.err(`${error.name}: ${error.message}`); return 1; }
    if (error instanceof Error && "code" in error && error.code === "ENOENT") { io.err(`file not found: ${request.file ?? ""}`); return 1; }
    throw error;
  }
}
function isMainModule(): boolean { try { return typeof process.argv[1] === "string" && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href; } catch { return false; } }
if (isMainModule()) runCli(process.argv.slice(2)).then((code) => { if (code) process.exit(code); }, (error: unknown) => { console.error(error instanceof Error ? error.message : String(error)); process.exit(1); });
