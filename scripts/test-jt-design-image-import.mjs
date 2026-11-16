import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const html=await readFile(new URL("../jt-apps/jt-design/studio.html",import.meta.url),"utf8");
const js=await readFile(new URL("../jt-apps/jt-design/studio.js",import.meta.url),"utf8");

test("Design Studio exposes a supported local image import control",()=>{
 assert.match(html,/id="importImageBtn"/);
 assert.match(html,/id="importImageFile" type="file" accept="image\/png,image\/jpeg,image\/webp"/);
});
test("imported image layers are validated, bounded, editable and exported with the canvas",()=>{
 assert.match(js,/file\.size>1500000/);
 assert.match(js,/\["image\/png","image\/jpeg","image\/webp"\]/);
 assert.match(js,/type:"image",src/);
 assert.match(js,/preserveAspectRatio="xMidYMid meet" href=/);
 assert.match(js,/o\.type==="image"/);
});
