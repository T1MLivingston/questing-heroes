'use strict';
/* ================= MUSIC (v52) =================
   Plays assets/music/<track>.mp3 for each screen, cross-fading between them. Missing files are skipped quietly, so the
   game works with any subset of tracks. Browsers only allow sound after the first click, so music starts then.
   Volume and mute are remembered in this browser only. */
const MUSIC_FILES={theme:'theme',map:'map',acoustic:'acoustic',battle:'battle',town:'town',victory:'victory',defeat:'defeat'};
/* which track each scene wants, in order of preference (the first file that exists plays); the map alternates with the acoustic theme */
const MUSIC_SCENE={title:['theme','acoustic'],map:['map','acoustic','theme'],town:['town','acoustic','map'],battle:['battle'],menu:['acoustic','theme']};
const MU={vol:0.5,muted:false,scene:null,cur:null,curK:null,missing:new Set(),ok:new Set(),unlocked:false,mapTurn:0};
try{const v=JSON.parse(localStorage.getItem('questing-heroes-audio')||'{}');if(typeof v.vol==='number')MU.vol=v.vol;MU.muted=!!v.muted;}catch(e){}
const muSave=()=>{try{localStorage.setItem('questing-heroes-audio',JSON.stringify({vol:MU.vol,muted:MU.muted}));}catch(e){}};
const muTarget=()=>MU.muted?0:MU.vol*0.6;
function muFade(a,to,ms,done){const from=a.volume,t0=performance.now();const step=()=>{const k=Math.min(1,(performance.now()-t0)/ms);a.volume=Math.max(0,Math.min(1,from+(to-from)*k));if(k<1)requestAnimationFrame(step);else if(done)done();};step();}
function muTrack(k){const a=new Audio(`${typeof ART_BASE==='string'?ART_BASE:'assets/'}music/${MUSIC_FILES[k]}.mp3`);a.preload='auto';a.volume=0;
  a.addEventListener('error',()=>{MU.missing.add(k);if(MU.curK===k){MU.cur=null;MU.curK=null;muScene(MU.scene,true);}});a.addEventListener('canplay',()=>MU.ok.add(k),{once:true});return a;}
function muPlay(k,loop=true){if(MU.curK===k&&MU.cur)return;const old=MU.cur;if(old)muFade(old,0,900,()=>old.pause());
  const a=muTrack(k);a.loop=loop;MU.cur=a;MU.curK=k;if(!MU.unlocked)return;a.play().then(()=>muFade(a,muTarget(),1200)).catch(()=>{});
  if(!loop)a.addEventListener('ended',()=>{if(MU.cur===a){MU.cur=null;MU.curK=null;muScene(MU.scene,true);}});}
function muScene(sc,force){if(!force&&MU.scene===sc&&MU.cur)return;MU.scene=sc;let list=MUSIC_SCENE[sc]||[];
  if(sc==='map'&&MU.mapTurn%2===1)list=['acoustic','map','theme'];/* every other visit to the map plays the acoustic theme */
  const k=list.find(x=>!MU.missing.has(x));if(k)muPlay(k);else if(MU.cur){const o=MU.cur;MU.cur=null;MU.curK=null;muFade(o,0,800,()=>o.pause());}}
/* short stings at the end of a battle; then the scene music resumes */
function muSting(k){if(MU.missing.has(k)||!MU.unlocked)return;muPlay(k,false);}
/* scene detection: looked up twice a second, so no other code needs to call it */
function muDetect(){let sc='menu';const bt=$('#battle');if(bt&&!bt.hidden)sc='battle';else if($('#modal .titlescreen'))sc='title';else if($('#modal [data-tab="build"]'))sc='town';else if(typeof S!=='undefined'&&S&&S.heroes&&S.heroes.length&&!S.editor)sc='map';
  if(sc==='map'&&MU.scene!=='map'&&MU.scene!==null)MU.mapTurn++;if(MU.curK==='victory'||MU.curK==='defeat'){MU.scene=sc;return;}muScene(sc);}
setInterval(muDetect,500);
document.addEventListener('pointerdown',()=>{if(MU.unlocked)return;MU.unlocked=true;if(MU.cur)MU.cur.play().then(()=>muFade(MU.cur,muTarget(),1200)).catch(()=>{});else muDetect();},{capture:true});
/* the speaker button (bottom left on every screen): click to mute, hover for the volume slider */
function muUI(){const d=document.createElement('div');d.id='muctl';d.innerHTML=`<button id="muBtn" title="Music on or off">${MU.muted?'🔇':'🔊'}</button><input id="muVol" type="range" min="0" max="100" value="${Math.round(MU.vol*100)}" aria-label="Music volume">`;document.body.appendChild(d);
  $('#muBtn').onclick=()=>{MU.muted=!MU.muted;$('#muBtn').textContent=MU.muted?'🔇':'🔊';if(MU.cur)muFade(MU.cur,muTarget(),300);muSave();};
  $('#muVol').oninput=e=>{MU.vol=e.target.value/100;if(MU.muted&&MU.vol>0){MU.muted=false;$('#muBtn').textContent='🔊';}if(MU.cur)MU.cur.volume=muTarget();muSave();};}
muUI();
