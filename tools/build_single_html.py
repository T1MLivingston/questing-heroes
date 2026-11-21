# Builds one self-contained HTML file of the whole game (all art, fonts and music embedded).
# Usage: python3 tools/build_single_html.py [output.html]
import re,os,base64,json,sys
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));OUT=sys.argv[1] if len(sys.argv)>1 else os.path.join(R,'QuestingHeroes_full.html')
MIME={'png':'image/png','jpg':'image/jpeg','webp':'image/webp','mp3':'audio/mpeg','woff2':'font/woff2','json':'application/json'}
html=open(R+'/index.html').read()
css=open(R+'/css/game.css').read()
srcs=re.findall(r'<script src="(js/[^"]+)"></script>',html)
js='\n'.join(open(R+'/'+s).read() for s in srcs)
def b64(p):
  ext=p.rsplit('.',1)[1].lower();return f'data:{MIME[ext]};base64,'+base64.b64encode(open(R+'/'+p,'rb').read()).decode()
# all assets the game can ask for at runtime (paths are built in code, so ship every file)
A={}
for r,ds,fs in os.walk(R+'/assets'):
  for f in fs:
    ext=f.rsplit('.',1)[-1].lower()
    if ext in MIME and ext!='json':
      p=os.path.relpath(os.path.join(r,f),R).replace(os.sep,'/');A[p]=b64(p)
# CSS: inline every url(../assets/...)
css=re.sub(r"url\(['\"]?\.\./(assets/[^)'\"?]+)(\?[^)'\"]*)?['\"]?\)",lambda m:f"url({A.get(m.group(1)) or b64(m.group(1))})",css)
# static markup
body=html.split('<link rel="stylesheet" href="css/game.css">',1)[1]
body=re.sub(r'<script src="js/[^"]+"></script>\s*','',body)
body=re.sub(r'(?<![\w/])(assets/[A-Za-z0-9_./-]+\.(?:png|jpg|webp|mp3))(\?v=\d+)?',lambda m:A.get(m.group(1),m.group(0)),body)
shim=r"""
(function(){
var A=window.QH_ASSETS;var RX=/(^|[^\w\/.])((?:\.\.\/)?assets\/[A-Za-z0-9_.\/-]+\.(?:png|jpg|webp|mp3))(\?v=\d+)?/g;
function fix(s){if(typeof s!=='string'||s.indexOf('assets/')<0)return s;return s.replace(RX,function(m,pre,p){var k=p.replace(/^\.\.\//,'');return A[k]?pre+A[k]:m;});}
window.qhFix=fix;
function hook(proto,prop){var d=Object.getOwnPropertyDescriptor(proto,prop);if(!d||!d.set)return;Object.defineProperty(proto,prop,{configurable:true,enumerable:d.enumerable,get:d.get,set:function(v){d.set.call(this,fix(v));}});}
hook(HTMLImageElement.prototype,'src');hook(HTMLMediaElement.prototype,'src');hook(HTMLSourceElement.prototype,'src');
hook(Element.prototype,'innerHTML');hook(Element.prototype,'outerHTML');hook(CSSStyleDeclaration.prototype,'cssText');
['cursor','backgroundImage','background','borderImage','borderImageSource','content','listStyleImage','maskImage','webkitMaskImage'].forEach(function(p){var d=Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype,p);
  if(d&&d.set)Object.defineProperty(CSSStyleDeclaration.prototype,p,{configurable:true,get:d.get,set:function(v){d.set.call(this,fix(v));}});});
var sp=CSSStyleDeclaration.prototype.setProperty;CSSStyleDeclaration.prototype.setProperty=function(n,v,pr){return sp.call(this,n,fix(v),pr);};
var ia=Element.prototype.insertAdjacentHTML;Element.prototype.insertAdjacentHTML=function(w,h){return ia.call(this,w,fix(h));};
var sa=Element.prototype.setAttribute;Element.prototype.setAttribute=function(n,v){return sa.call(this,n,(n==='src'||n==='style'||n==='href')?fix(v):v);};
var OA=window.Audio;window.Audio=function(u){return u===undefined?new OA():new OA(fix(u));};window.Audio.prototype=OA.prototype;
})();
"""
title='Questing Heroes'
out=f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<!-- Questing Heroes, complete single-file build (v65). Free game by Tim Livingston. All art, fonts and music are embedded below. -->
<style>{css}</style>
<script>window.QH_ASSETS={json.dumps(A,separators=(',',':'))};</script>
<script>{shim}</script>
</head><body>
{body}
<script>{js}</script>
</body></html>"""
open(OUT,'w').write(out)
print('assets',len(A),'size MB',round(len(out)/1e6,1))
