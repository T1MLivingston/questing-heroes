'use strict';
/* ================= HERO CREATOR (v43) =================
   A worksheet for students: name, banner, look, personality, 6 stat points, a special ability and a spell.
   It writes a character bio and an art prompt from the answers. Nothing leaves the browser: the draft is kept in
   localStorage on this device only, and Copy / Print use the browser itself. */
const CR_KEY='questing-heroes-creator';
const CR_POINTS=6,CR_MAX=4;
const CR_TRAITS=['brave','curious','kind','clever','stubborn','funny','quiet','loyal','sneaky','cheerful','wise','reckless','patient','proud','gentle','fierce'];
const CR_PERKS={unitAtk:'+2 attack',unitDef:'+2 defense',unitSpd:'+1 speed',growth:'+3 recruits a week'};
const CR_MAP={mp:'+15% movement on the map',gold:'+100 gold a day',vision:'+2 sight in the fog',morale:'+1 morale for the whole army',luck:'+1 luck for the whole army'};
const CR_STATS=[['atk','Attack','how hard your troops hit'],['def','Defense','how well your troops take a hit'],['pow','Power','how strong your spells are'],['lore','Lore','how much mana you have']];
/* what each banner looks like, for the art prompt */
const CR_LOOK={rangers:'forest wardens: green and brown leather, hooded cloaks, antler and oak-leaf motifs, teal and gold trim',
  wizards:'scholars of the stars: flowing robes in sky and royal blue, star and moon embroidery, brass trinkets, soft arcane glow',
  necro:'grim but storybook-friendly night mages: crimson and dusky purple robes, bone charms, candles and silver skull clasps',
  centaurs:'wild beast tamers: leaf-green and tan furs, leather straps, feathers, claws and tooth necklaces, tribal paint',
  pirates:'swashbuckling sailors: gold and red coats, sashes, tricorn hats or bandanas, brass buttons, rope and anchor motifs',
  elves:'graceful woodland elves: forest green and silver, leaf-shaped armour, long pointed ears for elves, vines and moon motifs',
  dwarves:'mountain smiths: dark red and steel, braided hair or beards, rivets and runes, forge-blackened leather',
  merfolk:'people of the sea: deep blue and sea-green, scales, shells, coral and pearl jewellery, fins'};
const CR_TYPE={Might:'a fighter: sturdy armour or tough gear and a weapon or shield in view',Magic:'a spellcaster: robes or light clothing, a staff, wand, book or charm, a little magical glow'};
const CR_SPECIES={human:'Human',animal:'Animal',folk:'Fantasy folk',construct:'Robot or construct'};
const CR_GENDER={female:'Female',male:'Male',open:'Leave it open'};
const CR_AGE={young:'Young',adult:'Grown-up',old:'Old'};
const CR_COLS={red:'#c0392b',orange:'#e07b24',gold:'#d4ab52',yellow:'#f1d04b',lime:'#9cc93a','leaf green':'#4f9a3a','forest green':'#2e6b3a',teal:'#2f8f88','sky blue':'#6fb6e8','royal blue':'#2f4fb3',navy:'#1b2a5a',purple:'#7a4bb0',crimson:'#8e1f3a',pink:'#e58bb0',brown:'#7a5432',tan:'#c9a477',black:'#222',grey:'#8a8a8a',silver:'#c8ccd4',white:'#f4f1e8'};
const CR_EXPR={brave:'a determined look',curious:'wide, curious eyes',kind:'a warm, gentle smile',clever:'a sly, knowing smile',stubborn:'a set jaw and a frown',funny:'a cheeky grin',quiet:'a calm, thoughtful face',loyal:'a steady, trustworthy look',sneaky:'a mischievous smirk',cheerful:'a big happy smile',wise:'a calm, wise expression',reckless:'a wild, excited grin',patient:'a calm half-smile',proud:'chin held high',gentle:'soft, kind eyes',fierce:'a fierce glare'};
const CR_DL={skin:['pale','fair','tan','olive','brown','dark brown','orange fur','grey fur','white fur','black fur','green scales','blue scales','bronze metal'],hair:['black','brown','blonde','red','ginger','white','silver','blue','green','purple','bald','none'],eyes:['brown','blue','green','grey','amber','gold','violet','red','glowing']};
let CR=null;
function crLoad(){try{return JSON.parse(localStorage.getItem(CR_KEY))||null;}catch(e){return null;}}
function crSave(){try{localStorage.setItem(CR_KEY,JSON.stringify(CR));}catch(e){}}
function crBlank(){return{name:'',fac:'rangers',type:'Might',kind:'',species:'human',animal:'',gender:'open',age:'adult',skin:'',hair:'',eyes:'',cols:[],look:'',outfit:'',carry:'',traits:[],home:'',want:'',fear:'',st:{atk:1,def:1,pow:1,lore:1},abName:'',abMode:'troop',abUnit:'',abPerk:'unitAtk',abMap:'mp',abOwn:'',spMode:'pick',sp:'',spName:'',spOwn:''};}
const crPro=()=>CR.gender==='female'?{s:'she',o:'her',p:'her',v:'is'}:CR.gender==='male'?{s:'he',o:'him',p:'his',v:'is'}:{s:'they',o:'them',p:'their',v:'are'};
const crCap=t=>t.replace(/^./,c=>c.toUpperCase());
function crWho(){const role=CR.kind.trim().replace(/^(a|an|the)\s+/i,'')||(CR.type==='Magic'?'spellcaster':'warrior');
  const sp=CR.species==='animal'?(CR.animal.trim()||'animal'):CR.species==='folk'?(CR.animal.trim()||''):CR.species==='construct'?(CR.animal.trim()||'clockwork'):'';
  const ag=CR.age==='young'?'young ':CR.age==='old'?'old ':'',w=(ag+(sp?sp+' ':'')+role).trim();return(/^[aeiou]/i.test(w)?'an ':'a ')+w;}
const crLeft=()=>CR_POINTS-Object.values(CR.st).reduce((a,b)=>a+b,0);
const crOpt=(v,cur,lab)=>`<option value="${esc(v)}"${v===cur?' selected':''}>${esc(lab)}</option>`;
function crAbilityText(){const f=FAC[CR.fac];
  if(CR.abMode==='own')return CR.abOwn.trim()||'(write your own ability)';
  if(CR.abMode==='map')return CR_MAP[CR.abMap].replace(/^./,c=>c.toUpperCase())+'.';
  const u=U[CR.abUnit||f.units[0]];const nm=u?u.name:'Troop';return `${/s$/.test(nm)?nm:nm+'s'} ${CR_PERKS[CR.abPerk]}.`;}
function crSpellText(){if(CR.spMode==='own')return{name:CR.spName.trim()||'(name your spell)',desc:CR.spOwn.trim()||'(say what it does)'};
  const k=CR.sp||FAC_SPELLS[CR.fac][0],s=SP[k];return{name:s.name,desc:s.desc(2)};}
function crBio(){const f=FAC[CR.fac],n=CR.name.trim()||'Our hero',P=crPro(),tr=CR.traits.length?CR.traits.slice(0,3):['brave'];
  const tl=tr.length>1?tr.slice(0,-1).join(', ')+' and '+tr[tr.length-1]:tr[0],cl=t=>t.trim().replace(/\.$/,'');
  const best=[...CR_STATS].sort((x,y)=>CR.st[y[0]]-CR.st[x[0]])[0],sp=crSpellText();
  let s=`${n} is ${crWho()} who fights for the ${f.arch}${CR.home.trim()?`, raised in ${cl(CR.home)}`:''}. `;
  const feat=[CR.skin.trim()&&(/fur|scale|metal/i.test(CR.skin)?cl(CR.skin):cl(CR.skin)+' skin'),CR.hair.trim()&&!/^(none|bald)$/i.test(CR.hair.trim())&&cl(CR.hair)+' hair',CR.eyes.trim()&&cl(CR.eyes)+' eyes'].filter(Boolean);
  if(feat.length)s+=`${crCap(P.s)} ${P.v==='are'?'have':'has'} ${feat.length>1?feat.slice(0,-1).join(', ')+' and '+feat[feat.length-1]:feat[0]}${CR.look.trim()?`, and ${cl(CR.look)}`:''}. `;
  else if(CR.look.trim())s+=`${crCap(P.s)} ${P.v==='are'?'have':'has'} ${cl(CR.look)}. `;
  if(CR.outfit.trim()||CR.cols.length)s+=`${crCap(P.s)} wear${P.v==='are'?'':'s'} ${CR.outfit.trim()?cl(CR.outfit):'clothes'}${CR.cols.length?` in ${CR.cols.join(' and ')}`:''}${CR.carry.trim()?` and carr${P.v==='are'?'y':'ies'} ${cl(CR.carry)}`:''}. `;
  else if(CR.carry.trim())s+=`${crCap(P.s)} always carr${P.v==='are'?'y':'ies'} ${cl(CR.carry)}. `;
  s+=`Friends say ${n} is ${tl}. `;
  s+=`As a ${CR.type} hero, ${n}'s greatest strength is ${best[1]}: ${best[2]}. `;
  s+=`${n}'s special ability${CR.abName.trim()?`, ${CR.abName.trim()},`:''} gives this: ${crAbilityText().replace(/\.$/,'')}. `;
  s+=`${crCap(P.p)} signature spell is ${sp.name}: ${sp.desc.replace(/\.$/,'')}. `;
  if(CR.want.trim())s+=`More than anything, ${n} wants ${cl(CR.want)}`+(CR.fear.trim()?`, even though ${P.s} ${P.v} afraid of ${cl(CR.fear)}. `:'. ');
  else if(CR.fear.trim())s+=`Deep down, ${n} is afraid of ${cl(CR.fear)}. `;
  return s.trim();}
function crPrompt(){const f=FAC[CR.fac],n=CR.name.trim()||'the hero',cl=t=>t.trim().replace(/\.$/,'');
  const g=CR.gender==='female'?'female ':CR.gender==='male'?'male ':'',ag=CR.age==='young'?'young ':CR.age==='old'?'old ':'grown-up ';
  const role=CR.kind.trim().replace(/^(a|an|the)\s+/i,'')||(CR.type==='Magic'?'spellcaster':'warrior');
  const body=CR.species==='animal'?`an anthropomorphic ${CR.animal.trim()||'animal'} (an animal person: ${CR.animal.trim()||'animal'} head, fur and features, standing upright like a person)`:
    CR.species==='folk'?`${CR.animal.trim()?'a '+CR.animal.trim():'a fantasy-folk'} (not human)`:CR.species==='construct'?`a ${CR.animal.trim()||'clockwork'} construct (a friendly robot-like being, not human)`:'a human';
  const tr=CR.traits.length?CR.traits:['brave'],ex=tr.map(t=>CR_EXPR[t]).filter(Boolean).slice(0,2).join(' and ');
  const L=[];
  L.push('Create a pixel-art hero portrait for a fantasy strategy game.');
  L.push('');
  L.push(`CHARACTER: ${n}, a ${ag}${g}${role}. ${crCap(body)}. ${CR.type} hero, ${CR_TYPE[CR.type]}.`);
  const looks=[CR.skin.trim()&&('skin/fur/body: '+cl(CR.skin)),CR.hair.trim()&&('hair: '+cl(CR.hair)),CR.eyes.trim()&&('eyes: '+cl(CR.eyes)),CR.look.trim()&&cl(CR.look)].filter(Boolean);
  if(looks.length)L.push(`LOOKS: ${looks.join('; ')}.`);
  L.push(`CLOTHES AND GEAR: ${CR.outfit.trim()?cl(CR.outfit):'outfit that fits the banner'}${CR.cols.length?`, mainly ${CR.cols.join(' and ')}`:''}${CR.carry.trim()?`; carrying ${cl(CR.carry)}`:''}.`);
  L.push(`BANNER STYLE (${f.arch}): ${CR_LOOK[CR.fac]}. Banner colour ${f.col} with accents of ${f.col2}.`);
  L.push(`PERSONALITY: ${tr.join(', ')}. Expression: ${ex||'confident'}.`);
  L.push('');
  L.push('ART STYLE (follow exactly):');
  L.push('- True pixel art on a 128×128 pixel canvas, crisp square pixels, no anti-aliasing, no blur, no gradients, no painterly brush strokes.');
  L.push('- Limited palette of about 24 colours, warm storybook fantasy look, friendly and easy to read at small size.');
  L.push('- A 1-pixel dark plum outline (#2b1a33) around the figure and major shapes.');
  L.push('- Light from the upper left, with 2-3 shading steps per colour.');
  L.push('- Head-and-shoulders bust in three-quarter view, facing slightly right, centred, filling most of the frame.');
  L.push('- Transparent background (or one flat colour that is easy to remove). No text, frame, border, logo or watermark.');
  L.push('- An original character, not based on any existing game, film, show or book.');
  return L.join('\n');}
function crHTML(){const f=FAC[CR.fac],left=crLeft();
  const units=f.units.map(k=>crOpt(k,CR.abUnit||f.units[0],U[k].name)).join(''),spells=FAC_SPELLS[CR.fac].map(k=>crOpt(k,CR.sp||FAC_SPELLS[CR.fac][0],SP[k].name)).join('');
  return `<div class="creator" style="--c:${f.col}">
  <p class="muted">Fill in the worksheet. Your hero's story and an art prompt are written for you at the bottom. Everything stays on this device.</p>
  <section><h3>1. Who are you?</h3>
    <label>Hero name <input data-cr="name" maxlength="24" value="${esc(CR.name)}" placeholder="e.g. Juniper Quill"></label>
    <label>Their role <input data-cr="kind" maxlength="40" value="${esc(CR.kind)}" placeholder="e.g. knight, scout, healer, storm witch"></label>
    <div class="cr-row"><span>Are they…</span>${Object.entries(CR_SPECIES).map(([k,l])=>`<button class="chip${CR.species===k?' on':''}" data-crspec="${k}">${l}</button>`).join('')}</div>
    ${CR.species!=='human'?`<label>${CR.species==='animal'?'Which animal?':CR.species==='folk'?'What kind?':'What is it like?'} <input data-cr="animal" maxlength="30" value="${esc(CR.animal)}" placeholder="${CR.species==='animal'?'e.g. fox, owl, badger, turtle':CR.species==='folk'?'e.g. elf, dwarf, mermaid, goblin, dragonkin':'e.g. clockwork owl, stone golem, brass knight'}"></label>`:''}
    <div class="cr-row"><span>Gender</span>${Object.entries(CR_GENDER).map(([k,l])=>`<button class="chip${CR.gender===k?' on':''}" data-crgen="${k}">${l}</button>`).join('')}<span style="margin-left:14px">Age</span>${Object.entries(CR_AGE).map(([k,l])=>`<button class="chip${CR.age===k?' on':''}" data-crage="${k}">${l}</button>`).join('')}</div>
    <label>Banner <select data-cr="fac">${FAC_ORDER.map(k=>crOpt(k,CR.fac,FAC[k].arch)).join('')}</select></label>
    <div class="cr-row"><span>Hero type</span>${['Might','Magic'].map(t=>`<button class="chip${CR.type===t?' on':''}" data-crtype="${t}">${t==='Might'?'⚔ Might':'✦ Magic'}</button>`).join('')}</div>
    <p class="cr-hint"><b>${f.arch}:</b> ${esc(f.mech)}. ${esc(f.mechDesc)}</p></section>
  <section><h3>2. What do they look like?</h3>
    <label>${CR.species==='animal'?'Fur or feathers':CR.species==='construct'?'Body (metal, stone…)':'Skin'} colour <input data-cr="skin" list="crdl-skin" maxlength="30" value="${esc(CR.skin)}" placeholder="e.g. tan, orange fur, bronze metal"></label>
    <label>Hair colour <input data-cr="hair" list="crdl-hair" maxlength="30" value="${esc(CR.hair)}" placeholder="e.g. curly red, silver braids, none"></label>
    <label>Eye colour <input data-cr="eyes" list="crdl-eyes" maxlength="20" value="${esc(CR.eyes)}" placeholder="e.g. green"></label>
    ${Object.entries(CR_DL).map(([k,v])=>`<datalist id="crdl-${k}">${v.map(x=>`<option value="${x}">`).join('')}</datalist>`).join('')}
    <label>Other details <input data-cr="look" maxlength="90" value="${esc(CR.look)}" placeholder="e.g. freckles, a scar over one eye, a gap-toothed grin"></label>
    <div class="cr-row"><span>Clothes colours (up to 2)</span><div class="cr-cols">${Object.entries(CR_COLS).map(([k,c])=>`<button class="cr-col${CR.cols.includes(k)?' on':''}" data-crcol="${k}" title="${k}" style="--sw:${c}"><i></i>${k}</button>`).join('')}</div></div>
    <p class="cr-hint"><b>${f.arch} look:</b> ${CR_LOOK[CR.fac]}.</p>
    <label>Clothes or armour <input data-cr="outfit" maxlength="70" value="${esc(CR.outfit)}" placeholder="e.g. a patched green cloak"></label>
    <label>Something they carry <input data-cr="carry" maxlength="60" value="${esc(CR.carry)}" placeholder="e.g. a lantern on a long staff"></label></section>
  <section><h3>3. Personality (pick up to 3)</h3><div class="cr-chips">${CR_TRAITS.map(t=>`<button class="chip${CR.traits.includes(t)?' on':''}" data-crtrait="${t}">${t}</button>`).join('')}</div>
    <label>Where did they grow up? <input data-cr="home" maxlength="50" value="${esc(CR.home)}" placeholder="e.g. a mill town by the river"></label>
    <label>What do they want most? <input data-cr="want" maxlength="70" value="${esc(CR.want)}" placeholder="e.g. to find their lost brother"></label>
    <label>What scares them? <input data-cr="fear" maxlength="50" value="${esc(CR.fear)}" placeholder="e.g. deep water"></label></section>
  <section><h3>4. Stats: spend ${CR_POINTS} points <span class="cr-left${left?'':' done'}">${left} left</span></h3>
    <div class="cr-stats">${CR_STATS.map(([k,l,d])=>`<div class="cr-stat"><b>${l}</b><small>${d}</small><div><button class="btn sm" data-crst="${k}" data-d="-1" ${CR.st[k]<=0?'disabled':''}>−</button><span>${CR.st[k]}</span><button class="btn sm" data-crst="${k}" data-d="1" ${CR.st[k]>=CR_MAX||left<=0?'disabled':''}>+</button></div></div>`).join('')}</div>
    <p class="cr-hint">Most heroes start with ${CR_POINTS} points, no more than ${CR_MAX} in one stat. Might heroes usually lean on Attack and Defense, Magic heroes on Power and Lore.</p></section>
  <section><h3>5. Special ability</h3>
    <label>Ability name <input data-cr="abName" maxlength="30" value="${esc(CR.abName)}" placeholder="e.g. Lantern Bearer"></label>
    <div class="cr-row">${[['troop','Boost a troop'],['map','Help on the map'],['own','Write my own']].map(([m,l])=>`<button class="chip${CR.abMode===m?' on':''}" data-crab="${m}">${l}</button>`).join('')}</div>
    ${CR.abMode==='troop'?`<div class="cr-row"><select data-cr="abUnit">${units}</select><select data-cr="abPerk">${Object.entries(CR_PERKS).map(([k,l])=>crOpt(k,CR.abPerk,l)).join('')}</select></div>`:
      CR.abMode==='map'?`<select data-cr="abMap">${Object.entries(CR_MAP).map(([k,l])=>crOpt(k,CR.abMap,l)).join('')}</select>`:
      `<textarea data-cr="abOwn" maxlength="140" rows="2" placeholder="Keep it small and fair, like the other heroes: e.g. Sprites +1 speed and +1 attack.">${esc(CR.abOwn)}</textarea>`}</section>
  <section><h3>6. Signature spell</h3>
    <div class="cr-row">${[['pick','Pick a ${f.arch} spell'],['own','Invent a spell']].map(([m,l])=>`<button class="chip${CR.spMode===m?' on':''}" data-crsp="${m}">${l.replace('${f.arch}',f.arch)}</button>`).join('')}</div>
    ${CR.spMode==='pick'?`<select data-cr="sp">${spells}</select><p class="cr-hint">${esc(crSpellText().desc)}</p>`:
      `<label>Spell name <input data-cr="spName" maxlength="30" value="${esc(CR.spName)}" placeholder="e.g. Lantern Flare"></label><textarea data-cr="spOwn" maxlength="140" rows="2" placeholder="What does it do? e.g. Blinds one enemy stack so it misses its next turn.">${esc(CR.spOwn)}</textarea>`}</section>
  <section class="cr-out"><h3>Your hero's story</h3><p id="crBio">${esc(crBio())}</p>
    <h3>Art prompt <small class="cr-sub">paste into any AI image tool</small></h3><p id="crPrompt" class="cr-prompt">${esc(crPrompt())}</p>
    <div class="cr-row"><button class="btn" data-crcopy="bio">Copy story</button><button class="btn" data-crcopy="prompt">Copy art prompt</button><button class="btn" data-crprint="1">Print worksheet</button><button class="btn" data-crreset="1">Start over</button></div></section></div>`;}
/* refresh the story and prompt as the student types, without rebuilding the form (keeps the cursor in place) */
function crLive(){const b=$('#crBio'),p=$('#crPrompt');if(b)b.textContent=crBio();if(p)p.textContent=crPrompt();crSave();}
function crRedraw(){const el=$('#modal .creator');if(!el)return;const y=el.closest('.body').scrollTop;el.outerHTML=crHTML();const b=$('#modal .body');if(b)b.scrollTop=y;crSave();}
function crPrint(){const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print.');return;}const f=FAC[CR.fac],sp=crSpellText();
  w.document.write(`<!doctype html><meta charset="utf-8"><title>${esc(CR.name||'My hero')}</title><style>body{font:16px/1.5 Georgia,serif;max-width:720px;margin:30px auto;padding:0 16px;color:#222}h1{margin:0}h2{font-size:17px;border-bottom:1px solid #999;margin-top:22px}td{padding:2px 12px 2px 0}</style>
  <h1>${esc(CR.name||'My hero')}</h1><p>${esc(crCap(crWho()))} · ${f.arch} · ${CR.type} hero</p>
  <h2>Stats</h2><table>${CR_STATS.map(([k,l])=>`<tr><td>${l}</td><td><b>${CR.st[k]}</b></td></tr>`).join('')}</table>
  <h2>Special ability${CR.abName?': '+esc(CR.abName):''}</h2><p>${esc(crAbilityText())}</p>
  <h2>Signature spell: ${esc(sp.name)}</h2><p>${esc(sp.desc)}</p>
  <h2>Story</h2><p>${esc(crBio())}</p><h2>Art prompt</h2><p style="white-space:pre-wrap;font:13px/1.45 monospace">${esc(crPrompt())}</p><h2>Draw your hero</h2><div style="height:260px;border:2px dashed #999"></div>`);
  w.document.close();w.focus();w.print();}
async function openCreator(){CR=Object.assign(crBlank(),crLoad()||{});
  const m=$('#modal');
  const onInput=e=>{const t=e.target.closest('[data-cr]');if(!t)return;CR[t.dataset.cr]=t.value;
    if(t.dataset.cr==='fac'){CR.abUnit='';CR.sp='';crRedraw();}else if(t.tagName==='SELECT')crRedraw();else crLive();};
  const onClick=e=>{const b=e.target.closest('button');if(!b||!b.closest('.creator'))return;const d=b.dataset;
    if(d.crtype)CR.type=d.crtype;else if(d.crspec)CR.species=d.crspec;else if(d.crgen)CR.gender=d.crgen;else if(d.crage)CR.age=d.crage;
    else if(d.crcol){const i=CR.cols.indexOf(d.crcol);if(i>=0)CR.cols.splice(i,1);else if(CR.cols.length<2)CR.cols.push(d.crcol);else{toast('Pick up to two colours.');return;}}else if(d.crtrait){const i=CR.traits.indexOf(d.crtrait);if(i>=0)CR.traits.splice(i,1);else if(CR.traits.length<3)CR.traits.push(d.crtrait);else{toast('Pick up to three.');return;}}
    else if(d.crst){const v=CR.st[d.crst]+(+d.d);if(v<0||v>CR_MAX||(+d.d>0&&crLeft()<=0))return;CR.st[d.crst]=v;}
    else if(d.crab)CR.abMode=d.crab;else if(d.crsp)CR.spMode=d.crsp;
    else if(d.crcopy){const txt=d.crcopy==='bio'?crBio():crPrompt();(navigator.clipboard?navigator.clipboard.writeText(txt):Promise.reject()).then(()=>toast('Copied.'),()=>toast('Select the text and copy it by hand.'));return;}
    else if(d.crprint){crPrint();return;}else if(d.crreset){CR=crBlank();}else return;
    e.preventDefault();crRedraw();};
  m.addEventListener('input',onInput);m.addEventListener('click',onClick);
  await showModal({title:'Create your hero',body:crHTML(),wide:true,top:true,buttons:[{label:'Back',value:1,primary:true}],dismiss:1});
  m.removeEventListener('input',onInput);m.removeEventListener('click',onClick);crSave();}
