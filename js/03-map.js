'use strict';
/* ================= MAP ================= */
let W=34,H=26;const TS=44;
const DIFF={
  easy:{name:'Easy',res:{gold:10000,timber:25,ore:25,amber:8,gems:6,moonwater:6},rv:0.75,mon:0.8,agg:0.7,desc:'10,000 gold and plenty of materials. Rivals start smaller and grow slowly; wild creatures are fewer.'},
  normal:{name:'Normal',res:{gold:5000,timber:15,ore:15,amber:4,gems:2,moonwater:2},rv:1,mon:1,agg:1,desc:'5,000 gold. Rivals are your match.'},
  hard:{name:'Hard',res:{gold:2500,timber:8,ore:8,amber:2,gems:0,moonwater:0},rv:1.3,mon:1.25,agg:1.3,desc:'2,500 gold and scarce materials. Rivals start bigger and grow faster; wild creatures are 25% stronger.'},
  expert:{name:'Expert',res:{gold:1500,timber:5,ore:5,amber:0,gems:0,moonwater:0},rv:1.6,mon:1.5,agg:1.6,desc:'1,500 gold and almost no materials. Rivals start far bigger and grow fastest; wild creatures and guards are 50% stronger.'}};
const aggMul=()=>DIFF[(S&&S.diff)||'normal'].agg||1;
const monMul=()=>DIFF[(S&&S.diff)||'normal'].mon||1;
const rvMul=()=>DIFF[(S&&S.diff)||'normal'].rv;
/* sizes sit below the classic genre's 36/72/108/144 squares because our tiles are shown larger; free towns are the neutral towns per map */
const MAP_SIZES={small:{W:60,H:46,rivals:2,limit:140,label:'Small',majors:1,outposts:3},medium:{W:74,H:57,rivals:3,limit:168,label:'Medium',majors:2,outposts:4},large:{W:92,H:70,rivals:4,limit:196,label:'Large',majors:3,outposts:5},xl:{W:110,H:84,rivals:5,limit:224,label:'Extra large',majors:4,outposts:6}};
const MAP_TYPES={
  wheel:{name:'Wheel & Spoke',desc:'Every hero starts at the end of a spoke. Spoke roads run in to a walled hub where the Glass Lair waits, and a ring road links the homes. Pirates live on their own island.'},
  ridges:{name:'Twin Ridges',desc:'Two crag ridges split the land into three bands. Push through one guarded pass at a time toward the Glass Lair in the far corner. Pirates live on their own island.'},
  under:{name:'Underworld',desc:'Daylight above, a dark underworld below, solid bedrock between. Portals are the only way through. Necromancers rule below, and the Glass Lair waits down there.'},
  rivers:{name:'Four Rivers',desc:'Four rivers meet around an island holding the Glass Lair. Every banner has its own quarter. Cross at bridges, some guarded, and hold the bridgeheads with spires.'}};
const T={GRASS:0,DIRT:1,ROAD:2,HEATH:3,BOG:4,FOREST:5,CRAG:6,LAKE:7};
const TCOST=[100,100,70,130,175,0,0,0];
const TNAME=['Meadow','Dirt track','Old road','Heath','Bog','Deep forest','Crags','Lake'];
const passableT=t=>t<5;
let S=null;
const idx=(x,y)=>y*W+x;
const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
const tileAt=(x,y)=>S.tiles[idx(x,y)];
const objAt=(x,y)=>S.objs.find(o=>o.x===x&&o.y===y);
let FOOT=new Set();
let PORT=new Map();
function rebuildPortals(objs){PORT=new Map();for(const o of objs)if(o.type==='portal')PORT.set(idx(o.x,o.y),idx(o.tx,o.ty));}
function rebuildFoot(){rebuildPortals(S.objs);FOOT=new Set();for(const o of S.objs)if(o.type==='town')for(let dy=-2;dy<=0;dy++)for(let dx=-1;dx<=1;dx++)if(dx||dy)FOOT.add(idx(o.x+dx,o.y+dy));}
const townFoot=(x,y)=>FOOT.has(idx(x,y));
/* whose town is this, and what does it look like */
function townData(o){if(!S.players||o.owner===undefined||o.owner===S.pi)return{fac:S.fac,town:S.town,mine:true};const q=S.players[o.owner];return{fac:q.fac,town:q.town,mine:false};}
const ME=()=>S.players?'p'+S.pi:true;
function ownerCol(v){if(v===true||v===ME())return teamCol();if(typeof v==='string'&&v[0]==='p'&&S.players)return FAC[S.players[+v.slice(1)].fac].col;return FAC[v]?FAC[v].col:'#888';}
const HERO=()=>S.heroes[S.cur];
const H_=()=>HBY[HERO().id];
const fx=()=>S&&S.heroes&&S.heroes[S.cur]?(HBY[HERO().id].fx||{}):{};
const hasSk=k=>!!(S&&S.heroes&&S.heroes[S.cur]&&HERO().skills.includes(k));
const rivalAt=(x,y)=>S.rivals.find(r=>r.x===x&&r.y===y);
const heroIdxAt=(x,y)=>S.heroes.findIndex(h=>h.x===x&&h.y===y);
function carry(h,k){let v=0;for(const r of h.relics||[])v+=RELICS[r].carry[k]||0;return v;}
function gear(h,k){let v=0;for(const it of h.items||[])v+=ITEMS[it]?(ITEMS[it].fx[k]||0):0;return v;}
const hst=(h,k)=>h[k]+carry(h,k)+gear(h,k);
/* equipment: one item per slot (two rings, three pack items); anything else goes in the backpack and does nothing until worn */
const SLOT_LIM={'Head':1,'Neck':1,'Cloak':1,'Body':1,'Main hand':1,'Off hand':1,'Ring':2,'Feet':1,'Pack':3};
const SLOT_ORDER=['Head','Neck','Cloak','Main hand','Body','Off hand','Ring','Feet','Pack'];
const slotFree=(h,sl)=>(h.items||[]).filter(k=>ITEMS[k]&&ITEMS[k].slot===sl).length<(SLOT_LIM[sl]||1);
function giveItem(h,it){h.items=h.items||[];h.pack=h.pack||[];const sl=ITEMS[it].slot;if(slotFree(h,sl)){h.items.push(it);return true;}h.pack.push(it);return false;}
const delivered=i=>S.delivered.includes(i);

function makeNoise(g,scale){
  const gw=Math.ceil(W/scale)+2,gh=Math.ceil(H/scale)+2,v=[];
  for(let i=0;i<gw*gh;i++)v.push(g());
  const sm=t=>t*t*(3-2*t);
  return (x,y)=>{const fx_=x/scale,fy=y/scale,x0=Math.floor(fx_),y0=Math.floor(fy),tx=sm(fx_-x0),ty=sm(fy-y0);
    const a=v[y0*gw+x0],b=v[y0*gw+x0+1],c=v[(y0+1)*gw+x0],d=v[(y0+1)*gw+x0+1];
    return a+(b-a)*tx+(c-a)*ty+(a-b-c+d)*tx*ty;};
}
function astar(sx,sy,tx,ty,cost){
  const N=W*H,g=new Float64Array(N).fill(Infinity),prev=new Int32Array(N).fill(-1),closed=new Uint8Array(N);
  const start=idx(sx,sy),goal=idx(tx,ty);g[start]=0;
  const oct=(ax,ay,bx,by)=>{const dx=Math.abs(ax-bx),dy=Math.abs(ay-by);return Math.max(dx,dy)+0.41*Math.min(dx,dy);};
  const pl=[];for(const[a,b]of PORT)pl.push([a%W,(a/W)|0,oct(b%W,(b/W)|0,tx,ty)]);
  // with portals, the guess is the shorter of walking straight there or walking to a portal and on from its far end
  const h=i=>{const x=i%W,y=(i/W)|0;let d=oct(x,y,tx,ty);for(const[ax,ay,bd]of pl){const v=oct(x,y,ax,ay)+bd;if(v<d)d=v;}return d*50;};
  // binary heap of [f, node]; stale entries are skipped when popped
  const hf=[],hn=[];const push=(f,n)=>{let i=hf.length;hf.push(f);hn.push(n);while(i>0){const p=(i-1)>>1;if(hf[p]<=f)break;hf[i]=hf[p];hn[i]=hn[p];i=p;}hf[i]=f;hn[i]=n;};
  const pop=()=>{const n=hn[0],lf=hf.pop(),ln=hn.pop();if(hf.length){let i=0;const L=hf.length;while(true){let c=2*i+1;if(c>=L)break;if(c+1<L&&hf[c+1]<hf[c])c++;if(hf[c]>=lf)break;hf[i]=hf[c];hn[i]=hn[c];i=c;}hf[i]=lf;hn[i]=ln;}return n;};
  const open={push:n=>push(g[n]+h(n),n)};open.push(start);
  while(hf.length){
    const cur=pop();
    if(cur===goal)break;if(closed[cur])continue;closed[cur]=1;
    const cx=cur%W,cy=(cur/W)|0;
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;const nx=cx+dx,ny=cy+dy;if(!inb(nx,ny))continue;const ni=idx(nx,ny);if(closed[ni])continue;
      let c=cost(nx,ny,ni===goal,cx,cy);if(!isFinite(c))continue;if(dx&&dy){if(!isFinite(cost(cx+dx,cy,false,cx,cy))||!isFinite(cost(cx,cy+dy,false,cx,cy)))continue;c*=1.414;}
      const ng=g[cur]+c;if(ng<g[ni]){g[ni]=ng;prev[ni]=cur;open.push(ni);}
    }
    const pj=PORT.get(cur);
    if(pj!==undefined&&!closed[pj]){const c=cost(pj%W,(pj/W)|0,pj===goal,cx,cy);if(isFinite(c)){const ng=g[cur]+c;if(ng<g[pj]){g[pj]=ng;prev[pj]=cur;open.push(pj);}}}
  }
  if(start===goal||prev[goal]<0)return null;
  const path=[];for(let i=goal;i!==start;i=prev[i])path.push({x:i%W,y:(i/W)|0});
  return path.reverse();
}

function genRidges(seed,opt){
  const g=mulberry32(seed);const saveR=R;R=g;const KS=W/34,K2=KS*KS;
  const n1=makeNoise(g,6),n2=makeNoise(g,3),nf=makeNoise(g,4),nmo=makeNoise(g,5);
  const tiles=new Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const e=0.65*n1(x,y)+0.35*n2(x,y),f=nf(x,y),m=nmo(x,y);let t=T.GRASS;
    if(e<0.3+BIO.lake)t=T.LAKE;else if(e>0.7-BIO.crag)t=T.CRAG;else if(f>0.66-BIO.forest)t=T.FOREST;else if(m<0.3+BIO.bog)t=T.BOG;else if(m>0.68-BIO.heath)t=T.HEATH;
    if(x===0||y===0||x===W-1||y===H-1)t=g()<0.5?T.CRAG:T.FOREST;
    tiles[idx(x,y)]=t;
  }
  const town={x:5,y:6},lair={x:W-5,y:H-5};
  for(const p of[town,lair])for(let dy=-3;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const x=p.x+dx,y=p.y+dy;if(x>0&&y>0&&x<W-1&&y<H-1)tiles[idx(x,y)]=T.GRASS;}
  const carveCost=(x,y)=>(x===0||y===0||x===W-1||y===H-1)?Infinity:(passableT(tiles[idx(x,y)])?TCOST[tiles[idx(x,y)]]:420);
  const mid={x:ri(Math.round(W*0.38),Math.round(W*0.59)),y:ri(Math.round(H*0.38),Math.round(H*0.58))};
  const road=[...(astar(town.x,town.y+1,mid.x,mid.y,carveCost)||[]),...(astar(mid.x,mid.y,lair.x,lair.y,carveCost)||[])];
  for(const p of road)tiles[idx(p.x,p.y)]=T.ROAD;
  tiles[idx(town.x,town.y+1)]=T.ROAD;
  // ridges of crags cross the map; the road passes through one guarded gap in each
  const ridge=new Set(),gaps=[];
  {const dx0=lair.x-town.x,dy0=lair.y-town.y,L2=dx0*dx0+dy0*dy0,l0=Math.sqrt(L2);
  const tOf=(x,y)=>((x-town.x)*dx0+(y-town.y)*dy0)/L2;
  const rd=[{x:town.x,y:town.y+1},...road],roadSet=new Set(rd.map(p=>idx(p.x,p.y))),RT=[0.4,0.7];
  for(const tr of RT)for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    if(Math.abs(tOf(x,y)-tr)*l0>1.05)continue;if(Math.hypot(x-town.x,y-town.y)<4||Math.hypot(x-lair.x,y-lair.y)<4)continue;
    const i=idx(x,y);if(roadSet.has(i)||tiles[i]===T.LAKE)continue;tiles[i]=T.CRAG;ridge.add(i);}
  // keep the road walkable without cutting corners
  for(let i=1;i<rd.length;i++){const a=rd[i-1],b=rd[i];if(a.x!==b.x&&a.y!==b.y){const c1=idx(b.x,a.y),c2=idx(a.x,b.y);
    if(!passableT(tiles[c1])&&!passableT(tiles[c2])){const pc=ridge.has(c1)&&!ridge.has(c2)?c2:c1;tiles[pc]=T.ROAD;ridge.delete(pc);}}}
  // put each guard on the road tile that really seals its ridge
  const ok=(x,y,blk)=>inb(x,y)&&passableT(tiles[idx(x,y)])&&!blk.has(idx(x,y));
  const leaks=(blk,tr)=>{const seen=new Uint8Array(W*H),st=idx(town.x,town.y+1),q=[st];seen[st]=1;
    while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;if(tOf(x,y)>tr+1.6/l0)return true;
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=x+a,ny=y+b;if(!ok(nx,ny,blk))continue;const ni=idx(nx,ny);if(seen[ni])continue;if(a&&b&&(!ok(x+a,y,blk)||!ok(x,y+b,blk)))continue;seen[ni]=1;q.push(ni);}}
    return false;};
  for(const tr of RT){
    const cand=rd.filter(p=>Math.abs(tOf(p.x,p.y)-tr)*l0<=1.05).sort((a,b)=>Math.abs(tOf(a.x,a.y)-tr)-Math.abs(tOf(b.x,b.y)-tr));
    let g=cand.find(p=>!leaks(new Set([idx(p.x,p.y)]),tr));
    if(!g&&cand.length){g=cand[0];const gi=new Set([idx(g.x,g.y)]);
      for(const c of cand.slice(1)){if(!leaks(gi,tr))break;const ci=idx(c.x,c.y),was=tiles[ci];tiles[ci]=T.CRAG;if(!leaks(new Set(),tr)){tiles[ci]=was;}else ridge.add(ci);}}
    if(g)gaps.push({x:g.x,y:g.y,tr});
  }}
  const objs=[],pseudo=[];let uid=1;
  const foot=(x,y)=>Math.abs(x-town.x)<=1&&y>=town.y-2&&y<=town.y;
  const occupied=(x,y)=>objs.some(o=>o.x===x&&o.y===y)||pseudo.some(o=>o.x===x&&o.y===y)||foot(x,y);
  const add=o=>{o.id=uid++;objs.push(o);return o;};
  const dx=lair.x-town.x,dy=lair.y-town.y,len=Math.hypot(dx,dy),px=-dy/len,py=dx/len;
  function spot(t,off,rad=3,minTown=3){
    rad=Math.max(rad,Math.round(rad*KS));const bx=town.x+dx*t+px*off*KS,by=town.y+dy*t+py*off*KS;
    for(let i=0;i<300;i++){
      const x=Math.round(bx+ri(-rad,rad)),y=Math.round(by+ri(-rad,rad));
      if(x<1||y<1||x>W-2||y>H-2)continue;
      if(!passableT(tiles[idx(x,y)])||occupied(x,y))continue;
      if(Math.abs(x-town.x)<minTown&&Math.abs(y-town.y)<minTown+1)continue;
      if(Math.abs(x-lair.x)<2&&Math.abs(y-lair.y)<2)continue;
      if(gaps.some(g=>Math.abs(g.x-x)<=1&&Math.abs(g.y-y)<=1))continue;
      return{x,y};
    }
    return null;
  }
  const neutralFor=neutralAt;
  add({type:'town',x:town.x,y:town.y});
  add({type:'relic',r:6,x:lair.x,y:lair.y,k:'drake',n:3});
  gaps.forEach((g,i)=>add({type:'neutral',x:g.x,y:g.y,guard:true,...(i===0?{k:'troll',n:ri(8,10)}:{k:'troll',n:ri(15,18)})}));
  const nR=opt.rivals.length;for(let i=0;i<nR;i++){const t=0.5+0.4*i/Math.max(1,nR-1),sg=i%2?-1:1;const p=spot(t,sg*11,3)||spot(t,-sg*11,3)||spot(t,sg*7,3)||spot(Math.min(0.95,t+0.05),sg*9,2)||spot(Math.max(0.35,t-0.05),-sg*9,2);if(p)pseudo.push({x:p.x,y:p.y,fac:opt.rivals[i]});}
  const protect=new Set(ridge),isles=[];
  if(opt.fac==='pirates'||opt.fac==='merfolk')isles.push(homeIsle(tiles,opt.fac,town.x,town.y-1,4+Math.round(KS),protect,objs));
  pseudo.forEach(p=>{if(p.fac==='pirates'||p.fac==='merfolk')isles.push(homeIsle(tiles,p.fac,p.x,p.y,3+Math.round(KS),protect,objs));});
  const isleWater=new Set();isles.forEach(il=>il.water.forEach(i=>isleWater.add(i)));
  [[0.22,7],[0.3,-7],[0.5,8],[0.55,-8],[0.62,4],[0.84,-5]].forEach(([t,off],i)=>{const p=spot(t,off,3);if(p){const Rl=RELIC_LIST[i];add({type:'relic',r:i,x:p.x,y:p.y,k:Rl.k,n:ri(Rl.n[0],Rl.n[1])});}});
  for(const [ox,oy] of[[-2,-1],[-1,-2]]){add({type:'neutral',x:lair.x+ox,y:lair.y+oy,k:'troll',n:ri(10,13)});tiles[idx(lair.x+ox,lair.y+oy)]=T.GRASS;}
  const mines=[['saw',0.14,4],['orepit',0.18,-4],['gold',0.42,3],['amber',0.38,-6],['saw',0.6,6],['orepit',0.62,-5],['amber',0.78,5],['gold',0.82,-6]];
  if(KS>1.15)mines.push(...mines.map(([k,t,off])=>[k,Math.min(0.9,t+0.06),-off]));
  for(const [k,t,off] of mines){
    const p=spot(t,off,3);if(!p)continue;add({type:'mine',k,x:p.x,y:p.y,owned:false});
    let guard=null;for(let i=0;i<20&&!guard;i++){const gx=p.x+ri(-1,1),gy=p.y+ri(-1,1);if(inb(gx,gy)&&passableT(tiles[idx(gx,gy)])&&!occupied(gx,gy)&&!(Math.abs(gx-town.x)<3&&Math.abs(gy-town.y)<4))guard={x:gx,y:gy};}
    if(guard&&t>0.15)add({type:'neutral',...guard,...neutralFor(t)});
  }
  for(let i=0;i<Math.round(11*K2*jit());i++){const t=0.12+R()*0.8;const p=spot(t,ri(-9,9),3);if(p)add({type:'neutral',...p,...neutralFor(t)});}
  for(let i=0;i<Math.round(18*K2*jit());i++){const t=0.04+R()*0.95;const p=spot(t,ri(-10,10),3,2);if(!p)continue;const k=pick(['gold','gold','timber','ore','timber','ore','amber']);
    add({type:'pile',k,x:p.x,y:p.y,n:k==='gold'?ri(5,10)*100:k==='amber'?ri(2,4):ri(4,8)});}
  for(let i=0;i<Math.round(6*K2*jit());i++){const p=spot(0.1+R()*0.85,ri(-9,9),3);if(p)add({type:'chest',x:p.x,y:p.y});}
  for(let i=0;i<3;i++){const p=spot(0.2+i*0.25,ri(-8,8),3);if(p)add({type:'stone',x:p.x,y:p.y,stat:pick(['atk','def','pow','lore']),used:false});}
  [['mend',0.3],['swift',0.55],['bark',0.7]].forEach(([s,t])=>{const p=spot(t,ri(-8,8),3);if(p)add({type:'shrine',x:p.x,y:p.y,spell:s});});
  for(const t of[0.35,0.7]){const p=spot(t,ri(-7,7),3);if(p)add({type:'well',x:p.x,y:p.y,day:0});}
  {const p=spot(0.5,0,4);if(p)add({type:'tower',x:p.x,y:p.y});}
  {const p=spot(0.22,ri(-3,3),3);if(p)add({type:'fair',x:p.x,y:p.y});}
  // docks: land tiles touching a lake, one near home and one farther out
  const shore=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(!passableT(tiles[idx(x,y)])||occupied(x,y))continue;let w=0;for(const [a,b] of[[1,0],[-1,0],[0,1],[0,-1]])if(tiles[idx(x+a,y+b)]===T.LAKE)w++;if(w)shore.push({x,y,d:Math.hypot(x-town.x,y-town.y)});}
  shore.sort((a,b)=>a.d-b.d);
  const dk1=shore.find(s=>s.d>4);if(dk1)add({type:'dock',x:dk1.x,y:dk1.y});
  const dk2=shore.find(s=>s.d>14&&(!dk1||Math.hypot(s.x-dk1.x,s.y-dk1.y)>8));if(dk2)add({type:'dock',x:dk2.x,y:dk2.y});
  isles.forEach(il=>isleDocks(tiles,il,W/2,H/2,add,occupied));
  const rivalSpots=pseudo;
  // every rival gets a home camp (a town it builds up) where its hero starts
  pseudo.forEach(p=>{const ex=objs.findIndex(o=>o.x===p.x&&o.y===p.y);if(ex>=0)objs.splice(ex,1);add({type:'camp',x:p.x,y:p.y,fac:p.fac});});
  // make every object reachable on foot from the town gate, without cutting through the ridges
  for(let guard=0;guard<80;guard++){
    const seen=new Uint8Array(W*H),st=idx(town.x,town.y),q=[st];seen[st]=1;
    const okT=(x,y)=>inb(x,y)&&(passableT(tiles[idx(x,y)])||isleWater.has(idx(x,y)))&&!foot(x,y);
    while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=x+a,ny=y+b;if(!okT(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni])continue;if(a&&b&&(!okT(x+a,y)||!okT(x,y+b)))continue;seen[ni]=1;q.push(ni);}}
    const bad=[...objs,...pseudo].find(o=>!seen[idx(o.x,o.y)]);if(!bad)break;
    const tt=((bad.x-town.x)*(lair.x-town.x)+(bad.y-town.y)*(lair.y-town.y))/((lair.x-town.x)**2+(lair.y-town.y)**2);
    const zg=gaps.filter(g=>g.tr<tt).sort((a,b)=>b.tr-a.tr)[0]||{x:town.x,y:town.y+1};
    const edge=(x,y)=>foot(x,y)||x===0||y===0||x===W-1||y===H-1;
    const p=astar(bad.x,bad.y,zg.x,zg.y,(x,y)=>edge(x,y)||ridge.has(idx(x,y))?Infinity:isleWater.has(idx(x,y))?60:carveCost(x,y))||astar(bad.x,bad.y,town.x,town.y+1,(x,y)=>edge(x,y)?Infinity:isleWater.has(idx(x,y))?60:ridge.has(idx(x,y))?6000:carveCost(x,y));
    if(p){let prev={x:bad.x,y:bad.y};for(const c of p){const i=idx(c.x,c.y);if(!passableT(tiles[i])&&!isleWater.has(i)){tiles[i]=T.DIRT;ridge.delete(i);}
      if(prev.x!==c.x&&prev.y!==c.y){const o1=idx(c.x,prev.y),o2=idx(prev.x,c.y);const okO=(o,x2,y2)=>(passableT(tiles[o])||isleWater.has(o))&&!foot(x2,y2);if(!okO(o1,c.x,prev.y)&&!okO(o2,prev.x,c.y)){const oc=foot(c.x,prev.y)||isleWater.has(o1)?o2:o1;if(!isleWater.has(oc)){tiles[oc]=T.DIRT;ridge.delete(oc);}}}
      if(seen[i])break;prev=c;}}
    else if(bad.type&&bad.type!=='relic'){objs.splice(objs.indexOf(bad),1);}
    else{const i=pseudo.indexOf(bad);if(i>=0)pseudo.splice(i,1);else break;}
  }
  R=saveR;
  return{tiles,objs,town,uid,rivalSpots};
}
function neutralAt(t){const r=R();
  if(t<0.3)return r<0.4?{k:'wight',n:ri(10,18)}:r<0.65?{k:'wolf',n:ri(6,10)}:r<0.85?{k:'bandit',n:ri(8,14)}:{k:'skelguard',n:ri(10,16)};
  if(t<0.55)return r<0.35?{k:'wolf',n:ri(12,20)}:r<0.6?{k:'imp',n:ri(10,16)}:r<0.8?{k:'wildboar',n:ri(6,10)}:{k:'bandit',n:ri(14,22)};
  if(t<0.8)return r<0.4?{k:'imp',n:ri(18,28)}:r<0.65?{k:'troll',n:ri(5,9)}:r<0.85?{k:'spider',n:ri(5,8)}:{k:'wildboar',n:ri(12,18)};
  return r<0.35?{k:'troll',n:ri(9,14)}:r<0.6?{k:'ogre',n:ri(4,7)}:r<0.8?{k:'spider',n:ri(9,13)}:{k:'wolf',n:ri(35,50)};
}
/* Pirates live on an island; Merfolk live in a lagoon: a wider ring of water with a channel cut out to the nearest lake (or toward the middle) */
function homeIsle(tiles,fac,cx,cy,rIn,protect,objs){const il=makeIsland(tiles,cx,cy,rIn,protect,objs,fac==='merfolk'?3.2:1.9);if(fac==='merfolk')addWaterway(tiles,il,protect,objs);return il;}
function addWaterway(tiles,il,protect,objs){
  const isLake=i=>tiles[i]===T.LAKE&&!il.water.has(i);let best=null,bd=1e9;
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y);if(!isLake(i))continue;const d=Math.hypot(x-il.cx,y-il.cy);if(d>il.rIn+4&&d<bd&&d<Math.max(W,H)*0.55){bd=d;best={x,y};}}
  const tgt=best||{x:Math.round(W/2),y:Math.round(H/2)};
  let x=il.cx,y=il.cy;for(let k=0;k<W+H;k++){
    const dx=tgt.x-x,dy=tgt.y-y;if(Math.abs(dx)+Math.abs(dy)<=1)break;
    if(Math.abs(dx)>Math.abs(dy)||(Math.abs(dx)===Math.abs(dy)&&R()<0.5))x+=Math.sign(dx);else y+=Math.sign(dy);
    if(x<2||y<2||x>W-3||y>H-3)break;const d=Math.hypot(x-il.cx,y-il.cy);if(d<il.rIn-0.3)continue;
    let stop=false;for(const[a,b]of[[0,0],[1,0],[0,1]]){const i=idx(x+a,y+b);if(protect.has(i)&&!il.water.has(i)){stop=true;break;}if(objs&&objs.some(o=>o.x===x+a&&o.y===y+b))continue;
      if(isLake(i)&&d>il.rIn+2)stop=true;tiles[i]=T.LAKE;il.water.add(i);protect.add(i);}
    if(stop)break;}
}
/* an island: a ring of water around a home, with the inside kept dry */
function makeIsland(tiles,cx,cy,rIn,protect,objs,ring=1.9){const water=new Set();
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const d=Math.hypot(x-cx,y-cy),i=idx(x,y);
    if(d<rIn-0.3){if(tiles[i]===T.LAKE)tiles[i]=T.GRASS;}
    else if(d<rIn+ring){if(objs&&objs.some(o=>o.x===x&&o.y===y))continue;tiles[i]=T.LAKE;water.add(i);protect.add(i);}}
  return{cx,cy,rIn,water};}
function isleDocks(tiles,il,tx,ty,add,occupied){const inner=[],outer=[];
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y);if(!passableT(tiles[i])||occupied(x,y))continue;
    if(![[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>il.water.has(idx(x+a,y+b))))continue;
    (Math.hypot(x-il.cx,y-il.cy)<il.rIn?inner:outer).push({x,y,s:Math.hypot(x-tx,y-ty)});}
  inner.sort((a,b)=>a.s-b.s);if(inner[0])add({type:'dock',x:inner[0].x,y:inner[0].y});
  if(inner[0])outer.sort((a,b)=>Math.hypot(a.x-inner[0].x,a.y-inner[0].y)-Math.hypot(b.x-inner[0].x,b.y-inner[0].y));else outer.sort((a,b)=>a.s-b.s);
  if(outer[0])add({type:'dock',x:outer[0].x,y:outer[0].y});}

/* Wheel & Spoke: homes on a ring, spoke roads to a walled hub holding the Glass Lair */
function genWheel(seed,opt){
  const g=mulberry32(seed);const saveR=R;R=g;const KS=W/34,K2=KS*KS;
  const n1=makeNoise(g,6),n2=makeNoise(g,3),nf=makeNoise(g,4),nmo=makeNoise(g,5);
  const tiles=new Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const e=0.65*n1(x,y)+0.35*n2(x,y),f=nf(x,y),m=nmo(x,y);let t=T.GRASS;
    if(e<0.27+BIO.lake)t=T.LAKE;else if(e>0.72-BIO.crag)t=T.CRAG;else if(f>0.67-BIO.forest)t=T.FOREST;else if(m<0.3+BIO.bog)t=T.BOG;else if(m>0.68-BIO.heath)t=T.HEATH;
    if(x===0||y===0||x===W-1||y===H-1)t=g()<0.5?T.CRAG:T.FOREST;
    tiles[idx(x,y)]=t;}
  const C={x:Math.floor(W/2),y:Math.floor(H/2)},nS=1+opt.rivals.length,rx=W/2-5,ry=H/2-5,hubR=Math.max(4,Math.round(Math.min(W,H)*0.15));
  const homes=[];for(let i=0;i<nS;i++){const a=Math.PI*1.25+i*2*Math.PI/nS;homes.push({x:clamp(Math.round(C.x+Math.cos(a)*rx),4,W-5),y:clamp(Math.round(C.y+Math.sin(a)*ry),4,H-4),fac:i?opt.rivals[i-1]:opt.fac});}
  const town=homes[0];
  const setT=(x,y,t)=>{if(x>0&&y>0&&x<W-1&&y<H-1)tiles[idx(x,y)]=t;};
  for(const h of homes)for(let dy=-3;dy<=2;dy++)for(let dx=-3;dx<=3;dx++)setT(h.x+dx,h.y+dy,T.GRASS);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(Math.hypot(x-C.x,y-C.y)<hubR+0.5)setT(x,y,T.GRASS);
  const carveCost=(x,y)=>(x===0||y===0||x===W-1||y===H-1)?Infinity:(passableT(tiles[idx(x,y)])?TCOST[tiles[idx(x,y)]]:420);
  const spokes=homes.map(h=>{const st={x:h.x,y:h.y+1};return[st,...(astar(st.x,st.y,C.x,C.y,carveCost)||[])];});
  const ringCost=(x,y)=>{const c=carveCost(x,y);return Math.hypot(x-C.x,y-C.y)<hubR+3?c+3000:c;};
  const rings=homes.map((h,i)=>{const b=homes[(i+1)%nS];if(nS<2)return[];return astar(h.x,h.y+1,b.x,b.y+1,ringCost)||[];});
  const roadSet=new Set();for(const p of[...spokes,...rings])for(const q of p){tiles[idx(q.x,q.y)]=T.ROAD;roadSet.add(idx(q.x,q.y));}
  // the hub wall: solid crags, with one straight gateway per spoke
  const protect=new Set(),inBand=(x,y)=>{const d=Math.hypot(x-C.x,y-C.y);return d>=hubR&&d<hubR+1.4;};
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){if(!inBand(x,y))continue;const i=idx(x,y);tiles[i]=T.CRAG;protect.add(i);}
  const gates=[];
  for(const p of spokes){if(!p.length)continue;
    const g0=p.reduce((b,q)=>{const d=Math.abs(Math.hypot(q.x-C.x,q.y-C.y)-(hubR+0.6));return!b||d<b.d?{q,d}:b;},null).q;
    const dx=C.x-g0.x,dy=C.y-g0.y,st=Math.abs(dx)>=Math.abs(dy)?[Math.sign(dx),0]:[0,Math.sign(dy)];
    if(gates.some(g=>Math.abs(g.x-g0.x)+Math.abs(g.y-g0.y)<3))continue;
    for(const dir of[1,-1]){let x=g0.x,y=g0.y;for(let k=0;k<6;k++){const i=idx(x,y);if(!inb(x,y))break;const d=Math.hypot(x-C.x,y-C.y);
      if(dir===1&&d<hubR-0.3)break;if(dir===-1&&d>=hubR+1.4)break;tiles[i]=T.ROAD;protect.delete(i);x+=st[0]*dir;y+=st[1]*dir;}}
    gates.push({x:g0.x,y:g0.y});}
  // pirates live on islands
  const isles=[],objs=[];let uid=1;
  homes.forEach(h=>{if(h.fac==='pirates'||h.fac==='merfolk')isles.push(homeIsle(tiles,h.fac,h.x,h.y-1,4+Math.round(KS*0.6),protect,null));});
  const isleWater=new Set();isles.forEach(il=>il.water.forEach(i=>isleWater.add(i)));
  const foot=(x,y)=>Math.abs(x-town.x)<=1&&y>=town.y-2&&y<=town.y;
  const occupied=(x,y)=>objs.some(o=>o.x===x&&o.y===y)||foot(x,y)||homes.some(h=>Math.abs(h.x-x)<=1&&Math.abs(h.y-y)<=1);
  const add=o=>{o.id=uid++;objs.push(o);return o;};
  const maxD=Math.hypot(W,H)*0.8,diff=(x,y)=>clamp(Math.hypot(x-town.x,y-town.y)/maxD,0,1);
  function spotNear(x0,y0,rad,inHub=false){for(let i=0;i<300;i++){const x=Math.round(x0+ri(-rad,rad)),y=Math.round(y0+ri(-rad,rad));
    if(x<1||y<1||x>W-2||y>H-2)continue;const i2=idx(x,y);if(!passableT(tiles[i2])||occupied(x,y)||protect.has(i2))continue;
    const dC=Math.hypot(x-C.x,y-C.y);if(!inHub&&dC<hubR+1.5)continue;if(inHub&&dC>=hubR-0.5)continue;
    if(gates.some(g=>Math.abs(g.x-x)<=1&&Math.abs(g.y-y)<=1))continue;return{x,y};}return null;}
  const at=(a,r)=>({x:C.x+Math.cos(a)*rx*r,y:C.y+Math.sin(a)*ry*r});
  add({type:'town',x:town.x,y:town.y});
  homes.slice(1).forEach(h=>add({type:'camp',x:h.x,y:h.y,fac:h.fac}));
  add({type:'relic',r:6,x:C.x,y:C.y,k:'drake',n:3});
  {const p=spotNear(C.x,C.y,2,true);if(p)add({type:'neutral',...p,k:'troll',n:ri(8,11)});}
  gates.forEach(gt=>add({type:'neutral',x:gt.x,y:gt.y,guard:true,k:'troll',n:ri(10,14)}));
  const angs=homes.map((h,i)=>Math.PI*1.25+i*2*Math.PI/nS);
  const cand=[];angs.forEach((a,i)=>{const m=a+Math.PI/nS;cand.push(at(m,0.62),at(m,0.36));if(i)cand.push(at(a,0.5));});
  cand.sort((a,b)=>Math.hypot(a.x-town.x,a.y-town.y)-Math.hypot(b.x-town.x,b.y-town.y));
  let ri0=0;for(const c of cand){if(ri0>5)break;const p=spotNear(c.x,c.y,2);if(!p)continue;const Rl=RELIC_LIST[ri0];add({type:'relic',r:ri0,x:p.x,y:p.y,k:Rl.k,n:ri(Rl.n[0],Rl.n[1])});ri0++;}
  for(let tries=0;ri0<6&&tries<200;tries++){const c=at(R()*Math.PI*2,0.3+R()*0.6),p=spotNear(c.x,c.y,3);if(!p)continue;const Rl=RELIC_LIST[ri0];add({type:'relic',r:ri0,x:p.x,y:p.y,k:Rl.k,n:ri(Rl.n[0],Rl.n[1])});ri0++;}
  for(const h of homes){for(const k of['saw','orepit']){const p=spotNear(h.x,h.y+1,4);if(p)add({type:'mine',k,x:p.x,y:p.y,owned:false});}}
  angs.forEach((a,i)=>{const p=spotNear(at(a+Math.PI/nS,0.85).x,at(a+Math.PI/nS,0.85).y,2);if(p){const k=i%2?'amber':'gold';add({type:'mine',k,x:p.x,y:p.y,owned:false});
    const q=spotNear(p.x,p.y,1);if(q)add({type:'neutral',...q,...neutralAt(diff(q.x,q.y))});}});
  const rnd=()=>{const a=R()*Math.PI*2,r=0.25+R()*0.8;return at(a,r);};
  for(let i=0;i<Math.round(11*K2*jit());i++){const c=rnd(),p=spotNear(c.x,c.y,2);if(p&&diff(p.x,p.y)>0.12)add({type:'neutral',...p,...neutralAt(diff(p.x,p.y))});}
  for(let i=0;i<Math.round(18*K2*jit());i++){const c=rnd(),p=spotNear(c.x,c.y,2);if(!p)continue;const k=pick(['gold','gold','timber','ore','timber','ore','amber']);add({type:'pile',k,x:p.x,y:p.y,n:k==='gold'?ri(5,10)*100:k==='amber'?ri(2,4):ri(4,8)});}
  for(let i=0;i<Math.round(6*K2*jit());i++){const c=rnd(),p=spotNear(c.x,c.y,2);if(p)add({type:'chest',x:p.x,y:p.y});}
  for(let i=0;i<3;i++){const c=rnd(),p=spotNear(c.x,c.y,2);if(p)add({type:'stone',x:p.x,y:p.y,stat:pick(['atk','def','pow','lore']),used:false});}
  ['mend','swift','bark'].forEach(sp=>{const c=rnd(),p=spotNear(c.x,c.y,2);if(p)add({type:'shrine',x:p.x,y:p.y,spell:sp});});
  for(let i=0;i<2;i++){const c=rnd(),p=spotNear(c.x,c.y,2);if(p)add({type:'well',x:p.x,y:p.y,day:0});}
  {const c=at(angs[0]+Math.PI/nS,0.3),p=spotNear(c.x,c.y,2);if(p)add({type:'tower',x:p.x,y:p.y});}
  {const p=spotNear(town.x,town.y+2,5);if(p)add({type:'fair',x:p.x,y:p.y});}
  const shore=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y);if(!passableT(tiles[i])||occupied(x,y)||protect.has(i))continue;if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>tiles[idx(x+a,y+b)]===T.LAKE&&!isleWater.has(idx(x+a,y+b))))shore.push({x,y,d:Math.hypot(x-town.x,y-town.y)});}
  shore.sort((a,b)=>a.d-b.d);const dk1=shore.find(q=>q.d>4);if(dk1)add({type:'dock',x:dk1.x,y:dk1.y});
  isles.forEach(il=>isleDocks(tiles,il,C.x,C.y,add,occupied));
  // make everything reachable from the town gate without breaking the hub wall or the island rings
  for(let guard=0;guard<100;guard++){
    const seen=new Uint8Array(W*H),st=idx(town.x,town.y),q=[st];seen[st]=1;
    const okT=(x,y)=>inb(x,y)&&(passableT(tiles[idx(x,y)])||isleWater.has(idx(x,y)))&&!foot(x,y);
    while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=x+a,ny=y+b;if(!okT(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni])continue;if(a&&b&&(!okT(x+a,y)||!okT(x,y+b)))continue;seen[ni]=1;q.push(ni);}}
    const bad=objs.find(o=>!seen[idx(o.x,o.y)]);if(!bad)break;
    const edge=(x,y)=>foot(x,y)||x===0||y===0||x===W-1||y===H-1;
    const p=astar(bad.x,bad.y,town.x,town.y+1,(x,y)=>edge(x,y)?Infinity:isleWater.has(idx(x,y))?60:protect.has(idx(x,y))?Infinity:carveCost(x,y));
    if(p){let prev={x:bad.x,y:bad.y};for(const c of p){const i=idx(c.x,c.y);if(!passableT(tiles[i])&&!isleWater.has(i))tiles[i]=T.DIRT;
      if(prev.x!==c.x&&prev.y!==c.y){const o1=idx(c.x,prev.y),o2=idx(prev.x,c.y);if(!(passableT(tiles[o1])&&!foot(c.x,prev.y))&&!(passableT(tiles[o2])&&!foot(prev.x,c.y))){const oc=foot(c.x,prev.y)||protect.has(o1)?o2:o1;if(!protect.has(oc)&&!isleWater.has(oc))tiles[oc]=T.DIRT;}}
      if(seen[i])break;prev=c;}}
    else if(bad.type!=='relic'&&bad.type!=='town'&&bad.type!=='camp')objs.splice(objs.indexOf(bad),1);else break;
  }
  R=saveR;
  return{tiles,objs,town,uid,rivalSpots:homes.slice(1).map(h=>({x:h.x,y:h.y,fac:h.fac}))};
}
/* ---- shared helpers for the newer generators ---- */
function baseNoise(g,tiles,f){const n1=makeNoise(g,6),n2=makeNoise(g,3),nf=makeNoise(g,4),nmo=makeNoise(g,5);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const e=0.65*n1(x,y)+0.35*n2(x,y);let t=f(e,nf(x,y),nmo(x,y),x,y);
    if(x===0||y===0||x===W-1||y===H-1)t=g()<0.5?T.CRAG:T.FOREST;tiles[idx(x,y)]=t;}}
/* fill a generated land with the usual furniture; spot(x,y,r) finds a free tile near a point, rnd() a random point */
function fillWorld(ctx){const{add,spot,rnd,town,homes,diff,KS,K2,tiles,occupied,protect,isleWater}=ctx;
  for(const h of homes)for(const k of['saw','orepit']){const p=spot(h.x,h.y+1,4);if(p)add({type:'mine',k,x:p.x,y:p.y,owned:false});}
  for(let i=0;i<Math.round(4*KS);i++){const c=rnd(),p=spot(c.x,c.y,2);if(!p)continue;add({type:'mine',k:i%2?'amber':'gold',x:p.x,y:p.y,owned:false});
    const q=spot(p.x,p.y,1);if(q&&diff(q.x,q.y)>0.15)add({type:'neutral',...q,...neutralAt(diff(q.x,q.y))});}
  for(let i=0;i<Math.round(11*K2*jit());i++){const c=rnd(),p=spot(c.x,c.y,2);if(p&&diff(p.x,p.y)>0.12)add({type:'neutral',...p,...neutralAt(diff(p.x,p.y))});}
  for(let i=0;i<Math.round(18*K2*jit());i++){const c=rnd(),p=spot(c.x,c.y,2);if(!p)continue;const k=pick(['gold','gold','timber','ore','timber','ore','amber']);add({type:'pile',k,x:p.x,y:p.y,n:k==='gold'?ri(5,10)*100:k==='amber'?ri(2,4):ri(4,8)});}
  for(let i=0;i<Math.round(6*K2*jit());i++){const c=rnd(),p=spot(c.x,c.y,2);if(p)add({type:'chest',x:p.x,y:p.y});}
  for(let i=0;i<3;i++){const c=rnd(),p=spot(c.x,c.y,2);if(p)add({type:'stone',x:p.x,y:p.y,stat:pick(['atk','def','pow','lore']),used:false});}
  ['mend','swift','bark'].forEach(sp=>{const c=rnd(),p=spot(c.x,c.y,2);if(p)add({type:'shrine',x:p.x,y:p.y,spell:sp});});
  for(let i=0;i<2;i++){const c=rnd(),p=spot(c.x,c.y,2);if(p)add({type:'well',x:p.x,y:p.y,day:0});}
  {const c=rnd(),p=spot(c.x,c.y,2);if(p)add({type:'tower',x:p.x,y:p.y});}
  {const p=spot(town.x,town.y+2,5);if(p)add({type:'fair',x:p.x,y:p.y});}
  const shore=[];for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=idx(x,y);if(!passableT(tiles[i])||occupied(x,y)||protect.has(i))continue;
    if([[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{const j=idx(x+a,y+b);return tiles[j]===T.LAKE&&!isleWater.has(j)&&!(ctx.river&&ctx.river.has(j));}))shore.push({x,y,d:Math.hypot(x-town.x,y-town.y)});}
  shore.sort((a,b)=>a.d-b.d);const dk1=shore.find(q=>q.d>4);if(dk1)add({type:'dock',x:dk1.x,y:dk1.y});
}
/* carve dirt tracks until every object can be reached from the town gate (portals count as links; protected tiles are never touched) */
function carveReach(tiles,objs,pseudo,town,foot,protect,isleWater,ports){
  const carveCost=(x,y)=>(x===0||y===0||x===W-1||y===H-1)?Infinity:(passableT(tiles[idx(x,y)])?TCOST[tiles[idx(x,y)]]:420);
  const oldP=PORT;PORT=ports||new Map();
  for(let guard=0;guard<140;guard++){
    const seen=new Uint8Array(W*H),st=idx(town.x,town.y),q=[st];seen[st]=1;
    const okT=(x,y)=>inb(x,y)&&(passableT(tiles[idx(x,y)])||isleWater.has(idx(x,y)))&&!foot(x,y);
    while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;const pj=PORT.get(i);if(pj!==undefined&&!seen[pj]){seen[pj]=1;q.push(pj);}
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=x+a,ny=y+b;if(!okT(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni])continue;if(a&&b&&(!okT(x+a,y)||!okT(x,y+b)))continue;seen[ni]=1;q.push(ni);}}
    const bad=[...objs,...pseudo].find(o=>!seen[idx(o.x,o.y)]);if(!bad)break;
    const edge=(x,y)=>foot(x,y)||x===0||y===0||x===W-1||y===H-1;
    const p=astar(bad.x,bad.y,town.x,town.y+1,(x,y)=>edge(x,y)?Infinity:isleWater.has(idx(x,y))?60:protect.has(idx(x,y))?Infinity:carveCost(x,y));
    if(p){let prev={x:bad.x,y:bad.y};for(const c of p){const i=idx(c.x,c.y);if(!passableT(tiles[i])&&!isleWater.has(i))tiles[i]=T.DIRT;
      if(Math.abs(prev.x-c.x)===1&&Math.abs(prev.y-c.y)===1){const o1=idx(c.x,prev.y),o2=idx(prev.x,c.y);if(!(passableT(tiles[o1])&&!foot(c.x,prev.y))&&!(passableT(tiles[o2])&&!foot(prev.x,c.y))){const oc=foot(c.x,prev.y)||protect.has(o1)?o2:o1;if(!protect.has(oc)&&!isleWater.has(oc))tiles[oc]=T.DIRT;}}
      if(seen[i])break;prev=c;}}
    else if(bad.type&&!['relic','town','camp','portal','spire'].includes(bad.type))objs.splice(objs.indexOf(bad),1);
    else{const i=pseudo.indexOf(bad);if(i>=0)pseudo.splice(i,1);else break;}
  }
  // anything minor that is still cut off is simply left out
  {const seen=new Uint8Array(W*H),st=idx(town.x,town.y),q=[st];seen[st]=1;
    const okT=(x,y)=>inb(x,y)&&(passableT(tiles[idx(x,y)])||tiles[idx(x,y)]===T.LAKE)&&!foot(x,y);
    while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;const pj=PORT.get(i);if(pj!==undefined&&!seen[pj]){seen[pj]=1;q.push(pj);}
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=x+a,ny=y+b;if(!okT(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni])continue;if(a&&b&&(!okT(x+a,y)||!okT(x,y+b)))continue;seen[ni]=1;q.push(ni);}}
    for(let k=objs.length-1;k>=0;k--){const o=objs[k];if(!seen[idx(o.x,o.y)]&&!['relic','town','camp','portal','spire','dock'].includes(o.type))objs.splice(k,1);}}
  PORT=oldP;
}
function mkSpot(tiles,occupied,protect,avoid){return(x0,y0,rad)=>{for(let i=0;i<300;i++){const x=Math.round(x0+ri(-rad,rad)),y=Math.round(y0+ri(-rad,rad));
  if(x<1||y<1||x>W-2||y>H-2)continue;const i2=idx(x,y);if(!passableT(tiles[i2])||occupied(x,y)||protect.has(i2)||avoid(x,y))continue;return{x,y};}return null;};}
function roadAlong(tiles,pts,cost){const out=[];for(let i=1;i<pts.length;i++){const p=astar(pts[i-1].x,pts[i-1].y,pts[i].x,pts[i].y,cost)||[];for(const q of p){tiles[idx(q.x,q.y)]=T.ROAD;out.push(q);}}return out;}
function placeRelics(spot,add,cands,town){
  const ps=[];for(const c of cands){const p=spot(c.x,c.y,2);if(p)ps.push(p);}
  ps.sort((a,b)=>Math.hypot(a.x-town.x,a.y-town.y)-Math.hypot(b.x-town.x,b.y-town.y));
  ps.slice(0,6).forEach((p,i)=>{const Rl=RELIC_LIST[i];add({type:'relic',r:i,x:p.x,y:p.y,k:Rl.k,n:ri(Rl.n[0],Rl.n[1])});});}

/* Underworld: a surface above, a dark underworld below, solid bedrock between, and portal pairs through it.
   Necromancers live below; the Glass Lair is down there too. */
function genUnder(seed,opt){
  const g=mulberry32(seed);const saveR=R;R=g;const KS=W/34,K2=KS*KS;
  const tiles=new Array(W*H),wallY=Math.floor(H/2)-1,underY=wallY+2;
  baseNoise(g,tiles,(e,f,m,x,y)=>{if(y===wallY||y===wallY+1)return T.CRAG;
    if(y<wallY){if(e<0.27+BIO.lake)return T.LAKE;if(e>0.72-BIO.crag)return T.CRAG;if(f>0.67-BIO.forest)return T.FOREST;if(m<0.3+BIO.bog)return T.BOG;if(m>0.68-BIO.heath)return T.HEATH;return T.GRASS;}
    if(e<0.22)return T.LAKE;if(e>0.66)return T.CRAG;if(f>0.7)return T.FOREST;if(m<0.32)return T.DIRT;if(m>0.72)return T.BOG;return T.GRASS;});
  const protect=new Set();for(let x=0;x<W;x++){protect.add(idx(x,wallY));protect.add(idx(x,wallY+1));}
  const all=[opt.fac,...opt.rivals],surf=all.map((f,i)=>({f,i})).filter(q=>q.f!=='necro'),und=all.map((f,i)=>({f,i})).filter(q=>q.f==='necro');
  const homes=new Array(all.length);
  surf.forEach((q,k)=>{homes[q.i]={x:clamp(Math.round(W*(k+0.5)/surf.length),4,W-5),y:clamp(Math.round(wallY*0.45)+(k%2?2:-1),4,wallY-4),fac:q.f};});
  und.forEach((q,k)=>{homes[q.i]={x:clamp(Math.round(W*(k%2?0.78:0.22)),4,W-5),y:clamp(underY+Math.round((H-underY)*0.55),underY+4,H-4),fac:q.f};});
  const uh=und.length?homes[und[0].i]:null;
  const lair={x:uh?(uh.x<W/2?Math.round(W*0.72):Math.round(W*0.28)):Math.round(W/2),y:Math.round(underY+(H-underY)*0.55)};
  const setT=(x,y,t)=>{if(x>0&&y>0&&x<W-1&&y<H-1&&!protect.has(idx(x,y)))tiles[idx(x,y)]=t;};
  for(const h of[...homes,lair])for(let dy=-3;dy<=2;dy++)for(let dx=-3;dx<=3;dx++)setT(h.x+dx,h.y+dy,T.GRASS);
  const np=W>=56?5:W>=44?4:3,ports=new Map(),pairs=[];
  for(let k=0;k<np;k++){const x=clamp(Math.round(W*(k+0.5)/np)+ri(-1,1),3,W-4),top={x,y:wallY-3},bot={x,y:underY+2};
    for(const p of[top,bot])for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)setT(p.x+dx,p.y+dy,T.GRASS);
    pairs.push([top,bot]);ports.set(idx(top.x,top.y),idx(bot.x,bot.y));ports.set(idx(bot.x,bot.y),idx(top.x,top.y));}
  const town=homes[0];
  const cc=(x,y)=>(x===0||y===0||x===W-1||y===H-1||protect.has(idx(x,y)))?Infinity:(passableT(tiles[idx(x,y)])?TCOST[tiles[idx(x,y)]]:420);
  const gate=h=>({x:h.x,y:h.y+1});
  const oldP=PORT;PORT=new Map();
  roadAlong(tiles,[...homes.filter(h=>h.y<wallY).map(gate),...pairs.map(p=>p[0])].sort((a,b)=>a.x-b.x),cc);
  roadAlong(tiles,[...homes.filter(h=>h.y>wallY).map(gate),...pairs.map(p=>p[1]),{x:lair.x,y:lair.y+1}].sort((a,b)=>a.x-b.x),cc);
  PORT=oldP;
  const isles=[],objs=[];let uid=1;
  homes.forEach(h=>{if(h.fac==='pirates'||h.fac==='merfolk')isles.push(homeIsle(tiles,h.fac,h.x,h.y-1,4+Math.round(KS*0.6),protect,null));});
  const isleWater=new Set();isles.forEach(il=>il.water.forEach(i=>isleWater.add(i)));
  const foot=(x,y)=>Math.abs(x-town.x)<=1&&y>=town.y-2&&y<=town.y;
  const occupied=(x,y)=>objs.some(o=>o.x===x&&o.y===y)||foot(x,y)||homes.some(h=>Math.abs(h.x-x)<=1&&Math.abs(h.y-y)<=1);
  const add=o=>{o.id=uid++;objs.push(o);return o;};
  const nearPort=(x,y)=>pairs.some(([a,b])=>Math.max(Math.abs(a.x-x),Math.abs(a.y-y))<=1||Math.max(Math.abs(b.x-x),Math.abs(b.y-y))<=1);
  const spot=mkSpot(tiles,occupied,protect,(x,y)=>nearPort(x,y)||(Math.abs(x-lair.x)<2&&Math.abs(y-lair.y)<2));
  const maxD=Math.hypot(W,H)*0.8,diff=(x,y)=>clamp((Math.hypot(x-town.x,y-town.y)+((y>wallY)!==(town.y>wallY)?10:0))/maxD,0,1);
  add({type:'town',x:town.x,y:town.y});
  homes.slice(1).forEach(h=>add({type:'camp',x:h.x,y:h.y,fac:h.fac}));
  add({type:'relic',r:6,x:lair.x,y:lair.y,k:'drake',n:3});
  for(const[ox,oy]of[[-1,-1],[1,-1]]){setT(lair.x+ox,lair.y+oy,T.GRASS);add({type:'neutral',x:lair.x+ox,y:lair.y+oy,k:'troll',n:ri(10,13)});}
  pairs.forEach(([a,b])=>{add({type:'portal',x:a.x,y:a.y,tx:b.x,ty:b.y});add({type:'portal',x:b.x,y:b.y,tx:a.x,ty:a.y});});
  // spires beside every other surface portal: hold them and you hold the way down
  pairs.forEach(([a],k)=>{if(k%2)return;const s=[[1,0],[-1,0]].map(([dx])=>({x:a.x+dx,y:a.y})).find(q=>passableT(tiles[idx(q.x,q.y)])&&!occupied(q.x,q.y));if(s)add({type:'spire',x:s.x,y:s.y,owned:false,garrison:[]});});
  const cands=[];for(let k=0;k<3;k++){cands.push({x:W*(0.2+0.3*k)+ri(-2,2),y:ri(3,wallY-4)});cands.push({x:W*(0.2+0.3*k)+ri(-2,2),y:ri(underY+3,H-4)});}
  placeRelics(spot,add,cands,town);
  const rnd=()=>({x:ri(2,W-3),y:R()<0.5?ri(2,wallY-2):ri(underY+1,H-3)});
  fillWorld({add,spot,rnd,town,homes,diff,KS,K2,tiles,occupied,protect,isleWater});
  isles.forEach(il=>isleDocks(tiles,il,W/2,wallY/2,add,occupied));
  const pseudo=[];carveReach(tiles,objs,pseudo,town,foot,protect,isleWater,ports);
  R=saveR;
  return{tiles,objs,town,uid,rivalSpots:homes.slice(1).map(h=>({x:h.x,y:h.y,fac:h.fac})),underY:wallY};
}

/* Four Rivers: four rivers meet around an island holding the Glass Lair. Each home has its own quarter;
   bridges cross the rivers (some guarded), and four bridges lead onto the island. */
function genRivers(seed,opt){
  const g=mulberry32(seed);const saveR=R;R=g;const KS=W/34,K2=KS*KS;
  const tiles=new Array(W*H);
  baseNoise(g,tiles,(e,f,m)=>e<0.22+BIO.lake?T.LAKE:e>0.74-BIO.crag?T.CRAG:f>0.68-BIO.forest?T.FOREST:m<0.3+BIO.bog?T.BOG:m>0.68-BIO.heath?T.HEATH:T.GRASS);
  const cx=Math.round(W/2),cy=Math.round(H/2),river=new Set(),protect=new Set();
  const wet=(x,y)=>{if(!inb(x,y))return;const i=idx(x,y);tiles[i]=T.LAKE;river.add(i);protect.add(i);};
  // the island: 3 x 3 of land inside a ring of water
  for(let y=cy-3;y<=cy+3;y++)for(let x=cx-3;x<=cx+3;x++){const d=Math.max(Math.abs(x-cx),Math.abs(y-cy));if(d<=1)tiles[idx(x,y)]=T.GRASS;else if(d===2)wet(x,y);else if(tiles[idx(x,y)]===T.LAKE||!passableT(tiles[idx(x,y)]))tiles[idx(x,y)]=T.GRASS;}
  // each arm wanders but always moves in 4-connected steps, and ends straight where it meets the ring
  // sideways shifts need two steps between them, so the river never doubles back into a 2 x 2 pool
  const arm=(along,len,dir,fixed,startOff)=>{const pts=[];let o=startOff,last=-9;
    for(let s=0;s<len;s++){const a=along(s);const left=len-s;
      const pt=dir==='v'?{x:fixed+o,y:a}:{x:a,y:fixed+o};wet(pt.x,pt.y);pts.push(pt);
      let no=o;if(s-last>=2&&left>1){if(left<=8)no=o-Math.sign(o);else if(R()<0.28)no=clamp(o+(R()<0.5?-1:1),-3,3);}
      if(no!==o){const pt2=dir==='v'?{x:fixed+no,y:a}:{x:a,y:fixed+no};wet(pt2.x,pt2.y);pts.push(pt2);o=no;last=s;}}
    return pts;};
  const arms=[
    {pts:arm(s=>s,cy-2,'v',cx,ri(-2,2)),ax:'v'},
    {pts:arm(s=>H-1-s,H-1-(cy+2),'v',cx,ri(-2,2)),ax:'v'},
    {pts:arm(s=>s,cx-2,'h',cy,ri(-2,2)),ax:'h'},
    {pts:arm(s=>W-1-s,W-1-(cx+2),'h',cy,ri(-2,2)),ax:'h'}];
  // bridges: straight stretches with dry land on both banks
  const bridges=[],isR=(x,y)=>inb(x,y)&&river.has(idx(x,y));
  const straight=(p,ax)=>ax==='v'?isR(p.x,p.y-1)&&isR(p.x,p.y+1)&&!isR(p.x-1,p.y)&&!isR(p.x+1,p.y):isR(p.x-1,p.y)&&isR(p.x+1,p.y)&&!isR(p.x,p.y-1)&&!isR(p.x,p.y+1);
  const nb=W>=56?3:2;
  for(const a of arms){const L=a.pts.length;for(let k=0;k<nb;k++){const want=Math.round(L*(k+1)/(nb+1));
    const c=a.pts.map((p,j)=>({p,j})).filter(q=>q.p.x>1&&q.p.y>1&&q.p.x<W-2&&q.p.y<H-2&&straight(q.p,a.ax)&&!bridges.some(b=>Math.abs(b.x-q.p.x)+Math.abs(b.y-q.p.y)<4)).sort((u,v)=>Math.abs(u.j-want)-Math.abs(v.j-want))[0];
    if(c)bridges.push({x:c.p.x,y:c.p.y,ori:a.ax==='v'?'ew':'ns',arm:a,guard:k===nb-1});}}
  const isle=[[cx-1,cy-2,'ns'],[cx+1,cy-2,'ns'],[cx-1,cy+2,'ns'],[cx+1,cy+2,'ns']].map(([x,y,ori])=>({x,y,ori,isle:true}));
  for(const b of[...bridges,...isle]){const i=idx(b.x,b.y);tiles[i]=T.ROAD;protect.delete(i);
    const banks=b.ori==='ew'?[[-1,0],[1,0]]:[[0,-1],[0,1]];for(const[dx,dy]of banks){const j=idx(b.x+dx,b.y+dy);if(!river.has(j)&&!passableT(tiles[j]))tiles[j]=T.GRASS;}}
  // the river art connects through bridges, so keep them in the river set
  // homes: one per quarter (a fifth shares the south-west)
  const Q=[[0.2,0.24],[0.8,0.24],[0.2,0.76],[0.8,0.76],[0.42,0.86]],all=[opt.fac,...opt.rivals];
  const homes=all.map((f,i)=>({x:Math.round(W*Q[i][0]),y:Math.round(H*Q[i][1]),fac:f}));
  for(const h of homes)for(let dy=-3;dy<=2;dy++)for(let dx=-3;dx<=3;dx++){const x=h.x+dx,y=h.y+dy;if(x>0&&y>0&&x<W-1&&y<H-1&&!river.has(idx(x,y)))tiles[idx(x,y)]=T.GRASS;}
  const town=homes[0];
  const cc=(x,y)=>{if(x===0||y===0||x===W-1||y===H-1)return Infinity;const i=idx(x,y);if(river.has(i)&&tiles[i]!==T.ROAD)return Infinity;return passableT(tiles[i])?TCOST[tiles[i]]:420;};
  const gate=h=>({x:h.x,y:h.y+1}),bank=(b,s)=>b.ori==='ew'?{x:b.x+s,y:b.y}:{x:b.x,y:b.y+s};
  const qOf=(x,y)=>(x<cx?0:1)+(y<cy?0:2);
  const oldP=PORT;PORT=new Map();
  for(const b of[...bridges,...isle])for(const s of[-1,1]){const e=bank(b,s);if(b.isle&&Math.max(Math.abs(e.x-cx),Math.abs(e.y-cy))<=1){roadAlong(tiles,[e,{x:cx,y:cy+(e.y<cy?-1:1)}],cc);continue;}
    const q=qOf(e.x,e.y),hs=homes.filter(h=>qOf(h.x,h.y)===q).sort((a,c)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(c.x-e.x,c.y-e.y));
    if(hs[0])roadAlong(tiles,[gate(hs[0]),e],cc);else{const any=homes.slice().sort((a,c)=>Math.hypot(a.x-e.x,a.y-e.y)-Math.hypot(c.x-e.x,c.y-e.y))[0];roadAlong(tiles,[gate(any),e],cc);}}
  PORT=oldP;
  const isles=[],objs=[];let uid=1;
  homes.forEach(h=>{if(h.fac==='pirates'||h.fac==='merfolk')isles.push(homeIsle(tiles,h.fac,h.x,h.y-1,4+Math.round(KS*0.6),protect,null));});
  // an island ring must not drown a bridge landing: the bridge then simply runs onto the island
  for(const b of[...bridges,...isle])for(const s of[-1,1]){const e=bank(b,s),j=idx(e.x,e.y);if(!river.has(j)&&!passableT(tiles[j])){tiles[j]=T.GRASS;protect.delete(j);isles.forEach(il=>il.water.delete(j));}}
  const isleWater=new Set();isles.forEach(il=>il.water.forEach(i=>isleWater.add(i)));
  const foot=(x,y)=>Math.abs(x-town.x)<=1&&y>=town.y-2&&y<=town.y;
  const occupied=(x,y)=>objs.some(o=>o.x===x&&o.y===y)||foot(x,y)||homes.some(h=>Math.abs(h.x-x)<=1&&Math.abs(h.y-y)<=1);
  const add=o=>{o.id=uid++;objs.push(o);return o;};
  const bridgeNear=(x,y)=>[...bridges,...isle].some(b=>Math.abs(b.x-x)<=1&&Math.abs(b.y-y)<=1);
  const spot=mkSpot(tiles,occupied,protect,(x,y)=>bridgeNear(x,y)||Math.max(Math.abs(x-cx),Math.abs(y-cy))<=2);
  const maxD=Math.hypot(W,H)*0.8,diff=(x,y)=>clamp(Math.hypot(x-town.x,y-town.y)/maxD,0,1);
  add({type:'town',x:town.x,y:town.y});
  homes.slice(1).forEach(h=>add({type:'camp',x:h.x,y:h.y,fac:h.fac}));
  add({type:'relic',r:6,x:cx,y:cy,k:'drake',n:3});
  // the island bridges are held by trolls; one bridge on each river is guarded too
  isle.forEach(b=>add({type:'neutral',x:b.x,y:b.y+(b.y<cy?-1:1),guard:true,k:'troll',n:ri(9,13)}));
  bridges.filter(b=>b.guard).forEach(b=>add({type:'neutral',x:b.x,y:b.y,guard:true,k:'troll',n:ri(7,10)}));
  // a spire at the head of each open bridge
  bridges.filter(b=>!b.guard).forEach(b=>{const e=bank(b,R()<0.5?-1:1);if(passableT(tiles[idx(e.x,e.y)])&&!occupied(e.x,e.y))add({type:'spire',x:e.x,y:e.y,owned:false,garrison:[]});});
  const cands=[[0.5,0.16],[0.5,0.84],[0.14,0.5],[0.86,0.5],[0.32,0.38],[0.68,0.62],[0.68,0.36],[0.32,0.64]].map(([a,b])=>({x:W*a,y:H*b}));
  placeRelics(spot,add,cands,town);
  const rnd=()=>({x:ri(2,W-3),y:ri(2,H-3)});
  fillWorld({add,spot,rnd,town,homes,diff,KS,K2,tiles,occupied,protect,isleWater,river});
  isles.forEach(il=>isleDocks(tiles,il,cx,cy,add,occupied));
  const pseudo=[];carveReach(tiles,objs,pseudo,town,foot,protect,isleWater,null);
  R=saveR;
  return{tiles,objs,town,uid,rivalSpots:homes.slice(1).map(h=>({x:h.x,y:h.y,fac:h.fac})),rivers:[...river],bridges:[...bridges,...isle].map(b=>({i:idx(b.x,b.y),ori:b.ori}))};
}
/* every map rolls a biome from its seed: it shifts how much water, crag, forest, bog and heath there is */
const BIOMES=[{k:'vale',name:'Green Vale',lake:0,crag:0,forest:0,bog:0,heath:0},{k:'wet',name:'Wetlands',lake:0.05,crag:-0.03,forest:0,bog:0.08,heath:-0.04},
  {k:'high',name:'Highlands',lake:-0.04,crag:0.06,forest:-0.02,bog:-0.05,heath:0.06},{k:'wood',name:'Deepwood',lake:0,crag:-0.02,forest:0.08,bog:0.02,heath:-0.03},
  {k:'dry',name:'Dry Plains',lake:-0.06,crag:0.01,forest:-0.06,bog:-0.08,heath:0.12},{k:'autumn',name:'Autumn March',lake:0,crag:0,forest:0.04,bog:0,heath:0.03}];
let BIO=BIOMES[0];
const jit=()=>0.75+R()*0.55;
const biomeOf=seed=>BIOMES[(Math.abs(seed)>>>3)%BIOMES.length];
function genMap(seed,opt){BIO=biomeOf(seed);const w=genMap0(seed,opt);w.biome=BIO.k;dropPuddles(w);return w;}
/* water must be intentional: a body of water stays only if it is part of a river, has a dock or something on it, or is a real lake (60+ tiles); the rest becomes land */
function dropPuddles(w,min=60,dockMin=12){const t=w.tiles,seen=new Uint8Array(t.length),keep=new Set(w.rivers||[]),dockAt=new Set();
  for(const o of w.objs){if(o.type==='dock'){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=o.x+dx,y=o.y+dy;if(x>=0&&y>=0&&x<W&&y<H)dockAt.add(y*W+x);}}else if(o.x>=0&&o.y>=0&&o.x<W&&o.y<H)keep.add(o.y*W+o.x);}
  for(let i=0;i<t.length;i++){if(t[i]!==T.LAKE||seen[i])continue;const comp=[i],q=[i];seen[i]=1;
    while(q.length){const j=q.pop(),x=j%W,y=(j/W)|0;for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const n=ny*W+nx;if(!seen[n]&&t[n]===T.LAKE){seen[n]=1;comp.push(n);q.push(n);}}}
    if(comp.length>=min||comp.some(j=>keep.has(j))||(comp.length>=dockMin&&comp.some(j=>dockAt.has(j))))continue;
    for(const j of comp){const x=j%W,y=(j/W)|0,cnt={};for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=W||ny>=H)continue;const v=t[ny*W+nx];if(v!==T.LAKE&&v!==T.ROAD&&v!==T.CRAG)cnt[v]=(cnt[v]||0)+1;}
      const best=Object.entries(cnt).sort((a,b)=>b[1]-a[1])[0];t[j]=best?+best[0]:T.GRASS;}}
  /* a dock left with no water beside it goes too */
  const wet=(x,y)=>x>=0&&y>=0&&x<W&&y<H&&t[y*W+x]===T.LAKE;
  w.objs=w.objs.filter(o=>o.type!=='dock'||[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,1],[1,-1],[-1,-1]].some(([dx,dy])=>wet(o.x+dx,o.y+dy)));}
function genMap0(seed,opt){return opt.type==='wheel'?genWheel(seed,opt):opt.type==='under'?genUnder(seed,opt):opt.type==='rivers'?genRivers(seed,opt):genRidges(seed,opt);}

function mkHero(hid,x,y){const h=HBY[hid],f=FAC[h.fac];
  const hero={id:hid,name:h.name,fac:h.fac,x,y,lvl:1,xp:0,atk:h.st[0],def:h.st[1],pow:h.st[2],lore:h.st[3],mana:0,mp:0,spells:[...h.sp],skills:[...h.sk],
    mount:f.travel==='hooves'?'hooves':'foot',boat:f.travel==='boat',army:[],relics:[],items:h.item?[h.item]:[],book:h.type==='Magic'||h.sp.length>0};
  if(h.type==='Magic'&&!hero.spells.length)hero.spells.push('ember');return hero;}
function mkRival(hid,x,y){const h=HBY[hid],u=FAC[h.fac].units;
  return{id:hid,name:h.name,fac:h.fac,x,y,atk:h.st[0]+1,def:h.st[1]+1,pow:h.st[2],lore:h.st[3],relics:[],
    army:[{k:u[0],n:Math.round(300*rvMul()/U[u[0]].hp)},{k:u[1],n:Math.round(140*rvMul()/U[u[1]].hp)},{k:u[2],n:Math.max(1,Math.round(70*rvMul()/U[u[2]].hp))}]};}
/* tiles reachable on foot from a base, with their walking distance */
function reachFrom(x0,y0,water){const dist=new Map(),q=[[x0,y0]];dist.set(idx(x0,y0),0);
  const ok=(x,y)=>inb(x,y)&&(passableT(S.tiles[idx(x,y)])||(water&&S.tiles[idx(x,y)]===T.LAKE))&&!townFoot(x,y);
  for(let h=0;h<q.length;h++){const[x,y]=q[h],d=dist.get(idx(x,y));for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const nx=x+a,ny=y+b;if(!ok(nx,ny)||dist.has(idx(nx,ny)))continue;if(a&&b&&(!ok(x+a,y)||!ok(x,y+b)))continue;
    const o=objAt(nx,ny);dist.set(idx(nx,ny),d+1);if(!o||o.type==='town'||o.type==='camp'||o.type==='portal')q.push([nx,ny]);}
    const pj=PORT.get(idx(x,y));if(pj!==undefined&&!dist.has(pj)){dist.set(pj,d+1);q.push([pj%W,(pj/W)|0]);}}return dist;}
/* ore pits and gold seams belong in stone: move each to the foot of nearby crags, or raise a crag behind it where that blocks nothing */
const isKeyGuard=o=>o.key||o.guard||S.objs.some(q=>Math.max(Math.abs(q.x-o.x),Math.abs(q.y-o.y))<=1&&((q.type==='artifact'&&ITEMS[q.item]&&ITEMS[q.item].lvl>=3)||q.type==='prison'||(q.type==='mine'&&['gold','amber','gem','moon'].includes(q.k))));
function rockMines(home){const crag=(x,y)=>inb(x,y)&&S.tiles[idx(x,y)]===T.CRAG,BEH=[[0,-1],[-1,-1],[1,-1],[-1,0],[1,0]];
  const score=(x,y)=>BEH.reduce((a,[dx,dy])=>a+(crag(x+dx,y+dy)?1:0),0);
  const open=(x,y)=>{let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&inb(x+dx,y+dy)&&passableT(S.tiles[idx(x+dx,y+dy)]))n++;return n;};
  const count=()=>reachFrom(home.x,home.y+1,true).size;let n0=count();
  for(const o of S.objs){if(o.type!=='mine'||(o.k!=='orepit'&&o.k!=='gold')||score(o.x,o.y)>=2)continue;
    /* 1: move to the foot of a rocky notch nearby */
    let best=null,bs=-1,bd=99;for(const[i2,d]of reachFrom(o.x,o.y)){if(d<1||d>6)continue;const x=i2%W,y=(i2/W)|0,t=S.tiles[i2],sc=score(x,y);
      if(sc<2||x<2||y<2||x>W-3||y>H-3||t===T.ROAD||t===T.LAKE||!passableT(t)||open(x,y)<4||objAt(x,y)||townFoot(x,y))continue;
      if(S.objs.some(q=>q!==o&&Math.abs(q.x-x)<=1&&Math.abs(q.y-y)<=1))continue;if(sc>bs||(sc===bs&&d<bd)){best={x,y};bs=sc;bd=d;}}
    if(best){const ox=o.x,oy=o.y;o.x=best.x;o.y=best.y;const n=count();if(n>=n0){n0=n;continue;}o.x=ox;o.y=oy;}
    /* 2: raise rock behind and beside it, one tile at a time, keeping every route open */
    for(const[dx,dy]of BEH){if(score(o.x,o.y)>=3)break;const x=o.x+dx,y=o.y+dy;if(x<2||y<2||x>W-3||y>H-3)continue;const i2=idx(x,y),t=S.tiles[i2];
      if(t===T.ROAD||t===T.LAKE||t===T.CRAG||objAt(x,y)||townFoot(x,y))continue;S.tiles[i2]=T.CRAG;const n=count();if(n===n0-1){n0=n;continue;}S.tiles[i2]=t;}}}
function freeTile(dist,dmin,dmax,avoid=2){const c=[];for(const[i,d]of dist){if(d<dmin||d>dmax||!passableT(S.tiles[i]))continue;const x=i%W,y=(i/W)|0;
  if(objAt(x,y)||townFoot(x,y)||S.objs.some(o=>Math.abs(o.x-x)<=avoid-1&&Math.abs(o.y-y)<=avoid-1&&(o.type==='town'||o.type==='neutral'&&o.guard)))continue;
  if(x<1||y<1||x>W-2||y>H-2)continue;c.push({x,y});}return c.length?pick(c):null;}
/* Spires sit on the road where it squeezes through a choke (blocking that tile splits the land), or else at busy crossroads.
   The first hero through claims one; its owner can leave troops inside, and enemies must beat them to pass. */
function placeSpires(bases,add){
  const N=W*H,land=i=>passableT(S.tiles[i])&&!FOOT.has(i);
  const nb=(i,f)=>{const x=i%W,y=(i/W)|0;{const pj=PORT.get(i);if(pj!==undefined)f(pj);}for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const nx=x+a,ny=y+b;if(!inb(nx,ny))continue;const j=idx(nx,ny);if(!land(j))continue;if(a&&b&&(!land(idx(x+a,y))||!land(idx(x,y+b))))continue;f(j);}};
  const flood=(start,block)=>{const seen=new Uint8Array(N);seen[start]=1;if(block>=0)seen[block]=1;const q=[start];for(let h=0;h<q.length;h++)nb(q[h],j=>{if(!seen[j]){seen[j]=1;q.push(j);}});return q.length;};
  const occupied=new Set(S.objs.map(o=>idx(o.x,o.y)));
  const farBase=(x,y,d)=>bases.every(b=>Math.max(Math.abs(b.x-x),Math.abs(b.y-y))>d);
  const roads=[];for(let i=0;i<N;i++)if(S.tiles[i]===T.ROAD&&!occupied.has(i)&&!FOOT.has(i)){const x=i%W,y=(i/W)|0;if(farBase(x,y,4)&&!S.objs.some(o=>o.type==='town'&&Math.abs(o.x-x)<=2&&Math.abs(o.y-y)<=3))roads.push(i);}
  const pre=S.objs.filter(o=>o.type==='spire').map(o=>idx(o.x,o.y));
  const want=(W>=56?6:W>=44?4:3)-pre.length,picked=[];
  const cheb=(i,j)=>Math.max(Math.abs(i%W-j%W),Math.abs(((i/W)|0)-((j/W)|0)));
  const spaced=i=>picked.every(j=>cheb(i,j)>=6)&&pre.every(j=>cheb(i,j)>=6);
  // a choke: blocking the spire's 3 x 3 area splits the land, with real ground on both sides
  const flood3=(i,start)=>{const seen=new Uint8Array(N),x=i%W,y=(i/W)|0;let bl=0;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if(inb(x+a,y+b)){const j=idx(x+a,y+b);seen[j]=1;if(land(j))bl++;}
    if(seen[start])return null;seen[start]=1;const q=[start];for(let h=0;h<q.length;h++)nb(q[h],j=>{if(!seen[j]){seen[j]=1;q.push(j);}});return[q.length,bl];};
  const chokes=[];
  for(const i of roads){const x=i%W,y=(i/W)|0;let s0=-1;for(const[a,b]of[[2,0],[-2,0],[0,2],[0,-2],[2,2],[-2,-2],[2,-2],[-2,2]])if(s0<0&&inb(x+a,y+b)&&land(idx(x+a,y+b)))s0=idx(x+a,y+b);if(s0<0)continue;
    const tot=flood(s0,-1),r=flood3(i,s0);if(!r)continue;const side=r[0],other=tot-r[1]-side;
    if(other>=15&&side>=15)chokes.push({i,v:Math.min(side,other)});}
  chokes.sort((a,b)=>b.v-a.v);for(const c of chokes)if(picked.length<want&&spaced(c.i))picked.push(c.i);
  // otherwise spread them out along the roads, away from every base
  while(picked.length<want&&roads.length){let best=-1,bv=0;for(const i of roads){if(!spaced(i))continue;const x=i%W,y=(i/W)|0;
      const v=Math.min(...bases.map(b=>Math.max(Math.abs(b.x-x),Math.abs(b.y-y))),...picked.map(j=>cheb(i,j)),...pre.map(j=>cheb(i,j)));if(v>bv){bv=v;best=i;}}
    if(best<0)break;picked.push(best);}
  for(const i of picked)add({type:'spire',x:i%W,y:(i/W)|0,owned:false,garrison:[]});
}
/* captured towns send home only part of their hall's gold (v30) */
const COLONY=0.6;
const isMajor=o=>!!o&&o.type==='camp'&&(!!o.major||(!o.free&&!!o.fac));
const myMajors=()=>S&&S.objs&&!S.players?S.objs.filter(o=>isMajor(o)&&o.owned===ME()&&o.built):[];
const allTowns=()=>S&&S.town?[S.town,...myMajors()]:[];
const hallGold=t=>t.built.hall4?3000:t.built.hall3?2000:t.built.hall2?1000:500;
const heroCap=()=>4+(allTowns().some(t=>t.built&&t.built.lodge)?1:0);
const TOWN_NAMES=['Brackenford','Millbrook','Stonereach','Harrowgate','Elmstead','Copperhollow','Wrenmoor','Ashby Cross','Fairwater','Highmere','Oakvale','Saltmarsh','Kettleby','Dunmore','Larkspur','Greywick'];
/* a captured major town becomes a full town: its banner's dwellings, a hall, its own garrison and recruits */
function makeTown(o){if(!o.built){o.built=o.free?{hall1:1,d1:1,d2:1}:{hall1:1,hall2:1,d1:1,d2:1,d3:1,lib1:1};o.pool={};
    FAC[o.fac].units.forEach((k,i)=>{if(o.built['d'+(i+1)])o.pool[k]=Math.ceil(U[k].growth/2);});}
  o.name=o.name||(o.free?TOWN_NAMES[(o.id*7)%TOWN_NAMES.length]:FAC[o.fac].town);o.builtToday=false;o.garrison=o.garrison||[];return o;}
function captureCamp(o,h){o.owned=ME();o.ownerName=h.name;o.garrison=[];if(isMajor(o))makeTown(o);else o.pool=firstPool(o);
  if(o.keeper){const id=o.keeper;o.keeper=null;S.jailed=(S.jailed||[]).filter(x=>x!==id);return id;}return null;}
const campTiers=o=>o.station?3:o.free?(o.lvl||1)+1:2;
const firstPool=o=>{const u=FAC[o.fac].units,p={};for(let i=0;i<campTiers(o);i++)p[u[i]]=Math.ceil(U[u[i]].growth/2);return p;};
const campIncome=o=>isMajor(o)&&o.built?Math.round(hallGold(o)*COLONY):o.station?250:o.free?[500,750,1000][(o.lvl||1)-1]:500;
const TOWN_LVL=['','Village','Town','City'],MON_LVL=['','weak','','strong','elite'];
const campName=o=>isMajor(o)?(o.name||(o.free?`free ${FAC[o.fac].arch} town`:`${FAC[o.fac].arch} home town`)):o.station?`${FAC[o.fac].arch} recruiting post`:o.free?`${FAC[o.fac].arch} outpost`:`${FAC[o.fac].arch} camp`;
const spireFoe=o=>o&&((o.type==='spire'&&o.owned&&o.owned!==ME())||(o.type==='camp'&&o.owned!==ME()&&!S.players))&&(o.garrison||[]).length>0;
/* a garrisoned spire holds the eight tiles around it: other banners can't walk through them until they take the spire */
function zocFor(owner){const z=new Set();for(const o of S.objs)if(o.type==='spire'&&o.owned&&o.owned!==owner&&o.garrison.length)for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++)if((a||b)&&inb(o.x+a,o.y+b))z.add(idx(o.x+a,o.y+b));return z;}
const zocMap=new WeakMap();
const spireOwnerName=o=>!o.owned?'nobody':o.owned===ME()?'you':(o.ownerName||(FAC[o.owned]?FAC[o.owned].arch:'a rival'));
/* v35: after everything is placed, make sure every object can be reached from a home (by land, boat or portal).
   Heroes pass through towns, camps, portals and (after a fight) monsters; other objects are visited from a neighbouring tile.
   Anything sealed off gets a dirt path carved through forest or crags toward the reachable land. Returns how many it fixed. */
function ensureAccess(bases){
  const OM=new Map();for(const o of S.objs)OM.set(idx(o.x,o.y),o);
  const thru=o=>!o||o.type==='town'||o.type==='camp'||o.type==='portal'||o.type==='neutral'||o.type==='spire';
  const walk=i=>{const t=S.tiles[i];return(passableT(t)||t===T.LAKE)&&!FOOT.has(i);};
  const seen=new Uint8Array(W*H),q=[];
  const flood=()=>{while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;const pj=PORT.get(i);if(pj!==undefined&&!seen[pj]){seen[pj]=1;q.push(pj);}
    for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){if(!a&&!b)continue;const nx=x+a,ny=y+b;if(!inb(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni]||!walk(ni))continue;
      if(a&&b&&(!walk(idx(x+a,y))||!walk(idx(x,y+b))))continue;seen[ni]=1;if(thru(OM.get(ni)))q.push(ni);}}};
  for(const b of bases){for(const[dx,dy]of[[0,1],[0,0]]){const i=idx(b.x+dx,b.y+dy);if(inb(b.x+dx,b.y+dy)&&!seen[i]){seen[i]=1;q.push(i);}}}
  flood();
  const reached=o=>{if(seen[idx(o.x,o.y)])return true;for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=o.x+a,ny=o.y+b;if(inb(nx,ny)&&seen[idx(nx,ny)]&&thru(OM.get(idx(nx,ny))))return true;}return false;};
  let fixed=0;
  for(const o of S.objs){if(o.type==='flot'||reached(o))continue;
    /* Dijkstra from the object to the nearest reached tile: open ground is cheap, forest and crags cost more and get carved */
    const dist=new Float64Array(W*H).fill(Infinity),prev=new Int32Array(W*H).fill(-1),st=idx(o.x,o.y);dist[st]=0;
    const hp=[[0,st]],push=e=>{hp.push(e);let k=hp.length-1;while(k){const pk=(k-1)>>1;if(hp[pk][0]<=hp[k][0])break;[hp[pk],hp[k]]=[hp[k],hp[pk]];k=pk;}},
      pop=()=>{const top=hp[0],last=hp.pop();if(hp.length){hp[0]=last;let k=0;for(;;){const l=2*k+1,r=l+1;let m=k;if(l<hp.length&&hp[l][0]<hp[m][0])m=l;if(r<hp.length&&hp[r][0]<hp[m][0])m=r;if(m===k)break;[hp[m],hp[k]]=[hp[k],hp[m]];k=m;}}return top;};
    let end=-1;
    while(hp.length){const[d,i]=pop();if(d>dist[i])continue;if(i!==st&&seen[i]&&thru(OM.get(i))){end=i;break;}const x=i%W,y=(i/W)|0;
      for(const[a,b]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a,ny=y+b;if(nx<1||ny<1||nx>W-2||ny>H-2)continue;const ni=idx(nx,ny);if(FOOT.has(ni))continue;const ob=OM.get(ni);if(ob&&!thru(ob))continue;
        const t=S.tiles[ni],bed=S.underY&&ny>=S.underY-1&&ny<=S.underY+2,c=walk(ni)?1:!bed&&(t===T.FOREST||t===T.CRAG)?6:Infinity;if(d+c<dist[ni]){dist[ni]=d+c;prev[ni]=i;push([d+c,ni]);}}}
    if(end<0)continue;
    for(let i=end;i>=0&&i!==st;i=prev[i]){if(!walk(i))S.tiles[i]=T.DIRT;if(!seen[i]){seen[i]=1;q.push(i);}}
    flood();fixed++;}
  return fixed;
}
function furnishMap(bases){
  const KS=W/34;let uid=S.uid;const add=o=>{o.id=uid++;S.objs.push(o);};
  // every base gets a sawmill, ore pit, amber spring and gold seam within a short walk
  for(const b of bases){const dist=reachFrom(b.x,b.y+1);
    for(const[k,lo,hi]of[['saw',2,6],['orepit',2,6],['amber',4,9],['gold',5,10]]){
      const near=S.objs.some(o=>o.type==='mine'&&o.k===k&&dist.has(idx(o.x,o.y))&&dist.get(idx(o.x,o.y))<=hi+2);if(near)continue;
      const p=freeTile(dist,lo,hi)||freeTile(dist,lo,hi+6)||freeTile(dist,1,hi+12,1);if(p)add({type:'mine',k,x:p.x,y:p.y,owned:false,lvl:1});}}
  // rare mines: a gem grotto and a moonwater spring per base, a longer walk out (they are worth fighting over)
  for(const b of bases){const dist=reachFrom(b.x,b.y+1);for(const[k,lo,hi]of[['gem',8,14],['moon',10,17]]){const p=freeTile(dist,lo,hi)||freeTile(dist,lo-3,hi+8);if(p)add({type:'mine',k,x:p.x,y:p.y,owned:false,lvl:1});}}
  // mines differ: some start richer than others
  const home=bases[0],maxD=Math.hypot(W,H);
  for(const o of S.objs)if(o.type==='mine'&&!o.lvl){const far=Math.hypot(o.x-home.x,o.y-home.y)/maxD;o.lvl=1+(R()<0.45?1:0)+(far>0.45&&R()<0.4?1:0);}
  rockMines(home);
  {const dKey=reachFrom(home.x,home.y+1,true);let mdK=1;for(const d of dKey.values())mdK=Math.max(mdK,d);
    for(const o of S.objs.filter(q=>q.type==='mine'&&['gold','amber','gem','moon'].includes(q.k))){if(S.objs.some(q=>q.type==='neutral'&&Math.max(Math.abs(q.x-o.x),Math.abs(q.y-o.y))<=1))continue;
      const adj=[[0,1],[1,0],[-1,0],[1,1],[-1,1],[0,-1]].map(([dx,dy])=>({x:o.x+dx,y:o.y+dy})).filter(p=>inb(p.x,p.y)&&dKey.has(idx(p.x,p.y))&&passableT(S.tiles[idx(p.x,p.y)])&&!objAt(p.x,p.y)&&!townFoot(p.x,p.y));
      if(!adj.length)continue;const p=adj[0],t=Math.min(0.95,0.25+0.7*(dKey.get(idx(o.x,o.y))||0)/mdK),nt=neutralAt(t);add({type:'neutral',x:p.x,y:p.y,k:nt.k,n:nt.n,key:true});}}
  // weekly sites and artifacts, spread by distance from your town
  const dist=reachFrom(home.x,home.y+1,true);let md=0;for(const d of dist.values())md=Math.max(md,d);
  const band=(a,b)=>[Math.round(md*a),Math.round(md*b)];
  const sites=[['wish',2,0.1,0.5],['clover',2,0.15,0.7],['woodcamp',1,0.1,0.45],['orecart',1,0.1,0.45],['amberhollow',1,0.3,0.8]];
  for(const[k,n,a,b]of sites)for(let i=0;i<Math.max(1,Math.round(n*KS*KS));i++){const p=freeTile(dist,...band(a,b));if(p)add({type:'site',k,x:p.x,y:p.y,week:-1});}
  // prisons: each holds one rogue, waiting to be freed
  {const rogues=HEROES.filter(x=>x.rogue).map(x=>x.id).sort(()=>R()-0.5);S.jailed=[];
    for(let i=0;i<Math.min(rogues.length,Math.max(1,Math.round(KS*1.2)));i++){const p=freeTile(dist,...band(0.35,0.85));if(!p)break;add({type:'prison',x:p.x,y:p.y,rogue:rogues[i]});S.jailed.push(rogues[i]);
      const g=freeTile(new Map([[idx(p.x+1,p.y),0],[idx(p.x-1,p.y),0],[idx(p.x,p.y+1),0]].filter(([j])=>j>=0&&j<W*H&&dist.has(j))),0,0,1);if(g){const nt=neutralAt(0.55);add({type:'neutral',x:g.x,y:g.y,k:nt.k,n:nt.n});}}}
  const owned=new Set(S.heroes.flatMap(h=>h.items||[]));
  const byLvl=l=>Object.keys(ITEMS).filter(k=>ITEMS[k].lvl===l&&!owned.has(k)&&!S.objs.some(o=>o.type==='artifact'&&o.item===k));
  const plan=[[1,3,0.08,0.35],[2,3,0.2,0.5],[3,2,0.4,0.7],[4,1,0.6,0.9],[5,1,0.8,1]];
  for(const[l,n,a,b]of plan)for(let i=0;i<Math.max(1,Math.round(n*KS));i++){const pool=byLvl(l);if(!pool.length)break;const p=freeTile(dist,...band(a,b),3);if(!p)continue;
    add({type:'artifact',item:pick(pool),x:p.x,y:p.y});
    if(l>=3){const g=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).find(q=>inb(q.x,q.y)&&passableT(S.tiles[idx(q.x,q.y)])&&!objAt(q.x,q.y)&&!townFoot(q.x,q.y));
      if(g)add({type:'neutral',x:g.x,y:g.y,...(l===3?{k:'troll',n:ri(5,8)}:l===4?{k:'imp',n:ri(30,40)}:{k:'troll',n:ri(14,18)})});}}
  // sage libraries (choose a +2 stat) and spell altars in three tiers; the stronger ones farther out and guarded
  for(let i=0;i<Math.max(1,Math.round(KS));i++){const p=freeTile(dist,...band(0.25+0.3*i/Math.max(1,KS),0.6+0.2*i/Math.max(1,KS)),3);if(p)add({type:'sage',x:p.x,y:p.y,used:[]});}
  const ALT=[[1,['swift','bark','ember','mend','entangle','weaken'],0.15,0.45],[2,['chain','squall','raise','frost','rally'],0.4,0.75],[3,['starfall','meteor'],0.7,1]];
  for(const[tier,pool,a,b]of ALT)for(let i=0;i<Math.max(1,Math.round((tier===3?0.6:1)*KS));i++){const p=freeTile(dist,...band(a,b),3);if(!p)continue;add({type:'altar',x:p.x,y:p.y,tier,spell:pick(pool)});
    if(tier>1){const g=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:p.x+dx,y:p.y+dy})).find(q=>inb(q.x,q.y)&&passableT(S.tiles[idx(q.x,q.y)])&&!objAt(q.x,q.y)&&!townFoot(q.x,q.y));
      if(g)add({type:'neutral',x:g.x,y:g.y,...(tier===2?{k:'imp',n:ri(18,26)}:{k:'troll',n:ri(12,16)})});}}
  {const RVs=new Set(S.rivers||[]),wet=[];for(let i=0;i<W*H;i++){if(S.tiles[i]!==T.LAKE||RVs.has(i)||!dist.has(i))continue;const x=i%W,y=(i/W)|0;if(x<2||y<2||x>W-3||y>H-3)continue;if(!S.objs.some(o=>Math.abs(o.x-x)<=1&&Math.abs(o.y-y)<=1))wet.push(i);}
    const nF=clamp(Math.round(wet.length/45),wet.length?2:0,10),ks=Object.keys(FLOT);for(let k=0;k<nF&&wet.length;k++){const i=wet.splice(Math.floor(R()*wet.length),1)[0];add({type:'flot',k:ks[k%ks.length],x:i%W,y:(i/W)|0});}}
  for(let i=0;i<Math.round(7*KS*jit());i++){const p=freeTile(dist,...band(0.15,0.95),2);if(p)add({type:'gem',k:pick(Object.keys(GEMS)),x:p.x,y:p.y});}
  for(let i=0;i<Math.round(3*KS*jit());i++){const p=freeTile(dist,...band(0.2,0.95),2);if(p)add({type:'pile',k:'moonwater',n:ri(1,2),x:p.x,y:p.y});}
  for(const o of S.objs)if(o.type==='stone'&&!o.style)o.style=pick(FAC_ORDER);
  // recruiting posts: every banner gets a small, lightly guarded post of its own troops in its home area
  for(const b of bases){if(!b.fac)continue;const dB=reachFrom(b.x,b.y+1);const p=freeTile(dB,5,10,3)||freeTile(dB,4,14,2);if(!p)continue;const g=neutralAt(0.12);
    add({type:'camp',free:true,station:true,lvl:1,fac:b.fac,x:p.x,y:p.y,owned:false,garrison:[{k:g.k,n:Math.max(2,Math.round(g.n*0.6))}],pool:{}});}
  // free towns: a few major towns (captured, they become full towns you build up like your home) and smaller outposts (+gold and a few recruits)
  {const su=S.setup||{},nM=su.majors??(MAP_SIZES[S.size]||{}).majors??1,nO=Math.round(((MAP_SIZES[S.size]||{}).outposts??2)*[0.5,1,1.6][su.outposts??1]);
    const keepers=HEROES.filter(x=>x.rogue&&!(S.jailed||[]).includes(x.id)).map(x=>x.id).sort(()=>R()-0.5);
    const far=p=>[...bases,...S.objs.filter(o=>o.type==='camp')].every(q=>Math.max(Math.abs(q.x-p.x),Math.abs(q.y-p.y))>=7);
    const spotAt=(lo,hi)=>{for(let t=0;t<12;t++){const p=freeTile(dist,...band(lo,hi),4);if(p&&far(p))return p;}return freeTile(dist,...band(0.2,1),3);};
    for(let i=0;i<nM;i++){const lo=0.3+0.4*i/Math.max(1,nM),p=spotAt(lo,Math.min(1,lo+0.35));if(!p)continue;const d=dist.get(idx(p.x,p.y))/Math.max(1,md);
      const g1=neutralAt(clamp(d+0.2,0.3,1)),g2=neutralAt(clamp(d+0.3,0.3,1)),g3=neutralAt(clamp(d,0.2,1));
      add({type:'camp',free:true,major:true,lvl:3,fac:pick(FAC_ORDER),x:p.x,y:p.y,owned:false,garrison:[{k:g1.k,n:Math.round(g1.n*2.4)},{k:g2.k,n:Math.round(g2.n*1.6)},{k:g3.k,n:Math.round(g3.n*1.5)}].filter((a,j,arr)=>arr.findIndex(q=>q.k===a.k)===j),pool:{}});}
    for(let i=0;i<nO;i++){const lo=0.2+0.6*i/Math.max(1,nO),p=spotAt(lo,Math.min(1,lo+0.35));if(!p)continue;const d=dist.get(idx(p.x,p.y))/Math.max(1,md);
      // village or town: farther out they are bigger, richer and better guarded; some are held by a rogue hero
      const lvl=clamp(1+(R()<d?1:0),1,2),gm=[1,1.6][lvl-1],kp=d>0.25&&keepers.length&&R()<0.65?keepers.pop():null;
      const g1=neutralAt(clamp(d,0.15,1)),g2=neutralAt(clamp(d+0.1,0.15,1));
      add({type:'camp',free:true,lvl,fac:pick(FAC_ORDER),x:p.x,y:p.y,owned:false,keeper:kp,garrison:[{k:g1.k,n:Math.round(g1.n*gm*(kp?1.2:1))},{k:g2.k,n:Math.ceil(g2.n/2*gm)}].filter((a,j,arr)=>arr.findIndex(q=>q.k===a.k)===j),pool:{}});
      if(kp)(S.jailed=S.jailed||[]).push(kp);}}
  placeSpires(bases,add);
  S.uid=uid;
}
/* a saved editor map as a world: camps get the rival banners in order; extra camps are dropped */
function customWorld(m,rivalFacs){const objs=JSON.parse(JSON.stringify(m.objs));
  const camps=objs.filter(o=>o.type==='camp'&&!o.free);camps.forEach((o,i)=>{o.fac=i<rivalFacs.length?rivalFacs[i]:null;});
  const keep=objs.filter(o=>o.type!=='camp'||o.fac);let uid=1;keep.forEach(o=>{o.id=uid++;});
  const town=keep.find(o=>o.type==='town');
  return{tiles:[...m.tiles],objs:keep,town:{x:town.x,y:town.y},uid,rivalSpots:keep.filter(o=>o.type==='camp'&&!o.free).map(o=>({x:o.x,y:o.y,fac:o.fac})),underY:m.underY||0,rivers:m.rivers||null,bridges:m.bridges||null,noFurnish:m.extras===false};}
function newGame(fk,hid,mo={}){
  const cm=mo.custom?loadMaps().find(x=>x.id===mo.custom):null;if(cm)mo.size=cm.size;
  const sz=MAP_SIZES[mo.size||'small'],type=cm?'custom':mo.type||'wheel';W=cm?cm.W:sz.W;H=cm?cm.H:sz.H;
  const seed=mo.seed??((Math.random()*1e9)|0);
  const nR=cm?cm.objs.filter(o=>o.type==='camp'&&!o.free).length:clamp(mo.rivals??sz.rivals,1,type==='rivers'?4:6);
  const rivalFacs=mo.players?mo.players.slice(1).map(p=>p.fk):FAC_ORDER.filter(k=>k!==fk).sort(()=>Math.random()-0.5).slice(0,nR);
  const w=cm?customWorld(cm,rivalFacs):genMap(seed,{type,fac:fk,rivals:rivalFacs});const f=FAC[fk];
  const [t1,t2]=f.units;
  S={v:3,roster:2,ids27:1,seed,fac:fk,W,H,mapType:type,size:mo.size||'small',limit:sz.limit,tiles:w.tiles,objs:w.objs,uid:w.uid+10,biome:w.biome||'vale',underY:w.underY||0,rivers:w.rivers||null,bridges:w.bridges||null,explored:new Array(W*H).fill(0),day:1,
    res:{...DIFF[mo.diff||'normal'].res},diff:mo.diff||'normal',heroes:[],cur:0,rivals:[],rumours:[],delivered:[],setup:{majors:mo.majors,outposts:mo.outposts},
    town:{x:w.town.x,y:w.town.y,name:f.town,built:{hall1:1,d1:1,d2:1,lib1:1},pool:{[t1]:U[t1].growth,[t2]:U[t2].growth},garrison:[],builtToday:false},
    over:false};
  const h=mkHero(hid,w.town.x,w.town.y);h.army=[{k:t1,n:Math.round(240/U[t1].hp)},{k:t2,n:Math.round(90/U[t2].hp)}];S.heroes.push(h);
  HERO().mana=maxMana();HERO().mp=maxMP();
  if(mo.artifact){const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].lvl<=3&&!(h.items||[]).includes(k));if(pool.length){const it=pick(pool);giveItem(h,it);S.startArt=it;}}
  if(!mo.players)w.rivalSpots.forEach(p=>{const rh=pick(HEROES.filter(x=>x.fac===p.fac&&!x.rogue&&!x.tav));S.rivals.push(mkRival(rh.id,p.x,p.y));});
  // wild monsters roll a level: weak, normal, strong or elite (elites guard loot)
  {const home=S.town,maxD=Math.hypot(W,H);for(const o of S.objs){if(o.type!=='neutral'||o.guard||o.lvl)continue;const d=Math.hypot(o.x-home.x,o.y-home.y)/maxD,r=Math.random()+d*0.5;
    o.lvl=r<0.35?1:r<0.85?2:r<1.15?3:4;o.n=Math.max(1,Math.round(o.n*[0,0.6,1,1.4,1.9][o.lvl]*monMul()));}}
  for(const o of S.objs)if((o.type==='neutral'&&(o.guard||o.key))||o.type==='relic')o.n=Math.max(1,Math.round(o.n*monMul()));
  for(const o of S.objs)if(o.type==='camp'&&o.fac&&!o.free){const u=FAC[o.fac].units;Object.assign(o,{major:true,built:{hall1:1,d1:1,d2:1,lib1:1},name:FAC[o.fac].town,pool:{}});o.garrison=[{k:u[0],n:Math.round(160*rvMul()/U[u[0]].hp)},{k:u[1],n:Math.round(90*rvMul()/U[u[1]].hp)}];}
  S.mode=mo.mode||'relic';setMode(S.mode);
  if(S.mode==='grail'){const rel=S.objs.filter(o=>o.type==='relic'),lair=rel.find(o=>o.r===6),rest=rel.filter(o=>o.r<4);
    S.objs=S.objs.filter(o=>o.type!=='relic');rest.forEach(o=>{const G=GRAILS[o.r];S.objs.push({...o,k:G.k,n:ri(G.n[0],G.n[1]),roam:true});});
    if(lair)S.objs.push({...lair,r:4,k:GRAILS[4].k,n:GRAILS[4].n[0]});
    S.goal=[0,1,2,3,4].sort(()=>Math.random()-0.5).slice(0,3).sort();}
  else S.goal=S.mode==='conquest'?[]:[0,1,2,3,4,5,6];
  {const fsp=FAC_SPELLS[fk];S.objs.filter(o=>o.type==='shrine').forEach((o,i)=>o.spell=fsp[(i+2)%fsp.length]);}
  reveal(S.town.x,S.town.y,6);reveal(HERO().x,HERO().y,vision());
  addRumour(true);
  if(mo.players){
    S.objs.find(o=>o.type==='town').owner=0;S.players=[{name:'Player 1'}];S.pi=0;stashPlayer();
    mo.players.slice(1).forEach((pp,j)=>{const sp=w.rivalSpots[j];if(!sp)return;const pi=S.players.length,f2=FAC[pp.fk];
      S.objs=S.objs.filter(o=>!(Math.abs(o.x-sp.x)<=1&&o.y>=sp.y-2&&o.y<=sp.y+1));
      for(let dy=-2;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const x=sp.x+dx,y=sp.y+dy;if(inb(x,y)&&S.tiles[idx(x,y)]!==T.LAKE)S.tiles[idx(x,y)]=dy===1&&dx===0?T.ROAD:T.GRASS;}
      S.objs.push({type:'town',x:sp.x,y:sp.y,owner:pi,id:S.uid++});
      const[u1,u2]=f2.units,h2=mkHero(pp.hid,sp.x,sp.y);h2.army=[{k:u1,n:Math.round(240/U[u1].hp)},{k:u2,n:Math.round(90/U[u2].hp)}];if(mo.artifact){const pool=Object.keys(ITEMS).filter(k=>ITEMS[k].lvl<=3&&!(h2.items||[]).includes(k));if(pool.length)giveItem(h2,pick(pool));}
      S.players.push({name:`Player ${pi+1}`,fac:pp.fk,town:{x:sp.x,y:sp.y,name:f2.town,built:{hall1:1,d1:1,d2:1,lib1:1},pool:{[u1]:U[u1].growth,[u2]:U[u2].growth},garrison:[],builtToday:false},
        res:{...DIFF[mo.diff||'normal'].res},heroes:[h2],cur:0,explored:new Array(W*H).fill(0),delivered:[],rumours:[],goal:[0,1,2,3,4,5,6]});});
    rebuildFoot();
    for(let j=1;j<S.players.length;j++){loadPlayer(j);HERO().mana=maxMana();HERO().mp=maxMP();reveal(S.town.x,S.town.y,6);addRumour(true);stashPlayer();}
    loadPlayer(0);
  }
  rebuildFoot();
  if(!w.noFurnish){const bases=[{x:S.town.x,y:S.town.y,fac:S.fac},...(S.players?S.players.slice(1).map(q=>({x:q.town.x,y:q.town.y,fac:q.fac})):S.rivals.map(r=>({x:r.x,y:r.y,fac:r.fac})))];furnishMap(bases);if(!cm)S.accessFixed=ensureAccess(bases);}
}
function reveal(cx,cy,r){for(let y=cy-r;y<=cy+r;y++)for(let x=cx-r;x<=cx+r;x++)if(inb(x,y)&&(x-cx)**2+(y-cy)**2<=r*r+1)S.explored[idx(x,y)]=1;}
const vision=()=>5+skL('farsight')+(fx().vision||0)+(S&&S.heroes?gear(HERO(),'vision'):0)+(S&&S.delivered&&delivered(0)?1:0);
const maxMana=()=>Math.round(hst(HERO(),'lore')*10*(1+0.25*skL('deepres')));
function maxMP(){const sp=HERO().army.length?Math.min(...HERO().army.map(a=>U[a.k].spd+((fx().unitSpd||{})[a.k]||0))):5;
  let m=900+45*Math.min(sp,9);if(HERO().mount!=='foot')m*=1.4;m*=1+0.1*skL('forcedmarch');m*=1+(gear(HERO(),'mpPct')+(fx().mpPct||0))/100;if(S.event&&S.event.k==='road')m*=1.1;return Math.round(m);}
const xpFor=l=>Math.round(1000*l*(1+0.12*(l-1)));
const income=()=>(S.town.taken?0:hallGold(S.town))+S.heroes.reduce((a,h)=>a+250*skLevel(h,'estates')+gear(h,'goldDay')+((HBY[h.id]&&HBY[h.id].fx||{}).goldDay||0),0)+S.objs.filter(o=>o.type==='camp'&&o.owned===ME()).reduce((a,o)=>a+campIncome(o),0);
function dateParts(d=S.day){const m=Math.floor((d-1)/28)+1,w=Math.floor(((d-1)%28)/7)+1,dd=(d-1)%7+1;return{m,w,d:dd};}
const LIMIT=112;
function terrainCost(x,y){
  const t=tileAt(x,y);
  if(t===T.LAKE){const sea=carry(HERO(),'sea');if(HERO().boat){const sl=skL('seamanship');return sea?Math.min(45,[65,45,39,33][sl]):[65,45,39,33][sl];}if(FAC[S.fac].travel==='swim')return sea?40:50;return Infinity;}
  if(!passableT(t))return Infinity;
  let c=TCOST[t];if(FAC[S.fac].travel==='swim')c=Math.round(c*1.5);if((t===T.HEATH||t===T.BOG)&&gear(HERO(),'bogFree'))c=100;if((t===T.HEATH||t===T.BOG)&&fx().terrainCut)c*=fx().terrainCut;return c;
}
function stepCost(ax,ay,bx,by){const c=terrainCost(bx,by);return Math.round((Math.abs(ax-bx)===1&&Math.abs(ay-by)===1)?c*1.414:c);}

/* -------- terrain prerender -------- */
let terrainCv=null,terrainPh=null;
/* Terrain art (assets/terrain, native 32px grid). Until every file loads, or if one fails, the drawn terrain below is used. */
const TA_N=32,TA_ROW={meadow:0,forest_floor:1,dry_grass:2,dirt:3,sand:4,rocky:5,snow:6,swamp:7,ash:8,cobblestone:9,water:10};
const TA_EDGES=['dry_grass','dirt','swamp','forest_floor','rocky','sand','ash'];
const GROVES=['oak_grove','pine_stand','birch_copse','autumn_grove','old_growth_thicket','crescent_tree_line'],ROCKS=['sandstone_boulders','ochre_rock_ledge','taupe_granite_pair','umber_slate_ledge'],GROUNDS=['brown_rubble_fan','taupe_pebble_scatter'];
const TA_SCEN=[...GROVES,...ROCKS,...GROUNDS,'oak','pine','autumn_tree','dead_tree','mountain_gray','mountain_snow','ochre_hill','flowers_meadow','flowers_blue','shrub','reeds','mushrooms','boulder','fallen_log',
  'silver_birch','weeping_willow','red_maple','blue_cedar','coastal_palm','ridge_spine','rocky_shoulder','foothill_chain','snowy_saddle','split_boulder','leaning_monolith','basalt_columns','stone_arch','lighthouse','shipwreck'];
const TA_FILES=['terrain/ground_atlas.png','terrain/water_anim.png','terrain/roads/cobblestone.png',...TA_EDGES.map(f=>`terrain/edges/${f}.png`),...[0,1,2,3].map(p=>`terrain/edges/water_${p}.png`),...[0,1,2,3].map(p=>`terrain/edges/river_${p}.png`),'terrain/scenery/bridge_ew.png','terrain/scenery/bridge_ns.png',...TA_SCEN.map(k=>`terrain/scenery/${k}.png`)];
let terrArtReady=false;
function loadTerrainArt(){let left=0;for(const p of TA_FILES){const a=artImg(p);if(!a.ok){left++;a.img.addEventListener('load',()=>{if(--left===0){terrArtReady=true;if(S&&!bt)renderTerrain();}},{once:true});}}if(!left)terrArtReady=true;artImg('terrain/fire/campfire.png');artImg('terrain/fire/torch.png');}
const taImg=p=>artImg('terrain/'+p).img;
function renderTerrainArt(){
  const N=TA_N,g=mulberry32(S.seed^0x7f4a7c15);
  const hv=(a,b)=>{let h=Math.imul(a+1013,374761393)^Math.imul(b+7919,668265263)^S.seed;h=Math.imul(h^(h>>>13),1274126177);return(h^(h>>>16))>>>0;};
  const mk=()=>{const cv=document.createElement('canvas');cv.width=W*N;cv.height=H*N;const c=cv.getContext('2d');c.imageSmoothingEnabled=false;return[cv,c];};
  const tl=(x,y)=>S.tiles[idx(clamp(x,0,W-1),clamp(y,0,H-1))];
  const near4=(x,y,t)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>inb(x+a,y+b)&&S.tiles[idx(x+a,y+b)]===t);
  const atlas=taImg('ground_atlas.png');
  const cell=(c,img,code,X,Y)=>c.drawImage(img,(code%4)*N,(code>>2)*N,N,N,X,Y,N,N);
  // dual grid: each overlay cell sits on a tile corner, and its four corners are the four tiles that meet there
  const corners=(test,draw)=>{for(let vy=0;vy<=H;vy++)for(let vx=0;vx<=W;vx++){
    const code=(test(vx-1,vy-1)?1:0)|(test(vx,vy-1)?2:0)|(test(vx,vy)?4:0)|(test(vx-1,vy)?8:0);if(code)draw(code,vx*N-N/2,vy*N-N/2,vx,vy);}};
  const [gcv,gc]=mk();
  const uY=S.underY||0,under=y=>uY&&y>=uY,RV=new Set(S.rivers||[]),BR=new Map((S.bridges||[]).map(b=>[b.i,b.ori]));
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)gc.drawImage(atlas,(hv(x,y)%4)*N,(under(y)?TA_ROW.ash:0)*N,N,N,x*N,y*N,N,N);
  const lakeNear4=(x,y)=>[[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>{if(!inb(x+a,y+b))return false;const j=idx(x+a,y+b);return S.tiles[j]===T.LAKE&&!RV.has(j);});
  const layers=[['dry_grass',t=>t===T.HEATH],['dirt',t=>t===T.DIRT],['swamp',t=>t===T.BOG],['forest_floor',t=>t===T.FOREST],['rocky',t=>t===T.CRAG],
    ['sand',(t,x,y)=>{const i=idx(clamp(x,0,W-1),clamp(y,0,H-1));return(t===T.LAKE&&!RV.has(i))||(passableT(t)&&!BR.has(i)&&lakeNear4(clamp(x,0,W-1),clamp(y,0,H-1)));}]];
  for(const [f,is] of layers){const img=taImg(`edges/${f}.png`);
    corners((x,y)=>is(tl(x,y),x,y),(code,X,Y,vx,vy)=>code===15?gc.drawImage(atlas,(hv(vx,vy)%4)*N,TA_ROW[f]*N,N,N,X,Y,N,N):cell(gc,img,code,X,Y));}
  // roads and scenery go on their own layer, above the water
  const [scv,sc]=mk();
  const road=new Set();for(let i=0;i<W*H;i++)if(S.tiles[i]===T.ROAD)road.add(i);
  for(const i of[...road]){const x=i%W,y=(i/W)|0;for(const dx of[1,-1]){const nx=x+dx,ny=y+1;if(!inb(nx,ny)||!road.has(idx(nx,ny))||road.has(idx(nx,y))||road.has(idx(x,ny)))continue;
    road.add(passableT(S.tiles[idx(nx,y)])?idx(nx,y):idx(x,ny));}}// a diagonal step gets a corner tile so the road looks joined
  const rimg=taImg('roads/cobblestone.png'),R=(x,y)=>inb(x,y)&&road.has(idx(x,y));
  for(const i of road){if(BR.has(i))continue;const x=i%W,y=(i/W)|0;cell(sc,rimg,(R(x,y-1)?1:0)|(R(x+1,y)?2:0)|(R(x,y+1)?4:0)|(R(x-1,y)?8:0),x*N,y*N);}
  for(const[i,ori]of BR){const img=taImg(`scenery/bridge_${ori}.png`),X=(i%W)*N+16,Y=((i/W)|0)*N+16;sc.drawImage(img,Math.round(X-img.width/2),Math.round(Y-img.height/2));}
  const busy=new Set(S.objs.map(o=>idx(o.x,o.y)));for(const i of FOOT)busy.add(i);for(const i of BR.keys())busy.add(i);for(const i of road)busy.add(i);
  const props=[],P=(k,x,y)=>props.push({k,x,y}),j=s=>Math.round((g()-0.5)*s);
  const crag=(x,y)=>inb(x,y)&&S.tiles[idx(x,y)]===T.CRAG,peaks=[],hills=[],pick2=a=>a[Math.floor(g()*a.length)];
  const cr=[];for(let i=0;i<W*H;i++)if(S.tiles[i]===T.CRAG)cr.push(i);
  for(let i=cr.length-1;i>0;i--){const k=Math.floor(g()*(i+1));[cr[i],cr[k]]=[cr[k],cr[i]];}
  for(const i of cr){const x=i%W,y=(i/W)|0;
    if(crag(x-1,y)&&crag(x+1,y)&&!peaks.some(p=>Math.abs(p.x-x)<2&&Math.abs(p.y-y)<2)){peaks.push({x,y});P(y<H*0.34&&!under(y)&&!(uY&&y>=uY-1)?'mountain_snow':'mountain_gray',x*N+16,y*N+30);}}
  // between the peaks: ridge and shoulder modules along runs of crag, single rocks where the crag is thin
  const north=y=>y<H*0.34&&!under(y)&&!(uY&&y>=uY-1);
  for(const i of cr){const x=i%W,y=(i/W)|0;if(peaks.some(p=>Math.abs(p.x-x)<=1&&Math.abs(p.y-y)<=1))continue;
    if(hills.some(p=>Math.abs(p.x-x)<=(p.w||1)&&Math.abs(p.y-y)<=0)||hills.some(p=>Math.max(Math.abs(p.x-x),Math.abs(p.y-y))<=0)){P('boulder',x*N+16+j(10),y*N+26+j(4));continue;}
    const run2=crag(x-1,y)&&crag(x+1,y)&&crag(x+2,y),run1=crag(x-1,y)&&crag(x+1,y);
    if(run2){hills.push({x,y,w:2});P(north(y)?'snowy_saddle':'ridge_spine',x*N+32,y*N+30);}
    else if(run1){hills.push({x,y,w:1});P(under(y)?'basalt_columns':pick2(['rocky_shoulder','foothill_chain']),x*N+16,y*N+30);}
    else if(!hills.some(p=>Math.max(Math.abs(p.x-x),Math.abs(p.y-y))<=1)){hills.push({x,y,w:0});P(under(y)?pick2(['leaning_monolith','split_boulder','umber_slate_ledge','taupe_granite_pair']):pick2(['ochre_hill','split_boulder','sandstone_boulders','ochre_rock_ledge','umber_slate_ledge','taupe_granite_pair','leaning_monolith']),x*N+16+j(4),y*N+30);}
    else P('boulder',x*N+16+j(10),y*N+26+j(4));}
  // the waterfront: a wreck out on open water, and the odd lighthouse on a shore
  {let wrecks=Math.round(W/30),lights=Math.round(W/30);for(let k=0;k<600&&(wrecks>0||lights>0);k++){const x=2+Math.floor(g()*(W-4)),y=2+Math.floor(g()*(H-4)),i=idx(x,y);
    if(wrecks>0&&S.tiles[i]===T.LAKE&&!RV.has(i)&&[-1,0,1].every(a=>[-1,0,1].every(b=>S.tiles[idx(x+a,y+b)]===T.LAKE))&&!busy.has(i)){P('shipwreck',x*N+16,y*N+28);busy.add(i);wrecks--;}
    else if(lights>0&&S.tiles[i]===T.GRASS&&!busy.has(i)&&!busy.has(i-W)&&lakeNear4(x,y)&&!under(y)){P('lighthouse',x*N+16,y*N+30);busy.add(i);lights--;}}}
  // a few landmarks on open meadow: stone arches
  {let arches=Math.round(W/22);for(let k=0;k<400&&arches>0;k++){const x=1+Math.floor(g()*(W-2)),y=2+Math.floor(g()*(H-3));if(under(y))continue;
    const ok=[-1,0,1].every(dx=>{const i=idx(x+dx,y);return S.tiles[i]===T.GRASS&&!busy.has(i)&&!busy.has(i-W);});if(!ok)continue;
    P('stone_arch',x*N+16,y*N+30);for(const dx of[-1,0,1])busy.add(idx(x+dx,y));arches--;}}
  /* groves: one painted stand of trees covers a block of forest (its base rows), and single trees fill the rest */
  const grove=new Set();
  {const fz=(x,y)=>inb(x,y)&&S.tiles[idx(x,y)]===T.FOREST&&!under(y)&&!busy.has(idx(x,y))&&!grove.has(idx(x,y));
    for(let y=H-2;y>=2;y--)for(let x=1;x<W-6;x++){if(hv(x*7,y*13)%5)continue;const zz=S.biome==='autumn'&&hv(x>>2,y>>2)%3?1:S.biome==='high'&&hv(x>>2,y>>2)%2?0:hv(x>>2,y>>2)%6;
      const k=hv(x,y)%7===0?'old_growth_thicket':hv(x,y)%7===1?'crescent_tree_line':zz===0||zz===3?'pine_stand':zz===1?'autumn_grove':zz===2||zz===4?'birch_copse':'oak_grove';
      const img=taImg(`scenery/${k}.png`),tw=Math.round((img.width||160)/N),th=Math.round((img.height||128)/N);
      let ok=true;for(let dy=0;dy<2&&ok;dy++)for(let dx=0;dx<tw&&ok;dx++)if(!fz(x+dx,y-dy))ok=false;if(!ok)continue;
      for(let dy=0;dy<th;dy++)for(let dx=0;dx<tw;dx++){const xx=x+dx,yy=y-dy;if(inb(xx,yy)&&S.tiles[idx(xx,yy)]===T.FOREST)grove.add(idx(xx,yy));}
      P(k,x*N+tw*N/2,(y+1)*N);}}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const t=S.tiles[idx(x,y)],r=g(),X=x*N+16,Y=y*N+28;
    if(t===T.FOREST&&grove.has(idx(x,y)))continue;
    if(t===T.FOREST&&under(y)){P(hv(x,y)%4?'dead_tree':'pine',X+j(8),Y+2+j(4));continue;}
    if(t===T.FOREST){
      // groves by region: pine and cedar, oak and birch, maples and autumn trees; willows by marsh, palms on the shore
      if(lakeNear4(x,y)&&hv(x,y)%2===0){P(hv(x,y)%4===0?'weeping_willow':'coastal_palm',X+j(6),Y+2);continue;}
      if(near4(x,y,T.BOG)){P(hv(x,y)%3===0?'weeping_willow':hv(x,y)%3===1?'dead_tree':'pine',X+j(6),Y+2);continue;}
      const z=S.biome==='autumn'&&hv(x>>2,y>>2)%3?1:S.biome==='high'&&hv(x>>2,y>>2)%2?0:hv(x>>2,y>>2)%6,h2=hv(x,y)%4;
      const k=z===0?(h2?'pine':'blue_cedar'):z===1?(h2<2?'red_maple':'autumn_tree'):z===2?(h2<2?'silver_birch':'oak'):z===3?(h2?'blue_cedar':'pine'):z===4?(h2?'oak':'silver_birch'):(h2===0?'dead_tree':h2===1?'red_maple':'oak');
      P(k,X+j(8),Y+2+j(4));continue;}
    if(busy.has(idx(x,y)))continue;
    const edge=near4(x,y,T.FOREST)||near4(x,y,T.CRAG)||lakeNear4(x,y),dk=edge?1:0.2;
    if(t===T.BOG){if(r<0.14*dk)P('reeds',X+j(14),Y+j(8));}
    else if(t===T.HEATH){if(r<0.06*dk)P('shrub',X+j(14),Y+j(8));else if(r<0.08*dk)P('flowers_blue',X+j(14),Y+j(8));else if(r<0.095*dk)P(pick2(GROUNDS),X+j(10),Y+j(6));}
    else if(t===T.GRASS&&under(y)){if(r<0.08)P('mushrooms',X+j(14),Y+j(8));else if(r<0.12)P('boulder',X+j(14),Y+j(8));}
    else if(t===T.GRASS){const fr=near4(x,y,T.FOREST);
      if(fr&&r<0.05)P('mushrooms',X+j(14),Y+j(8));else if(fr&&r<0.08)P('fallen_log',X,Y+j(6));
      else if(r<0.035*dk)P('flowers_meadow',X+j(14),Y+j(8));else if(r<0.05*dk)P('flowers_blue',X+j(14),Y+j(8));else if(r<0.08*dk)P('shrub',X+j(14),Y+j(8));else if(r<0.1*dk)P(near4(x,y,T.CRAG)&&r<0.093*dk?pick2(['sandstone_boulders','taupe_granite_pair']):'boulder',X+j(14),Y+j(8));}
    else if(t===T.DIRT&&r<0.06)P(r<0.03?pick2(GROUNDS):'boulder',X+j(14),Y+j(8));}
  props.sort((a,b)=>a.y-b.y);
  for(const p of props){const img=taImg(`scenery/${p.k}.png`);sc.drawImage(img,Math.round(p.x-img.width/2),Math.round(p.y-img.height+4));}
  const lake=(x,y)=>tl(x,y)===T.LAKE&&!RV.has(idx(clamp(x,0,W-1),clamp(y,0,H-1))),anim=taImg('water_anim.png');
  const RC=(x,y)=>!inb(x,y)||RV.has(idx(x,y));
  // big maps keep fewer water frames in memory
  const phs=W*H>4500?[0]:W*H>3000?[0,2]:[0,1,2,3];
  terrainPh=phs.map(ph=>{const [cv,c]=mk();c.drawImage(gcv,0,0);const img=taImg(`edges/water_${ph}.png`);
    corners(lake,(code,X,Y,vx,vy)=>code===15?c.drawImage(anim,(hv(vx,vy)%4)*N,ph*N,N,N,X,Y,N,N):cell(c,img,code,X,Y));
    if(RV.size){const rimg2=taImg(`edges/river_${ph}.png`);for(const i of RV){const x=i%W,y=(i/W)|0;cell(c,rimg2,(RC(x,y-1)?1:0)|(RC(x+1,y)?2:0)|(RC(x,y+1)?4:0)|(RC(x-1,y)?8:0),x*N,y*N);}}
    c.drawImage(scv,0,0);
    if(uY){c.fillStyle='rgba(34,8,64,.30)';c.fillRect(0,uY*N,W*N,(H-uY)*N);c.fillStyle='rgba(10,4,20,.35)';c.fillRect(0,uY*N,W*N,2*N);}
    return cv;});
  terrainCv=terrainPh[0];
}
function drawFire(c,k,x,y,off=0){const a=artImg(`terrain/fire/${k}.png`);if(!a.ok)return;const d=[140,110,130,150];let t=(performance.now()+off)%530,f=0;while(f<3&&t>=d[f])t-=d[f++];
  c.imageSmoothingEnabled=false;c.drawImage(a.img,f*32,0,32,32,Math.round(x-22),Math.round(y-38.5),44,44);}
function renderTerrain(){
  if(terrArtReady){try{renderTerrainArt();return;}catch(e){console.warn('terrain art',e);}}
  terrainPh=null;
  const cv=document.createElement('canvas');cv.width=W*TS;cv.height=H*TS;const c=cv.getContext('2d');
  const g=mulberry32(S.seed^0x5bd1e995);
  const base=['#4f6c35','#7b6a46','#a28c5b','#6a5a4f','#3f5139','#4c6a31','#57564f','#2a4b5e'];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    let t=tileAt(x,y);const bt=(t===T.FOREST||t===T.CRAG)?T.GRASS:t;
    c.fillStyle=base[bt];c.fillRect(x*TS,y*TS,TS,TS);
    c.fillStyle=`rgba(${g()<0.5?'0,0,0':'255,255,220'},${g()*0.06})`;c.fillRect(x*TS,y*TS,TS,TS);
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const t=tileAt(x,y),X=x*TS,Y=y*TS;
    if(t===T.GRASS||t===T.FOREST||t===T.CRAG){for(let i=0;i<9;i++){c.fillStyle=g()<0.5?'#5f7f3f':'#45602d';c.fillRect(Math.round(X+g()*TS),Math.round(Y+g()*TS),2,3);}}
    if(t===T.HEATH){for(let i=0;i<12;i++){c.fillStyle=g()<0.5?'#8a6a8f':'#7a6845';c.fillRect(Math.round(X+g()*TS),Math.round(Y+g()*TS),3,3);}}
    if(t===T.BOG){for(let i=0;i<3;i++){c.fillStyle='rgba(36,60,62,.8)';c.beginPath();c.ellipse(X+6+g()*(TS-12),Y+6+g()*(TS-12),4+g()*6,2+g()*3,0,0,7);c.fill();}
      for(let i=0;i<4;i++){c.fillStyle='#62774a';c.fillRect(Math.round(X+g()*TS),Math.round(Y+g()*TS),1,6);}}
    if(t===T.ROAD||t===T.DIRT){for(let i=0;i<5;i++){c.fillStyle=t===T.ROAD?'#c4ad78':'#8d7a52';c.fillRect(Math.round(X+g()*TS),Math.round(Y+g()*TS),4,3);}}
    if(t===T.LAKE){
      for(let i=0;i<2;i++){c.fillStyle='rgba(170,210,220,.3)';const wx=Math.round(X+6+g()*(TS-18)),wy=Math.round(Y+8+g()*(TS-14));c.fillRect(wx,wy,8,2);c.fillRect(wx+10,wy+2,6,2);}
      const sh=[[0,-1,X,Y,TS,4],[0,1,X,Y+TS-4,TS,4],[-1,0,X,Y,4,TS],[1,0,X+TS-4,Y,4,TS]];
      for(const [ax,ay,rx,ry,rw,rh] of sh){const nx=x+ax,ny=y+ay;if(inb(nx,ny)&&tileAt(nx,ny)!==T.LAKE){c.fillStyle='#b9a77a';c.fillRect(rx,ry,rw,rh);}}
    }
  }
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const t=tileAt(x,y),X=x*TS,Y=y*TS;
    if(t===T.FOREST){for(let i=0;i<4;i++){const tx=X+8+g()*(TS-16),ty=Y+14+g()*(TS-16),s=9+g()*5;
      c.fillStyle='#3a2a18';c.fillRect(tx-1.5,ty,3,5);c.fillStyle=g()<0.5?'#25432a':'#2f5530';c.beginPath();c.moveTo(tx,ty-s*1.6);c.lineTo(tx+s*0.75,ty+1);c.lineTo(tx-s*0.75,ty+1);c.closePath();c.fill();
      c.fillStyle='rgba(255,255,200,.08)';c.beginPath();c.moveTo(tx,ty-s*1.6);c.lineTo(tx-s*0.75,ty+1);c.lineTo(tx-s*0.2,ty+1);c.closePath();c.fill();}}
    if(t===T.CRAG){for(let i=0;i<2;i++){const mx=X+10+g()*(TS-20),my=Y+TS-6-g()*6,s=13+g()*8;
      c.fillStyle='#6d6b63';c.beginPath();c.moveTo(mx-s,my);c.lineTo(mx-s*0.1,my-s*1.5);c.lineTo(mx+s,my);c.closePath();c.fill();
      c.fillStyle='#8f8c82';c.beginPath();c.moveTo(mx-s*0.1,my-s*1.5);c.lineTo(mx+s,my);c.lineTo(mx+s*0.2,my);c.closePath();c.fill();
      c.fillStyle='#e8e4d6';c.beginPath();c.moveTo(mx-s*0.1,my-s*1.5);c.lineTo(mx-s*0.35,my-s*1.1);c.lineTo(mx+s*0.15,my-s*1.15);c.closePath();c.fill();}}
  }
  terrainCv=cv;
}

/* -------- map view -------- */
const mapCv=$('#map'),mctx=mapCv.getContext('2d');
/* map overview in the corner: explored land by terrain, towns, camps, heroes and visible rivals, and the frame of the current view */
const miniCv=$('#mini');let miniT=0,miniOff=false;
function drawMini(){if(!S)return;$('#miniwrap').hidden=false;if(miniOff)return;const k=Math.max(2,Math.floor(Math.min(190/W,150/H))),w=W*k,h=H*k;
  if(miniCv.width!==w*2||miniCv.height!==h*2){miniCv.width=w*2;miniCv.height=h*2;miniCv.style.width=w+'px';miniCv.style.height=h+'px';}
  const c=miniCv.getContext('2d');c.setTransform(2,0,0,2,0,0);c.fillStyle='#0a0c0b';c.fillRect(0,0,w,h);
  const all=!!S.editor||!S.explored;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x;if(!all&&!S.explored[i])continue;const t=S.tiles[i];c.fillStyle=S.underY&&y>=S.underY&&t!==T.LAKE&&t!==T.ROAD?'#4a4250':ED_TCOL[t];c.fillRect(x*k,y*k,k,k);}
  const dot=(x,y,col,r=k)=>{c.fillStyle=col;c.fillRect(x*k+k/2-r,y*k+k/2-r,r*2,r*2);};
  for(const o of S.objs){if(!all&&!S.explored[idx(o.x,o.y)])continue;
    if(o.type==='town')dot(o.x,o.y,ownerCol(o.owner||true),k*1.4);
    else if(o.type==='camp')dot(o.x,o.y,o.owned?ownerCol(o.owned):'#c9c2ae',k*1.1);
    else if(o.type==='mine'&&o.owned)dot(o.x,o.y,ownerCol(o.owned),k*0.7);
    else if(o.type==='relic')dot(o.x,o.y,'#f2d382',k*0.9);}
  if(S.heroes)for(const hh of S.heroes){dot(hh.x,hh.y,'#000',k*1.2);dot(hh.x,hh.y,teamCol(),k*0.9);}
  if(S.rivals&&!S.editor)for(const rv of S.rivals)if(seenNow(rv.x,rv.y))dot(rv.x,rv.y,'#e04a3a',k*0.9);else if(rv.seen&&S.day-rv.seen.day<=7)dot(rv.seen.x,rv.seen.y,'rgba(224,74,58,.45)',k*0.7);
  c.strokeStyle='#fff3c8';c.lineWidth=1;c.strokeRect(camX/TS*k+0.5,camY/TS*k+0.5,vw/TS*k,vh/TS*k);}
miniCv.addEventListener('pointerdown',e=>{if(!S)return;e.stopPropagation();const r=miniCv.getBoundingClientRect(),k=r.width/W;centerOn(Math.floor((e.clientX-r.left)/k),Math.floor((e.clientY-r.top)/k));});
$('#miniTog').addEventListener('click',e=>{e.stopPropagation();miniOff=!miniOff;$('#miniwrap').classList.toggle('off',miniOff);$('#miniTog').textContent=miniOff?'▸ Map':'▾';if(!miniOff)drawMini();});
let dpr=1,vw=0,vh=0,camX=0,camY=0,camTX=null,camTY=null;
let path=null,hoverTile=null,moving=false;
const heroDraw={x:0,y:0};
function sizeMap(){const r=mapCv.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);vw=r.width;vh=r.height;mapCv.width=Math.max(1,vw*dpr);mapCv.height=Math.max(1,vh*dpr);clampCam();}
function clampCam(){const mw=W*TS,mh=H*TS;camX=mw<vw?(mw-vw)/2:clamp(camX,0,mw-vw);camY=mh<vh?(mh-vh)/2:clamp(camY,0,mh-vh);}
function centerOn(x,y,instant){const tx=x*TS+TS/2-vw/2,ty=y*TS+TS/2-vh/2;if(instant){camX=tx;camY=ty;clampCam();camTX=camTY=null;}else{camTX=tx;camTY=ty;}}

/* The town fills a 3 x 3 tile footprint; its gate is the bottom-centre tile. */
function drawTown(c,cx,by,fk=S.fac,tw=S.town){
  {const sp=townSprite(fk,townStage(tw),FAC[fk].col);if(sp){const k=TS/32;c.imageSmoothingEnabled=false;
    c.drawImage(sp,Math.round(cx-64*k),Math.round(by-92*k),Math.round(128*k),Math.round(96*k));
    const top=by-92*k;c.font='700 12px "Alegreya SC",Georgia,serif';c.textAlign='center';const nmw=c.measureText(tw.name).width+12;
    c.fillStyle='rgba(16,20,19,.85)';c.fillRect(cx-nmw/2,top-8,nmw,17);c.strokeStyle=FAC[fk].col;c.lineWidth=1;c.strokeRect(cx-nmw/2,top-8,nmw,17);c.fillStyle='#f2d382';c.fillText(tw.name,cx,top+5);return;}}
  const f=FAC[fk],stage=tw.built.hall3?2:tw.built.hall2?1:0,t=performance.now()/400;
  const L=cx-62,Rr=cx+62,top=by-112;
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,by-4,70,14,0,0,7);c.fill();
  // ground plate
  c.fillStyle='#6b6152';c.fillRect(L+4,by-34,Rr-L-8,30);
  // back buildings
  const g=mulberry32(hash(fk));
  for(let i=0;i<6+stage*2;i++){const x=L+12+g()*(Rr-L-36),h=18+g()*18;c.fillStyle='#a69c84';c.strokeStyle='#2b261c';c.lineWidth=1.2;c.fillRect(x,by-40-h,16,h);c.strokeRect(x,by-40-h,16,h);
    c.fillStyle=f.col;c.beginPath();c.moveTo(x-3,by-40-h);c.lineTo(x+8,by-52-h);c.lineTo(x+19,by-40-h);c.closePath();c.fill();c.stroke();c.fillStyle='#2b2418';c.fillRect(x+6,by-34-h+4,4,5);}
  // keep
  const kh=44+stage*14;c.fillStyle='#b8ae94';c.strokeStyle='#2b261c';c.fillRect(cx-16,by-30-kh,32,kh);c.strokeRect(cx-16,by-30-kh,32,kh);
  for(let i=0;i<4;i++)c.fillRect(cx-16+i*9,by-36-kh,5,6);
  c.fillStyle='#2b2418';for(let i=0;i<stage+2;i++)c.fillRect(cx-3,by-24-kh+12+i*14,6,8);
  // banner
  c.strokeStyle='#2b261c';c.beginPath();c.moveTo(cx,by-36-kh);c.lineTo(cx,by-58-kh);c.stroke();
  c.fillStyle=f.col;c.beginPath();c.moveTo(cx,by-58-kh);c.quadraticCurveTo(cx+10,by-60-kh+Math.sin(t)*2,cx+20,by-55-kh);c.lineTo(cx,by-48-kh);c.closePath();c.fill();
  c.fillStyle=f.col2;c.fillRect(cx+3,by-55-kh,4,3);
  // walls + towers
  c.fillStyle='#8f8672';c.strokeStyle='#2b261c';c.fillRect(L,by-34,Rr-L,28);c.strokeRect(L,by-34,Rr-L,28);
  for(let x=L;x<Rr;x+=10)c.fillRect(x,by-40,6,6);
  for(const tx of[L,Rr]){c.fillStyle='#a69c84';c.fillRect(tx-9,by-56,18,50);c.strokeRect(tx-9,by-56,18,50);c.fillStyle=f.col;c.beginPath();c.moveTo(tx-12,by-56);c.lineTo(tx,by-74);c.lineTo(tx+12,by-56);c.closePath();c.fill();c.stroke();}
  // gate
  c.fillStyle='#2b1d10';c.beginPath();c.moveTo(cx-11,by-6);c.lineTo(cx-11,by-22);c.arc(cx,by-22,11,Math.PI,0);c.lineTo(cx+11,by-6);c.closePath();c.fill();
  c.strokeStyle=f.col2;c.lineWidth=1;for(let x=cx-8;x<=cx+8;x+=4){c.beginPath();c.moveTo(x,by-28);c.lineTo(x,by-6);c.stroke();}
  drawFire(c,'torch',cx-19,by-2,0);drawFire(c,'torch',cx+19,by-2,260);
  // name plate
  c.font='700 12px "Alegreya SC",Georgia,serif';c.textAlign='center';const nmw=c.measureText(tw.name).width+12;
  c.fillStyle='rgba(16,20,19,.85)';c.fillRect(cx-nmw/2,top-6,nmw,17);c.strokeStyle=f.col;c.strokeRect(cx-nmw/2,top-6,nmw,17);c.fillStyle='#f2d382';c.fillText(tw.name,cx,top+7);
}
function flag(c,x,y,col){c.strokeStyle='#1a1610';c.lineWidth=1.2;c.beginPath();c.moveTo(x,y);c.lineTo(x,y-14);c.stroke();c.fillStyle=col;c.beginPath();c.moveTo(x,y-14);c.lineTo(x+10,y-11);c.lineTo(x,y-7);c.closePath();c.fill();}
function token(c,k,cx,cy,r,ring){
  {const a=ENEMY_ART[k]&&artImg(`map/guards/${ENEMY_ART[k]}_32.png`);if(a&&a.ok){const fy=cy+r*0.8,sz=Math.round(r*(['ogre','troll','drake'].includes(k)?3.4:2.7));c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,fy,r*0.95,r*0.32,0,0,7);c.fill();c.strokeStyle=ring;c.lineWidth=2;c.beginPath();c.ellipse(cx,fy,r*1.02,r*0.36,0,0,7);c.stroke();
    c.imageSmoothingEnabled=false;c.drawImage(a.img,Math.round(cx-sz/2),Math.round(fy-sz*0.9),sz,sz);return;}}
  c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+r*0.85,r,r*0.35,0,0,7);c.fill();
  c.fillStyle='#1b211e';c.beginPath();c.arc(cx,cy,r,0,7);c.fill();c.strokeStyle=ring;c.lineWidth=2.4;c.stroke();drawUnit(c,k,cx,cy,r*0.8);
}
function drawObj(c,o){
  const cx=o.x*TS+TS/2,cy=o.y*TS+TS/2;c.lineWidth=1.2;
  switch(o.type){
  case 'town':{const td=townData(o);drawTown(c,cx,o.y*TS+TS,td.fac,td.town);break;}
  case 'neutral':token(c,o.k,cx,cy,o.guard?19:16,o.lvl===4?'#ffd24a':o.lvl===3?'#ff8a3d':o.lvl===1?'#8cbc70':'#c45a43');if(o.lvl===4){c.fillStyle='#ffd24a';c.strokeStyle='#120f0b';c.lineWidth=1;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r2=i%2?2.5:5.5;c.lineTo(cx+13+Math.cos(a)*r2,cy-13+Math.sin(a)*r2);}c.closePath();c.fill();c.stroke();}if(o.guard)drawStat(c,'def',cx+15,cy-15,8);break;
  case 'relic':
    if(o.roam){token(c,o.k,cx,cy+2,15,'#c45a43');drawRelic(c,o.r,cx,cy-20,8);break;}
    c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(cx,cy+14,26,8,0,0,7);c.fill();
    if(o.r===6&&(spriteAt(c,'map/buildings/glass_lair.png',cx,cy+TS/2+2,TS/32*0.75)||spriteAt(c,'map/sites/glass_lair_lit.png',cx,cy+TS/2+2,TS/32*0.75))){}
    else if(o.r!==6&&spriteAt(c,`map/buildings/${['forest','forest','ruined','desert','ruined','frost'][o.r%6]}_relic_lair.png`,cx,cy+TS/2,TS/32*0.7)){}
    else if(o.r===6){for(const [dx,h,w] of[[-16,26,7],[16,22,6],[-6,32,8],[8,30,7]]){c.fillStyle='#5aa4ad';c.strokeStyle='#d9f6f8';c.beginPath();c.moveTo(cx+dx-w,cy+12);c.lineTo(cx+dx,cy+12-h);c.lineTo(cx+dx+w,cy+12);c.closePath();c.fill();c.stroke();}}
    else{c.fillStyle='#7a766c';c.strokeStyle='#26241f';c.fillRect(cx-19,cy-14,7,26);c.strokeRect(cx-19,cy-14,7,26);c.fillRect(cx+12,cy-14,7,26);c.strokeRect(cx+12,cy-14,7,26);c.fillRect(cx-21,cy-20,42,7);c.strokeRect(cx-21,cy-20,42,7);}
    drawRelic(c,o.r,cx,cy-(o.r===6?24:4),8);token(c,o.k,cx+(o.r===6?0:12),cy+(o.r===6?2:8),o.r===6?15:10,'#c45a43');break;
  case 'drop':drawRelic(c,o.rs[0],cx,cy,10);break;
  case 'camp':{const col=FAC[o.fac||o.dfac||'necro'].col,gn=(o.garrison||[]).reduce((a,g)=>a+g.n,0);
    // major towns (free ones, and rival homes once captured) stand as real towns, with their name
    if(o.free&&!isMajor(o)&&wxAt(c,'outpost',cx,cy+TS/2-2,TS/32*0.8)){if(o.owned)flag(c,cx+18,cy-2,ownerCol(o.owned));{const sh=artImg(`shields/${o.fac}_96.png`);if(sh.ok)c.drawImage(sh.img,cx-27,cy-16,16,16);}
      if(gn&&!S.editor){c.font='800 12px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const tt=o.owned===ME()?fmt(gn):'?',w=c.measureText(tt).width+10;c.fillStyle='rgba(12,18,48,.92)';c.fillRect(cx-w/2,cy+17,w,14);c.strokeStyle=o.owned?ownerCol(o.owned):'#c45a43';c.lineWidth=1.2;c.strokeRect(cx-w/2,cy+17,w,14);c.fillStyle='#fff';c.fillText(tt,cx,cy+24.5);}
      break;}
    if(o.fac&&isMajor(o)&&(o.built||o.free)){const sp=townSprite(o.fac,o.built?townStage(o):2,o.owned?ownerCol(o.owned):o.free?'#9a958a':FAC[o.fac].col);if(sp){const k=TS/32*0.82,by=cy+TS/2-2;
      c.imageSmoothingEnabled=false;c.drawImage(sp,Math.round(cx-64*k),Math.round(by-92*k),Math.round(128*k),Math.round(96*k));
      const nm=o.owned===ME()||o.name?campName(o):'Free town',top=by-92*k;c.font='700 11px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='alphabetic';const nw=c.measureText(nm).width+10;
      c.fillStyle='rgba(16,20,19,.85)';c.fillRect(cx-nw/2,top-6,nw,15);c.strokeStyle=o.owned?ownerCol(o.owned):'#9a958a';c.lineWidth=1;c.strokeRect(cx-nw/2,top-6,nw,15);c.fillStyle='#f2d382';c.fillText(nm,cx,top+5);
      if(o.owned)flag(c,cx+30,cy+6,ownerCol(o.owned));
      if(gn&&!S.editor){c.font='800 12px "Alegreya SC",Georgia,serif';c.textBaseline='middle';const tt=o.owned===ME()?fmt(gn):'?',w=c.measureText(tt).width+10;c.fillStyle='rgba(12,18,48,.92)';c.fillRect(cx-w/2,cy+17,w,14);c.strokeStyle=o.owned?ownerCol(o.owned):'#c45a43';c.lineWidth=1.2;c.strokeRect(cx-w/2,cy+17,w,14);c.fillStyle='#fff';c.fillText(tt,cx,cy+24.5);}
      break;}}
    {const fk2=o.fac||o.dfac||'necro',sp=townSprite(fk2,o.free?Math.min(3,o.lvl||1):1,o.owned?ownerCol(o.owned):o.free?'#9a958a':FAC[fk2].col);const csp=!o.free&&artImg(`map/buildings/camp_${fk2}.png`);if((csp&&csp.ok)||sp){const k=TS/32*0.62;c.imageSmoothingEnabled=false;if(csp&&csp.ok)spriteAt(c,`map/buildings/camp_${fk2}.png`,cx,cy+TS/2-2,TS/32*0.85);else c.drawImage(sp,Math.round(cx-64*k),Math.round(cy+TS/2-2-92*k),Math.round(128*k),Math.round(96*k));
      if(o.owned)flag(c,cx+24,cy+8,ownerCol(o.owned));
      if(gn&&!S.editor){c.font='800 12px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const tt=o.owned===ME()?fmt(gn):'?',w=c.measureText(tt).width+10;c.fillStyle='rgba(12,18,48,.92)';c.fillRect(cx-w/2,cy+17,w,14);c.strokeStyle=o.owned?ownerCol(o.owned):'#c45a43';c.lineWidth=1.2;c.strokeRect(cx-w/2,cy+17,w,14);c.fillStyle='#fff';c.fillText(tt,cx,cy+24.5);}
      if(!o.free&&!S.editor)drawFire(c,'campfire',cx-26,cy+20,o.x*97+o.y*31);break;}}
    if(o.free){c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+13,22,6,0,0,7);c.fill();c.strokeStyle='#1a1610';c.lineWidth=1.2;
      for(const[dx,hh]of[[-9,14],[6,18]]){c.fillStyle='#cdbf9c';c.fillRect(cx+dx-7,cy+12-hh,14,hh);c.strokeRect(cx+dx-7,cy+12-hh,14,hh);c.fillStyle=o.owned?ownerCol(o.owned):col;c.beginPath();c.moveTo(cx+dx-10,cy+12-hh);c.lineTo(cx+dx,cy+2-hh);c.lineTo(cx+dx+10,cy+12-hh);c.closePath();c.fill();c.stroke();c.fillStyle='#2a1d12';c.fillRect(cx+dx-2,cy+6,4,6);}
      c.fillStyle='#7a5432';for(let x=-20;x<=17;x+=5){c.fillRect(cx+x,cy+8,4,7);}
      if(o.owned)flag(c,cx+18,cy+2,ownerCol(o.owned));
      if(gn){c.font='800 12px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const tt=o.owned===ME()?fmt(gn):'?',w=c.measureText(tt).width+10;c.fillStyle='rgba(12,18,48,.92)';c.fillRect(cx-w/2,cy+17,w,14);c.strokeStyle=o.owned?ownerCol(o.owned):'#c45a43';c.strokeRect(cx-w/2,cy+17,w,14);c.fillStyle='#fff';c.fillText(tt,cx,cy+24.5);}
      break;}
    if(o.owned){flag(c,cx-20,cy+10,ownerCol(o.owned));}
    if(gn&&!S.editor){c.font='800 12px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const tt=o.owned===ME()?fmt(gn):'?',w=c.measureText(tt).width+10;c.fillStyle='rgba(12,18,48,.92)';c.fillRect(cx-w/2,cy+17,w,14);c.strokeStyle=o.owned?ownerCol(o.owned):'#c45a43';c.lineWidth=1.2;c.strokeRect(cx-w/2,cy+17,w,14);c.fillStyle='#fff';c.fillText(tt,cx,cy+24.5);}c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+13,20,6,0,0,7);c.fill();
    c.fillStyle=col;c.strokeStyle='#1a1610';c.lineWidth=1.2;c.beginPath();c.moveTo(cx-18,cy+12);c.lineTo(cx-4,cy-12);c.lineTo(cx+10,cy+12);c.closePath();c.fill();c.stroke();
    c.fillStyle='#2b1d10';c.beginPath();c.moveTo(cx-8,cy+12);c.lineTo(cx-4,cy+2);c.lineTo(cx,cy+12);c.closePath();c.fill();flag(c,cx+13,cy+8,col);drawFire(c,'campfire',cx-15,cy+19,o.x*97+o.y*31);break;}
  case 'mine':{
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+13,18,5,0,0,7);c.fill();
    {const ma=MINE_ART[o.k],sc=TS/32*0.66,by=cy+TS/2-2;if(o.k==='moon'||o.k==='gem'){const ok=wxAt(c,o.k,cx,by,sc);
        if(ok){
          for(let i=0;i<(o.lvl||1);i++){c.fillStyle='#f2d382';c.strokeStyle='#120f0b';c.lineWidth=1;c.fillRect(cx-9+i*7,by-1,5,5);c.strokeRect(cx-9+i*7,by-1,5,5);}
          if(o.owned)flag(c,cx+14,cy-8,ownerCol(o.owned));break;}}
      if(ma&&spriteAt(c,`map/mines/${ma[0]}.png`,cx,by,sc,2,450)){
      for(let i=0;i<(o.lvl||1);i++){c.fillStyle='#f2d382';c.strokeStyle='#120f0b';c.lineWidth=1;c.fillRect(cx-9+i*7,by-1,5,5);c.strokeRect(cx-9+i*7,by-1,5,5);}
      if(o.owned){const fa=artImg(`map/flags/${flagFor(ownerCol(o.owned))}.png`);if(fa.ok){const f=Math.floor(performance.now()/180)%2;c.drawImage(fa.img,f*16,0,16,16,Math.round(cx+(ma[1]-32)*sc),Math.round(by+(ma[2]-60)*sc),Math.round(16*sc*1.8),Math.round(16*sc*1.8));}else flag(c,cx+12,cy-6,ownerCol(o.owned));}
      break;}}
    if(o.k==='saw'){c.fillStyle='#7a5432';c.strokeStyle='#2a1a0c';c.fillRect(cx-12,cy-4,18,16);c.strokeRect(cx-12,cy-4,18,16);c.fillStyle='#4d3520';c.beginPath();c.moveTo(cx-15,cy-4);c.lineTo(cx-3,cy-14);c.lineTo(cx+9,cy-4);c.closePath();c.fill();drawRes(c,'timber',cx+11,cy+8,7);}
    else if(o.k==='amber'){for(const [dx,h] of[[-8,14],[0,22],[8,16]]){c.fillStyle='#e0871f';c.strokeStyle='#5a2c05';c.beginPath();c.moveTo(cx+dx-5,cy+12);c.lineTo(cx+dx,cy+12-h);c.lineTo(cx+dx+5,cy+12);c.closePath();c.fill();c.stroke();}}
    else{c.fillStyle='#6b665c';c.strokeStyle='#2a2823';c.beginPath();c.moveTo(cx-18,cy+12);c.quadraticCurveTo(cx,cy-22,cx+18,cy+12);c.closePath();c.fill();c.stroke();c.fillStyle='#14110c';c.beginPath();c.arc(cx,cy+12,8,Math.PI,0);c.fill();
      if(o.k==='gold'){c.fillStyle='#f2c94c';for(const [a,b] of[[-10,4],[9,2],[-4,-6],[5,-4]])c.fillRect(cx+a-1.5,cy+b-1.5,3,3);}else drawRes(c,'ore',cx+12,cy+9,6);}
    for(let i=0;i<(o.lvl||1);i++){c.fillStyle='#f2d382';c.strokeStyle='#120f0b';c.lineWidth=1;c.fillRect(cx-9+i*7,cy+15,5,5);c.strokeRect(cx-9+i*7,cy+15,5,5);}
    if(o.owned)flag(c,cx+12,cy-6,ownerCol(o.owned));break;}
  case 'prison':{if(wxAt(c,'prison',cx,cy+TS/2-2,TS/32*0.75))break;c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+14,19,6,0,0,7);c.fill();c.strokeStyle='#1a1610';c.lineWidth=1.4;
    c.fillStyle='#7d7a72';c.fillRect(cx-16,cy-14,32,28);c.strokeRect(cx-16,cy-14,32,28);c.fillStyle='#5f5c55';for(let i=0;i<4;i++){c.fillRect(cx-16+i*9,cy-20,6,6);c.strokeRect(cx-16+i*9,cy-20,6,6);}
    c.fillStyle='#2a2522';c.fillRect(cx-9,cy-6,18,20);c.strokeStyle='#b8b4aa';c.lineWidth=1.6;c.beginPath();for(const dx of[-6,-2,2,6]){c.moveTo(cx+dx,cy-6);c.lineTo(cx+dx,cy+14);}c.stroke();
    if(o.rogue&&!S.heroes.some(x=>x.id===o.rogue)){c.fillStyle='#f2d382';c.font='800 13px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('!',cx,cy-28);}break;}
  case 'pile':if(o.k==='moonwater'||o.k==='gems'){if(wxAt(c,o.k+'_pile',cx,cy+TS/2-4,TS/32*0.7))break;}if(PILE_ART.has(o.k)&&spriteAt(c,`map/pickups/${o.k==='timber'?'wood':o.k}.png`,cx,cy+TS/2-4,TS/32,2,400))break;c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+12,11,4,0,0,7);c.fill();drawRes(c,o.k,cx,cy+2,11);break;
  case 'flot':{const t=performance.now()/500;c.fillStyle='rgba(200,230,240,.35)';c.beginPath();c.ellipse(cx,cy+12,13,4,0,0,7);c.fill();if(!spriteAt(c,`ocean/${o.k}.png`,cx,cy+12+Math.sin(t+o.y)*1.5,TS/32*0.85,o.k==='floating_chest'?4:1,250)){c.fillStyle='#a07040';c.fillRect(cx-6,cy-4,12,10);}break;}
  case 'gem':{const t=performance.now()/500;c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+12,10,4,0,0,7);c.fill();if(!spriteAt(c,`gems/${o.k}.png`,cx,cy+10+Math.sin(t+o.x)*1.5,TS/32*0.85)){c.fillStyle='#c46bff';c.beginPath();c.arc(cx,cy,7,0,7);c.fill();}break;}
  case 'site':{const spent=o.week===weekNo();c.globalAlpha=spent?0.55:1;c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+12,16,5,0,0,7);c.fill();c.strokeStyle='#26241f';c.lineWidth=1.2;
    if(o.k==='wish'&&spriteAt(c,'map/sites/wishing_well.png',cx,cy+TS/2-2,TS/32*0.75)){}
    else if((o.k==='woodcamp'||o.k==='orecart'||o.k==='amberhollow')&&wxAt(c,o.k,cx,cy+TS/2-2,TS/32*0.75)){}
    else if(o.k==='clover'&&spriteAt(c,'map/sites/four_leaf_clover.png',cx,cy+TS/2-4,TS/32)){}
    else if(o.k==='wish'){c.fillStyle='#8a867a';c.beginPath();c.ellipse(cx,cy+5,12,6,0,0,7);c.fill();c.stroke();c.fillStyle=spent?'#2c3a4a':'#5f9fd0';c.beginPath();c.ellipse(cx,cy+4,8,3.5,0,0,7);c.fill();
      c.fillStyle='#6b4a2e';c.fillRect(cx-11,cy-14,3,18);c.fillRect(cx+8,cy-14,3,18);c.fillStyle='#8b3a2a';c.beginPath();c.moveTo(cx-15,cy-12);c.lineTo(cx,cy-22);c.lineTo(cx+15,cy-12);c.closePath();c.fill();c.stroke();if(!spent){c.fillStyle='#f2c94c';c.fillRect(cx-2,cy-4,3,3);}}
    else if(o.k==='clover'){c.fillStyle='#4f8a3a';c.beginPath();c.ellipse(cx,cy+6,15,7,0,0,7);c.fill();for(const [dx,dy] of[[-4,-4],[4,-4],[-4,4],[4,4]]){c.fillStyle='#6cc25a';c.beginPath();c.arc(cx+dx,cy-4+dy,4.5,0,7);c.fill();c.stroke();}c.strokeStyle='#2e5a22';c.beginPath();c.moveTo(cx,cy-4);c.lineTo(cx+3,cy+8);c.stroke();}
    else if(o.k==='woodcamp'){drawRes(c,'timber',cx-6,cy+4,9);c.fillStyle='#8a8a92';c.beginPath();c.moveTo(cx+8,cy-10);c.lineTo(cx+15,cy-6);c.lineTo(cx+10,cy-2);c.closePath();c.fill();c.strokeStyle='#5a3a1e';c.lineWidth=2;c.beginPath();c.moveTo(cx+10,cy-6);c.lineTo(cx+4,cy+6);c.stroke();}
    else if(o.k==='orecart'){c.fillStyle='#5a4a3a';c.fillRect(cx-13,cy-6,26,12);c.strokeRect(cx-13,cy-6,26,12);drawRes(c,'ore',cx,cy-8,7);c.fillStyle='#2a2823';c.beginPath();c.arc(cx-8,cy+8,4,0,7);c.arc(cx+8,cy+8,4,0,7);c.fill();}
    else if(o.k==='amberhollow'){c.fillStyle='#5d3b1d';c.fillRect(cx-3,cy-6,6,18);c.fillStyle='#3f6b3a';c.beginPath();c.arc(cx,cy-12,11,0,7);c.fill();c.stroke();if(!spent){drawRes(c,'amber',cx+7,cy+2,5);drawRes(c,'amber',cx-6,cy-4,4);}}
    c.globalAlpha=1;break;}
  case 'artifact':{{const ia=artImg(`artifacts/${ITEM_ICON[o.item]||'sun_amulet'}.png`);if(ia.ok){const col=ITEM_COLS[ITEMS[o.item].lvl],t=performance.now()/400,g=c.createRadialGradient(cx,cy,1,cx,cy,20);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy,20,0,7);c.fill();
      c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+13,11,4,0,0,7);c.fill();const z=Math.round(TS*0.68);c.imageSmoothingEnabled=false;c.drawImage(ia.img,Math.round(cx-z/2),Math.round(cy-z/2-3+Math.sin(t)*1.5),z,z);break;}}
    const col=ITEM_COLS[ITEMS[o.item].lvl],t=performance.now()/400;const g=c.createRadialGradient(cx,cy-2,1,cx,cy-2,16);g.addColorStop(0,col);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.beginPath();c.arc(cx,cy-2,16,0,7);c.fill();
    c.fillStyle='#8a867a';c.strokeStyle='#26241f';c.lineWidth=1.2;c.fillRect(cx-9,cy+4,18,8);c.strokeRect(cx-9,cy+4,18,8);
    c.fillStyle=col;c.beginPath();c.moveTo(cx,cy-12+Math.sin(t)*2);c.lineTo(cx+6,cy-3);c.lineTo(cx,cy+3);c.lineTo(cx-6,cy-3);c.closePath();c.fill();c.stroke();
    c.fillStyle='#120f0b';c.font='700 9px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText(String(ITEMS[o.item].lvl),cx,cy+8);break;}
  case 'chest':if(spriteAt(c,`map/chests/${(o.x*7+o.y*3)%5===0?'iron':'wood'}_closed_idle.png`,cx,cy+TS/2-4,TS/32,2,500))break;c.fillStyle='#7a4e24';c.strokeStyle='#2a170a';c.beginPath();c.roundRect(cx-11,cy-6,22,15,3);c.fill();c.stroke();c.fillStyle='#d4ab52';c.fillRect(cx-11,cy-1,22,3);c.fillRect(cx-2,cy-2,4,6);break;
  case 'stone':{const st=o.stat==='pow'?'lore':o.stat,sty=o.style||FAC_ORDER[(o.id||o.x+o.y)%8],used=(o.usedBy||[]).includes(HERO()&&HERO().id);c.globalAlpha=used?0.55:1;const ok=spriteAt(c,`sites/stones/${sty}/${st}.png`,cx,cy+TS/2-2,TS/32*0.7);c.globalAlpha=1;if(ok){if(o.stat==='pow'){c.save();c.translate(cx+12,cy-14);drawStat(c,'pow',0,0,6);c.restore();}break;}}
    c.fillStyle='#7f7c74';c.strokeStyle='#26241f';c.beginPath();c.moveTo(cx-7,cy+13);c.lineTo(cx-8,cy-8);c.lineTo(cx-1,cy-16);c.lineTo(cx+7,cy-9);c.lineTo(cx+8,cy+13);c.closePath();c.fill();c.stroke();
    if(!o.used){c.save();c.translate(cx,cy-2);drawStat(c,o.stat,0,0,6);c.restore();}break;
  case 'sage':{const used=(o.used||[]).includes(HERO()&&HERO().id);c.globalAlpha=used?0.6:1;
    if(spriteAt(c,'sites/sage.png',cx,cy+TS/2-2,TS/32*0.85)){c.globalAlpha=1;break;}
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+13,19,5,0,0,7);c.fill();c.strokeStyle='#1d1610';c.lineWidth=1.3;
    c.fillStyle='#d8c9a6';c.fillRect(cx-14,cy-6,28,19);c.strokeRect(cx-14,cy-6,28,19);
    c.fillStyle='#2f5bb8';c.beginPath();c.moveTo(cx-18,cy-6);c.lineTo(cx,cy-20);c.lineTo(cx+18,cy-6);c.closePath();c.fill();c.stroke();
    for(const[dx,col]of[[-9,'#b33a3a'],[-5,'#2e7d4f'],[-1,'#d9a42b'],[3,'#3b5bc4']]){c.fillStyle=col;c.fillRect(cx+dx,cy-1,3,9);}
    c.fillStyle='#3a2410';c.fillRect(cx+7,cy+2,5,11);c.globalAlpha=1;break;}
  case 'altar':{const col=ALTAR_COL[o.tier],t=performance.now()/400;
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.ellipse(cx,cy+12,17,5,0,0,7);c.fill();
    const gr=c.createRadialGradient(cx,cy-8,1,cx,cy-8,18);gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');c.globalAlpha=0.55+0.25*Math.sin(t);c.fillStyle=gr;c.beginPath();c.arc(cx,cy-8,18,0,7);c.fill();c.globalAlpha=1;
    if(spriteAt(c,'sites/altar.png',cx,cy+TS/2-2,TS/32*0.75)){for(let k=0;k<o.tier;k++){c.fillStyle=col;c.strokeStyle='#120f0b';c.lineWidth=1;c.fillRect(cx-9+k*7,cy+14,5,5);c.strokeRect(cx-9+k*7,cy+14,5,5);}break;}
    c.fillStyle='#8d8a96';c.strokeStyle='#1d1a24';c.lineWidth=1.3;c.fillRect(cx-13,cy+1,26,11);c.strokeRect(cx-13,cy+1,26,11);c.fillRect(cx-9,cy-4,18,6);c.strokeRect(cx-9,cy-4,18,6);
    c.fillStyle=col;c.beginPath();c.moveTo(cx,cy-20+Math.sin(t)*1.5);c.lineTo(cx+5,cy-11);c.lineTo(cx,cy-6);c.lineTo(cx-5,cy-11);c.closePath();c.fill();c.stroke();
    for(let k=0;k<o.tier;k++){c.fillStyle=col;c.fillRect(cx-7+k*6,cy+5,4,4);}break;}
  case 'shrine':if(spriteAt(c,`map/sites/wayshrine_${HERO()&&HERO().spells.includes(o.spell)?'spent':'lit'}.png`,cx,cy+TS/2-2,TS/32*0.6))break;c.fillStyle='#9c9786';c.strokeStyle='#26241f';c.fillRect(cx-6,cy-2,12,14);c.strokeRect(cx-6,cy-2,12,14);c.fillRect(cx-9,cy+10,18,4);
    {const gr=c.createRadialGradient(cx,cy-8,1,cx,cy-8,10);gr.addColorStop(0,'#e2f0ff');gr.addColorStop(0.5,'#6f8fd8');gr.addColorStop(1,'rgba(111,143,216,0)');c.fillStyle=gr;c.beginPath();c.arc(cx,cy-8,10,0,7);c.fill();}break;
  case 'well':if(spriteAt(c,`map/sites/moonwell_${o.day===S.day?'spent':'lit'}.png`,cx,cy+TS/2-2,TS/32*0.6))break;c.fillStyle='#8a867a';c.strokeStyle='#26241f';c.beginPath();c.ellipse(cx,cy+4,14,8,0,0,7);c.fill();c.stroke();c.fillStyle=o.day===S.day?'#2c3a4a':'#7ab3e0';c.beginPath();c.ellipse(cx,cy+3,9,4.5,0,0,7);c.fill();break;
  case 'tower':if(spriteAt(c,`map/sites/watchtower_lit.png`,cx,cy+TS/2-2,TS/32*0.72))break;c.fillStyle='#8f8a7c';c.strokeStyle='#26241f';c.fillRect(cx-6,cy-20,12,32);c.strokeRect(cx-6,cy-20,12,32);for(let i=0;i<3;i++)c.fillRect(cx-6+i*5,cy-24,3,4);c.fillStyle='#14110c';c.fillRect(cx-2,cy-12,4,6);break;
  case 'portal':{const kind=S.underY&&o.y>=S.underY?'arcane':[[1,0],[-1,0],[0,1],[0,-1],[1,1],[-1,-1],[1,-1],[-1,1]].some(([a,b])=>inb(o.x+a,o.y+b)&&S.tiles[idx(o.x+a,o.y+b)]===T.LAKE)?'tidal':S.underY?'woodland':'arcane';
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+16,20,6,0,0,7);c.fill();if(spriteAt(c,`portals/${kind}.png`,cx,cy+TS/2-2,TS/32*0.75,4,150))break;}
  case 'portal-drawn':{const t=performance.now()/500;c.save();c.translate(cx,cy+2);
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(0,13,19,6,0,0,7);c.fill();
    const gl=c.createRadialGradient(0,-4,2,0,-4,26);gl.addColorStop(0,'rgba(214,120,255,.45)');gl.addColorStop(1,'rgba(214,120,255,0)');c.fillStyle=gl;c.beginPath();c.arc(0,-4,26,0,7);c.fill();
    c.fillStyle='#5d566c';c.strokeStyle='#15121c';c.lineWidth=1.4;c.beginPath();c.moveTo(-16,13);c.lineTo(-16,-8);c.arc(0,-8,16,Math.PI,0);c.lineTo(16,13);c.lineTo(10,13);c.lineTo(10,-8);c.arc(0,-8,10,0,Math.PI,true);c.lineTo(-10,13);c.closePath();c.fill();c.stroke();
    const gr=c.createRadialGradient(0,-2,1,0,-2,13);gr.addColorStop(0,'#fff0ff');gr.addColorStop(0.45,'#c46bff');gr.addColorStop(1,'#2e0d52');c.fillStyle=gr;c.beginPath();c.moveTo(-10,13);c.lineTo(-10,-8);c.arc(0,-8,10,Math.PI,0);c.lineTo(10,13);c.closePath();c.fill();
    c.strokeStyle='rgba(255,225,255,.85)';c.lineWidth=1.5;for(let k=0;k<2;k++){c.beginPath();c.ellipse(0,0,5+k*2.5,8+k*2,t*(k?-1:1)+k,0,4.2);c.stroke();}
    c.restore();break;}
  case 'spire':{const col=o.owned?ownerCol(o.owned):'#8d8a80',n=o.garrison.reduce((a,g)=>a+g.n,0);
    if(n){c.save();c.fillStyle=col;c.globalAlpha=0.13;c.fillRect(cx-TS*1.5+2,cy-TS*1.5+2,TS*3-4,TS*3-4);c.globalAlpha=0.9;c.strokeStyle=col;c.lineWidth=3;c.setLineDash([8,6]);c.strokeRect(cx-TS*1.5+2,cy-TS*1.5+2,TS*3-4,TS*3-4);c.restore();}
    c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(cx,cy+15,17,5,0,0,7);c.fill();c.strokeStyle='#15121c';c.lineWidth=1.4;
    if(spriteAt(c,'map/buildings/spire_tower.png',cx,cy+TS/2,TS/32*0.6)){if(o.owned){const fa=artImg(`map/flags/${flagFor(col)}.png`);if(fa.ok){const f=Math.floor(performance.now()/180)%2,z=TS/32*1.2;c.drawImage(fa.img,f*16,0,16,16,Math.round(cx-2),Math.round(cy-TS*1.25),Math.round(16*z),Math.round(16*z));}}}else{
    c.fillStyle='#a7a2b2';c.beginPath();c.moveTo(cx-12,cy+14);c.lineTo(cx-8,cy-14);c.lineTo(cx+8,cy-14);c.lineTo(cx+12,cy+14);c.closePath();c.fill();c.stroke();
    c.fillStyle='#d1ccdb';c.beginPath();c.moveTo(cx-12,cy+14);c.lineTo(cx-8,cy-14);c.lineTo(cx-3,cy-14);c.lineTo(cx-5,cy+14);c.closePath();c.fill();
    for(let i=0;i<3;i++){c.fillStyle='#a7a2b2';c.fillRect(cx-9+i*6.5,cy-19,4.5,5);c.strokeRect(cx-9+i*6.5,cy-19,4.5,5);}
    c.fillStyle=col;c.beginPath();c.moveTo(cx-10,cy-19);c.lineTo(cx,cy-38);c.lineTo(cx+10,cy-19);c.closePath();c.fill();c.stroke();
    c.fillStyle=n?'#ffd76a':'#2a2433';c.fillRect(cx-2.5,cy-8,5,8);c.fillStyle='#2a1d12';c.beginPath();c.arc(cx,cy+14,4.5,Math.PI,0);c.fill();
    if(o.owned)flag(c,cx+1,cy-36,col);}
    if(n){c.font='800 12px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const t=fmt(n),w=c.measureText(t).width+10;c.fillStyle='rgba(12,18,48,.92)';c.fillRect(cx-w/2,cy+16,w,14);c.strokeStyle=col;c.strokeRect(cx-w/2,cy+16,w,14);c.fillStyle='#fff';c.fillText(t,cx,cy+23.5);}
    break;}
  case 'dock':{const k=TS/32*0.55,wet=(a,b)=>inb(o.x+a,o.y+b)&&S.tiles[idx(o.x+a,o.y+b)]===T.LAKE;
    const ew=wet(1,0)||wet(-1,0),dx=wet(1,0)?TS*0.45:wet(-1,0)?-TS*0.45:0,dy=!ew&&wet(0,1)?TS*0.45:!ew&&wet(0,-1)?-TS*0.45:0;
    if(spriteAt(c,`waterfront/dock_${ew?'ew':'ns'}.png`,cx+dx,cy+TS/2-2+dy,k)){spriteAt(c,'waterfront/rowboat.png',cx+dx*1.6,cy+TS/2+dy*1.6,k*0.9);break;}}
  case 'dock-drawn':c.fillStyle='#7a5432';c.strokeStyle='#2a1a0c';c.fillRect(cx-16,cy+2,32,7);c.strokeRect(cx-16,cy+2,32,7);for(const x of[-14,-4,6])c.fillRect(cx+x,cy+9,3,7);
    c.save();c.translate(cx+2,cy-4);c.scale(0.7,0.7);drawTravelIcon(c,'boat');c.restore();break;
  case 'fair':if(wxAt(c,'fair',cx,cy+TS/2-2,TS/32*0.75))break;c.fillStyle='#8a5a32';c.strokeStyle='#2a1a0c';for(const x of[-16,-6,4,14])c.fillRect(cx+x,cy-2,3,14);c.fillRect(cx-16,cy+1,33,3);c.fillRect(cx-16,cy+7,33,3);
    c.save();c.translate(cx,cy-6);c.scale(0.75,0.75);drawTravelIcon(c,'horse');c.restore();break;
  }
}
function drawHero(c,x,y,h=HERO(),col=teamCol()){
  const cx=x*TS+TS/2,cy=y*TS+TS/2,t=performance.now()/300;
  const onLake=tileAt(Math.round(x),Math.round(y))===T.LAKE;
  const mode=onLake?(h.boat||h.fac==='pirates'?'boat':'swim'):(h.mount||(h.fac==='centaurs'?'hooves':'horse'));
  c.lineWidth=1.2;
  const sheet=mode!=='boat'&&mode!=='swim'?heroSheet(h.id,col):null;
  if(sheet){const row=Math.max(0,ART_DIRS.indexOf(h.face||'s')),fr=moving&&!bt&&h===HERO()?Math.floor(performance.now()/120)%4:0;
    c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(cx,cy+15,14,5,0,0,7);c.fill();c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(cx,cy+15,14,5,0,0,7);c.stroke();
    c.imageSmoothingEnabled=false;c.drawImage(sheet,fr*48,row*48,48,48,Math.round(cx-24),Math.round(cy+16-44),48,48);return;}
  if(mode==='boat'){const sl=tinted('waterfront/coastal_sloop.png','team_masks/waterfront/coastal_sloop.png',col);
    if(sl){const k=TS/32*0.6,flip=/w/.test(h.face||'');c.fillStyle='rgba(200,230,240,.35)';c.beginPath();c.ellipse(cx,cy+14,22,6,0,0,7);c.fill();c.save();c.translate(cx,0);if(flip)c.scale(-1,1);c.imageSmoothingEnabled=false;
      c.drawImage(sl,Math.round(-48*k),Math.round(cy+TS/2-2-92*k),Math.round(96*k),Math.round(96*k));c.restore();return;}
    c.fillStyle='rgba(200,230,240,.35)';c.beginPath();c.ellipse(cx,cy+12,20,5,0,0,7);c.fill();
    c.fillStyle='#7a4e24';c.strokeStyle='#1d140b';c.beginPath();c.moveTo(cx-18,cy+2);c.lineTo(cx+18,cy+2);c.lineTo(cx+12,cy+12);c.lineTo(cx-12,cy+12);c.closePath();c.fill();c.stroke();
    c.beginPath();c.moveTo(cx,cy+2);c.lineTo(cx,cy-24);c.stroke();
    c.fillStyle=col;c.beginPath();c.moveTo(cx+1,cy-23);c.quadraticCurveTo(cx+16+Math.sin(t)*2,cy-10,cx+1,cy);c.closePath();c.fill();c.stroke();
    c.fillStyle='#c99a78';c.beginPath();c.arc(cx-7,cy-3,3.5,0,7);c.fill();return;
  }
  if(mode==='swim'){
    c.strokeStyle='#bfe8f0';c.lineWidth=2;for(const r of[8,14]){c.beginPath();c.ellipse(cx,cy+4,r,r*0.35,0,0,7);c.stroke();}
    c.fillStyle='#7ac0c0';c.beginPath();c.arc(cx,cy-2,5,0,7);c.fill();c.fillStyle=col;c.beginPath();c.moveTo(cx-6,cy-4);c.lineTo(cx-12,cy-10);c.lineTo(cx-7,cy);c.closePath();c.fill();return;
  }
  c.fillStyle='rgba(0,0,0,.4)';c.beginPath();c.ellipse(cx,cy+13,15,5,0,0,7);c.fill();
  c.strokeStyle=col;c.lineWidth=2;c.beginPath();c.ellipse(cx,cy+13,15,5,0,0,7);c.stroke();c.lineWidth=1.2;
  if(mode==='horse'||mode==='hooves'){
    c.fillStyle=mode==='hooves'?'#a0703a':'#6b4a2e';c.strokeStyle='#1d140b';c.beginPath();c.ellipse(cx,cy+4,12,6,0,0,7);c.fill();c.stroke();
    if(mode==='horse'){c.beginPath();c.moveTo(cx+8,cy+2);c.lineTo(cx+15,cy-6);c.lineTo(cx+18,cy-4);c.lineTo(cx+12,cy+5);c.closePath();c.fill();c.stroke();}
    c.strokeStyle='#1d140b';c.lineWidth=2;c.beginPath();for(const lx of[-8,-4,5,9]){c.moveTo(cx+lx,cy+8);c.lineTo(cx+lx,cy+13);}c.stroke();
    c.fillStyle=col;c.beginPath();c.moveTo(cx-5+(mode==='hooves'?8:0),cy+2);c.lineTo(cx-3+(mode==='hooves'?8:0),cy-9);c.lineTo(cx+3+(mode==='hooves'?8:0),cy-9);c.lineTo(cx+4+(mode==='hooves'?8:0),cy+2);c.closePath();c.fill();
    c.fillStyle='#c99a78';c.beginPath();c.arc(cx+(mode==='hooves'?8:0),cy-12,3.5,0,7);c.fill();
  }else{
    const step=moving?Math.sin(t*3)*2:0;
    c.strokeStyle='#2a2018';c.lineWidth=2.4;c.beginPath();c.moveTo(cx,cy+2);c.lineTo(cx-3-step,cy+12);c.moveTo(cx,cy+2);c.lineTo(cx+3+step,cy+12);c.stroke();
    c.fillStyle=col;c.strokeStyle='#1d140b';c.lineWidth=1.2;c.beginPath();c.moveTo(cx-6,cy+4);c.lineTo(cx-4,cy-8);c.lineTo(cx+4,cy-8);c.lineTo(cx+6,cy+4);c.closePath();c.fill();c.stroke();
    c.fillStyle='#c99a78';c.beginPath();c.arc(cx,cy-12,4,0,7);c.fill();c.stroke();
  }
  c.strokeStyle='#e8dcb8';c.lineWidth=1.5;c.beginPath();c.moveTo(cx-8,cy+6);c.lineTo(cx-8,cy-26);c.stroke();
  c.fillStyle=col;c.beginPath();c.moveTo(cx-8,cy-26);c.quadraticCurveTo(cx,cy-28+Math.sin(t)*2,cx+7,cy-24);c.lineTo(cx+1,cy-20);c.lineTo(cx+7,cy-16);c.quadraticCurveTo(cx-1,cy-18+Math.sin(t+1)*2,cx-8,cy-17);c.closePath();c.fill();
  c.fillStyle=FAC[S.fac].col2;c.fillRect(cx-5,cy-24,3,3);
}
function drawMap(){
  if(!S||!terrainCv)return;
  {const t=performance.now();if(t-miniT>200){miniT=t;drawMini();}}
  if(camTX!==null){camX+=(camTX-camX)*0.18;camY+=(camTY-camY)*0.18;if(Math.abs(camTX-camX)<0.5&&Math.abs(camTY-camY)<0.5)camTX=camTY=null;}
  clampCam();
  const c=mctx;c.setTransform(dpr,0,0,dpr,0,0);c.imageSmoothingEnabled=false;c.fillStyle='#0a0c0b';c.fillRect(0,0,vw,vh);
  c.save();c.translate(-Math.round(camX),-Math.round(camY));
  {const tcv=terrainPh?terrainPh[Math.floor(performance.now()/(terrainPh.length===2?440:220))%terrainPh.length]:terrainCv,k=tcv.width/(W*TS),sx=Math.max(0,Math.floor(camX*k)),sy=Math.max(0,Math.floor(camY*k)),
    sw=Math.min(tcv.width-sx,Math.ceil(vw*k)+2),sh=Math.min(tcv.height-sy,Math.ceil(vh*k)+2);if(sw>0&&sh>0)c.drawImage(tcv,sx,sy,sw,sh,sx/k,sy/k,sw/k,sh/k);}
  const x0=Math.max(0,Math.floor(camX/TS)-2),y0=Math.max(0,Math.floor(camY/TS)-1),x1=Math.min(W-1,Math.ceil((camX+vw)/TS)+2),y1=Math.min(H-1,Math.ceil((camY+vh)/TS)+4);
  if(path&&path.length){
    let mp=HERO().mp,px=HERO().x,py=HERO().y,day=0;
    const mt=HERO().route&&HERO().route.meet?S.heroes.find(q=>q.id===HERO().route.meet):null;
    path.forEach((p,i)=>{const cost=stepCost(px,py,p.x,p.y);if(cost>mp){day++;mp=maxMP();}mp-=cost;if(shipSwap(HERO(),px,py,p.x,p.y))mp=0;px=p.x;py=p.y;
      const cx=p.x*TS+TS/2,cy=p.y*TS+TS/2,last=i===path.length-1;const o=last?objAt(p.x,p.y):null;
      c.fillStyle=day===0?'#9be07a':'#e0a65f';c.strokeStyle='#0b0d0c';c.lineWidth=1.5;
      if(last){
        if((o&&(o.type==='neutral'||o.type==='relic'))||rivalAt(p.x,p.y)){c.save();c.translate(cx+14,cy-14);drawStat(c,'atk',0,0,9);c.restore();}
        c.beginPath();c.moveTo(cx-2,cy+10);c.lineTo(cx-2,cy-12);c.lineTo(cx+10,cy-7);c.lineTo(cx-2,cy-3);c.closePath();c.fill();c.stroke();
        {const tt=day===0?'Today':day===1?'Tomorrow':`${day+1} days`;c.font='700 13px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const w=c.measureText(tt).width+12;
          c.fillStyle='rgba(12,18,48,.88)';c.fillRect(cx+4-w/2,cy+15,w,17);c.strokeStyle=day===0?'#9be07a':'#e0a65f';c.lineWidth=1.2;c.strokeRect(cx+4-w/2,cy+15,w,17);c.fillStyle='#f6ecc8';c.fillText(tt,cx+4,cy+24);c.textBaseline='alphabetic';}
        if(mt){const mx=mt.x*TS+TS/2,my=mt.y*TS-6;c.font='800 20px Georgia,serif';c.textAlign='center';c.lineWidth=3;c.strokeStyle='#0b0d0c';c.strokeText('⇄',mx,my);c.fillStyle='#9be07a';c.fillText('⇄',mx,my);}}
      else{c.fillRect(cx-3,cy-3,6,6);c.strokeRect(cx-3,cy-3,6,6);}
    });
  }
  const list=S.objs.filter(o=>o.x>=x0&&o.x<=x1&&o.y>=y0&&o.y<=y1&&S.explored[idx(o.x,o.y)]).sort((a,b)=>a.y-b.y);
  for(const o of list)drawObj(c,o);
  if(S.editor&&ED.paint&&ED.paintTiles){const col=ED_TCOL[+ED.tool.slice(2)];c.fillStyle=col;c.globalAlpha=0.85;const r=ED.brush-1;for(const k of ED.paint){const[px,py]=k.split(',').map(Number);c.fillRect((px-r)*TS,(py-r)*TS,TS*(2*r+1),TS*(2*r+1));}c.globalAlpha=1;}
  if(S.editor&&ED.pend){const cx=ED.pend.x*TS+TS/2,cy=ED.pend.y*TS+TS/2;c.strokeStyle='#c46bff';c.lineWidth=3;c.beginPath();c.arc(cx,cy,TS*0.45,0,7);c.stroke();}
  if(S.heroes.length){S.heroes.forEach((h,i)=>{if(i!==S.cur)drawHero(c,h.x,h.y,h);});
  {const cx=heroDraw.x*TS+TS/2,cy=heroDraw.y*TS+TS/2;c.strokeStyle='#f2d382';c.lineWidth=1.5;c.setLineDash([4,3]);c.beginPath();c.ellipse(cx,cy+13,19,7,0,0,7);c.stroke();c.setLineDash([]);}
  drawHero(c,heroDraw.x,heroDraw.y,HERO());}
  for(const rv of S.rivals)if(!seenNow(rv.x,rv.y)&&rv.seen&&S.day-rv.seen.day<=7&&S.explored[idx(rv.seen.x,rv.seen.y)]&&!seenNow(rv.seen.x,rv.seen.y)){c.save();c.globalAlpha=0.38;drawHero(c,rv.seen.x,rv.seen.y,rv,FAC[rv.fac].col);c.restore();
    const lx=rv.seen.x*TS+TS/2,ly=rv.seen.y*TS-4,tt=S.day===rv.seen.day?'seen today':`seen day ${rv.seen.day}`;c.font='700 11px "Alegreya SC",Georgia,serif';c.textAlign='center';c.textBaseline='middle';const w=c.measureText(tt).width+8;c.fillStyle='rgba(60,16,10,.8)';c.fillRect(lx-w/2,ly-7,w,14);c.fillStyle='#ffd9cf';c.fillText(tt,lx,ly);}
  for(const rv of S.rivals)if(seenNow(rv.x,rv.y)){rv.seen={x:rv.x,y:rv.y,day:S.day};c.fillStyle='rgba(196,90,67,.55)';c.beginPath();c.ellipse(rv.x*TS+TS/2,rv.y*TS+TS/2+13,18,6,0,0,7);c.fill();drawHero(c,rv.x,rv.y,rv,FAC[rv.fac].col);}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!S.explored[idx(x,y)]){c.fillStyle='rgba(10,12,11,.55)';c.fillRect(x*TS-8,y*TS-8,TS+16,TS+16);}}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!S.explored[idx(x,y)]){c.fillStyle='#0a0c0b';c.fillRect(x*TS,y*TS,TS,TS);}}
  for(const ru of S.rumours){if(!S.objs.some(o=>o.type==='relic'&&o.r===ru.r))continue;const cx=ru.x*TS+TS/2,cy=ru.y*TS+TS/2;c.strokeStyle=RELICS[ru.r].col;c.lineWidth=2;c.setLineDash([7,6]);c.beginPath();c.arc(cx,cy,TS*3.2,0,7);c.stroke();c.setLineDash([]);drawRelic(c,ru.r,cx,cy,9);}
  const beacon=(x,y)=>{const cx=x*TS+TS/2,cy=y*TS-26+Math.sin(performance.now()/300)*3;c.fillStyle='#f2d382';c.strokeStyle='#5a3a0a';c.lineWidth=1.2;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?3.5:8;c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();};
  if(S.heroes.length)S.heroes.forEach((h,i)=>{if(h.relics.length)i===S.cur?beacon(heroDraw.x,heroDraw.y):beacon(h.x,h.y);});
  for(const rv of S.rivals)if(rv.relics.length)beacon(rv.x,rv.y);
  if(hoverTile&&inb(hoverTile.x,hoverTile.y)){c.strokeStyle='rgba(242,211,130,.7)';c.lineWidth=1.5;c.strokeRect(hoverTile.x*TS+1,hoverTile.y*TS+1,TS-2,TS-2);}
  c.restore();
}
function planTo(x,y){
  if(!S.explored[idx(x,y)])return null;
  if(townFoot(x,y)){x=S.town.x;y=S.town.y;}
  const Z=zocFor(ME());
  return astar(HERO().x,HERO().y,x,y,(nx,ny,goal)=>{
    const i=idx(nx,ny);if(!S.explored[i]||townFoot(nx,ny))return Infinity;if(Z.has(i)&&!goal)return Infinity;const c=terrainCost(nx,ny);if(!isFinite(c))return Infinity;
    const o=objAt(nx,ny);if(o&&(o.type==='neutral'||o.type==='relic'||spireFoe(o))&&!goal)return Infinity;
    if(o&&o.type==='town'&&!townData(o).mine)return Infinity;
    if(rivalAt(nx,ny)&&!goal)return Infinity;
    const hi=heroIdxAt(nx,ny);if(hi>=0&&hi!==S.cur&&!(nx===S.town.x&&ny===S.town.y))return Infinity;
    return c;});
}

/* -------- map info -------- */
const amountWord=n=>n<5?'A few':n<10?'A band of':n<20?'A company of':n<50?'A host of':'A multitude of';
function stackPower(k,n,hero,h){const u=U[k];h=h||(S&&S.heroes?HERO():null);const a=u.atk+(hero&&h?hst(h,'atk'):0),d=u.def+(hero&&h?hst(h,'def'):0);return n*Math.sqrt(u.hp*(u.min+u.max)/2*(1+0.05*a)*(1+0.05*d))*(u.shots?1.2:1)*(u.fly?1.1:1);}
function armyPower(army,h){return army.reduce((s,a)=>s+stackPower(a.k,a.n,!!h,h),0);}
const seenNow=(x,y)=>S.heroes.some(h=>Math.hypot(h.x-x,h.y-y)<=vision()+0.5)||Math.hypot(S.town.x-x,S.town.y-y)<=6.5;
function threat(k,n){return threatOf(stackPower(k,n));}
function threatOf(p){const r=p/Math.max(1,armyPower(HERO().army,HERO()));
  return r<0.45?['Easy prey','#8cbc70']:r<0.85?['Manageable','#b9c76a']:r<1.25?['Even fight','#d4ab52']:r<2?['Dangerous','#e3905a']:['Deadly','#e3705a'];}
function describe(x,y){
  if(!inb(x,y))return'';
  if(S&&S.editor){const o=objAt(x,y),en=o&&ED_OBJS.find(q=>q[0]===o.type||(o.type==='mine'&&q[0]===o.k)||(o.type==='relic'&&(o.r===6?q[0]==='lair':q[0]==='relic'))||(o.type==='neutral'&&q[0]===(o.guard?'guard':'monster')));return`${x}, ${y} · ${TNAME[tileAt(x,y)]}${o?` · <b>${en?en[1]:o.type}</b>${o.type==='relic'&&o.r<6?' '+(o.r+1):''}`:''}`;}
  if(S&&x===HERO().x&&y===HERO().y&&!moving)return`<b>${HERO().name}</b> · click for orders: <b>End day</b>, town, next hero`;
  if(!S.explored[idx(x,y)])return'<span class="muted">Unexplored</span>';
  if(townFoot(x,y)){const to=S.objs.find(o=>o.type==='town'&&Math.abs(x-o.x)<=1&&y>=o.y-2&&y<=o.y);const td=townData(to);return`<b>${td.town.name}</b> · ${td.mine?'your town (enter by the gate)':`${FAC[td.fac].arch} town`}`;}
  const o=objAt(x,y),t=TNAME[tileAt(x,y)];
  if(o&&o.type==='portal')return`<b>Portal</b> · ${o.ty>o.y?'leads down into the underworld':'leads up to the surface'}. Walk in to cross.`;
  if(o&&o.type==='spire'){const n=o.garrison.reduce((a,g)=>a+g.n,0);return`<b>Spire</b> · held by ${spireOwnerName(o)} · ${o.owned===ME()||!o.owned?(n?`${fmt(n)} troops inside`:'empty'):(n?`garrison: ${amountWord(n)}`:'empty: walk in to take it')}`;}
  const rv=rivalAt(x,y);if(rv&&seenNow(x,y)){const[w,col]=threatOf(armyPower(rv.army,rv));return`<b>${rv.name}</b> · rival ${FAC[rv.fac].arch} hero${rv.relics.length?` · carries ${rv.relics.map(r=>RELICS[r].name).join(', ')}`:''} · <span style="color:${col}">${w}</span>`;}
  const hi=heroIdxAt(x,y);if(hi>=0&&!o)return`<b>${S.heroes[hi].name}</b> · ${hi===S.cur?t:'tap to select'}`;
  if(!o){const c=terrainCost(x,y);return`${t}${isFinite(c)?` · move cost ${Math.round(c)}`:tileAt(x,y)===T.LAKE?' · needs a boat (buy one at a dock)':' · impassable'}`;}
  const cnt=n=>fx().exact?`${n}`:amountWord(n);
  switch(o.type){
    case 'town':{const td=townData(o);return`<b>${td.town.name}</b> · ${td.mine?'your town':`${FAC[td.fac].arch} town`}`;}
    case 'neutral':{const[w,col]=threat(o.k,o.n);return`${o.guard?'<b>Guarded pass</b> · ':''}<b>${cnt(o.n)} ${o.lvl?MON_LVL[o.lvl]+' ':''}${U[o.k].pl}</b> · <span style="color:${col}">${w}</span>${o.lvl===4?' · guards loot':''}`;}
    case 'relic':{const Rl=RELICS[o.r];const[w,col]=threat(o.k,o.n);return`<b>${Rl.lair}</b> · guards the ${Rl.name} · ${cnt(o.n)} ${U[o.k].pl} · <span style="color:${col}">${w}</span>`;}
    case 'drop':return`<b>${o.rs.map(r=>RELICS[r].name).join(', ')}</b> · lying here, unguarded`;
    case 'camp':{if(isMajor(o)&&o.free&&!o.owned){const gn=(o.garrison||[]).reduce((a,g)=>a+g.n,0);return`<b>Free ${FAC[o.fac].arch} town</b> · unclaimed${gn?` · ${amountWord(gn).toLowerCase()} ${(o.garrison||[]).map(g=>U[g.k].pl).join(', ')} hold it`:''} · capture it and it becomes a full town you can build up`;}
      if(isMajor(o)&&o.owned===ME()){const gn=(o.garrison||[]).reduce((a,g)=>a+g.n,0);return`<b>${esc(campName(o))}</b> · your ${FAC[o.fac].arch} town · +${fmt(campIncome(o))} gold a day${gn?` · ${gn} troops in the garrison`:''} · double-click to open`;}
      if(o.free&&!o.owned){const gn=(o.garrison||[]).reduce((a,g)=>a+g.n,0);return`<b>${campName(o).replace(/^./,c=>c.toUpperCase())}</b>${o.keeper?` · held by the rogue ${HBY[o.keeper].name}`:''} · unclaimed${gn?` · ${amountWord(gn).toLowerCase()} ${(o.garrison||[]).map(g=>U[g.k].pl).join(' and ')} hold it`:''} · capture it for +${fmt(campIncome(o))} gold a day and ${campTiers(o)} kinds of ${FAC[o.fac].arch} recruits`;}
    const gn=(o.garrison||[]).reduce((a,g)=>a+g.n,0);return o.owned===ME()?`<b>Your ${FAC[o.fac].arch} ${isMajor(o)?'town':'outpost'}</b> · +${fmt(campIncome(o))} gold a day · recruits each week${gn?` · ${gn} troops guard it`:''}`:`<b>${campName(o)}</b>${o.owned?' (taken by another banner)':''} · ${gn?`guarded by ${amountWord(gn).toLowerCase()} troops · `:''}walk in to capture it`;}
    case 'mine':return`<b>${MINE[o.k].name}</b> (level ${o.lvl||1}) · +${fmt(mineOut(o))} ${RESNAME[MINE[o.k].res].toLowerCase()} a day · ${o.owned===ME()?'yours':o.owned?`held by ${o.ownerName}`:'unclaimed'}`;
    case 'pile':return`<b>${RESNAME[o.k]}</b> · ${fmt(o.n)}`;
    case 'flot':return`<b>${FLOT[o.k].name}</b> · ${FLOT[o.k].give} · needs a boat or swimmers`;
    case 'gem':return`<b>${GEMS[o.k].name}</b> · ${GEMS[o.k].n} ${RESNAME[GEMS[o.k].res||'gems'].toLowerCase()}`;
    case 'chest':return'<b>Weathered chest</b>';
    case 'site':return`<b>${SITES[o.k].name}</b> · ${o.week===weekNo()?'spent until next week':`once a week: ${SITES[o.k].give}`}`;
    case 'artifact':{const it=ITEMS[o.item];return`${itemIcon(o.item)}<b>${it.name}</b> · level ${it.lvl} ${it.tier} · ${itemTxt(o.item)}`;}
    case 'stone':return`<b>Training stone of ${STATN[o.stat]}</b> · +1 ${STATN[o.stat]} for each hero, once${(o.usedBy||[]).includes(HERO().id)?' (this hero has trained here)':''}`;
    case 'shrine':return`<b>Wayshrine</b> · teaches ${SP[o.spell].name}`;
    case 'sage':return`<b>Sage's Library</b> · each hero may learn +2 Attack, Defense, Power or Lore${(o.used||[]).includes(HERO().id)?' (already visited)':''}`;
    case 'altar':return`<b>${ALTAR_NAMES[o.tier]}</b> · teaches ${SP[o.spell].name}${o.tier>1?` · needs Lore ${o.tier}`:''} · needs a spellbook`;
    case 'well':return`<b>Moonwell</b> · ${o.day===S.day?'drained until tomorrow':'restores mana'}`;
    case 'tower':return'<b>Watchtower</b> · reveals the land around it';
    case 'prison':return o.rogue&&!S.heroes.some(x=>x.id===o.rogue)?`<b>Prison</b> · a rogue waits behind the bars`:'<b>Prison</b> · empty';
    case 'dock':return`<b>Dock</b> · ${HERO().boat?'you already have a boat':delivered(2)?'free boats for you':'buy a boat for 1,000 gold to sail lakes'}`;
    case 'fair':return`<b>Horse Fair</b> · ${HERO().mount==='foot'?'buy a horse for 800 gold (+40% movement)':'you are already mounted'}`;
  }
  return t;
}
