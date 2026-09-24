
/* ═════════════ fixtures and fittings (shared, instanced) ═════════════ */
const RIX={};
RIX.doorLeaf=(metal)=>{
  const g=new GB(), w=1.45, h=2.3, t=.07;
  const face=metal?RIspec(RK.paintGrey,{c:0x5f6f70,w:.3}):RIspec(RK.paintCream,{c:0xd8d2c2,w:.12,r:.42});
  g.add(RIG.rbox(w-.006,h-.006,t,.014,2),MX(w/2,h/2,0),face);
  const vx=w*.52, vy=metal?1.45:1.52, vw=metal?.3:.26, vh=metal?.62:.5;
  for(const s of [-1,1]){
    const z=s*(t/2+.003);
    g.add(RIG.box(vw,vh,.004),MX(vx,vy,s*(t/2-.006)),RIspec(RK.glass,{c:0x1a2224,r:.05}));
    for(let i=1;i<5;i++) g.add(RIG.box(.0016,vh,.002),MX(vx-vw/2+vw*i/5,vy,s*(t/2-.003)),RIspec(RK.steelDull,{c:0x777c7e}));
    for(let i=1;i<8;i++) g.add(RIG.box(vw,.0016,.002),MX(vx,vy-vh/2+vh*i/8,s*(t/2-.003)),RIspec(RK.steelDull,{c:0x777c7e}));
    g.add(RIG.rbox(vw+.05,.025,.012,.004,1),MX(vx,vy+vh/2+.012,z),face);
    g.add(RIG.rbox(vw+.05,.025,.012,.004,1),MX(vx,vy-vh/2-.012,z),face);
    g.add(RIG.rbox(.025,vh,.012,.004,1),MX(vx-vw/2-.012,vy,z),face);
    g.add(RIG.rbox(.025,vh,.012,.004,1),MX(vx+vw/2+.012,vy,z),face);
    g.add(RIG.rbox(w-.08,.26,.003,.001,1),MX(w/2,.16,s*(t/2+.0016)),RIspec(RK.steel,{w:.45}));
    if(!metal){
      g.add(RIG.rbox(.1,.3,.003,.002,1),MX(w-.13,1.25,s*(t/2+.0016)),RK.steel);
      g.add(RIG.cyl(.026,.03,.012,20),MX(w-.13,1.0,s*(t/2+.006),Math.PI/2,0,0),RK.chrome);
      g.add(RIG.tube([[w-.13,1.0,s*(t/2+.01)],[w-.13,1.0,s*(t/2+.055)],[w-.28,1.0,s*(t/2+.058)]],.0095,10,.025,6),MX(),RK.chrome);
      g.add(RIG.cyl(.009,.009,.006,10),MX(w-.13,.92,s*(t/2+.004),Math.PI/2,0,0),RK.brass);
    } else if(s>0){
      g.add(RIG.rod([.25,1.0,z+.06],[w-.1,1.0,z+.06],.016,12),MX(),RK.chrome);
      for(const x of [.2,w-.06]) g.add(RIG.rbox(.07,.12,.07,.012,2),MX(x,1.0,z+.035),RK.paintDark);
    } else g.add(RIG.tube([[w-.13,1.0,z],[w-.13,1.0,z-.05],[w-.26,1.0,z-.052]],.0095,10,.025,6),MX(),RK.chrome);
  }
  for(const y of [.25,1.15,2.05]) g.add(RIG.cyl(.011,.011,.11,12),MX(-.004,y,t/2-.004),RK.steelDull);
  if(!metal) g.add(RIG.rbox(.14,.07,.004,.002,1),MX(w/2,1.9,t/2+.002),RIspec(RK.plWhite,{c:0xe9e3cd}));
  if(metal){ g.add(RIG.rbox(.3,.05,.05,.01,2),MX(w-.3,h-.07,-t/2-.03),RK.paintDark);
    g.add(RIG.rod([w-.45,h-.07,-t/2-.03],[w-.8,h+.02,-t/2-.12],.008,6),MX(),RK.paintDark); }
  return g.geometry();
};
RIX.troffer=()=>{
  const g=new GB();
  const hs=RIspec(RK.paintWhite,{c:0xe8e7e1,w:.35});
  g.add(RIG.rbox(1.24,.045,.32,.008,1),MX(0,-.022,0),hs);
  for(const s of [-1,1]){
    g.add(RIG.box(1.2,.05,.004),MX(0,-.066,s*.15,s*.35,0,0),RIspec(RK.alu,{c:0xe0e3e5,r:.3,m:.55,w:.15}));
    g.add(RIG.rbox(.02,.03,.3,.006,1),MX(s*.61,-.058,0),hs);
  }
  for(let i=0;i<9;i++) g.add(RIG.box(.004,.035,.28),MX(-.52+i*.13,-.064,0),RIspec(RK.paintWhite,{c:0xe4e5e1,r:.32,w:.15}));
  for(const s of [-1,1]) for(const z of [-.065,.065]) g.add(RIG.rbox(.03,.03,.04,.006,1),MX(s*.575,-.05,z),RK.plWhite);
  g.add(RIG.box(1.18,.004,.26),MX(0,-.045,0),RIspec(RK.paintWhite,{c:0xf4f3ee,r:.35}));
  return g.geometry();
};
RIX.tubes=()=>{ const g=new GB();
  for(const z of [-.065,.065]){
    g.add(RIG.cyl(.013,.013,1.1,12,true),MX(0,-.055,z,0,0,Math.PI/2),RIspec(RK.ceramic,{c:0xf1f1ec,r:.3}));
    for(const s of [-1,1]) g.add(RIG.cyl(.0135,.0135,.022,12),MX(s*.555,-.055,z,0,0,Math.PI/2),RIspec(RK.alu,{c:0x9a9d9e}));
  }
  return g.geometry(); };
RIX.smoke=()=>{ const g=new GB();
  g.add(RIG.lathe([[0,0],[.06,0],[.062,-.01],[.058,-.03],[.045,-.04],[0,-.042]].map(p=>[p[0],p[1]]).reverse().map(p=>[p[0],p[1]]),28),MX(),RIspec(RK.plWhite,{c:0xeae8e1}));
  for(let i=0;i<12;i++){ const a=i/12*Math.PI*2; g.add(RIG.box(.012,.012,.004),MX(Math.cos(a)*.055,-.02,Math.sin(a)*.055,0,-a,0),RK.plGrey); }
  g.add(RIG.box(.006,.004,.006),MX(.02,-.043,0),RIspec(RK.ledR,{w:.8}));
  return g.geometry(); };
RIX.switchPlate=()=>{ const g=new GB();
  g.add(RIG.rbox(.2,.14,.014,.006,2),MX(0,0,.007),RIspec(RK.plWhite,{c:0xeeebe2,w:.35}));
  for(let i=0;i<5;i++){ g.add(RIG.rbox(.024,.042,.01,.004,1),MX(-.075+i*.03,.02,.016,(i%2?.18:-.18),0,0),RIspec(RK.plWhite,{c:0xf4f2ea}));
    g.add(RIG.box(.004,.004,.002),MX(-.075+i*.03,.05,.0145),RIspec(RK.ledR,{w:.25})); }
  g.add(RIG.cyl(.018,.02,.012,18),MX(.075,-.035,.018,Math.PI/2,0,0),RIspec(RK.plWhite,{c:0xe4e0d4}));
  g.add(RIG.box(.003,.012,.004),MX(.075,-.03,.025),RK.plGrey);
  for(const x of [-.08,.08]) g.add(RIG.cyl(.004,.004,.003,8),MX(x,-.052,.0145,Math.PI/2,0,0),RK.chrome);
  return g.geometry(); };
RIX.socket=()=>{ const g=new GB();
  g.add(RIG.rbox(.09,.09,.014,.006,2),MX(0,0,.007),RIspec(RK.plWhite,{c:0xeeebe2,w:.4}));
  for(const [x,y,r] of [[0,.018,.0055],[-.016,-.012,.004],[.016,-.012,.004]]) g.add(RIG.cyl(r,r,.004,10),MX(x,y,.0142,Math.PI/2,0,0),RK.plBlack);
  g.add(RIG.box(.012,.02,.006),MX(.03,.028,.016),RIspec(RK.paintRed,{c:0xb31b12}));
  return g.geometry(); };
RIX.conduit=()=>{ const g=new GB();
  g.add(RIG.cyl(.011,.011,1,10),MX(0,.5,.011),RIspec(RK.plWhite,{c:0xdcd8cc,w:.5}));
  return g.geometry(); };
RIX.clip=()=>{ const g=new GB(); g.add(RIG.rbox(.03,.012,.03,.004,1),MX(0,0,.012),RK.plWhite); return g.geometry(); };
RIX.bin=(hex)=>{ const g=new GB();
  const c=RIspec(RK.plWhite,{c:hex,r:.4,w:.4});
  g.add(RIG.lathe([[0,0],[.13,0],[.135,.02],[.15,.42],[.155,.43],[.14,.44],[.0,.44]],30),MX(),c);
  g.add(RIG.lathe([[0,.44],[.16,.44],[.162,.455],[.14,.47],[0,.475]],30),MX(0,.005,0),c);
  g.add(RIG.rbox(.08,.02,.1,.008,1),MX(0,.02,.17),RK.plBlack);
  g.add(RIG.rbox(.02,.2,.02,.005,1),MX(-.1,.12,-.14),RK.plGrey);
  g.add(RIG.box(.16,.1,.004),MX(0,.3,.147,-.05,0,0),RIspec(RK.paper,{c:0xf2eee2}));
  return g.geometry(); };
RIX.cooler=()=>{ const g=new GB();
  const ss=RIspec(RK.steel,{c:0xb2b7ba,w:.4});
  g.add(RIG.rbox(.6,1.2,.5,.02,2),MX(0,.62,0),ss);
  g.add(RIG.rbox(.56,.04,.46,.01,1),MX(0,.02,0),RK.plBlack);
  for(let i=0;i<10;i++) g.add(RIG.box(.44,.008,.01),MX(0,.2+i*.022,.25),RK.plBlack);
  g.add(RIG.rbox(.5,.04,.14,.01,2),MX(0,.78,.3),ss);
  for(let i=0;i<9;i++) g.add(RIG.box(.46,.004,.012),MX(0,.803,.25+i*.012),RK.steelDull);
  for(const x of [-.15,.15]){ g.add(RIG.rod([x,1.02,.25],[x,1.02,.33],.012,10),MX(),RK.chrome);
    g.add(RIG.cyl(.01,.008,.05,10),MX(x,.99,.33),RK.chrome);
    g.add(RIG.rbox(.03,.05,.02,.006,1),MX(x,1.06,.33),RIspec(RK.plBlack,{c:x<0?0x1e4fa8:0xb71c1c})); }
  g.add(RIG.box(.3,.12,.004),MX(0,1.12,.252),RIspec(RK.paper,{c:0xeae4d0}));
  return g.geometry(); };
RIX.hoseReel=()=>{ const g=new GB();
  g.add(RIG.rbox(.7,.72,.2,.01,2),MX(0,0,.1),RIspec(RK.paintRed,{c:0xa3120f,w:.35}));
  g.add(RIG.box(.58,.58,.004),MX(0,.02,.202),RIspec(RK.glass,{c:0x1e2022}));
  g.add(RIG.torus(.2,.035,8,40),MX(0,.02,.12),RIspec(RK.paintRed,{c:0x8e1510}));
  g.add(RIG.box(.3,.06,.004),MX(0,-.3,.203),RIspec(RK.paper,{c:0xf1ece0}));
  g.add(RIG.rbox(.03,.12,.03,.008,1),MX(.3,0,.21),RK.chrome);
  return g.geometry(); };
RIX.alarm=()=>{ const g=new GB();
  g.add(RIG.lathe([[0,0],[.075,0],[.078,.01],[.06,.04],[.02,.055],[0,.058]],24),MX(0,.28,0,Math.PI/2,0,0),RIspec(RK.paintRed,{c:0xb3120f}));
  g.add(RIG.cyl(.01,.01,.02,8),MX(0,.28,.065,Math.PI/2,0,0),RK.chrome);
  g.add(RIG.rbox(.1,.1,.04,.008,2),MX(0,0,.02),RIspec(RK.paintRed,{c:0xb3120f}));
  g.add(RIG.box(.06,.06,.004),MX(0,0,.041),RIspec(RK.plWhite,{c:0xf2f0ea}));
  return g.geometry(); };
RIX.sanitizer=()=>{ const g=new GB();
  g.add(RIG.rbox(.11,.24,.09,.02,3),MX(0,0,.045),RIspec(RK.plWhite,{c:0xe8e6e0}));
  g.add(RIG.rbox(.08,.06,.02,.008,2),MX(0,-.06,.095),RIspec(RK.plGrey,{c:0x3a6fb0}));
  g.add(RIG.box(.05,.1,.004),MX(0,.05,.091),RIspec(RK.ceramic,{c:0x88bcd0}));
  return g.geometry(); };
RIX.dome=()=>{ const g=new GB();
  g.add(RIG.cyl(.07,.07,.02,24),MX(0,-.01,0),RK.plWhite);
  g.add(RIG.sphere(.06,20,10),MX(0,-.02,0,Math.PI,0,0,1,.8,1),RIspec(RK.glass,{c:0x0e1114,r:.05}));
  g.add(RIG.box(.004,.004,.004),MX(.03,-.03,.03),RIspec(RK.ledR,{w:.9}));
  return g.geometry(); };
RIX.notice=(w,h)=>{ const g=new GB();
  g.add(RIG.box(w,h,.012),MX(0,0,.006),RIspec(RK.wood,{c:0x8a6a45,d:14,r:.9}));
  for(const [x,y,ww,hh] of [[0,h/2,w+.04,.03],[0,-h/2,w+.04,.03],[-w/2,0,.03,h],[w/2,0,.03,h]])
    g.add(RIG.rbox(ww,hh,.02,.005,1),MX(x,y,.01),RK.alu);
  let k=0; for(let i=0;i<Math.round(w/.26);i++) for(let j=0;j<2;j++){ k++;
    const x=-w/2+.16+i*.26+(riHash(k,1,1)-.5)*.04, y=h/4-j*h*.46+(riHash(k,2,2)-.5)*.05;
    if(riHash(k,3,3)<.2) continue;
    const pw=.21, ph=.28, tilt=(riHash(k,4,4)-.5)*.12;
    g.add(RIG.cloth(pw,ph,6,8,(xx,yy)=>[0,0,.004*Math.sin((yy+ph/2)/ph*3)+(yy<-ph*.3?.01*(-yy-ph*.3)/ph*4:0)],false),MX(x,y,.014,0,0,tilt),
      RIspec(RK.paper,{c:[0xece8dc,0xf0e6c4,0xdce6ea,0xefd9d9][k%4]}),(xx,yy,zz,c)=>{ const ly=(yy-y); if(Math.abs(((ly*60)%1+1)%1-.5)<.12&&Math.abs(xx-x)<.08) c.multiplyScalar(.55); });
    g.add(RIG.sphere(.006,8,6),MX(x,y+ph/2-.02,.02),RIspec(RK.paintRed,{c:[0xc0392b,0x2e86c1,0xf1c40f][k%3]}));
  }
  return g.geometry(); };
RIX.fan=()=>{ const body=new GB(), rotor=new GB();
  body.add(RIG.cyl(.07,.08,.04,24),MX(0,-.02,0),RIspec(RK.paintWhite,{c:0xe5e1d6}));
  body.add(RIG.cyl(.012,.012,.38,10),MX(0,-.23,0),RIspec(RK.paintWhite,{c:0xd9d4c6}));
  rotor.add(RIG.lathe([[0,-.07],[.1,-.06],[.13,-.03],[.13,.01],[.1,.04],[0,.05]],32),MX(),RIspec(RK.paintWhite,{c:0xe6e2d8,w:.4}));
  for(let i=0;i<3;i++){ const a=i/3*Math.PI*2;
    const bl=new GB();
    bl.add(RIG.rbox(.14,.012,.05,.004,1),MX(.19,0,0),RK.chrome);
    bl.add(RIG.cloth(.52,.12,12,3,(x,y)=>[0,0,-(x+.26)*.06*(y/.06)],false),MX(.51,0,0,-Math.PI/2,0,0),RIspec(RK.paintWhite,{c:0xe2ddd0,w:.45}));
    bl.add(RIG.cloth(.52,.12,12,3,(x,y)=>[0,0,-(x+.26)*.06*(y/.06)-.004],false),MX(.51,-.004,0,Math.PI/2,0,0),RIspec(RK.paintWhite,{c:0xcfc9ba,w:.45}));
    rotor.merge(bl,MX(0,-.01,0,0,a,0)); }
  return {body:body.geometry(),rotor:rotor.geometry()}; };
RIX.box=(big)=>{ const g=new GB(), w=big?.5:.36, h=big?.34:.26, d=big?.38:.3;
  const cb=RIspec(RK.paper,{c:0xa47d52,r:.85,d:9,w:.4});
  g.add(RIG.rbox(w,h,d,.008,1),MX(0,h/2,0),cb,(x,y,z,c)=>{ if(Math.abs(x)<.03) c.setHex(0xb99b6b); });
  g.add(RIG.box(.06,.002,d+.004),MX(0,h+.001,0),RIspec(RK.plBeige,{c:0xc9b58a,r:.3}));
  g.add(RIG.cloth(w*.46,d*.95,4,4,(x,y)=>[0,0,.0],false),MX(-w*.24,h+.02,0,-Math.PI/2+.6,0,0),cb);
  g.add(RIG.box(.12,.07,.002),MX(w*.2,h*.6,d/2+.002),RIspec(RK.paper,{c:0xece6d4}));
  return g.geometry(); };
RIX.stool=()=>{ const g=new GB();
  g.add(RIG.lathe([[0,.44],[.16,.44],[.17,.455],[.165,.47],[0,.475]],28),MX(),RIspec(RK.steel,{w:.3}));
  for(let i=0;i<4;i++){ const a=i*Math.PI/2+.4; g.add(RIG.rod([Math.cos(a)*.1,.44,Math.sin(a)*.1],[Math.cos(a)*.17,0,Math.sin(a)*.17],.011,8),MX(),RK.steelDull);
    g.add(RIG.cyl(.016,.016,.012,10),MX(Math.cos(a)*.17,.006,Math.sin(a)*.17),RK.rubber); }
  g.add(RIG.torus(.14,.007,6,32),MX(0,.18,0,Math.PI/2,0,0),RK.steelDull);
  return g.geometry(); };
RIX.jars=()=>{ const g=new GB();
  for(let i=0;i<5;i++){ const x=(riHash(i,1,2)-.5)*.22, z=(riHash(i,2,1)-.5)*.2, h=.12+.14*riHash(i,5,5), r=.03+.02*riHash(i,6,6);
    const glass=riHash(i,7,7)<.5;
    g.add(RIG.lathe([[0,0],[r,0],[r,h*.8],[r*.5,h*.92],[r*.45,h],[0,h]],16),MX(x,0,z),glass?RIspec(RK.ceramic,{c:0x6a3a14,r:.08}):RIspec(RK.plWhite,{c:0xe8e5dc}));
    g.add(RIG.cyl(r*.5,r*.5,.02,12),MX(x,h+.01,z),i%2?RK.plWhite:RIspec(RK.plBlack,{c:0x1d4e89})); }
  return g.geometry(); };
RIX.traySet=()=>{ const g=new GB();
  g.add(RIG.rbox(.6,.02,.4,.006,1),MX(0,.01,0),RIspec(RK.steel,{w:.35}));
  for(const s of [-1,1]) g.add(RIG.rbox(.6,.035,.01,.003,1),MX(0,.03,s*.195),RK.steel);
  g.add(RIG.lathe([[0,0],[.06,0],[.1,.05],[.105,.055],[0,.01]],24),MX(-.15,.02,0,0,0,0,1,1,.6),RK.chrome);
  g.add(RIG.rbox(.16,.05,.12,.01,1),MX(.15,.045,0),RIspec(RK.plWhite,{c:0xe1ddd2}));
  g.add(RIG.cyl(.035,.035,.06,16),MX(.02,.05,.1),RIspec(RK.ceramic,{c:0xd9e5e6}));
  return g.geometry(); };
RIX.rubble=(k)=>{ const g=new THREE.IcosahedronGeometry(1,RIseg(2,1)); const p=g.attributes.position;
  for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); const n=.75+.5*riNoise(x*2.3+k,y*2.3,z*2.3); p.setXYZ(i,x*n,y*n*.6,z*n); }
  g.computeVertexNormals();
  const b=new GB(); b.add(g,MX(),RIspec(RK.conc,{c:k%2?0xb9b4a8:0x8c8578}));
  return b.geometry(); };
RIX.tileChunk=()=>{ const g=new GB();
  g.add(RIG.box(.6,.012,.6),MX(),RIspec(RK.plWhite,{c:0xd9d6cc,d:14,r:.95}));
  return g.geometry(); };
RIX.exitBox=()=>{ const g=new GB();
  g.add(RIG.rbox(.84,.3,.07,.012,2),MX(0,0,.035),RIspec(RK.plWhite,{c:0xe9e7df}));
  g.add(RIG.rbox(.06,.04,.04,.01,1),MX(-.3,.17,.02),RK.plWhite); g.add(RIG.rbox(.06,.04,.04,.01,1),MX(.3,.17,.02),RK.plWhite);
  return g.geometry(); };
RIX.windowSet=(w,h)=>{ /* frame + grille + sill, glass handled separately */
  const g=new GB();
  const fr=RIspec(RK.paintGreen,{c:0x3d4e47,w:.5}), grl=RIspec(RK.paintDark,{c:0x25292a,w:.55});
  const fw=.07, fd=.07;
  g.add(RIG.rbox(w+2*fw,fw,fd,.008,1),MX(0,h+fw/2,fd/2),fr);
  g.add(RIG.rbox(w+2*fw,fw*.7,fd,.008,1),MX(0,-fw*.35,fd/2),fr);
  for(const s of [-1,1]) g.add(RIG.rbox(fw,h+fw*1.7,fd,.008,1),MX(s*(w/2+fw/2),h/2+.15*fw,fd/2),fr);
  g.add(RIG.rbox(.045,h,.05,.006,1),MX(0,h/2,.025),fr);
  g.add(RIG.rbox(w,.04,.05,.006,1),MX(0,h*.68,.025),fr);
  for(const s of [-1,1]) g.add(RIG.rbox(.03,.03,.02,.005,1),MX(s*.06,h*.35,.055),RK.brass);
  const n=Math.round(w/.12);
  for(let i=1;i<n;i++) g.add(RIG.cyl(.008,.008,h-.04,8),MX(-w/2+w*i/n,h/2,.1),grl);
  for(const y of [h*.25,h*.75]) g.add(RIG.rbox(w,.035,.008,.003,1),MX(0,y,.1),grl);
  g.add(RIG.rbox(w+.3,.04,.14,.006,1),MX(0,-.07,.07),RIspec(RK.kota,{c:0x51605a}));
  return g.geometry(); };

/* ═════════════ RI — the interior dresser ═════════════ */
const RI={
  ready:false, geo:{}, mats:{}, hp:new Set(), origV:{}, origBB:{}, floors:{}, atlas:null, atlasData:null,
  CELL:.1, dust:null, beam:null, t:0, flashT:30, flash:0, fanSets:[],
  async prepare(set){
    RIQ.aniso=Math.min(renderer.capabilities.getMaxAnisotropy?renderer.capabilities.getMaxAnisotropy():4,IS_TOUCH?4:16);
    const S=RIQ.tex, s2=RIQ.texS;
    const step=async(p,t,fn)=>{ if(set) set(p,t); await new Promise(r=>setTimeout(r,0)); return fn(); };
    const pl=await step(.0,'PLASTER',()=>RIBake.set(S,2.4,.0045,RI_SRC.plaster,RI_SRC.plasterA,RI_SRC.plasterR));
    const tz=await step(.15,'TERRAZZO',()=>RIBake.set(S,1.2,.0012,RI_SRC.terrazzo,RI_SRC.terrazzoA,RI_SRC.terrazzoR));
    const ti=await step(.3,'CERAMIC TILE',()=>RIBake.set(S,1.2,.0025,RI_SRC.tile,RI_SRC.tileA,RI_SRC.tileR));
    const ce=await step(.45,'CEILING TILES',()=>RIBake.set(s2,.6,.004,RI_SRC.ceil,RI_SRC.ceilA,RI_SRC.ceilR));
    const de=await step(.6,'MICRO DETAIL',()=>RIBake.set(512,.25,.0012,RI_SRC.detail,RI_SRC.detailA,RI_SRC.detailR));
    const pano=await step(.75,'SHIMLA NIGHT',()=>RIBake.run(RIQ.pano,RIQ.pano/2,RI_PANO,null,true));
    const mac=RIBake.run(512,512,RI_MACRO,null,true); RIU.uRImac.value=mac.texture; this.macRT=mac;
    RIU.uRIplA.value=pl.A; RIU.uRIplN.value=pl.N; RIU.uRItzA.value=tz.A; RIU.uRItzN.value=tz.N;
    RIU.uRItiA.value=ti.A; RIU.uRItiN.value=ti.N; RIU.uRIceA.value=ce.A; RIU.uRIceN.value=ce.N;
    RIU.uRIdetA.value=de.A; RIU.uRIdetN.value=de.N; RIU.uRIpano.value=pano.texture;
    this.baked=[pl,tz,ti,ce,de]; this.panoRT=pano;
    const w=new Uint8Array([230,230,230,255]); const blank=new THREE.DataTexture(new Uint8Array([0,0,0,255]),1,1); blank.needsUpdate=true;
    RIU.uRIAO.value=blank;
    FTHEME.forEach((t,i)=>{ RIU.uRIdmg.value[i]=t.damage||0; });
    /* the whole interior switches to the new materials; the objects keep
       their names so the existing systems (Walls greying, tinting) work */
    MAT.wall=RIMat.wall(); MAT.ceil=RIMat.ceil();
    MAT.floor=RIMat.floor(true); MAT.floorTile=RIMat.floor(false);
    this.envMap();
    MAT.prop=RIMat.vpbr({defR:.8,defM:.04});
    MAT.propS=RIMat.vpbr({defR:.5,defM:.35,rMul:.85});
    /* MAT.metal and MAT.conc also dress the exterior, which stays exactly
       as it was — the interior gets its own metal */
    MAT.metalI=RIMat.vpbr({defR:.55,defM:.6,defD:1,defW:.35});
    MAT.glassWin=RIMat.glass();
    MAT.curtain.roughness=.95;
    MAT.signExit=new THREE.MeshBasicMaterial({map:this.exitTex(),toneMapped:false});
    this.torchCookie();
    if(set) set(1,'MATERIALS');
  },
  /* a dim hospital room as seen by chrome: without it every polished
     metal surface lit only by a hand torch reads as black */
  envMap(){
    try{
      const sc=new THREE.Scene();
      const box=new THREE.Mesh(new THREE.BoxGeometry(12,3.2,6),new THREE.MeshBasicMaterial({color:0x2a2c2d,side:THREE.BackSide}));
      box.position.y=1.3; sc.add(box);
      const fl=new THREE.Mesh(new THREE.PlaneGeometry(12,6),new THREE.MeshBasicMaterial({color:0x4a4a47})); fl.rotation.x=-Math.PI/2; fl.position.y=-.29; sc.add(fl);
      for(let i=-2;i<=2;i++){ const t=new THREE.Mesh(new THREE.PlaneGeometry(1.2,.3),new THREE.MeshBasicMaterial({color:0xffffff}));
        t.material.color.setScalar(3.2); t.rotation.x=Math.PI/2; t.position.set(i*2.6,2.88,0); sc.add(t); }
      const w=new THREE.Mesh(new THREE.PlaneGeometry(1.6,1.2),new THREE.MeshBasicMaterial({color:0x2a3444})); w.position.set(0,1.4,-2.99); sc.add(w);
      const pm=new THREE.PMREMGenerator(renderer);
      const rt=pm.fromScene(sc,.04,.1,30); pm.dispose();
      this.env=rt.texture;
    }catch(e){ console.warn('RI env',e); this.env=null; }
  },
  exitTex(){
    const c=document.createElement('canvas'); c.width=512; c.height=160; const g=c.getContext('2d');
    g.fillStyle='#0c7a3a'; g.fillRect(0,0,512,160);
    g.strokeStyle='rgba(255,255,255,.9)'; g.lineWidth=6; g.strokeRect(8,8,496,144);
    g.fillStyle='#f4fff6'; g.font='700 86px Arial,Helvetica,sans-serif'; g.textAlign='left'; g.textBaseline='middle';
    g.fillText('EXIT',138,84);
    g.save(); g.translate(78,80); g.fillStyle='#f4fff6';
    g.beginPath(); g.arc(8,-40,11,0,7); g.fill(); g.lineWidth=11; g.lineCap='round'; g.strokeStyle='#f4fff6';
    g.beginPath(); g.moveTo(2,-24); g.lineTo(-6,8); g.lineTo(-26,30); g.moveTo(-6,8); g.lineTo(16,22); g.lineTo(16,44);
    g.moveTo(0,-18); g.lineTo(24,-6); g.moveTo(0,-18); g.lineTo(-22,-4); g.stroke(); g.restore();
    g.fillStyle='#f4fff6'; g.beginPath(); g.moveTo(478,80); g.lineTo(440,52); g.lineTo(440,68); g.lineTo(400,68); g.lineTo(400,92); g.lineTo(440,92); g.lineTo(440,108); g.closePath(); g.fill();
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=RIQ.aniso; return t;
  },
  deptTex(fi){
    const SUB=['BASEMENT · MORTUARY · STORES · GENERATOR','GROUND FLOOR · CASUALTY · REGISTRATION','GENERAL MEDICINE · MALE & FEMALE WARDS',
      'MEDICAL RECORDS · ADMINISTRATION','PAEDIATRICS · NEONATAL CARE','OPERATION THEATRES · X-RAY · RADIOLOGY',
      'CENTRAL PHARMACY · DRUG STORE','WING CLOSED · NO ENTRY','PSYCHIATRY · COUNSELLING','INTENSIVE CARE · HIGH DEPENDENCY','LABOUR ROOM · MATERNITY · NURSERY'];
    const c=document.createElement('canvas'); c.width=1024; c.height=176; const g=c.getContext('2d');
    g.fillStyle='#ece5cf'; g.fillRect(0,0,1024,176);
    g.fillStyle='#1f5f55'; g.beginPath(); g.arc(78,88,58,0,7); g.fill();
    g.fillStyle='#ece5cf'; g.font='700 30px Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle'; g.fillText('IGMC',78,80);
    g.font='600 15px Arial,sans-serif'; g.fillText('SHIMLA',78,106);
    g.fillStyle='#1b2a26'; g.textAlign='left';
    g.font='700 60px Arial,Helvetica,sans-serif'; g.fillText((FTHEME[fi]&&FTHEME[fi].name)||'',160,70);
    g.font='600 25px Arial,Helvetica,sans-serif'; g.fillStyle='#3d4a45'; g.fillText(SUB[fi]||'',162,128);
    g.fillStyle='#7d1010'; g.fillRect(900,40,96,96); g.fillStyle='#ece5cf'; g.font='700 56px Arial,sans-serif'; g.textAlign='center';
    g.fillText(fi===0?'B':(fi===1?'G':String(fi)),948,90);
    for(let i=0;i<260;i++){ const h=k=>riHash(i,k,fi); g.fillStyle='rgba(90,70,40,'+(h(1)*.08).toFixed(3)+')'; g.fillRect(h(2)*1024,h(3)*176,2+h(4)*30,1+h(5)*6); }
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=RIQ.aniso; return t;
  },
  plateTex(fi,rooms){
    const KN={ward:['WARD','GENERAL'],wardA:['WARD','MALE'],wardB:['WARD','FEMALE'],store:['STORE','STAFF ONLY'],storeA:['STORE','STAFF ONLY'],storeB:['DRUG STORE','STAFF ONLY'],
      office:['OFFICE','ADMIN'],duty:['DUTY ROOM','NURSING'],waiting:['WAITING','PATIENTS'],records:['RECORDS','FILES'],records2:['RECORDS','FILES'],
      peds:['CHILD WARD','PAEDIATRIC'],ot:['O.T.','NO ENTRY'],ot2:['O.T.','NO ENTRY'],pharmacy:['PHARMACY','DISPENSARY'],icu:['I.C.U.','NO ENTRY'],
      psych:['PSYCHIATRY','OPD'],morgue:['MORTUARY','STAFF ONLY'],maternity:['LABOUR ROOM','MATERNITY'],prayer:['PRAYER','ROOM']};
    const cols=8, rows=4, W=128, H=64, c=document.createElement('canvas'); c.width=cols*W; c.height=rows*H;
    const g=c.getContext('2d');
    rooms.forEach((r,k)=>{ const x=(k%cols)*W, y=((k/cols)|0)*H;
      g.fillStyle='#f1eee4'; g.fillRect(x,y,W,H); g.fillStyle='#1d5f56'; g.fillRect(x,y,34,H);
      g.fillStyle='#f1eee4'; g.font='700 22px Arial,sans-serif'; g.textAlign='center'; g.textBaseline='middle';
      const pre=fi===0?'B':(fi===1?'G':String(fi));
      g.save(); g.translate(x+17,y+H/2); g.rotate(-Math.PI/2); g.fillText(pre,0,1); g.restore();
      g.fillStyle='#1b1f1e'; g.font='700 26px Arial,sans-serif'; g.fillText(pre+String(k+1).padStart(2,'0'),x+82,y+17);
      const kn=KN[r.kind]||['ROOM',''];
      g.font='700 '+(kn[0].length>8?13:16)+'px Arial,sans-serif'; g.fillText(kn[0],x+82,y+39);
      g.font='600 10px Arial,sans-serif'; g.fillStyle='#5a5f5c'; g.fillText(kn[1],x+82,y+54);
      for(let i=0;i<30;i++){ const h=j=>riHash(i,j+k*7,fi); g.fillStyle='rgba(80,60,30,'+(h(1)*.1).toFixed(3)+')'; g.fillRect(x+h(2)*W,y+h(3)*H,1+h(4)*9,1+h(5)*3); }
    });
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.anisotropy=RIQ.aniso; return t;
  },
  torchCookie(){
    const N=256, c=document.createElement('canvas'); c.width=c.height=N; const g=c.getContext('2d');
    const im=g.createImageData(N,N), d=im.data;
    for(let y=0;y<N;y++)for(let x=0;x<N;x++){
      const u=(x+.5)/N*2-1, v=(y+.5)/N*2-1, r=Math.hypot(u,v);
      let k=0;
      if(r<1){
        const hot=Math.exp(-r*r*9.5)*.55;
        const ring=.13*Math.exp(-Math.pow((r-.36)/.045,2))+.07*Math.exp(-Math.pow((r-.52)/.03,2));
        const spill=.62*(1-smoothstepJS(.52,1.0,r));
        const dip=-.08*Math.exp(-Math.pow((r-.24)/.06,2));
        const smudge=.06*(riNoise(u*5+2,v*5,1.7)-.5)+.03*(riNoise(u*14,v*14,5)-.5);
        k=Math.max(0,Math.min(1,.42+hot+ring+spill*.45+dip+smudge*(1-r))*(1-smoothstepJS(.9,1,r)));
      }
      const i=(y*N+x)*4; d[i]=d[i+1]=d[i+2]=Math.round(k*255); d[i+3]=255;
    }
    g.putImageData(im,0,0);
    const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping;
    this.cookie=t;
  },
  applyCookie(){
    if(!this.cookie||!Torch.spot) return;
    Torch.spot.map=this.cookie;
    /* the cookie takes a little light out of the spill; give it back so the
       beam lands as bright as it always did in the middle */
    Torch.power=Torch.power*1.12;
  },
  /* ---- replace the prop library with the modelled versions ---- */
  buildProps(){
    const names=Object.keys(RIP);
    for(const n of names){
      const old=PROPS[n]; if(!old) continue;
      old.computeBoundingBox(); this.origV[n]=old.attributes.position.count; this.origBB[n]=old.boundingBox.clone();
      const b=old.boundingBox;
      let g;
      try{ g=RIP[n](); riFit(g,[b.min.x,b.min.y,b.min.z],[b.max.x,b.max.y,b.max.z],RIPfit[n]||'exact'); }
      catch(e){ console.warn('RI prop failed, keeping original',n,e); continue; }
      PROPS[n]=g; this.hp.add(n);
    }
    /* legacy props keep their shape but learn the PBR attribute */
    for(const n in PROPS){ const g=PROPS[n]; if(g.attributes.pbr) continue;
      const cnt=g.attributes.position.count, a=new Float32Array(cnt*4);
      for(let i=0;i<cnt;i++){ a[i*4]=.62; a[i*4+1]=.05; a[i*4+2]=0; a[i*4+3]=.25; }
      g.setAttribute('pbr',new THREE.BufferAttribute(a,4)); }
    const G=this.geo;
    G.doorLeaf=RIX.doorLeaf(false); G.doorMetal=RIX.doorLeaf(true);
    G.troffer=RIX.troffer(); G.tubes=RIX.tubes(); G.smoke=RIX.smoke();
    G.glowQuad=new THREE.PlaneGeometry(2.4,1.4); G.glowQuad.rotateX(-Math.PI/2);
    G.switch=RIX.switchPlate(); G.socket=RIX.socket(); G.conduit=RIX.conduit(); G.clip=RIX.clip();
    G.binY=RIX.bin(0xe0b21a); G.binR=RIX.bin(0xb3261e); G.binB=RIX.bin(0x2a5aa8); G.binK=RIX.bin(0x222426);
    G.cooler=RIX.cooler(); G.hose=RIX.hoseReel(); G.alarm=RIX.alarm(); G.sanitizer=RIX.sanitizer(); G.dome=RIX.dome();
    G.notice24=RIX.notice(2.3,1.0); G.notice28=RIX.notice(2.7,1.0); G.fan=RIX.fan();
    G.boxS=RIX.box(false); G.boxB=RIX.box(true); G.stool=RIX.stool(); G.jars=RIX.jars(); G.traySet=RIX.traySet();
    G.rub0=RIX.rubble(0); G.rub1=RIX.rubble(1); G.rub2=RIX.rubble(2); G.tileChunk=RIX.tileChunk();
    G.exitBox=RIX.exitBox();
    const paper=(curl)=>{ const g=new GB();
      g.add(RIG.cloth(.21,.297,6,8,(x,yy)=>[0,0,curl*(Math.pow(Math.abs(x)/.105,2)*.012+Math.max(0,yy/.15)*.01)],true),MX(0,.001,0,-Math.PI/2,0,0),
        RIspec(RK.paper,{c:0xffffff,w:.3}),(x,y,z,c)=>{ if(Math.abs(((z*55)%1+1)%1-.5)<.1&&Math.abs(x)<.08&&z<.12) c.multiplyScalar(.6); });
      return g.geometry(); };
    G.paperA=paper(1); G.paperB=paper(-.4);
    { const d=new GB(); const fr=RIspec(RK.paintWhite,{c:0xe6e4dd,w:.3});
      d.add(RIG.rbox(.6,.02,.6,.006,1),MX(0,-.01,0),fr);
      for(let i=0;i<4;i++){ const s=.5-i*.11; for(const [x,z,w,dd] of [[0,s/2,s,.012],[0,-s/2,s,.012],[s/2,0,.012,s],[-s/2,0,.012,s]])
        d.add(RIG.box(w,.03,dd),MX(x,-.03-i*.004,z),fr); }
      d.add(RIG.box(.1,.004,.1),MX(0,-.045,0),RIspec(RK.plBlack,{c:0x0c0c0c}));
      G.diffuser=d.geometry(); }
    { const h=new GB(); h.add(RIG.box(.576,.004,.576),MX(),RIspec(RK.plBlack,{c:0x040404,r:1})); G.hole=h.geometry(); } G.bench=riBench3(2.02,0x5d88ad);
    G.win14=RIX.windowSet(1.4,1.45);
    const lg=new GB();
    lg.add(RIG.rbox(.64,2.32,.09,.012,2),MX(0,0,0),RIspec(RK.steel,{c:0xb6bbbe,w:.06,r:.26}));
    lg.add(RIG.box(.004,2.2,.092),MX(.3,0,0),RK.plBlack);
    G.elevDoor=lg.geometry();
    this.ready=true;
  },
  /* ---- per-floor context ---- */
  beginFloor(F,fi,TH,y,CH,B){
    const ctx={F,fi,TH,y,CH,B,walls:[],ops:[],inst:new Map(),arch:new GB(),aoProps:[],signs:[],glass:new GB(),boards:[],
      rng:mulberry(4242+fi*977)};
    F.riWalls=ctx.walls; F.ri=ctx; this.floors[fi]=ctx;
    return ctx;
  },
  wall(ctx,axis,f,a,b){ ctx.walls.push({axis,f,a,b}); },
  open(ctx,axis,f,at,w){ ctx.ops.push({axis,f,at,w}); },
  put(ctx,key,geo,m,col,shadow=true){
    let e=ctx.inst.get(key);
    if(!e){ e={geo,items:[],shadow,mat:MAT.prop}; ctx.inst.set(key,e); }
    e.items.push({m,c:col===undefined||col===null?null:new THREE.Color(col)});
  },
  aoFoot(ctx,x,z,w,d,ry,k){ if(k>0&&w*d>.02) ctx.aoProps.push({x,z,w,d,ry,k}); },
  AOK:{'01_hospital_bed':.8,'28_damaged_hospital_bed':.8,'02_wheelchair':.45,'27_broken_wheelchair':.45,'03_stretcher_trolley':.6,
    '04_iv_stand':.22,'05_patient_monitor':.25,'06_oxygen_cylinder':.4,'07_medicine_cabinet':1,'08_hiding_locker':1,'09_nurse_station_desk':1,
    '10_waiting_bench':.55,'11_baby_cradle':.45,'12_morgue_freezer_unit':1,'14_emergency_generator':1,'16_cctv_terminal':.7,
    '29_blood_stained_curtain':.15,'32_file_record_stack':.5,'18_baby_blanket':.3,'31_nursery_toy':.4,'30_medical_tray_tools':.3},
  /* addDeco routes the modelled props here: one instanced batch per prop per floor quarter */
  deco(ctx,name,x,yy,z,ry,rx,sc,tint){
    if(!this.hp.has(name)) return false;
    const m=new THREE.Matrix4().makeTranslation(x,yy,z)
      .multiply(new THREE.Matrix4().makeRotationY(ry||0))
      .multiply(new THREE.Matrix4().makeRotationX(rx||0))
      .multiply(new THREE.Matrix4().makeScale(sc||1,sc||1,sc||1));
    this.put(ctx,'hp:'+name,PROPS[name],m,tint);
    const k=this.AOK[name]||0, bb=PROPS[name].boundingBox;
    if(k&&yy-ctx.y<.3) this.aoFoot(ctx,x,z,(bb.max.x-bb.min.x)*(sc||1),(bb.max.z-bb.min.z)*(sc||1),ry||0,k);
    return true;
  },
  /* a lit or dead ceiling fitting; returns the emissive tube mesh for a lit one */
  fixture(ctx,x,z,lamp,lit){
    const y=ctx.y+ctx.CH;
    this.put(ctx,'troffer',this.geo.troffer,new THREE.Matrix4().makeTranslation(x,y,z),null,false);
    if(!lit){ this.put(ctx,'deadTube',this.geo.tubes,new THREE.Matrix4().makeTranslation(x,y,z),0x8c8f8c,false); return null; }
    const tube=new THREE.Mesh(this.geo.tubes,new THREE.MeshBasicMaterial({color:lamp,toneMapped:false}));
    tube.position.set(x,y,z); tube.castShadow=false; tube.receiveShadow=false;
    /* the haze a lit tube throws round itself; it shares the tube's colour
       object, so it flickers and dies with it */
    const glow=new THREE.Mesh(this.geo.glowQuad,new THREE.ShaderMaterial({uniforms:{uC:{value:tube.material.color}},
      vertexShader:'varying vec2 vP; void main(){ vP=position.xz; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader:`uniform vec3 uC; varying vec2 vP;
        void main(){ vec2 q=abs(vP)-vec2(.58,.13); float d=length(max(q,0.));
          float I=exp(-d*d*26.)*.42+exp(-d*5.)*.10; gl_FragColor=vec4(uC*I,1.); }`,
      transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide}));
    glow.position.y=-.098; glow.renderOrder=2; glow.frustumCulled=true; tube.add(glow);
    ctx.F.group.add(tube);
    return tube;
  },
  sign(ctx,x,yy,z,nx,nz,w,h){ ctx.signs.push({x,yy,z,nx,nz,w,h}); },
  /* ---------------- dressing a floor ---------------- */
  dressFloor(ctx){
    const {F,fi,TH,y,CH,B}=ctx, A=ctx.arch, R=ctx.rng;
    const T=WALL_T;
    /* skirting on every wall face that faces the inside */
    const skirt=TH.floorMode==='tile'?RIspec(RK.ceramic,{c:0xd4d1c6,r:.22,w:.3}):RIspec(RK.terr,{c:0x8f8d86,w:.35});
    for(const s of ctx.walls){
      const len=s.b-s.a; if(len<.08) continue;
      const mid=(s.a+s.b)/2;
      for(const side of [-1,1]){
        if(s.axis==='x'&&Math.abs(Math.abs(s.f)-(HZ-T/2))<.01&&Math.sign(s.f)===side) continue;
        if(s.axis==='z'&&Math.abs(Math.abs(s.f)-(HX-T/2))<.01&&Math.sign(s.f)===side) continue;
        const off=s.f+side*(T/2+.007);
        if(s.axis==='x') A.add(RIG.rbox(len,.1,.014,.004,1),MX(mid,y+.05,off),skirt);
        else A.add(RIG.rbox(.014,.1,len,.004,1),MX(off,y+.05,mid),skirt);
      }
      ctx.aoWall=ctx.aoWall||[];
      if(s.axis==='x') ctx.aoWall.push([s.a,s.f-T/2,s.b,s.f+T/2]); else ctx.aoWall.push([s.f-T/2,s.a,s.f+T/2,s.b]);
    }
    /* door frames and thresholds */
    const frameC=RIspec(RK.wood,{c:0x4c3222,r:.42,w:.4}), guard=RIspec(RK.steel,{w:.25});
    for(const o of ctx.ops){
      const wide=o.w>1.7, hw=o.w/2, D=T+.035;
      const put=(lx,ly,lz,sx,sy,sz,spec,round)=>{ const g=round?RIG.rbox(sx,sy,sz,round,1):RIG.box(sx,sy,sz);
        if(o.axis==='x') A.add(g,MX(o.at+lx,y+ly,o.f+lz),spec); else A.add(g,MX(o.f+lz,y+ly,o.at+lx,0,Math.PI/2,0),spec); };
      if(!wide){
        for(const s of [-1,1]){
          put(s*(hw+.035),1.175,0,.07,2.35,D,frameC,.006);
          for(const f of [-1,1]) put(s*(hw+.1),1.2,f*(T/2+.009),.05,2.4,.018,frameC,.005);
        }
        put(0,2.385,0,o.w+.14,.07,D,frameC,.006);
        for(const f of [-1,1]) put(0,2.44,f*(T/2+.009),o.w+.25,.05,.018,frameC,.005);
        put(0,.003,0,o.w,.006,T+.03,RIspec(RK.alu,{c:0xa7a29a,w:.5}),0);
      } else {
        for(const s of [-1,1]) for(const f of [-1,1]){
          put(s*(hw+.01),.75,f*(T/2+.01),.05,1.5,.004,guard,0);
          put(s*(hw+.001),.75,f*(T/2-.015),.004,1.5,.05,guard,0);
        }
        put(0,2.36,0,o.w+.02,.03,T+.02,RIspec(RK.paintWhite,{c:0xd9d6cc}),0);
      }
    }
    /* windows in every perimeter room above ground */
    if(fi>0) for(const r of F.rooms){
      const walls=[];
      if(r.z1>=HZ-BAND-.01&&r.door.axis==='x'&&r.z1>=HZ-.5) walls.push({axis:'x',f:HZ-T,a:r.x0,b:r.x1,n:-1});
      if(r.z0<=-HZ+BAND+.01&&r.door.axis==='x'&&r.z0<=-HZ+.5) walls.push({axis:'x',f:-HZ+T,a:r.x0,b:r.x1,n:1});
      if(r.x1>=HX-.5) walls.push({axis:'z',f:HX-T,a:r.z0,b:r.z1,n:-1});
      if(r.x0<=-HX+.5) walls.push({axis:'z',f:-HX+T,a:r.z0,b:r.z1,n:1});
      for(const w of walls){
        const span=(w.b-w.a)-1.4; if(span<1.6) continue;
        const n=span>4.4?2:1;
        for(let i=0;i<n;i++){
          const c=w.a+.7+span*(n===1?.5:(i+.5)/n)+.0;
          const ry=w.axis==='x'?(w.n>0?0:Math.PI):(w.n>0?Math.PI/2:-Math.PI/2);
          const px=w.axis==='x'?c:w.f, pz=w.axis==='x'?w.f:c;
          if(ctx.signs.some(q=>Math.hypot(q.x-px,q.z-pz)<1.45)) continue;
          const m=MX(px,y+.95,pz,0,ry,0);
          this.put(ctx,'win',this.geo.win14,m,null,true);
          (ctx.spill||(ctx.spill=[])).push(MX(px,y+.006,pz,0,ry,0));
          ctx.glass.add(RIG.plane(1.4,1.45),new THREE.Matrix4().multiplyMatrices(m,MX(0,.725,.006)),{c:0xffffff});
        }
      }
    }
    /* smoke detectors along the corridor ring, CCTV at its corners */
    const zb=HZ-BAND, xb=HX-BAND, CZN=zb-CORR/2, CZS=-CZN, CXE=xb-CORR/2, CXW=-CXE;
    for(let x=-24;x<=24;x+=8){ for(const z of [CZN,CZS]) this.put(ctx,'smoke',this.geo.smoke,MX(x+3.5,y+CH,z+.6),null,false); }
    for(let z=-8;z<=8;z+=8){ for(const x of [CXE,CXW]) this.put(ctx,'smoke',this.geo.smoke,MX(x+.6,y+CH,z+2),null,false); }
    for(const [x,z] of [[CXE-.9,CZN-.9],[CXW+.9,CZS+.9],[CXE-.9,CZS+.9],[CXW+.9,CZN-.9]]) this.put(ctx,'dome',this.geo.dome,MX(x,y+CH,z),null,false);
    /* switch plates, sockets and surface conduit beside every room door */
    for(const r of F.rooms){
      const d=r.door, dir=r.dir, ax=d.axis;
      const face=(ax==='x'?d.z:d.x)+dir*(T/2+.001);
      const lat=(ax==='x'?d.x:d.z)+.725+.28;
      const ry=ax==='x'?(dir>0?0:Math.PI):(dir>0?Math.PI/2:-Math.PI/2);
      const P=(l,h)=>ax==='x'?[l,y+h,face]:[face,y+h,l];
      let p=P(lat,1.25); this.put(ctx,'switch',this.geo.switch,MX(p[0],p[1],p[2],0,ry,0),null,false);
      p=P(lat,1.32); const len=CH-1.32;
      this.put(ctx,'conduit',this.geo.conduit,MX(p[0],p[1],p[2],0,ry,0,1,len,1),null,false);
      for(let k=1;k<4;k++){ p=P(lat,1.32+len*k/4); this.put(ctx,'clip',this.geo.clip,MX(p[0],p[1],p[2],0,ry,0),null,false); }
      if(R()<.8){ p=P(lat+.7,.32); this.put(ctx,'socket',this.geo.socket,MX(p[0],p[1],p[2],0,ry,0),null,false); }
      if((r.kind==='ward'||r.kind==='wardA'||r.kind==='wardB'||r.kind==='icu'||r.kind==='maternity')&&R()<.7){
        const cf=(ax==='x'?d.z:d.x)-dir*(T/2+.001), cry=ax==='x'?(dir>0?Math.PI:0):(dir>0?-Math.PI/2:Math.PI/2);
        const q=ax==='x'?[(ax==='x'?d.x:d.z)-1.05,y+1.35,cf]:[cf,y+1.35,(ax==='x'?d.x:d.z)-1.05];
        this.put(ctx,'sanitizer',this.geo.sanitizer,MX(q[0],q[1],q[2],0,cry,0),null,false);
      }
    }
    /* room plates on the corridor side of every door, and supply-air
       diffusers in the rooms of the theatre and critical-care floors */
    { const plates=[]; const cols=8, rows=4;
      F.rooms.forEach((r,k)=>{ if(k>=cols*rows) return;
        const d=r.door, dir=r.dir, ax=d.axis;
        const face=(ax==='x'?d.z:d.x)-dir*(T/2+.004);
        const lat=(ax==='x'?d.x:d.z)-.725-.34;
        const nx=ax==='x'?0:-dir, nz=ax==='x'?-dir:0;
        const p=ax==='x'?[lat,y+1.82,face]:[face,y+1.82,lat];
        plates.push({k,r,p,nx,nz});
        if((TH.key==='ot'||TH.key==='icu')&&r.x1-r.x0>3&&r.z1-r.z0>3)
          this.put(ctx,'diff',this.geo.diffuser,MX((r.x0+r.x1)/2+.3,y+CH,(r.z0+r.z1)/2+.3),null,false);
      });
      if(plates.length){
        const tex=this.plateTex(fi,F.rooms.slice(0,cols*rows)), P=[],N=[],U=[],I=[];
        for(const q of plates){
          const tx=q.nz, tz=-q.nx, hw=.14, hh=.07, cx=q.k%cols, cy=(q.k/cols)|0;
          const u0=cx/cols,u1=(cx+1)/cols,v1=1-cy/rows,v0=1-(cy+1)/rows, b=P.length/3;
          const put=(sx,sy,uu,vv)=>{ P.push(q.p[0]+q.nx*.012+tx*sx,q.p[1]+sy,q.p[2]+q.nz*.012+tz*sx); N.push(q.nx,0,q.nz); U.push(uu,vv); };
          put(-hw,-hh,u0,v0); put(hw,-hh,u1,v0); put(hw,hh,u1,v1); put(-hw,hh,u0,v1);
          I.push(b,b+1,b+2,b,b+2,b+3);
          const ry=Math.atan2(q.nx,q.nz);
          A.add(RIG.rbox(.3,.16,.01,.004,1),MX(q.p[0]+q.nx*.005,q.p[1],q.p[2]+q.nz*.005,0,ry,0),RIspec(RK.alu,{c:0x8f9496,w:.3}));
        }
        const g=new THREE.BufferGeometry();
        g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
        g.setAttribute('uv',new THREE.Float32BufferAttribute(U,2)); g.setIndex(I); g.computeBoundingSphere();
        const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({map:tex,roughness:.45,metalness:0,polygonOffset:true,polygonOffsetFactor:-2}));
        m.receiveShadow=true; F.group.add(m);
      }
    }
    /* safety kit at the stair door, water cooler in the lift lobby, BMW bins */
    if(fi>0){
      this.put(ctx,'hose',this.geo.hose,MX(-13.4,y+1.25,SWR.z0-T/2,0,Math.PI,0),null,true);
      this.put(ctx,'alarm',this.geo.alarm,MX(-8.95,y+1.45,SWR.z0-T/2,0,Math.PI,0),null,false);
      this.put(ctx,'cooler',this.geo.cooler,MX(F.lobby.x1-T/2-.27,y,F.lobby.z0+1.35,0,-Math.PI/2,0),null,true);
      this.aoFoot(ctx,F.lobby.x1-T/2-.27,F.lobby.z0+1.35,.5,.6,0,.9);
      const du=F.special&&F.special.duty;
      if(du){ const bz=du.door.axis==='x'?du.door.z:du.door.x;
        const along=du.door.axis==='x', s=(du.dir>0?-1:1);
        ['binY','binR','binB','binK'].forEach((k,i)=>{
          const l=(along?du.door.x:du.door.z)+1.3+i*.36, f=bz+s*(T/2+.2);
          const p=along?[l,y,f]:[f,y,l];
          this.put(ctx,k,this.geo[k],MX(p[0],p[1],p[2],0,(along?(s>0?0:Math.PI):(s>0?Math.PI/2:-Math.PI/2))+(R()-.5)*.3,0),null,true);
          this.aoFoot(ctx,p[0],p[2],.3,.3,0,.6); });
      }
    }
    /* frames round the Hindi notice boards */
    for(const s of ctx.signs){
      if(s.noFrame) continue;
      const tx=s.nz, tz=-s.nx, ox=s.nx*.028, oz=s.nz*.028, fr=RIspec(RK.alu,{c:0x9ea3a5,w:.3});
      const bar=(cx,cy,w,h)=>{ const g=RIG.rbox(Math.abs(tx)>.5?w:.022,h,Math.abs(tz)>.5?w:.022,.004,1);
        A.add(g,MX(s.x+ox+tx*cx,s.yy+cy,s.z+oz+tz*cx),fr); };
      bar(0,s.h/2+.012,s.w+.05,.025); bar(0,-s.h/2-.012,s.w+.05,.025);
      const sidew=(cx)=>{ const g=RIG.rbox(.025,s.h,.025,.004,1); A.add(g,MX(s.x+ox+tx*cx,s.yy,s.z+oz+tz*cx),fr); };
      sidew(-s.w/2-.012); sidew(s.w/2+.012);
      A.add(RIG.box(Math.abs(tx)>.5?s.w+.02:.012,s.h+.02,Math.abs(tz)>.5?s.w+.02:.012),MX(s.x+s.nx*.02,s.yy,s.z+s.nz*.02),RIspec(RK.paintWhite,{c:0x2c2f30}));
    }
    /* paper, dropped and never picked up: more of it the worse the floor */
    { const n=Math.round(8+60*TH.damage), zb2=HZ-BAND, xb2=HX-BAND;
      for(let i=0;i<n;i++){
        const onX=R()<.62; let px,pz;
        if(onX){ px=-HX+2+R()*(2*HX-4); pz=(R()<.5?-1:1)*(zb2-CORR/2+(R()-.5)*(CORR-.9)); }
        else { pz=-zb2+1+R()*(2*zb2-2); px=(R()<.5?-1:1)*(xb2-CORR/2+(R()-.5)*(CORR-.9)); }
        if(px>RUN.x0-.5&&px<RUN.x1+.5&&pz>RUN.z0-.5&&pz<RUN.z1+.5) continue;
        this.put(ctx,R()<.5?'paperA':'paperB',R()<.5?this.geo.paperA:this.geo.paperB,MX(px,y+.003,pz,0,R()*6.283,0),
          [0xe9e4d6,0xd9d2bd,0xc9c0a4,0xe3dccd][(R()*4)|0],false);
      } }
    /* ceiling tiles that have dropped out of the grid on the bad floors */
    if(TH.damage>.25&&fi>0){
      const n=Math.round(TH.damage*14), zb2=HZ-BAND, xb2=HX-BAND;
      for(let i=0;i<n;i++){
        const onX=R()<.6; let px,pz;
        if(onX){ px=-HX+3+R()*(2*HX-6); pz=(R()<.5?-1:1)*(zb2-CORR/2+(R()-.5)*(CORR-1.4)); }
        else { pz=-zb2+2+R()*(2*zb2-4); px=(R()<.5?-1:1)*(xb2-CORR/2+(R()-.5)*(CORR-1.4)); }
        const cx=(Math.floor(px/.6)+.5)*.6, cz=(Math.floor(pz/.6)+.5)*.6;
        if(Math.abs(cx-RUN.x0)<4&&cz>RUN.z0-1&&cz<RUN.z1+1) continue;
        this.put(ctx,'hole',this.geo.hole,MX(cx,y+CH-.004,cz),null,false);
        const yaw=((R()*4)|0)*Math.PI/2, a=.7+R()*.7;
        const m=new THREE.Matrix4().makeTranslation(cx,y+CH-.012,cz)
          .multiply(new THREE.Matrix4().makeRotationY(yaw)).multiply(new THREE.Matrix4().makeTranslation(0,0,-.3))
          .multiply(new THREE.Matrix4().makeRotationX(a)).multiply(new THREE.Matrix4().makeTranslation(0,0,.3));
        if(R()<.7) this.put(ctx,'tileChunk',this.geo.tileChunk,m,0xcfc9bd,true);
        else this.put(ctx,'tileChunk',this.geo.tileChunk,MX(cx+(R()-.5)*.6,y+.008,cz+(R()-.5)*.6,(R()-.5)*.1,R()*6.28,(R()-.5)*.1),0xbdb7aa,true);
        for(let k=0;k<2;k++) this.put(ctx,'rub'+k,this.geo['rub'+k],MX(cx+(R()-.5)*.8,y+.02,cz+(R()-.5)*.8,R(),R()*6.28,R(),.06+R()*.05,.04,.06+R()*.05));
        if(R()<.6){ const c=RIG.curve([[cx+.1,y+CH+.05,cz],[cx+.15,y+CH-.4,cz+.05],[cx+.05,y+CH-.9-R()*.4,cz+.12],[cx-.02,y+CH-1.1-R()*.3,cz+.08]],24);
          A.add(RIG.sweep(c,.005,5,true),MX(),R()<.5?RK.plBlack:RIspec(RK.paintRed,{c:0x6b1410,r:.5,d:5}));
          A.add(RIG.cyl(.0022,.0022,.012,5),MX(c[c.length-1].x,c[c.length-1].y-.006,c[c.length-1].z),RIspec(RK.brass,{c:0xc07a3a})); }
      }
    }
    if(ctx.spill&&ctx.spill.length){
      const P=[],S=[],I=[];
      for(const m of ctx.spill){
        const b=P.length/3, v=new THREE.Vector3();
        const pts=[[-.8,.06],[.8,.06],[1.15,2.1],[-1.15,2.1]], uv=[[-1,0],[1,0],[1,1],[-1,1]];
        for(let k=0;k<4;k++){ v.set(pts[k][0],0,pts[k][1]).applyMatrix4(m); P.push(v.x,v.y,v.z); S.push(uv[k][0],uv[k][1]); }
        I.push(b,b+2,b+1,b,b+3,b+2);
      }
      const g=new THREE.BufferGeometry();
      g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setAttribute('spl',new THREE.Float32BufferAttribute(S,2)); g.setIndex(I);
      g.computeBoundingSphere();
      const mesh=new THREE.Mesh(g,this.spillMat()); mesh.renderOrder=1; mesh.frustumCulled=true;
      F.group.add(mesh);
    }
    /* the department name on every hanging board */
    if(ctx.boards.length){
      const mat=new THREE.MeshStandardMaterial({map:this.deptTex(fi),roughness:.55,metalness:0,polygonOffset:true,polygonOffsetFactor:-2});
      const bg=new THREE.PlaneGeometry(1.72,.3);
      for(const b of ctx.boards) for(const side of [1,-1]){
        const q=new THREE.Mesh(bg,mat);
        q.position.set(b.x,b.yy+.235,b.z);
        q.rotation.y=b.ry+(side<0?Math.PI:0);
        q.translateZ(.031); q.castShadow=false; q.receiveShadow=true;
        F.group.add(q);
      }
    }
  },
  /* stairs: treads with nosings, risers, the sloped waist, stringers,
     a painted MS balustrade and a wall rail */
  stairs(ctx){
    const {y}=ctx, A=ctx.arch;
    const runLen=RUN.z1-RUN.z0, g=runLen/RUN_STEPS, r=FLOOR_H/RUN_STEPS, w=RUN.x1-RUN.x0, cx=(RUN.x0+RUN.x1)/2;
    const tread=RIspec(RK.terr,{c:0x8f8c84,w:.45}), riser=RIspec(RK.terr,{c:0x7d7a73,w:.5});
    for(let i=0;i<RUN_STEPS;i++){
      const z0=RUN.z0+i*g, top=y+(i+1)*r;
      A.add(RIG.rbox(w,.032,g+.028,.01,2),MX(cx,top-.016,z0+g/2-.014),tread);
      A.add(RIG.box(w-.1,.004,.035),MX(cx,top+.002,z0+.012),RIspec(RK.rubber,{c:0x1c1c1c}));
      A.add(RIG.box(w,r-.03,.02),MX(cx,top-.032-(r-.03)/2,z0+.012),riser);
    }
    const ang=Math.atan2(FLOOR_H,runLen), L=Math.hypot(FLOOR_H,runLen);
    const nY=Math.cos(ang), nZ=-Math.sin(ang);
    const mz=RUN.z0+runLen/2, my=y+FLOOR_H/2;
    A.add(RIG.box(w,.16,L+.1),MX(cx,my-nY*.1,mz-nZ*.1,-ang,0,0),RIspec(RK.conc,{c:0xc6c2b8,w:.35}));
    for(const sx of [RUN.x0-.025,RUN.x1+.025]) A.add(RIG.box(.05,.34,L+.05),MX(sx,my+nY*.02,mz+nZ*.02,-ang,0,0),RIspec(RK.paintWhite,{c:0xb9b5aa,w:.12}));
    const rail=RIspec(RK.paintDark,{c:0x1f2324,w:.5}), rx=RUN.x1+.04;
    const H=(z)=>y+clamp((z-RUN.z0)/runLen,0,1)*FLOOR_H;
    const za=RUN.z0+.3, zb=RUN.z1-.05;
    const hp=[[rx,H(za)+.93,za-.28],[rx,H(za)+.93,za],[rx,H(zb)+.93,zb],[rx,H(zb)+.93,zb+.25]];
    A.add(RIG.sweep(RIG.rpath(hp,.08,5),.024,10,true),MX(),RIspec(RK.wood,{c:0x5a3a24,r:.4,w:.3}));
    A.add(RIG.sweep(RIG.rpath([[rx,H(za)+.35,za],[rx,H(zb)+.35,zb]],.05,2),.01,6,true),MX(),rail);
    for(let z=za;z<=zb+1e-6;z+=.12){ const b=H(z)+.02; A.add(RIG.rod([rx,b,z],[rx,H(z)+.91,z],.008,6),MX(),rail); }
    for(const z of [za,zb]) A.add(RIG.rod([rx,H(z)-.02,z],[rx,H(z)+.93,z],.02,10),MX(),rail);
    const wx=SWR.x0+T_HALF()+.06;
    const wp=[[wx,H(RUN.z0+.2)+.9,RUN.z0+.2],[wx,H(RUN.z1-.1)+.9,RUN.z1-.1]];
    A.add(RIG.sweep(RIG.rpath(wp,.05,2),.02,10,true),MX(),RK.steelDull);
    for(let z=RUN.z0+.6;z<RUN.z1-.1;z+=1.2){ const hy=H(z)+.9; A.add(RIG.rod([wx,hy,z],[SWR.x0+T_HALF()+.004,hy-.03,z],.008,6),MX(),RK.steelDull); }
  },
  /* the lift: stainless portal, call panel, the dark shaft behind the doors */
  lift(ctx,zc){
    const {y}=ctx, A=ctx.arch, ss=RIspec(RK.steel,{c:0xaeb3b6,w:.25});
    const X=ELEV.x;
    A.add(RIG.box(1.3,2.28,.02),MX(X,y+1.14,zc-.155),RIspec(RK.plBlack,{c:0x050606,r:1}));
    for(let i=0;i<3;i++) A.add(RIG.rod([X-.3+i*.3,y+.02,zc-.168],[X-.3+i*.3,y+2.25,zc-.168],.004,4),MX(),RIspec(RK.steelDull,{c:0x3a3c3d}));
    for(const s of [-1,1]) A.add(RIG.rbox(.52,2.7,.1,.01,2),MX(X+s*1.05,y+1.35,zc-.2),ss);
    A.add(RIG.rbox(1.6,.24,.1,.01,2),MX(X,y+2.58,zc-.2),ss);
    for(const s of [-1,1]) A.add(RIG.rbox(.14,2.4,.08,.008,2),MX(X+s*.72,y+1.2,zc-.385),ss);
    A.add(RIG.rbox(1.58,.12,.08,.008,2),MX(X,y+2.41,zc-.385),ss);
    A.add(RIG.rbox(.62,.3,.04,.008,2),MX(X,y+2.62,zc-.27),RIspec(RK.plBlack,{c:0x121314}));
    A.add(RIG.box(1.3,.012,.2),MX(X,y+.006,zc-.34),RIspec(RK.steel,{c:0x9fa4a6,d:7}));
    const cp=new GB();
    cp.add(RIG.rbox(.14,.3,.012,.004,1),MX(0,0,.006),ss);
    for(const [yy,up] of [[.05,true],[-.05,false]]){
      cp.add(RIG.cyl(.026,.026,.01,20),MX(0,yy,.014,Math.PI/2,0,0),RK.chrome);
      cp.add(RIG.torus(.021,.003,4,20),MX(0,yy,.019),RIspec(RK.ledA,{w:.9}));
      cp.add(RIG.box(.012,.012,.004),MX(0,yy+(up?.002:-.002),.02,0,0,Math.PI/4),RK.plBlack);
    }
    A.merge(cp,MX(X+1.05,y+1.25,zc-.25,0,Math.PI,0));
  },
  spillMat(){
    if(this._spill) return this._spill;
    this._spill=new THREE.ShaderMaterial({uniforms:{uF:RIU.uRIflash,uT:RIU.uRItime},
      vertexShader:'attribute vec2 spl; varying vec2 vS; void main(){ vS=spl; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader:`uniform float uF,uT; varying vec2 vS;
        void main(){
          float u=vS.x, v=vS.y;
          float bars=smoothstep(.12,.3,abs(fract(u*5.8+.5)-.5)*2.);
          float frame=smoothstep(.02,.06,abs(u))*smoothstep(.02,.05,abs(v-.62));
          float edge=1.-smoothstep(.82,1.,abs(u));
          float fall=pow(1.-v,1.6)*smoothstep(0.,.06,v)*edge;
          float I=(.018+uF*.85)*fall*(.35+.65*bars*frame);
          gl_FragColor=vec4(vec3(.52,.6,.82)*I,1.);
        }`,
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending, polygonOffset:true, polygonOffsetFactor:-4, polygonOffsetUnits:-4});
    return this._spill;
  },
  exitSign(ctx,x,yy,z,ry){ this.put(ctx,'exit',this.geo.exitBox,MX(x,yy,z,0,ry,0),null,false); },
  /* ---------------- close a floor ---------------- */
  endFloor(ctx){
    const {F}=ctx;
    try{ this.haunt(ctx); }catch(e){ console.warn('RI haunt',e); ctx.blood=null; }
    if(!ctx.arch.empty()){ const m=new THREE.Mesh(ctx.arch.geometry(),MAT.prop); m.castShadow=!IS_TOUCH; m.receiveShadow=true; F.group.add(m); }
    if(!ctx.glass.empty()){ const m=new THREE.Mesh(ctx.glass.geometry(),MAT.glassWin); m.castShadow=false; m.receiveShadow=false; F.group.add(m); }
    /* instanced batches, split into floor quarters so the frustum can cull them */
    const tmp=new THREE.Vector3();
    for(const [key,e] of ctx.inst){
      const q=[[],[],[],[]];
      for(const it of e.items){ tmp.setFromMatrixPosition(it.m); q[(tmp.x>0?1:0)+(tmp.z>0?2:0)].push(it); }
      for(const list of q){
        if(!list.length) continue;
        const im=new THREE.InstancedMesh(e.geo,e.mat,list.length);
        const anyCol=list.some(i=>i.c);
        list.forEach((it,i)=>{ im.setMatrixAt(i,it.m); if(anyCol) im.setColorAt(i,it.c||new THREE.Color(1,1,1)); });
        im.instanceMatrix.needsUpdate=true; if(im.instanceColor) im.instanceColor.needsUpdate=true;
        im.computeBoundingSphere();
        im.castShadow=e.shadow&&!IS_TOUCH; im.receiveShadow=true;
        if(!/^(troffer|deadTube|win|smoke|dome|exit|switch|socket|conduit|clip)$/.test(key)){ im.userData.riDetail=true; (F.riDetail||(F.riDetail=[])).push(im); }
        F.group.add(im);
      }
    }
    ctx.inst.clear();
    this.rasterAO(ctx);
    ctx.arch=null; ctx.glass=null;
  },
  /* ---------------- ambient-occlusion atlas ---------------- */
  rasterAO(ctx){
    const C=this.CELL, nx=Math.round(2*HX/C), nz=Math.round(2*HZ/C);
    if(!this.atlasData){ this.nx=nx; this.nz=nz; this.atlasData=new Uint8Array(nx*4*nz*3*4); }
    const occW=new Float32Array(nx*nz), occP=new Float32Array(nx*nz);
    const fill=(arr,x0,z0,x1,z1,v)=>{
      const i0=Math.max(0,Math.floor((x0+HX)/C)), i1=Math.min(nx-1,Math.ceil((x1+HX)/C)-1);
      const j0=Math.max(0,Math.floor((z0+HZ)/C)), j1=Math.min(nz-1,Math.ceil((z1+HZ)/C)-1);
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){ const k=j*nx+i; if(arr[k]<v) arr[k]=v; } };
    for(const w of (ctx.aoWall||[])) fill(occW,w[0],w[1],w[2],w[3],1);
    for(const p of ctx.aoProps){
      const c=Math.cos(p.ry),s=Math.sin(p.ry), ex=(Math.abs(c)*p.w+Math.abs(s)*p.d)/2, ez=(Math.abs(s)*p.w+Math.abs(c)*p.d)/2;
      const i0=Math.max(0,Math.floor((p.x-ex+HX)/C)), i1=Math.min(nx-1,Math.floor((p.x+ex+HX)/C));
      const j0=Math.max(0,Math.floor((p.z-ez+HZ)/C)), j1=Math.min(nz-1,Math.floor((p.z+ez+HZ)/C));
      for(let j=j0;j<=j1;j++)for(let i=i0;i<=i1;i++){
        const wx=-HX+(i+.5)*C-p.x, wz=-HZ+(j+.5)*C-p.z;
        const lx=wx*c-wz*s, lz=wx*s+wz*c;
        if(Math.abs(lx)<=p.w/2*.92&&Math.abs(lz)<=p.d/2*.92){ const k=j*nx+i; if(occP[k]<p.k) occP[k]=p.k; } }
    }
    const blur=(src,r,passes)=>{ let a=src, b=new Float32Array(a.length);
      for(let p=0;p<passes;p++){
        for(let j=0;j<nz;j++){ let acc=0; const row=j*nx;
          for(let i=-r;i<=r;i++) acc+=a[row+clamp(i,0,nx-1)];
          for(let i=0;i<nx;i++){ b[row+i]=acc/(2*r+1); acc+=a[row+clamp(i+r+1,0,nx-1)]-a[row+clamp(i-r,0,nx-1)]; } }
        for(let i=0;i<nx;i++){ let acc=0;
          for(let j=-r;j<=r;j++) acc+=b[clamp(j,0,nz-1)*nx+i];
          for(let j=0;j<nz;j++){ a[j*nx+i]=acc/(2*r+1); acc+=b[clamp(j+r+1,0,nz-1)*nx+i]-b[clamp(j-r,0,nz-1)*nx+i]; } }
      }
      return a; };
    const R=blur(Float32Array.from(occW),2,2), G=blur(Float32Array.from(occP),2,2), Bb=blur(Float32Array.from(occW),7,2);
    const fi=ctx.fi, col=fi%4, row=Math.floor(fi/4), W=nx*4, D=this.atlasData;
    for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){
      const k=j*nx+i, o=((row*nz+j)*W+(col*nx+i))*4;
      const wallIn=occW[k]>.5;
      D[o]=Math.round(clamp(wallIn?0:R[k],0,1)*255); D[o+1]=Math.round(clamp(G[k],0,1)*255);
      D[o+2]=Math.round(clamp(Bb[k],0,1)*255); D[o+3]=255;
    }
  },
  finalize(){
    if(this.atlasData){
      const t=new THREE.DataTexture(this.atlasData,this.nx*4,this.nz*3,THREE.RGBAFormat);
      t.magFilter=THREE.LinearFilter; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false;
      t.wrapS=t.wrapT=THREE.ClampToEdgeWrapping; t.needsUpdate=true;
      RIU.uRIAO.value=t; this.atlas=t;
    }
    this.applyCookie();
    this.initDust();
  }
};
function smoothstepJS(a,b,x){ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); }
const T_HALF=()=>WALL_T/2;
