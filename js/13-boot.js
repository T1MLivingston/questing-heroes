'use strict';
/* -------- boot -------- */
/* About & credits: what this is, who made it, and the plain-language notices (see LEGAL.md) */
const ABOUT_HTML=`<div class="about">
  <p><b>Questing Heroes</b> is a free, non-commercial hobby game made by Tim Livingston, built with AI coding help (Claude) and AI image tools (ChatGPT image generation).</p>
  <p>All names, characters, factions, towns and art are original to this game. It is not affiliated with, endorsed by or connected to any other game, studio or company. Any resemblance to other works is coincidental.</p>
  <p>Many heroes are named after friends, family and pets, with their permission; the rest are invented. All characters are fictional; their abilities and looks are made up.</p>
  <p><b>Privacy:</b> the game has no accounts, ads or tracking. Saves and the Hall of Fame stay in your own browser, and the game loads nothing from other websites (its fonts are included).</p>
  <p><b>Credits:</b> Alegreya and Alegreya SC fonts by Juan Pablo del Peral (Huerta Tipográfica), SIL Open Font License 1.1.</p>
  <p class="muted">© 2026 Tim Livingston. All rights reserved: you are welcome to play, but please don't copy or redistribute the code or art. Provided as is, without warranty. To raise a concern, open an issue on the game's GitHub page and it will be looked at promptly.</p></div>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-about]');if(!b)return;e.stopPropagation();$('#modal')._close('about');},true);
/* v44 title: three big buttons (New campaign, Continue, Load), then Create a hero and Hall of Fame, a parade of heroes, and a small credit line */
document.addEventListener('click',e=>{const b=e.target.closest('[data-tv]');if(!b||b.disabled)return;e.stopPropagation();$('#modal')._close(b.dataset.tv);},true);
function heroParade(){const ids=(a=>a.map(x=>[Math.random(),x]).sort((p,q)=>p[0]-q[0]).map(x=>x[1]))(HEROES.filter(h=>!h.rogue).map(h=>h.id));const one=ids.map(id=>`<img src="${iconURL('hero',id,128)}" alt="" loading="lazy">`).join('');
  return `<div class="tparade" aria-hidden="true"><div class="tp-track">${one}${one}</div></div>`;}
async function title(){
  const has=loadSave(),slots=loadSlots().length;
  const big=(v,icon,label,dis,extra='')=>`<button class="tbtn" data-tv="${v}" ${dis?'disabled':''}>${extra||ico(icon,72)}<b>${label}</b></button>`;
  const cont=has?`<img class="tb-face" src="${iconURL('hero',has.heroes[0].id,128)}" alt="">`:'';
  const v=await showModal({title:'',body:`<div class="titlescreen"><img class="tbanner" src="${ART_BASE}ui/banner.png" alt="Questing Heroes">
    <div class="tb-main">${big('n','new_campaign','New campaign')}${big('c','continue',has?'Continue':'Continue',!has,cont)}${big('l','load_game','Load',!slots)}</div>
    <div class="tb-sub"><button class="tbtn sm" data-tv="h"><span class="tb-emoji">✎</span><b>Create a hero</b></button><button class="tbtn sm" data-tv="b"><span class="tb-emoji">📖</span><b>Hero Book</b></button><button class="tbtn sm" data-tv="f">${ico('relic_hunt',40)}<b>Hall of Fame</b></button></div>
    ${heroParade()}
    <p class="tcredit">Free game created by Tim Livingston, computer teacher · <button class="linkbtn" data-about="1">About &amp; credits</button></p></div>`,buttons:[]});
  if(v==='about'){await showModal({title:'About & credits',body:ABOUT_HTML,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});title();return;}
  if(v==='h'){await openCreator();title();return;}
  if(v==='b'){await openHeroBook();title();return;}
  if(v==='f'){await showModal({title:'Hall of Fame',body:fameHTML(),wide:true,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});title();return;}
  if(v==='l'){const r=await loadGame();if(r!=='loaded')title();return;}
  if(v==='c'&&has){S=has;afterLoad();}else startNew();
}
/* v59: Hero Book: every hero in one place, filtered by banner, Might or Magic and group, with a details view and Save as picture (JPEG) */
const HB={fac:'all',type:'all',grp:'all',q:'',open:null};
const HB_GRP={all:'Everyone',pick:'Banner picks',tav:'Tavern heroes',stu:'Student heroes',cls:'Class heroes'};
const hbGroup=h=>h.custom?'cls':h.student?'stu':h.tav||h.rogue?'tav':'pick';
const hbCol=h=>FAC[h.fac]?FAC[h.fac].col:'#6a5a4a';
function hbList(){const q=HB.q.trim().toLowerCase();
  return HEROES.filter(h=>!h.retired&&(HB.fac==='all'||h.fac===HB.fac)&&(HB.type==='all'||h.type===HB.type)&&(HB.grp==='all'||hbGroup(h)===HB.grp)&&(!q||h.name.toLowerCase().includes(q)||(h.ab||'').toLowerCase().includes(q)||(h.ad||'').toLowerCase().includes(q)))
    .sort((a,b)=>FAC_ORDER.indexOf(a.fac)-FAC_ORDER.indexOf(b.fac)||['pick','tav','stu','cls'].indexOf(hbGroup(a))-['pick','tav','stu','cls'].indexOf(hbGroup(b))||a.name.localeCompare(b.name));}
function hbLabel(){return[HB.fac==='all'?'All banners':FAC[HB.fac].arch,HB.type==='all'?'':HB.type,HB.grp==='all'?'':HB_GRP[HB.grp],HB.q.trim()?`"${HB.q.trim()}"`:''].filter(Boolean).join(' · ');}
function hbDetail(h){const book=h.type==='Magic'||h.sp.length>0,f=FAC[h.fac];
  return`<div class="hbdet" style="--c:${hbCol(h)}"><button class="btn sm" data-hbback="1">◂ All heroes</button>
    <div class="hbd-top"><span class="hbd-port"><img src="${iconURL('hero',h.id,128)}" alt=""></span><div><h2 class="hbd-name">${esc(h.name)}</h2>
      <p class="hbd-sub">${f?`<img src="${iconURL('crest',h.fac,52)}" alt=""> ${f.arch}`:'No banner'} · ${h.type} hero · ${HB_GRP[hbGroup(h)].replace(/s$/,'').replace('Everyone','')}${book?' · 📖 spellbook':''}</p>
      <div class="bigstats">${['atk','def','pow','lore'].map((k,i)=>`<span title="${STAT_TIP[k]}"><em><img src="${iconURL('stat',k,44)}" alt="">${STATN[k]}</em><b>${h.st[i]}</b></span>`).join('')}</div></div></div>
    <ul class="hkit"><li><b>★ ${esc(h.ab||'')}:</b> ${esc(h.ad||'')}</li>${h.sk.map(k=>SK[k]?`<li>${skIco(k,22)}<b>${SK[k].name}:</b> ${SK[k].desc}</li>`:'').join('')}${h.item&&ITEMS[h.item]?`<li><b>${ITEMS[h.item].name}:</b> ${itemTxt(h.item)}</li>`:''}${book?`<li><b>Spells:</b> ${(h.sp.length?h.sp:['ember']).map(k=>SP[k]?SP[k].name:k).join(', ')}</li>`:''}</ul>
    ${h.story?`<p class="hbd-story">${esc(h.story)}</p>`:''}</div>`;}
function hbHTML(){if(HB.open&&HBY[HB.open])return hbDetail(HBY[HB.open]);const l=hbList();
  const chip=(k,v,lab,on)=>`<button class="hbchip${on?' on':''}" data-hb="${k}:${v}">${lab}</button>`;
  return`<div class="hbbar"><div class="hbrow">${chip('fac','all','All',HB.fac==='all')}${FAC_ORDER.map(k=>chip('fac',k,`<img src="${iconURL('crest',k,52)}" alt="">${FAC[k].arch}`,HB.fac===k)).join('')}</div>
    <div class="hbrow">${['all','Might','Magic'].map(t=>chip('type',t,t==='all'?'Might &amp; Magic':t==='Might'?'⚔ Might':'✦ Magic',HB.type===t)).join('')}<span class="hbsep"></span>${Object.keys(HB_GRP).map(g=>chip('grp',g,HB_GRP[g],HB.grp===g)).join('')}</div>
    <div class="hbrow"><input class="hbq" type="search" placeholder="Search names and abilities" value="${esc(HB.q)}"><b class="hbn">${l.length} hero${l.length===1?'':'es'}</b><button class="btn sm primary" data-hbsave="1" ${l.length?'':'disabled'}>📷 Save as picture</button></div></div>
    <div class="hbgrid">${l.map(h=>`<button class="hbcard" data-hbopen="${h.id}" style="--c:${hbCol(h)}" title="${esc(h.ad||'')}"><span class="hbp"><img src="${iconURL('hero',h.id,128)}" alt="" loading="lazy"></span>
      <b class="hbname">${esc(h.name)}</b><small>${FAC[h.fac]?`<img src="${iconURL('crest',h.fac,52)}" alt="">`:''}${h.type}</small><span class="hbst">${h.st.map((v,i)=>`<i class="s${i}">${v}</i>`).join('')}</span><em>${esc(AB_SHORT[h.id]||h.ab||'')}</em></button>`).join('')||'<p class="muted">No heroes match. Try another filter.</p>'}</div>`;}
const hbImg=src=>new Promise(r=>{const i=new Image();i.onload=()=>r(i);i.onerror=()=>r(null);i.src=src;});
async function hbSave(){const l=hbList();if(!l.length)return;
  try{await document.fonts.load('18px "Alegreya SC"');}catch(e){}
  const CW=180,CH=284,COLS=Math.min(8,Math.max(4,Math.ceil(Math.sqrt(l.length*1.3)))),PAD=16,TOP=74,rows=Math.ceil(l.length/COLS);
  const cv=document.createElement('canvas');cv.width=PAD*2+COLS*CW;cv.height=TOP+rows*CH+PAD+22;const c=cv.getContext('2d');
  c.fillStyle='#0f1a33';c.fillRect(0,0,cv.width,cv.height);c.fillStyle='#f2d382';c.textAlign='center';c.font='30px "Alegreya SC", serif';c.fillText('Questing Heroes · Hero Book',cv.width/2,38);
  c.font='18px "Alegreya SC", serif';c.fillStyle='#d8cfb4';c.fillText(`${hbLabel()} · ${l.length} heroes`,cv.width/2,62);
  const imgs=await Promise.all(l.map(h=>hbImg(iconURL('hero',h.id,128)))),crests={};for(const k of FAC_ORDER)crests[k]=await hbImg(iconURL('crest',k,52));
  const SC=['#e05a4a','#7d9cd0','#f08a2e','#a585e8'];
  l.forEach((h,n)=>{const x=PAD+(n%COLS)*CW,y=TOP+Math.floor(n/COLS)*CH;c.fillStyle='#f3e6c4';c.fillRect(x+4,y+4,CW-8,CH-8);c.fillStyle=hbCol(h);c.fillRect(x+12,y+12,CW-24,CW-24);
    if(imgs[n]){c.imageSmoothingEnabled=false;c.drawImage(imgs[n],x+12,y+12,CW-24,CW-24);}
    if(crests[h.fac]){c.imageSmoothingEnabled=true;c.drawImage(crests[h.fac],x+CW-44,y+14,28,28);}
    c.fillStyle='#2a1c10';c.textAlign='center';c.font='18px "Alegreya SC", serif';let nm=h.name;while(c.measureText(nm).width>CW-16&&nm.length>3)nm=nm.slice(0,-2)+'…';c.fillText(nm,x+CW/2,y+CW+8);
    c.font='13px "Alegreya SC", serif';c.fillStyle='#5a4630';c.fillText(`${FAC[h.fac]?FAC[h.fac].arch:'No banner'} · ${h.type}`,x+CW/2,y+CW+25);
    h.st.forEach((v,i)=>{const sx=x+CW/2-54+i*36;c.fillStyle=SC[i];c.beginPath();c.arc(sx,y+CW+42,11,0,7);c.fill();c.fillStyle='#fff';c.font='bold 13px sans-serif';c.fillText(v,sx,y+CW+47);});
    c.fillStyle='#3a2a18';c.font='13px "Alegreya SC", serif';const words=(AB_SHORT[h.id]||h.ab||'').split(' '),lines=[''];for(const w of words){const t=(lines[lines.length-1]+' '+w).trim();if(c.measureText(t).width>CW-20&&lines[lines.length-1]){if(lines.length===2){lines[1]+='…';break;}lines.push(w);}else lines[lines.length-1]=t;}
    lines.forEach((ln,j)=>c.fillText(ln,x+CW/2,y+CW+70+j*16));});
  c.textAlign='right';c.fillStyle='#8a9ac0';c.font='13px "Alegreya SC", serif';c.fillText('Red Attack · Blue Defense · Orange Power · Purple Lore',cv.width-PAD,cv.height-10);
  try{const url=cv.toDataURL('image/jpeg',0.92),a=document.createElement('a');a.href=url;a.download=`hero-book-${hbLabel().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')||'all'}.jpg`;document.body.appendChild(a);a.click();a.remove();toast('Saved the picture to your downloads.');}
  catch(e){toast('Your browser would not save the picture here. Open the game from its web address and try again.');}}
async function openHeroBook(){HB.open=null;
  const pr=showModal({title:'📖 Hero Book',body:`<div class="herobook">${hbHTML()}</div>`,wide:true,top:true,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});
  const root=$('#modal').querySelector('.herobook'),redo=keep=>{root.innerHTML=hbHTML();if(keep){const q=root.querySelector('.hbq');if(q){q.focus();q.setSelectionRange(q.value.length,q.value.length);}}};
  root.addEventListener('click',e=>{const t=e.target.closest('[data-hb],[data-hbopen],[data-hbback],[data-hbsave]');if(!t)return;
    if(t.dataset.hb){const[k,v]=t.dataset.hb.split(':');HB[k]=v;redo();}else if(t.dataset.hbopen){HB.open=t.dataset.hbopen;redo();root.scrollTop=0;}else if(t.dataset.hbback){HB.open=null;redo();}else if(t.dataset.hbsave){t.disabled=true;t.textContent='Drawing…';hbSave().then(()=>redo());}});
  root.addEventListener('input',e=>{if(e.target.classList.contains('hbq')){HB.q=e.target.value;redo(true);}});
  return pr;}
function boot(data){
  preloadArt();loadTerrainArt();applyTheme();sizeMap();requestAnimationFrame(frame);
  if(data&&data.save){try{S=JSON.parse(data.save);afterLoad();return;}catch(e){}}
  title();
}
window.claude?.hot?.snapshot?.(()=>({save:S&&!S.over?JSON.stringify(S):null}));
window.__qh={captureCamp,ensureAccess,drawUnit,U,enemyCast,get bt(){return bt;},armyPower,addXP,setPath,weeklyReport,get pathNow(){return path;},joinOffer,fightPreview,manageHolding,heroCap,allTowns,myMajors,growRival,rivalsTurn,townBuildings,get VT(){return VT;},FAC_ORDER,migrateRoster,centerOn,rivalTarget,get tcv(){return terrainCv;},MAP_TYPES,rivalInteract,manageSpire,get cam(){return[camX,camY,TS];},openHeroMenu,pickMap,mapPreviewURL,get S(){return S;},startBattle,endDay,walk,planTo,set path(p){path=p;},newGame,afterLoad,HEROES,FAC,RELICS,arriveTown,selectHero,openTown};
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
