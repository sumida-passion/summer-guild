"use strict";

/* ギルドホール「今日のデイリー」掲示板 */
(function(){
  const LEVELS={basic:{label:"基本",gp:3},standard:{label:"標準",gp:5},challenge:{label:"挑戦",gp:7}};
  function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;}
  function learningForestDone(){try{const d=JSON.parse(localStorage.getItem("summerGuildLearningForest")||"{}");return d.dailyBonusDate===todayKey();}catch(_){return false;}}
  function hyakumasuDone(){
    if(typeof getDailyQuestRecord!=="function") return false;
    const record=getDailyQuestRecord("hyakumasu");
    return Boolean(record&&record.firstReward);
  }
  function reviewStatus(){return typeof window.getReviewDailyBonusStatus==="function"?window.getReviewDailyBonusStatus():{math:{},social:{}};}
  function items(){
    const r=reviewStatus();
    const list=[
      {id:"hyakumasu",label:"百ます計算",gp:"10〜16GP",done:hyakumasuDone(),go:()=>typeof startQuest==="function"&&startQuest("hyakumasu")},
      {id:"learning-forest",label:"学びの森",gp:"3GP",done:learningForestDone(),go:()=>typeof changeScreen==="function"&&changeScreen("learningforest")}
    ];
    [["math","算数"],["social","社会"]].forEach(([subject,name])=>{
      Object.entries(LEVELS).forEach(([level,meta])=>{
        const available=!(subject==="social"&&level==="challenge");
        list.push({id:`${subject}-${level}`,label:`${name} ${meta.label}`,gp:`${meta.gp}GP`,done:Boolean(r?.[subject]?.[level]),available,go:()=>window.openReviewDailyTarget?.(subject,level)});
      });
    });
    return list;
  }
  function render(){
    const box=document.getElementById("guildhallDailyList"), progress=document.getElementById("guildhallDailyProgress");
    if(!box||!progress)return false;
    const data=items().filter(x=>x.available), done=data.filter(x=>x.done).length;
    progress.textContent=`${done} / ${data.length}`;
    box.innerHTML=data.map(x=>`<div class="guildhall-daily-item ${x.done?"is-done":""}"><span class="guildhall-daily-check" aria-hidden="true">${x.done?"✓":"□"}</span><span class="guildhall-daily-name">${x.label}</span><span class="guildhall-daily-gp">${x.done?"獲得済み":x.gp}</span>${x.done?'<span class="guildhall-daily-complete">完了</span>':`<button type="button" data-daily-go="${x.id}">GO</button>`}</div>`).join("");
    box.querySelectorAll("[data-daily-go]").forEach(btn=>btn.addEventListener("click",()=>items().find(x=>x.id===btn.dataset.dailyGo)?.go()));
    return true;
  }
  function handleScreenChange(name){if(name==="guildhall")render();}
  document.addEventListener("DOMContentLoaded",render);
  window.DailyDashboard={render,handleScreenChange};
})();
