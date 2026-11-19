import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const shell = await readFile(new URL("../jt-apps/product-shell.js", import.meta.url), "utf8");
const shellCss = await readFile(new URL("../jt-apps/product-shell.css", import.meta.url), "utf8");
const designCss = await readFile(new URL("../jt-apps/jt-design/studio.css", import.meta.url), "utf8");

test("JT creator workspaces link directly to their studio experiences", () => {
  assert.match(shell, /\["JT Design","\/jt-apps\/jt-design\/studio\.html"/);
  assert.match(shell, /\["JT Stream","\/jt-apps\/jt-stream\/studio\.html"/);
  assert.match(shell, /name==="JT Design"&&app==="JT Design"/);
  assert.match(shell, /name==="JT Stream"&&app==="JT Stream"/);
});

test("shared workspace shell retains responsive navigation and a restrained product layout", () => {
  assert.match(shellCss, /\.jt-product-sidebar/);
  assert.match(shellCss, /\.jt-command-palette/);
  assert.match(shellCss, /@media\(max-width:700px\)/);
  assert.match(shellCss, /--jt-accent:#5148b8/);
});

test("JT Design has a three-panel editor with responsive layout", () => {
  assert.match(designCss, /grid-template-columns:230px minmax\(0,1fr\) 286px/);
  assert.match(designCss, /\.ds-stage/);
  assert.match(designCss, /\.ds-inspector/);
  assert.match(designCss, /@media\(max-width:760px\)/);
});
