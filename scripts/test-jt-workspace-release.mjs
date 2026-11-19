import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const read = path => readFile(new URL("../" + path, import.meta.url), "utf8");

test("JT Workspace Apps release packages only the five central-only products", async () => {
  const [builder, workflow, policy, catalog, packageJson] = await Promise.all([
    read("scripts/build-jt-desktop-apps.mjs"),
    read(".github/workflows/publish-jt-workspace-apps.yml"),
    read(".github/workflows/enforce-no-central-releases.yml"),
    read("jt-desktop-downloads.js"),
    read("desktop/jt-workspace-shell/package.json")
  ]);
  for (const id of ["jt-ai-agent", "jt-ai-core", "jt-code", "jt-design", "jt-stream"]) {
    assert.ok(builder.includes(id), "Missing app ID " + id);
    assert.ok(workflow.includes(id), "Release workflow does not package " + id);
  }
  assert.match(builder, /JT_APP_IDS/);
  assert.match(packageJson, /"node-abi": "4\.40\.0"/);
  assert.match(workflow, /jt-workspaces-v\*/);
  assert.match(workflow, /platform: win[\s\S]*arch: x64/);
  assert.match(workflow, /platform: win[\s\S]*arch: ia32/);
  assert.match(workflow, /platform: win[\s\S]*arch: arm64/);
  assert.match(workflow, /platform: mac[\s\S]*arch: x64/);
  assert.match(workflow, /platform: mac[\s\S]*arch: arm64/);
  assert.match(workflow, /platform: linux[\s\S]*arch: x64/);
  assert.match(workflow, /platform: linux[\s\S]*arch: arm64/);
  assert.match(workflow, /SHA256SUMS\.txt/);
  assert.match(workflow, /softprops\/action-gh-release/);
  assert.match(policy, /jt-workspaces-v\*/);
  assert.match(policy, /Preserving approved JT Workspace Apps release/);
  for (const name of ["JT AI Agent-", "JT AI Core-", "JT Code-", "JT Design-", "JT Stream-"]) {
    assert.ok(catalog.includes('assetPrefix:"' + name), "Release catalog is missing asset prefix " + name);
  }
});

test("central release documentation distinguishes app releases from website releases", async () => {
  const [readme, contract, workspace] = await Promise.all([
    read("README.md"),
    read("JT-PRODUCT-REPOSITORY-AND-DISTRIBUTION-CONTRACT.md"),
    read("jt-apps/workspace.html")
  ]);
  assert.match(readme, /Publish JT Workspace Apps workflow/);
  assert.match(readme, /Windows, macOS and Linux/);
  assert.match(contract, /only the versioned \*\*JT Workspace Apps\*\* release bundle/);
  assert.match(contract, /company website itself does not receive a product release/i);
  assert.match(workspace, /href="\\/jt-ai-agent\\/"/);
  assert.doesNotMatch(workspace, /href="\\/jt-apps\\/jt-ai-agent\\/"/);
});
