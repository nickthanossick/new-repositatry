/* ═════════════ what the night left behind ═════════════
   The rooms were clean and empty, which read as a set, not a hospital that
   was abandoned in one bad night. This fills them with what such a place
   actually has lying about — case files and bundles tied in red cloth,
   syringes, ampoules, gloves, masks, white coats dropped on the floor or
   still on their hooks, lockers, filing cabinets, monobloc chairs, ward
   screens, body bags in the mortuary — and blood: pools, drag marks,
   handprints, spatter, drips and footprints, drawn by one shader so the
   torch finds a wet gloss on the fresh ones and a dull crust on the old.
   Everything uses its own random stream, so the game's layout is untouched;
   the few tall pieces stand against walls and get their own colliders.   */
GB.prototype.mergeGeo=function(g,m){
  const pos=g.attributes.position, nor=g.attributes.normal, col=g.attributes.color, pb=g.attributes.pbr;
  const nm=m?new THREE.Matrix3().getNormalMatrix(m):null, v=new THREE.Vector3(), nn=new THREE.Vector3(), base=this.v;
  for(let i=0;i<pos.count;i++){
    v.fromBufferAttribute(pos,i); if(m) v.applyMatrix4(m); this.P.push(v.x,v.y,v.z);
    nn.fromBufferAttribute(nor,i); if(nm) nn.applyMatrix3(nm); nn.normalize(); this.N.push(nn.x,nn.y,nn.z);
    this.C.push(col.getX(i),col.getY(i),col.getZ(i)); this.R.push(pb.getX(i),pb.getY(i),pb.getZ(i),pb.getW(i));
  }
  const ix=g.index.array, flip=m&&m.determinant()<0;
  for(let i=0;i<ix.length;i+=3){ if(flip) this.I.push(base+ix[i],base+ix[i+2],base+ix[i+1]); else this.I.push(base+ix[i],base+ix[i+1],base+ix[i+2]); }
  this.v+=pos.count; return this;
};
const RIH={};
const RIHC={ blood:0x3c0503, bloodOld:0x2a0a05, manila:[0xc7b98f,0xb3c3cf,0xd6c79c,0xc9a98a,0xa9bfa4], coat:0xe7e7e1 };
/* a stain mask for garments and paper: patchy, with dark dried edges */
const riStainAt=(x,y,z,seed,k)=>{ const n=riFbm(x*5+seed*3.1,y*5+seed,z*5-seed*1.7); return Math.max(0,Math.min(1,(n-(.66-k*.14))*6)); };
const riBleed=(c,a)=>{ if(a<=0) return; const d=new THREE.Color(a>.75?RIHC.blood:0x55100a); c.lerp(d,Math.min(1,a*1.1)); };

/* ---------------- paper: case files, bundles, clipboards ---------------- */
RIH.lines=(g,w,h,m,n,sp)=>{ /* printed lines on a sheet lying in the local XZ plane */
  for(let i=0;i<n;i++){ const L=w*(.55+.4*riHash(i,n,w*9)); if(i%5===4) continue;
    g.add(RIG.box(L,.0002,.0022),new THREE.Matrix4().multiplyMatrices(m,MX(-w/2+.02+L/2,.0006,-h/2+.035+i*sp)),RIspec(RK.plBlack,{c:0x3a3a3c,r:.9,d:9})); }
};
RIH.file=(v)=>{
  const g=new GB(), q=mulberry(301+v*17), W=.245, D=.33, cov=RIspec(RK.manila,{c:RIHC.manila[v%5],w:.45});
  g.add(RIG.rbox(W,.0018,D,.0008,1),MX(0,.0009,0),cov);
  const n=4+(v%4);
  for(let i=0;i<n;i++) g.add(RIG.box(.21,.0008,.297),MX((q()-.5)*.012,.0022+i*.0009,(q()-.5)*.012,0,(q()-.5)*.05,0),RIspec(RK.paper,{c:[0xe6dfca,0xdcd4bd,0xefe9d8][i%3],w:.3}));
  const top=.0026+n*.0009;
  g.add(RIG.rbox(W,.0018,D,.0008,1),MX(.004,top,.003,0,.012,-.02),cov,(x,y,z,c)=>{ if(v%3===0) riBleed(c,riStainAt(x,y,z,v,.6)); });
  g.add(RIG.rbox(.07,.0018,.022,.004,1),MX(-.06,top,-D/2-.009),cov);
  /* the white label and the hand-written name */
  g.add(RIG.box(.12,.0003,.05),MX(-.02,top+.0012,.08),RIspec(RK.paper,{c:0xf1ede2}));
  g.add(RIG.box(.08,.0003,.004),MX(-.03,top+.0016,.08),RIspec(RK.plBlack,{c:0x1f2a55,r:.9,d:9}));
  if(v%2) g.add(RIG.torus(.011,.0012,5,12),MX(-.1,top+.0015,.11,Math.PI/2,0,0),RIspec(RK.paintGreen,{c:0x2d6b3c}));
  return g.geometry();
};
RIH.fileOpen=(v)=>{
  const g=new GB(), q=mulberry(611+v*23), W=.245, D=.33, cov=RIspec(RK.manila,{c:RIHC.manila[(v+2)%5],w:.45});
  g.add(RIG.rbox(W,.0018,D,.0008,1),MX(-W/2,.0009,0),cov);
  g.add(RIG.rbox(W,.0018,D,.0008,1),MX(W/2+.004,.0012,0,0,0,.035),cov);
  for(let i=0;i<5;i++){
    const m=MX(W/2+(q()-.5)*.02,.0025+i*.001,(q()-.5)*.02,0,(q()-.5)*.08,0);
    g.add(RIG.box(.21,.0008,.297),m,RIspec(RK.paper,{c:[0xebe5d4,0xdfd8c2][i%2],w:.3}),(x,y,z,c)=>{ if(v%2===0) riBleed(c,riStainAt(x,y,z,v+i,.4)); });
    if(i===4) RIH.lines(g,.21,.297,m,24,.0105);
  }
  /* one sheet slid out across the floor, curled */
  const m=MX(-W/2-.05,.0025,.06+q()*.05,0,.5+q(),0);
  g.add(RIG.cloth(.21,.297,5,7,(x,yy)=>[0,0,Math.pow(Math.abs(x)/.105,2)*.008+Math.max(0,yy/.15)*.012],false),
    new THREE.Matrix4().multiplyMatrices(m,MX(0,0,0,-Math.PI/2,0,0)),RIspec(RK.paper,{c:0xece6d5,w:.3}));
  RIH.lines(g,.21,.297,new THREE.Matrix4().multiplyMatrices(m,MX(0,.0015,0)),22,.011);
  g.add(RIG.rod([-.02,.004,-.12],[-.02,.004,.12],.0012,5),MX(),RK.steelDull);
  return g.geometry();
};
/* government-issue bundle: files stacked and tied in red cloth */
RIH.bundle=(v)=>{
  const g=new GB(), q=mulberry(911+v*31), n=6+(v%5); let yy=0;
  for(let i=0;i<n;i++){ const t=.006+q()*.01, c=RIHC.manila[(i+v)%5];
    g.add(RIG.rbox(.25,t,.34,.0015,1),MX((q()-.5)*.02,yy+t/2,(q()-.5)*.02,0,(q()-.5)*.06,0),RIspec(RK.manila,{c,w:.55}),
      (x,y,z,cc)=>{ const e=Math.max(Math.abs(x)/.125,Math.abs(z)/.17); if(e>.93) cc.multiplyScalar(.8); });
    g.add(RIG.box(.23,t*.7,.32),MX((q()-.5)*.012,yy+t/2,(q()-.5)*.012),RIspec(RK.paper,{c:0xd8cfb4,w:.5}));
    yy+=t; }
  const red=RIspec(RK.fabBlue,{c:0x7a1414,r:.85,w:.3});
  if(v%3!==2){ g.add(RIG.rbox(.27,yy+.006,.05,.004,1),MX(0,yy/2,0),red);
    g.add(RIG.rbox(.05,yy+.006,.36,.004,1),MX(0,yy/2,0),red);
    g.add(RIG.sphere(.018,8,6),MX(.02,yy+.01,.01,0,0,0,1.4,.6,1),red); }
  else { const s=RIspec(RK.paper,{c:0xcdbf9a,r:.9}); g.add(RIG.box(.26,yy+.003,.004),MX(0,yy/2,-.05),s); g.add(RIG.box(.004,yy+.003,.35),MX(.03,yy/2,0),s); }
  return g.geometry();
};
RIH.clipboard=(v)=>{
  const g=new GB();
  g.add(RIG.rbox(.23,.004,.32,.006,1),MX(0,.002,0),RIspec(RK.wood,{c:0x6b4a2c,r:.6}));
  const m=MX(0,.0045,.01); g.add(RIG.box(.21,.0008,.29),m,RIspec(RK.paper,{c:0xece6d6,w:.3}),(x,y,z,c)=>{ if(v%2) riBleed(c,riStainAt(x,y,z,v,.5)); });
  RIH.lines(g,.21,.29,m,22,.011);
  g.add(RIG.rbox(.1,.012,.03,.004,2),MX(0,.01,-.14),RK.steel);
  g.add(RIG.rod([-.03,.012,-.128],[.03,.012,-.128],.003,8),MX(),RK.chrome);
  return g.geometry();
};

/* ---------------- sharps, glass and dressings ---------------- */
RIH.syringe=(kind)=>{
  /* 10 ml disposable, built along +x lying on the floor */
  const g=new GB(), r=.0074, L=.074, bloody=kind===2, used=kind>0;
  const barrel=bloody?RIspec(RK.plWhite,{c:0x5e0907,r:.12,m:0,d:0,w:0}):RIspec(RK.plWhite,{c:0xdde6e9,r:.1,d:0,w:0});
  const lay=(mm)=>new THREE.Matrix4().multiplyMatrices(MX(0,r+.0008,0,0,0,-Math.PI/2),mm);
  g.add(RIG.cyl(r,r,L,16,true),lay(MX(0,0,0)),barrel);
  g.add(RIG.cyl(r*.94,r*.94,L,12,true),lay(MX(0,0,0,Math.PI,0,0)),barrel);
  for(let i=0;i<7;i++) g.add(RIG.torus(r+.00005,.00016,3,16,Math.PI*.6),lay(MX(0,-L/2+.01+i*.009,0,Math.PI/2,0,1.2)),RIspec(RK.plBlack,{c:0x111111}));
  g.add(RIG.rbox(.028,.0016,.016,.003,1),lay(MX(0,-L/2,0)),RIspec(RK.plWhite,{c:0xe8eceb,r:.2}));
  g.add(RIG.lathe([[0,0],[r,0],[r*.35,.006],[.0022,.007],[.0019,.013],[0,.013]],14),lay(MX(0,L/2,0)),barrel);
  if(!used||kind===1){
    g.add(RIG.lathe([[0,0],[.0042,0],[.0036,.009],[.0014,.011],[0,.011]],10),lay(MX(0,L/2+.012,0)),RIspec(RK.plWhite,{c:[0x2f8f4a,0xe7c52a,0x333a8a][kind%3],r:.3}));
    g.add(RIG.cyl(.00032,.00032,.032,5),lay(MX(0,L/2+.038,0)),RK.chrome);
  }
  if(!used) g.add(RIG.lathe([[0,0],[.0036,0],[.0034,.034],[.0012,.037],[0,.037]],10),lay(MX(0,L/2+.012,0)),RIspec(RK.plWhite,{c:0xe38a2a,r:.35}));
  const push=used?.02:.058;
  g.add(RIG.box(.0014,.066,.0068),lay(MX(0,-L/2-push+.033,0)),RIspec(RK.plWhite,{c:0xe3e8e6,r:.25}));
  g.add(RIG.box(.0068,.066,.0014),lay(MX(0,-L/2-push+.033,0)),RIspec(RK.plWhite,{c:0xe3e8e6,r:.25}));
  g.add(RIG.cyl(.0095,.0095,.0016,16),lay(MX(0,-L/2-push,0)),RIspec(RK.plWhite,{c:0xe8ecea,r:.25}));
  return g.geometry();
};
RIH.ampoule=(v)=>{
  const g=new GB(), amber=v%2===0, gl=RIspec(RK.glass,{c:amber?0x5a2a08:0x9fb0ad,r:.04});
  const broken=v>=2;
  const pts=broken?[[0,0],[.0055,0],[.0058,.02],[.0048,.026],[.0022,.03],[.0016,.031],[0,.031]]
                  :[[0,0],[.0055,0],[.0058,.02],[.0048,.026],[.0022,.03],[.0018,.034],[.0032,.039],[.0026,.046],[0,.047]];
  g.add(RIG.lathe(pts,12),MX(0,.0058,0,0,0,Math.PI/2),gl);
  g.add(RIG.torus(.0021,.0005,4,10),MX(-.03,.0058,0,0,Math.PI/2,0),RIspec(RK.paintWhite,{c:0xd8d0c0}));
  if(broken) g.add(RIG.lathe([[0,0],[.0024,0],[.0031,.008],[.0026,.015],[0,.016]],8),MX(.02,.003,.012,0,1.2,Math.PI/2),gl);
  return g.geometry();
};
RIH.vial=(v)=>{
  const g=new GB(), gl=RIspec(RK.glass,{c:[0x6b3a10,0xb9c6c2,0x3a5a7a][v%3],r:.05});
  g.add(RIG.lathe([[0,0],[.011,0],[.012,.002],[.012,.03],[.0085,.036],[.0062,.038],[.0062,.042],[0,.042]],16),MX(),gl);
  g.add(RIG.cyl(.0075,.0075,.006,14),MX(0,.043,0),RIspec(RK.alu,{c:[0x2f6fb0,0xb02a2a,0xc9c9c9][v%3],m:.8}));
  g.add(RIG.box(.02,.016,.0005),MX(0,.017,.0118),RIspec(RK.paper,{c:0xece6d5}));
  const lay=MX(0,.012,0,0,v*.7,Math.PI/2); const out=new GB(); out.mergeGeo(g.geometry(),v%2?lay:null); return out.geometry();
};
RIH.glass=(v)=>{
  const g=new GB(), q=mulberry(77+v*5), gl=RIspec(RK.glass,{c:0x6f807d,r:.03});
  for(let i=0;i<9;i++){ const s=new THREE.Shape(); const a=q()*6.28, R=.015+q()*.03;
    s.moveTo(0,0); for(let k=1;k<=3;k++){ const t=a+k*(1.6+q()*.8); s.lineTo(Math.cos(t)*R*(.4+q()),Math.sin(t)*R*(.4+q())); } s.closePath();
    const sg=new THREE.ExtrudeGeometry(s,{depth:.0015,bevelEnabled:false});
    g.add(sg,MX((q()-.5)*.3,.0008,(q()-.5)*.3,-Math.PI/2+(q()-.5)*.2,q()*6.28,0),gl); }
  return g.geometry();
};
RIH.glove=(v)=>{
  const g=new GB(), c=v%2?0xe6dcc3:0x7fa7d6, sp=RIspec(RK.plWhite,{c,r:.45,d:5,w:.2});
  const tint=(x,y,z,cc)=>{ if(v>=2){ const n=riNoise(x*60,z*60,v); if(x>.03||n>.6) riBleed(cc,.6+n*.4); } };
  g.add(RIG.rbox(.085,.014,.095,.006,2),MX(0,.007,0,0,0,0,1,1,1),sp,tint);
  g.add(RIG.rbox(.07,.012,.07,.005,2),MX(-.075,.006,0),sp,tint);
  const F=[[.045,-.033,.09,.02,.7],[.048,-.011,.1,.004,.8],[.046,.011,.095,-.01,.75],[.043,.031,.075,-.03,.6]];
  for(const [x0,z0,len,bend,s] of F){ const pts=RIG.curve([[x0,.007,z0],[x0+len*.5,.007+.004*s,z0+bend*.5],[x0+len,.006,z0+bend]],10);
    g.add(RIG.sweep(pts,t=>.0085*(1-t*.25),8,true),MX(0,0,0,0,0,0,1,.55,1),sp,tint); }
  const th=RIG.curve([[.01,.007,.045],[.035,.006,.07],[.055,.006,.085]],8);
  g.add(RIG.sweep(th,t=>.009*(1-t*.2),8,true),MX(0,0,0,0,0,0,1,.55,1),sp,tint);
  return g.geometry();
};
RIH.mask=(v)=>{
  const g=new GB(), c=[0x8fc3d4,0x9dcbb0,0xe4e4de][v%3];
  g.add(RIG.cloth(.175,.095,14,8,(x,y)=>[0,0,.004*Math.abs(((y*38)%2+2)%2-1)+.006*(1-Math.pow(x/.0875,2))],true),MX(0,.005,0,-Math.PI/2,0,0),
    RIspec(RK.sheet,{c,r:.92,w:.4}),(x,y,z,cc)=>{ if(v===2) riBleed(cc,riStainAt(x,y,z,v,.8)); });
  for(const s of [-1,1]){ const pts=RIG.curve([[s*.085,.004,-.035],[s*.13,.003,-.05],[s*.15,.002,0],[s*.13,.003,.05],[s*.085,.004,.035]],14);
    g.add(RIG.sweep(pts,.0011,4,false),MX(),RIspec(RK.sheet,{c:0xefefe9})); }
  g.add(RIG.box(.1,.0015,.004),MX(0,.008,-.046),RK.alu);
  return g.geometry();
};
RIH.cotton=(v)=>{
  const g=new GB(), q=mulberry(55+v*3);
  for(let i=0;i<5;i++){ const s=RIG.sphere(.012+q()*.01,9,7), p=s.attributes.position;
    for(let k=0;k<p.count;k++){ const x=p.getX(k),y=p.getY(k),z=p.getZ(k), n=.75+.5*riNoise(x*150+i,y*150,z*150); p.setXYZ(k,x*n,y*n*.6,z*n); }
    s.computeVertexNormals();
    g.add(s,MX((q()-.5)*.14,.008,(q()-.5)*.14),RIspec(RK.sheet,{c:0xf2f0ea,r:.95}),(x,y,z,c)=>riBleed(c,.35+riNoise(x*80,y*80,z*80+i)*.9)); }
  return g.geometry();
};
RIH.stetho=(v)=>{
  const g=new GB(), tube=RIspec(RK.rubber,{c:[0x1b1c1e,0x2d3f63,0x5a1c1c][v%3],r:.35});
  const pts=RIG.curve([[0,.006,0],[.12,.006,.08],[.26,.006,.02],[.3,.006,-.12],[.18,.006,-.22],[.02,.006,-.18],[-.05,.006,-.06]],48);
  g.add(RIG.sweep(pts,.0045,8,true),MX(),tube);
  g.add(RIG.lathe([[0,0],[.022,0],[.023,.006],[.018,.011],[0,.012]],18),MX(-.05,.0,-.06),RK.chrome);
  g.add(RIG.cyl(.02,.02,.0015,18),MX(-.05,.0125,-.06),RIspec(RK.plBlack,{c:0x0d0d0d,r:.2}));
  for(const s of [-1,1]){ const b=RIG.curve([[0,.006,0],[-.02,.006,s*.03],[-.09,.008,s*.05],[-.15,.012,s*.04]],12);
    g.add(RIG.sweep(b,.0022,6,true),MX(),RK.chrome); g.add(RIG.sphere(.006,8,6),MX(-.15,.012,s*.04),RIspec(RK.plBlack,{c:0x111111})); }
  return g.geometry();
};

/* ---------------- white coats ---------------- */
/* a doctor's coat dropped on the floor: a signed-distance outline of the
   body, the two sleeves thrown out at random angles and the neckline,
   meshed on a 2 cm grid, snapped to the outline, then crumpled */
RIH.coatFloor=(v,blood)=>{
  const q=mulberry(4711+v*97);
  const aL=Math.PI*(.72+q()*.55), aR=Math.PI*(.28-q()*.55), fold=q()<.4;
  const shL=[-.25,.36], shR=[.25,.36], sl=.54;
  const eL=[shL[0]+Math.cos(aL)*sl,shL[1]+Math.sin(aL)*sl], eR=fold?[shR[0]-.3,shR[1]-.35]:[shR[0]+Math.cos(aR)*sl,shR[1]+Math.sin(aR)*sl];
  const cap=(x,z,a,b,r0,r1)=>{ const px=x-a[0],pz=z-a[1],bx=b[0]-a[0],bz=b[1]-a[1]; const h=Math.max(0,Math.min(1,(px*bx+pz*bz)/(bx*bx+bz*bz)));
    return [Math.hypot(px-bx*h,pz-bz*h)-(r0+(r1-r0)*h),h]; };
  const body=(x,z)=>{ const w=.27+(.42-z)*.035; const dx=Math.abs(x)-w, dz=Math.max(-.64-z,z-.42);
    let d=Math.max(dx,dz); if(dx>0&&dz>0) d=Math.hypot(dx,dz); d=Math.max(d,-(Math.hypot(x,z-.47)-.085)); return d; };
  const sd=(x,z)=>{ const n=(riNoise(x*9+v,z*9,3)-.5)*.022;
    return Math.min(body(x,z),cap(x,z,shL,eL,.1,.068)[0],cap(x,z,shR,eR,.1,.068)[0])+n; };
  const H=(x,z)=>{
    const b=body(x,z), sL=cap(x,z,shL,eL,.1,.068), sR=cap(x,z,shR,eR,.1,.068);
    let h=.004;
    const r1=riNoise(x*3.1+v,z*2.3,1), r2=riNoise(x*7+2,z*6.5+v,2);
    h+=.026*Math.pow(1-Math.abs(2*r1-1),3)+.012*r2;
    if(b<0) h+=Math.min(.012,-b*.08);
    for(const [s,a,e] of [[sL,shL,eL],[sR,shR,eR]]){ if(s[0]<0){ const r=.1+(.068-.1)*s[1]; const t=Math.min(1,-s[0]/r);
        h=Math.max(h,.008+.03*Math.sqrt(t*(2-t))*(1-.3*s[1])+.004*Math.sin(s[1]*38+v)); } }
    if(z>.28&&Math.abs(x)<.2) h+=.006*Math.max(0,1-Math.abs(Math.abs(x)-.09)/.05);
    return h; };
  const X0=-.95,X1=.95,Z0=-.95,Z1=.98, st=RIQ.touch?.03:.02, nx=Math.round((X1-X0)/st)+1, nz=Math.round((Z1-Z0)/st)+1;
  const P=new Float32Array(nx*nz*3), used=new Uint8Array(nx*nz), I=[];
  const D=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){ const x=X0+i*st, z=Z0+j*st; D[j*nx+i]=sd(x,z); }
  for(let j=0;j<nz-1;j++)for(let i=0;i<nx-1;i++){
    const a=j*nx+i,b=a+1,c=a+nx+1,d=a+nx;
    if((D[a]+D[b]+D[c])/3<0){ I.push(a,d,c,a,c,b); used[a]=used[b]=used[c]=used[d]=1; }
    else if((D[a]+D[c]+D[d])/3<0){ I.push(a,d,c); used[a]=used[c]=used[d]=1; }
    else if((D[a]+D[b]+D[c])/3<.004&&(D[a]+D[c]+D[d])/3<.004){ I.push(a,d,c,a,c,b); used[a]=used[b]=used[c]=used[d]=1; }
  }
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){ const k=j*nx+i; let x=X0+i*st, z=Z0+j*st;
    if(used[k]&&D[k]>-.004){ const e=.003, gx=(sd(x+e,z)-sd(x-e,z))/(2*e), gz=(sd(x,z+e)-sd(x,z-e))/(2*e), gl=Math.hypot(gx,gz)||1;
      const s=D[k]+.002; x-=gx/gl*s; z-=gz/gl*s; }
    const edge=Math.max(0,Math.min(1,-sd(x,z)/.035));
    P[k*3]=x; P[k*3+1]=H(x,z)*(.35+.65*edge); P[k*3+2]=z; }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.BufferAttribute(P,3)); geo.setIndex(I); geo.computeVertexNormals();
  const out=new GB(), seed=v*1.37;
  out.add(geo,null,RIspec(RK.sheet,{c:RIHC.coat,r:.9,d:3,w:.35}),(x,y,z,c)=>{
    const dirt=riNoise(x*4+seed,z*4,7); c.multiplyScalar(.9+.1*dirt);
    if(Math.abs(Math.abs(x)-.06-(.45-z)*.12)<.006&&z>.02&&z<.45) c.multiplyScalar(.82);
    if(z<-.02&&z>-.18&&Math.abs(Math.abs(x)-.16)<.075&&(Math.abs(z+.02)<.004||Math.abs(Math.abs(x)-.16)>.071)) c.multiplyScalar(.8);
    if(blood){ const s=riStainAt(x,y,z,seed,blood); riBleed(c,s); const hem=Math.max(0,-.45-z)*3*blood; riBleed(c,hem*riNoise(x*20,z*20,seed)); }
  });
  for(let i=0;i<4;i++){ const bx=.035, bz=.3-i*.16; if(sd(bx,bz)>-.02) continue;
    out.add(RIG.cyl(.008,.008,.003,12),MX(bx,H(bx,bz)*.9+.0015,bz),RIspec(RK.plWhite,{c:0xf4f2ea,r:.3})); }
  if(sd(-.16,.2)<-.03) out.add(RIG.rbox(.055,.003,.08,.004,1),MX(-.16,H(-.16,.2)+.002,.2,0,.1,0),RIspec(RK.plWhite,{c:0x3060a0,r:.3}));
  return out.geometry();
};
/* a coat left on its hook: the shoulders pinched by the hook, the body
   hanging in soft vertical folds, sleeves falling at the sides */
RIH.coatHang=(v,blood)=>{
  const g=new GB(), seed=v*2.3, ph=v*1.7;
  const W=.56,Hh=1.02;
  const cloth=RIG.cloth(W,Hh,RIQ.touch?18:28,RIQ.touch?30:46,(x,yy,u,t)=>{
    const top=1-t; const pinch=1-.62*Math.pow(Math.max(0,1-top/.22),1.6);
    const nx=x*pinch-x;
    const fold=.018*Math.sin(x*26+ph+top*2)*Math.min(1,top*3)+.012*Math.sin(x*61+ph*2)*top;
    const bulge=.05*Math.cos(x/W*Math.PI)*Math.min(1,top*2.5)*(1-.4*top);
    const drop=-.02*Math.pow(Math.abs(x)/(W/2),2)*(1-Math.min(1,top/.25));
    return [nx,drop,fold+bulge+.02]; },true);
  const col=(x,y,z,c)=>{ c.multiplyScalar(.9+.1*riNoise(x*5+seed,y*5,1));
    if(Math.abs(x-.02)<.005&&y<-.2) c.multiplyScalar(.82);
    if(blood){ riBleed(c,riStainAt(x,y,z,seed,blood)); if(y<-.75) riBleed(c,blood*.6*riNoise(x*25,y*25,seed)); } };
  g.add(cloth,MX(0,-Hh/2-.06,0),RIspec(RK.sheet,{c:RIHC.coat,r:.9,d:3,w:.35}),col);
  for(const s of [-1,1]){ const pts=RIG.curve([[s*.1,-.11,.03],[s*.2,-.2,.05],[s*.24,-.45,.07],[s*.23,-.66,.08]],24);
    g.add(RIG.sweep(pts,t=>.052*(1-.2*t)*(1+.08*Math.sin(t*40+s+v)),12,true),MX(),RIspec(RK.sheet,{c:RIHC.coat,r:.9,d:3,w:.35}),col); }
  g.add(RIG.tube([[-.1,-.1,.02],[-.04,-.055,.03],[.04,-.055,.03],[.1,-.1,.02]],.012,8,.03,4,true),MX(),RIspec(RK.sheet,{c:0xe0e0da,r:.9,d:3}));
  g.add(RIG.rbox(.05,.05,.012,.004,1),MX(0,-.02,-.004),RK.brass);
  g.add(RIG.tube([[0,-.02,.004],[0,-.02,.04],[0,-.075,.05]],.004,6,.012,4,true),MX(),RK.brass);
  return g.geometry();
};

/* ---------------- furniture ---------------- */
RIH.lockers=(v)=>{
  const g=new GB(), W=.93, Ht=1.83, D=.46, bays=3, tiers=v%2?2:1;
  const paint=RIspec(RK.paintGreen,{c:[0x7b8a80,0x9aa2a0,0x8a9ab0][v%3],w:.5});
  g.add(RIG.rbox(W,Ht-.08,D,.006,1),MX(0,.08+(Ht-.08)/2,0),paint);
  g.add(RIG.box(W-.04,.08,D-.04),MX(0,.04,0),RIspec(RK.paintDark,{w:.5}));
  const dw=W/bays-.012, dh=(Ht-.12)/tiers-.012, ajar=v%4;
  for(let b=0;b<bays;b++)for(let t=0;t<tiers;t++){
    const cx=-W/2+(b+.5)*W/bays, cy=.1+(t+.5)*(Ht-.12)/tiers;
    const open=b===ajar%bays&&t===0&&ajar>0, ang=open?-(.5+.6*(v%3)/2):0;
    const hinge=MX(cx-dw/2,cy,D/2+.004,0,ang,0), loc=(mm)=>new THREE.Matrix4().multiplyMatrices(hinge,mm);
    g.add(RIG.rbox(dw,dh,.012,.003,1),loc(MX(dw/2,0,0)),paint);
    for(let i=0;i<5;i++) g.add(RIG.box(dw*.55,.006,.006),loc(MX(dw/2,dh/2-.06-i*.018,.005)),RIspec(RK.paintDark,{c:0x1b1f20}));
    g.add(RIG.rbox(.018,.09,.02,.004,1),loc(MX(dw-.04,-.02,.012)),RK.chrome);
    g.add(RIG.cyl(.008,.008,.01,10),loc(MX(dw-.04,.06,.01,Math.PI/2,0,0)),RK.brass);
    g.add(RIG.box(.05,.022,.002),loc(MX(dw/2,dh/2-.16,.0072)),RIspec(RK.paper,{c:0xeeeadc}));
    if(open){ g.add(RIG.box(dw-.01,dh-.01,.004),MX(cx,cy,D/2-.02),RIspec(RK.paintDark,{c:0x16191a}));
      g.add(RIG.rod([cx-dw/2+.02,cy+dh/2-.08,D/2-.2],[cx+dw/2-.02,cy+dh/2-.08,D/2-.2],.005,6),MX(),RK.chrome); }
  }
  return g.geometry();
};
RIH.filing=(v)=>{
  const g=new GB(), W=.47, Ht=1.33, D=.62, paint=RIspec(RK.paintGrey,{c:[0x8b9396,0x9c9a8c,0x6f7f76][v%3],w:.5});
  g.add(RIG.rbox(W,Ht,D,.006,1),MX(0,Ht/2,0),paint);
  const openI=v%4, pull=.28+.1*(v%2);
  for(let i=0;i<4;i++){ const dy=Ht-.17-i*.32, open=i===openI;
    const z=D/2+.006+(open?pull:0);
    g.add(RIG.rbox(W-.03,.3,.016,.004,1),MX(0,dy,z),paint);
    g.add(RIG.rbox(.12,.022,.03,.006,1),MX(0,dy+.05,z+.018),RK.chrome);
    g.add(RIG.box(.08,.028,.002),MX(0,dy+.1,z+.009),RIspec(RK.paper,{c:0xece6d2}));
    if(open){ g.add(RIG.box(W-.06,.004,pull),MX(0,dy-.13,z-pull/2-.008),paint);
      for(const s of [-1,1]) g.add(RIG.box(.004,.24,pull),MX(s*(W/2-.03),dy-.01,z-pull/2-.008),paint);
      for(let k=0;k<9;k++){ const zz=z-.03-k*(pull-.05)/9; g.add(RIG.box(W-.08,.21+.05*riHash(k,v,1),.004),MX(0,dy+.02,zz,(riHash(v,k,2)-.5)*.3,0,0),RIspec(RK.manila,{c:RIHC.manila[k%5],w:.5})); } }
  }
  return g.geometry();
};
RIH.chair=(v)=>{
  /* the white monobloc every Indian hospital corridor has */
  const g=new GB(), c=[0xdedbd2,0x6d2420,0x2f5a8a,0x3f6b4a,0xd9d4c4][v%5], p=RIspec(RK.plWhite,{c,r:.34,d:5,w:.35});
  g.add(RIG.cloth(.44,.42,10,10,(x,y)=>[0,0,-.02*(1-Math.pow(x/.22,2))*(1-Math.pow(y/.21,2))],false),MX(0,.44,0,-Math.PI/2,0,0),p);
  g.add(RIG.rbox(.45,.025,.43,.012,2),MX(0,.425,0),p);
  const back=MX(0,.44,-.2,-.2,0,0);
  for(let i=0;i<4;i++) g.add(RIG.rbox(.4-i*.01,.05,.02,.01,2),new THREE.Matrix4().multiplyMatrices(back,MX(0,.14+i*.085,0)),p);
  for(const s of [-1,1]) g.add(RIG.rbox(.035,.44,.028,.01,2),new THREE.Matrix4().multiplyMatrices(back,MX(s*.2,.22,0)),p);
  for(const sx of [-1,1])for(const sz of [-1,1]){
    g.add(RIG.rod([sx*.2,.43,sz*.19],[sx*.235,0,sz*.225],.018,8),MX(),p);
    g.add(RIG.cyl(.019,.02,.01,8),MX(sx*.235,.005,sz*.225),RIspec(RK.rubber,{c:0x1a1a1a})); }
  for(const s of [-1,1]) g.add(RIG.tube([[s*.21,.44,.17],[s*.225,.62,.1],[s*.225,.64,-.12],[s*.215,.6,-.2]],.016,8,.05,5,true),MX(),p);
  return g.geometry();
};
RIH.screen=(v)=>{
  /* three-leaf ward screen: steel tube frames, a cloth panel on each, castors */
  const g=new GB(), fr=RIspec(RK.steel,{c:0xb4b9bb,w:.3}), W=.56, Ht=1.68;
  const cloth=[0x9fbfae,0xe5e3d9,0xc9a9b5][v%3], ang=[.45,-.45];
  let hx=0, hz=0, a=0;
  for(let k=0;k<3;k++){
    const m=MX(hx,0,hz,0,a,0), L=(mm)=>new THREE.Matrix4().multiplyMatrices(m,mm);
    g.add(RIG.tube([[0,.12,0],[0,Ht,0],[W,Ht,0],[W,.12,0]],.011,8,.05,5,true),L(MX()),fr);
    g.add(RIG.rod([0,.24,0],[W,.24,0],.008,6),L(MX()),fr);
    g.add(RIG.cloth(W-.06,Ht-.42,10,16,(x,y,u,t)=>[0,0,.012*Math.sin(u*Math.PI*3+k)*(1-t*.5)],true),L(MX(W/2,.27+(Ht-.42)/2+.02,0)),
      RIspec(RK.sheet,{c:cloth,r:.88,w:.4}),(x,y,z,cc)=>{ cc.multiplyScalar(.88+.12*riNoise(x*6,y*6,k)); if(v===2) riBleed(cc,riStainAt(x,y,z,v+k,.7)); });
    for(const x of [0,W]){ g.add(RIG.cyl(.02,.02,.025,10),L(MX(x,.035,0,Math.PI/2,0,0)),RIspec(RK.rubber,{c:0x1a1a1a})); g.add(RIG.rod([x,.06,0],[x,.12,0],.009,6),L(MX()),fr); }
    const c=Math.cos(a), s=Math.sin(a); hx+=c*W; hz-=s*W; if(k<2) a+=ang[k];
  }
  const out=new GB(); out.mergeGeo(g.geometry(),MX(-W*1.4,0,0)); return out.geometry();
};
RIH.bedside=(v)=>{
  const g=new GB(), paint=RIspec(RK.paintCream,{c:[0xd4cdba,0xa9b8c2][v%2],w:.55});
  g.add(RIG.rbox(.44,.78,.42,.008,1),MX(0,.47,0),paint);
  g.add(RIG.rbox(.46,.018,.44,.006,1),MX(0,.868,0),RIspec(RK.plBeige,{c:0xc9c0a8,w:.4}));
  g.add(RIG.rbox(.4,.14,.012,.004,1),MX(0,.76,.216),paint); g.add(RIG.rbox(.1,.016,.02,.005,1),MX(0,.76,.232),RK.chrome);
  g.add(RIG.rbox(.4,.5,.012,.004,1),MX(0,.4,.216,0,v%2?-.5:0,0),paint);
  for(const sx of [-1,1])for(const sz of [-1,1]) g.add(RIG.cyl(.022,.022,.02,10),MX(sx*.18,.03,sz*.17,Math.PI/2,0,0),RIspec(RK.rubber,{c:0x1a1a1a}));
  g.add(RIG.lathe([[0,0],[.035,0],[.04,.1],[.036,.11],[0,.11]],14),MX(-.1,.877,0),RIspec(RK.steel,{c:0xc2c6c8}));
  return g.geometry();
};
RIH.bodyBag=(v)=>{
  /* a body under PVC or under a white sheet: a lofted surface whose width
     and height follow a body — head, shoulders, chest, hips, knees, feet */
  const cloth=v%2===1, L=1.86, U=RIQ.touch?40:64, Vn=RIQ.touch?16:24;
  const prof=[[0,.0,.0],[.02,.1,.09],[.08,.12,.14],[.12,.1,.13],[.15,.2,.14],[.22,.26,.2],[.35,.25,.2],[.48,.22,.16],[.56,.23,.17],[.66,.2,.13],
    [.78,.18,.11],[.9,.14,.1],[.95,.16,.16],[.99,.1,.1],[1,.0,.0]];
  const at=(t,k)=>{ for(let i=1;i<prof.length;i++) if(t<=prof[i][0]){ const a=prof[i-1],b=prof[i],f=(t-a[0])/(b[0]-a[0]||1), s=f*f*(3-2*f); return a[k]+(b[k]-a[k])*s; } return 0; };
  const P=[],I=[];
  for(let i=0;i<=U;i++){ const t=i/U, w=Math.max(.02,at(t,1)), h=Math.max(.015,at(t,2));
    for(let j=0;j<=Vn;j++){ const a=j/Vn*Math.PI*2, c=Math.cos(a), s=Math.sin(a);
      const n=1+.06*(riNoise(t*14+v,a*2,3)-.5)*2+(cloth?.04*Math.sin(t*60+a*3):0);
      const y=s>0?s*h*n:s*.012; P.push(t*L-L/2, y+.012, c*w*n); } }
  for(let i=0;i<U;i++)for(let j=0;j<Vn;j++){ const a=i*(Vn+1)+j,b=a+Vn+1; I.push(a,b,a+1,b,b+1,a+1); }
  const geo=new THREE.BufferGeometry(); geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setIndex(I); geo.computeVertexNormals();
  const g=new GB();
  g.add(geo,null,cloth?RIspec(RK.sheet,{c:0xdedcd2,r:.92,w:.45}):RIspec(RK.vinylBlack,{c:0x151617,r:.26,d:10,w:.15}),(x,y,z,c)=>{
    if(cloth){ c.multiplyScalar(.86+.14*riNoise(x*5,z*5,v)); riBleed(c,riStainAt(x,y,z,v,.9)); if(x<-.6) riBleed(c,.5*riNoise(x*30,z*30,v)); }
    else if(y<.03) c.multiplyScalar(.7); });
  if(!cloth){ const zp=[]; for(let i=0;i<=40;i++){ const t=.04+i/40*.66, x=t*L-L/2, h=at(t,2); zp.push([x,h+.016,-.03*Math.sin(t*9)]); }
    g.add(RIG.sweep(RIG.curve(zp,60),.004,5,true),MX(),RIspec(RK.steel,{c:0x9a9ea2}));
    for(const t of [.2,.55,.85]) for(const s of [-1,1]){ const x=t*L-L/2, w=at(t,1);
      g.add(RIG.rbox(.08,.012,.03,.005,1),MX(x,.02,s*(w+.012)),RIspec(RK.vinylBlack,{c:0x0b0c0c})); }
    g.add(RIG.box(.08,.001,.06),MX(-L/2+.4,at(.21,2)+.018,.06,0,0,-.2),RIspec(RK.paper,{c:0xe8e2cc})); }
  else { g.add(RIG.rod([L/2-.08,.02,-.05],[L/2-.02,.03,.1],.002,4),MX(),RIspec(RK.paper,{c:0xd8cda8})); }
  return g.geometry();
};

/* ═════════════ blood ═════════════
   One instanced quad per mark. The shader draws the shape (pool, drag,
   spatter, handprint, drips, footprints, bare feet, wall writing),
   thickness from the shape gives the colour ramp, a gloss for fresh blood,
   a crust and coffee-ring edge for old, and a bump from its gradient.    */
const RI_BLOOD_FS=`
varying vec4 vB; varying vec2 vBu;
uniform sampler2D uBW;
float bH(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float bN(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(bH(i),bH(i+vec2(1,0)),f.x),mix(bH(i+vec2(0,1)),bH(i+1.),f.x),f.y); }
float bF(vec2 p){ float s=0.,a=.5; for(int i=0;i<4;i++){ s+=a*bN(p); p=p*2.03+17.1; a*=.5; } return s; }
float bCap(vec2 p,vec2 a,vec2 b,float r){ vec2 pa=p-a,ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); return length(pa-ba*h)-r; }
float bFoot(vec2 p,float S,float bare){
  float t;
  if(bare>.5){
    float sole=length((p-vec2(0.,-.02))/vec2(.085,.2))-1.;
    float heel=length((p-vec2(0.,-.15))/vec2(.07,.08))-1.;
    float arch=length((p-vec2(.035,-.02))/vec2(.03,.09))-1.;
    float d=min(sole,heel); d=max(d,-arch);
    t=smoothstep(.1,-.1,d);
    for(int i=0;i<5;i++){ float fi=float(i); vec2 c=vec2(-.055+fi*.028,.2-fi*fi*.006-(i==0?-.01:0.)); float r=i==0?.028:.02-fi*.002;
      t=max(t,smoothstep(r,r*.6,length(p-c))); }
  } else {
    float fore=length((p-vec2(0.,.08))/vec2(.09,.15))-1., heel=length((p-vec2(0.,-.17))/vec2(.075,.08))-1.;
    t=smoothstep(.08,-.08,min(fore,heel));
    t*=step(.35,fract((p.y+p.x*.3)*42.))*.7+.3;
  }
  return t*(.55+.45*bN(p*40.+S));
}
float bShape(vec2 p,float T,float S,float E){
  float t=0.;
  if(T<.5){ /* pool */
    float r=length(p); vec2 d=p/max(r,1e-4);
    float R=.33+.12*(bF(d*1.7+S*7.)-.5)*2.+.05*(bN(d*5.+S)-.5);
    t=smoothstep(R,R-.06,r)*(.5+.5*smoothstep(R,0.,r));
    for(int i=0;i<7;i++){ float fi=float(i); vec2 c=(vec2(bH(vec2(S,fi)),bH(vec2(fi,S+.3)))-.5)*.92; float rr=.012+.03*bH(vec2(S+fi,3.));
      t=max(t,smoothstep(rr,rr*.55,length(p-c))*.75); }
  } else if(T<1.5){ /* drag */
    float a=p.x+.5, cy=p.y+.025*sin(a*3.+S*6.)+.02*(bN(vec2(a*9.,S))-.5);
    float w=.36*(1.-a*.45)*(.8+.35*bN(vec2(a*5.,S)));
    float band=smoothstep(w,w-.05,abs(cy));
    float streak=bN(vec2(a*3.,cy*48.+S*9.));
    t=band*mix(.35,1.,smoothstep(.35,.7,streak))*smoothstep(.2,.55,bF(p*vec2(3.,6.)+S*3.))*(.6+.4*bF(p*13.-S));
    t*=1.-smoothstep(.55,1.,a)*smoothstep(.35,.8,bN(p*16.+S));
    t=max(t,smoothstep(.13,.07,length((p-vec2(-.42,0.))/vec2(1.,1.6)))*.9);
  } else if(T<2.5){ /* spatter */
    t=smoothstep(.1,.06,length(p)*(1.+.5*(bF(p*9.+S)-.5)));
    for(int i=0;i<26;i++){ float fi=float(i); float a=6.283*bH(vec2(fi,S)); float d=.07+.4*pow(bH(vec2(S,fi+1.)),.8);
      vec2 dir=vec2(cos(a),sin(a)), lq=p-dir*d; float u=dot(lq,dir), v=dot(lq,vec2(-dir.y,dir.x));
      float sz=.034*(1.-d*1.7)+.006; float e=length(vec2(u/(1.+d*3.),v));
      t=max(t,smoothstep(sz,sz*.45,e)*(.7+.3*bH(vec2(fi,2.))));
      t=max(t,smoothstep(sz*.4,sz*.15,length(p-dir*(d+sz*2.6)))*.8); }
  } else if(T<3.5){ /* handprint, dragged down */
    vec2 q=(p-vec2(0.,.2))*1.5;
    float d=length((q-vec2(0.,-.06))/vec2(.17,.2))-1.;
    d=min(d,bCap(q,vec2(-.1,.1),vec2(-.13,.33),.034)/.12);
    d=min(d,bCap(q,vec2(-.03,.12),vec2(-.035,.4),.036)/.12);
    d=min(d,bCap(q,vec2(.04,.11),vec2(.055,.37),.034)/.12);
    d=min(d,bCap(q,vec2(.1,.07),vec2(.14,.28),.03)/.12);
    d=min(d,bCap(q,vec2(-.14,-.08),vec2(-.27,.05),.036)/.12);
    t=smoothstep(.12,-.12,d)*(.45+.55*bN(q*70.+S))*(.7+.3*bF(q*8.));
    if(E>.5){ float a=clamp((-.22-q.y)/.8,0.,1.); float band=smoothstep(.17,.12,abs(q.x+.03*sin(q.y*9.)))*step(q.y,-.2);
      t=max(t,band*(1.-a)*smoothstep(.3,.75,bN(vec2(q.x*38.,q.y*3.+S)))); }
  } else if(T<4.5){ /* drips down a wall */
    t=smoothstep(.2,.13,length((p-vec2(0.,.32))/vec2(1.,.45))*(1.+.6*(bF(p*7.+S)-.5)));
    for(int i=0;i<8;i++){ float fi=float(i); float x=(bH(vec2(fi,S))-.5)*.34; float L=.15+.6*bH(vec2(S,fi+3.)); float w=.01+.018*bH(vec2(fi+7.,S));
      float y1=.3-L; float inY=step(y1,p.y)*step(p.y,.32);
      float wx=w*(.55+.45*(p.y-y1)/L); float c=smoothstep(wx,wx*.4,abs(p.x-x-.006*sin(p.y*28.+fi)))*inY;
      float bulb=smoothstep(w*1.5,w*.7,length((p-vec2(x,y1))/vec2(1.,1.3)));
      t=max(t,max(c*.8,bulb)); }
  } else if(T<5.5){ /* a trail of shoe prints */
    vec2 q=p*vec2(1.,2.); float side=q.y>0.?1.:-1.; vec2 c=vec2(side*.12,q.y>0.?.5:-.5);
    t=bFoot((q-c)*vec2(1.,.5)*1.,S+side,0.)*smoothstep(.0,.3,E+.2*side);
  } else if(T<6.5){ /* bare feet, small */
    vec2 q=p*vec2(1.,2.); float side=q.y>0.?1.:-1.; vec2 c=vec2(side*.1,q.y>0.?.5:-.5);
    t=bFoot((q-c)*vec2(-side,.5)*vec2(1.25,1.25),S+side,1.);
  } else { /* writing: one row of the atlas */
    vec2 uv=vec2(p.x+.5,(p.y+.5+E)/8.);
    float m=texture2D(uBW,uv).r;
    t=smoothstep(.25,.6,m)*(.6+.4*bN(p*vec2(60.,20.)+S));
    float drip=0.;
    for(int i=0;i<10;i++){ float fi=float(i); float x=(bH(vec2(fi,S))-.5)*.96; float L=.1+.35*bH(vec2(S,fi));
      float y0=-.1+.2*bH(vec2(fi,S+2.)); float inY=step(y0-L,p.y)*step(p.y,y0);
      drip=max(drip,smoothstep(.008,.003,abs(p.x-x))*inY*step(.5,texture2D(uBW,vec2(x+.5,(y0+.5+E)/8.)).r+bH(vec2(fi,1.))*.6));
      drip=max(drip,smoothstep(.013,.006,length(p-vec2(x,y0-L)))*inY); }
    t=max(t,drip*.8);
  }
  return t;
}`;
const RI_BLOOD={
  mat:null,
  material(){
    if(this.mat) return this.mat;
    const m=new THREE.MeshStandardMaterial({color:0x3a0504,roughness:.2,metalness:0,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-6});
    m.onBeforeCompile=(sh)=>{
      sh.uniforms.uBW={value:this.wordsTex()};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 aB; varying vec4 vB; varying vec2 vBu;')
        .replace('#include <begin_vertex>','#include <begin_vertex>\nvB=aB; vBu=position.xy;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\n'+RI_BLOOD_FS)
        .replace('#include <color_fragment>',`#include <color_fragment>
          float bT=bShape(vBu,floor(vB.x+.01),vB.y,vB.w);
          if(bT<.07) discard;
          float bAge=vB.z;
          vec3 bThin=vec3(.05,.009,.006), bFresh=vec3(.026,.0025,.0018), bOld=vec3(.016,.0055,.0035);
          vec3 bc=mix(bThin,bFresh,smoothstep(.1,.7,bT));
          bc=mix(bc,bOld*mix(1.15,.8,bT),bAge);
          float bRing=smoothstep(.07,.2,bT)*smoothstep(.36,.16,bT);
          bc*=1.-bRing*(.2+.35*bAge);
          diffuseColor.rgb=bc;`)
        .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
          roughnessFactor=mix(mix(.42,.16,smoothstep(.25,.85,bT)),.74-.1*bT,bAge);`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          { vec3 dpx=dFdx(-vViewPosition), dpy=dFdy(-vViewPosition); float hx=dFdx(bT), hy=dFdy(bT);
            vec3 r1=cross(dpy,normal), r2=cross(normal,dpx); float det=dot(dpx,r1);
            vec3 grad=sign(det)*(hx*r1+hy*r2)*mix(.9,.35,bAge)*.012;
            normal=normalize(abs(det)*normal-grad); }`);
    };
    m.customProgramCacheKey=()=>'riBlood1';
    return (this.mat=m);
  },
  /* the words, scrawled: one line per atlas row */
  wordsTex(){
    if(this.wt) return this.wt;
    const L=['WHERE IS MY BABY','SHE IS STILL HERE','TEN MINUTES','HE CRIED','LIARS','DON’T LOOK BACK','GIVE HIM BACK','SHE SEES YOU'];
    const c=document.createElement('canvas'); c.width=1024; c.height=1024; const g=c.getContext('2d');
    g.fillStyle='#000'; g.fillRect(0,0,1024,1024); g.fillStyle='#fff'; g.textAlign='center'; g.textBaseline='middle';
    let s=13; const r=()=>{ s=(s*16807)%2147483647; return s/2147483647; };
    L.forEach((t,i)=>{ let fs=110; g.font='700 '+fs+'px "Brush Script MT","Segoe Script",Impact,"Arial Black",sans-serif';
      while(g.measureText(t).width>960&&fs>40){ fs-=6; g.font='700 '+fs+'px "Brush Script MT","Segoe Script",Impact,"Arial Black",sans-serif'; }
      const cy=1024-(i+.5)*128; let x=512-g.measureText(t).width/2;
      for(const ch of t){ const w=g.measureText(ch).width; g.save(); g.translate(x+w/2,cy+(r()-.5)*14); g.rotate((r()-.5)*.14); g.scale(1,1+(r()-.5)*.2); g.fillText(ch,0,0); g.restore(); x+=w; } });
    const t=new THREE.CanvasTexture(c); t.flipY=true; t.minFilter=THREE.LinearFilter; t.generateMipmaps=false; t.needsUpdate=true;
    return (this.wt=t);
  },
  flush(ctx){
    const L=ctx.blood; if(!L||!L.length) return;
    const geo=new THREE.PlaneGeometry(1,1), A=new Float32Array(L.length*4);
    L.forEach((b,i)=>{ A[i*4]=b.type; A[i*4+1]=b.seed; A[i*4+2]=b.age; A[i*4+3]=b.ext||0; });
    geo.setAttribute('aB',new THREE.InstancedBufferAttribute(A,4));
    const im=new THREE.InstancedMesh(geo,this.material(),L.length);
    L.forEach((b,i)=>im.setMatrixAt(i,b.m)); im.instanceMatrix.needsUpdate=true; im.computeBoundingSphere();
    im.castShadow=false; im.receiveShadow=true; im.renderOrder=1;
    im.userData.riDetail=true; (ctx.F.riDetail||(ctx.F.riDetail=[])).push(im);
    ctx.F.group.add(im);
  }
};

/* ═════════════ dressing the rooms ═════════════ */
RI.hauntGeo=function(){
  const G=this.geo; if(G.hFile0) return;
  for(let i=0;i<5;i++) G['hFile'+i]=RIH.file(i);
  for(let i=0;i<3;i++) G['hOpen'+i]=RIH.fileOpen(i);
  for(let i=0;i<4;i++) G['hBundle'+i]=RIH.bundle(i);
  G.hClip0=RIH.clipboard(0); G.hClip1=RIH.clipboard(1);
  for(let i=0;i<3;i++) G['hSyr'+i]=RIH.syringe(i);
  for(let i=0;i<3;i++) G['hAmp'+i]=RIH.ampoule(i);
  for(let i=0;i<3;i++) G['hVial'+i]=RIH.vial(i);
  G.hGlass=RIH.glass(0);
  for(let i=0;i<3;i++) G['hGlove'+i]=RIH.glove(i);
  for(let i=0;i<3;i++) G['hMask'+i]=RIH.mask(i);
  G.hCotton=RIH.cotton(0); G.hSteth0=RIH.stetho(0); G.hSteth1=RIH.stetho(1);
  G.hCoatF0=RIH.coatFloor(0,0); G.hCoatF1=RIH.coatFloor(1,.8); G.hCoatF2=RIH.coatFloor(2,1.2);
  G.hCoatH0=RIH.coatHang(0,0); G.hCoatH1=RIH.coatHang(1,.9);
  for(let i=0;i<4;i++) G['hLock'+i]=RIH.lockers(i);
  for(let i=0;i<3;i++) G['hFiling'+i]=RIH.filing(i);
  for(let i=0;i<5;i++) G['hChair'+i]=RIH.chair(i);
  for(let i=0;i<3;i++) G['hScreen'+i]=RIH.screen(i);
  G.hBedside0=RIH.bedside(0); G.hBedside1=RIH.bedside(1);
  G.hBag0=RIH.bodyBag(0); G.hBag1=RIH.bodyBag(1);
};
/* how much the night got into each floor: basement, OPD, medicine,
   records, child, OT, pharmacy, closed wing, psych, ICU, maternity */
RI.HLVL=[.85,.3,.5,.38,.55,.75,.45,.95,.85,.92,1];

/* handrails and the medical-gas line along every corridor wall, x-ray
   viewers in the theatres: the fittings that make a corridor a hospital's */
RI.corridorKit=function(ctx){
  const {fi,y,CH}=ctx, A=ctx.arch, T=WALL_T; if(!A||fi<1) return;
  const zb=HZ-BAND, xb=HX-BAND, rail=RIspec(RK.steel,{c:0xb9bec0,w:.35}), brk=RIspec(RK.steelDull,{w:.4});
  const cu=RIspec(RK.brass,{c:0xb06a3c,r:.35,w:.4}), gasG=RIspec(RK.paintGreen,{c:0x2f7a4a,w:.4}), gasW=RIspec(RK.paintWhite,{c:0xdedbd2,w:.4});
  const onCorr=(w)=>{ const f=Math.abs(w.f);
    if(w.axis==='x'){ if(Math.abs(f-zb)<.3) return -Math.sign(w.f); if(Math.abs(f-(zb-CORR))<.3) return Math.sign(w.f); }
    else { if(Math.abs(f-xb)<.3) return -Math.sign(w.f); if(Math.abs(f-(xb-CORR))<.3) return Math.sign(w.f); }
    return 0; };
  for(const w of ctx.walls){
    const side=onCorr(w); if(!side) continue;
    const a=w.a+.2, b=w.b-.2, len=b-a; if(len<.8) continue;
    if(w.axis==='x'&&Math.abs(w.f)>zb-CORR-.3&&Math.abs(w.f)<zb-CORR+.3&&(a<RUN.x1+1&&b>RUN.x0-1)&&Math.sign(w.f)<0) continue;
    const face=w.f+side*(T/2), P=(l,h,off)=>w.axis==='x'?[l,y+h,face+side*off]:[face+side*off,y+h,l];
    const along=(g)=>w.axis==='x'?g:g;
    const rod=(h,off,r,spec)=>{ const p0=P(a,h,off), p1=P(b,h,off); A.add(RIG.rod(p0,p1,r,10,false),MX(),spec); };
    rod(.9,.065,.02,rail);
    const nb=Math.max(2,Math.round(len/1.2));
    for(let i=0;i<=nb;i++){ const l=a+len*i/nb, q=P(l,.9,0), q2=P(l,.9,.065);
      A.add(RIG.rod([q[0],q[1]-.03,q[2]],[q2[0],q2[1]-.012,q2[2]],.006,6),MX(),brk);
      A.add(RIG.cyl(.028,.028,.008,12),MX(q[0],q[1]-.03,q[2],w.axis==='x'?Math.PI/2:0,0,w.axis==='x'?0:Math.PI/2),brk); }
    rod(CH-.28,.05,.011,cu); rod(CH-.34,.05,.011,gasG); rod(CH-.4,.05,.009,gasW);
    for(let l=a+.3;l<b;l+=1.5){ for(const h of [CH-.28,CH-.34,CH-.4]){ const q=P(l,h,.05); A.add(RIG.box(w.axis==='x'?.02:.06,.03,w.axis==='x'?.06:.02),MX(q[0],q[1],q[2]-(w.axis==='x'?side*.02:0)),brk); } }
  }
  /* x-ray viewers: a lit panel with a film clipped to it, in theatres and ICU */
  for(const r of ctx.F.rooms||[]){ if(!/^(ot|ot2|icu)$/.test(r.kind||'')) continue;
    const zf=r.dir>0?r.z1-T/2:r.z0+T/2, nz=r.dir>0?-1:1, cx=(r.x0+r.x1)/2+1.4;
    if(Math.abs(cx)>HX-1) continue;
    this.put(ctx,'xray',this.geo.hXray||(this.geo.hXray=RIH.xray()),MX(cx,y+1.55,zf,0,nz>0?0:Math.PI,0),null,false); }
};
RIH.xray=()=>{
  const g=new GB();
  g.add(RIG.rbox(.9,.52,.08,.01,2),MX(0,0,.04),RIspec(RK.paintWhite,{c:0xd9d6cc,w:.4}));
  g.add(RIG.box(.8,.42,.004),MX(0,0,.081),RIspec(RK.ledG,{c:0xd8e6ea,w:.55}));
  for(const x of [-.2,.2]){ g.add(RIG.plane(.36,.4,30,34),MX(x,-.005,.085),RIspec(RK.plBlack,{c:0x0a0c0d,r:.15}),(px,py,pz,c)=>{
      const u=(px-x)/.18, v=py/.2; const rib=Math.abs(Math.sin(v*9+Math.abs(u)*2.4))>.8&&Math.abs(u)<.8&&Math.abs(u)>.1;
      const sp=Math.abs(u)<.08; if(rib||sp) c.setRGB(.55,.58,.6); }); }
  return g.geometry();
};

RI.haunt=function(ctx){
  try{ this.hauntGeo(); }catch(e){ console.warn('RI haunt geo',e); return; }
  try{ this.corridorKit(ctx); }catch(e){ console.warn('RI corridor kit',e); }
  const {F,fi,y,CH}=ctx, R=mulberry(90210+fi*1319), G=this.geo, lv=this.HLVL[fi]||.5, T=WALL_T;
  const rnd=(a,b)=>a+(b-a)*R(), pick=a=>a[(R()*a.length)|0];
  const clut=ctx.clut=new GB();
  const col=F.riCol||(F.riCol=[]);
  /* footprints already on the floor: collision rects and every modelled prop */
  const taken=[];
  for(const r of F.rects) if(!r.door) taken.push([r.x0,r.z0,r.x1,r.z1]);
  const v3=new THREE.Vector3();
  for(const [k,e] of ctx.inst){ if(!k.startsWith('hp:')) continue; const g=e.geo; if(!g.boundingBox) g.computeBoundingBox(); const b=g.boundingBox;
    for(const it of e.items){ let x0=1e9,z0=1e9,x1=-1e9,z1=-1e9;
      for(const cx of [b.min.x,b.max.x])for(const cz of [b.min.z,b.max.z]){ v3.set(cx,b.min.y,cz).applyMatrix4(it.m); x0=Math.min(x0,v3.x);x1=Math.max(x1,v3.x);z0=Math.min(z0,v3.z);z1=Math.max(z1,v3.z); }
      if(x1-x0<4&&z1-z0<4) taken.push([x0,z0,x1,z1,k]); } }
  const free=(x0,z0,x1,z1,pad=.04)=>{
    if(x0<-HX+.3||x1>HX-.3||z0<-HZ+.3||z1>HZ-.3) return false;
    if(x1>RUN.x0-.6&&x0<RUN.x1+.6&&z1>RUN.z0-.6&&z0<RUN.z1+.6) return false;
    for(const t of taken) if(x1>t[0]-pad&&x0<t[2]+pad&&z1>t[1]-pad&&z0<t[3]+pad) return false;
    return true; };
  const doorNear=(x,z,d)=>F.doors.some(D=>Math.hypot(D.x-x,D.z-z)<d)||(F.openings||[]).some(o=>Math.hypot(o.x-x,o.z-z)<d);
  /* a small thing on the floor, merged into the floor's clutter mesh */
  const small=(g,x,z,ry,yy=0,rx=0,rz=0,s=1)=>{ clut.mergeGeo(g,MX(x,y+yy,z,rx,ry,rz,s,s,s)); };
  /* a tall thing against a wall: instanced, with an AO footprint and a collider */
  const tall=(key,x,z,ry,w,d,solid=true,k=.7)=>{
    const c=Math.abs(Math.cos(ry)), s=Math.abs(Math.sin(ry)), ex=(w*c+d*s)/2, ez=(w*s+d*c)/2;
    if(!free(x-ex,z-ez,x+ex,z+ez)||doorNear(x,z,1.25)) return false;
    this.put(ctx,key,G[key],MX(x,y,z,0,ry,0),null,true); this.aoFoot(ctx,x,z,w,d,ry,k);
    taken.push([x-ex,z-ez,x+ex,z+ez]); if(solid) col.push({x0:x-ex*.92,z0:z-ez*.92,x1:x+ex*.92,z1:z+ez*.92});
    return true; };
  const blood=(type,m,age,ext=0)=>{ (ctx.blood||(ctx.blood=[])).push({type,m,seed:R()*97,age,ext}); };
  const floorB=(type,x,z,ry,sx,sz,age,ext)=>{ if(x>RUN.x0-.3&&x<RUN.x1+.3&&z>RUN.z0-.3&&z<RUN.z1+.3) return;
    blood(type,MX(x,y+.0025+R()*.001,z,-Math.PI/2,ry,0,sx,sz,1),age,ext); };
  const wallB=(type,x,yy,z,nx,nz,sx,sy,age,ext)=>blood(type,MX(x+nx*.004,y+yy,z+nz*.004,0,Math.atan2(nx,nz),0,sx,sy,1),age,ext);
  const age=()=>Math.min(1,Math.max(0,(R()<.35*lv?0:.45)+R()*.55-(lv>.9?.25:0)));
  const rooms=F.rooms||[];
  /* the four walls of a room, as faces you can stand in front of */
  const faces=r=>[
    {ax:'x',f:r.z0+T/2,a:r.x0+T/2,b:r.x1-T/2,nx:0,nz:1},{ax:'x',f:r.z1-T/2,a:r.x0+T/2,b:r.x1-T/2,nx:0,nz:-1},
    {ax:'z',f:r.x0+T/2,a:r.z0+T/2,b:r.z1-T/2,nx:1,nz:0},{ax:'z',f:r.x1-T/2,a:r.z0+T/2,b:r.z1-T/2,nx:-1,nz:0}];
  const onFace=(fc,l,off)=>fc.ax==='x'?[l,fc.f+fc.nz*off]:[fc.f+fc.nx*off,l];
  const spotOnWall=(r,off,margin)=>{ for(let k=0;k<12;k++){ const fc=pick(faces(r)); if(fc.b-fc.a<2*margin+.2) continue;
      const l=rnd(fc.a+margin,fc.b-margin), p=onFace(fc,l,off); if(doorNear(p[0],p[1],1.3)) continue;
      if((ctx.spill||[]).some(m=>{ v3.setFromMatrixPosition(m); return Math.hypot(v3.x-p[0],v3.z-p[1])<1.0; })) continue;
      return {fc,x:p[0],z:p[1],ry:Math.atan2(fc.nx,fc.nz)}; } return null; };
  const kindOf=k=>/^ward|maternity|icu|peds|psych/.test(k)?'ward':/^(office|duty|records)/.test(k)?'office':/^(store|pharmacy)/.test(k)?'store':
    /^ot/.test(k)?'ot':k==='waiting'?'waiting':k==='morgue'?'morgue':k==='prayer'?'prayer':'other';
  const bbB=(PROPS['01_hospital_bed']&&PROPS['01_hospital_bed'].boundingBox)||{min:{x:-1,z:-.5},max:{x:1,z:.5}};
  const bedAlongX=(bbB.max.x-bbB.min.x)>(bbB.max.z-bbB.min.z), bedHalfW=bedAlongX?(bbB.max.z-bbB.min.z)/2:(bbB.max.x-bbB.min.x)/2;
  const bedLen=bedAlongX?(bbB.max.x-bbB.min.x):(bbB.max.z-bbB.min.z);
  const bedLocal=(side,along)=>bedAlongX?new THREE.Vector3(along,0,side):new THREE.Vector3(side,0,along);
  const beds=[]; for(const [k,e] of ctx.inst) if(k==='hp:01_hospital_bed'||k==='hp:28_damaged_hospital_bed') for(const it of e.items){ v3.setFromMatrixPosition(it.m); beds.push({x:v3.x,z:v3.z,m:it.m}); }
  const stretchers=[]; for(const [k,e] of ctx.inst) if(k==='hp:03_stretcher_trolley') for(const it of e.items){ v3.setFromMatrixPosition(it.m); stretchers.push({x:v3.x,z:v3.z,m:it.m}); }

  for(const r of rooms){
    const kd=kindOf(r.kind||''), cx=(r.x0+r.x1)/2, cz=(r.z0+r.z1)/2, w=r.x1-r.x0, d=r.z1-r.z0, area=w*d;
    const inR=(m)=>[rnd(r.x0+m,r.x1-m),rnd(r.z0+m,r.z1-m)];
    const clearOfCentre=(x,z)=>!r.tagged||Math.hypot(x-cx,z-cz)>1.4;
    const scatter=(n,fn)=>{ for(let i=0;i<n;i++){ const p=inR(.45); if(!clearOfCentre(p[0],p[1])) continue;
      if(!free(p[0]-.12,p[1]-.12,p[0]+.12,p[1]+.12,-.02)) continue; fn(p[0],p[1]); } };
    const files=k=>scatter(k,(x,z)=>{ const t=R(); if(t<.45) small(G['hFile'+((R()*5)|0)],x,z,R()*6.28);
      else if(t<.7) small(G['hOpen'+((R()*3)|0)],x,z,R()*6.28);
      else if(t<.85) small(G['hBundle'+((R()*4)|0)],x,z,R()*6.28);
      else small(G['hClip'+((R()*2)|0)],x,z,R()*6.28); });
    const sharps=k=>scatter(k,(x,z)=>{ const n=1+((R()*4)|0);
      for(let i=0;i<n;i++){ const t=R(), px=x+(R()-.5)*.35, pz=z+(R()-.5)*.35;
        if(t<.5) small(G['hSyr'+((R()*3)|0)],px,pz,R()*6.28); else if(t<.7) small(G['hAmp'+((R()*3)|0)],px,pz,R()*6.28);
        else if(t<.85) small(G['hVial'+((R()*3)|0)],px,pz,R()*6.28); else small(G.hCotton,px,pz,R()*6.28); }
      if(R()<.4) small(G.hGlass,x+.15,z-.1,R()*6.28); });
    const ppe=k=>scatter(k,(x,z)=>{ if(R()<.55) small(G['hGlove'+((R()*3)|0)],x,z,R()*6.28); else small(G['hMask'+((R()*3)|0)],x,z,R()*6.28); });
    const coatFloor=()=>{ for(let k=0;k<6;k++){ const p=inR(.9); if(!clearOfCentre(p[0],p[1])) continue;
      if(!free(p[0]-.7,p[1]-.7,p[0]+.7,p[1]+.7,-.1)) continue;
      const b=R()<lv*.8, key=b?(R()<.5?'hCoatF1':'hCoatF2'):'hCoatF0';
      this.put(ctx,key,G[key],MX(p[0],y+.001,p[1],0,R()*6.28,0),null,true);
      taken.push([p[0]-.6,p[1]-.6,p[0]+.6,p[1]+.6]);
      if(R()<.35) small(G['hSteth'+((R()*2)|0)],p[0]+.55,p[1]+.2,R()*6.28);
      if(b&&R()<.7) floorB(0,p[0]+(R()-.5)*.6,p[1]+(R()-.5)*.6,R()*6.28,.7+R()*.6,.7+R()*.6,age());
      return; } };
    const coatHook=()=>{ const s=spotOnWall(r,.012,.5); if(!s) return;
      const key=R()<lv*.7?'hCoatH1':'hCoatH0'; this.put(ctx,key,G[key],MX(s.x,y+1.9,s.z,0,s.ry,0),null,true); };

    /* furniture against the walls */
    if(!r.tagged){
      if(kd==='ward'){ if(R()<.6){ const s=spotOnWall(r,.5,.9); if(s) tall('hScreen'+((R()*3)|0),s.x,s.z,s.ry,1.5,.5); }
        for(const b of beds){ if(b.x<r.x0||b.x>r.x1||b.z<r.z0||b.z>r.z1) continue; if(R()<.55){
          const rot=new THREE.Matrix4().extractRotation(b.m), e=bedLocal((R()<.5?-1:1)*(bedHalfW+.32),bedLen/2-.35).applyMatrix4(rot);
          const f=bedLocal(1,0).applyMatrix4(rot); tall('hBedside'+((R()*2)|0),b.x+e.x,b.z+e.z,Math.atan2(f.x,f.z)+(R()-.5)*.2,.46,.44,true,.5); } } }
      if(kd==='office'){ for(let i=0;i<(R()<.6?2:1);i++){ const s=spotOnWall(r,.33,.5); if(s) tall('hFiling'+((R()*3)|0),s.x,s.z,s.ry,.47,.62); }
        if(r.kind==='duty'&&R()<.8){ const s=spotOnWall(r,.25,.7); if(s) tall('hLock'+((R()*4)|0),s.x,s.z,s.ry,.93,.46); } }
      if(kd==='store'){ const s=spotOnWall(r,.25,.7); if(s) tall('hLock'+((R()*4)|0),s.x,s.z,s.ry,.93,.46);
        if(R()<.6){ const s2=spotOnWall(r,.33,.5); if(s2) tall('hFiling'+((R()*3)|0),s2.x,s2.z,s2.ry,.47,.62); } }
      if(kd==='ot'&&R()<.8){ const s=spotOnWall(r,.5,.9); if(s) tall('hScreen'+((R()*3)|0),s.x,s.z,s.ry,1.5,.5); }
      /* chairs: along a wall, and the odd one knocked over */
      const nCh=kd==='waiting'?4+((R()*4)|0):(kd==='office'||kd==='ward'?1+((R()*2)|0):(R()<.4?1:0));
      for(let i=0;i<nCh;i++){ const s=spotOnWall(r,.3,.4); if(!s) continue; const k='hChair'+(fi+i)%5;
        if(R()<.25+lv*.25){ const p=inR(.7); if(free(p[0]-.3,p[1]-.3,p[0]+.3,p[1]+.3)&&clearOfCentre(p[0],p[1])){
          const rot=MX(0,0,0,0,R()*6.28,0).multiply(MX(0,0,0,-Math.PI/2+.2,0,0)); const cb=G[k].boundingBox; let mn=1e9;
          for(const bx of [cb.min.x,cb.max.x])for(const by of [cb.min.y,cb.max.y])for(const bz of [cb.min.z,cb.max.z]) mn=Math.min(mn,v3.set(bx,by,bz).applyMatrix4(rot).y);
          const m=MX(p[0],y-mn,p[1]).multiply(rot);
          this.put(ctx,k,G[k],m,null,true); taken.push([p[0]-.35,p[1]-.35,p[0]+.35,p[1]+.35]); continue; } }
        tall(k,s.x,s.z,s.ry+(R()-.5)*.35,.47,.47,true,.35); }
    }
    if(kd!=='prayer'&&(R()<.4+lv*.4)) coatHook();
    if(kd!=='prayer'&&(R()<.3+lv*.45)) coatFloor();
    if(kd==='ward'&&R()<lv) coatFloor();

    /* the things on the floor */
    const sc=Math.max(.6,Math.min(1.6,area/22));
    if(kd==='office') files(Math.round((14+R()*10)*sc)); else if(kd==='store') files(Math.round((6+R()*5)*sc)); else if(kd!=='prayer') files(Math.round((4+R()*4)*sc));
    if(kd==='ward'||kd==='ot'||kd==='store') sharps(Math.round((3+R()*3+lv*3)*sc)); else if(kd!=='prayer') sharps(1+((R()*2)|0));
    if(kd==='ot'||kd==='ward') ppe(Math.round((3+R()*3)*sc)); else if(kd!=='prayer') ppe(1+((R()*2)|0));
    if(kd==='morgue'){
      for(const st of stretchers){ if(st.x<r.x0||st.x>r.x1||st.z<r.z0||st.z>r.z1) continue;
        const sb=PROPS['03_stretcher_trolley'].boundingBox, alongX=(sb.max.x-sb.min.x)>(sb.max.z-sb.min.z);
        const m=st.m.clone().multiply(MX((sb.min.x+sb.max.x)/2,sb.max.y*.93,(sb.min.z+sb.max.z)/2,0,alongX?0:Math.PI/2,0)); this.put(ctx,'hBag'+((R()*2)|0),R()<.5?G.hBag0:G.hBag1,m,null,true); }
      for(let i=0;i<2;i++){ const p=inR(1.1); if(free(p[0]-.95,p[1]-.4,p[0]+.95,p[1]+.4)&&clearOfCentre(p[0],p[1])){
        const ry=R()<.5?0:Math.PI/2; this.put(ctx,'hBag'+(i%2),G['hBag'+(i%2)],MX(p[0],y,p[1],0,ry+(R()-.5)*.3,0),null,true);
        taken.push([p[0]-1,p[1]-1,p[0]+1,p[1]+1]); if(R()<.6) floorB(0,p[0]+.3,p[1]+.2,R()*6.28,.9,.9,.6); } }
    }

    /* blood, and where it goes */
    const bl=lv*(kd==='ward'||kd==='ot'||kd==='morgue'?1.2:kd==='office'?.7:.85);
    for(let pn=0;pn<1+(R()<bl*.6?1:0);pn++) if(R()<.35+bl*.7){ /* a pool by a bed, or in the room */
      let px,pz; const bb=beds.filter(b=>b.x>r.x0&&b.x<r.x1&&b.z>r.z0&&b.z<r.z1);
      if(bb.length&&R()<.7){ const b=pick(bb); const e=bedLocal((R()<.5?1:-1)*(bedHalfW+.25),(R()-.5)*bedLen*.6).applyMatrix4(new THREE.Matrix4().extractRotation(b.m)); px=b.x+e.x; pz=b.z+e.z; }
      else { const p=inR(.8); px=p[0]; pz=p[1]; }
      const s=.7+R()*.9; floorB(0,px,pz,R()*6.28,s,s*(.8+R()*.4),age());
      /* dragged from there towards the door */
      if(R()<bl*.6&&r.door){ const dx=r.door.x-px, dz=r.door.z-pz, Ld=Math.hypot(dx,dz);
        if(Ld>1.2){ const n=Math.ceil(Ld/1.4), ag=Math.max(.45,age()); for(let k=0;k<n;k++){ const t=(k+.5)/n;
          floorB(1,px+dx*t,pz+dz*t,Math.atan2(-dz,dx),Ld/n*1.15,.5+R()*.2,Math.min(1,ag+k*.04)); } } }
      else if(R()<.5){ const dx=(R()-.5), dz=(R()-.5), a=Math.atan2(dz,dx);
        for(let k=1;k<5;k++) floorB(R()<.25&&fi===10?6:5,px+Math.cos(a)*k*.62,pz+Math.sin(a)*k*.62,Math.atan2(-Math.cos(a),-Math.sin(a)),.36,.62,Math.min(1,.2+k*.18),1-k*.2); }
    }
    if(R()<.2+bl*.6){ /* a hand on the wall by the door on the way out */
      const D=r.door; if(D){ const fcs=faces(r).filter(fc=>fc.ax===D.axis&&Math.abs(fc.f-(D.axis==='x'?D.z:D.x))<.5);
        const fc=fcs[0]; if(fc){ const l=(D.axis==='x'?D.x:D.z)+(R()<.5?-1:1)*(.95+R()*.25);
          const p=onFace(fc,l,0); const n=1+((R()*3)|0);
          for(let k=0;k<n;k++) wallB(3,p[0]+(fc.ax==='x'?(R()-.5)*.25:0),.95+R()*.6,p[1]+(fc.ax==='z'?(R()-.5)*.25:0),fc.nx,fc.nz,.4,.42,age(),R()<.6?1:0); } } }
    if(R()<.15+bl*.6){ const s=spotOnWall(r,0,.4); if(s){ const yy=.7+R()*1.0, ag=age();
        wallB(2,s.x,yy,s.z,s.fc.nx,s.fc.nz,.9+R()*.5,.9+R()*.5,ag); if(R()<.8) wallB(4,s.x+(s.fc.nz?(R()-.5)*.2:0),yy-.35,s.z+(s.fc.nx?(R()-.5)*.2:0),s.fc.nx,s.fc.nz,.6,.9,ag); } }
    if(fi>=7&&R()<.28*lv){ const s=spotOnWall(r,0,1.3); if(s) wallB(7,s.x,1.35+R()*.3,s.z,s.fc.nx,s.fc.nz,2.1+R()*.5,.3,.2+R()*.4,(R()*8)|0); }
  }

  /* the corridor ring */
  const zb=HZ-BAND, xb=HX-BAND, CZN=zb-CORR/2, CXE=xb-CORR/2;
  const runs=[{ax:'x',c:CZN},{ax:'x',c:-CZN},{ax:'z',c:CXE},{ax:'z',c:-CXE}];
  const nTrail=Math.round(lv*3.2), nPool=Math.round(1+lv*5), nHand=Math.round(lv*6);
  for(let i=0;i<nTrail;i++){ const ru=pick(runs), Lr=ru.ax==='x'?HX-6:zb-3, s0=rnd(-Lr,Lr-6), len=rnd(3,7), ag=Math.max(.45,age()), off=(R()-.5)*.8;
    const n=Math.ceil(len/1.3);
    for(let k=0;k<n;k++){ const t=s0+(k+.5)*len/n, wig=Math.sin(k*1.3+i)*.18;
      const x=ru.ax==='x'?t:ru.c+off+wig, z=ru.ax==='x'?ru.c+off+wig:t, a=ru.ax==='x'?0:Math.PI/2;
      floorB(1,x,z,a+(R()-.5)*.15,len/n*1.2,.55+R()*.15,Math.min(1,ag+k*.05)); }
    const e=s0+len; floorB(0,ru.ax==='x'?e:ru.c+off,ru.ax==='x'?ru.c+off:e,R()*6.28,.8+R()*.5,.8+R()*.5,ag); }
  for(let i=0;i<nPool;i++){ const ru=pick(runs), Lr=ru.ax==='x'?HX-4:zb-2, t=rnd(-Lr,Lr), o=(R()-.5)*(CORR-1);
    const x=ru.ax==='x'?t:ru.c+o, z=ru.ax==='x'?ru.c+o:t; floorB(R()<.3?2:0,x,z,R()*6.28,.6+R()*.9,.6+R()*.9,age()); }
  if(lv>.5){ const ru=pick(runs), Lr=ru.ax==='x'?HX-8:zb-5, t0=rnd(-Lr,Lr-5), bare=fi===10||fi===4;
    for(let k=0;k<9;k++){ const t=t0+k*.62, x=ru.ax==='x'?t:ru.c+.2, z=ru.ax==='x'?ru.c+.2:t;
      floorB(bare?6:5,x,z,(ru.ax==='x'?-Math.PI/2:0),bare?.3:.36,.62,Math.min(1,.25+k*.09),1-k/9); } }
  for(let i=0;i<nHand;i++){ const w=pick(ctx.walls); const len=w.b-w.a; if(len<1.2) continue;
    const l=rnd(w.a+.4,w.b-.4), side=R()<.5?-1:1;
    if(w.axis==='x'&&Math.abs(Math.abs(w.f)-(HZ-T/2))<.05&&Math.sign(w.f)===side) continue;
    if(w.axis==='z'&&Math.abs(Math.abs(w.f)-(HX-T/2))<.05&&Math.sign(w.f)===side) continue;
    const nx=w.axis==='z'?side:0, nz=w.axis==='x'?side:0, x=w.axis==='x'?l:w.f+side*T/2, z=w.axis==='x'?w.f+side*T/2:l;
    if(ctx.signs.some(q=>Math.hypot(q.x-x,q.z-z)<1.2)||doorNear(x,z,.9)) continue;
    const t=R(); if(t<.5) wallB(3,x,.9+R()*.7,z,nx,nz,.4,.42,age(),1); else if(t<.8){ const yy=.8+R()*.9; wallB(2,x,yy,z,nx,nz,1.1,1.1,age()); wallB(4,x,yy-.4,z,nx,nz,.6,.9,age()); }
    else if(fi>=5) wallB(7,x,1.4+R()*.25,z,nx,nz,2.2,.32,.15+R()*.3,(R()*8)|0); }
  /* the corridor's own dropped things */
  for(let i=0;i<Math.round(4+lv*8);i++){ const ru=pick(runs), Lr=ru.ax==='x'?HX-4:zb-2, t=rnd(-Lr,Lr), o=(R()-.5)*(CORR-.9);
    const x=ru.ax==='x'?t:ru.c+o, z=ru.ax==='x'?ru.c+o:t; if(!free(x-.2,z-.2,x+.2,z+.2,-.02)) continue;
    const k=R(); if(k<.35) small(G['hFile'+((R()*5)|0)],x,z,R()*6.28); else if(k<.55) small(G['hSyr'+((R()*3)|0)],x,z,R()*6.28);
    else if(k<.7) small(G['hGlove'+((R()*3)|0)],x,z,R()*6.28); else if(k<.8) small(G['hMask'+((R()*3)|0)],x,z,R()*6.28);
    else if(k<.9) small(G['hOpen'+((R()*3)|0)],x,z,R()*6.28); else if(free(x-.7,z-.7,x+.7,z+.7,-.1)){ this.put(ctx,'hCoatF'+(R()<lv?1:0),G['hCoatF'+(R()<lv?1:0)],MX(x,y+.001,z,0,R()*6.28,0),null,true); } }

  if(!clut.empty()){ const m=new THREE.Mesh(clut.geometry(),MAT.prop); m.castShadow=!IS_TOUCH; m.receiveShadow=true;
    m.userData.riDetail=true; (F.riDetail||(F.riDetail=[])).push(m); F.group.add(m); }
  ctx.clut=null;
  RI_BLOOD.flush(ctx); ctx.blood=null;
};
