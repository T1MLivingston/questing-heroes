'use strict';
/* v35: each animation frame is cut into its own small canvas once, so shrinking it with smoothing can't blend in the
   neighbouring frame (that bled the hit pose into the defeat pose). Works from file:// too: drawing never needs pixel reads. */
const FRAME_CACHE=new WeakMap();
function stripFrame(im,i,fw,fh,cols){let m=FRAME_CACHE.get(im);if(!m){m=new Map();FRAME_CACHE.set(im,m);}let cv=m.get(i);if(cv)return cv;
  const cx=cols?(i%cols)*fw:i*fw,cy=cols?Math.floor(i/cols)*fh:0;cv=document.createElement('canvas');cv.width=Math.round(fw);cv.height=Math.round(fh);
  cv.getContext('2d').drawImage(im,cx,cy,fw,fh,0,0,fw,fh);m.set(i,cv);return cv;}
/* ================= BATTLE ================= */
const BC=13,BR=9;
const EVEN=[[1,0],[0,-1],[-1,-1],[-1,0],[-1,1],[0,1]],ODD=[[1,0],[1,-1],[0,-1],[-1,0],[0,1],[1,1]];
const hk=(c,r)=>r*BC+c;
const hnb=(c,r)=>(r&1?ODD:EVEN).map(([a,b])=>[c+a,r+b]).filter(([x,y])=>x>=0&&x<BC&&y>=0&&y<BR);
function hdist(c1,r1,c2,r2){const x1=c1-(r1-(r1&1))/2,x2=c2-(r2-(r2&1))/2,dx=x1-x2,dz=r1-r2,dy=-dx-dz;return Math.max(Math.abs(dx),Math.abs(dy),Math.abs(dz));}
let bt=null;
const btCv=$('#btc'),bctx=btCv.getContext('2d');
let BL={s:30,ox:0,oy:0,w:0,h:0,dpr:1};
function layoutBattle(){
  const r=btCv.getBoundingClientRect();BL.dpr=Math.min(2,window.devicePixelRatio||1);btCv.width=Math.max(1,r.width*BL.dpr);btCv.height=Math.max(1,r.height*BL.dpr);BL.w=r.width;BL.h=r.height;
  const side=Math.max(56,Math.min(120,r.width*0.09));BL.side=side;
  const s=Math.min((r.width-8-2*side)/(Math.sqrt(3)*(BC+0.5)),(r.height-8)/(1.5*(BR-1)+2));BL.s=Math.max(8,s);
  const gw=Math.sqrt(3)*BL.s*(BC+0.5),gh=BL.s*(1.5*(BR-1)+2);BL.ox=side+(r.width-2*side-gw)/2;BL.oy=(r.height-gh)/2;
}
function hc(c,r){const w=Math.sqrt(3)*BL.s;return{x:BL.ox+w*(c+0.5*(r&1))+w/2,y:BL.oy+BL.s+r*1.5*BL.s};}
function hexAt(x,y){let best=null,bd=Infinity;for(let r=0;r<BR;r++)for(let c=0;c<BC;c++){const p=hc(c,r),d=(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best={c,r};}}return bd<=(BL.s*1.05)**2?best:null;}
const stackAt=(c,r)=>bt.stacks.find(s=>s.alive&&s.c===c&&s.r===r);
const blocked=(c,r)=>bt.obst.has(hk(c,r))||!!stackAt(c,r);
const mine0=s=>s.side===0&&facOfUnit(s.k)===S.fac;
const hasFriendNear=s=>hnb(s.c,s.r).some(([c,r])=>{const o=stackAt(c,r);return o&&o.side===s.side;});
const tide=s=>S.fac==='merfolk'&&mine0(s)&&bt.round%3===0;
const pack=s=>S.fac==='centaurs'&&mine0(s)&&hasFriendNear(s);
function sAtk(s){let a=s.u.atk+s.buff.atk;if(s.side===0){const f=fx();a+=hst(HERO(),'atk')+((f.unitAtk||{})[s.k]||0);if(S.fac==='dwarves'&&S.town.built.forge&&mine0(s))a+=1+(f.forgePlus||0);}else if(bt&&bt.enemyHero)a+=hst(bt.enemyHero,'atk');if(tide(s))a+=2;if(pack(s))a+=2;return a;}
function sDef(s){let d=s.u.def+s.buff.def+(s.side===1&&bt&&bt.obj&&bt.obj.type==='spire'?3:0)+(s.side===1&&bt&&bt.siege?bt.siege:0);if(s.side===0){const f=fx();d+=hst(HERO(),'def')+((f.unitDef||{})[s.k]||0)+(f.armyDef||0);if(S.fac==='dwarves'&&S.town.built.forge&&mine0(s))d++;if(S.fac==='rangers'&&mine0(s)&&s.stood)d+=f.rootbound||2;}else if(bt&&bt.enemyHero)d+=hst(bt.enemyHero,'def');if(s.defending)d=Math.ceil(d*1.3);return d;}
function sSpd(s){let v=s.u.spd+s.buff.spd;if(s.side===0)v+=((fx().unitSpd||{})[s.k]||0);if(tide(s))v+=2;if(pack(s))v+=1;return Math.max(1,v);}
function sMorale(s){if(s.side!==0)return 0;let m=(unpaid()?-2:0)+skL('command')+(fx().morale||0)+s.buff.morale+carry(HERO(),'morale')+gear(HERO(),'morale');if(pack(s))m+=fx().packMorale||0;return m;}
const sLuck=s=>s.side===0?skL('fortune')+(fx().luck||0)+carry(HERO(),'luck')+gear(HERO(),'luck')+((HERO().luckUntil||0)>=S.day?1:0):0;
const totalHP=s=>s.alive?(s.n-1)*s.u.hp+s.hp:0;
function mkStack(k,n,side,c,r,slot){const u=U[k];let shots=u.shots||0;if(side===0&&u.shots)shots+=((fx().unitShots||{})[k]||0)+gear(HERO(),'shots');
  return{id:Math.random(),k,u,n,n0:n,hp:u.hp,side,c,r,slot,shots,retLeft:u.retal||1,acted:false,waited:false,defending:false,buff:{atk:0,def:0,spd:0,morale:0},alive:true,anim:null,rooted:0,skip:0,stood:false,movedTurn:false,movedLast:false};}
const rowsFor=n=>n===1?[4]:Array.from({length:n},(_,i)=>Math.round(i*(BR-1)/(n-1)));
/* a rogue hero holding an outpost leads its garrison in battle */
function keeperHero(o){const h=HBY[o.keeper];if(!h)return null;return{id:h.id,name:h.name,fac:h.fac,atk:h.st[0]+2,def:h.st[1]+2,pow:h.st[2]+1,lore:h.st[3]+1,relics:[],items:[],keeper:true};}
function startBattle(o){
  return new Promise(resolve=>{
    const stacks=[];const army=HERO().army;const rows=rowsFor(army.length),col0=Math.min(2,skL('battleplan'));
    army.forEach((a,i)=>stacks.push(mkStack(a.k,a.n,0,col0,rows[i],i)));
    if(o.type==='spire'||o.type==='camp'){const ea=o.garrison;const er=rowsFor(ea.length);ea.forEach((a,i)=>stacks.push(mkStack(a.k,a.n,1,BC-1,er[i],i)));}
    else if(o.type==='rival'){const ea=o.rival.army;const er=rowsFor(ea.length);ea.forEach((a,i)=>stacks.push(mkStack(a.k,a.n,1,BC-1,er[i],i)));}
    else{const k=o.type==='relic'&&o.r===6?o.n:clamp(Math.round(Math.sqrt(o.n)),1,Math.min(5,o.n));
    const er=rowsFor(k);for(let i=0;i<k;i++){const n=Math.floor(o.n/k)+(i<o.n%k?1:0);stacks.push(mkStack(o.k,n,1,BC-1,er[i],i));}}
    const obst=new Set();const no=ri(3,6);
    // a walled town (v30): a wall line three hexes in front of the defenders with one open gate; Bastion adds two shooting towers
    const sLv=o.type==='camp'&&o.built?wallLvl(o):0,wallSet=new Set();
    if(sLv){const wc=BC-3,gate=Math.floor(BR/2);for(let r=0;r<BR;r++)if(r!==gate){obst.add(hk(wc,r));wallSet.add(hk(wc,r));}}
    else for(let i=0;i<no*4&&obst.size<no;i++){const c=ri(3,BC-4),r=ri(0,BR-1);obst.add(hk(c,r));}
    bt={stacks,obst,round:1,active:null,pending:null,targeting:null,spellCast:false,spellsCast:0,auto:false,over:false,log:[],floats:[],fx:[],resolve,obj:o,terr:tileAt(o.x,o.y),hover:null,mouse:null,
      title:o.type==='camp'?`Battle for the ${campName(o)}`:o.type==='spire'?'Battle for the spire':o.type==='rival'?`Battle with ${o.rival.name}'s army`:o.type==='relic'?`Battle at the ${RELICS[o.r].lair}`:o.guard?'Battle at the guarded pass':`Battle with ${U[o.k].pl}`,rocks:{},siege:sLv,wall:wallSet,eMana:0,eCast:false,forced:null,firstDone:false,geyserUsed:false,corpses:[],enemyHero:o.type==='rival'?o.rival:o.keeper?keeperHero(o):null};
    if(bt.enemyHero)bt.eMana=Math.max(1,bt.enemyHero.lore||1)*10;
    $('#battle').hidden=false;$('#btTitle').textContent=bt.title;
    layoutBattle();renderBG();
    logB(o.type==='spire'||o.type==='camp'?'The garrison stands ready. Round 1.':o.type==='rival'?`${o.rival.name}'s army takes the field. Round 1.`:`${fx().exact?o.n:amountWord(o.n)} ${U[o.k].pl} bar the way. Round 1.`);
    battleLoop();
  });
}
let bgCv=null;
/* the battle ground matches where the fight happens */
function battleGround(){const o=bt.obj,t=bt.terr,x=o.x,y=o.y;
  if(t===T.LAKE)return'ship_deck';if(S.underY&&y>=S.underY)return'cavern';if(t===T.BOG)return'marsh';
  if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>inb(x+a,y+b)&&S.tiles[idx(x+a,y+b)]===T.LAKE))return'sand';
  if(S.biome==='high'&&y<H*0.34)return'snow';if(S.biome==='dry'||t===T.HEATH)return'dirt';if(t===T.DIRT||t===T.ROAD)return'dirt';return'meadow';}
function renderBG(){
  const cv=document.createElement('canvas');cv.width=btCv.width;cv.height=btCv.height;const c=cv.getContext('2d');c.scale(BL.dpr,BL.dpr);
  const pal={0:['#3d5a2a','#4f7034'],1:['#5e5034','#77663f'],2:['#5e5034','#77663f'],3:['#4f4239','#665446'],4:['#2f3f2e','#3e5139'],7:['#24465a','#2f5a70']}[bt.terr]||['#3d5a2a','#4f7034'];
  const gr=c.createLinearGradient(0,0,0,BL.h);gr.addColorStop(0,pal[1]);gr.addColorStop(1,pal[0]);c.fillStyle=gr;c.fillRect(0,0,BL.w,BL.h);
  {const gi=artImg(`battle/grounds/${battleGround()}.png`);if(gi.ok){const im=gi.img,sc=Math.max(BL.w/im.width,BL.h/im.height);c.imageSmoothingEnabled=false;c.drawImage(im,Math.round((BL.w-im.width*sc)/2),Math.round((BL.h-im.height*sc)/2),Math.round(im.width*sc),Math.round(im.height*sc));}}
  const g=mulberry32(77);for(let i=0;i<BL.w*BL.h/90;i++){c.fillStyle=`rgba(${g()<0.5?'0,0,0':'255,250,210'},${g()*0.08})`;c.fillRect(Math.round(g()*BL.w),Math.round(g()*BL.h),2,2+Math.round(g()*3));}
  const vg=c.createRadialGradient(BL.w/2,BL.h/2,Math.min(BL.w,BL.h)*0.3,BL.w/2,BL.h/2,Math.max(BL.w,BL.h)*0.7);vg.addColorStop(0,'rgba(0,0,0,0)');vg.addColorStop(1,'rgba(0,0,0,.5)');c.fillStyle=vg;c.fillRect(0,0,BL.w,BL.h);
  bgCv=cv;
}
function hexPath(c,x,y,s){c.beginPath();for(let i=0;i<6;i++){const a=Math.PI/180*(60*i-30);c.lineTo(x+s*Math.cos(a),y+s*Math.sin(a));}c.closePath();}
function logB(t){bt.log.unshift(t);bt.log=bt.log.slice(0,4);$('#btLog').innerHTML=bt.log.map(l=>`<li>${l}</li>`).join('');}
function setStatus(t){$('#btStatus').innerHTML=t||'';}
function floatAt(s,text,col){const p=s.anim||hc(s.c,s.r);bt.floats.push({x:p.x,y:p.y-BL.s*0.6,text,col,t0:performance.now()});}

function reach(s){
  const sp=sSpd(s),res=new Map();res._all=new Map();
  if(s.rooted>0)return res;
  if(s.u.fly){for(let r=0;r<BR;r++)for(let c=0;c<BC;c++){if(blocked(c,r))continue;const d=hdist(s.c,s.r,c,r);if(d<=sp)res.set(hk(c,r),{d,prev:null,c,r});}return res;}
  const q=[[s.c,s.r,0]];const seen=new Map([[hk(s.c,s.r),{d:0,prev:null,c:s.c,r:s.r}]]);
  while(q.length){const[c,r,d]=q.shift();if(d>=sp)continue;for(const[nc,nr]of hnb(c,r)){const k=hk(nc,nr);if(seen.has(k)||blocked(nc,nr))continue;seen.set(k,{d:d+1,prev:hk(c,r),c:nc,r:nr});q.push([nc,nr,d+1]);}}
  res._all=seen;for(const[k,v]of seen)if(k!==hk(s.c,s.r))res.set(k,v);
  return res;
}
function canShoot(s){return s.u.shots&&s.shots>0&&!hnb(s.c,s.r).some(([c,r])=>{const o=stackAt(c,r);return o&&o.side!==s.side;});}
function dmgRange(a,d,o={}){
  let m=sAtk(a)>=sDef(d)?Math.min(3,1+0.05*(sAtk(a)-sDef(d))):Math.max(0.3,1-0.025*(sDef(d)-sAtk(a)));
  if(o.half)m*=0.5;if(o.charge)m*=1+0.06*o.charge;
  if(a.side===0){const f=fx();m*=((f.unitDmgPct||{})[a.k]||1);if(o.ranged)m*=1+0.1*skL('steadyaim')+(f.rangedPct||0);if(!o.ranged)m*=1+0.1*skL('bladework');}
  if(d.side===0)m*=1-0.05*skL('shieldcraft');
  const flat=a.side===0?((fx().unitDmgFlat||{})[a.k]||0):0;
  return[Math.max(1,Math.round(a.n*(a.u.min+flat)*m)),Math.max(1,Math.round(a.n*(a.u.max+flat)*m))];
}
function rollDmg(a,d,o){const[lo,hi]=dmgRange(a,d,o);let v=Math.round(lo+(R()+R())/2*(hi-lo));if(sLuck(a)&&R()<0.1){v*=2;floatAt(a,'Lucky!','#a6e08a');}return v;}
function applyDmg(s,dmg){const before=s.n,tot=totalHP(s)-dmg;s.act={row:3,t0:performance.now(),dur:260,n:1};if(tot<=0){s.n=0;s.hp=0;s.alive=false;if(bt&&bt.corpses)bt.corpses.push({k:s.k,side:s.side,c:s.c,r:s.r,t0:performance.now()});}else{s.n=Math.ceil(tot/s.u.hp);s.hp=tot-(s.n-1)*s.u.hp;}return before-s.n;}
function heal(s,amt){const cap=s.n0*s.u.hp;const tot=Math.min(cap,totalHP(s)+amt);const b=s.n;s.n=Math.ceil(tot/s.u.hp);s.hp=tot-(s.n-1)*s.u.hp;return s.n-b;}
const killsEst=(d,dm)=>{const tot=totalHP(d);if(dm>=tot)return d.n;const rem=tot-dm;return d.n-Math.ceil(rem/d.u.hp);};

async function moveTo(s,c,r,rm){
  if(s.c===c&&s.r===r)return 0;
  const info=rm.get(hk(c,r));const d=info?info.d:hdist(s.c,s.r,c,r);
  let pts=[];
  if(s.u.fly||!rm._all.size)pts=[{c,r}];else{let k=hk(c,r);while(k!=null&&k!==hk(s.c,s.r)){const v=rm._all.get(k);if(!v)break;pts.unshift({c:v.c,r:v.r});k=v.prev;}}
  let cur=hc(s.c,s.r);
  for(const p of pts){const to=hc(p.c,p.r),from=cur;const dur=s.u.fly?Math.min(600,90*hdist(s.c,s.r,c,r)+120):120;
    await tween(reduced?1:dur,t=>{s.anim={x:from.x+(to.x-from.x)*t,y:from.y+(to.y-from.y)*t};});cur=to;}
  s.c=c;s.r=r;s.anim=null;s.movedTurn=true;s.stood=false;return d;
}
async function lunge(a,d){a.act={row:2,t0:performance.now(),dur:reduced?60:440,n:4};const p=hc(a.c,a.r),q=hc(d.c,d.r);await tween(reduced?1:110,t=>{a.anim={x:p.x+(q.x-p.x)*0.35*t,y:p.y+(q.y-p.y)*0.35*t};});await tween(reduced?1:110,t=>{a.anim={x:p.x+(q.x-p.x)*0.35*(1-t),y:p.y+(q.y-p.y)*0.35*(1-t)};});a.anim=null;}
async function projectile(a,d,col){const p=hc(a.c,a.r),q=hc(d.c,d.r);const f={type:'shot',x:p.x,y:p.y,col,pk:PROJ_OF(a.k),t0:performance.now(),ang:Math.atan2(q.y-p.y,q.x-p.x)};bt.fx.push(f);
  await tween(reduced?1:Math.min(420,Math.hypot(q.x-p.x,q.y-p.y)*1.1),t=>{f.x=p.x+(q.x-p.x)*t;f.y=p.y+(q.y-p.y)*t-Math.sin(t*Math.PI)*BL.s*0.8;});bt.fx=bt.fx.filter(x=>x!==f);}
const SPELL_FX={ember:'ember_dart',chain:'chain_spark',mend:'mend',swift:'swiftness',bark:'bark_skin',entangle:'entangle',squall:'squall',starfall:'starfall',raise:'raise_bones',frost:'squall',meteor:'starfall',rally:'mend'};
let curSpell=null;
async function burst(s,col){const p=hc(s.c,s.r),sp=curSpell&&SPELL_FX[curSpell];const f={type:'burst',x:p.x,y:p.y,col,t:0,sp};bt.fx.push(f);await tween(reduced?1:sp?560:380,t=>{f.t=t;});bt.fx=bt.fx.filter(x=>x!==f);}
const nm=s=>`<b style="color:${s.side?'var(--foe)':'var(--team)'}">${s.u.pl}</b>`;
function onHit(a,d,dm){
  if(!d.alive)return;
  if(a.u.drain&&a.alive){const r=heal(a,Math.round(dm*0.3));if(r>0)floatAt(a,`+${r} rise`,'#a6e08a');}
  if(a.u.charm&&R()<0.3){d.skip=1+(a.side===0?(fx().charmExtra||0):0);floatAt(d,'Charmed','#bfe8ff');logB(`${nm(d)} are charmed by the song.`);}
  if(a.k==='siren'&&a.side===0&&fx().eelSlow){d.buff.spd-=fx().eelSlow;floatAt(d,`-${fx().eelSlow} speed`,'#bfe8ff');}
}
async function doMelee(a,d,moved=0){
  await lunge(a,d);const half=!!a.u.shots;
  const dm=rollDmg(a,d,{half,charge:a.u.charge?moved:0});const k=applyDmg(d,dm);floatAt(d,`-${dm}`,'#ffd3c4');
  logB(`${a.n} ${nm(a)} strike for ${dm}.${k?` ${k} ${d.u.pl} fall.`:''}`);onHit(a,d,dm);
  if(d.alive&&a.alive&&d.retLeft>0&&!a.u.noRetal&&d.skip<=0){d.retLeft--;await sleep(reduced?0:120);await lunge(d,a);
    const r2=rollDmg(d,a,{half:!!d.u.shots});const k2=applyDmg(a,r2);floatAt(a,`-${r2}`,'#ffd3c4');logB(`${nm(d)} strike back for ${r2}.${k2?` ${k2} ${a.u.pl} fall.`:''}`);}
  if(a.u.double&&a.alive&&d.alive){await sleep(reduced?0:100);await lunge(a,d);const d2=rollDmg(a,d,{});const k3=applyDmg(d,d2);floatAt(d,`-${d2}`,'#ffd3c4');logB(`${nm(a)} strike again for ${d2}.${k3?` ${k3} fall.`:''}`);}
}
async function doShoot(a,d){a.act={row:2,t0:performance.now(),dur:reduced?60:440,n:4};
  const shots=(S.fac==='elves'&&mine0(a)&&!a.movedLast&&a.shots>1)?2:1;
  for(let i=0;i<shots&&d.alive;i++){
    await projectile(a,d,a.k==='imp'||a.k==='powder'||a.k==='cannon'?'#ff8a3c':a.k==='magus'||a.k==='apprentice'?'#9fd0ff':a.k==='siren'?'#bfe8ff':'#efe2bb');a.shots--;
    const dm=rollDmg(a,d,{ranged:true});const k=applyDmg(d,dm);floatAt(d,`-${dm}`,'#ffd3c4');logB(`${a.n} ${nm(a)} shoot for ${dm}.${k?` ${k} ${d.u.pl} fall.`:''}${i===1?' (Double Volley)':''}`);onHit(a,d,dm);
  }
}
function bestAttackHex(s,t,rm,x,y){
  let best=null,bd=Infinity;
  for(const[c,r]of hnb(t.c,t.r)){const own=c===s.c&&r===s.r;if(!own&&!rm.has(hk(c,r)))continue;const p=hc(c,r);const d=x==null?(own?-1:rm.get(hk(c,r)).d):(p.x-x)**2+(p.y-y)**2;if(d<bd){bd=d;best={c,r};}}
  return best;
}
function nextStack(){
  if(bt.forced&&bt.forced.alive){const f=bt.forced;bt.forced=null;return f;}bt.forced=null;
  const al=bt.stacks.filter(s=>s.alive&&!s.acted);
  let c=al.filter(s=>!s.waited);if(c.length)return c.sort((a,b)=>sSpd(b)-sSpd(a)||a.side-b.side||a.slot-b.slot)[0];
  if(al.length)return al.sort((a,b)=>sSpd(a)-sSpd(b)||a.side-b.side)[0];return null;
}
function orderPreview(){
  const al=bt.stacks.filter(s=>s.alive&&!s.acted&&s!==bt.active);
  const a=al.filter(s=>!s.waited).sort((a,b)=>sSpd(b)-sSpd(a)||a.side-b.side||a.slot-b.slot),w=al.filter(s=>s.waited).sort((a,b)=>sSpd(a)-sSpd(b)||a.side-b.side);
  return[bt.active,...a,...w].filter(Boolean);
}
function stackCard(s){
  const bA=sAtk(s)-s.u.atk,bD=sDef(s)-s.u.def,bS=sSpd(s)-s.u.spd,fl=[];
  if(s.defending)fl.push('Defending');if(s.waited&&!s.acted)fl.push('Waiting');if(s.rooted>0)fl.push('Entangled');if(s.skip>0)fl.push('Charmed');if(s.stood&&S.fac==='rangers'&&mine0(s))fl.push('Rootbound');if(pack(s))fl.push('Pack Bond');if(tide(s))fl.push('High Tide');
  const mo=sMorale(s),lu=sLuck(s);
  return`<h4><img class="${U[s.k]&&U[s.k].up?'upg':''}" src="${iconURL('unit',s.k,64)}" alt="">${s.n} ${s.u.pl}</h4><div class="scs">${sc('atk',s.u.atk,bA)}${sc('def',s.u.def,bD)}${sc('dmg',s.u.min+'–'+s.u.max)}${sc('hp',`${s.hp}/${s.u.hp}`)}${sc('spd',s.u.spd,bS)}${s.u.shots?sc('shots',s.shots):''}${mo?sc('morale',mo):''}${lu?sc('luck',lu):''}</div>
   <div class="muted">${s.u.desc}</div>${fl.length?`<div class="chips">${fl.map(x=>`<span class="chip team">${x}</span>`).join('')}</div>`:''}`;
}
function updateBattleUI(){
  $('#btRound').textContent=`Round ${bt.round}${S.fac==='merfolk'&&bt.round%3===0?' · High Tide':''}`;
  $('#queue').innerHTML=orderPreview().slice(0,12).map(s=>`<div class="${s.side?'f':'a'}" title="${s.n} ${s.u.pl}"><img class="${U[s.k]&&U[s.k].up?'upg':''}" src="${iconURL('unit',s.k,64)}" alt=""></div>`).join('');
  const s=bt.active,mineTurn=s&&s.side===0&&!bt.auto&&bt.pending;
  $('#bWait').disabled=!mineTurn||s.waited;$('#bDefend').disabled=!mineTurn;$('#bSpell').disabled=!mineTurn||!HERO().book||bt.spellCast||!usableSpells().length;$('#bSpell').textContent=HERO().book?'Spellbook':'No spellbook';
  $('#bAuto').textContent=bt.auto?'Stop auto':'Auto';
  if(mineTurn&&!bt.targeting)setStatus(`<b>${s.n} ${s.u.pl}</b> await orders. ${sc('shots',s.u.shots?s.shots:'–')} ${sc('lore',HERO().mana)}`);
  else if(s&&s.side===1)setStatus(`${s.u.pl} act…`);
  if(!bt.hover&&s)$('#btCard').innerHTML=stackCard(s);
}
function usableSpells(){return HERO().spells.filter(k=>spellCost(k)<=HERO().mana&&!(k==='geyser'&&bt.geyserUsed));}
function spellCost(k){let c=SP[k].cost;if(k==='squall'&&fx().squallHalf)c=Math.ceil(c/2);if(fx().halfCost===k)c=Math.ceil(c/2);if(fx().manaCut&&c>1)c=Math.max(1,c-fx().manaCut);if(skL('arcane')&&c>1)c=Math.max(1,c-(skL('arcane')>=3?2:1));if(S.delivered&&delivered(3)&&c>1)c-=1;return c;}
function newRound(){bt.round++;for(const s of bt.stacks){s.acted=false;s.waited=false;s.retLeft=s.u.retal||1;if(s.rooted>0)s.rooted--;}bt.spellCast=false;bt.eCast=false;bt.towersDue=bt.siege>=3;
  logB(`Round ${bt.round}.${S.fac==='merfolk'&&bt.round%3===0?' The tide rises: Merfolk +2 speed and +2 attack this round.':''}`);}
function checkEnd(){const a=bt.stacks.some(s=>s.alive&&s.side===0),b=bt.stacks.some(s=>s.alive&&s.side===1);if(!a||!b){bt.over=true;return true;}return false;}
async function battleLoop(){
  while(true){
    const s=nextStack();if(!s){newRound();continue;}
    bt.active=s;s.defending=false;s.movedTurn=false;
    if(s.u.regen&&s.hp<s.u.hp){s.hp=s.u.hp;floatAt(s,'regrows','#a6e08a');}
    updateBattleUI();
    let r;
    if(s.skip>0){s.skip--;logB(`${nm(s)} are charmed and lose their turn.`);floatAt(s,'Charmed','#bfe8ff');await sleep(reduced?50:400);}
    else if(s.side===0&&sMorale(s)<0&&R()<-0.06*sMorale(s)){logB(`<b>Low morale!</b> ${nm(s)} falter and lose their turn.`);floatAt(s,'Falters','#e08a8a');await sleep(reduced?50:400);}
    else if(s.side===0&&!bt.auto)r=await playerTurn(s);else{await sleep(reduced?60:bt.auto?140:380);if(s.side===1){if(bt.towersDue){bt.towersDue=false;await towersFire();if(checkEnd())break;}if(!bt.eCast&&bt.enemyHero){bt.eCast=true;await enemyCast();if(checkEnd())break;}}await aiTurn(s);}
    if(r!=='waited'){s.acted=true;s.stood=!s.movedTurn;s.movedLast=s.movedTurn;}
    bt.active=null;bt.targeting=null;
    if(checkEnd())break;
    if(r!=='waited'&&s.alive&&s.side===0){
      let extra=false;
      if(fx().extraFirst&&!bt.firstDone){bt.firstDone=true;extra=true;logB(`<b>Troublemaker!</b> ${nm(s)} act again.`);}
      else if(!s.surged&&R()<0.05*sMorale(s)){extra=true;s.surged=true;logB(`<b>Morale!</b> ${nm(s)} surge forward and act again.`);}
      if(extra){floatAt(s,'Extra turn','#e8bc3e');bt.forced=s;}
    }
    if(s.side===0)bt.firstDone=true;
  }
  updateBattleUI();await endBattle();
}
async function playerTurn(s){
  while(true){
    const act=await new Promise(r=>{bt.pending=r;updateBattleUI();});bt.pending=null;updateBattleUI();
    if(act.type==='auto'){await aiTurn(s);return;}
    if(act.type==='wait'){if(!s.waited){s.waited=true;logB(`${nm(s)} wait.`);return'waited';}continue;}
    if(act.type==='defend'){s.defending=true;logB(`${nm(s)} brace their defense.`);return;}
    if(act.type==='spell'){await castSpell(act.spell,act.target);if(checkEnd())return;continue;}
    if(act.type==='click'){const ok=await handleClick(s,act);if(ok)return;}
  }
}
async function handleClick(s,{c,r,x,y}){
  const t=stackAt(c,r),rm=reach(s);
  if(t&&t.side!==s.side){
    if(canShoot(s)){await doShoot(s,t);return true;}
    const from=bestAttackHex(s,t,rm,x,y);if(!from){setStatus('That enemy is out of reach this turn.');return false;}
    const moved=await moveTo(s,from.c,from.r,rm);await doMelee(s,t,moved);return true;
  }
  if(!t&&!bt.obst.has(hk(c,r))&&rm.has(hk(c,r))){await moveTo(s,c,r,rm);return true;}
  return false;
}
function unitValue(d){return((d.u.min+d.u.max)/2)*(1+d.u.atk/10)*(d.u.shots?1.4:1);}
function hitScore(a,d,o){const[lo,hi]=dmgRange(a,d,o);const dm=Math.min((lo+hi)/2,totalHP(d));return dm/d.u.hp*unitValue(d)+(dm>=totalHP(d)?20:0);}
async function aiTurn(s){
  const foes=bt.stacks.filter(f=>f.alive&&f.side!==s.side);if(!foes.length)return;
  if(canShoot(s)){let t=foes[0],bs=-1;for(const f of foes){const v=hitScore(s,f,{ranged:true});if(v>bs){bs=v;t=f;}}await doShoot(s,t);return;}
  const rm=reach(s);
  // a pinned shooter with arrows left steps away to shoot next turn, if there is somewhere safe to go
  if(s.u.shots&&s.shots>0&&rm.size){let safe=null,bd=-1;for(const v of rm.values()){const adj=foes.some(f=>hdist(v.c,v.r,f.c,f.r)<=1);if(adj)continue;const d=Math.min(...foes.map(f=>hdist(v.c,v.r,f.c,f.r)));if(d>bd){bd=d;safe=v;}}
    if(safe&&R()<0.8){await moveTo(s,safe.c,safe.r,rm);logB(`${nm(s)} fall back to shoot.`);return;}}let best=null,bs=-1;
  for(const f of foes)for(const[c,r]of hnb(f.c,f.r)){const own=c===s.c&&r===s.r;if(!own&&!rm.has(hk(c,r)))continue;const mv=own?0:rm.get(hk(c,r)).d;
    const v=hitScore(s,f,{half:!!s.u.shots,charge:s.u.charge?mv:0})+(f.u.shots?8:0)-mv*0.05;if(v>bs){bs=v;best={f,c,r};}}
  if(best){const mv=await moveTo(s,best.c,best.r,rm);await doMelee(s,best.f,mv);return;}
  if(s.u.shots){s.defending=true;logB(`${nm(s)} hold their ground.`);return;}
  // if the enemy has no shooters but our side does, wait behind the walls or the archers rather than charging in
  {const theyShoot=foes.some(f=>f.u.shots&&f.shots>0),weShoot=bt.stacks.some(q=>q.alive&&q.side===s.side&&q.u.shots&&q.shots>0);
    if((bt.siege&&s.side===1)||(!theyShoot&&weShoot&&bt.round<4)){s.defending=true;logB(`${nm(s)} hold the line.`);return;}}
  const near=(c,r)=>Math.min(...foes.map(f=>hdist(c,r,f.c,f.r)));
  let tgt=null,bd=near(s.c,s.r);for(const v of rm.values()){const d=near(v.c,v.r);if(d<bd){bd=d;tgt=v;}}
  if(tgt){await moveTo(s,tgt.c,tgt.r,rm);logB(`${nm(s)} advance.`);}else{s.defending=true;logB(`${nm(s)} brace their defense.`);}
}
/* the enemy hero casts one spell a round from their banner's list (v30); Warding reduces the damage */
async function enemyCast(){const eh=bt.enemyHero,P=Math.max(1,eh.pow||1),ward=1-0.15*skL('warding');const book=FAC_SPELLS[eh.fac]||[];
  const mine=bt.stacks.filter(s=>s.alive&&s.side===0),own=bt.stacks.filter(s=>s.alive&&s.side===1);if(!mine.length||!own.length)return;
  const can=k=>book.includes(k)&&SP[k].cost<=bt.eMana;const worth=s=>unitValue(s)*s.n;const big=mine.slice().sort((a,b)=>worth(b)-worth(a))[0],bigOwn=own.slice().sort((a,b)=>worth(b)-worth(a))[0];
  const dmgOf={ember:15+10*P,frost:14+9*P,squall:8+6*P,chain:12+8*P,meteor:25+14*P,starfall:10+6*P};
  const order=['meteor','starfall','frost','chain','ember','squall'].filter(can);let k=order[0];
  if(!k){const b=['bark','rally','swift','weaken'].find(can);if(!b||R()<0.3)return;k=b;}
  bt.eMana-=SP[k].cost;curSpell=k;try{
    if(dmgOf[k]){const dm=Math.round(dmgOf[k]*ward);const hits=k==='starfall'?mine:k==='meteor'?[big,...mine.filter(s=>s!==big&&hdist(s.c,s.r,big.c,big.r)<=1)]:k==='chain'?[big,mine.filter(s=>s!==big).sort((a,b)=>hdist(big.c,big.r,a.c,a.r)-hdist(big.c,big.r,b.c,b.r))[0]].filter(Boolean):[big];
      let tot=0;for(let i=0;i<hits.length;i++){const t=hits[i],d=(k==='meteor'||k==='chain')&&i>0?Math.round(dm/2):dm;await burst(t,'#ff9a6a');tot+=applyDmg(t,d);floatAt(t,`-${d}`,'#ffb48a');if(k==='squall')t.buff.spd-=3;if(k==='frost')t.buff.spd-=2;}
      logB(`<b>${esc(eh.name)}</b> casts ${SP[k].name}${hits.length>1?` on ${hits.length} of your stacks`:` on ${nm(big)}`}.${tot?` ${tot} fall.`:''}`);}
    else if(k==='weaken'){await burst(big,'#b07ad8');big.buff.atk-=3+Math.floor(P/3);floatAt(big,'Weakened','#d0a6f0');logB(`<b>${esc(eh.name)}</b> weakens ${nm(big)}.`);}
    else{await burst(bigOwn,'#c9a26a');if(k==='bark')bigOwn.buff.def+=5;else if(k==='swift')bigOwn.buff.spd+=3;else{heal(bigOwn,10+8*P);bigOwn.buff.morale+=2;}floatAt(bigOwn,SP[k].name,'#e2c28a');logB(`<b>${esc(eh.name)}</b> casts ${SP[k].name} on ${nm(bigOwn)}.`);}
  }finally{curSpell=null;}updateBattleUI();}
async function towersFire(){const mine=bt.stacks.filter(s=>s.alive&&s.side===0);for(let i=0;i<2&&mine.some(s=>s.alive);i++){const t=pick(mine.filter(s=>s.alive)),dm=Math.round((20+8*weekNo())*monMul());await burst(t,'#ffcf6a');const k=applyDmg(t,dm);floatAt(t,`-${dm}`,'#ffcf6a');logB(`A tower shoots ${nm(t)} for ${dm}.${k?` ${k} fall.`:''}`);}updateBattleUI();}
async function castSpell(id,target){
  const P=Math.round(hst(HERO(),'pow')*(1+0.15*skL('sorcery')));HERO().mana-=spellCost(id);bt.spellCast=true;renderUI();
  const echoN=S.fac==='wizards'?(fx().echo||1):0;const times=bt.spellsCast<echoN?2:1;bt.spellsCast++;
  for(let i=0;i<times;i++){
    if(i===1){logB('<b>Spell Echo!</b> The spell rings out again.');if(target&&!target.alive)break;}
    await spellEffect(id,target,P);if(checkEnd())break;
  }
  updateBattleUI();
}
async function spellEffect(id,target,P){curSpell=id;try{await spellEffect0(id,target,P);}finally{curSpell=null;}}
async function spellEffect0(id,target,P){
  const ward=1;
  if(id==='ember'){await burst(target,'#ff8a3c');const dm=Math.round((15+10*P)*ward*(fx().emberPct||1)),k=applyDmg(target,dm);floatAt(target,`-${dm}`,'#ffb48a');logB(`Ember Dart burns ${nm(target)} for ${dm}.${k?` ${k} fall.`:''}`);}
  else if(id==='chain'){await burst(target,'#ffe066');const dm=12+8*P;applyDmg(target,dm);floatAt(target,`-${dm}`,'#ffe066');let from=target;const hit=new Set([target]);
    for(let j=0;j<1+(fx().chainExtra||0);j++){const nx=bt.stacks.filter(s=>s.alive&&s.side===1&&!hit.has(s)).sort((a,b)=>hdist(from.c,from.r,a.c,a.r)-hdist(from.c,from.r,b.c,b.r))[0];if(!nx)break;hit.add(nx);await burst(nx,'#ffe066');const d2=Math.round(dm/2);applyDmg(nx,d2);floatAt(nx,`-${d2}`,'#ffe066');from=nx;}
    logB(`Chain Spark arcs through ${hit.size} stacks.`);}
  else if(id==='squall'){await burst(target,'#cfe8ff');const dm=Math.round((8+6*P)*(bt.enemyCasting?1:(fx().squallPct||1)));applyDmg(target,dm);target.buff.spd-=3;floatAt(target,`-${dm}, -3 speed`,'#cfe8ff');logB(`A squall batters ${nm(target)}.`);}
  else if(id==='entangle'){await burst(target,'#8cbc70');target.rooted=1+(fx().entangleExtra||0);floatAt(target,'Entangled','#a6e08a');logB(`Roots seize ${nm(target)}. They cannot move.`);}
  else if(id==='geyser'){bt.geyserUsed=true;const spot=hnb(target.c,target.r).find(([c,r])=>!blocked(c,r));if(spot){bt.obst.add(hk(spot[0],spot[1]));}
    const dm=10+6*P;const hits=[target,...bt.stacks.filter(s=>s.alive&&s.side===1&&s!==target&&spot&&hdist(s.c,s.r,spot[0],spot[1])<=1)];
    for(const h of hits){await burst(h,'#e8f4ff');applyDmg(h,dm);floatAt(h,`-${dm}`,'#e8f4ff');}logB(`A scalding geyser erupts, hitting ${hits.length} stack${hits.length>1?'s':''}.`);}
  else if(id==='raise'){const n=4+3*P;let spot=null;for(const c of[0,1,2]){for(const r of[4,3,5,2,6,1,7,0,8]){if(!blocked(c,r)){spot={c,r};break;}}if(spot)break;}
    if(spot){await burst(spot,'#a6e08a');const ex=bt.stacks.find(s=>s.side===0&&s.alive&&s.k==='skeleton');if(ex){ex.n+=n;ex.n0+=n;floatAt(ex,`+${n}`,'#a6e08a');}else{const ns=mkStack('skeleton',n,0,spot.c,spot.r,90);ns.acted=true;bt.stacks.push(ns);floatAt(ns,`+${n}`,'#a6e08a');}logB(`${n} Skeletons claw out of the ground.`);}}
  else if(id==='starfall'){const foes=bt.stacks.filter(f=>f.alive&&f.side===1);const dm=10+6*P;await Promise.all(foes.map(f=>burst(f,'#cfe0ff')));for(const f of foes){applyDmg(f,dm);floatAt(f,`-${dm}`,'#cfe0ff');}logB(`Starfall strikes every enemy for ${dm}.`);}
  else if(id==='mend'){await burst(target,'#a6e08a');const amt=Math.round((20+15*P)*(fx().mendPct||1));const raised=heal(target,amt);floatAt(target,`+${amt}`,'#a6e08a');if(fx().healMorale){target.buff.morale+=fx().healMorale;}logB(`Mend restores ${nm(target)}.${raised>0?` ${raised} rise again.`:''}`);}
  else if(id==='swift'){await burst(target,'#cde6ff');target.buff.spd+=3;floatAt(target,'+3 speed','#cde6ff');logB(`Swift Wind hastens ${nm(target)}.`);}
  else if(id==='weaken'){await burst(target,'#b07ad8');const a=Math.round((3+Math.floor(P/3))*(bt.enemyCasting?1:(fx().weakenPct||1)));target.buff.atk-=a;floatAt(target,`-${a} attack`,'#d0a6f0');logB(`${nm(target)} are weakened.`);}
  else if(id==='frost'){await burst(target,'#bfe8ff');const dm=14+9*P,k=applyDmg(target,dm);target.buff.spd-=2;floatAt(target,`-${dm}, -2 speed`,'#bfe8ff');logB(`A frost lance strikes ${nm(target)} for ${dm}.${k?` ${k} fall.`:''}`);}
  else if(id==='rally'){await burst(target,'#ffe08a');const amt=10+8*P;heal(target,amt);target.buff.morale+=2;floatAt(target,`+${amt}, +2 morale`,'#ffe08a');logB(`${nm(target)} rally.`);}
  else if(id==='meteor'){const dm=25+14*P;await burst(target,'#ff7a3c');applyDmg(target,dm);floatAt(target,`-${dm}`,'#ffb48a');const nb=bt.stacks.filter(s=>s.alive&&s.side===target.side&&s!==target&&hdist(s.c,s.r,target.c,target.r)<=1);
    for(const q of nb){await burst(q,'#ff7a3c');const d2=Math.round(dm/2);applyDmg(q,d2);floatAt(q,`-${d2}`,'#ffb48a');}logB(`A meteor crashes down on ${nm(target)}${nb.length?` and ${nb.length} beside it`:''}.`);}
  else if(id==='bark'){await burst(target,'#c9a26a');target.buff.def+=5;floatAt(target,'+5 defense','#e2c28a');if(fx().healMorale)target.buff.morale+=fx().healMorale;logB(`Bark Skin hardens ${nm(target)}.`);}
}
function openSpellbook(){
  if(!bt||!bt.pending)return;if(!HERO().book){toast(`${HERO().name} has no spellbook. Buy one at the Lantern Library.`);return;}if(bt.spellCast){toast('Only one spell per round.');return;}
  const h=HERO(),echo=S.fac==='wizards'&&bt.spellsCast<(fx().echo||1);
  showModal({title:'Spellbook',body:`<p class="muted">One spell per round. ${sc('lore',h.mana)} mana · ${sc('pow',h.pow)} power${echo?' · <b style="color:var(--text)">Spell Echo ready: this spell casts twice</b>':''}</p><div class="grid">${h.spells.map(k=>{const c=spellCost(k),off=c>h.mana||(k==='geyser'&&bt.geyserUsed);return`<div class="bcard"><h4>${SP[k].name} <span class="muted">· ${c} mana</span></h4><p>${SP[k].desc(h.pow)}</p><div><button class="btn sm" data-cast="${k}" ${off?'disabled':''}>Cast</button></div></div>`;}).join('')}</div>`,
    buttons:[{label:'Close',value:null}],dismiss:null});
  const m=$('#modal');
  m.querySelector('.body').addEventListener('click',e=>{const b=e.target.closest('[data-cast]');if(!b||b.disabled)return;const k=b.dataset.cast;m._close(null);
    if(SP[k].target==='all'){bt.pending&&bt.pending({type:'spell',spell:k});}
    else{bt.targeting=k;setStatus(`Choose ${SP[k].target==='enemy'?'an enemy':'an allied'} stack for ${SP[k].name}. Press Esc to cancel.`);}});
}
async function endBattle(){
  const won=bt.stacks.some(s=>s.alive&&s.side===0);await sleep(reduced?50:500);
  if(!S.players){const st=stats();if(won)st.won++;else st.lost++;st.slain+=bt.stacks.filter(s=>s.side===1).reduce((a,s)=>a+Math.max(0,s.n0-s.n),0);if(won&&bt.obj.type==='camp')st.towns++;if(won&&bt.obj.type==='rival')st.heroes++;}
  const lost=side=>bt.stacks.filter(s=>s.side===side).map(s=>({k:s.k,n:Math.max(0,s.n0-s.n)})).filter(x=>x.n>0);
  const merge=l=>{const m={};for(const x of l)m[x.k]=(m[x.k]||0)+x.n;return Object.entries(m).map(([k,n])=>`<li>${n} ${U[k].pl}</li>`).join('')||'<li class="muted">None</li>';};
  const killedHP=bt.stacks.filter(s=>s.side===1).reduce((a,s)=>a+(s.n0-s.n)*s.u.hp,0);const xp=killedHP;
  let extras=[];let thralls=0,plunder=0,freedKeeper=null;
  if(won&&S.fac==='necro'){thralls=Math.max(1,Math.round(killedHP*((fx().harvest||0.10)+(facSpecial('harvest')?0.05:0))/U.skeleton.hp));extras.push(`<b>Grave Harvest:</b> ${thralls} Skeletons rise and join you.`);}
  if(won&&S.fac==='pirates'){plunder=Math.round(xp*0.6*(fx().plunder||1));extras.push(`<b>Plunder:</b> +${fmt(plunder)} gold.`);}
  const o=bt.obj,rv=o.type==='rival'?o.rival:null,h=HERO();
  if(won&&rv&&rv.relics.length)extras.push(`<b>Relics recovered:</b> ${rv.relics.map(r=>RELICS[r].name).join(', ')}.`);
  if(!won&&h.relics.length)extras.push(rv?`${rv.name} takes ${h.relics.map(r=>RELICS[r].name).join(', ')}.`:`${h.relics.map(r=>RELICS[r].name).join(', ')} ${h.relics.length>1?'fall':'falls'} to the ground where ${h.name} stood.`);
  if(won&&o.type==='neutral'&&o.lvl===4){const g=ri(6,12)*100;S.res.gold+=g;const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].lvl<=2&&!S.heroes.some(x=>(x.items||[]).includes(k)));
    let it=null;if(pool.length&&Math.random()<0.6){it=pick(pool);giveItem(h,it);}extras.push(`<b>Elite loot:</b> ${fmt(g)} gold${it?` and the ${ITEMS[it].name} (${itemTxt(it)})`:''}.`);}
  if(won&&o.type==='camp')extras.push(isMajor(o)?`<b>${campName(o)} is yours:</b> a full ${FAC[o.fac].arch} town. Build it up and recruit there like your home.`:`<b>${campName(o)} captured:</b> +${fmt(campIncome(o))} gold a day, and ${FAC[o.fac].arch} recruits there each week.`);
  if(won&&rv&&S.town.taken&&S.town.taken.id===rv.id)extras.push(`<b>${esc(S.town.name)} is free again.</b>`);
  const body=`<p>${won?`The field is yours. ${h.name} gains ${fmt(xp)} experience.`:`${h.name}'s army is broken, and ${h.name} is lost.${S.heroes.length>1?' Your other heroes fight on.':''}`}</p>${extras.map(x=>`<p>${x}</p>`).join('')}
   <div class="casualties"><div><div class="label">Your losses</div><ul>${merge(lost(0))}</ul></div><div><div class="label">Enemy losses</div><ul>${merge(lost(1))}</ul></div></div>`;
  await showModal({title:won?'Victory':'Defeat',body,buttons:[{label:'Continue',value:1,primary:true}]});
  if(won){
    const army=[];for(const s of bt.stacks.filter(s=>s.side===0&&s.alive).sort((a,b)=>a.slot-b.slot)){if(army.length<7)army.push({k:s.k,n:s.n});else{const ex=army.find(a=>a.k===s.k);if(ex)ex.n+=s.n;}}
    HERO().army=army;if(thralls){if(!addToArmy('skeleton',thralls)){const g=S.town.garrison.find(x=>x.k==='skeleton');if(g)g.n+=thralls;else S.town.garrison.push({k:'skeleton',n:thralls});}}
    if(plunder)S.res.gold+=plunder;
    if(o.type==='spire'){o.owned=ME();o.ownerName=h.name;o.garrison=[];}
    if(o.type==='camp')freedKeeper=captureCamp(o,h);
    if(rv&&S.town.taken&&S.town.taken.id===rv.id)delete S.town.taken;
    if(rv){const rl=rv.relics.splice(0);S.rivals=S.rivals.filter(r=>r!==rv);if(rl.length)h.relics.push(...rl);
      if(rv.human){const q=S.players[rv.owner];q.heroes=q.heroes.filter(x=>x!==rv);if(!q.heroes.length)q.out=true;}}
    if(!S.players&&S.mode==='conquest'&&!S.rivals.length)S.pendingWin=true;
    if(S.players&&S.players.filter((q,j)=>!q.out&&(j===S.pi||q.heroes.length)).length===1)S.pendingWin=true;
  }else{
    const surv=[];for(const s of bt.stacks.filter(s=>s.side===1&&s.alive)){const ex=surv.find(a=>a.k===s.k);if(ex)ex.n+=s.n;else surv.push({k:s.k,n:s.n});}
    if(rv){rv.army=surv;rv.relics.push(...h.relics);}
    else if(o.type==='spire'||o.type==='camp')o.garrison=surv;
    else{const n=surv.reduce((a,x)=>a+x.n,0);if(n)o.n=n;if(h.relics.length)S.objs.push({type:'drop',rs:[...h.relics],x:h.x,y:h.y,id:S.uid++});}
    h.relics=[];S.heroes.splice(S.cur,1);S.cur=0;
  }
  const res=bt.resolve;$('#battle').hidden=true;bt=null;$('#btCard').innerHTML='';
  if(won){await addXP(xp);if(freedKeeper)await keeperJoins(freedKeeper);renderUI();save();res(true);}
  else if(!S.heroes.length){res(false);if(S.players)await eliminated();else await defeat('Your last hero has fallen.');}
  else{heroDraw.x=HERO().x;heroDraw.y=HERO().y;path=null;centerOn(HERO().x,HERO().y,true);renderUI();save();res(false);}
}
/* the commanding hero stands beside the field; click them to open the spellbook */
function drawBattleHero(c,h,col,x,y,flip,canAct){
  const sc=Math.max(1.5,Math.min(3,BL.side/40)),now=performance.now();
  /* v35: stand the hero at the top of the side column with the whole figure in view (never cut off at the head) */
  {const kk=Math.min(BL.side*0.95/96,BL.h*0.32/128);y=Math.round(10+124*kk-15*sc);}
  c.save();c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x,y+30*sc/2,BL.side*0.38,8,0,0,7);c.fill();
  c.strokeStyle=col;c.lineWidth=2;c.stroke();
  {const bf=h.fac||(HBY[h.id]&&HBY[h.id].fac),im=bf&&tintedPacked(`battle/heroes/${bf}.png`,col,'h');
   if(im){const k=Math.min(BL.side*0.95/96,BL.h*0.32/128);c.translate(x,y+15*sc);if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;c.drawImage(im,-48*k,-124*k,96*k,128*k);c.restore();}
   else{const f0=h.face;h.face=flip?'w':'e';c.translate(x-TS/2*sc,y-TS/2*sc-6*sc);c.scale(sc,sc);drawHero(c,0,0,h,col);h.face=f0;c.restore();}}
  c.font=`800 ${Math.max(11,BL.side*0.13)}px "Alegreya SC",Georgia,serif`;c.textAlign='center';c.textBaseline='top';c.fillStyle='#f2d382';c.strokeStyle='#120f0b';c.lineWidth=3;
  c.strokeText(h.name,x,y+20*sc);c.fillText(h.name,x,y+20*sc);
  if(!flip){const ok=canAct&&h.book&&!bt.spellCast&&usableSpells().length;
    c.globalAlpha=h.book?(ok?0.75+0.25*Math.sin(now/250):0.6):0.25;drawStat(c,'lore',x,y+20*sc+44,9+(ok?2:0));c.globalAlpha=1;
    c.font=`700 ${Math.max(10,BL.side*0.11)}px "Alegreya SC",Georgia,serif`;c.fillStyle='#a9b8ef';c.fillText(h.book?`${h.mana} mana`:'no spellbook',x,y+20*sc+16);
    BL.heroRect={x:0,y:0,w:BL.side,h:y+20*sc+64};}
}
function drawBattle(){
  if(!bt)return;
  const c=bctx;c.setTransform(BL.dpr,0,0,BL.dpr,0,0);
  if(bgCv)c.drawImage(bgCv,0,0,BL.w,BL.h);
  const s=bt.active,mineTurn=s&&s.side===0&&bt.pending&&!bt.auto,team=teamCol();
  const rm=mineTurn&&!bt.targeting?reach(s):null;
  const HXI=k=>{const a=artImg(`battle/hex/${k}.png`);return a.ok?a.img:null;},hexImg=(k,col,r,al=1)=>{const im=HXI(k);if(!im)return false;const p=hc(col,r),w=Math.sqrt(3)*BL.s,h=2*BL.s;c.save();c.globalAlpha=al;c.imageSmoothingEnabled=false;c.drawImage(im,p.x-w/2,p.y-h/2,w,h);c.restore();return true;};
  for(let r=0;r<BR;r++)for(let col=0;col<BC;col++){const p=hc(col,r);hexPath(c,p.x,p.y,BL.s*0.97);
    if(rm&&rm.has(hk(col,r))&&!hexImg('move',col,r,0.75)){c.fillStyle=team+'33';c.fill();}
    c.strokeStyle='rgba(255,250,220,.10)';c.lineWidth=1;c.stroke();}
  if(s&&s.side===0&&mineTurn)hexImg('selected',s.c,s.r);
  let attackFrom=null,hovT=null;
  if(mineTurn&&bt.hover){const{c:hc_,r:hr}=bt.hover;const t=stackAt(hc_,hr);
    if(bt.targeting){if(t&&((SP[bt.targeting].target==='enemy')===(t.side===1))){hovT=t;}}
    else if(t&&t.side===1){hovT=t;if(!canShoot(s)){attackFrom=bestAttackHex(s,t,rm,bt.mouse.x,bt.mouse.y);}}
    else if(rm&&rm.has(hk(hc_,hr))){if(!hexImg('hover',hc_,hr)){const p=hc(hc_,hr);hexPath(c,p.x,p.y,BL.s*0.97);c.fillStyle=team+'66';c.fill();}}
    else if(!t&&!(rm&&rm.has(hk(hc_,hr))))hexImg('blocked',hc_,hr,0.6);
    if(hovT&&!bt.targeting)hexImg(canShoot(s)?'shoot':'attack',hovT.c,hovT.r);
  }
  if(attackFrom){const p=hc(attackFrom.c,attackFrom.r);if(!hexImg('hover',attackFrom.c,attackFrom.r)){hexPath(c,p.x,p.y,BL.s*0.97);c.fillStyle='rgba(242,211,130,.35)';c.fill();}
    const q=hc(hovT.c,hovT.r);c.strokeStyle='#f2d382';c.lineWidth=3;c.beginPath();c.moveTo(p.x,p.y);c.lineTo(p.x+(q.x-p.x)*0.6,p.y+(q.y-p.y)*0.6);c.stroke();}
  if(bt.wall&&bt.wall.size){for(const k of bt.wall){const p=hc(k%BC,Math.floor(k/BC)),w=BL.s*1.7,h=BL.s*1.5;c.fillStyle='#8f8a7c';c.strokeStyle='#2b2620';c.lineWidth=2;c.fillRect(p.x-w/2,p.y-h*0.75,w,h);c.strokeRect(p.x-w/2,p.y-h*0.75,w,h);
      c.fillStyle='#a8a291';for(let i=0;i<3;i++){c.fillRect(p.x-w/2+i*w/3+2,p.y-h*0.75-BL.s*0.3,w/3-4,BL.s*0.3);c.strokeRect(p.x-w/2+i*w/3+2,p.y-h*0.75-BL.s*0.3,w/3-4,BL.s*0.3);}
      c.strokeStyle='rgba(43,38,32,.5)';c.lineWidth=1;for(let y=p.y-h*0.75+BL.s*0.35;y<p.y+h*0.25;y+=BL.s*0.35){c.beginPath();c.moveTo(p.x-w/2,y);c.lineTo(p.x+w/2,y);c.stroke();}}
    if(bt.siege>=3)for(const r of[1,BR-2]){const p=hc(BC-2,r);c.fillStyle='#b8b09c';c.strokeStyle='#2b2620';c.lineWidth=2;c.fillRect(p.x-BL.s*0.6,p.y-BL.s*2.2,BL.s*1.2,BL.s*2.4);c.strokeRect(p.x-BL.s*0.6,p.y-BL.s*2.2,BL.s*1.2,BL.s*2.4);c.fillStyle='#7a2a1e';c.beginPath();c.moveTo(p.x-BL.s*0.75,p.y-BL.s*2.2);c.lineTo(p.x,p.y-BL.s*3);c.lineTo(p.x+BL.s*0.75,p.y-BL.s*2.2);c.closePath();c.fill();c.stroke();}}
  for(const k of bt.obst){if(bt.wall&&bt.wall.has(k))continue;const p=hc(k%BC,Math.floor(k/BC));if(!bt.rocks[k])bt.rocks[k]={a:Math.random()*6,s:0.6+Math.random()*0.3,img:pick(['split_boulder','split_boulder','basalt_columns','basalt_columns','leaning_monolith','split_boulder','stone_arch'])};const rk=bt.rocks[k],s2=BL.s*rk.s;
    {const a=artImg(`terrain/battle/${rk.img}_battle.png`);if(a.ok){const im=a.img,sc2=BL.s*(rk.img==='stone_arch'?2.1:1.9)/Math.max(96,im.width);c.save();c.imageSmoothingEnabled=false;
      c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(p.x,p.y+BL.s*0.42,BL.s*0.9,BL.s*0.3,0,0,7);c.fill();
      c.drawImage(im,Math.round(p.x-im.width*sc2/2),Math.round(p.y+BL.s*0.5-im.height*sc2),Math.round(im.width*sc2),Math.round(im.height*sc2));c.restore();continue;}}
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(p.x,p.y+s2*0.5,s2,s2*0.35,0,0,7);c.fill();
    c.fillStyle='#6f6b60';c.strokeStyle='#26241f';c.lineWidth=1.2;c.beginPath();for(let j=0;j<7;j++){const a=rk.a+j*0.9,rr=s2*(0.6+0.25*Math.sin(j*2.1+rk.a));c.lineTo(p.x+Math.cos(a)*rr,p.y+Math.sin(a)*rr*0.75);}c.closePath();c.fill();c.stroke();}
  const now=performance.now();
  const list=bt.stacks.filter(x=>x.alive).map(x=>({x,p:x.anim||hc(x.c,x.r)})).sort((a,b)=>a.p.y-b.p.y);
  drawBattleHero(c,HERO(),team,BL.side/2,BL.h*0.5,false,mineTurn);
  if(bt.enemyHero)drawBattleHero(c,bt.enemyHero,FAC[bt.enemyHero.fac].col,BL.w-BL.side/2,BL.h*0.5,true,false);
  const foeCol=bt.enemyHero?FAC[bt.enemyHero.fac].col:null,spSc=Math.max(1,Math.round(BL.s*1.8/64*2)/2);
  const BIGK=new Set(['ogre','troll','drake']);
  const drawSprite=(sheet,k,row,fr,px,py,flip,alpha=1)=>{c.save();c.globalAlpha=alpha;c.imageSmoothingEnabled=false;c.translate(Math.round(px),Math.round(py));if(flip)c.scale(-1,1);
    {const u=U[k],b=u&&u.up?u.base:k,w=sheet.strip?sheet.strip.width/6*64/sheet.strip.height:sheet.width/4;if(w>64||(u&&u.amber)||BIGK.has(b))c.scale(1.4,1.4);}
    if(sheet.strip){const im=sheet.strip,fw=im.width/6,fh=im.height,lf=64/fh,sc=spSc*lf;c.imageSmoothingEnabled=sc<1;c.imageSmoothingQuality='high';c.drawImage(stripFrame(im,stripPose(row,fr),fw,fh),0,0,fw,fh,Math.round(-fw/2*sc),Math.round(-60*spSc),Math.round(fw*sc),Math.round(fh*sc));c.restore();return;}
    const fw=sheet.width/4;if(row===3&&ENEMY_ART[k])fr=0;
    c.drawImage(stripFrame(sheet,row*4+fr,fw,64,4),0,0,fw,64,Math.round(-fw/2*spSc),Math.round(-60*spSc),fw*spSc,64*spSc);c.restore();};
  for(const cp of bt.corpses){const sh=unitSheet(cp.k,cp.side?foeCol:team);if(!sh)continue;const t=now-cp.t0,p=hc(cp.c,cp.r);if(t>2600)continue;
    drawSprite(sh,cp.k,4,Math.min(3,Math.floor(t/150)),p.x,p.y+BL.s*0.4,cp.side===1,t<1600?1:1-(t-1600)/1000);}
  for(const{x,p}of list){const r=BL.s*0.72;const sheet=unitSheet(x.k,x.side?foeCol:team);
    if(sheet){const fy=p.y+r*0.55;
      c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(p.x,fy,r*0.9,r*0.3,0,0,7);c.fill();
      c.lineWidth=x===s?3:2;c.strokeStyle=x===s?`rgba(242,211,130,${0.7+0.3*Math.sin(now/180)})`:(x.side?'#c45a43':team);c.beginPath();c.ellipse(p.x,fy,r*0.95,r*0.33,0,0,7);c.stroke();
      if(x===hovT){c.strokeStyle='#fff3c9';c.lineWidth=2;c.beginPath();c.ellipse(p.x,fy,r*1.12,r*0.42,0,0,7);c.stroke();}
      let row=0,fr=Math.floor(now/180)%4;
      if(x.act&&now-x.act.t0<x.act.dur){row=x.act.row;fr=Math.min(x.act.n-1,Math.floor((now-x.act.t0)/(x.act.dur/x.act.n)));}
      else if(x.anim){row=1;fr=Math.floor(now/110)%4;}
      drawSprite(sheet,x.k,row,fr,p.x,fy,x.side===1);
      if(x.u.up)drawCrown(c,p.x,fy-60*spSc-4,8);
    }else{
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(p.x,p.y+r*0.8,r,r*0.33,0,0,7);c.fill();
    c.fillStyle='#1b211e';c.beginPath();c.arc(p.x,p.y,r,0,7);c.fill();
    c.lineWidth=x===s?3:2.2;c.strokeStyle=x===s?`rgba(242,211,130,${0.7+0.3*Math.sin(now/180)})`:(x.side?'#c45a43':team);c.stroke();
    if(x===hovT){c.strokeStyle='#fff3c9';c.lineWidth=2;c.beginPath();c.arc(p.x,p.y,r+4,0,7);c.stroke();}
    c.save();if(x.side===1){c.translate(p.x,p.y);c.scale(-1,1);c.translate(-p.x,-p.y);}drawUnit(c,x.k,p.x,p.y,r*0.8);c.restore();}
    const txt=String(x.n);c.font=`800 ${Math.max(10,BL.s*0.36)}px "Alegreya SC",Georgia,serif`;const tw=c.measureText(txt).width+8,bh=Math.max(13,BL.s*0.44);
    c.fillStyle=x.side?'#7a2e20':team;c.fillRect(p.x+r*0.25,p.y+r*0.45,tw,bh);c.fillStyle='#fff';c.textAlign='left';c.textBaseline='middle';c.fillText(txt,p.x+r*0.25+4,p.y+r*0.45+bh/2+1);
    const icons=[];if(x.defending)icons.push('def');if(x.rooted>0)icons.push('move');if(x.skip>0)icons.push('lore');if(x.stood&&S.fac==='rangers'&&mine0(x))icons.push('def');
    icons.forEach((k,i)=>{drawStat(c,k,p.x-r*0.85+i*12,p.y-r*0.8,6);});
  }
  for(const f of bt.fx){
    if(f.type==='shot'&&f.pk){const pa=artImg(`projectiles/${f.pk}.png`);if(pa.ok){const fr=Math.floor((now-f.t0)/90)%3,z=Math.max(2,Math.round(BL.s/16));c.save();c.translate(f.x,f.y);c.rotate(f.pk==='rock'?(now-f.t0)/80:f.ang);c.imageSmoothingEnabled=false;c.drawImage(pa.img,fr*16,0,16,16,-8*z,-8*z,16*z,16*z);c.restore();continue;}}
    if(f.type==='shot'){c.save();c.translate(f.x,f.y);c.rotate(f.ang);c.fillStyle=f.col;c.strokeStyle=f.col;c.lineWidth=2;
      if(f.col!=='#efe2bb'){c.beginPath();c.arc(0,0,5,0,7);c.fill();}else{c.beginPath();c.moveTo(-10,0);c.lineTo(8,0);c.stroke();c.beginPath();c.moveTo(10,0);c.lineTo(4,-3);c.lineTo(4,3);c.closePath();c.fill();}c.restore();}
    if(f.type==='burst'&&f.sp){const sa=artImg(`battle/spells/${f.sp}.png`);if(sa.ok){const im=sa.img,fw=im.width/6,fh=im.height,fr=Math.min(5,Math.floor(f.t*6)),z=Math.max(1.5,BL.s*2/64);c.save();c.imageSmoothingEnabled=false;c.drawImage(im,fr*fw,0,fw,fh,Math.round(f.x-fw*z/2),Math.round(f.y-fh*z/2-BL.s*0.2),fw*z,fh*z);c.restore();continue;}}
    if(f.type==='burst'){c.strokeStyle=f.col;c.globalAlpha=1-f.t;c.lineWidth=3;c.beginPath();c.arc(f.x,f.y,BL.s*(0.4+f.t*0.9),0,7);c.stroke();c.globalAlpha=1;}
  }
  bt.floats=bt.floats.filter(f=>now-f.t0<1100);
  for(const f of bt.floats){const t=(now-f.t0)/1100;c.globalAlpha=1-t*t;c.font=`800 ${Math.max(13,BL.s*0.45)}px "Alegreya SC",Georgia,serif`;c.textAlign='center';c.lineWidth=3;c.strokeStyle='#120f0b';c.strokeText(f.text,f.x,f.y-t*BL.s);c.fillStyle=f.col;c.fillText(f.text,f.x,f.y-t*BL.s);c.globalAlpha=1;}
}
function battleHoverStatus(){
  if(!bt)return;
  const t=bt.hover?stackAt(bt.hover.c,bt.hover.r):null;
  $('#btCard').innerHTML=t?stackCard(t):(bt.active?stackCard(bt.active):'');
  if(!bt.pending||bt.auto)return;const s=bt.active;if(!s||s.side!==0)return;
  if(!t){updateBattleUI();return;}
  if(bt.targeting){setStatus(`Cast ${SP[bt.targeting].name} on ${t.n} ${t.u.pl}.`);return;}
  if(t.side===1){
    const shoot=canShoot(s);const rm=reach(s),from=shoot?null:bestAttackHex(s,t,rm,bt.mouse.x,bt.mouse.y);
    if(!shoot&&!from){setStatus(`${t.n} ${t.u.pl} are out of reach this turn.`);return;}
    const mv=from&&!(from.c===s.c&&from.r===s.r)?rm.get(hk(from.c,from.r)).d:0;
    const[lo,hi]=dmgRange(s,t,{half:!shoot&&!!s.u.shots,charge:s.u.charge?mv:0,ranged:shoot});
    let back='';
    if(!shoot&&t.retLeft>0&&!s.u.noRetal){const survivors=t.n-killsEst(t,Math.round((lo+hi)/2));if(survivors>0){const tmp={...t,n:survivors};const[rl,rh]=dmgRange(tmp,s,{half:!!t.u.shots});back=` They strike back: about ${Math.round((rl+rh)/2)}.`;}}
    setStatus(`${sc(shoot?'shots':'atk',shoot?'Shoot':'Attack')} ${t.n} ${t.u.pl}: <b>${lo}–${hi}</b> damage, ${killsEst(t,lo)}–${killsEst(t,hi)} killed.${back}`);
  }else updateBattleUI();
}
btCv.addEventListener('pointermove',e=>{if(!bt)return;const r=btCv.getBoundingClientRect();bt.mouse={x:e.clientX-r.left,y:e.clientY-r.top};
  {const hr=BL.heroRect,on=hr&&bt.mouse.x<hr.x+hr.w&&bt.mouse.y>hr.y&&bt.mouse.y<hr.y+hr.h;btCv.style.cursor=on?'pointer':'default';if(on&&bt.pending){setStatus(HERO().book?(bt.spellCast?`${HERO().name} has already cast a spell this round.`:`Click ${HERO().name} to open the spellbook.`):`${HERO().name} has no spellbook. Buy one at the Lantern Library in town.`);bt.hover=null;$('#btCard').innerHTML='';return;}}bt.hover=hexAt(bt.mouse.x,bt.mouse.y);battleHoverStatus();});
btCv.addEventListener('pointerleave',()=>{if(bt){bt.hover=null;battleHoverStatus();}});
btCv.addEventListener('pointerup',e=>{
  if(!bt||!bt.pending||bt.auto||modalOpen)return;const r=btCv.getBoundingClientRect();const x=e.clientX-r.left,y=e.clientY-r.top;bt.mouse={x,y};
  {const hr=BL.heroRect;if(hr&&x<hr.x+hr.w&&y>hr.y&&y<hr.y+hr.h){openSpellbook();return;}}const h=hexAt(x,y);if(!h)return;bt.hover=h;
  if(bt.targeting){const t=stackAt(h.c,h.r),sp=SP[bt.targeting];if(t&&((sp.target==='enemy')===(t.side===1))){const k=bt.targeting;bt.targeting=null;bt.pending({type:'spell',spell:k,target:t});}return;}
  bt.pending({type:'click',c:h.c,r:h.r,x,y});
});
btCv.addEventListener('contextmenu',e=>{if(bt&&bt.targeting){e.preventDefault();bt.targeting=null;updateBattleUI();}});
$('#bWait').onclick=()=>bt&&bt.pending&&bt.pending({type:'wait'});
$('#bDefend').onclick=()=>bt&&bt.pending&&bt.pending({type:'defend'});
$('#bSpell').onclick=openSpellbook;
$('#bAuto').onclick=()=>{if(!bt)return;bt.auto=!bt.auto;if(bt.auto&&bt.pending)bt.pending({type:'auto'});updateBattleUI();};
