'use strict';
/* ================= DATA ================= */
const RES=['gold','timber','ore','amber','gems','moonwater'];
const RESNAME={gold:'Gold',timber:'Timber',ore:'Ore',amber:'Amber',gems:'Gems',moonwater:'Moonwater'};
const STATN={atk:'Attack',def:'Defense',pow:'Power',lore:'Lore'};

const FAC={
  rangers:{arch:'Rangers',name:'Vale Wardens',town:'Hollowmere',col:'#2f8f88',col2:'#d4ab52',pal:['#2f8f88','#d4ab52','#5d7f3a','#7a5432'],
    tags:['Defensive','Steady','Good first pick'],mech:'Rootbound',mechDesc:'A stack that ends its turn without moving gains +2 defense until it moves.',
    units:['thorn','reed','antler','moth','oak'],dw:['Bramble Barracks','Reed Lodge','Antler Stables','Moth Spire','Heartwood Grove'],travel:'foot'},
  wizards:{arch:'Wizards',name:'Azure Conclave',town:'Lanternspire',col:'#4a74d6',col2:'#dfe4ee',pal:['#4a74d6','#dfe4ee','#7d5fc0','#e0b24a'],
    tags:['Spellcasters','Fragile troops','Tricky'],mech:'Spell Echo',mechDesc:"Your hero's first spell each battle is cast twice.",
    units:['owl','apprentice','earthel','stormel','magus'],dw:['Owlery','Apprentice Hall','Earthen Circle','Storm Spire','Archmage Tower'],travel:'foot'},
  necro:{arch:'Necromancers',name:'Hollow Court',town:'Grimhollow',col:'#8656b8',col2:'#d8d0b8',pal:['#8656b8','#d8d0b8','#3d4a46','#7fd0a0'],
    tags:['Army grows','Slow start','Relentless'],mech:'Grave Harvest',mechDesc:'After each victory, 10% of the fallen enemies rise as Skeletons in your army.',
    units:['skeleton','zombie','werewolf','vampire','hellkite'],dw:['Bone Pit','Grave Field','Moonlit Kennel','Blood Manor','Hellkite Roost'],travel:'foot'},
  centaurs:{arch:'Beastmasters',name:'Wildhoof Covenant',town:'Hoofmeet Downs',col:'#c07a2e',col2:'#ead49a',pal:['#c07a2e','#ead49a','#6b4a2e','#4f6c35'],
    tags:['Fast','Flanking','Combos'],mech:'Pack Bond',mechDesc:'Your stacks standing next to another of your stacks gain +1 speed and +2 attack.',
    units:['rabbit','boar','hounds','centaur','lion'],dw:['Warren','Boar Wallow','Kennel Ring','Centaur Camp','Pride Rock'],travel:'hooves'},
  pirates:{arch:'Pirates',name:'Saltwind Corsairs',town:'Port Brigand',col:'#b8403a',col2:'#ecdcaa',pal:['#b8403a','#ecdcaa','#22303a','#c9a24a'],
    tags:['Gold rich','Heavy guns','Sailors'],mech:'Plunder',mechDesc:'Every battle you win pays out gold. Your hero starts with a boat.',
    units:['deckhand','powder','duelist','gunner','cannon'],dw:['Bunkhouse','Monkey Rigging','Fencing Deck','Musket Range','Gun Deck'],travel:'boat'},
  elves:{arch:'Elves',name:'Silverbough',town:'Silverbough Glade',col:'#5fb070',col2:'#e2e8f2',pal:['#5fb070','#e2e8f2','#3b5f8a','#b8d86a'],
    tags:['Best archers','Fast','Fragile'],mech:'Double Volley',mechDesc:"Your archers that didn't move last turn shoot twice.",
    units:['sprite','longbow','dryad','rider','eagle'],dw:['Sprite Bower','Archery Glade','Warden Grove','Silver Stables','Eagle Eyrie'],travel:'foot'},
  dwarves:{arch:'Dwarves',name:'Emberforge Holds',town:'Emberdeep',col:'#d66a2c',col2:'#cfc8ba',pal:['#d66a2c','#cfc8ba','#5a5a62','#f2c14e'],
    tags:['Armoured','Slow','Upgradeable'],mech:'Forging',mechDesc:'Build the Great Forge to give every Dwarven unit +1 attack and +1 defense.',
    units:['delver','bolt','paladin','ramrider','golem'],dw:['Youngling Halls','Crossbow Works','Paladin Chapel','Ram Pens','Golem Forge'],travel:'foot'},
  merfolk:{arch:'Merfolk',name:'Deepwater Tide',town:'Coralreach',col:'#22a3b4',col2:'#f2917a',pal:['#22a3b4','#f2917a','#1e4f6a','#e8d7a8'],
    tags:['Swimmers','Tidal surges','Unusual'],mech:'High Tide',mechDesc:'Every third round the tide rises: your units gain +2 speed and +2 attack for that round.',
    units:['spear','siren','crab','turtle','colossus'],dw:['Coral Barracks','Siren Rocks','Crab Shoals','Turtle Beach','Living Reef'],travel:'swim'},
};
const FAC_ORDER=['rangers','wizards','necro','centaurs','pirates','elves','dwarves','merfolk'];
const TRAVEL={foot:'On foot. Build Stables or visit a Horse Fair for a horse.',hooves:'Hooves: horse speed from day one.',boat:'Starts with a boat for crossing lakes.',swim:'Lives in a lagoon. Swims fast (half the cost of walking) but is 50% slower on land.'};

/* units: g = glyph spec for the placeholder art */
const U={
  thorn:{name:'Thornguard',pl:'Thornguard',hp:10,atk:4,def:5,min:1,max:3,spd:4,cost:60,growth:12,col:'#6f8f3f',desc:'Spear wall. Sturdy and cheap.'},
  reed:{name:'Reedbow',pl:'Reedbows',hp:9,atk:6,def:3,min:2,max:3,spd:5,shots:12,cost:110,growth:9,col:'#a08a3c',desc:'Shoots from range. Half damage up close.'},
  antler:{name:'Antler Knight',pl:'Antler Knights',hp:32,atk:9,def:8,min:5,max:8,spd:7,cost:340,growth:5,col:'#8b5a35',charge:true,desc:'Charge: +6% damage per hex moved before striking.'},
  moth:{name:'Moth Seer',pl:'Moth Seers',hp:26,atk:9,def:7,min:4,max:7,spd:9,fly:true,noRetal:true,cost:450,growth:3,col:'#7b6aa8',desc:'Flies. Enemies cannot strike back.'},
  oak:{name:'Oak Warden',pl:'Oak Wardens',hp:110,atk:15,def:17,min:13,max:20,spd:4,retal:2,cost:1150,amber:1,growth:1,col:'#3f6b3a',desc:'Strikes back twice each round.'},
  owl:{name:'Owl Familiar',pl:'Owl Familiars',hp:7,atk:4,def:2,min:1,max:3,spd:8,fly:true,cost:70,growth:12,g:['bird','#8a6a4a'],desc:'Flies. A wise old bird that serves the tower.'},
  apprentice:{name:'Apprentice Mage',pl:'Apprentice Mages',hp:10,atk:6,def:3,min:2,max:4,spd:5,shots:10,cost:130,growth:8,g:['fig',{w:'staff',hat:'pointed',col:'#6a7ad0'}],desc:'Shoots sparks from range. Half damage up close.'},
  earthel:{name:'Earth Elemental',pl:'Earth Elementals',hp:44,atk:8,def:12,min:4,max:7,spd:4,cost:360,growth:4,g:['construct','#8a7458'],desc:'Living stone. Very hard to hurt.'},
  stormel:{name:'Storm Elemental',pl:'Storm Elementals',hp:24,atk:11,def:7,min:4,max:8,spd:10,fly:true,noRetal:true,cost:460,growth:3,g:['storm','#7fb8f0'],desc:'Flies on the wind. Enemies cannot strike back at lightning.'},
  magus:{name:'Archmage',pl:'Archmages',hp:60,atk:15,def:11,min:11,max:17,spd:6,shots:12,cost:1100,amber:1,growth:1,g:['fig',{w:'staff',hat:'pointed',col:'#3a5fb8'}],desc:'Master of the tower. Hurls lightning from range.'},
  skeleton:{name:'Skeleton',pl:'Skeletons',hp:8,atk:3,def:4,min:1,max:3,spd:4,cost:50,growth:14,undead:true,g:['skull','#d8d0b8'],desc:'Undead. Cheap and endless.'},
  zombie:{name:'Zombie',pl:'Zombies',hp:16,atk:5,def:4,min:2,max:3,spd:4,cost:100,growth:9,undead:true,g:['fig',{w:'none',hat:'none',col:'#4a5a3a',skin:'#8aa878'}],desc:'Undead. Slow, but takes a lot of punishment.'},
  werewolf:{name:'Werewolf',pl:'Werewolves',hp:30,atk:10,def:6,min:4,max:7,spd:8,cost:380,growth:4,g:['wolf','#6a5a4e'],desc:'Fast and savage hunter of the night.'},
  vampire:{name:'Vampire',pl:'Vampires',hp:34,atk:11,def:9,min:5,max:8,spd:8,fly:true,drain:true,undead:true,cost:460,growth:3,g:['fig',{w:'sword',hat:'cape',col:'#5a1a2a',skin:'#e0dcd0'}],desc:'Flies. Heals itself by draining what it bites.'},
  hellkite:{name:'Hellkite',pl:'Hellkites',hp:110,atk:17,def:13,min:14,max:22,spd:9,fly:true,undead:true,cost:1300,amber:1,growth:1,g:['dragon','#4a2e5a'],desc:'Flies. The supreme terror of the Hollow Court: a dead dragon wreathed in green fire.'},
  rabbit:{name:'War Rabbit',pl:'War Rabbits',hp:7,atk:4,def:2,min:1,max:3,spd:9,cost:55,growth:13,g:['rabbit','#b89a78'],desc:'Very fast and very many.'},
  boar:{name:'Boar',pl:'Boars',hp:18,atk:7,def:5,min:2,max:5,spd:6,charge:true,cost:130,growth:8,g:['boar','#6a4a36'],desc:'Charge: +6% damage per hex moved before striking.'},
  hounds:{name:'Hound',pl:'Hounds',hp:30,atk:9,def:7,min:4,max:7,spd:9,cost:340,growth:5,g:['wolf','#9a7a52'],desc:'Fast tracker that hunts in packs.'},
  centaur:{name:'Centaur',pl:'Centaurs',hp:32,atk:10,def:7,min:5,max:8,spd:8,shots:10,cost:460,growth:3,g:['centaur','#a0602a'],desc:'Shoots on the gallop.'},
  lion:{name:'Lion',pl:'Lions',hp:100,atk:16,def:14,min:13,max:19,spd:7,retal:2,cost:1150,amber:1,growth:1,g:['lion','#d0a050'],desc:'King of the herd. Strikes back twice each round.'},
  deckhand:{name:'Deckhand',pl:'Deckhands',hp:10,atk:5,def:4,min:1,max:3,spd:5,cost:65,growth:12,g:['fig',{w:'sword',hat:'band',col:'#3a4a5a'}],desc:'Tough sailors with belaying pins.'},
  powder:{name:'Powder Monkey',pl:'Powder Monkeys',hp:8,atk:6,def:3,min:2,max:4,spd:7,shots:8,cost:115,growth:9,g:['monkey','#8a5a32'],desc:'A ship monkey that lobs powder bombs.'},
  duelist:{name:'Duelist',pl:'Duelists',hp:28,atk:10,def:7,min:4,max:7,spd:7,double:true,noRetal:true,cost:420,growth:4,g:['fig',{w:'sword',hat:'tricorn',col:'#9a2a2a'}],desc:'Strikes twice, and parries so well that no one strikes back.'},
  gunner:{name:'Gunner',pl:'Gunners',hp:26,atk:10,def:6,min:5,max:8,spd:5,shots:10,cost:420,growth:3,g:['fig',{w:'gun',hat:'band',col:'#2a4a5a'}],desc:'Musket fire from range.'},
  cannon:{name:'Cannon Crew',pl:'Cannon Crews',hp:80,atk:16,def:10,min:14,max:22,spd:3,shots:8,cost:1150,amber:1,growth:1,g:['cannon','#3a3a3e'],desc:'Devastating at range. Very slow. Upgrades to a giant crossbow.'},
  sprite:{name:'Sprite',pl:'Sprites',hp:6,atk:4,def:2,min:1,max:3,spd:8,fly:true,cost:60,growth:12,g:['sprite','#9ad070'],desc:'Flies. Tiny and quick.'},
  longbow:{name:'Longbow Ranger',pl:'Longbow Rangers',hp:12,atk:7,def:4,min:2,max:4,spd:5,shots:14,cost:140,growth:8,g:['fig',{w:'bow',hat:'ears',col:'#3f6a3a',hair:'#e8e0c0'}],desc:'The finest archers in the land.'},
  dryad:{name:'Grove Warden',pl:'Grove Wardens',hp:30,atk:8,def:10,min:4,max:6,spd:5,regen:true,cost:340,growth:5,g:['fig',{w:'staff',hat:'leaf',col:'#5a8a3a',skin:'#a8c088'}],desc:'Regrows its wounds each turn.'},
  rider:{name:'Elven Rider',pl:'Elven Riders',hp:34,atk:11,def:7,min:5,max:8,spd:9,charge:true,cost:460,growth:3,g:['rider',{col:'#5a6aa8',horse:'#e8e4dc',w:'spear',hat:'ears'}],desc:'Charge: +6% damage per hex moved.'},
  eagle:{name:'Giant Eagle',pl:'Giant Eagles',hp:90,atk:16,def:12,min:12,max:20,spd:11,fly:true,cost:1200,amber:1,growth:1,g:['eagle','#7a5a32'],desc:'Flies farther than anything in the land.'},
  delver:{name:'Young Dwarf',pl:'Young Dwarves',hp:12,atk:4,def:6,min:1,max:3,spd:4,cost:65,growth:12,g:['fig',{w:'hammer',hat:'beard',col:'#6a4a2a'}],desc:'Short, stout, unmovable.'},
  bolt:{name:'Dwarf Crossbowman',pl:'Dwarf Crossbowmen',hp:12,atk:6,def:5,min:2,max:4,spd:4,shots:12,cost:120,growth:9,g:['fig',{w:'bow',hat:'beard',col:'#5a5a62'}],desc:'Heavy crossbow bolts from range.'},
  paladin:{name:'Dwarf Paladin',pl:'Dwarf Paladins',hp:40,atk:9,def:13,min:4,max:7,spd:4,cost:360,growth:5,g:['fig',{w:'hammer',hat:'helm',col:'#c0a040'}],desc:'A holy wall of iron.'},
  ramrider:{name:'Ram Rider',pl:'Ram Riders',hp:34,atk:11,def:8,min:5,max:9,spd:7,charge:true,cost:440,growth:3,g:['rider',{col:'#c0582e',horse:'#ddd8cc',w:'hammer',hat:'beard',ram:true}],desc:'Charge: +6% damage per hex moved.'},
  golem:{name:'Gem Golem',pl:'Gem Golems',hp:120,atk:15,def:18,min:12,max:20,spd:4,retal:2,cost:1200,amber:1,growth:1,g:['golem','#7a7a82'],desc:'A stone giant woken by a heart gem. Strikes back twice each round.'},
  spear:{name:'Spearfolk',pl:'Spearfolk',hp:11,atk:5,def:5,min:1,max:3,spd:5,cost:65,growth:12,g:['fig',{w:'spear',hat:'fin',col:'#e07a6a',skin:'#7ac0c0'}],desc:'Reef guards with coral spears.'},
  siren:{name:'Siren',pl:'Sirens',hp:10,atk:6,def:3,min:2,max:3,spd:6,shots:8,charm:true,cost:130,growth:8,g:['fig',{w:'song',hat:'fin',col:'#2a8aa0',skin:'#8ad0d0'}],desc:'Sings from range. 30% chance a hit charms the target, losing its next turn.'},
  crab:{name:'Giant Crab',pl:'Giant Crabs',hp:40,atk:8,def:13,min:4,max:7,spd:4,cost:350,growth:5,g:['crab','#c8584a'],desc:'Armoured shell. Scuttles onto land as easily as the sea floor.'},
  turtle:{name:'Turtle Knight',pl:'Turtle Knights',hp:42,atk:10,def:11,min:5,max:8,spd:5,charge:true,cost:450,growth:3,g:['turtle','#4a8a5a'],desc:'A knight on a great sea turtle. Charge: +6% damage per hex moved.'},
  colossus:{name:'Coral Colossus',pl:'Coral Colossi',hp:110,atk:15,def:15,min:12,max:19,spd:5,retal:2,cost:1150,amber:1,growth:1,g:['colossus','#e07a6a'],desc:'A walking reef. Strikes back twice each round.'},
  // neutrals
  wight:{name:'Bog Wight',pl:'Bog Wights',hp:8,atk:4,def:3,min:1,max:3,spd:5,col:'#6c8f86',undead:true,desc:'Drifting marsh dead.'},
  wolf:{name:'Ash Wolf',pl:'Ash Wolves',hp:14,atk:7,def:4,min:2,max:5,spd:8,col:'#857a70',desc:'Fast pack hunters.'},
  imp:{name:'Cinder Imp',pl:'Cinder Imps',hp:13,atk:7,def:4,min:2,max:4,spd:6,shots:8,col:'#c0582e',desc:'Throws embers from range.'},
  troll:{name:'Moss Troll',pl:'Moss Trolls',hp:48,atk:11,def:10,min:6,max:12,spd:5,regen:true,col:'#5d7f4c',desc:'Regrows its wounds each turn.'},
  bandit:{name:'Hooded Bandit',pl:'Hooded Bandits',hp:12,atk:6,def:4,min:2,max:4,spd:6,col:'#6a5a4a',g:['fig',{w:'sword',hat:'hood',col:'#4a4038'}],desc:'Roadside cutthroats who prey on lone travellers.'},
  skelguard:{name:'Barrow Guard',pl:'Barrow Guards',hp:10,atk:5,def:6,min:1,max:3,spd:4,undead:true,col:'#d8d0b8',g:['skull','#d8d0b8'],desc:'Undead. Old bones that still keep their post.'},
  wildboar:{name:'Wild Boar',pl:'Wild Boars',hp:22,atk:8,def:6,min:3,max:5,spd:6,charge:true,col:'#6a4a36',g:['boar','#6a4a36'],desc:'Charge: +6% damage per hex moved.'},
  spider:{name:'Giant Spider',pl:'Giant Spiders',hp:30,atk:9,def:7,min:4,max:7,spd:7,shots:6,col:'#4a3a4a',g:['crab','#4a3a4a'],desc:'Spits acid from range.'},
  ogre:{name:'Stone-maul Ogre',pl:'Stone-maul Ogres',hp:70,atk:13,def:11,min:9,max:15,spd:4,col:'#8a7a5a',g:['golem','#8a7a5a'],desc:'Huge and slow, and one swing of its maul flattens a line.'},
  drake:{name:'Glass Drake',pl:'Glass Drakes',hp:300,atk:20,def:18,min:25,max:40,spd:10,fly:true,col:'#8fd0d4',desc:'Flies. Terror of the southern lair.'},
};
for(const f of Object.values(FAC))for(const k of f.units)if(FAC.centaurs.units.includes(k))U[k].beast=true;
const facOfUnit=k=>{const b=k.replace(/_u$/,'');return Object.keys(FAC).find(f=>FAC[f].units.includes(b));};

const SP={
  ember:{name:'Ember Dart',cost:5,target:'enemy',desc:p=>`Deals ${15+10*p} damage to one enemy stack.`},
  chain:{name:'Chain Spark',cost:6,target:'enemy',desc:p=>`Deals ${12+8*p} damage, then half that to the nearest other enemy.`},
  squall:{name:'Squall',cost:6,target:'enemy',desc:p=>`Deals ${8+6*p} damage and gives -3 speed for the battle.`},
  entangle:{name:'Entangle',cost:5,target:'enemy',desc:()=>'Roots an enemy stack: it cannot move this round.'},
  raise:{name:'Raise Bones',cost:8,target:'all',desc:p=>`Raises ${4+3*p} Skeletons beside your army.`},
  geyser:{name:'Geyser',cost:0,target:'enemy',desc:p=>`Once per battle: a geyser erupts beside an enemy, dealing ${10+6*p} to it and its neighbours and blocking that hex.`},
  mend:{name:'Mend',cost:6,target:'ally',desc:p=>`Restores ${20+15*p} health to an allied stack and raises its fallen.`},
  swift:{name:'Swift Wind',cost:4,target:'ally',desc:()=>'Gives an allied stack +3 speed for the battle.'},
  bark:{name:'Bark Skin',cost:5,target:'ally',desc:()=>'Gives an allied stack +5 defense for the battle.'},
  starfall:{name:'Starfall',cost:12,target:'all',desc:p=>`Deals ${10+6*p} damage to every enemy stack.`},
  weaken:{name:'Weaken',cost:5,target:'enemy',desc:p=>`An enemy stack loses ${3+Math.floor(p/3)} attack for the battle.`},
  frost:{name:'Frost Lance',cost:7,target:'enemy',desc:p=>`Deals ${14+9*p} damage and gives -2 speed for the battle.`},
  rally:{name:'Rally',cost:6,target:'ally',desc:p=>`Heals ${10+8*p} and gives +2 morale for the battle.`},
  meteor:{name:'Meteor',cost:14,target:'enemy',desc:p=>`Deals ${25+14*p} damage to one stack and half that to enemies beside it.`},
};
const SK={
  shieldcraft:{name:'Shieldcraft',rank:'A',desc:'Your troops take 5% less damage.'},
  bladework:{name:'Bladework',rank:'S',desc:'Your troops deal 10% more melee damage.'},
  steadyaim:{name:'Steady Aim',rank:'A',desc:'Your troops deal 10% more ranged damage.'},
  forcedmarch:{name:'Forced March',rank:'S',desc:'+10% movement on the map.'},
  arcane:{name:'Arcane Study',rank:'S',desc:'Spells cost 1 less mana (minimum 1).'},
  deepres:{name:'Deep Reserves',rank:'B',desc:'+25% maximum mana.'},
  battleplan:{name:'Battle Planning',rank:'A',desc:'Your army deploys one hex further forward.'},
  farsight:{name:'Far Sight',rank:'C',desc:'+1 vision radius.'},
  seamanship:{name:'Seamanship',rank:'C',desc:'Sailing costs a third less movement.'},
  warding:{name:'Warding',rank:'C',desc:'Enemy spells deal 10% less damage.'},
  meditation:{name:'Meditation',rank:'B',desc:'+2 mana regained each day.'},
  command:{name:'Command Presence',rank:'A',desc:'+1 morale: a chance of extra turns in battle.'},
  fortune:{name:'Fortune’s Favor',rank:'B',desc:'+1 luck: a chance of double damage.'},
  estates:{name:'Estates',rank:'B',desc:'+250 gold a day.'},
  learning:{name:'Learning',rank:'C',desc:'+10% experience from battles.'},
  sorcery:{name:'Sorcery',rank:'A',desc:'Your spells work at +15% Power.'},
};
/* skill levels (v30): Basic, Advanced, Expert. h.skLv[k] holds 2 or 3; a skill without an entry is Basic. Level-ups offer new skills or upgrades. */
const SK_LV=['','Basic','Advanced','Expert'],SK_MAX=6;
const SK_TXT={shieldcraft:l=>`Your troops take ${5*l}% less damage.`,bladework:l=>`Your troops deal ${10*l}% more melee damage.`,steadyaim:l=>`Your troops deal ${10*l}% more ranged damage.`,
  forcedmarch:l=>`+${10*l}% movement on the map.`,arcane:l=>`Spells cost ${l>=3?2:1} less mana (minimum 1).`,deepres:l=>`+${25*l}% maximum mana.`,battleplan:l=>`Your army deploys ${Math.min(2,l)} hex${l>1?'es':''} further forward.`,
  farsight:l=>`+${l} vision radius.`,seamanship:l=>`Sailing costs ${[0,30,40,50][l]}% less movement.`,warding:l=>`Enemy spells deal ${15*l}% less damage.`,meditation:l=>`+${2*l} mana regained each day.`,
  command:l=>`+${l} morale: a chance of extra turns in battle.`,fortune:l=>`+${l} luck: a chance of double damage.`,estates:l=>`+${250*l} gold a day.`,learning:l=>`+${10*l}% experience from battles.`,sorcery:l=>`Your spells work at +${15*l}% Power.`};
const skLevel=(h,k)=>!h||!h.skills.includes(k)?0:((h.skLv||{})[k]||1);
const skL=k=>S&&S.heroes&&S.heroes[S.cur]?skLevel(HERO(),k):0;
/* Skill Icons pack (v36): 64 px icons in ui/skill_icons.png, 6 a row in this order; game skill key → icon name */
const SKI_ORDER=['forced_march','arcane_study','bladework','shieldcraft','steady_aim','command_presence','battle_planning','deep_reserves','meditation','fortunes_favor','field_surgery','stewardship','far_sight','warding','seamanship','silver_tongue','quick_study'];
const SK_ICON={forcedmarch:'forced_march',arcane:'arcane_study',bladework:'bladework',shieldcraft:'shieldcraft',steadyaim:'steady_aim',command:'command_presence',battleplan:'battle_planning',deepres:'deep_reserves',meditation:'meditation',fortune:'fortunes_favor',estates:'stewardship',farsight:'far_sight',warding:'warding',seamanship:'seamanship',learning:'quick_study'};
/* a skill's icon as a sprite span (px = shown size); skills without art yet get an empty span of the same size so rows line up */
const skIco=(k,px=28)=>{const i=SKI_ORDER.indexOf(SK_ICON[k]);if(i<0)return`<span class="skico none" style="width:${px}px;height:${px}px;background-image:url(${ART_BASE}ui/icons/spellbook.png);background-size:contain" aria-hidden="true"></span>`;const z=px/64;
  return`<span class="skico" style="width:${px}px;height:${px}px;background-size:${384*z}px ${192*z}px;background-position:-${(i%6)*64*z}px -${Math.floor(i/6)*64*z}px" aria-hidden="true"></span>`;};
const skName=(h,k)=>`${SK[k].name}${skLevel(h,k)>1?` (${SK_LV[skLevel(h,k)]})`:''}`;
/* heroes: st = [attack, defense, power, lore]; fx = what the signature ability does */
const HEROES=[
  {id:'bear',name:'Bear',fac:'centaurs',type:'Might',st:[2,2,1,1],ab:'Great Bear',ad:'Lions +2 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{lion:2},unitDef:{lion:2}}},
  {id:'perry',name:'Perry',fac:'rangers',type:'Might',st:[2,2,1,1],ab:'Rootkeeper',ad:'Oak Wardens +1 growth per week. Rootbound gives +3 defense instead of +2.',sk:['shieldcraft'],sp:[],fx:{growth:{oak:1},rootbound:3}},
  {id:'dorothy',name:'Dorothy',fac:'rangers',type:'Magic',st:[0,1,2,2],ab:'Green Mender',ad:'Mend heals 50% more.',sk:[],sp:['mend'],fx:{mendPct:1.5}},
  {id:'oliver',name:'Oliver',fac:'rangers',type:'Might',st:[2,1,1,1],ab:'Trailblazer',ad:'Heath and bog cost 30% less movement, and +5% movement.',sk:['forcedmarch'],sp:[],fx:{terrainCut:0.7,mpPct:5}},
  {id:'engelman',name:'Engelman',fac:'wizards',type:'Magic',st:[0,1,3,2],ab:'Arcanist',ad:'Spell Echo also works on the second spell each battle.',sk:['arcane'],sp:['ember'],fx:{echo:2}},
  {id:'tempest',name:'Tempest',fac:'wizards',type:'Magic',st:[0,1,2,3],ab:'Stormborn',ad:'Chain Spark jumps to one extra enemy.',sk:['deepres'],sp:['chain'],fx:{chainExtra:1}},
  {id:'parker',name:'Parker',fac:'necro',type:'Might',st:[2,2,1,1],ab:'Restless Dead',ad:'Zombies and Werewolves +2 speed.',sk:['battleplan'],sp:[],fx:{unitSpd:{zombie:2,werewolf:2}}},
  {id:'shadow',name:'Shadow',fac:'necro',type:'Magic',st:[0,1,2,2],ab:'Gravecaller',ad:'Grave Harvest raises 20% instead of 10%.',sk:[],sp:['raise'],fx:{harvest:0.20}},
  {id:'grimes',name:'Grimes',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Stone Warden',ad:'Gem Golems +3 defense and +1 speed.',sk:['shieldcraft'],sp:[],fx:{unitDef:{golem:3},unitSpd:{golem:1}}},
  {id:'boopis',name:'Boopis',fac:'rangers',type:'Magic',st:[1,1,2,1],ab:'Pounce',ad:'Thornguard +4 growth per week and +1 speed.',sk:['fortune'],sp:['ember'],fx:{growth:{thorn:4},unitSpd:{thorn:1}}},
  {id:'rocky',name:'Rocky',fac:'merfolk',type:'Might',st:[3,1,1,1],ab:'Wave Rider',ad:'Turtle Knights +2 attack and +2 speed.',sk:['forcedmarch'],sp:[],fx:{unitAtk:{turtle:2},unitSpd:{turtle:2}}},
  {id:'monkey',name:'Monkey',fac:'centaurs',type:'Might',st:[2,2,1,1],ab:'Troublemaker',ad:'Your first stack to act each battle gets an extra turn.',sk:['bladework'],sp:[],fx:{extraFirst:true}},
  {id:'binx',name:'Binx',fac:'centaurs',type:'Magic',st:[1,1,2,2],ab:'Night Prowler',ad:'+2 vision, and you see exact enemy army sizes.',sk:['farsight'],sp:['ember'],fx:{vision:2,exact:true}},
  {id:'omalley',name:"O'Malley",fac:'pirates',type:'Might',st:[2,2,1,1],ab:'Scourge of the Coast',ad:'Plunder pays 50% more.',sk:['seamanship'],sp:[],fx:{plunder:1.5}},
  {id:'vargas',name:'Vargas',fac:'pirates',type:'Might',st:[3,1,1,1],ab:'Powder Master',ad:'Cannon Crews and Gunners +25% damage and +2 shots.',sk:['steadyaim'],sp:[],fx:{unitDmgPct:{cannon:1.25,gunner:1.25},unitShots:{cannon:2,gunner:2}}},
  {id:'sheila',name:'Sheila',fac:'pirates',type:'Magic',st:[0,1,2,2],ab:'Weatherwise',ad:'Squall costs half and hits 30% harder.',sk:[],sp:['squall'],fx:{squallHalf:true,squallPct:1.3}},
  {id:'davis',name:'Davis',retired:true,fac:'elves',type:'Might',st:[2,1,1,1],ab:'Master Archer',ad:'Longbow Rangers +1 damage and +4 shots.',sk:['steadyaim'],sp:[],fx:{unitDmgFlat:{longbow:1},unitShots:{longbow:4}}},
  {id:'love',retired:true,name:'Love',fac:'elves',type:'Magic',st:[0,1,2,2],ab:'Heartbloom',ad:'Healing spells also give the target +1 morale for the battle.',sk:[],sp:['mend'],fx:{healMorale:1}},
  {id:'ivan',name:'Ivan',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Master Smith',ad:'The Great Forge costs half the ore, and forged troops get +1 more attack.',sk:['shieldcraft'],sp:[],fx:{forgeCut:0.5,forgePlus:1}},
  {id:'rago',name:'Rago',fac:'necro',type:'Magic',st:[1,1,2,2],ab:'Hex Mistress',ad:'Vampires +2 attack and +2 speed.',sk:['battleplan'],sp:['ember'],fx:{unitAtk:{vampire:2},unitSpd:{vampire:2}}},
  {id:'dupengeiser',name:'Dupengeiser',fac:'dwarves',type:'Magic',st:[1,1,2,2],ab:'Steamcaller',ad:'Once per battle, raise a scalding geyser beside an enemy.',sk:['warding'],sp:['geyser'],fx:{}},
  {id:'rimmer',name:'Rimmer',fac:'wizards',type:'Magic',st:[1,1,2,2],ab:'Storm Keeper',ad:'Storm Elementals +2 attack and +1 speed.',sk:['meditation'],sp:['ember'],fx:{unitAtk:{stormel:2},unitSpd:{stormel:1}}},
  {id:'sookie',name:'Sookie',fac:'wizards',type:'Magic',st:[0,1,2,3],ab:'Owl Mother',ad:'Owl Familiars +4 growth per week and +1 speed.',sk:['meditation'],sp:['ember'],fx:{growth:{owl:4},unitSpd:{owl:1}}},
  {id:'schmickle',rogue:true,name:'Schmickle',fac:'centaurs',type:'Might',st:[2,2,1,1],ab:'Light Fingers',ad:'Brings in +200 gold every day.',sk:['shieldcraft'],sp:[],fx:{goldDay:200}},
  {id:'elvis',name:'Eelvis',fac:'merfolk',type:'Magic',st:[1,1,2,2],ab:'Siren Voice',ad:'Siren charms last 1 turn longer, and your whole army has +1 morale.',sk:['command'],sp:['ember'],fx:{charmExtra:1,morale:1}},
];
/* rogues: wanderers of no banner, found only in taverns and freed from prisons on the map */
HEROES.push(
  {id:'boone',name:'Boone',rogue:true,fac:'elves',type:'Might',st:[2,1,1,1],ab:'Quickdraw',ad:'Your shooters deal 15% more damage.',sk:['steadyaim'],sp:[],fx:{rangedPct:0.15}},
  {id:'holmes',name:'Holmes',rogue:true,fac:'necro',type:'Magic',st:[0,1,2,2],ab:'Sharp Eyes',ad:'+2 vision, and you see exact enemy army sizes.',sk:['farsight'],sp:['ember'],fx:{vision:2,exact:true}},
  {id:'tinker',name:'Tinker',rogue:true,fac:'dwarves',type:'Might',st:[2,1,1,2],ab:'Wayfinder',ad:'+15% movement every day.',sk:['forcedmarch'],sp:[],fx:{mpPct:15}},
);
/* placeholder heroes fill every faction to four; rename them and give them art later */
HEROES.push(
  {id:'necro4',name:'William IV',fac:'necro',type:'Might',st:[2,2,1,1],ab:'Bone Collector',ad:'Skeletons +3 growth per week.',sk:[],sp:[],fx:{growth:{skeleton:3}}},
  {id:'mer2',name:'Griffiths',fac:'merfolk',type:'Might',st:[2,2,1,1],ab:'Crab Warden',ad:'Giant Crabs +3 defense and +1 speed.',sk:[],sp:[],fx:{unitDef:{crab:3},unitSpd:{crab:1}}},
);
HEROES.push(
  {id:'battaglia',name:'Battaglia',fac:'rangers',type:'Might',st:[2,2,1,1],ab:'Champion of the Vale',ad:'Antler Knights +2 attack and +2 defense.',sk:[],sp:[],fx:{unitAtk:{antler:2},unitDef:{antler:2}}},
  {id:'lawrence',name:'Lawrence',fac:'pirates',type:'Magic',st:[0,1,2,2],ab:"Ship's Surgeon",ad:'Mend heals 40% more, and Deckhands +2 growth per week.',sk:[],sp:['mend'],fx:{mendPct:1.4,growth:{deckhand:2}}},
  {id:'michael',name:'Michael',fac:'elves',type:'Might',st:[2,2,1,1],ab:'Glade Guard',ad:'Grove Wardens +2 attack and +2 defense.',sk:[],sp:[],fx:{unitAtk:{dryad:2},unitDef:{dryad:2}}},
  {id:'livingston',name:'Livingston',fac:'elves',type:'Magic',st:[0,1,2,2],ab:'Rootweaver',ad:'Entangle lasts 1 round longer. With her partner Livingston in your party, your whole army +1 morale.',sk:[],sp:['entangle'],fx:{entangleExtra:1,partner:'livingston_cyborg',partnerMorale:1}},
  {id:'slack',name:'Slack',fac:'dwarves',type:'Might',st:[2,1,2,1],ab:'Hammer and Hex',ad:'Young Dwarves +2 attack, and Ember Dart deals 50% more. Starts with a spellbook.',sk:[],sp:['ember'],fx:{unitAtk:{delver:2},emberPct:1.5}},
  /* v39: each banner shows six heroes (pickers, rivals' first heroes); one more per banner has tav:true and is only met in the tavern ("on the road"). Rogues have no banner. */
  {id:'alderhide',name:'Alderhide',fac:'elves',type:'Might',st:[2,2,1,1],ab:'Moose Guardian',ad:'Elven Riders +1 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{rider:1},unitDef:{rider:2}}},
  {id:'briar',rogue:true,name:'Rusty',fac:'centaurs',type:'Might',st:[2,1,1,1],ab:'Fox Scout',ad:'+2 vision and +10% movement.',sk:['farsight'],sp:[],fx:{vision:2,mpPct:10}},
  {id:'mossback',name:'Mossback',fac:'elves',type:'Magic',st:[0,2,2,2],ab:'Tortoise Herbalist',ad:'Your whole army +1 defense.',sk:['meditation'],sp:['mend'],fx:{armyDef:1}},
  {id:'ilyra',retired:true,name:'Ilyra',fac:'elves',type:'Magic',st:[0,1,2,2],ab:'Moon Sentinel',ad:'Sprites +3 growth per week and +1 speed.',sk:['arcane'],sp:['entangle'],fx:{growth:{sprite:3},unitSpd:{sprite:1}}},
  {id:'tavian',retired:true,name:'Tavian',fac:'elves',type:'Might',st:[2,1,1,1],ab:'Veteran Duelist',ad:'Elven Riders +2 attack and +1 speed.',sk:['bladework'],sp:[],fx:{unitAtk:{rider:2},unitSpd:{rider:1}}},
  {id:'yselle',tav:true,name:'Fern',fac:'elves',type:'Magic',st:[0,1,2,2],ab:'Grove Elder',ad:'Grove Wardens +2 growth per week and +2 defense.',sk:['meditation'],sp:['mend'],fx:{growth:{dryad:2},unitDef:{dryad:2}}},
  {id:'veyra',name:'Willa',fac:'necro',type:'Magic',st:[0,1,2,2],ab:'Spirit Medium',ad:'Grave Harvest raises 15%, and Skeletons +1 defense.',sk:['sorcery'],sp:['raise'],fx:{harvest:0.15,unitDef:{skeleton:1}}},
  {id:'graven',name:'Lore',fac:'necro',type:'Might',st:[2,2,1,1],ab:'Haunted Knight',ad:'Werewolves +2 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{werewolf:2},unitDef:{werewolf:2}}},
  {id:'ossin',name:'Dusty',fac:'necro',type:'Magic',st:[0,1,2,2],ab:'Tomb Vizier',ad:'Zombies +3 growth per week and +2 defense.',sk:['deepres'],sp:['weaken'],fx:{growth:{zombie:3},unitDef:{zombie:2}}},
  {id:'spindle',tav:true,name:'Spindle',fac:'merfolk',type:'Might',st:[2,1,1,1],ab:'Seahorse Courier',ad:'+15% movement, and Spearfolk +1 speed.',sk:['forcedmarch'],sp:[],fx:{mpPct:15,unitSpd:{spear:1}}},
  {id:'skimmer',name:'Skimmer',fac:'merfolk',type:'Might',st:[2,1,1,1],ab:'Manta Tide Pilot',ad:'Spearfolk +2 attack and +1 speed.',sk:['seamanship'],sp:[],fx:{unitAtk:{spear:2},unitSpd:{spear:1}}},
  {id:'atoll',name:'Coral',fac:'merfolk',type:'Magic',st:[0,2,2,2],ab:'Coral Oracle',ad:'Coral Colossi +1 growth per week and +3 defense.',sk:['sorcery'],sp:['squall'],fx:{growth:{colossus:1},unitDef:{colossus:3}}},
  {id:'brynja',retired:true,name:'Brynja',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Forge Captain',ad:'Dwarf Paladins +2 attack and +2 defense.',sk:['bladework'],sp:[],fx:{unitAtk:{paladin:2},unitDef:{paladin:2}}},
  {id:'tansy',tav:true,name:'Penny',fac:'dwarves',type:'Magic',st:[1,1,2,1],ab:'Clockmaker',ad:'Dwarf Crossbowmen +3 shots and +1 damage.',sk:['steadyaim'],sp:['ember'],fx:{unitShots:{bolt:3},unitDmgFlat:{bolt:1}}},
  {id:'kiln',name:'Kiln',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Forge Golem',ad:'Gem Golems +2 attack and +1 speed.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{golem:2},unitSpd:{golem:1}}},
  {id:'purl',retired:true,name:'Purl',fac:'wizards',type:'Magic',st:[0,1,2,2],ab:'Yarn Mage',ad:'Apprentice Mages +3 growth per week and +1 damage.',sk:['arcane'],sp:['ember'],fx:{growth:{apprentice:3},unitDmgFlat:{apprentice:1}}},
  {id:'quillby',retired:true,name:'Quillby',fac:'wizards',type:'Magic',st:[1,1,2,1],ab:'Magpie Collector',ad:'Collects shiny things: +200 gold every day.',sk:['learning'],sp:['ember'],fx:{goldDay:200}},
  {id:'folio',retired:true,name:'Folio',fac:'wizards',type:'Magic',st:[0,1,3,2],ab:'Living Spellbook',ad:'Ember Dart deals 50% more.',sk:['sorcery'],sp:['ember','swift'],fx:{emberPct:1.5}},
  {id:'cresset',tav:true,name:'Wick',fac:'rangers',type:'Might',st:[2,1,1,2],ab:'Lantern Wayfinder',ad:'Heath and bog cost 20% less movement, and +1 vision.',sk:['farsight'],sp:[],fx:{terrainCut:0.8,vision:1}},
  {id:'inkwake',name:'Inkwake',fac:'pirates',type:'Might',st:[2,2,1,1],ab:'Octopus Captain',ad:'Deckhands +2 attack and +2 defense.',sk:['command'],sp:[],fx:{unitAtk:{deckhand:2},unitDef:{deckhand:2}}},
  {id:'saltjaw',retired:true,name:'Saltjaw',fac:'pirates',type:'Might',st:[2,1,1,1],ab:'Drowned Captain',ad:'Duelists +2 attack and +1 speed.',sk:['bladework'],sp:[],fx:{unitAtk:{duelist:2},unitSpd:{duelist:1}}},
  {id:'pip_quickline',name:'Pip Quickline',fac:'pirates',type:'Might',st:[1,1,1,2],ab:'Capuchin Lookout',ad:'+2 vision, and Powder Monkeys +3 growth per week.',sk:['farsight'],sp:[],fx:{vision:2,growth:{powder:3}}},
  {id:'zahara',name:'Zarra',fac:'centaurs',type:'Might',st:[2,1,1,1],ab:'Cheetah Outrider',ad:'Centaurs +1 attack and +2 speed.',sk:['forcedmarch'],sp:[],fx:{unitAtk:{centaur:1},unitSpd:{centaur:2}}},
  {id:'tembor',name:'India',fac:'centaurs',type:'Might',st:[2,2,1,1],ab:'Elephant Marshal',ad:'Your whole army +1 morale, and Boars +2 defense.',sk:['command'],sp:[],fx:{morale:1,unitDef:{boar:2}}},
  {id:'virel',name:'Plume',fac:'centaurs',type:'Magic',st:[0,1,2,2],ab:'Peacock Herald',ad:'Your whole army +1 luck and +1 morale.',sk:['fortune'],sp:['rally'],fx:{luck:1,morale:1}},
  /* v40: 16 more heroes: Rangers Nessa Holt and Reedcall join the Rangers' six; the rest are extra tavern heroes for their banners */
  {id:'nessa_holt',retired:true,name:'Nessa Holt',fac:'rangers',type:'Might',st:[2,1,1,2],ab:'Trail Surveyor',ad:'+10% movement, and Thornguard +2 defense.',sk:['forcedmarch'],sp:[],fx:{mpPct:10,unitDef:{thorn:2}}},
  {id:'reedcall',name:'Crestwind',fac:'rangers',type:'Might',st:[2,1,1,1],ab:'Resonant Call',ad:'Reedbows +2 shots and +1 damage.',sk:['steadyaim'],sp:[],fx:{unitShots:{reed:2},unitDmgFlat:{reed:1}}},
  {id:'sera_venn',name:'Sera Venn',fac:'wizards',type:'Magic',st:[0,1,2,2],ab:'Bell Mage',ad:'Your whole army +1 morale.',sk:['sorcery'],sp:['rally'],fx:{morale:1}},
  {id:'gliss',name:'Gliss',fac:'wizards',type:'Magic',st:[0,1,3,2],ab:'Stained-Glass Caster',ad:'Every spell costs 1 less mana.',sk:['arcane'],sp:['chain'],fx:{manaCut:1}},
  {id:'murmur',tav:true,name:'Hush',fac:'necro',type:'Magic',st:[0,1,2,2],ab:'Veiled Shadow',ad:'Weaken drains 50% more attack, and +1 vision.',sk:['farsight'],sp:['weaken'],fx:{weakenPct:1.5,vision:1}},
  {id:'rattleclaw',name:'Rattleclaw',fac:'necro',type:'Might',st:[2,1,1,1],ab:'Fossil Raptor',ad:'Skeletons +2 attack and +1 speed.',sk:['bladework'],sp:[],fx:{unitAtk:{skeleton:2},unitSpd:{skeleton:1}}},
  {id:'silka',name:'Violet',fac:'centaurs',type:'Magic',st:[0,1,2,2],ab:'Silk Keeper',ad:'Entangle costs half and lasts 1 round longer.',sk:['meditation'],sp:['entangle'],fx:{halfCost:'entangle',entangleExtra:1}},
  {id:'flintback',name:'Flintback',fac:'centaurs',type:'Might',st:[1,3,1,1],ab:'Ankylosaur Shieldbearer',ad:'Hounds +1 attack and +3 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{hounds:1},unitDef:{hounds:3}}},
  {id:'bess_bell',name:'Bonnie',fac:'pirates',type:'Might',st:[1,2,1,2],ab:'Salvage Diver',ad:'+150 gold every day, and +10% movement.',sk:['seamanship'],sp:[],fx:{goldDay:150,mpPct:10}},
  {id:'rusk_hookhorn',rogue:true,name:'Rusk Hookhorn',fac:'pirates',type:'Might',st:[2,1,1,1],ab:'Carnotaur First Mate',ad:'Gunners +2 attack and +1 speed.',sk:['command'],sp:[],fx:{unitAtk:{gunner:2},unitSpd:{gunner:1}}},
  {id:'aster',retired:true,name:'Aster',fac:'elves',type:'Magic',st:[0,1,2,2],ab:'Dryad Envoy',ad:'Grove Wardens +1 growth per week, and Mend heals 25% more.',sk:['meditation'],sp:['mend'],fx:{growth:{dryad:1},mendPct:1.25}},
  {id:'thornfrill',name:'Thornfrill',fac:'rangers',type:'Might',st:[1,3,1,1],ab:'Frill Knight',ad:'Oak Wardens +1 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{oak:1},unitDef:{oak:2}}},
  {id:'harlan_chalk',name:'Harlan Chalk',fac:'dwarves',type:'Might',st:[1,2,1,2],ab:'Mine Rescue Chief',ad:'Young Dwarves +3 growth per week and +2 defense.',sk:['command'],sp:[],fx:{growth:{delver:3},unitDef:{delver:2}}},
  {id:'morel',retired:true,name:'Morel',fac:'dwarves',type:'Magic',st:[0,1,2,2],ab:'Spore Brewer',ad:'Your whole army +1 luck.',sk:['fortune'],sp:['mend'],fx:{luck:1}},
  {id:'iona_shoal',retired:true,name:'Iona Shoal',fac:'merfolk',type:'Magic',st:[0,1,2,2],ab:'Reef Medic',ad:'Mend heals 50% more, and healing also gives +1 morale.',sk:['meditation'],sp:['mend'],fx:{mendPct:1.5,healMorale:1}},
  {id:'nerka',name:'Nerka',fac:'merfolk',type:'Might',st:[2,1,1,1],ab:'Tide Hunter',ad:'Giant Crabs +2 attack and +1 speed.',sk:['bladework'],sp:[],fx:{unitAtk:{crab:2},unitSpd:{crab:1}}},
  /* v43 final roster additions */
  {id:'payton',name:'Peyto',fac:'pirates',type:'Might',st:[2,1,1,2],ab:'Treasure Nose',ad:'Finds coins everywhere: +100 gold a day, and your whole army +1 luck.',sk:['fortune'],sp:[],fx:{goldDay:100,luck:1}},
  {id:'nissa',name:'Nissa',fac:'rangers',type:'Magic',st:[0,1,2,2],ab:'Jerboa Friend',ad:'Moth Seers +2 growth per week and +1 speed.',sk:['farsight'],sp:['mend'],fx:{growth:{moth:2},unitSpd:{moth:1}}},
  {id:'livingston_cyborg',name:'Livingston',fac:'elves',type:'Might',st:[2,1,1,2],ab:'Gadgeteer',ad:'Your shooters deal 10% more damage. With his partner Livingston in your party, your whole army +1 morale.',sk:['steadyaim'],sp:[],fx:{rangedPct:0.10,partner:'livingston',partnerMorale:1}},
  {id:'enzo',name:'Enzo',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Powered Suit',ad:'Ram Riders +2 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{ramrider:2},unitDef:{ramrider:2}}},
  {id:'axel',tav:true,name:'Axel',fac:'merfolk',type:'Magic',st:[0,1,2,2],ab:'Tide Guide',ad:'Sirens +2 growth per week and +1 speed.',sk:['meditation'],sp:['mend'],fx:{growth:{siren:2},unitSpd:{siren:1}}},
  {id:'dot',tav:true,name:'Dot',fac:'rangers',type:'Might',st:[2,1,1,2],ab:'Mantis Courier',ad:'+15% movement, and Thornguard +1 attack.',sk:['forcedmarch'],sp:[],fx:{mpPct:15,unitAtk:{thorn:1}}},
  {id:'gale',tav:true,name:'Gale',fac:'wizards',type:'Magic',st:[0,1,2,2],ab:'Weather Mage',ad:'Earth Elementals +2 defense and +1 speed.',sk:['sorcery'],sp:['squall'],fx:{unitDef:{earthel:2},unitSpd:{earthel:1}}},
  {id:'vera',name:'Vera',fac:'wizards',type:'Might',st:[2,2,1,1],ab:'Rune Shield',ad:'Apprentice Mages +2 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{apprentice:2},unitDef:{apprentice:2}}},
  {id:'remy',name:'Remy',fac:'wizards',type:'Might',st:[3,1,1,1],ab:'Spellblade',ad:'Archmages +2 attack and +1 speed.',sk:['command'],sp:[],fx:{unitAtk:{magus:2},unitSpd:{magus:1}}},
  {id:'ada',tav:true,name:'Ada',fac:'wizards',type:'Might',st:[2,2,1,1],ab:'Owl Knight',ad:'Owl Familiars +2 attack and +2 defense.',sk:['farsight'],sp:[],fx:{unitAtk:{owl:2},unitDef:{owl:2}}},
  {id:'mara',tav:true,name:'Mara',fac:'necro',type:'Might',st:[2,2,1,1],ab:'Gravekeeper',ad:'Zombies +2 attack and +2 defense, and +1 vision.',sk:['farsight'],sp:[],fx:{unitAtk:{zombie:2},unitDef:{zombie:2},vision:1}},
  {id:'ivy',name:'Ivy',fac:'elves',type:'Might',st:[3,1,1,1],ab:'Archer-Captain',ad:'Longbow Rangers +2 attack and +1 speed.',sk:['steadyaim'],sp:[],fx:{unitAtk:{longbow:2},unitSpd:{longbow:1}}},
  {id:'lune',name:'Lune',fac:'elves',type:'Magic',st:[0,1,2,3],ab:'Moon-Singer',ad:'Sprites +2 speed, and your whole army +1 luck.',sk:['meditation'],sp:['mend'],fx:{unitSpd:{sprite:2},luck:1}},
  {id:'hart',tav:true,name:'Hart',fac:'elves',type:'Might',st:[2,2,1,1],ab:'Stag Ranger',ad:'+10% movement, and Giant Eagles +2 attack.',sk:['forcedmarch'],sp:[],fx:{mpPct:10,unitAtk:{eagle:2}}},
  {id:'orla',tav:true,name:'Orla',fac:'dwarves',type:'Magic',st:[0,2,2,2],ab:'Rune Priest',ad:'Gem Golems +2 defense, and Mend heals 50% more.',sk:['meditation'],sp:['mend'],fx:{unitDef:{golem:2},mendPct:1.5}},
  {id:'kit_and_nell',name:'Kit & Nell',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Twin Tinkers',ad:'Dwarf Paladins +2 growth per week and +1 speed.',sk:['fortune'],sp:[],fx:{growth:{paladin:2},unitSpd:{paladin:1}}},
  {id:'cato',tav:true,name:'Cato',fac:'pirates',type:'Magic',st:[0,1,2,3],ab:'Star Navigator',ad:'+15% movement, and Gunners +1 attack.',sk:['seamanship'],sp:['swift'],fx:{mpPct:15,unitAtk:{gunner:1}}},
  {id:'sid_and_tess',tav:true,name:'Sid & Tess',fac:'pirates',type:'Might',st:[2,1,1,2],ab:'Sibling Swabs',ad:'Deckhands +3 growth per week and +1 speed.',sk:['fortune'],sp:[],fx:{growth:{deckhand:3},unitSpd:{deckhand:1}}},
  {id:'wren',tav:true,name:'Wren',fac:'centaurs',type:'Might',st:[2,1,1,2],ab:'Beast Tamer',ad:'Hounds +2 attack and +2 speed.',sk:['command'],sp:[],fx:{unitAtk:{hounds:2},unitSpd:{hounds:2}}},
  {id:'rumble',tav:true,name:'Rumble',fac:'centaurs',type:'Might',st:[3,2,0,1],ab:'Rhino Brawler',ad:'Boars +2 attack and +1 speed.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{boar:2},unitSpd:{boar:1}}},
  {id:'gus_and_glen',tav:true,name:'Gus & Glen',fac:'rangers',type:'Might',st:[1,3,1,1],ab:'Trail Wardens',ad:'Thornguard +2 defense, and +10% movement.',sk:['forcedmarch'],sp:[],fx:{unitDef:{thorn:2},mpPct:10}},
  {id:'midge',tav:true,name:'Midge',fac:'rangers',type:'Magic',st:[0,1,2,3],ab:'Moth Dyer',ad:'Moth Seers +2 attack and +1 speed.',sk:['meditation'],sp:['mend'],fx:{unitAtk:{moth:2},unitSpd:{moth:1}}},
  {id:'mags_and_mae',tav:true,name:'Mags & Mae',fac:'wizards',type:'Magic',st:[0,1,3,2],ab:'Twin Astronomers',ad:'Storm Elementals +2 attack and +1 speed.',sk:['arcane'],sp:['swift'],fx:{unitAtk:{stormel:2},unitSpd:{stormel:1}}},
  {id:'bloop',tav:true,name:'Bloop',fac:'wizards',type:'Magic',st:[0,1,2,3],ab:'Fishbowl Sage',ad:'Owl Familiars +3 growth per week and +1 speed.',sk:['learning'],sp:['ember'],fx:{growth:{owl:3},unitSpd:{owl:1}}},
  {id:'gleam',tav:true,name:'Gleam',fac:'wizards',type:'Magic',st:[0,2,2,2],ab:'Golden Ooze',ad:'+150 gold a day, and Earth Elementals +1 defense.',sk:['estates'],sp:['chain'],fx:{goldDay:150,unitDef:{earthel:1}}},
  {id:'odo_and_otto',tav:true,name:'Odo & Otto',fac:'necro',type:'Might',st:[3,2,0,1],ab:'Two-Headed Undertakers',ad:'Skeletons +2 attack and +2 defense.',sk:['bladework'],sp:[],fx:{unitAtk:{skeleton:2},unitDef:{skeleton:2}}},
  {id:'aster_and_briar',tav:true,name:'Aster & Briar',fac:'elves',type:'Magic',st:[0,2,2,2],ab:'Seed Keepers',ad:'Grove Wardens +3 growth per week and +1 defense.',sk:['meditation'],sp:['mend'],fx:{growth:{dryad:3},unitDef:{dryad:1}}},
  {id:'rue',tav:true,name:'Rue',fac:'elves',type:'Magic',st:[0,1,2,3],ab:'Sunflower Witch',ad:'Mend heals 50% more, and your whole army +1 luck.',sk:['fortune'],sp:['mend'],fx:{mendPct:1.5,luck:1}},
  {id:'ned_and_nat',tav:true,name:'Ned & Nat',fac:'dwarves',type:'Might',st:[2,2,1,1],ab:'Twin Stonecutters',ad:'Dwarf Crossbowmen +2 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{bolt:2},unitDef:{bolt:2}}},
  {id:'spike',tav:true,name:'Spike',fac:'dwarves',type:'Might',st:[2,3,0,1],ab:'Porcupine Armorer',ad:'Your whole army +1 defense, and Dwarf Paladins +1 attack.',sk:['shieldcraft'],sp:[],fx:{armyDef:1,unitAtk:{paladin:1}}},
  {id:'rafe_and_reed',tav:true,name:'Rafe & Reed',fac:'pirates',type:'Might',st:[2,1,1,2],ab:'Salvage Captains',ad:'+150 gold a day, and Duelists +1 attack.',sk:['seamanship'],sp:[],fx:{goldDay:150,unitAtk:{duelist:1}}},
  {id:'bo',tav:true,name:'Bo',fac:'pirates',type:'Might',st:[2,1,1,2],ab:'Fish-Box Courier',ad:'+15% movement, and Powder Monkeys +1 speed.',sk:['forcedmarch'],sp:[],fx:{mpPct:15,unitSpd:{powder:1}}},
  {id:'bess_and_bea',tav:true,name:'Bess & Bea',fac:'centaurs',type:'Might',st:[2,3,0,1],ab:'Caravan Guards',ad:'Centaurs +2 attack and +2 defense.',sk:['shieldcraft'],sp:[],fx:{unitAtk:{centaur:2},unitDef:{centaur:2}}},
  {id:'gilt',tav:true,name:'Gilt',fac:'centaurs',type:'Might',st:[2,1,1,2],ab:'Tunnel Scout',ad:'+2 vision, and War Rabbits +2 attack.',sk:['farsight'],sp:[],fx:{vision:2,unitAtk:{rabbit:2}}},
  {id:'fin_and_flo',name:'Fin & Flo',fac:'merfolk',type:'Magic',st:[0,1,3,2],ab:'Reef Chartmakers',ad:'Giant Crabs +2 attack and +2 defense.',sk:['seamanship'],sp:['squall'],fx:{unitAtk:{crab:2},unitDef:{crab:2}}},
  {id:'eden',name:'Eden',fac:'elves',type:'Magic',st:[0,1,2,2],ab:'Master Archer',ad:'Longbow Rangers +1 damage and +4 shots.',sk:['steadyaim'],sp:[],fx:{unitDmgFlat:{longbow:1},unitShots:{longbow:4}}},
  {id:'letchworth',name:'Letchworth',fac:'merfolk',type:'Magic',st:[0,1,2,2],ab:'Siren Keeper',ad:'Sirens +2 shots and +1 damage.',sk:[],sp:['squall'],fx:{unitShots:{siren:2},unitDmgFlat:{siren:1}}},
);
/* artifacts: names and effects from the design bible's trinket and treasure tiers */
const ITEMS={
  kettle:{name:'Dented Kettle Helm',slot:'Head',tier:'Trinket',fx:{def:1}},
  whetstone:{name:'Whetstone Charm',slot:'Pack',tier:'Trinket',fx:{atk:1}},
  candle:{name:'Candle-Stub Lantern',slot:'Pack',tier:'Trinket',fx:{lore:1}},
  errands:{name:'Copper Ring of Errands',slot:'Ring',tier:'Trinket',fx:{mpPct:5}},
  cloak:{name:"Patched Traveller's Cloak",slot:'Cloak',tier:'Trinket',fx:{vision:1}},
  rabbit:{name:'Lucky Rabbit Bone',slot:'Neck',tier:'Trinket',fx:{luck:1}},
  sash:{name:"Drummer's Sash",slot:'Body',tier:'Trinket',fx:{morale:1}},
  cudgel:{name:'Ironwood Cudgel',slot:'Main hand',tier:'Treasure',fx:{atk:2}},
  buckler:{name:'Boar-Hide Buckler',slot:'Off hand',tier:'Treasure',fx:{def:2}},
  inkwell:{name:'Inkwell of Endless Notes',slot:'Pack',tier:'Treasure',fx:{lore:2}},
  spark:{name:'Spark-in-a-Jar',slot:'Pack',tier:'Treasure',fx:{pow:2}},
  mudboots:{name:'Mudstrider Boots',slot:'Feet',tier:'Treasure',fx:{bogFree:1}},
  breath:{name:'Ring of Quiet Breath',slot:'Ring',tier:'Treasure',fx:{manaRegen:2}},
  ledger:{name:"Quartermaster's Ledger",slot:'Pack',tier:'Treasure',fx:{goldDay:250}},
  bracer:{name:"Fletcher's Bracer",slot:'Off hand',tier:'Treasure',fx:{shots:2}},
  purse:{name:'Coin-Purse of the Tollkeeper',slot:'Neck',tier:'Treasure',fx:{costCut:10}},
};
/* artifacts come in five levels; levels 3-5 are found on the map, guarded */
/* Pack 12 artifact icons (48 px) for each item */
const ITEM_ICON={kettle:'iron_helm',whetstone:'ember_axe',candle:'wayfarer_lantern',errands:'ember_ring',cloak:'moss_hood',rabbit:'oak_torc',sash:'ranger_vest',cudgel:'forge_hammer',
  buckler:'warden_shield',inkwell:'sealed_grimoire',spark:'storm_ring',mudboots:'trail_boots',breath:'moon_ring',ledger:'sands_hourglass',bracer:'silk_gloves',purse:'sun_amulet',
  antler:'vale_crown',barkmail:'sentinel_plate',stormrod:'star_staff',spurs:'wind_sandals',banner:'tide_spear',twinmoon:'moon_ring',mirror:'azure_robe',sapling:'moss_ring',
  bell:'pearl_pendant',gauntlets:'forge_gauntlets',crownglass:'moon_circlet',aegis:'warden_shield',oath:'vale_blade',livingmap:'mariner_compass',mantle:'raven_cloak'};
const itemIcon=k=>`<img class="iic" src="${ART_BASE}artifacts/${ITEM_ICON[k]||'sun_amulet'}.png" alt="">`;
const ITEM_TIERS=['','Trinket','Treasure','Heirloom','Masterwork','Legendary'],ITEM_COLS=['','#b9b3a4','#8cbc70','#6f9be0','#b07ae0','#f2c14e'];
for(const it of Object.values(ITEMS))it.lvl=it.tier==='Trinket'?1:2;
Object.assign(ITEMS,{
  antler:{name:'Antler Crown of the Hunt',slot:'Head',lvl:3,fx:{atk:3,mpPct:5}},
  barkmail:{name:"Warden's Bark Mail",slot:'Body',lvl:3,fx:{def:4}},
  stormrod:{name:'Stormglass Rod',slot:'Main hand',lvl:3,fx:{pow:4}},
  spurs:{name:'Seven-League Spurs',slot:'Feet',lvl:3,fx:{mpPct:20}},
  banner:{name:'Banner of the First Muster',slot:'Pack',lvl:3,fx:{morale:2}},
  twinmoon:{name:'Twin-Moon Ring',slot:'Ring',lvl:3,fx:{pow:2,lore:2}},
  mirror:{name:'Mirror-Silk Cloak',slot:'Cloak',lvl:4,fx:{def:3,luck:1}},
  sapling:{name:'Sapling in Amber',slot:'Pack',lvl:4,fx:{lore:2,manaRegen:3}},
  bell:{name:'Bell of the Drowned Chapel',slot:'Neck',lvl:4,fx:{def:2,morale:2}},
  gauntlets:{name:'Ironbark Gauntlets',slot:'Main hand',lvl:4,fx:{atk:4,def:1}},
  crownglass:{name:'Crown of the Glass Lair',slot:'Head',lvl:5,fx:{pow:6}},
  aegis:{name:'Heartwood Aegis',slot:'Off hand',lvl:5,fx:{def:6}},
  oath:{name:'Blade of the Last Oath',slot:'Main hand',lvl:5,fx:{atk:6}},
  livingmap:{name:"Cartographer's Living Map",slot:'Pack',lvl:5,fx:{vision:4,mpPct:10}},
  mantle:{name:'Mantle of the Undying Season',slot:'Cloak',lvl:5,fx:{atk:2,def:2,pow:2,lore:2}},
});
for(const it of Object.values(ITEMS))it.tier=ITEM_TIERS[it.lvl];
const FX_TXT={atk:v=>`+${v} Attack`,def:v=>`+${v} Defense`,pow:v=>`+${v} Power`,lore:v=>`+${v} Lore`,morale:v=>`+${v} morale`,luck:v=>`+${v} luck`,mpPct:v=>`+${v}% movement`,vision:v=>`+${v} vision`,
  bogFree:()=>'bog and heath cost normal movement',manaRegen:v=>`+${v} mana each day`,goldDay:v=>`+${v} gold each day`,shots:v=>`archers +${v} shots`,costCut:v=>`troops cost ${v}% less`};
const itemTxt=id=>Object.entries(ITEMS[id].fx).map(([k,v])=>FX_TXT[k](v)).join(', ');
/* every hero starts with one specific skill and one artifact */
const START_KIT={bear:['command','sash'],perry:['shieldcraft','buckler'],boone:['steadyaim','bracer'],holmes:['farsight','cloak'],tinker:['forcedmarch','errands'],dorothy:['meditation','breath'],oliver:['forcedmarch','errands'],battaglia:['bladework','cudgel'],
  engelman:['arcane','inkwell'],tempest:['deepres','spark'],grimes:['shieldcraft','candle'],rimmer:['meditation','kettle'],
  shadow:['deepres','spark'],parker:['battleplan','cudgel'],rago:['fortune','rabbit'],necro4:['shieldcraft','kettle'],
  monkey:['bladework','whetstone'],binx:['farsight','cloak'],boopis:['fortune','rabbit'],schmickle:['shieldcraft','mudboots'],
  omalley:['seamanship','ledger'],vargas:['steadyaim','bracer'],sheila:['meditation','breath'],lawrence:['command','sash'],
  davis:['steadyaim','bracer'],love:['deepres','inkwell'],livingston:['farsight','cloak'],michael:['forcedmarch','errands'],
  ivan:['shieldcraft','buckler'],dupengeiser:['warding','spark'],slack:['bladework','whetstone'],eden:['steadyaim','bracer'],sookie:['meditation','candle'],
  elvis:['command','sash'],mer2:['shieldcraft','kettle'],rocky:['forcedmarch','sash'],letchworth:['meditation','breath']};
HEROES.forEach(h=>{const k=START_KIT[h.id];if(k){h.sk=[k[0]];h.item=k[1];}});
/* v41: every hero starts with an artifact (the newer heroes had none) */
const START_ITEM={'gus_and_glen':'errands','midge':'inkwell','mags_and_mae':'spark','bloop':'inkwell','gleam':'purse','odo_and_otto':'buckler','aster_and_briar':'breath','rue':'cloak','ned_and_nat':'bracer','spike':'buckler','rafe_and_reed':'purse','bo':'errands','bess_and_bea':'buckler','gilt':'rabbit','fin_and_flo':'breath','vera':'buckler','remy':'spark','ada':'cloak','mara':'candle','ivy':'bracer','lune':'inkwell','hart':'errands','orla':'breath','kit_and_nell':'purse','cato':'inkwell','sid_and_tess':'rabbit','wren':'errands','rumble':'buckler','payton':'rabbit','nissa':'cloak','livingston_cyborg':'bracer','enzo':'buckler','axel':'breath','dot':'errands','gale':'spark','zahara': 'errands', 'tembor': 'buckler', 'cresset': 'candle', 'nessa_holt': 'errands', 'reedcall': 'bracer', 'purl': 'inkwell', 'quillby': 'purse', 'sera_venn': 'breath', 'gliss': 'spark', 'veyra': 'spark', 'graven': 'buckler', 'ossin': 'inkwell', 'murmur': 'cloak', 'rattleclaw': 'whetstone', 'silka': 'candle', 'flintback': 'kettle', 'inkwake': 'cudgel', 'saltjaw': 'whetstone', 'pip_quickline': 'cloak', 'bess_bell': 'errands', 'rusk_hookhorn': 'cudgel', 'ilyra': 'breath', 'tavian': 'whetstone', 'yselle': 'inkwell', 'aster': 'candle', 'thornfrill': 'buckler', 'brynja': 'cudgel', 'tansy': 'bracer', 'kiln': 'kettle', 'harlan_chalk': 'buckler', 'morel': 'rabbit', 'spindle': 'errands', 'skimmer': 'whetstone', 'atoll': 'spark', 'iona_shoal': 'breath', 'nerka': 'cudgel', 'alderhide': 'buckler', 'briar': 'cloak', 'mossback': 'breath', 'virel': 'rabbit'};
HEROES.forEach(h=>{if(!h.item&&START_ITEM[h.id])h.item=START_ITEM[h.id];});
/* starting stats: one higher across the board, more on each hero's main stat, and a personal extra point */
for(const h of HEROES){if(h._st)continue;h._st=1;const r=hash(h.id);h.st=h.st.map(v=>v+1);const main=h.type==='Might'?(h.st[0]>=h.st[1]?0:1):(h.st[2]>=h.st[3]?2:3);h.st[main]+=1+(r%2);h.st[(r>>>3)%4]+=1;}
/* one-line versions of each ability for the hero cards; the full text is under Details */
const AB_SHORT={bear:'Lions +2 attack and defense',perry:'Oak Wardens grow faster',boone:'First stack acts twice',holmes:'Sees farther and exactly',tinker:'+15% movement',dorothy:'Mend heals 50% more',oliver:'Rough ground costs less',engelman:'Echoes a second spell',tempest:'Chain Spark hits one more',
  parker:'Zombies, Werewolves +2 speed',shadow:'Raises 20% of the fallen',grimes:'Gem Golems +3 defense, faster',boopis:'War Rabbits grow faster',rocky:'Turtles +2 attack, +2 speed',
  monkey:'First stack acts twice',binx:'Sees farther and exactly',omalley:'Plunder pays 50% more',vargas:'Gunners hit harder, shoot more',sheila:'Squall cheaper and stronger',
  davis:'Longbows +1 damage, +4 shots',love:'Healing lifts morale',ivan:'Better, cheaper Great Forge',rago:'Vampires +2 attack and speed',dupengeiser:'Raises a scalding geyser',
  rimmer:'Storm Elementals +2 attack',schmickle:'+200 gold a day',elvis:'Longer charms, +1 morale',necro4:'Skeletons grow faster',mer2:'Giant Crabs +3 defense, faster',
  battaglia:'Antler Knights +2 / +2',lawrence:'Better Mend, more Deckhands',michael:'Grove Wardens +2 / +2',livingston:'Entangle lasts longer',slack:'Young Dwarves +2 attack',
  eden:'Longbows +1 damage, +4 shots',sookie:'Owl Familiars grow faster',letchworth:'Sirens +2 shots, +1 damage'};
const HBY=Object.fromEntries(HEROES.map(h=>[h.id,h]));
/* retired heroes stay in HBY so old saves load, but are no longer offered */
for(let i=HEROES.length-1;i>=0;i--)if(HEROES[i].retired)HEROES.splice(i,1);

const RELIC_LIST=[
  {name:'Shard of Dawn',col:'#f2d382',lair:'Wolf Den',k:'wolf',n:[14,18],carry:{morale:1},carryTxt:'+1 morale for your troops',deliver:'+1 vision for all your heroes'},
  {name:'Shard of Roots',col:'#7fbf5a',lair:'Bramble Hollow',k:'troll',n:[4,6],carry:{def:2},carryTxt:'+2 Defense',deliver:'+2 weekly recruits for your tier 1 dwelling'},
  {name:'Shard of Tides',col:'#4fb8d0',lair:'Drowned Chapel',k:'wight',n:[40,50],carry:{sea:1},carryTxt:'Sailing and swimming cost a third less',deliver:'Docks hand out boats for free'},
  {name:'Shard of Embers',col:'#f08a2e',lair:'Cinder Pit',k:'imp',n:[30,38],carry:{pow:3},carryTxt:'+3 Power',deliver:'All spells cost 1 less mana'},
  {name:'Shard of Iron',col:'#a0a6b4',lair:'Ogre Quarry',k:'ogre',n:[6,8],carry:{atk:3},carryTxt:'+3 Attack',deliver:'Every mine you hold produces more (+1, or +250 gold)'},
  {name:'Shard of Stars',col:'#a585e8',lair:'Moon Observatory',k:'drake',n:[1,1],carry:{lore:3,luck:1},carryTxt:'+3 Lore and +1 luck',deliver:'Every hero of yours learns Starfall'},
  {name:'Heart of the Crown',col:'#e25a72',lair:'Glass Lair',k:'drake',n:[3,3],carry:{atk:2,def:2,pow:2,lore:2},carryTxt:'+2 to all four stats',deliver:'With the other six, the crown is whole and you win'},
];
/* Grail Quest: five grails, each carried by a Grail Keeper that roams the land */
const GRAILS=[
  {name:'Dawn Grail',col:'#f2d382',lair:'Dawn Keeper',k:'wolf',n:[16,20],carry:{morale:1},carryTxt:'+1 morale for your troops',deliver:'+1 vision for all your heroes'},
  {name:'Thorn Grail',col:'#7fbf5a',lair:'Thorn Keeper',k:'troll',n:[5,7],carry:{def:2},carryTxt:'+2 Defense',deliver:'+2 weekly recruits for your tier 1 dwelling'},
  {name:'Tide Grail',col:'#4fb8d0',lair:'Tide Keeper',k:'wight',n:[40,50],carry:{sea:1},carryTxt:'Sailing and swimming cost a third less',deliver:'Docks hand out boats for free'},
  {name:'Ember Grail',col:'#f08a2e',lair:'Ember Keeper',k:'imp',n:[30,38],carry:{pow:3},carryTxt:'+3 Power',deliver:'All spells cost 1 less mana'},
  {name:'Iron Grail',col:'#a0a6b4',lair:'Iron Keeper',k:'drake',n:[2,2],carry:{atk:3},carryTxt:'+3 Attack',deliver:'Every mine you hold produces more (+1, or +250 gold)'},
];
let RELICS=RELIC_LIST;
const MODES={
  relic:{n:1,name:'Relic Hunt',desc:'Recover the Seven Relics from guarded lairs and bring them home to your Relic Hall before time runs out.'},
  conquest:{n:2,name:'Conquest',desc:'Defeat every rival hero. Relics still give bonuses, but only the last banner standing wins.'},
  grail:{n:3,name:'Grail Quest',desc:'The Oracle names three of the five Grails. Each is carried by a Grail Keeper that roams the land. Hunt down the ones you need and bring them to your Grail Altar.'},
  multi:{n:4,name:'Multiplayer',desc:'Two to four players take turns on one device, each with a banner, town and heroes. First to bring the Seven Relics home wins.'}};
const ALTAR_NAMES={1:'Lesser Spell Altar',2:'Greater Spell Altar',3:'Star Altar'},ALTAR_COL={1:'#7fb4ff',2:'#c46bff',3:'#ffd24a'};
const MODE_SHORT={relic:'Find the 7 relics',conquest:'Be the last hero standing',grail:'Hunt the Grail Keepers the Oracle names.',multi:'Take turns on one device'};
const DIFF_ICON={easy:'☘',normal:'⚔',hard:'☠',expert:'♛'};
const STAT_TIP={atk:'Attack: every troop in the army hits harder',def:'Defense: every troop in the army takes less damage',pow:'Power: spells hit harder and last longer',lore:'Lore: more mana, so more spells'};
/* plain-words summary of each banner's special power */
/* banner cards: two strengths and one weakness */
const FAC_SW={rangers:[['Tough','Big tier 5'],'Slow'],wizards:[['Strong spells','Shooters'],'Fragile'],necro:[['Grows each win','Fearless'],'Weak start'],
  centaurs:[['Fastest','Pack hitters'],'Light armour'],pirates:[['Gold rich','Big guns'],'Weak up close'],elves:[['Best archers','Fliers'],'Fragile'],
  dwarves:[['Toughest','Strong forge'],'Slow'],merfolk:[['Fast in water','Charmers'],'Slow on land']};
const FAC_BLURB={rangers:'Troops that hold still get +2 defense.',wizards:"Your hero's first spell each battle casts twice.",necro:'After each win, some fallen foes rise to join you.',
  centaurs:'Stacks side by side get faster and hit harder.',pirates:'Every win pays gold. Starts with a boat.',elves:'Archers that stayed put shoot twice.',dwarves:'The Great Forge makes every dwarf tougher.',merfolk:'Lagoon home. Every third battle round: +2 speed and attack.'};
function setMode(m){RELICS=m==='grail'?GRAILS:RELIC_LIST;for(const k in iconCache)if(k.startsWith('relic:'))delete iconCache[k];}
const altarName=()=>S&&S.mode==='grail'?'Grail Altar':'Relic Hall';
function goalMet(){if(S.mode==='conquest')return S.rivals.length===0;return(S.goal||[0,1,2,3,4,5,6]).every(i=>delivered(i));}
const UP_PREFIX={rangers:'Elder',wizards:'Arch',necro:'Dread',centaurs:'Wild',pirates:'Veteran',elves:'Moonlit',dwarves:'Runed',merfolk:'Deep'};
for(const fk of Object.keys(FAC))for(const k of FAC[fk].units){const b=U[k];U[k+'_u']={...b,name:`${UP_PREFIX[fk]} ${b.name}`,pl:`${UP_PREFIX[fk]} ${b.pl}`,hp:Math.round(b.hp*1.25),atk:b.atk+2,def:b.def+2,min:Math.round(b.min*1.2),max:Math.round(b.max*1.25),spd:b.spd+1,shots:b.shots?b.shots+4:0,cost:Math.round(b.cost*1.35/5)*5,up:true,base:k,desc:b.desc+' Upgraded: tougher, faster and harder-hitting.'};}
/* a few upgrades get their own name instead of the banner prefix */
Object.assign(U.cannon_u,{name:'Great Crossbow',pl:'Great Crossbows',g:['cannon','#7a5a32'],desc:'A huge crossbow that hurls spears across the field. Devastating at range. Very slow.'});
/* mines come in three levels; pay at the mine to raise its output */
const MINE={saw:{name:'Sawmill',res:'timber',out:[1,2,3]},orepit:{name:'Ore Pit',res:'ore',out:[1,2,3]},gold:{name:'Gold Seam',res:'gold',out:[500,750,1000]},amber:{name:'Amber Spring',res:'amber',out:[1,2,3]},
  gem:{name:'Gem Grotto',res:'gems',out:[1,1,2]},moon:{name:'Moonwater Spring',res:'moonwater',out:[1,1,2]}};
const MINE_UP=[null,{gold:1500,timber:3,ore:3},{gold:3000,timber:6,ore:6,gems:2}];
const mineOut=o=>MINE[o.k].out[(o.lvl||1)-1]+(delivered(4)?(MINE[o.k].res==='gold'?250:1):0);
/* weekly sites refill every Monday */
const SITES={wish:{name:'Wishing Well',give:'500-1,000 gold'},clover:{name:'Clover Meadow',give:'+1 luck for 7 days'},woodcamp:{name:"Woodcutters' Camp",give:'5 timber'},orecart:{name:'Abandoned Ore Cart',give:'5 ore'},amberhollow:{name:'Amber Hollow',give:'2 amber'}};
const weekNo=()=>Math.floor((S.day-1)/7);
