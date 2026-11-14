'use strict';
/* -------- UI -------- */
function applyTheme(){
  const f=S?FAC[S.fac]:FAC.rangers,st=document.documentElement.style;
  st.setProperty('--team',teamCol());st.setProperty('--team-2',f.col2);
  $('#crest').src=iconURL('crest',S?S.fac:'rangers',52);
  $('#facline').textContent=S?`${S.players?`Player ${S.pi+1} · `:''}${f.arch}`:'Choose your banner';
}
const travelName=()=>{const h=HERO();return(h.mount==='hooves'?'Hooves':h.mount==='horse'?'On horseback':'On foot')+(h.boat?' · has a boat':FAC[S.fac].travel==='swim'?' · swims lakes':'');};
/* v53: the movement left that can actually be used (none once the cheapest next step costs more) */
function mpUsable(h){if(h!==HERO()||h.mp<=0)return Math.max(0,h.mp);let best=Infinity;for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=h.x+a,y=h.y+b;if(!inb(x,y))continue;const c=stepCost(h.x,h.y,x,y);if(c<best)best=c;}return h.mp>=best?h.mp:0;}
function renderUI(){
  if(!S)return;
  applyTheme();
  $('#res').innerHTML=RES.map(k=>`<span class="${k}" title="${RESNAME[k]}"><img src="${iconURL('res',k,40)}" alt="${RESNAME[k]}">${fmt(S.res[k])}</span>`).join('');
  {const y=Object.fromEntries(RES.map(k=>[k,0]));y.gold=income();for(const o of S.objs)if(o.type==='mine'&&o.owned===ME())y[MINE[o.k].res]+=mineOut(o);if(!S.town.taken){if(facSpecial('amberDay'))y.amber+=1;if(facSpecial('oreDay'))y.ore+=2;}
    {const cb=$('#cmdbar');if(cb&&!$('#bMarket')){const mk=document.createElement('button');mk.className='btn mktbtn';mk.id='bMarket';mk.title='Market: buy and sell goods';mk.innerHTML='⚖ Market';mk.onclick=()=>{if(!S||moving||modalOpen)return;openMarket();};cb.prepend(mk);const qt=$('#qTowns'),bt=$('#bTown');if(qt&&bt)cb.insertBefore(qt,bt);}}
    {const acts=document.querySelector('.topbar .acts')||$('#bMenu').parentNode;let mb=$('#bMines');if(!mb&&acts){mb=document.createElement('button');mb.className='btn icon minesbtn';mb.id='bMines';mb.title='Your mines';mb.onclick=()=>{if(!S||moving||modalOpen)return;openMines();};acts.insertBefore(mb,acts.firstChild);}
      if(mb){const n=S.objs.filter(o=>o.type==='mine'&&o.owned===ME()).length;mb.innerHTML=`<span class="mb-ic">⛏</span><b>${n}</b>`;}}
    $('#yield').innerHTML=`<small>per day</small>${RES.map(k=>y[k]?`<span><img src="${iconURL('res',k,32)}" alt="${RESNAME[k]}">+${fmt(y[k])}</span>`:'').join('')}`;}
  const d=dateParts();$('#date').innerHTML=`<span>Month ${d.m} · Week ${d.w} · Day ${d.d}</span><em>${S.event&&S.event.k!=='plain'?`${S.event.name} · `:''}${S.limit-S.day+1} days left</em>`;$('#date').title=S.event?`${S.event.name}: ${S.event.txt}`:'';
  const h=HERO(),hd=H_(),need=xpFor(h.lvl),prev=h.lvl>1?xpFor(h.lvl-1):0;
  const sw=S.heroes.length>1?`<div class="herosw">${S.heroes.map((x,i)=>`<button class="hsel${i===S.cur?' on':''}" data-hsel="${i}" title="${x.name}${x.mp>0?' (can still move)':''}"><img src="${iconURL('hero',x.id,84)}" alt="${x.name}">${x.mp>60?'<i></i>':''}</button>`).join('')}</div>`:'';
  const mm=maxMana(),mx=maxMP();
  $('#heroCard').innerHTML=`<div class="hgrid">
    <div class="hmain"><div class="hportrait"><img src="${iconURL('hero',h.id,128)}" alt="${esc(h.name)}"><div class="hcap"><div class="hname"><b class="qh-name" style="--qh-player-color:${teamCol()}">${esc(h.name)}</b><button class="rename-ic" data-rename-hero="1" title="Rename ${esc(h.name)}">✎</button></div><div class="label">${hd.type} hero · Level ${h.lvl}</div></div><button class="hbook${h.book?'':' none'}" data-book="1" title="${h.book?'Open the spellbook':'No spellbook yet: buy one at the Lantern Library'}"><img src="${ART_BASE}ui/icons/spellbook.png" alt="">${h.book?`${h.spells.length} spell${h.spells.length===1?'':'s'}`:'No book'}</button></div>
      <div class="hstats">${['atk','def','pow','lore'].map(k=>`<div class="hs" title="${STAT_TIP[k]}"><b>${hst(h,k)}${carry(h,k)?`<em>+${carry(h,k)}</em>`:''}</b><span class="hsl"><img src="${iconURL('stat',k,44)}" alt="">${STATN[k]}</span></div>`).join('')}</div>
      <div class="hbars">
        <div class="bar mana lbar2" title="Mana"><i style="width:${mm?h.mana/mm*100:0}%"></i><span><b>Mana</b>${h.mana} / ${mm}</span></div>
        <div class="bar mp lbar2" title="Movement"><i style="width:${mpUsable(h)/mx*100}%"></i><span><b>Movement</b>${fmt(mpUsable(h))} / ${fmt(mx)}</span></div>
        <div class="bar xp" title="Experience ${fmt(h.xp)} / ${fmt(need)}"><i style="width:${clamp((h.xp-prev)/(need-prev)*100,0,100)}%"></i></div></div></div></div>
   <div class="chips"><span class="chip trav" title="${travelName()}"><img src="${iconURL('travel',h.boat&&tileAt(h.x,h.y)===T.LAKE?'boat':h.mount,44)}" alt=""></span><button class="chip team hdet" data-hsheet="1" title="Ability, skills, equipment and backpack"><img src="${ART_BASE}ui/icons/inventory.png" alt="">Hero details</button>${(h.pack||[]).length?`<span class="chip" title="Items in the backpack">🎒 ${h.pack.length}</span>`:''}${h.relics.map(r=>`<span class="chip team" title="${RELICS[r].carryTxt}">◆ ${RELICS[r].name}</span>`).join('')}</div>`;
  let a='';for(let i=0;i<7;i++){const s=h.army[i];a+=s?`<button class="slot" draggable="true" data-slot="${i}" title="${s.n} ${U[s.k].pl}: click for details and to split, drag onto another slot to move or merge"><img class="${U[s.k]&&U[s.k].up?'upg':''}" src="${iconURL('unit',s.k,64)}" alt="${U[s.k].name}"><b>${s.n}</b></button>`:`<div class="slot empty" data-slot="${i}"></div>`;}
  a+=`<button class="slot booktile${h.book?'':' none'}" data-book="1" title="Spellbook"><img src="${ART_BASE}ui/icons/spellbook.png" alt=""><small>Spells</small></button>`;
  $('#army').innerHTML=a;
  const goal=S.goal||[],months=Math.round(S.limit/28);
  const head=S.mode==='grail'?`Grails wanted · ${goal.filter(i=>delivered(i)).length}/${goal.length} on the altar`:S.mode==='conquest'?`Conquest · ${S.rivals.length} rival${S.rivals.length===1?'':'s'} left`:`The Seven Relics · ${S.delivered.length}/7 home`;
  const gtxt=S.mode==='grail'?`The Oracle wants the <b style="color:var(--text)">${goal.map(i=>RELICS[i].name).join(', ')}</b>. Their keepers roam the land. Bring them to the Grail Altar in ${S.town.name} before the end of Month ${months}.`
    :S.mode==='conquest'?`Defeat every rival hero before the end of Month ${months}. Relics still give bonuses on the way.`
    :`Recover all seven and carry them to the Relic Hall in ${S.town.name} before the end of Month ${months}.`;
  $('#objective').innerHTML=`<span class="rbhead">${S.mode==='conquest'?`⚔ ${S.rivals.length} left`:S.mode==='grail'?`Grails ${goal.filter(i=>delivered(i)).length}/${goal.length}`:`Relics ${S.delivered.length}/7`}</span>${S.mode==='conquest'?'':RELICS.map((Rl,i)=>{const st=relicState(i);return`<span class="rl ${st.cls}${S.mode==='grail'&&goal.includes(i)?' want':''}" title="${Rl.name}: ${st.txt}"><img src="${iconURL('relic',i,56)}" alt=""></span>`;}).join('')}`;
  $('#objective').title=`${head}. Click for details.`;$('#objective')._txt={head,gtxt};
  $('#armyPow').textContent=`Strength ${fmt(armyPower(h.army,h))}`;
  const tn=withTown(null,()=>townTabs().filter(x=>x.id!=='overview').reduce((a,x)=>a+(x.n||0),0));
  $('#bTown').innerHTML=`<img class="bi" src="${ART_BASE}ui/icons/town.png" alt="">Town<span class="kbd">T</span>${tn?`<span class="bdg">${tn}</span>`:''}`;$('#bTown').classList.toggle('need',tn>0);
  $('#bEnd').classList.toggle('need',S.heroes.every(x=>x.mp<70));renderQuick();
}
function relicState(i){
  if(delivered(i))return{cls:'done',short:'Home',txt:'safe in the Relic Hall'};
  const h=S.heroes.find(x=>x.relics.includes(i));if(h)return{cls:'carried',short:h.name,txt:`carried by ${h.name}`};
  const rv=S.rivals.find(x=>x.relics.includes(i));if(rv)return{cls:'rival',short:rv.name,txt:`taken by the rival ${rv.name}`};
  if(S.objs.some(o=>o.type==='drop'&&o.rs.includes(i)))return{cls:'found',short:'Dropped',txt:'lying unguarded on the map'};
  const o=S.objs.find(o=>o.type==='relic'&&o.r===i);
  if(o&&o.roam)return seenNow(o.x,o.y)?{cls:'found',short:'In sight',txt:`carried by the ${RELICS[i].lair}, close by`}:{cls:S.rumours.some(r=>r.r===i)?'rumour':'',short:'Roaming',txt:`carried by the ${RELICS[i].lair}, which roams the land`};
  if(o&&S.explored[idx(o.x,o.y)])return{cls:'found',short:'Found',txt:`guarded in the ${RELICS[i].lair}`};
  if(S.rumours.some(r=>r.r===i))return{cls:'rumour',short:'Rumour',txt:'its rough location is circled on the map'};
  return{cls:'',short:'Unknown',txt:'nobody knows where it lies'};
}
$('#heroCard').addEventListener('click',e=>{const b=e.target.closest('[data-hsel]');if(b&&S)selectHero(+b.dataset.hsel);});
function selectHero(i){if(moving||!S.heroes[i])return;S.cur=i;restoreRoute();heroDraw.x=HERO().x;heroDraw.y=HERO().y;centerOn(HERO().x,HERO().y);renderUI();}
$('#army').addEventListener('click',e=>{if(!S||moving||modalOpen)return;if(e.target.closest('[data-book]')){viewSpellbook();return;}const b=e.target.closest('[data-slot]');if(!b)return;const i=+b.dataset.slot,s=HERO().army[i];if(s)showUnit(s.k,s.n,i);});
$('#heroCard').addEventListener('click',e=>{if(!S||modalOpen)return;if(e.target.closest('[data-book]'))viewSpellbook();else if(e.target.closest('[data-hsheet]')||e.target.closest('.hportrait img'))openHeroSheet();});
/* drag a stack onto another slot: same troop merges, different troops swap, an empty slot moves it there */
{let dragFrom=-1;const army=$('#army');
  army.addEventListener('dragstart',e=>{const b=e.target.closest('[data-slot]');if(!b||!S||moving)return;dragFrom=+b.dataset.slot;e.dataTransfer.effectAllowed='move';try{e.dataTransfer.setData('text/plain',String(dragFrom));}catch(_){}});
  army.addEventListener('dragover',e=>{const b=e.target.closest('[data-slot]');if(!b||dragFrom<0)return;e.preventDefault();army.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));b.classList.add('drop');});
  army.addEventListener('dragleave',e=>{const b=e.target.closest('[data-slot]');if(b)b.classList.remove('drop');});
  army.addEventListener('drop',e=>{e.preventDefault();const b=e.target.closest('[data-slot]');if(!b||dragFrom<0)return;moveStack(dragFrom,+b.dataset.slot);dragFrom=-1;});
  army.addEventListener('dragend',()=>{dragFrom=-1;army.querySelectorAll('.drop').forEach(x=>x.classList.remove('drop'));});}
function moveStack(from,to){const a=HERO().army;if(from===to||!a[from])return;
  if(a[to]&&a[to].k===a[from].k){a[to].n+=a[from].n;a.splice(from,1);}
  else if(a[to]){[a[from],a[to]]=[a[to],a[from]];}
  else{const st=a.splice(from,1)[0];a.push(st);}
  renderUI();save();}
function openHeroSheet(){const h=HERO(),hd=H_();h.pack=h.pack||[];
  const itemBox=(k,where)=>{const it=ITEMS[k];return`<button class="eqi" data-eq="${where}:${k}" title="${it.tier}: ${itemTxt(k)}" style="--ic:${ITEM_COLS[it.lvl]}">${itemIcon(k)}<b>${it.name}</b><small>${itemTxt(k)}</small></button>`;};
  const body=()=>`<div class="sheetgrid3">
    <div class="sheethero">
      <div class="shport"><img src="${iconURL('hero',h.id,128)}" alt=""></div>
      <b class="shname">${esc(h.name)}</b><small class="label">${hd.type} hero · Level ${h.lvl}${h.book?' · has a spellbook':''}</small>
      <div class="hstats">${['atk','def','pow','lore'].map(k=>`<div class="hs" title="${STAT_TIP[k]}"><span class="hsl"><img src="${iconURL('stat',k,44)}" alt="">${STATN[k]}</span><b>${hst(h,k)}</b></div>`).join('')}</div>
    </div>
    <div class="doll">${SLOT_ORDER.map(sl=>{const worn=(h.items||[]).filter(k=>ITEMS[k]&&ITEMS[k].slot===sl);const cap=SLOT_LIM[sl];
      return`<div class="dslot${worn.length?'':' none'}"><span class="label">${sl}${cap>1?` (${worn.length}/${cap})`:''}</span>${worn.map(k=>itemBox(k,'w')).join('')}${worn.length<cap?'<div class="eqempty">empty</div>':''}</div>`;}).join('')}</div>
    <div class="sheetside">
      <p style="margin-top:0"><b>★ Ability:</b> ${hd.ad}</p>
      ${h.skills.length?`<p><b>Skills:</b> ${h.skills.map(k=>`${skIco(k,22)}${SK[k].name} <i>${SK_LV[skLevel(h,k)]}</i> (${SK_TXT[k](skLevel(h,k)).replace(/\.$/,'')})`).join('; ')}</p>`:''}
      <p><b>Travel:</b> ${travelName()}</p>
      <p class="muted">Attack and Defense make every troop in the army hit harder and take less damage. Power makes spells stronger. Lore sets mana: 10 mana per point, and the hero gets back mana equal to their Lore each day.</p>
      <div class="label">Backpack · click an item to wear it</div><div class="pack">${h.pack.length?h.pack.map(k=>itemBox(k,'p')).join(''):'<p class="muted">Empty.</p>'}</div>
    </div></div>`;
  const pr=showModal({title:`${esc(h.name)}: equipment`,body:body(),wide:true,top:true,buttons:[...S.heroes.length>1?[{label:'Kick out hero',value:'dismiss'}]:[],{label:'Done',value:1,primary:true}],dismiss:1});
  const b=$('#modal').querySelector('.body');
  b.addEventListener('click',e=>{const el=e.target.closest('[data-eq]');if(!el)return;const[where,k]=el.dataset.eq.split(':');
    if(where==='w'){h.items.splice(h.items.indexOf(k),1);h.pack.push(k);}
    else{const sl=ITEMS[k].slot;h.pack.splice(h.pack.indexOf(k),1);if(!slotFree(h,sl)){const old=h.items.find(x=>ITEMS[x].slot===sl);h.items.splice(h.items.indexOf(old),1);h.pack.push(old);}h.items.push(k);}
    b.innerHTML=body();renderUI();save();});
  return pr.then(v=>v==='dismiss'?dismissHero(h):v);}
/* v46: send a hero away. Their troops join the garrison when they stand in one of your towns; otherwise they leave with the hero. Relics must be handed over first. */
async function dismissHero(h){if(S.heroes.length<2)return;
  if((h.relics||[]).length){await showModal({title:'Carrying relics',body:`<p>${esc(h.name)} carries a relic. Deliver it to your Relic Hall or hand it to another hero before dismissing them.</p>`,buttons:[{label:'OK',value:1,primary:true}],dismiss:1});return;}
  const tw=allTowns().find(t=>t.x===h.x&&t.y===h.y&&!t.taken),n=h.army.reduce((a,s)=>a+s.n,0);
  const v=await showModal({title:`Kick ${esc(h.name)} out?`,body:`<p style="text-align:center"><img src="${iconURL('hero',h.id,128)}" alt="" style="width:96px;image-rendering:pixelated"></p><p>${esc(h.name)} packs up and heads back to the tavern. You might meet them there again later.</p><p>${!n?'They have no troops.':tw?`Their ${fmt(n)} troops stay behind in <b>${esc(tw.name||'your town')}</b>'s garrison (room for 7 stacks).`:`<b>Their ${fmt(n)} troops leave with them.</b> Dismiss them in one of your towns to keep the army.`} Their artifacts go with them.</p>`,buttons:[{label:'Keep them',value:0},{label:'Kick out',value:1,primary:true}],dismiss:0});
  if(!v)return;
  if(tw){tw.garrison=tw.garrison||[];for(const s of h.army){const ex=tw.garrison.find(x=>x.k===s.k);if(ex)ex.n+=s.n;else if(tw.garrison.length<7)tw.garrison.push({k:s.k,n:s.n});}}
  const i=S.heroes.indexOf(h);S.heroes.splice(i,1);S.cur=Math.min(S.cur>i?S.cur-1:S.cur,S.heroes.length-1);if(S.cur<0)S.cur=0;
  toast(`${h.name} has headed back to the tavern.`);selectHero(S.cur);renderUI();save();}
/* v50: the Market button (command bar and mines panel): opens the market of the town your hero stands in, else your home, else any town with one */
function openMarket(){const h=HERO(),ts=allTowns().filter(t=>!t.taken),withM=ts.filter(t=>t.built&&t.built.market);
  const t=withM.find(t=>t.x===h.x&&t.y===h.y)||withM.find(t=>t===S.town)||withM[0];
  if(!t){toast('Build a Barter Yard in one of your towns to trade.');openTown(null,'build');return;}
  openTown(t===S.town?null:t,'market');}
/* v46: every mine you hold in one place, opened from the ⛏ button in the top bar */
function openMines(){const ms=()=>S.objs.filter(o=>o.type==='mine'&&o.owned===ME());
  const tot=()=>{const t={};for(const o of ms()){const r=MINE[o.k].res;t[r]=(t[r]||0)+mineOut(o);}return t;};
  /* v48: one centred card per kind of mine, its pictures stacked, then each mine you hold with its level, output and upgrade */
  const pic=k=>MINE_ART[k]?`<i class="mpic" style="background-image:url(${ART_BASE}map/mines/${MINE_ART[k][0]}.png)"></i>`:`<img class="mres" src="${iconURL('res',MINE[k].res,40)}" alt="">`;
  const body=()=>{const t=tot(),by={};for(const o of ms())(by[o.k]=by[o.k]||[]).push(o);
    const cards=Object.keys(MINE).filter(k=>by[k]).map(k=>{const list=by[k].sort((a,b)=>(b.lvl||1)-(a.lvl||1)),out=list.reduce((a,o)=>a+mineOut(o),0),m=MINE[k];
      return`<div class="mgrp"><div class="mstack">${list.slice(0,4).map((o,i)=>`<span style="--i:${i}">${pic(k)}</span>`).join('')}</div>
        <h4>${m.name} <b>×${list.length}</b></h4><p class="mtot"><img src="${iconURL('res',m.res,32)}" alt="">+${fmt(out)} ${RESNAME[m.res].toLowerCase()} a day</p>
        <div class="mlist">${list.map(o=>{const lv=o.lvl||1,c=MINE_UP[lv];return`<div class="mone"><span>Level ${lv} · +${fmt(mineOut(o))}</span>${lv<MINE_MAX?`<span class="mcost">to level ${lv+1}: ${costHTML(c,S.res)}</span><button class="btn sm" data-mineup="${o.id}" ${canAfford(c)?'':'disabled'}>Upgrade</button>`:'<em>top level</em>'}</div>`;}).join('')}</div></div>`;}).join('');
    return`<div class="minesum">${Object.keys(t).length?RES.filter(k=>t[k]).map(k=>`<span><img src="${iconURL('res',k,32)}" alt="">+${fmt(t[k])} ${RESNAME[k].toLowerCase()} a day</span>`).join(''):'<span class="muted">No mines yet. Walk onto a mine on the map to claim it.</span>'}</div><div class="mgrps">${cards}</div><p class="mmarket"><button class="btn" data-mmarket="1">⚖ Market: trade goods</button></p>`;};
  showModal({title:`⛏ Your mines (${ms().length})`,body:body(),wide:true,top:true,buttons:[{label:'Close',value:1,primary:true}],dismiss:1});
  const b=$('#modal').querySelector('.body');
  b.addEventListener('click',e=>{if(e.target.closest('[data-mmarket]')){$('#modal')._close(null);setTimeout(openMarket,0);return;}const el=e.target.closest('[data-mineup],[data-minego]');if(!el)return;
    if(el.dataset.mineup){const o=S.objs.find(q=>q.id===+el.dataset.mineup);if(!o||(o.lvl||1)>=MINE_MAX)return;const c=MINE_UP[o.lvl||1];if(!canAfford(c))return;pay(c);o.lvl=(o.lvl||1)+1;toast(`${MINE[o.k].name} upgraded to level ${o.lvl}.`);b.innerHTML=body();renderUI();save();}
    else{const o=S.objs.find(q=>q.id===+el.dataset.minego);if(o){$('#modal')._close(null);centerOn(o.x,o.y);}}});}
function viewSpellbook(){const h=HERO();
  const list=h.spells.map(k=>{const sp=SP[k];return`<div class="spell${h.mana>=sp.cost?'':' dim'}"><b>${sp.name}</b><span class="scost">${sp.cost} mana</span><p>${sp.desc(hst(h,'pow'))}</p></div>`;}).join('');
  showModal({title:`📖 ${esc(h.name)}'s spellbook`,body:h.book?`<p class="muted" style="margin-top:0">${h.mana} of ${maxMana()} mana. Cast spells in battle by clicking your hero beside the field. Power makes them stronger; Lore gives more mana.</p><div class="spells">${list||'<p>No spells yet.</p>'}</div>
     <p class="muted">Learn more at the Lantern Library and Star Archive in town, at spell altars on the map, and at wayshrines.</p>`
     :`<p>${esc(h.name)} has no spellbook yet. Buy one for ${BOOK_COST} gold at the Lantern Library in your town.</p>`,buttons:[{label:'Close',value:1,primary:true}],dismiss:1});}
/* one troop card everywhere: big picture on top, the overview line, attack and defense; the rest folds out under Details */
function unitCard(k,{n,head,foot='',cls=''}={}){const u=U[k];
  return`<div class="ucard ${cls}"><div class="uimg"><img class="${U[k]&&U[k].up?'upg':''}" src="${iconURL('unit',k,128)}" alt="">${n?`<b class="un">${fmt(n)}</b>`:''}</div>
    <h4>${head||(n>1?u.pl:u.name)}</h4><p class="urole">${u.desc}</p>
    <div class="uad"><span title="${STAT_TIP.atk.replace('every troop in the army','this troop')}"><img src="${iconURL('stat','atk',32)}" alt="">Attack <b>${u.atk}</b></span><span title="${STAT_TIP.def.replace('every troop in the army','this troop')}"><img src="${iconURL('stat','def',32)}" alt="">Defense <b>${u.def}</b></span></div>
    <details class="udet"><summary>Details ▾</summary><div class="udbox">${unitChips(k)}<p class="muted">Damage ${u.min}–${u.max} · Health ${u.hp} · Speed ${u.spd}${u.shots?` · ${u.shots} shots`:''}</p></div></details>
    <div class="ufoot">${foot}</div></div>`;}
function showUnit(k,n,slot){
  const h=HERO(),canSplit=slot!==undefined&&n>1&&h.army.length<7;
  const split=slot===undefined?'':canSplit?`<div class="splitbox"><label for="spN">Split off</label><input type="range" id="spN" min="1" max="${n-1}" value="${Math.floor(n/2)}"><b id="spV">${Math.floor(n/2)}</b><button class="btn sm primary" id="spGo">Split</button></div><p class="muted" style="font-size:14px;margin:4px 0 0">Tip: drag stacks onto each other in the army panel to merge or swap them.</p>`
    :`<p class="muted" style="font-size:14px;margin:6px 0 0">${n<2?'A single troop cannot be split.':'All seven army slots are full.'} Drag stacks onto each other to merge or swap them.</p>`;
  const p=showModal({title:`${n?n+' ':''}${n>1?U[k].pl:U[k].name}`,body:`<div class="ucenter">${unitCard(k,{n,foot:heroBonusText(k)})}${split}</div>`,buttons:[{label:'Close',value:1,primary:true}],dismiss:1});
  if(canSplit){const r=$('#spN'),v=$('#spV');r.oninput=()=>{v.textContent=r.value;};
    $('#spGo').onclick=()=>{const m=+r.value,st=h.army[slot];if(!st||m<1||m>=st.n||h.army.length>=7)return;st.n-=m;h.army.push({k:st.k,n:m});$('#modal')._close(1);renderUI();save();toast(`Split off ${m} ${U[st.k].pl}.`);};}
  return p;}
function heroBonusText(k){const h=HERO(),f=fx(),bits=[];if(hst(h,'atk'))bits.push(`+${hst(h,'atk')} attack`);if(hst(h,'def'))bits.push(`+${hst(h,'def')} defense`);
  if(f.unitAtk&&f.unitAtk[k])bits.push(`+${f.unitAtk[k]} attack from ${H_().ab}`);if(f.unitDef&&f.unitDef[k])bits.push(`+${f.unitDef[k]} defense from ${H_().ab}`);if(f.unitSpd&&f.unitSpd[k])bits.push(`+${f.unitSpd[k]} speed from ${H_().ab}`);
  return bits.length?`<p class="muted" style="margin:6px 0 0;font-size:13px">In ${h.name}'s army: ${bits.join(', ')}.</p>`:'';}
/* pickups announce themselves big at the top of the map */
function dayFlip(){const d=$('#dayflip');if(!d)return;const p=dateParts();d.querySelector('b').textContent=`Week ${p.w} · Day ${p.d}`;{let sm=d.querySelector('small');if(!sm){sm=document.createElement('small');d.appendChild(sm);}sm.textContent=`Month ${p.m}`;}d.hidden=false;d.classList.remove('go');void d.offsetWidth;d.classList.add('go');clearTimeout(d._t);d._t=setTimeout(()=>{d.hidden=true;},1500);}
function lootPop(msg,img){const box=$('#loot');if(!box){toast(msg);return;}const t=document.createElement('div');t.className='lootpop';t.innerHTML=`${img?`<img src="${img}" alt="">`:''}<span>${msg}</span>`;box.appendChild(t);
  while(box.children.length>3)box.firstChild.remove();setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),400);},2800);}
function toast(msg){const t=document.createElement('div');t.className='toast';t.innerHTML=msg;$('#toasts').appendChild(t);setTimeout(()=>t.remove(),3400);}
let modalOpen=false;
function showModal({title,body,buttons=[],wide=false,dismiss,top=false}){
  return new Promise(res=>{
    const m=$('#modal');modalOpen=true;
    const foot=buttons.length?`<footer>${buttons.map((b,i)=>`<button class="btn ${b.primary?'primary':''}" data-i="${i}" ${b.disabled?'disabled':''}>${b.label}</button>`).join('')}</footer>`:'';
    m.innerHTML=top?`<div class="sheet ${wide?'wide':''} topbtns" role="dialog" aria-modal="true"><header><h2>${title}</h2>${foot}</header><div class="body">${body}</div></div>`
      :`<div class="sheet ${wide?'wide':''}" role="dialog" aria-modal="true"><header><h2>${title}</h2></header><div class="body">${body}</div>${foot}</div>`;
    m.hidden=false;
    const close=v=>{m.hidden=true;m.innerHTML='';modalOpen=false;m.onclick=null;res(v);};
    m.onclick=e=>{const b=e.target.closest('footer [data-i]');if(b){close(buttons[+b.dataset.i].value);return;}if(e.target===m&&dismiss!==undefined)close(dismiss);};
    m._close=close;m._dismiss=dismiss;
    const f=m.querySelector('footer .btn.primary')||m.querySelector('footer .btn');if(f)f.focus();
  });
}
