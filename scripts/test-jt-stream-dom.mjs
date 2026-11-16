import {readFileSync} from "node:fs";
const html=readFileSync("jt-apps/jt-stream/studio.html","utf8");
const js=readFileSync("jt-apps/jt-stream/studio.js","utf8");
const ids=new Set([...html.matchAll(/id="([^"]+)"/g)].map(match=>match[1]));
const refs=[...new Set([...js.matchAll(/\$\("([^"]+)"\)/g)].map(match=>match[1]))];
const missing=refs.filter(id=>!ids.has(id));
if(missing.length){console.error("JT Stream Studio references missing element IDs:",missing.join(", "));process.exit(1);}
console.log("JT Stream Studio DOM references verified:",refs.length);
