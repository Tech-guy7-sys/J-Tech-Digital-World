import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const html=await readFile(new URL("../jt-apps/workspace.html",import.meta.url),"utf8");
const js=await readFile(new URL("../jt-apps/workspace-dashboard.js",import.meta.url),"utf8");
const shell=await readFile(new URL("../jt-apps/product-shell.js",import.meta.url),"utf8");
test("global workspace dashboard exposes cross-app project search, filters and quick launch",()=>{for(const id of ["projectSearch","appFilter","sortOrder","projectGrid","appLaunch"])assert.match(html,new RegExp('id="'+id+'"'));assert.match(js,/jt-workspace-board-v1-/);assert.match(js,/function collect\(\)/);});
test("global workspace can create projects inside the selected app board",()=>{assert.match(html,/id="projectForm"/);assert.match(js,/localStorage\.setItem\(key,JSON\.stringify\(records\)\)/);assert.match(js,/localStorage\.setItem\(key\+"-active",id\)/);});
test("shared workspace summary is read-only and reports pending handoffs",()=>{assert.match(js,/jt\.shared-workspace\.v1/);assert.match(js,/h\.status==="pending"/);});
test("product shell links directly to the global workspace",()=>{assert.match(shell,/workspace\.html/);});

test("workspace projects support task lists with priority, due dates and completion",()=>{
 assert.match(html,/id="taskDialog"/);assert.match(html,/name="priority"/);assert.match(html,/name="dueDate"/);
 assert.match(js,/function openTasks\(/);assert.match(js,/data-task-toggle/);assert.match(js,/data-task-delete/);
 assert.match(js,/tasks\.push\(/);assert.match(js,/task\.done=input\.checked/);
});
test("project task updates are saved back into existing per-app boards",()=>{
 assert.match(js,/function saveTaskRecord\(/);assert.match(js,/jt-workspace-board-v1-/);assert.match(js,/300-task limit/);
});
