(() => {
  "use strict";
  const root = document.querySelector("[data-jt-cloud-remote]");
  if (!root) return;
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const fmt = bytes => { const n=Number(bytes)||0; if(n<1024)return n+" B"; const units=["KB","MB","GB","TB"]; let v=n/1024,i=0; while(v>=1024&&i<units.length-1){v/=1024;i++;} return v.toFixed(v>=10?1:2)+" "+units[i]; };
  const state = { files: [], query: "", sort: "recent", nextCursor: null, ready: false, busy: false };
  root.innerHTML = `
    <section class="jt-cloud-remote">
      <div class="jtc-remote-head">
        <div><span class="app-eyebrow">PRIVATE REMOTE STORAGE</span><h2>JT Cloud storage</h2><p>Files in your JT Account's private remote vault. This is separate from the browser-local vault below.</p></div>
        <div class="jtc-remote-status" data-remote-status>Checking remote storage…</div>
      </div>
      <div class="jtc-remote-toolbar">
        <label class="jtc-remote-search"><span>⌕</span><input type="search" data-remote-search placeholder="Search remote files" aria-label="Search remote files"></label>
        <label class="jtc-sort-label">Sort<select data-remote-sort aria-label="Sort remote files"><option value="recent">Newest</option><option value="name">Name A–Z</option><option value="size">Largest</option></select></label>
        <button type="button" class="jtc-refresh-button" data-remote-refresh>Refresh</button>
        <label class="jtc-upload-button">＋ Upload to JT Cloud<input type="file" data-remote-upload multiple hidden></label>
      </div>
      <div class="jtc-remote-usage"><div><b data-remote-used>—</b><span> used</span></div><div class="jtc-usage-track"><i data-remote-meter></i></div><div data-remote-quota>Storage allowance unavailable</div></div>
      <div class="jtc-remote-list" data-remote-list><p>Checking your remote files…</p></div>
      <button type="button" class="jtc-load-more" data-remote-more hidden>Load more files</button>
      <p class="jtc-remote-note">Remote uploads are private to your signed-in account. Browser-local files are not uploaded automatically. Remote folders and local-to-cloud migration are not enabled yet.</p>
    </section>`;
  const el = selector => root.querySelector(selector);
  const status = (message, bad=false) => { const node=el("[data-remote-status]"); node.textContent=message; node.dataset.state=bad?"error":"ok"; };
  async function api(url, options={}) {
    const response = await fetch(url, { credentials:"same-origin", ...options });
    const data = await response.json().catch(()=>({}));
    if (!response.ok) { const error=new Error(data.message || data.error || "JT Cloud request failed ("+response.status+")"); error.status=response.status; throw error; }
    return data;
  }
  function renderFiles() {
    const list=el("[data-remote-list]");
    if(!state.files.length){list.innerHTML="<p>No remote files yet. Upload a file to begin using JT Cloud storage.</p>";el("[data-remote-more]").hidden=true;return;}
    const sorted=state.files.slice().sort((a,b)=>state.sort==="name"?String(a.name).localeCompare(String(b.name)):state.sort==="size"?(Number(b.size_bytes)||0)-(Number(a.size_bytes)||0):(Number(b.created_at)||0)-(Number(a.created_at)||0));
    list.innerHTML=sorted.map(file=>`<article class="jtc-remote-file" data-file-id="${esc(file.id)}"><div class="jtc-remote-file-icon">▤</div><div class="jtc-remote-file-info"><b>${esc(file.name)}</b><small>${esc(fmt(file.size_bytes))} · ${esc(file.mime_type||"File")}</small></div><button type="button" data-download="${esc(file.id)}">Download</button><button type="button" data-delete="${esc(file.id)}">Delete</button></article>`).join("");
    el("[data-remote-more]").hidden=!state.nextCursor;
    list.querySelectorAll("[data-download]").forEach(button=>button.addEventListener("click",()=>download(button.dataset.download)));
    list.querySelectorAll("[data-delete]").forEach(button=>button.addEventListener("click",()=>remove(button.dataset.delete)));
  }
  async function refresh() {
    try {
      const [usage, listing]=await Promise.all([
        api("/api/cloud/usage"),
        api("/api/cloud/files?limit=100"+(state.query?"&q="+encodeURIComponent(state.query):""))
      ]);
      state.ready=true;state.files=listing.files||[];state.nextCursor=listing.nextCursor||null;
      el("[data-remote-used]").textContent=fmt(usage.usedBytes);
      el("[data-remote-quota]").textContent=fmt(usage.usedBytes)+" of "+fmt(usage.quotaBytes)+" used";
      el("[data-remote-meter]").style.width=Math.min(100,usage.quotaBytes?usage.usedBytes/usage.quotaBytes*100:0)+"%";
      status("Remote storage connected");
      renderFiles();
    } catch(error) {
      state.ready=false;state.files=[];state.nextCursor=null;el("[data-remote-more]").hidden=true;
      const message=error.status===401?"Sign in to your JT Account to use private remote storage.":error.status===503?"Remote storage is not configured for this environment yet.":"Remote storage is unavailable. Check the JT Cloud setup and try again.";
      status(message,true);el("[data-remote-used]").textContent="—";el("[data-remote-quota]").textContent="Storage usage unavailable";el("[data-remote-meter]").style.width="0%";
      el("[data-remote-list]").innerHTML="<p>"+esc(message)+"</p>";
    }
  }
  async function loadMore() {
    if(!state.nextCursor||state.busy)return;
    const button=el("[data-remote-more]");button.disabled=true;button.textContent="Loading…";
    try{
      const listing=await api("/api/cloud/files?limit=100&cursor="+encodeURIComponent(state.nextCursor)+(state.query?"&q="+encodeURIComponent(state.query):""));
      const existing=new Set(state.files.map(file=>file.id));state.files.push(...(listing.files||[]).filter(file=>!existing.has(file.id)));state.nextCursor=listing.nextCursor||null;renderFiles();
    }catch(error){status("Could not load more files: "+error.message,true);}
    finally{button.disabled=false;button.textContent="Load more files";}
  }
  async function upload(files) {
    if(state.busy)return;
    state.busy=true;
    for(const file of files){
      if(file.size>25*1024*1024){status(file.name+" exceeds the 25 MiB upload limit.",true);continue;}
      try{
        status("Uploading "+file.name+"…");
        await api("/api/cloud/files",{method:"POST",headers:{"X-JT-File-Name":encodeURIComponent(file.name),"X-JT-File-Size":String(file.size),"Content-Type":file.type||"application/octet-stream"},body:file});
      }catch(error){status("Could not upload "+file.name+": "+error.message,true);}
    }
    state.busy=false;await refresh();
  }
  async function download(id) {
    try{
      const response=await fetch("/api/cloud/files/"+encodeURIComponent(id),{credentials:"same-origin"});
      if(!response.ok)throw new Error("Download failed ("+response.status+").");
      const blob=await response.blob(),url=URL.createObjectURL(blob),a=document.createElement("a");
      const file=state.files.find(item=>item.id===id);a.href=url;a.download=file?.name||"jt-cloud-file";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
    }catch(error){status(error.message,true);}
  }
  async function remove(id) {
    const file=state.files.find(item=>item.id===id);
    if(!file||!confirm("Delete "+file.name+" from your remote JT Cloud storage?"))return;
    try{await api("/api/cloud/files/"+encodeURIComponent(id),{method:"DELETE"});status("File deleted from remote storage.");await refresh();}
    catch(error){status(error.message,true);}
  }
  el("[data-remote-upload]").addEventListener("change",event=>{const files=Array.from(event.target.files||[]);event.target.value="";upload(files);});
  el("[data-remote-search]").addEventListener("input",event=>{state.query=event.target.value.trim();clearTimeout(state.searchTimer);state.searchTimer=setTimeout(refresh,250);});
  el("[data-remote-sort]").addEventListener("change",event=>{state.sort=event.target.value;renderFiles();});
  el("[data-remote-refresh]").addEventListener("click",refresh);
  el("[data-remote-more]").addEventListener("click",loadMore);
  refresh();
})();
