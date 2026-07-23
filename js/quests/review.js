"use strict";

/* ふりかえりの修行：教科→単元→難易度を自由に選ぶデイリー復習 */
const REVIEW_DAILY_KEY = "summerGuildReviewDailyV1";
const REVIEW_HISTORY_KEY = "summerGuildReviewHistoryV1";
const REVIEW_FIRST_BONUS = 2;

const REVIEW_LEVELS = {
  basic: { label: "基礎", speed: [120, 240] },
  standard: { label: "標準", speed: [180, 360] },
  challenge: { label: "挑戦", speed: [240, 480] }
};

const REVIEW_QUESTIONS = {
  unit_average: {
    title: "単位量・平均",
    questions: {
      basic: [
        { q: "5個のみかんの重さは合計600gです。1個の平均は何gですか。", a: 120, unit: "g", why: "平均＝合計÷個数。600÷5＝120" },
        { q: "4本のリボンの長さの合計は300cmです。1本の平均は何cmですか。", a: 75, unit: "cm", why: "300÷4＝75" },
        { q: "1個の平均が80gのりんごが6個あります。合計は何gですか。", a: 480, unit: "g", why: "合計＝平均×個数。80×6＝480" },
        { q: "1Lのガソリンで15km走る車があります。4Lでは何km走れますか。", a: 60, unit: "km", why: "15×4＝60" },
        { q: "8mの針金の重さが320gです。1mあたり何gですか。", a: 40, unit: "g", why: "320÷8＝40" },
        { q: "6㎡の花だんに24本の花があります。1㎡あたり何本ですか。", a: 4, unit: "本", why: "24÷6＝4" },
        { q: "100gで240円のお菓子があります。200gでは何円ですか。", a: 480, unit: "円", why: "200gは100gの2倍。240×2＝480" },
        { q: "歩幅を60cmとして100歩歩きました。進んだ距離は何mですか。", a: 60, unit: "m", why: "60×100＝6000cm＝60m" }
      ],
      standard: [
        { q: "平均75gのみかんを12個集めました。重さの合計は何gですか。", a: 900, unit: "g", why: "75×12＝900" },
        { q: "合計4.5kgのみかんがあります。1個の平均を75gとすると何個ですか。", a: 60, unit: "個", why: "4.5kg＝4500g。4500÷75＝60" },
        { q: "18人の平均点が70点です。全員の得点の合計は何点ですか。", a: 1260, unit: "点", why: "70×18＝1260" },
        { q: "面積12㎡の部屋に18人います。1㎡あたりの人数は何人ですか。", a: 1.5, unit: "人", why: "18÷12＝1.5" },
        { q: "人口24万人、面積600㎢の市の人口密度は1㎢あたり何人ですか。", a: 400, unit: "人", why: "240000÷600＝400" },
        { q: "1Lで18km走る車が7.5L使いました。何km走りましたか。", a: 135, unit: "km", why: "18×7.5＝135" },
        { q: "15mで重さ900gのロープがあります。1mあたり何gですか。", a: 60, unit: "g", why: "900÷15＝60" },
        { q: "平均68点のテストを5回受けました。得点の合計は何点ですか。", a: 340, unit: "点", why: "68×5＝340" }
      ],
      challenge: [
        { q: "男子18人の平均は70点、女子12人の平均は80点です。全体30人の平均は何点ですか。", a: 74, unit: "点", why: "(70×18＋80×12)÷30＝74" },
        { q: "4回のテストの平均が72点です。5回目を加えた平均を75点にするには、5回目は何点必要ですか。", a: 87, unit: "点", why: "75×5－72×4＝87" },
        { q: "平均65kgの4人に1人加わると、5人の平均が66kgになりました。加わった人は何kgですか。", a: 70, unit: "kg", why: "66×5－65×4＝70" },
        { q: "人口密度が1㎢あたり750人、人口が30万人の市の面積は何㎢ですか。", a: 400, unit: "㎢", why: "300000÷750＝400" },
        { q: "A畑は8㎡で40kg、B畑は12㎡で54kg収穫できました。1㎡あたりの収穫量の差は何kgですか。", a: 0.5, unit: "kg", why: "40÷8＝5、54÷12＝4.5、差は0.5" },
        { q: "10人の平均点が76点です。そのうち6人の平均が80点なら、残り4人の平均は何点ですか。", a: 70, unit: "点", why: "(76×10－80×6)÷4＝70" },
        { q: "歩幅65cmで800歩歩きました。進んだ距離は何mですか。", a: 520, unit: "m", why: "65×800＝52000cm＝520m" },
        { q: "平均120gの果物を8個買う予定でしたが、平均110gのものを10個買いました。合計の重さは予定より何g多いですか。", a: 140, unit: "g", why: "110×10－120×8＝140" }
      ]
    }
  }
};

let reviewState = null;

function playReviewTrainingMusic(options = {}) {
  const player = window.QuestMusicPlayer;
  if (player && typeof player.playReviewTraining === "function") {
    return player.playReviewTraining(options);
  }
  return false;
}

function stopReviewTrainingMusic() {
  const player = window.QuestMusicPlayer;
  if (player && typeof player.stop === "function") {
    player.stop();
  }
}


function reviewTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
}
function loadJson(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (_) { return fallback; } }
function getReviewDaily() {
  const today = reviewTodayKey();
  const data = loadJson(REVIEW_DAILY_KEY, {});
  if (data.date !== today) return { date: today, bonuses: { basic:false, standard:false, challenge:false } };
  data.bonuses = Object.assign({ basic:false, standard:false, challenge:false }, data.bonuses || {});
  return data;
}
function saveReviewDaily(data) { localStorage.setItem(REVIEW_DAILY_KEY, JSON.stringify(data)); }
function hasReviewBonus(level) { return !getReviewDaily().bonuses[level]; }
function claimReviewBonus(level) { const d=getReviewDaily(); const earned=!d.bonuses[level]; d.bonuses[level]=true; saveReviewDaily(d); return earned ? REVIEW_FIRST_BONUS : 0; }
function saveReviewHistory(unitId, level) {
  const h=loadJson(REVIEW_HISTORY_KEY, {}); h[unitId]=h[unitId]||{}; h[unitId][level]={ lastCompletedAt:new Date().toISOString(), count:(h[unitId][level]?.count||0)+1 }; localStorage.setItem(REVIEW_HISTORY_KEY,JSON.stringify(h));
}
function historyText(unitId) {
  const h=loadJson(REVIEW_HISTORY_KEY, {})[unitId]; if(!h) return "未挑戦";
  const dates=Object.values(h).map(x=>x.lastCompletedAt).filter(Boolean).sort(); if(!dates.length) return "未挑戦";
  const d=new Date(dates[dates.length-1]); return `最後の修行：${d.getMonth()+1}/${d.getDate()}`;
}

function installReviewStyles() {
  if(document.getElementById("reviewTrainingStyles")) return;
  const s=document.createElement("style"); s.id="reviewTrainingStyles"; s.textContent=`
  .review-wrap{max-width:920px;margin:0 auto;padding:18px;color:#2d241b}.review-panel{background:rgba(255,249,232,.96);border:5px solid #6e421f;border-radius:18px;padding:18px;box-shadow:0 8px 0 rgba(55,30,12,.3)}
  .review-head{text-align:center;margin-bottom:16px}.review-head h2{margin:4px 0;font-size:clamp(24px,4vw,38px);color:#7a4b19;text-shadow:0 1px 0 rgba(255,255,255,.9)}.review-sub{margin:0;color:#6a5846}.review-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
  .review-card,.review-level{border:3px solid #9b7048;border-radius:14px;background:#fffaf0;padding:15px;text-align:left}.review-card button,.review-level button,.review-actions button,.review-keypad button{font:inherit}
  .review-card.available,.review-level{cursor:pointer}.review-card.preparing{opacity:.55}.review-card h3,.review-level h3{margin:0 0 7px}.review-badge{display:inline-block;border-radius:999px;padding:3px 9px;background:#e8d4ae;font-weight:700;font-size:13px}.review-badge.done{background:#cfe7c5}
  .review-levels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.review-level{text-align:center}.review-level p{min-height:42px}.review-quiz{max-width:760px;margin:auto}.review-progress{font-weight:700;text-align:center;margin-bottom:10px}.review-question{font-size:clamp(20px,3.4vw,30px);line-height:1.55;background:#fff;border:3px solid #9b7048;border-radius:14px;padding:20px;min-height:130px}
  .review-answer-row{display:flex;align-items:center;justify-content:center;gap:10px;margin:14px 0}.review-answer{width:min(280px,60vw);font-size:30px;text-align:center;border:3px solid #6e421f;border-radius:12px;padding:10px;background:#fff}.review-unit{font-size:22px;font-weight:700}.review-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:380px;margin:auto}.review-keypad button,.review-actions button,.review-back{border:0;border-radius:11px;background:#70441f;color:#fff;padding:12px;font-weight:700;box-shadow:0 4px 0 #3f260f}.review-keypad button:active,.review-actions button:active,.review-back:active{transform:translateY(3px);box-shadow:0 1px 0 #3f260f}.review-actions{display:flex;gap:10px;justify-content:center;margin-top:14px}.review-actions .primary{background:#9b3f2d}.review-back{margin-top:16px}.review-hint{text-align:center;color:#6a5846;font-size:14px}.review-current{font-weight:700;text-align:center;margin:6px 0 14px}
  #result-screen .result-window.review-result-window{width:min(88vw,820px);max-height:min(92vh,900px);padding:clamp(22px,3vw,38px)}
  #result-screen .review-result-window .result-message{max-height:min(48vh,470px);margin-bottom:14px;padding:0 12px;line-height:1.65}
  #result-screen .review-result-window .reward-panel{margin-bottom:12px;padding:14px}
  #result-screen .review-result-window #rewardText{font-size:clamp(34px,5vw,58px)}
  @media(max-width:640px){.review-grid,.review-levels{grid-template-columns:1fr}.review-wrap{padding:8px}.review-panel{padding:12px}.review-question{min-height:auto}}
  `; document.head.appendChild(s);
}

async function openReviewTraining(options = {}) {
  playReviewTrainingMusic({ restart: options.restart !== false });
  installReviewStyles();
  const c=document.getElementById("questContainer"); if(!c) return false;
  c.classList.remove("review-quiz-container");
  c.innerHTML=createSubjectHtml(); bindSubjectEvents();
  if(typeof changeScreen==="function") await changeScreen("quest");
  return true;
}
function createSubjectHtml(){return `<div class="review-wrap"><section class="review-panel"><header class="review-head"><p class="review-badge">DAILY QUEST</p><h2>ふりかえりの修行</h2><p class="review-sub">今日学んだ教科を、自分で選ぼう。</p></header><div class="review-grid">
  <article class="review-card preparing"><h3>国語</h3><p>修行準備中</p></article>
  <article class="review-card available" data-review-subject="math"><h3>算数</h3><p>単元を選んで5問に挑戦</p><span class="review-badge">選ぶ</span></article>
  <article class="review-card preparing"><h3>理科</h3><p>修行準備中</p></article><article class="review-card preparing"><h3>社会</h3><p>修行準備中</p></article></div><button class="review-back" data-review-board>クエストボードへ戻る</button></section></div>`}
function bindSubjectEvents(){document.querySelector("[data-review-subject='math']")?.addEventListener("click",showMathUnits); document.querySelector("[data-review-board]")?.addEventListener("click",()=>{stopReviewTrainingMusic(); if(typeof changeScreen==="function") changeScreen("questboard");});}
function showMathUnits(){const c=document.getElementById("questContainer"); c.classList.remove("review-quiz-container"); c.innerHTML=`<div class="review-wrap"><section class="review-panel"><header class="review-head"><p class="review-badge">算数</p><h2>単元を選ぶ</h2><p class="review-sub">塾で学んだところも、未来への投資も、自由に選べます。</p></header><div class="review-grid"><article class="review-card available" data-review-unit="unit_average"><h3>単位量・平均</h3><p>平均、1あたりの量、人口密度など</p><span class="review-badge">${historyText("unit_average")}</span></article></div><button class="review-back" data-review-subjects>教科選択へ戻る</button></section></div>`; document.querySelector("[data-review-unit]")?.addEventListener("click",()=>showReviewLevels("unit_average")); document.querySelector("[data-review-subjects]")?.addEventListener("click",()=>openReviewTraining({ restart:false }));}
function showReviewLevels(unitId){const unit=REVIEW_QUESTIONS[unitId], daily=getReviewDaily(); const c=document.getElementById("questContainer"); c.classList.remove("review-quiz-container"); c.innerHTML=`<div class="review-wrap"><section class="review-panel"><header class="review-head"><p class="review-badge">算数</p><h2>${unit.title}</h2><p class="review-sub">どの難易度からでも、何度でも挑戦できます。</p></header><div class="review-levels">${Object.entries(REVIEW_LEVELS).map(([id,l])=>`<article class="review-level" data-review-level="${id}"><h3>${l.label}</h3><p>5問・正確性×時間で加点</p><span class="review-badge ${daily.bonuses[id]?"done":""}">${daily.bonuses[id]?"本日ボーナス獲得済み":"本日初回 +2GP"}</span></article>`).join("")}</div><button class="review-back" data-review-units>単元選択へ戻る</button></section></div>`; document.querySelectorAll("[data-review-level]").forEach(el=>el.addEventListener("click",()=>startReviewQuiz(unitId,el.dataset.reviewLevel))); document.querySelector("[data-review-units]")?.addEventListener("click",showMathUnits);}
function shuffledFive(items){return [...items].sort(()=>Math.random()-.5).slice(0,5);}
function startReviewQuiz(unitId,level){playReviewTrainingMusic(); reviewState={unitId,level,questions:shuffledFive(REVIEW_QUESTIONS[unitId].questions[level]),index:0,answers:[],input:"",startedAt:Date.now(),context:null}; if(!window.QuestEngine?.start)return false; return window.QuestEngine.start(`review-${level}`);}
function registerReviewQuests(){Object.keys(REVIEW_LEVELS).forEach(level=>window.QuestEngine?.register({id:`review-${level}`,title:`ふりかえりの修行・${REVIEW_LEVELS[level].label}`,firstReward:0,repeatReward:0,start(ctx){reviewState.context=ctx; renderReviewQuestion(); return true;},cancel(){reviewState=null;},reset(){}}));}
function renderReviewQuestion(){const s=reviewState,q=s.questions[s.index],c=s.context?.getContainer?.(); if(!c)return; c.classList.add("review-quiz-container"); c.innerHTML=`<div class="review-wrap"><section class="review-panel review-quiz"><div class="review-progress">${REVIEW_QUESTIONS[s.unitId].title}・${REVIEW_LEVELS[s.level].label}　${s.index+1}/5</div><div class="review-question">${q.q}</div><div class="review-answer-row"><div class="review-answer" id="reviewAnswerDisplay">${s.input||"　"}</div><span class="review-unit">${q.unit}</span></div><p class="review-hint">数字だけを入力してください</p><div class="review-keypad">${[1,2,3,4,5,6,7,8,9,".",0,"⌫"].map(v=>`<button type="button" data-review-key="${v}">${v}</button>`).join("")}</div><div class="review-actions"><button type="button" data-review-cancel>やめる</button><button type="button" class="primary" data-review-next>${s.index===4?"採点する":"次の問題"}</button></div></section></div>`; c.querySelectorAll("[data-review-key]").forEach(b=>b.addEventListener("click",()=>inputReviewKey(b.dataset.reviewKey))); c.querySelector("[data-review-next]").addEventListener("click",submitReviewAnswer); c.querySelector("[data-review-cancel]").addEventListener("click",()=>{window.QuestEngine.cancel(); openReviewTraining({ restart:false });});}
function inputReviewKey(k){if(k==="⌫") reviewState.input=reviewState.input.slice(0,-1); else if(k==="."){if(!reviewState.input.includes("."))reviewState.input+=(reviewState.input?".":"0.");} else if(reviewState.input.length<8)reviewState.input+=k; const d=document.getElementById("reviewAnswerDisplay");if(d)d.textContent=reviewState.input||"　";}
async function submitReviewAnswer(){if(reviewState.input==="")return; const q=reviewState.questions[reviewState.index], value=Number(reviewState.input); reviewState.answers.push({q:q.q,user:value,correct:q.a,unit:q.unit,why:q.why,ok:Math.abs(value-q.a)<0.0001}); reviewState.input=""; if(reviewState.index<4){reviewState.index++;renderReviewQuestion();return;} await finishReviewQuiz();}
async function finishReviewQuiz(){const s=reviewState,correct=s.answers.filter(x=>x.ok).length,elapsed=Math.max(1,Math.ceil((Date.now()-s.startedAt)/1000)),accuracy=Math.round(correct/5*100); const accuracyPoint=accuracy<=60?0:accuracy<=70?1:accuracy<100?2:3; const limits=REVIEW_LEVELS[s.level].speed; const speedPoint=elapsed<=limits[0]?3:elapsed<=limits[1]?2:1; const performance=accuracyPoint*speedPoint; const bonus=claimReviewBonus(s.level); saveReviewHistory(s.unitId,s.level); const wrong=s.answers.filter(x=>!x.ok); const min=Math.floor(elapsed/60),sec=elapsed%60; const lines=[`${REVIEW_QUESTIONS[s.unitId].title}・${REVIEW_LEVELS[s.level].label}を最後までやり切りました。`,`${correct}問／5問正解（正解率 ${accuracy}％）`,`タイム：${min?min+"分":""}${sec}秒`,`成績GP：${accuracyPoint} × ${speedPoint} ＝ ${performance}GP`,`本日初回ボーナス：${bonus}GP`]; if(wrong.length){lines.push("","まちがえた問題");wrong.forEach((x,i)=>lines.push(`${i+1}. ${x.q}\n【正しい答え】${x.correct}${x.unit}`));}else lines.push("","全問正解です！"); await s.context.complete({isPerfect:correct===5,correctCount:correct,totalQuestions:5,elapsedSeconds:elapsed,rewardOverride:performance+bonus,performanceRewardOverride:performance,accuracyPercent:accuracy,accuracyPoint,speedPoint,reviewBonus:bonus,message:lines.join("\n")});}

document.addEventListener("DOMContentLoaded",()=>{
  registerReviewQuests();
  document.getElementById("resultBackQuestBoard")?.addEventListener("click",()=>{
    const resultWindow=document.querySelector("#result-screen .result-window");
    if(resultWindow?.classList.contains("review-result-window")){
      stopReviewTrainingMusic();
    }
  });
});
window.openReviewTraining=openReviewTraining;
window.getReviewDailyBonusStatus=()=>getReviewDaily().bonuses;
