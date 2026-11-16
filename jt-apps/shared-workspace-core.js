export const VERSION = 1;
export const APPS = ["JT AI Agent","JT AI Core","Agent Jeff","JT App Manager","JT Cloud","JT Code","JT Design","JT Motion","JT Studio","JT Stream"];
export const STORAGE_KEY = "jt.shared-workspace.v1";
export function cleanText(value, max=2000) {
  return typeof value === "string" ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim().slice(0,max) : "";
}
export function createState(input={}) {
  return {
    version: VERSION,
    projects: Array.isArray(input.projects) ? input.projects.slice(0,100) : [],
    handoffs: Array.isArray(input.handoffs) ? input.handoffs.slice(0,200) : [],
    audit: Array.isArray(input.audit) ? input.audit.slice(-300) : []
  };
}
export function validateState(input) {
  if (!input || input.version !== VERSION || !Array.isArray(input.projects) || !Array.isArray(input.handoffs) || !Array.isArray(input.audit)) return createState();
  const projects = input.projects.filter(p => p && typeof p.id === "string" && cleanText(p.name,80)).slice(0,100).map(p => ({
    id:p.id.slice(0,80), name:cleanText(p.name,80), summary:cleanText(p.summary,1200),
    createdAt:typeof p.createdAt==="string"?p.createdAt:"", updatedAt:typeof p.updatedAt==="string"?p.updatedAt:""
  }));
  const handoffs = input.handoffs.filter(h => h && typeof h.id==="string" && APPS.includes(h.sourceApp) && APPS.includes(h.targetApp) && ["pending","approved","declined","completed"].includes(h.status)).slice(0,200).map(h => ({
    id:h.id.slice(0,80), projectId:typeof h.projectId==="string"?h.projectId.slice(0,80):"",
    projectName:cleanText(h.projectName,80), sourceApp:h.sourceApp, targetApp:h.targetApp,
    task:cleanText(h.task,2000), status:h.status,
    createdAt:typeof h.createdAt==="string"?h.createdAt:"",
    updatedAt:typeof h.updatedAt==="string"?h.updatedAt:""
  }));
  const audit = input.audit.filter(x=>x&&typeof x.id==="string"&&typeof x.action==="string").slice(-300).map(x=>({
    id:x.id.slice(0,80), action:cleanText(x.action,40), handoffId:cleanText(x.handoffId,80),
    sourceApp:APPS.includes(x.sourceApp)?x.sourceApp:"", targetApp:APPS.includes(x.targetApp)?x.targetApp:"",
    at:typeof x.at==="string"?x.at:""
  }));
  return {version:VERSION,projects,handoffs,audit};
}
export function transitionHandoff(state, id, nextStatus, actorApp, at=new Date().toISOString()) {
  if (!["approved","declined","completed"].includes(nextStatus)) throw new Error("Unsupported handoff transition.");
  const handoff=state.handoffs.find(item=>item.id===id);
  if (!handoff) throw new Error("Handoff not found.");
  if (actorApp!==handoff.targetApp) throw new Error("Only the selected target app can review this handoff.");
  const allowed = handoff.status==="pending" && ["approved","declined"].includes(nextStatus) || handoff.status==="approved" && nextStatus==="completed";
  if (!allowed) throw new Error("This handoff has already been reviewed or completed.");
  handoff.status=nextStatus; handoff.updatedAt=at;
  state.audit.push({id:"audit-"+id+"-"+nextStatus,action:nextStatus,handoffId:id,sourceApp:handoff.sourceApp,targetApp:handoff.targetApp,at});
  state.audit=state.audit.slice(-300);
  return handoff;
}
export function makeHandoff({id,projectId="",projectName="",sourceApp,targetApp,task,at=new Date().toISOString()}) {
  if (!APPS.includes(sourceApp)||!APPS.includes(targetApp)||sourceApp===targetApp) throw new Error("Choose a different supported JT app.");
  const cleanTask=cleanText(task,2000);
  if (!cleanTask) throw new Error("Add a task before creating the handoff.");
  return {id,projectId,projectName:cleanText(projectName,80),sourceApp,targetApp,task:cleanTask,status:"pending",createdAt:at,updatedAt:at};
}
