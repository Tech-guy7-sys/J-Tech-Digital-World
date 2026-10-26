import { spawnSync } from "node:child_process";
import { mkdir, readdir, copyFile, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shellDir = path.join(root, "desktop", "jt-workspace-shell");
const outputDir = path.join(root, "release-assets");
const apps = ["jt-ai-agent", "jt-ai-core", "jt-app-manager", "jt-cloud", "jt-code", "jt-design", "jt-motion", "jt-studio", "jt-stream"];
const platform = process.env.JT_PLATFORM || (process.platform === "win32" ? "win" : process.platform === "darwin" ? "mac" : "linux");
const arch = process.env.JT_ARCH || "x64";
const version = (process.env.JT_RELEASE_VERSION || "1.0.0").replace(/^v/, "");
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(version)) throw new Error("JT_RELEASE_VERSION must be a semantic version such as 1.2.3.");
if (!["win", "mac", "linux"].includes(platform)) throw new Error("JT_PLATFORM must be win, mac, or linux.");
if (!["x64", "arm64"].includes(arch) && !(platform === "win" && arch === "ia32")) throw new Error("Unsupported platform/architecture combination. Windows supports x64, ARM64, and legacy x86 with Electron 43; macOS/Linux targets are x64 or ARM64.");
await mkdir(outputDir, { recursive: true });
const electronBuilder = path.join(shellDir, "node_modules", "electron-builder", "cli.js");
const targets = platform === "win" ? ["nsis", "zip"] : platform === "mac" ? ["dmg", "zip"] : ["AppImage", "deb", "rpm", "zip"];
for (const appId of apps) {
  console.log("\n=== Packaging " + appId + " for " + platform + "/" + arch + " ===");
  const args = [electronBuilder, "--config", "electron-builder.config.cjs", "--" + platform, ...targets, "--" + arch, "--publish=never"];
  const result = spawnSync(process.execPath, args, {
    cwd: shellDir, stdio: "inherit",
    env: { ...process.env, JT_APP_ID: appId, JT_ARCH: arch, JT_RELEASE_VERSION: version }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error("electron-builder failed for " + appId + " (" + platform + "/" + arch + "), exit " + result.status);
  const config = await import("node:fs/promises").then(fs => fs.readdir(path.join(root, "release-desktop", appId, process.platform + "-" + arch)));
  const candidates = config.filter(name => /\.(exe|zip|dmg|AppImage|deb|rpm)$/i.test(name));
  if (!candidates.length) throw new Error("No installer/archive output found for " + appId);
  for (const name of candidates) {
    const source = path.join(root, "release-desktop", appId, process.platform + "-" + arch, name);
    const targetName = name.replace(/\.(exe|zip|dmg|AppImage|deb|rpm)$/i, "") + "." + name.split(".").pop();
    await copyFile(source, path.join(outputDir, targetName));
  }
}
const files = (await readdir(outputDir)).filter(name => /\.(exe|zip|dmg|AppImage|deb|rpm)$/i.test(name)).sort();
const manifest = [];
for (const file of files) {
  const bytes = await readFile(path.join(outputDir, file));
  manifest.push(createHash("sha256").update(bytes).digest("hex") + "  " + file);
}
await writeFile(path.join(outputDir, "SHA256SUMS.txt"), manifest.join("\n") + "\n");
await writeFile(path.join(outputDir, "BUILD-METADATA.txt"), [
  "J Tech Digital World desktop workspace build (artifact only)",
  "Version: " + version,
  "Platform: " + platform,
  "Architecture: " + arch,
  "Workspaces: " + apps.join(", "),
  "Built at: " + new Date().toISOString(),
  "Artifact-only CI output. No GitHub Release is created. Unsigned builds; verify checksums before use."
].join("\n") + "\n");
console.log("\nProduced " + files.length + " packages and SHA-256 manifest in " + outputDir);
