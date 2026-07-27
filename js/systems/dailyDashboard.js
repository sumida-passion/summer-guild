"use strict";

/* ギルドホール「今日のデイリー」掲示板 */
(function(){
  const COMPLETE_KEY="summerGuildDailyCompleteV1";
  const COMPLETE_GP=5;
  const LEVELS={basic:{label:"基本",gp:"1〜6"},standard:{label:"標準",gp:"2〜7"},challenge:{label:"挑戦",gp:"3〜8"}};

  function todayKey(){
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  }
  function learningForestDone(){
    try{
      const d=JSON.parse(localStorage.getItem("summerGuildLearningForest")||"{}");
      return d.dailyBonusDate===todayKey();
    }catch(_){return false;}
  }
  function hyakumasuDone(){
    if(typeof getDailyQuestRecord!=="function") return false;
    const record=getDailyQuestRecord("hyakumasu");
    return Boolean(record&&record.firstReward);
  }
  function reviewStatus(){
    return typeof window.getReviewDailyBonusStatus==="function"
      ? window.getReviewDailyBonusStatus()
      : {math:{},social:{}};
  }
  function items(){
    const r=reviewStatus();
    return [
      {id:"hyakumasu",label:"百ます計算",gp:"10〜16GP",done:hyakumasuDone(),go:()=>typeof startQuest==="function"&&startQuest("hyakumasu")},
      {id:"learning-forest",label:"学びの森",gp:"3GP",done:learningForestDone(),go:()=>typeof changeScreen==="function"&&changeScreen("learningforest")},
      {id:"math-basic",label:"算数 基本",gp:"1〜6GP",done:Boolean(r?.math?.basic),go:()=>window.openReviewDailyTarget?.("math","basic")},
      {id:"math-standard",label:"算数 標準",gp:"2〜7GP",done:Boolean(r?.math?.standard),go:()=>window.openReviewDailyTarget?.("math","standard")},
      {id:"math-challenge",label:"算数 挑戦",gp:"3〜8GP",done:Boolean(r?.math?.challenge),go:()=>window.openReviewDailyTarget?.("math","challenge")},
      {id:"social-basic",label:"社会 基本",gp:"1〜6GP",done:Boolean(r?.social?.basic),go:()=>window.openReviewDailyTarget?.("social","basic")},
      {id:"social-standard",label:"社会 標準",gp:"2〜7GP",done:Boolean(r?.social?.standard),go:()=>window.openReviewDailyTarget?.("social","standard")}
    ];
  }
  function loadComplete(){
    try{return JSON.parse(localStorage.getItem(COMPLETE_KEY)||"{}");}
    catch(_){return {};}
  }
  function showCompletePopup(){
    let overlay=document.getElementById("dailyCompleteOverlay");
    if(!overlay){
      overlay=document.createElement("div");
      overlay.id="dailyCompleteOverlay";
      overlay.className="daily-complete-overlay";
      overlay.innerHTML=`<section class="daily-complete-dialog" role="dialog" aria-modal="true" aria-labelledby="dailyCompleteTitle">
        <div class="daily-complete-stars" aria-hidden="true">🎉</div>
        <h2 id="dailyCompleteTitle">デイリーコンプリート！</h2>
        <p>コンプリートボーナス</p>
        <strong>＋5GP</strong>
        <button type="button">受け取る</button>
      </section>`;
      overlay.querySelector("button").addEventListener("click",()=>overlay.remove());
      overlay.addEventListener("click",(e)=>{if(e.target===overlay)overlay.remove();});
      document.body.appendChild(overlay);
    }
  }
  function claimCompleteIfNeeded(data){
    if(data.length!==7 || !data.every(x=>x.done)) return false;
    const state=loadComplete(), today=todayKey();
    if(state.date===today) return false;
    if(typeof addGp!=="function") return false;
    addGp(COMPLETE_GP);
    localStorage.setItem(COMPLETE_KEY,JSON.stringify({date:today,claimedAt:new Date().toISOString(),gp:COMPLETE_GP}));
    if(typeof refreshGameDisplays==="function") refreshGameDisplays();
    showCompletePopup();
    return true;
  }
  function render(){
    const box=document.getElementById("guildhallDailyList");
    const progress=document.getElementById("guildhallDailyProgress");
    if(!box||!progress)return false;
    const data=items();
    const done=data.filter(x=>x.done).length;
    progress.textContent=`${done} / 7`;
    box.scrollTop=0;
    box.innerHTML=data.map(x=>`<div class="guildhall-daily-item ${x.done?"is-done":""}">
      <span class="guildhall-daily-check" aria-hidden="true">${x.done?"✓":"□"}</span>
      <span class="guildhall-daily-name">${x.label}</span>
      <span class="guildhall-daily-gp">${x.done?"獲得済み":x.gp}</span>
      ${x.done?'<span class="guildhall-daily-complete">完了</span>':`<button type="button" data-daily-go="${x.id}">GO</button>`}
    </div>`).join("");
    box.querySelectorAll("[data-daily-go]").forEach(btn=>btn.addEventListener("click",()=>data.find(x=>x.id===btn.dataset.dailyGo)?.go()));
    claimCompleteIfNeeded(data);
    return true;
  }
  function handleScreenChange(name){if(name==="guildhall")render();}
  document.addEventListener("DOMContentLoaded",render);
  window.DailyDashboard={render,handleScreenChange};
})();
