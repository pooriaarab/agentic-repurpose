import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { describe, expect, test } from "vitest";
import { createMcpServer } from "./mcp.js";
const text = (v: unknown) => (v as {content:{text:string}[]}).content[0].text;
describe("mcp", () => { test("repurpose and score are exposed", async () => { const [ct,st]=InMemoryTransport.createLinkedPair(); const server=createMcpServer(); await server.connect(st); const client=new Client({name:"test",version:"1"}); await client.connect(ct); try { expect((await client.listTools()).tools.map(x=>x.name).sort()).toEqual(["repurpose","score_variant"]); const r=await client.callTool({name:"repurpose",arguments:{source:"Hello from source",platforms:["linkedin"]}}); expect(JSON.parse(text(r)).variants[0].content).toContain("Disclosure:"); } finally { await client.close(); await server.close(); } }); });
