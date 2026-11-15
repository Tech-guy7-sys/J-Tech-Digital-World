(() => {
  "use strict";
  const start = () => {
    const main = document.querySelector("main[data-app]");
    const hero = main?.querySelector(".app-hero");
    if (!main || !hero || main.querySelector("[data-jt-workspace-home]")) return;
    const app = main.dataset.app || "JT Workspace";
    const slug = app.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const key = "jt-workspace-board-v1-" + slug;
    const configs = {
      "JT AI Core": {eyebrow:"MODEL & TOOL ORCHESTRATION",title:"Your AI control room",desc:"Keep provider profiles, model experiments and permission policies organised.",actions:["Provider lab","Model profiles","Permission policy"]},
      "JT App Manager": {eyebrow:"APP LIBRARY & MAINTENANCE",title:"Your app command centre",desc:"Organise your app inventory and review update and maintenance tasks.",actions:["App inventory","Update workspace","Maintenance tools"]},
      "JT Cloud": {eyebrow:"FILES & PROJECT SPACES",title:"Your files, in one workspace",desc:"Organise project spaces, file plans and local workspace notes.",actions:["File workspace","Project spaces","Sharing guide"]},
      "JT Code": {eyebrow:"DEVELOPMENT WORKSPACE",title:"Build with a clear plan",desc:"Track coding projects, debugging notes and the next engineering steps.",actions:["Code workbench","Project notes","Review checklist"]},
      "JT Design": {eyebrow:"VISUAL CREATION",title:"Make every idea tangible",desc:"Organise design projects, creative briefs and visual experiments.",actions:["Design tools","Image lab","Creative brief"]},
      "JT Motion": {eyebrow:"VIDEO & STORY WORKSPACE",title:"Shape the story",desc:"Keep motion projects, scene plans and production notes together.",actions:["Motion workspace","Scene planner","Production notes"]},
      "JT Studio": {eyebrow:"AUDIO PRODUCTION",title:"Your sound workspace",desc:"Organise sessions, track plans and recording notes.",actions:["Audio workbench","Session planner","Track notes"]},
      "JT Stream": {eyebrow:"LIVE PRODUCTION CONTROL",title:"Prepare your next show",desc:"Keep show plans and scene notes ready before opening the studio.",actions:["Open Stream Studio","Show planner","Scene checklist"]},
      "JT Desktop Agent": {eyebrow:"PERMISSION-AWARE DESKTOP AGENT",title:"Plan work. Stay in control.",desc:"Organise approved workflows, task plans and review notes.",actions:["Agent controls","Task planner","Security notes"]}
    };
    const config = configs[app] || {eyebrow:"JT WORKSPACE",title:"Your work, organised",desc:"Create a project space and keep your next steps close.",actions:["Open workspace","Project notes","Recent work"]};
    const read = () => { try { const value = JSON.parse(localStorage.getItem(key)); return Array.isArray(value) ? value.filter(x => x && typeof x.id === "string" && typeof x.name === "string") : []; } catch { return []; } };
    let projects = read();
    let activeId = "";
    const section = document.createElement("section");
    section.className = "jt-workspace-home";
    section.dataset.jtWorkspaceHome = "";
    section.setAttribute("aria-labelledby","jtWorkspaceTitle");
    section.innerHTML = `
      <div class="jt-wh-head">
        <div><span class="jt-wh-kicker">${config.eyebrow}</span><h2 id="jtWorkspaceTitle">${config.title}</h2><p>${config.desc}</p></div>
        <div class="jt-wh-status"><i></i><span data-jt-save-status>Local workspace ready</span></div>
      </div>
      <div class="jt-wh-actions">
        <button type="button" class="jt-wh-primary" data-jt-action="create"><span>＋</span> New project</button>
        <button type="button" data-jt-action="tools">Open workspace tools ↗</button>
        <button type="button" data-jt-action="export">Export project list ↓</button>
        <button type="button" data-jt-action="import">Import project list ↑</button>
        <input type="file" accept="application/json,.json" hidden data-jt-import-file>
      </div>
      <div class="jt-wh-content">
        <div class="jt-wh-projects">
          <div class="jt-wh-section-head"><div><span class="jt-wh-kicker">YOUR PROJECTS</span><h3>Pick up where you left off</h3></div><label class="jt-wh-search"><span>⌕</span><input type="search" placeholder="Search projects…" aria-label="Search projects" data-jt-search></label></div>
          <div class="jt-wh-project-grid" data-jt-project-list></div>
        </div>
        <aside class="jt-wh-side">
          <span class="jt-wh-kicker">QUICK LAUNCH</span><h3>Move into your tools</h3>
          <div class="jt-wh-quick">
            ${config.actions.map((label,i)=>`<button type="button" data-jt-action="tools"><span>${["✦","⌘","◈"][i]}</span><b>${label}</b><i>↗</i></button>`).join("")}
          </div>
          <div class="jt-wh-note"><b>About this workspace</b><p>Project names and notes are saved in this browser on this device. Export a backup to move them elsewhere. This board does not claim cloud sync or change files in your other apps.</p></div>
        </aside>
      </div>
      <dialog class="jt-wh-dialog" data-jt-dialog>
        <form method="dialog" data-jt-project-form>
          <span class="jt-wh-kicker">NEW PROJECT</span><h3>Create a project space</h3>
          <label>Project name<input name="name" maxlength="80" required placeholder="e.g. Website redesign"></label>
          <label>Goal or next steps<textarea name="notes" maxlength="1200" rows="4" placeholder="What are you working on?"></textarea></label>
          <div class="jt-wh-dialog-actions"><button type="button" data-jt-action="close">Cancel</button><button class="jt-wh-primary" value="create">Create project</button></div>
        </form>
      </dialog>
      <dialog class="jt-wh-dialog" data-jt-edit-dialog>
        <form method="dialog" data-jt-edit-form>
          <span class="jt-wh-kicker">PROJECT NOTES</span><h3>Edit project details</h3>
          <input type="hidden" name="id">
          <label>Project name<input name="name" maxlength="80" required></label>
          <label>Goal or next steps<textarea name="notes" maxlength="1200" rows="4"></textarea></label>
          <div class="jt-wh-dialog-actions"><button type="button" data-jt-edit-close>Cancel</button><button class="jt-wh-primary" value="save">Save changes</button></div>
        </form>
      </dialog>
      <dialog class="jt-wh-dialog" data-jt-delete-dialog>
        <form method="dialog" data-jt-delete-form>
          <span class="jt-wh-kicker">CONFIRM DELETE</span><h3>Delete this project entry?</h3>
          <p data-jt-delete-copy></p><input type="hidden" name="id">
          <div class="jt-wh-dialog-actions"><button type="button" data-jt-delete-cancel>Cancel</button><button class="jt-wh-danger" value="delete">Delete project</button></div>
        </form>
      </dialog>`;
    hero.insertAdjacentElement("afterend", section);
    const $ = selector => section.querySelector(selector);
    const setStatus = message => { const node=$("[data-jt-save-status]"); if(node) node.textContent=message; };
    const persist = () => {
      try { localStorage.setItem(key, JSON.stringify(projects)); setStatus("Saved in this browser"); return true; }
      catch { setStatus("Could not save — browser storage is full or disabled"); return false; }
    };
    const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const fmt = value => { const date=new Date(value); return Number.isNaN(date.getTime()) ? "Recently updated" : date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
    const render = filter => {
      const list=$("[data-jt-project-list]");
      const q=(filter||"").trim().toLowerCase();
      const shown=projects.filter(p=>(p.name+" "+(p.notes||"")).toLowerCase().includes(q)).sort((a,b)=>(b.updatedAt||"").localeCompare(a.updatedAt||""));
      if(!shown.length){list.innerHTML=`<div class="jt-wh-empty"><span>✧</span><b>${projects.length ? "No matching projects" : "Your next idea starts here"}</b><p>${projects.length ? "Try another search term." : "Create a project space to keep its goal, notes and recent activity together."}</p>${projects.length ? "" : '<button type="button" class="jt-wh-primary" data-jt-action="create">Create your first project</button>'}</div>`;return;}
      list.innerHTML=shown.map(p=>`<article class="jt-wh-project ${p.id===activeId?"is-active":""}" data-project-id="${esc(p.id)}"><div class="jt-wh-project-top"><span class="jt-wh-project-icon">${esc(app.split(" ").slice(-1)[0].slice(0,2).toUpperCase())}</span><span class="jt-wh-project-date">${fmt(p.updatedAt||p.createdAt)}</span></div><h4>${esc(p.name)}</h4><p>${esc(p.notes||"No project notes yet.")}</p><div class="jt-wh-project-actions"><button type="button" data-jt-project-open="${esc(p.id)}">Set active</button><button type="button" data-jt-project-edit="${esc(p.id)}">Edit notes</button><button type="button" data-jt-project-delete="${esc(p.id)}" aria-label="Delete ${esc(p.name)}">Delete</button></div></article>`).join("");
    };
    const scrollToTools = () => {
      const target=main.querySelector("#jt-pro-tools,[data-workspace-tool],#jtImageStudio,.studio-grid") || main.querySelector(".feature-grid");
      if(target){target.scrollIntoView({behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});setStatus("Workspace tools opened");}
      else {setStatus("No interactive tools are available on this page yet.");}
    };
    section.addEventListener("click", async event => {
      const action=event.target.closest("[data-jt-action]")?.dataset.jtAction;
      if(action==="create"){$("[data-jt-dialog]").showModal();$("[name=name]").focus();return;}
      if(action==="close"){$("[data-jt-dialog]").close();return;}
      if(action==="tools"){scrollToTools();return;}
      if(action==="export"){
        const data={schema:"jt-workspace-board/v1",app,exportedAt:new Date().toISOString(),projects};
        const url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:"application/json"}));
        const a=document.createElement("a");a.href=url;a.download=slug+"-projects.json";a.click();URL.revokeObjectURL(url);setStatus("Project list exported");return;
      }
      if(action==="import"){$("[data-jt-import-file]").click();return;}
      const open=event.target.closest("[data-jt-project-open]");
      const edit=event.target.closest("[data-jt-project-edit]");
      const remove=event.target.closest("[data-jt-project-delete]");
      if(open){const p=projects.find(x=>x.id===open.dataset.jtProjectOpen);if(p){activeId=p.id;p.updatedAt=new Date().toISOString();persist();render($("[data-jt-search]").value);setStatus("Active project: "+p.name);}return;}
      if(edit){const p=projects.find(x=>x.id===edit.dataset.jtProjectEdit);if(p){const form=$("[data-jt-edit-form]");form.elements.id.value=p.id;form.elements.name.value=p.name;form.elements.notes.value=p.notes||"";$("[data-jt-edit-dialog]").showModal();form.elements.name.focus();}return;}
      if(remove){const p=projects.find(x=>x.id===remove.dataset.jtProjectDelete);if(p){$("[data-jt-delete-form]").elements.id.value=p.id;$("[data-jt-delete-copy]").textContent="This removes '"+p.name+"' from this browser's project board. It does not delete files in your other apps."; $("[data-jt-delete-dialog]").showModal();}return;}
      const submit=event.target.closest("[value='create']");
      if(submit) return;
    });
    $("[data-jt-project-form]").addEventListener("submit",event=>{
      event.preventDefault();const data=new FormData(event.currentTarget);const name=String(data.get("name")||"").trim();if(!name)return;
      const now=new Date().toISOString();const project={id:crypto.randomUUID?crypto.randomUUID():"jt-"+Date.now(),name,notes:String(data.get("notes")||"").slice(0,1200),createdAt:now,updatedAt:now};
      projects.unshift(project);activeId=project.id;persist();render($("[data-jt-search]").value);$("[data-jt-dialog]").close();event.currentTarget.reset();setStatus("Created project: "+name);
    });
    $("[data-jt-edit-form]").addEventListener("submit",event=>{event.preventDefault();const data=new FormData(event.currentTarget);const p=projects.find(x=>x.id===String(data.get("id")));const name=String(data.get("name")||"").trim();if(!p||!name)return;p.name=name.slice(0,80);p.notes=String(data.get("notes")||"").slice(0,1200);p.updatedAt=new Date().toISOString();persist();render($("[data-jt-search]").value);$("[data-jt-edit-dialog]").close();setStatus("Updated project: "+p.name);});
    $("[data-jt-edit-close]").addEventListener("click",()=>$("[data-jt-edit-dialog]").close());
    $("[data-jt-delete-form]").addEventListener("submit",event=>{event.preventDefault();const id=String(new FormData(event.currentTarget).get("id")||"");const p=projects.find(x=>x.id===id);if(!p)return;projects=projects.filter(x=>x.id!==id);if(activeId===id)activeId="";persist();render($("[data-jt-search]").value);$("[data-jt-delete-dialog]").close();setStatus("Deleted project entry: "+p.name);});
    $("[data-jt-delete-cancel]").addEventListener("click",()=>$("[data-jt-delete-dialog]").close());
    $("[data-jt-search]").addEventListener("input",event=>render(event.target.value));
    $("[data-jt-import-file]").addEventListener("change",async event=>{
      const file=event.target.files?.[0];if(!file)return;
      try{
        if(file.size>1024*1024)throw new Error("The file is larger than 1 MB.");
        const data=JSON.parse(await file.text());
        if(data.schema!=="jt-workspace-board/v1"||data.app!==app||!Array.isArray(data.projects))throw new Error("This backup does not belong to "+app+".");
        const valid=data.projects.filter(p=>p&&typeof p.name==="string"&&typeof p.id==="string").slice(0,200);
        const ids=new Set(projects.map(p=>p.id));valid.forEach(p=>{if(!ids.has(p.id))projects.push({id:p.id,name:p.name.slice(0,80),notes:String(p.notes||"").slice(0,1200),createdAt:p.createdAt||new Date().toISOString(),updatedAt:p.updatedAt||new Date().toISOString()});});
        persist();render($("[data-jt-search]").value);setStatus("Imported "+valid.length+" project entries");
      }catch(error){setStatus(error.message||"Could not import project list");}
      finally{event.target.value="";}
    });
    render("");
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();