/* JT QUICK LAUNCH — fast navigation, no account or backend required */
(()=> {
 const items=[
  {name:"JT AI Agent",desc:"AI workspace for research, writing and projects",icon:"✦",url:"/jt-apps/jt-ai-agent/",tags:"ai assistant research chat"},
  {name:"JT AI Core",desc:"Shared intelligence and integrations",icon:"◉",url:"/jt-apps/jt-ai-core/",tags:"ai core backend"},
  {name:"JT App Manager",desc:"Manage the JT application suite",icon:"▦",url:"/jt-apps/jt-app-manager/",tags:"apps install update"},
  {name:"JT Cloud",desc:"Cloud workspace and shared project files",icon:"☁",url:"/jt-apps/jt-cloud/",tags:"storage files sync"},
  {name:"JT Code",desc:"Software projects and coding workspace",icon:"</>",url:"/jt-apps/jt-code/",tags:"developer programming build"},
  {name:"JT Design",desc:"Visual concepts and design workspace",icon:"◈",url:"/jt-apps/jt-design/",tags:"graphic art visuals"},
  {name:"JT Motion",desc:"Video planning and storytelling workspace",icon:"▶",url:"/jt-apps/jt-motion/",tags:"video edit film"},
  {name:"JT Studio",desc:"Audio, sound and production workspace",icon:"♫",url:"/jt-apps/jt-studio/",tags:"music audio sound"},
  {name:"JT Stream",desc:"Streaming and media workspace",icon:"◉",url:"/jt-apps/jt-stream/",tags:"live stream media"},
  {name:"Explore all apps",desc:"Browse every JT workspace",icon:"↗",url:"/jt-apps/",tags:"apps platform"},
  {name:"Download center",desc:"Official releases and desktop installers",icon:"↓",url:"/download.html",tags:"download installer windows mac linux"},
  {name:"Sandbox",desc:"Preview JT app experiences",icon:"◇",url:"/sandbox.html",tags:"demo test preview"},
  {name:"Support",desc:"Help, guides and support options",icon:"?",url:"/support.html",tags:"help contact guide"},
  {name:"Agent Jeff",desc:"Permission-controlled desktop agent (separate app)",icon:"⌘",url:"https://github.com/Tech-guy7-sys/agent-jeff/releases",tags:"automation desktop windows"}
 ];
 const trigger=document.createElement("button");trigger.className="jt-quick-launch-trigger";trigger.type="button";trigger.setAttribute("aria-haspopup","dialog");trigger.setAttribute("aria-label","Open JT Quick Launch");trigger.innerHTML='<span>JT Quick Launch</span><kbd>Ctrl K</kbd>';
 const backdrop=document.createElement("div");backdrop.className="jt-quick-launch-backdrop";backdrop.innerHTML='<section class="jt-quick-launch" role="dialog" aria-modal="true" aria-labelledby="jt-quick-title"><div class="jt-quick-launch-head"><span class="jt-quick-launch-mark">JT</span><input class="jt-quick-launch-input" type="search" placeholder="Search apps, actions and workspaces…" aria-label="Search JT apps"><button class="jt-quick-launch-esc" type="button" aria-label="Close quick launch">ESC</button></div><div class="jt-quick-launch-label" id="jt-quick-title">J TECH DIGITAL WORLD · QUICK LAUNCH</div><div class="jt-quick-launch-results" role="listbox"></div><div class="jt-quick-launch-foot"><span><kbd>↑</kbd> <kbd>↓</kbd> Navigate</span><span><kbd>Enter</kbd> Open</span><span><kbd>Esc</kbd> Close</span><span>JT · YOUR WORKSPACE</span></div></section>';
 document.body.append(trigger,backdrop);
 const input=backdrop.querySelector("input"),results=backdrop.querySelector(".jt-quick-launch-results"),close=backdrop.querySelector(".jt-quick-launch-esc");
 let active=0,visible=[];
 function render(){const q=input.value.trim().toLowerCase();visible=items.filter(x=>(x.name+" "+x.desc+" "+x.tags).toLowerCase().includes(q));active=Math.min(active,Math.max(0,visible.length-1));results.innerHTML="";if(!visible.length){results.innerHTML='<div class="jt-quick-launch-empty">No matching JT workspace. Try “design”, “download” or “video”.</div>';return;}visible.forEach((x,i)=>{const a=document.createElement("a");a.className="jt-quick-launch-result";a.href=x.url;a.setAttribute("role","option");a.setAttribute("aria-selected",String(i===active));a.innerHTML='<span class="jt-quick-launch-icon"></span><span><strong></strong><small></small></span><em>↗</em>';a.querySelector(".jt-quick-launch-icon").textContent=x.icon;a.querySelector("strong").textContent=x.name;a.querySelector("small").textContent=x.desc;if(i===active){a.style.background="rgba(166,154,255,.11)";a.style.borderColor="rgba(166,154,255,.25)";}a.addEventListener("mouseenter",()=>{active=i;render();});results.append(a);});}
 function open(){backdrop.classList.add("is-open");input.value="";active=0;render();setTimeout(()=>input.focus(),0);}
 function shut(){backdrop.classList.remove("is-open");trigger.focus();}
 trigger.addEventListener("click",open);close.addEventListener("click",shut);backdrop.addEventListener("click",e=>{if(e.target===backdrop)shut();});input.addEventListener("input",()=>{active=0;render();});input.addEventListener("keydown",e=>{if(e.key==="ArrowDown"){e.preventDefault();active=Math.min(active+1,visible.length-1);render();}else if(e.key==="ArrowUp"){e.preventDefault();active=Math.max(0,active-1);render();}else if(e.key==="Enter"&&visible[active]){location.href=visible[active].url;}else if(e.key==="Escape"){e.preventDefault();shut();}});
 document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();backdrop.classList.contains("is-open")?shut():open();}else if(e.key==="Escape"&&backdrop.classList.contains("is-open"))shut();});
})();
