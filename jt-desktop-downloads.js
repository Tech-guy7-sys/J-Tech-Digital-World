(() => {
  "use strict";
  const status = document.getElementById("jt-desktop-release-status");
  const container = document.getElementById("jt-desktop-release-apps");
  const meta = document.getElementById("jt-desktop-release-meta");
  if (!status || !container) return;

  const apps = [
    "JT AI Core", "JT App Manager", "JT Cloud", "JT Code",
    "JT Design", "JT Motion", "JT Studio", "JT Stream"
  ];
  const releasePage = "https://github.com/Tech-guy7-sys/jt-digital-world/releases";

  function link(label, url) {
    const a = document.createElement("a");
    a.href = url;
    a.textContent = label;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    return a;
  }

  function labelFor(platform, arch, ext) {
    const cpu = arch === "arm64" ? "ARM64" : arch === "x64" ? "x64 / AMD64" : arch;
    if (ext === ".exe") return "Windows " + cpu + " · Setup";
    if (ext === ".dmg") return "macOS " + (arch === "arm64" ? "Apple Silicon" : "Intel") + " · DMG";
    if (ext === ".AppImage") return "Linux " + cpu + " · AppImage";
    if (ext === ".deb") return "Linux " + cpu + " · DEB";
    if (ext === ".rpm") return "Linux " + cpu + " · RPM";
    if (ext === ".zip" && platform === "win") return "Windows " + cpu + " · Portable ZIP";
    if (ext === ".zip" && platform === "mac") return "macOS " + (arch === "arm64" ? "Apple Silicon" : "Intel") + " · ZIP";
    if (ext === ".zip" && platform === "linux") return "Linux " + cpu + " · ZIP";
    return platform + " " + cpu + " · " + ext.slice(1).toUpperCase();
  }

  async function load() {
    try {
      const response = await fetch("https://api.github.com/repos/Tech-guy7-sys/jt-digital-world/releases?per_page=50", {
        headers: { Accept: "application/vnd.github+json" }, cache: "no-store"
      });
      if (!response.ok) throw new Error("GitHub release lookup returned " + response.status);
      const releases = await response.json();
      const release = releases
        .filter(item => !item.draft && /^jt-desktop-v\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(item.tag_name))
        .sort((a, b) => Date.parse(b.published_at || b.created_at) - Date.parse(a.published_at || a.created_at))[0];

      if (!release) {
        status.textContent = "No native desktop installer release has been published yet. Existing JT workspace ZIPs are browser-workspace bundles, not setup installers. This section will show desktop packages after the build matrix succeeds and a release is published.";
        container.replaceChildren();
        if (meta) meta.textContent = "Current architecture plan: Windows x64/ARM64, macOS Intel/Apple Silicon, and Linux x64/ARM64. A 32-bit x86 package is not offered by this Electron toolchain.";
        return;
      }

      const assets = Array.isArray(release.assets) ? release.assets : [];
      const checksumAssets = assets.filter(asset => /SHA256SUMS[^/]*\.txt$/i.test(asset.name));
      const packageAssets = assets.filter(asset => /\.(exe|zip|dmg|AppImage|deb|rpm)$/i.test(asset.name));
      const normalized = packageAssets.map(asset => {
        const match = asset.name.match(/^jt-desktop-(win|mac|linux)-(x64|arm64)-(.+)$/i);
        if (!match) return null;
        return { asset, platform: match[1].toLowerCase(), arch: match[2].toLowerCase(), name: match[3] };
      }).filter(Boolean);

      status.textContent = "JT desktop " + release.tag_name.replace(/^jt-desktop-v/, "") + " · published " +
        new Date(release.published_at || release.created_at).toLocaleDateString() +
        " · " + normalized.length + " platform packages";
      container.replaceChildren();

      for (const appName of apps) {
        const card = document.createElement("article");
        card.className = "jt-release-app";
        const title = document.createElement("h3");
        title.textContent = appName;
        const links = document.createElement("div");
        links.className = "jt-release-links";
        const matches = normalized.filter(item => item.name.toLowerCase().startsWith(appName.toLowerCase() + "-"));
        matches.sort((a, b) => a.platform.localeCompare(b.platform) || a.arch.localeCompare(b.arch) || a.asset.name.localeCompare(b.asset.name));
        for (const item of matches) {
          const extMatch = item.name.match(/\.(exe|zip|dmg|AppImage|deb|rpm)$/i);
          if (extMatch) links.append(link(labelFor(item.platform, item.arch, "." + extMatch[1]), item.asset.browser_download_url));
        }
        if (!matches.length) {
          const empty = document.createElement("p");
          empty.textContent = "No package for this app in this release.";
          card.append(title, empty);
        } else {
          card.append(title, links);
        }
        container.append(card);
      }

      if (checksumAssets.length) {
        const checksumCard = document.createElement("article");
        checksumCard.className = "jt-release-app";
        const title = document.createElement("h3");
        title.textContent = "Verify your downloads";
        const links = document.createElement("div");
        links.className = "jt-release-links";
        checksumAssets.forEach(asset => {
          const platformLabel = asset.name.replace(/^jt-desktop-/, "").replace(/-SHA256SUMS\.txt$/i, "").replace(/-/g, " ");
          links.append(link("SHA-256 · " + platformLabel, asset.browser_download_url));
        });
        checksumCard.append(title, links);
        container.append(checksumCard);
      }

      if (meta) {
        meta.replaceChildren(document.createTextNode("Release: " + release.tag_name + ". Unsigned packages may trigger operating-system warnings. Checksums detect file changes but do not prove publisher identity. "));
        meta.append(link("Open complete release notes ↗", release.html_url || releasePage));
      }
    } catch {
      status.textContent = "Could not check the live release list. Open the official GitHub Releases page to inspect published assets.";
      container.replaceChildren();
      if (meta) meta.replaceChildren(link("Open official releases ↗", releasePage));
    }
  }

  load();
})();