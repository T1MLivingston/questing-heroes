'use strict';
/* -------- boot -------- */
/* About & credits: what this is, who made it, and the plain-language notices (see LEGAL.md) */
const ABOUT_HTML=`<div class="about">
  <p><b>Questing Heroes</b> is a free, non-commercial hobby game made by Tim Livingston, built with AI coding help (Claude) and AI image tools (ChatGPT image generation).</p>
  <p>All names, characters, factions, towns and art are original to this game. It is not affiliated with, endorsed by or connected to any other game, studio or company. Any resemblance to other works is coincidental.</p>
  <p>Many heroes are named after friends, family and pets, with their permission; the rest are invented. All characters are fictional; their abilities and looks are made up.</p>
  <p><b>Privacy:</b> the game has no accounts, ads or tracking. Saves and the Hall of Fame stay in your own browser. Fonts are loaded from Google Fonts, which sees your IP address like any website.</p>
  <p><b>Credits:</b> Alegreya and Alegreya SC fonts by Juan Pablo del Peral (Huerta Tipográfica), SIL Open Font License 1.1.</p>
  <p class="muted">© 2026 Tim Livingston. All rights reserved: you are welcome to play, but please don't copy or redistribute the code or art. Provided as is, without warranty. To raise a concern, open an issue on the game's GitHub page and it will be looked at promptly.</p></div>`;
document.addEventListener('click',e=>{const b=e.target.closest('[data-about]');if(!b)return;e.stopPropagation();$('#modal')._close('about');},true);
async function title(){
  const has=loadSave();
  const v=await showModal({title:'',body:`<img class="tbanner" src="${ART_BASE}ui/banner.png" alt="Questing Heroes"><p>Choose how you want to play: hunt the Seven Relics, conquer every rival, or pass the device around for a hot-seat game with friends. Then pick your land, your banner and your hero.</p>
   <p class="muted">Follow the weekly rumours, break through the guarded passes, grow your town, upgrade your troops and hire more heroes. Battles are fought turn by turn on a hex field, and faster stacks act first.</p>
   <p class="tabout"><button class="linkbtn" data-about="1">About &amp; credits</button></p>`,
   buttons:[{label:`${ico('relic_hunt',36)}Hall of Fame`,value:'f'},{label:`${ico('load_game',36)}Load game`,value:'l',disabled:!loadSlots().length},...(has?[{label:`${ico('continue',36)}Continue as ${esc(has.heroes[0].name)}`,value:'c'}]:[]),{label:`${ico('new_campaign',36)}New campaign`,value:'n',primary:true}]});
  if(v==='about'){await showModal({title:'About & credits',body:ABOUT_HTML,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});title();return;}
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
