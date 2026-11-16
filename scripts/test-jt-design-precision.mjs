import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const html=await readFile(new URL("../jt-apps/jt-design/studio.html",import.meta.url),"utf8");
const js=await readFile(new URL("../jt-apps/jt-design/studio.js",import.meta.url),"utf8");
const css=await readFile(new URL("../jt-apps/jt-design/studio.css",import.meta.url),"utf8");
test("Design Studio exposes snap-to-grid and a draggable resize handle",()=>{
 assert.match(html,/id="snapGrid"/);
 assert.match(js,/snapEnabled=true/);
 assert.match(js,/mode:"resize"/);
 assert.match(js,/startW\+p\.x-drag\.startX/);
 assert.match(js,/Math\.round\(v\/10\)\*10/);
 assert.match(css,/\.ds-handle\{pointer-events:all;cursor:nwse-resize\}/);
});
test("Design Studio supports precise keyboard nudging and shift-step movement",()=>{
 assert.match(js,/\["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"\]/);
 assert.match(js,/e\.shiftKey\?10:1/);
 assert.match(js,/render\(\);save\(\);return/);
});
