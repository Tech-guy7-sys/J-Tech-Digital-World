import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("JT release center checks official releases and separates Windows, macOS and Linux packages", async () => {
  const [page, script] = await Promise.all([read("download.html"), read("jt-desktop-downloads.js")]);
  for (const product of ["JT Digital World Desktop","JT Desktop Agent","Jeff AI","JT AI Agent","JT AI Core","JT Code","JT Design","JT Studio","JT Motion","JT Cloud","JT Stream","JT App Manager"]) {
    assert.ok(script.includes(product), "Release catalog is missing " + product);
  }
  for (const platform of ['label:"Windows"', 'label:"macOS"', 'label:"Linux"']) {
    assert.ok(script.includes(platform), "Missing platform target " + platform);
  }
  for (const feature of ["releases?per_page=20","No published installer","Architecture not specified","download_count","SHA256SUMS","Latest release notes","jt-release-filters","publish-jt-workspace-apps.yml"]) {
    assert.ok(script.includes(feature), "Release script is missing " + feature);
  }
  for (const feature of ["jt-release-center.css","jt-desktop-downloads.js","Linux","LIVE RELEASE INVENTORY","published product release"]) {
    assert.ok(page.includes(feature), "Download page is missing " + feature);
  }
  assert.ok(!page.includes("Source archive (not an installer)"), "Retired static source archive card returned");
  assert.ok(!page.includes("build-jt-workspace-artifacts.yml"), "Retired workflow link returned");
});

test("JT app launcher uses the product-preview layout and JT brand mark", async () => {
  const [page, css, logo] = await Promise.all([
    read("jt-apps/index.html"),
    read("jt-launcher-refresh.css"),
    read("assets/jt-logo.svg")
  ]);
  assert.ok(page.includes("jt-launcher-refresh.css"));
  assert.ok(page.includes("jt-preview-window"));
  assert.ok(page.includes('src="/assets/jt-logo.svg"'));
  assert.ok(page.includes("Ctrl K"));
  assert.ok(css.includes("prefers-reduced-motion"));
  assert.ok(logo.includes("JT — J Tech Digital World"));
  assert.ok(logo.includes("B8FFF0"));
});

test("shared workspace shell applies the JT monogram and responsive navigation", async () => {
  const [shell, css] = await Promise.all([
    read("jt-apps/product-shell.js"),
    read("jt-apps/product-shell.css")
  ]);
  assert.ok(shell.includes('jt-product-logo"><img src="/assets/jt-logo.svg"'));
  assert.ok(css.includes("JT Workspace Shell v2"));
  assert.ok(css.includes("@media(max-width:820px)"));
  assert.ok(css.includes('html[data-jt-theme="light"]'));
});
