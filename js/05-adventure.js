'use strict';
/* -------- adventure actions -------- */
async function walk(){
  if(moving||!path||!path.length||S.over)return;
  moving=true;
  while(path&&path.length){
    const n=path[0],cost=stepCost(HERO().x,HERO().y,n.x,n.y);
    if(HERO().mp<cost){toast('Out of movement for today. End the day to march on.');break;}
    const o=objAt(n.x,n.y),rv=rivalAt(n.x,n.y);
    if(rv||(o&&(o.type==='neutral'||o.type==='relic'||spireFoe(o)))){
      const foe=rv?{type:'rival',rival:rv,x:rv.x,y:rv.y}:o;
      const go=await fightPreview(foe);if(!go){setPath(null);break;}
      if(go==='join'||go==='flee'){const of=joinOffer(o);S.objs=S.objs.filter(q=>q!==o);
        if(go==='join'&&of){pay({gold:of.cost});addToArmy(o.k,o.n);lootPop(`${o.n} ${U[o.k].pl} join ${HERO().name}`,iconURL('unit',o.k,64));}else toast(`The ${U[o.k].pl} scatter before ${HERO().name}'s army.`);
        path=null;renderUI();save();break;}
      HERO().mp-=cost;renderUI();
      const won=await startBattle(foe);
      if(!won){moving=false;path=null;if(S&&!S.over){renderUI();save();}return;}
      if(S.pendingWin){S.pendingWin=false;moving=false;await victory();return;}
      if(!rv&&o.type!=='spire'&&o.type!=='camp')S.objs=S.objs.filter(q=>q!==o);
      path=null;await stepHero(n);reveal(n.x,n.y,vision());renderUI();
      if(o&&o.type==='relic')await gainRelic(HERO(),[o.r]);
      break;
    }
    const jumped=Math.max(Math.abs(n.x-HERO().x),Math.abs(n.y-HERO().y))>1,swap=shipSwap(HERO(),HERO().x,HERO().y,n.x,n.y);
    HERO().mp-=cost;await stepHero(n);reveal(n.x,n.y,vision());path.shift();renderUI();
    if(jumped)toast(n.y>=(S.underY||1e9)?'Through the portal: down into the underworld.':'Through the portal and back into daylight.');
    if(o){const stop=await visit(o,!path.length,jumped);if(stop){path=null;break;}}
    if(swap&&path&&path.length){HERO().mp=0;toast(tileAt(n.x,n.y)===T.LAKE?`${HERO().name} boards ship. Casting off takes the rest of the day.`:`${HERO().name} makes landfall. Unloading takes the rest of the day.`);break;}
    if(swap)HERO().mp=0;
  }
  if(path&&!path.length)path=null;
  {const h=HERO();if(h&&h.route&&h.x===h.route.x&&h.y===h.route.y){const mid=h.route.meet;delete h.route;path=null;const mi=mid?S.heroes.findIndex(q=>q.id===mid):-1;
    if(mi>=0&&Math.max(Math.abs(S.heroes[mi].x-h.x),Math.abs(S.heroes[mi].y-h.y))<=1){moving=false;renderUI();save();await openTrade(mi);return;}}}
  moving=false;renderUI();save();
}
/* boarding or leaving a ship ends the day's movement (pirates and anyone with a boat; swimmers are not affected) */
const shipSwap=(h,ax,ay,bx,by)=>!!h.boat&&FAC[S.fac].travel!=='swim'&&(tileAt(ax,ay)===T.LAKE)!==(tileAt(bx,by)===T.LAKE);
/* a hero's route survives the end of the day: h.route is the destination (and a hero to meet there) */
function setPath(p,meet){path=p&&p.length?p:null;const h=HERO();if(path){const e=path[path.length-1];h.route={x:e.x,y:e.y,meet:meet||null};}else delete h.route;}
function restoreRoute(){const h=HERO();path=null;if(!h||!h.route)return;const p=planTo(h.route.x,h.route.y);if(p&&p.length)path=p;else delete h.route;}
/* influence: wild creatures facing a far stronger army may offer to join (free when it is overwhelming), or at least run away */
function joinOffer(o){if(!o||o.type!=='neutral'||isKeyGuard(o)||o.lvl===4)return null;const h=HERO(),ours=armyPower(h.army,h),theirs=stackPower(o.k,o.n)||1;
  const r=ours/theirs*(1+0.04*(h.lvl-1))*(1+0.1*(hst(h,'lore')>=6?1:0));if(r<3)return null;
  const room=h.army.some(a=>a.k===o.k)||h.army.length<7;return{r,room,cost:r>=6?0:Math.round(o.n*U[o.k].hp*8/50)*50};}
async function fightPreview(o){
  let enemy,title,theirs,reward='';
  if(o.type==='rival'){const rv=o.rival;enemy=rv.army;theirs=armyPower(rv.army,rv);title=`Attack ${rv.name}?`;
    reward=`<p class="muted">${rv.name} is a rival ${FAC[rv.fac].arch} hero (${sc('atk',hst(rv,'atk'))} ${sc('def',hst(rv,'def'))}).${rv.relics.length?` Win to take: <b style="color:var(--text)">${rv.relics.map(r=>RELICS[r].name).join(', ')}</b>.`:''}</p>`;}
  else if(o.type==='camp'){enemy=o.garrison;theirs=armyPower(o.garrison);title=`Attack the ${campName(o)}?`;
    reward=`<p class="muted">${isMajor(o)?`Win to take a full ${FAC[o.fac].arch} town: its own buildings to raise, dwellings and garrison, +${fmt(o.built?hallGold(o):500)} gold a day or more.`:`Win to capture it: +${fmt(campIncome(o))} gold a day and ${FAC[o.fac].arch} recruits each week.`}${o.keeper?` The rogue <b>${HBY[o.keeper].name}</b> leads its defence (${sc('atk',HBY[o.keeper].st[0]+2)} ${sc('def',HBY[o.keeper].st[1]+2)}).`:''}${S.rivals.some(r=>r.fac===o.fac)?` Its rival hero stops growing stronger while you hold it.`:''}</p>`;}
  else if(o.type==='spire'){enemy=o.garrison;theirs=armyPower(o.garrison);title='Storm the spire?';
    reward=`<p class="muted">Held by ${spireOwnerName(o)}. Defenders fight from the walls with +3 defense. Win to take the spire.</p>`;}
  else{enemy=[{k:o.k,n:o.n}];theirs=stackPower(o.k,o.n);
    title=o.type==='relic'?`Assault the ${RELICS[o.r].lair}?`:o.guard?'Force the guarded pass?':`Fight ${U[o.k].pl}?`;
    if(o.type==='relic')reward=`<p class="muted">Reward: <b style="color:var(--text)">${RELICS[o.r].name}</b>. While carried: ${RELICS[o.r].carryTxt}.</p>`;
    if(o.guard)reward='<p class="muted">This pass is the only road through the crags. Break through to reach the land beyond.</p>';}
  const[w,col]=threatOf(theirs);const ours=armyPower(HERO().army,HERO()),pct=Math.round(ours/(ours+theirs)*100);
  const cnt=n=>fx().exact||o.type==='rival'?n:amountWord(n);
  const of=joinOffer(o);if(of)reward+=`<p class="offer"><b>${of.room?`Awed by your army, the ${U[o.k].pl} offer to join ${HERO().name}${of.cost?` for ${fmt(of.cost)} gold`:' for nothing'}.`:`The ${U[o.k].pl} would join, but ${HERO().name} has no free army slot. They will flee if you let them.`}</b></p>`;
  return await showModal({title,
    body:`<div class="casualties"><div><div class="label">${HERO().name}'s army</div><ul>${HERO().army.map(a=>`<li>${a.n} ${U[a.k].pl}</li>`).join('')}</ul></div><div><div class="label">The enemy</div><ul>${enemy.map(a=>`<li>${cnt(a.n)} ${U[a.k].pl}</li>`).join('')}</ul>${enemy.length===1?unitChips(enemy[0].k):''}</div></div>${reward}
     <div class="meter" style="margin-top:14px"><span>Your strength</span><span style="color:${col};font-weight:800">${w}</span></div>
     <div class="bar" style="height:10px;background:var(--foe)"><i style="width:${pct}%;background:var(--team)"></i></div>`,
    buttons:[{label:'Back',value:false},...(of?[of.room?{label:of.cost?`Hire them: ${fmt(of.cost)} gold`:'Welcome them',value:'join',disabled:S.res.gold<of.cost}:{label:'Let them flee',value:'flee'}]:[]),{label:'Fight',value:true,primary:!of}],dismiss:false});
}
async function gainRelic(h,rs){
  h.relics.push(...rs);renderUI();
  for(const r of rs){const Rl=RELICS[r];
    await showModal({title:`<img src="${iconURL('relic',r,64)}" alt="" style="width:34px;height:34px;vertical-align:-8px;margin-right:8px">${Rl.name}`,
      body:`<p>${h.name} recovers the ${Rl.name}. A beacon now shines above ${h.name}, and every rival can see it.</p><p><b>While carried:</b> ${Rl.carryTxt}.<br><b>Once in the Relic Hall:</b> ${Rl.deliver}.</p>`,
      buttons:[{label:'Continue',value:1,primary:true}],dismiss:1});}
}
function stepHero(n){
  const fx0=HERO().x,fy0=HERO().y;
  if(Math.max(Math.abs(n.x-fx0),Math.abs(n.y-fy0))>1){HERO().x=n.x;HERO().y=n.y;heroDraw.x=n.x;heroDraw.y=n.y;centerOn(n.x,n.y,true);return sleep(reduced?1:220);}
  HERO().face=dirOf(n.x-fx0,n.y-fy0);HERO().x=n.x;HERO().y=n.y;
  const sx=n.x*TS-camX,sy=n.y*TS-camY;if(sx<TS*2.5||sy<TS*2.5||sx>vw-TS*3.5||sy>vh-TS*3.5)centerOn(n.x,n.y);
  return tween(reduced?1:130,t=>{heroDraw.x=fx0+(n.x-fx0)*t;heroDraw.y=fy0+(n.y-fy0)*t;});
}
function tween(dur,f){return new Promise(res=>{const t0=performance.now();const step=now=>{const t=Math.min(1,(now-t0)/Math.max(1,dur));f(t);if(t<1)requestAnimationFrame(step);else res();};requestAnimationFrame(step);});}
function gain(k,n){S.res[k]+=n;}
/* an outpost (a holding you can't build in): the same strip as a town's garrison section, with its recruits as tiles */
async function manageHolding(o){const f=FAC[o.fac],h=HERO(),here=h.x===o.x&&h.y===o.y;o.pool=o.pool||{};o.garrison=o.garrison||[];
  const tiers=f.units.slice(0,campTiers(o));
  const slots=(arr,side)=>Array.from({length:7},(_,i)=>{const g=arr[i];if(!g)return'<div class="slot empty"></div>';return`<button class="slot" data-hx="${side}${i}" title="${g.n} ${U[g.k].pl}${here?' · click to move across':''}"><img class="${U[g.k].up?'upg':''}" src="${iconURL('unit',g.k,64)}" alt=""><b>${g.n}</b></button>`;}).join('');
  const body=()=>`<p class="muted" style="margin:0 0 8px">+${fmt(campIncome(o))} gold a day · its troops muster here each week. ${here?`Recruits join ${esc(h.name)}; click a stack to move it between ${esc(h.name)} and the garrison.`:'No hero is here, so recruits wait in the garrison until a hero comes to collect them.'}</p>
   <div class="tstrip hstrip"><div class="tvisit"><div class="thero">${here?`<img src="${iconURL('hero',h.id,128)}" alt=""><div><b>${esc(h.name)}</b><small>visiting</small></div>`:'<div><b>No hero here</b><small>Walk a hero in to collect troops.</small></div>'}</div><div class="trow small">${here?slots(h.army,'h'):''}</div></div>
    <div class="tgarr"><div class="tlabel"><b>⚑ Garrison</b><small>holds the outpost</small></div><div class="trow small">${slots(o.garrison,'g')}</div>
     <div class="tlabel"><b>Recruits</b><small>click to hire as many as you can afford</small></div>
     <div class="tdw">${tiers.map(k=>{const av=o.pool[k]||0,mx=Math.min(av,maxAfford(k));return`<button class="dwc${mx>0?'':' off'}" data-hrec="${k}" ${mx<1?'disabled':''} title="${U[k].pl}: ${av} here, ${fmt(unitCost(k,1).gold)} gold each${mx?` · recruit ${mx}`:''}"><img src="${iconURL('unit',k,64)}" alt=""><b>${av}</b></button>`;}).join('')}</div></div></div>`;
  const pr=showModal({title:`<img src="${iconURL('crest',o.fac,52)}" alt="" style="width:40px;height:40px;vertical-align:-10px;margin-right:8px">${esc(campName(o).replace(/^./,c=>c.toUpperCase()))}`,body:body(),wide:true,buttons:here?[{label:'Done',value:1,primary:true}]:[{label:'Show on map',value:'m'},{label:'Done',value:1,primary:true}],dismiss:1});
  const b=$('#modal').querySelector('.body');
  b.addEventListener('click',e=>{const el=e.target.closest('[data-hrec]');
    if(el){const k=el.dataset.hrec,n=Math.min(o.pool[k]||0,maxAfford(k));if(n<1)return;
      if(here){if(!addToArmy(k,n)){toast('No free army slot.');return;}}else{const g=o.garrison.find(x=>x.k===k);if(g)g.n+=n;else if(o.garrison.length<7)o.garrison.push({k,n});else{toast('The garrison is full.');return;}}
      pay(unitCost(k,n));o.pool[k]-=n;toast(here?`${n} ${U[k].pl} join ${h.name}.`:`${n} ${U[k].pl} wait in the garrison.`);b.innerHTML=body();renderUI();return;}
    const sl=e.target.closest('[data-hx]');if(!sl||!here)return;const side=sl.dataset.hx[0],i=+sl.dataset.hx.slice(1),from=side==='g'?o.garrison:h.army,to=side==='g'?h.army:o.garrison,st=from[i];
    if(!st||(side==='h'&&h.army.length<=1)){if(side==='h')toast('A hero must keep at least one stack.');return;}
    const ex=to.find(a=>a.k===st.k);if(ex)ex.n+=st.n;else if(to.length<7)to.push({...st});else{toast('No free slot there.');return;}from.splice(i,1);b.innerHTML=body();renderUI();});
  const v=await pr;renderUI();save();if(v==='m')centerOn(o.x,o.y);}
/* a beaten rogue who held an outpost offers to join */
async function keeperJoins(id){const hx=HBY[id],h=HERO();if(!hx)return;
  if(S.heroes.length>=heroCap()){toast(`${hx.name} yields the outpost and slips away to the taverns.`);return;}
  const v=await showModal({title:`${hx.name} yields`,body:`<div class="rrow"><img src="${iconURL('hero',id,128)}" alt="" style="width:112px;image-rendering:pixelated;border-radius:4px"><div><p class="tag" style="color:#8a2a1e">Rogue · no banner</p><p><b>${hx.name}</b> lowers their blade: "A fair fight. I'll ride with you, if you'll have me."</p><p>★ ${hx.ab}: ${hx.ad}</p></div></div>`,
    buttons:[{label:'Send them off',value:0},{label:`Take ${hx.name} on`,value:1,primary:true}],dismiss:0});
  if(!v)return;const nh=mkHero(id,h.x,h.y);if(delivered(5)){nh.book=true;nh.spells.push('starfall');}const cur=S.cur;S.heroes.push(nh);S.cur=S.heroes.length-1;nh.mana=maxMana();nh.mp=0;S.cur=cur;
  lootPop(`${hx.name} joins you`,iconURL('hero',id,128));}
async function manageSpire(o){
  const h=HERO(),body=()=>{const col=(arr,side)=>`<div><div class="label">${side==='h'?h.name+"'s army":'Spire garrison'}</div><div class="army" style="margin-top:6px">${Array.from({length:7},(_,i)=>{const a=arr[i];return a?`<button class="slot" data-sp="${side}${i}" title="Move ${U[a.k].pl}"><img class="${U[a.k]&&U[a.k].up?'upg':''}" src="${iconURL('unit',a.k,64)}" alt="${U[a.k].name}"><b>${a.n}</b></button>`:'<div class="slot empty"></div>';}).join('')}</div></div>`;
    return`<p>Click a stack to move it across. A garrisoned spire holds the ground around it (the dashed square): enemy heroes can't pass through until they beat the garrison. Defenders get +3 defense.</p><div class="casualties">${col(h.army,'h')}${col(o.garrison,'g')}</div>${h.army.length<=1?'<p class="muted">A hero must keep at least one stack.</p>':''}`;};
  const pr=showModal({title:o.type==='camp'?`${campName(o)}: garrison`:'Spire',body:body(),buttons:[{label:'Done',value:1,primary:true}],dismiss:1});
  const b=$('#modal').querySelector('.body');
  const into=(arr,a)=>{const ex=arr.find(x=>x.k===a.k);if(ex){ex.n+=a.n;return true;}if(arr.length<7){arr.push({...a});return true;}return false;};
  b.addEventListener('click',e=>{const el=e.target.closest('[data-sp]');if(!el)return;const side=el.dataset.sp[0],i=+el.dataset.sp.slice(1);
    if(side==='h'){if(h.army.length<=1)return;const a=h.army[i];if(into(o.garrison,a))h.army.splice(i,1);}
    else{const a=o.garrison[i];if(into(h.army,a))o.garrison.splice(i,1);}
    b.innerHTML=body();renderUI();});
  await pr;renderUI();save();
}
async function visit(o,last=true,jumped=false){
  const h=HERO();
  switch(o.type){
  case 'town':await arriveTown();return true;
  case 'drop':S.objs=S.objs.filter(q=>q!==o);await gainRelic(h,o.rs);return true;
  case 'portal':{if(!last||jumped)return false;if(rivalAt(o.tx,o.ty)||heroIdxAt(o.tx,o.ty)>=0){toast('Someone is standing at the far end of the portal.');return true;}
    await stepHero({x:o.tx,y:o.ty});reveal(o.tx,o.ty,vision());toast(o.ty>=(S.underY||1e9)?'Through the portal: down into the underworld.':'Through the portal and back into daylight.');renderUI();return true;}
  case 'camp':{if(S.players)return false;
    if(o.owned!==ME()){const kp=captureCamp(o,h);toast(isMajor(o)?`${esc(campName(o))} is yours: a full town to build up.`:`The ${campName(o)} is yours: +${fmt(campIncome(o))} gold a day.`);renderUI();if(kp)await keeperJoins(kp);if(!last)return false;}
    if(!last)return false;if(isMajor(o)){await arriveTown(o);return true;}await manageHolding(o);return true;}
  case 'spire':{if(o.owned!==ME()){o.owned=ME();o.ownerName=h.name;o.garrison=[];toast('Spire claimed. Leave troops in it to hold this road.');renderUI();}
    if(!last)return false;await manageSpire(o);return true;}
  case 'flot':{S.objs=S.objs.filter(q=>q!==o);let msg='';
    switch(o.k){case'floating_chest':{const g=ri(8,14)*100;gain('gold',g);msg=`${fmt(g)} gold in a floating chest.`;break;}case'salvage_crate':gain('timber',5);gain('ore',5);msg='Salvage: 5 timber and 5 ore.';break;
      case'driftwood':gain('timber',6);msg='6 timber of driftwood.';break;case'supply_barrel':gain('gold',500);gain('ore',3);msg='A supply barrel: 500 gold and 3 ore.';break;
      case'pearl_shell':gain('gems',2);msg='A giant pearl: +2 gems.';break;case'sea_crystal':gain('moonwater',2);msg='A sea crystal that melts into 2 moonwater.';break;
      case'message_bottle':{const r=addRumour(false,true);if(r)msg='A message in a bottle: '+r.replace(/<\/?b>/g,'');else{gain('gold',600);msg='A message in a bottle points to 600 gold.';}break;}
      case'coral_relic':{const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].lvl<=3&&!S.heroes.some(x=>(x.items||[]).includes(k)||(x.pack||[]).includes(k)));if(pool.length){const it=pick(pool);giveItem(h,it);msg=`Coral-crusted: the ${ITEMS[it].name} (${itemTxt(it)}).`;}else{gain('gold',800);msg='800 gold in coral.';}break;}}
    lootPop(msg,ART_BASE+`ocean/${o.k}.png`);renderUI();return false;}
  case 'gem':{const gm=GEMS[o.k],rk=gm.res||'gems';gain(rk,gm.n);S.objs=S.objs.filter(q=>q!==o);lootPop(rk==='gems'?`A ${gm.name.toLowerCase()}: +${gm.n} gems`:`A ${gm.name.toLowerCase()}, melted into ${gm.n} moonwater`,iconURL('gem',o.k));renderUI();return false;}
  case 'prison':{const id=o.rogue&&!S.heroes.some(x=>x.id===o.rogue)&&!S.rivals.some(x=>x.id===o.rogue)?o.rogue:null;
    if(!id){toast('The cells stand empty.');return false;}const hx=HBY[id];
    if(S.heroes.length>=heroCap()){await showModal({title:'Prison',body:`<div class="rrow"><img src="${iconURL('hero',id,128)}" alt="" style="width:96px;image-rendering:pixelated"><p><b>${hx.name}</b> rattles the bars. You already lead ${heroCap()} heroes, so there is no one to free them into your company. Come back with room to spare.</p></div>`,buttons:[{label:'OK',value:1,primary:true}],dismiss:1});return false;}
    const v=await showModal({title:`Prison: ${hx.name}`,body:`<div class="rrow"><img src="${iconURL('hero',id,128)}" alt="" style="width:112px;image-rendering:pixelated;border-radius:4px"><div><p class="tag" style="color:#8a2a1e">Rogue · no banner</p><p><b>${hx.name}</b>, ${hx.type.toLowerCase()} hero. ★ ${hx.ab}: ${hx.ad}</p><p class="muted">Break the lock and ${hx.name} joins you for free.</p></div></div>`,buttons:[{label:'Leave them',value:0},{label:`Free ${hx.name}`,value:1,primary:true}],dismiss:0});
    if(!v)return false;const nh=mkHero(id,h.x,h.y);if(delivered(5)){nh.book=true;nh.spells.push('starfall');}const cur=S.cur;S.heroes.push(nh);S.cur=S.heroes.length-1;nh.mana=maxMana();nh.mp=0;S.cur=cur;
    o.rogue=null;S.jailed=(S.jailed||[]).filter(x=>x!==id);lootPop(`${hx.name} is free and joins you`,iconURL('hero',id,128));renderUI();save();return false;}
  case 'pile':gain(o.k,o.n);S.objs=S.objs.filter(q=>q!==o);lootPop(`+${fmt(o.n)} ${RESNAME[o.k].toLowerCase()}`,iconURL('res',o.k,64));renderUI();return false;
  case 'mine':{const m=MINE[o.k];if(o.owned!==ME()){o.owned=ME();o.ownerName=h.name;lootPop(`${m.name} claimed: +${fmt(mineOut(o))} ${RESNAME[m.res].toLowerCase()} a day`,iconURL('res',m.res,64));renderUI();if(!last)return false;}
    if(!last||(o.lvl||1)>=3)return false;
    const lv=o.lvl||1,c=MINE_UP[lv],next=m.out[lv]+(delivered(4)?(m.res==='gold'?250:1):0);
    const v=await showModal({title:`${m.name}: level ${lv}`,body:`<p>The ${m.name.toLowerCase()} is yours. The foreman says it could dig deeper, if you want to pay for it. You can also upgrade your mines any time from the Barter Yard in town.</p><div class="scs" style="gap:10px;align-items:center"><span class="sc"><img src="${iconURL('res',m.res,32)}" alt="">+${fmt(mineOut(o))}/day</span> → <span class="sc"><img src="${iconURL('res',m.res,32)}" alt="">+${fmt(next)}/day</span></div><div class="cost" style="margin-top:10px">${costHTML(c,S.res)}</div>`,
      buttons:[{label:`Upgrade to level ${lv+1}`,value:true,disabled:!canAfford(c)},{label:'OK',value:false,primary:true}],dismiss:false});
    if(v){pay(c);o.lvl=lv+1;toast(`${m.name} upgraded: +${fmt(mineOut(o))} ${RESNAME[m.res].toLowerCase()} a day.`);renderUI();}return true;}
  case 'site':{const st=SITES[o.k];if(o.week===weekNo()){toast(`The ${st.name} is spent until next week.`);return false;}o.week=weekNo();
    if(o.k==='wish'){const g=ri(5,10)*100;gain('gold',g);lootPop(`A coin in the Wishing Well comes back as ${fmt(g)} gold.`);}
    else if(o.k==='clover'){h.luckUntil=S.day+6;lootPop(`${h.name} finds a four-leaf clover: +1 luck for 7 days.`);}
    else if(o.k==='woodcamp'){gain('timber',5);lootPop('The woodcutters hand over 5 timber',iconURL('res','timber',64));}
    else if(o.k==='orecart'){gain('ore',5);lootPop('5 ore from the old cart',iconURL('res','ore',64));}
    else if(o.k==='amberhollow'){gain('amber',2);lootPop('2 amber from the hollow',iconURL('res','amber',64));}
    renderUI();return false;}
  case 'artifact':{const it=ITEMS[o.item];S.objs=S.objs.filter(q=>q!==o);const worn=giveItem(h,o.item);renderUI();
    await showModal({title:`${itemIcon(o.item)}${it.name}`,body:`<p>Level ${it.lvl} ${it.tier} · ${it.slot}</p>${worn?'':`<p class="muted">The ${it.slot.toLowerCase()} slot is full, so it goes in the backpack. Swap it in from the hero screen.</p>`}<p><b>${itemTxt(o.item)}</b></p><p class="muted">${h.name} carries it from now on.</p>`,buttons:[{label:'Continue',value:1,primary:true}],dismiss:1});return true;}
  case 'chest':{const gold=ri(10,15)*100,xp=Math.round(gold*0.8);
    const v=await showModal({title:'A weathered chest',body:`<p>Under a hawthorn root lies an iron-bound chest. Share the coin among the troops, or let ${h.name} study the war journals packed beneath it.</p>`,
      buttons:[{label:`Take ${fmt(gold)} gold`,value:'g',primary:true},{label:`Gain ${fmt(xp)} experience`,value:'x'}]});
    S.objs=S.objs.filter(q=>q!==o);if(v==='g'){gain('gold',gold);lootPop(`+${fmt(gold)} gold`,iconURL('res','gold',64));}else await addXP(xp);
    {const free=Object.keys(ITEMS).filter(k=>ITEMS[k].lvl<=2&&!S.heroes.some(x=>(x.items||[]).includes(k)));if(free.length&&R()<0.35){const it=pick(free);giveItem(h,it);lootPop(`Wrapped in oilcloth: <b>${ITEMS[it].name}</b> (${itemTxt(it)})`,ART_BASE+`artifacts/${ITEM_ICON[it]||'sun_amulet'}.png`);}}
    const hid=S.objs.filter(q=>q.type==='relic'&&!S.explored[idx(q.x,q.y)]);if(hid.length&&R()<0.45){const q=pick(hid);reveal(q.x,q.y,2);toast(`Tucked in the lid: a map fragment showing the ${RELICS[q.r].lair}.`);}
    renderUI();return true;}
  case 'stone':if((o.usedBy=o.usedBy||[]).includes(h.id)){toast(`${h.name} has already trained here.`);return false;}
    o.usedBy.push(h.id);h[o.stat]++;if(o.stat==='lore')h.mana+=10;
    await showModal({title:`Training stone of ${STATN[o.stat]}`,body:`<p>Old runes warm under ${h.name}'s palm.</p><div class="scs">${sc(o.stat,h[o.stat],1)}</div>`,buttons:[{label:'Continue',value:1,primary:true}],dismiss:1});renderUI();return true;
  case 'sage':{if(!last)return false;if((o.used||[]).includes(h.id)){toast(`The sages have already taught ${h.name} all they can.`);return false;}
    const pr=showModal({title:"Sage's Library",body:`<p>Old scholars offer ${esc(h.name)} one lesson. Choose what to learn:</p><div class="sagepick">${['atk','def','pow','lore'].map(k=>`<button class="mode" data-sg="${k}"><img src="${iconURL('stat',k,44)}" alt=""><b>+2 ${STATN[k]}</b><span>${STAT_TIP[k].split(': ')[1]}</span></button>`).join('')}</div>`,buttons:[{label:'Leave',value:null}],dismiss:null,
      top:false});
    $('#modal').querySelector('.sagepick').addEventListener('click',e=>{const b=e.target.closest('[data-sg]');if(!b)return;const k=b.dataset.sg;h[k]+=2;(o.used=o.used||[]).push(h.id);
      if(k==='lore')h.mana=Math.min(maxMana(),h.mana+4);$('#modal')._close(k);toast(`${h.name} gains +2 ${STATN[k]}.`);});
    await pr;renderUI();return true;}
  case 'altar':{if(!last)return false;const sp=SP[o.spell],need=o.tier;
    if(h.spells.includes(o.spell)){toast(`${h.name} already knows ${sp.name}.`);return false;}
    if(!h.book){toast(`${h.name} needs a spellbook to learn at an altar. Buy one at the Lantern Library.`);return true;}
    if(hst(h,'lore')<need){toast(`The ${ALTAR_NAMES[o.tier]} only teaches heroes with Lore ${need} or more.`);return true;}
    h.spells.push(o.spell);await showModal({title:ALTAR_NAMES[o.tier],body:`<p>The runes flare. ${esc(h.name)} learns <b>${sp.name}</b> (${sp.cost} mana): ${sp.desc(hst(h,'pow'))}</p>`,buttons:[{label:'Continue',value:1,primary:true}],dismiss:1});renderUI();return true;}
  case 'shrine':if(!h.book){toast(`${h.name} needs a spellbook to learn here. Buy one at the Lantern Library.`);return false;}if(h.spells.includes(o.spell)){toast(`You already know ${SP[o.spell].name}.`);return false;}
    h.spells.push(o.spell);await showModal({title:'Wayshrine',body:`<p>A blue flame hums inside the shrine. ${h.name} learns <b>${SP[o.spell].name}</b>: ${SP[o.spell].desc(h.pow)}</p>`,buttons:[{label:'Continue',value:1,primary:true}],dismiss:1});renderUI();return true;
  case 'well':if(o.day===S.day){toast('The Moonwell is drained until tomorrow.');return false;}
    o.day=S.day;h.mana=Math.max(h.mana,maxMana());toast('The Moonwell restores your mana.');renderUI();return false;
  case 'tower':reveal(o.x,o.y,11);toast('From the watchtower you chart the land for miles.');return false;
  case 'dock':{if(!last)return false;if(h.boat){toast('Your boat is moored and ready. Walk onto the water to sail.');return false;}
    if(delivered(2)){h.boat=true;toast('The Shard of Tides earns you a free boat.');renderUI();return false;}
    const v=await showModal({title:'The dock',body:`<p>A boatwright offers a sturdy rowing boat. With it, ${h.name} can sail across lakes, which are often the shortest way through the Vale.</p><div class="travel"><img src="${iconURL('travel','boat',44)}" alt=""><span>Sailing costs 65 movement per tile, less than a meadow.</span></div>`,
      buttons:[{label:'Not now',value:false},{label:'Buy a boat for 1,000 gold',value:true,primary:true,disabled:S.res.gold<1000}],dismiss:false});
    if(v){S.res.gold-=1000;h.boat=true;toast('You have a boat. Lakes are now open to you.');renderUI();}return true;}
  case 'fair':{if(!last)return false;if(h.mount!=='foot'){toast(h.mount==='hooves'?'Centaurs need no horse.':'You are already mounted.');return false;}
    const v=await showModal({title:'Horse Fair',body:`<p>Traders show off a line of sturdy riding horses.</p><div class="travel"><img src="${iconURL('travel','horse',44)}" alt=""><span>Movement ${fmt(maxMP())} → ${fmt(Math.round(maxMP()*1.4))} per day.</span></div>`,
      buttons:[{label:'Not now',value:false},{label:'Buy a horse for 800 gold',value:true,primary:true,disabled:S.res.gold<800}],dismiss:false});
    if(v){S.res.gold-=800;h.mount='horse';toast(`${h.name} rides on. +40% movement from tomorrow.`);renderUI();}return true;}
  }
  return false;
}
function addToArmy(k,n){const a=HERO().army;const s=a.find(x=>x.k===k);if(s){s.n+=n;return true;}if(a.length<7){a.push({k,n});return true;}return false;}
function townArrive(){
  const t=TW(),h=HERO(),home=t===S.town;
  for(const b of FAC_BUILD[TF()]||[])if(b.visit&&t.built[b.id]&&!(t.taught||(t.taught={}))[h.id+b.id]){t.taught[h.id+b.id]=1;h[b.visit]++;toast(`${b.name}: ${h.name} learns +1 ${STATN[b.visit]}.`);}
  learnLibrary();
  if(home&&t.built.reliquary&&h.relics.length){const got=h.relics.splice(0);for(const r of got){S.delivered.push(r);if(r===5)S.heroes.forEach(x=>{x.book=true;if(!x.spells.includes('starfall'))x.spells.push('starfall');});}
    toast(`${got.map(r=>RELICS[r].name).join(', ')} placed in the Relic Hall. ${S.delivered.length}/7 home.`);}
  else if(home&&h.relics.length&&!t.built.reliquary)toast('Build the Relic Hall to bring your relics home.');
  if(t.built.stables&&h.mount==='foot'){h.mount='horse';toast(`${h.name} takes a horse from the stables.`);}
  if(t.built.lib1&&h.mana<maxMana()){h.mana=maxMana();toast('The Lantern Library refills your mana.');}
  renderUI();
}
async function arriveTown(tw){tw=tw&&tw!==S.town?tw:null;if(!tw&&S.town.taken){toast(`${esc(S.town.taken.name)} holds ${esc(S.town.name)}.`);return;}VT=tw;townArrive();VT=null;if(S.mode!=='conquest'&&goalMet()){await victory();return;}openTown(tw);}
function learnLibrary(){const h=HERO(),t=TW();if(!h.book)return;const add=[];if(t.built.lib1)add.push(...libSpells(1));if(t.built.lib2)add.push(...libSpells(2));
  const fresh=add.filter(s=>!h.spells.includes(s));if(fresh.length){h.spells.push(...fresh);toast(`${h.name} learns ${fresh.map(s=>SP[s].name).join(' and ')}.`);}}
async function addXP(n){
  const h=HERO();n=Math.round(n*(1+0.1*skLevel(h,'learning')));h.xp+=n;
  while(h.xp>=xpFor(h.lvl)){
    h.lvl++;const keys=['atk','def','pow','lore'];const a=keys.splice(ri(0,3),1)[0],b=keys[ri(0,2)];
    const what={atk:'All troops deal +5% damage per point over the enemy’s defense.',def:'All troops take less damage.',pow:'Spells hit harder and heal more.',lore:'+10 maximum mana.'};
    /* v36: the stat choice uses the same centred card row as the skill choice */
    const card=k=>`<button class="skcard" data-skpick="${k}"><img src="${iconURL('stat',k,64)}" alt="" class="stico"><b>${STATN[k]}</b><span class="tag ok">${h[k]} → ${h[k]+1}</span><span class="skfx">${what[k]}</span></button>`;
    const pv=showModal({title:`${h.name} reaches level ${h.lvl}`,wide:true,body:`<p class="skhint">Choose what your hero has learned.</p><div class="skgrid" style="--n:2">${card(a)}${card(b)}</div>`,buttons:[]});
    $('#modal').querySelector('.skgrid').addEventListener('click',e=>{const bt2=e.target.closest('[data-skpick]');if(bt2)$('#modal')._close(bt2.dataset.skpick);});
    const v=await pv;
    h[v]++;if(v==='lore')h.mana+=10;renderUI();
    // then a skill: learn a new one or improve one you have
    const ups=h.skills.filter(k=>skLevel(h,k)<3),news=h.skills.length<SK_MAX?Object.keys(SK).filter(k=>!h.skills.includes(k)):[];
    const opts=[];const sh=a=>a.slice().sort(()=>Math.random()-0.5);
    for(const k of sh(news).slice(0,2))opts.push(k);for(const k of sh(ups).slice(0,2))opts.push(k);for(const k of sh([...news,...ups]))if(opts.length<4&&!opts.includes(k))opts.push(k);
    if(opts.length){/* v36: up to four cards in one even row, each with a big centred icon, the name, its level step and the effect */
      const sc=k=>{const nl=skLevel(h,k)+1;return`<button class="skcard${nl>1?' up':''}" data-skpick="${k}">${skIco(k,72)}<b>${SK[k].name}</b><span class="tag ${nl>1?'ok':''}">${nl>1?`${SK_LV[nl-1]} → ${SK_LV[nl]}`:'New skill'}</span><span class="skfx">${SK_TXT[k](nl)}</span></button>`;};
      const pr=showModal({title:`${h.name}: choose a skill`,wide:true,body:`<p class="skhint">${h.skills.length<SK_MAX?`Learn something new or sharpen a skill you have. Heroes can know up to ${SK_MAX} skills, each up to Expert.`:'Sharpen one of your skills.'}</p><div class="skgrid" style="--n:${opts.length}">${opts.map(sc).join('')}</div>`,buttons:[]});
      $('#modal').querySelector('.skgrid').addEventListener('click',e=>{const b=e.target.closest('[data-skpick]');if(b)$('#modal')._close(b.dataset.skpick);});
      const w=await pr;
      if(!h.skills.includes(w)){h.skills.push(w);}else{h.skLv=h.skLv||{};h.skLv[w]=skLevel(h,w)+1;}if(w==='deepres')h.mana=Math.min(maxMana(),h.mana);renderUI();}
  }
}
/* each week rolls an event */
const EVENTS=[{k:'plain',w:4,name:'A quiet week',txt:'Nothing unusual.'},{k:'bounty',w:2,name:'Week of Plenty',txt:'Every dwelling musters 25% more.'},
  {k:'unit',w:3,name:'Week of the {u}',txt:'+5 {p} this week.'},{k:'gold',w:2,name:'Golden Week',txt:'Merchants pay a tithe: +1,000 gold.'},
  {k:'wild',w:2,name:'Week of the Wild',txt:'Wild creatures multiply twice as fast.'},{k:'road',w:2,name:'Fair Winds',txt:'All heroes move 10% farther this week.'},
  {k:'lean',w:1,name:'Lean Week',txt:'Dwellings muster 25% less.'}];
function rollEvent(){const tot=EVENTS.reduce((a,e)=>a+e.w,0);let r=Math.random()*tot;const e=EVENTS.find(x=>(r-=x.w)<0)||EVENTS[0];
  const ev={k:e.k,name:e.name,txt:e.txt};if(e.k==='unit'){const i=ri(0,2),k=FAC[S.fac].units[i];ev.unit=k;ev.name=e.name.replace('{u}',U[k].name);ev.txt=e.txt.replace('{p}',U[k].pl);}return ev;}
/* army upkeep (v30): each week every troop you field or garrison costs 3% of its price (wild recruits count by their health) */
const troopPrice=k=>U[k].cost||U[k].hp*8;
function upkeepNow(){let g=0;const add=arr=>{for(const a of arr||[])g+=a.n*troopPrice(a.k)*0.03;};
  S.heroes.forEach(h=>add(h.army));allTowns().forEach(t=>add(t.garrison));S.objs.forEach(o=>{if((o.type==='camp'&&o.owned===ME()&&!o.built)||(o.type==='spire'&&o.owned===ME()))add(o.garrison);});return Math.round(g);}
const unpaid=()=>false;
function dayUpkeep(weekly){
  const t=S.town,news=[],inc=income();gain('gold',inc);const msg=[t.taken?`no income: ${esc(t.taken.name)} holds ${esc(t.name)}`:`+${fmt(inc)} gold`];
  if(!t.taken){if(facSpecial('amberDay'))gain('amber',1);if(facSpecial('oreDay'))gain('ore',2);}
  if(weekly)for(const o of S.objs)if(o.type==='camp'&&o.owned===ME()&&!o.built){o.pool=o.pool||{};for(const[k,n]of Object.entries(firstPool(o)))o.pool[k]=(o.pool[k]||0)+n;}
  let owned=0;for(const o of S.objs)if(o.type==='mine'&&o.owned===ME()){owned++;gain(MINE[o.k].res,mineOut(o));}
  if(owned)msg.push(`${owned} mine${owned>1?'s':''} paid out`);
  const cur=S.cur;S.heroes.forEach((h,i)=>{S.cur=i;h.mp=maxMP();if(allTowns().some(q=>specialIn(q,'mpTown')&&h.x===q.x&&h.y===q.y))h.mp=Math.round(h.mp*1.25);h.mana=Math.min(maxMana(),h.mana+Math.max(1,hst(h,'lore'))+2*skL('meditation')+gear(h,'manaRegen')+(facSpecial('manaRegen')?2:0));});S.cur=cur;
  for(const q of allTowns())q.builtToday=false;
  /* v46: no weekly army upkeep */
  delete S.unpaid;
  if(weekly){const d=dateParts(),ev=S.event||{};if(ev.k==='gold')gain('gold',1000);
    for(const q of allTowns()){if(q.taken)continue;const fk=q.fac||S.fac,F=FAC[fk],fb=FAC_BUILD[fk]||[],gr={};
      const mult=(q.built.muster?1.5:1)*[1,1,1.5,2][wallLvl(q)]*(ev.k==='bounty'?1.25:ev.k==='lean'?0.75:1);
      if(ev.k==='unit'&&ev.unit)gr[ev.unit]=(gr[ev.unit]||0)+5;
      for(const b of fb)if(b.horde&&q.built[b.id]){const k=F.units[b.horde[0]];gr[k]=(gr[k]||0)+b.horde[1];}
      if(specialIn(q,'horde2')){const k=F.units[1];gr[k]=(gr[k]||0)+2;}
      if(specialIn(q,'goldWeek')){gain('gold',1500);msg.push(`+1,500 gold from ${esc(q.name)}`);}
      if(q===S.town)S.heroes.forEach(h=>{for(const[k,v]of Object.entries((HBY[h.id].fx||{}).growth||{}))gr[k]=(gr[k]||0)+v;});
      q.pool=q.pool||{};F.units.forEach((k,i)=>{if(q.built['d'+(i+1)])q.pool[k]=(q.pool[k]||0)+Math.round(U[k].growth*mult)+(gr[k]||0)+(i===0&&q===S.town&&delivered(1)?2:0);});}
    if(ev.name)news.push(`<b>${ev.name}:</b> ${ev.txt}`);
    news.push(`<b>Week ${d.w} of Month ${d.m}.</b> Dwellings have new recruits. Wild creatures${S.rivals.some(r=>!r.human)?' and rivals':''} grow stronger.`);}
  news.push(`Day ${S.day}: ${msg.join(' · ')}.`);return news;
}
/* Grail Keepers wander: each walks a few tiles a day toward a far-off spot, then picks a new one */
function roamKeepers(){
  const free=(x,y,goal)=>{if(!inb(x,y)||!passableT(S.tiles[idx(x,y)])||townFoot(x,y))return false;if(goal)return true;const o=objAt(x,y);return!o&&heroIdxAt(x,y)<0&&!S.rivals.some(r=>r.x===x&&r.y===y);};
  for(const o of S.objs){if(o.type!=='relic'||!o.roam)continue;
    for(let tries=0;tries<3&&(!o.dest||(o.dest.x===o.x&&o.dest.y===o.y));tries++){const x=clamp(o.x+ri(-9,9),1,W-2),y=clamp(o.y+ri(-9,9),1,H-2);if(free(x,y))o.dest={x,y};}
    if(!o.dest)continue;
    const p=astar(o.x,o.y,o.dest.x,o.dest.y,(x,y,goal)=>free(x,y,false)||(goal&&free(x,y,true))?TCOST[S.tiles[idx(x,y)]]:Infinity);
    if(!p){o.dest=null;continue;}
    for(const q of p.slice(0,3)){if(!free(q.x,q.y))break;o.x=q.x;o.y=q.y;}
    if(o.x===o.dest.x&&o.y===o.dest.y)o.dest=null;}
}
/* before the day ends: each town that built nothing today suggests one building (troops first); build it in one click, or save the gold */
function autoPick(t){return withTown(t,()=>{if(t.builtToday)return null;const BL=townBuildings(),ok=b=>b&&bAvail(b)&&canAfford(b.cost);
  const order=['d1','d2','d3','d4','d5','u1','u2','u3','hall2','muster','u4','u5','market','tavern','hall3','wall1','still','lib2','wall2','hall4','wall3','lodge','fb1','fb2','fb3','stables','reliquary'];
  for(const id of order){const b=BL.find(x=>x.id===id);if(ok(b))return b;}return null;});}
function doBuild(t,b){withTown(t,()=>{pay(b.cost);t.built[b.id]=1;t.builtToday=true;if(b.unit)t.pool[b.unit]=(t.pool[b.unit]||0)+U[b.unit].growth;});}
async function buildAdvisor(){if(S.players||S.noAdvisor)return true;const towns=allTowns().filter(t=>!t.taken&&!t.builtToday&&autoPick(t));if(!towns.length)return true;
  const body=()=>`<p>Some of your towns haven't built anything today. Here is what each would raise next (troops first). Build now, or save your gold.</p><div class="advl">${towns.map((t,i)=>{const b=t.builtToday?null:autoPick(t),fk=t.fac||S.fac;
    return`<div class="advr"><img src="${iconURL('crest',fk,52)}" alt=""><div><b>${esc(t.name)}</b><small>${b?`${b.name}: ${b.desc}`:t.builtToday?'Built today':'Nothing affordable'}</small>${b?`<div class="cost">${costHTML(b.cost,S.res)}</div>`:''}</div>${b?`<button class="btn sm primary" data-adv="${i}">Build</button>`:t.builtToday?'<span class="tag ok">Built ✓</span>':''}</div>`;}).join('')}</div>`;
  const pr=showModal({title:'Before the day ends',body:body(),wide:true,buttons:[{label:'Stop asking',value:'stop'},{label:'Save my gold and end the day',value:'end',primary:true},{label:'Back to the map',value:'back'}],dismiss:'back'});
  const bd=$('#modal').querySelector('.body');bd.addEventListener('click',e=>{const el=e.target.closest('[data-adv]');if(!el)return;const t=towns[+el.dataset.adv],b=autoPick(t);if(!b)return;doBuild(t,b);lootPop(`${b.name} built in ${t.name}`,iconURL('crest',t.fac||S.fac,52));bd.innerHTML=body();renderUI();});
  const v=await pr;if(v==='stop'){S.noAdvisor=true;toast('The town advisor will stay quiet. Turn it back on from the ☰ menu.');}return v!=='back';}
async function endDay(){
  if(moving||S.over||modalOpen)return;
  if(!S.players&&!await buildAdvisor())return;
  if(S.players){stashPlayer();const nx=nextPlayer(S.pi);if(nx>=0){loadPlayer(nx);afterSwap();await handoff();save();return;}}
  moving=true;path=null;
  try{
    S.day++;dayFlip();
    if(S.day>S.limit){moving=false;await defeat(S.mode==='grail'?'Time has run out before the Oracle’s grails came home.':S.mode==='conquest'?'Time has run out with rival banners still flying.':'Time has run out with the crown still broken. The Glass Drakes wake, and the land falls to their winter.');return;}
    const weekly=dateParts().d===1;
    if(weekly&&!S.players)S.event=rollEvent();
    if(weekly){for(const o of S.objs)if(o.type==='neutral')o.n=Math.ceil(o.n*(S.event&&S.event.k==='wild'?1.2:1.1));
      /* key guards (beside rich mines, big artifacts and prisons) keep pace with your strongest army */
      {const top=Math.max(1,...S.heroes.map(h=>armyPower(h.army,h)));for(const o of S.objs){if(o.type!=='neutral'||!isKeyGuard(o))continue;const pw=stackPower(o.k,o.n,false)||1,want=top*0.6*monMul();if(pw<want)o.n=Math.ceil(o.n*Math.min(1.6,want/pw));}}for(const rv of S.rivals)if(!rv.human)growRival(rv);}
    if(S.mode==='grail')roamKeepers();
    if(S.players){
      for(let j=0;j<S.players.length;j++){if(S.players[j].out)continue;loadPlayer(j);const news=dayUpkeep(weekly);if(weekly){const r=addRumour(false,true);if(r)news.push(r);}S.players[j].news=news;stashPlayer();}
      loadPlayer(nextPlayer(-1));afterSwap();moving=false;await handoff();save();return;}
    dayUpkeep(weekly).forEach(m=>toast(m));if(weekly)addRumour();
    if(S.town.taken){if(!S.rivals.some(r=>r.id===S.town.taken.id))delete S.town.taken;else{const left=7-(S.day-S.town.taken.day);
      if(left<=0){moving=false;await defeat(`${S.town.taken.name} has held ${S.town.name} for a week. Your banner is broken.`);return;}toast(`<b>${left} day${left>1?'s':''}</b> left to retake ${esc(S.town.name)} from ${esc(S.town.taken.name)}.`);}}
    renderUI();
    const keepId=HERO().id;
    rivalEconomy(weekly);
    await rivalsTurn();
    {const ki=S.heroes.findIndex(q=>q.id===keepId);if(ki>=0)S.cur=ki;}
  }finally{moving=false;}
  if(!S||S.over)return;
  restoreRoute();heroDraw.x=HERO().x;heroDraw.y=HERO().y;centerOn(HERO().x,HERO().y);
  renderUI();save();
  if(dateParts().d===1&&S.day>1)await weeklyReport();
}
/* ---- hot-seat multiplayer: each player's kingdom is swapped in and out of S ---- */
const PKEYS=['fac','town','res','heroes','cur','explored','delivered','rumours','goal'];
function stashPlayer(){if(!S||!S.players)return;const P=S.players[S.pi];for(const k of PKEYS)P[k]=S[k];}
function loadPlayer(i){S.pi=i;const P=S.players[i];for(const k of PKEYS)S[k]=P[k];
  S.rivals=S.players.flatMap((q,j)=>j===i||q.out?[]:q.heroes.map(h=>Object.assign(h,{fac:q.fac,human:true,owner:j})));}
function nextPlayer(i){for(let j=i+1;j<S.players.length;j++)if(!S.players[j].out)return j;return -1;}
function afterSwap(){applyTheme();heroDraw.x=HERO().x;heroDraw.y=HERO().y;restoreRoute();centerOn(HERO().x,HERO().y,true);renderUI();}
async function handoff(){const P=S.players[S.pi],f=FAC[S.fac],news=P.news||[];P.news=[];
  $('#modal').classList.add('opaque');
  await showModal({title:`<img src="${iconURL('crest',S.fac,96)}" alt="" style="width:44px;height:44px;vertical-align:-12px;margin-right:8px;image-rendering:pixelated">Player ${S.pi+1}: ${f.arch}`,
    body:`<p>Pass the device to <b>Player ${S.pi+1}</b> (${S.heroes.map(x=>x.name).join(', ')}). Everyone else, look away.</p>${news.length?`<ul style="margin:0;padding-left:20px">${news.map(n=>`<li>${n}</li>`).join('')}</ul>`:''}`,
    buttons:[{label:'Start my turn',value:1,primary:true}]});
  $('#modal').classList.remove('opaque');}
async function eliminated(){const who=S.pi;S.players[who].out=true;stashPlayer();const alive=S.players.map((q,j)=>j).filter(j=>!S.players[j].out);
  if(alive.length===1){loadPlayer(alive[0]);afterSwap();await victory();return;}
  await showModal({title:`Player ${who+1} is out`,body:`<p>The last of Player ${who+1}'s heroes has fallen.</p>`,buttons:[{label:'Continue',value:1,primary:true}]});
  moving=false;await endDay();}
const dirWord=(x,y)=>{const dx=x-S.town.x,dy=y-S.town.y;const ns=dy>3?'south':dy<-3?'north':'',ew=dx>3?'east':dx<-3?'west':'';return(ns||ew?`${ns}${ns&&ew?'-':''}${ew} of ${S.town.name}`:`near ${S.town.name}`)+`, in ${TNAME[tileAt(x,y)].toLowerCase()} country`;};
function addRumour(first,quiet){
  let o;
  if(S.mode==='grail'){const gl=S.goal||[],seen=r=>(S.rumours.find(q=>q.r===r)||{day:-1}).day;
    const ks=S.objs.filter(q=>q.type==='relic').sort((a,b)=>(gl.includes(b.r)-gl.includes(a.r))||(seen(a.r)-seen(b.r)));o=ks[0];if(!o)return;S.rumours=S.rumours.filter(r=>r.r!==o.r);}
  else{const cand=S.objs.filter(q=>q.type==='relic'&&!S.rumours.some(r=>r.r===q.r)&&!S.explored[idx(q.x,q.y)]).sort((a,b)=>a.r-b.r);if(!cand.length)return;o=cand[0];}
  S.rumours.push({r:o.r,x:clamp(o.x+ri(-2,2),0,W-1),y:clamp(o.y+ri(-2,2),0,H-1),day:S.day,txt:dirWord(o.x,o.y)});
  const msg=`<b>Rumour:</b> the ${RELICS[o.r].name} ${S.mode==='grail'?'was last seen':'lies'} ${dirWord(o.x,o.y)}. It is circled on your map.`;
  if(quiet)return msg;if(!first)toast(msg);
}
