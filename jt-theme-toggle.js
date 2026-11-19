/* JT theme switcher — shared, persistent and shell-aware across every JT workspace */
(()=>{'use strict';
if(window.JTTheme?.__v2)return;
const KEY='jt-theme-preference',root=document.documentElement;
const read=()=>{try{const v=localStorage.getItem(KEY);return v==='dark'||v==='light'?v:null}catch(_){return null}};
const current=()=>root.getAttribute('data-jt-theme')==='dark'?'dark':'light';
const sync=()=>document.querySelectorAll('.jt-theme-toggle').forEach(b=>{
 const mode=current(),next=mode==='light'?'dark':'light';
 b.setAttribute('aria-pressed',String(mode==='dark'));
 b.setAttribute('aria-label','Switch to '+next+' mode');
 b.title='Switch to '+next+' mode';
 const icon=b.querySelector('.jt-theme-icon'),label=b.querySelector('.jt-theme-label');
 if(icon)icon.textContent=mode==='light'?'☀':'☾';
 if(label)label.textContent=mode==='light'?'Light':'Dark';
});
const apply=mode=>{const m=mode==='dark'?'dark':'light';root.setAttribute('data-jt-theme',m);root.style.colorScheme=m;try{localStorage.setItem(KEY,m)}catch(_){}sync();return m};
const ensureStyles=()=>{if(!document.querySelector('link[data-jt-theme-shell-styles]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/jt-theme-toggle-shell.css';l.dataset.jtThemeShellStyles='';document.head.append(l)}};
const make=()=>{let b=document.querySelector('.jt-theme-toggle');if(!b){b=document.createElement('button');b.type='button';b.className='jt-theme-toggle';const icon=document.createElement('span');icon.className='jt-theme-icon';icon.setAttribute('aria-hidden','true');const label=document.createElement('span');label.className='jt-theme-label';b.append(icon,label)}if(!b.dataset.jtThemeBound){b.dataset.jtThemeBound='true';b.addEventListener('click',()=>apply(current()==='light'?'dark':'light'))}return b};
const visible=el=>!!el&&!el.closest('[hidden]')&&getComputedStyle(el).display!=='none';
const install=()=>{if(!document.body)return null;ensureStyles();const b=make();
 const product=document.querySelector('.jt-product-top-actions');
 const workspace=document.querySelector('.top-actions');
 const home=document.querySelector('.jtw-header .jtw-nav-actions');
 const site=document.querySelector('.site-header .nav-actions');
 const appTop=document.querySelector('.app-top');
 const appNav=document.querySelector('.app-nav');
 const target=product||workspace||home||site||(visible(appTop)?appNav||appTop:null);
 if(target&&!target.contains(b)){target.appendChild(b)}
 else if(!target&&!b.isConnected){document.body.appendChild(b)}
 sync();return b;
};
apply(read()||'dark');
const boot=()=>{install();if('MutationObserver'in window){const observer=new MutationObserver(()=>install());observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden']});}};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
document.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.shiftKey&&e.key.toLowerCase()==='l'){e.preventDefault();apply(current()==='light'?'dark':'light')}});
window.addEventListener('storage',e=>{if(e.key===KEY&&(e.newValue==='light'||e.newValue==='dark')){root.setAttribute('data-jt-theme',e.newValue);root.style.colorScheme=e.newValue;sync()}});
window.JTTheme={__v2:true,set:apply,toggle:()=>apply(current()==='light'?'dark':'light'),get:current};
})();