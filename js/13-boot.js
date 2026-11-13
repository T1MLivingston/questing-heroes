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
    <div class="tb-sub"><button class="tbtn sm" data-tv="h"><span class="tb-emoji">✎</span><b>Create a hero</b></button><button class="tbtn sm" data-tv="f">${ico('relic_hunt',40)}<b>Hall of Fame</b></button></div>
    ${heroParade()}
    <p class="tcredit">Free game created by Tim Livingston, computer teacher · <button class="linkbtn" data-about="1">About &amp; credits</button></p></div>`,buttons:[]});
  if(v==='about'){await showModal({title:'About & credits',body:ABOUT_HTML,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});title();return;}
  if(v==='h'){await openCreator();title();return;}
  if(v==='f'){await showModal({title:'Hall of Fame',body:fameHTML(),wide:true,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});title();return;}
  if(v==='l'){const r=await loadGame();if(r!=='loaded')title();return;}
  if(v==='c'&&has){S=has;afterLoad();}else startNew();
}
function boot(data){
  preloadArt();loadTerrainArt();applyTheme();sizeMap();requestAnimationFrame(frame);
  if(data&&data.save){try{S=JSON.parse(data.save);afterLoad();return;}catch(e){}}
  title();
}
window.claude?.hot?.snapshot?.(()=>({save:S&&!S.over?JSON.stringify(S):null}));
window.__qh={captureCamp,ensureAccess,drawUnit,U,enemyCast,get bt(){return bt;},armyPower,addXP,setPath,weeklyReport,get pathNow(){return path;},joinOffer,fightPreview,manageHolding,heroCap,allTowns,myMajors,growRival,rivalsTurn,townBuildings,get VT(){return VT;},FAC_ORDER,migrateRoster,centerOn,rivalTarget,get tcv(){return terrainCv;},MAP_TYPES,rivalInteract,manageSpire,get cam(){return[camX,camY,TS];},openHeroMenu,pickMap,mapPreviewURL,get S(){return S;},startBattle,endDay,walk,planTo,set path(p){path=p;},newGame,afterLoad,HEROES,FAC,RELICS,arriveTown,selectHero,openTown};
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
