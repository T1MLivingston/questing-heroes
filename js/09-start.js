'use strict';
/* ================= START: map setup, faction and hero pickers ================= */
/* draw a small overview of a generated map; the preview uses sample banners, so real games differ in the details */
function mapPreviewURL(type,size,seed,nr){
  const sz=MAP_SIZES[size],oW=W,oH=H;W=sz.W;H=sz.H;
  const rv=['pirates','wizards','necro','elves','dwarves'].slice(0,nr??sz.rivals);
  const w=genMap(seed,{type,fac:'rangers',rivals:rv});
  const url=drawPreview(w);W=oW;H=oH;return url;
}
function drawPreview(w){
  const px=Math.max(4,Math.floor(300/W)),cv=document.createElement('canvas');cv.width=W*px;cv.height=H*px;const c=cv.getContext('2d');
  const col=['#56763a','#7b6a46','#cbb27a','#6e5c50','#41553a','#2e4f28','#6b6962','#2c5a72'];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){c.fillStyle=col[w.tiles[y*W+x]];c.fillRect(x*px,y*px,px,px);}
  if(w.underY){c.fillStyle='rgba(40,10,70,.45)';c.fillRect(0,w.underY*px,W*px,(H-w.underY)*px);}
  const dot=(x,y,r,fill,stroke)=>{c.fillStyle=fill;c.beginPath();c.arc(x*px+px/2,y*px+px/2,r,0,7);c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=1.5;c.stroke();}};
  for(const o of w.objs){
    if(o.type==='town'){c.fillStyle=FAC.rangers.col;c.fillRect(o.x*px-px,(o.y-2)*px,px*3,px*3);c.strokeStyle='#fff';c.lineWidth=2;c.strokeRect(o.x*px-px,(o.y-2)*px,px*3,px*3);}
    else if(o.type==='camp')dot(o.x,o.y,px*1.1,FAC[o.fac].col,'#fff');
    else if(o.type==='relic')dot(o.x,o.y,px*(o.r===6?1.2:0.8),RELICS[o.r].col,'#1a1408');
    else if(o.type==='neutral'&&o.guard){c.strokeStyle='#ff6a4d';c.lineWidth=2;const cx=o.x*px+px/2,cy=o.y*px+px/2;c.beginPath();c.moveTo(cx-px,cy-px);c.lineTo(cx+px,cy+px);c.moveTo(cx+px,cy-px);c.lineTo(cx-px,cy+px);c.stroke();}
    else if(o.type==='dock'){c.fillStyle='#d9b48a';c.fillRect(o.x*px,o.y*px,px,px);}
    else if(o.type==='portal')dot(o.x,o.y,px*0.9,'#c46bff','#fff');
    else if(o.type==='spire'){c.fillStyle='#e8e4f4';c.fillRect(o.x*px,o.y*px-px,px,px*2);}
  }
  return cv.toDataURL();
}
/* Setup Icons pack: 70 icons of 64×64 in ui/setup_icons.png, 10 a row (SICONS order); ico(name, css px) */
const SICONS=["all_banners","amber","attack","back","banner_blank_1","banner_blank_2","banner_blank_3","banner_blank_4","banner_blank_5","banner_blank_6","choose_banner","conquest","continue","defense","difficulty_easy","difficulty_expert","difficulty_hard","difficulty_normal","dock","gem","glass_lair","gold","grail_quest","guards","health","horse_travel","load_game","lore","luck","map","map_editor","map_extra_large","map_large","map_medium","map_small","moonwater","morale","multiplayer","music","new_campaign","new_layout","next","ore","outpost","outposts_few","outposts_many","outposts_some","portal","power","relic_hunt","rivals_1","rivals_2","rivals_3","rivals_4","rivals_5","rivals_6","settings","speed","spellbook","spire","starting_artifact","town","towns_0","towns_1","towns_2","towns_3","towns_4","towns_5","towns_6","wood"];
const ico=(n,px=28)=>{const i=SICONS.indexOf(n);if(i<0)return'';const k=px/64;return`<span class="sico" style="width:${px}px;height:${px}px;background-size:${640*k}px ${448*k}px;background-position:-${(i%10)*64*k}px -${Math.floor(i/10)*64*k}px" aria-hidden="true"></span>`;};
const REC_SIZE={1:'small',2:'medium',3:'large',4:'large',5:'xl',6:'xl'};
async function pickMap(opt={}){
  const mine=loadMaps().filter(m=>m.objs.some(o=>o.type==='town')&&m.objs.filter(o=>o.type==='relic').length>=7);
  let type=opt.custom?'custom:'+opt.custom:'wheel',size='large',seed=(Math.random()*1e9)|0,mode='relic',np=2,diff='normal',nr=3,nm=4,no=1,art=false;
  const NR=()=>nr??MAP_SIZES[size].rivals,NM=()=>nm??MAP_SIZES[size].majors,OUTW=['Few','Some','Many'];
  const maxR=()=>type==='rivers'?4:6;
  const html=()=>`<div class="gm-top"><div class="diffs" role="group" aria-label="Difficulty"><span class="label">Difficulty</span>${Object.entries(DIFF).map(([k,d])=>`<button class="dchip${k===diff?' on':''}" data-diff="${k}" title="${d.desc}">${ico('difficulty_'+k)}${d.name}</button>`).join('')}</div></div>
    <h3 class="gsec">Game mode</h3>
    <div class="modes4">${Object.entries(MODES).map(([k,m])=>`<button class="mode${k===mode?' on':''}" data-mode="${k}" title="${m.desc}"><b>${ico({relic:'relic_hunt',conquest:'conquest',grail:'grail_quest',multi:'multiplayer'}[k],40)}${m.name}</b><span>${MODE_SHORT[k]}</span></button>`).join('')}</div>
    <h3 class="gsec">Rivals and towns</h3>
    <div class="maprow setup">${mode==='multi'?`<span class="label">Players</span>${[2,3,4,5].map(n=>`<button class="dchip${n===np?' on':''}" data-np="${n}">${ico('rivals_'+Math.min(6,n),28)}</button>`).join('')}`:`<span class="label">Rivals</span>${[1,2,3,4,5,6].map(n=>`<button class="dchip${n===NR()?' on':''}" data-nr="${n}" ${n>maxR()?'disabled title="Four Rivers has room for four rivals"':`title="Play against ${n} rival banner${n>1?'s':''}, each with a home town to build up. Picks the recommended map size."`} aria-label="${n} rivals">${ico('rivals_'+n,32)}</button>`).join('')}`}
      <span class="label" title="Free towns that become full towns once captured: build them up like your home">Great towns</span>${[0,1,2,3,4,5,6].map(n=>`<button class="dchip${n===NM()?' on':''}" data-nm="${n}" title="${n} free great town${n===1?'':'s'}: capture one and build it up like your home" aria-label="${n} great towns">${ico('towns_'+n,32)}</button>`).join('')}
      <span class="label" title="Small outposts: gold and a few recruits; some are held by a rogue hero">Outposts</span>${OUTW.map((w,i)=>`<button class="dchip${i===no?' on':''}" data-no="${i}" title="${w} outposts (gold and a few recruits; some held by a rogue)">${ico('outposts_'+w.toLowerCase(),28)}${w}</button>`).join('')}</div>
    <h3 class="gsec">Map</h3>
    <div class="maprow">${Object.entries(MAP_SIZES).map(([k,z])=>`<button class="dchip${k===size?' on':''}${k===REC_SIZE[mode==='multi'?np-1:NR()]?' rec':''}" data-size="${k}" title="${z.W}×${z.H} tiles · ${Math.round(z.limit/28)} months${k===REC_SIZE[mode==='multi'?np-1:NR()]?' · recommended':''}">${ico({small:'map_small',medium:'map_medium',large:'map_large',xl:'map_extra_large'}[k],28)}${z.label}${k===REC_SIZE[mode==='multi'?np-1:NR()]?' ★':''}</button>`).join('')}<button class="dchip" data-reroll="1" title="Roll a new layout">${ico('new_layout',28)}New layout</button><button class="dchip" data-mkmap="1" title="Open the map editor">${ico('map_editor',28)}Make your own map</button>
      <span class="muted msize">${MAP_SIZES[size].W}×${MAP_SIZES[size].H} · ${Math.round(MAP_SIZES[size].limit/28)} months</span></div>
    <div class="maps4">${Object.entries(MAP_TYPES).map(([k,m])=>`<button class="mapc${k===type?' on':''}" data-map="${k}" title="${m.desc}"><span class="mimg"><img class="mprev" src="${mapPreviewURL(k,size,seed,Math.min(k==='rivers'?4:6,mode==='multi'?np-1:NR()))}" alt="Preview of ${m.name}"><span class="mdesc">${m.desc}</span></span><b>${m.name}</b><small class="mbio">${biomeOf(seed).name}</small></button>`).join('')}</div>
    ${mine.length?`<div class="maprow mine"><span class="label">Your maps</span>${mine.map(m=>`<button class="dchip mmap${type==='custom:'+m.id?' on':''}" data-map="custom:${m.id}" title="${esc(m.name)} · ${m.W}×${m.H}"><img src="${customPreviewURL(m)}" alt="">${esc(m.name)}</button>`).join('')}</div>`:''}
    <div class="legend">${[['town','Your town'],['banner_blank_2','Rivals'],['relic_hunt','Relics'],['glass_lair','Glass Lair'],['guards','Guards'],['portal','Portals'],['spire','Spires'],['dock','Docks'],['outpost','Outposts']].map(([i,t])=>`<span>${ico(i,24)}${t}</span>`).join('')}</div>`;
  const p=showModal({title:'Choose your game',body:html(),wide:true,top:true,buttons:[{label:`${ico('back',24)}Back`,value:null},{label:`Next: choose banners${ico('next',24)}`,value:'go',primary:true}],dismiss:null});
  const body=$('#modal').querySelector('.body');
  body.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
    if(b.dataset.mkmap){$('#modal')._close('edit');return;}
    if(b.dataset.mode)mode=b.dataset.mode;else if(b.dataset.diff)diff=b.dataset.diff;else if(b.dataset.np){np=+b.dataset.np;size=REC_SIZE[np-1];}else if(b.dataset.map){type=b.dataset.map;if(type==='rivers'&&NR()>4)nr=4;}else if(b.dataset.size){size=b.dataset.size;nm=null;}else if(b.dataset.nr){nr=+b.dataset.nr;size=REC_SIZE[nr];nm=null;}else if(b.dataset.nm)nm=+b.dataset.nm;else if(b.dataset.no)no=+b.dataset.no;else if(b.dataset.reroll)seed=(Math.random()*1e9)|0;else return;body.innerHTML=html();});
  const v=await p;if(v==='edit')return{edit:true};if(v!=='go')return null;
  if(type.startsWith('custom:')){const id=type.slice(7),m=loadMaps().find(x=>x.id===id);if(m)return{type:'custom',custom:id,size:m.size,seed,mode,diff,majors:NM(),outposts:no,artifact:art,nPlayers:mode==='multi'?Math.min(np,1+m.objs.filter(o=>o.type==='camp'&&!o.free).length):1};}
  return{type,size,seed,mode,diff,rivals:Math.min(maxR(),NR()),majors:NM(),outposts:no,artifact:art,nPlayers:mode==='multi'?np:1};
}
/* Choose your banner: a tall grid of banner cards; Details opens a full page for one banner (heroes, troops, ability), with arrows to flip between banners */
const UNIT_TAGS=u=>[u.fly&&'Flies',u.shots&&`Shoots (${u.shots})`,u.charge&&'Charge',u.double&&'Strikes twice',u.noRetal&&'No strike-back',u.retal>1&&'Strikes back twice',u.regen&&'Regrows',u.drain&&'Drains life',u.charm&&'Charms',u.undead&&'Undead'].filter(Boolean);
/* crisp troop picture: the first idle frame of the battle art, cropped to the figure and scaled by a whole number */
function troopSrc(k){const st=stripPath(k);if(st&&!unitArt(k)&&!ENEMY_ART[k])return{p:st,cols:6,rows:2};const n=unitArt(k);if(n)return{p:`units/${unitFac(k)}/${n}/${n}_sheet.png`,cols:4,rows:5};if(ENEMY_ART[k])return{p:`enemies/${ENEMY_ART[k]}/sheet.png`,cols:4,rows:5};return null;}
function paintTroopPics(root,tries=0){let left=0;
  for(const cv of root.querySelectorAll('canvas.tpc:not([data-done])')){const k=cv.dataset.u,src=troopSrc(k);if(!src){cv.dataset.done=1;continue;}const a=artImg(src.p);if(!a.ok){left++;continue;}
    const im=a.img,fw=im.width/src.cols,fh=src.rows?im.height/src.rows:im.height,c=cv.getContext('2d'),W2=cv.width,H2=cv.height;c.clearRect(0,0,W2,H2);
    /* battlefield scale: one zoom for every troop, big troops 40% larger as in battle, standing on a hex */
    const u=U[k],big=fw*64/fh>64||(u&&u.amber)||['ogre','troll','drake'].includes(k),z=1.75*(big?1.4:1)*64/fh,hw=64*1.75*0.98,hh=hw*2/Math.sqrt(3),cx=W2/2,gy=H2-hh*0.42;
    c.beginPath();for(let q=0;q<6;q++){const an=Math.PI/180*(60*q-30);c.lineTo(cx+hh/2*Math.cos(an),gy+hh/2*Math.sin(an)*0.62);}c.closePath();
    c.fillStyle='rgba(96,120,64,.28)';c.fill();c.strokeStyle='rgba(60,70,40,.65)';c.lineWidth=2;c.stroke();
    c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(cx,gy,hw*0.36,hw*0.11,0,0,7);c.fill();
    c.imageSmoothingEnabled=z<1;c.imageSmoothingQuality='high';c.drawImage(im,0,0,fw,fh,Math.round(cx-fw*z/2),Math.round(gy-fh*z*60/64),Math.round(fw*z),Math.round(fh*z));cv.dataset.done=1;}
  if(left&&tries<40)setTimeout(()=>paintTroopPics(root,tries+1),100);}
function bannerCard(k,off){const f=FAC[k],hs=HEROES.filter(h=>h.fac===k&&!h.rogue);
  return`<div class="pick fcard2" style="--c:${f.col};--c2:${f.col2}" data-fac="${k}" ${off?'aria-disabled="true"':''} title="Choose the ${f.arch}">
    <div class="fc-head"><img src="${iconURL('crest',k,52)}" alt=""><div><h3>${f.arch}</h3></div></div>
    <div class="fc-heroes">${hs.map(h=>`<span><img src="${iconURL('hero',h.id,128)}" alt="${esc(h.name)}"><b>${esc(h.name)}</b></span>`).join('')}</div>
    <button class="btn sm fc-det" data-det="${k}">Details</button></div>`;}
function bannerDetail(k,off){const f=FAC[k],hs=HEROES.filter(h=>h.fac===k&&!h.rogue),i=FAC_ORDER.indexOf(k),prev=FAC_ORDER[(i+7)%8],next=FAC_ORDER[(i+1)%8];
  const stat=(n,v)=>`<span><em>${n}</em><b>${v}</b></span>`;
  return`<div class="fdet" style="--c:${f.col};--c2:${f.col2}">
    <div class="fd-top"><button class="btn" data-grid="1">◂ All banners</button><button class="btn icon" data-det="${prev}" title="${FAC[prev].arch}">‹</button>
      <div class="fd-title"><img src="${iconURL('crest',k,52)}" alt=""><div><h2>${f.arch}</h2><div class="sw">${FAC_SW[k][0].map(t=>`<span class="pro">+ ${t}</span>`).join('')}<span class="con">− ${FAC_SW[k][1]}</span></div></div></div>
      <button class="btn icon" data-det="${next}" title="${FAC[next].arch}">›</button><button class="btn primary" data-choose="${k}" ${off?'disabled':''}>Choose the ${f.arch} ▸</button></div>
    <div class="fd-info"><div><b>★ ${f.mech}</b><p>${f.mechDesc}</p></div><div><b>Travel</b><p>${TRAVEL[f.travel]}</p></div><div><b>Home town</b><p>${f.town}</p></div></div>
    <h3 class="fd-h">Heroes</h3>
    <div class="fd-heroes">${hs.map(h=>`<div class="fd-hero"><img src="${iconURL('hero',h.id,128)}" alt=""><div><b>${esc(h.name)}</b><small>${h.type} hero${h.type==='Magic'||h.sp.length?' · spellbook':''}</small>
      <div class="fd-st">${['atk','def','pow','lore'].map((s2,j)=>`<span title="${STATN[s2]}"><img src="${iconURL('stat',s2,44)}" alt="">${h.st[j]}</span>`).join('')}</div>
      <p><b>★ ${h.ab}:</b> ${h.ad}</p></div></div>`).join('')}</div>
    <h3 class="fd-h">Troops</h3>
    <div class="fd-troops">${f.units.map((uk,t)=>{const u=U[uk],up=U[uk+'_u'];return`<div class="fd-troop"><div class="fd-tier">Tier ${t+1}</div><div class="tpic"><canvas class="tpc" data-u="${uk}" width="250" height="190" aria-label="${u.name}"></canvas><div class="fd-tags">${UNIT_TAGS(u).map(x=>`<span>${x}</span>`).join('')}</div></div><b>${u.name}</b>
      <div class="fd-stats">${stat('Attack',u.atk)}${stat('Defense',u.def)}${stat('Health',u.hp)}${stat('Damage',`${u.min}–${u.max}`)}${stat('Speed',u.spd)}${stat('Per week',u.growth)}</div>
      <p>${u.desc}</p><small>Recruit at the ${f.dw[t]} · ${fmt(u.cost)} gold${u.amber?' + amber':''}${up?` · upgrades to ${up.name}`:''}</small></div>`;}).join('')}</div>
    ${TOWN_SCREEN[k]?`<h3 class="fd-h">${f.town}, fully built</h3><canvas class="tprev" data-fac="${k}" width="640" height="360" aria-label="${f.town} with every building"></canvas>`:''}</div>`;}
async function pickFaction(opt={}){
  while(true){
    const ex=opt.exclude||[],title=opt.who?`${opt.who}: choose your banner`:'Choose your banner';
    const grid=()=>`<div class="facs2">${FAC_ORDER.map(k=>bannerCard(k,ex.includes(k))).join('')}</div>`;
    const pr=showModal({title,body:grid(),wide:true,buttons:[]});
    const m=$('#modal'),sheet=m.querySelector('.sheet'),body=m.querySelector('.body'),h2=m.querySelector('header h2');sheet.classList.add('bannersheet');
    const show=k=>{sheet.classList.toggle('det',!!k);if(k){body.innerHTML=bannerDetail(k,ex.includes(k));paintTroopPics(body);paintTownPrev(body);h2.textContent=`${title} · ${FAC[k].arch}`;}else{body.innerHTML=grid();h2.textContent=title;}body.scrollTop=0;};
    const fk=await new Promise(res=>{body.addEventListener('click',e=>{const d=e.target.closest('[data-det]');if(d){show(d.dataset.det);return;}
      if(e.target.closest('[data-grid]')){show(null);return;}
      const c=e.target.closest('[data-choose]')||e.target.closest('.fcard2');const k=c&&(c.dataset.choose||c.dataset.fac);if(k&&!ex.includes(k)){m._close(null);res(k);}});});
    await pr;
    const hid=await pickHero(fk,opt);if(hid)return{fk,hid};
  }
}
async function pickHero(fk,opt={}){
  const f=FAC[fk],list=HEROES.filter(h=>h.fac===fk&&!h.rogue);
  const book=h=>h.type==='Magic'||h.sp.length>0;
  const body=`<div class="picks heroes4">${list.map(h=>`<div class="pick hcard" style="--c:${f.col};--c2:${f.col2}"><button class="fpick" data-hero="${h.id}" aria-label="Choose ${esc(h.name)}"></button>
      <h3 class="qh-name">${esc(h.name)}</h3>
      <span class="hport"><img src="${iconURL('hero',h.id,128)}" alt=""></span>
      <div class="sub">${h.type} hero <span class="bk${book(h)?'':' none'}" title="${book(h)?'Starts with a spellbook':'No spellbook: buy one at the Lantern Library'}">📖</span></div>
      <div class="bigstats">${['atk','def','pow','lore'].map((k,i)=>`<span title="${STAT_TIP[k]}"><em><img src="${iconURL('stat',k,44)}" alt="">${STATN[k]}</em><b>${h.st[i]}</b></span>`).join('')}</div>
      <p class="hab" title="${esc(h.ad)}">★ ${AB_SHORT[h.id]||h.ad}</p>
      <details class="hmore"><summary>Details ▾</summary><div class="hmbox"><ul class="hkit"><li><b>★ ${h.ab}:</b> ${h.ad}</li>${h.sk.map(k=>`<li><b>${SK[k].name}:</b> ${SK[k].desc}</li>`).join('')}${h.item?`<li><b>${ITEMS[h.item].name}:</b> ${itemTxt(h.item)}</li>`:''}${book(h)?`<li><b>Spells:</b> ${(h.sp.length?h.sp:['ember']).map(k=>SP[k].name).join(', ')}</li>`:''}</ul>${h.blank?'<p class="muted"><i>Name still to come.</i></p>':''}</div></details></div>`).join('')}</div>`;
  const defCol=PLAYER_COLS[BANNER_SW[fk]??0][1];pickedCol=opt.who?null:defCol;
  const colRow=opt.who?'':`<div class="colpick"><span class="label">Your colour</span>${PLAYER_COLS.map(([n,c])=>`<button class="colsw${c===defCol?' on':''}" data-col="${c}" title="${n}${c===defCol?' (this banner\'s colour)':''}" style="--sw:${c}" aria-label="${n}"></button>`).join('')}<span class="flagprev" title="Your flag" style="--fc:${defCol}"><i></i><b><img src="${iconURL('crest',fk,52)}" alt=""></b></span></div>`;
  pickedArt=false;const artRow=opt.who?'':`<button class="artpick" data-artpick="1" title="Your starting hero carries one random artifact (level 1-3)">${ico('starting_artifact',32)}<span>Start with an artifact</span><b class="tick">✓</b></button>`;
  const pr=showModal({title:`<img src="${iconURL('crest',fk,52)}" alt="" style="width:44px;height:44px;vertical-align:-12px;margin-right:8px;image-rendering:pixelated">${opt.who?opt.who+' · ':''}${f.arch}: choose your hero`,body:`<div class="hpicktop">${colRow}${artRow}</div>`+body,wide:true,top:true,buttons:[{label:'◂ Back to banners',value:'back'}]});
  const m=$('#modal');let picked=null;
  const paint=c=>{m.querySelectorAll('.hcard').forEach(x=>x.style.setProperty('--c',c));{const fp=m.querySelector('.flagprev');if(fp)fp.style.setProperty('--fc',c);}m.querySelectorAll('.colsw').forEach(x=>x.classList.toggle('on',x.dataset.col===c));};
  if(!opt.who)paint(defCol);
  m.querySelector('.body').addEventListener('click',e=>{const sw=e.target.closest('[data-col]');if(sw){pickedCol=sw.dataset.col;paint(pickedCol);return;}const ap=e.target.closest('[data-artpick]');if(ap){pickedArt=!pickedArt;ap.classList.toggle('on',pickedArt);return;}if(e.target.closest('details'))return;const c=e.target.closest('.hcard'),b=c&&c.querySelector('[data-hero]');if(b){picked=b.dataset.hero;m._close('hero');}});
  const v=await pr;return v==='hero'?picked:null;
}
