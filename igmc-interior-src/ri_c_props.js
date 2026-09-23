
/* ═════════════ the high-poly prop library ═════════════
   Every hospital prop is rebuilt from primitives at real-world scale:
   tubular frames with bent corners, castors with forks and tyres, draped
   sheets, pleated curtains, perforated steel, gauges, spokes. Each is then
   fitted to the exact bounding box of the prop it replaces, so placement,
   collisions and footprints behave exactly as before.                    */
function riHash(x,y,z){ const h=Math.sin(x*127.1+y*311.7+z*74.7)*43758.5453; return h-Math.floor(h); }
function riNoise(x,y,z){
  const ix=Math.floor(x),iy=Math.floor(y),iz=Math.floor(z), fx=x-ix,fy=y-iy,fz=z-iz;
  const s=t=>t*t*(3-2*t), u=s(fx),v=s(fy),w=s(fz); let r=0;
  for(let a=0;a<2;a++)for(let b=0;b<2;b++)for(let c=0;c<2;c++)
    r+=riHash(ix+a,iy+b,iz+c)*(a?u:1-u)*(b?v:1-v)*(c?w:1-w);
  return r;
}
const riFbm=(x,y,z)=>.55*riNoise(x,y,z)+.3*riNoise(x*2.1+5,y*2.1,z*2.1)+.15*riNoise(x*4.3,y*4.3+3,z*4.3);
/* colour helpers for per-vertex stains */
const riStain=(col,amt,hex)=>{ const t=new THREE.Color(hex); col.lerp(t,Math.max(0,Math.min(1,amt))); };
const riBlood=(x,y,z,col,k=1)=>{ const n=riFbm(x*6,y*6,z*6); const s=Math.max(0,(n-.6)*4)*k; if(s>0) riStain(col,s,0x3a0604); };

const RIP={};           // name -> builder()
const RIPfit={};        // name -> fit mode
let _riCastor={};
function riCastorGB(R){
  const k=R.toFixed(3); if(_riCastor[k]) return _riCastor[k];
  const g=new GB();
  g.add(RIG.torus(R*.78,R*.22,8,22),MX(0,R,0),RK.rubber);
  g.add(RIG.cyl(R*.6,R*.6,R*.62,14),MX(0,R,0,Math.PI/2,0,0),RK.plGrey);
  g.add(RIG.cyl(R*.2,R*.2,R*1.05,8),MX(0,R,0,Math.PI/2,0,0),RK.chrome);
  for(const sd of [-1,1]) g.add(RIG.rbox(R*.95,R*1.35,R*.09,R*.03,1),MX(-R*.12,R*1.32,sd*R*.4),RK.chrome);
  g.add(RIG.rbox(R*1.0,R*.14,R*.95,R*.04,1),MX(-R*.2,R*2.02,0),RK.chrome);
  g.add(RIG.cyl(R*.34,R*.34,R*.14,12),MX(-R*.3,R*2.16,0),RK.plBlack);
  g.add(RIG.cyl(R*.15,R*.15,R*.6,8),MX(-R*.3,R*2.5,0),RK.chrome);
  if(R>.045) g.add(RIG.rbox(R*.55,R*.1,R*.5,R*.03,1),MX(R*.55,R*1.95,0,0,0,-.35),RK.plGrey); // brake tab
  _riCastor[k]=g; return g;
}
/* five-star rolling base used by drip stands and monitors */
function riStarBase(g,R,h,castR){
  const cg=riCastorGB(castR);
  g.add(RIG.lathe([[0,h-.02],[.045,h-.02],[.05,h+.01],[.035,h+.05],[.02,h+.07],[0,h+.07]],20),MX(),RK.chrome);
  for(let i=0;i<5;i++){ const a=i/5*Math.PI*2, c=Math.cos(a), s=Math.sin(a);
    const pts=[new THREE.Vector3(c*.03,h+.02,s*.03),new THREE.Vector3(c*R*.55,h-.005,s*R*.55),new THREE.Vector3(c*R,castR*2.55,s*R)];
    g.add(RIG.sweep(RIG.rpath(pts.map(p=>[p.x,p.y,p.z]),.05,4),t=>.013-.005*t,8,true),MX(),RK.chrome);
    g.merge(cg,MX(c*R,0,s*R,0,-a,0));
  }
}
/* a vertical tube-frame panel (bed head/foot boards) */
function riFramePanel(g,x,z0,z1,y0,y1,frame,panel,tr=.018){
  g.add(RIG.tube([[x,y0,z0],[x,y1,z0],[x,y1,z1],[x,y0,z1]],tr,10,.09,7),MX(),frame);
  g.add(RIG.rod([x,y0+.02,z0],[x,y0+.02,z1],tr*.9,8),MX(),frame);
  const ph=(y1-y0)*.62, pw=(z1-z0)-.1;
  g.add(RIG.rbox(.022,ph,pw,.01,2),MX(x,y0+(y1-y0)*.52,(z0+z1)/2),panel);
  for(const z of [z0+.05,z1-.05]) g.add(RIG.rod([x,y0+.03,z],[x,y1-.04,z],tr*.55,6),MX(),frame);
}

/* ---------------- beds ---------------- */
function riBed(dmg){
  const g=new GB();
  const frame=dmg?RIspec(RK.rust,{c:0x52585b,w:.75}):RIspec(RK.paintCream,{c:0xc3cbcc,w:.34});
  const rail=dmg?RIspec(RK.steelDull,{d:6,w:.7}):RK.chrome;
  const panel=dmg?RIspec(RK.paintBlue,{c:0x6d7f86,w:.8,d:6}):RIspec(RK.paintBlue,{c:0x8aa6b8});
  const cg=riCastorGB(.062);
  [[-.86,-.37],[.86,-.37],[-.86,.37],[.86,.37]].forEach(([x,z],i)=>{ if(dmg&&i===3) return; g.merge(cg,MX(x,0,z,0,dmg?i*.7:0,0)); });
  for(const [x,z] of [[-.846,-.37],[.846,-.37],[-.846,.37],[.846,.37]])
    g.add(RIG.rbox(.046,.30,.046,.008,1),MX(x,.315,z),frame);
  for(const z of [-.40,.40]) g.add(RIG.rbox(1.86,.056,.04,.009,1),MX(0,.475,z),frame);
  for(const x of [-.84,-.28,.30,.84]) g.add(RIG.rbox(.04,.046,.80,.008,1),MX(x,.475,0),frame);
  g.add(RIG.rbox(1.62,.034,.034,.006,1),MX(0,.27,0),frame);
  g.add(RIG.box(1.84,.01,.80),MX(0,.505,0),RIspec(RK.steelDull,{d:7,w:dmg?.8:.35}));
  /* hinge + gas spring under the raised back rest */
  g.add(RIG.rod([-.30,.49,-.3],[-.62,.56,-.3],.012,8),MX(),RK.chrome);
  g.add(RIG.rod([-.30,.49,.3],[-.62,.56,.3],.012,8),MX(),RK.chrome);
  /* mattress: raised head section + flat body */
  const mat=dmg?RIspec(RK.vinylBlue,{c:0x8a816b,w:.9,d:10}):RIspec(RK.vinylBlue,{c:0x42637f});
  const mcf=dmg?((x,y,z,c)=>{ riBlood(x,y,z,c,1.2); const n=riFbm(x*3,y*3,z*3); if(n>.55) riStain(c,(n-.55)*2.5,0x2e2618); }):null;
  const mt=.13, mW=.84, hl=.68, ang=dmg?.12:.22;
  g.add(RIG.rbox(hl,mt,mW,.05,4),MX(-.26-hl/2*Math.cos(ang),.51+mt/2+hl/2*Math.sin(ang),0,0,0,-ang),mat,mcf);
  g.add(RIG.rbox(1.2,mt,mW,.05,4),MX(.35,.51+mt/2+(dmg?.02:0),dmg?.05:0,dmg?.05:0,0,dmg?.03:0),mat,mcf);
  const top=.51+mt;
  if(!dmg){
    /* a hospital sheet, tucked and hanging over both sides */
    g.add(RIG.cloth(1.18,1.30,52,34,(x,y)=>{
      const half=mW/2+.015, a=Math.abs(y);
      const wr=.005*Math.sin(x*31+Math.cos(y*17)*2)+.006*Math.sin(x*9.3+y*4.1);
      if(a<=half) return [0,top+.017+wr-y,y+.004*Math.sin(x*21)];
      const hang=a-half, fold=.016*Math.sin(x*13+1.3)+.009*Math.sin(x*29);
      return [0,top-hang*.96-y,Math.sign(y)*(half+hang*.12+fold*(hang/.21))];
    }),MX(.36,0,0),RK.sheet);
    /* pillow on the raised back */
    const px=-.8, py=top+(-.26-px)*Math.tan(ang)+.045;
    g.add(RIG.rbox(.34,.10,.62,.048,4),MX(px,py,0,0,.03,-ang),RIspec(RK.sheet,{c:0xe1ded6}));
    /* folded check blanket at the foot */
    g.add(RIG.cloth(.34,.84,14,30,(x,y)=>[0,0,.012*Math.sin(y*19)*Math.cos(x*9)],false),MX(.78,top+.066,0,-Math.PI/2,0,0),
      RK.sheet,(x,y,z,c)=>{ const k=(Math.floor((z+5)*14)+Math.floor((x+5)*14))&1; c.setHex(k?0x7b2e27:0x9c8d7a); });
    g.add(RIG.rbox(.34,.06,.84,.02,2),MX(.78,top+.03,0),RIspec(RK.sheet,{c:0x7b3029}));
  } else {
    /* torn, stained sheet sliding off */
    g.add(RIG.cloth(1.0,.92,40,30,(x,y)=>{
      const a=y+.25; const off=a>.42?(a-.42):0;
      return [0,top+.01+.02*Math.sin(x*11+y*7)-off*.9-y,y+off*.15];
    }),MX(.25,0,0),RK.sheetDirty,(x,y,z,c)=>riBlood(x,y,z,c,1.5));
  }
  /* head and foot boards */
  riFramePanel(g,-1.0,-.46,.46,.42,1.12,frame,panel);
  riFramePanel(g,.99,-.46,.46,.42,.87,frame,panel);
  /* side rails: raised one side, lowered the other */
  for(const [z,up] of [[-.475,true],[.475,false]]){
    const y0=up?.62:.50, y1=up?.78:.64;
    const bend=dmg&&up?.12:0;
    const rg=new GB();
    rg.add(RIG.rod([-.55,y1,0],[.35,y1,0],.011,8),MX(),rail);
    rg.add(RIG.rod([-.55,y0,0],[.35,y0,0],.011,8),MX(),rail);
    for(const x of [-.52,-.2,.1,.32]) rg.add(RIG.rod([x,y0-.06,0],[x,y1,0],.008,6),MX(),rail);
    g.merge(rg,MX(0,0,z,0,0,bend));
  }
  /* IV pole sockets, crank, chart clipboard */
  for(const z of [-.44,.44]) g.add(RIG.cyl(.014,.014,.09,10),MX(-.97,.5,z),rail);
  g.add(RIG.rod([.99,.30,0],[1.02,.30,0],.012,8),MX(),RK.chrome);
  g.add(RIG.tube([[1.02,.30,0],[1.02,.30,.07],[1.02,.22,.09]],.007,6,.02,4),MX(),RK.chrome);
  g.add(RIG.cyl(.012,.012,.05,8),MX(1.02,.2,.09),RK.plBlack);
  if(!dmg){
    g.add(RIG.rbox(.012,.30,.22,.004,1),MX(1.01,.66,.12,0,0,.08),RIspec(RK.wood,{c:0x5d3f27}));
    g.add(RIG.box(.004,.26,.2),MX(1.018,.645,.12,0,0,.08),RK.paper);
    g.add(RIG.rbox(.014,.02,.06,.003,1),MX(1.02,.8,.12),RK.chrome);
  }
  return g.geometry();
}
RIP['01_hospital_bed']=()=>riBed(false);
RIP['28_damaged_hospital_bed']=()=>riBed(true);

/* ---------------- wheelchairs ---------------- */
function riWheelGB(broken){
  const g=new GB();
  g.add(RIG.torus(.284,.019,10,56),MX(),broken?RIspec(RK.rubber,{c:0x222222,w:.5}):RK.rubber);
  g.add(RIG.torus(.262,.011,8,48),MX(),broken?RIspec(RK.steelDull,{d:6,w:.7}):RK.chrome);
  g.add(RIG.torus(.245,.0085,6,48),MX(0,0,.045),RK.chrome);
  for(let i=0;i<6;i++){ const a=i/6*Math.PI*2; g.add(RIG.rod([Math.cos(a)*.245,Math.sin(a)*.245,.045],[Math.cos(a)*.258,Math.sin(a)*.258,.008],.004,5),MX(),RK.chrome); }
  g.add(RIG.cyl(.03,.03,.07,14),MX(0,0,0,Math.PI/2,0,0),RK.alu);
  const n=24;
  for(let i=0;i<n;i++){ const a=i/n*Math.PI*2+(i&1?.08:-.08), side=(i&1)?.022:-.022;
    const hub=[Math.cos(a+.3*(i&1?1:-1))*.022,Math.sin(a+.3*(i&1?1:-1))*.022,side];
    g.add(RIG.rod(hub,[Math.cos(a)*.255,Math.sin(a)*.255,0],.0022,4,true),MX(),RK.chrome); }
  return g;
}
function riWheelchair(broken){
  const g=new GB();
  const frame=broken?RIspec(RK.rust,{c:0x6c7174,w:.8}):RK.chrome;
  const sling=broken?RIspec(RK.vinylBlue,{c:0xada896,w:.9,d:10}):RIspec(RK.vinylBlue,{c:0x42637f});
  const wg=riWheelGB(broken);
  for(const sd of [-1,1]){
    if(broken&&sd>0) g.merge(wg,MX(-.14,.30,.36,.22,0,.3));
    else g.merge(wg,MX(-.12,.30,sd*.33,0,sd>0?0:Math.PI,0));
  }
  const cg=riCastorGB(.07);
  g.merge(cg,MX(.36,0,-.24,0,Math.PI,0)); if(!broken) g.merge(cg,MX(.36,0,.24,0,Math.PI,0));
  for(const z of [-.25,.25]){
    g.add(RIG.tube([[-.40,1.0,z],[-.30,.99,z],[-.27,.50,z],[.30,.48,z],[.33,.20,z]],.012,10,.05,6),MX(),frame);
    g.add(RIG.tube([[-.25,.30,z],[.02,.27,z],[.33,.21,z]],.011,8,.05,4),MX(),frame);
    g.add(RIG.rbox(.08,.1,.012,.01,1),MX(-.12,.30,z*1.08),RK.alu);
    g.add(RIG.cyl(.016,.016,.10,12),MX(-.43,1.0,z,0,0,Math.PI/2),RK.rubber);
    g.add(RIG.tube([[.30,.48,z],[.40,.30,z],[.45,.15,z]],.011,8,.04,4),MX(),frame);
    g.add(RIG.rbox(.13,.012,.15,.004,1),MX(.47,.135,z*.62,.05,0,0),RK.plBlack);
    g.add(RIG.tube([[-.26,.62,z*1.04],[-.25,.74,z*1.04],[.18,.74,z*1.04],[.2,.49,z*1.04]],.0105,8,.05,5),MX(),frame);
    g.add(RIG.rbox(.36,.028,.05,.012,2),MX(-.04,.762,z*1.04),RK.vinylBlack);
  }
  g.add(RIG.rod([.02,.47,-.25],[-.02,.24,.25],.01,8),MX(),frame);
  g.add(RIG.rod([.02,.47,.25],[-.02,.24,-.25],.01,8),MX(),frame);
  g.add(RIG.rod([-.12,.30,-.33],[-.12,.30,.33],.009,8),MX(),frame);
  /* sagging seat + back slings */
  g.add(RIG.cloth(.56,.5,24,20,(x,y)=>{ const yn=y/.25; return [0,0,-.035*(1-yn*yn)*(1-Math.pow(x/.28,4))]; }),MX(.02,.49,0,-Math.PI/2,0,0),sling,
    broken?((x,y,z,c)=>riBlood(x,y,z,c,.6)):null);
  g.add(RIG.cloth(.5,.42,20,16,(x,y)=>{ const xn=x/.25; return [0,0,-.03*(1-xn*xn)]; }),MX(-.275,.74,0,0,Math.PI/2,0),sling);
  return g.geometry();
}
RIP['02_wheelchair']=()=>riWheelchair(false);
RIP['27_broken_wheelchair']=()=>riWheelchair(true);

/* ---------------- stretcher trolley ---------------- */
RIP['03_stretcher_trolley']=()=>{
  const g=new GB();
  const cg=riCastorGB(.065);
  for(const [x,z] of [[-.86,-.26],[.86,-.26],[-.86,.26],[.86,.26]]) g.merge(cg,MX(x,0,z,0,x<0?0:Math.PI,0));
  for(const z of [-.26,.26]) g.add(RIG.rbox(1.84,.05,.045,.01,1),MX(0,.205,z),RK.paintWhite);
  for(const x of [-.86,.86]) g.add(RIG.rbox(.05,.05,.56,.01,1),MX(x,.205,0),RK.paintWhite);
  g.add(RIG.box(1.66,.008,.5),MX(0,.235,0),RIspec(RK.steelDull,{d:7}));
  for(const x of [-.55,.55]){
    const prof=[[0,.23],[.062,.23]]; for(let k=0;k<=14;k++){ const y=.25+k*.022; prof.push([.056+(k&1?.008:0),y]); }
    prof.push([.05,.57],[0,.57]);
    g.add(RIG.lathe(prof,22),MX(x,0,0),RK.plBlack);
    g.add(RIG.cyl(.032,.032,.1,16),MX(x,.61,0),RK.chrome);
  }
  for(const z of [-.29,.29]) g.add(RIG.rbox(1.9,.045,.04,.01,1),MX(0,.66,z),RK.paintWhite);
  for(const x of [-.93,-.3,.3,.93]) g.add(RIG.rbox(.04,.04,.58,.01,1),MX(x,.66,0),RK.paintWhite);
  g.add(RIG.box(1.86,.008,.56),MX(0,.685,0),RIspec(RK.steelDull,{d:7}));
  g.add(RIG.rbox(1.88,.075,.58,.034,4),MX(0,.727,0),RIspec(RK.vinylBlue,{c:0x42637f}));
  for(const z of [-.33,.33]){
    g.add(RIG.rod([-.6,.70,z],[.6,.70,z],.01,8),MX(),RK.chrome);
    g.add(RIG.rod([-.6,.62,z],[.6,.62,z],.01,8),MX(),RK.chrome);
    for(const x of [-.58,0,.58]) g.add(RIG.rod([x,.6,z],[x,.72,z],.008,6),MX(),RK.chrome);
  }
  for(const sx of [-1,1]){
    g.add(RIG.tube([[sx*.95,.66,-.22],[sx*1.0,.85,-.22],[sx*1.0,.85,.22],[sx*.95,.66,.22]],.013,10,.05,6),MX(),RK.chrome);
    g.add(RIG.cyl(.018,.018,.26,12),MX(sx*1.0,.85,0,Math.PI/2,0,0),RK.rubber);
    for(const z of [-.29,.29]) g.add(RIG.cyl(.04,.04,.03,16),MX(sx*.95,.66,z,0,0,Math.PI/2),RK.rubber);
  }
  g.add(RIG.rod([-.9,.7,.3],[.5,.7,.3],.009,8),MX(),RK.chrome);
  return g.geometry();
};

/* ---------------- IV drip stand ---------------- */
RIP['04_iv_stand']=()=>{
  const g=new GB();
  riStarBase(g,.235,.09,.024);
  g.add(RIG.cyl(.0125,.0125,1.16,14),MX(0,.73,0),RK.steelDull);
  g.add(RIG.cyl(.0095,.0095,.62,12),MX(0,1.49,0),RK.chrome);
  const kn=[[0,1.28]]; for(let k=0;k<=8;k++) kn.push([.024+(k&1?.004:0),1.29+k*.008]); kn.push([0,1.37]);
  g.add(RIG.lathe(kn,18),MX(),RK.plBlack);
  g.add(RIG.rod([.024,1.33,0],[.06,1.33,0],.004,6),MX(),RK.chrome);
  g.add(RIG.sphere(.013,12,8),MX(0,1.805,0),RK.chrome);
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+.4;
    const h=RIG.tube([[0,1.78,0],[.07,1.78,0],[.105,1.805,0],[.10,1.835,0],[.082,1.84,0]],.0045,6,.02,4);
    g.add(h,MX(0,0,0,0,-a,0),RK.chrome); }
  /* saline bag on one hook */
  const bx=Math.cos(.4)*.1, bz=-Math.sin(.4)*.1;
  g.add(RIG.rbox(.105,.19,.034,.016,3),MX(bx,1.66,bz,0,-.4,0),RIspec(RK.ceramic,{c:0xcfdcde,r:.16,w:.1}));
  g.add(RIG.box(.07,.09,.036),MX(bx,1.68,bz,0,-.4,0),RIspec(RK.paper,{c:0xe7e2d3}));
  g.add(RIG.rod([bx,1.565,bz],[bx,1.53,bz],.006,8),MX(),RK.plWhite);
  g.add(RIG.cyl(.009,.009,.06,10),MX(bx,1.50,bz),RIspec(RK.ceramic,{c:0xd8e2e3}));
  const tp=RIG.curve([[bx,1.47,bz],[bx+.01,1.2,bz+.02],[bx-.02,.9,bz+.09],[.06,.75,.12],[.02,.92,.07],[.013,1.1,.02]],60);
  g.add(RIG.sweep(tp,.0024,5,true),MX(),RIspec(RK.ceramic,{c:0xd0dadb,r:.2}));
  g.add(RIG.rbox(.014,.04,.012,.003,1),MX(bx-.005,1.18,bz+.025),RK.plWhite);
  return g.geometry();
};

/* ---------------- patient monitor on a roll stand ---------------- */
RIP['05_patient_monitor']=()=>{
  const g=new GB();
  riStarBase(g,.19,.08,.024);
  g.add(RIG.cyl(.016,.016,.93,14),MX(0,.55,0),RK.chrome);
  g.add(RIG.rbox(.1,.03,.08,.008,1),MX(0,.62,.03),RK.plGrey);
  g.add(RIG.rbox(.12,.06,.08,.01,1),MX(0,1.0,0),RK.plGrey);
  const mon=new GB();
  mon.add(RIG.rbox(.44,.32,.17,.03,3),MX(0,0,-.01),RIspec(RK.plBeige,{c:0xd9d4c5}));
  mon.add(RIG.rbox(.40,.27,.02,.01,2),MX(0,0,.078),RK.plBlack);
  mon.add(RIG.box(.30,.2,.006),MX(-.035,.005,.089),RK.screen);
  const trace=(y,amp,col,spk)=>{ const pts=[]; for(let i=0;i<=60;i++){ const t=i/60, x=-.18+.26*t;
      let v=Math.sin(t*28)*.12; const ph=(t*5)%1; if(spk&&ph>.44&&ph<.5) v=ph<.47?1:-.6; pts.push([x,y+v*amp,.093]); }
    mon.add(RIG.sweep(pts.map(p=>new THREE.Vector3(...p)),.0013,4,false),MX(),col); };
  trace(.055,.022,RIspec(RK.ledG,{w:.9}),true); trace(-.005,.012,RIspec(RK.ledA,{w:.8}),false); trace(-.055,.01,RIspec(RK.ledG,{c:0x3fd0ff,w:.7}),false);
  for(let i=0;i<3;i++) mon.add(RIG.box(.04,.022,.004),MX(.10,.06-i*.05,.091),RIspec(RK.ledG,{w:1.1,c:i===1?0xffc21a:0x2bff6a}));
  mon.add(RIG.cyl(.018,.018,.02,16),MX(.175,-.08,.09,Math.PI/2,0,0),RK.plGrey);
  for(let i=0;i<4;i++) mon.add(RIG.rbox(.022,.012,.01,.003,1),MX(.175,.09-i*.03,.088),RK.plGrey);
  mon.add(RIG.box(.008,.008,.004),MX(.175,.12,.091),RK.ledG);
  mon.add(RIG.tube([[-.15,.16,-.03],[-.12,.21,-.03],[.12,.21,-.03],[.15,.16,-.03]],.009,8,.03,5),MX(),RK.plGrey);
  g.merge(mon,MX(0,1.19,.02,-.12,0,0));
  const c1=RIG.curve([[-.2,1.14,-.02],[-.23,.95,.05],[-.12,.7,.12],[.05,.62,.12],[.02,.8,.02]],50);
  g.add(RIG.sweep(c1,.004,6,true),MX(),RK.plGrey);
  const c2=RIG.curve([[-.21,1.12,.02],[-.19,.9,-.08],[-.06,.68,-.14],[.09,.66,-.08],[.02,.74,.0]],50);
  g.add(RIG.sweep(c2,.0035,6,true),MX(),RIspec(RK.plBlack,{c:0x283a52}));
  return g.geometry();
};

/* ---------------- oxygen cylinder on its hand trolley ---------------- */
RIP['06_oxygen_cylinder']=()=>{
  const g=new GB();
  const body=[[0,.05],[.085,.052],[.11,.07],[.115,.1],[.115,1.02],[.113,1.06],[.1,1.11],[.075,1.15],[.045,1.175],[.034,1.19],[.034,1.21],[0,1.21]];
  g.add(RIG.lathe(body,36),MX(0,0,0),RIspec(RK.paintDark,{c:0x16181a,w:.18,r:.42}),(x,y,z,c)=>{
    if(y>1.02) c.setHex(0xdedbd2); if(y>.35&&y<.52&&z>0) c.setHex(0xcfc2a0); if(y>.36&&y<.51&&z>0&&Math.abs(y-.44)<.02) c.setHex(0x2a2a2a); });
  g.add(RIG.lathe([[.09,.0],[.112,.0],[.112,.06],[.1,.06]],32),MX(),RK.paintDark);
  const v=[[0,1.2],[.02,1.2],[.022,1.24],[.028,1.25],[.028,1.29],[.018,1.3],[0,1.3]];
  g.add(RIG.lathe(v,18),MX(),RK.brass);
  g.add(RIG.torus(.032,.0045,6,24),MX(0,1.315,0,Math.PI/2,0,0),RK.plBlack);
  for(let i=0;i<4;i++){ const a=i*Math.PI/2; g.add(RIG.rod([0,1.315,0],[Math.cos(a)*.032,1.315,Math.sin(a)*.032],.003,5),MX(),RK.plBlack); }
  g.add(RIG.rod([0,1.265,0],[.07,1.265,0],.009,10),MX(),RK.brass);
  g.add(RIG.cyl(.022,.022,.07,16),MX(.09,1.3,0),RK.chrome);
  for(const [x,y,zz] of [[.09,1.36,.03],[.14,1.3,.03]]){
    g.add(RIG.cyl(.028,.028,.02,20),MX(x,y,zz,Math.PI/2,0,0),RK.chrome);
    g.add(RIG.disk(.024,20),MX(x,y,zz+.0105),RIspec(RK.paper,{c:0xf2efe6}));
    g.add(RIG.box(.002,.02,.001),MX(x+.005,y+.004,zz+.011,0,0,-.6),RK.plBlack);
  }
  g.add(RIG.cyl(.012,.012,.12,12),MX(.16,1.2,-.01),RIspec(RK.ceramic,{c:0xdce7ea}));
  g.add(RIG.sphere(.006,8,6),MX(.16,1.2,-.01),RIspec(RK.paintWhite,{c:0x2a77ff}));
  g.add(RIG.lathe([[0,1.0],[.03,1.0],[.035,1.02],[.035,1.1],[.018,1.13],[0,1.13]],18),MX(.16,0,-.01),RIspec(RK.ceramic,{c:0xc9d8dd,r:.18}));
  const tr=new GB();
  tr.add(RIG.box(.3,.012,.26),MX(0,.015,0),RK.paintDark);
  tr.add(RIG.tube([[-.13,.02,-.13],[-.15,.55,-.15],[-.15,1.0,-.15],[.15,1.0,-.15],[.15,.55,-.15],[.13,.02,-.13]],.011,8,.06,5),MX(),RK.paintGrey);
  tr.add(RIG.torus(.125,.009,6,32),MX(0,.52,0,Math.PI/2,0,0),RK.paintGrey);
  for(const sx of [-1,1]){ tr.add(RIG.torus(.052,.018,8,22),MX(sx*.16,.07,-.13,0,Math.PI/2,0),RK.rubber);
    tr.add(RIG.cyl(.03,.03,.03,12),MX(sx*.16,.07,-.13,0,0,Math.PI/2),RK.plGrey); }
  tr.add(RIG.rod([-.18,.07,-.13],[.18,.07,-.13],.008,8),MX(),RK.chrome);
  g.merge(tr,MX());
  return g.geometry();
};

/* ---------------- medicine cabinet with one door's glass gone ---------------- */
RIP['07_medicine_cabinet']=()=>{
  const g=new GB();
  const pc=RIspec(RK.paintWhite,{c:0xd7dad6,w:.42});
  for(const sx of [-1,1]) g.add(RIG.rbox(.022,1.84,.41,.006,1),MX(sx*.429,.97,0),pc);
  g.add(RIG.rbox(.88,.035,.42,.008,1),MX(0,1.882,0),pc);
  g.add(RIG.rbox(.84,.075,.38,.004,1),MX(0,.038,-.005),RIspec(RK.paintDark,{c:0x3b3f40}));
  g.add(RIG.box(.84,1.8,.01),MX(0,.97,-.2),pc);
  for(const y of [.46,.86,1.22,1.56]) g.add(RIG.rbox(.84,.018,.37,.004,1),MX(0,y,-.01),pc);
  g.add(RIG.box(.84,.018,.37),MX(0,.085,-.01),pc);
  for(const sx of [-1,1]){
    g.add(RIG.rbox(.412,.36,.02,.006,1),MX(sx*.209,.265,.197),pc);
    g.add(RIG.rbox(.012,.08,.018,.005,1),MX(sx*.03,.3,.215),RK.chrome);
  }
  g.add(RIG.cyl(.006,.006,.01,8),MX(.0,.36,.21,Math.PI/2,0,0),RK.brass);
  /* upper glazed doors: left glass whole, right shattered */
  for(const sx of [-1,1]){
    const cx=sx*.209, w=.41, h=1.42, y=1.17, z=.2;
    const fr=RIspec(pc,{c:0xcfd2ce});
    g.add(RIG.rbox(w,.035,.022,.006,1),MX(cx,y+h/2-.018,z),fr);
    g.add(RIG.rbox(w,.035,.022,.006,1),MX(cx,y-h/2+.018,z),fr);
    g.add(RIG.rbox(.035,h,.022,.006,1),MX(cx-sx*(w/2-.018),y,z),fr);
    g.add(RIG.rbox(.035,h,.022,.006,1),MX(cx+sx*(w/2-.018),y,z),fr);
    g.add(RIG.rbox(.012,.1,.02,.004,1),MX(cx-sx*(w/2-.05),y-.1,z+.02),RK.chrome);
    if(sx<0) g.add(RIG.box(w-.06,h-.06,.004),MX(cx,y,z),RIspec(RK.glass,{c:0x2a3436,r:.05}));
    else for(let i=0;i<5;i++){ const a=i*1.3; g.add(RIG.box(.07+.05*riHash(i,1,2),.05+.08*riHash(i,3,4),.004),
        MX(cx+Math.cos(a)*.14,y+(i<2?h/2-.07:-h/2+.07)+Math.sin(a)*.02,z,0,0,a),RIspec(RK.glass,{c:0x2a3436})); }
  }
  /* what is still on the shelves */
  const shelves=[.47,.87,1.23,1.57];
  let k=0;
  for(const sy of shelves){
    for(let i=0;i<9;i++){ k++;
      const x=-.36+i*.09+(riHash(k,2,3)-.5)*.02, z=-.05+(riHash(k,5,1)-.5)*.1;
      if(riHash(k,7,7)<.22) continue;
      if(riHash(k,9,1)<.6){
        const h=.1+.08*riHash(k,1,1), r=.024+.012*riHash(k,3,3);
        const amber=riHash(k,4,4)<.55;
        g.add(RIG.lathe([[0,0],[r,0],[r,h*.7],[r*.55,h*.82],[r*.45,h*.9],[r*.45,h],[0,h]],14),MX(x,sy+.009,z),
          amber?RIspec(RK.ceramic,{c:0x5a2c0c,r:.08}):RIspec(RK.plWhite,{c:0xe4e2dc}));
        g.add(RIG.cyl(r*.5,r*.5,.018,12),MX(x,sy+.009+h+.008,z),amber?RK.plWhite:RIspec(RK.plBlack,{c:0x1e3a8a}));
        if(riHash(k,6,6)<.5) g.add(RIG.cyl(r*1.01,r*1.01,h*.35,14,true),MX(x,sy+.009+h*.35,z),RIspec(RK.paper,{c:0xe9e3cf}));
      } else {
        const bw=.07,bh=.06+.05*riHash(k,8,8),bd=.1;
        const cols=[0xdad6cb,0x3b6da8,0xc9312b,0xe8e3d4,0x4f8a55];
        g.add(RIG.rbox(bw,bh,bd,.003,1),MX(x,sy+.009+bh/2,z,0,(riHash(k,1,9)-.5)*.3,0),RIspec(RK.paper,{c:cols[k%5]}));
      }
    }
  }
  g.add(RIG.box(.16,.05,.004),MX(0,1.75,.212),RIspec(RK.plWhite,{c:0xf0ede3}));
  return g.geometry();
};

/* ---------------- steel almirah / locker ---------------- */
RIP['08_hiding_locker']=()=>{
  const g=new GB();
  const pc=RIspec(RK.paintGreen,{c:0x7d8c80,w:.5});
  g.add(RIG.rbox(.72,1.9,.5,.018,3),MX(0,1.0,-.01),pc);
  g.add(RIG.rbox(.7,.06,.48,.006,1),MX(0,.03,-.01),RIspec(RK.paintDark,{c:0x2b302d}));
  for(const sx of [-1,1]){
    const cx=sx*.1775;
    g.add(RIG.rbox(.35,1.84,.02,.006,2),MX(cx,1.0,.244),pc);
    for(const yb of [.22,1.72]) for(let r=0;r<6;r++) g.add(RIG.rbox(.14,.009,.008,.003,1),MX(cx,yb+r*.022,.256),RIspec(pc,{c:0x6f7d72}));
    for(const y of [.35,1.0,1.65]) g.add(RIG.cyl(.008,.008,.08,8),MX(sx*.357,y,.24),RK.steelDull);
  }
  g.add(RIG.box(.004,1.84,.022),MX(0,1.0,.244),RK.plBlack);
  g.add(RIG.rbox(.03,.16,.03,.008,2),MX(.03,1.02,.27),RK.chrome);
  g.add(RIG.cyl(.012,.012,.01,12),MX(.03,1.12,.265,Math.PI/2,0,0),RK.brass);
  g.add(RIG.box(.1,.04,.004),MX(-.17,1.55,.256),RIspec(RK.plWhite,{c:0xe8e1c9}));
  g.add(RIG.box(.16,.1,.004),MX(.17,1.42,.256),RIspec(RK.paper,{c:0xe4dcc3,w:.4}));
  return g.geometry();
};

/* ---------------- reception / nurse station counter ---------------- */
RIP['09_nurse_station_desk']=()=>{
  const g=new GB();
  const lam=RIspec(RK.lamLight,{c:0x9c7b58});
  g.add(RIG.rbox(2.0,1.07,.045,.008,2),MX(0,.56,.335),lam);
  g.add(RIG.box(2.0,.12,.006),MX(0,.07,.36),RK.steelDull);
  for(const y of [.4,.78]) g.add(RIG.rbox(2.0,.02,.012,.004,1),MX(0,y,.362),RK.alu);
  g.add(RIG.rbox(.5,.12,.01,.004,1),MX(0,.92,.362),RIspec(RK.plWhite,{c:0xe9e5d8}));
  g.add(RIG.rbox(.42,.022,.006,.002,1),MX(0,.935,.369),RIspec(RK.paintRed,{c:0x8c0d0d}));
  g.add(RIG.rbox(.36,.012,.006,.002,1),MX(0,.9,.369),RK.plBlack);
  g.add(RIG.rbox(2.02,.035,.3,.01,2),MX(0,1.152,.22),RIspec(RK.plWhite,{c:0x2c7d77,r:.32,d:0}));
  for(const x of [-.9,0,.9]) g.add(RIG.rbox(.03,.34,.03,.006,1),MX(x,.95,.12),RK.alu);
  g.add(RIG.rbox(1.96,.03,.64,.008,2),MX(0,.76,-.02),lam);
  for(const sx of [-1,1]) g.add(RIG.rbox(.035,1.1,.7,.008,1),MX(sx*.982,.56,0),lam);
  const px=.66;
  g.add(RIG.rbox(.42,.72,.58,.006,1),MX(px,.38,-.03),lam);
  for(let i=0;i<3;i++){ g.add(RIG.rbox(.4,.21,.02,.004,1),MX(px,.62-i*.23,-.325),RIspec(lam,{c:0x8f6f4f}));
    g.add(RIG.rbox(.12,.014,.02,.005,1),MX(px,.66-i*.23,-.345),RK.alu); }
  /* old CRT, keyboard, register, phone, bell, files */
  const crt=new GB();
  crt.add(RIG.rbox(.40,.34,.08,.02,3),MX(0,.17,0),RIspec(RK.plBeige,{c:0xcfc6ab,w:.35}));
  crt.add(RIG.rbox(.31,.26,.30,.06,3),MX(0,.18,-.17),RIspec(RK.plBeige,{c:0xc6bd9f,w:.35}));
  crt.add(RIG.sphere(.5,24,16),MX(0,.175,-.415,0,0,0,.30,.25,.04),RK.screen);
  crt.add(RIG.rbox(.2,.03,.18,.01,2),MX(0,.015,-.12),RIspec(RK.plBeige,{c:0xc6bd9f}));
  crt.add(RIG.box(.006,.006,.004),MX(.15,.03,.042),RK.ledA);
  g.merge(crt,MX(-.45,.775,-.08,0,Math.PI,0));
  const kb=new GB(); kb.add(RIG.rbox(.44,.025,.15,.008,2),MX(0,.0125,0),RIspec(RK.plBeige,{c:0xcfc6ab}));
  for(let r=0;r<5;r++)for(let c=0;c<15;c++) kb.add(RIG.box(.022,.012,.02),MX(-.2+c*.0285,.03,-.05+r*.026),RIspec(RK.plBeige,{c:0xe0d9c4}));
  g.merge(kb,MX(-.45,.775,-.25,0,Math.PI+.05,0));
  g.add(RIG.rbox(.42,.03,.3,.006,1),MX(.1,.79,-.15,0,.2,0),RIspec(RK.paper,{c:0xe8e0c8}));
  g.add(RIG.rbox(.42,.01,.3,.004,1),MX(.1,.807,-.15,0,.2,.02),RIspec(RK.wood,{c:0x5a1f1a,d:9}));
  g.add(RIG.rbox(.2,.06,.22,.02,3),MX(.55,.805,-.2),RK.plBlack);
  g.add(RIG.tube([[.47,.85,-.24],[.5,.87,-.2],[.6,.87,-.2],[.63,.85,-.24]],.016,8,.03,5),MX(),RK.plBlack);
  g.add(RIG.lathe([[0,0],[.04,0],[.04,.008],[.035,.03],[.02,.045],[.006,.05],[0,.05]],20),MX(-.1,1.17,.25),RK.chrome);
  for(let i=0;i<4;i++) g.add(RIG.rbox(.24,.02,.32,.004,1),MX(.8,.785+i*.021,.05,0,(riHash(i,3,1)-.5)*.2,0),i%2?RK.manila:RIspec(RK.manila,{c:0xb38a55}));
  g.add(RIG.cyl(.03,.035,.1,14,true),MX(-.8,.825,-.2),RK.plGrey);
  for(let i=0;i<4;i++) g.add(RIG.rod([-.8+(i-1.5)*.01,.83,-.2],[-.8+(i-1.5)*.02,.92,-.2+(i-1.5)*.01],.003,5),MX(),i%2?RK.plBlack:RIspec(RK.plBlack,{c:0x1f3d8f}));
  return g.geometry();
};

/* ---------------- 3-seat perforated steel waiting chairs ---------------- */
function riSeatSheet(w,prof,sw,col){
  /* bend a sheet along a (z,y) profile, width along x */
  const n=prof.length, P=[],N=[],I=[];
  const sx=RIseg(sw,2);
  for(let j=0;j<n;j++){
    const a=prof[Math.max(0,j-1)], b=prof[Math.min(n-1,j+1)];
    let tz=b[0]-a[0], ty=b[1]-a[1]; const l=Math.hypot(tz,ty)||1; tz/=l; ty/=l;
    for(let i=0;i<=sx;i++){ const x=-w/2+w*i/sx; P.push(x,prof[j][1],prof[j][0]); N.push(0,tz,-ty); }
  }
  for(let j=0;j<n-1;j++)for(let i=0;i<sx;i++){ const a=j*(sx+1)+i,b=a+1,c=a+sx+2,d=a+sx+1; I.push(a,d,c,a,c,b); }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
  g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3)); g.setIndex(I);
  return RIG.twoSided(g);
}
function riBench3(len,col){
  const g=new GB();
  const pc=RIspec(RK.paintBlue,{c:col||0x4f7fa0,d:7,w:.3,m:.3,r:.4});
  const steel=RK.steelDull;
  g.add(RIG.rbox(len,.06,.06,.01,2),MX(0,.40,-.03),steel);
  for(const sx of [-1,1]){ const x=sx*(len/2-.1);
    g.add(RIG.rbox(.05,.38,.05,.008,1),MX(x,.2,-.03),steel);
    g.add(RIG.rbox(.06,.03,.5,.01,2),MX(x,.015,0),steel);
    for(const z of [-.22,.22]) g.add(RIG.cyl(.022,.025,.012,12),MX(x,.006,z),RK.rubber);
  }
  const prof=[]; const add=(z,y)=>prof.push([z,y]);
  add(.235,.415); add(.245,.44); add(.235,.455); for(let i=0;i<=8;i++) add(.2-i*.045,.46-.012*Math.sin(i/8*Math.PI));
  add(-.2,.47); add(-.225,.5); for(let i=0;i<=9;i++) add(-.235-i*.008,.53+i*.055);
  const n=Math.round(len/.55);
  for(let s=0;s<n;s++){ const cx=-len/2+len/n*(s+.5);
    g.add(riSeatSheet(.49,prof,20),MX(cx,0,0),pc);
    g.add(RIG.rbox(.12,.04,.3,.01,1),MX(cx,.43,-.03),steel);
    g.add(RIG.rbox(.05,.4,.03,.008,1),MX(cx,.72,-.25,-.08,0,0),steel);
  }
  for(let s=0;s<=n;s++){ const x=-len/2+len/n*s;
    g.add(RIG.tube([[x,.43,-.03],[x,.62,-.02],[x,.64,.18],[x,.47,.2]],.011,8,.04,4),MX(),steel);
    g.add(RIG.rbox(.045,.025,.26,.01,2),MX(x,.645,.08),RK.plBlack);
  }
  return g.geometry();
}
RIP['10_waiting_bench']=()=>riBench3(1.64,0x2f7f7a);

/* ---------------- baby cot / bassinet trolley ---------------- */
RIP['11_baby_cradle']=()=>{
  const g=new GB();
  const pc=RIspec(RK.paintWhite,{c:0xdcdad2,w:.4});
  const cg=riCastorGB(.035);
  for(const [x,z] of [[-.33,-.15],[.33,-.15],[-.33,.15],[.33,.15]]) g.merge(cg,MX(x,0,z));
  for(const z of [-.15,.15]) g.add(RIG.rbox(.7,.03,.03,.008,1),MX(0,.11,z),pc);
  for(const x of [-.33,.33]) g.add(RIG.rbox(.03,.03,.33,.008,1),MX(x,.11,0),pc);
  g.add(RIG.box(.64,.01,.28),MX(0,.3,0),RIspec(RK.steelDull,{d:7}));
  for(const [x,z] of [[-.33,-.15],[.33,-.15],[-.33,.15],[.33,.15]]) g.add(RIG.rod([x,.1,z],[x,.76,z],.013,10),MX(),pc);
  g.add(RIG.rbox(.74,.02,.38,.01,2),MX(0,.77,0),pc);
  g.add(RIG.rbox(.02,.2,.38,.008,1),MX(-.36,.87,0),pc); g.add(RIG.rbox(.02,.2,.38,.008,1),MX(.36,.87,0),pc);
  for(const z of [-.18,.18]){
    g.add(RIG.rod([-.36,.965,z],[.36,.965,z],.011,8),MX(),pc);
    for(let i=0;i<11;i++){ const x=-.3+i*.06; g.add(RIG.rod([x,.78,z],[x,.96,z],.0055,6),MX(),pc); }
  }
  g.add(RIG.rbox(.68,.05,.33,.02,3),MX(0,.805,0),RIspec(RK.vinylBlue,{c:0x7aa1b8}));
  g.add(RIG.cloth(.5,.3,26,18,(x,y)=>[0,0,.02+.018*Math.sin(x*18+y*9)*Math.cos(y*14)+.012*riNoise(x*9,y*9,1)],true),MX(.02,.838,0,-Math.PI/2,0,.05),
    RIspec(RK.sheet,{c:0xb8bfb3}),(x,y,z,c)=>{ if(((Math.floor((x+5)*20)+Math.floor((z+5)*20))&1)===0) c.multiplyScalar(.9); });
  g.add(RIG.tube([[-.36,.96,-.12],[-.34,1.08,-.06],[-.3,1.11,0],[-.34,1.08,.06],[-.36,.96,.12]],.006,6,.05,5),MX(),pc);
  g.add(RIG.box(.1,.06,.004),MX(.2,.9,.193),RIspec(RK.paper,{c:0xf1c6d4}));
  return g.geometry();
};

/* ---------------- mortuary cold chamber ---------------- */
RIP['12_morgue_freezer_unit']=()=>{
  const g=new GB();
  const ss=RIspec(RK.steel,{c:0xa3a8ab,w:.3});
  g.add(RIG.rbox(1.76,1.9,.9,.02,2),MX(0,1.08,-.02),ss);
  g.add(RIG.rbox(1.72,.13,.86,.01,1),MX(0,.065,-.02),RK.plBlack);
  for(let r=0;r<3;r++)for(let c=0;c<2;c++){
    const x=-.42+c*.84, y=.46+r*.58;
    g.add(RIG.box(.79,.55,.01),MX(x,y,.43),RK.rubber);
    g.add(RIG.rbox(.77,.53,.05,.02,2),MX(x,y,.45),RIspec(ss,{c:0xb0b5b8}));
    g.add(RIG.rbox(.05,.2,.05,.012,2),MX(x+.3,y,.49),RK.chrome);
    g.add(RIG.rbox(.14,.035,.035,.01,2),MX(x+.24,y+.07,.51),RK.chrome);
    for(const hy of [-.18,.18]) g.add(RIG.cyl(.012,.012,.06,10),MX(x-.39,y+hy,.46),RK.chrome);
    g.add(RIG.box(.1,.06,.004),MX(x-.22,y+.18,.477),RIspec(RK.paper,{c:0xece6d2}));
  }
  g.add(RIG.rbox(1.6,.2,.03,.008,1),MX(0,1.94,.45),RIspec(ss,{c:0x8f9496}));
  for(let i=0;i<22;i++) g.add(RIG.box(.012,.14,.02),MX(-.5+i*.045,1.94,.468),RK.plBlack);
  g.add(RIG.rbox(.22,.1,.02,.006,1),MX(.6,1.94,.47),RK.plBlack);
  for(let i=0;i<3;i++) g.add(RIG.box(.035,.05,.004),MX(.54+i*.045,1.94,.482),RK.ledR);
  return g.geometry();
};
RIPfit['12_morgue_freezer_unit']='exact';

/* ---------------- ceiling-mounted operating light ---------------- */
function riOTHead(R){
  const g=new GB();
  g.add(RIG.lathe([[R,0],[R*1.02,.02],[R*.95,.06],[R*.7,.11],[R*.35,.14],[0,.15]],40),MX(),RIspec(RK.plWhite,{c:0xe6e4dd}));
  g.add(RIG.torus(R*1.01,.012,8,48),MX(0,.005,0,Math.PI/2,0,0),RK.plGrey);
  g.add(RIG.disk(R*.98,40),MX(0,.004,0,Math.PI/2,0,0),RIspec(RK.alu,{c:0xcfd4d6,r:.2}));
  const cells=[[0,0]]; for(let ring=1;ring<=2;ring++){ const n=ring*6; for(let i=0;i<n;i++){ const a=i/n*Math.PI*2; cells.push([Math.cos(a)*ring*R*.32,Math.sin(a)*ring*R*.32]); } }
  for(const [x,z] of cells) g.add(RIG.lathe([[R*.13,0],[R*.12,.014],[R*.07,.03],[0,.035]],16),MX(x,-.001,z,Math.PI,0,0),RIspec(RK.chrome,{c:0xe8ecee,r:.08}));
  g.add(RIG.cyl(.018,.022,.12,14),MX(0,-.06,0),RK.plGrey);
  return g;
}
RIP['13_operation_theatre_light']=()=>{
  const g=new GB();
  g.add(RIG.cyl(.13,.13,.04,28),MX(0,1.18,0),RK.paintWhite);
  g.add(RIG.cyl(.028,.028,.44,14),MX(0,.94,0),RK.paintWhite);
  g.add(RIG.cyl(.05,.05,.08,18),MX(0,.72,0),RK.plGrey);
  g.add(RIG.tube([[0,.72,0],[-.22,.7,0],[-.25,.36,0]],.02,10,.06,6),MX(),RK.paintWhite);
  g.add(RIG.tube([[0,.7,0],[.24,.62,0],[.3,.34,0]],.018,10,.06,6),MX(),RK.paintWhite);
  g.add(RIG.cyl(.035,.035,.1,14),MX(-.25,.31,0),RK.plGrey);
  g.add(RIG.cyl(.03,.03,.09,14),MX(.3,.29,0),RK.plGrey);
  g.merge(riOTHead(.2),MX(-.25,.13,0,.1,0,.07));
  g.merge(riOTHead(.14),MX(.3,.13,0,-.1,0,-.1));
  return g.geometry();
};
RIPfit['13_operation_theatre_light']='none';

/* ---------------- diesel generator set ---------------- */
RIP['14_emergency_generator']=()=>{
  const g=new GB();
  const pc=RIspec(RK.paintGreen,{c:0x33463a,w:.6});
  for(const z of [-.3,.3]) g.add(RIG.rbox(1.44,.1,.08,.006,1),MX(0,.05,z),RK.paintDark);
  g.add(RIG.rbox(1.3,.22,.6,.03,2),MX(0,.21,0),pc);
  g.add(RIG.cyl(.035,.035,.03,14),MX(.4,.335,.15),RK.plBlack);
  g.add(RIG.rbox(.6,.44,.42,.03,2),MX(-.16,.55,0),RIspec(pc,{c:0x2b3c31}));
  for(let i=0;i<8;i++) g.add(RIG.rbox(.58,.01,.4,.004,1),MX(-.16,.8+i*.018,0),RIspec(pc,{c:0x223027}));
  g.add(RIG.rbox(.5,.06,.3,.02,2),MX(-.16,.97,0),RIspec(RK.paintRed,{c:0x8a1a12,w:.5}));
  g.add(RIG.cyl(.2,.2,.45,32),MX(.36,.55,0,0,0,Math.PI/2),pc);
  g.add(RIG.cyl(.17,.2,.04,32),MX(.6,.55,0,0,0,Math.PI/2),RK.paintDark);
  for(let i=0;i<10;i++){ const a=i/10*Math.PI*2; g.add(RIG.box(.03,.012,.06),MX(.62,.55+Math.cos(a)*.13,Math.sin(a)*.13,a,0,0),RK.plBlack); }
  g.add(RIG.rbox(.08,.7,.62,.01,1),MX(-.62,.72,0),RK.paintDark);
  for(let i=0;i<26;i++) g.add(RIG.box(.02,.6,.006),MX(-.575,.72,-.27+i*.0216),RIspec(RK.alu,{c:0x7a7f7c,w:.5}));
  const cp=new GB();
  cp.add(RIG.rbox(.5,.4,.12,.012,2),MX(),RIspec(RK.paintGrey,{c:0x8b9290}));
  for(let i=0;i<3;i++){ cp.add(RIG.cyl(.045,.045,.02,20),MX(-.15+i*.15,.07,.065,Math.PI/2,0,0),RK.chrome);
    cp.add(RIG.disk(.04,20),MX(-.15+i*.15,.07,.0755),RIspec(RK.paper,{c:0xf0ede4}));
    cp.add(RIG.box(.002,.032,.001),MX(-.15+i*.15,.075,.077,0,0,-.4-i*.5),RK.plBlack); }
  for(let i=0;i<4;i++) cp.add(RIG.rod([-.18+i*.08,-.08,.06],[-.18+i*.08,-.06,.09],.005,6),MX(),RK.chrome);
  cp.add(RIG.box(.02,.02,.004),MX(.12,-.07,.062),RK.ledA); cp.add(RIG.box(.02,.02,.004),MX(.16,-.07,.062),RK.ledR);
  cp.add(RIG.lathe([[0,0],[.03,0],[.032,.01],[.025,.025],[0,.03]],18),MX(.2,-.12,.06,Math.PI/2,0,0),RK.paintRed);
  g.merge(cp,MX(.34,1.08,.28));
  g.add(RIG.tube([[-.2,.85,-.1],[-.2,1.05,-.22],[-.2,1.3,-.25]],.03,12,.08,6),MX(),RK.rust);
  g.add(RIG.cyl(.07,.07,.36,20),MX(-.2,1.32,-.25,0,0,Math.PI/2),RK.rust);
  g.add(RIG.tube([[-.02,1.32,-.25],[.06,1.32,-.25],[.08,1.46,-.25]],.025,10,.05,5),MX(),RK.rust);
  g.add(RIG.cyl(.035,.03,.04,14),MX(.08,1.49,-.25,-.4,0,0),RK.paintDark);
  g.add(RIG.rbox(.25,.2,.17,.01,2),MX(.3,.42,-.18),RK.plBlack);
  for(const x of [.24,.36]) g.add(RIG.cyl(.012,.012,.03,10),MX(x,.535,-.18),x<.3?RK.paintRed:RK.plBlack);
  for(const x of [-.6,.6]) g.add(RIG.torus(.04,.01,6,16),MX(x,1.08,0),RK.steelDull);
  return g.geometry();
};

/* ---------------- electrical distribution board ---------------- */
RIP['15_fuse_box']=()=>{
  const g=new GB();
  g.add(RIG.box(.66,.94,.012),MX(0,.45,-.094),RIspec(RK.woodDark,{c:0x3a2c20}));
  g.add(RIG.rbox(.62,.9,.17,.01,2),MX(0,.45,-.005),RIspec(RK.paintGrey,{c:0xb9bdb9,w:.55}));
  g.add(RIG.rbox(.58,.84,.02,.008,2),MX(0,.45,.085),RIspec(RK.paintGrey,{c:0xc3c7c2,w:.6}));
  for(let r=0;r<5;r++) g.add(RIG.rbox(.2,.012,.008,.004,1),MX(-.12,.18+r*.025,.098),RIspec(RK.paintGrey,{c:0xaeb2ad}));
  g.add(RIG.rbox(.22,.13,.004,.003,1),MX(.1,.74,.097),RIspec(RK.paintWhite,{c:0xd8b21c}));
  g.add(RIG.box(.03,.09,.002),MX(.1,.74,.1,0,0,.35),RIspec(RK.paintRed,{c:0xb3120f}));
  g.add(RIG.box(.16,.012,.002),MX(.1,.69,.1),RK.plBlack);
  g.add(RIG.rbox(.025,.1,.025,.008,2),MX(.24,.45,.105),RK.chrome);
  g.add(RIG.cyl(.01,.01,.01,10),MX(.24,.53,.098,Math.PI/2,0,0),RK.brass);
  for(let i=0;i<4;i++){ g.add(RIG.cyl(.018,.018,.03,12),MX(-.2+i*.13,.015,0),RK.plBlack);
    g.add(RIG.cyl(.011,.011,.016,10),MX(-.2+i*.13,.002,0),RIspec(RK.plBlack,{c:0x3a2a1a})); }
  return g.geometry();
};

/* ---------------- CCTV monitoring table ---------------- */
RIP['16_cctv_terminal']=()=>{
  const g=new GB();
  g.add(RIG.rbox(1.26,.04,.62,.008,2),MX(0,.65,0),RIspec(RK.wood,{c:0x5a3a22}));
  for(const [x,z] of [[-.58,-.27],[.58,-.27],[-.58,.27],[.58,.27]]) g.add(RIG.rbox(.04,.63,.04,.008,1),MX(x,.315,z),RK.paintDark);
  g.add(RIG.box(1.18,.012,.56),MX(0,.18,0),RK.paintDark);
  const crt=(x,rot)=>{ const c=new GB();
    c.add(RIG.rbox(.42,.36,.36,.03,3),MX(0,.18,0),RIspec(RK.plBlack,{c:0x202122}));
    c.add(RIG.rbox(.3,.28,.18,.05,3),MX(0,.2,-.25),RIspec(RK.plBlack,{c:0x1a1b1c}));
    c.add(RIG.sphere(.5,20,14),MX(0,.19,.17,0,0,0,.32,.26,.04),RIspec(RK.screen,{c:0x0a1422}));
    c.add(RIG.box(.26,.2,.004),MX(0,.19,.185),RIspec(RK.ledG,{c:0x1c3f8a,w:.45}));
    c.add(RIG.box(.012,.012,.004),MX(.16,.03,.182),RK.ledG);
    g.merge(c,MX(x,.67,-.04,0,rot,0)); };
  crt(-.3,.12); crt(.3,-.12);
  g.add(RIG.rbox(.36,.07,.28,.01,2),MX(0,.705,.18),RIspec(RK.plBlack,{c:0x2a2b2d}));
  for(let i=0;i<4;i++) g.add(RIG.box(.012,.012,.004),MX(-.12+i*.03,.71,.322),i<3?RK.ledG:RK.ledA);
  g.add(RIG.lathe([[0,0],[.03,0],[.03,.02],[.008,.03],[.006,.1],[.014,.11],[0,.12]],14),MX(.45,.67,.2),RK.plBlack);
  g.add(RIG.curve([[-.3,.75,-.3],[-.2,.6,-.32],[0,.2,-.3],[.2,.15,-.2]],30).length?RIG.sweep(RIG.curve([[-.3,.75,-.3],[-.2,.6,-.32],[0,.2,-.3],[.2,.15,-.2]],30),.006,6,true):RIG.box(.01,.01,.01),MX(),RK.plBlack);
  return g.geometry();
};

/* ---------------- blood-stained privacy curtain on its rail ---------------- */
RIP['29_blood_stained_curtain']=()=>{
  const g=new GB();
  const W=1.7, H=2.06;
  g.add(RIG.cloth(W,H,64,30,(x,y,u,v)=>{
    const top=v, pleat=.045*(.55+.45*top)*Math.sin(x*44.9)+.012*Math.sin(x*13+y*3);
    const sway=.02*Math.sin(y*2.1+x*1.3)*(1-top);
    return [0,0,pleat+sway];
  }),MX(0,.1+H/2,0),RIspec(RK.sheet,{c:0xb8ad97,w:.45}),(x,y,z,c)=>{
    const n=riFbm(x*3.5,y*2.2,1.3);
    const splat=Math.max(0,(n-.52)*3.2)*(y<1.6?1:.3);
    const drip=Math.max(0,riNoise(x*18,1,2)-.7)*3*Math.max(0,1-Math.abs(y-.8)*1.2)*(n>.45?1:0);
    if(splat+drip>0) riStain(c,Math.min(1,splat+drip),0x3d0605);
    if(y<.35) riStain(c,(.35-y)*1.2,0x5b4a36);
  });
  g.add(RIG.rod([-.88,2.215,0],[.88,2.215,0],.013,10),MX(),RK.chrome);
  for(let i=0;i<13;i++){ const x=-.8+i*(1.6/12);
    g.add(RIG.torus(.014,.003,5,14),MX(x,2.19,0,0,Math.PI/2,0),RK.chrome); }
  for(const sx of [-1,1]) g.add(RIG.cyl(.02,.02,.04,12),MX(sx*.86,2.215,0,0,0,Math.PI/2),RK.plGrey);
  return g.geometry();
};
RIPfit['29_blood_stained_curtain']='keepz';

/* ---------------- instrument tray ---------------- */
RIP['30_medical_tray_tools']=()=>{
  const g=new GB();
  const ss=RIspec(RK.steel,{c:0xb9bec1,r:.22});
  g.add(RIG.rbox(.5,.006,.3,.003,1),MX(0,.003,0),ss);
  for(const z of [-.147,.147]) g.add(RIG.rbox(.5,.035,.006,.003,1),MX(0,.02,z,z>0?-.15:.15,0,0),ss);
  for(const x of [-.247,.247]) g.add(RIG.rbox(.006,.035,.3,.003,1),MX(x,.02,0,0,0,x>0?.15:-.15),ss);
  const sc=new GB(); for(const s of [-1,1]){ sc.add(RIG.rbox(.09,.004,.008,.002,1),MX(.03,0,0,0,s*.12,0),RK.chrome);
    sc.add(RIG.torus(.011,.0025,5,16),MX(-.03,0,s*.014,Math.PI/2,0,0),RK.chrome); }
  g.merge(sc,MX(-.12,.012,-.05,0,.4,0));
  const fc=new GB(); for(const s of [-1,1]) fc.add(RIG.rbox(.13,.004,.006,.002,1),MX(0,0,s*.006,0,s*.05,0),RK.chrome);
  g.merge(fc,MX(.05,.012,.06,0,-.3,0));
  g.add(RIG.rbox(.1,.008,.012,.003,1),MX(.12,.012,-.06,0,.9,0),RK.chrome);
  g.add(RIG.box(.03,.002,.01),MX(.16,.012,-.1,0,.9,0),RIspec(RK.chrome,{r:.05}));
  g.add(RIG.cyl(.008,.008,.09,10),MX(-.02,.012,.08,0,0,Math.PI/2),RIspec(RK.ceramic,{c:0xe5eced}));
  g.add(RIG.cyl(.0015,.0015,.03,4),MX(.04,.012,.08,0,0,Math.PI/2),RK.chrome);
  g.add(RIG.cloth(.09,.09,8,8,(x,y)=>[0,0,.004*Math.sin(x*60)*Math.cos(y*50)],false),MX(-.17,.01,.08,-Math.PI/2,0,.3),RK.sheet,(x,y,z,c)=>riBlood(x,y,z,c,2.2));
  return g.geometry();
};

/* ---------------- tied record files ---------------- */
RIP['32_file_record_stack']=()=>{
  const g=new GB();
  let y=0;
  for(let i=0;i<7;i++){
    const r=(riHash(i,1,1)-.5)*.18, ox=(riHash(i,2,1)-.5)*.02, oz=(riHash(i,3,1)-.5)*.015, th=.022+.012*riHash(i,4,4);
    const f=new GB();
    f.add(RIG.rbox(.34,.004,.25,.002,1),MX(0,.002,0),i%3===1?RIspec(RK.manila,{c:0x8e6a44}):RK.manila);
    f.add(RIG.rbox(.325,th,.235,.003,1),MX(.004,.004+th/2,0),RIspec(RK.paper,{w:.3}));
    f.add(RIG.rbox(.34,.004,.25,.002,1),MX(0,.006+th,0),i%3===1?RIspec(RK.manila,{c:0x8e6a44}):RK.manila);
    if(riHash(i,5,5)<.5) f.add(RIG.box(.2,.002,.12),MX(.12,.004+th*.5,.05,0,.3,0),RK.paper);
    g.merge(f,MX(ox,y,oz,0,r,0)); y+=th+.009;
  }
  for(const z of [-.06,.06]){
    const pts=[[-.172,.0,z],[-.172,y+.003,z],[.172,y+.003,z],[.172,0,z],[-.172,0,z]];
    g.add(RIG.sweep(RIG.rpath(pts,.012,3),.0028,5,false),MX(),RIspec(RK.fabBlue,{c:0x8c0d0d}));
  }
  g.add(RIG.box(.06,.08,.002),MX(.08,y+.02,.13,-1.2,0,0),RIspec(RK.paper,{c:0xe3d8b8}));
  return g.geometry();
};

/* ---------------- wall clock stopped at 2:40 ---------------- */
RIP['33_wall_clock']=()=>{
  const g=new GB();
  const c=[0,.2];
  g.add(RIG.cyl(.195,.2,.05,48),MX(0,.2,-.015,Math.PI/2,0,0),RIspec(RK.plBlack,{c:0x1b1b1c}));
  g.add(RIG.torus(.19,.013,10,64),MX(0,.2,.012),RK.plBlack);
  g.add(RIG.disk(.179,48),MX(0,.2,.011),RIspec(RK.paper,{c:0xe0d6bc}),(x,y,z,col)=>{ const n=riFbm(x*12,y*12,2); if(n>.58) riStain(col,(n-.58)*2,0x9a7b45); });
  for(let i=0;i<60;i++){ const a=i/60*Math.PI*2, big=i%5===0, r=.165;
    g.add(RIG.box(big?.006:.002,big?.024:.01,.002),MX(Math.sin(a)*(r-(big?.012:.005)),.2+Math.cos(a)*(r-(big?.012:.005)),.013,0,0,-a),RK.plBlack); }
  const hand=(a,len,w,col,z)=>g.add(RIG.rbox(w,len,.002,.001,1),MX(Math.sin(a)*len*.38,.2+Math.cos(a)*len*.38,z,0,0,-a),col);
  hand((2+40/60)/12*Math.PI*2,.1,.009,RK.plBlack,.015);
  hand(40/60*Math.PI*2,.145,.006,RK.plBlack,.017);
  hand(3.1,.15,.002,RK.paintRed,.019);
  g.add(RIG.cyl(.008,.008,.01,12),MX(0,.2,.02,Math.PI/2,0,0),RK.chrome);
  return g.geometry();
};

/* ---------------- fire extinguisher ---------------- */
RIP['34_fire_extinguisher']=()=>{
  const g=new GB();
  const body=[[0,0],[.07,.002],[.083,.012],[.086,.03],[.086,.55],[.08,.59],[.058,.625],[.032,.643],[.026,.66],[0,.66]];
  g.add(RIG.lathe(body,40),MX(),RIspec(RK.paintRed,{c:0xa3120f,w:.3}),(x,y,z,c)=>{
    if(y>.2&&y<.44&&z>-.02) c.setHex(0xe8dfc2);
    if(y>.25&&y<.27&&z>0) c.setHex(0x222222); if(y>.3&&y<.315&&z>0) c.setHex(0x222222); if(y>.36&&y<.4&&z>0) c.setHex(0xa3120f); });
  g.add(RIG.lathe([[0,.66],[.024,.66],[.022,.72],[.018,.73],[0,.73]],18),MX(),RK.chrome);
  g.add(RIG.rbox(.1,.012,.03,.005,1),MX(.035,.745,0,0,0,.12),RK.plBlack);
  g.add(RIG.rbox(.09,.01,.028,.005,1),MX(.03,.725,0,0,0,.02),RK.plBlack);
  g.add(RIG.cyl(.016,.016,.012,16),MX(-.012,.705,.022,Math.PI/2,0,0),RK.chrome);
  g.add(RIG.disk(.013,16),MX(-.012,.705,.0285),RIspec(RK.paintWhite,{c:0x3bb34a}));
  g.add(RIG.torus(.01,.0018,4,12),MX(.02,.72,.02),RK.chrome);
  const hose=RIG.curve([[-.02,.7,0],[-.09,.66,.0],[-.12,.5,.03],[-.14,.34,.04],[-.13,.25,.03]],40);
  g.add(RIG.sweep(hose,.009,8,true),MX(),RK.rubber);
  g.add(RIG.lathe([[0,0],[.012,0],[.02,.06],[.035,.1],[0,.1]],16),MX(-.13,.25,.03,Math.PI,0,0),RK.plBlack);
  return g.geometry();
};

/* ---------------- hanging department board ---------------- */
RIP['35_hospital_signboard']=()=>{
  const g=new GB();
  g.add(RIG.rbox(1.86,.46,.05,.012,2),MX(0,.23,0),RIspec(RK.paintGreen,{c:0x1f7466,w:.3}));
  g.add(RIG.box(1.76,.37,.004),MX(0,.235,.026),RIspec(RK.plWhite,{c:0xe9e3cc,w:.25}));
  g.add(RIG.box(1.76,.035,.005),MX(0,.405,.027),RIspec(RK.paintRed,{c:0x8c0d0d}));
  for(const sx of [-1,1]){ g.add(RIG.rod([sx*.72,.44,0],[sx*.72,1.62,0],.005,6),MX(),RK.chrome);
    g.add(RIG.cyl(.035,.035,.012,14),MX(sx*.72,1.654,0),RK.chrome);
    g.add(RIG.torus(.012,.003,5,12),MX(sx*.72,.465,0),RK.chrome); }
  return g.geometry();
};
RIPfit['35_hospital_signboard']='keepz';

/* ---------------- crumpled baby blanket ---------------- */
RIP['18_baby_blanket']=()=>{
  const g=new GB();
  g.add(RIG.cloth(.62,.42,40,28,(x,y)=>{
    const e=Math.min(1,Math.min(.31-Math.abs(x),.21-Math.abs(y))*14);
    const f=.035*riFbm(x*6+3,y*6,2)+.012*Math.sin(x*28+y*11)+.008*Math.sin(y*40);
    return [0,0,.004+f*e+.02*e];
  },true),MX(0,0,0,-Math.PI/2,0,0),RIspec(RK.sheet,{c:0xbcc3b5,w:.25}),(x,y,z,c)=>{
    if(((Math.floor((x+5)*18)+Math.floor((z+5)*18))&1)===0) c.multiplyScalar(.9);
    if(Math.abs(Math.abs(z)-.17)<.012) c.setHex(0x8fa3b8); });
  return g.geometry();
};

/* ---------------- a child's teddy, one eye gone ---------------- */
RIP['31_nursery_toy']=()=>{
  const g=new GB();
  const fur=RIspec(RK.sheet,{c:0x7b5b3c,d:3,w:.35}), pad=RIspec(RK.sheet,{c:0xb89c7a,d:3});
  g.add(RIG.sphere(1,22,16),MX(0,.105,0,0,0,0,.09,.11,.075),fur);
  g.add(RIG.sphere(.075,22,16),MX(0,.235,.005),fur);
  for(const s of [-1,1]){ g.add(RIG.sphere(.028,12,8),MX(s*.055,.3,-.005,0,0,0,1,1,.55),fur);
    g.add(RIG.sphere(.018,10,8),MX(s*.055,.3,.004,0,0,0,1,1,.4),pad); }
  g.add(RIG.sphere(1,16,12),MX(0,.222,.062,0,0,0,.034,.026,.028),pad);
  g.add(RIG.sphere(.009,10,8),MX(0,.232,.088),RK.plBlack);
  g.add(RIG.sphere(.0095,10,8),MX(-.028,.255,.066),RIspec(RK.plBlack,{r:.15}));
  g.add(RIG.sweep(RIG.curve([[.028,.255,.066],[.034,.24,.07],[.03,.225,.068]],8),.0012,4,true),MX(),RIspec(RK.sheet,{c:0x1a1a1a}));
  g.add(RIG.sphere(1,14,10),MX(-.12,.15,.02,0,0,.9,.035,.075,.034),fur);
  g.add(RIG.sphere(1,14,10),MX(.12,.15,.02,0,0,-.9,.035,.075,.034),fur);
  g.add(RIG.sphere(.022,10,8),MX(.17,.13,.03),RIspec(RK.sheet,{c:0xe8e4da}));
  for(const s of [-1,1]){ g.add(RIG.sphere(1,14,10),MX(s*.055,.04,.07,0,0,0,.042,.04,.08),fur);
    g.add(RIG.disk(.028,16),MX(s*.055,.04,.151),pad); }
  return g.geometry();
};

/* ---------------- medicine bottle ---------------- */
RIP['07_medicine_bottle']=()=>{
  const g=new GB();
  g.add(RIG.lathe([[0,0],[.034,0],[.037,.006],[.037,.14],[.03,.16],[.018,.172],[.017,.185],[0,.185]],24),MX(),RIspec(RK.ceramic,{c:0x5a2a0a,r:.07}),
    (x,y,z,c)=>{ if(y>.04&&y<.11) c.setHex(0xe7e0cb); if(y>.06&&y<.07) c.setHex(0x1e3a8a); });
  g.add(RIG.lathe([[0,.18],[.021,.18],[.021,.21],[0,.21]],20),MX(),RK.plWhite);
  return g.geometry();
};

/* ---------------- caged red beacon on a drop rod ---------------- */
RIP['28_emergency_red_light']=()=>{
  const g=new GB();
  g.add(RIG.cyl(.05,.05,.02,20),MX(0,.41,0),RK.paintGrey);
  g.add(RIG.cyl(.008,.008,.28,8),MX(0,.27,0),RK.paintGrey);
  g.add(RIG.rbox(.14,.025,.1,.008,2),MX(0,.1125,0),RK.paintDark);
  g.add(RIG.lathe([[0,.0],[.052,.0],[.055,.02],[.05,.06],[.035,.09],[0,.1]],24),MX(0,.1,0,Math.PI,0,0),RIspec(RK.ceramic,{c:0x9a1010,r:.1}));
  g.add(RIG.torus(.057,.003,4,24),MX(0,.1,0,Math.PI/2,0,0),RK.paintDark);
  for(let i=0;i<4;i++){ const a=i*Math.PI/2; g.add(RIG.tube([[Math.cos(a)*.057,.1,Math.sin(a)*.057],[Math.cos(a)*.05,.05,Math.sin(a)*.05],[0,.0,0]],.0025,4,.03,3),MX(),RK.paintDark); }
  return g.geometry();
};
RIPfit['28_emergency_red_light']='none';

Object.assign(RIPfit,{'02_wheelchair':'uniform','27_broken_wheelchair':'uniform','34_fire_extinguisher':'none','06_oxygen_cylinder':'uniform',
  '30_medical_tray_tools':'uniform','32_file_record_stack':'uniform','31_nursery_toy':'none','16_cctv_terminal':'uniform'});
