'use strict';
/* -------- map input -------- */
let drag=null;
/* the map cursor says what a click would do: attack, move, or nothing */
function setMapCursor(x,y){let k='pointer';
  if(S&&!S.editor&&inb(x,y)&&!(x===HERO().x&&y===HERO().y)){const o=objAt(x,y);
    if(!S.explored[idx(x,y)])k='unavailable';else if(rivalAt(x,y)||(o&&(o.type==='neutral'||o.type==='relic'||spireFoe(o))))k='target';
    else if(!isFinite(terrainCost(x,y))&&!townFoot(x,y)&&!(o&&o.type==='town'))k='unavailable';else k='move';}
  const hs={pointer:'3 3',target:'12 12',move:'6 6',unavailable:'12 12'}[k];mapCv.style.cursor=`url(${ART_BASE}ui/cursors/${k==='move'?'move_small':k}.png) ${hs}, ${k==='unavailable'?'not-allowed':k==='target'?'crosshair':'pointer'}`;}
const tileOf=e=>{const r=mapCv.getBoundingClientRect();return[Math.floor((e.clientX-r.left+camX)/TS),Math.floor((e.clientY-r.top+camY)/TS)];};
mapCv.addEventListener('pointerdown',e=>{closeHeroMenu();
  if(S&&S.editor&&e.button===0&&!modalOpen){const[x,y]=tileOf(e);try{mapCv.setPointerCapture(e.pointerId);}catch(_){}edPointer('down',x,y);return;}
  drag={x:e.clientX,y:e.clientY,cx:camX,cy:camY,moved:false,id:e.pointerId,ed:!!(S&&S.editor)};});
mapCv.addEventListener('contextmenu',e=>{if(S&&S.editor)e.preventDefault();});
mapCv.addEventListener('wheel',e=>{if(!S)return;e.preventDefault();camTX=camTY=null;camX+=e.deltaX||0;camY+=e.deltaY;clampCam();},{passive:false});
mapCv.addEventListener('pointermove',e=>{
  const r=mapCv.getBoundingClientRect();
  if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.abs(dx)+Math.abs(dy)>6){drag.moved=true;try{mapCv.setPointerCapture(drag.id);}catch(_){}}
    if(drag.moved){camTX=camTY=null;camX=drag.cx-dx;camY=drag.cy-dy;clampCam();}}
  if(!S)return;const tx=Math.floor((e.clientX-r.left+camX)/TS),ty=Math.floor((e.clientY-r.top+camY)/TS);
  if(S.editor&&ED.paint&&!drag)edPointer('move',tx,ty);
  hoverTile={x:tx,y:ty};$('#hover').innerHTML=describe(tx,ty);setMapCursor(tx,ty);
});
mapCv.addEventListener('pointerleave',()=>{hoverTile=null;$('#hover').innerHTML='';});
mapCv.addEventListener('pointerup',e=>{
  if(S&&S.editor&&ED.paint){edPointerUp();return;}
  const d=drag;drag=null;if(!d||d.moved||!S||moving||modalOpen||S.over||S.editor)return;
  const r=mapCv.getBoundingClientRect();let x=Math.floor((e.clientX-r.left+camX)/TS),y=Math.floor((e.clientY-r.top+camY)/TS);if(!inb(x,y))return;
  $('#hover').innerHTML=describe(x,y);hoverTile={x,y};
  if(townFoot(x,y)){x=S.town.x;y=S.town.y;}
  if(x===HERO().x&&y===HERO().y){path=null;openHeroMenu();return;}
  // clicking another of your heroes charts a route to meet them (⇄); click again to march, and the trade opens on arrival
  const hi=heroIdxAt(x,y);if(hi>=0&&hi!==S.cur){if(Math.max(Math.abs(x-HERO().x),Math.abs(y-HERO().y))<=1&&!(x===S.town.x&&y===S.town.y&&HERO().x===x&&HERO().y===y)){openTrade(hi);return;}
    const o2=S.heroes[hi],rt=HERO().route;if(path&&rt&&rt.meet===o2.id){walk();return;}const mp=meetPath(hi);if(!mp){toast(`No route to ${o2.name}. Select them with their portrait above the map.`);return;}setPath(mp,o2.id);return;}
  if(path&&path.length&&path[path.length-1].x===x&&path[path.length-1].y===y){walk();return;}
  const p=planTo(x,y);if(!p){setPath(null);if(S.explored[idx(x,y)])toast(tileAt(x,y)===T.LAKE&&!HERO().boat?'You need a boat to sail there. Buy one at a dock.':'No route leads there.');return;}setPath(p);
});
mapCv.addEventListener('pointercancel',()=>{drag=null;});
/* double-click your town on the map to open it */
mapCv.addEventListener('dblclick',e=>{if(!S||S.editor||moving||modalOpen||S.over)return;const r=mapCv.getBoundingClientRect(),x=Math.floor((e.clientX-r.left+camX)/TS),y=Math.floor((e.clientY-r.top+camY)/TS);
  if(townFoot(x,y)||(x===S.town.x&&y===S.town.y)){path=null;$('#bTown').click();return;}
  const o=objAt(x,y);if(o&&o.type==='camp'&&o.owned===ME()){path=null;if(o.built)openTown(o);else manageHolding(o);}});
/* clicking your own hero opens a small menu of orders right beside it */
/* Gather: walk to the nearest ready weekly site or moonwell (then loose pickups, then unclaimed mines) */
async function gatherNext(){if(!S||moving||modalOpen||S.over)return;closeHeroMenu();const h=HERO(),wk=weekNo();
  const tiers=[o=>(o.type==='site'&&o.week!==wk)||(o.type==='well'&&o.day!==S.day),o=>o.type==='pile'||o.type==='gem'||o.type==='chest',o=>o.type==='mine'&&o.owned!==ME()];
  for(const ok of tiers){const cand=S.objs.filter(o=>ok(o)&&S.explored[idx(o.x,o.y)]).sort((a,b)=>Math.max(Math.abs(a.x-h.x),Math.abs(a.y-h.y))-Math.max(Math.abs(b.x-h.x),Math.abs(b.y-h.y))).slice(0,10);
    let best=null;for(const o of cand){const p=planTo(o.x,o.y);if(p&&p.length&&(!best||p.length<best.p.length))best={o,p};}
    if(best){path=best.p;toast(`${h.name} heads for the ${describe(best.o.x,best.o.y).replace(/<[^>]+>/g,'').split(' · ')[0]}.`);await walk();return;}}
  toast('Nothing left to gather that you can reach. New weekly sites refill on Day 1 of each week.');}
/* Meet: walk next to another of your heroes, then trade troops */
async function meetHero(i){if(!S||moving||modalOpen)return;closeHeroMenu();const o=S.heroes[i],h=HERO();if(!o)return;
  if(Math.max(Math.abs(o.x-h.x),Math.abs(o.y-h.y))<=1){openTrade(i);return;}
  const best=meetPath(i);if(!best){toast(`No route to ${o.name}.`);return;}setPath(best,o.id);await walk();if(HERO().route)toast(`${HERO().name} will reach ${o.name} on a later day. The route is kept.`);}
function meetPath(i){const o=S.heroes[i];let best=null;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const x=o.x+dx,y=o.y+dy;if(!inb(x,y)||objAt(x,y)||heroIdxAt(x,y)>=0)continue;const p=planTo(x,y);if(p&&p.length&&(!best||p.length<best.length))best=p;}return best;}
/* trade troops between two heroes standing side by side: click a stack to send it across, ½ to send half, arrows to send everything */
async function openTrade(i){const a=HERO(),b=S.heroes[i];if(!b||modalOpen)return;closeHeroMenu();
  const side=(h,tag)=>`<div class="trside"><div class="trhead"><img src="${iconURL('hero',h.id,128)}" alt=""><b>${esc(h.name)}</b></div><div class="trslots">${Array.from({length:7},(_,j)=>{const g=h.army[j];return g?`<button class="slot" data-tr="${tag}${j}" title="${g.n} ${U[g.k].pl}: click to send across"><img class="${U[g.k].up?'upg':''}" src="${iconURL('unit',g.k,64)}" alt=""><b>${g.n}</b>${g.n>1?`<span class="half" data-trh="${tag}${j}" title="Send half">½</span>`:''}</button>`:'<div class="slot empty"></div>';}).join('')}</div></div>`;
  const body=()=>`<div class="trade">${side(a,'a')}<div class="trmid"><button class="btn" data-trall="ab" title="Send all but one stack to ${esc(b.name)}">⇢</button><button class="btn" data-trall="ba" title="Send all but one stack to ${esc(a.name)}">⇠</button></div>${side(b,'b')}</div><p class="muted">Each hero must keep at least one stack. Stacks of the same troop merge.</p>`;
  const pr=showModal({title:`${esc(a.name)} meets ${esc(b.name)}`,body:body(),wide:true,buttons:[{label:'Done',value:1,primary:true}],dismiss:1});const m=$('#modal'),bd=m.querySelector('.body');
  const move=(from,to,j,n)=>{const st=from[j];if(!st)return;n=Math.min(n,st.n);if(n===st.n&&from.length<=1)return toast('Each hero must keep at least one stack.');const ex=to.find(x=>x.k===st.k);if(!ex&&to.length>=7)return toast('No free slot on that side.');
    if(ex)ex.n+=n;else to.push({k:st.k,n});st.n-=n;if(st.n<=0)from.splice(j,1);};
  bd.addEventListener('click',e=>{const hf=e.target.closest('[data-trh]'),t=e.target.closest('[data-tr]'),al=e.target.closest('[data-trall]');
    if(hf){const s2=hf.dataset.trh,j=+s2.slice(1),[f,t2]=s2[0]==='a'?[a.army,b.army]:[b.army,a.army];move(f,t2,j,Math.floor(f[j].n/2));}
    else if(t){const s2=t.dataset.tr,j=+s2.slice(1),[f,t2]=s2[0]==='a'?[a.army,b.army]:[b.army,a.army];move(f,t2,j,f[j].n);}
    else if(al){const[f,t2]=al.dataset.trall==='ab'?[a.army,b.army]:[b.army,a.army];for(let j=f.length-1;j>=1;j--)move(f,t2,j,f[j].n);}
    else return;bd.innerHTML=body();renderUI();});
  await pr;renderUI();save();}
function closeHeroMenu(){const m=$('#hmenu');if(m&&!m.hidden){m.hidden=true;m.innerHTML='';}}
function openHeroMenu(){
  const h=HERO(),m=$('#hmenu'),onTown=h.x===S.town.x&&h.y===S.town.y;
  const items=[['end','End day','E',true],...(onTown?[['enter','Enter town','',true]]:[['town','Town','T',true]]),['gather','Gather (nearest weekly site)','G',true],...S.heroes.map((x,i)=>i===S.cur?null:['meet:'+i,`Meet ${x.name}`,'',true]).filter(Boolean),...(S.heroes.length>1?[['next','Next hero','H',true]]:[]),['sheet','Hero details','',true],['close','Close','Esc',true]];
  m.innerHTML=`<b>${h.name}</b><span class="muted" style="font-size:15px;padding:0 2px">${fmt(h.mp)} movement left</span>`+items.map(([k,l,kb])=>`<button class="btn${k==='end'?' primary':''}" data-hm="${k}">${l}${kb?`<span class="kbd">${kb}</span>`:''}</button>`).join('');
  m.hidden=false;const wrap=m.parentElement.getBoundingClientRect(),mw=m.offsetWidth,mh=m.offsetHeight;
  let lx=h.x*TS+TS+6-camX,ly=h.y*TS-camY-10;if(lx+mw>wrap.width-6)lx=h.x*TS-camX-mw-6;
  m.style.left=clamp(lx,6,wrap.width-mw-6)+'px';m.style.top=clamp(ly,6,wrap.height-mh-6)+'px';
  m.querySelector('[data-hm="end"]').focus({preventScroll:true});
}
$('#hmenu').addEventListener('click',e=>{const b=e.target.closest('[data-hm]');if(!b)return;const k=b.dataset.hm;closeHeroMenu();
  if(k==='gather'){gatherNext();return;}if(k.startsWith('meet:')){meetHero(+k.slice(5));return;}
  if(k==='end')endDay();else if(k==='enter')arriveTown();else if(k==='town')$('#bTown').click();else if(k==='next')selectHero((S.cur+1)%S.heroes.length);else if(k==='sheet')openHeroSheet();});
$('#objective').onclick=()=>{if(!S||modalOpen)return;const o=$('#objective')._txt||{};
  showModal({title:o.head||'Your goal',body:`<div class="relics" style="grid-template-columns:repeat(${RELICS.length},1fr)">${RELICS.map((Rl,i)=>{const st=relicState(i);return`<div class="rl ${st.cls}" title="${Rl.name}: ${st.txt}"><img src="${iconURL('relic',i,56)}" alt=""><span>${st.short}</span></div>`;}).join('')}</div>
    <p>${o.gtxt||''}${S.town.built.reliquary||S.mode==='conquest'?'':` <b>Build the ${altarName()} first.</b>`} Rumours arrive each week.</p><p class="muted">Faction power: <b>${FAC[S.fac].mech}</b>. ${FAC_BLURB[S.fac]}</p>`,buttons:[{label:'Close',value:1,primary:true}],dismiss:1});};
$('#bMenu').onclick=async()=>{if(!S||moving||modalOpen)return;closeHeroMenu();
  const GM=[['save','💾','Save game'],['load','📂','Load game'],['adv','🏗',S&&S.noAdvisor?'Town advisor: off':'Town advisor: on'],['rep','📜','Weekly report'],['edit','🗺','Map editor'],['quit','🚪','Quit to title']];
  const gp=showModal({title:'Game menu',body:`<p class="gmhelp">Click a tile to plan a route, click the flag to march. Keys: <b>E</b> end day · <b>T</b> town · <b>H</b> next hero · <b>G</b> gather · <b>C</b> centre. The game saves itself every day.</p>
    <div class="gmgrid">${GM.map(([v,i,l])=>`<button class="btn gmb${v==='adv'&&S&&!S.noAdvisor?' on':''}" data-gm="${v}"><span>${i}</span>${l}</button>`).join('')}</div>`,top:true,buttons:[{label:'✕',value:0}],dismiss:0});
  {const m=$('#modal');m.querySelector('.sheet').classList.add('gmenu');m.querySelector('header .btn').title='Back to the map';m.querySelector('.body').addEventListener('click',e=>{const b=e.target.closest('[data-gm]');if(b)m._close(b.dataset.gm);});}
  const v=await gp;
  if(v==='adv'&&S){S.noAdvisor=!S.noAdvisor;toast(S.noAdvisor?'The town advisor will stay quiet.':'The town advisor will ask before each day ends.');save();}
  if(v==='rep'&&S)await weeklyReport();
  if(v==='save')await saveGame();
  else if(v==='load'){await loadGame();}
  else if(v==='edit'){save();S=null;terrainCv=null;terrainPh=null;openEditor();}
  else if(v==='quit'){save();S=null;terrainCv=null;terrainPh=null;title();}};
$('#bEnd').onclick=()=>{closeHeroMenu();endDay();};
$('#bTown').onclick=()=>{if(!S||moving||modalOpen)return;const h=HERO();if(h.x===S.town.x&&h.y===S.town.y){arriveTown();return;}const mt=myMajors().find(o=>o.x===h.x&&o.y===h.y);if(mt)arriveTown(mt);else openTown();};
$('#bCenter').onclick=()=>S&&centerOn(HERO().x,HERO().y);
/* quick icons beside Town and Hero: your town and holdings, and each hero; click to go there or select */
function renderQuick(){if(!S)return;const hold=S.objs.filter(o=>o.type==='camp'&&o.owned===ME()&&!o.built),maj=myMajors();
  const todo=t=>withTown(t,()=>townTabs().filter(x=>x.id!=='overview').reduce((a,x)=>a+(x.n||0),0)),tn=S.town.taken?0:todo(S.town);
  $('#qTowns').innerHTML=`<button class="qi" data-q="t" title="${esc(S.town.name)}${S.town.taken?' (held by a rival)':tn?': something to build or recruit':': open the town'}"><img src="${iconURL('crest',S.fac,52)}" alt="">${tn?'<i class="todo"></i>':''}</button>`+maj.map(o=>{const n=todo(o);return`<button class="qi" data-q="m:${o.id}" title="${esc(campName(o))}${n?': something to build or recruit':': open the town'}"><img src="${iconURL('crest',o.fac,52)}" alt="">${n?'<i class="todo"></i>':''}</button>`;}).join('')+hold.map(o=>{const pn=Object.values(o.pool||{}).reduce((a,n)=>a+n,0);return`<button class="qi" data-q="c:${o.id}" title="${esc(campName(o))}: +${fmt(campIncome(o))} gold a day${pn?` · ${pn} troops waiting`:''}"><img src="${iconURL('crest',o.fac||S.fac,52)}" alt="">${pn?'<i class="todo"></i>':''}</button>`;}).join('');
  $('#qHeroes').innerHTML=S.heroes.map((x,i)=>`<button class="qi hero${i===S.cur?' on':''}" data-q="h:${i}" title="${esc(x.name)} · level ${x.lvl} · ${x.mp>60?fmt(x.mp)+' movement left':'done for today'}"><img src="${iconURL('hero',x.id,84)}" alt="">${x.mp>60?'<i></i>':''}</button>`).join('');}
$('#cmdbar').addEventListener('click',e=>{const b=e.target.closest('[data-q]');if(!b||!S||moving||modalOpen)return;const v=b.dataset.q;
  if(v==='t'){centerOn(S.town.x,S.town.y);if(!S.town.taken)$('#bTown').click();}
  else if(v[0]==='m'){const o=S.objs.find(q=>q.id===+v.slice(2));if(o){centerOn(o.x,o.y);const h=HERO();if(h.x===o.x&&h.y===o.y)arriveTown(o);else openTown(o);}}
  else if(v[0]==='c'){const o=S.objs.find(q=>q.id===+v.slice(2));if(o)centerOn(o.x,o.y);}
  else selectHero(+v.slice(2));});
addEventListener('keydown',e=>{
  if(e.key==='Escape'&&!$('#hmenu').hidden){closeHeroMenu();return;}
  if(e.key==='Escape'){if(bt&&bt.targeting){bt.targeting=null;updateBattleUI();return;}const m=$('#modal');if(modalOpen&&m._dismiss!==undefined){m._close(m._dismiss);}return;}
  if(e.target.closest&&e.target.closest('input'))return;
  if(bt){if(!bt.pending||modalOpen)return;const k=e.key.toLowerCase();if(k==='w')$('#bWait').click();else if(k==='d')$('#bDefend').click();else if(k==='s')$('#bSpell').click();else if(k==='a')$('#bAuto').click();return;}
  if(modalOpen||!S)return;const k=e.key.toLowerCase();
  if(S.editor&&!e.key.startsWith('Arrow'))return;
  if(k==='h'&&S.heroes.length>1)selectHero((S.cur+1)%S.heroes.length);
  else if(k==='e')endDay();else if(k==='g')gatherNext();else if(k==='t')$('#bTown').click();else if(k==='c')$('#bCenter').click();
  else if(e.key.startsWith('Arrow')){camTX=camTY=null;const st=TS*2;if(e.key==='ArrowLeft')camX-=st;if(e.key==='ArrowRight')camX+=st;if(e.key==='ArrowUp')camY-=st;if(e.key==='ArrowDown')camY+=st;clampCam();e.preventDefault();}
});
addEventListener('resize',()=>{sizeMap();if(bt){layoutBattle();renderBG();}});
function frame(){if(bt)drawBattle();else drawMap();requestAnimationFrame(frame);}
