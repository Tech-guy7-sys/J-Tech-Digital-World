const path = require("node:path");
const apps = {
  "jt-ai-agent": "JT AI Agent",
  "jt-ai-core": "JT AI Core",
  "jt-app-manager": "JT App Manager",
  "jt-cloud": "JT Cloud",
  "jt-code": "JT Code",
  "jt-design": "JT Design",
  "jt-motion": "JT Motion",
  "jt-studio": "JT Studio",
  "jt-stream": "JT Stream"
};
const appId = process.env.JT_APP_ID;
const productName = apps[appId];
const descriptions = {"jt-ai-agent":"Research, writing, coding and project workspace","jt-ai-core":"Shared JT AI provider and permission core","jt-app-manager":"JT application catalogue and update workspace","jt-cloud":"JT project and file workspace","jt-code":"JT coding and development workspace","jt-design":"JT visual design workspace","jt-motion":"JT motion and storyboard workspace","jt-studio":"JT audio production workspace","jt-stream":"JT camera, scene and recording workspace"};
const linuxCategories = {"jt-ai-agent":"Office;Utility;","jt-ai-core":"Utility;","jt-app-manager":"Utility;","jt-cloud":"Network;FileTransfer;","jt-code":"Development;IDE;","jt-design":"Graphics;","jt-motion":"AudioVideo;Video;","jt-studio":"AudioVideo;Audio;","jt-stream":"AudioVideo;Video;"};
if (!productName) throw new Error("Set JT_APP_ID to a supported JT workspace slug.");
const version = (process.env.JT_RELEASE_VERSION || "1.0.0").replace(/^v/, "");
const arch = process.env.JT_ARCH || process.arch;
module.exports = {
  appId: "world.jtech." + appId,
  productName,
  artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
  directories: { buildResources: path.join(__dirname, "build"), output: path.resolve(__dirname, "../../release-desktop", appId, process.platform + "-" + arch) },
  files: ["main.cjs", "package.json", "build/icons/*.png"],
  extraResources: [{ from: path.resolve(__dirname, "../../dist"), to: "site", filter: ["**/*"] }],
  extraMetadata: { name: appId, productName, version, description: descriptions[appId], main: "main.cjs", jtAppId: appId, homepage: "https://jtdigitalworld.com/", author: "J Tech Digital World" },
  asar: true,
  compression: "maximum",
  publish: null,
  win: { icon: path.join("build", "icons", appId + ".ico"), requestedExecutionLevel: "asInvoker", target: [{ target: "nsis", arch: [arch] }, { target: "zip", arch: [arch] }] },
  nsis: {
    oneClick: false, perMachine: false, allowToChangeInstallationDirectory: true,
    installerIcon: path.join("build", "icons", appId + ".ico"), uninstallerIcon: path.join("build", "icons", appId + ".ico"), installerHeaderIcon: path.join("build", "icons", appId + ".ico"),
    createDesktopShortcut: true, createStartMenuShortcut: true, shortcutName: productName,
    deleteAppDataOnUninstall: false, differentialPackage: false
  },
  mac: { icon: path.join("build", "icons", appId + ".icns"), category: "public.app-category.productivity", target: [{ target: "dmg", arch: [arch] }, { target: "zip", arch: [arch] }] },
  linux: { icon: path.join("build", "icons", appId + ".png"), category: "Utility", target: [{ target: "AppImage", arch: [arch] }, { target: "deb", arch: [arch] }, { target: "rpm", arch: [arch] }] },
};
