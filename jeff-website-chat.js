(()=> {
  const launch=document.getElementById("jeff-launcher");
  const panel=document.getElementById("jeff-chat");
  const close=document.getElementById("jeff-close");
  const form=document.getElementById("jeff-chat-form");
  const input=document.getElementById("jeff-chat-input");
  const body=document.getElementById("jeff-chat-body");
  const status=document.getElementById("jeff-chat-status");
  if(!launch||!panel||!form||!input||!body)return;

  let busy=false;
  let history=[];
  let healthChecked=false;
  const add=(text,kind)=>{
    const el=document.createElement("div");
    el.className="jeff-message "+(kind==="user"?"jeff-user":"jeff-bot");
    el.textContent=text;
    body.appendChild(el);
    body.scrollTop=body.scrollHeight;
    return el;
  };
  const setStatus=(text)=>{
    if(!status)return;
    status.hidden=false;
    status.textContent=text;
  };
  const checkService=async()=>{
    setStatus("Checking Jeff AI connection…");
    try{
      const response=await fetch("/api/jeff",{method:"GET",headers:{accept:"application/json"},cache:"no-store"});
      const data=await response.json();
      if(response.ok&&data.ready){
        setStatus("Connected · J Tech AI Core v1");
        healthChecked=true;
      }else{
        setStatus(data.message||"Jeff AI is not configured on this deployment yet.");
        healthChecked=false;
      }
    }catch(_){
      setStatus("Could not reach the Jeff AI service. Check the website deployment.");
      healthChecked=false;
    }
  };
  const setOpen=(open)=>{
    panel.hidden=!open;
    launch.setAttribute("aria-expanded",String(open));
    if(open){
      setTimeout(()=>input.focus(),30);
      if(!healthChecked)checkService();
    }
  };
  launch.addEventListener("click",()=>setOpen(panel.hidden));
  if(close)close.addEventListener("click",()=>setOpen(false));
  document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden)setOpen(false);});
  input.addEventListener("keydown",e=>{
    if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();}
  });

  form.addEventListener("submit",async e=>{
    e.preventDefault();
    if(busy)return;
    const message=input.value.trim();
    if(!message)return;
    input.value="";
    add(message,"user");
    busy=true;
    setStatus("Jeff AI is thinking…");
    try{
      const response=await fetch("/api/jeff",{
        method:"POST",
        headers:{"Content-Type":"application/json","Accept":"application/json"},
        body:JSON.stringify({message,history})
      });
      let data={};
      try{data=await response.json();}catch(_){}
      if(!response.ok){
        throw new Error(data.message||"Jeff AI could not complete the request. Please try again.");
      }
      const answer=typeof data.reply==="string"?data.reply:typeof data.answer==="string"?data.answer:"";
      if(!answer.trim())throw new Error("Jeff AI returned an empty response. Please try again.");
      history.push({role:"user",content:message},{role:"assistant",content:answer});
      history=history.slice(-20);
      add(answer,"bot");
      setStatus("Connected · "+(data.profile||"J Tech AI Core v1"));
      healthChecked=true;
    }catch(error){
      add(error?.message||"Jeff AI is temporarily unavailable. Please try again.","bot");
      setStatus("Connection issue · check again shortly");
      healthChecked=false;
    }finally{
      busy=false;
      input.focus();
    }
  });
})();