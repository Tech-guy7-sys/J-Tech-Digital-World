import test from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";
const js=await readFile(new URL("../jt-apps/jt-cloud-remote.js",import.meta.url),"utf8");
test("JT Cloud remote file list supports sorting and manual refresh",()=>{assert.match(js,/data-remote-sort/);assert.match(js,/data-remote-refresh/);assert.match(js,/state\.sort==="name"/);assert.match(js,/state\.sort==="size"/);});
test("JT Cloud remote file list can fetch subsequent cursor pages",()=>{assert.match(js,/nextCursor/);assert.match(js,/async function loadMore/);assert.match(js,/encodeURIComponent\(state\.nextCursor\)/);assert.match(js,/data-remote-more/);});
