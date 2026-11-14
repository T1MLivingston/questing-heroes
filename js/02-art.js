'use strict';
/* ================= ART ================= */
function drawRes(c,k,x,y,r){
  c.save();c.translate(x,y);c.scale(r/10,r/10);c.lineWidth=1.2;
  if(k==='gold'){for(let i=0;i<3;i++){c.fillStyle=i===2?'#f4cd62':'#d9a93c';c.strokeStyle='#6d4f12';c.beginPath();c.ellipse(0,5-i*4,8,3.2,0,0,7);c.fill();c.stroke();}}
  else if(k==='timber'){for(const dy of[3,-3]){c.fillStyle='#8b5e34';c.strokeStyle='#3b2410';c.beginPath();c.roundRect(-8,dy-3,16,6,3);c.fill();c.stroke();c.fillStyle='#d6a96c';c.beginPath();c.ellipse(8,dy,2,3,0,0,7);c.fill();c.stroke();}}
  else if(k==='ore'){c.fillStyle='#7c7f86';c.strokeStyle='#2c2e33';c.beginPath();c.moveTo(-8,6);c.lineTo(-6,-3);c.lineTo(0,-7);c.lineTo(7,-2);c.lineTo(8,6);c.closePath();c.fill();c.stroke();c.fillStyle='#a9adb6';c.beginPath();c.moveTo(-6,-3);c.lineTo(0,-7);c.lineTo(1,0);c.closePath();c.fill();}
  else if(k==='gems'){c.fillStyle='#d8354a';c.strokeStyle='#4a0a14';c.beginPath();c.moveTo(-8,-2);c.lineTo(-4,-7);c.lineTo(4,-7);c.lineTo(8,-2);c.lineTo(0,8);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,200,210,.75)';c.beginPath();c.moveTo(-4,-6);c.lineTo(0,-6);c.lineTo(-2,-1);c.closePath();c.fill();}
  else if(k==='moonwater'){c.fillStyle='rgba(220,235,255,.5)';c.strokeStyle='#1d2c4a';c.beginPath();c.moveTo(-2.5,-8);c.lineTo(2.5,-8);c.lineTo(2.5,-3);c.quadraticCurveTo(8,0,7,4);c.quadraticCurveTo(6,8,0,8);c.quadraticCurveTo(-6,8,-7,4);c.quadraticCurveTo(-8,0,-2.5,-3);c.closePath();c.fill();c.stroke();
    c.fillStyle='#7fb2ff';c.beginPath();c.moveTo(-6.5,2);c.quadraticCurveTo(0,0,6.5,2);c.quadraticCurveTo(6,7.5,0,7.5);c.quadraticCurveTo(-6,7.5,-6.5,2);c.fill();c.fillStyle='#e8f2ff';c.fillRect(-3,-10,6,2.5);c.fillStyle='rgba(255,255,255,.8)';c.fillRect(-4,3,2,2);}
  else if(k==='amber'){c.fillStyle='#e0871f';c.strokeStyle='#5a2c05';c.beginPath();for(let i=0;i<6;i++){const a=Math.PI/3*i+Math.PI/6;c.lineTo(Math.cos(a)*8,Math.sin(a)*8);}c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,230,160,.8)';c.beginPath();c.moveTo(-3,-4);c.lineTo(1,-5);c.lineTo(-1,0);c.closePath();c.fill();}
  c.restore();
}
/* stat icons: one shape and colour per stat, used on every screen */
const STATCOL={atk:'#e05a4a',def:'#7d9cd0',pow:'#f08a2e',lore:'#a585e8',morale:'#e8bc3e',luck:'#6cc25a',spd:'#d8d0bc',hp:'#e25a72',dmg:'#e8c890',shots:'#c8b07a',move:'#8cbc70'};
function drawStat(c,k,x,y,r){
  c.save();c.translate(x,y);c.scale(r/10,r/10);c.lineJoin='round';c.lineCap='round';const col=STATCOL[k];c.fillStyle=col;c.strokeStyle='#120f0b';c.lineWidth=1.2;
  switch(k){
  case 'atk':for(const s of[-1,1]){c.save();c.scale(s,1);c.beginPath();c.moveTo(-7,7);c.lineTo(5,-5);c.lineTo(7,-8);c.lineTo(4,-6);c.lineTo(-6,6);c.closePath();c.fill();c.stroke();c.fillStyle='#8a6a3a';c.fillRect(-8,4,5,2);c.restore();c.fillStyle=col;}break;
  case 'def':c.beginPath();c.moveTo(-7,-7);c.lineTo(7,-7);c.lineTo(7,0);c.quadraticCurveTo(6,6,0,9);c.quadraticCurveTo(-6,6,-7,0);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.35)';c.fillRect(-1,-6,2,12);break;
  case 'pow':c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr=i%2?3.6:8.5;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();c.fillStyle='#ffe6a0';c.beginPath();c.arc(0,0,2.2,0,7);c.fill();break;
  case 'lore':c.beginPath();c.moveTo(0,-5);c.quadraticCurveTo(-4,-8,-8,-6);c.lineTo(-8,6);c.quadraticCurveTo(-4,4,0,7);c.quadraticCurveTo(4,4,8,6);c.lineTo(8,-6);c.quadraticCurveTo(4,-8,0,-5);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,-5);c.lineTo(0,7);c.stroke();break;
  case 'morale':c.beginPath();c.moveTo(-6,9);c.lineTo(-6,-9);c.stroke();c.beginPath();c.moveTo(-6,-8);c.lineTo(8,-8);c.lineTo(5,-3);c.lineTo(8,2);c.lineTo(-6,2);c.closePath();c.fill();c.stroke();break;
  case 'luck':for(const [dx,dy] of[[-3.5,-3.5],[3.5,-3.5],[-3.5,3.5],[3.5,3.5]]){c.beginPath();c.arc(dx,dy,4,0,7);c.fill();c.stroke();}c.beginPath();c.moveTo(0,0);c.lineTo(3,9);c.stroke();break;
  case 'spd':c.beginPath();c.moveTo(-6,-8);c.lineTo(0,-8);c.lineTo(0,2);c.lineTo(8,4);c.lineTo(8,8);c.lineTo(-6,8);c.closePath();c.fill();c.stroke();c.strokeStyle=col;c.beginPath();c.moveTo(-9,-3);c.lineTo(-13,-3);c.moveTo(-9,2);c.lineTo(-14,2);c.stroke();break;
  case 'hp':c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-11,0,-7,-10,0,-4);c.bezierCurveTo(7,-10,11,0,0,8);c.fill();c.stroke();break;
  case 'dmg':c.beginPath();for(let i=0;i<8;i++){const a=i*Math.PI/4,rr=i%2?3.5:9;c.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}c.closePath();c.fill();c.stroke();break;
  case 'shots':c.beginPath();c.moveTo(-8,8);c.lineTo(6,-6);c.stroke();c.beginPath();c.moveTo(8,-8);c.lineTo(2,-7);c.lineTo(7,-2);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(-8,8);c.lineTo(-8,3);c.moveTo(-8,8);c.lineTo(-3,8);c.stroke();break;
  case 'move':c.beginPath();c.ellipse(-3,2,4,6,-.3,0,7);c.fill();c.stroke();c.beginPath();c.ellipse(4,-3,3,5,-.3,0,7);c.fill();c.stroke();break;
  }
  c.restore();
}
function drawFig(c,o){
  const col=o.col||'#666',skin=o.skin||'#d0a07a',dark='#15130e';
  c.lineWidth=1.5;c.strokeStyle=dark;
  // body
  c.fillStyle=col;c.beginPath();c.moveTo(-8,16);c.lineTo(-6,-2);c.lineTo(6,-2);c.lineTo(8,16);c.closePath();c.fill();c.stroke();
  // head
  c.fillStyle=skin;c.beginPath();c.arc(0,-8,6,0,7);c.fill();c.stroke();
  // hats
  const h=o.hat;
  if(h==='hood'){c.fillStyle=col;c.beginPath();c.moveTo(-8,-4);c.quadraticCurveTo(-8,-17,0,-17);c.quadraticCurveTo(8,-17,8,-4);c.lineTo(5,-6);c.quadraticCurveTo(0,-14,-5,-6);c.closePath();c.fill();c.stroke();}
  else if(h==='pointed'){c.fillStyle=col;c.beginPath();c.moveTo(-9,-11);c.lineTo(9,-11);c.lineTo(3,-24);c.closePath();c.fill();c.stroke();c.fillStyle='#f2d382';c.beginPath();c.arc(1,-16,1.5,0,7);c.fill();}
  else if(h==='helm'){c.fillStyle='#8a8a92';c.beginPath();c.arc(0,-9,7,Math.PI,0);c.lineTo(7,-6);c.lineTo(-7,-6);c.closePath();c.fill();c.stroke();c.fillStyle=dark;c.fillRect(-5,-8,10,2);}
  else if(h==='band'){c.fillStyle=col;c.fillRect(-6,-13,12,3);c.strokeRect(-6,-13,12,3);}
  else if(h==='tricorn'){c.fillStyle='#22202a';c.beginPath();c.moveTo(-11,-11);c.quadraticCurveTo(0,-20,11,-11);c.quadraticCurveTo(0,-14,-11,-11);c.fill();c.stroke();}
  else if(h==='ears'){c.fillStyle=o.hair||'#e8e0c0';c.beginPath();c.arc(0,-10,6.5,Math.PI,0);c.fill();c.fillStyle=skin;for(const s of[-1,1]){c.beginPath();c.moveTo(6*s,-8);c.lineTo(12*s,-13);c.lineTo(5*s,-5);c.closePath();c.fill();c.stroke();}}
  else if(h==='beard'){c.fillStyle='#b0642a';c.beginPath();c.moveTo(-6,-7);c.quadraticCurveTo(0,8,6,-7);c.closePath();c.fill();c.stroke();c.fillStyle='#8a8a92';c.beginPath();c.arc(0,-10,6.5,Math.PI,0);c.fill();c.stroke();}
  else if(h==='leaf'){c.fillStyle='#5aa040';for(const [x,y] of[[-6,-12],[0,-15],[6,-12]]){c.beginPath();c.ellipse(x,y,3.5,2,x/6,0,7);c.fill();}}
  else if(h==='fin'){c.fillStyle='#f2917a';for(const s of[-1,1]){c.beginPath();c.moveTo(6*s,-8);c.lineTo(13*s,-12);c.lineTo(12*s,-4);c.closePath();c.fill();c.stroke();}}
  else if(h==='cape'){c.fillStyle='#1a0e14';for(const sd of[-1,1]){c.beginPath();c.moveTo(4*sd,-4);c.lineTo(12*sd,-16);c.lineTo(9*sd,-3);c.closePath();c.fill();c.stroke();}c.fillStyle='#2a1a22';c.beginPath();c.arc(0,-11,6.3,Math.PI,0);c.fill();}
  else if(h==='antler'){c.strokeStyle='#e8d9b2';c.lineWidth=1.6;for(const s of[-1,1]){c.beginPath();c.moveTo(3*s,-13);c.lineTo(8*s,-20);c.moveTo(6*s,-17);c.lineTo(11*s,-17);c.stroke();}c.strokeStyle=dark;c.lineWidth=1.5;}
  c.fillStyle=dark;c.beginPath();c.arc(-2,-8,1,0,7);c.arc(2,-8,1,0,7);c.fill();
  // weapons
  const w=o.w;c.lineWidth=2.2;
  if(w==='spear'){c.strokeStyle='#d8cfb4';c.beginPath();c.moveTo(11,16);c.lineTo(11,-18);c.stroke();c.fillStyle='#efe8cf';c.beginPath();c.moveTo(11,-23);c.lineTo(8,-16);c.lineTo(14,-16);c.closePath();c.fill();}
  else if(w==='sword'){c.strokeStyle='#e6e8ee';c.beginPath();c.moveTo(10,8);c.lineTo(16,-12);c.stroke();c.strokeStyle='#8a6a3a';c.beginPath();c.moveTo(7,6);c.lineTo(13,9);c.stroke();}
  else if(w==='bow'){c.strokeStyle='#7a4f22';c.lineWidth=2.4;c.beginPath();c.arc(4,2,13,-1,1);c.stroke();c.strokeStyle='#e6dcc0';c.lineWidth=0.8;c.beginPath();c.moveTo(4+13*Math.cos(-1),2+13*Math.sin(-1));c.lineTo(4+13*Math.cos(1),2+13*Math.sin(1));c.stroke();}
  else if(w==='staff'){c.strokeStyle='#7a5a32';c.beginPath();c.moveTo(11,16);c.lineTo(11,-14);c.stroke();c.fillStyle='#bfe0ff';c.beginPath();c.arc(11,-16,3.5,0,7);c.fill();}
  else if(w==='gun'){c.strokeStyle='#3a3a3e';c.lineWidth=3;c.beginPath();c.moveTo(-4,6);c.lineTo(17,0);c.stroke();c.strokeStyle='#7a5a32';c.beginPath();c.moveTo(-6,7);c.lineTo(2,5);c.stroke();}
  else if(w==='hammer'){c.strokeStyle='#7a5a32';c.beginPath();c.moveTo(9,14);c.lineTo(13,-8);c.stroke();c.fillStyle='#6a6a72';c.fillRect(8,-14,11,7);c.strokeStyle=dark;c.lineWidth=1.2;c.strokeRect(8,-14,11,7);}
  else if(w==='shield'){c.fillStyle='#8a8a92';c.strokeStyle=dark;c.lineWidth=1.5;c.beginPath();c.roundRect(2,-2,14,18,3);c.fill();c.stroke();c.fillStyle=o.col;c.fillRect(7,2,4,10);}
  else if(w==='bomb'){c.fillStyle='#22222a';c.beginPath();c.arc(12,4,5,0,7);c.fill();c.strokeStyle='#e8bc3e';c.lineWidth=1.5;c.beginPath();c.moveTo(14,0);c.lineTo(17,-5);c.stroke();}
  else if(w==='song'){c.strokeStyle='#bfe8ff';c.lineWidth=1.4;for(const r of[5,9,13]){c.beginPath();c.arc(6,-6,r,-0.6,0.6);c.stroke();}}
}
function drawGlyph(c,g){
  const [t,a]=g,dark='#15130e';c.lineWidth=1.5;c.strokeStyle=dark;
  switch(t){
  case 'fig':drawFig(c,a);break;
  case 'blob':c.fillStyle=a;c.beginPath();c.moveTo(-12,12);c.bezierCurveTo(-16,-4,-6,-16,0,-14);c.bezierCurveTo(10,-16,16,-2,12,12);c.quadraticCurveTo(6,8,3,13);c.quadraticCurveTo(0,8,-4,13);c.quadraticCurveTo(-8,8,-12,12);c.fill();c.stroke();
    c.fillStyle='#e8e0ff';c.beginPath();c.arc(-4,-3,2.5,0,7);c.arc(5,-3,2.5,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(-4,-3,1,0,7);c.arc(5,-3,1,0,7);c.fill();break;
  case 'wolf':c.fillStyle=a;c.beginPath();c.moveTo(-11,-14);c.lineTo(-5,-5);c.lineTo(5,-5);c.lineTo(11,-14);c.lineTo(12,2);c.lineTo(4,9);c.lineTo(0,16);c.lineTo(-4,9);c.lineTo(-12,2);c.closePath();c.fill();c.stroke();
    c.fillStyle='#ffdf7a';c.beginPath();c.arc(-5,0,1.8,0,7);c.arc(5,0,1.8,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(0,13,2,0,7);c.fill();break;
  case 'construct':c.fillStyle=a;c.beginPath();c.rect(-12,-6,24,20);c.fill();c.stroke();c.beginPath();c.rect(-7,-17,14,11);c.fill();c.stroke();
    c.strokeStyle='#7fd0ff';c.lineWidth=2;c.beginPath();c.moveTo(-4,0);c.lineTo(0,8);c.lineTo(4,0);c.stroke();c.fillStyle='#7fd0ff';c.fillRect(-4,-13,3,2);c.fillRect(1,-13,3,2);break;
  case 'bird':c.fillStyle=a;c.beginPath();c.ellipse(0,2,9,12,0,0,7);c.fill();c.stroke();for(const s of[-1,1]){c.beginPath();c.moveTo(6*s,-2);c.lineTo(18*s,-8);c.lineTo(14*s,6);c.closePath();c.fill();c.stroke();}
    c.fillStyle='#f2d382';c.beginPath();c.arc(-4,-5,3,0,7);c.arc(4,-5,3,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(-4,-5,1.3,0,7);c.arc(4,-5,1.3,0,7);c.fill();
    c.fillStyle='#fff5c0';for(const [x,y] of[[-3,6],[3,9],[0,3]]){c.fillRect(x,y,1.5,1.5);}break;
  case 'skull':c.fillStyle=a;c.beginPath();c.arc(0,-3,11,Math.PI*0.9,Math.PI*2.1);c.lineTo(6,12);c.lineTo(-6,12);c.closePath();c.fill();c.stroke();
    c.fillStyle=dark;c.beginPath();c.ellipse(-4,-2,3,3.5,0,0,7);c.ellipse(4,-2,3,3.5,0,0,7);c.fill();c.fillStyle='#7fd0a0';c.beginPath();c.arc(-4,-2,1,0,7);c.arc(4,-2,1,0,7);c.fill();
    c.strokeStyle=dark;c.beginPath();for(const x of[-3,0,3]){c.moveTo(x,8);c.lineTo(x,12);}c.stroke();break;
  case 'rat':for(const [dx,dy,s] of[[-7,5,.7],[6,6,.7],[0,-2,1]]){c.save();c.translate(dx,dy);c.scale(s,s);c.fillStyle=a;c.beginPath();c.ellipse(0,0,10,6,0,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(9,-1);c.lineTo(15,1);c.lineTo(9,3);c.fill();c.stroke();c.fillStyle='#e8a0a0';c.beginPath();c.arc(-4,-5,2.5,0,7);c.fill();c.strokeStyle='#c09090';c.beginPath();c.moveTo(-10,0);c.quadraticCurveTo(-16,-4,-15,4);c.stroke();c.fillStyle='#ff6060';c.beginPath();c.arc(8,0,1,0,7);c.fill();c.restore();}break;
  case 'wraith':c.fillStyle=a;c.beginPath();c.moveTo(-10,15);c.lineTo(-10,-2);c.arc(0,-3,10,Math.PI,0);c.lineTo(10,15);for(let i=0;i<4;i++){c.lineTo(10-5*i-2.5,11);c.lineTo(10-5*(i+1),15);}c.closePath();c.fill();c.stroke();
    c.fillStyle='#fff6c0';c.beginPath();c.ellipse(-4,-3,2,3,0,0,7);c.ellipse(4,-3,2,3,0,0,7);c.fill();c.strokeStyle='#8a6a3a';c.beginPath();c.moveTo(12,-2);c.lineTo(12,6);c.stroke();c.fillStyle='#ffd060';c.beginPath();c.arc(12,9,3,0,7);c.fill();break;
  case 'badger':c.fillStyle=a;c.beginPath();c.ellipse(0,3,14,11,0,0,7);c.fill();c.stroke();c.fillStyle='#e8e4dc';c.beginPath();c.moveTo(-3,-8);c.lineTo(3,-8);c.lineTo(2,12);c.lineTo(-2,12);c.closePath();c.fill();
    for(const s of[-1,1]){c.fillStyle='#e8e4dc';c.beginPath();c.ellipse(8*s,-1,3,6,0,0,7);c.fill();}c.fillStyle=dark;c.beginPath();c.arc(-5,1,1.5,0,7);c.arc(5,1,1.5,0,7);c.arc(0,10,2,0,7);c.fill();break;
  case 'bear':c.fillStyle=a;for(const s of[-1,1]){c.beginPath();c.arc(10*s,-10,5,0,7);c.fill();c.stroke();}c.beginPath();c.ellipse(0,2,14,13,0,0,7);c.fill();c.stroke();
    c.fillStyle='#b8946a';c.beginPath();c.ellipse(0,7,7,5,0,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(-5,-1,1.6,0,7);c.arc(5,-1,1.6,0,7);c.arc(0,5,2.2,0,7);c.fill();break;
  case 'cannon':c.fillStyle='#6a4a2a';c.beginPath();c.rect(-12,4,20,6);c.fill();c.stroke();c.fillStyle=a;c.beginPath();c.roundRect(-10,-6,26,10,4);c.fill();c.stroke();c.fillStyle='#111';c.beginPath();c.arc(16,-1,3,0,7);c.fill();
    for(const x of[-8,4]){c.fillStyle='#8a6a3a';c.beginPath();c.arc(x,12,5,0,7);c.fill();c.stroke();}break;
  case 'sprite':c.fillStyle='rgba(220,255,200,.7)';for(const s of[-1,1]){c.beginPath();c.ellipse(9*s,-4,9,5,s*-0.6,0,7);c.fill();c.stroke();}c.fillStyle=a;c.beginPath();c.ellipse(0,4,4,9,0,0,7);c.fill();c.stroke();c.fillStyle='#e8c8a0';c.beginPath();c.arc(0,-8,4.5,0,7);c.fill();c.stroke();break;
  case 'stag':c.strokeStyle='#e8d9b2';c.lineWidth=2;for(const s of[-1,1]){c.beginPath();c.moveTo(4*s,-4);c.lineTo(10*s,-14);c.lineTo(9*s,-20);c.moveTo(10*s,-14);c.lineTo(17*s,-16);c.moveTo(7*s,-9);c.lineTo(14*s,-8);c.stroke();}
    c.fillStyle=a;c.strokeStyle=dark;c.lineWidth=1.5;c.beginPath();c.moveTo(-7,-5);c.lineTo(7,-5);c.lineTo(4,12);c.lineTo(0,17);c.lineTo(-4,12);c.closePath();c.fill();c.stroke();c.fillStyle='#3b5f8a';c.beginPath();c.arc(-3,2,1.6,0,7);c.arc(3,2,1.6,0,7);c.fill();break;
  case 'ram':c.fillStyle=a;c.beginPath();c.roundRect(-14,-6,24,14,3);c.fill();c.stroke();c.fillStyle='#5a5a62';c.beginPath();c.moveTo(10,-4);c.lineTo(18,-2);c.lineTo(18,6);c.lineTo(10,8);c.closePath();c.fill();c.stroke();
    c.fillStyle='#ddd';c.beginPath();c.arc(-6,-10,3,0,7);c.arc(-2,-13,3.5,0,7);c.fill();for(const x of[-9,3]){c.fillStyle='#3a3a3e';c.beginPath();c.arc(x,11,5,0,7);c.fill();c.stroke();}break;
  case 'shell':c.fillStyle=a;c.beginPath();c.arc(0,4,14,Math.PI,0);c.closePath();c.fill();c.stroke();c.strokeStyle='#2a4a40';c.beginPath();for(const x of[-7,0,7]){c.moveTo(x,4);c.lineTo(x*0.6,-8);}c.stroke();
    c.fillStyle='#8ac0a8';c.strokeStyle=dark;c.beginPath();c.arc(15,0,4.5,0,7);c.fill();c.stroke();c.fillStyle=dark;c.beginPath();c.arc(16,-1,1,0,7);c.fill();break;
  case 'eel':c.strokeStyle=a;c.lineWidth=6;c.beginPath();c.moveTo(-14,10);c.bezierCurveTo(-6,-2,-2,16,6,4);c.quadraticCurveTo(10,-4,12,-10);c.stroke();c.strokeStyle=dark;c.lineWidth=1;c.stroke();
    c.fillStyle='#ffe066';c.beginPath();c.moveTo(14,-14);c.lineTo(10,-6);c.lineTo(14,-6);c.lineTo(10,2);c.lineTo(18,-9);c.lineTo(14,-9);c.closePath();c.fill();break;
  case 'quad':{const o=a;c.fillStyle=o.col;c.beginPath();c.ellipse(-2,4,o.bw||13,o.bh||7,0,0,7);c.fill();c.stroke();
    c.lineWidth=3;c.strokeStyle=o.col;for(const x of[-11,-5,3,8]){c.beginPath();c.moveTo(x,8);c.lineTo(x+(x<0?-1:1),o.leg||16);c.stroke();}c.lineWidth=1.5;c.strokeStyle=dark;
    c.beginPath();c.arc(11,-3,o.hr||6,0,7);c.fill();c.stroke();c.fillStyle=dark;c.beginPath();c.arc(13,-4,1.2,0,7);c.fill();break;}
  case 'rabbit':for(const sd of[-1,1]){c.fillStyle=a;c.beginPath();c.ellipse(4+3*sd,-14,2.6,8,sd*0.2,0,7);c.fill();c.stroke();}
    c.fillStyle=a;c.beginPath();c.ellipse(-3,6,11,9,0,0,7);c.fill();c.stroke();c.beginPath();c.arc(6,-3,7,0,7);c.fill();c.stroke();
    c.fillStyle='#f4efe6';c.beginPath();c.arc(-13,6,3.5,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(8,-4,1.4,0,7);c.fill();c.fillStyle='#e88';c.beginPath();c.arc(12,-2,1.3,0,7);c.fill();break;
  case 'boar':drawGlyph(c,['quad',{col:a,bw:14,bh:9,hr:7,leg:15}]);c.fillStyle='#3a2a1e';c.beginPath();for(let i=0;i<5;i++){c.moveTo(-12+i*5,-4);c.lineTo(-10+i*5,-9);c.lineTo(-8+i*5,-4);}c.fill();
    c.fillStyle='#f2ead6';for(const y of[-1,2]){c.beginPath();c.moveTo(15,y);c.lineTo(20,y-6);c.lineTo(16,y+2);c.closePath();c.fill();c.stroke();}break;
  case 'lion':c.fillStyle='#8a4a1e';c.beginPath();c.arc(11,-4,10,0,7);c.fill();c.stroke();drawGlyph(c,['quad',{col:a,bw:14,bh:8,hr:6.5,leg:16}]);
    c.strokeStyle=a;c.lineWidth=2;c.beginPath();c.moveTo(-15,3);c.quadraticCurveTo(-21,-6,-17,-10);c.stroke();c.fillStyle='#8a4a1e';c.beginPath();c.arc(-17,-10,2.5,0,7);c.fill();break;
  case 'centaur':drawGlyph(c,['quad',{col:a,bw:12,bh:7,hr:0.1,leg:16}]);c.save();c.translate(8,-8);c.scale(0.8,0.8);drawFig(c,{col:'#6a4a2a',w:'bow',hat:'band'});c.restore();break;
  case 'rider':{const o=a;drawGlyph(c,['quad',{col:o.horse,bw:13,bh:7,hr:5,leg:16}]);if(o.ram){c.strokeStyle='#8a7a5a';c.lineWidth=2.5;c.beginPath();c.arc(12,-4,5,Math.PI*1.1,Math.PI*2.6);c.stroke();}
    else{c.fillStyle=o.horse;c.beginPath();c.moveTo(9,0);c.lineTo(13,-9);c.lineTo(17,-6);c.closePath();c.fill();c.stroke();}
    c.save();c.translate(-1,-10);c.scale(0.8,0.8);drawFig(c,{col:o.col,w:o.w,hat:o.hat,hair:'#e8e0c0'});c.restore();break;}
  case 'storm':c.fillStyle=a;c.beginPath();c.moveTo(-4,16);c.quadraticCurveTo(-12,6,-8,-2);c.quadraticCurveTo(-16,-12,-4,-16);c.quadraticCurveTo(4,-22,10,-14);c.quadraticCurveTo(18,-6,8,2);c.quadraticCurveTo(10,10,-4,16);c.fill();c.stroke();
    c.fillStyle='#ffe066';c.beginPath();c.moveTo(2,-12);c.lineTo(-4,0);c.lineTo(1,0);c.lineTo(-3,12);c.lineTo(7,-3);c.lineTo(2,-3);c.closePath();c.fill();c.stroke();
    c.fillStyle='#fff';c.beginPath();c.arc(-3,-8,1.6,0,7);c.arc(5,-8,1.6,0,7);c.fill();break;
  case 'dragon':c.fillStyle='rgba(120,90,140,.85)';for(const sd of[-1,1]){c.beginPath();c.moveTo(2*sd,-2);c.lineTo(20*sd,-16);c.lineTo(16*sd,-2);c.lineTo(10*sd,4);c.closePath();c.fill();c.stroke();}
    c.fillStyle=a;c.beginPath();c.ellipse(0,5,8,11,0,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(-5,-4);c.lineTo(0,-18);c.lineTo(5,-4);c.closePath();c.fill();c.stroke();
    c.fillStyle='#7fe08a';c.beginPath();c.arc(-2,-11,1.4,0,7);c.arc(2,-11,1.4,0,7);c.fill();c.strokeStyle='#d8d0b8';c.lineWidth=1;c.beginPath();for(const y of[1,5,9]){c.moveTo(-5,y);c.lineTo(5,y);}c.stroke();break;
  case 'eagle':c.fillStyle=a;for(const sd of[-1,1]){c.beginPath();c.moveTo(4*sd,-2);c.lineTo(21*sd,-12);c.lineTo(18*sd,-2);c.lineTo(8*sd,8);c.closePath();c.fill();c.stroke();}
    c.beginPath();c.ellipse(0,4,8,12,0,0,7);c.fill();c.stroke();c.fillStyle='#f4efe6';c.beginPath();c.arc(0,-10,6.5,0,7);c.fill();c.stroke();
    c.fillStyle='#f2b630';c.beginPath();c.moveTo(-2,-8);c.lineTo(2,-8);c.lineTo(0,-3);c.closePath();c.fill();c.fillStyle=dark;c.beginPath();c.arc(-2.5,-11,1.2,0,7);c.arc(2.5,-11,1.2,0,7);c.fill();break;
  case 'golem':drawGlyph(c,['construct',a]);c.fillStyle='#5fd0a0';c.strokeStyle=dark;c.beginPath();c.moveTo(0,0);c.lineTo(5,5);c.lineTo(0,11);c.lineTo(-5,5);c.closePath();c.fill();c.stroke();break;
  case 'monkey':c.strokeStyle=a;c.lineWidth=2.5;c.beginPath();c.moveTo(-8,12);c.bezierCurveTo(-20,10,-18,-6,-12,-4);c.stroke();c.lineWidth=1.5;c.strokeStyle=dark;
    c.fillStyle=a;c.beginPath();c.ellipse(0,7,8,9,0,0,7);c.fill();c.stroke();c.beginPath();c.arc(0,-7,7,0,7);c.fill();c.stroke();for(const sd of[-1,1]){c.beginPath();c.arc(7*sd,-8,2.6,0,7);c.fill();c.stroke();}
    c.fillStyle='#e2c49a';c.beginPath();c.ellipse(0,-5,4.5,4,0,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(-2,-8,1,0,7);c.arc(2,-8,1,0,7);c.fill();
    c.fillStyle='#22222a';c.beginPath();c.arc(11,2,4.5,0,7);c.fill();c.strokeStyle='#e8bc3e';c.beginPath();c.moveTo(13,-1);c.lineTo(16,-6);c.stroke();break;
  case 'crab':c.lineWidth=2;for(const sd of[-1,1])for(const i of[0,1,2]){c.beginPath();c.moveTo(6*sd,6+i*2);c.lineTo(15*sd,10+i*3);c.stroke();}c.lineWidth=1.5;
    c.fillStyle=a;c.beginPath();c.ellipse(0,4,12,8,0,0,7);c.fill();c.stroke();for(const sd of[-1,1]){c.beginPath();c.arc(14*sd,-8,5,0,7);c.fill();c.stroke();c.fillStyle='#f4e6d6';c.beginPath();c.moveTo(14*sd,-8);c.lineTo(19*sd,-12);c.lineTo(18*sd,-6);c.closePath();c.fill();c.fillStyle=a;}
    c.fillStyle=dark;c.beginPath();c.arc(-3,-4,1.6,0,7);c.arc(3,-4,1.6,0,7);c.fill();break;
  case 'turtle':c.fillStyle='#8ab070';c.beginPath();c.arc(15,4,4.5,0,7);c.fill();c.stroke();for(const x of[-10,8])for(const y of[12]){c.beginPath();c.ellipse(x,y,4,3,0,0,7);c.fill();c.stroke();}
    c.fillStyle=a;c.beginPath();c.arc(0,8,13,Math.PI,0);c.closePath();c.fill();c.stroke();c.strokeStyle='#2a4a30';c.beginPath();c.moveTo(-6,8);c.lineTo(-3,-2);c.lineTo(3,-2);c.lineTo(6,8);c.stroke();c.strokeStyle=dark;
    c.save();c.translate(0,-10);c.scale(0.75,0.75);drawFig(c,{col:'#2a8aa0',w:'spear',hat:'helm',skin:'#7ac0c0'});c.restore();break;
  case 'colossus':c.fillStyle=a;c.beginPath();c.roundRect(-12,-8,24,22,5);c.fill();c.stroke();c.beginPath();c.arc(0,-12,7,0,7);c.fill();c.stroke();
    for(const sd of[-1,1]){c.beginPath();c.roundRect(12*sd-(sd<0?6:0),-6,6,16,3);c.fill();c.stroke();}c.strokeStyle='#f2c0a0';c.lineWidth=2;c.beginPath();for(const [x,y] of[[-6,-2],[4,4],[-2,10]]){c.moveTo(x,y);c.lineTo(x+3,y-4);c.moveTo(x+3,y-4);c.lineTo(x+6,y-1);}c.stroke();
    c.fillStyle='#bfe8ff';c.beginPath();c.arc(-3,-13,1.6,0,7);c.arc(3,-13,1.6,0,7);c.fill();break;
  case 'seahorse':c.fillStyle=a;c.beginPath();c.moveTo(-2,16);c.bezierCurveTo(-12,10,-8,0,-2,-2);c.bezierCurveTo(-8,-6,-6,-16,2,-16);c.lineTo(12,-12);c.lineTo(4,-8);c.bezierCurveTo(8,0,6,10,-2,16);c.fill();c.stroke();
    c.fillStyle=dark;c.beginPath();c.arc(1,-12,1.5,0,7);c.fill();c.fillStyle='#22a3b4';c.beginPath();c.arc(0,-1,4,0,7);c.fill();break;
  }
}
function drawUnit(c,k,x,y,r){
  if(U[k].up){drawUnit(c,U[k].base,x,y,r);c.save();c.translate(x,y);c.scale(r/20,r/20);c.fillStyle='#f2d382';c.strokeStyle='#5a3a0a';c.lineWidth=1.2;c.beginPath();c.moveTo(-8,-18);c.lineTo(-9,-25);c.lineTo(-4,-21);c.lineTo(0,-27);c.lineTo(4,-21);c.lineTo(9,-25);c.lineTo(8,-18);c.closePath();c.fill();c.stroke();c.restore();return;}
  const u=U[k];c.save();c.translate(x,y);c.scale(r/20,r/20);c.lineCap='round';c.lineJoin='round';
  const dark='#15130e';
  if(u.g){drawGlyph(c,u.g);c.restore();return;}
  switch(k){
  case 'thorn':
    c.strokeStyle='#d8cfb4';c.lineWidth=2.4;c.beginPath();c.moveTo(-11,15);c.lineTo(10,-13);c.stroke();
    c.fillStyle='#efe8cf';c.beginPath();c.moveTo(14,-18);c.lineTo(7,-14);c.lineTo(11,-10);c.closePath();c.fill();
    c.fillStyle=u.col;c.strokeStyle=dark;c.lineWidth=1.6;c.beginPath();c.moveTo(-10,-8);c.lineTo(6,-8);c.lineTo(6,2);c.quadraticCurveTo(5,10,-2,14);c.quadraticCurveTo(-9,10,-10,2);c.closePath();c.fill();c.stroke();
    c.strokeStyle='#cfe0a0';c.lineWidth=1.3;c.beginPath();c.moveTo(-6,-3);c.lineTo(2,5);c.moveTo(2,-3);c.lineTo(-6,5);c.stroke();break;
  case 'reed':
    c.strokeStyle='#7a4f22';c.lineWidth=3;c.beginPath();c.arc(-16,0,19,-0.95,0.95);c.stroke();
    c.strokeStyle='#e6dcc0';c.lineWidth=1;c.beginPath();c.moveTo(-4.5,-15.5);c.lineTo(-4.5,15.5);c.stroke();
    c.strokeStyle=u.col;c.lineWidth=2;c.beginPath();c.moveTo(-10,0);c.lineTo(13,0);c.stroke();
    c.fillStyle='#e6dcc0';c.beginPath();c.moveTo(17,0);c.lineTo(11,-4);c.lineTo(11,4);c.closePath();c.fill();break;
  case 'antler':
    c.strokeStyle='#e8d9b2';c.lineWidth=2;
    for(const s of[-1,1]){c.beginPath();c.moveTo(4*s,-2);c.lineTo(10*s,-12);c.lineTo(9*s,-18);c.moveTo(10*s,-12);c.lineTo(16*s,-14);c.moveTo(7*s,-7);c.lineTo(13*s,-6);c.stroke();}
    c.fillStyle=u.col;c.strokeStyle=dark;c.lineWidth=1.6;c.beginPath();c.moveTo(-7,-3);c.lineTo(7,-3);c.lineTo(4,12);c.lineTo(0,16);c.lineTo(-4,12);c.closePath();c.fill();c.stroke();
    c.fillStyle=dark;c.beginPath();c.arc(-3,3,1.4,0,7);c.arc(3,3,1.4,0,7);c.fill();break;
  case 'moth':
    c.fillStyle=u.col;c.strokeStyle=dark;c.lineWidth=1.3;
    for(const s of[-1,1]){c.beginPath();c.ellipse(9*s,-6,10,7,s*-0.5,0,7);c.fill();c.stroke();c.beginPath();c.ellipse(7*s,7,6,5,s*0.5,0,7);c.fill();c.stroke();c.fillStyle='#f1dfa0';c.beginPath();c.arc(10*s,-6,2.6,0,7);c.fill();c.fillStyle=u.col;}
    c.fillStyle='#d9cfb6';c.beginPath();c.ellipse(0,0,2.6,11,0,0,7);c.fill();break;
  case 'oak':
    c.fillStyle='#5d3b1d';c.strokeStyle=dark;c.lineWidth=1.4;c.beginPath();c.moveTo(-4,16);c.lineTo(-3,0);c.lineTo(3,0);c.lineTo(5,16);c.closePath();c.fill();c.stroke();
    c.fillStyle=u.col;for(const [cx,cy,cr] of [[-8,-4,8],[8,-4,8],[0,-11,9],[0,-2,8]]){c.beginPath();c.arc(cx,cy,cr,0,7);c.fill();c.stroke();}
    c.fillStyle='#f2d382';c.beginPath();c.arc(-3,-4,1.5,0,7);c.arc(3,-4,1.5,0,7);c.fill();break;
  case 'wight':drawGlyph(c,['wraith',u.col]);break;
  case 'wolf':drawGlyph(c,['wolf',u.col]);break;
  case 'imp':
    c.fillStyle=u.col;c.strokeStyle=dark;c.lineWidth=1.5;c.beginPath();c.moveTo(0,-17);c.bezierCurveTo(8,-8,13,0,10,8);c.quadraticCurveTo(6,16,0,16);c.quadraticCurveTo(-6,16,-10,8);c.bezierCurveTo(-13,0,-6,-6,-4,-12);c.quadraticCurveTo(-1,-6,0,-17);c.fill();c.stroke();
    c.fillStyle='#f6c64a';c.beginPath();c.ellipse(0,7,5,7,0,0,7);c.fill();c.fillStyle=dark;c.beginPath();c.arc(-4,0,1.6,0,7);c.arc(4,0,1.6,0,7);c.fill();break;
  case 'troll':
    c.fillStyle=u.col;c.strokeStyle=dark;c.lineWidth=1.5;c.beginPath();c.ellipse(0,2,14,13,0,0,7);c.fill();c.stroke();
    c.strokeStyle=dark;c.lineWidth=2;c.beginPath();c.moveTo(-8,-2);c.lineTo(-2,0);c.moveTo(8,-2);c.lineTo(2,0);c.stroke();
    c.fillStyle='#efe6cc';c.beginPath();c.moveTo(-6,7);c.lineTo(-4,0);c.lineTo(-2,7);c.closePath();c.moveTo(6,7);c.lineTo(4,0);c.lineTo(2,7);c.closePath();c.fill();break;
  case 'drake':
    c.strokeStyle='#e9fbff';c.lineWidth=1.2;c.fillStyle=u.col;
    for(const s of[-1,1]){c.beginPath();c.moveTo(2*s,-2);c.lineTo(17*s,-15);c.lineTo(13*s,-3);c.lineTo(18*s,2);c.lineTo(4*s,4);c.closePath();c.fill();c.stroke();}
    c.fillStyle='#bfeef0';c.beginPath();c.moveTo(0,-16);c.lineTo(5,-4);c.lineTo(3,14);c.lineTo(0,18);c.lineTo(-3,14);c.lineTo(-5,-4);c.closePath();c.fill();c.stroke();break;
  }
  c.restore();
}
/* hero portraits: built from the hero's faction and a seed, so every hero looks different */
const SKINS=['#f0c8a0','#d9a87e','#b07850','#8a5a3a','#e8b890'];const HAIRS=['#2a1a10','#5a3418','#a0642a','#d8c070','#e8e4dc','#8a2a1a','#3a3a3a'];
function drawHeroPortrait(c,s,hid){
  if(HBY[hid].blank){const f=FAC[HBY[hid].fac];c.save();c.scale(s/64,s/64);const bg=c.createLinearGradient(0,0,0,64);bg.addColorStop(0,f.col);bg.addColorStop(1,'#141816');c.fillStyle=bg;c.fillRect(0,0,64,64);
    c.fillStyle='rgba(10,12,11,.75)';c.beginPath();c.ellipse(32,27,11,13,0,0,7);c.fill();c.beginPath();c.moveTo(8,64);c.quadraticCurveTo(10,42,32,40);c.quadraticCurveTo(54,42,56,64);c.fill();
    c.fillStyle=f.col2;c.font='700 20px Georgia,serif';c.textAlign='center';c.textBaseline='middle';c.fillText('?',32,28);c.restore();return;}
  const h=HBY[hid],f=FAC[h.fac],g=mulberry32(hash(hid));
  let skin=SKINS[Math.floor(g()*SKINS.length)],hair=HAIRS[Math.floor(g()*HAIRS.length)];
  if(h.fac==='necro')skin='#c8c8b8';if(h.fac==='merfolk')skin=pick2(g,['#7ac0c0','#8ad0c8','#6ab0b8']);
  c.save();c.scale(s/64,s/64);
  const bg=c.createLinearGradient(0,0,0,64);bg.addColorStop(0,f.col);bg.addColorStop(1,'#141816');c.fillStyle=bg;c.fillRect(0,0,64,64);
  c.fillStyle='rgba(0,0,0,.25)';for(let y=0;y<64;y+=4)c.fillRect(0,y,64,1);
  // shoulders
  c.fillStyle=f.pal[2]||f.col;c.beginPath();c.moveTo(6,64);c.quadraticCurveTo(10,42,32,40);c.quadraticCurveTo(54,42,58,64);c.fill();
  c.fillStyle=f.col2;c.beginPath();c.moveTo(26,44);c.lineTo(32,52);c.lineTo(38,44);c.closePath();c.fill();
  // face
  c.fillStyle=skin;c.beginPath();c.ellipse(32,27,11,13,0,0,7);c.fill();
  const style=Math.floor(g()*3);
  c.fillStyle=hair;
  if(style===0){c.beginPath();c.moveTo(19,30);c.quadraticCurveTo(18,10,32,11);c.quadraticCurveTo(47,10,45,30);c.quadraticCurveTo(43,19,32,18);c.quadraticCurveTo(22,19,19,30);c.fill();}
  else if(style===1){c.beginPath();c.moveTo(19,40);c.quadraticCurveTo(15,10,32,10);c.quadraticCurveTo(49,10,45,40);c.quadraticCurveTo(44,22,32,18);c.quadraticCurveTo(21,22,19,40);c.fill();}
  else{c.beginPath();c.moveTo(21,22);c.quadraticCurveTo(24,12,32,13);c.quadraticCurveTo(40,12,43,22);c.quadraticCurveTo(32,16,21,22);c.fill();}
  // faction headgear
  const a=h.fac;
  if(a==='rangers'||a==='necro'){c.fillStyle=a==='necro'?'#2a2236':f.pal[2];c.beginPath();c.moveTo(16,44);c.quadraticCurveTo(14,6,32,6);c.quadraticCurveTo(50,6,48,44);c.lineTo(43,40);c.quadraticCurveTo(46,16,32,15);c.quadraticCurveTo(18,16,21,40);c.closePath();c.fill();
    if(a==='necro'){c.fillStyle='#7fd0a0';c.fillRect(26,26,4,2);c.fillRect(34,26,4,2);}}
  else if(a==='wizards'){c.fillStyle=f.col;c.beginPath();c.moveTo(16,18);c.lineTo(48,18);c.lineTo(36,-2);c.closePath();c.fill();c.fillStyle=f.col2;c.fillRect(16,16,32,3);}
  else if(a==='pirates'){c.fillStyle=f.col;c.beginPath();c.moveTo(19,20);c.quadraticCurveTo(32,8,45,20);c.lineTo(47,24);c.lineTo(19,22);c.closePath();c.fill();c.fillStyle='#f2d382';c.beginPath();c.arc(43,32,1.6,0,7);c.fill();}
  else if(a==='dwarves'){c.fillStyle='#8a8a92';c.beginPath();c.arc(32,20,12,Math.PI,0);c.fill();c.fillStyle=hair;c.beginPath();c.moveTo(21,30);c.quadraticCurveTo(32,58,43,30);c.quadraticCurveTo(32,38,21,30);c.fill();}
  else if(a==='elves'){c.fillStyle=skin;for(const s2 of[-1,1]){c.beginPath();c.moveTo(32+10*s2,26);c.lineTo(32+19*s2,17);c.lineTo(32+11*s2,31);c.closePath();c.fill();}}
  else if(a==='merfolk'){c.fillStyle=f.col2;for(const s2 of[-1,1]){c.beginPath();c.moveTo(32+10*s2,25);c.lineTo(32+18*s2,20);c.lineTo(32+17*s2,30);c.closePath();c.fill();}}
  else if(a==='centaurs'){c.fillStyle=f.col;c.fillRect(20,17,24,3);c.strokeStyle='#e8d9b2';c.lineWidth=1.5;for(const s2 of[-1,1]){c.beginPath();c.moveTo(32+8*s2,16);c.lineTo(32+13*s2,6);c.moveTo(32+11*s2,10);c.lineTo(32+16*s2,10);c.stroke();}}
  c.fillStyle='#1a1a1a';c.beginPath();c.arc(28,28,1.3,0,7);c.arc(36,28,1.3,0,7);c.fill();
  c.strokeStyle='rgba(80,30,20,.7)';c.lineWidth=1.2;c.beginPath();c.moveTo(29,34);c.quadraticCurveTo(32,36,35,34);c.stroke();
  c.restore();
}
function pick2(g,a){return a[Math.floor(g()*a.length)];}
function drawCrest(c,fk,w,h){
  const f=FAC[fk];c.save();c.scale(w/52,h/60);
  c.fillStyle=f.col;c.strokeStyle=f.col2;c.lineWidth=2.5;c.beginPath();c.moveTo(4,4);c.lineTo(48,4);c.lineTo(48,30);c.quadraticCurveTo(46,48,26,57);c.quadraticCurveTo(6,48,4,30);c.closePath();c.fill();c.stroke();
  c.fillStyle='rgba(0,0,0,.22)';c.beginPath();c.moveTo(26,4);c.lineTo(48,4);c.lineTo(48,30);c.quadraticCurveTo(46,48,26,57);c.closePath();c.fill();
  drawUnit(c,f.units[4],26,28,16);
  c.restore();
}
function drawRelic(c,i,x,y,r){const Rl=RELICS[i];c.save();c.translate(x,y);c.scale(r/10,r/10);c.lineWidth=1.2;c.strokeStyle='#1a120a';
  const g=c.createRadialGradient(0,0,1,0,0,13);g.addColorStop(0,Rl.col+'aa');g.addColorStop(1,Rl.col+'00');c.fillStyle=g;c.beginPath();c.arc(0,0,13,0,7);c.fill();c.fillStyle=Rl.col;
  if(RELICS===GRAILS){c.beginPath();c.moveTo(-7,-8);c.lineTo(7,-8);c.quadraticCurveTo(7,0,1.5,1);c.lineTo(1.5,5);c.lineTo(5,8);c.lineTo(-5,8);c.lineTo(-1.5,5);c.lineTo(-1.5,1);c.quadraticCurveTo(-7,0,-7,-8);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.55)';c.fillRect(-5,-7,3,4);}
  else if(i===6){c.beginPath();c.moveTo(0,8);c.bezierCurveTo(-11,0,-7,-10,0,-4);c.bezierCurveTo(7,-10,11,0,0,8);c.fill();c.stroke();}
  else{c.beginPath();c.moveTo(0,-9);c.lineTo(5,-2);c.lineTo(3,8);c.lineTo(-3,8);c.lineTo(-5,-2);c.closePath();c.fill();c.stroke();c.fillStyle='rgba(255,255,255,.5)';c.beginPath();c.moveTo(0,-9);c.lineTo(-5,-2);c.lineTo(-1,-1);c.closePath();c.fill();}
  c.restore();}
/* -------- sprite art in assets/; the drawn placeholders stay as the fallback -------- */
const ART_BASE='assets/';
/* Tavern Recruits (v37): 19 portraits packed in portraits/heroes/recruits.png (10 a row, 128 px) so the published copy stays under its file limit.
   Cropped to a data URL once the atlas loads; on file:// (canvas export blocked) or before it loads, use the single file. */
const RECRUIT_PORT=['alderhide','briar','mossback','ilyra','tavian','yselle','veyra','graven','ossin','spindle','skimmer','atoll','brynja','tansy','kiln','purl','quillby','folio','cresset','inkwake','saltjaw','pip_quickline','zahara','tembor','virel','nessa_holt','reedcall','sera_venn','gliss','murmur','rattleclaw','silka','flintback','bess_bell','rusk_hookhorn','aster','thornfrill','harlan_chalk','morel','iona_shoal','nerka','axel','dot','enzo','gale','livingston_cyborg','nissa','payton','vera','remy','ada','mara','ivy','lune','hart','orla','kit_and_nell','cato','sid_and_tess','wren','rumble','gus_and_glen','midge','mags_and_mae','bloop','gleam','odo_and_otto','aster_and_briar','rue','ned_and_nat','spike','rafe_and_reed','bo','bess_and_bea','gilt','fin_and_flo','bort_simesin','gunt_gunt','azure_hype','ericsonion','ardcat','space_toad','mr_pinecone','nix','deepwave_the_ai','bobbythebob','capydara','lishy','kushalito_banana','fut_esports','noel_dragonfire','luckenzo','lord_krishna','bananna','nala','nanya','posy_spinner','catherine','bristle','zenvy','king_pharoph_the_3rd','rose_flower','posy','bannana_boy','spirit_of_the_forest','ava_young','rosie','celestine_circe','estella','lily','pottery','kaf_underworld_pharaoh'];
const recruitCache={};
function recruitPortrait(id){if(recruitCache[id])return recruitCache[id];const a=artImg('portraits/heroes/recruits.png'),i=RECRUIT_PORT.indexOf(id),file=ART_BASE+`portraits/heroes/${id}_128.png`;
  if(!a.ok)return file;try{const cv=document.createElement('canvas');cv.width=cv.height=128;cv.getContext('2d').drawImage(a.img,(i%10)*128,Math.floor(i/10)*128,128,128,0,0,128,128);return recruitCache[id]=cv.toDataURL();}catch(e){return recruitCache[id]=file;}}
const ART_PORTRAITS=new Set(['eden','boone','holmes','tinker','bear','battaglia','dorothy','oliver','grimes','engelman','tempest','rimmer','parker','necro4','shadow','rago','monkey','schmickle','binx','boopis',
  'omalley','vargas','sheila','lawrence','davis','sookie','michael','love','livingston','ivan','slack','dupengeiser','perry','rocky','elvis','letchworth','mer2']);
const ART_MAP=new Set(['binx','dorothy','oliver','vargas']),MAP_SRC={};
const ART_UNITS={};
/* Enemies, Loot & World Pack 02: neutral battle sheets (4x5 like the Rangers, no team masks), 32px map guards, enemy portraits */
const ENEMY_ART={wolf:'wolf',wight:'wight',imp:'imp',troll:'troll',drake:'drake',bandit:'bandit',skelguard:'skeleton',wildboar:'boar',spider:'spider',ogre:'ogre'};
const MINE_ART={saw:['sawmill',46,16],orepit:['ore_pit',46,12],gold:['gold_seam',46,22],amber:['amber_spring',46,23]};
const FLAG_COLS={blue:'#5d78c3',crimson:'#bb4e5a',forest:'#558f59',gold:'#c49649',rose:'#866280',slate:'#8b8c8d',turquoise:'#2c92a7',violet:'#9065a1'};
const hexRGB=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255];};
const flagFor=col=>{const a=hexRGB(col);let best='neutral',bd=1e9;for(const[k,v]of Object.entries(FLAG_COLS)){const b=hexRGB(v),d=(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;if(d<bd){bd=d;best=k;}}return best;};
/* projectile art by attacker */
const PROJ_OF=k=>{const b=U[k]&&U[k].up?U[k].base:k;return k==='cannon_u'?'bolt':b==='bolt'||b==='gunner'?'bolt':b==='cannon'?'rock':b==='imp'||b==='powder'?'ember':b==='spider'?'spit':['magus','apprentice','siren','stormel'].includes(b)?'spell_orb':'arrow';};
/* Troops Pack 10: six-pose strips (idle, move A, move B, attack, hit, defeat), 64 or 96 px frames, no team masks */
const ART_STRIPS={thorn:'thornguard',reed:'reedbow',antler:'antler_knight',moth:'moth_seer',oak:'oak_warden',owl:'owl_familiar',apprentice:'apprentice_mage',earthel:'earth_elemental',stormel:'storm_elemental',magus:'archmage',
  skeleton:'skeleton',zombie:'zombie',werewolf:'werewolf',vampire:'vampire',hellkite:'hellkite',
  rabbit:'war_rabbit',boar:'boar',hounds:'hound',centaur:'centaur',lion:'lion',
  deckhand:'deckhand',powder:'powder_monkey',duelist:'duelist',gunner:'gunner',cannon:'cannon_crew',cannon_u:'great_crossbow',
  sprite:'sprite',longbow:'longbow_ranger',dryad:'grove_warden',rider:'elven_rider',eagle:'giant_eagle',
  delver:'young_dwarf',bolt:'dwarf_crossbowman',paladin:'dwarf_paladin',ramrider:'ram_rider',golem:'gem_golem',
  spear:'spearfolk',siren:'siren',crab:'giant_crab',turtle:'turtle_knight',colossus:'coral_colossus'};
const ART_DIRS=['s','sw','w','nw','n','ne','e','se'];
const dirOf=(dx,dy)=>({'0,1':'s','-1,1':'sw','-1,0':'w','-1,-1':'nw','0,-1':'n','1,-1':'ne','1,0':'e','1,1':'se'})[Math.sign(dx)+','+Math.sign(dy)]||'s';
const artImgs={};
function artImg(path){let a=artImgs[path];if(a)return a;a=artImgs[path]={img:new Image(),ok:false,tint:{}};a.img.onload=()=>{a.ok=true;};a.img.src=ART_BASE+path;return a;}
function shadeRGB(hex,f){const n=parseInt(hex.slice(1),16),r=n>>16,g=n>>8&255,b=n&255,t=f<0?0:255,p=Math.abs(f);return[Math.round(r+(t-r)*p),Math.round(g+(t-g)*p),Math.round(b+(t-b)*p)];}
/* recolour the team pixels (from the paired mask) to a faction colour; falls back to the original if pixels can't be read */
function tinted(path,maskPath,col,lum){
  const a=artImg(path);if(!a.ok)return null;if(!col)return a.img;if(a.tint[col])return a.tint[col];
  const m=artImg(maskPath);if(!m.ok)return a.img;
  try{const w=a.img.width,h=a.img.height,cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.drawImage(a.img,0,0);const d=c.getImageData(0,0,w,h);
    const mc=document.createElement('canvas');mc.width=w;mc.height=h;const mx=mc.getContext('2d');mx.drawImage(m.img,0,0);const md=mx.getImageData(0,0,w,h).data;
    const ramp=[shadeRGB(col,-0.55),shadeRGB(col,-0.28),shadeRGB(col,0),shadeRGB(col,0.32)];
    for(let i=0;i<md.length;i+=4)if(md[i+3]>0&&d.data[i+3]>0){const L=(0.3*d.data[i]+0.59*d.data[i+1]+0.11*d.data[i+2])/255,sh=ramp[lum?(L<0.28?0:L<0.45?1:L<0.66?2:3):Math.min(3,Math.round(md[i]/85))];d.data[i]=sh[0];d.data[i+1]=sh[1];d.data[i+2]=sh[2];}
    c.putImageData(d,0,0);return a.tint[col]=cv;}catch(e){return a.tint[col]=a.img;}
}
/* Pack 06/07 art: town stages, stones, sites, portals, gems, title banner */
const BUILD_ART=new Set();// '<fac>/<building id>' once art for that building exists in assets/buildings
const townStage=tw=>tw&&tw.built?(tw.built.hall4?4:tw.built.hall3?3:tw.built.hall2?2:1):1;
/* packed art: the team mask sits below ('v') or beside ('h') the picture in the same file */
function tintedPacked(path,col,dir){const a=artImg(path);if(!a.ok)return null;const key='pk:'+dir+':'+(col||'');if(a.tint[key])return a.tint[key];
  const im=a.img,w=dir==='h'?im.width/2:im.width,h=dir==='h'?im.height:im.height/2,cv=document.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d');c.drawImage(im,0,0,w,h,0,0,w,h);
  if(!col)return a.tint[key]=cv;
  try{const d=c.getImageData(0,0,w,h),mc=document.createElement('canvas');mc.width=w;mc.height=h;const mx=mc.getContext('2d');mx.drawImage(im,dir==='h'?w:0,dir==='h'?0:h,w,h,0,0,w,h);const md=mx.getImageData(0,0,w,h).data;
    const ramp=[shadeRGB(col,-0.55),shadeRGB(col,-0.28),shadeRGB(col,0),shadeRGB(col,0.32)];
    for(let i=0;i<md.length;i+=4)if(md[i+3]>0&&d.data[i+3]>0){const L=(0.3*d.data[i]+0.59*d.data[i+1]+0.11*d.data[i+2])/255,sh=ramp[L<0.28?0:L<0.45?1:L<0.66?2:3];d.data[i]=sh[0];d.data[i+1]=sh[1];d.data[i+2]=sh[2];}
    c.putImageData(d,0,0);}catch(e){}
  return a.tint[key]=cv;}
const townSprite=(fk,stage,col)=>tinted(`towns/${fk}/${stage}.png`,`team_masks/towns/${fk}/${stage}.png`,col);
const FLOT={floating_chest:{name:'Floating chest',give:'800-1,400 gold'},salvage_crate:{name:'Salvage crate',give:'5 timber and 5 ore'},driftwood:{name:'Driftwood',give:'6 timber'},
  supply_barrel:{name:'Supply barrel',give:'500 gold and 3 ore'},pearl_shell:{name:'Giant pearl',give:'2 amber'},message_bottle:{name:'Message in a bottle',give:'a rumour, or 600 gold'},
  sea_crystal:{name:'Sea crystal',give:'3 amber'},coral_relic:{name:'Coral relic',give:'an artifact'}};
const UI_RES={gold:'gold',timber:'wood',ore:'ore'},UI_STAT={atk:'attack',def:'defense',lore:'mana'};
/* Resources & Map Sites pack: one atlas, map/world_extras.png. key: [x, y, w, h, frames]; drawn bottom-centre on the foot like spriteAt */
const WX={gem:[0,0,128,64,2],moon:[128,0,128,64,2],fair:[256,0,96,64,1],moonwater_pile:[352,0,48,48,1],gems_pile:[400,0,48,48,1],prison:[0,64,64,64,1],woodcamp:[64,64,64,64,1],orecart:[128,64,64,64,1],amberhollow:[192,64,64,64,1],outpost:[256,64,64,64,1]};
function wxAt(c,key,x,y,sc,fms=450){const q=WX[key],a=artImg('map/world_extras.png');if(!q||!a.ok)return false;const fw=q[2]/q[4],f=q[4]>1?Math.floor(performance.now()/fms)%q[4]:0;
  c.imageSmoothingEnabled=false;c.drawImage(a.img,q[0]+f*fw,q[1],fw,q[3],Math.round(x-fw*sc/2),Math.round(y-(q[3]-3)*sc),Math.round(fw*sc),Math.round(q[3]*sc));return true;}
const PILE_ART=new Set(['gold','timber','ore','amber']);
const GEMS={ruby:{name:'Ruby',n:2},sapphire:{name:'Sapphire',n:1},emerald:{name:'Emerald',n:1},amethyst:{name:'Amethyst',n:1},moonstone:{name:'Moonstone',n:1,res:'moonwater'}};
function spriteAt(c,path,x,y,sc,frames=1,fms=150){const a=artImg(path);if(!a.ok)return false;const im=a.img,fw=im.width/frames,f=frames>1?Math.floor(performance.now()/fms)%frames:0;
  c.imageSmoothingEnabled=false;c.drawImage(im,f*fw,0,fw,im.height,Math.round(x-fw*sc/2),Math.round(y-(im.height-4)*sc),Math.round(fw*sc),Math.round(im.height*sc));return true;}
const unitArt=k=>{const u=U[k];return u?ART_UNITS[u.up?u.base:k]||null:null;};
/* sheets live under units/<faction>/<name>/ (rangers, wizards, necro, centaurs, pirates, elves, dwarves, merfolk) */
const unitFac=k=>{const b=U[k]&&U[k].up?U[k].base:k;return FAC_ORDER.find(f=>FAC[f].units.includes(b))||'rangers';};
const stripArt=k=>{const u=U[k];return u?ART_STRIPS[k]||ART_STRIPS[u.up?u.base:k]||null:null;};
const stripPath=k=>{const n=stripArt(k);return n?`units/${unitFac(k)}/${n}/${n}_strip.png`:null;};
/* sheet rows (idle, move, attack, hit, death) and frame 0-3 mapped onto the six strip poses */
const stripPose=(row,fr)=>row===1?1+(fr%2):row===2?(fr===1||fr===2?3:0):row===3?4:row===4?(fr<1?4:5):0;
/* upgraded troops wear gold where their team colour would be */
const mixHex=(a,b,t)=>{const A=hexRGB(a),B=hexRGB(b);return'#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join('');};
const upgCol=col=>mixHex(col||'#2f8f88','#f2c14e',0.72);
const unitSheet=(k,col)=>{if(U[k]&&U[k].up)col=upgCol(col);if(ENEMY_ART[k]){const a=artImg(`enemies/${ENEMY_ART[k]}/sheet.png`);return a.ok?a.img:null;}if(!unitArt(k)){const sp=stripPath(k);if(!sp)return null;const im=tintedPacked(sp,col,'v');return im?{strip:im}:null;}const n=unitArt(k),f=unitFac(k);return n?tinted(`units/${f}/${n}/${n}_sheet.png`,`team_masks/units/${f}/${n}/${n}_sheet.png`,col):null;};
/* personal walkers (packs 05 and 06): 14 sheets of 192×384 in heroes/walkers.png, 7 a row; each is cut out once into its own canvas */
const WALKERS=['perry','battaglia','engelman','rimmer','sookie','tempest','bear','boopis','monkey','parker','rago','schmickle','shadow','necro4'],walkCache={};
const walkerSheet=id=>{const i=WALKERS.indexOf(id);if(i<0)return null;if(walkCache[id])return walkCache[id];const a=artImg('heroes/walkers.png');if(!a.ok)return null;
  const cv=document.createElement('canvas');cv.width=192;cv.height=384;cv.getContext('2d').drawImage(a.img,(i%7)*192,Math.floor(i/7)*384,192,384,0,0,192,384);return walkCache[id]=cv;};
const heroSheet=(id,col)=>{if(!ART_MAP.has(id)&&WALKERS.includes(id)){const w=walkerSheet(id);if(w)return w;}if(ART_MAP.has(id)){const m=MAP_SRC[id]||id;return tinted(`heroes/${m}/map/${m}_map_sheet.png`,`team_masks/heroes/${m}/map/${m}_map_sheet.png`,col);}const f=HBY[id]&&HBY[id].fac;if(!f)return null;const a=artImg(`heroes/_banners/${f}_map_sheet.png`);return a.ok?a.img:null;};
function preloadArt(){artImg('heroes/walkers.png');artImg('portraits/heroes/recruits.png');artImg('map/world_extras.png');artImg('towns/extra_buildings.png');for(const g of['meadow','dirt','sand','snow','marsh','cavern','ash','ship_deck'])artImg(`battle/grounds/${g}.png`);for(const n of['split_boulder','basalt_columns','leaning_monolith','stone_arch'])artImg(`terrain/battle/${n}_battle.png`);for(const id0 of ART_MAP){const id=MAP_SRC[id0]||id0;artImg(`heroes/${id}/map/${id}_map_sheet.png`);artImg(`team_masks/heroes/${id}/map/${id}_map_sheet.png`);}
  for(const k of Object.keys(ART_STRIPS))artImg(stripPath(k));
  for(const n of Object.values(ENEMY_ART)){artImg(`enemies/${n}/sheet.png`);artImg(`map/guards/${n}_32.png`);}
  for(const[n]of Object.values(MINE_ART))artImg(`map/mines/${n}.png`);for(const f of Object.keys(FLAG_COLS))artImg(`map/flags/${f}.png`);for(const p of['arrow','bolt','ember','rock','spit','spell_orb'])artImg(`projectiles/${p}.png`);
  for(const[k,n]of Object.entries(ART_UNITS)){const f=unitFac(k);artImg(`units/${f}/${n}/${n}_sheet.png`);artImg(`team_masks/units/${f}/${n}/${n}_sheet.png`);}}
function drawCrown(c,x,y,s){c.save();c.translate(x,y);c.scale(s/10,s/10);c.fillStyle='#f2d382';c.strokeStyle='#5a3a0a';c.lineWidth=1.2;c.beginPath();c.moveTo(-8,4);c.lineTo(-9,-3);c.lineTo(-4,1);c.lineTo(0,-5);c.lineTo(4,1);c.lineTo(9,-3);c.lineTo(8,4);c.closePath();c.fill();c.stroke();c.restore();}
const iconCache={};
function iconURL(kind,key,size=64){
  if(kind==='crest')return ART_BASE+`shields/${key}_96.png`;
  if(kind==='res'&&key==='amber')return ART_BASE+'gems/amber.png';
  if(kind==='res'&&key==='gems')return ART_BASE+'ui/icons/gem.png';
  if(kind==='res'&&key==='moonwater')return ART_BASE+'ui/icons/moonwater.png';
  if(kind==='res'&&UI_RES[key])return ART_BASE+`ui/icons/${UI_RES[key]}.png`;
  if(kind==='stat'&&UI_STAT[key])return ART_BASE+`ui/icons/${UI_STAT[key]}.png`;
  if(kind==='ui')return ART_BASE+`ui/icons/${key}.png`;
  if(kind==='gem')return ART_BASE+`gems/${key}.png`;
  if(kind==='hero'&&HBY[key]&&HBY[key].custom&&HBY[key].port)return HBY[key].port;
  if(kind==='hero'&&RECRUIT_PORT.includes(key))return recruitPortrait(key);
  if(kind==='hero'&&ART_PORTRAITS.has(key))return ART_BASE+`portraits/heroes/${key}_128.png?v=48`;
  if(kind==='unit'&&ENEMY_ART[key])return ART_BASE+`portraits/enemies/${ENEMY_ART[key]}_64.png`;
  if(kind==='unit'&&stripArt(key))return ART_BASE+`portraits/units/${stripArt(key)}_128.png`;
  if(kind==='unit'&&unitArt(key))return ART_BASE+`portraits/units/${unitArt(key)}_64.png`;
  const id=kind+':'+key+':'+size;if(iconCache[id])return iconCache[id];
  const cv=document.createElement('canvas');cv.width=size;cv.height=kind==='crest'?Math.round(size*60/52):size;const c=cv.getContext('2d');
  if(kind==='res')drawRes(c,key,size/2,size/2,size*0.42);
  else if(kind==='unit')drawUnit(c,key,size/2,size/2,size*0.4);
  else if(kind==='hero')drawHeroPortrait(c,size,key);
  else if(kind==='stat')drawStat(c,key,size/2,size/2,size*0.42);
  else if(kind==='crest')drawCrest(c,key,cv.width,cv.height);
  else if(kind==='relic')drawRelic(c,+key,size/2,size/2,size*0.36);
  else if(kind==='travel'){c.save();c.translate(size/2,size/2+size*0.1);c.scale(size/48,size/48);drawTravelIcon(c,key);c.restore();}
  return iconCache[id]=cv.toDataURL();
}
function drawTravelIcon(c,k){
  c.strokeStyle='#15130e';c.lineWidth=1.5;
  if(k==='boat'){c.fillStyle='#7a4e24';c.beginPath();c.moveTo(-16,4);c.lineTo(16,4);c.lineTo(10,12);c.lineTo(-10,12);c.closePath();c.fill();c.stroke();c.beginPath();c.moveTo(0,4);c.lineTo(0,-18);c.stroke();c.fillStyle=teamCol();c.beginPath();c.moveTo(1,-17);c.lineTo(13,0);c.lineTo(1,0);c.closePath();c.fill();c.stroke();}
  else if(k==='horse'||k==='hooves'){c.fillStyle='#8b5e34';c.beginPath();c.ellipse(-2,2,12,6,0,0,7);c.fill();c.stroke();c.beginPath();c.moveTo(8,0);c.lineTo(15,-10);c.lineTo(19,-7);c.lineTo(12,4);c.closePath();c.fill();c.stroke();c.beginPath();for(const x of[-10,-5,4,8]){c.moveTo(x,6);c.lineTo(x,14);}c.stroke();}
  else if(k==='swim'){c.strokeStyle='#7ad0e0';c.lineWidth=2.4;for(const y of[-4,4,12]){c.beginPath();c.moveTo(-16,y);c.quadraticCurveTo(-8,y-6,0,y);c.quadraticCurveTo(8,y+6,16,y);c.stroke();}}
  else{c.fillStyle='#c99a78';c.beginPath();c.arc(0,-12,4,0,7);c.fill();c.strokeStyle='#e8dcb8';c.lineWidth=3;c.beginPath();c.moveTo(0,-8);c.lineTo(0,4);c.moveTo(0,4);c.lineTo(-6,14);c.moveTo(0,4);c.lineTo(6,14);c.moveTo(0,-4);c.lineTo(-7,2);c.moveTo(0,-4);c.lineTo(7,-1);c.stroke();}
}
const costHTML=(cost,res)=>Object.entries(cost).filter(([,v])=>v>0).map(([k,v])=>`<span class="${res&&res[k]<v?'short':''}"><img src="${iconURL('res',k,32)}" alt="${RESNAME[k]}">${fmt(v)}</span>`).join('')||'<span class="muted">Free</span>';
const SC_NAME={atk:'Attack',def:'Defense',pow:'Power',lore:'Lore',morale:'Morale',luck:'Luck',spd:'Speed',hp:'Health',dmg:'Damage',shots:'Shots',move:'Movement'};
function sc(k,v,bonus){return`<span class="sc${bonus<0?' neg':''}" title="${SC_NAME[k]}"><img src="${iconURL('stat',k,32)}" alt="${SC_NAME[k]}">${v}${bonus?`<em>${bonus>0?'+':''}${bonus}</em>`:''}</span>`;}
function unitChips(k){const u=U[k];return`<div class="scs">${sc('atk',u.atk)}${sc('def',u.def)}${sc('dmg',u.min+'–'+u.max)}${sc('hp',u.hp)}${sc('spd',u.spd)}${u.shots?sc('shots',u.shots):''}</div>`;}
/* the player picks a colour on the hero screen (single player); it tints flags, portraits and the team highlight */
/* each banner starts with its own swatch (BANNER_SW), so no two banners default to the same colour */
const BANNER_SW={rangers:0,wizards:1,necro:6,centaurs:10,pirates:9,elves:11,dwarves:7,merfolk:3};
const PLAYER_COLS=[['Teal','#2f8f88'],['Sky blue','#5aa7e0'],['Royal blue','#4a74d6'],['Deep blue','#2a4a8a'],['Violet','#8656b8'],['Rose','#c4508a'],['Crimson','#c0392f'],['Dark red','#7e2420'],['Amber','#c07a2e'],['Gold','#d4a836'],['Leaf green','#5fb070'],['Forest green','#2f6b3a']];
let pickedCol=null,pickedArt=false;
function teamCol(){return S&&S.col&&!S.players?S.col:S&&S.fac?FAC[S.fac].col:'#2f8f88';}
