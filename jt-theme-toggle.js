/* JT theme switcher — persistent, accessible and shared across JT workspaces */
(()=>{'use strict';
const KEY='jt-theme-preference',root=document.documentElement;
const read=()=>{try{const v=localStorage.getItem(KEY);return v==='dark'||v==='light'?v:null}catch(_){return null}};
const current=()=>root.getAttribute('data-jt-theme')==='dark'?'dark':'light';
const sync=()=>document.querySelectorAll('.jt-theme-toggle').forEach(b=>{
 const mode=current(),next=mode==='light'?'dark':'light';
 b.setAttribute('aria-pressed',String(mode==='light'));
 b.setAttribute('aria-label','Switch to '+next+' mode');
 b.title='Switch to '+next+' mode';
 const icon=b.querySelector('.jt-theme-icon'),label=b.querySelector('.jt-theme-label');
 if(icon)icon.textContent=mode==='light'?'☀':'☾';
 if(label)label.textContent=mode==='light'?'Light':'Dark';
});
const apply=mode=>{const m=mode==='dark'?'dark':'light';root.setAttribute('data-jt-theme',m);root.style.colorScheme=m;try{localStorage.setItem(KEY,m)}catch(_){}sync();return m};
apply(read()||'light');
const make=()=>{let b=document.querySelector('.jt-theme-toggle');if(!b){b=document.createElement('button');b.type='button';b.className='jt-theme-toggle';const icon=document.createElement('span');icon.className='jt-theme-icon';icon.setAttribute('aria-hidden','true');const label=document.createElement('span');label.className='jt-theme-label';b.append(icon,label)}if(!b.dataset.jtThemeBound){b.dataset.jtThemeBound='true';b.addEventListener('click',()=>apply(current()==='light'?'dark':'light'))}return b};
const install=()=>{if(!document.body)return;const b=make(),home=document.querySelector('.jtw-header .jtw-nav-actions'),site=document.querySelector('.site-header .nav-actions'),workspaceActions=document.querySelector('.top-actions'),app=document.querySelector('.app-top'),nav=document.querySelector('.app-nav');let target=null;if(home)target=home;else if(site)target=site;else if(workspaceActions)target=workspaceActions;else if(app)target=nav||app;if(target&&!target.contains(b)){if(workspaceActions){const settings=workspaceActions.querySelector('.settings-button');target.insertBefore(b,settings||target.firstChild)}else if(home)target.insertBefore(b,home.firstChild);else target.appendChild(b)}else if(!b.isConnected)document.body.appendChild(b);sync();return b};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
if(document.body&&'MutationObserver'in window){const observer=new MutationObserver(()=>{const b=install();if(b&&b.isConnected)observer.disconnect()});observer.observe(document.body,{childList:true,subtree:true})}
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();apply(current()==='light'?'dark':'light')}});
window.addEventListener('storage',e=>{if(e.key===KEY&&(e.newValue==='light'||e.newValue==='dark'))apply(e.newValue)});
window.JTTheme={set:apply,toggle:()=>apply(current()==='light'?'dark':'light'),get:current};
})();