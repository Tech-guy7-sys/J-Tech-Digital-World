import { APPS, STORAGE_KEY, cleanText, validateState, makeHandoff, transitionHandoff } from "./shared-workspace-core.js";
(() => {
  "use strict";
  const main=document.querySelector("main[data-app]");
  if(!main || document.querySelector("[data-jt-shared-workspace]")) return;
  const app=main.dataset.app || "JT AI Agent";
  const supportedApp=app==="JT Desktop Agent"?"Agent Jeff":app;
  if(!APPS.includes(supportedApp)) return;
  const read=()=>{try{return validateState(JSON.parse(localStorage.getItem(STORAGE_KEY)||"null"));}catch{return validateState(null);}};
  let state=read();
  const save=()=>{try{localStorage.setItem(STORAGE_KEY,JSON.stringify(state));status.textContent="Saved on this browser";return true;}catch{status.textContent="Could not save — browser storage may be full";return false;}};
  const uid=()=>globalThis.crypto?.randomUUID?.()||"jt-"+Date.now()+"-"+Math.random().toString(36).slice(2,9);
  const el=(tag,cls,txt)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=txt;return n;};
  const panel=el("section","jt-shared-panel");panel.dataset.jtSharedWorkspace="";
  panel.setAttribute("aria-labelledby","jtSharedTitle");
  const style=el("style");style.textContent=`
  .jt-shared-panel{margin:26px 0;padding:clamp(16px,2.6vw,24px);border:1px solid rgba(117,190,210,.25);border-radius:18px;background:radial-gradient(ellipse at 8% 0%,rgba(72,151,180,.16),transparent 45%),linear-gradient(145deg,#111b28,#10121d);color:#f2f5fb}
  .jt-shared-panel *{box-sizing:border-box}.jt-shared-head{display:flex;justify-content:space-between;gap:14px;align-items:flex-start}.jt-shared-kicker{font-size:9px;letter-spacing:1.5px;color:#8dded4;font-weight:800}.jt-shared-head h2{margin:7px 0;font:700 clamp(19px,2vw,24px) Manrope,sans-serif}.jt-shared-head p,.jt-shared-muted{margin:0;color:#aab5c6;font-size:11px;line-height:1.65}.jt-shared-status{font-size:10px;color:#8dded4;white-space:nowrap}.jt-shared-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:17px}.jt-shared-card{min-width:0;padding:14px;border:1px solid #2b3948;border-radius:12px;background:rgba(8,14,23,.62)}.jt-shared-card h3{margin:0 0 10px;font:700 13px Manrope,sans-serif}.jt-shared-field{display:grid;gap:6px;margin:9px 0;color:#cbd5e2;font-size:10px}.jt-shared-field input,.jt-shared-field textarea,.jt-shared-field select{width:100%;min-width:0;padding:10px;border:1px solid #344455;border-radius:8px;background:#101925;color:#f3f6fa;font:12px inherit}.jt-shared-field textarea{min-height:68px;resize:vertical}.jt-shared-btn{border:1px solid #3a5264;border-radius:8px;padding:9px 11px;background:#172737;color:#f4f8fc;font-size:10px;font-weight:700;cursor:pointer}.jt-shared-btn.primary{border:0;background:linear-gradient(110deg,#7ed8d1,#93b7ff);color:#08131b}.jt-shared-list{display:grid;gap:8px;margin-top:12px}.jt-shared-item{padding:11px;border:1px solid #2b3948;border-radius:9px;background:#111a27}.jt-shared-item strong{font-size:11px}.jt-shared-item p{margin:5px 0;color:#aab5c6;font-size:10px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}.jt-shared-meta{font-size:9px;color:#82d8cc}.jt-shared-actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.jt-shared-empty{padding:13px;border:1px dashed #344455;border-radius:9px;color:#9eacbd;font-size:10px;line-height:1.6}.jt-shared-foot{margin-top:13px;padding-top:11px;border-top:1px solid #293544;color:#93a1b2;font-size:9px;line-height:1.6}
  @media(max-width:680px){.jt-shared-grid{grid-template-columns:1fr}.jt-shared-head{display:block}.jt-shared-status{display:block;margin-top:8px}}
  `;
  panel.append(style);
  const head=el("div","jt-shared-head"),intro=el("div");
  intro.append(el("span","jt-shared-kicker","JT SHARED WORKSPACE"),el("h2","","Projects that move with your work"),el("p","jt-shared-muted","Create shared project spaces and send permission-scoped task handoffs between JT apps. Every handoff waits for review in its selected destination."));
  const status=el("span","jt-shared-status","Local workspace ready");head.append(intro,status);panel.append(head);
  const grid=el("div","jt-shared-grid");
  const projectCard=el("section","jt-shared-card"),handoffCard=el("section","jt-shared-card");
  projectCard.append(el("h3","","Shared project shelf"));
  const pname=el("input");pname.maxLength=80;pname.placeholder="Project name";pname.setAttribute("aria-label","Shared project name");
  const psummary=el("textarea");psummary.maxLength=1200;psummary.placeholder="Project goal or short summary";psummary.setAttribute("aria-label","Shared project summary");
  const pform=el("form");pform.className="jt-shared-field";pform.append(pname,psummary);
  const psubmit=el("button","jt-shared-btn primary","＋ Create shared project");psubmit.type="submit";pform.append(psubmit);projectCard.append(pform);
  const projectsList=el("div","jt-shared-list");projectCard.append(projectsList);
  handoffCard.append(el("h3","","App-to-app handoff"));
  const hform=el("form");hform.className="jt-shared-field";
  const projectSelect=el("select");projectSelect.setAttribute("aria-label","Optional shared project");
  const target=el("select");target.setAttribute("aria-label","Destination JT app");
  const task=el("textarea");task.maxLength=2000;task.placeholder="Describe the specific task to hand off…";task.setAttribute("aria-label","Handoff task");
  const projectLabel=el("label","jt-shared-field","Attach shared project (optional)");projectLabel.append(projectSelect);
  const targetLabel=el("label","jt-shared-field","Send to");targetLabel.append(target);
  const taskLabel=el("label","jt-shared-field","Task request");taskLabel.append(task);
  APPS.filter(name=>name!==supportedApp).forEach(name=>target.add(new Option(name,name)));
  hform.append(projectLabel,targetLabel,taskLabel);
  const hsubmit=el("button","jt-shared-btn primary","Create pending handoff");hsubmit.type="submit";hform.append(hsubmit);handoffCard.append(hform);
  const handoffList=el("div","jt-shared-list");handoffCard.append(handoffList);
  grid.append(projectCard,handoffCard);panel.append(grid);
  const foot=el("p","jt-shared-foot","Local-only feature: records stay in this browser and sync between JT pages/tabs on this same website origin only. No server sync or cross-device access. Only the project name, summary and task text are shared; files, credentials and desktop permissions are never attached. Target-app approval records consent but does not execute tools or automate another app. Agent Jeff desktop control remains separate.");
  panel.append(foot);
  const hero=main.querySelector(".app-hero");(hero||main.firstElementChild)?.insertAdjacentElement("afterend",panel);
  if(!panel.isConnected)main.prepend(panel);
  const render=()=>{
    state=read();
    projectSelect.replaceChildren(new Option("No project attached",""));
    state.projects.forEach(p=>projectSelect.add(new Option(p.name,p.id)));
    projectsList.replaceChildren();
    if(!state.projects.length)projectsList.append(el("div","jt-shared-empty","No shared projects yet. Create one to make a project space available across JT apps in this browser."));
    state.projects.slice().sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).forEach(p=>{
      const item=el("article","jt-shared-item");item.append(el("strong","",p.name),el("p","",p.summary||"No summary added."),el("span","jt-shared-meta","Shared project · available to JT apps on this browser"));
      const actions=el("div","jt-shared-actions"),send=el("button","jt-shared-btn","Prepare handoff");send.type="button";send.dataset.shareProject=p.id;actions.append(send);item.append(actions);projectsList.append(item);
    });
    handoffList.replaceChildren();
    const relevant=state.handoffs.filter(h=>h.sourceApp===supportedApp||h.targetApp===supportedApp).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).slice(0,12);
    if(!relevant.length)handoffList.append(el("div","jt-shared-empty","No handoffs for this app yet."));
    relevant.forEach(h=>{
      const item=el("article","jt-shared-item");item.append(el("strong","",h.projectName? h.projectName+" · "+h.status.toUpperCase():h.status.toUpperCase()),el("p","",h.task),el("span","jt-shared-meta",h.sourceApp+" → "+h.targetApp));
      const actions=el("div","jt-shared-actions");
      if(h.targetApp===supportedApp&&h.status==="pending"){
        const approve=el("button","jt-shared-btn primary","Approve & receive");approve.type="button";approve.dataset.transition=h.id;approve.dataset.next="approved";
        const decline=el("button","jt-shared-btn","Decline");decline.type="button";decline.dataset.transition=h.id;decline.dataset.next="declined";actions.append(approve,decline);
      } else if(h.targetApp===supportedApp&&h.status==="approved"){
        actions.append(el("span","jt-shared-meta","Approved for this workspace · no action executed"));
        const done=el("button","jt-shared-btn","Mark completed");done.type="button";done.dataset.transition=h.id;done.dataset.next="completed";actions.append(done);
      } else if(h.sourceApp===supportedApp&&h.status==="pending") actions.append(el("span","jt-shared-meta","Waiting for target-app review"));
      item.append(actions);handoffList.append(item);
    });
    status.textContent="Saved on this browser · "+state.projects.length+" projects · "+state.handoffs.length+" handoffs";
  };
  pform.addEventListener("submit",event=>{
    event.preventDefault();const name=cleanText(pname.value,80);if(!name){status.textContent="Enter a project name.";return;}
    if(state.projects.length>=100){status.textContent="Shared project limit reached (100).";return;}
    const now=new Date().toISOString();state.projects.unshift({id:uid(),name,summary:cleanText(psummary.value,1200),createdAt:now,updatedAt:now});
    if(save()){pname.value="";psummary.value="";render();}
  });
  hform.addEventListener("submit",event=>{
    event.preventDefault();try{
      const project=state.projects.find(p=>p.id===projectSelect.value);
      const handoff=makeHandoff({id:uid(),projectId:project?.id||"",projectName:project?.name||"",sourceApp:supportedApp,targetApp:target.value,task:task.value});
      if(state.handoffs.length>=200)state.handoffs=state.handoffs.slice(-199);
      state.handoffs.unshift(handoff);state.audit.push({id:uid(),action:"created",handoffId:handoff.id,sourceApp:handoff.sourceApp,targetApp:handoff.targetApp,at:handoff.createdAt});
      if(save()){task.value="";render();}
    }catch(error){status.textContent=error.message;}
  });
  panel.addEventListener("click",event=>{
    const projectButton=event.target.closest("[data-share-project]");
    if(projectButton){projectSelect.value=projectButton.dataset.shareProject;task.focus();status.textContent="Project selected. Add a task and choose its destination.";return;}
    const action=event.target.closest("[data-transition]");
    if(!action)return;
    try{transitionHandoff(state,action.dataset.transition,action.dataset.next,supportedApp);save();render();}
    catch(error){status.textContent=error.message;}
  });
  window.addEventListener("storage",event=>{if(event.key===STORAGE_KEY)render();});
  render();
})();