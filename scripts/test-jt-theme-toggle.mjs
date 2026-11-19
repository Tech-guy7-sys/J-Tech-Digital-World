import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const toggle = await readFile(new URL("../jt-theme-toggle.js", import.meta.url), "utf8");
const shellTheme = await readFile(new URL("../jt-theme-toggle-shell.css", import.meta.url), "utf8");
const app = await readFile(new URL("../jt-apps/app.js", import.meta.url), "utf8");
const productShell = await readFile(new URL("../jt-apps/product-shell.js", import.meta.url), "utf8");

test("theme toggle installs in the visible product shell actions instead of the hidden legacy header", () => {
  assert.match(toggle, /const product=document\.querySelector\('\.jt-product-top-actions'\)/);
  assert.match(toggle, /const target=product\|\|workspace\|\|home\|\|site/);
  assert.match(toggle, /target\.appendChild\(b\)/);
  assert.match(toggle, /MutationObserver/);
  assert.match(productShell, /jt-product-top-actions/);
});

test("theme preference is persistent, keyboard accessible and synchronised across tabs", () => {
  assert.match(toggle, /localStorage\.setItem\(KEY,m\)/);
  assert.match(toggle, /addEventListener\('storage'/);
  assert.match(toggle, /e\.ctrlKey\|\|e\.metaKey/);
  assert.match(toggle, /aria-pressed/);
  assert.match(toggle, /focus-visible/);
});

test("all app pages load the shared theme controller and shell palette", () => {
  assert.match(app, /jt-theme-toggle\.js/);
  assert.match(toggle, /jt-theme-toggle-shell\.css/);
  assert.match(shellTheme, /data-jt-theme="dark"/);
  assert.match(shellTheme, /body:has\(\.jt-product-shell\)/);
  assert.match(shellTheme, /prefers-reduced-motion|@media\(max-width:760px\)/);
});
