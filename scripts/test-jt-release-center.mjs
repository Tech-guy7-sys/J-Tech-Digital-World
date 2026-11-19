import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("JT release center checks official releases and separates Windows, macOS and Linux packages", async () => {
  const [page, script] = await Promise.all([read("download.html"), read("jt-desktop-downloads.js")]);
  for (const product of ["JT Desktop Agent", "Jeff AI", "JT AI Agent", "JT AI Core", "JT Code", "JT Design", "JT Studio", "JT Motion", "JT Cloud", "JT Stream", "JT App Manager"]) {
    assert.ok(script.includes(product), "Release catalog is missing " + product);
  }
  for (const platform of ['label:"Windows"', 'label:"macOS"', 'label:"Linux"']) {
    assert.ok(script.includes(platform), "Missing platform target " + platform);
  }
  assert.match(script, /releases\?per_page=/);
  assert.match(script, /No published installer/);
  assert.match(script, /Source code/);
  assert.match(page, /jt-release-center\.css/);
  assert.match(page, /jt-desktop-downloads\.js/);
  assert.match(page, /Linux/);
  assert.doesNotMatch(page, /release-downloads\.js/);
  assert.match(page, /Source archive \(not an installer\)/);
});

test("JT app launcher uses the product-preview layout and JT brand mark", async () => {
  const [page, css, logo] = await Promise.all([
    read("jt-apps/index.html"),
    read("jt-launcher-refresh.css"),
    read("assets/jt-logo.svg")
  ]);
  assert.match(page, /jt-launcher-refresh\.css/);
  assert.match(page, /jt-preview-window/);
  assert.match(page, /src="\/assets\/jt-logo\.svg"/);
  assert.match(css, /Ctrl K/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(logo, /JT — J Tech Digital World/);
  assert.match(logo, /B8FFF0/);
});

test("shared workspace shell applies the JT monogram and responsive navigation", async () => {
  const [shell, css] = await Promise.all([
    read("jt-apps/product-shell.js"),
    read("jt-apps/product-shell.css")
  ]);
  assert.match(shell, /jt-product-logo"><img src="\/assets\/jt-logo\.svg"/);
  assert.match(css, /JT Workspace Shell v2/);
  assert.match(css, /@media\(max-width:820px\)/);
  assert.match(css, /html\[data-jt-theme="light"\]/);
});
