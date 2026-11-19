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
const themeToggle=readFileSync(new URL('../jt-theme-toggle.js',import.meta.url),'utf8');
const themeStyles=readFileSync(new URL('../jt-theme-toggle.css',import.meta.url),'utf8');
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

test("JT AI Agent opens a fresh chat, keeps Prompt Studio out of chat navigation and offers follow-up chips",()=>{
 assert.doesNotMatch(aiHome, /href="\/jt-ai-agent\/prompt-studio\.html"/);
 assert.match(workspace, /else active=null;renderRecent\(\);if\(active\)renderChat\(\);else make\(\)/);
 assert.match(workspace, /message-followups/);
 assert.match(workspace, /Explain more/);
});
test("Jeff AI uses a dedicated Copilot-inspired response instruction for JT AI Agent",()=>{
 assert.match(api,/JT_AI_AGENT_STYLE/);
 assert.match(api,/payload\.source === "jt-ai-agent"/);
 assert.match(api,/content: system/);
});
test("JT apps show their own animated logo while loading",()=>{
 assert.match(powerTools,/jt-app-loader/);
 assert.match(powerTools,/appMarks\[app\]/);
 assert.match(powerTools,/jt-loader-spin/);
 assert.match(powerTools,/prefers-reduced-motion:reduce/);
});

test("JT app product pages load the shared logo splash",()=>{
 for(const path of ["jt-ai-core","jt-app-manager","jt-cloud","jt-code","jt-design","jt-motion","jt-stream","jt-studio","agent-jeff"]){
  const html=readFileSync(new URL("../jt-apps/"+path+"/index.html",import.meta.url),"utf8");
  assert.match(html,/app-power-tools\.js/,"Missing branded loader on "+path);
 }
});

test("JT theme toggle binds existing controls and supports persistent light and dark modes",()=>{
 assert.match(themeToggle,/let b=document\.querySelector\('\.jt-theme-toggle'\)/);
 assert.match(themeToggle,/dataset\.jtThemeBound/);
 assert.match(themeToggle,/window\.JTTheme=/);
 assert.match(themeToggle,/addEventListener\('storage'/);
 assert.match(themeStyles,/html\[data-jt-theme="dark"\] \.app-shell/);
});
test("JT AI Agent composer exposes six prompt commands",()=>{
 for(const command of ["improve","summarize","explain","review","brainstorm","translate"]) assert.ok(aiHome.includes('data-jt-command="'+command+'"'));
 assert.match(workspace,/commandPrompts/);
 assert.match(workspace,/chatActions\.open=false/);
 assert.match(workspace,/input\.focus\(\)/);
});
test("More JT tools drawer sits below the top bar and exposes expanded state",()=>{
 assert.match(powerTools,/topbar\.insertAdjacentElement\("afterend",drawer\)/);
 assert.match(appTools,/aria-expanded/);
 assert.match(styles,/\.jt-ai-tools-drawer\[open\]/);
});
