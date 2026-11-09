'use strict';
/* -------- boot -------- */
async function title(){
  const has=loadSave();
  const v=await showModal({title:'',body:`<img class="tbanner" src="${ART_BASE}ui/banner.png" alt="Questing Heroes"><p>Choose how you want to play: hunt the Seven Relics, conquer every rival, chase the roaming Grail Keepers, or pass the device around for a hot-seat game with friends. Then pick your land, your banner and your hero.</p>
   <p class="muted">Follow the weekly rumours, break through the guarded passes, grow your town, upgrade your troops and hire more heroes. Battles are fought turn by turn on a hex field, and faster stacks act first.</p>`,
   buttons:[{label:`${ico('relic_hunt',36)}Hall of Fame`,value:'f'},{label:`${ico('load_game',36)}Load game`,value:'l',disabled:!loadSlots().length},...(has?[{label:`${ico('continue',36)}Continue as ${esc(has.heroes[0].name)}`,value:'c'}]:[]),{label:`${ico('new_campaign',36)}New campaign`,value:'n',primary:true}]});
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
window.__qh={captureCamp,drawUnit,U,enemyCast,get bt(){return bt;},armyPower,addXP,setPath,weeklyReport,get pathNow(){return path;},joinOffer,fightPreview,manageHolding,heroCap,allTowns,myMajors,growRival,rivalsTurn,townBuildings,get VT(){return VT;},FAC_ORDER,migrateRoster,centerOn,rivalTarget,get tcv(){return terrainCv;},MAP_TYPES,rivalInteract,manageSpire,get cam(){return[camX,camY,TS];},openHeroMenu,pickMap,mapPreviewURL,get S(){return S;},startBattle,endDay,walk,planTo,set path(p){path=p;},newGame,afterLoad,HEROES,FAC,RELICS,arriveTown,selectHero,openTown};
window.claude?.hot?.ready?window.claude.hot.ready(boot):boot(window.claude?.hot?.data??{});
