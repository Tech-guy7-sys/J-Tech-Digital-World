import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const source=await readFile(new URL("../jt-apps/pro-workspaces.js",import.meta.url),"utf8");
test("JT Motion has a reorderable clip sequence with editable trim ranges",()=>{
 assert.match(source,/id="mediaTimelinePro"/);
 assert.match(source,/data-clip-field="inPoint"/);
 assert.match(source,/data-clip-field="outPoint"/);
 assert.match(source,/data-pro="media-up"/);
 assert.match(source,/data-pro="media-down"/);
 assert.match(source,/Clip order updated/);
});
test("JT Motion preview respects local video in/out points and exports a timeline manifest",()=>{
 assert.match(source,/video\.currentTime=start/);
 assert.match(source,/video\.currentTime>=end/);
 assert.match(source,/jt-motion-edit-plan\.json/);
 assert.match(source,/totalDuration:s\.items\.reduce/);
 assert.match(source,/Sequence duration:/);
});
