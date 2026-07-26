"use strict";

/* ギルド本部からの重要な知らせだけを届ける伝令 */
(function(){
  function settings(){return typeof Settings!=="undefined"?Settings:null;}
  function notices(){const s=settings();if(!s)return[];s.furniture=s.furniture||{items:{}};s.furniture.pendingNotices=Array.isArray(s.furniture.pendingNotices)?s.furniture.pendingNotices:[];return s.furniture.pendingNotices;}
  function refresh(){const owl=document.getElementById("owlMessenger");if(!owl)return;const visible=notices().length>0;owl.hidden=!visible;owl.setAttribute("aria-hidden",visible?"false":"true");}
  function showNotice(){const list=notices();if(!list.length)return refresh();const notice=list[0];
    let overlay=document.getElementById("owlLetterOverlay");if(!overlay){overlay=document.createElement("div");overlay.id="owlLetterOverlay";overlay.className="owl-letter-overlay";document.getElementById("room-screen")?.appendChild(overlay);}
    overlay.innerHTML=`<section class="owl-letter" role="dialog" aria-modal="true" aria-labelledby="owlLetterTitle"><p class="owl-letter-seal">GUILD LETTER</p><h2 id="owlLetterTitle">${escapeHtml(notice.title||"ギルド本部より、手紙が届いています。")}</h2><p>${escapeHtml(notice.body||"").replace(/\n/g,"<br>")}</p><button type="button" id="receiveOwlLetter">受け取る</button></section>`;
    overlay.hidden=false;document.getElementById("receiveOwlLetter")?.addEventListener("click",()=>{list.shift();if(typeof saveSettings==="function")saveSettings();overlay.hidden=true;refresh();});
  }
  function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
  function handleScreenChange(name){if(name==="room")refresh();}
  document.addEventListener("DOMContentLoaded",()=>{document.getElementById("owlMessenger")?.addEventListener("click",showNotice);refresh();});
  window.OwlMessenger={refresh,handleScreenChange};
})();
