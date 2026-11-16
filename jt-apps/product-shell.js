(()=>{
"use strict";
const start=()=>{
 const main=document.querySelector("main[data-app]");
 const oldHeader=document.querySelector(".app-top");
 if(!main||document.body.dataset.jtProductShell==="ready")return;
 const app=main.dataset.app||"JT Workspace";
 const apps=[
  ["JT AI Agent","/jt-ai-agent/","✦","AI & AUTOMATION"],
  ["JT AI Core","/jt-apps/jt-ai-core/","◈","AI & AUTOMATION"],
  ["Agent Jeff","/jt-apps/agent-jeff/","⌘","AI & AUTOMATION"],
  ["JT Code","/jt-apps/jt-code/","〈〉","BUILD"],
  ["JT Design","/jt-apps/jt-design/","◇","CREATE"],
  ["JT Motion","/jt-apps/jt-motion/","▶","CREATE"],
  ["JT Studio","/jt-apps/jt-studio/","♫","CREATE"],
  ["JT Stream","/jt-apps/jt-stream/","◉","CREATE"],
  ["JT Cloud","/jt-apps/jt-cloud/","☁","WORK"],
  ["JT App Manager","/jt-apps/jt-app-manager/","▦","WORK"]
 ];
 const slug=s=>s.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
 const css=document.createElement("link");css.rel="stylesheet";css.href="/jt-apps/product-shell.css";document.head.append(css);
 const shell=document.createElement("div");shell.className="jt-product-shell";shell.dataset.jtProductShell="";
 const sidebar=document.createElement("aside");sidebar.className="jt-product-sidebar";sidebar.setAttribute("aria-label","JT app navigation");
 const brand=document.createElement("a");brand.className="jt-product-brand";brand.href="/jt-apps/";brand.innerHTML='<span class="jt-product-logo">JT</span><span><b>J Tech</b><small>Digital World</small></span>';sidebar.append(brand);
 const workspace=document.createElement("a");workspace.className="jt-workspace-switcher";workspace.href="/jt-apps/";workspace.innerHTML='<span class="jt-workspace-glyph">▦</span><span><b>My workspace</b><small>Personal workspace</small></span><span class="jt-switch-chevron">⌄</span>';sidebar.append(workspace);
 const nav=document.createElement("nav");nav.className="jt-product-nav";
 const home=document.createElement("a");home.className="jt-product-navlink";home.href="/jt-apps/";home.innerHTML='<span class="jt-nav-icon">⌂</span><span>App library</span>';nav.append(home);
 const grouped={};
 apps.forEach(item=>(grouped[item[3]]??=[]).push(item));
 Object.entries(grouped).forEach(([group,items])=>{
  const label=document.createElement("div");label.className="jt-product-navlabel";label.textContent=group;nav.append(label);
  items.forEach(([name,url,icon])=>{
   const a=document.createElement("a");a.className="jt-product-navlink"+(name===app||(name==="Agent Jeff"&&app==="JT Desktop Agent")?" active":"");a.href=url;a.innerHTML='<span class="jt-nav-icon">'+icon+'</span><span>'+name+'</span>';if(name===app||(name==="Agent Jeff"&&app==="JT Desktop Agent"))a.setAttribute("aria-current","page");nav.append(a);
  });
 });
 sidebar.append(nav);
 const sideBottom=document.createElement("div");sideBottom.className="jt-product-sidebar-bottom";
 sideBottom.innerHTML='<a class="jt-product-navlink" href="/account-settings.html"><span class="jt-nav-icon">⚙</span><span>Settings</span></a><a class="jt-product-account" href="/account-settings.html"><span class="jt-account-avatar">JT</span><span><b>JT Account</b><small>Account & preferences</small></span><span class="jt-account-more">···</span></a>';
 sidebar.append(sideBottom);
 const mainWrap=document.createElement("div");mainWrap.className="jt-product-main";
 const top=document.createElement("header");top.className="jt-product-topbar";
 const crumb=document.createElement("div");crumb.className="jt-product-crumb";crumb.innerHTML='<a href="/jt-apps/">Workspace</a><span>/</span><b>'+app.replace(/[&<>"]/g,"")+'</b>';
 const topActions=document.createElement("div");topActions.className="jt-product-top-actions";
 const search=document.createElement("button");search.className="jt-command-trigger";search.type="button";search.innerHTML='<span>⌕</span><span>Search apps and tools</span><kbd>Ctrl K</kbd>';search.addEventListener("click",openPalette);
 const help=document.createElement("a");help.className="jt-top-icon";help.href="/support.html";help.title="Help and support";help.textContent="?";
 const account=document.createElement("a");account.className="jt-top-avatar";account.href="/account-settings.html";account.textContent="JT";account.title="JT Account";
 topActions.append(search,help,account);top.append(crumb,topActions);
 const content=document.createElement("div");content.className="jt-product-content";
 if(oldHeader)oldHeader.hidden=true;
 main.classList.add("jt-product-page");
 main.parentNode.insertBefore(shell,main);
 shell.append(sidebar,mainWrap);mainWrap.append(top,content);content.append(main);
 document.body.dataset.jtProductShell="ready";
 const pageTitle=main.querySelector(".app-hero h1");
 if(pageTitle){pageTitle.dataset.jtOriginalHeading="true";}
 const hero=main.querySelector(".app-hero");
 if(hero){hero.classList.add("jt-product-hero");const art=hero.querySelector(".app-art");if(art)art.setAttribute("aria-hidden","true");}
 const create=main.querySelector('[data-jt-action="create"]');
 const primary=main.querySelector('[data-action="primary"]');
 if(primary&&!primary.dataset.jtShellAction){primary.dataset.jtShellAction="true";primary.addEventListener("click",()=>{const boardCreate=main.querySelector('[data-jt-action="create"]');if(boardCreate)boardCreate.click();else{const target=main.querySelector("[data-workspace-tool],#jt-pro-tools,#jtImageStudio");target?.scrollIntoView({behavior:"smooth",block:"start"});}});}
 function openPalette(){
  let dialog=document.querySelector(".jt-command-palette");
  if(!dialog){dialog=document.createElement("dialog");dialog.className="jt-command-palette";dialog.innerHTML='<form method="dialog"><div class="jt-palette-search"><span>⌕</span><input type="search" aria-label="Search JT apps" placeholder="Search apps and workspaces…"><kbd>ESC</kbd></div><div class="jt-palette-results"></div><p>Navigate with your keyboard · Enter to open</p></form>';document.body.append(dialog);
   const input=dialog.querySelector("input"),results=dialog.querySelector(".jt-palette-results");
   const render=()=>{const q=input.value.toLowerCase();results.replaceChildren();const matches=apps.filter(x=>x[0].toLowerCase().includes(q));matches.forEach(x=>{const a=document.createElement("a");a.href=x[1];a.className="jt-palette-item";a.innerHTML='<span>'+x[2]+'</span><b>'+x[0]+'</b><small>'+x[3]+'</small><i>↗</i>';results.append(a);});if(!matches.length){const empty=document.createElement("div");empty.className="jt-palette-empty";empty.textContent="No matching apps";results.append(empty);}};
   input.addEventListener("input",render);dialog.addEventListener("close",()=>{input.value="";});dialog.addEventListener("click",e=>{if(e.target===dialog)dialog.close();});render();
  }
  dialog.showModal();dialog.querySelector("input").focus();
 }
 document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette();}});
};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();