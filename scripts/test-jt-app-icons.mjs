import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const generated=spawnSync(process.execPath,[path.join(root,"scripts","generate-jt-app-icons.mjs")],{cwd:root,stdio:"inherit"});
if(generated.error)throw generated.error;
if(generated.status!==0)throw new Error("JT app icon generator failed.");
const ids=["jt-ai-agent","jt-ai-core","jt-app-manager","jt-cloud","jt-code","jt-design","jt-motion","jt-studio","jt-stream"];
const dir=path.join(root,"desktop","jt-workspace-shell","build","icons");
for(const id of ids){
 const png=await readFile(path.join(dir,id+".png"));
 const ico=await readFile(path.join(dir,id+".ico"));
 const icns=await readFile(path.join(dir,id+".icns"));
 if(png.subarray(0,8).toString("hex")!=="89504e470d0a1a0a"||png.readUInt32BE(16)!==512||png.readUInt32BE(20)!==512)throw new Error("Invalid PNG icon for "+id);
 if(ico.readUInt16LE(0)!==0||ico.readUInt16LE(2)!==1||ico.readUInt16LE(4)!==8)throw new Error("Invalid multi-resolution ICO for "+id);
 for(let i=0;i<8;i++){const p=6+i*16;const offset=ico.readUInt32LE(p+12);const length=ico.readUInt32LE(p+8);if(offset+length>ico.length||length<32)throw new Error("Invalid ICO image entry for "+id);}
 if(icns.subarray(0,4).toString("ascii")!=="icns"||icns.readUInt32BE(4)!==icns.length||icns.subarray(8,12).toString("ascii")!=="ic09")throw new Error("Invalid ICNS icon for "+id);
}
console.log("Verified nine app-specific PNG, Windows ICO and macOS ICNS icons.");
