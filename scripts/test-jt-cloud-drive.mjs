import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";

const read = path => readFile(new URL(path, import.meta.url), "utf8");
const script = await read("../jt-apps/jt-cloud-drive.js");
const page = await read("../jt-apps/jt-cloud/index.html");
const css = await read("../jt-apps/jt-cloud-drive.css");

test("JT Cloud drive script parses as JavaScript", () => {
  assert.doesNotThrow(() => new vm.Script(script));
});

test("JT Cloud stores file blobs and folder metadata in IndexedDB", () => {
  assert.match(script, /indexedDB\.open\(DB_NAME,1\)/);
  assert.match(script, /createObjectStore\("folders"/);
  assert.match(script, /createObjectStore\("files"/);
  assert.match(script, /blob:file\.slice\(/);
});

test("Folder creation and rename use accessible in-page dialogs", () => {
  assert.match(script, /data-cloud-folder-dialog/);
  assert.match(script, /data-cloud-folder-form/);
  assert.match(script, /data-cloud-folder-cancel/);
  assert.doesNotMatch(script, /prompt\(/);
});

test("JT Cloud supports upload, download, delete, folder navigation and moves", () => {
  for (const token of ["data-cloud-upload", "data-download-file", "data-delete-file", "data-open-folder", "data-move-file", "data-new-folder", "data-rename-folder", "data-delete-folder"]) {
    assert.ok(script.includes(token), `Missing interaction: ${token}`);
  }
});

test("JT Cloud reports browser quota estimates and local-only storage boundaries", () => {
  assert.match(script, /navigator\.storage\?\.estimate/);
  assert.match(script, /navigator\.storage\?\.persisted/);
  assert.match(script, /Nothing was uploaded to a server/);
  assert.match(script, /does not transfer files to JT servers/);
  assert.match(page, /local-first project vault/);
});

test("JT Cloud page loads the dedicated drive assets without duplicate legacy vault panels", () => {
  assert.match(page, /jt-cloud-drive\.css/);
  assert.match(page, /jt-cloud-drive\.js/);
  assert.match(page, /data-jt-cloud-drive/);
  assert.doesNotMatch(page, /workspace-tools\.js|pro-workspaces\.js/);
});

test("JT Cloud file manager has responsive and reduced-motion styling", () => {
  assert.match(css, /@media\(max-width:900px\)/);
  assert.match(css, /@media\(max-width:650px\)/);
  assert.match(css, /prefers-reduced-motion:reduce/);
});
