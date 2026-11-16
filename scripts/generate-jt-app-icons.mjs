import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const out = path.join(root, "desktop", "jt-workspace-shell", "build", "icons");
await mkdir(out, { recursive: true });

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const name = Buffer.from(type);
  const result = Buffer.alloc(12 + data.length);
  result.writeUInt32BE(data.length, 0);
  name.copy(result, 4);
  data.copy(result, 8);
  result.writeUInt32BE(crc32(Buffer.concat([name, data])), 8 + data.length);
  return result;
}
const glyphs = {
  J: ["11111","00100","00100","00100","00100","10100","11100"],
  T: ["11111","11111","00100","00100","00100","00100","00100"]
};
function png(size, accent = [38, 174, 255]) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  const scale = size / 512;
  const round = size * .19;
  const glyphScale = Math.max(1, Math.floor(size / 15));
  const totalWidth = 11 * glyphScale;
  const startX = Math.floor((size - totalWidth) / 2);
  const startY = Math.floor((size - 7 * glyphScale) / 2);
  for (let y = 0; y < size; y++) {
    const row = y * (stride + 1);
    raw[row] = 0;
    for (let x = 0; x < size; x++) {
      const dx = Math.max(round - x, 0, x - (size - 1 - round));
      const dy = Math.max(round - y, 0, y - (size - 1 - round));
      const inside = dx * dx + dy * dy <= round * round || (x >= round && x < size-round) || (y >= round && y < size-round);
      if (!inside) continue;
      const edge = Math.min(x, y, size - 1 - x, size - 1 - y);
      let r = 8, g = 15, b = 37;
      if (edge < Math.max(2, size * .025)) { r = accent[0]; g = accent[1]; b = accent[2]; }
      const t = x / Math.max(1, size - 1);
      const glyphX = x - startX, glyphY = y - startY;
      let letter = false, isJ = false;
      for (let li = 0; li < 2; li++) {
        const offset = li === 0 ? 0 : 6 * glyphScale;
        const gx = glyphX - offset;
        const col = Math.floor(gx / glyphScale), rowIndex = Math.floor(glyphY / glyphScale);
        if (gx >= 0 && col >= 0 && col < 5 && rowIndex >= 0 && rowIndex < 7 && glyphs[li === 0 ? "J" : "T"][rowIndex][col] === "1") { letter = true; isJ = li === 0; break; }
      }
      if (letter) {
        if (isJ) { r = Math.min(255, accent[0] + 40); g = Math.min(255, accent[1] + 45); b = Math.min(255, accent[2] + 30); }
        else { r = 238; g = 246; b = 255; }
      }
      const p = row + 1 + x * 4;
      raw[p] = r; raw[p+1] = g; raw[p+2] = b; raw[p+3] = 255;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]), chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 9 })), chunk("IEND", Buffer.alloc(0))]);
}
const sizes = [16, 24, 32, 48, 64, 128, 256, 512];
const apps = ["jt-ai-agent","jt-ai-core","jt-app-manager","jt-cloud","jt-code","jt-design","jt-motion","jt-studio","jt-stream"];
const palettes = {"jt-ai-agent":[38,174,255],"jt-ai-core":[104,115,255],"jt-app-manager":[39,205,170],"jt-cloud":[40,164,245],"jt-code":[245,166,35],"jt-design":[207,95,255],"jt-motion":[255,103,128],"jt-studio":[45,210,180],"jt-stream":[255,80,110]};
for (const appId of apps) {
  const [accentR, accentG, accentB] = palettes[appId];
  const images = sizes.map(size => png(size, [accentR, accentG, accentB]));
  const icoHeader = Buffer.alloc(6 + images.length * 16);
  icoHeader.writeUInt16LE(0,0); icoHeader.writeUInt16LE(1,2); icoHeader.writeUInt16LE(images.length,4);
  let offset = icoHeader.length;
  images.forEach((img, i) => {
    const pos = 6 + i * 16;
    icoHeader[pos] = sizes[i] === 256 ? 0 : sizes[i];
    icoHeader[pos+1] = sizes[i] === 256 ? 0 : sizes[i];
    icoHeader.writeUInt16LE(1,pos+4); icoHeader.writeUInt16LE(32,pos+6);
    icoHeader.writeUInt32LE(img.length,pos+8); icoHeader.writeUInt32LE(offset,pos+12);
    offset += img.length;
  });
  await writeFile(path.join(out, appId + ".png"), images[7]);
  await writeFile(path.join(out, appId + ".ico"), Buffer.concat([icoHeader, ...images]));
  const payload = images[7];
  const icns = Buffer.alloc(16 + payload.length);
  icns.write("icns",0); icns.writeUInt32BE(icns.length,4);
  icns.write("ic09",8); icns.writeUInt32BE(8 + payload.length,12); payload.copy(icns,16);
  await writeFile(path.join(out, appId + ".icns"), icns);
}
console.log("Generated distinct JT-branded PNG, ICO and ICNS icons for all nine workspaces.");
