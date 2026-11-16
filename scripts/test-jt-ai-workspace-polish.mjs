import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const workspace=readFileSync(new URL('../jt-ai-agent/workspace.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../jt-ai-agent/workspace-v2.css',import.meta.url),'utf8');
const home=readFileSync(new URL('../index.html',import.meta.url),'utf8');
test('Jeff AI renders structured Markdown safely with DOM text nodes',()=>{
 assert.match(workspace,/function renderRichResponse\(target,source\)/);
 assert.match(workspace,/document\.createTextNode/);
 assert.match(workspace,/createElement\('pre'\)/);
 assert.match(workspace,/renderRichResponse\(body,text\)/);
 assert.doesNotMatch(workspace,/innerHTML\s*=\s*source/);
 assert.match(styles,/\.message-body pre code/);
});
test('homepage app directory has live search and useful category filters',()=>{
 assert.match(home,/id="jtDirectorySearch"/);
 assert.match(home,/data-jt-filter="creative"/);
 assert.match(home,/data-jt-filter="development"/);
 assert.match(home,/id="jtDirectoryCount"/);
 assert.match(home,/card\.hidden=!visible/);
});
