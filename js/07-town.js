'use strict';
/* -------- town screen -------- */
/* each banner's mages teach their own spells: the Library the first two, the Star Archive the rest */
const FAC_SPELLS={rangers:['mend','swift','entangle','bark','rally','starfall'],wizards:['ember','swift','chain','frost','bark','meteor','starfall'],necro:['ember','weaken','raise','bark','squall','meteor'],
  centaurs:['swift','mend','entangle','rally','squall'],pirates:['squall','ember','swift','weaken','mend','meteor'],elves:['entangle','mend','swift','frost','starfall'],dwarves:['ember','bark','geyser','weaken','mend','meteor'],merfolk:['squall','mend','chain','frost','swift','rally']};
/* towns: S.town is the home town; a captured major town is its camp object (o.major, or a rival's home camp), which carries its own built, pool, garrison and name.
   The town screen works on the viewed town TW() of banner TF(). */
let VT=null;
const TW=()=>VT||S.town,TF=()=>(VT&&VT.fac)||S.fac;
const withTown=(t,f)=>{const o=VT;VT=!t||t===S.town?null:t;try{return f();}finally{VT=o;}};
const specialIn=(t,k)=>!!(t&&t.built&&(FAC_BUILD[t.fac||S.fac]||[]).some(b=>b.special===k&&t.built[b.id]));
const libSpells=lvl=>{const l=FAC_SPELLS[TF()];return lvl===1?l.slice(0,2):l.slice(2);};
const BOOK_COST=500,HIRE_COST=2500;
const heroHere=()=>HERO().x===TW().x&&HERO().y===TW().y;
/* the tavern offers two heroes of your banner and two rogues (wanderers of other banners if rogues run out); the offer changes each week */
const hireCost=x=>x.fac===TF()&&!x.rogue?HIRE_COST:HIRE_COST+500;
const hireable=()=>{const taken=new Set([...S.heroes.map(y=>y.id),...S.rivals.map(r=>r.id),...(S.players||[]).flatMap(p=>(p.heroes||[]).map(h=>h.id))]);
  const free=HEROES.filter(x=>!taken.has(x.id)&&!x.blank),g=mulberry32((S.seed^Math.imul(weekNo()+1,7919))>>>0),sh=a=>a.map(x=>[g(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]);
  const rg=sh(free.filter(x=>x.rogue&&!(S.jailed||[]).includes(x.id))).slice(0,2);const own=free.filter(x=>x.fac===TF()&&!x.rogue);return[...[...own.filter(x=>x.tav),...sh(own.filter(x=>!x.tav))].slice(0,2),...rg,...sh(free.filter(x=>x.fac!==TF()&&!x.rogue)).slice(0,2-rg.length)];};
/* each banner's own buildings: a horde (more of one troop each week), one that teaches visiting heroes, and a special */
const FAC_BUILD={
  rangers:[{id:'fb1',name:'Bramble Warren',horde:[0,4]},{id:'fb2',name:"Hunter's Lodge",visit:'atk'},{id:'fb3',name:'Waystone Circle',special:'mpTown',desc:'Heroes who start the day in town get +25% movement that day.'}],
  wizards:[{id:'fb1',name:'Owl Roost',horde:[0,5]},{id:'fb2',name:'Observatory',visit:'pow'},{id:'fb3',name:'Arcane Conduit',special:'manaRegen',desc:'Every hero regains 2 more mana each day.'}],
  necro:[{id:'fb1',name:'Ossuary',horde:[0,5]},{id:'fb2',name:'Whispering Crypt',visit:'lore'},{id:'fb3',name:'Soul Vault',special:'harvest',desc:'Grave Harvest raises 5% more of the fallen.'}],
  centaurs:[{id:'fb1',name:'Den of Plenty',horde:[0,4]},{id:'fb2',name:'Trial Grounds',visit:'atk'},{id:'fb3',name:'Great Paddock',special:'horde2',desc:'+2 of your second-tier troops each week.'}],
  pirates:[{id:'fb1',name:'Grog Hall',horde:[0,4]},{id:'fb2',name:'Gunnery Range',visit:'atk'},{id:'fb3',name:"Smugglers' Cove",special:'goldWeek',desc:'Brings in 1,500 gold at the start of each week.'}],
  elves:[{id:'fb1',name:'Seedling Grove',horde:[0,4]},{id:'fb2',name:'Moonlit Glade',visit:'lore'},{id:'fb3',name:'Sylvan Spring',special:'amberDay',desc:'Gives 1 amber each day.'}],
  dwarves:[{id:'fb1',name:'Delving Halls',horde:[0,4]},{id:'fb2',name:'Runestone',visit:'def'},{id:'fb3',name:'Deep Seam',special:'oreDay',desc:'Gives 2 ore each day.'}],
  merfolk:[{id:'fb1',name:'Spawning Pools',horde:[0,5]},{id:'fb2',name:'Coral Shrine',visit:'pow'},{id:'fb3',name:'Tide Market',special:'goldWeek',desc:'Brings in 1,500 gold at the start of each week.'}]};
const FB_COST=[{gold:1500,timber:5},{gold:2000,ore:5,gems:2},{gold:3000,timber:5,amber:3,moonwater:3}];
const facSpecial=k=>!!(S&&S.town&&allTowns().some(t=>!t.taken&&specialIn(t,k)));
/* walls: more growth, and they defend the town when a rival attacks it */
const WALLS=[{id:'wall1',name:'Palisade',cost:{gold:1500,timber:10},desc:'A timber wall: the garrison fights 25% harder when the town is attacked.'},
  {id:'wall2',name:'Stronghold',cost:{gold:3000,ore:10},req:['wall1'],desc:'Stone walls: +50% troop growth each week, and the garrison fights 50% harder.'},
  {id:'wall3',name:'Bastion',cost:{gold:5000,ore:10,gems:3},req:['wall2','hall2'],desc:'Towers on the walls: +100% troop growth each week, the garrison fights twice as hard, and the towers join the defence.'}];
const wallLvl=(t=TW())=>!t.built?0:t.built.wall3?3:t.built.wall2?2:t.built.wall1?1:0;
function townDefense(t=S.town){const lv=wallLvl(t),g=armyPower(t.garrison||[]);return g*[1,1.25,1.5,2][lv]+(lv===3?stackPower('troll',8):0);}
function townBuildings(){
  const f=FAC[TF()],fk=TF();
  const L=[
    {id:'hall1',name:'Moot Hall',cost:{},desc:'Brings in 500 gold each day.'},
    {id:'hall2',name:'Council Hall',cost:{gold:2500,timber:5,ore:5},req:['hall1'],desc:'Raises daily gold to 1,000.'},
    {id:'hall3',name:'High Seat',cost:{gold:5000,timber:10,ore:10,gems:3},req:['hall2','lib1'],desc:'Raises daily gold to 2,000.'},
    {id:'hall4',name:'Crown Seat',cost:{gold:10000,ore:10,gems:5,moonwater:5},req:['hall3','wall2'],desc:VT?'A grand seat of rule: daily gold rises to 3,000.':'Makes this your capital: daily gold rises to 3,000.'},
    ...VT?[]:[{id:'reliquary',name:altarName(),cost:{gold:1500,ore:5},desc:S.mode==='grail'?'Heroes entering town place their grails here. The three the Oracle wants win the game.':S.mode==='conquest'?'Heroes entering town place their relics here for the bonuses.':'Heroes entering town place their relics here. All seven wins the game.'}],
    {id:'tavern',name:'Tavern',cost:{gold:800,timber:5},desc:'Hire more heroes (up to four, five with the Heroes\' Lodge): two of this banner and two rogues, new each week.'},
    {id:'lodge',name:"Heroes' Lodge",cost:{gold:5000,timber:10,gems:4,moonwater:3},req:['tavern','hall3'],desc:'Room for a fifth hero in your company.'},
    {id:'still',name:"Alchemist's Still",cost:{gold:2000,timber:5,ore:5},req:['hall2'],desc:'Cut gems from ore and distil moonwater from amber, any day, in the Market.'},
  ];
  const dc=[{gold:400},{gold:1000,timber:5},{gold:2000,timber:10,ore:5},{gold:3000,ore:5,amber:5,gems:3},{gold:6000,timber:10,amber:5,moonwater:5}];
  const dr=[[],[],['d1'],['d2','lib1'],['d3','d4']];
  f.units.forEach((k,i)=>L.push({id:'d'+(i+1),name:f.dw[i],unit:k,cost:dc[i],req:dr[i],desc:`Musters ${U[k].pl}.`}));
  const uc=[{gold:800,timber:5},{gold:1200,ore:5},{gold:2000,timber:5,ore:5,gems:2},{gold:3000,amber:5,moonwater:3},{gold:5000,gems:5,moonwater:5}];
  f.units.forEach((k,i)=>L.push({id:'u'+(i+1),name:`${f.dw[i]}: upgrade`,cost:uc[i],req:['d'+(i+1)],desc:`Recruits ${U[k+'_u'].pl} instead, and lets heroes in town upgrade their ${U[k].pl}.`}));
  L.push({id:'muster',name:'Muster Field',cost:{gold:1500,ore:5},req:['d1'],desc:'Every dwelling grows 50% more recruits each week.'});
  if(f.travel!=='hooves')L.push({id:'stables',name:'Stables',cost:{gold:1500,timber:5},desc:'Your hero takes a horse here: +40% movement.'});
  if(fk==='dwarves')L.push({id:'forge',name:'Great Forge',cost:{gold:2000,ore:Math.round(10*(fx().forgeCut||1))},req:['d1'],desc:'Forging: every Dwarven unit gets +1 attack and +1 defense.'});
  L.push({id:'lib1',name:'Lantern Library',cost:{gold:2000,timber:5,ore:5},desc:`Sells spellbooks and teaches ${libSpells(1).map(x=>SP[x].name).join(' and ')}. Refills mana on each visit.`});
  L.push({id:'lib2',name:'Star Archive',cost:{gold:4000,ore:5,moonwater:4},req:['lib1'],desc:`Teaches ${libSpells(2).map(x=>SP[x].name).join(', ')}.`});
  L.push({id:'market',name:'Barter Yard',cost:{gold:500,timber:5},desc:'Trade goods for gold, or gold for goods.'});
  for(const w of WALLS)L.push({...w,wall:true});
  (FAC_BUILD[fk]||[]).forEach((b,i)=>{const desc=b.horde?`+${b.horde[1]} ${U[f.units[b.horde[0]]].pl} each week.`:b.visit?`Each hero who visits learns +1 ${STATN[b.visit]}, once.`:b.desc;
    L.push({id:b.id,name:b.name,cost:FB_COST[i],req:b.horde?['d'+(b.horde[0]+1)]:i===2?['hall2']:[],desc,unique:true});});
  const SHORT={hall1:'+500 gold a day',hall2:'+1,000 gold a day',hall3:'+2,000 gold a day',hall4:'+3,000 gold a day',
    reliquary:S.mode==='conquest'?'Holds relics for their bonuses':'Deliver relics here to win',tavern:'Hire more heroes',lodge:'Room for a fifth hero',
    still:'Make gems and moonwater',muster:'+50% recruits each week',stables:'+40% movement on horseback',forge:'+1 attack and defense for all troops',
    lib1:'Spellbooks and 2 spells',lib2:`Teaches ${libSpells(2).length} more spells`,market:'Trade goods and gold',
    wall1:'Garrison +25% in a siege',wall2:'+50% growth · garrison +50%',wall3:'+100% growth · towers fire'};
  for(const b of L){if(SHORT[b.id])b.short=SHORT[b.id];
    else if(/^d\d$/.test(b.id))b.short=`${U[b.unit].growth} ${U[b.unit].growth===1?U[b.unit].name:U[b.unit].pl} a week`;
    else if(/^u\d$/.test(b.id)){const k=f.units[+b.id[1]-1];b.short=`${U[k].pl} become ${U[k+'_u'].pl}`;}
    else if(b.unique){const fb=(FAC_BUILD[fk]||[]).find(x=>x.id===b.id)||{};b.short=fb.horde?`+${fb.horde[1]} ${U[f.units[fb.horde[0]]].pl} a week`:fb.visit?`Visitors +1 ${STATN[fb.visit]}`:
      ({mpTown:'+25% movement from town',manaRegen:'+2 mana a day',harvest:'Raise 5% more dead',horde2:'+2 tier-two troops a week',goldWeek:'+1,500 gold a week',amberDay:'+1 amber a day',oreDay:'+2 ore a day'})[fb.special]||b.desc;}
    else b.short=b.desc;}
  return L;
}
function canAfford(cost){return Object.entries(cost).every(([k,v])=>S.res[k]>=v);}
function pay(cost){for(const[k,v]of Object.entries(cost))S.res[k]-=v;}
function unitCost(k,n){const u=U[k];const cut=S&&S.heroes?Math.max(0,...S.heroes.map(h=>gear(h,'costCut'))):0;const c={gold:Math.round(u.cost*n*(1-cut/100))};if(u.amber)c.amber=u.amber*n;return c;}
const recruitKey=k=>{const i=FAC[TF()].units.indexOf(k);return i>=0&&TW().built['u'+(i+1)]?k+'_u':k;};
/* every mine you hold, with an upgrade button while it is below level 3 (Barter Yard) */
function mineList(){const ms=S.objs.filter(o=>o.type==='mine'&&o.owned===ME());if(!ms.length)return'<h3 class="fd-h" style="margin-top:14px">Your mines</h3><p class="muted">Claim mines on the map and you can upgrade them from here.</p>';
  return`<h3 class="fd-h" style="margin-top:14px">Your mines</h3><div class="grid">${ms.map(o=>{const m=MINE[o.k],lv=o.lvl||1,c=MINE_UP[lv];
    return`<div class="bcard"><h4><img src="${iconURL('res',m.res,32)}" alt="" style="width:18px;vertical-align:-3px"> ${m.name} · level ${lv}</h4><p>+${fmt(mineOut(o))} ${RESNAME[m.res].toLowerCase()} a day${lv<3?` → +${fmt(m.out[lv]+(delivered(4)?(m.res==='gold'?250:1):0))} at level ${lv+1}`:' · fully upgraded'}</p>
      ${lv<3?`<div class="cost">${costHTML(c,S.res)}</div><div><button class="btn sm" data-mineup="${o.id}" ${canAfford(c)?'':'disabled'}>Upgrade</button> <button class="btn sm" data-minego="${o.id}">Show on map</button></div>`:`<div><button class="btn sm" data-minego="${o.id}">Show on map</button></div>`}</div>`;}).join('')}</div>`;}
function upCost(k,n){const c={gold:Math.max(0,(U[k+'_u'].cost-U[k].cost)*n)};return c;}
function maxAfford(k){const c1=unitCost(k,1);let m=Math.floor(S.res.gold/Math.max(1,c1.gold));if(c1.amber)m=Math.min(m,Math.floor(S.res.amber/c1.amber));return m;}
/* market prices [sell, buy] in gold, and the Alchemist's Still recipes (any town's still works) */
const PRICE={timber:[100,400],ore:[100,400],amber:[250,900],gems:[300,1100],moonwater:[300,1100]};
/* market pressure (v30): each unit bought this week raises that good's price 12%, each sold lowers it 8%; each alchemy batch this week costs 100 more gold */
function mkt(){if(!S.mkt||S.mkt.week!==weekNo())S.mkt={week:weekNo(),b:{},s:{},a:{}};return S.mkt;}
const buyPrice=k=>Math.round(PRICE[k][1]*(1+0.12*(mkt().b[k]||0))),sellPrice=k=>Math.max(Math.round(PRICE[k][0]*0.4),Math.round(PRICE[k][0]*(1-0.08*(mkt().s[k]||0))));
const alchCost=id=>({...ALCHEMY[id].cost,gold:ALCHEMY[id].cost.gold+100*(mkt().a[id]||0)});
const ALCHEMY={gem:{name:'Cut a gem',cost:{gold:250,ore:3},out:'gems'},moon:{name:'Distil moonwater',cost:{gold:250,amber:2},out:'moonwater'}};
const anyStill=()=>allTowns().some(q=>q.built&&q.built.still);
function alchemyHTML(){const on=anyStill();return`<h3 class="fd-h" style="margin-top:14px">Alchemist's Still</h3>${on?'':'<p class="muted">Build the Alchemist\'s Still in any of your towns to make gems and moonwater yourself.</p>'}
  <div class="grid">${Object.entries(ALCHEMY).map(([k,r])=>`<div class="bcard"><h4><img src="${iconURL('res',r.out,32)}" alt="" style="width:18px;vertical-align:-3px"> ${r.name}</h4><div class="cost">${costHTML(alchCost(k),S.res)}</div><div><button class="btn sm" data-alch="${k}" ${on&&canAfford(alchCost(k))?'':'disabled'}>Make 1 ${RESNAME[r.out].toLowerCase()}</button></div></div>`).join('')}</div>`;}
const costPlain=c=>Object.entries(c).filter(([,v])=>v>0).map(([k,v])=>`${fmt(v)} ${RESNAME[k].toLowerCase()}`).join(', ');
const bAvail=b=>!TW().built[b.id]&&!(b.req||[]).some(r=>!TW().built[r]);
/* the one thing worth doing next */
function townAdvice(){
  const t=TW(),here=heroHere(),BL=townBuildings(),h=HERO();
  if(!VT&&here&&h.relics.length&&!t.built.reliquary){return{tab:'build',id:'reliquary',text:canAfford(BL.find(b=>b.id==='reliquary').cost)&&!t.builtToday?`Build the Relic Hall so ${h.name} can bring the relics home.`:`Save up for the Relic Hall: ${h.name} is carrying relics.`};}
  const rec=FAC[TF()].units.filter((k,i)=>t.built['d'+(i+1)]&&(t.pool[k]||0)>0&&maxAfford(recruitKey(k))>0);
  if(here&&rec.length){const k=rec[rec.length-1],rk=recruitKey(k);return{tab:'recruit',text:`Recruit ${Math.min(t.pool[k],maxAfford(rk))} ${U[rk].pl} for ${h.name}'s army.`};}
  if(!t.builtToday){const order=['hall2','d3','reliquary','lib1','market','d4','still','hall3','tavern','u1','u2','d5','u3','muster','stables','forge','lib2','lodge','u4','u5'];
    for(const id of order){const b=BL.find(x=>x.id===id);if(b&&bAvail(b)&&canAfford(b.cost))return{tab:'build',id,text:`Build the ${b.name}. ${b.desc}`};}
    const next=order.map(id=>BL.find(x=>x.id===id)).find(b=>b&&bAvail(b));
    if(next)return{tab:'build',id:next.id,text:`Save up for the ${next.name} (${costPlain(next.cost)}).${t.built.market?' The market can trade spare goods.':''}`};}
  if(here&&!h.book&&t.built.lib1&&S.res.gold>=BOOK_COST)return{tab:'library',text:`Buy ${h.name} a spellbook at the Lantern Library.`};
  if(t.built.tavern&&S.heroes.length<heroCap()&&S.res.gold>=HIRE_COST)return{tab:'tavern',text:'Hire another hero to scout and claim mines.'};
  return{tab:'overview',text:t.builtToday?'Today’s building is done. Head out and explore.':'Nothing urgent. Head out and explore.'};
}
function townTabs(){
  const t=TW(),here=heroHere(),BL=townBuildings(),fu=FAC[TF()].units;
  const recN=fu.reduce((a,k,i)=>a+(t.built['d'+(i+1)]&&maxAfford(recruitKey(k))>0?(t.pool[k]||0):0),0);
  const buildN=t.builtToday?0:BL.filter(b=>bAvail(b)&&canAfford(b.cost)).length;
  const upN=here?HERO().army.filter(a=>{const ti=fu.indexOf(a.k);return ti>=0&&t.built['u'+(ti+1)]&&canAfford(upCost(a.k,a.n));}).length:0;
  const hireN=t.built.tavern&&S.heroes.length<heroCap()?hireable().filter(x=>S.res.gold>=hireCost(x)).length:0;
  const libN=t.built.lib1&&here&&!HERO().book&&S.res.gold>=BOOK_COST?1:0;
  const relN=here&&t.built.reliquary?HERO().relics.length:0;
  return[{id:'overview',label:'Town'},{id:'recruit',label:'Recruit',n:recN},{id:'build',label:'Build',n:buildN},{id:'upgrade',label:'Upgrades',n:upN},
    {id:'market',label:'Market',locked:!t.built.market},{id:'tavern',label:'Tavern',n:hireN,locked:!t.built.tavern},{id:'library',label:'Library',n:libN,locked:!t.built.lib1},...VT?[]:[{id:'relics',label:altarName(),n:relN}]];
}
let townTab='overview',townFocus=null,townSpots=[];
function townHTML(){
  const t=TW(),here=heroHere(),BL_=townBuildings(),BY=Object.fromEntries(BL_.map(b=>[b.id,b])),adv=townAdvice(),h=HERO();
  const tabs=townTabs().map(tb=>`<button class="ttab${tb.id===townTab?' on':''}${tb.n>0?' hot':''}${tb.locked?' locked':''}" data-tab="${tb.id}">${tb.label}${adv.tab===tb.id&&tb.id!=='overview'?'<span class="sg" title="Suggested">★</span>':''}${tb.n>0?`<i>${tb.n}</i>`:''}</button>`).join('');
  const resBar=`<div class="tres">${RES.map(k=>`<span title="${RESNAME[k]}"><img src="${iconURL('res',k,40)}" alt="${RESNAME[k]}">${fmt(S.res[k])}</span>`).join('')}<span class="muted" style="font-weight:500">+${fmt(income())} gold a day · ${t.builtToday?'building done for today':'1 building a day'}</span></div>`;
  const advice=`<div class="advice slim"><span><b>Suggested:</b> ${adv.text}</span>${adv.tab!==townTab||adv.id?`<button class="btn sm" data-go="${adv.tab}" data-goid="${adv.id||''}">${adv.tab==='overview'?'OK':'Take me there'}</button>`:''}</div>`;
  const locked=(what,id)=>{const b=BY[id];const miss=(b.req||[]).filter(r=>!t.built[r]);return`<div class="bcard"><h4>${what} is not built yet</h4><p>${b.desc}</p><div class="cost">${costHTML(b.cost,S.res)}</div><div>${miss.length?`<span class="tag no">Needs ${miss.map(r=>BY[r].name).join(', ')}</span>`:`<button class="btn sm" data-build="${id}" ${t.builtToday||!canAfford(b.cost)?'disabled':''}>Build the ${b.name}</button>`}</div></div>`;};
  let body='';
  if(townTab==='overview'){
    const f=FAC[TF()];
    const vis=here?h:null,fu=FAC[TF()].units;
    const canUp=g=>{const ti=FAC[TF()].units.indexOf(g.k);return ti>=0&&!!t.built['u'+(ti+1)];};
    const slots=(arr,side)=>Array.from({length:7},(_,i)=>{const g=arr[i];if(!g)return'<div class="slot empty"></div>';const up=canUp(g)&&(side==='g'||vis),c=up?upCost(g.k,g.n):null;
      return`<button class="slot" data-gtx="${side}${i}" title="${g.n} ${U[g.k].pl}${vis?` · click to move to the ${side==='g'?'hero':'garrison'}`:''}"><img class="${U[g.k]&&U[g.k].up?'upg':''}" src="${iconURL('unit',g.k,64)}" alt="${U[g.k].name}"><b>${g.n}</b>${up?`<span class="uplus${canAfford(c)?'':' poor'}" data-uplus="${side}${i}" role="button" title="Upgrade to ${U[g.k+'_u'].pl}: ${fmt(c.gold)} gold">+</span>`:''}</button>`;}).join('');
    body=`<div class="tscreen"><div class="tview-wrap"><canvas class="tview" id="townView" width="960" height="${TOWN_SCREEN[TF()]?360:300}" aria-label="${esc(t.name)}: click a building. Click the hall to see everything you can build."></canvas><div class="tv-tip" id="tvTip" hidden></div></div>
      <div class="tstrip">
        <div class="tvisit">
          <div class="thero">${vis?`<img src="${iconURL('hero',vis.id,128)}" alt=""><div><b>${esc(vis.name)}</b><small>${H_().type} hero · visiting</small></div>`:'<div><b>No hero in town</b><small>Bring a hero to the gate to swap troops.</small></div>'}</div>
          <div class="trow small">${vis?slots(vis.army,'h'):''}</div>
        </div>
        <div class="tgarr">
          <div class="tlabel"><b>⚑ Garrison</b><small>defends the town${wallLvl()?` behind the ${WALLS[wallLvl()-1].name.toLowerCase()}`:''}</small></div>
          <div class="trow small">${slots(t.garrison,'g')}</div>
          <div class="tlabel"><b>Dwellings</b><small>click to recruit</small></div>
          <div class="tdw">${fu.map((k,i)=>{const on=t.built['d'+(i+1)],rk=recruitKey(k);return`<button class="dwc${on?'':' off'}" data-dw="${k}" ${on?'':'disabled'} title="${on?`${f.dw[i]}: ${t.pool[k]||0} ${U[rk].pl} to recruit`:`${f.dw[i]} not built`}"><img class="${U[rk]&&U[rk].up?'upg':''}" src="${iconURL('unit',rk,64)}" alt=""><b>${on?t.pool[k]||0:'–'}</b></button>`;}).join('')}<button class="dwc tav${t.built.tavern?'':' off'}" data-tab="tavern" title="Tavern: hire heroes"><span>🍺</span><b>Tavern</b></button></div>
        </div>
      </div></div>`;
  }else if(townTab==='recruit'){
    const gr={};S.heroes.forEach(x=>{for(const[k,v]of Object.entries((HBY[x.id].fx||{}).growth||{}))gr[k]=(gr[k]||0)+v;});
    const dw=FAC[TF()].units.map((k,i)=>t.built['d'+(i+1)]?k:null).filter(Boolean).map(k=>{const rk=recruitKey(k),u=U[rk],av=t.pool[k]||0,mx=Math.min(av,maxAfford(rk));
      return unitCard(rk,{cls:mx>0?'sugg':'',foot:`<div class="cost">${costHTML(unitCost(rk,1))}<span class="muted">each · ${av} here · +${U[k].growth+(gr[k]||0)}/wk</span></div>
       <div class="rctl"><input type="number" id="rc-${k}" min="0" max="${mx}" value="${mx}" aria-label="How many ${u.pl}"><button class="btn sm${mx>0?' primary':''}" data-recruit="${k}" ${mx<1?'disabled':''}>Recruit</button></div>`});}).join('');
    const mini=arr=>Array.from({length:7},(_,i)=>{const g=arr[i];return g?`<div class="slot"><img class="${U[g.k]&&U[g.k].up?'upg':''}" src="${iconURL('unit',g.k,64)}" alt="${U[g.k].name}"><b>${g.n}</b></div>`:'<div class="slot empty"></div>';}).join('');
    const canAny=FAC[TF()].units.some((k,i)=>t.built['d'+(i+1)]&&Math.min(t.pool[k]||0,maxAfford(recruitKey(k)))>0);
    body=`<div class="rtop"><div class="rwho">${here?`<img src="${iconURL('hero',h.id,84)}" alt=""><div><b>${esc(h.name)}'s army</b><div class="trow small">${mini(h.army)}</div></div>`:`<div><b>${esc(h.name)} is away</b><small>Recruits wait in the garrison.</small></div>`}</div>
      <div class="rwho"><div><b>⚑ Garrison</b><div class="trow small">${mini(t.garrison)}</div></div></div>
      <button class="btn primary" data-recall="1" ${canAny?'':'disabled'} title="Recruit as many as you can afford from every dwelling, strongest first">Recruit all</button></div><div class="ugrid">${dw}</div>`;
  }else if(townTab==='build'){
    const list=[...BL_].sort((a,b)=>(t.built[a.id]?1:0)-(t.built[b.id]?1:0));
    body=`<div class="grid">${list.map(b=>{const built=!!t.built[b.id];const miss=(b.req||[]).filter(r=>!t.built[r]);
      let act;if(built)act='<span class="tag ok">Built</span>';
      else if(miss.length)act=`<span class="tag no">Needs ${miss.map(r=>BY[r]?BY[r].name:r).join(', ')}</span>`;
      else act=`<button class="btn sm" data-build="${b.id}" ${t.builtToday||!canAfford(b.cost)?'disabled':''}>Build</button>`;
      const sug=adv.id===b.id&&!built;
      const th=bldThumb(TF(),b.id);
      return`<div class="bcard${built?' built':''}${sug?' sugg':''}" id="bc-${b.id}">${sug?'<span class="ribbon">Suggested</span>':''}<div class="bthumb${th?' art':''}">${th&&th.css?`<span class="xbcrop" style="${th.css}"></span>`:th?`<img src="${th}" alt="">`:`<span>${b.wall?'🧱':b.unit?'⛺':b.id.startsWith('hall')?'🏛':b.id.startsWith('lib')?'📚':b.unique?'✦':b.id.startsWith('u')?'⚒':'🏠'}</span>`}</div><h4>${b.name}</h4><p class="bshort">${b.short||b.desc}</p><details class="bdet"><summary>Details</summary><p>${b.desc}</p></details><div class="bfoot">${built?'':`<div class="cost">${costHTML(b.cost,S.res)}</div>`}<div>${act}</div></div></div>`;}).join('')}</div>`;
  }else if(townTab==='upgrade'){
    const fu=FAC[TF()].units;
    const upg=here?h.army.map((a,i)=>{const ti=fu.indexOf(a.k);if(ti<0||!t.built['u'+(ti+1)])return'';const c=upCost(a.k,a.n);
      return unitCard(a.k+'_u',{n:a.n,head:`${U[a.k].pl} → ${U[a.k+'_u'].pl}`,cls:canAfford(c)?'sugg':'',foot:`<div class="cost">${costHTML(c,S.res)}</div><div><button class="btn sm${canAfford(c)?' primary':''}" data-upg="${i}" ${canAfford(c)?'':'disabled'}>Upgrade</button></div>`});}).join(''):'';
    body=upg?`<div class="ugrid">${upg}</div>`:`<p class="muted">${here?`Nothing to upgrade. Build a dwelling upgrade on the Build tab, then upgrade ${h.name}'s troops here.`:'A hero must be in town to upgrade troops.'}</p>`;
  }else if(townTab==='market'){
    body=t.built.market?`<div class="grid">${RES.filter(k=>k!=='gold').map(k=>{const sell=sellPrice(k),buy=buyPrice(k);
      return`<div class="bcard"><h4><img src="${iconURL('res',k,32)}" alt="" style="width:18px;vertical-align:-3px"> ${RESNAME[k]} · you have ${S.res[k]}</h4><p>Sell for ${sell} gold each, buy for ${buy}.</p>
        <div class="rctl"><button class="btn sm" data-sell="${k}" data-n="1" ${S.res[k]<1?'disabled':''}>Sell 1</button><button class="btn sm" data-sell="${k}" data-n="5" ${S.res[k]<5?'disabled':''}>Sell 5</button>
        <button class="btn sm" data-buy="${k}" data-n="1" ${S.res.gold<buy?'disabled':''}>Buy 1</button><button class="btn sm" data-buy="${k}" data-n="5" ${S.res.gold<buy*5?'disabled':''}>Buy 5</button></div></div>`;}).join('')}</div>${alchemyHTML()}${mineList()}`:`<div class="grid">${locked('The Barter Yard','market')}</div>`;
  }else if(townTab==='tavern'){
    body=!t.built.tavern?`<div class="grid">${locked('The Tavern','tavern')}</div>`:S.heroes.length>=heroCap()?`<p class="muted">You already lead ${heroCap()} heroes, the most you can.${heroCap()<5?' Build the Heroes\' Lodge to make room for a fifth.':''}</p>`:
      `<div class="tavgrid">${hireable().map(x=>{const own=x.fac===TF()&&!x.rogue,it=x.item&&ITEMS[x.item];
        /* v37 tavern card: big portrait on the hero's banner colour, name, who they are, the ability, stats, skill and artifact (hover for what it does), cost and Hire */
        return`<div class="tavcard${own?' own':''}"><div class="tavport" style="background:${x.rogue?'#3a2f2a':FAC[x.fac].col}"><img src="${iconURL('hero',x.id,128)}" alt="${esc(x.name)}"></div>
        <h4>${x.name}${x.rogue?'':` <img src="${iconURL('crest',x.fac,52)}" alt="" class="tavcrest">`}</h4>
        <span class="tag ${own?'ok':''}" style="color:${x.rogue?'#8a2a1e':own?'var(--good)':'#8a5a1e'}">${x.rogue?'Rogue · no banner':own?'Your banner':'Wanderer · '+FAC[x.fac].arch} · ${x.type}</span>
        <p class="tavab"><b>★ ${x.ab}</b><br>${x.ad}</p>
        <div class="scs">${sc('atk',x.st[0])}${sc('def',x.st[1])}${sc('pow',x.st[2])}${sc('lore',x.st[3])}</div>
        <div class="tavkit">${x.sk.map(k=>`<span title="${SK[k].name}: ${SK[k].desc}">${skIco(k,30)}${SK[k].name}</span>`).join('')}${it?`<span title="${esc(it.name)} (${it.tier}): ${esc(itemTxt(x.item))}">${itemIcon(x.item)}${it.name}</span>`:''}</div>
        <div class="tavbuy"><div class="cost">${costHTML({gold:hireCost(x)},S.res)}</div><button class="btn sm primary" data-hire="${x.id}" ${S.res.gold<hireCost(x)?'disabled':''}>Hire</button></div></div>`;}).join('')}</div><p class="muted">Rogues answer to no banner: they keep their own trick and lead your troops. Some are locked in prisons out on the map, waiting to be freed. New faces arrive each week.</p>`;
  }else if(townTab==='library'){
    if(!t.built.lib1)body=`<div class="grid">${locked('The Lantern Library','lib1')}</div>`;
    else{const fs=FAC_SPELLS[TF()];
      body=`<p class="muted" style="margin-top:0">${FAC[TF()].arch} mages teach: ${fs.map(x=>SP[x].name).join(', ')}. The Library teaches the first two; the Star Archive teaches the rest. Heroes need a spellbook to learn or cast.</p>
      <div class="grid">${S.heroes.filter(x=>x.x===t.x&&x.y===t.y).map(x=>`<div class="bcard"><h4>${x.name}</h4><p>${x.book?`Spellbook: ${x.spells.map(k=>SP[k].name).join(', ')||'empty'}`:'No spellbook yet.'}</p>${x.book?'':`<div class="cost">${costHTML({gold:BOOK_COST},S.res)}</div><div><button class="btn sm" data-book="${x.id}" ${S.res.gold<BOOK_COST?'disabled':''}>Buy a spellbook</button></div>`}</div>`).join('')||'<p class="muted">Bring a hero to town to buy a spellbook.</p>'}</div>
      <div class="grid" style="margin-top:10px">${fs.map((k,i)=>`<div class="bcard${i<2||t.built.lib2?' built':''}"><h4>${SP[k].name} <span class="muted">· ${SP[k].cost} mana</span></h4><p>${SP[k].desc(hst(h,'pow'))}</p><span class="tag ${i<2||t.built.lib2?'ok':'no'}">${i<2?'Lantern Library':t.built.lib2?'Star Archive':'Needs the Star Archive'}</span></div>`).join('')}</div>`;}
  }else if(townTab==='relics'){
    const rum=S.rumours.filter(r=>S.objs.some(o=>o.type==='relic'&&o.r===r.r));
    body=`${t.built.reliquary?'':`<div class="grid">${locked('The Relic Hall','reliquary')}</div>`}
      <div class="grid" style="margin-top:8px">${RELICS.map((Rl,i)=>`<div class="bcard${delivered(i)?' built':''}"><div class="rrow"><img src="${iconURL('relic',i,64)}" alt="" style="width:36px;height:36px"><div><h4>${Rl.name}</h4><p>${relicState(i).txt}</p></div></div><p>Home bonus: ${Rl.deliver}.</p></div>`).join('')}</div>
      <h3 style="margin-top:14px">Rumour Board</h3>${rum.length?`<ul style="margin:0;padding-left:18px">${rum.map(r=>`<li><b>${RELICS[r.r].name}</b>: ${r.txt}.</li>`).join('')}</ul>`:'<p class="muted">No fresh rumours. A new one arrives each week.</p>'}`;
  }
  if(townTab==='overview')return`<div class="town"><nav class="ttabs" aria-label="Town actions">${tabs}</nav>${body}<div class="tresbot">${resBar}</div></div>`;
  return`<div class="town">${resBar}<nav class="ttabs" aria-label="Town actions">${tabs}</nav>${advice}${body}</div>`;
}
/* the town itself: buildings stand in place once built; empty lots show what can go up next */
/* layered town screens (art packs): a 640×360 scene packed in one atlas, background at (0,0), each building piece as [atlas x, y, w, h, scene x, y].
   Each site maps to game buildings: when it is built, show the piece; otherwise the site is an invisible lot. Drawn at the centre of a 960×360 canvas; the sides mirror the scene's edges. */
const TOWN_SCREEN={rangers:{atlas:'towns/rangers/screen.png',pieces:{"ranger_hall_capital":[0,360,170,118,264,29],"watchtower":[171,360,56,102,147,21],"spell_lodge":[0,479,88,87,34,54],"hedge_witch_cottage":[204,567,118,77,482,62],"reedbow_range":[323,567,120,77,4,153],"thornguard_barracks":[251,479,119,85,127,139],"trader_lodge":[371,479,125,83,250,154],"training_yard":[526,567,109,57,381,179],"tavern":[228,360,140,97,494,142],"stables":[0,567,203,80,27,232],"smithy":[89,479,161,86,438,242],"palisade_gate":[369,360,240,91,190,246],"ranger_hall_settlement":[0,648,75,52,314,69],"ranger_hall_town_hall":[444,567,81,75,311,46],"ranger_hall_city_hall":[497,479,124,82,289,39]},
  sites:[['watchtower',['fb2']],['spell_lodge',['lib1'],'library'],['hedge_witch_cottage',['d4'],'recruit'],['reedbow_range',['d2'],'recruit'],['thornguard_barracks',['d1'],'recruit'],['trader_lodge',['market'],'market'],
    ['training_yard',['muster']],['tavern',['tavern'],'tavern'],['stables',['d3','stables'],'recruit'],['smithy',['u1','u2','u3','u4','u5'],'upgrade'],['palisade_gate',['wall1','wall2','wall3']]],gate:[320,342],hall:'ranger_hall_'},
  pirates:{atlas:'towns/pirates/screen.png',hall:'harbor_hall_',pieces:{"harbor_hall_capital":[129,360,192,112,257,6],"harbor_hall_settlement":[0,723,77,50,306,50],"harbor_hall_town_hall":[128,648,81,71,304,29],"harbor_hall_city_hall":[396,360,149,93,270,7],"lighthouse":[322,360,73,96,136,6],"navigator_lodge":[264,566,90,80,508,33],"deckhand_bunkhouse":[485,566,130,74,21,115],"powder_loft":[226,475,98,83,159,111],"duelist_court":[0,475,121,90,261,115],"gunner_range":[210,648,130,66,377,126],"siege_yard_great_crossbow":[0,648,127,74,510,119],"siege_yard_cannon_crew":[355,566,129,76,509,118],"shipyard":[0,360,128,114,0,206],"tavern":[122,475,103,87,130,189],"harbor_exchange":[444,648,97,62,231,201],"training_deck":[542,648,86,61,336,204],"stables":[341,648,102,65,420,199],"shipsmith":[325,475,122,82,516,197],"sea_gate":[0,566,263,81,186,264]},
    sites:[['lighthouse',['fb2']],['navigator_lodge',['lib1'],'library'],['deckhand_bunkhouse',['d1'],'recruit'],['powder_loft',['d2'],'recruit'],['duelist_court',['d3'],'recruit'],['gunner_range',['d4'],'recruit'],
      ['siege_yard_cannon_crew',['d5'],'recruit','siege_yard_great_crossbow','u5'],['shipyard',['fb3']],['tavern',['tavern'],'tavern'],['harbor_exchange',['market'],'market'],['training_deck',['muster']],['stables',['stables']],
      ['shipsmith',['u1','u2','u3','u4','u5'],'upgrade'],['sea_gate',['wall1','wall2','wall3']]]},
  necro:{atlas:'towns/necro/screen.png',hall:'ossuary_hall_',pieces:{"ossuary_hall_capital":[0,360,247,127,224,1],"ossuary_hall_settlement":[269,747,74,57,308,53],"ossuary_hall_town_hall":[258,582,110,81,290,29],"ossuary_hall_city_hall":[319,360,189,105,251,5],"watch_spire":[248,360,70,115,140,8],"bone_archive":[369,582,130,79,3,49],"hellkite_hollow":[0,582,139,85,496,33],"skeleton_crypt":[259,668,141,76,2,133],"grave_vault":[142,668,116,77,148,134],"tribute_vault":[0,668,141,78,258,141],"moonfang_den":[401,668,118,67,400,141],"crimson_cloister":[140,582,117,83,521,127],"tavern":[146,488,134,91,3,214],"night_stables":[134,747,134,61,139,216],"ritual_court":[0,747,133,62,359,215],"soul_workshop":[0,488,145,93,493,223],"bone_gate":[281,488,306,91,167,250]},
    sites:[['watch_spire',['fb2']],['bone_archive',['lib1'],'library'],['hellkite_hollow',['d5'],'recruit'],['skeleton_crypt',['d1'],'recruit'],['grave_vault',['d2'],'recruit'],['tribute_vault',['market'],'market'],
      ['moonfang_den',['d3'],'recruit'],['crimson_cloister',['d4'],'recruit'],['tavern',['tavern'],'tavern'],['night_stables',['stables']],['ritual_court',['muster']],['soul_workshop',['u1','u2','u3','u4','u5'],'upgrade'],['bone_gate',['wall1','wall2','wall3']]]},
  merfolk:{atlas:'towns/merfolk/screen.png',hall:'tide_hall_',pieces:{"tide_hall_capital":[0,360,214,127,241,4],"tide_hall_settlement":[462,664,70,57,319,47],"tide_hall_town_hall":[267,580,104,81,302,23],"tide_hall_city_hall":[0,488,142,91,283,13],"beacon_spire":[505,360,66,95,133,17],"tide_library":[516,580,95,76,29,49],"coral_colossus_garden":[282,488,141,84,473,31],"spearfolk_barracks":[0,580,135,83,3,126],"siren_grotto":[0,664,113,74,136,122],"pearl_exchange":[136,580,130,82,251,129],"crab_nursery":[350,664,111,57,383,149],"turtle_sanctuary":[143,488,138,86,500,121],"tavern":[424,488,119,84,14,209],"reef_stables":[114,664,127,63,128,209],"current_training_ring":[242,664,107,59,382,214],"shell_workshop":[372,580,143,80,483,216],"reef_gate":[215,360,289,97,177,239]},
    sites:[['beacon_spire',['fb2']],['tide_library',['lib1'],'library'],['coral_colossus_garden',['d5'],'recruit'],['spearfolk_barracks',['d1'],'recruit'],['siren_grotto',['d2'],'recruit'],['pearl_exchange',['market'],'market'],
      ['crab_nursery',['d3'],'recruit'],['turtle_sanctuary',['d4'],'recruit'],['tavern',['tavern'],'tavern'],['reef_stables',['stables']],['current_training_ring',['muster']],['shell_workshop',['u1','u2','u3','u4','u5'],'upgrade'],['reef_gate',['wall1','wall2','wall3']]]},
  dwarves:{atlas:'towns/dwarves/screen.png',hall:'mountain_hall_',pieces:{"mountain_hall_capital":[0,360,214,100,242,25],"mountain_hall_settlement":[209,620,49,45,317,74],"mountain_hall_town_hall":[0,620,92,64,295,55],"mountain_hall_city_hall":[0,461,152,83,265,36],"cliff_watch":[215,360,76,92,137,35],"rune_archive":[256,545,106,69,30,74],"gemheart_forge":[490,360,124,84,485,54],"muster_hall":[511,461,126,76,7,150],"bolt_range":[363,545,113,64,140,162],"mint_hall":[132,545,123,72,257,158],"oath_sanctum":[284,461,108,80,389,147],"ram_roost":[0,545,131,74,505,154],"tavern":[393,461,117,77,8,235],"mountain_waystation":[477,545,120,64,130,248],"training_terrace":[93,620,115,58,387,249],"smithy":[153,461,130,82,502,234],"stone_gate":[292,360,197,88,220,257]},
    sites:[['cliff_watch',['fb2']],['rune_archive',['lib1'],'library'],['gemheart_forge',['d5'],'recruit'],['muster_hall',['d1'],'recruit'],['bolt_range',['d2'],'recruit'],['mint_hall',['market'],'market'],
      ['oath_sanctum',['d3'],'recruit'],['ram_roost',['d4'],'recruit'],['tavern',['tavern'],'tavern'],['mountain_waystation',['stables']],['training_terrace',['muster']],['smithy',['forge','u1','u2','u3','u4','u5'],'upgrade'],['stone_gate',['wall1','wall2','wall3']]]},
  elves:{atlas:'towns/elves/screen.png',hall:'silverbough_hall_',pieces:{"silverbough_hall_capital":[0,360,212,109,246,14],"silverbough_hall_settlement":[324,647,48,49,336,65],"silverbough_hall_town_hall":[108,647,98,70,311,44],"silverbough_hall_city_hall":[259,470,139,90,291,24],"canopy_lookout":[213,360,81,100,139,6],"moonleaf_archive":[532,470,102,87,27,50],"eagle_eyrie":[0,647,107,72,487,43],"sprite_bower":[123,561,103,81,7,143],"archery_glade":[227,561,118,76,119,150],"forest_guildhall":[0,561,122,85,249,146],"warden_sanctuary":[0,470,115,90,377,134],"silver_stables":[346,561,141,76,492,148],"tavern":[399,470,132,88,8,227],"trail_outfitter":[488,561,109,73,138,241],"training_grove":[207,647,116,66,377,245],"silverwood_workshop":[116,470,142,90,487,225],"bough_gate":[295,360,234,98,201,247]},
    sites:[['canopy_lookout',['fb2']],['moonleaf_archive',['lib1'],'library'],['eagle_eyrie',['d5'],'recruit'],['sprite_bower',['d1'],'recruit'],['archery_glade',['d2'],'recruit'],['forest_guildhall',['market'],'market'],
      ['warden_sanctuary',['d3'],'recruit'],['silver_stables',['d4'],'recruit'],['tavern',['tavern'],'tavern'],['trail_outfitter',['stables']],['training_grove',['muster']],['silverwood_workshop',['u1','u2','u3','u4','u5'],'upgrade'],['bough_gate',['wall1','wall2','wall3']]]},
  wizards:{atlas:'towns/wizards/screen.png',hall:'council_hall_',pieces:{"council_hall_capital":[115,360,228,113,237,4],"council_hall_settlement":[436,665,52,51,324,58],"council_hall_town_hall":[128,665,89,72,306,37],"council_hall_city_hall":[227,481,157,94,272,15],"starwatch_observatory":[384,585,87,78,134,38],"arcane_library":[385,481,125,91,11,51],"archmage_sanctum":[0,360,114,120,497,4],"owl_aviary":[0,585,114,79,6,149],"apprentice_college":[472,585,123,77,133,149],"arcane_exchange":[0,665,127,74,261,152],"earth_conservatory":[511,481,119,82,390,144],"storm_spire":[344,360,116,105,517,124],"tavern":[115,585,133,79,7,237],"sky_waystation":[218,665,108,66,138,246],"practice_court":[327,665,108,55,389,257],"enchanter_workshop":[249,585,134,79,495,237],"sky_gate":[0,481,226,103,206,237]},
    sites:[['starwatch_observatory',['fb2']],['arcane_library',['lib1'],'library'],['archmage_sanctum',['d5'],'recruit'],['owl_aviary',['d1'],'recruit'],['apprentice_college',['d2'],'recruit'],['arcane_exchange',['market'],'market'],
      ['earth_conservatory',['d3'],'recruit'],['storm_spire',['d4'],'recruit'],['tavern',['tavern'],'tavern'],['sky_waystation',['stables']],['practice_court',['muster']],['enchanter_workshop',['u1','u2','u3','u4','u5'],'upgrade'],['sky_gate',['wall1','wall2','wall3']]]},
  centaurs:{atlas:'towns/centaurs/screen.png',hall:'pack_hall_',pieces:{"pack_hall_capital":[0,360,216,128,236,12],"pack_hall_settlement":[0,748,86,56,303,65],"pack_hall_town_hall":[264,588,123,78,285,43],"pack_hall_city_hall":[258,489,168,90,262,31],"lookout":[217,360,68,102,137,23],"spirit_lodge":[427,489,104,83,25,55],"lion_den":[388,588,147,76,472,63],"war_rabbit_warren":[240,672,119,74,5,147],"boar_pen":[0,672,122,75,128,144],"provisioner_hall":[128,588,135,79,246,153],"hound_kennels":[123,672,116,75,386,154],"centaur_camp":[0,588,127,83,507,141],"tavern":[286,360,127,102,17,221],"trail_corral":[360,672,105,68,142,231],"training_circle":[466,672,114,60,381,236],"workshop":[414,360,140,102,480,225],"thornwall_gate":[0,489,257,98,186,245]},
    sites:[['lookout',['fb2']],['spirit_lodge',['lib1'],'library'],['lion_den',['d5'],'recruit'],['war_rabbit_warren',['d1'],'recruit'],['boar_pen',['d2'],'recruit'],['provisioner_hall',['market'],'market'],
      ['hound_kennels',['d3'],'recruit'],['centaur_camp',['d4'],'recruit'],['tavern',['tavern'],'tavern'],['trail_corral',['fb3']],['training_circle',['muster']],['workshop',['u1','u2','u3','u4','u5'],'upgrade'],['thornwall_gate',['wall1','wall2','wall3']]]}};
let townAlpha={};
function artTownAlpha(path,img){if(townAlpha[path]!==undefined)return townAlpha[path];try{const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const c=cv.getContext('2d');c.drawImage(img,0,0);townAlpha[path]={w:img.width,d:c.getImageData(0,0,img.width,img.height).data};}catch(e){townAlpha[path]=null;}return townAlpha[path];}
function drawArtTown(cv,TSN){const a=artImg(TSN.atlas);if(!a.ok)return false;const im=a.img,c=cv.getContext('2d'),t=TW(),f=FAC[TF()],BL=townBuildings(),BY=Object.fromEntries(BL.map(b=>[b.id,b])),OX=160,P=TSN.pieces;
  townSpots=[];c.imageSmoothingEnabled=false;c.clearRect(0,0,cv.width,cv.height);
  /* Town Wings pack: a real 960×360 scene per banner (centre identical to the 640 background); until it loads, mirror the edges */
  const wa=artImg(WINGS_ATLAS),wr=XB_ROW.indexOf(TF());
  if(wa.ok&&wr>=0)c.drawImage(wa.img,0,wr*360,960,360,0,0,960,360);
  else{c.drawImage(im,0,0,640,360,OX,0,640,360);
  c.save();c.translate(OX,0);c.scale(-1,1);c.drawImage(im,0,0,OX,360,0,0,OX,360);c.restore();
  c.save();c.translate(OX+640+640,0);c.scale(-1,1);c.drawImage(im,640-OX,0,OX,360,640-OX,0,OX,360);c.restore();
  for(const[x0,x1]of[[0,OX],[OX+640,960]]){const g=c.createLinearGradient(x0,0,x1,0),dk='rgba(10,14,30,.45)',cl='rgba(10,14,30,0)';g.addColorStop(0,x0?cl:dk);g.addColorStop(1,x0?dk:cl);c.fillStyle=g;c.fillRect(x0,0,x1-x0,360);}}
  const piece=(id,tab,bid,label)=>{const q=P[id];c.drawImage(im,q[0],q[1],q[2],q[3],OX+q[4],q[5],q[2],q[3]);townSpots.push({x:OX+q[4],y:q[5],w:q[2],h:q[3],tab,id:bid,label,pix:[q[0],q[1]],atlas:TSN.atlas});};
  const lot=(id,bid)=>{const q=P[id],b=BY[bid];if(!b)return;townSpots.push({x:OX+q[4],y:q[5],w:q[2],h:q[3],tab:'build',id:bid,label:`Empty lot: ${b.name}${bAvail(b)?' (can be built)':' (locked)'}`});};
  const used=new Set(['hall1','hall2','hall3','hall4']);
  const hs=t.built.hall4?'capital':t.built.hall3?'city_hall':t.built.hall2?'town_hall':'settlement',hn=t.built.hall4?'Crown Seat':t.built.hall3?'High Seat':t.built.hall2?'Council Hall':'Moot Hall';
  piece(TSN.hall+hs,'build','hall2',`${hn}: click to see everything you can build (+${fmt(VT?hallGold(t):income())} gold a day)`);
  const fu=f.units;
  for(const[id0,ids,tab,alt,altIf]of TSN.sites){const id=alt&&t.built[altIf]?alt:id0;ids.forEach(i=>used.add(i));const on=ids.filter(i=>t.built[i]);
    if(!on.length){const nx=ids.find(i=>BY[i]);if(nx)lot(id,nx);continue;}
    const b0=on[0],B=BY[b0]||{name:b0},di=b0[0]==='d'?+b0[1]-1:-1;
    const label=di>=0?`${f.dw[di]}: recruit ${U[recruitKey(fu[di])].pl}${t.pool[fu[di]]?` (${t.pool[fu[di]]} waiting)`:''}${on.length>1?` · also ${on.slice(1).map(i=>(BY[i]||{name:i}).name).join(', ')}`:''}`
      :tab==='upgrade'?`${on.includes('forge')?'Great Forge · ':''}${on.some(i=>/^u\d$/.test(i))?`Upgrades built: ${on.filter(i=>/^u\d$/.test(i)).map(i=>f.dw[+i[1]-1]).join(', ')} · upgrade troops here`:''}`:tab==='library'?(t.built.lib2?'Lantern Library and Star Archive':'Lantern Library'):b0.startsWith('wall')?`${WALLS[wallLvl(t)-1].name}: the garrison fights ${['','25%','50%','twice as'][wallLvl(t)]} harder`:B.name;
    piece(id,di>=0?'recruit':tab||'build',di>=0?b0:tab==='upgrade'?null:b0.startsWith('wall')?(t.built.wall3?'wall3':t.built.wall2?'wall3':'wall2'):b0,label);}
  // built buildings that have no picture yet: small signs along the bottom, still clickable
  // the shared extra buildings stand in the side margins: built ones drawn, unbuilt ones are clickable lots
  {const xa=artImg(XB_ATLAS),fk=TF();if(xa.ok)for(const[id,[fx,fy]]of xbSpots(fk)){const b=BY[id],xc=xbCell(fk,id);if(!b||!xc||TSN.sites.some(z=>z[1].includes(id)))continue;used.add(id);
    const x0=fx-64,y0=fy-120;if(t.built[id]){c.drawImage(xa.img,xc[0],xc[1],128,128,x0,y0,128,128);townSpots.push({x:x0,y:y0,w:128,h:128,tab:id==='reliquary'?'relics':id==='lib2'?'library':id==='d5'?'recruit':'build',id,label:id==='reliquary'?`${b.name}: ${S.delivered.length}/7 relics home`:`${b.name}: ${b.desc}`,pix:xc,atlas:XB_ATLAS});}
    else townSpots.push({x:x0+16,y:y0+40,w:96,h:80,tab:'build',id,label:`Empty lot: ${b.name}${bAvail(b)?' (can be built)':' (locked)'}`});}}
  // (signs stack down the left margin, outside the painted scene)
  used.add('lib2');const extra=BL.filter(b=>t.built[b.id]&&!used.has(b.id));let sy=8;c.font='700 12px "Alegreya SC",Georgia,serif';c.textBaseline='middle';c.textAlign='left';
  for(const b of extra){const nm=b.id==='reliquary'?`${b.name} ${S.delivered.length}/7`:b.name,w=Math.min(220,c.measureText(nm).width+14);if(sy>330)break;c.fillStyle='rgba(28,20,10,.85)';c.fillRect(OX+6,sy,w,20);c.strokeStyle='#e8c060';c.lineWidth=1;c.strokeRect(OX+6.5,sy+.5,w-1,19);c.fillStyle='#f6e2a8';c.fillText(nm,OX+13,sy+10,w-14);
    const di=b.unit?f.units.indexOf(b.unit):-1;townSpots.push({x:OX+6,y:sy,w,h:20,tab:di>=0?'recruit':b.id==='reliquary'?'relics':'build',id:b.id,label:b.desc});sy+=25;}
  const gate=TSN.gate||(()=>{const w=TSN.sites.find(z=>z[1][0]==='wall1'),q=w&&P[w[0]];return q?[q[4]+q[2]/2,Math.min(342,q[5]+q[3]-4)]:[320,342];})();
  S.heroes.filter(x=>x.x===t.x&&x.y===t.y).forEach((x,i)=>{c.save();c.translate(OX+gate[0]-14+i*30-TS/2,gate[1]-TS/2-6);const f0=x.face;x.face='s';drawHero(c,0,0,x);x.face=f0;c.restore();});
  return true;}
/* a banner's home town with every building up (capital hall), for the banner Details page */
function paintTownPrev(root,tries=0){for(const cv of root.querySelectorAll('canvas.tprev:not([data-done])')){const T=TOWN_SCREEN[cv.dataset.fac],a=T&&artImg(T.atlas);if(!a||!a.ok){if(tries<40)setTimeout(()=>paintTownPrev(root,tries+1),100);continue;}
  const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(a.img,0,0,640,360,0,0,640,360);for(const[id,q]of Object.entries(T.pieces)){if((/_hall_/.test(id)&&!/capital$/.test(id))||T.sites.some(z=>z[0]===id&&z[3]))continue;c.drawImage(a.img,q[0],q[1],q[2],q[3],q[4],q[5],q[2],q[3]);}cv.dataset.done=1;}}
/* a building's picture from its banner's town atlas, cropped into a square (Build tab); null if the banner has no town art yet */
/* the six shared extra buildings (Missing Buildings packs A and B): one 128×128 cell per banner (row) and building (column) in towns/extra_buildings.png, foot at (64,120) */
const XB_ATLAS='towns/extra_buildings.png',XB_ROW=['rangers','wizards','necro','centaurs','pirates','elves','dwarves','merfolk'],XB_COL={reliquary:0,lodge:1,lib2:2,still:3,fb1:4,fb3:5,d5:6},XB_ONLY={d5:['rangers']};
/* where they stand in the town picture: the side margins beside the scene, three a side (canvas x of the foot centre, foot y) */
/* Town Wings pack: purpose-made lots in the 960 scene (foot x, foot y, draw order back to front) */
const WINGS_ATLAS='towns/wings.png';
const XB_LOTS={"rangers":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,6],"still":[876,104,0],"fb1":[892,188,2],"fb3":[864,266,4],"d5":[892,344,5]},"wizards":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,224,2],"fb3":[864,344,4]},"necro":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,224,2],"fb3":[864,344,4]},"centaurs":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,300,2]},"pirates":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,300,2]},"elves":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,224,2],"fb3":[864,344,4]},"dwarves":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,224,2],"fb3":[864,344,4]},"merfolk":{"reliquary":[80,112,1],"lodge":[96,224,3],"lib2":[72,344,5],"still":[876,112,0],"fb1":[892,224,2],"fb3":[864,344,4]}};
const xbSpots=fk=>XB_LOTS[fk]?Object.entries(XB_LOTS[fk]).sort((a,b)=>a[1][2]-b[1][2]).map(([id,v])=>[id,[v[0],v[1]]]):Object.entries({...XB_SPOT,...(XB_SPOT_FAC[fk]||{})});
const XB_SPOT={reliquary:[80,128],lib2:[80,244],still:[80,356],lodge:[880,128],fb1:[880,244],fb3:[880,356]};
/* Rangers also stand their Heartwood Grove (tier 5) in the right margin, so that side holds four */
const XB_SPOT_FAC={rangers:{lodge:[880,96],d5:[880,184],fb1:[880,272],fb3:[880,360]}};
const xbCell=(fac,id)=>{const r=XB_ROW.indexOf(fac),c=XB_COL[id];if(XB_ONLY[id]&&!XB_ONLY[id].includes(fac))return null;return r<0||c===undefined?null:[c*128,r*128];};
const thumbCache={};
function bldThumb(fac,id){const key=fac+'/'+id;if(thumbCache[key])return thumbCache[key];
  {const xc=xbCell(fac,id);if(xc){const a=artImg(XB_ATLAS);if(!a.ok)return null;const cv=document.createElement('canvas');cv.width=cv.height=128;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;c.drawImage(a.img,xc[0],xc[1],128,128,0,0,128,128);return thumbCache[key]=thumbOut(cv,XB_ATLAS,a.img,xc[0],xc[1],128,128,128);}}
  const T=TOWN_SCREEN[fac];if(!T)return null;
  let pid=null;const hn=['settlement','town_hall','city_hall','capital'];
  if(/^hall\d$/.test(id))pid=T.hall+hn[+id[4]-1];
  else{const look=/^u\d$/.test(id)?'d'+id[1]:id,site=T.sites.find(z=>z[1].includes(look))||T.sites.find(z=>z[1].includes(id));if(site)pid=site[0];}
  const q=pid&&T.pieces[pid],a=q&&artImg(T.atlas);if(!q||!a.ok)return null;
  const S2=Math.max(q[2],q[3])+4,cv=document.createElement('canvas');cv.width=S2;cv.height=S2;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;
  c.drawImage(a.img,q[0],q[1],q[2],q[3],Math.round((S2-q[2])/2),Math.round((S2-q[3])/2),q[2],q[3]);return thumbCache[key]=thumbOut(cv,T.atlas,a.img,q[0],q[1],q[2],q[3],S2);}
/* a building picture as a data URL; when the page runs from file:// the browser refuses to export canvases that hold our art,
   so fall back to a CSS crop of the atlas itself ({css}: the caller renders a span instead of an img) */
function thumbOut(cv,path,img,sx,sy,sw,sh,box){try{return cv.toDataURL();}catch(e){
  const px=(a,b)=>b>0?a/b*100:0;
  return{css:`width:${sw/box*100}%;height:${sh/box*100}%;background-image:url('${ART_BASE+path}');background-repeat:no-repeat;background-size:${img.width/sw*100}% ${img.height/sh*100}%;background-position:${px(sx,img.width-sw)}% ${px(sy,img.height-sh)}%;image-rendering:pixelated`};}}
function drawTownView(cv){
  {const TSN=TOWN_SCREEN[TF()];if(TSN&&drawArtTown(cv,TSN))return;}
  const c=cv.getContext('2d'),f=FAC[TF()],t=TW(),BL=townBuildings(),BY=Object.fromEntries(BL.map(b=>[b.id,b])),now=performance.now();
  townSpots=[];c.imageSmoothingEnabled=false;
  const tc=shadeRGB(f.col,-0.55),sky=c.createLinearGradient(0,0,0,300);sky.addColorStop(0,'#141c26');sky.addColorStop(0.7,`rgb(${tc})`);sky.addColorStop(1,'#2b2a22');c.fillStyle=sky;c.fillRect(0,0,960,300);
  c.fillStyle='#24331f';c.beginPath();c.moveTo(0,200);for(let x=0;x<=960;x+=60)c.lineTo(x,180-Math.sin(x/90)*22-((x/60)%2)*8);c.lineTo(960,300);c.lineTo(0,300);c.fill();
  c.fillStyle='#3d5229';c.fillRect(0,238,960,62);c.fillStyle='#8d7a52';c.beginPath();c.moveTo(440,300);c.lineTo(468,252);c.lineTo(492,252);c.lineTo(520,300);c.fill();
  const spot=(x,y,w,h,tab,id,label)=>townSpots.push({x,y,w,h,tab,id,label});
  const outline='#1e1912',roof=f.col,trim=f.col2;
  function house(x,base,w,h,wall,rf){c.fillStyle=wall;c.strokeStyle=outline;c.lineWidth=2;c.fillRect(x-w/2,base-h,w,h);c.strokeRect(x-w/2,base-h,w,h);
    c.fillStyle=rf;c.beginPath();c.moveTo(x-w/2-6,base-h);c.lineTo(x,base-h-w*0.45);c.lineTo(x+w/2+6,base-h);c.closePath();c.fill();c.stroke();
    c.fillStyle='#2b1d10';c.fillRect(x-7,base-20,14,20);c.fillStyle='#f2c46a';c.fillRect(x-w/2+8,base-h+12,9,9);c.fillRect(x+w/2-17,base-h+12,9,9);}
  // empty lots draw nothing (the interior art will show them); they stay clickable
  function lot(x,base,w,h,id){const b=BY[id];if(!b)return;const ok=bAvail(b);spot(x-w/2,base-h,w,h,'build',id,`Empty lot: ${b.name}${ok?' (can be built)':' (locked)'}`);}
  function star(x,y){c.fillStyle='#f2d382';c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?3:7;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.fill();}
  const fu=f.units;
  // back row
  const back=[['muster',170,90,40],['stables',360,80,55],['d5',590,96,80],['forge',780,70,60]];
  for(const[id,x,w,h]of back){const base=214;if(!BY[id])continue;
    if(!t.built[id]){lot(x,base,w,h,id);continue;}
    if(id==='muster'){c.fillStyle='#55693a';c.fillRect(x-w/2,base-12,w,12);for(let i=0;i<4;i++){c.strokeStyle=outline;c.beginPath();c.moveTo(x-w/2+12+i*22,base-6);c.lineTo(x-w/2+12+i*22,base-40);c.stroke();c.fillStyle=roof;c.fillRect(x-w/2+12+i*22,base-40,14,9);}spot(x-w/2,base-h,w,h,'build',id,'Muster Field');}
    else if(id==='stables'){house(x,base,w,h-10,'#7a5432','#4d3520');c.save();c.translate(x+w/2+14,base-10);drawTravelIcon(c,'horse');c.restore();spot(x-w/2,base-h-30,w+30,h+30,'build',id,'Stables');}
    else if(id==='forge'){house(x,base,w,h,'#5a5a62','#3a3a3e');c.fillStyle='rgba(200,200,200,.35)';for(let i=0;i<3;i++){c.beginPath();c.arc(x+w/2-10+Math.sin(now/600+i)*4,base-h-30-i*14,6+i*2,0,7);c.fill();}spot(x-w/2,base-h-30,w,h+30,'build',id,'Great Forge');}
    else{house(x,base,w,h,'#a69c84',roof);if(t.built.u5)star(x,base-h-w*0.45-6);spot(x-w/2-6,base-h-60,w+12,h+60,'recruit','d5',`${f.dw[4]}: recruit ${U[fu[4]].pl}`);}
  }
  // front row
  const lv=t.built.hall3?2:t.built.hall2?1:0,kh=100+lv*28;
  const tsp=null;
  if(tsp){c.imageSmoothingEnabled=false;c.drawImage(tsp,480-96,262-138,192,144);}
  else{c.fillStyle='#b8ae94';c.strokeStyle=outline;c.lineWidth=2;c.fillRect(430,252-kh,100,kh);c.strokeRect(430,252-kh,100,kh);for(let i=0;i<5;i++)c.fillRect(430+i*21,244-kh,12,10);
  c.fillStyle='#2b1d10';c.beginPath();c.moveTo(466,252);c.lineTo(466,226);c.arc(480,226,14,Math.PI,0);c.lineTo(494,252);c.fill();
  c.fillStyle='#f2c46a';for(let i=0;i<lv+2;i++){c.fillRect(452,262-kh+i*26,10,12);c.fillRect(498,262-kh+i*26,10,12);}
  c.strokeStyle=outline;c.beginPath();c.moveTo(480,244-kh);c.lineTo(480,214-kh);c.stroke();c.fillStyle=roof;c.beginPath();c.moveTo(480,214-kh);c.quadraticCurveTo(496,212-kh+Math.sin(now/400)*3,512,218-kh);c.lineTo(480,228-kh);c.fill();}
  if(tsp)spot(392,124,176,138,'build','hall2',`${t.built.hall4?'Crown Seat':t.built.hall3?'High Seat':t.built.hall2?'Council Hall':'Moot Hall'}: click to see everything you can build (+${fmt(income())} gold a day)`);else spot(430,214-kh,100,kh+38,'build','hall2',`${t.built.hall4?'Crown Seat':t.built.hall3?'High Seat':t.built.hall2?'Council Hall':'Moot Hall'}: click to see everything you can build (+${fmt(income())} gold a day)`);
  const front=[['d1',70,70,55],['d2',160,70,60],['lib1',255,46,130],['tavern',345,74,62],['market',620,100,46],['reliquary',720,76,70],['d3',810,72,64],['d4',900,72,70]];
  for(const[id,x,w,h]of front){const base=252;if(!BY[id])continue;
    if(!t.built[id]){lot(x,base,w,h,id);continue;}
    if(id[0]==='d'){const i=+id[1]-1;house(x,base,w,h,'#a69c84',roof);if(t.built['u'+(i+1)])star(x,base-h-w*0.45-6);
      spot(x-w/2-6,base-h-58,w+12,h+58,'recruit',id,`${f.dw[i]}: recruit ${U[recruitKey(fu[i])].pl}${t.pool[fu[i]]?` (${t.pool[fu[i]]} waiting)`:''}`);}
    else if(id==='lib1'){c.fillStyle='#8f8a7c';c.strokeStyle=outline;c.fillRect(x-w/2,base-h,w,h);c.strokeRect(x-w/2,base-h,w,h);c.fillStyle='#6f8fd8';c.beginPath();c.moveTo(x-w/2-6,base-h);c.lineTo(x,base-h-36);c.lineTo(x+w/2+6,base-h);c.fill();c.stroke();
      const gl=0.6+0.4*Math.sin(now/500);c.fillStyle=`rgba(160,200,255,${gl})`;c.fillRect(x-6,base-h+20,12,16);c.fillRect(x-6,base-h+56,12,16);if(t.built.lib2){c.fillStyle='#e8f0ff';c.beginPath();c.arc(x,base-h-40,8,0,7);c.fill();}
      spot(x-w/2-6,base-h-48,w+12,h+48,'library','lib1',t.built.lib2?'Lantern Library and Star Archive':'Lantern Library');}
    else if(id==='tavern'){house(x,base,w,h,'#8b5e34','#5a3a1e');c.fillStyle='#d4ab52';c.fillRect(x+w/2,base-h+6,16,12);c.strokeStyle=outline;c.strokeRect(x+w/2,base-h+6,16,12);spot(x-w/2,base-h-36,w+20,h+36,'tavern',id,'Tavern: hire heroes');}
    else if(id==='market'){for(let i=0;i<3;i++){const sx=x-w/2+i*34;c.fillStyle='#7a5432';c.fillRect(sx+4,base-26,26,26);c.fillStyle=i%2?trim:roof;c.beginPath();c.moveTo(sx,base-26);c.lineTo(sx+17,base-h);c.lineTo(sx+34,base-26);c.fill();c.strokeStyle=outline;c.stroke();}
      drawRes(c,'gold',x-30,base-8,6);drawRes(c,'timber',x,base-8,6);drawRes(c,'amber',x+30,base-8,6);spot(x-w/2,base-h,w,h,'market',id,'Barter Yard: trade goods');}
    else if(id==='reliquary'){c.fillStyle='#cfc6ae';c.strokeStyle=outline;c.fillRect(x-w/2,base-h+16,w,h-16);c.strokeRect(x-w/2,base-h+16,w,h-16);c.beginPath();c.moveTo(x-w/2-6,base-h+16);c.lineTo(x,base-h-10);c.lineTo(x+w/2+6,base-h+16);c.closePath();c.fillStyle=trim;c.fill();c.stroke();
      for(let i=0;i<4;i++){c.fillStyle='#a69c84';c.fillRect(x-w/2+6+i*18,base-h+24,8,h-24);}
      S.delivered.forEach((r,i)=>drawRelic(c,r,x-w/2+10+(i%4)*18,base-h+34+Math.floor(i/4)*18,5));spot(x-w/2-6,base-h-10,w+12,h+10,'relics',id,`Relic Hall: ${S.delivered.length}/7 relics home`);}
  }
  // walls, once built, run along the front
  {const lv=wallLvl();if(lv){const y0=lv===1?262:256;c.strokeStyle='#2b2418';c.lineWidth=1.5;
    if(lv===1){c.fillStyle='#7a5432';for(let x=10;x<950;x+=12){if(x>420&&x<540)continue;c.beginPath();c.moveTo(x,288);c.lineTo(x,y0);c.lineTo(x+5,y0-7);c.lineTo(x+10,y0);c.lineTo(x+10,288);c.closePath();c.fill();c.stroke();}}
    else{c.fillStyle=lv===3?'#b9b2a0':'#a39c88';for(const[x0,x1]of[[0,425],[535,960]]){c.fillRect(x0,y0,x1-x0,32);c.strokeRect(x0,y0,x1-x0,32);for(let x=x0;x<x1;x+=16)c.fillRect(x,y0-7,9,7);}
      if(lv===3)for(const tx of[60,330,630,900]){c.fillStyle='#c9c2ae';c.fillRect(tx-14,y0-34,28,66);c.strokeRect(tx-14,y0-34,28,66);c.fillStyle=FAC[TF()].col;c.beginPath();c.moveTo(tx-18,y0-34);c.lineTo(tx,y0-56);c.lineTo(tx+18,y0-34);c.closePath();c.fill();c.stroke();}}
    spot(0,y0-10,420,40,'build',lv===3?'wall3':lv===2?'wall3':'wall2',`${WALLS[lv-1].name}: the garrison fights ${['','25%','50%','twice as'][lv]} harder${lv>1?` · +${lv===2?50:100}% growth`:''}`);}}
  // heroes in town stand at the gate
  S.heroes.filter(x=>x.x===t.x&&x.y===t.y).forEach((x,i)=>{c.save();c.translate(438+i*30-TS/2,262-TS/2);const f0=x.face;x.face='s';drawHero(c,0,0,x);x.face=f0;c.restore();});
}
function bindTownView(body,go){
  const cv=body.querySelector('#townView');if(!cv)return;const tip=body.querySelector('#tvTip');
  const solid=(p,x,y)=>{if(!p.pix)return true;const a=artImg(p.atlas);if(!a.ok)return true;const al=artTownAlpha(p.atlas,a.img);if(!al)return true;const ix=p.pix[0]+Math.floor(x-p.x),iy=p.pix[1]+Math.floor(y-p.y);return al.d[(iy*al.w+ix)*4+3]>20;};
  const hit=e=>{const r=cv.getBoundingClientRect(),x=(e.clientX-r.left)*cv.width/r.width,y=(e.clientY-r.top)*cv.height/r.height;return{s:townSpots.slice().reverse().find(p=>x>=p.x&&x<p.x+p.w&&y>=p.y&&y<p.y+p.h&&solid(p,x,y)),px:e.clientX-r.left,py:e.clientY-r.top};};
  cv.addEventListener('pointermove',e=>{const{s:sp,px,py}=hit(e);if(sp){tip.hidden=false;tip.textContent=sp.label;tip.style.left=Math.min(px+12,cv.clientWidth-200)+'px';tip.style.top=(py+12)+'px';cv.style.cursor='pointer';}else{tip.hidden=true;cv.style.cursor='default';}});
  cv.addEventListener('pointerleave',()=>{tip.hidden=true;});
  cv.addEventListener('click',e=>{const{s:sp}=hit(e);if(sp)go(sp.tab,sp.id);});
  const loop=()=>{if(!cv.isConnected)return;drawTownView(cv);requestAnimationFrame(loop);};loop();
}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
/* ask for a new name; resolves to the trimmed name, or null if cancelled */
async function askName(title,cur,max=24){let val=cur;
  const p=showModal({title,body:`<input id="nmIn" maxlength="${max}" value="${esc(cur)}" aria-label="New name" style="width:100%;font:700 24px var(--f-display);padding:8px 10px;border:3px solid;border-color:var(--bev-lo) var(--bev-hi) var(--bev-hi) var(--bev-lo);background:#fffaf0;color:var(--text)">`,
    buttons:[{label:'Cancel',value:null},{label:'Rename',value:'ok',primary:true}],dismiss:null});
  const inp=$('#nmIn');inp.focus();inp.select();inp.oninput=()=>{val=inp.value;};inp.onkeydown=e=>{if(e.key==='Enter'){val=inp.value;$('#modal')._close('ok');}};
  const v=await p;const t=(val||'').replace(/[<>]/g,'').trim().slice(0,max);return v==='ok'&&t?t:null;}
document.addEventListener('dblclick',async e=>{const rt=e.target.closest('[data-rename-town]'),hn=e.target.closest('.hname b');
  if(rt){e.stopPropagation();const tw=TW();$('#modal')._close(1);await sleep(30);const n=await askName('Rename your town',tw.name);if(n){tw.name=n;save();}renderUI();openTown(tw);}
  else if(hn&&S&&!modalOpen&&!moving){const h=HERO(),n=await askName(`Rename ${esc(h.name)}`,h.name);if(n){h.name=n;save();}renderUI();}},true);
document.addEventListener('click',async e=>{
  const rh=e.target.closest('[data-rename-hero]');if(!rh)return;e.stopPropagation();const rt=null;
  if(rt){$('#modal')._close(1);await sleep(30);const n=await askName('Rename your town',TW().name);if(n){TW().name=n;save();}renderUI();openTown();}
  else if(!modalOpen&&!moving){const h=HERO(),n=await askName(`Rename ${esc(h.name)}`,h.name);if(n){h.name=n;save();}renderUI();}
},true);
async function openTown(tw){
  if(modalOpen||S.over)return;
  tw=tw&&tw!==S.town?tw:null;VT=tw;if(TOWN_SCREEN[TF()])artImg(TOWN_SCREEN[TF()].atlas);artImg(XB_ATLAS);artImg(WINGS_ATLAS);
  if(!tw&&S.town.taken){VT=null;toast(`${esc(TW().taken.name)} holds ${esc(TW().name)}. Defeat them at the gate to take it back.`);return;}
  townTab=townAdvice().tab==='overview'?'overview':'overview';townFocus=null;
  const p=showModal({title:`<img src="${iconURL('crest',TF(),52)}" alt="" style="width:44px;height:44px;vertical-align:-12px;margin-right:8px;image-rendering:pixelated"><span class="tname" data-rename-town="1" title="Double-click to rename">${esc(TW().name)}</span>`,body:townHTML(),wide:true,top:true,buttons:[...(nextTowns(tw).length?[{label:`Next town: ${esc(nextTowns(tw)[0].name)} ▸`,value:'next'}]:[]),{label:'Leave town ▸',value:1,primary:true}],dismiss:1});
  const m=$('#modal'),body=m.querySelector('.body');
  const go=(tab,id)=>{townTab=tab;townFocus=id||null;refresh();};
  const refresh=()=>{body.innerHTML=townHTML();renderUI();bindTownView(body,go);
    if(townFocus){const el=body.querySelector('#bc-'+townFocus);if(el){el.classList.add('flash');el.scrollIntoView({block:'center',behavior:reduced?'auto':'smooth'});}townFocus=null;}};
  bindTownView(body,go);
  body.addEventListener('click',e=>{
    {const upl=e.target.closest('[data-uplus]');if(upl){const t=TW(),side=upl.dataset.uplus[0],i=+upl.dataset.uplus.slice(1),arr=side==='g'?t.garrison:HERO().army,a=arr[i];if(!a)return;const c=upCost(a.k,a.n);
      if(!canAfford(c)){toast(`Upgrading needs ${fmt(c.gold)} gold.`);return;}pay(c);const uk=a.k+'_u',ex=arr.find(x=>x.k===uk);if(ex){ex.n+=a.n;arr.splice(i,1);}else a.k=uk;lootPop(`${a.n} ${U[uk].pl}`,iconURL('unit',uk,64));refresh();return;}}
    const el=e.target.closest('button');if(!el||el.disabled)return;const t=TW();
    if(el.dataset.tab){go(el.dataset.tab);return;}
    if(el.dataset.go){go(el.dataset.go,el.dataset.goid);return;}
    if(el.dataset.build){const b=townBuildings().find(x=>x.id===el.dataset.build);if(!b||t.builtToday||!canAfford(b.cost))return;pay(b.cost);t.built[b.id]=1;t.builtToday=true;
      if(b.unit)t.pool[b.unit]=(t.pool[b.unit]||0)+U[b.unit].growth;
      const here=heroHere();
      if(b.id.startsWith('lib')&&here){learnLibrary();if(b.id==='lib1')HERO().mana=maxMana();}
      if(b.id==='stables'&&here&&HERO().mount==='foot'){HERO().mount='horse';toast(`${HERO().name} takes a horse: +40% movement from tomorrow.`);}
      toast(`${b.name} completed.`);refresh();}
    else if(el.dataset.dw){go('recruit');return;}
    else if(el.dataset.gtx){if(!heroHere())return;const side=el.dataset.gtx[0],i=+el.dataset.gtx.slice(1),hh=HERO(),from=side==='g'?t.garrison:hh.army,to=side==='g'?hh.army:t.garrison,st=from[i];
      if(!st||(side==='h'&&hh.army.length<=1)){if(side==='h')toast('A hero must keep at least one stack.');return;}
      const ex=to.find(a=>a.k===st.k);if(ex)ex.n+=st.n;else if(to.length<7)to.push({...st});else{toast('No free slot there.');return;}from.splice(i,1);refresh();save();}
    else if(el.dataset.recall){let got=[];const fu=FAC[TF()].units;for(let i=fu.length-1;i>=0;i--){const bk=fu[i];if(!t.built['d'+(i+1)])continue;const k=recruitKey(bk),n=Math.min(t.pool[bk]||0,maxAfford(k));if(n<1)continue;
        pay(unitCost(k,n));t.pool[bk]-=n;if(!(heroHere()&&addToArmy(k,n))){const g=t.garrison.find(x=>x.k===k);if(g)g.n+=n;else t.garrison.push({k,n});}got.push(`${n} ${U[k].pl}`);}
      if(got.length)toast(`Recruited ${got.join(', ')}.`);refresh();}
    else if(el.dataset.recruit){const bk=el.dataset.recruit,k=recruitKey(bk);const inp=body.querySelector('#rc-'+bk);let n=Math.floor(+inp.value||0);n=clamp(n,0,Math.min(t.pool[bk]||0,maxAfford(k)));if(n<1)return;
      pay(unitCost(k,n));t.pool[bk]-=n;const here=heroHere();
      if(here&&addToArmy(k,n))toast(`${n} ${U[k].pl} join the army.`);else{const g=t.garrison.find(x=>x.k===k);if(g)g.n+=n;else t.garrison.push({k,n});toast(here?`The army has no free slot. ${n} ${U[k].pl} wait in the garrison.`:`${n} ${U[k].pl} wait in the garrison.`);}
      refresh();}
    else if(el.dataset.upg){const a=HERO().army[+el.dataset.upg];if(!a)return;const c=upCost(a.k,a.n);if(!canAfford(c))return;pay(c);const uk=a.k+'_u';const ex=HERO().army.find(x=>x.k===uk);if(ex){ex.n+=a.n;HERO().army.splice(+el.dataset.upg,1);}else a.k=uk;toast(`Upgraded to ${U[uk].pl}.`);refresh();}
    else if(el.dataset.hire){const hx=HBY[el.dataset.hire];if(!hx||S.res.gold<hireCost(hx)||S.heroes.length>=heroCap())return;S.res.gold-=hireCost(hx);const nh=mkHero(el.dataset.hire,t.x,t.y);const t1=FAC[TF()].units[0];nh.army=[{k:recruitKey(t1),n:Math.round(150/U[t1].hp)}];
      if(delivered(5)){nh.book=true;nh.spells.push('starfall');}const cur=S.cur;S.heroes.push(nh);S.cur=S.heroes.length-1;nh.mana=maxMana();nh.mp=maxMP();S.cur=cur;toast(`${nh.name} joins your banner and waits at the town gate.`);refresh();}
    else if(el.dataset.book){const x=S.heroes.find(q=>q.id===el.dataset.book);if(!x||x.book||S.res.gold<BOOK_COST)return;S.res.gold-=BOOK_COST;x.book=true;const cur=S.cur;S.cur=S.heroes.indexOf(x);learnLibrary();x.mana=maxMana();S.cur=cur;toast(`${x.name} now carries a spellbook.`);refresh();}
    else if(el.dataset.sell){const k=el.dataset.sell,n=+el.dataset.n||1;if(S.res[k]<n)return;let g=0;for(let i=0;i<n;i++){g+=sellPrice(k);mkt().s[k]=(mkt().s[k]||0)+1;}S.res[k]-=n;S.res.gold+=g;refresh();}
    else if(el.dataset.alch){const id=el.dataset.alch,r=ALCHEMY[id];if(!r||!anyStill()||!canAfford(alchCost(id)))return;pay(alchCost(id));mkt().a[id]=(mkt().a[id]||0)+1;gain(r.out,1);lootPop(`+1 ${RESNAME[r.out].toLowerCase()}`,iconURL('res',r.out,64));refresh();}
    else if(el.dataset.mineup){const o=S.objs.find(q=>q.id===+el.dataset.mineup);if(!o||(o.lvl||1)>=3)return;const c=MINE_UP[o.lvl||1];if(!canAfford(c))return;pay(c);o.lvl=(o.lvl||1)+1;lootPop(`${MINE[o.k].name} upgraded to level ${o.lvl}`,iconURL('res',MINE[o.k].res,64));refresh();}
    else if(el.dataset.minego){const o=S.objs.find(q=>q.id===+el.dataset.minego);if(o){$('#modal')._close&&$('#modal')._close(null);centerOn(o.x,o.y);}}
    else if(el.dataset.buy){const k=el.dataset.buy,n=+el.dataset.n||1;let c=0;for(let i=0;i<n;i++)c+=Math.round(PRICE[k][1]*(1+0.12*((mkt().b[k]||0)+i)));if(S.res.gold<c)return;S.res.gold-=c;S.res[k]+=n;mkt().b[k]=(mkt().b[k]||0)+n;refresh();}
  });
  const res=await p;VT=null;save();renderUI();
  if(res==='next'){const nx=nextTowns(tw)[0];if(nx){await sleep(30);openTown(nx===S.town?null:nx);}}
}
/* the towns after this one, in order, that can be opened (not held by a rival) */
function nextTowns(tw){const all=allTowns().filter(t=>!t.taken),cur=tw||S.town,i=all.indexOf(cur);return i<0?[]:[...all.slice(i+1),...all.slice(0,i)];}
