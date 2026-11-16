(() => {
  "use strict";
  const root = document.getElementById("jt-ai-core-live-status");
  if (!root) return;
  const make = (tag, text, className) => {
    const node=document.createElement(tag);
    if(className)node.className=className;
    if(text!==undefined)node.textContent=text;
    return node;
  };
  async function load() {
    try {
      const response=await fetch("/api/jeff",{credentials:"same-origin",cache:"no-store"});
      const data=await response.json().catch(()=>({}));
      root.replaceChildren();
      const header=make("div",undefined,"jt-core-status-header");
      const title=make("div","Jeff AI gateway","jt-core-status-title");
      const summary=make("p",data.ready?"Free-tier AI gateway is ready.": "The gateway is not ready yet. Configure an approved free-tier provider in the Cloudflare Pages environment.");
      header.append(title,summary);
      const badge=make("span",data.ready?"READY":"SETUP REQUIRED","jt-core-status-badge");
      header.append(badge);root.append(header);
      const list=make("div",undefined,"jt-core-provider-list");
      for(const provider of data.providers||[]){
        const row=make("div",undefined,"jt-core-provider");
        row.append(make("b",provider.label||provider.id));
        row.append(make("span",provider.configured?"Configured":"Not configured",provider.configured?"is-ready":"is-missing"));
        list.append(row);
      }
      root.append(list);
      root.append(make("p", "Cost policy: free-tier routes only. Paid fallback is disabled. Provider credentials are never returned to this page.", "jt-core-status-note"));
      const link=make("a","Open Jeff AI ↗");link.href="/jt-ai-agent/";link.className="jt-core-open-link";root.append(link);
    } catch {
      root.replaceChildren(make("b","Jeff AI status unavailable"),make("p","The provider status endpoint could not be reached. The workspace can still be opened, but live AI availability is unverified."));
    }
  }
  load();
})();
