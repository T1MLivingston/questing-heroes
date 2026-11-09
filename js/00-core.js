'use strict';
const $=s=>document.querySelector(s);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
let R=Math.random;
const ri=(a,b)=>a+Math.floor(R()*(b-a+1));
const pick=a=>a[Math.floor(R()*a.length)];
const fmt=n=>Math.round(n).toLocaleString('en-US');
const hash=s=>{let h=2166136261;for(const ch of s){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
