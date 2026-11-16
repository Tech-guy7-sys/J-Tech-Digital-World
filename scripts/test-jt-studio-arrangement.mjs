import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
const source=await readFile(new URL("../jt-apps/pro-workspaces.js",import.meta.url),"utf8");
test("JT Studio has an arrangement-specific DAW layout with bar ruler and track lanes",()=>{
 assert.match(source,/JT Studio · arrangement workspace/);
 assert.match(source,/jt-studio-ruler/);
 assert.match(source,/jt-studio-lane/);
 assert.match(source,/Song timeline/);
 assert.match(source,/Track type/);
});
test("JT Studio can create sections, place parts, and reposition arrangement blocks",()=>{
 assert.match(source,/section-add/);
 assert.match(source,/placement-add/);
 assert.match(source,/placement-left/);
 assert.match(source,/placement-right/);
 assert.match(source,/placement-delete/);
 assert.match(source,/Session and arrangement saved in this browser/);
});
test("JT Studio includes BPM metronome and explicit local microphone recording controls",()=>{
 assert.match(source,/metro-start/);
 assert.match(source,/setInterval\(clickBeat,60000\/s\.bpm\)/);
 assert.match(source,/getUserMedia\(\{audio:true\}\)/);
 assert.match(source,/new MediaRecorder\(micStream\)/);
 assert.match(source,/jt-studio-take\.webm/);
});
test("JT Studio accurately labels arrangement blocks as planning cues, not rendered audio",()=>{
 assert.match(source,/does not yet mix or render multitrack audio/);
 assert.match(source,/not an audio waveform/);
});
