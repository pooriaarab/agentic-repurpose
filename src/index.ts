export { VERSION } from "./version.js";
export * from "./repurpose.js";
export {
  defineBrand, createLogger, GuardError, VendorError, createGuards, LocalRouterAdapter, HttpRouterAdapter,
  recordCost, getCostReport, resetCosts, createDryRunResult, dispatchText, summarizeText,
} from "./core.js";
export type {
  BrandConfig, LogLevel, Logger, LoggerOptions, CapsConfig, QuietHoursConfig, GuardsConfig, Guards,
  DispatchReceipt, RouterAdapter, HttpRouterOptions, CostEntry, CostReport, DispatchOptions, DispatchResult,
  TopWord, TextSummary, SummarizeOptions,
} from "./core.js";
import { defineBrand, type BrandConfig } from "./core.js";
import { VERSION } from "./version.js";
export const DEFAULT_BRAND: BrandConfig = defineBrand({
  name: "Agentic Repurpose", command: "agentic-repurpose",
  description: "Turn one source into platform-ready post variants.",
  keywords: ["repurpose", "content", "social", "cli", "mcp"], version: VERSION,
});
