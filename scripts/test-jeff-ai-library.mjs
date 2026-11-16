import test from "node:test";import assert from "node:assert/strict";import {readFile} from "node:fs/promises";
const html=await readFile(new URL("../jt-ai-agent/library.html",import.meta.url),"utf8");
const js=await readFile(new URL("../jt-ai-agent/library.js",import.meta.url),"utf8");
const workspace=await readFile(new URL("../jt-ai-agent/workspace.js",import.meta.url),"utf8");
test("Jeff AI library has search, folder, sort and pinned filters",()=>{for(const id of ["librarySearch","libraryFolder","librarySort","libraryPinnedFilter","libraryItems"])assert.match(html,new RegExp('id="'+id+'"'));});
test("Jeff AI library can reopen a specific conversation and export it",()=>{assert.match(js,/\?chat=/);assert.match(js,/data-export/);assert.match(workspace,/params\.get\('chat'\)/);});
test("Jeff AI library reads the existing browser-local chat and folder stores",()=>{assert.match(js,/jt-ai-agent\.chats\.v1/);assert.match(js,/jt-ai-agent\.folders\.v1/);assert.match(js,/does not provide account sync/);});
