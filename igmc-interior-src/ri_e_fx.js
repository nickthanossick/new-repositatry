
/* ---- REDO fittings rebuilt: pleated ward curtains, ceiling fans, pipes ---- */
RI.curtain=function(ctx,x,z,ry,w){
  const {F,y}=ctx;
  const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry;
  const rail=new GB();
  rail.add(RIG.rod([-w/2-.08,2.38,0],[w/2+.08,2.38,0],.014,10),MX(),RK.chrome);
  for(const s of [-1,1]) rail.add(RIG.rod([s*(w/2+.04),2.38,0],[s*(w/2+.04),CH_RI(ctx),0],.008,6),MX(),RK.chrome);
  const n=Math.round(w/.13);
  for(let i=0;i<=n;i++) rail.add(RIG.torus(.016,.003,5,12),MX(-w/2+w*i/n,2.36,0,0,Math.PI/2,0),RK.chrome);
  const rm=new THREE.Mesh(rail.geometry(),MAT.prop); rm.castShadow=!IS_TOUCH; g.add(rm);
  const cg=new THREE.PlaneGeometry(w,1.85,RIseg(Math.round(w*34),12),RIseg(22,6));
  const p=cg.attributes.position;
  for(let i=0;i<p.count;i++){ const xx=p.getX(i), yy=p.getY(i), t=(yy+.925)/1.85;
    p.setZ(i,.05*(.6+.4*t)*Math.sin(xx*46+ry)+.015*Math.sin(xx*9+yy*2.3)+.025*(1-t)*Math.sin(yy*1.7+xx)); }
  cg.computeVertexNormals();
  const c=new THREE.Mesh(cg,MAT.curtain); c.position.set(0,1.42,0); c.castShadow=!IS_TOUCH; c.receiveShadow=true; g.add(c);
  F.group.add(g); (F.dyn.curtains||(F.dyn.curtains=[])).push(g);
};
const CH_RI=(ctx)=>ctx.CH;
RI.fan=function(ctx,x,z){
  const {F,y,CH}=ctx;
  const g=new THREE.Group(); g.position.set(x,y+CH,z);
  const b=new THREE.Mesh(this.geo.fan.body,MAT.prop); b.castShadow=!IS_TOUCH; g.add(b);
  const rotor=new THREE.Mesh(this.geo.fan.rotor,MAT.prop); rotor.position.y=-.47; rotor.castShadow=!IS_TOUCH; g.add(rotor);
  g.userData.rotor=rotor; F.group.add(g); (F.dyn.fans||(F.dyn.fans=[])).push(g);
};
RI.pipe=function(ctx,x,yy,z,len){
  const A=ctx.arch, pc=RIspec(RK.paintGrey,{c:[0x566a5a,0x6b6f72,0x7a3b2a][Math.floor(Math.abs(x*7+z*3))%3],w:.6,d:6});
  A.add(RIG.cyl(.075,.075,len,RIseg(18,8),true),MX(x,yy,z,0,0,Math.PI/2),pc);
  const nf=Math.max(2,Math.round(len/2.4));
  for(let i=0;i<=nf;i++){ const px=x-len/2+len*i/nf;
    A.add(RIG.cyl(.105,.105,.035,RIseg(20,8)),MX(px,yy,z,0,0,Math.PI/2),pc);
    for(let k=0;k<6;k++){ const a=k/6*Math.PI*2; A.add(RIG.cyl(.008,.008,.05,6),MX(px,yy+Math.cos(a)*.09,z+Math.sin(a)*.09,0,0,Math.PI/2),RK.steelDull); } }
  for(let i=0;i<2;i++){ const px=x-len*.3+len*.6*i;
    A.add(RIG.rod([px,yy,z],[px,ctx.y+ctx.CH,z],.008,6),MX(),RK.steelDull);
    A.add(RIG.torus(.085,.008,5,20,Math.PI),MX(px,yy,z,0,Math.PI/2,Math.PI),RK.steelDull); }
  if(riHash(x,z,1)<.4){ const px=x+len*.15;
    A.add(RIG.cyl(.02,.02,.2,10),MX(px,yy+.15,z),RK.brass);
    A.add(RIG.torus(.09,.009,6,28),MX(px,yy+.26,z,Math.PI/2,0,0),RIspec(RK.paintRed,{c:0x8b1b12}));
    for(let k=0;k<4;k++){ const a=k*Math.PI/2; A.add(RIG.rod([px,yy+.26,z],[px+Math.cos(a)*.09,yy+.26,z+Math.sin(a)*.09],.005,5),MX(),RIspec(RK.paintRed,{c:0x8b1b12})); } }
};

/* ---- dust hanging in the torch beam ---- */
RI.initDust=function(){
  const n=IS_TOUCH?(LOW_END?260:600):1700;
  const pos=new Float32Array(n*3), seed=new Float32Array(n);
  for(let i=0;i<n;i++){ pos[i*3]=Math.random(); pos[i*3+1]=Math.random(); pos[i*3+2]=Math.random(); seed[i]=Math.random(); }
  const g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(pos,3)); g.setAttribute('seed',new THREE.BufferAttribute(seed,1));
  const U={uCam:{value:new THREE.Vector3()},uBox:{value:7.0},uT:{value:0},uTP:{value:new THREE.Vector3()},
    uTD:{value:new THREE.Vector3(0,0,-1)},uCos:{value:.8},uI:{value:0},uPx:{value:500}};
  const mat=new THREE.ShaderMaterial({uniforms:U,
    vertexShader:`attribute float seed; uniform vec3 uCam; uniform float uBox,uT,uCos,uI,uPx; uniform vec3 uTP,uTD; varying float vA;
      void main(){
        vec3 drift=vec3(sin(uT*.13+seed*40.)*.35, sin(uT*.07+seed*17.)*.22-uT*.01, cos(uT*.11+seed*23.)*.35);
        vec3 p=position*uBox+drift;
        vec3 w=uCam+mod(p-uCam+uBox*.5,uBox)-uBox*.5;
        vec3 d=w-uTP; float L=max(length(d),1e-3); float c=dot(d/L,uTD);
        float cone=smoothstep(uCos,uCos+.05,c)*(.35+.65*smoothstep(uCos+.03,1.,c));
        float fall=1./(1.+L*L*.09);
        float tw=.5+.5*sin(uT*1.3+seed*60.);
        vA=cone*fall*uI*(.35+.65*tw)*smoothstep(.2,.8,L);
        vec4 mv=viewMatrix*vec4(w,1.); gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp((.0025+.0045*seed)*uPx/max(-mv.z,.05),1.,7.);
      }`,
    fragmentShader:`varying float vA; void main(){ vec2 q=gl_PointCoord-.5; float r=dot(q,q)*4.; float a=exp(-r*2.6)*vA*.55; if(a<.003) discard; gl_FragColor=vec4(vec3(1.,.96,.88),a); }`,
    transparent:true, depthWrite:false, blending:THREE.AdditiveBlending });
  const pts=new THREE.Points(g,mat); pts.frustumCulled=false; pts.renderOrder=3; pts.visible=false;
  scene.add(pts); this.dust=pts; this.dustU=U;
};
const _riA=new THREE.Vector3(), _riB=new THREE.Vector3();
RI.update=function(dt){
  this.t+=dt; RIU.uRItime.value=this.t;
  /* furniture on the floors above and below is only ever glimpsed through
     the stair shaft: draw the building there, not its contents */
  const fk=P.inside?P.floor:-99;
  if(fk!==this._detFloor){ this._detFloor=fk;
    for(const k in Int.floors){ const F=Int.floors[k]; if(!F.riDetail) continue; const vis=(+k===fk);
      for(const m of F.riDetail) m.visible=vis; } }
  RIU.uRIpow.value=(typeof powerOn==='undefined'||powerOn)?1:0;
  if(this.envMats){ const k=(RIU.uRIpow.value?.32:.1)*(1-.5*clamp(P.danger||0,0,1));
    if(Math.abs(k-(this._envK||0))>.005){ this._envK=k; for(const m of this.envMats) m.envMapIntensity=k; } }
  /* distant lightning over the hills, only ever seen in the windows */
  if(P.inside&&P.floor>0){
    this.flashT-=dt;
    if(this.flashT<=0){ this.flashT=rnd(26,70); const n=1+((Math.random()*3)|0); this.flashes=[];
      let t=0; for(let i=0;i<n;i++){ this.flashes.push({t:this.t+t,a:rnd(.5,1)}); t+=rnd(.07,.22); } }
  }
  let f=0; if(this.flashes) for(const q of this.flashes){ const d=this.t-q.t; if(d>0&&d<1.2) f+=q.a*Math.exp(-d*14); }
  RIU.uRIflash.value=f;
  if(this.dust){
    const on=P.inside&&Torch.spot&&!State.paused;
    this.dust.visible=!!on;
    if(on){
      const U=this.dustU; U.uT.value=this.t;
      camera.getWorldPosition(U.uCam.value);
      Torch.spot.getWorldPosition(_riA); Torch.spot.target.getWorldPosition(_riB);
      U.uTP.value.copy(_riA); U.uTD.value.copy(_riB).sub(_riA).normalize();
      U.uCos.value=Math.cos(Torch.spot.angle*.92);
      U.uI.value=clamp(Torch.spot.intensity/Math.max(1,Torch.power),0,1.2);
      U.uPx.value=renderer.domElement.height/(2*Math.tan(camera.fov*Math.PI/360));
    }
  }
};

/* The legacy Builder draws six Math.random() per box for its face tint.
   Wherever a legacy box was replaced, the same number of draws is made,
   so the rest of the floor rolls exactly the layout it always did. */
RI.burn=function(n){ for(let i=0;i<n;i++) Math.random(); };
