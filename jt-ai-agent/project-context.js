const LIMIT=4000;
function clean(value,max=4000){return typeof value==='string'?value.replace(/[\\u0000-\\u0008\\u000b\\u000c\\u000e-\\u001f\\u007f]/g,'').trim().slice(0,max):'';}
export function buildProjectContext({manualContext='',project=null}={}){
 const parts=[];
 const manual=clean(manualContext);
 if(manual)parts.push('Saved JT AI Agent brief:\\n'+manual);
 if(project&&typeof project==='object'&&typeof project.name==='string'){
  const name=clean(project.name,80);
  const summary=clean(project.summary,1200);
  const notes=Array.isArray(project.notes)?project.notes.slice(-30).filter(n=>n&&typeof n.text==='string').map(n=>'- ['+clean(n.authorApp,40)+'] '+clean(n.text,1500)): [];
  parts.push('Shared JT project: '+name+'\\nSummary: '+summary+'\\nProject notes:\\n'+(notes.join('\\n')||'No notes yet.'));
 }
 return parts.join('\\n\\n').slice(0,LIMIT);
}
