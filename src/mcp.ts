import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createLogger, GuardError, VendorError, type Guards, type Logger } from "./core.js";
import { DEFAULT_BRAND, PLATFORMS, repurpose, scoreVariant, type Platform } from "./index.js";
export interface McpDeps { guards?: Guards; logger?: Logger; }
const ok = (value: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify(value) }] });
const fail = (error: unknown) => ({ content: [{ type: "text" as const, text: JSON.stringify({ error: error instanceof Error ? error.message : String(error) }) }], isError: true as const });
export function createMcpServer(deps: McpDeps = {}): McpServer {
  const server = new McpServer({ name: DEFAULT_BRAND.command, version: DEFAULT_BRAND.version });
  const logger = deps.logger ?? createLogger({ quiet: true });
  server.registerTool("repurpose", { description: "Turn a source into disclosed platform variants. Dry-run is the default; live needs approval.", inputSchema: { source: z.string(), platforms: z.array(z.enum(PLATFORMS as [Platform, ...Platform[]])).optional(), live: z.boolean().optional(), approved: z.boolean().optional() }, annotations: { readOnlyHint: false, destructiveHint: false } }, async ({ source, platforms, live, approved }) => {
    try { if (live && !approved) throw new GuardError("live actions need approved: true"); const variants = repurpose(source, platforms, { guards: deps.guards }); logger.info(`created ${variants.length} variants`); return ok({ dryRun: !live, variants: variants.map((v) => ({ ...v, score: scoreVariant(v) })) }); } catch (error) { if (error instanceof GuardError || error instanceof VendorError) return fail(error); throw error; }
  });
  server.registerTool("score_variant", { description: "Score a generated variant for limits and disclosure.", inputSchema: { platform: z.enum(PLATFORMS as [Platform, ...Platform[]]), content: z.string(), disclosure: z.string().optional(), report: z.object({ originalChars: z.number(), finalChars: z.number(), cutChars: z.number(), truncated: z.boolean() }) }, annotations: { readOnlyHint: true } }, async (variant) => ok(scoreVariant({ ...variant, disclosure: variant.disclosure ?? "" })));
  return server;
}
export async function startMcp(deps: McpDeps = {}): Promise<void> { const server = createMcpServer(deps); await server.connect(new StdioServerTransport()); }
