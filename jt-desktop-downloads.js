(() => {
  "use strict";
  const status = document.getElementById("jt-desktop-release-status");
  const container = document.getElementById("jt-desktop-release-apps");
  const meta = document.getElementById("jt-desktop-release-meta");
  if (!status || !container) return;

  const owner = "https://github.com/Tech-guy7-sys";
  const catalog = [
    { name: "JT Desktop Agent", url: owner + "/agent-jeff", detail: "Native desktop control and automation. Current implementation targets Windows; macOS and Linux require a platform port." },
    { name: "Jeff AI", url: owner + "/jeff-ai", detail: "AI workspace with a local provider adapter and Windows, macOS, and Linux packaging workflow." },
    { name: "JT Studio", url: owner + "/jt-studio", detail: "Audio production workbench with an Electron desktop shell and cross-platform packaging workflow." },
    { name: "JT Motion", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-motion", detail: "Video and motion workspace source. Dedicated product repository and verified installers are still needed." },
    { name: "JT Cloud", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-cloud", detail: "Cloud workspace source. Dedicated product repository and verified installers are still needed." },
    { name: "JT App Manager", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-app-manager", detail: "App management workspace source. Dedicated product repository and verified installers are still needed." }
  ];

  status.textContent = "Product source directory · no GitHub Releases are published from this company repository.";
  container.replaceChildren();

  for (const product of catalog) {
    const card = document.createElement("article");
    card.className = "jt-release-app";
    const title = document.createElement("h3");
    title.textContent = product.name;
    const description = document.createElement("p");
    description.textContent = product.detail;
    const links = document.createElement("div");
    links.className = "jt-release-links";
    const source = document.createElement("a");
    source.href = product.url;
    source.textContent = "Open source repository ↗";
    source.target = "_blank";
    source.rel = "noopener noreferrer";
    links.append(source);
    card.append(title, description, links);
    container.append(card);
  }

  if (meta) {
    meta.textContent = "Build artifacts are temporary CI outputs. Product installers should be listed only after the matching OS/architecture build succeeds and is verified. Source archives are not installers.";
  }
})();
