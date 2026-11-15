(()=> {
  const form=document.getElementById("jtImageForm"); if(!form)return;
  const prompt=document.getElementById("jtImagePrompt"), generate=document.getElementById("jtImageGenerate"), clear=document.getElementById("jtImageClear"), status=document.getElementById("jtImageStatus"), result=document.getElementById("jtImageResult"), preview=document.getElementById("jtImagePreview"), download=document.getElementById("jtImageDownload");
  let imageDataUrl="";
  clear.addEventListener("click",()=>{prompt.value="";status.textContent="Prompt cleared.";prompt.focus()});
  download.addEventListener("click",()=>{if(!imageDataUrl)return;const link=document.createElement("a");link.href=imageDataUrl;link.download="jt-design-concept-"+new Date().toISOString().replace(/[:.]/g,"-")+".jpg";document.body.append(link);link.click();link.remove()});
  form.addEventListener("submit",async event=>{
    event.preventDefault();const text=prompt.value.trim();
    if(text.length<8||text.length>1200){status.textContent="Enter a description between 8 and 1,200 characters.";return}
    generate.disabled=true;generate.textContent="Generating…";status.textContent="Sending your prompt to the free image model…";result.hidden=true;
    try{
      const response=await fetch("/api/create-image",{method:"POST",headers:{"content-type":"application/json"},credentials:"same-origin",body:JSON.stringify({prompt:text})});
      const data=await response.json().catch(()=>({}));if(!response.ok)throw new Error(data.message||"Image generation is unavailable.");
      if(typeof data.imageDataUrl!=="string"||!data.imageDataUrl.startsWith("data:image/"))throw new Error("The image service returned an invalid result.");
      imageDataUrl=data.imageDataUrl;preview.src=imageDataUrl;result.hidden=false;status.textContent="Image generated · "+(data.model||"Free model");
    }catch(error){status.textContent=error.message||"Image generation failed. No paid provider was used."}
    finally{generate.disabled=false;generate.textContent="Generate image ↗"}
  });
})();
