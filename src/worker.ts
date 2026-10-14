import { repurpose } from "./repurpose.js";
import { VERSION } from "./version.js";
export interface WorkerEnv { PACK_NAME?: string; }
const json=(value:unknown,status=200)=>new Response(JSON.stringify(value),{status,headers:{"content-type":"application/json"}});
export default { async fetch(request:Request,env:WorkerEnv):Promise<Response> { const url=new URL(request.url); if(request.method==="GET"&&url.pathname==="/health") return json({ok:true,pack:env.PACK_NAME??"agentic-repurpose",version:VERSION}); if(request.method==="POST"&&url.pathname==="/repurpose"){ try { const body=await request.json() as {source?:unknown;platforms?:unknown}; if(typeof body.source!=="string") return json({error:"body needs a source string"},400); return json({dryRun:true,variants:repurpose(body.source,body.platforms as never)}); } catch { return json({error:"invalid request"},400); } } return json({error:"not found"},404); } };
