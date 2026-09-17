/* Builds horror/igmc-netlify.zip — the folder you drag onto Netlify.
   It is the game as separate files (progressive load, cached assets), which
   is a far better deploy than the 17 MB single-file build. */
const fs=require('fs'), path=require('path'), {execFileSync}=require('child_process');
const dir=path.resolve(__dirname,'..');
const out=path.join(dir,'igmc-netlify.zip');
const stage=path.join(require('os').tmpdir(),'igmc-site-'+process.pid);

fs.rmSync(stage,{recursive:true,force:true});
fs.mkdirSync(stage,{recursive:true});
const copy=(rel)=>{
  const src=path.join(dir,rel);
  if(!fs.existsSync(src)) return;
  fs.cpSync(src,path.join(stage,rel),{recursive:true});
};
copy('index.html'); copy('lib'); copy('assets'); copy('_redirects');
/* the notes-to-self do not belong on a CDN */
fs.rmSync(path.join(stage,'assets/audio/README.txt'),{force:true});

fs.rmSync(out,{force:true});
execFileSync('zip',['-qr9',out,'.'],{cwd:stage});
fs.rmSync(stage,{recursive:true,force:true});

const n=execFileSync('unzip',['-l',out]).toString().trim().split('\n').pop().trim().split(/\s+/)[1];
console.log('igmc-netlify.zip ->',(fs.statSync(out).size/1e6).toFixed(2)+' MB,',n,'files');
