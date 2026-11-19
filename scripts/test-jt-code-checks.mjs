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

test("JT Code presents an IDE workspace with explorer, editor tabs, and isolated preview",()=>{
 assert.match(source,/JT Code · website studio/);
 assert.match(source,/jt-ide-explorer/);
 assert.match(source,/data-code-file="html"/);
 assert.match(source,/data-code-file="css"/);
 assert.match(source,/data-code-file="js"/);
 assert.match(source,/codeFrame/);
 assert.match(source,/sandbox="allow-scripts"/);
});
test("JT Code command console only exposes the documented local workspace commands",()=>{
 assert.match(source,/runLocalCommand/);
 assert.match(source,/command==="help"/);
 assert.match(source,/command==="files"/);
 assert.match(source,/command==="preview"/);
 assert.match(source,/command==="check"/);
 assert.match(source,/No operating-system shell commands are available/);
});
