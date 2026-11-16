import test from "node:test";
import assert from "node:assert/strict";
import {APPS,makeHandoff,transitionHandoff,validateState,createState} from "../jt-apps/shared-workspace-core.js";
test("handoff is created pending with bounded text",()=>{
 const h=makeHandoff({id:"h1",sourceApp:"JT Code",targetApp:"JT Design",task:"Review the visual direction"});
 assert.equal(h.status,"pending");assert.equal(h.task,"Review the visual direction");
});
test("handoff rejects unsupported or same-app destinations",()=>{
 assert.throws(()=>makeHandoff({id:"h",sourceApp:"JT Code",targetApp:"JT Code",task:"Review"}));
 assert.throws(()=>makeHandoff({id:"h",sourceApp:"Unknown",targetApp:"JT Code",task:"Review"}));
});
test("only target app can approve, decline, and complete",()=>{
 const state=createState();state.handoffs.push(makeHandoff({id:"h2",sourceApp:"JT Code",targetApp:"JT Design",task:"Review"}));
 assert.throws(()=>transitionHandoff(state,"h2","approved","JT Code"),/Only the selected target app/);
 transitionHandoff(state,"h2","approved","JT Design");
 assert.equal(state.handoffs[0].status,"approved");
 transitionHandoff(state,"h2","completed","JT Design");
 assert.equal(state.handoffs[0].status,"completed");
 assert.equal(state.audit.length,2);
});
test("a declined or already reviewed handoff cannot be approved again",()=>{
 const state=createState();state.handoffs.push(makeHandoff({id:"h3",sourceApp:"JT Code",targetApp:"JT Design",task:"Review"}));
 transitionHandoff(state,"h3","declined","JT Design");
 assert.throws(()=>transitionHandoff(state,"h3","approved","JT Design"));
});
test("import validation drops malformed projects and limits task text",()=>{
 const state=validateState({version:1,projects:[{id:"p",name:"Safe",summary:"ok"},{name:"bad"}],handoffs:[],audit:[]});
 assert.equal(state.projects.length,1);
 assert.equal(APPS.includes("Agent Jeff"),true);
});
