import {readFileSync} from "node:fs";
const html=readFileSync("dist/jt-apps/jt-stream/studio.html","utf8");
const js=readFileSync("dist/jt-apps/jt-stream/studio.js","utf8");
const ids=new Set([...html.matchAll(new RegExp('\\\\bid="([^"]+)"', "g"))].map(match=>match[1]));
const refs=[...new Set([...js.matchAll(new RegExp('\\\\$\\\\("([^"]+)"\\\\)', "g"))].map(match=>match[1]))];
const missing=refs.filter(id=>!ids.has(id));
if(missing.length){console.error("JT Stream Studio references missing element IDs:",missing.join(", "));process.exit(1);}
console.log("JT Stream Studio DOM references verified:",refs.length);
