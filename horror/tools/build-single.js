const fs=require('fs'), path=require('path');
const dir=path.resolve(__dirname,'..');
const b64=f=>fs.readFileSync(path.join(dir,f)).toString('base64');

// three.core -> data url, then patch three.module to import it from there
const coreURL='data:text/javascript;base64,'+b64('lib/three.core.min.js');
let mod=fs.readFileSync(path.join(dir,'lib/three.module.min.js'),'utf8');
if(!mod.includes('"./three.core.min.js"')) throw new Error('core import not found');
mod=mod.replace(/"\.\/three\.core\.min\.js"/g, JSON.stringify(coreURL));
const modURL='data:text/javascript;base64,'+Buffer.from(mod,'utf8').toString('base64');

let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
const before=html.length;
html=html.replace("import * as THREE from './lib/three.module.min.js';",
                  "import * as THREE from "+JSON.stringify(modURL)+";");
html=html.replace("await Terrain.load('./assets/terrain.png');",
                  "await Terrain.load('data:image/png;base64,"+b64('assets/terrain.png')+"');");
html=html.replace("const geo=await loadGLB('./assets/igmc.glb',",
                  "const geo=await loadGLB('data:model/gltf-binary;base64,"+b64('assets/igmc.glb')+"',");
html=html.replace("<title>ANDHERA &mdash; IGMC Shimla</title>",
                  "<title>ANDHERA &mdash; IGMC Shimla</title>\n<!-- single-file build: three.js + 3D scan + terrain map all inlined. Works offline, no server needed. -->");
// the loader error hint about http servers no longer applies
html=html.replace(/'<br\/><br\/>Ise <b>http server<\/b> se kholo \(file:\/\/ se assets block hote hain\):<br\/>'\+\s*'<code>python3 -m http\.server<\/code>'/,
                  "'<br/><br/>Browser WebGL support karta hai ya nahi, check karo.'");
for(const bad of ["./lib/three","./assets/igmc.glb","./assets/terrain.png"])
  if(html.includes(bad)) throw new Error('still references '+bad);
fs.writeFileSync(path.join(dir,'andhera-standalone.html'),html);
console.log('built', (fs.statSync(path.join(dir,'andhera-standalone.html')).size/1e6).toFixed(2)+'MB', '(from', (before/1024).toFixed(0)+'KB source)');
