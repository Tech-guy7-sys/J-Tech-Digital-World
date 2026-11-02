(()=> {
  if(document.getElementById("jeff-launcher"))return;
  const style=document.createElement("style");
  style.textContent=`
    .jeff-launcher{position:fixed;right:24px;bottom:24px;z-index:9998;border:0;border-radius:999px;padding:14px 19px;background:linear-gradient(110deg,#b4a2ff,#70e3d9);color:#10121b;font:800 13px Manrope,Arial,sans-serif;box-shadow:0 12px 36px #0006;cursor:pointer}
    .jeff-chat{position:fixed;right:24px;bottom:88px;z-index:9999;width:min(390px,calc(100vw - 28px));height:min(570px,calc(100dvh - 120px));display:flex;flex-direction:column;border:1px solid #45415f;border-radius:19px;background:#10111c;color:#f4f3ff;box-shadow:0 24px 80px #0009;overflow:hidden;font-family:Arial,sans-serif}
    .jeff-chat[hidden]{display:none}
    .jeff-chat-head{display:flex;align-items:center;justify-content:space-between;padding:15px 17px;border-bottom:1px solid #303047;background:#171827}
    .jeff-chat-brand{display:flex;align-items:center;gap:10px}.jeff-chat-mark{display:grid;place-items:center;width:36px;height:36px;border-radius:11px;background:linear-gradient(120deg,#b4a2ff,#70e3d9);color:#11131b;font-weight:900}
    .jeff-chat-brand strong{display:block;font-size:13px}.jeff-chat-brand small{display:block;margin-top:3px;color:#a6a6bd;font-size:10px}
    .jeff-chat-close{border:0;background:transparent;color:#c9c8db;font-size:24px;cursor:pointer}
    .jeff-chat-status{padding:8px 16px;color:#82dfd3;font-size:10px;border-bottom:1px solid #292a3c}
    .jeff-chat-body{flex:1;overflow:auto;padding:14px;display:flex;flex-direction:column;gap:10px}
    .jeff-message{max-width:90%;padding:11px 13px;border-radius:13px;font-size:12px;line-height:1.6;white-space:pre-wrap;overflow-wrap:anywhere}
    .jeff-user{align-self:flex-end;background:#34304f;color:#fff;border-bottom-right-radius:4px}
    .jeff-bot{align-self:flex-start;background:#1d2030;color:#e7e6f3;border:1px solid #303249;border-bottom-left-radius:4px}
    .jeff-chat-form{padding:12px;border-top:1px solid #303047;display:flex;gap:8px}
    .jeff-chat-input{min-width:0;flex:1;resize:none;max-height:100px;border:1px solid #41415a;border-radius:11px;background:#171827;color:#fff;padding:11px;font:12px Arial,sans-serif;outline:none}
    .jeff-chat-input:focus{border-color:#8e83d8}.jeff-chat-send{border:0;border-radius:11px;padding:0 15px;background:#8e83d8;color:#10111c;font-weight:900;cursor:pointer}
    .jeff-chat-note{padding:0 14px 10px;color:#777991;font-size:9px;line-height:1.5}
    @media(max-width:520px){.jeff-launcher{right:14px;bottom:14px}.jeff-chat{right:10px;bottom:76px;width:calc(100vw - 20px);height:min(600px,calc(100dvh - 96px))}}
  `;
  document.head.appendChild(style);
  const launcher=document.createElement("button");
  launcher.id="jeff-launcher";launcher.className="jeff-launcher";launcher.type="button";launcher.textContent="✦ Chat with Jeff AI";launcher.setAttribute("aria-expanded","false");launcher.setAttribute("aria-controls","jeff-chat");
  const panel=document.createElement("section");
  panel.id="jeff-chat";panel.className="jeff-chat";panel.hidden=true;panel.setAttribute("aria-label","Jeff AI chat");
  panel.innerHTML=`
    <header class="jeff-chat-head"><div class="jeff-chat-brand"><span class="jeff-chat-mark">JT</span><span><strong>Jeff AI</strong><small>J Tech AI Core v1 · OpenRouter</small></span></div><button class="jeff-chat-close" id="jeff-close" type="button" aria-label="Close chat">×</button></header>
    <div class="jeff-chat-status" id="jeff-chat-status" role="status">Checking service when opened…</div>
    <div class="jeff-chat-body" id="jeff-chat-body" aria-live="polite"><div class="jeff-message jeff-bot">Hello! I'm Jeff AI. Ask me about J Tech Digital World or try a question to test the live AI connection.</div></div>
    <form class="jeff-chat-form" id="jeff-chat-form"><textarea class="jeff-chat-input" id="jeff-chat-input" rows="1" maxlength="4000" placeholder="Message Jeff AI…" aria-label="Message Jeff AI"></textarea><button class="jeff-chat-send" type="submit" aria-label="Send message">↑</button></form>
    <div class="jeff-chat-note">AI responses may be inaccurate. Do not send passwords, API keys, or other private information.</div>`;
  document.body.append(launcher,panel);
  const script=document.createElement("script");script.src="/jeff-website-chat.js";script.defer=true;document.body.appendChild(script);
})();