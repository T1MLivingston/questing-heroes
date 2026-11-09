'use strict';
/* ===== MAP EDITOR ===== */
/* Paint terrain and place objects on a map, save it in this browser, and play it from Choose your game.
   The editor reuses the game's map renderer: it runs on an S with editor:true and no heroes. */
const MAPKEY='questing-heroes-maps';
function loadMaps(){try{return JSON.parse(localStorage.getItem(MAPKEY)||'[]');}catch(e){return[];}}
function storeMaps(l){try{localStorage.setItem(MAPKEY,JSON.stringify(l));return true;}catch(e){toast('Could not save: browser storage is unavailable.');return false;}}
const ED_OBJS=[['town','Your town','🏰'],['camp','Rival camp','⛺'],['freetown','Free town','🏘'],['relic','Relic lair','◆'],['lair','Glass Lair','💎'],['monster','Monster','👹'],['guard','Pass guard','🛡'],
  ['gold','Gold seam','🪙'],['orepit','Ore pit','⛏'],['saw','Sawmill','🪵'],['amber','Amber spring','🟠'],['pile','Resources','💰'],['chest','Chest','🧰'],['gem','Gem','💎'],['stone','Training stone','🗿'],['artifact','Artifact','✨'],
  ['spire','Spire','🗼'],['portal','Portal pair','🌀'],['sage',"Sage's Library",'📚'],['altar','Spell altar','🔮'],['site','Weekly site','⛲'],['dock','Dock','⚓'],['fair','Horse fair','🐎'],['shrine','Wayshrine','🕯'],['erase','Erase','✖']];
const ED_TCOL=['#5f8a3e','#8a7450','#b5a06e','#7d6b5a','#4a5f41','#2f5a2a','#77746c','#2f6385'];
const ED={tool:'t:0',brush:1,pend:null,paint:null,name:'',id:null,size:'small',extras:true,saved:true};
function edBlank(size,from){
  const sz=MAP_SIZES[size];W=sz.W;H=sz.H;let tiles,objs=[],extra={};
  if(from&&from!=='blank'){const w=genMap((Math.random()*1e9)|0,{type:from,fac:'rangers',rivals:['wizards','necro','elves','dwarves'].slice(0,sz.rivals)});
    tiles=w.tiles;objs=w.objs.map(o=>o.type==='camp'?{...o,fac:null}:o);extra={underY:w.underY||0,rivers:w.rivers||null,bridges:w.bridges||null};}
  else{tiles=new Array(W*H).fill(T.GRASS);for(let y=0;y<H;y++)for(let x=0;x<W;x++)if(!x||!y||x===W-1||y===H-1)tiles[idx(x,y)]=(x+y)%3?T.FOREST:T.CRAG;}
  return{W,H,size,tiles,objs,...extra};}
function edState(m){W=m.W;H=m.H;const town=m.objs.find(o=>o.type==='town')||{x:-9,y:-9};
  S={editor:true,v:3,roster:2,seed:12345,fac:'rangers',W,H,mapType:'custom',size:m.size,tiles:m.tiles,objs:m.objs,uid:1+Math.max(0,...m.objs.map(o=>o.id||0)),explored:new Array(W*H).fill(1),day:1,mode:'relic',
    res:{gold:0,timber:0,ore:0,amber:0},heroes:[],cur:0,rivals:[],rumours:[],delivered:[],underY:m.underY||0,rivers:m.rivers||null,bridges:m.bridges||null,
    town:{x:town.x,y:town.y,name:'Your town',built:{hall1:1},pool:{},garrison:[]},goal:[0,1,2,3,4,5,6]};
  setMode('relic');S.objs.filter(o=>o.type==='camp').forEach((o,i)=>{o.dfac=FAC_ORDER[(i+2)%8];});
  rebuildFoot();renderTerrain();sizeMap();centerOn(W/2,H/2,true);}
async function openEditor(m){
  if(!m){const pick2=await showModal({title:'Map editor',wide:true,top:true,buttons:[{label:'◂ Back',value:null}],dismiss:null,body:`<div class="edstart">
      <div><h3>New map</h3><p class="muted">Pick a size and what to start from.</p>
        <div class="diffs">${Object.entries(MAP_SIZES).map(([k,z])=>`<button class="dchip${k==='small'?' on':''}" data-esize="${k}">${z.label} · ${z.W}×${z.H}</button>`).join('')}</div>
        <div class="edfrom">${[['blank','Blank meadow'],...Object.entries(MAP_TYPES).map(([k,t])=>[k,t.name])].map(([k,n])=>`<button class="mode" data-efrom="${k}"><b>${n}</b><span>${k==='blank'?'An empty field to paint':'A fresh layout to edit'}</span></button>`).join('')}</div></div>
      <div><h3>Your maps</h3>${loadMaps().map(x=>`<div class="edrow"><img src="${customPreviewURL(x)}" alt=""><b>${esc(x.name)}</b><button class="btn sm" data-eopen="${x.id}">Edit</button><button class="btn sm" data-edel="${x.id}">Delete</button></div>`).join('')||'<p class="muted">No saved maps yet.</p>'}</div></div>`});
    if(pick2===null){if(!m)title();return;}
    return;}
  ED.id=m.id||null;ED.name=m.name||'My map';ED.size=m.size;ED.extras=m.extras!==false;ED.tool='t:0';ED.pend=null;ED.saved=true;
  edState(m);document.getElementById('app').classList.add('editing');$('#facline').textContent='Map editor';edUI();
}
// start-screen clicks for the editor menu
document.addEventListener('click',e=>{const m=$('#modal');if(m.hidden||!m.querySelector('.edstart'))return;
  const sz=e.target.closest('[data-esize]');if(sz){m.querySelectorAll('[data-esize]').forEach(b=>b.classList.toggle('on',b===sz));return;}
  const fr=e.target.closest('[data-efrom]');if(fr){const size=(m.querySelector('[data-esize].on')||{}).dataset?.esize||'small';m._close(1);openEditor(edBlank(size,fr.dataset.efrom));return;}
  const op=e.target.closest('[data-eopen]');if(op){const x=loadMaps().find(q=>q.id===op.dataset.eopen);if(x){m._close(1);openEditor(JSON.parse(JSON.stringify(x)));}return;}
  const dl=e.target.closest('[data-edel]');if(dl){storeMaps(loadMaps().filter(q=>q.id!==dl.dataset.edel));dl.closest('.edrow').remove();}});
function edCheck(){const o=S.objs,has=t=>o.filter(q=>q.type===t);
  const rel=new Set(o.filter(q=>q.type==='relic').map(q=>q.r)),town=has('town')[0];
  const out={town:!!town,camps:has('camp').filter(q=>!q.free).length,relics:[0,1,2,3,4,5].filter(i=>rel.has(i)).length,lair:rel.has(6),unreach:0};
  if(town){const port=new Map();for(const q of o)if(q.type==='portal'&&q.tx!==undefined)port.set(idx(q.x,q.y),idx(q.tx,q.ty));
    const ok=i=>S.tiles[i]<5||S.tiles[i]===T.LAKE,seen=new Uint8Array(W*H),q=[idx(town.x,town.y)];seen[q[0]]=1;
    while(q.length){const i=q.pop(),x=i%W,y=(i/W)|0;const pj=port.get(i);if(pj!==undefined&&!seen[pj]){seen[pj]=1;q.push(pj);}
      for(let a=-1;a<=1;a++)for(let b=-1;b<=1;b++){const nx=x+a,ny=y+b;if(!inb(nx,ny))continue;const ni=idx(nx,ny);if(seen[ni]||!ok(ni)||FOOT.has(ni))continue;if(a&&b&&(!ok(idx(x+a,y))||!ok(idx(x,y+b))))continue;seen[ni]=1;q.push(ni);}}
    out.unreach=o.filter(q=>(q.type==='relic'||q.type==='camp')&&!seen[idx(q.x,q.y)]).length;}
  out.ready=out.town&&out.relics===6&&out.lair;return out;}
function edUI(){const ck=edCheck(),tick=b=>b?'<b class="ok">✓</b>':'<b class="no">✗</b>';
  $('#edPanel').hidden=false;
  $('#edPanel').innerHTML=`<h3>Map editor</h3><input id="edName" maxlength="28" value="${esc(ED.name)}" aria-label="Map name">
    <div class="label">Terrain <span class="muted">· brush</span> ${[1,2,3].map(n=>`<button class="dchip mini${ED.brush===n?' on':''}" data-ebrush="${n}">${n}</button>`).join('')}</div>
    <div class="edgrid t">${TNAME.map((n,i)=>`<button class="edt${ED.tool==='t:'+i?' on':''}" data-etool="t:${i}" title="${n}"><i style="background:${ED_TCOL[i]}"></i>${n.replace('Deep f','F').replace('Old r','R')}</button>`).join('')}</div>
    <div class="label">Place</div>
    <div class="edgrid o">${ED_OBJS.map(([k,n,ic])=>`<button class="edt${ED.tool==='o:'+k?' on':''}" data-etool="o:${k}" title="${n}"><span>${ic}</span>${n}</button>`).join('')}</div>
    ${ED.pend?'<p class="edhint">Now click where the other end of the portal goes.</p>':'<p class="edhint muted">Drag to paint. Right-drag, the wheel or the arrow keys move the view.</p>'}
    <div class="edck">${tick(ck.town)} Town · ${tick(ck.relics===6)} Relic lairs ${ck.relics}/6 · ${tick(ck.lair)} Glass Lair · Rival camps ${ck.camps}/4${ck.unreach?` · <b class="no">${ck.unreach} cut off</b>`:''}</div>
    <label class="edx"><input type="checkbox" id="edExtras" ${ED.extras?'checked':''}> Add the usual extras when played (mines by each base, weekly sites, artifacts, spires)</label>
    <div class="edbtns"><button class="btn primary" data-eact="save">${ED.saved?'Saved':'Save'}</button><button class="btn" data-eact="play" ${ck.ready?'':'disabled title="Needs your town, six relic lairs and the Glass Lair"'}>Play it</button><button class="btn" data-eact="exit">Exit</button></div>`;
  $('#edName').oninput=e=>{ED.name=e.target.value;ED.saved=false;};$('#edExtras').onchange=e=>{ED.extras=e.target.checked;ED.saved=false;};}
function edSave(){const name=(ED.name||'').replace(/[<>]/g,'').trim()||'My map';ED.name=name;
  const m={id:ED.id||('m'+Date.now().toString(36)),name,W,H,size:ED.size,tiles:[...S.tiles],objs:JSON.parse(JSON.stringify(S.objs)).map(o=>{delete o.dfac;return o;}),underY:S.underY||0,rivers:S.rivers,bridges:S.bridges,extras:ED.extras};
  const l=loadMaps().filter(x=>x.id!==m.id);l.unshift(m);if(storeMaps(l)){ED.id=m.id;ED.saved=true;toast(`Saved “${esc(name)}”. Find it under Map on Choose your game.`);}edUI();return m;}
$('#edPanel').addEventListener('click',async e=>{const t=e.target.closest('[data-etool]'),br=e.target.closest('[data-ebrush]'),ac=e.target.closest('[data-eact]');
  if(t){ED.tool=t.dataset.etool;ED.pend=null;edUI();}else if(br){ED.brush=+br.dataset.ebrush;edUI();}
  else if(ac){const a=ac.dataset.eact;
    if(a==='save')edSave();
    else if(a==='play'){const m=edSave();edClose();const mo=await pickMap({custom:m.id});if(!mo){title();return;}if(mo.edit){openEditor();return;}
      const{fk,hid}=await pickFaction();mo.artifact=pickedArt;await loading([['Shaping the land…',()=>newGame(fk,hid,mo)],['Painting the map…',()=>{if(pickedCol)S.col=pickedCol;afterLoad();}]]);save();openTown();}
    else if(a==='exit'){if(!ED.saved){const v=await showModal({title:'Leave the editor?',body:'<p>Your changes are not saved.</p>',buttons:[{label:'Save and leave',value:'s',primary:true},{label:'Leave without saving',value:'l'},{label:'Stay',value:null}],dismiss:null});if(!v)return;if(v==='s')edSave();}
      edClose();title();}}});
function edClose(){document.getElementById('app').classList.remove('editing');$('#edPanel').hidden=true;S=null;terrainCv=null;terrainPh=null;}
function edApply(x,y){if(!inb(x,y))return false;const[kind,key]=ED.tool.split(':');ED.saved=false;
  const clearAt=(a,b)=>{const o=objAt(a,b);if(!o)return;if(o.type==='portal')S.objs=S.objs.filter(q=>!(q.type==='portal'&&((q.x===o.x&&q.y===o.y)||(q.x===o.tx&&q.y===o.ty))));else S.objs=S.objs.filter(q=>q!==o);};
  const setTile=(a,b,t)=>{if(!inb(a,b))return;const i=idx(a,b);S.tiles[i]=t;if(S.rivers)S.rivers=S.rivers.filter(j=>j!==i);if(S.bridges)S.bridges=S.bridges.filter(q=>q.i!==i);};
  if(kind==='t'){const r=ED.brush-1;for(let b=-r;b<=r;b++)for(let a=-r;a<=r;a++){const nx=x+a,ny=y+b;if(!inb(nx,ny)||FOOT.has(idx(nx,ny)))continue;setTile(nx,ny,+key);if(+key>=5)clearAt(nx,ny);}return true;}
  if(FOOT.has(idx(x,y)))return false;
  if(key==='erase'){clearAt(x,y);return true;}
  const add=o=>{clearAt(o.x,o.y);if(!passableT(S.tiles[idx(o.x,o.y)])&&o.type!=='dock')setTile(o.x,o.y,T.GRASS);o.id=S.uid++;S.objs.push(o);return o;};
  if(key==='town'){if(y<2||x<1||x>W-2||y>H-2)return false;S.objs=S.objs.filter(o=>o.type!=='town');for(let b=-2;b<=0;b++)for(let a=-1;a<=1;a++){clearAt(x+a,y+b);setTile(x+a,y+b,T.GRASS);}clearAt(x,y+1);setTile(x,y+1,T.ROAD);
    S.objs.push({type:'town',x,y,id:S.uid++});S.town.x=x;S.town.y=y;rebuildFoot();return true;}
  if(key==='freetown'){const g=neutralAt(0.4);add({type:'camp',free:true,fac:pick(FAC_ORDER),x,y,owned:false,garrison:[{k:g.k,n:g.n}],pool:{}});return true;}
  if(key==='camp'){if(S.objs.filter(o=>o.type==='camp'&&!o.free).length>=4){toast('Four rival camps at most.');return false;}add({type:'camp',x,y,fac:null,dfac:FAC_ORDER[(S.objs.filter(o=>o.type==='camp').length+2)%8]});return true;}
  if(key==='relic'){const have=new Set(S.objs.filter(o=>o.type==='relic').map(o=>o.r));const r=[0,1,2,3,4,5].find(i=>!have.has(i));if(r===undefined){toast('All six relic lairs are placed. Erase one to move it.');return false;}const Rl=RELIC_LIST[r];add({type:'relic',r,x,y,k:Rl.k,n:ri(Rl.n[0],Rl.n[1])});return true;}
  if(key==='lair'){S.objs=S.objs.filter(o=>!(o.type==='relic'&&o.r===6));add({type:'relic',r:6,x,y,k:'drake',n:3});return true;}
  if(key==='monster'){const d=S.town.x>=0?clamp(Math.hypot(x-S.town.x,y-S.town.y)/(Math.hypot(W,H)*0.7),0.1,1):0.5;add({type:'neutral',x,y,...neutralAt(d)});return true;}
  if(key==='guard'){add({type:'neutral',x,y,guard:true,k:'troll',n:ri(10,14)});return true;}
  if(MINE[key]){add({type:'mine',k:key,x,y,owned:false,lvl:1});return true;}
  if(key==='pile'){const k=pick(['gold','timber','ore','amber']);add({type:'pile',k,x,y,n:k==='gold'?ri(5,10)*100:k==='amber'?ri(2,4):ri(4,8)});return true;}
  if(key==='chest'){add({type:'chest',x,y});return true;}
  if(key==='gem'){add({type:'gem',x,y,k:pick(Object.keys(GEMS))});return true;}
  if(key==='stone'){add({type:'stone',x,y,stat:pick(['atk','def','pow','lore']),style:pick(FAC_ORDER),usedBy:[]});return true;}
  if(key==='artifact'){const l=pick([1,1,2,2,3,4]);add({type:'artifact',x,y,item:pick(Object.keys(ITEMS).filter(k=>ITEMS[k].lvl===l))});return true;}
  if(key==='spire'){add({type:'spire',x,y,owned:false,garrison:[]});return true;}
  if(key==='sage'){add({type:'sage',x,y,used:[]});return true;}
  if(key==='altar'){const tier=pick([1,1,2,2,3]);add({type:'altar',x,y,tier,spell:pick([[],['swift','bark','ember','mend','entangle'],['chain','squall','raise'],['starfall']][tier])});return true;}
  if(key==='site'){add({type:'site',x,y,k:pick(Object.keys(SITES)),week:-1});return true;}
  if(key==='dock'){add({type:'dock',x,y});return true;}
  if(key==='fair'){add({type:'fair',x,y});return true;}
  if(key==='shrine'){add({type:'shrine',x,y,spell:pick(['mend','swift','bark','ember','entangle'])});return true;}
  if(key==='portal'){if(!ED.pend){ED.pend={x,y};edUI();return false;}const a=ED.pend;ED.pend=null;if(a.x===x&&a.y===y){edUI();return false;}
    add({type:'portal',x:a.x,y:a.y,tx:x,ty:y});add({type:'portal',x,y,tx:a.x,ty:a.y});rebuildPortals(S.objs);return true;}
  return false;}
function edPointer(ev,x,y){if(ev==='down'){ED.paint=new Set();ED.paintTiles=ED.tool.startsWith('t:');}
  if(!ED.paint)return;const k=x+','+y;if(ED.paint.has(k))return;ED.paint.add(k);
  if(ED.tool.startsWith('t:')){edApply(x,y);}
  else if(ev==='down'){if(edApply(x,y)){renderTerrain();edUI();}}
  if(ev==='up'){}}
function edPointerUp(){if(ED.paint&&ED.paintTiles){renderTerrain();edUI();}ED.paint=null;}
function customPreviewURL(m){const oW=W,oH=H;W=m.W;H=m.H;const url=drawPreview({tiles:m.tiles,objs:m.objs.map(o=>o.type==='camp'?{...o,fac:o.fac||'necro'}:o),underY:m.underY});W=oW;H=oH;return url;}
