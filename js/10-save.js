'use strict';
/* -------- end states, save -------- */
const SAVEKEY='questing-heroes-v4';
function save(){try{if(S&&!S.over){stashPlayer();}if(S&&!S.over)localStorage.setItem(SAVEKEY,JSON.stringify(S));}catch(e){}}
function clearSave(){try{localStorage.removeItem(SAVEKEY);}catch(e){}}
function loadSave(){try{const s=localStorage.getItem(SAVEKEY);return s?JSON.parse(s):null;}catch(e){return null;}}
/* named save slots, besides the automatic save at the end of each day */
const SLOTKEY='questing-heroes-slots';
function loadSlots(){try{return JSON.parse(localStorage.getItem(SLOTKEY)||'[]');}catch(e){return[];}}
async function saveGame(){if(!S||S.over)return;stashPlayer();const d=dateParts();
  const n=await askName('Save game',`${S.town.name} · Month ${d.m} Week ${d.w} Day ${d.d}`,48);if(!n)return false;
  const slot={id:'s'+Date.now().toString(36),name:n,when:new Date().toLocaleString(),fac:S.fac,hero:S.heroes[0]&&S.heroes[0].id,day:S.day,data:JSON.stringify(S)};
  const l=loadSlots().filter(x=>x.name!==n);l.unshift(slot);
  for(let k=l.length;k>0;k--){try{localStorage.setItem(SLOTKEY,JSON.stringify(l.slice(0,k)));if(k<l.length)toast('Storage is full: the oldest saves were dropped.');toast(`Saved “${esc(n)}”.`);return true;}catch(e){}}
  toast('Could not save: browser storage is full or unavailable.');return false;}
async function loadGame(){const l=loadSlots();
  const v=await showModal({title:'Load game',wide:true,top:true,buttons:[{label:'◂ Back',value:null}],dismiss:null,
    body:l.length?`<div class="slots">${l.map(x=>`<div class="slotrow"><img src="${iconURL('crest',x.fac,52)}" alt="">${x.hero?`<img src="${iconURL('hero',x.hero,84)}" alt="">`:''}<div><b>${esc(x.name)}</b><small>Day ${x.day} · saved ${esc(x.when)}</small></div><button class="btn primary sm" data-lslot="${x.id}">Load</button><button class="btn sm" data-dslot="${x.id}">Delete</button></div>`).join('')}</div>`:'<p class="muted">No saved games yet. Use Save game in the ☰ menu during a game.</p>'});
  return v;}
document.addEventListener('click',e=>{const m=$('#modal');if(m.hidden||!m.querySelector('.slots'))return;
  const ld=e.target.closest('[data-lslot]'),dl=e.target.closest('[data-dslot]');
  if(ld){const x=loadSlots().find(q=>q.id===ld.dataset.lslot);if(!x)return;m._close('loaded');S=JSON.parse(x.data);afterLoad();save();toast(`Loaded “${esc(x.name)}”.`);}
  else if(dl){try{localStorage.setItem(SLOTKEY,JSON.stringify(loadSlots().filter(q=>q.id!==dl.dataset.dslot)));}catch(_){}dl.closest('.slotrow').remove();}});
/* campaign stats (v30) and the Hall of Fame: the best scores across games, kept in localStorage */
const stats=()=>S.stats||(S.stats={won:0,lost:0,slain:0,towns:0,heroes:0});
const FAME_KEY='questing-heroes-fame';
const loadFame=()=>{try{return JSON.parse(localStorage.getItem(FAME_KEY)||'[]');}catch(e){return[];}};
function scoreOf(win){const st=stats(),dmul={easy:0.6,normal:1,hard:1.4,expert:1.8}[S.diff||'normal'],days=Math.max(1,S.day),left=Math.max(0,S.limit-S.day);
  const base=(win?5000:0)+left*40+st.won*120+st.towns*400+st.heroes*500+Math.round(st.slain*2)+S.delivered.length*300+allTowns().length*250;
  return Math.round(base*dmul);}
function endStats(win){const st=stats(),d=dateParts(),score=scoreOf(win);let rank=0;
  if(!S.players){const f=loadFame();const rec={score,win,date:new Date().toISOString().slice(0,10),hero:S.heroes[0]?S.heroes[0].name:(HBY[S.heroes0]||{}).name||'',fac:S.fac,mode:S.mode,diff:S.diff||'normal',size:S.size,days:S.day};
    f.push(rec);f.sort((a,b)=>b.score-a.score);rank=f.indexOf(rec)+1;try{localStorage.setItem(FAME_KEY,JSON.stringify(f.slice(0,20)));}catch(e){}}
  const cell=(l,v)=>`<div><em>${l}</em><b>${v}</b></div>`;
  return`<div class="wgrid endgrid">${cell('Days',`${S.day} of ${S.limit}`)}${cell('Battles won',st.won)}${cell('Battles lost',st.lost)}${cell('Foes slain',fmt(st.slain))}${cell('Towns taken',st.towns)}${cell('Rival heroes beaten',st.heroes)}${cell(S.mode==='grail'?'Grails home':'Relics home',S.delivered.length)}</div>
    <div class="endscore"><span>Score</span><b>${fmt(score)}</b>${rank?`<small>${rank===1?'A new best! ':''}#${rank} in your Hall of Fame</small>`:''}</div>`;}
function fameHTML(){const f=loadFame();if(!f.length)return'<p class="muted">No campaigns finished yet. Your best scores will appear here.</p>';
  return`<table class="fame"><tr><th>#</th><th>Score</th><th>Hero</th><th>Result</th><th>Days</th><th>Difficulty</th><th>Date</th></tr>${f.slice(0,10).map((r,i)=>`<tr><td>${i+1}</td><td><b>${fmt(r.score)}</b></td><td><img src="${iconURL('crest',r.fac,52)}" alt=""> ${esc(r.hero)}</td><td>${r.win?'Victory':'Defeat'}</td><td>${r.days}</td><td>${(DIFF[r.diff]||{}).name||r.diff}</td><td>${r.date}</td></tr>`).join('')}</table>`;}
async function victory(){S.over=true;clearSave();const d=dateParts();
  const vt=S.players?`Player ${S.pi+1} wins!`:S.mode==='grail'?'The Oracle is answered':S.mode==='conquest'?'The last banner standing':'The crown is whole';
  await showModal({title:vt,body:(S.mode==='grail'?`<p>The ${(S.goal||[]).map(i=>RELICS[i].name).join(', ')} stand together on the Grail Altar, and the Oracle's flame burns white. The ${FAC[S.fac].name} fly their banners from every hill.</p>`:S.mode==='conquest'&&!S.players?`<p>No rival banner remains. ${S.town.name} rings its bells for the ${FAC[S.fac].name}.</p>`:`<p>The seventh relic settles into the Relic Hall, and the shards of the crown fuse with a sound like a bell. ${S.town.name} rings out, and the ${FAC[S.fac].name} fly their banners from every hill.</p><p class="muted">Victory on Month ${d.m}, Week ${d.w}, Day ${d.d} · ${S.heroes.map(x=>`${x.name} (level ${x.lvl})`).join(', ')}.</p>`)+endStats(true),wide:true,buttons:[{label:'Begin a new campaign',value:1,primary:true}]});
  startNew();}
async function defeat(why){S.over=true;clearSave();
  await showModal({title:'The quest is lost',body:`<p>${why}</p><p class="muted">Every campaign draws a new map. Claim mines early and build your upper dwellings before you push south.</p>`+endStats(false),wide:true,buttons:[{label:'Begin a new campaign',value:1,primary:true}]});
  startNew();}
/* a loading bar while a new map is generated and painted (v30): each step runs after the bar has been drawn */
async function loading(steps){let el=$('#loadbar');if(!el){el=document.createElement('div');el.id='loadbar';el.innerHTML='<div class="lbox"><b></b><div class="lbar"><i></i></div></div>';document.body.appendChild(el);}
  el.hidden=false;const paint=()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
  try{for(let i=0;i<steps.length;i++){el.querySelector('b').textContent=steps[i][0];el.querySelector('i').style.width=`${Math.round(100*(i+0.15)/steps.length)}%`;await paint();steps[i][1]();el.querySelector('i').style.width=`${Math.round(100*(i+1)/steps.length)}%`;await paint();}}
  finally{el.hidden=true;}}
async function startNew(){S=null;applyTheme();const mo=await pickMap();if(!mo){title();return;}if(mo.edit){openEditor();return;}
  if(mo.mode==='multi'){const ps=[];for(let i=0;i<mo.nPlayers;i++)ps.push(await pickFaction({who:`Player ${i+1}`,exclude:ps.map(p=>p.fk)}));
    mo.players=ps;await loading([['Shaping the land…',()=>newGame(ps[0].fk,ps[0].hid,mo)],['Painting the map…',()=>afterLoad()]]);save();await handoff();openTown();return;}
  const{fk,hid}=await pickFaction();mo.artifact=pickedArt;await loading([['Shaping the land…',()=>newGame(fk,hid,mo)],['Painting the map…',()=>{if(pickedCol)S.col=pickedCol;afterLoad();}]]);if(mo.tutorial&&typeof tutStart==='function')tutStart();save();openTown();}
/* v17 roster: troops from older saves move to the new troop of the same tier */
const OLD_ROSTER={wizards:['inkling','hound','sentinel','owl','magus'],necro:['thrall','rats','wraith','barrow','hiero'],centaurs:['hounds','skirm','badger','lancer','bearw'],
  pirates:['deckhand','powder','duelist','harpoon','cannon'],elves:['sprite','longbow','dryad','dancer','stag'],dwarves:['delver','bolt','anvil','smith','ram'],merfolk:['shell','coral','eel','seahorse','choir']};
function migrateRoster(st){if(!st||st.roster>=2)return;const M={};for(const[f,old]of Object.entries(OLD_ROSTER))old.forEach((k,i)=>{const n=FAC[f].units[i];M[k]=n;M[k+'_u']=n+'_u';});
  const fix=k=>M[k]||k;const walk=v=>{if(Array.isArray(v)){v.forEach(walk);return;}if(!v||typeof v!=='object')return;
    if(typeof v.k==='string'&&typeof v.n==='number'&&M[v.k])v.k=fix(v.k);
    for(const key of['pool'])if(v[key]&&typeof v[key]==='object'&&!Array.isArray(v[key])){const o={};for(const[k,n]of Object.entries(v[key]))o[fix(k)]=(o[fix(k)]||0)+n;v[key]=o;}
    if(v.unit&&M[v.unit])v.unit=fix(v.unit);for(const x of Object.values(v))if(x&&typeof x==='object')walk(x);};
  walk(st);st.roster=2;}
/* saves from before v25: new resources, and cities and rival homes you already hold become full towns */
/* v43 renames: old default name → new name, applied to saved heroes that still carry the old name */
const OLD_NAMES={reedcall:['Reedcall','Crestwind'],veyra:['Veyra','Vesra','Mira','Willa'],ossin:['Ossin','Osrin','Dusty'],graven:['Graven','Lore'],zahara:['Zahara','Zarra'],tembor:['Tembor','India'],cresset:['Cresset','Wick'],yselle:['Yselle','Fern'],atoll:['Atoll','Coral'],bess_bell:['Bess Bell','Bonnie'],virel:['Virel','Plume'],silka:['Silka','Ivy','Violet'],murmur:['Murmur','Hush'],tansy:['Tansy','Penny'],briar:['Briar','Rusty']};
function migrateTowns(st){[...(st.heroes||[]),...(st.rivals||[]),...((st.players||[]).flatMap(p=>p&&p.heroes||[]))].forEach(h=>{if(h&&h.id==='elvis'&&h.name==='Elvis')h.name='Eelvis';if(h&&OLD_NAMES[h.id]&&OLD_NAMES[h.id].slice(0,-1).includes(h.name))h.name=OLD_NAMES[h.id].at(-1);});/* v27: the Ranger is now id perry and the Elf id eden (ids match names; new portraits) */
  if(!st.ids27){st.ids27=1;for(const h of [...(st.heroes||[]),...(st.rivals||[]),...(st.players||[]).flatMap(q=>q.heroes||[])]){if(h.id==='eden'){h.id='perry';if(h.name==='Eden'||h.name==='Perry')h.name='Perry';}else if(h.id==='perry'){h.id='eden';if(h.name==='Perry'||h.name==='Eden')h.name='Eden';}}}
  const fix=r=>{if(r)for(const k of RES)if(r[k]==null)r[k]=0;};fix(st.res);(st.players||[]).forEach(q=>fix(q.res));
  if(st.players)return;for(const o of st.objs)if(o.type==='camp'){if(o.free&&o.lvl===3&&o.major===undefined)o.major=true;if(!o.free&&o.fac&&!o.built&&!o.owned)Object.assign(o,{major:true,built:{hall1:1,hall2:1,d1:1,d2:1,d3:1,lib1:1},name:FAC[o.fac].town,pool:{}});if(isMajor(o)&&o.owned&&o.owned===ME()&&!o.built)makeTown(o);}}
function afterLoad(){(S.customHeroes||[]).forEach(c=>{try{addCustomHero(c);}catch(e){}});migrateRoster(S);migrateTowns(S);setMode(S.mode||'relic');if(S.players)loadPlayer(S.pi);rebuildFoot();S.heroes.forEach(x=>{if(x.book===undefined)x.book=x.spells.length>0;});W=S.W||34;H=S.H||26;S.limit=S.limit||112;S.cur=clamp(S.cur||0,0,S.heroes.length-1);renderTerrain();heroDraw.x=HERO().x;heroDraw.y=HERO().y;restoreRoute();sizeMap();centerOn(HERO().x,HERO().y,true);renderUI();}
