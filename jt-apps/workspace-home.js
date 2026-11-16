(() => {
  "use strict";
  const start = () => {
    const main = document.querySelector("main[data-app]");
    const hero = main?.querySelector(".app-hero");
    if (!main || !hero || main.querySelector("[data-jt-workspace-home]")) return;
    const app = main.dataset.app || "JT Workspace";
    const slug = app.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const key = "jt-workspace-board-v1-" + slug;
    const activeKey = key + "-active";
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
    let activeId = ""; try { activeId = localStorage.getItem(activeKey) || ""; } catch { activeId = ""; }
    if (activeId && !projects.some(p => p.id === activeId)) activeId = "";
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
        <a class="jt-wh-primary" href="/jt-ai-agent/?app=${encodeURIComponent(app)}">Ask Jeff AI ↗</a>
        <input type="file" accept="application/json,.json" hidden data-jt-import-file>
      </div>
      <section class="jt-offers" aria-label="JT subscription plans">
        <div class="jt-offers-head"><span class="jt-offers-kicker"><i></i> JT MEMBERSHIPS</span><h3>Choose your JT plan.</h3><p>Student, Pro and Enterprise options for different ways of learning, building and working. A special 25% discount applies every January 28 to monthly and annual plans. Regular prices apply on other dates.</p><a href="/pricing.html">Compare plan details and terms ↗</a></div>
        <div class="jt-plan-grid">
          <article class="jt-plan-card"><span class="jt-plan-tag">LEARN & CREATE</span><h4>Student</h4><p class="jt-plan-price"><span data-jt-price="student-month">₦2,500</span> <small>/ month</small></p><p class="jt-plan-was" data-jt-promo-note hidden>January 28 offer · Annual <span data-jt-price="student-year">₦25,000</span> <del>₦25,000</del> · 25% off</p><p class="jt-plan-regular-year">Annual: ₦25,000</p><p>For eligible students building skills and personal projects.</p><ul><li>Student-focused access tier</li><li>Core JT workspace tools</li><li>Student verification required</li></ul><a href="/pricing.html#student">Student plan details ↗</a></article>
          <article class="jt-plan-card jt-plan-featured"><span class="jt-plan-tag">FOR BUILDERS</span><h4>Pro</h4><p class="jt-plan-price"><span data-jt-price="pro-month">₦6,500</span> <small>/ month</small></p><p class="jt-plan-was" data-jt-promo-note hidden>January 28 offer · Annual <span data-jt-price="pro-year">₦65,000</span> <del>₦65,000</del> · 25% off</p><p class="jt-plan-regular-year">Annual: ₦65,000</p><p>For independent creators, developers and advanced users.</p><ul><li>Expanded JT AI Core profile</li><li>Eligible free-model routing</li><li>Individual workflow focus</li></ul><a href="/pricing.html#pro">Pro plan details ↗</a></article>
          <article class="jt-plan-card"><span class="jt-plan-tag">FOR ORGANISATIONS</span><h4>Enterprise</h4><p class="jt-plan-price"><span data-jt-price="enterprise-month">₦120,000</span> <small>/ month</small></p><p class="jt-plan-was" data-jt-promo-note hidden>January 28 offer · Annual <span data-jt-price="enterprise-year">₦1,200,000</span> <del>₦1,200,000</del> · 25% off</p><p class="jt-plan-regular-year">Annual: ₦1,200,000</p><p>For teams that need managed access and shared workflows.</p><ul><li>Team and role management planned</li><li>Central usage and policy controls planned</li><li>Capacity subject to validation</li></ul><a href="/pricing.html#enterprise">Enterprise details ↗</a></article>
        </div>
        <small class="jt-offers-note">Prices are proposals only. The 25% promotion is scheduled for January 28 each year; regular prices apply on other dates. Checkout, student verification, account entitlements and team administration are not active.</small>
      </section>
      <div class="jt-wh-overview" aria-label="Project overview"><div><span data-jt-total>0</span><small>Total projects</small></div><div><span data-jt-active>None</span><small>Active project</small></div><div><span data-jt-updated>—</span><small>Latest update</small></div></div>
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
    // Annual January 28 promotion, evaluated in Nigeria time (WAT).
    const promoParts = new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
    const january28Offer = promoParts.find(part => part.type === "month")?.value === "01" && promoParts.find(part => part.type === "day")?.value === "28";
    const planPrices = {"student":{"month":2500,"year":25000},"pro":{"month":6500,"year":65000},"enterprise":{"month":120000,"year":1200000}};
    const formatNaira = amount => "₦" + Math.round(amount).toLocaleString("en-NG");
    Object.entries(planPrices).forEach(([plan, prices]) => {
      ["month", "year"].forEach(period => { const node = section.querySelector('[data-jt-price="' + plan + '-' + period + '"]'); if (node) node.textContent = formatNaira(january28Offer ? prices[period] * 0.75 : prices[period]); });
      const card = section.querySelector('[data-jt-price="' + plan + '-month"]')?.closest(".jt-plan-card");
      const note = card?.querySelector("[data-jt-promo-note]"); if (note) note.hidden = !january28Offer;
      const regular = card?.querySelector(".jt-plan-regular-year"); if (regular) regular.hidden = january28Offer;
    });
    if(!document.getElementById("jtOffersStyles")){const style=document.createElement("style");style.id="jtOffersStyles";style.textContent=`.jt-offers{position:relative;overflow:hidden;margin:0 0 26px;padding:23px;border:1px solid rgba(163,139,255,.27);border-radius:20px;background:radial-gradient(ellipse at 10% 0%,rgba(139,110,255,.2),transparent 42%),linear-gradient(125deg,#17162a,#101d2b 58%,#10252c);box-shadow:0 18px 48px rgba(5,8,20,.18)}.jt-offers-head{margin-bottom:17px}.jt-offers-kicker{display:flex;align-items:center;gap:8px;color:#c0adff;font-size:9px;font-weight:800;letter-spacing:1.7px}.jt-offers-kicker i{width:6px;height:6px;border-radius:50%;background:#7ce3d3;box-shadow:0 0 12px #7ce3d3}.jt-offers-head h3{margin:9px 0 6px;color:#f5f3ff;font:700 clamp(20px,2vw,25px)/1.2 Manrope,sans-serif}.jt-offers-head p{max-width:720px;margin:0;color:#b5b5ca;font-size:11px;line-height:1.7}.jt-offers-head>a{display:inline-block;margin-top:8px;color:#d8ccff;font-size:10px;font-weight:700;text-decoration:none}.jt-plan-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:11px}.jt-plan-card{min-width:0;padding:15px;border:1px solid rgba(190,196,225,.16);border-radius:13px;background:rgba(9,13,25,.48)}.jt-plan-featured{border-color:rgba(173,151,255,.65);background:linear-gradient(155deg,rgba(139,110,255,.18),rgba(9,13,25,.65))}.jt-plan-tag{color:#a9dcd8;font-size:8px;font-weight:800;letter-spacing:1.2px}.jt-plan-card h4{margin:7px 0;color:#f3f1ff;font:700 17px Manrope,sans-serif}.jt-plan-price{margin:0;color:#fff;font-size:19px;font-weight:800}.jt-plan-price small{color:#a9a9bc;font-size:9px;font-weight:500}.jt-plan-was{margin:2px 0 8px;color:#a9dcd8;font-size:9px;line-height:1.6}.jt-plan-regular-year{margin:2px 0 8px;color:#a9a9bc;font-size:9px}.jt-plan-was del{color:#9296ad}.jt-plan-card>p:not(.jt-plan-price):not(.jt-plan-was){min-height:32px;color:#aeb0c4;font-size:10px;line-height:1.5}.jt-plan-card ul{min-height:67px;margin:10px 0;padding-left:15px;color:#c3c3d4;font-size:9px;line-height:1.8}.jt-plan-card>a{color:#d8ccff;font-size:9px;font-weight:700;text-decoration:none}.jt-offers-note{display:block;margin-top:14px;color:#9296ad;font-size:9px;line-height:1.6}@media(max-width:760px){.jt-plan-grid{grid-template-columns:1fr}.jt-plan-card>p:not(.jt-plan-price),.jt-plan-card ul{min-height:0}}`;document.head.append(style);}
    hero.insertAdjacentElement("afterend", section);
    const $ = selector => section.querySelector(selector);
    const setStatus = message => { const node=$("[data-jt-save-status]"); if(node) node.textContent=message; };
    const persist = () => {
      try { localStorage.setItem(key, JSON.stringify(projects)); if(activeId && projects.some(p => p.id === activeId)) localStorage.setItem(activeKey, activeId); else localStorage.removeItem(activeKey); setStatus("Saved in this browser"); return true; }
      catch { setStatus("Could not save — browser storage is full or disabled"); return false; }
    };
    const esc = value => String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
    const fmt = value => { const date=new Date(value); return Number.isNaN(date.getTime()) ? "Recently updated" : date.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
    const render = filter => {
      const list=$("[data-jt-project-list]");
      const q=(filter||"").trim().toLowerCase();
      const active=projects.find(p=>p.id===activeId);
      $("[data-jt-total]").textContent=String(projects.length);
      $("[data-jt-active]").textContent=active ? active.name : "None";
      const latest=projects.map(p=>p.updatedAt||p.createdAt).filter(Boolean).sort().reverse()[0];
      $("[data-jt-updated]").textContent=latest ? fmt(latest) : "—";
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
      const now=new Date().toISOString();const project={id:globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : "jt-"+Date.now()+"-"+Math.random().toString(36).slice(2,8),name,notes:String(data.get("notes")||"").slice(0,1200),createdAt:now,updatedAt:now};
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
        const valid=data.projects.filter(p=>p&&typeof p.name==="string"&&typeof p.id==="string"&&p.name.trim()).slice(0,200);
        const ids=new Set(projects.map(p=>p.id));let imported=0;valid.forEach(p=>{if(!ids.has(p.id)){projects.push({id:p.id,name:p.name.trim().slice(0,80),notes:typeof p.notes==="string"?p.notes.slice(0,1200):"",createdAt:typeof p.createdAt==="string"?p.createdAt:new Date().toISOString(),updatedAt:typeof p.updatedAt==="string"?p.updatedAt:new Date().toISOString()});ids.add(p.id);imported++;}});
        persist();render($("[data-jt-search]").value);setStatus("Imported "+imported+" new project entries");
      }catch(error){setStatus(error.message||"Could not import project list");}
      finally{event.target.value="";}
    });
    render("");
  };
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();