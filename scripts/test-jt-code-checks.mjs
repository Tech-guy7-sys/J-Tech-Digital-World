import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile(new URL("../jt-apps/pro-workspaces.js",import.meta.url),"utf8");
test("JT Code includes static project health checks across its three editable files",()=>{
 assert.match(source,/Project health checks/);
 assert.match(source,/missingAlt/);
 assert.match(source,/Duplicate element id/);
 assert.match(source,/braceCount/);
 assert.match(source,/Avoid eval\(\)/);
 assert.match(source,/codeCheckBtn/);
});
test("JT Code explains that quick checks are heuristics rather than a security audit",()=>{
 assert.match(source,/not a full compiler or security audit/);
});
