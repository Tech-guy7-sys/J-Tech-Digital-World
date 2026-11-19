(() => {
  "use strict";

  const status = document.getElementById("jt-desktop-release-status");
  const container = document.getElementById("jt-desktop-release-apps");
  const meta = document.getElementById("jt-desktop-release-meta");
  const filters = document.getElementById("jt-release-filters");
  if (!status || !container) return;

  const owner = "Tech-guy7-sys";
  const catalog = [
    { name:"JT Digital World Desktop", repo:"JT-Digital-World-001", source:"https://github.com/Tech-guy7-sys/JT-Digital-World-001", build:"https://github.com/Tech-guy7-sys/JT-Digital-World-001/actions", note:"JT desktop shell and application hub. Platform availability is based on the assets attached to its actual GitHub releases." },
    { name:"JT Desktop Agent", repo:"JT-Desktop-Agent", source:"https://github.com/Tech-guy7-sys/JT-Desktop-Agent", build:"https://github.com/Tech-guy7-sys/JT-Desktop-Agent/actions", note:"Windows-native desktop agent. Its macOS/Linux shell is a limited preview, not Windows feature parity." },
    { name:"Jeff AI", repo:"Jeff-AI", source:"https://github.com/Tech-guy7-sys/Jeff-AI", build:"https://github.com/Tech-guy7-sys/Jeff-AI/actions", note:"General AI workspace. Installers appear only after a product release has successfully attached packages." },
    { name:"JT AI Agent", repo:"J-Tech-Digital-World", assetPrefix:"JT AI Agent-", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-ai-agent", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/publish-jt-workspace-apps.yml", note:"Research, writing, coding and project workspace. Distributed in the JT Workspace Apps release." , centralBuild:true },
    { name:"JT AI Core", repo:"J-Tech-Digital-World", assetPrefix:"JT AI Core-", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-ai-core", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/publish-jt-workspace-apps.yml", note:"Shared AI provider and permission core, packaged with the central JT Workspace Apps release.", centralBuild:true },
    { name:"JT Code", repo:"J-Tech-Digital-World", assetPrefix:"JT Code-", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-code", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/publish-jt-workspace-apps.yml", note:"Code and website-building workspace, packaged with the central JT Workspace Apps release.", centralBuild:true },
    { name:"JT Design", repo:"J-Tech-Digital-World", assetPrefix:"JT Design-", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-design", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/publish-jt-workspace-apps.yml", note:"Visual design workspace, packaged with the central JT Workspace Apps release.", centralBuild:true },
    { name:"JT Studio", repo:"JT-Studio", source:"https://github.com/Tech-guy7-sys/JT-Studio", build:"https://github.com/Tech-guy7-sys/JT-Studio/actions", note:"Audio workbench. The existing public release is source-only; desktop installers require a successful platform release." },
    { name:"JT Motion", repo:"JT-Motion", source:"https://github.com/Tech-guy7-sys/JT-Motion", build:"https://github.com/Tech-guy7-sys/JT-Motion/actions", note:"Motion and storyboard workspace. The current product scope is not yet a full nonlinear video editor." },
    { name:"JT Cloud", repo:"JT-Cloud", source:"https://github.com/Tech-guy7-sys/JT-Cloud", build:"https://github.com/Tech-guy7-sys/JT-Cloud/actions", note:"Local-first project and file workspace. It is not represented as remote cloud sync until that service is live." },
    { name:"JT Stream", repo:"J-Tech-Digital-World", assetPrefix:"JT Stream-", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-stream", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/publish-jt-workspace-apps.yml", note:"Camera, scenes and recording workspace, packaged with the central JT Workspace Apps release.", centralBuild:true },
    { name:"JT App Manager", repo:"JT-App-Manager", source:"https://github.com/Tech-guy7-sys/JT-App-Manager", build:"https://github.com/Tech-guy7-sys/JT-App-Manager/actions", note:"JT product catalogue and update workspace. It does not silently install or update software." }
  ];

  const platforms = [
    { id:"windows", label:"Windows", matches:name => /\.(exe|msi)$/i.test(name) || (/\.zip$/i.test(name) && /(windows|win|portable)/i.test(name)) },
    { id:"macos", label:"macOS", matches:name => /\.(dmg|pkg)$/i.test(name) || (/\.zip$/i.test(name) && /(mac|darwin|osx)/i.test(name)) },
    { id:"linux", label:"Linux", matches:name => /\.(appimage|deb|rpm|tar\.gz)$/i.test(name) || (/\.zip$/i.test(name) && /linux/i.test(name)) }
  ];
  const excludedAsset = /(source|sha256|checksum|blockmap|\.yml\.blockmap|build-metadata|platform-matrix)/i;
  const releaseRequests = new Map();
  let products = [];

  function fetchReleases(repo) {
    if (!releaseRequests.has(repo)) {
      const request = fetch("https://api.github.com/repos/" + owner + "/" + repo + "/releases?per_page=20", {
        headers: { Accept: "application/vnd.github+json" }, cache: "no-store"
      }).then(async response => {
        if (response.status === 403 || response.status === 429) throw new Error("GitHub release API rate limit reached");
        if (!response.ok) throw new Error("GitHub release API returned HTTP " + response.status);
        return response.json();
      });
      releaseRequests.set(repo, request);
    }
    return releaseRequests.get(repo);
  }

  const makeLink = (href, label, className) => {
    const link = document.createElement("a");
    link.href = href; link.textContent = label; link.className = className || "";
    link.target = "_blank"; link.rel = "noopener noreferrer";
    return link;
  };
  const safeGithubUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (url.hostname === "github.com" || url.hostname === "objects.githubusercontent.com") ? url.href : "";
    } catch { return ""; }
  };
  const formatBytes = value => {
    const bytes = Number(value) || 0;
    if (!bytes) return "Size unavailable";
    const units = ["B","KB","MB","GB"];
    const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    return (bytes / Math.pow(1024,index)).toFixed(index > 1 ? 1 : 0) + " " + units[index];
  };
  const formatDate = value => {
    if (!value) return "Date unavailable";
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined,{year:"numeric",month:"short",day:"numeric"}).format(date);
  };
  const architecture = name => {
    if (/(arm64|aarch64)/i.test(name)) return "ARM64";
    if (/(ia32|i386|i686|x86(?!_64))/i.test(name)) return "x86";
    if (/(x64|x86_64|amd64)/i.test(name)) return "x64";
    if (/universal/i.test(name)) return "Universal";
    return "Architecture not specified";
  };
  const extension = name => {
    const lower = name.toLowerCase();
    if (lower.endsWith(".appimage")) return "AppImage";
    if (lower.endsWith(".tar.gz")) return "TAR.GZ";
    return name.split(".").pop().toUpperCase();
  };
  const assetLabel = asset => extension(asset.name) + " · " + architecture(asset.name);

  function buildFilters() {
    if (!filters) return;
    filters.replaceChildren();
    const searchLabel = document.createElement("label");
    searchLabel.className = "jt-release-search";
    searchLabel.textContent = "Find an app";
    const search = document.createElement("input");
    search.type = "search"; search.placeholder = "Search JT products…";
    search.setAttribute("aria-label","Search JT product releases");
    search.addEventListener("input", renderCards);
    searchLabel.append(search);

    const platformLabel = document.createElement("label");
    platformLabel.className = "jt-release-filter";
    platformLabel.textContent = "Platform";
    const select = document.createElement("select");
    select.setAttribute("aria-label","Filter releases by platform");
    [["all","All platforms"],["windows","Windows"],["macos","macOS"],["linux","Linux"]].forEach(([value,label]) => {
      const option = document.createElement("option"); option.value = value; option.textContent = label; select.append(option);
    });
    select.addEventListener("change", renderCards);
    platformLabel.append(select);
    filters.append(searchLabel,platformLabel);
  }

  function platformPanel(platform, assets) {
    const panel = document.createElement("section");
    panel.className = "jt-release-platform";
    const heading = document.createElement("div");
    heading.className = "jt-release-platform-heading"; heading.textContent = platform.label;
    panel.append(heading);
    const matches = assets.filter(asset => platform.matches(asset.name) && !excludedAsset.test(asset.name));
    if (!matches.length) {
      const state = document.createElement("span");
      state.className = "jt-release-state"; state.textContent = "No published installer";
      panel.append(state); return panel;
    }
    matches.forEach(asset => {
      const href = safeGithubUrl(asset.browser_download_url);
      if (!href) return;
      const link = makeLink(href,assetLabel(asset),"jt-release-asset");
      link.title = asset.name + " · " + formatBytes(asset.size);
      const detail = document.createElement("span");
      detail.className = "jt-release-asset-detail";
      detail.textContent = formatBytes(asset.size) + " · " + (Number(asset.download_count)||0).toLocaleString() + " downloads";
      const release = document.createElement("span");
      release.className = "jt-release-asset-version";
      release.textContent = asset.jtPrerelease ? "Preview " + asset.jtReleaseTag : asset.jtReleaseTag;
      panel.append(link,detail,release);
    });
    const stable = matches.some(asset => !asset.jtPrerelease);
    const state = document.createElement("span");
    state.className = "jt-release-state is-available" + (stable ? "" : " is-preview");
    state.textContent = stable ? "Published stable package" : "Preview package";
    panel.append(state);
    return panel;
  }

  async function loadProduct(product) {
    const card = document.createElement("article");
    card.className = "jt-release-app";
    const header = document.createElement("div");
    header.className = "jt-release-app-header";
    const title = document.createElement("h3"); title.textContent = product.name;
    const category = document.createElement("span");
    category.className = "jt-release-category";
    category.textContent = product.centralBuild ? "JT WORKSPACE RELEASE" : "PRODUCT REPOSITORY";
    header.append(title,category); card.append(header);
    const note = document.createElement("p");
    note.className = "jt-release-description"; note.textContent = product.note; card.append(note);
    const platformGrid = document.createElement("div"); platformGrid.className = "jt-release-platforms";
    const footer = document.createElement("div"); footer.className = "jt-release-card-footer";
    let stableRelease = null, previewRelease = null, assets = [], apiError = "";
    try {
      const releases = await fetchReleases(product.repo);
      const visible = releases.filter(item => !item.draft).sort((a,b) =>
        Date.parse(b.published_at || b.created_at) - Date.parse(a.published_at || a.created_at));
      stableRelease = visible.find(item => !item.prerelease) || null;
      previewRelease = visible.find(item => item.prerelease) || null;
      assets = [stableRelease,previewRelease].filter(Boolean).flatMap(item =>
        (Array.isArray(item.assets) ? item.assets : []).map(asset => ({
          ...asset,jtPrerelease:Boolean(item.prerelease),jtReleaseTag:item.tag_name
        }))
      );
      if (product.assetPrefix) assets = assets.filter(asset => asset.name.startsWith(product.assetPrefix));
    } catch(error) { apiError = error?.message || "Release status unavailable"; }

    const releases = [stableRelease,previewRelease].filter(Boolean);
    if (releases.length) {
      const releaseMeta = document.createElement("p");
      releaseMeta.className = "jt-release-version";
      releaseMeta.textContent = releases.map(item => (item.prerelease ? "Preview " : "Stable ") + item.tag_name + " · " + formatDate(item.published_at || item.created_at)).join("  |  ");
      card.append(releaseMeta);
    } else {
      const releaseMeta = document.createElement("p");
      releaseMeta.className = "jt-release-version";
      releaseMeta.textContent = apiError ? "Release information unavailable" : "No public product release yet";
      card.append(releaseMeta);
    }

    platforms.forEach(platform => platformGrid.append(platformPanel(platform,assets)));
    card.append(platformGrid);
    if (apiError) {
      const warning = document.createElement("p");
      warning.className = "jt-release-api-warning";
      warning.textContent = apiError + ". Open the repository release page for current information.";
      card.append(warning);
    }
    const selectedRelease = stableRelease || previewRelease;
    if (selectedRelease?.html_url) {
      const url = safeGithubUrl(selectedRelease.html_url);
      if (url) footer.append(makeLink(url,"Latest release notes","jt-release-utility-link"));
    }
    const checksums = assets.find(asset => /^SHA256SUMS\.txt$/i.test(asset.name));
    if (checksums) {
      const checksumUrl = safeGithubUrl(checksums.browser_download_url);
      if (checksumUrl) footer.append(makeLink(checksumUrl,"SHA-256 checksums","jt-release-utility-link"));
    }
    footer.append(makeLink("https://github.com/" + owner + "/" + product.repo + "/releases","All releases","jt-release-utility-link"));
    footer.append(makeLink(product.source,"Source code","jt-release-utility-link"));
    footer.append(makeLink(product.build,"Build history","jt-release-utility-link"));
    card.append(footer);
    return {element:card,product,assets,stableRelease,previewRelease,apiError};
  }

  function renderCards() {
    const search = filters?.querySelector('input[type="search"]')?.value.trim().toLowerCase() || "";
    const platform = filters?.querySelector("select")?.value || "all";
    container.replaceChildren();
    const visible = products.filter(item => {
      const matchesSearch = !search || (item.product.name + " " + item.product.note).toLowerCase().includes(search);
      const matchesPlatform = platform === "all" || item.assets.some(asset => {
        const definition = platforms.find(candidate => candidate.id === platform);
        return definition && definition.matches(asset.name) && !excludedAsset.test(asset.name);
      });
      return matchesSearch && matchesPlatform;
    });
    visible.forEach(item => container.append(item.element));
    if (!visible.length) {
      const empty = document.createElement("p");
      empty.className = "jt-release-empty";
      empty.textContent = "No products match this search and platform filter.";
      container.append(empty);
    }
  }

  async function render() {
    status.textContent = "Checking live GitHub releases and downloadable assets…";
    buildFilters();
    const loaded = await Promise.all(catalog.map(loadProduct));
    products = loaded;
    renderCards();
    const withStable = products.filter(item => item.assets.some(asset => !asset.jtPrerelease && platforms.some(platform => platform.matches(asset.name) && !excludedAsset.test(asset.name)))).length;
    const withPreview = products.filter(item => !item.assets.some(asset => !asset.jtPrerelease && platforms.some(platform => platform.matches(asset.name) && !excludedAsset.test(asset.name))) && item.assets.some(asset => platforms.some(platform => platform.matches(asset.name) && !excludedAsset.test(asset.name)))).length;
    const unavailable = products.filter(item => !item.assets.some(asset => platforms.some(platform => platform.matches(asset.name) && !excludedAsset.test(asset.name)))).length;
    status.textContent = products.length + " products checked · " + withStable + " with stable installers · " + withPreview + " preview-only · " + unavailable + " with no published installer.";
    if (meta) meta.textContent = "Live GitHub release data. Package names show architecture; size and download counts come from GitHub. Source archives are not installers. A successful CI build is not a published release, and platform packages may differ in feature support or signing status.";
  }
  render().catch(error => {
    status.textContent = "The release catalogue could not be loaded. Use the product repository links below or refresh the page.";
    if (meta) meta.textContent = error?.message || "GitHub release status is temporarily unavailable.";
  });
})();
