import { cp, mkdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "dist");

const publicFiles = [
  "index.html",
  "home.html",
  "about.html",
  "about-app.html",
  "account-settings.html",
  "apps.html",
  "apps-directory-legacy.html",
  "blog.html",
  "download.html",
  "features.html",
  "pricing.html",
  "sandbox.html",
  "signin.html",
  "support.html",
  "modern-ui.css",
  "jt-home-creator.css",
  "jt-creator-pages.css",
  "jt-theme-toggle.css",
  "jt-theme-toggle.js",
  "style.css",
  "script.js",
  "jeff-website-chat.js",
  "release-downloads.js",
  "_headers"
];

const publicDirectories = ["assets", "jt-ai-agent", "jt-apps"];

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const file of publicFiles) {
  const source = path.join(root, file);
  try {
    const info = await stat(source);
    if (info.isFile()) {
      await cp(source, path.join(out, file));
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

for (const directory of publicDirectories) {
  const source = path.join(root, directory);
  try {
    const info = await stat(source);
    if (info.isDirectory()) {
      await cp(source, path.join(out, directory), { recursive: true });
    }
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
}

for (const required of ["index.html", "home.html", "apps.html", "style.css"]) {
  try {
    await stat(path.join(out, required));
  } catch {
    throw new Error(`Required public website file was not copied: ${required}`);
  }
}

console.log(`JT Digital World static site prepared at ${out}`);
await stat(path.join(root, "functions", "api", "jeff.js"));
console.log("Static site prepared. Cloudflare Pages Function source remains at functions/api/jeff.js for Wrangler deployment.");
