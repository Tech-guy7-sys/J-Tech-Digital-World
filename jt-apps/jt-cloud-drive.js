(() => {
  "use strict";
  const root = document.querySelector("[data-jt-cloud-drive]");
  if (!root) return;
  const DB_NAME = "jt-cloud-drive-files-v1";
  const ROOT_ID = "root";
  const state = { db: null, folders: [], files: [], folderId: ROOT_ID, query: "", editingFolderId: null, pendingDelete: null };
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const id = () => globalThis.crypto?.randomUUID ? crypto.randomUUID() : "jt-"+Date.now()+"-"+Math.random().toString(36).slice(2,9);
  const fmtSize = n => { if (!Number.isFinite(n) || n < 0) return "—"; if (n < 1024) return n+" B"; const units=["KB","MB","GB","TB"]; let v=n/1024, i=0; while(v>=1024 && i<units.length-1){v/=1024;i++;} return v.toFixed(v>=10?1:2)+" "+units[i]; };
  const fmtDate = value => { const d=new Date(value); return Number.isNaN(d.getTime())?"—":d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
  const status = (message, bad=false) => { const el=root.querySelector("[data-cloud-status]"); el.textContent=message; el.dataset.state=bad?"error":"ok"; };
  const openDb = () => new Promise((resolve,reject) => {
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains("folders"))db.createObjectStore("folders",{keyPath:"id"});if(!db.objectStoreNames.contains("files"))db.createObjectStore("files",{keyPath:"id"});};
    req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("Could not open local file vault."));
  });
  const request = req => new Promise((resolve,reject)=>{req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error||new Error("Browser storage request failed."));});
  const run = async (stores, mode, work) => new Promise((resolve,reject)=>{
    const tx=state.db.transaction(stores,mode);let result;
    try{result=work(tx);}catch(e){reject(e);return;}
    tx.oncomplete=()=>resolve(result);tx.onerror=()=>reject(tx.error||new Error("Storage transaction failed."));tx.onabort=()=>reject(tx.error||new Error("Storage transaction was cancelled."));
  });
  const refresh = async () => {
    const tx=state.db.transaction(["folders","files"],"readonly");
    const [folders,files]=await Promise.all([request(tx.objectStore("folders").getAll()),request(tx.objectStore("files").getAll())]);
    state.folders=folders;state.files=files;
    if(state.folderId!==ROOT_ID&&!folders.some(f=>f.id===state.folderId))state.folderId=ROOT_ID;
    render();
    await renderStorage();
  };
  const childrenOf = parent => state.folders.filter(f=>(f.parentId||ROOT_ID)===parent).sort((a,b)=>a.name.localeCompare(b.name));
  const ancestors = folderId => {const chain=[];let current=state.folders.find(f=>f.id===folderId);while(current){chain.unshift(current);current=state.folders.find(f=>f.id===current.parentId);}return chain;};
  const folderName = folderId => folderId===ROOT_ID?"All files":(state.folders.find(f=>f.id===folderId)?.name||"Folder");
  const folderTree = (parent=ROOT_ID, depth=0) => childrenOf(parent).map(f=>'<button type="button" class="jtc-folder-link '+(state.folderId===f.id?"is-current":"")+'" data-open-folder="'+esc(f.id)+'" style="--depth:'+Math.min(depth,5)+'"><span>▰</span><span>'+esc(f.name)+'</span><small>'+state.files.filter(x=>x.folderId===f.id).length+'</small></button>'+folderTree(f.id,depth+1)).join("");
  const render = () => {
    const tree=root.querySelector("[data-cloud-folder-tree]");
    tree.innerHTML='<button type="button" class="jtc-folder-link '+(state.folderId===ROOT_ID?"is-current":"")+'" data-open-folder="root"><span>⌂</span><span>All files</span><small>'+state.files.length+'</small></button>'+folderTree();
    const chain=ancestors(state.folderId);
    root.querySelector("[data-cloud-breadcrumb]").innerHTML='<button type="button" data-open-folder="root">All files</button>'+chain.map(f=>'<span>›</span><button type="button" data-open-folder="'+esc(f.id)+'">'+esc(f.name)+'</button>').join("");
    root.querySelector("[data-cloud-current-name]").textContent=folderName(state.folderId);
    const q=state.query.trim().toLowerCase();
    const visibleFolders=state.folders.filter(f=>(q?true:(f.parentId||ROOT_ID)===state.folderId)&&(!q||f.name.toLowerCase().includes(q)));
    const visibleFiles=state.files.filter(f=>(q?true:f.folderId===state.folderId)&&(!q||[f.name,f.type,folderName(f.folderId)].join(" ").toLowerCase().includes(q)));
    root.querySelector("[data-cloud-result-count]").textContent=(visibleFolders.length+visibleFiles.length)+" items";
    const folderRows=visibleFolders.map(f=>'<article class="jtc-item jtc-folder-item"><button class="jtc-item-main" type="button" data-open-folder="'+esc(f.id)+'"><span class="jtc-file-icon folder">▰</span><span class="jtc-item-name"><b>'+esc(f.name)+'</b><small>Folder · '+fmtDate(f.createdAt)+'</small></span></button><div class="jtc-item-actions"><button type="button" data-rename-folder="'+esc(f.id)+'">Rename</button><button type="button" data-delete-folder="'+esc(f.id)+'">Delete</button></div></article>').join("");
    const fileRows=visibleFiles.map(f=>'<article class="jtc-item"><span class="jtc-file-icon">'+esc((f.name.split(".").pop()||"FILE").slice(0,4).toUpperCase())+'</span><span class="jtc-item-name"><b title="'+esc(f.name)+'">'+esc(f.name)+'</b><small>'+esc(f.type||"Unknown type")+' · '+fmtSize(f.size)+' · '+fmtDate(f.addedAt)+'</small></span><label class="jtc-move-label"><span>Move to</span><select data-move-file="'+esc(f.id)+'" aria-label="Move '+esc(f.name)+'">'+folderOptions(f.folderId)+'</select></label><div class="jtc-item-actions"><button type="button" data-download-file="'+esc(f.id)+'">Download</button><button type="button" data-delete-file="'+esc(f.id)+'">Delete</button></div></article>').join("");
    root.querySelector("[data-cloud-items]").innerHTML=folderRows+fileRows||'<div class="jtc-empty"><span>☁</span><b>'+(q?"No matching files or folders":"This folder is empty")+'</b><p>'+(q?"Try a different search.":"Create a folder or add files from this device to get started.")+'</p></div>';
  };
  const folderOptions = selected => '<option value="root" '+(selected===ROOT_ID?"selected":"")+'>All files</option>'+state.folders.map(f=>'<option value="'+esc(f.id)+'" '+(f.id===selected?"selected":"")+'>'+esc(ancestors(f.id).map(x=>x.name).join(" / "))+'</option>').join("");
  const renderStorage = async () => {
    const bytes=state.files.reduce((sum,f)=>sum+(Number(f.size)||0),0);
    root.querySelector("[data-cloud-file-count]").textContent=String(state.files.length);
    root.querySelector("[data-cloud-folder-count]").textContent=String(state.folders.length);
    root.querySelector("[data-cloud-file-bytes]").textContent=fmtSize(bytes);
    try{
      const estimate=await navigator.storage?.estimate?.();
      if(estimate&&Number.isFinite(estimate.quota)){
        root.querySelector("[data-cloud-origin-usage]").textContent=fmtSize(estimate.usage||0)+" used of "+fmtSize(estimate.quota)+" estimated";
        const pct=estimate.quota?Math.min(100,((estimate.usage||0)/estimate.quota)*100):0;
        root.querySelector("[data-cloud-origin-bar]").style.width=pct+"%";
      }else root.querySelector("[data-cloud-origin-usage]").textContent="Estimate unavailable";
      const persisted=await navigator.storage?.persisted?.();
      root.querySelector("[data-cloud-persistence]").textContent=persisted?"Persistent browser storage":"Best-effort browser storage";
    }catch{root.querySelector("[data-cloud-origin-usage]").textContent="Estimate unavailable";root.querySelector("[data-cloud-persistence]").textContent="Browser-managed storage";}
  };
  const upload = async files => {
    if(!files.length)return;
    status("Saving "+files.length+" file(s) in this browser…");
    try{
      await run(["files"],"readwrite",tx=>files.forEach(file=>tx.objectStore("files").add({id:id(),name:file.name,size:file.size,type:file.type||"",lastModified:file.lastModified||0,addedAt:new Date().toISOString(),folderId:state.folderId,blob:file.slice(0,file.size,file.type||"application/octet-stream")})));
      await refresh();status("Saved "+files.length+" file(s) to this browser's local vault. Nothing was uploaded to a server.");
    }catch(error){status(error?.name==="QuotaExceededError"?"Browser storage is full. Remove files or choose smaller files.":"Could not save files: "+(error?.message||"storage error"),true);}
  };
  root.innerHTML=`
    <div class="jtc-drive">
      <header class="jtc-drive-head"><div><span class="jtc-kicker">JT CLOUD · FILE WORKSPACE</span><h2>Your files, <span>under control.</span></h2><p>Organise folders, keep files on this browser, and find them quickly. This is a local vault, not remote cloud storage.</p></div><span class="jtc-local-badge"><i></i> LOCAL DEVICE VAULT</span></header>
      <div class="jtc-storage-strip"><div><small>FILES IN THIS VAULT</small><b data-cloud-file-count>0</b></div><div><small>FOLDERS</small><b data-cloud-folder-count>0</b></div><div><small>FILE CONTENTS STORED</small><b data-cloud-file-bytes>0 B</b></div><div class="jtc-storage-origin"><small>BROWSER STORAGE ESTIMATE · ENTIRE JT SITE ORIGIN</small><b data-cloud-origin-usage>Checking…</b><div class="jtc-storage-track"><i data-cloud-origin-bar></i></div><small data-cloud-persistence>Checking storage mode…</small></div></div>
      <div class="jtc-drive-layout">
        <aside class="jtc-drive-sidebar"><div class="jtc-sidebar-title"><b>YOUR LIBRARY</b><button type="button" data-new-folder>＋ Folder</button></div><nav data-cloud-folder-tree aria-label="Folders"></nav><div class="jtc-sidebar-note"><b>Local storage notice</b><p>Files stay in this browser on this device. Browser data can be cleared or evicted. Use Download to keep a separate copy. Other devices cannot see these files.</p></div></aside>
        <section class="jtc-drive-main"><div class="jtc-drive-toolbar"><div><div class="jtc-breadcrumb" data-cloud-breadcrumb></div><h3 data-cloud-current-name>All files</h3><small data-cloud-result-count>0 items</small></div><div class="jtc-toolbar-actions"><label class="jtc-upload-button">＋ Add files<input type="file" multiple data-cloud-upload hidden></label><button type="button" data-new-folder>＋ New folder</button></div></div>
          <label class="jtc-search"><span>⌕</span><input type="search" data-cloud-search placeholder="Search files and folders across this vault…" aria-label="Search files and folders"><kbd>SEARCH</kbd></label>
          <div class="jtc-column-head"><span>NAME</span><span>DESTINATION</span><span>ACTIONS</span></div>
          <div class="jtc-items" data-cloud-items><div class="jtc-empty"><b>Loading your vault…</b></div></div>
          <div class="jtc-drive-footer"><span data-cloud-status role="status">Opening local file vault…</span><button type="button" data-refresh-storage>Refresh storage estimate</button></div>
        </section>
      </div>
      <footer class="jtc-drive-disclosure"><b>Important:</b> Upload here means saving file contents into browser-managed storage on this device. It does not transfer files to JT servers or create cloud backup. A real multi-device JT Cloud service still needs an authenticated storage backend, access controls, and server-side quota tracking.</footer>
      <dialog class="jtc-folder-dialog" data-cloud-folder-dialog>
        <form data-cloud-folder-form>
          <span class="jtc-kicker">FOLDER MANAGEMENT</span>
          <h3 data-cloud-folder-dialog-title>Create a folder</h3>
          <label>Folder name<input name="folderName" maxlength="80" required placeholder="e.g. Website assets"></label>
          <div><button type="button" data-cloud-folder-cancel>Cancel</button><button class="jtc-folder-save" type="submit" data-cloud-folder-submit>Create folder</button></div>
        </form>
      </dialog>
      <dialog class="jtc-folder-dialog" data-cloud-delete-dialog>
        <form data-cloud-delete-form>
          <span class="jtc-kicker">CONFIRM DELETE</span>
          <h3>Remove this item?</h3>
          <p data-cloud-delete-copy></p>
          <div><button type="button" data-cloud-delete-cancel>Cancel</button><button class="jtc-delete-confirm" type="submit">Delete</button></div>
        </form>
      </dialog>
    </div>`;
  root.addEventListener("click",async event=>{
    const open=event.target.closest("[data-open-folder]");if(open){state.folderId=open.dataset.openFolder;state.query="";root.querySelector("[data-cloud-search]").value="";render();return;}
    const create=event.target.closest("[data-new-folder]");if(create){state.editingFolderId=null;const form=root.querySelector("[data-cloud-folder-form]");form.reset();root.querySelector("[data-cloud-folder-dialog-title]").textContent="Create a folder";root.querySelector("[data-cloud-folder-submit]").textContent="Create folder";root.querySelector("[data-cloud-folder-dialog]").showModal();form.elements.folderName.focus();return;}
    const rename=event.target.closest("[data-rename-folder]");if(rename){const folder=state.folders.find(f=>f.id===rename.dataset.renameFolder);if(!folder)return;state.editingFolderId=folder.id;const form=root.querySelector("[data-cloud-folder-form]");form.reset();form.elements.folderName.value=folder.name;root.querySelector("[data-cloud-folder-dialog-title]").textContent="Rename folder";root.querySelector("[data-cloud-folder-submit]").textContent="Save name";root.querySelector("[data-cloud-folder-dialog]").showModal();form.elements.folderName.focus();return;}
    const deleteFolder=event.target.closest("[data-delete-folder]");if(deleteFolder){const folder=state.folders.find(f=>f.id===deleteFolder.dataset.deleteFolder);if(!folder)return;if(state.folders.some(f=>f.parentId===folder.id)||state.files.some(f=>f.folderId===folder.id)){status("Move or delete the folder's contents first.",true);return;}state.pendingDelete={type:"folder",id:folder.id};root.querySelector("[data-cloud-delete-copy]").textContent="Delete the empty folder '"+folder.name+"' from this browser?";root.querySelector("[data-cloud-delete-dialog]").showModal();return;}
    const downloadButton=event.target.closest("[data-download-file]");if(downloadButton){const file=state.files.find(f=>f.id===downloadButton.dataset.downloadFile);if(!file)return;const url=URL.createObjectURL(file.blob);const a=document.createElement("a");a.href=url;a.download=file.name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1500);status("Download prepared: "+file.name);return;}
    const deleteFile=event.target.closest("[data-delete-file]");if(deleteFile){const file=state.files.find(f=>f.id===deleteFile.dataset.deleteFile);if(!file)return;state.pendingDelete={type:"file",id:file.id};root.querySelector("[data-cloud-delete-copy]").textContent="Delete '"+file.name+"' from this browser's local vault?";root.querySelector("[data-cloud-delete-dialog]").showModal();return;}
    if(event.target.closest("[data-refresh-storage]")){await renderStorage();status("Storage estimate refreshed.");}
  });
  root.querySelector("[data-cloud-delete-cancel]")?.addEventListener("click",()=>{state.pendingDelete=null;root.querySelector("[data-cloud-delete-dialog]").close();});
  root.querySelector("[data-cloud-delete-form]")?.addEventListener("submit",async event=>{
    event.preventDefault();const pending=state.pendingDelete;if(!pending)return;
    try{
      if(pending.type==="folder"){
        const folder=state.folders.find(f=>f.id===pending.id);if(!folder)return;
        if(state.folders.some(f=>f.parentId===folder.id)||state.files.some(f=>f.folderId===folder.id)){status("This folder is no longer empty.",true);return;}
        await run(["folders"],"readwrite",tx=>tx.objectStore("folders").delete(folder.id));status("Empty folder deleted.");
      }else{
        const file=state.files.find(f=>f.id===pending.id);if(!file)return;
        await run(["files"],"readwrite",tx=>tx.objectStore("files").delete(file.id));status("File removed from this browser vault.");
      }
      state.pendingDelete=null;root.querySelector("[data-cloud-delete-dialog]").close();await refresh();
    }catch(error){status(error.message||"Could not delete this item.",true);}
  });
  root.querySelector("[data-cloud-folder-cancel]")?.addEventListener("click",()=>root.querySelector("[data-cloud-folder-dialog]").close());
  root.querySelector("[data-cloud-folder-form]")?.addEventListener("submit",async event=>{
    event.preventDefault();
    const name=String(new FormData(event.currentTarget).get("folderName")||"").trim().slice(0,80);
    if(!name)return;
    const existing=state.folders.find(f=>f.id===state.editingFolderId);
    const parentId=existing?existing.parentId:state.folderId;
    if(state.folders.some(f=>f.id!==state.editingFolderId&&f.parentId===parentId&&f.name.toLowerCase()===name.toLowerCase())){status("A folder with that name already exists here.",true);return;}
    try{
      if(existing){existing.name=name;await run(["folders"],"readwrite",tx=>tx.objectStore("folders").put(existing));status("Folder renamed.");}
      else{await run(["folders"],"readwrite",tx=>tx.objectStore("folders").add({id:id(),name,parentId,createdAt:new Date().toISOString()}));status("Folder created in this browser.");}
      root.querySelector("[data-cloud-folder-dialog]").close();state.editingFolderId=null;await refresh();
    }catch(error){status(error.message||"Could not save folder.",true);}
  });
  root.addEventListener("change",async event=>{
    if(event.target.matches("[data-cloud-upload]")){await upload([...event.target.files||[]]);event.target.value="";return;}
    if(event.target.matches("[data-move-file]")){const file=state.files.find(f=>f.id===event.target.dataset.moveFile);if(!file)return;file.folderId=event.target.value;await run(["files"],"readwrite",tx=>tx.objectStore("files").put(file));await refresh();status("File moved to "+folderName(file.folderId)+".");}
  });
  root.querySelector("[data-cloud-search]")?.addEventListener("input",event=>{state.query=event.target.value;render();});
  (async()=>{try{if(!("indexedDB" in window))throw new Error("This browser does not support the local file vault.");state.db=await openDb();await refresh();status("Local file vault ready. No server upload or cloud sync is active.");}catch(error){status(error.message||"Could not start the local file vault.",true);root.querySelector("[data-cloud-items]").innerHTML='<div class="jtc-empty"><b>Local vault unavailable</b><p>Try a supported browser with site storage enabled.</p></div>';}})();
})();