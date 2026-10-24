(() => {
  "use strict";
  if (window.__jtCommandDeckLoaded) return;
  window.__jtCommandDeckLoaded = true;

  const app = document.querySelector("main[data-app]")?.dataset.app ||
    (document.title.includes("JT Stream Studio") ? "JT Stream" : "JT Workspace");
  const apps = [
    {name:"JT AI Agent", detail:"Research, chat and project workspace", url:"/jt-ai-agent/", icon:"✦"},
    {name:"Agent Jeff", detail:"Standalone Windows desktop agent", url:"https://github.com/Tech-guy7-sys/agent-jeff", icon:"⌘", external:true},
    {name:"JT Studio", detail:"Audio production workspace", url:"/jt-apps/jt-studio/", icon:"♫"},
    {name:"JT Motion", detail:"Video, storyboard and timeline", url:"/jt-apps/jt-motion/", icon:"▶"},
    {name:"JT Cloud", detail:"Local project vault and file index", url:"/jt-apps/jt-cloud/", icon:"☁"},
    {name:"JT Stream", detail:"Creator studio and recording", url:"/jt-apps/jt-stream/", icon:"◉"},
    {name:"JT App Manager", detail:"App catalogue and release monitor", url:"/jt-apps/jt-app-manager/", icon:"▦"},
    {name:"JT Design", detail:"Design workspace", url:"/jt-apps/jt-design/", icon:"◇"},
    {name:"JT Code", detail:"Development workspace", url:"/jt-apps/jt-code/", icon:"</>"},
    {name:"All JT apps", detail:"Explore the ecosystem", url:"/jt-apps/", icon:"▧"},
    {name:"Downloads & releases", detail:"Published builds and packages", url:"/download.html", icon:"↓"},
    {name:"JT Account settings", detail:"Account and workspace preferences", url:"/account-settings.html", icon:"⚙"}
  ];
  const style = document.createElement("style");
  style.textContent = `
    .jt-deck-trigger{position:fixed;z-index:800;right:22px;bottom:22px;display:flex;align-items:center;gap:10px;padding:11px 14px;border:1px solid #41435d;border-radius:14px;background:rgba(16,17,30,.94);color:#f8f8ff;box-shadow:0 12px 44px #0008;backdrop-filter:blur(18px);font:700 12px/1 'DM Sans',sans-serif;cursor:pointer}
    .jt-deck-trigger:hover{border-color:var(--accent,#8c8fff);transform:translateY(-2px)}
    .jt-deck-trigger .jt-deck-mark{display:grid;place-items:center;width:26px;height:26px;border-radius:8px;background:linear-gradient(135deg,var(--accent,#9a8cff),var(--accent2,#68e4d2));color:#080912;font-weight:900}
    .jt-deck-trigger kbd{padding:4px 6px;border:1px solid #45465b;border-radius:5px;color:#aeb0c5;font:10px ui-monospace,monospace}
    .jt-deck-dialog{width:min(660px,calc(100vw - 28px));max-width:none;max-height:min(78vh,740px);padding:0;border:1px solid #3a3b53;border-radius:20px;background:#0d0e18;color:#f5f5fc;box-shadow:0 28px 120px #000b;overflow:hidden}
    .jt-deck-dialog::backdrop{background:#05060bcc;backdrop-filter:blur(9px)}
    .jt-deck-head{padding:20px 22px 14px;border-bottom:1px solid #28293b;background:radial-gradient(ellipse at 8% 0%,color-mix(in srgb,var(--accent,#8c8fff) 18%,transparent),transparent 60%)}
    .jt-deck-eyebrow{font-size:9px;font-weight:900;letter-spacing:2px;color:var(--accent2,#7fe5dc)}
    .jt-deck-title{margin:8px 0 15px;font:800 22px/1.2 Manrope,sans-serif;letter-spacing:-.6px}
    .jt-deck-search{display:flex;align-items:center;gap:10px;padding:0 13px;border:1px solid #41425b;border-radius:11px;background:#11121f}
    .jt-deck-search span{color:#a9abc1}
    .jt-deck-search input{width:100%;padding:13px 0;border:0;outline:0;background:transparent;color:#fff;font:13px 'DM Sans',sans-serif}
    .jt-deck-list{padding:9px;overflow:auto;max-height:46vh}
    .jt-deck-item{width:100%;display:flex;align-items:center;gap:12px;text-align:left;padding:11px;border:1px solid transparent;border-radius:11px;background:transparent;color:#f3f3fb;cursor:pointer}
    .jt-deck-item:hover,.jt-deck-item[aria-selected="true"]{border-color:#3b3d57;background:#191a2a}
    .jt-deck-icon{display:grid;place-items:center;flex:0 0 36px;height:36px;border-radius:10px;background:linear-gradient(140deg,color-mix(in srgb,var(--accent,#9a8cff) 20%,#171827),#171827);color:var(--accent2,#82e4d8);font-size:15px;font-weight:800}
    .jt-deck-copy{min-width:0;flex:1}.jt-deck-copy strong{display:block;font-size:12px}.jt-deck-copy small{display:block;margin-top:4px;color:#999bb2;font-size:10px;line-height:1.45}
    .jt-deck-tag{font-size:9px;color:#8d90a8;border:1px solid #34354a;border-radius:5px;padding:4px 6px}
    .jt-deck-footer{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;padding:12px 18px;border-top:1px solid #28293b;color:#8f91a8;font-size:10px}
    .jt-deck-footer kbd{padding:3px 5px;border:1px solid #3a3b50;border-radius:4px;color:#c8c9d8;font:10px ui-monospace,monospace}
    .jt-deck-toast{position:fixed;z-index:850;left:50%;bottom:26px;transform:translate(-50%,18px);opacity:0;pointer-events:none;padding:11px 15px;border:1px solid #42445d;border-radius:11px;background:#151625;color:#f6f6ff;font:12px 'DM Sans',sans-serif;box-shadow:0 10px 40px #0008;transition:opacity .18s,transform .18s}
    .jt-deck-toast.show{opacity:1;transform:translate(-50%,0)}
    @media(max-width:600px){.jt-deck-trigger{right:12px;bottom:12px;padding:10px}.jt-deck-trigger .jt-deck-hint{display:none}.jt-deck-title{font-size:19px}.jt-deck-footer{gap:6px}}
    @media(prefers-reduced-motion:reduce){.jt-deck-trigger,.jt-deck-toast{transition:none}}
  `;
  document.head.appendChild(style);

  const trigger = document.createElement("button");
  trigger.type = "button";
  trigger.className = "jt-deck-trigger";
  trigger.setAttribute("aria-label","Open JT Command Deck");
  trigger.innerHTML = '<span class="jt-deck-mark">JT</span><span>Command Deck</span><span class="jt-deck-hint"><kbd>Ctrl K</kbd></span>';
  document.body.appendChild(trigger);

  const dialog = document.createElement("dialog");
  dialog.className = "jt-deck-dialog";
  dialog.setAttribute("aria-label","JT Command Deck");
  dialog.innerHTML = `
    <div class="jt-deck-head">
      <div class="jt-deck-eyebrow">J TECH DIGITAL WORLD · COMMAND DECK</div>
      <div class="jt-deck-title">Where do you want to go?</div>
      <label class="jt-deck-search"><span>⌕</span><input type="search" placeholder="Search apps, tools and actions…" aria-label="Search commands" autocomplete="off"><kbd>/</kbd></label>
    </div>
    <div class="jt-deck-list" role="listbox" aria-label="Commands"></div>
    <div class="jt-deck-footer"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate · <kbd>↵</kbd> Open</span><span><kbd>Esc</kbd> Close · Local-first workspace</span></div>`;
  document.body.appendChild(dialog);
  const input = dialog.querySelector("input");
  const list = dialog.querySelector(".jt-deck-list");
  const toast = document.createElement("div");
  toast.className = "jt-deck-toast";
  toast.setAttribute("role","status");
  toast.setAttribute("aria-live","polite");
  document.body.appendChild(toast);
  let active = 0;
  let visible = [];
  let toastTimer;

  function notify(message) {
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
  }
  function localBackup() {
    const entries = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && /^(jt-workspace-v1-|jt-pro-workspace|jt-pro-tools|jt-stream-)/i.test(key)) {
        try { entries.push({key, value: JSON.parse(localStorage.getItem(key))}); }
        catch (_) { entries.push({key, value: localStorage.getItem(key)}); }
      }
    }
    if (!entries.length) { notify("No JT local workspace data found in this browser yet."); return; }
    const payload = {format:"JT-local-workspace-backup",version:1,createdAt:new Date().toISOString(),currentApp:app,entries};
    const blob = new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "jt-workspace-backup-" + new Date().toISOString().slice(0,10) + ".json";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1500);
    notify("Workspace backup exported (" + entries.length + " saved item" + (entries.length===1?"":"s") + ").");
  }
  const commands = [
    ...apps.map(item => ({...item, type:"app", action:()=>{ if(item.external) window.open(item.url,"_blank","noopener,noreferrer"); else window.location.href=item.url; }})),
    {name:"Focus the workspace",detail:"Jump to the interactive tools on this page",icon:"↘",type:"action",action:()=>{const target=document.querySelector("[data-workspace-tool],#jt-pro-tools,#release-manager,.studio-workspace,.studio-layout");if(target){target.scrollIntoView({behavior:"smooth",block:"start"});dialog.close();}else notify("No interactive tool panel is available on this page yet.");}},
    {name:"Export JT local workspace backup",detail:"Download saved JT workspace records as JSON",icon:"↓",type:"action",action:()=>{dialog.close();localBackup();}},
    {name:"Keyboard shortcut guide",detail:"Ctrl/⌘ K opens this deck · Esc closes it",icon:"⌨",type:"action",action:()=>notify("Tip: press Ctrl+K (or ⌘K on Mac) from any JT workspace to open Command Deck.")},
  ];

  function render() {
    const q = input.value.trim().toLowerCase();
    visible = commands.filter(c => (c.name+" "+c.detail).toLowerCase().includes(q));
    active = Math.min(active,Math.max(0,visible.length-1));
    list.innerHTML = "";
    if (!visible.length) {
      list.innerHTML = '<div style="padding:28px 12px;text-align:center;color:#a0a2b8;font-size:12px">No commands match that search. Try a shorter name.</div>';
      return;
    }
    visible.forEach((item,index)=>{
      const b=document.createElement("button");
      b.type="button";b.className="jt-deck-item";b.setAttribute("role","option");b.setAttribute("aria-selected",index===active?"true":"false");
      const icon=document.createElement("span");icon.className="jt-deck-icon";icon.textContent=item.icon;
      const copy=document.createElement("span");copy.className="jt-deck-copy";
      const title=document.createElement("strong");title.textContent=item.name;
      const detail=document.createElement("small");detail.textContent=item.detail;
      copy.append(title,detail);
      const tag=document.createElement("span");tag.className="jt-deck-tag";tag.textContent=item.type==="app"?"OPEN":"ACTION";
      b.append(icon,copy,tag);
      b.addEventListener("click",()=>item.action());
      list.appendChild(b);
    });
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({block:"nearest"});
  }
  function openDeck() {
    if (!dialog.open) dialog.showModal();
    input.value="";
    render();
    requestAnimationFrame(()=>input.focus());
  }
  trigger.addEventListener("click",openDeck);
  dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});
  input.addEventListener("input",()=>{active=0;render();});
  input.addEventListener("keydown",e=>{
    if(e.key==="ArrowDown"){e.preventDefault();active=Math.min(active+1,visible.length-1);render();}
    else if(e.key==="ArrowUp"){e.preventDefault();active=Math.max(0,active-1);render();}
    else if(e.key==="Enter"){e.preventDefault();visible[active]?.action();}
  });
  document.addEventListener("keydown",e=>{
    if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openDeck();}
    if(e.key==="Escape"&&dialog.open)dialog.close();
  });
  render();
})();