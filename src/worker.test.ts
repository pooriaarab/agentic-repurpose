import { describe, expect, test } from "vitest";
import worker from "./worker.js";
describe("worker", () => {
 test("GET /health reports ok", async () => { const response=await worker.fetch(new Request("https://pack.test/health"),{PACK_NAME:"probe"}); expect(response.status).toBe(200); expect(await response.json()).toMatchObject({ok:true,pack:"probe"}); });
 test("POST /repurpose returns variants", async () => { const response=await worker.fetch(new Request("https://pack.test/repurpose",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({source:"one useful source"})}),{}); expect(response.status).toBe(200); expect(await response.json()).toMatchObject({dryRun:true}); });
 test("POST /repurpose rejects bad body", async () => { const response=await worker.fetch(new Request("https://pack.test/repurpose",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({source:42})}),{}); expect(response.status).toBe(400); });
});
