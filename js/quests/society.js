"use strict";

/* =========================================================
   社会ギルド Ver1.0｜世界のすがた（テキスト p.26〜28）
   ・クエスト1〜5：各10問、一度だけ攻略
   ・クエスト2以降の前半5問は直前クエストの復習
   ・不正解でそのクエストの1問目へ戻る
   ・ギルドテスト1：各クエストの学習範囲から4問ずつ、計20問
   ・テストは何度でも挑戦でき、合格＋5分以内で2GP
   ========================================================= */

const SOCIAL_GUILD_STORAGE_KEY = "summerGuildSocialGuildV1";
const SOCIAL_GUILD_PASS_ACCURACY = 90;
const SOCIAL_GUILD_REQUIRED_PASSES = 3;
const SOCIAL_GUILD_REWARD_SECONDS = 300;
const SOCIAL_GUILD_TEST_REWARD_GP = 2;

function socialQ(prompt, answer, wrong, options = {}) {
    return { prompt, answer, choices: [answer, ...wrong], ...options };
}

const EARTH_VISUAL = `<div class="social-mini-globe" aria-hidden="true"><div class="social-globe-axis"></div><div class="social-globe"><i class="lat l1"></i><i class="lat l2"></i><i class="lat l3"></i><i class="lon n1"></i><i class="lon n2"></i><b>赤道</b></div></div>`;
const HEMISPHERE_VISUAL = `<div class="social-daynight" aria-hidden="true"><span class="sun">☀</span><div class="earth"><i></i><b>昼</b><em>夜</em></div></div>`;
const WORLD_GRID_VISUAL = `<div class="social-world-grid" aria-hidden="true"><span class="wg-eu">ユーラシア</span><span class="wg-af">アフリカ</span><span class="wg-na">北アメリカ</span><span class="wg-sa">南アメリカ</span><span class="wg-au">オーストラリア</span><span class="wg-an">南極</span><i class="equator"></i><i class="date-line"></i></div>`;

const SOCIAL_NEW_POOLS = {
    1: [
        socialQ("地球はどのような形をしていますか。", "球体", ["立方体", "円柱", "平面"]),
        socialQ("地球は回転しています。この動きを何といいますか。", "自転", ["公転", "移動", "変転"]),
        socialQ("太陽の光があたっているところは、何の地域ですか。", "昼間の地域", ["夜の地域", "北半球", "南半球"], { visual: HEMISPHERE_VISUAL }),
        socialQ("太陽の光があたっていないところは、何の地域ですか。", "夜の地域", ["昼間の地域", "東半球", "西半球"], { visual: HEMISPHERE_VISUAL }),
        socialQ("日本が夜のとき、日本から見て地球の裏側の国はどうなっていますか。", "昼間", ["同じく夜", "必ず朝", "必ず夕方"]),
        socialQ("地球上のようすを、地球を小さくした模型で表したものは何ですか。", "地球儀", ["世界地図", "天球儀", "方位磁針"], { visual: EARTH_VISUAL }),
        socialQ("日本が夜のとき、世界のほかの国々もすべて夜である。", "誤り", ["正しい", "季節による", "国の広さによる"]),
        socialQ("地球上では、太陽の光があたる地域とあたらない地域が生まれます。主な理由はどれですか。", "地球が球体で回転しているから", ["地球が平らだから", "太陽が地球の周りを回るから", "海洋が広いから"]),
        socialQ("地球上で、昼と夜の地域が同時に存在する。", "正しい", ["誤り", "夏だけ正しい", "冬だけ正しい"]),
        socialQ("地球儀で、地球上の何をほぼ正確に表すことができますか。", "距離・面積・方位・角度", ["人口・気温・時刻・言語", "国名だけ", "海の深さだけ"], { visual: EARTH_VISUAL })
    ],
    2: [
        socialQ("地球上の位置を表すために使う2つは何ですか。", "緯度と経度", ["高度と深度", "距離と面積", "方位と時刻"]),
        socialQ("緯度0度の緯線は、一般に何とよばれていますか。", "赤道", ["本初子午線", "日付変更線", "標準時子午線"], { visual: EARTH_VISUAL }),
        socialQ("赤道から北極点までを何と表しますか。", "北緯", ["南緯", "東経", "西経"]),
        socialQ("赤道から南極点までを何と表しますか。", "南緯", ["北緯", "東経", "西経"]),
        socialQ("北緯と南緯は、それぞれ何度ずつありますか。", "90度", ["45度", "135度", "180度"]),
        socialQ("赤道より北側を何といいますか。", "北半球", ["南半球", "東半球", "西半球"]),
        socialQ("赤道より南側を何といいますか。", "南半球", ["北半球", "東半球", "西半球"]),
        socialQ("経度0度の基準となる経線は、どこを通りますか。", "ロンドンの旧グリニッジ天文台", ["ニューヨーク", "北京", "ベルリン"]),
        socialQ("経度0度の経線を何といいますか。", "本初子午線", ["赤道", "日付変更線", "標準時子午線"]),
        socialQ("本初子午線から東を何と表しますか。", "東経", ["西経", "北緯", "南緯"]),
        socialQ("本初子午線から西を何と表しますか。", "西経", ["東経", "北緯", "南緯"]),
        socialQ("東経と西経は、それぞれ何度ずつありますか。", "180度", ["90度", "135度", "360度"]),
        socialQ("北半球と南半球では、季節はどうなりますか。", "逆になる", ["同じになる", "北半球だけ季節がある", "南半球だけ季節がある"])
    ],
    3: [
        socialQ("ある国や地域の時刻を決める基準となる経線を何といいますか。", "標準時子午線", ["本初子午線", "赤道", "日付変更線"]),
        socialQ("日本の標準時子午線は東経何度ですか。", "東経135度", ["東経15度", "東経90度", "東経180度"]),
        socialQ("日本の標準時子午線が通る都市はどこですか。", "兵庫県明石市", ["愛知県名古屋市", "大阪府堺市", "三重県四日市市"]),
        socialQ("地球上の2地点間の時間の差を何といいますか。", "時差", ["標準時", "経度", "日付変更"]),
        socialQ("地球は1日24時間で360度回転します。経度何度につき1時間の時差が生じますか。", "15度", ["10度", "24度", "30度"]),
        socialQ("ロンドンを基準にすると、経度15度ごとに東側では時刻をどうしますか。", "1時間進める", ["1時間遅らせる", "1日進める", "変えない"]),
        socialQ("ロンドンを基準にすると、経度15度ごとに西側では時刻をどうしますか。", "1時間遅らせる", ["1時間進める", "1日戻す", "変えない"]),
        socialQ("経度180度付近にほぼ沿って引かれている線を何といいますか。", "日付変更線", ["本初子午線", "赤道", "標準時子午線"], { visual: WORLD_GRID_VISUAL }),
        socialQ("日付変更線を東から西へこえるとき、日付をどうしますか。", "1日進める", ["1日戻す", "1時間進める", "変えない"]),
        socialQ("日付変更線を西から東へこえるとき、日付をどうしますか。", "1日戻す", ["1日進める", "1時間戻す", "変えない"]),
        socialQ("経度180度では、この線の東と西でどれだけの時刻のずれが生じますか。", "24時間", ["12時間", "15時間", "1時間"])
    ],
    4: [
        socialQ("地球上の陸地と海洋の面積の割合は、およそどれですか。", "3：7", ["7：3", "1：1", "4：6"]),
        socialQ("地球上では、陸地と海洋のどちらの面積が広いですか。", "海洋", ["陸地", "同じ", "季節で変わる"]),
        socialQ("北半球と南半球では、どちらの方が陸地のしめる割合が高いですか。", "北半球", ["南半球", "同じ", "わからない"]),
        socialQ("アジアとヨーロッパをあわせた大陸は何ですか。", "ユーラシア大陸", ["アフリカ大陸", "北アメリカ大陸", "オーストラリア大陸"], { visual: WORLD_GRID_VISUAL }),
        socialQ("六大陸のうち、最も面積が広い大陸は何ですか。", "ユーラシア大陸", ["アフリカ大陸", "南極大陸", "北アメリカ大陸"]),
        socialQ("大陸全体が一つの国になっている大陸は何ですか。", "オーストラリア大陸", ["ユーラシア大陸", "アフリカ大陸", "南極大陸"]),
        socialQ("世界の六大陸に含まれないものはどれですか。", "日本列島", ["南極大陸", "南アメリカ大陸", "アフリカ大陸"]),
        socialQ("世界の三大洋は、太平洋・大西洋と、もう一つは何ですか。", "インド洋", ["北極海", "地中海", "日本海"]),
        socialQ("日本も面している、世界で最も広い海洋は何ですか。", "太平洋", ["大西洋", "インド洋", "地中海"]),
        socialQ("六大陸に含まれる組み合わせとして正しいものはどれですか。", "北アメリカ大陸・南アメリカ大陸", ["北極大陸・南極大陸", "アジア大陸・ヨーロッパ大陸", "太平洋大陸・大西洋大陸"])
    ],
    5: [
        socialQ("世界には、いくつをこえる国がありますか。", "190をこえる", ["50をこえる", "100をこえる", "500をこえる"]),
        socialQ("それぞれの国にある、その国を表す旗を何といいますか。", "国旗", ["市旗", "校旗", "軍旗"]),
        socialQ("国は、国民がくらす領土と、領土を統治する何をもつことで成り立ちますか。", "政府", ["会社", "学校", "市場"]),
        socialQ("世界の平和と安全を守ることを目的とした組織は何ですか。", "国際連合", ["世界銀行", "赤十字社", "欧州連合"]),
        socialQ("古くから工業が発達し、首都ロンドンを本初子午線が通る国はどこですか。", "イギリス", ["ドイツ", "イタリア", "エジプト"]),
        socialQ("かつて東ドイツと西ドイツに分かれていた国はどこですか。", "ドイツ", ["イギリス", "ロシア連邦", "サウジアラビア"]),
        socialQ("世界で最も広い国はどこですか。", "ロシア連邦", ["アメリカ合衆国", "中華人民共和国", "ブラジル"]),
        socialQ("日本との間に北方領土の問題がある国はどこですか。", "ロシア連邦", ["ドイツ", "オーストラリア", "エジプト"]),
        socialQ("日本との関係が深く、人口が世界第3位と紹介されている国はどこですか。", "アメリカ合衆国", ["ブラジル", "インド", "イタリア"]),
        socialQ("世界で2番目に人口が多い国と紹介されている国はどこですか。", "中華人民共和国", ["インド", "アメリカ合衆国", "ロシア連邦"]),
        socialQ("世界で最も長いナイル川が流れ、ピラミッドで知られる国はどこですか。", "エジプト", ["サウジアラビア", "ブラジル", "イタリア"]),
        socialQ("原油が多くとれ、日本もこの国から多く輸入している国はどこですか。", "サウジアラビア", ["ドイツ", "ニュージーランド", "シンガポール"]),
        socialQ("資源が豊かで南半球にあり、日本とは季節が逆の国はどこですか。", "オーストラリア", ["イギリス", "ロシア連邦", "中国"]),
        socialQ("日本から見て、ほぼ地球の裏側に位置する国はどこですか。", "ブラジル", ["ドイツ", "モンゴル", "フィリピン"]),
        socialQ("イギリスの正式名称に含まれる地域の組み合わせはどれですか。", "イングランド・スコットランド・ウェールズ・北アイルランド", ["イングランド・フランス・ウェールズ・アイルランド", "ロンドン・スコットランド・ドイツ・ウェールズ", "イングランド・イタリア・北アイルランド・スペイン"])
    ]
};

function takeFirst(pool, count) { return pool.slice(0, count).map((item) => ({ ...item })); }
const SOCIAL_GUILD_QUESTS = [
    { id: 1, title: "地球のすがた", subtitle: "テキスト p.26｜昼と夜・地球儀", questions: takeFirst(SOCIAL_NEW_POOLS[1], 10) },
    { id: 2, title: "緯度と経度", subtitle: "テキスト p.26｜赤道・本初子午線", questions: [...takeFirst(SOCIAL_NEW_POOLS[1], 5), ...takeFirst(SOCIAL_NEW_POOLS[2], 5)] },
    { id: 3, title: "世界の時刻", subtitle: "テキスト p.26｜標準時・時差・日付変更線", questions: [...takeFirst(SOCIAL_NEW_POOLS[2], 5), ...takeFirst(SOCIAL_NEW_POOLS[3], 5)] },
    { id: 4, title: "大陸と海洋", subtitle: "テキスト p.27｜六大陸・三大洋", questions: [...takeFirst(SOCIAL_NEW_POOLS[3], 5), ...takeFirst(SOCIAL_NEW_POOLS[4], 5)] },
    { id: 5, title: "世界の国々", subtitle: "テキスト p.28｜国・国旗・主な国々", questions: [...takeFirst(SOCIAL_NEW_POOLS[4], 5), ...takeFirst(SOCIAL_NEW_POOLS[5], 5)] }
];

let socialGuildState = null;
function socialShuffle(items) { const a=[...items]; for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }
function socialEscape(value){return String(value).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;");}
function defaultSocialProgress(){return {completedQuests:{},test1Passes:0,test1Attempts:0,test1BestAccuracy:0,test1BestTime:null};}
function getSocialGuildProgress(){try{return Object.assign(defaultSocialProgress(),JSON.parse(localStorage.getItem(SOCIAL_GUILD_STORAGE_KEY)||"{}"));}catch(_){return defaultSocialProgress();}}
function saveSocialGuildProgress(p){localStorage.setItem(SOCIAL_GUILD_STORAGE_KEY,JSON.stringify(p));}
function socialQuestUnlocked(id,p){return id===1||Boolean(p.completedQuests[String(id-1)]);}
function socialAllQuestsComplete(p){return [1,2,3,4,5].every(id=>p.completedQuests[String(id)]);}
function playSocialMusic(mode){const p=window.QuestMusicPlayer;if(mode==="test"&&p?.playMathGuildTest)p.playMathGuildTest({restart:true});else if(p?.playMathGuildQuest)p.playMathGuildQuest({restart:true});}
function stopSocialMusic(){window.QuestMusicPlayer?.stop?.();}

function openSocialGuild(){renderSocialGuildHome();if(typeof changeScreen==="function")changeScreen("socialguild");}
function renderSocialGuildHome(){
    stopSocialMusic(); const c=document.getElementById("socialGuildContent");if(!c)return;const p=getSocialGuildProgress();
    const cards=SOCIAL_GUILD_QUESTS.map(q=>{const done=!!p.completedQuests[String(q.id)], unlocked=socialQuestUnlocked(q.id,p);return `<article class="math-guild-card social-guild-card ${done?"is-complete":""} ${unlocked?"":"is-locked"}"><div class="math-guild-card-number">QUEST ${q.id}</div><div class="math-guild-card-body"><h3>${q.title}</h3><p>${q.subtitle}</p><small>${done?"COMPLETE":unlocked?"挑戦できます":`クエスト${q.id-1}クリアで解放`}</small></div><button type="button" data-social-quest="${q.id}" ${(!unlocked||done)?"disabled":""}>${done?"攻略済み":unlocked?"挑戦する":"未解放"}</button></article>`}).join("");
    const testOpen=socialAllQuestsComplete(p);
    c.innerHTML=`<div class="math-guild-summary"><div><span>学習範囲</span><strong>世界のすがた p.26〜28</strong></div><div><span>ギルドテスト1</span><strong>${testOpen?`合格 ${Math.min(p.test1Passes,SOCIAL_GUILD_REQUIRED_PASSES)} / ${SOCIAL_GUILD_REQUIRED_PASSES}回`:"クエスト1〜5攻略で解放"}</strong></div></div><div class="math-guild-list">${cards}</div><article class="math-guild-test-card social-test-card ${testOpen?"":"is-locked"}"><div><span>GUILD TEST 1</span><h3>世界のすがた・総合試験</h3><p>クエスト1〜5の各範囲から4問ずつ、計20問をランダム出題。正解率90％以上で合格です。</p><small>${testOpen?`何度でも挑戦できます${p.test1BestAccuracy?`／最高正解率 ${p.test1BestAccuracy}%`:""}`:"クエスト1〜5を攻略すると解放"}</small></div><button type="button" data-social-test ${testOpen?"":"disabled"}>試験を受ける</button></article>`;
    c.querySelectorAll("[data-social-quest]").forEach(b=>b.addEventListener("click",()=>startSocialQuest(Number(b.dataset.socialQuest))));
    c.querySelector("[data-social-test]")?.addEventListener("click",startSocialTest);
}
function startSocialQuest(id){const p=getSocialGuildProgress(),q=SOCIAL_GUILD_QUESTS.find(x=>x.id===id);if(!q||!socialQuestUnlocked(id,p)||p.completedQuests[String(id)])return;socialGuildState={mode:"quest",questId:id,questions:q.questions.map(x=>({...x})),index:0,correctCount:0,startedAt:Date.now(),locked:false};playSocialMusic("quest");renderSocialQuestion();}
function startSocialTest(){const p=getSocialGuildProgress();if(!socialAllQuestsComplete(p))return;const questions=[];[1,2,3,4,5].forEach(id=>questions.push(...socialShuffle(SOCIAL_NEW_POOLS[id]).slice(0,4).map(x=>({...x}))));socialGuildState={mode:"test",questId:0,questions:socialShuffle(questions),index:0,correctCount:0,startedAt:Date.now(),locked:false};playSocialMusic("test");renderSocialQuestion();}
function renderSocialQuestion(message=""){
    const c=document.getElementById("socialGuildContent"),q=socialGuildState?.questions[socialGuildState.index];if(!c||!q)return;const total=socialGuildState.questions.length,label=socialGuildState.mode==="test"?"GUILD TEST 1":`GUILD QUEST ${socialGuildState.questId}`;
    c.innerHTML=`<div class="math-play-panel social-play-panel"><header><span>${label}</span><strong>${socialGuildState.index+1} / ${total}</strong></header><div class="math-progress-track"><i style="width:${socialGuildState.index/total*100}%"></i></div>${message?`<p class="math-answer-message">${message}</p>`:""}${q.visual||""}<p class="math-expression social-question-text">${q.prompt}</p><div class="math-answer-grid">${socialShuffle(q.choices).map(ch=>`<button type="button" class="math-answer-button" data-social-answer="${socialEscape(ch)}">${ch}</button>`).join("")}</div><button type="button" class="math-quit-button" id="quitSocialGuildPlay">社会ギルドへ戻る</button></div>`;
    c.querySelectorAll("[data-social-answer]").forEach(b=>b.addEventListener("click",()=>answerSocialQuestion(b.dataset.socialAnswer)));
    document.getElementById("quitSocialGuildPlay")?.addEventListener("click",renderSocialGuildHome);
}
function renderSocialMistake(q,selected,isQuest){const c=document.getElementById("socialGuildContent");c.innerHTML=`<div class="math-result-panel is-failed"><span>${isQuest?"QUEST RETRY":"CHECK"}</span><h2>正解は「${q.answer}」</h2><p>選んだ答え：${selected}</p><p>${isQuest?"クエストは1問目から再開します。":"次の問題へ進みます。"}</p></div>`;}
function answerSocialQuestion(selected){if(socialGuildState.locked)return;socialGuildState.locked=true;const q=socialGuildState.questions[socialGuildState.index],ok=selected===q.answer;if(socialGuildState.mode==="quest"){
    if(!ok){renderSocialMistake(q,selected,true);socialGuildState.index=0;socialGuildState.correctCount=0;setTimeout(()=>{socialGuildState.locked=false;renderSocialQuestion();},1200);return;}
    socialGuildState.correctCount++;socialGuildState.index++;if(socialGuildState.index>=socialGuildState.questions.length){finishSocialQuest();return;}setTimeout(()=>{socialGuildState.locked=false;renderSocialQuestion("正解！");},280);return;
  }
  if(ok){socialGuildState.correctCount++;socialGuildState.index++;if(socialGuildState.index>=socialGuildState.questions.length){finishSocialTest();return;}setTimeout(()=>{socialGuildState.locked=false;renderSocialQuestion("正解！");},280);return;}
  renderSocialMistake(q,selected,false);socialGuildState.index++;setTimeout(()=>{if(socialGuildState.index>=socialGuildState.questions.length)finishSocialTest();else{socialGuildState.locked=false;renderSocialQuestion();}},1050);
}
function finishSocialQuest(){stopSocialMusic();const p=getSocialGuildProgress();p.completedQuests[String(socialGuildState.questId)]=true;saveSocialGuildProgress(p);const totalGp=typeof addGp==="function"?addGp(5):null,c=document.getElementById("socialGuildContent"),next=socialGuildState.questId===5?"ギルドテスト1が解放されました。":`ギルドクエスト${socialGuildState.questId+1}が解放されました。`;c.innerHTML=`<div class="math-result-panel is-clear"><span>QUEST COMPLETE</span><h2>ギルドクエスト${socialGuildState.questId} 攻略！</h2><p>10問連続正解を達成しました。</p><div class="math-result-reward">獲得報酬 <strong>5 GP</strong></div><p>${next}</p>${totalGp!==null?`<small>所持GP：${totalGp}</small>`:""}<button type="button" id="finishSocialBack">社会ギルドへ戻る</button></div>`;document.getElementById("finishSocialBack")?.addEventListener("click",renderSocialGuildHome);if(typeof refreshGameDisplays==="function")refreshGameDisplays();}
function finishSocialTest(){stopSocialMusic();const elapsed=Math.max(1,Math.round((Date.now()-socialGuildState.startedAt)/1000)),accuracy=Math.round(socialGuildState.correctCount/socialGuildState.questions.length*100),passed=accuracy>=SOCIAL_GUILD_PASS_ACCURACY,reward=passed&&elapsed<=SOCIAL_GUILD_REWARD_SECONDS?SOCIAL_GUILD_TEST_REWARD_GP:0,p=getSocialGuildProgress();p.test1Attempts++;if(passed)p.test1Passes++;p.test1BestAccuracy=Math.max(p.test1BestAccuracy,accuracy);if(passed&&(p.test1BestTime===null||elapsed<p.test1BestTime))p.test1BestTime=elapsed;saveSocialGuildProgress(p);const totalGp=reward&&typeof addGp==="function"?addGp(reward):(typeof getGp==="function"?getGp():null),c=document.getElementById("socialGuildContent");c.innerHTML=`<div class="math-result-panel ${passed?"is-clear":"is-failed"}"><span>${passed?"TEST PASSED":"TEST COMPLETE"}</span><h2>${passed?"ギルドテスト1 合格！":"もう一度修行しよう"}</h2><div class="math-test-stats"><div><small>正解</small><strong>${socialGuildState.correctCount} / 20</strong></div><div><small>正解率</small><strong>${accuracy}%</strong></div><div><small>タイム</small><strong>${formatSocialTime(elapsed)}</strong></div></div><p>合格回数：${Math.min(p.test1Passes,SOCIAL_GUILD_REQUIRED_PASSES)} / ${SOCIAL_GUILD_REQUIRED_PASSES}回</p><div class="math-result-reward">獲得報酬 <strong>${reward} GP</strong><small>${passed?(reward?"合格＋5分以内達成":"合格。次は5分以内を目指そう"):"正解率90％以上で合格"}</small></div>${totalGp!==null?`<small>所持GP：${totalGp}</small>`:""}<button type="button" id="finishSocialBack">社会ギルドへ戻る</button></div>`;document.getElementById("finishSocialBack")?.addEventListener("click",renderSocialGuildHome);if(typeof refreshGameDisplays==="function")refreshGameDisplays();}
function formatSocialTime(s){const m=Math.floor(s/60),r=s%60;return m?`${m}分${String(r).padStart(2,"0")}秒`:`${r}秒`;}

window.SocialGuild={open:openSocialGuild,render:renderSocialGuildHome,getProgress:getSocialGuildProgress,reviewPools:SOCIAL_NEW_POOLS};
