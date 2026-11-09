'use strict';
/* -------- rival heroes -------- */
const RIVAL_PLAN=['hall2','d3','wall1','d4','u1','hall3','u2','muster','wall2','d5','u3','hall4','u4','wall3','u5'];
function growRival(rv){rv[pick(['atk','def','pow','lore'])]++;rv.lvl=(rv.lvl||1)+1;}
/* ---- rival economy (v30): each rival banner earns gold from its home town, its holdings and its mines; each week its
   town musters recruits, it buys the best it can afford and builds one building; it hires a second hero once rich enough.
   S.rivEco[fac] = {gold, pool:{unit:n}} */
const RIVAL_COST={hall2:2500,d3:2000,wall1:1500,d4:3000,u1:800,hall3:5000,u2:1200,muster:1500,wall2:3000,d5:6000,u3:2000,hall4:10000,u4:3000,wall3:5000,u5:5000};
const rivHome=fac=>S.objs.find(o=>o.type==='camp'&&!o.free&&o.fac===fac);
function rivEco(fac){S.rivEco=S.rivEco||{};return S.rivEco[fac]||(S.rivEco[fac]={gold:Math.round((DIFF[S.diff||'normal'].res.gold||5000)*rvMul()),pool:{}});}
function rivalIncome(fac){const home=rivHome(fac);let g=home&&!home.owned&&home.built?hallGold(home):0;
  for(const o of S.objs){if(o.type==='camp'&&o.owned===fac)g+=campIncome(o);else if(o.type==='mine'&&o.owned===fac)g+=MINE[o.k].res==='gold'?mineOut(o):250*mineOut(o);}
  return Math.round(g*rvMul());}
function rivalEconomy(weekly){if(S.players)return;const facs=[...new Set(S.rivals.filter(r=>!r.human).map(r=>r.fac))];
  for(const fac of facs){const e=rivEco(fac),home=rivHome(fac),u=FAC[fac].units;e.gold+=rivalIncome(fac);
    if(!weekly||!home||home.owned||!home.built)continue;
    // muster and recruit, strongest first, keeping a little back for building
    const mult=(home.built.muster?1.5:1)*[1,1,1.5,2][wallLvl(home)]*rvMul();
    u.forEach((k,i)=>{if(home.built['d'+(i+1)])e.pool[k]=(e.pool[k]||0)+Math.round(U[k].growth*mult);});
    const reserve=Math.min(e.gold*0.25,RIVAL_COST[RIVAL_PLAN.find(b=>!home.built[b])]||0),bought=[];
    for(let i=4;i>=0;i--){const k=u[i],rk=home.built['u'+(i+1)]&&U[k+'_u']?k+'_u':k,n=Math.min(e.pool[k]||0,Math.floor((e.gold-reserve)/Math.max(1,U[rk].cost)));if(n<1)continue;e.gold-=n*U[rk].cost;e.pool[k]-=n;bought.push({k:rk,n});}
    // spare gold hires mercenaries of the banner's built dwellings at 30% over price, up to another week's growth each
    for(let i=4;i>=0;i--){if(!home.built['d'+(i+1)])continue;const k=u[i],rk=home.built['u'+(i+1)]&&U[k+'_u']?k+'_u':k,price=Math.round(U[rk].cost*1.3),n=Math.min(Math.round(U[k].growth*2*rvMul()),Math.floor((e.gold-reserve-1500)/price));if(n<1)continue;e.gold-=n*price;const ex=bought.find(b=>b.k===rk);if(ex)ex.n+=n;else bought.push({k:rk,n});}
    // recruits join a hero standing near home, otherwise they wait in the town (the garrison, which heroes come back to collect)
    const near=S.rivals.filter(r=>r.fac===fac&&!r.human&&!r.occupy&&Math.max(Math.abs(r.x-home.x),Math.abs(r.y-home.y))<=4)[0];
    for(const b of bought){const arr=near?near.army:home.garrison;const ex=arr.find(a=>a.k===b.k);if(ex)ex.n+=b.n;else if(arr.length<7)arr.push({k:b.k,n:b.n});else home.garrison.push(b);}
    // build one building a week if affordable
    for(let t=0;t<(S.diff==='expert'?3:2);t++){const nb=RIVAL_PLAN.find(b=>!home.built[b]);if(!nb||e.gold<RIVAL_COST[nb])break;e.gold-=RIVAL_COST[nb];home.built[nb]=1;if(nb[0]==='d')e.pool[u[+nb[1]-1]]=(e.pool[u[+nb[1]-1]]||0)+U[u[+nb[1]-1]].growth;}
    // older troops are retrained once their dwelling is upgraded
    for(const r of S.rivals.filter(r=>r.fac===fac&&!r.human))for(const a of r.army){const i=u.indexOf(a.k);if(i>=0&&home.built['u'+(i+1)]&&U[a.k+'_u']&&e.gold>=(U[a.k+'_u'].cost-U[a.k].cost)*a.n){e.gold-=(U[a.k+'_u'].cost-U[a.k].cost)*a.n;a.k=a.k+'_u';}}
    // a second (or third, on Expert) hero once the banner can afford it
    const mine=S.rivals.filter(r=>r.fac===fac&&!r.human),cap=S.diff==='expert'?3:2,wk=weekNo();
    if(mine.length<cap&&wk>=(S.diff==='hard'||S.diff==='expert'?2:3)&&e.gold>=3000){
      const taken=new Set([...S.heroes.map(h=>h.id),...S.rivals.map(r=>r.id)]),hid=(HEROES.find(h=>h.fac===fac&&!h.rogue&&!taken.has(h.id))||{}).id;
      if(hid){e.gold-=2500;const nr=mkRival(hid,home.x,home.y);nr.army=[{k:u[0],n:Math.round(160*rvMul()/U[u[0]].hp)},{k:u[1],n:Math.round(80*rvMul()/U[u[1]].hp)}];
        // take some of the waiting garrison along
        const g=home.garrison.slice(0,2).map(a=>({k:a.k,n:Math.ceil(a.n/2)}));for(const a of g){const src=home.garrison.find(x=>x.k===a.k);src.n-=a.n;const ex=nr.army.find(x=>x.k===a.k);if(ex)ex.n+=a.n;else nr.army.push(a);}
        home.garrison=home.garrison.filter(a=>a.n>0);S.rivals.push(nr);if(seenNow(home.x,home.y))toast(`<b>${esc(nr.name)}</b> rides out of ${esc(home.name||FAC[fac].town)} to join the ${FAC[fac].arch}.`);}}}}
function rivalCost(rv,x,y,goal){
  const t=tileAt(x,y);let c;
  if(t===T.LAKE){if(rv.fac==='pirates')c=65;else if(rv.fac==='merfolk')c=50;else return Infinity;}
  else if(!passableT(t))return Infinity;else c=TCOST[t]*(rv.fac==='merfolk'?1.5:1);
  if(townFoot(x,y))return Infinity;
  if((objAt(x,y)||{}).type==='town'&&!(goal&&!S.players&&x===S.town.x&&y===S.town.y))return Infinity;
  if(goal)return c;
  const o=objAt(x,y);if(o&&(o.type==='neutral'||o.type==='relic'))return Infinity;
  if(o&&o.type==='spire'&&o.owned&&o.owned!==rv.fac&&o.garrison.length)return Infinity;
  {const z=zocMap.get(rv);if(z&&z.has(idx(x,y)))return Infinity;}
  if(heroIdxAt(x,y)>=0||S.rivals.some(r=>r!==rv&&r.x===x&&r.y===y))return Infinity;
  return c;}
function rivalTarget(rv){
  const pw=armyPower(rv.army,rv),c=[];zocMap.set(rv,zocFor(rv.fac));
  for(const o of S.objs){let v=0;
    if(o.type==='pile'||o.type==='gem')v=6;else if(o.type==='flot'&&(rv.fac==='pirates'||rv.fac==='merfolk'))v=8;else if(o.type==='artifact')v=8+4*ITEMS[o.item].lvl;else if(o.type==='drop')v=60;else if(o.type==='mine'&&o.owned!==rv.fac)v=o.owned===ME()?16:12;
    else if(o.type==='relic'){if(S.day>7&&stackPower(o.k,o.n)*1.5<pw)v=45;}
    else if(o.type==='neutral'&&o.guard){if(stackPower(o.k,o.n)*1.3<pw)v=14;}
    else if(o.type==='spire'&&o.owned!==rv.fac){if(!o.garrison.length)v=o.owned?14:9;else if(armyPower(o.garrison)*1.4<pw)v=18;}
    if(v)c.push({o,x:o.x,y:o.y,v});}
  for(const h of S.heroes)if(armyPower(h.army,h)*1.25/aggMul()<pw)c.push({heroObj:h,x:h.x,y:h.y,v:(20+h.relics.length*30)*aggMul()});
  // a weak town with no hero at home is a target, after the first week
  if(!S.players&&!S.town.taken&&S.day>Math.round(7/aggMul())&&!S.heroes.some(h=>h.x===S.town.x&&h.y===S.town.y)&&townDefense()*1.3/aggMul()<pw)c.push({town:true,x:S.town.x,y:S.town.y,v:28*aggMul()});
  // rivals want their own camp back, and raid holdings of others
  for(const o of S.objs)if(o.type==='camp'&&o.owned!==rv.fac&&(o.owned||o.free)&&armyPower(o.garrison||[])*1.3/aggMul()<pw)c.push({o,x:o.x,y:o.y,v:!o.free&&o.fac===rv.fac?40:o.free&&!o.owned?16:18*aggMul()});
  {const home=rivHome(rv.fac);if(home&&!home.owned&&home.garrison&&home.garrison.length>1&&armyPower(home.garrison)>pw*0.35)c.push({pickup:home,x:home.x,y:home.y,v:22+Math.min(30,armyPower(home.garrison)/Math.max(1,pw)*20)});}
  c.forEach(q=>q.s=q.v/(Math.hypot(q.x-rv.x,q.y-rv.y)+4));c.sort((a,b)=>b.s-a.s);
  for(const q of c.slice(0,6)){if(Math.hypot(q.x-rv.x,q.y-rv.y)>Math.max(26,(W+H)/2))continue;const p=astar(rv.x,rv.y,q.x,q.y,(x,y,goal)=>rivalCost(rv,x,y,goal));if(p&&p.length){q.path=p;return q;}}
  return null;}
function autoResolve(rv,theirs){const ours=armyPower(rv.army,rv);
  if(ours>theirs){const f=Math.min(0.85,Math.pow(theirs/ours,1.4)*0.75);rv.army.forEach(a=>a.n=Math.max(1,Math.round(a.n*(1-f))));return true;}
  rv.army.forEach(a=>a.n=Math.max(1,Math.round(a.n*0.3)));return false;}
/* how much of the land a rival has covered: 6×6 chunks around each step */
function markCov(rv){rv.cov=rv.cov||{};const cw=Math.ceil(W/6),cx=Math.floor(rv.x/6),cy=Math.floor(rv.y/6);for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=cx+dx,y=cy+dy;if(x>=0&&y>=0&&x<cw&&y*6<H)rv.cov[x+y*cw]=1;}}
const covFrac=rv=>Object.keys(rv.cov||{}).length/(Math.ceil(W/6)*Math.ceil(H/6));
/* the weekly report: your kingdom in numbers, and a rough read on each rival */
async function weeklyReport(){if(S.players||S.over)return;const d=dateParts(),you=allTowns(),mines=S.objs.filter(o=>o.type==='mine'&&o.owned===ME());
  const exp=S.explored.reduce((a,v)=>a+(v?1:0),0)/(W*H),best=Math.max(1,...S.heroes.map(h=>armyPower(h.army,h)));
/* a picture of each kind of mine held, with how many */
  const mineRow=list=>{const by={};for(const o of list)by[o.k]=(by[o.k]||0)+1;const ks=Object.keys(MINE).filter(k=>by[k]);
    return ks.length?`<div class="wmines">${ks.map(k=>`<span class="wmine" title="${MINE[k].name}: ${by[k]}">${MINE_ART[k]?`<i class="mpic" style="background-image:url(${ART_BASE}map/mines/${MINE_ART[k][0]}.png)"></i>`:`<img src="${iconURL('res',MINE[k].res,40)}" alt="">`}<b>×${by[k]}</b><small>${MINE[k].name}</small></span>`).join('')}</div>`:'<span class="muted">none yet</span>';};
  const mineTxt=mineRow(mines);
  const covW=f=>f<0.1?'has barely left home':f<0.25?'has scouted the lands near home':f<0.45?'has covered about a third of the land':f<0.65?'has ranged over half the land':'has been almost everywhere';
  const powW=r=>r<0.5?'much weaker than your best army':r<0.85?'a little weaker than your best army':r<1.2?'about even with your best army':r<2?'stronger than your best army':'far stronger than your best army';
  const rivals=S.rivals.filter(r=>!r.human).map(rv=>{const camp=S.objs.find(o=>o.type==='camp'&&!o.free&&o.fac===rv.fac),hold=S.objs.filter(o=>(o.type==='mine'||o.type==='camp')&&o.owned===rv.fac).length,rmines=S.objs.filter(o=>o.type==='mine'&&o.owned===rv.fac);
    const wealth=(camp&&camp.built&&!camp.owned?Object.keys(camp.built).length:0)+hold*2,ww=wealth<6?'lean':wealth<10?'comfortable':wealth<15?'rich':'overflowing';
    const top=rv.army.slice().sort((a,b)=>FAC[rv.fac].units.indexOf(b.k.replace(/_u$/,''))-FAC[rv.fac].units.indexOf(a.k.replace(/_u$/,'')))[0];
    return`<div class="wrow"><img src="${iconURL('crest',rv.fac,52)}" alt=""><div><b>${esc(rv.name)}</b> <span class="muted">· ${FAC[rv.fac].arch}${camp&&camp.owned===ME()?' · you hold their home':''}</span>
      <p>Scouts say ${esc(rv.name)} ${covW(covFrac(rv))}. Their coffers look <b>${ww}</b>. Their best troops are <b>${top?U[top.k].pl:'none'}</b>, ${powW(armyPower(rv.army,rv)/best)}.</p>${mineRow(rmines)}</div>
      ${top?`<div class="wtroop" title="Best troop: ${U[top.k].pl}"><img class="${U[top.k].up?'upg':''}" src="${iconURL('unit',top.k,64)}" alt=""><small>Best troop</small><b>${U[top.k].name}</b></div>`:'<div></div>'}</div>`;}).join('');
  await showModal({title:`Weekly report · Month ${d.m}, Week ${d.w}`,body:`<h3 class="gsec">Your kingdom</h3>
    <div class="wgrid"><div><em>Towns</em><b>${you.length}</b></div><div><em>Outposts</em><b>${S.objs.filter(o=>o.type==='camp'&&o.owned===ME()&&!o.built).length}</b></div><div><em>Heroes</em><b>${S.heroes.length}</b></div><div><em>Gold a day</em><b>${fmt(income())}</b></div><div><em>Upkeep a week</em><b>${fmt(upkeepNow())}</b></div><div><em>Land explored</em><b>${Math.round(exp*100)}%</b></div><div><em>Best army</em><b>${fmt(best)}</b></div></div>
    <div class="wsub">Your mines</div>${mineTxt}
    <h3 class="gsec">Rivals</h3>${rivals||'<p class="muted">No rival banners remain.</p>'}`,wide:true,buttons:[{label:'Onward',value:1,primary:true}],dismiss:1});}
async function rivalsTurn(){
  for(const rv of S.rivals)rv._shown=0;
  for(const rv of [...S.rivals]){
    if(rv.human||rv.occupy)continue;
    if(!S||S.over||!S.rivals.includes(rv))continue;
    let mp=1350;
    for(let step=0;step<4&&mp>60;step++){
      const tg=rivalTarget(rv);if(!tg)break;
      let arrived=false;
      for(let i=0;i<tg.path.length;i++){const n=tg.path[i],pv=i?tg.path[i-1]:{x:rv.x,y:rv.y};const cst=Math.round(rivalCost(rv,n.x,n.y,true)*((pv.x!==n.x&&pv.y!==n.y)?1.414:1));
        if(cst>mp){mp=0;break;}mp-=cst;if(i===tg.path.length-1){arrived=true;break;}rv.face=dirOf(n.x-rv.x,n.y-rv.y);
        // rivals you can see walk step by step, with the camera following them, so you can track where they go
        const vis=seenNow(rv.x,rv.y)||seenNow(n.x,n.y);if(vis&&!reduced){if(!rv._shown){rv._shown=1;centerOn(n.x,n.y);toast(`<b>${esc(rv.name)}</b> (${FAC[rv.fac].arch}) is on the move.`);await sleep(250);}
          const sx=n.x*TS-camX,sy=n.y*TS-camY;if(sx<TS*2||sy<TS*2||sx>vw-TS*3||sy>vh-TS*3)centerOn(n.x,n.y);rv.x=n.x;rv.y=n.y;await sleep(170);}else{rv.x=n.x;rv.y=n.y;}
        if(seenNow(rv.x,rv.y))rv.seen={x:rv.x,y:rv.y,day:S.day};markCov(rv);}
      if(!arrived)break;
      const rres=await rivalInteract(rv,tg);if(S&&S.pendingWin){S.pendingWin=false;await victory();return;}if(rres==='stop')break;
      if(!S||S.over)return;
    }
  }
}
async function rivalInteract(rv,tg){
  if(tg.pickup){const home=tg.pickup;rv.x=home.x;rv.y=home.y;
    // keep the weakest stack home as a token defence; take the rest
    const g=home.garrison.slice().sort((a,b)=>stackPower(b.k,b.n)-stackPower(a.k,a.n)),keep=g.length>1?g.pop():null;
    for(const a of g){const ex=rv.army.find(x=>x.k===a.k);if(ex)ex.n+=a.n;else if(rv.army.length<7)rv.army.push({...a});else if(keep){keep.n+=0;}}
    home.garrison=keep?[keep]:[];return'go';}
  if(tg.town){const t=S.town;if(t.taken||S.heroes.some(h=>h.x===t.x&&h.y===t.y))return'stop';
    const def=townDefense(),lv=wallLvl();centerOn(t.x,t.y,true);
    if(autoResolve(rv,def)){t.garrison=[];t.taken={id:rv.id,name:rv.name,day:S.day};rv.x=t.x;rv.y=t.y;rv.occupy=true;renderUI();
      await showModal({title:`${esc(t.name)} has fallen!`,body:`<p>The rival ${FAC[rv.fac].arch} hero <b>${esc(rv.name)}</b> broke ${lv?`through your ${WALLS[lv-1].name.toLowerCase()} and `:''}your garrison and now holds ${esc(t.name)}.</p><p>While they hold it you get no town income or recruits, and you cannot enter. <b>Defeat ${esc(rv.name)} at the gate within 7 days</b>, or the land is lost.</p>`,buttons:[{label:'To arms',value:1,primary:true}]});}
    else{const f=Math.min(0.8,Math.pow(armyPower(rv.army,rv)/Math.max(1,def),1.4)*0.5);t.garrison.forEach(a=>a.n=Math.max(1,Math.round(a.n*(1-f))));
      toast(`<b>${esc(rv.name)}</b> attacked ${esc(t.name)}, but ${lv?`the ${WALLS[lv-1].name.toLowerCase()} and `:''}the garrison held.`);}
    return'stop';}
  if(tg.heroObj){const h=tg.heroObj;if(!S.heroes.includes(h))return'stop';
    S.cur=S.heroes.indexOf(h);heroDraw.x=h.x;heroDraw.y=h.y;centerOn(h.x,h.y,true);renderUI();
    await showModal({title:`${rv.name} attacks!`,body:`<p>The rival ${FAC[rv.fac].arch} hero <b>${rv.name}</b> falls on ${h.name}'s army.</p>`,buttons:[{label:'To battle',value:1,primary:true}]});
    await startBattle({type:'rival',rival:rv,x:h.x,y:h.y});return'stop';}
  const o=tg.o;
  if(o.type==='pile'||o.type==='gem'||o.type==='flot'){S.objs=S.objs.filter(q=>q!==o);rv.x=o.x;rv.y=o.y;return'go';}
  if(o.type==='artifact'){S.objs=S.objs.filter(q=>q!==o);(rv.items=rv.items||[]).push(o.item);rv.x=o.x;rv.y=o.y;return'go';}
  if(o.type==='drop'){S.objs=S.objs.filter(q=>q!==o);rv.relics.push(...o.rs);rv.x=o.x;rv.y=o.y;toast(`<b>${rv.name}</b> picked up ${o.rs.map(r=>RELICS[r].name).join(', ')}.`);return'go';}
  if(o.type==='mine'){rv.x=o.x;rv.y=o.y;if(o.owned===ME())toast(`<b>${rv.name}</b> seized your ${MINE[o.k].name}.`);o.owned=rv.fac;o.ownerName=rv.name;return'go';}
  if(o.type==='camp'){if(o.garrison&&o.garrison.length&&!autoResolve(rv,o.built?townDefense(o):armyPower(o.garrison))){o.garrison.forEach(a=>a.n=Math.max(1,Math.round(a.n*0.7)));if(o.owned===ME())toast(`${esc(campName(o))} held against <b>${esc(rv.name)}</b>.`);return'stop';}
    if(o.owned===ME())toast(`<b>${esc(rv.name)}</b> has taken ${esc(campName(o))} from you.`);rv.x=o.x;rv.y=o.y;o.owned=!o.free&&o.fac===rv.fac?false:rv.fac;o.garrison=[];return'go';}
  if(o.type==='spire'){rv.x=o.x;rv.y=o.y;
    if(o.garrison.length){if(!autoResolve(rv,armyPower(o.garrison)*1.25)){o.garrison.forEach(a=>a.n=Math.max(1,Math.round(a.n*0.7)));if(o.owned===ME())toast(`Your spire held against <b>${rv.name}</b>.`);return'stop';}}
    if(o.owned===ME())toast(`<b>${rv.name}</b> has taken one of your spires.`);o.owned=rv.fac;o.ownerName=rv.name;o.garrison=[];return'go';}
  if(o.type==='relic'||o.type==='neutral'){
    if(autoResolve(rv,stackPower(o.k,o.n))){S.objs=S.objs.filter(q=>q!==o);rv.x=o.x;rv.y=o.y;
      if(o.type==='relic'){rv.relics.push(o.r);toast(`<b>${rv.name}</b> has taken the ${RELICS[o.r].name}! Defeat them to claim it.`);}
      else if(seenNow(o.x,o.y))toast(`${rv.name} has broken through a guarded pass.`);return'go';}
    o.n=Math.max(1,Math.round(o.n*0.6));return'stop';}
  return'stop';}
