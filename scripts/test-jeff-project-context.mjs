import test from "node:test";
import assert from "node:assert/strict";
import {buildProjectContext} from "../jt-ai-agent/project-context.js";
test("project context combines a saved brief and selected shared project",()=>{
 const result=buildProjectContext({manualContext:"Use TypeScript.",project:{name:"JT Studio",summary:"Audio workspace",notes:[{authorApp:"JT Code",text:"Add export tests"}]}});
 assert.match(result,/Use TypeScript/);assert.match(result,/JT Studio/);assert.match(result,/Add export tests/);
});
test("project context ignores absent project data",()=>{
 assert.equal(buildProjectContext({}),"");assert.match(buildProjectContext({project:{name:"Empty"}}),/No notes yet/);
});
test("project context strips control characters and enforces the 4000-character budget",()=>{
 const result=buildProjectContext({manualContext:"A\\u0000B",project:{name:"P",summary:"x".repeat(1200),notes:Array.from({length:30},(_,i)=>({authorApp:"JT Code",text:String(i).repeat(1500)}))}});
 assert.ok(result.length<=4000);assert.ok(!result.includes("\\u0000"));
});
test("invalid note shapes are ignored",()=>{
 const result=buildProjectContext({project:{name:"P",notes:[null,{text:12},{text:"valid",authorApp:"JT Design"}]}});
 assert.match(result,/valid/);assert.doesNotMatch(result,/undefined/);
});
