(() => {
  "use strict";
  const status = document.getElementById("jt-desktop-release-status");
  const container = document.getElementById("jt-desktop-release-apps");
  const meta = document.getElementById("jt-desktop-release-meta");
  if (!status || !container) return;

  const owner = "https://github.com/Tech-guy7-sys";
  const catalog = [
    { name: "JT Desktop Agent", url: owner + "/agent-jeff", detail: "Permission-controlled desktop agent. Windows x64/x86 build targets are configured; macOS and Linux need a real native port." },
    { name: "Jeff AI", url: owner + "/jeff-ai", detail: "AI assistant experience with Windows x64/x86, macOS Intel/Apple Silicon, and Linux x64/ARM64 packaging workflows." },
    { name: "JT AI Agent", url: owner + "/jt-digital-world/tree/main/jt-ai-agent", detail: "General-purpose AI workspace source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT AI Core", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-ai-core", detail: "Shared provider and permission architecture source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT Code", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-code", detail: "Coding workspace source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT Design", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-design", detail: "Design workspace source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT Studio", url: owner + "/jt-studio", detail: "Audio workbench with desktop packaging for Windows x64/x86, macOS Intel/Apple Silicon, and Linux x64/ARM64." },
    { name: "JT Motion", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-motion", detail: "Video and motion workspace source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT Cloud", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-cloud", detail: "Project vault workspace source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT Stream", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-stream", detail: "Camera and scene workspace source; included in the central cross-platform workspace artifact workflow." },
    { name: "JT App Manager", url: owner + "/jt-digital-world/tree/main/jt-apps/jt-app-manager", detail: "Product catalogue and update workspace source; included in the central cross-platform workspace artifact workflow." }
  ];

  status.textContent = "11 JT products · this company repository does not publish GitHub Releases. Product sources and verified build histories are linked individually.";
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
    meta.textContent = "The central CI workflow builds JT AI Agent, JT AI Core, JT Code, JT Design, JT Motion, JT Cloud, JT Stream, JT Studio, and JT App Manager for Windows x64/ARM64 plus an x86 build attempt, macOS x64/ARM64, and Linux x64/ARM64. JT Desktop Agent remains Windows-native; Jeff AI and JT Studio have separate product workflows. Only advertise an installer after its exact platform/architecture job succeeds and the artifact is verified. Source archives are not installers.";
  }
})();
