(()=>{
"use strict";
const $=id=>document.getElementById(id),svg=$("artboard"),wrap=$("artboardWrap"),STORE="jt-design-canvas.v1";
const presets={presentation:[900,560],square:[700,700],story:[600,1067],wide:[960,540]};
let doc={name:"Untitled design",width:900,height:560,bg:"#ffffff",items:[
{id:"layer-title",name:"Main heading",type:"text",x:82,y:165,w:600,h:70,fill:"#22242b",text:"Your next idea.",fontSize:58,align:"start",opacity:100},
{id:"layer-copy",name:"Supporting text",type:"text",x:86,y:220,w:520,h:34,fill:"#6f7784",text:"A simple canvas to make something clear.",fontSize:18,align:"start",opacity:100},
{id:"layer-accent",name:"Accent shape",type:"rect",x:85,y:280,w:120,h:9,fill:"#635bdb",opacity:100}
]};
let selected="",zoom=100,history=[],future=[],drag=null;
const clone=v=>JSON.parse(JSON.stringify(v));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const item=()=>doc.items.find(x=>x.id===selected);
function snapshot(){history.push(clone(doc));if(history.length>60)history.shift();future=[];updateHistoryButtons()}
function updateHistoryButtons(){$("undoBtn").disabled=!history.length;$("redoBtn").disabled=!future.length}
function save(silent=true){doc.name=$("designName").value.trim()||"Untitled design";try{localStorage.setItem(STORE,JSON.stringify(doc));$("saveState").textContent="Saved locally";if(!silent)toast("Design saved on this device.")}catch{$("saveState").textContent="Storage unavailable";toast("Could not save. Export your design as SVG.")}}
function toast(msg){const el=$("toast");el.textContent=msg;el.classList.add("show");clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove("show"),2200)}
function render(){
 svg.setAttribute("viewBox","0 0 "+doc.width+" "+doc.height);svg.setAttribute("width",doc.width);svg.setAttribute("height",doc.height);
 let markup='<rect width="'+doc.width+'" height="'+doc.height+'" fill="'+esc(doc.bg)+'"/>';
 doc.items.forEach(o=>{const common='class="ds-object" data-layer-id="'+esc(o.id)+'" opacity="'+(o.opacity/100)+'"';
  if(o.type==="rect")markup+='<rect '+common+' x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h+'" rx="2" fill="'+esc(o.fill)+'"/>';
  else if(o.type==="ellipse")markup+='<ellipse '+common+' cx="'+(o.x+o.w/2)+'" cy="'+(o.y+o.h/2)+'" rx="'+(o.w/2)+'" ry="'+(o.h/2)+'" fill="'+esc(o.fill)+'"/>';
  else if(o.type==="image")markup+='<image '+common+' x="'+o.x+'" y="'+o.y+'" width="'+o.w+'" height="'+o.h+'" preserveAspectRatio="xMidYMid meet" href="'+esc(o.src)+'"/>';
  else{const anchor=o.align||"start",x=anchor==="middle"?o.x+o.w/2:anchor==="end"?o.x+o.w:o.x;markup+='<text '+common+' x="'+x+'" y="'+(o.y+o.fontSize)+'" fill="'+esc(o.fill)+'" font-family="Arial, sans-serif" font-size="'+o.fontSize+'" text-anchor="'+anchor+'">'+esc(o.text||"Text")+'</text>'}
 });
 svg.innerHTML=markup;
 if(selected){const o=item();if(o)svg.insertAdjacentHTML("beforeend",'<rect class="ds-selection" x="'+(o.x-3)+'" y="'+(o.y-3)+'" width="'+(o.w+6)+'" height="'+(o.h+6)+'" rx="2"/><rect class="ds-handle" x="'+(o.x+o.w-4)+'" y="'+(o.y+o.h-4)+'" width="8" height="8"/>')}
 $("canvasBg").value=doc.bg;$("canvasDimensions").textContent=doc.width+" × "+doc.height+" px";renderLayers();renderInspector();$("selectionStatus").textContent=item()?item().name:"No layer selected";updateHistoryButtons()
}
function renderLayers(){const list=$("layerList");list.replaceChildren();[...doc.items].reverse().forEach(o=>{const row=document.createElement("button");row.type="button";row.className="ds-layer-row"+(o.id===selected?" active":"");const icon=document.createElement("span");icon.className="ds-layer-icon";icon.textContent=o.type==="text"?"T":o.type==="ellipse"?"◯":o.type==="image"?"▧":"▱";const name=document.createElement("span");name.textContent=o.name;row.append(icon,name);row.addEventListener("click",()=>{selected=o.id;render()});list.append(row)})}
function renderInspector(){const o=item();$("canvasInspector").hidden=!!o;$("objectInspector").hidden=!o;$("selectedType").textContent=o?o.type[0].toUpperCase()+o.type.slice(1):"Canvas";if(!o)return;$("objectHeading").textContent=o.type==="text"?"Text properties":"Shape properties";$("objectName").value=o.name;$("objectFill").value=o.fill;$("objectX").value=Math.round(o.x);$("objectY").value=Math.round(o.y);$("objectW").value=Math.round(o.w);$("objectH").value=Math.round(o.h);$("objectOpacity").value=o.opacity;$("opacityValue").textContent=o.opacity+"%";$("textOptions").hidden=o.type!=="text";if(o.type==="text"){$("objectText").value=o.text;$("objectFontSize").value=o.fontSize;$("objectAlign").value=o.align||"start"}}

function makeText(id,name,text,x,y,w,size,fill,align="start"){return{id,name,type:"text",text,x,y,w,h:size*1.5,fontSize:size,fill,align,opacity:100}}
function makeRect(id,name,x,y,w,h,fill){return{id,name,type:"rect",x,y,w,h,fill,opacity:100}}
function applyTemplate(key){
 const W=key==="quote"?700:key==="thumbnail"?960:900,H=key==="quote"?700:key==="thumbnail"?540:560;
 let bg="#ffffff",items=[];
 if(key==="social"){bg="#f3f4f8";items=[makeRect("tpl-band","Accent band",0,0,W,18,"#5148b8"),makeText("tpl-kicker","Eyebrow","JT DIGITAL WORLD",72,92,700,16,"#5148b8"),makeText("tpl-title","Headline","Something worth sharing.",72,174,750,54,"#202938"),makeText("tpl-copy","Supporting text","Add a short message that tells people what matters.",76,260,690,22,"#687487"),makeRect("tpl-pill","Callout",76,350,190,52,"#5148b8"),makeText("tpl-cta","Call to action","LEARN MORE",99,365,150,16,"#ffffff")]}
 if(key==="event"){bg="#171b29";items=[makeRect("tpl-top","Top accent",64,62,110,8,"#a99eff"),makeText("tpl-label","Event label","YOU ARE INVITED",64,126,700,17,"#c6c0ff"),makeText("tpl-title","Event title","THE BIG IDEAS\nCONFERENCE",64,190,760,58,"#ffffff"),makeText("tpl-detail","Event details","FRIDAY · 6 PM  /  LAGOS",68,390,700,21,"#d5d9e2"),makeText("tpl-foot","Footer","TICKETS & DETAILS  ·  YOURSITE.COM",68,475,700,14,"#aeb7c8")]}
 if(key==="quote"){bg="#f5f1e9";items=[makeRect("tpl-bar","Accent bar",70,78,8,540,"#5148b8"),makeText("tpl-mark","Quote mark","“",112,130,120,100,"#5148b8"),makeText("tpl-title","Quote","Make the complex\nfeel simple.",120,260,500,48,"#222938"),makeText("tpl-author","Attribution","— YOUR NAME",122,510,440,16,"#687487")]}
 if(key==="thumbnail"){bg="#202638";items=[makeRect("tpl-accent","Accent block",0,0,22,H,"#a99eff"),makeText("tpl-kicker","Category","A PRACTICAL GUIDE",72,90,800,18,"#c6c0ff"),makeText("tpl-title","Video title","BUILD BETTER\nIDEAS.",72,178,800,68,"#ffffff"),makeText("tpl-copy","Subtitle","A clear title that earns attention",76,380,760,23,"#d5d9e2"),makeRect("tpl-tag","Tag",76,455,190,48,"#5148b8"),makeText("tpl-tag-text","Tag text","WATCH NOW",99,468,150,16,"#ffffff")]}
 snapshot();doc={name:({social:"Social announcement",event:"Event poster",quote:"Quote card",thumbnail:"Video thumbnail"})[key],width:W,height:H,bg,items};selected="";$("designName").value=doc.name;$("canvasPreset").value=W===700?"square":W===960?"wide":"presentation";render();save();toast("Template loaded. Every element is editable.");
}
\nfunction add(type){snapshot();const id="layer-"+Math.random().toString(36).slice(2,10);const o={id,name:type==="text"?"New text":type==="rect"?"Rectangle":"Ellipse",type,x:Math.round(doc.width*.36),y:Math.round(doc.height*.35),w:type==="text"?400:180,h:type==="text"?60:120,fill:type==="text"?"#242832":"#635bdb",opacity:100};if(type==="text"){o.text="Add your text";o.fontSize=40;o.align="start"}doc.items.push(o);selected=id;render();save()}
function mutate(fn){const o=item();if(!o)return;snapshot();fn(o);o.x=Math.max(0,Math.min(doc.width-1,Number(o.x)||0));o.y=Math.max(0,Math.min(doc.height-1,Number(o.y)||0));o.w=Math.max(1,Math.min(doc.width-o.x,Number(o.w)||1));o.h=Math.max(1,Math.min(doc.height-o.y,Number(o.h)||1));render();save()}
function undo(){if(!history.length)return;future.push(clone(doc));doc=history.pop();$("designName").value=doc.name;selected="";render();save()}
function redo(){if(!future.length)return;history.push(clone(doc));doc=future.pop();$("designName").value=doc.name;selected="";render();save()}
function coords(e){const r=svg.getBoundingClientRect();return{x:(e.clientX-r.left)*doc.width/r.width,y:(e.clientY-r.top)*doc.height/r.height}}
svg.addEventListener("pointerdown",e=>{const node=e.target.closest("[data-layer-id]");if(!node){selected="";render();return}const id=node.dataset.layerId,o=doc.items.find(x=>x.id===id);if(!o)return;selected=id;const p=coords(e);drag={id,dx:p.x-o.x,dy:p.y-o.y,before:clone(doc),moved:false};svg.setPointerCapture(e.pointerId);render()});
svg.addEventListener("pointermove",e=>{if(!drag)return;const o=doc.items.find(x=>x.id===drag.id);if(!o)return;const p=coords(e);o.x=Math.max(0,Math.min(doc.width-o.w,p.x-drag.dx));o.y=Math.max(0,Math.min(doc.height-o.h,p.y-drag.dy));drag.moved=true;render()});
svg.addEventListener("pointerup",()=>{if(drag?.moved){history.push(drag.before);if(history.length>60)history.shift();future=[];save()}drag=null;updateHistoryButtons()});
document.querySelectorAll("[data-add]").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll("[data-add]").forEach(x=>x.classList.toggle("active",x===b));if(b.dataset.add!=="select")add(b.dataset.add)}));
$("addLayer").onclick=()=>add("rect");
$("canvasBg").addEventListener("change",e=>{snapshot();doc.bg=e.target.value;render();save()});
document.querySelectorAll("[data-bg]").forEach(b=>b.addEventListener("click",()=>{snapshot();doc.bg=b.dataset.bg;render();save()}));
$("objectName").addEventListener("change",e=>mutate(o=>o.name=e.target.value.slice(0,60)||"Layer"));
$("objectFill").addEventListener("change",e=>mutate(o=>o.fill=e.target.value));
["objectX","objectY","objectW","objectH"].forEach(id=>$(id).addEventListener("change",e=>mutate(o=>o[{objectX:"x",objectY:"y",objectW:"w",objectH:"h"}[id]]=Number(e.target.value))));
$("objectOpacity").addEventListener("change",e=>mutate(o=>o.opacity=Number(e.target.value)));
$("objectText").addEventListener("change",e=>mutate(o=>o.text=e.target.value.slice(0,160)));
$("objectFontSize").addEventListener("change",e=>mutate(o=>o.fontSize=Math.max(8,Math.min(180,Number(e.target.value)||16))));
$("objectAlign").addEventListener("change",e=>mutate(o=>o.align=e.target.value));
$("duplicateObject").onclick=()=>{const o=item();if(!o)return;snapshot();const copy=clone(o);copy.id="layer-"+Math.random().toString(36).slice(2,10);copy.name=o.name+" copy";copy.x=Math.min(doc.width-copy.w,o.x+22);copy.y=Math.min(doc.height-copy.h,o.y+22);doc.items.push(copy);selected=copy.id;render();save()};
$("deleteObject").onclick=()=>{if(!item())return;snapshot();doc.items=doc.items.filter(x=>x.id!==selected);selected="";render();save()};
$("moveUp").onclick=()=>reorder(1);$("moveDown").onclick=()=>reorder(-1);\n$("alignCenterX").onclick=()=>mutate(o=>o.x=Math.round((doc.width-o.w)/2));\n$("alignCenterY").onclick=()=>mutate(o=>o.y=Math.round((doc.height-o.h)/2));\n$("designTemplate").addEventListener("change",e=>{if(e.target.value){applyTemplate(e.target.value);e.target.value=""}});
function reorder(dir){const i=doc.items.findIndex(x=>x.id===selected),j=i+dir;if(i<0||j<0||j>=doc.items.length)return;snapshot();[doc.items[i],doc.items[j]]=[doc.items[j],doc.items[i]];render();save()}

$("importImageBtn").addEventListener("click",()=>$("importImageFile").click());
$("importImageFile").addEventListener("change",async e=>{
 const file=e.target.files&&e.target.files[0];e.target.value="";if(!file)return;
 if(!["image/png","image/jpeg","image/webp"].includes(file.type)){toast("Choose a PNG, JPEG or WebP image.");return}
 if(file.size>1500000){toast("Images must be 1.5 MB or smaller for reliable local saving.");return}
 const src=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)}).catch(()=>null);
 if(typeof src!=="string"||!src.startsWith("data:image/")){toast("Could not read that image.");return}
 const image=new Image();image.onload=()=>{
  snapshot();const scale=Math.min(1,doc.width*.55/image.width,doc.height*.55/image.height);
  const w=Math.max(1,Math.round(image.width*scale)),h=Math.max(1,Math.round(image.height*scale));
  const id="layer-"+Math.random().toString(36).slice(2,10);
  doc.items.push({id,name:file.name.replace(/\.[^.]+$/,"").slice(0,60)||"Imported image",type:"image",src,x:Math.round((doc.width-w)/2),y:Math.round((doc.height-h)/2),w,h,fill:"#ffffff",opacity:100});
  selected=id;render();save();toast("Image added as an editable layer.");
 };image.onerror=()=>toast("That image could not be opened.");image.src=src;
});
$("undoBtn").onclick=undo;$("redoBtn").onclick=redo;$("designName").addEventListener("change",()=>save());
$("saveDesign").onclick=()=>save(false);
$("newDesign").onclick=()=>{if(!confirm("Start a new blank design? Export your current design first if you want a separate backup."))return;snapshot();doc={name:"Untitled design",width:900,height:560,bg:"#ffffff",items:[]};selected="";$("designName").value=doc.name;render();save();toast("New canvas created.")};
$("canvasPreset").addEventListener("change",e=>{snapshot();[doc.width,doc.height]=presets[e.target.value];doc.items.forEach(o=>{o.x=Math.min(o.x,doc.width-o.w);o.y=Math.min(o.y,doc.height-o.h)});render();save()});
function applyZoom(){wrap.style.width=zoom+"%";$("zoomValue").textContent=zoom+"%"}
$("zoomIn").onclick=()=>{zoom=Math.min(150,zoom+10);applyZoom()};$("zoomOut").onclick=()=>{zoom=Math.max(30,zoom-10);applyZoom()};$("fitCanvas").onclick=()=>{zoom=100;applyZoom()};
function download(name,data,type){const url=URL.createObjectURL(new Blob([data],{type}));const a=document.createElement("a");a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1200)}
function filename(ext){return (doc.name||"jt-design").replace(/[^a-z0-9-_]+/gi,"-")+"."+ext}
$("exportSvg").onclick=()=>{const clean=svg.cloneNode(true);clean.querySelectorAll(".ds-selection,.ds-handle").forEach(x=>x.remove());clean.setAttribute("xmlns","http://www.w3.org/2000/svg");download(filename("svg"),new XMLSerializer().serializeToString(clean),"image/svg+xml");toast("SVG exported.")};
$("exportPng").onclick=()=>{const clean=svg.cloneNode(true);clean.querySelectorAll(".ds-selection,.ds-handle").forEach(x=>x.remove());const blob=new Blob([new XMLSerializer().serializeToString(clean)],{type:"image/svg+xml"});const url=URL.createObjectURL(blob),img=new Image();img.onload=()=>{const canvas=document.createElement("canvas");canvas.width=doc.width*2;canvas.height=doc.height*2;const ctx=canvas.getContext("2d");ctx.scale(2,2);ctx.drawImage(img,0,0);URL.revokeObjectURL(url);canvas.toBlob(png=>{if(!png){toast("PNG export failed.");return}const p=URL.createObjectURL(png),a=document.createElement("a");a.href=p;a.download=filename("png");a.click();setTimeout(()=>URL.revokeObjectURL(p),1200);toast("PNG exported at 2× resolution.")},"image/png")};img.onerror=()=>{URL.revokeObjectURL(url);toast("Could not render PNG.")};img.src=url};
document.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="s"){e.preventDefault();save(false)}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="z"){e.preventDefault();e.shiftKey?redo():undo()}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="d"&&!["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)&&item()){e.preventDefault();$("duplicateObject").click()}if((e.key==="Delete"||e.key==="Backspace")&&!["INPUT","TEXTAREA","SELECT"].includes(document.activeElement.tagName)&&item())$("deleteObject").click()});
try{const saved=JSON.parse(localStorage.getItem(STORE)||"null");if(saved&&saved.width&&Array.isArray(saved.items)){doc=saved;$("designName").value=doc.name||"Untitled design"}}catch{}
render();applyZoom();
})();