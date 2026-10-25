"use strict";
const { app, BrowserWindow, Menu, dialog, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const BUILD_METADATA = require("./package.json");
const APP_ID = process.env.JT_APP_ID || BUILD_METADATA.jtAppId || "jt-studio";
const APP_LABELS = {
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
const APP_LABEL = APP_LABELS[APP_ID];
if (!APP_LABEL) throw new Error("Unknown JT app ID. Refusing to launch an unregistered workspace.");

const APP_PATHS = {
  "jt-ai-agent": "/jt-ai-agent/index.html",
  "jt-ai-core": "/jt-apps/jt-ai-core/index.html",
  "jt-app-manager": "/jt-apps/jt-app-manager/index.html",
  "jt-cloud": "/jt-apps/jt-cloud/index.html",
  "jt-code": "/jt-apps/jt-code/index.html",
  "jt-design": "/jt-apps/jt-design/index.html",
  "jt-motion": "/jt-apps/jt-motion/index.html",
  "jt-studio": "/jt-apps/jt-studio/index.html",
  "jt-stream": "/jt-apps/jt-stream/index.html"
};
const MIME = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".webp": "image/webp", ".ico": "image/x-icon", ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8", ".webmanifest": "application/manifest+json"
};
let server;
let baseUrl;
const siteRoot = app.isPackaged
  ? path.join(process.resourcesPath, "site")
  : path.resolve(__dirname, "../../dist");

function safeFilePath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath.split("?")[0]); } catch { return null; }
  const relative = decoded.replace(/^\/+/, "") || "index.html";
  const root = path.resolve(siteRoot);
  const resolved = path.resolve(root, relative);
  if (resolved !== root && !resolved.startsWith(root + path.sep)) return null;
  return resolved;
}

function startLocalServer() {
  return new Promise((resolve, reject) => {
    server = http.createServer((req, res) => {
      const pathname = new URL(req.url, "http://127.0.0.1").pathname;
      const filePath = safeFilePath(pathname);
      if (!filePath) { res.writeHead(400); res.end("Bad path"); return; }
      fs.stat(filePath, (statError, stat) => {
        if (statError || !stat.isFile()) { res.writeHead(404); res.end("JT workspace file not found"); return; }
        const headers = { "Content-Type": MIME[path.extname(filePath).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" };
        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
      });
    });
    server.on("error", reject);
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      baseUrl = "http://127.0.0.1:" + address.port;
      resolve();
    });
  });
}

async function openExternalSafely(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") await shell.openExternal(parsed.href);
  } catch { /* Ignore malformed or unsupported protocols. */ }
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1440, height: 920, minWidth: 900, minHeight: 620,
    title: APP_LABEL + " · JT Digital World",
    backgroundColor: "#f5f7ff",
    autoHideMenuBar: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  });
  win.webContents.setWindowOpenHandler(({ url }) => { void openExternalSafely(url); return { action: "deny" }; });
  win.webContents.on("will-navigate", (event, url) => {
    if (!baseUrl || url.startsWith(baseUrl + "/") || url === baseUrl) return;
    event.preventDefault();
    void openExternalSafely(url);
  });
  win.loadURL(baseUrl + APP_PATHS[APP_ID]);
  return win;
}

app.whenReady().then(async () => {
  if (!fs.existsSync(siteRoot)) {
    await dialog.showMessageBox({ type: "error", title: "JT workspace files missing", message: "The bundled JT website files were not found.", detail: "Reinstall this app using the official setup package, or build the website first for development." });
    app.quit(); return;
  }
  await startLocalServer();
  Menu.setApplicationMenu(Menu.buildFromTemplate([
    { label: "JT", submenu: [
      { label: "Reload workspace", accelerator: "CmdOrCtrl+R", click: () => BrowserWindow.getFocusedWindow()?.webContents.reload() },
      { label: "Open JT Digital World website", click: () => void openExternalSafely("https://jtdigitalworld.com/") },
      { type: "separator" },
      { label: "Repair / reinstall help", click: () => dialog.showMessageBox({ type: "info", title: "Repair " + APP_LABEL, message: "To repair this installation, download the latest official setup package for this app and run it again. The installer replaces application files without intentionally deleting your local browser data.", detail: "Windows: run the matching Setup .exe. macOS: mount the official .dmg and replace the app. Linux: reinstall the matching AppImage, .deb, or .rpm. Back up important local data first." }) },
      { label: "About " + APP_LABEL, click: () => dialog.showMessageBox({ type: "info", title: APP_LABEL, message: APP_LABEL + " for JT Digital World", detail: "Desktop wrapper for the JT browser workspace. Online AI and account services require their configured endpoints and are not made local by this wrapper." }) },
      { role: "quit", label: "Quit" }
    ] },
    { label: "Edit", submenu: [{ role: "undo" }, { role: "redo" }, { type: "separator" }, { role: "cut" }, { role: "copy" }, { role: "paste" }, { role: "selectAll" }] },
    { label: "View", submenu: [{ role: "reload" }, { role: "toggleDevTools" }, { type: "separator" }, { role: "resetZoom" }, { role: "zoomIn" }, { role: "zoomOut" }, { role: "togglefullscreen" }] },
    { label: "Help", submenu: [{ label: "Official downloads and releases", click: () => void openExternalSafely("https://github.com/Tech-guy7-sys/jt-digital-world/releases") }] }
  ]));
  createWindow();
  app.on("activate", () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
}).catch(async error => {
  await dialog.showErrorBox("JT workspace could not start", String(error?.stack || error));
  app.quit();
});

app.on("window-all-closed", () => { if (process.platform !== "darwin") app.quit(); });
app.on("before-quit", () => { if (server) server.close(); });
