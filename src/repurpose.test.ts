import { describe, expect, test } from "vitest";
import { DISCLOSURE_LINE, loadSource, PLATFORM_LIMITS, repurpose, scoreVariant } from "./repurpose.js";
describe("repurpose", () => {
 test("creates disclosed variants within limits", () => { const variants=repurpose("A useful original source with enough detail to adapt."); expect(variants).toHaveLength(6); for (const v of variants) { expect(v.content).toContain(DISCLOSURE_LINE); expect(v.content.length).toBeLessThanOrEqual(PLATFORM_LIMITS[v.platform].chars); } });
 test("reports safe truncation", () => { const v=repurpose("word ".repeat(200),["x-thread"])[0]; expect(v.report.truncated).toBe(true); expect(v.content).toContain("…"); });
 test("loads URL via injected fetch", async () => { const result=await loadSource("https://example.test",{fetchFn: async ()=>new Response("loaded")}); expect(result).toMatchObject({text:"loaded",kind:"url"}); });
 test("scores complete disclosed variant", () => { const v=repurpose("A source.",["linkedin"])[0]; expect(scoreVariant(v).score).toBe(100); });
});
