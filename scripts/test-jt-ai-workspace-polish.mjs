import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const workspace=readFileSync(new URL('../jt-ai-agent/workspace.js',import.meta.url),'utf8');
const styles=readFileSync(new URL('../jt-ai-agent/workspace-v2.css',import.meta.url),'utf8');
const api=readFileSync(new URL('../functions/api/jeff.js',import.meta.url),'utf8');
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

const aiHome=readFileSync(new URL('../jt-ai-agent/index.html',import.meta.url),'utf8');
const powerTools=readFileSync(new URL('../jt-apps/app-power-tools.js',import.meta.url),'utf8');
test('JT AI Agent keeps the conversation central and offers six practical quick tasks',()=>{
 assert.match(aiHome,/What would you like<br>to <em>work on\?/);
 for(const label of ['Research a topic','Write something','Build with code','Plan a project','Learn something','Brainstorm ideas']) assert.ok(aiHome.includes(label), 'Missing quick task: '+label);
 assert.equal((aiHome.match(/data-prompt=/g)||[]).length,6);
});
test('secondary JT productivity tools are discoverable but collapsed by default',()=>{
 assert.match(powerTools,/jt-ai-tools-drawer/);
 assert.match(powerTools,/<summary>|summary\.innerHTML/);
 assert.match(powerTools,/Prompt Studio · Focus Desk · Shared task board/);
 assert.match(powerTools,/addCrossAppTaskBoard\(\)/);
 assert.match(powerTools,/return focus;/);
 assert.match(styles,/\.jt-ai-tools-drawer/);
 assert.match(styles,/@media\(prefers-reduced-motion:reduce\)/);
});

test("JT AI Agent opens a fresh chat, keeps Prompt Studio out of chat navigation and offers follow-up chips",()=>{\n assert.doesNotMatch(aiHome, /href="\\/jt-ai-agent\\/prompt-studio\\.html"/);\n assert.match(workspace, /else active=null;renderRecent\\(\\);if\\(active\\)renderChat\\(\\);else make\\(\\)/);\n assert.match(workspace, /message-followups/);\n assert.match(workspace, /Explain more/);\n});\ntest("Jeff AI uses a dedicated Copilot-inspired response instruction for JT AI Agent",()=>{\n assert.match(api,/JT_AI_AGENT_STYLE/);\n assert.match(api,/payload\\.source === "jt-ai-agent"/);\n assert.match(api,/content: system/);\n});\ntest("JT apps show their own animated logo while loading",()=>{\n assert.match(powerTools,/jt-app-loader/);\n assert.match(powerTools,/appMarks\\[app\\]/);\n assert.match(powerTools,/jt-loader-spin/);\n assert.match(powerTools,/prefers-reduced-motion:reduce/);\n});\n