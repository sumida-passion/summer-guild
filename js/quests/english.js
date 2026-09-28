"use strict";
/* 英語ギルド：意味選び→空欄補充。既存の意味テスト記録を引き継ぐ。 */
(() => {
  const WORDS=window.ENGLISH_GUILD_PHRASES;
  const KEY="summerGuildEnglishPhrasesV1", REWARD=5;
  const root=document.getElementById("englishGuildContent");
  let progress=read(), run=null, timer=null, busy=false, pending=null;
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function safeInt(n,max=10){return Math.max(0,Math.min(max,Math.floor(Number(n)||0)));}
  function read(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||"null")||{};
      if(v.version===2) return {version:2,completed:safeInt(v.completed),meaningCompleted:safeInt(v.meaningCompleted),received:safeInt(v.received),ranks:v.ranks&&typeof v.ranks==='object'?v.ranks:{},records:v.records&&typeof v.records==='object'?v.records:{},meaningRecords:v.meaningRecords&&typeof v.meaningRecords==='object'?v.meaningRecords:{},rewarded:v.rewarded&&typeof v.rewarded==='object'?v.rewarded:{}};
      // v1 only had the meaning test. Preserve its clears and results without calling them two-part clears.
      return {version:2,completed:0,meaningCompleted:safeInt(v.completed),received:safeInt(v.received),ranks:{},records:{},meaningRecords:v.records&&typeof v.records==='object'?v.records:{},rewarded:{}};
    }catch(_){return {version:2,completed:0,meaningCompleted:0,received:0,ranks:{},records:{},meaningRecords:{},rewarded:{}};}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(progress));return true;}catch(e){console.warn('英語ギルドの記録を保存できません',e);return false;}}
  function clock(ms){const sec=Math.floor(ms/1000);return `${Math.floor(sec/60)}分${String(sec%60).padStart(2,'0')}秒`;}
  function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){let j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
  function rank(m,n){const s=Math.floor(n*.02),a=Math.max(s+1,Math.round(n*.05)),b=Math.max(a+1,Math.round(n*.10)),c=Math.max(b+1,Math.round(n*.19));return m<=s?'S':m<=a?'A':m<=b?'B':m<=c?'C':'D';}
  function rankValue(v){return {S:5,A:4,B:3,C:2,D:1}[v]||0;}
  function elapsed(){return run?run.elapsed+(run.runningSince===null?0:performance.now()-run.runningSince):0;}
  function pause(){if(run&&run.runningSince!==null){run.elapsed=elapsed();run.runningSince=null;}if(timer){clearInterval(timer);timer=null;}}
  function resume(){if(!run||run.runningSince!==null)return;run.runningSince=performance.now();timer=setInterval(()=>{const el=root.querySelector('[data-clock]');if(el)el.textContent=clock(elapsed());},250);}
  function cancel(){pause();if(pending){clearTimeout(pending);pending=null;}run=null;busy=false;}
  function open(){cancel();progress=read();home();changeScreen('englishguild');}
  function home(){cancel();root.innerHTML=`<div class="eg-master"><span class="eg-avatar" aria-hidden="true">📜</span><div><strong>英語ギルドマスター</strong><p>10個ずつ熟語を渡すよ。意味選びと（　）埋めの両方をクリアして、次の手引きを受け取ろう。</p></div></div><div class="eg-grid">${Array.from({length:10},(_,i)=>{const id=i+1,unlocked=id<=progress.completed+1,received=id<=progress.received,record=progress.records[id],meaningDone=id<=progress.meaningCompleted;return `<article class="eg-stage ${unlocked?'':'eg-locked'}"><small>STAGE ${id} · ${id*10}問×2</small><h3>熟語 ${i*10+1}〜${id*10}</h3><p>${record?`最高 ${escape(progress.ranks[id])} ／ ミス${record.mistakes}回 ／ ${clock(record.ms)}`:meaningDone&&unlocked?'意味選びクリア・（　）埋めに挑戦':received?'手引き受け取り済み':'マスターから受け取る'}</p><button type="button" data-stage="${id}" ${unlocked?'':'disabled'}>${received?'手引きを見る':'熟語10個を受け取る'}</button></article>`}).join('')}</div>`;}
  function guide(stage){cancel();if(stage<1||stage>progress.completed+1)return home();if(stage>progress.received){progress.received=stage;save();}const start=(stage-1)*10,meaningDone=stage<=progress.meaningCompleted;root.innerHTML=`<div class="eg-master"><span class="eg-avatar" aria-hidden="true">📜</span><div><strong>英語ギルドマスター</strong><p>新しい熟語10個と、前に覚えた熟語を合わせて挑戦しよう。</p></div></div><h3>第${stage}の手引き <small>新しい10個</small></h3><ol class="eg-guide">${WORDS.slice(start,start+10).map((w,i)=>`<li><span>${start+i+1}. <b lang="en">${escape(w.english)}</b></span><span>${escape(w.meaning)}</span></li>`).join('')}</ol><div class="eg-actions"><button type="button" data-action="start" data-stage="${stage}">${meaningDone?'（　）埋めから再開':'意味選びから '+stage*10+'問×2 に挑戦'}</button><button type="button" data-action="home">一覧へ戻る</button></div>`;}
  function start(stage){if(stage<1||stage>progress.completed+1||stage>progress.received)return;cancel();const skipMeaning=stage<=progress.meaningCompleted&&stage>progress.completed;const prior=skipMeaning?progress.meaningRecords[stage]:null;run={stage,total:stage*10,part:skipMeaning?2:1,index:0,mistakes:prior?safeInt(prior.mistakes,10000):0,elapsed:prior&&Number.isFinite(Number(prior.ms))?Math.max(0,Number(prior.ms)):0,runningSince:null};resume();question();}
  function question(message=''){
    if(!run)return;busy=false;
    const w=WORDS[run.index],blank=run.part===2;
    const choices=blank?shuffle(w.blank.choices):shuffle([w.meaning,...shuffle(WORDS.filter((other,i)=>i!==run.index&&other.meaning!==w.meaning)).slice(0,3).map(other=>other.meaning)]);
    const prompt=blank?`${escape(w.blank.prompt)}`:escape(w.english);
    root.innerHTML=`<div class="eg-playbar"><span>第${run.stage}テスト · ${blank?'②（　）埋め':'①意味選び'}　${run.index+1} / ${run.total}</span><span>ミス ${run.mistakes}回</span><span data-clock>${clock(elapsed())}</span></div><div class="eg-progress"><i style="width:${((run.part-1)*run.total+run.index)/(2*run.total)*100}%"></i></div><p class="eg-block">パート${run.part} · ${Math.floor(run.index/10)+1} / ${run.stage} ブロック</p><div class="eg-prompt"><small>${blank?`「${escape(w.meaning)}」になるよう（　）に入る語を選ぼう`:'この熟語の意味は？'}</small><strong lang="en">${prompt}</strong></div>${message?`<p class="eg-feedback" role="status">${escape(message)}</p>`:''}<div class="eg-choices">${choices.map((v,i)=>`<button type="button" data-choice="${i}">${escape(v)}</button>`).join('')}</div><div class="eg-actions"><button type="button" data-action="quit">テストをやめる</button></div>`;
    root.querySelectorAll('[data-choice]').forEach((btn,i)=>btn.addEventListener('click',()=>answer(choices[i],btn)));
  }
  function answer(value,button){
    if(!run||busy)return;busy=true;const current=run,correct=run.part===2?WORDS[run.index].blank.answer:WORDS[run.index].meaning,right=value===correct;
    button.classList.add(right?'eg-correct':'eg-wrong');root.querySelectorAll('[data-choice]').forEach(b=>{b.disabled=true;if(b.textContent===correct)b.classList.add('eg-correct');});
    if(!right)run.mistakes++;
    pending=setTimeout(()=>{
      pending=null;if(run!==current)return;
      if(!right){run.index=run.index<10?0:Math.floor(run.index/10)*10-1;question(`正解は「${correct}」。このパートの区切りに戻ろう！`);return;}
      run.index++;
      if(run.index===run.total){pause();if(run.part===1){partTransition();return;}finish();return;}
      if(run.index%10===0){pause();checkpoint();return;}
      question();
    },right?320:850);
  }
  function checkpoint(){const done=run.index;root.innerHTML=`<div class="eg-check"><small>CHECKPOINT · パート${run.part}</small><h3>${done}問目まで到達！</h3><p>次に間違えたら、このパートの${done}問目から再開するよ。</p><p>現在のタイム：${clock(elapsed())}　ミス：${run.mistakes}回</p><div class="eg-actions"><button type="button" data-action="continue">次の10問へ</button><button type="button" data-action="quit">テストをやめる</button></div></div>`;}
  function partTransition(){
    if(run.stage>progress.meaningCompleted){progress.meaningCompleted=run.stage;progress.meaningRecords[run.stage]={mistakes:run.mistakes,ms:Math.round(run.elapsed)};save();}
    root.innerHTML=`<div class="eg-check"><small>PART 1 CLEAR</small><h3>意味選びを完走！</h3><p>${run.total}問をクリア。次は同じ熟語を使って、英語の（　）を埋めよう。</p><p>タイム：${clock(elapsed())}　ミス：${run.mistakes}回</p><div class="eg-actions"><button type="button" data-action="next-part">（　）埋めへ進む</button><button type="button" data-action="quit">いったん終了</button></div></div>`;
  }
  function finish(){
    pause();const {stage,mistakes}=run,ms=Math.round(run.elapsed),total=stage*20,value=rank(mistakes,total),first=stage>progress.completed;
    const old=progress.records[stage];if(!old||mistakes<old.mistakes||(mistakes===old.mistakes&&ms<old.ms))progress.records[stage]={mistakes,ms};
    if(rankValue(value)>rankValue(progress.ranks[stage]))progress.ranks[stage]=value;
    progress.completed=Math.max(progress.completed,stage);
    // Reward marker is stored before addGp. In the rare event GP cannot save, never pay again automatically.
    const reward=first&&!progress.rewarded[stage]&&typeof addGp==='function'&&typeof getGp==='function'?REWARD:0;
    if(reward)progress.rewarded[stage]=true;
    const stored=save();let awarded=0;
    if(stored&&reward){const before=getGp();addGp(REWARD);if(getGp()>=before+REWARD)awarded=REWARD;}
    run=null;
    root.innerHTML=`<div class="eg-result"><small>STAGE ${stage} · 2 PARTS CLEAR</small><h3>ランク <b>${value}</b></h3><p>意味選びと（　）埋め、各${stage*10}問を完走！</p><div class="eg-stats"><span>タイム<strong>${clock(ms)}</strong></span><span>間違えた回数<strong>${mistakes}回</strong></span><span>最高ランク<strong>${escape(progress.ranks[stage])}</strong></span><span>GP<strong>+${awarded}</strong></span></div>${!stored?'<p class="eg-feedback">記録を保存できませんでした。端末の保存設定を確認してください。</p>':''}<div class="eg-actions">${stage<10?`<button type="button" data-action="guide" data-stage="${stage+1}">次の熟語10個を受け取る</button>`:'<button type="button" data-action="guide" data-stage="10">もう一度挑戦</button>'}<button type="button" data-action="home">ステージ一覧</button></div></div>`;
  }
  root.addEventListener('click',event=>{const target=event.target.closest('button');if(!target)return;const stage=Number(target.dataset.stage),action=target.dataset.action;if(target.dataset.stage&&!action){guide(stage);return;}if(action==='guide')guide(stage);if(action==='start')start(stage);if(action==='continue'){resume();question();}if(action==='next-part'&&run){run.part=2;run.index=0;resume();question();}if(action==='home'||action==='quit')home();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();else if(run&&root.querySelector('.eg-choices'))resume();});
  window.EnglishGuild={open,close:cancel,rank,words:WORDS};
})();
