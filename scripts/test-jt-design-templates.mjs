import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html=await readFile(new URL("../jt-apps/jt-design/studio.html",import.meta.url),"utf8");
const js=await readFile(new URL("../jt-apps/jt-design/studio.js",import.meta.url),"utf8");
test("Design Studio offers four editable starter templates",()=>{
 for(const key of ["social","event","quote","thumbnail"])assert.match(html,new RegExp('value="'+key+'"'));
 assert.match(js,/function applyTemplate\(key\)/);
 assert.match(js,/Every element is editable/);
 assert.match(js,/makeText\(/);
 assert.match(js,/makeRect\(/);
});
test("selected layers can be aligned and duplicated with a keyboard shortcut",()=>{
 assert.match(html,/id="alignCenterX"/);
 assert.match(html,/id="alignCenterY"/);
 assert.match(js,/\$\("alignCenterX"\)\.onclick/);
 assert.match(js,/\$\("alignCenterY"\)\.onclick/);
 assert.match(js,/e\.key\.toLowerCase\(\)==="d"/);
});
