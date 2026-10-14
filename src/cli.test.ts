import { describe, expect, test } from "vitest";
import { parseArgs, runCli, UsageError, type CliIo } from "./cli.js";
function io(): CliIo & { lines: string[]; errors: string[] } { const lines: string[]=[]; const errors:string[]=[]; return { lines, errors, out:(x)=>lines.push(x), err:(x)=>errors.push(x), readFile:(p)=>`file content ${p}` }; }
describe("cli", () => {
 test("parses a repurpose request", () => expect(parseArgs(["repurpose", "--text", "hello", "--platforms", "linkedin,x-thread"])).toMatchObject({ command:"repurpose", dryRun:true, platforms:["linkedin","x-thread"] }));
 test("requires approval for live", () => expect(() => parseArgs(["repurpose","--text","hi","--live"])).toThrow(UsageError));
 test("prints variants", async () => { const x=io(); expect(await runCli(["repurpose","--text","hello world"],x)).toBe(0); expect(JSON.parse(x.lines[0]).variants).toHaveLength(6); });
 test("reads file", async () => { const x=io(); await runCli(["repurpose","--file","note"],x); expect(JSON.parse(x.lines[0]).variants[0].content).toContain("file content"); });
});
