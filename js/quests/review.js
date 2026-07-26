"use strict";

/* ふりかえりの修行：教科→単元→難易度を自由に選ぶデイリー復習 */
const REVIEW_DAILY_KEY = "summerGuildReviewDailyV2";
const REVIEW_HISTORY_KEY = "summerGuildReviewHistoryV1";
const REVIEW_LEVELS = {
  basic: { label: "基本", reward: 2, firstBonus: 1 },
  standard: { label: "標準", reward: 3, firstBonus: 2 },
  challenge: { label: "挑戦", reward: 4, firstBonus: 3 }
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



/* 塾プリント①（夏期講習 小5社会 特設講座I 確認テスト①）を忠実にゲーム化 */
function socialMapVisual(kind){
  if(kind==="world-blank") return `<figure class="social-material social-world-map"><img src="assets/backgrounds/special/map_world.PNG" alt="国名のない世界地図"></figure>`;
  if(kind==="world-xy") return `<figure class="social-material social-world-map social-world-xy"><img src="assets/backgrounds/special/map_world.PNG" alt="Xの緯線とYの経線を示した世界地図"><span class="social-line social-latitude"></span><span class="social-line-label social-label-x">X</span><span class="social-line social-longitude"></span><span class="social-line-label social-label-y">Y</span><span class="social-map-star" aria-label="イギリスを示す印">※</span></figure>`;
  if(kind==="japan-markers") return `<figure class="social-material social-japan-map"><img src="assets/backgrounds/special/map_Japan.PNG" alt="記号を示した日本地図"><span class="social-map-label jp-a">A</span><span class="social-map-label jp-b">B</span><span class="social-map-label jp-c">C</span><span class="social-map-label jp-d">D</span><span class="social-map-label jp-1">1</span><span class="social-map-label jp-2">2</span><span class="social-map-label jp-3">3</span><span class="social-river river-b"></span><span class="social-river river-c"></span></figure>`;
  return "";
}
function riceWorkCalendarVisual(){return `<figure class="social-material social-calendar" aria-label="米づくりの作業時期を示す表"><div class="calendar-months"><b>3月</b><b>4月</b><b>5月</b><b>6月</b><b>7月</b><b>8月</b><b>9月</b><b>10月</b><b>11月</b></div><div class="calendar-tasks"><span class="task seed">たねもみの<br>消毒など</span><span class="task plow">田おこし</span><span class="task marker-a">ア</span><span class="task marker-i">イ</span><span class="task plant">田植え</span><span class="task water">水の管理</span><span class="task reap">稲かり</span><span class="task marker-star">※</span><span class="task dry">もみすり<br>・乾燥</span></div></figure>`;}
function ricePrefectureChartVisual(){return `<figure class="social-material social-rice-bars" aria-label="都道府県別の米収穫量割合を示すグラフ"><div class="rice-bar x" style="--h:82"><b>X</b><span>81.9</span></div><div class="rice-bar" style="--h:66"><b>秋田</b><span>66.1</span></div><div class="rice-bar" style="--h:63"><b>山形</b><span>63.4</span></div><div class="rice-bar" style="--h:48"><b>宮城</b><span>48</span></div><div class="rice-bar other" style="--h:69"><b>その他</b><span>69.4</span></div><figcaption>（プリント資料を再構成）</figcaption></figure>`;}
function riceTrendChartVisual(){return `<figure class="social-material social-trend-chart" aria-label="米の消費量、生産量、在庫量の移り変わりを示すグラフ"><svg viewBox="0 0 560 230" role="img"><g class="grid"><line x1="45" y1="30" x2="45" y2="195"/><line x1="45" y1="195" x2="535" y2="195"/></g><g class="stock-bars"><rect x="65" y="150" width="18" height="45"/><rect x="90" y="110" width="18" height="85"/><rect x="115" y="145" width="18" height="50"/><rect x="140" y="120" width="18" height="75"/><rect x="165" y="170" width="18" height="25"/><rect x="190" y="165" width="18" height="30"/><rect x="215" y="155" width="18" height="40"/><rect x="240" y="178" width="18" height="17"/><rect x="265" y="168" width="18" height="27"/><rect x="290" y="158" width="18" height="37"/><rect x="315" y="165" width="18" height="30"/><rect x="340" y="175" width="18" height="20"/><rect x="365" y="168" width="18" height="27"/><rect x="390" y="180" width="18" height="15"/><rect x="415" y="174" width="18" height="21"/><rect x="440" y="181" width="18" height="14"/><rect x="465" y="178" width="18" height="17"/></g><polyline class="line-a" points="55,58 80,38 105,70 130,48 155,62 180,52 205,70 230,54 255,65 280,57 305,74 330,61 355,67 380,58 405,70 430,64 455,72 480,66 510,75"/><polyline class="line-b" points="55,82 80,86 105,92 130,89 155,100 180,104 205,111 230,108 255,116 280,121 305,125 330,128 355,132 380,136 405,139 430,143 455,145 480,147 510,151"/><text x="70" y="32">A</text><text x="505" y="142">B</text><text x="185" y="140">C</text></svg><figcaption>米の消費量・生産量・政府在庫量の移り変わり</figcaption></figure>`;}

const SOCIAL_PRINT_1_QUESTIONS = {
  basic: [
    {q:"国が成り立つために必要な条件は、国民、政府とあとひとつは何ですか。",a:"領土",choices:["領土","領海","赤道","国旗"],why:"国が成り立つ三つの条件は、国民・領土・政府です。"},
    {q:"世界で最も面積の広い国はロシア連邦で、国土面積は約1710万㎢です。この面積は日本の面積のおよそ何倍ですか。整数で答えなさい。",a:45,unit:"倍",why:"約1710万÷約38万≒45なので、日本のおよそ45倍です。"},
    {q:"右の世界地図に描かれていない大陸の名前を答えなさい。",a:"南極大陸",choices:["南極大陸","南アメリカ大陸","アフリカ大陸","ユーラシア大陸"],visual:socialMapVisual("world-blank"),why:"この地図には南極大陸が描かれていません。"},
    {q:"Xで示した緯線が通っていない大陸を次からひとつ選び、記号で答えなさい。",a:"ア　南アメリカ大陸",choices:["ア　南アメリカ大陸","イ　ユーラシア大陸","ウ　アフリカ大陸","エ　北アメリカ大陸"],visual:socialMapVisual("world-xy"),why:"Xは北緯20度の緯線です。南アメリカ大陸は北緯20度まで達していません。"},
    {q:"Xで示した緯線とYで示した経線が交わっている地点の緯度と経度の正しい組み合わせとして、もっとも適当なものを次からひとつ選び、記号で答えなさい。",a:"イ　北緯20度・東経160度",choices:["ア　北緯20度・西経160度","イ　北緯20度・東経160度","ウ　南緯20度・西経160度","エ　南緯20度・東経160度"],visual:socialMapVisual("world-xy"),why:"Xは北緯20度、Yは東経160度を示しています。"},
    {q:"※で示した国の首都は経度0度の経線が通っています。この国の首都はどこですか。",a:"ロンドン",choices:["ロンドン","パリ","ベルリン","ローマ"],visual:socialMapVisual("world-xy"),why:"経度0度の本初子午線は、イギリスのロンドンにあるグリニッジ付近を通ります。"},
    {q:"右上の地図で、Xの緯線とYの経線が交わっている海域の海は何といいますか。",a:"太平洋",choices:["太平洋","大西洋","インド洋","北極海"],visual:socialMapVisual("world-xy"),why:"北緯20度・東経160度の交点は太平洋上です。"},
    {q:"日本の時刻の基準となる経線の経度を答えなさい。",a:"東経135度",choices:["東経135度","東経90度","西経135度","西経180度"],why:"日本標準時は東経135度の経線を基準にしています。"},
    {q:"周りを海で囲まれている国としてあてはまらないものを次のア〜エの中から選び、記号で答えなさい。",a:"イ　ボリビア",choices:["ア　ニュージーランド","イ　ボリビア","ウ　フィリピン","エ　マダガスカル"],why:"ボリビアは海に面していない内陸国です。"},
    {q:"緯度は南北にそれぞれ何度ずつに分けられていますか。",a:90,unit:"度",why:"赤道を0度として、北緯・南緯はそれぞれ90度まであります。"}
  ],
  standard: [
    {q:"0度の緯線は何といいますか。",a:"赤道",choices:["赤道","本初子午線","北回帰線","日付変更線"],why:"地球を南北に分ける0度の緯線を赤道といいます。"},
    {q:"右の表で、しろかきが行われるのは、ア〜エのうちどれですか。",a:"イ",choices:["ア","イ","ウ","エ"],visual:riceWorkCalendarVisual(),why:"しろかきは、田植えの前に水を張った田の土をならす作業です。プリントではイに当たります。"},
    {q:"右の表の※印には、かりとった稲の穂から実を取り出す作業が当てはまります。その作業を何といいますか。",a:"脱穀（だっこく）",choices:["脱穀（だっこく）","田植え","しろかき","精米"],visual:riceWorkCalendarVisual(),why:"稲の穂からもみを取り出す作業を脱穀といいます。"},
    {q:"コメの収穫量が最も多いのは何地方ですか。",a:"東北地方",choices:["東北地方","北海道地方","関東地方","九州地方"],why:"プリントの資料では、コメの収穫量が最も多い地方は東北地方です。"},
    {q:"コメの収穫量割合を表す右のグラフのXに当てはまる県名を答えなさい。",a:"新潟県",choices:["新潟県","秋田県","山形県","宮城県"],visual:ricePrefectureChartVisual(),why:"Xは、コメの収穫量が特に多い新潟県です。"},
    {q:"秋田平野を流れる川は右上の地図中のA〜Dのうち、どれですか。また川の名前を答えなさい。",a:"B　雄物川",choices:["A　北上川","B　雄物川","C　最上川","D　信濃川"],visual:socialMapVisual("japan-markers"),why:"秋田平野を流れるのは、地図中Bの雄物川です。"},
    {q:"庄内平野を流れる川は右の地図中のA〜Dのうちどれですか。また川の名前を答えなさい。",a:"C　最上川",choices:["A　北上川","B　雄物川","C　最上川","D　信濃川"],visual:socialMapVisual("japan-markers"),why:"庄内平野を流れるのは、地図中Cの最上川です。"},
    {q:"冬は降雪量が多く、夏に稲作だけに力を入れる地域を地図中の1〜3の中から選んで番号で答えなさい。",a:"2",choices:["1","2","3","どれでもない"],visual:socialMapVisual("japan-markers"),why:"2は日本海側の地域で、冬は雪が多く、夏の稲作が盛んです。"},
    {q:"水郷と呼ばれる地域で早場米を生産している地域を地図中の1〜3の中から選んで番号で答えなさい。",a:"1",choices:["1","2","3","どれでもない"],visual:socialMapVisual("japan-markers"),why:"1は利根川下流の水郷地域を示しています。"},
    {q:"稲の裏作で麦などを栽培することがさかんな地域を地図中の1〜3の中から選んで番号で答えなさい。",a:"3",choices:["1","2","3","どれでもない"],visual:socialMapVisual("japan-markers"),why:"3の九州地方では、稲の裏作として麦などを育てる二毛作が行われます。"}
  ],
  challenge: [
    {q:"右のグラフは、米の消費量、生産量、政府の食庫にある米の在庫量の移り変わりを表しています。Aに当てはまるものはどれですか。",a:"生産量",choices:["生産量","消費量","在庫量","輸入量"],visual:riceTrendChartVisual(),why:"プリントの解答では、折れ線Aが米の生産量を表します。"},
    {q:"耕地を休ませ、作物をつくらないようにすることを何といいますか。",a:"休耕",choices:["休耕","転作","二毛作","脱穀"],why:"耕地を休ませて作物をつくらないことを休耕といいます。"},
    {q:"田であった耕地で、米をつくることをやめてほかの作物をつくることを何といいますか。",a:"転作",choices:["転作","休耕","二期作","脱穀"],why:"水田で米以外の作物へ切り替えることを転作といいます。"},
    {q:"米が余るようになってきたため、政府がすすめてきた、作付面積を減らす政策をまとめて何といいますか。",a:"減反政策（生産調整）",choices:["減反政策（生産調整）","二毛作","圃場整備","食料管理制度"],why:"米の生産量を需要に合わせるため、作付面積を減らした政策を減反政策（生産調整）といいます。"},
    {q:"稲刈りと13の作業を同時に行う機械を何といいますか。",a:"コンバイン",choices:["コンバイン","田植え機","トラクター","耕うん機"],why:"コンバインは、稲刈りと脱穀を同時に行う機械です。"}
  ]
};

let reviewState = null;
let reviewMemo = { open:false, strokes:[], active:null, context:null };

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
function emptyReviewBonuses() {
  return {
    math: { basic:false, standard:false, challenge:false },
    social: { basic:false, standard:false, challenge:false }
  };
}
function getReviewSubject(unitId) { return unitId === "social_world" ? "social" : "math"; }
function getReviewDaily() {
  const today = reviewTodayKey();
  const data = loadJson(REVIEW_DAILY_KEY, {});
  if (data.date !== today) return { date: today, bonuses: emptyReviewBonuses() };
  const defaults = emptyReviewBonuses();
  data.bonuses = data.bonuses && typeof data.bonuses === "object" ? data.bonuses : {};
  Object.keys(defaults).forEach(subject => {
    data.bonuses[subject] = Object.assign({}, defaults[subject], data.bonuses[subject] || {});
  });
  return data;
}
function saveReviewDaily(data) { localStorage.setItem(REVIEW_DAILY_KEY, JSON.stringify(data)); }
function hasReviewBonus(unitId, level) {
  const subject = getReviewSubject(unitId);
  return !getReviewDaily().bonuses[subject][level];
}
function claimReviewBonus(unitId, level) {
  const d=getReviewDaily(), subject=getReviewSubject(unitId);
  const earned=!d.bonuses[subject][level];
  d.bonuses[subject][level]=true;
  saveReviewDaily(d);
  return earned ? (REVIEW_LEVELS[level]?.firstBonus || 0) : 0;
}
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
  .review-levels{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.review-level{text-align:center}.review-level p{min-height:42px}.review-level.is-preparing{opacity:.55;cursor:not-allowed}.review-quiz{max-width:760px;margin:auto}.review-progress{font-weight:700;text-align:center;margin-bottom:10px}.review-question{font-size:clamp(20px,3.4vw,30px);line-height:1.55;background:#fff;border:3px solid #9b7048;border-radius:14px;padding:20px;min-height:130px}
  .review-answer-row{display:flex;align-items:center;justify-content:center;gap:10px;margin:14px 0}.review-answer{width:min(280px,60vw);font-size:30px;text-align:center;border:3px solid #6e421f;border-radius:12px;padding:10px;background:#fff}.review-unit{font-size:22px;font-weight:700}.review-keypad{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:380px;margin:auto}.review-keypad button,.review-actions button,.review-back{border:0;border-radius:11px;background:#70441f;color:#fff;padding:12px;font-weight:700;box-shadow:0 4px 0 #3f260f}.review-keypad button:active,.review-actions button:active,.review-back:active{transform:translateY(3px);box-shadow:0 1px 0 #3f260f}.review-choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:15px 0}.review-choice-grid button{border:3px solid #9b7048;border-radius:12px;background:#fffaf0;padding:15px;font-size:17px;font-weight:700;color:#2d241b}.review-choice-grid button:active{transform:translateY(2px)}.review-actions{display:flex;gap:10px;justify-content:center;margin-top:14px}.review-actions .primary{background:#9b3f2d}.review-back{margin-top:16px}.review-hint{text-align:center;color:#6a5846;font-size:14px}.review-current{font-weight:700;text-align:center;margin:6px 0 14px}
  #result-screen .result-window.review-result-window{width:min(88vw,820px);max-height:min(92vh,900px);padding:clamp(22px,3vw,38px)}
  #result-screen .review-result-window .result-message{max-height:min(48vh,470px);margin-bottom:14px;padding:0 12px;line-height:1.65}
  #result-screen .review-result-window .reward-panel{margin-bottom:12px;padding:14px}
  #result-screen .review-result-window{display:flex;flex-direction:column;overflow:hidden}
  #result-screen .review-result-window .result-message{min-height:0;overflow-y:auto;white-space:pre-wrap;-webkit-overflow-scrolling:touch}
  #result-screen .review-result-window #resultBackQuestBoard{flex:0 0 auto;position:sticky;bottom:0;z-index:3}
  #result-screen .review-result-window #rewardText{font-size:clamp(34px,5vw,58px)}
  .review-quiz{position:relative}
  .review-memo-open{position:absolute;right:12px;top:8px;z-index:4;padding:7px 11px!important}
  .review-memo-panel{position:fixed;z-index:9000;right:2vw;top:8vh;width:min(38vw,500px);height:min(76vh,650px);padding:10px;border:4px solid #6e421f;border-radius:15px;background:#f6f1df;box-shadow:0 10px 30px rgba(0,0,0,.4);display:flex;flex-direction:column}
  .review-memo-panel[hidden]{display:none}.review-memo-panel header{display:flex;flex-direction:column;gap:2px;margin-bottom:7px}.review-memo-panel header span{font-size:12px;color:#66594a}
  .review-memo-panel canvas{min-height:0;flex:1 1 auto;width:100%;border:2px solid #9b7048;border-radius:9px;background:#fff;touch-action:none}
  .review-memo-actions{display:flex;gap:6px;margin-top:7px}.review-memo-actions button{flex:1 1 0;padding:8px;border:0;border-radius:8px;background:#70441f;color:#fff;font-weight:700}
  @media(max-width:900px),(max-height:650px){.review-memo-panel{right:1vw;top:3vh;width:min(43vw,420px);height:88vh}.review-memo-open{right:7px;top:5px}}

  .social-material{position:relative;width:min(100%,620px);margin:4px auto 10px;border:3px solid #9b7048;border-radius:12px;background:linear-gradient(145deg,#efe0bd,#b78c57);overflow:hidden;box-shadow:inset 0 0 24px rgba(72,42,18,.22)}
  .social-material img{display:block;width:100%;height:clamp(155px,27vh,280px);object-fit:contain;filter:drop-shadow(0 3px 2px rgba(45,25,10,.28))}.social-world-map{aspect-ratio:3/1.38}.social-japan-map{aspect-ratio:3/1.65}
  .social-line{position:absolute;z-index:3;background:#9a3426;box-shadow:0 0 0 1px rgba(255,255,255,.7)}.social-latitude{left:7%;right:7%;top:42%;height:3px}.social-longitude{top:7%;bottom:8%;left:82%;width:3px}.social-line-label,.social-map-label,.social-map-star{position:absolute;z-index:4;display:grid;place-items:center;width:25px;height:25px;border-radius:50%;background:#fff4c8;border:2px solid #7a3c21;color:#6b2518;font-weight:900;font-size:14px}.social-label-x{right:5%;top:calc(42% - 12px)}.social-label-y{left:calc(82% - 12px);top:4%}.social-map-star{left:46%;top:20%;font-size:19px}
  .social-japan-map .social-map-label{width:23px;height:23px;font-size:13px}.jp-a{left:72%;top:31%}.jp-b{left:61%;top:28%}.jp-c{left:59%;top:35%}.jp-d{left:32%;top:62%}.jp-1{left:72%;top:54%}.jp-2{left:49%;top:48%}.jp-3{left:22%;top:73%}.social-river{position:absolute;z-index:3;width:42px;height:3px;background:#416c91;transform-origin:left center}.river-b{left:57%;top:31%;transform:rotate(-8deg)}.river-c{left:56%;top:38%;transform:rotate(5deg)}
  .social-calendar{padding:9px;background:#fff9e8}.calendar-months{display:grid;grid-template-columns:repeat(9,1fr);font-size:12px;text-align:center;border:1px solid #7c654d}.calendar-months>*{padding:4px;border-right:1px solid #7c654d}.calendar-tasks{position:relative;height:92px;border:1px solid #7c654d;border-top:0;background:repeating-linear-gradient(90deg,transparent 0,transparent calc(11.111% - 1px),rgba(124,101,77,.35) calc(11.111% - 1px),rgba(124,101,77,.35) 11.111%)}.calendar-tasks .task{position:absolute;font-size:11px;font-weight:800;writing-mode:vertical-rl;line-height:1.1}.seed{left:2%;top:5px}.plow{left:22%;top:6px}.marker-a{left:31%;top:6px;font-size:20px!important;color:#8b2d22}.marker-i{left:36%;top:35px;font-size:20px!important;color:#8b2d22}.plant{left:43%;top:6px}.water{left:54%;top:6px}.reap{left:74%;top:6px}.marker-star{left:80%;top:5px;font-size:20px!important;color:#8b2d22}.dry{left:88%;top:5px}
  .social-rice-bars{height:210px;padding:12px 14px 28px;display:flex;align-items:flex-end;justify-content:center;gap:14px;background:#fff9e8}.rice-bar{position:relative;width:52px;height:calc(var(--h)*1.45px);border:2px solid #65513d;background:linear-gradient(#7d674f,#c5ac88)}.rice-bar.x{background:linear-gradient(#5b4938,#9b7a55)}.rice-bar.other{margin-left:14px}.rice-bar b{position:absolute;bottom:-22px;left:50%;transform:translateX(-50%);font-size:11px;white-space:nowrap}.rice-bar span{position:absolute;top:-18px;width:100%;text-align:center;font-size:10px}.social-rice-bars figcaption{position:absolute;right:10px;bottom:4px;font-size:9px;color:#66594a}
  .social-trend-chart{padding:8px;background:#fff9e8}.social-trend-chart svg{display:block;width:100%;height:auto}.social-trend-chart .grid line{stroke:#6c5b49;stroke-width:2}.social-trend-chart .stock-bars rect{fill:#89725a}.social-trend-chart .line-a,.social-trend-chart .line-b{fill:none;stroke-width:4}.social-trend-chart .line-a{stroke:#47372b}.social-trend-chart .line-b{stroke:#826244}.social-trend-chart text{font-weight:900;font-size:20px;fill:#4a2f1d}.social-trend-chart figcaption{text-align:center;font-size:11px;color:#66594a}
  @media(max-width:640px){.review-grid,.review-levels,.review-choice-grid{grid-template-columns:1fr}.review-wrap{padding:8px}.review-panel{padding:12px}.review-question{min-height:auto}}
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
  <article class="review-card preparing"><h3>理科</h3><p>修行準備中</p></article><article class="review-card available" data-review-subject="social"><h3>社会</h3><p>社会ギルドで学んだ問題から5問</p><span class="review-badge">選ぶ</span></article></div><button class="review-back" data-review-board>クエストボードへ戻る</button></section></div>`}
function bindSubjectEvents(){document.querySelector("[data-review-subject='math']")?.addEventListener("click",showMathUnits); document.querySelector("[data-review-subject='social']")?.addEventListener("click",showSocialUnits); document.querySelector("[data-review-board]")?.addEventListener("click",()=>{stopReviewTrainingMusic(); if(typeof changeScreen==="function") changeScreen("questboard");});}
function showMathUnits(){const c=document.getElementById("questContainer"); c.classList.remove("review-quiz-container"); c.innerHTML=`<div class="review-wrap"><section class="review-panel"><header class="review-head"><p class="review-badge">算数</p><h2>単元を選ぶ</h2><p class="review-sub">塾で学んだところも、未来への投資も、自由に選べます。</p></header><div class="review-grid"><article class="review-card available" data-review-unit="unit_average"><h3>単位量・平均</h3><p>平均、1あたりの量、人口密度など</p><span class="review-badge">${historyText("unit_average")}</span></article></div><button class="review-back" data-review-subjects>教科選択へ戻る</button></section></div>`; document.querySelector("[data-review-unit]")?.addEventListener("click",()=>showReviewLevels("unit_average")); document.querySelector("[data-review-subjects]")?.addEventListener("click",()=>openReviewTraining({ restart:false }));}

function showSocialUnits(){const c=document.getElementById("questContainer"); c.classList.remove("review-quiz-container"); c.innerHTML=`<div class="review-wrap"><section class="review-panel"><header class="review-head"><p class="review-badge">社会</p><h2>単元を選ぶ</h2><p class="review-sub">社会ギルドで一度出会った問題と、別の場所でもう一度再会します。</p></header><div class="review-grid"><article class="review-card available" data-review-unit="social_world"><h3>世界のすがた</h3><p>夏期講習 確認テスト①／国土・地図・米づくり</p><span class="review-badge">${historyText("social_world")}</span></article></div><button class="review-back" data-review-subjects>教科選択へ戻る</button></section></div>`; document.querySelector("[data-review-unit]")?.addEventListener("click",()=>showReviewLevels("social_world")); document.querySelector("[data-review-subjects]")?.addEventListener("click",()=>openReviewTraining({ restart:false }));}
function getReviewUnit(unitId){if(unitId!=="social_world")return REVIEW_QUESTIONS[unitId];return {title:"世界のすがた",questions:getSocialReviewLevels()};}
function getSocialReviewLevels(){
  return {
    basic:[...SOCIAL_PRINT_1_QUESTIONS.basic],
    standard:[...SOCIAL_PRINT_1_QUESTIONS.standard],
    challenge:[...SOCIAL_PRINT_1_QUESTIONS.challenge]
  };
}
function showReviewLevels(unitId){
  const unit=getReviewUnit(unitId), daily=getReviewDaily(), subject=getReviewSubject(unitId);
  const c=document.getElementById("questContainer");
  c.classList.remove("review-quiz-container");
  c.innerHTML=`<div class="review-wrap"><section class="review-panel"><header class="review-head"><p class="review-badge">${unitId==="social_world"?"社会":"算数"}</p><h2>${unit.title}</h2><p class="review-sub">どの難易度からでも、何度でも挑戦できます。</p></header><div class="review-levels">${Object.entries(REVIEW_LEVELS).map(([id,l])=>{
    const available=(unit.questions[id]||[]).length>=5;
    const bonusText=daily.bonuses[subject][id]?"本日ボーナス獲得済み":`本日初回 +${l.firstBonus}GP`;
    return `<article class="review-level ${available?"":"is-preparing"}" ${available?`data-review-level="${id}"`:""}><h3>${l.label}</h3><p>${available?`5問・毎回 ${l.reward}GP`:`新しい問題を準備中`}</p><span class="review-badge ${daily.bonuses[subject][id]?"done":""}">${available?bonusText:"COMING SOON"}</span></article>`;
  }).join("")}</div><button class="review-back" data-review-units>単元選択へ戻る</button></section></div>`;
  document.querySelectorAll("[data-review-level]").forEach(el=>el.addEventListener("click",()=>startReviewQuiz(unitId,el.dataset.reviewLevel)));
  document.querySelector("[data-review-units]")?.addEventListener("click",()=>unitId==="social_world"?showSocialUnits():showMathUnits());
}
function shuffledFive(items){return [...items].sort(()=>Math.random()-.5).slice(0,5);}
function startReviewQuiz(unitId,level){playReviewTrainingMusic(); const unit=getReviewUnit(unitId); reviewState={unitId,level,questions:shuffledFive(unit.questions[level]),index:0,answers:[],input:"",startedAt:Date.now(),context:null}; if(!window.QuestEngine?.start)return false; return window.QuestEngine.start(`review-${level}`);}
function registerReviewQuests(){Object.keys(REVIEW_LEVELS).forEach(level=>window.QuestEngine?.register({id:`review-${level}`,title:`ふりかえりの修行・${REVIEW_LEVELS[level].label}`,firstReward:0,repeatReward:0,start(ctx){reviewState.context=ctx; renderReviewQuestion(); return true;},cancel(){reviewState=null;},reset(){}}));}
function renderReviewQuestion(){const s=reviewState,q=s.questions[s.index],c=s.context?.getContainer?.(); if(!c)return; c.classList.add("review-quiz-container"); const unit=getReviewUnit(s.unitId); const isChoice=Array.isArray(q.choices); c.innerHTML=`<div class="review-wrap"><section class="review-panel review-quiz">${s.unitId==="social_world"?"":`<button type="button" class="review-memo-open" data-review-memo-open>メモパッド</button><aside class="review-memo-panel" data-review-memo-panel hidden aria-hidden="true"><header><strong>メモパッド</strong><span>指やApple Pencilで自由に筆算できます</span></header><canvas data-review-memo-canvas></canvas><div class="review-memo-actions"><button type="button" data-review-memo-undo>ひとつ戻す</button><button type="button" data-review-memo-clear>全部消す</button><button type="button" data-review-memo-close>閉じる</button></div></aside>`}<div class="review-progress">${unit.title}・${REVIEW_LEVELS[s.level].label}　${s.index+1}/5</div>${q.visual||""}<div class="review-question">${q.q}</div>${isChoice?`<div class="review-choice-grid">${[...q.choices].sort(()=>Math.random()-.5).map(v=>`<button type="button" data-review-choice="${String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;")}">${v}</button>`).join("")}</div>`:`<div class="review-answer-row"><div class="review-answer" id="reviewAnswerDisplay">${s.input||"　"}</div><span class="review-unit">${q.unit}</span></div><p class="review-hint">数字だけを入力してください</p><div class="review-keypad">${[1,2,3,4,5,6,7,8,9,".",0,"⌫"].map(v=>`<button type="button" data-review-key="${v}">${v}</button>`).join("")}</div>`}<div class="review-actions"><button type="button" data-review-cancel>やめる</button>${isChoice?"":`<button type="button" class="primary" data-review-next>${s.index===4?"採点する":"次の問題"}</button>`}</div></section></div>`; c.querySelectorAll("[data-review-key]").forEach(b=>b.addEventListener("click",()=>inputReviewKey(b.dataset.reviewKey))); c.querySelector("[data-review-next]")?.addEventListener("click",submitReviewAnswer); c.querySelectorAll("[data-review-choice]").forEach(b=>b.addEventListener("click",()=>submitReviewChoice(b.dataset.reviewChoice))); c.querySelector("[data-review-cancel]").addEventListener("click",()=>{window.QuestEngine.cancel(); openReviewTraining({ restart:false });}); bindReviewMemo(c);}

function bindReviewMemo(container){
  const panel=container.querySelector("[data-review-memo-panel]");
  const canvas=container.querySelector("[data-review-memo-canvas]");
  if(!panel||!canvas)return;
  reviewMemo.open=false; reviewMemo.active=null; reviewMemo.context=canvas.getContext("2d",{alpha:true});
  const resize=()=>{const rect=canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;const ratio=Math.min(window.devicePixelRatio||1,2);canvas.width=Math.round(rect.width*ratio);canvas.height=Math.round(rect.height*ratio);redrawReviewMemo(canvas);};
  container.querySelector("[data-review-memo-open]")?.addEventListener("click",()=>{reviewMemo.open=true;panel.hidden=false;panel.setAttribute("aria-hidden","false");requestAnimationFrame(resize);});
  container.querySelector("[data-review-memo-close]")?.addEventListener("click",()=>{reviewMemo.open=false;panel.hidden=true;panel.setAttribute("aria-hidden","true");});
  container.querySelector("[data-review-memo-undo]")?.addEventListener("click",()=>{reviewMemo.strokes.pop();redrawReviewMemo(canvas);});
  container.querySelector("[data-review-memo-clear]")?.addEventListener("click",()=>{reviewMemo.strokes=[];reviewMemo.active=null;redrawReviewMemo(canvas);});
  canvas.addEventListener("pointerdown",(e)=>{if(!reviewMemo.open)return;canvas.setPointerCapture(e.pointerId);reviewMemo.active=[reviewMemoPoint(canvas,e)];reviewMemo.strokes.push(reviewMemo.active);redrawReviewMemo(canvas);});
  canvas.addEventListener("pointermove",(e)=>{if(!reviewMemo.active)return;reviewMemo.active.push(reviewMemoPoint(canvas,e));redrawReviewMemo(canvas);});
  const end=(e)=>{if(!reviewMemo.active)return;try{canvas.releasePointerCapture(e.pointerId);}catch(_){}reviewMemo.active=null;};
  canvas.addEventListener("pointerup",end);canvas.addEventListener("pointercancel",end);
}
function reviewMemoPoint(canvas,event){const r=canvas.getBoundingClientRect();return{x:(event.clientX-r.left)/r.width,y:(event.clientY-r.top)/r.height};}
function redrawReviewMemo(canvas){
  const ctx=reviewMemo.context;if(!ctx||!canvas)return;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.lineCap="round";ctx.lineJoin="round";ctx.strokeStyle="#2e342f";ctx.lineWidth=Math.max(2,canvas.width/360);
  reviewMemo.strokes.forEach(stroke=>{if(!stroke.length)return;ctx.beginPath();stroke.forEach((p,i)=>{const x=p.x*canvas.width,y=p.y*canvas.height;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});if(stroke.length===1){const p=stroke[0];ctx.lineTo(p.x*canvas.width+.1,p.y*canvas.height+.1);}ctx.stroke();});
}
function submitReviewChoice(value){const q=reviewState.questions[reviewState.index];reviewState.answers.push({q:q.q,user:value,correct:q.a,unit:"",why:q.why,ok:value===q.a});if(reviewState.index<4){reviewState.index++;renderReviewQuestion();return;}finishReviewQuiz();}
function inputReviewKey(k){if(k==="⌫") reviewState.input=reviewState.input.slice(0,-1); else if(k==="."){if(!reviewState.input.includes("."))reviewState.input+=(reviewState.input?".":"0.");} else if(reviewState.input.length<8)reviewState.input+=k; const d=document.getElementById("reviewAnswerDisplay");if(d)d.textContent=reviewState.input||"　";}
async function submitReviewAnswer(){if(reviewState.input==="")return; const q=reviewState.questions[reviewState.index], value=Number(reviewState.input); reviewState.answers.push({q:q.q,user:value,correct:q.a,unit:q.unit,why:q.why,ok:Math.abs(value-q.a)<0.0001}); reviewState.input=""; if(reviewState.index<4){reviewState.index++;renderReviewQuestion();return;} await finishReviewQuiz();}
async function finishReviewQuiz(){
  const s=reviewState,correct=s.answers.filter(x=>x.ok).length,elapsed=Math.max(1,Math.ceil((Date.now()-s.startedAt)/1000)),accuracy=Math.round(correct/5*100);
  const baseReward=REVIEW_LEVELS[s.level]?.reward||0;
  const bonus=claimReviewBonus(s.unitId,s.level);
  const totalReward=baseReward+bonus;
  saveReviewHistory(s.unitId,s.level);
  const wrong=s.answers.filter(x=>!x.ok);
  const min=Math.floor(elapsed/60),sec=elapsed%60;
  const lines=[
    `${getReviewUnit(s.unitId).title}・${REVIEW_LEVELS[s.level].label}を最後までやり切りました。`,
    `${correct}問／5問正解（正解率 ${accuracy}％）`,
    `タイム：${min?min+"分":""}${sec}秒`,
    `クリア報酬：${baseReward}GP`,
    `本日初回ボーナス：${bonus}GP`,
    `合計：${totalReward}GP`
  ];
  if(wrong.length){lines.push("","まちがえた問題");wrong.forEach((x,i)=>lines.push(`${i+1}. ${x.q}\n【正しい答え】${x.correct}${x.unit||""}\n【解説】${x.why||"プリントの内容をもう一度確認しよう。"}`));}
  else lines.push("","全問正解です！");
  await s.context.complete({isPerfect:correct===5,correctCount:correct,totalQuestions:5,elapsedSeconds:elapsed,rewardOverride:totalReward,performanceRewardOverride:baseReward,accuracyPercent:accuracy,reviewBonus:bonus,message:lines.join("\n")});
}

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
window.getReviewDailyBonusStatus=(subject)=>{
  const bonuses=getReviewDaily().bonuses;
  return subject ? bonuses[subject] : bonuses;
};
window.openReviewDailyTarget=async(subject,level)=>{
  const unitId=subject==="social"?"social_world":"unit_average";
  const unit=getReviewUnit(unitId);
  if(!(unit?.questions?.[level]||[]).length) return false;
  if(typeof changeScreen==="function") await changeScreen("quest");
  startReviewQuiz(unitId,level);
  return true;
};
