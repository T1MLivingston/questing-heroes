'use strict';
/* ================= TUTORIAL (v42) =================
   A guide panel that walks a new player through the first week. Each step says what to do, glows the button or map spot
   to use, and finishes itself when its condition is met (checked every 400 ms). State lives in S.tut so it saves with the game.
   It is switched on from Choose your game (on by default until a first tutorial has been started on this browser). */
const TUT_SEEN='questing-heroes-tutorial-seen';
const tutSeen=()=>{try{return !!localStorage.getItem(TUT_SEEN);}catch(e){return true;}};
const tutMarkSeen=()=>{try{localStorage.setItem(TUT_SEEN,'1');}catch(e){}};
const myMines=()=>S.objs.filter(o=>o.type==='mine'&&o.owned===ME());
const townOpen=()=>{const m=$('#modal');return m&&!m.hidden&&!!m.querySelector('[data-tab="build"]');};
const tabOpen=t=>{const b=document.querySelector(`#modal [data-tab="${t}"]`);return !!b&&b.classList.contains('on');};
const powerNow=()=>armyPower(HERO().army,HERO());
/* the nearest mine nobody owns, as the map target for the "claim a mine" step */
function tutNearMine(){const h=HERO();let best=null,bd=1e9;for(const o of S.objs){if(o.type!=='mine'||o.owned)continue;const d=Math.hypot(o.x-h.x,o.y-h.y);if(d<bd){bd=d;best=o;}}return best;}
/* the weakest monster stack you can see, as the map target for the first fight */
function tutWeakMonster(){const h=HERO();let best=null,bs=1e18;for(const o of S.objs){if(o.type!=='neutral'||o.guard||o.key||!S.explored[idx(o.x,o.y)])continue;const p=armyPower([{k:o.k,n:o.n}])+Math.hypot(o.x-h.x,o.y-h.y)*20;if(p<bs){bs=p;best=o;}}return best;}

const TUT_STEPS=[
  {t:'Welcome, hero',b:'Your goal is to recover the <b>Seven Relics</b> hidden in guarded lairs and bring them home before the time runs out. This guide walks you through your first week. Press <b>Next</b> to begin, or <b>No thanks</b> to play on your own. You can leave the guide at any step.',next:true},
  {t:'Your treasury',b:'The top bar shows your resources. <b>Gold</b> pays for everything; <b>timber</b> and <b>ore</b> build your town; <b>gems</b> and <b>moonwater</b> build the best buildings. Growing these early is the key to winning.',glow:'#res',next:true},
  {t:'Open your town',b:'Click <b>Town</b> (or press <b>T</b>) to open your town. This is where you build, recruit and hire heroes.',glow:'#bTown',done:()=>townOpen()},
  {t:'Build on day one',b:'Open the <b>Build</b> tab. If you can afford it, build the <b>Council Hall</b>: it doubles your daily gold. Otherwise build a troop dwelling. You may build <b>one building a day</b>, so never skip a day.',glow:'#modal [data-tab="build"]',done:()=>S.town.builtToday||S.town.built.hall2},
  {t:'Recruit your army',b:'Open the <b>Recruit</b> tab and press <b>Recruit all</b>. A bigger army means safer exploring and easier fights.',glow:'#modal [data-tab="recruit"]',start:st=>{st.base=powerNow();},done:st=>powerNow()>st.base},
  {t:'Claim a mine',b:'Leave town and walk onto the <b>glowing mine</b>. Every mine you own pays you every day, so claim them early. Click a tile to see the path; click again to go.',map:tutNearMine,start:st=>{st.base=myMines().length;},done:st=>myMines().length>st.base},
  {t:'Use every step',b:'Walk over piles of gold, timber and ore to pick them up. When the green <b>Movement</b> bar is empty, press <b>End day</b> (or <b>E</b>).',glow:'#bEnd',done:()=>S.day>=2},
  {t:'Build a Tavern',b:'A new day! Open your town and build a <b>Tavern</b> so you can hire a second hero.',glow:'#bTown',done:()=>!!S.town.built.tavern||S.heroes.length>=2},
  {t:'Hire a second hero',b:'In the town\'s <b>Tavern</b> tab, hire a second hero. Two heroes explore twice as fast and can ferry troops.',glow:'#modal [data-tab="tavern"]',done:()=>S.heroes.length>=2},
  {t:'Send them gathering',b:'Pick your new hero with their portrait at the top of the map, then open the hero menu (click the hero) and choose <b>Gather</b> (or press <b>G</b>). They walk to the nearest free sites, piles and mines.',glow:'#qHeroes',start:st=>{const h=S.heroes[1];st.pos=h?h.x+','+h.y:'';},done:st=>{const h=S.heroes[1];return !!h&&(h.x+','+h.y!==st.pos||h.mp<maxMPof(h));}},
  {t:'Explore and claim',b:'Push into the fog with both heroes and claim <b>three mines</b>: a sawmill and an ore pit first, then gold. More income means more buildings and troops every week.',map:tutNearMine,done:()=>myMines().length>=3},
  {t:'Win a fight',b:'Wild monsters guard the best loot. Hover a stack to see how strong it is; start with ones marked <b>weak</b> or <b>normal</b>. Walk into one and win the battle (<b>Auto</b> fights for you).',map:tutWeakMonster,done:()=>stats().won>=1},
  {t:'Build every day',b:'Build something in town <b>every day</b>; the <b>Suggested</b> step shows the best next building. Keep exploring with both heroes until the new week begins on day 8.',done:()=>S.day>=8},
  {t:'A new week',b:'Every dwelling has new recruits. Open your town and press <b>Recruit all</b> again, then check the <b>weekly report</b> to see what your rivals are up to.',glow:'#bTown',start:st=>{st.base=powerNow();},done:st=>powerNow()>st.base,next:true},
  {t:'You\'re ready',b:'Watch for <b>relic rumours</b> (circles on the map), clear the guarded lairs, and carry relics to your <b>Relic Hall</b>. Upgrade your mines, build walls before rivals come, and good luck!',next:true,last:true}
];
const maxMPof=h=>{const c=S.cur;S.cur=S.heroes.indexOf(h);const m=maxMP();S.cur=c;return m;};

function tutStart(){S.tut={i:0,st:{}};tutMarkSeen();tutEnter();tutRender();}
function tutEnter(){const s=TUT_STEPS[S.tut.i];S.tut.st={};if(s&&s.start)s.start(S.tut.st);}
function tutAdvance(){S.tut.i++;if(S.tut.i>=TUT_STEPS.length){tutEnd(true);return;}tutEnter();tutRender();save();}
function tutEnd(done){if(S)S.tut=null;tutMarkSeen();document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'));const c=$('#coach');if(c)c.remove();if(done)toast('Tutorial complete. Good luck!');if(S)save();}
function tutRender(){
  let c=$('#coach');if(!S||!S.tut){if(c)c.remove();return;}
  const s=TUT_STEPS[S.tut.i];if(!s){tutEnd(true);return;}
  if(!c){c=document.createElement('div');c.id='coach';c.setAttribute('role','status');document.body.appendChild(c);
    c.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;e.stopPropagation();if(b.dataset.tnext)tutAdvance();else if(b.dataset.tskip)tutEnd(false);else if(b.dataset.tmin){c.classList.toggle('min');}},true);}
  c.innerHTML=`<div class="tc-head"><span>Tutorial · step ${S.tut.i+1} of ${TUT_STEPS.length} · Day ${S.day}</span><button class="tc-min" data-tmin="1" title="Shrink or expand">▾</button></div>
    <h4>${s.t}</h4><p>${s.b}</p><div class="tc-foot">${S.tut.i===0?'<button class="btn sm" data-tskip="1">No thanks, I\'ll play on my own</button>':'<button class="btn sm" data-tskip="1" title="End the tutorial now">✕ Leave tutorial</button>'}${s.next?`<button class="btn sm primary" data-tnext="1">${s.last?'Finish':'Next'}</button>`:'<span class="muted">Do this to continue</span>'}</div>`;
}
function tutGlow(){document.querySelectorAll('.tut-glow').forEach(e=>e.classList.remove('tut-glow'));if(!S||!S.tut)return;const s=TUT_STEPS[S.tut.i];if(s&&s.glow){const el=document.querySelector(s.glow);if(el)el.classList.add('tut-glow');}}
function tutTick(){
  if(!S||!S.tut||S.editor){const c=$('#coach');if(c&&(!S||!S.tut))c.remove();return;}
  if(!$('#coach'))tutRender();
  const s=TUT_STEPS[S.tut.i];if(!s)return;
  try{if(s.done&&s.done(S.tut.st)){tutAdvance();return;}}catch(e){}
  const day=$('#coach .tc-head span');if(day)day.textContent=`Tutorial · step ${S.tut.i+1} of ${TUT_STEPS.length} · Day ${S.day}`;
  tutGlow();
}
setInterval(tutTick,400);
/* called from drawMap (world coordinates): a pulsing ring on the step's map target */
function tutDraw(c){if(!S.tut)return;const s=TUT_STEPS[S.tut.i];if(!s||!s.map)return;let o=null;try{o=s.map();}catch(e){}if(!o)return;
  const t=performance.now()/300,r=TS*(0.75+0.12*Math.sin(t)),cx=o.x*TS+TS/2,cy=o.y*TS+TS/2;
  c.save();c.strokeStyle='rgba(255,214,90,.95)';c.lineWidth=3;c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();
  c.strokeStyle='rgba(255,214,90,.35)';c.lineWidth=8;c.beginPath();c.arc(cx,cy,r+5,0,7);c.stroke();c.restore();}
