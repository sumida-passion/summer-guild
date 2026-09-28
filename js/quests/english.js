"use strict";
/* 英語ギルド：10個ずつ受け取り、既習範囲を累積で確認する。 */
(() => {
  const WORDS = window.ENGLISH_GUILD_PHRASES;
  const KEY = "summerGuildEnglishPhrasesV1";
  const root = document.getElementById("englishGuildContent");
  let progress = read();
  let run = null;
  let timer = null;
  let busy = false;
  const escape = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function read() {
    try {
      const value = JSON.parse(localStorage.getItem(KEY) || "null") || {};
      return {completed:Math.max(0, Math.min(10, Math.floor(Number(value.completed)||0))), ranks:value.ranks && typeof value.ranks === "object" ? value.ranks : {}, records:value.records && typeof value.records === "object" ? value.records : {}, received:Math.max(0, Math.min(10, Math.floor(Number(value.received)||0)))};
    } catch (_) { return {completed:0,ranks:{},records:{},received:0}; }
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(progress)); return true; } catch (e) { console.warn("英語ギルドを保存できません",e); return false; } }
  function clock(ms) { const seconds=Math.floor(ms/1000); return `${Math.floor(seconds/60)}分${String(seconds%60).padStart(2,"0")}秒`; }
  function shuffle(items) { const result=[...items]; for(let i=result.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [result[i],result[j]]=[result[j],result[i]];}return result; }
  function rank(mistakes,total) {
    const s=Math.floor(total*.02), a=Math.max(s+1,Math.round(total*.05)), b=Math.max(a+1,Math.round(total*.10)), c=Math.max(b+1,Math.round(total*.19));
    return mistakes<=s?'S':mistakes<=a?'A':mistakes<=b?'B':mistakes<=c?'C':'D';
  }
  function rankValue(value) { return {S:5,A:4,B:3,C:2,D:1}[value]||0; }
  function elapsed() { return run ? run.elapsed + (run.runningSince===null ? 0 : performance.now()-run.runningSince) : 0; }
  function pause() { if(run && run.runningSince!==null){ run.elapsed=elapsed();run.runningSince=null; } if(timer){clearInterval(timer);timer=null;} }
  function resume() { if(!run || run.runningSince!==null)return;run.runningSince=performance.now();timer=setInterval(()=>{const el=root.querySelector('[data-clock]');if(el)el.textContent=clock(elapsed());},250); }
  function open() { progress=read();pause();run=null;home();changeScreen("englishguild"); }
  function home() {
    pause();run=null;
    root.innerHTML=`<div class="eg-master"><span class="eg-avatar" aria-hidden="true">📜</span><div><strong>英語ギルドマスター</strong><p>新しい熟語を10個ずつ渡そう。覚えたら、これまでの熟語を全部使うテストに挑戦してね。</p></div></div><div class="eg-grid">${Array.from({length:10},(_,i)=>{const id=i+1, unlocked=id<=progress.completed+1, received=id<=progress.received, record=progress.records[id];return `<article class="eg-stage ${unlocked?'':'eg-locked'}"><small>STAGE ${id} · ${id*10}問</small><h3>熟語 ${i*10+1}〜${id*10}</h3><p>${record?`最高 ${escape(progress.ranks[id])} ／ ミス${record.mistakes}回 ／ ${clock(record.ms)}`:received?'手引き受け取り済み':'マスターから受け取る'}</p><button type="button" data-stage="${id}" ${unlocked?'':'disabled'}>${received?'手引きを見る':'熟語10個を受け取る'}</button></article>`}).join('')}</div>`;
  }
  function guide(stage) {
    pause();run=null;
    if(stage>progress.completed+1)return home();
    if(stage>progress.received){progress.received=stage;save();}
    const start=(stage-1)*10;
    root.innerHTML=`<div class="eg-master"><span class="eg-avatar" aria-hidden="true">📜</span><div><strong>英語ギルドマスター</strong><p>新しい熟語を10個渡そう。前の熟語もテストに出るから、忘れていたら手引きを読み返してね。</p></div></div><h3>第${stage}の手引き <small>新しい10個</small></h3><ol class="eg-guide">${WORDS.slice(start,start+10).map((w,i)=>`<li><span>${start+i+1}. <b lang="en">${escape(w.english)}</b></span><span>${escape(w.meaning)}</span></li>`).join('')}</ol><div class="eg-actions"><button type="button" data-action="start" data-stage="${stage}">覚えたら ${stage*10}問に挑戦！</button><button type="button" data-action="home">一覧へ戻る</button></div>`;
  }
  function start(stage) {
    if(stage>progress.completed+1 || stage>progress.received)return;
    pause();run={stage,total:stage*10,index:0,mistakes:0,elapsed:0,runningSince:null};
    resume();question();
  }
  function question(message='') {
    if(!run)return;
    busy=false;
    const word=WORDS[run.index];
    const pool=WORDS.filter((w,i)=>i!==run.index && w.meaning!==word.meaning);
    const distractors=shuffle(pool).slice(0,3).map(w=>w.meaning);
    const choices=shuffle([word.meaning,...distractors]);
    root.innerHTML=`<div class="eg-playbar"><span>第${run.stage}テスト　${run.index+1} / ${run.total}</span><span>ミス ${run.mistakes}回</span><span data-clock>${clock(elapsed())}</span></div><div class="eg-progress"><i style="width:${run.index/run.total*100}%"></i></div><p class="eg-block">${Math.floor(run.index/10)+1} / ${run.stage} ブロック</p><div class="eg-prompt"><small>この熟語の意味は？</small><strong lang="en">${escape(word.english)}</strong></div>${message?`<p class="eg-feedback" role="status">${escape(message)}</p>`:''}<div class="eg-choices">${choices.map((v,i)=>`<button type="button" data-choice="${i}">${escape(v)}</button>`).join('')}</div><div class="eg-actions"><button type="button" data-action="quit">テストをやめる</button></div>`;
    root.querySelectorAll('[data-choice]').forEach((button,i)=>button.addEventListener('click',()=>answer(choices[i],button)));
  }
  function answer(value,button) {
    if(!run || busy)return;
    busy=true;
    const correct=WORDS[run.index].meaning;
    const right=value===correct;
    button.classList.add(right?'eg-correct':'eg-wrong');
    root.querySelectorAll('[data-choice]').forEach(b=>{b.disabled=true;if(b.textContent===correct)b.classList.add('eg-correct');});
    if(!right)run.mistakes++;
    setTimeout(()=>{
      if(!run)return;
      if(!right){run.index=run.index<10?0:(Math.floor(run.index/10)*10-1); // 1〜10のミスなら1問目、11〜20なら10問目へ
        question(`正解は「${correct}」。区切りに戻って再挑戦！`);return;}
      run.index++;
      if(run.index===run.total){finish();return;}
      if(run.index%10===0){pause();checkpoint();return;}
      question();
    },right?320:850);
  }
  function checkpoint() {
    const completed=run.index;
    root.innerHTML=`<div class="eg-check"><small>CHECKPOINT</small><h3>${completed}問目まで到達！</h3><p>ここでひと休み。次に間違えたら、${completed}問目から再開するよ。</p><p>現在のタイム：${clock(elapsed())}　ミス：${run.mistakes}回</p><button type="button" data-action="continue">次の10問へ</button><button type="button" data-action="quit">テストをやめる</button></div>`;
  }
  function finish() {
    pause();const {stage,total,mistakes}=run, ms=Math.round(run.elapsed), value=rank(mistakes,total);
    const existing=progress.records[stage];
    if(!existing || mistakes<existing.mistakes || (mistakes===existing.mistakes && ms<existing.ms))progress.records[stage]={mistakes,ms};
    if(rankValue(value)>rankValue(progress.ranks[stage]))progress.ranks[stage]=value;
    progress.completed=Math.max(progress.completed,stage);
    const stored=save();run=null;
    root.innerHTML=`<div class="eg-result"><small>STAGE ${stage} CLEAR</small><h3>ランク <b>${value}</b></h3><p>${total}問を走り切った！</p><div class="eg-stats"><span>タイム<strong>${clock(ms)}</strong></span><span>間違えた回数<strong>${mistakes}回</strong></span><span>最高ランク<strong>${escape(progress.ranks[stage])}</strong></span></div>${stored?'':'<p class="eg-feedback">記録を保存できませんでした。端末の保存設定を確認してください。</p>'}<div class="eg-actions">${stage<10?`<button type="button" data-action="guide" data-stage="${stage+1}">次の熟語10個を受け取る</button>`:'<button type="button" data-action="guide" data-stage="10">100問にもう一度挑戦</button>'}<button type="button" data-action="home">ステージ一覧</button></div></div>`;
  }
  root.addEventListener('click',event=>{
    const target=event.target.closest('button');if(!target)return;
    const stage=Number(target.dataset.stage), action=target.dataset.action;
    if(target.dataset.stage && !action){guide(stage);return;}
    if(action==='guide')guide(stage);
    if(action==='start')start(stage);
    if(action==='continue'){resume();question();}
    if(action==='home'||action==='quit')home();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();}else if(run && !root.querySelector('.eg-check') && root.querySelector('.eg-choices'))resume();});
  window.EnglishGuild={open,close(){pause();run=null;},rank,words:WORDS};
})();
