/* Bundles index.html + lib + assets into one self-contained HTML file.
   three.core is inlined as a data: URL inside three.module so its relative import resolves. */
const fs=require('fs'), path=require('path');
const dir=path.resolve(__dirname,'..');
const b64=f=>fs.readFileSync(path.join(dir,f)).toString('base64');
const MIME={'.glb':'model/gltf-binary','.png':'image/png','.jpg':'image/jpeg','.mp3':'audio/mpeg','.ogg':'audio/ogg','.bin':'application/octet-stream'};

const coreURL='data:text/javascript;base64,'+b64('lib/three.core.min.js');
let mod=fs.readFileSync(path.join(dir,'lib/three.module.min.js'),'utf8');
if(!mod.includes('"./three.core.min.js"')) throw new Error('core import not found in three.module.min.js');
mod=mod.replace(/"\.\/three\.core\.min\.js"/g,JSON.stringify(coreURL));
const modURL='data:text/javascript;base64,'+Buffer.from(mod,'utf8').toString('base64');

let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
html=html.replace(/'\.\/lib\/three\.module\.min\.js'/g,JSON.stringify(modURL));

const assets=fs.readdirSync(path.join(dir,'assets'));
let inlined=0;
for(const a of assets){
  const ref="'./assets/"+a+"'";
  if(!html.includes(ref)) continue;
  const mime=MIME[path.extname(a)]||'application/octet-stream';
  html=html.split(ref).join("'data:"+mime+";base64,"+b64('assets/'+a)+"'");
  inlined++;
}
html=html.replace('<title>IGMC: NIGHT WATCH</title>',
  '<title>IGMC: NIGHT WATCH</title>\n<!-- single-file build: three.js, the IGMC scan, props, Nirmala and the'+
  ' terrain map are all inlined. Works offline, no server needed. -->');
html=html.replace(/'<br\/><br\/>Ise <b>http server<\/b> se kholo:<br\/><code>python3 -m http\.server<\/code>'/,
  "'<br/><br/>Browser WebGL support karta hai ya nahi, check karo.'");

/* the recorded audio pack: every mp3 under assets/audio is inlined as a lookup the
   page consults before it falls back to a relative path. The folder may be
   empty, in which case the game just uses its synthesised audio. */
function walk(rel){
  const abs=path.join(dir,rel);
  if(!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs,{withFileTypes:true}).flatMap(e=>
    e.isDirectory()?walk(path.join(rel,e.name)):[path.join(rel,e.name)]);
}
const clips=walk('assets/audio').filter(f=>f.toLowerCase().endsWith('.mp3'));
if(clips.length){
  const map={};
  for(const f of clips){
    const key=f.replace(/^assets\/audio\//,'').replace(/\.mp3$/i,'');
    map[key]='data:audio/mpeg;base64,'+b64(f);
  }
  html=html.replace('<script type="module">',
    '<script>window.SFX_DATA='+JSON.stringify(map)+';</script>\n<script type="module">');
  console.log('inlined',clips.length,'audio clips');
}

const left=html.match(/\.\/(assets|lib)\/[\w.]+/g);
const allow=new Set(['./assets/audio']);          // built at runtime, may be absent
const bad=(left||[]).filter(x=>!allow.has(x));
if(bad.length) throw new Error('still references '+[...new Set(bad)].join(', '));
const out=path.join(dir,'andhera-standalone.html');
fs.writeFileSync(out,html);
console.log('inlined',inlined,'assets + three.js ->',(fs.statSync(out).size/1e6).toFixed(2)+'MB');
