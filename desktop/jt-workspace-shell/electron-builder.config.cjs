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
  extraMetadata: { name: appId, productName, version, main: "main.cjs", jtAppId: appId, homepage: "https://jtdigitalworld.com/" },
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
  linux: { icon: path.join("build", "icons", appId + ".png"), category: "Utility", desktop: { Name: productName, Comment: productName + " by JT Digital World", Categories: "Utility;Development;", StartupWMClass: "world.jtech." + appId }, target: [{ target: "AppImage", arch: [arch] }, { target: "deb", arch: [arch] }, { target: "rpm", arch: [arch] }] },
};
