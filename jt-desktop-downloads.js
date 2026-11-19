(() => {
  "use strict";

  const status = document.getElementById("jt-desktop-release-status");
  const container = document.getElementById("jt-desktop-release-apps");
  const meta = document.getElementById("jt-desktop-release-meta");
  if (!status || !container) return;

  const owner = "Tech-guy7-sys";
  const central = owner + "/J-Tech-Digital-World";
  const catalog = [
    { name:"JT Desktop Agent", repo:"JT-Desktop-Agent", source:"https://github.com/Tech-guy7-sys/JT-Desktop-Agent", build:"https://github.com/Tech-guy7-sys/JT-Desktop-Agent/actions", note:"Windows native agent. The macOS/Linux Avalonia shell is a limited preview, not feature parity." },
    { name:"Jeff AI", repo:"Jeff-AI", source:"https://github.com/Tech-guy7-sys/Jeff-AI", build:"https://github.com/Tech-guy7-sys/Jeff-AI/actions", note:"AI workspace. Packages are listed only after a product release contains matching installer assets." },
    { name:"JT AI Agent", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-ai-agent", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/build-jt-workspace-artifacts.yml", note:"General-purpose AI workspace. Currently built through the central workspace artifact pipeline; no permanent product release is published yet.", centralBuild:true },
    { name:"JT AI Core", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-ai-core", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/build-jt-workspace-artifacts.yml", note:"Shared provider and permission layer. Its desktop package is part of the central workspace build; it is not a standalone hosted AI service.", centralBuild:true },
    { name:"JT Code", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-code", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/build-jt-workspace-artifacts.yml", note:"Coding workspace. Cross-platform packages are temporary CI artifacts until a product release is published.", centralBuild:true },
    { name:"JT Design", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-design", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/build-jt-workspace-artifacts.yml", note:"Visual design workspace. Cross-platform packages are temporary CI artifacts until a product release is published.", centralBuild:true },
    { name:"JT Studio", repo:"JT-Studio", source:"https://github.com/Tech-guy7-sys/JT-Studio", build:"https://github.com/Tech-guy7-sys/JT-Studio/actions", note:"Audio workbench. Its existing public release is source-only; installer links appear only after platform packages are published." },
    { name:"JT Motion", repo:"JT-Motion", source:"https://github.com/Tech-guy7-sys/JT-Motion", build:"https://github.com/Tech-guy7-sys/JT-Motion/actions", note:"Video planning and storyboard workspace, not yet a full nonlinear video editor." },
    { name:"JT Cloud", repo:"JT-Cloud", source:"https://github.com/Tech-guy7-sys/JT-Cloud", build:"https://github.com/Tech-guy7-sys/JT-Cloud/actions", note:"Local-first project and file index. It is not remote cloud storage or sync yet." },
    { name:"JT Stream", source:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/tree/main/jt-apps/jt-stream", build:"https://github.com/Tech-guy7-sys/J-Tech-Digital-World/actions/workflows/build-jt-workspace-artifacts.yml", note:"Camera, scene and recording workspace. Cross-platform packages are temporary CI artifacts until a product release is published.", centralBuild:true },
    { name:"JT App Manager", repo:"JT-App-Manager", source:"https://github.com/Tech-guy7-sys/JT-App-Manager", build:"https://github.com/Tech-guy7-sys/JT-App-Manager/actions", note:"Product catalogue and rollout workspace. It does not silently install or update software." }
  ];

  const platforms = [
    { id:"windows", label:"Windows", matches:name => /\.(exe|msi)$/i.test(name) || (/\.zip$/i.test(name) && /(windows|win|portable)/i.test(name)) },
    { id:"macos", label:"macOS", matches:name => /\.(dmg|pkg)$/i.test(name) || (/\.zip$/i.test(name) && /(mac|darwin|osx)/i.test(name)) },
    { id:"linux", label:"Linux", matches:name => /\.(appimage|deb|rpm|tar\.gz)$/i.test(name) || (/\.zip$/i.test(name) && /linux/i.test(name)) }
  ];

  const makeLink = (href, label, className) => {
    const link = document.createElement("a");
    link.href = href;
    link.textContent = label;
    link.className = className || "";
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  };

  const safeGithubUrl = value => {
    try {
      const url = new URL(value);
      return url.protocol === "https:" && (url.hostname === "github.com" || url.hostname === "objects.githubusercontent.com") ? url.href : "";
    } catch { return ""; }
  };

  function renderPlatform(platform, assets) {
    const panel = document.createElement("div");
    panel.className = "jt-release-platform";
    const heading = document.createElement("div");
    heading.className = "jt-release-platform-heading";
    heading.textContent = platform.label;
    panel.append(heading);

    const matches = assets.filter(asset => platform.matches(asset.name) && !/(source|sha256|checksum|blockmap|\.yml\.blockmap)/i.test(asset.name));
    if (matches.length) {
      matches.forEach(asset => {
        const href = safeGithubUrl(asset.browser_download_url);
        if (href) panel.append(makeLink(href, asset.name, "jt-release-asset"));
      });
      const state = document.createElement("span");
      const stableAsset = matches.some(asset => !asset.jtPrerelease);
      state.className = "jt-release-state is-available" + (stableAsset ? "" : " is-preview");
      state.textContent = stableAsset ? "Published package" : "Preview package";
      panel.append(state);
    } else {
      const state = document.createElement("span");
      state.className = "jt-release-state";
      state.textContent = "No published installer";
      panel.append(state);
    }
    return panel;
  }

  async function loadProduct(product) {
    const card = document.createElement("article");
    card.className = "jt-release-app";

    const header = document.createElement("div");
    header.className = "jt-release-app-header";
    const title = document.createElement("h3");
    title.textContent = product.name;
    const category = document.createElement("span");
    category.className = "jt-release-category";
    category.textContent = product.centralBuild ? "WORKSPACE BUILD" : "PRODUCT REPOSITORY";
    header.append(title, category);
    card.append(header);

    const note = document.createElement("p");
    note.className = "jt-release-description";
    note.textContent = product.note;
    card.append(note);

    const platformGrid = document.createElement("div");
    platformGrid.className = "jt-release-platforms";
    const footer = document.createElement("div");
    footer.className = "jt-release-card-footer";

    let stableRelease = null;
    let previewRelease = null;
    let assets = [];
    if (product.repo) {
      try {
        const response = await fetch("https://api.github.com/repos/" + owner + "/" + product.repo + "/releases?per_page=10", {
          headers: { Accept: "application/vnd.github+json" },
          cache: "no-store"
        });
        if (!response.ok) throw new Error("Release API unavailable");
        const releases = await response.json();
        const visible = releases.filter(item => !item.draft).sort((a,b) => Date.parse(b.published_at || b.created_at) - Date.parse(a.published_at || a.created_at));
        stableRelease = visible.find(item => !item.prerelease) || null;
        previewRelease = visible.find(item => item.prerelease) || null;
        assets = [stableRelease, previewRelease].filter(Boolean).flatMap(item =>
          (Array.isArray(item.assets) ? item.assets : []).map(asset => ({
            ...asset, jtPrerelease: Boolean(item.prerelease), jtReleaseTag: item.tag_name
          }))
        );
      } catch {
        const warning = document.createElement("span");
        warning.className = "jt-release-state";
        warning.textContent = "Live release status could not be loaded";
        card.append(warning);
      }
    }

    if (stableRelease || previewRelease) {
      const releaseMeta = document.createElement("p");
      releaseMeta.className = "jt-release-version";
      const labels = [];
      if (stableRelease) labels.push("Stable " + stableRelease.tag_name);
      if (previewRelease) labels.push("Preview " + previewRelease.tag_name);
      releaseMeta.textContent = labels.join(" · ");
      card.append(releaseMeta);
    } else {
      const releaseMeta = document.createElement("p");
      releaseMeta.className = "jt-release-version";
      releaseMeta.textContent = product.centralBuild ? "No permanent product release published yet · CI artifacts are temporary" : "No published product release yet";
      card.append(releaseMeta);
    }

    platforms.forEach(platform => platformGrid.append(renderPlatform(platform, assets)));
    card.append(platformGrid);

    const checksums = assets.find(asset => /^SHA256SUMS\.txt$/i.test(asset.name));
    if (checksums) {
      const checksumUrl = safeGithubUrl(checksums.browser_download_url);
      if (checksumUrl) footer.append(makeLink(checksumUrl, "SHA-256 checksums", "jt-release-utility-link"));
    }
    if (product.repo) {
      footer.append(makeLink("https://github.com/" + owner + "/" + product.repo + "/releases", "All releases", "jt-release-utility-link"));
    } else {
      footer.append(makeLink("https://github.com/" + owner + "/" + "J-Tech-Digital-World/actions/workflows/build-jt-workspace-artifacts.yml", "Build artifacts", "jt-release-utility-link"));
    }
    footer.append(makeLink(product.source, "Source code", "jt-release-utility-link"));
    footer.append(makeLink(product.build, "Build history", "jt-release-utility-link"));
    card.append(footer);
    return card;
  }

  async function render() {
    status.textContent = "Checking published product releases and platform packages…";
    container.replaceChildren();
    const cards = await Promise.all(catalog.map(loadProduct));
    cards.forEach(card => container.append(card));
    status.textContent = catalog.length + " JT products · Windows, macOS and Linux status checked against official product repositories.";
    if (meta) meta.textContent = "A platform is marked available only when its latest public product release contains a matching installer asset. Build workflows and temporary CI artifacts are not published releases. Windows x64, Windows ARM64/x86, macOS Intel/Apple Silicon, and Linux x64/ARM64 are separate targets; availability is shown only when the corresponding package exists.";
  }

  render();
})();
