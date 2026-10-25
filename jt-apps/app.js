(()=>{
  "use strict";
  const main=document.querySelector("main[data-app]");
  if(!main)return;
  const app=main.dataset.app||"JT Workspace";
  const slug=app.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  if(!document.querySelector("[data-jt-command-deck-loader]")){
    const deck=document.createElement("script");
    deck.src="/jt-apps/command-deck.js";
    deck.defer=true;
    deck.dataset.jtCommandDeckLoader="1";
    document.head.appendChild(deck);
  }
  const nav=document.querySelector(".app-nav");
  if(nav&&!nav.querySelector("[data-jt-guide]")){
    const about=document.createElement("a");
    about.href="/about-app.html?app="+encodeURIComponent(slug);
    about.textContent="About app";
    about.dataset.jtGuide="1";
    nav.appendChild(about);
    const downloads=document.createElement("a");
    downloads.href="/download.html";
    downloads.textContent="Downloads";
    nav.appendChild(downloads);
  }
  const findWorkspace=()=>document.querySelector("#jt-pro-tools")||main.querySelector("[data-workspace-tool]")||document.querySelector("#release-manager");
  document.querySelectorAll('[data-action="primary"]').forEach(button=>button.addEventListener("click",()=>{
    const target=findWorkspace();
    if(target){
      target.scrollIntoView({behavior:"smooth",block:"start"});
      let notice=target.querySelector("[data-workspace-ready]");
      if(!notice){
        notice=document.createElement("p");
        notice.dataset.workspaceReady="1";
        notice.setAttribute("role","status");
        notice.style.cssText="margin:0 0 16px;padding:12px 14px;border:1px solid #344b56;border-radius:10px;background:#101b22;color:#bcefe1;font-size:12px;line-height:1.6";
        target.insertBefore(notice,target.firstChild);
      }
      notice.textContent=app+" workspace opened. Use the tools below; browser-local changes stay on this device unless you export them. Cloud sync, AI services, installation, or other external actions are only available where explicitly connected.";
      const focusable=target.querySelector('input:not([type="file"]),textarea,select,button');
      if(focusable)window.setTimeout(()=>focusable.focus({preventScroll:true}),250);
      return;
    }
    let note=document.getElementById("actionNotice");
    if(!note){note=document.createElement("p");note.id="actionNotice";note.setAttribute("role","status");note.style.cssText="margin:18px 0;padding:16px;border:1px solid #6c5a9d;background:#171329;border-radius:12px;color:#ded7ff;line-height:1.6";button.closest("section")?.appendChild(note)||main.appendChild(note);}
    note.textContent="No interactive workspace module is available on this page yet. This action has not been executed.";
    note.scrollIntoView({behavior:"smooth",block:"nearest"});
  }));
})();
;(()=>{if(!document.querySelector('script[data-jt-theme-loader]')&&!document.querySelector('script[src*="jt-theme-toggle.js"]')){const s=document.createElement("script");s.src="/jt-theme-toggle.js";s.dataset.jtThemeLoader="";document.head.appendChild(s);}})();
