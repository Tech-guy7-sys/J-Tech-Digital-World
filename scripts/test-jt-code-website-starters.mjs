import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("JT Code ships original responsive website starters with editable HTML, CSS and JavaScript", async () => {
  const [dataText, workspace, page] = await Promise.all([
    read("jt-apps/jt-code/templates/website-starters.json"),
    read("jt-apps/pro-workspaces.js"),
    read("jt-apps/jt-code/index.html")
  ]);
  const data = JSON.parse(dataText);
  assert.equal(data.schemaVersion, 2);
  assert.ok(data.templates.length >= 5);
  const ids = new Set();
  for (const template of data.templates) {
    assert.ok(template.id && !ids.has(template.id), "Template IDs must be unique");
    ids.add(template.id);
    assert.ok(template.name && template.description);
    for (const file of ["html", "css", "js"]) {
      assert.equal(typeof template.files[file], "string", template.name + " is missing " + file);
      assert.ok(template.files[file].length > 80, template.name + " has an unexpectedly small " + file + " file");
    }
    assert.match(template.files.html, /<main[\s>]/i);
    assert.match(template.files.css, /@media/);
    assert.match(template.files.js, /addEventListener/);
    assert.doesNotMatch(template.files.js, /\beval\s*\(/);
  }
  assert.match(workspace, /jtCodeTemplateSelect/);
  assert.match(workspace, /code-template-load/);
  assert.match(workspace, /website-starters\.json/);
  assert.match(workspace, /jt-code-website\.html/);
  assert.match(workspace, /sandbox="allow-scripts"/);
  assert.match(page, /jt-code-hero-preview/);
  assert.match(page, /Open website builder/);
});

test("all JT app landing pages use the shared app experience stylesheet", async () => {
  const apps = ["agent-jeff", "jt-ai-core", "jt-app-manager", "jt-cloud", "jt-code", "jt-design", "jt-motion", "jt-stream", "jt-studio"];
  for (const app of apps) {
    const page = await read("jt-apps/" + app + "/index.html");
    assert.match(page, /jt-app-experience-refresh\.css/, app + " is missing the shared app design");
  }
  const css = await read("jt-apps/jt-app-experience-refresh.css");
  assert.match(css, /JT App Experience v2/);
  assert.match(css, /prefers-reduced-motion/);
  assert.match(css, /@media\(max-width:820px\)/);
});
