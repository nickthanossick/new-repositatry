/* ═════════════ the hand on the torch ═════════════
   The old view model was a flat, cartoon hand bent round the barrel in the
   vertex shader, which left daylight between the fingers and the torch.
   This one is modelled as one closed surface: a signed-distance hand —
   phalanges, knuckles, metacarpals with their tendons, palm pads, thenar and
   hypothenar, the wrist and a forearm running off the bottom of the screen —
   with the torch barrel subtracted from it, so every finger lies exactly on
   the metal and flattens a little where it presses. It is meshed with
   surface nets on a 2 mm grid. The skin shader adds raised dorsal veins,
   pores, knuckle redness and a warm wrap light; the forearm and the back of
   the hand carry a few thousand individual hairs; the nails are separate.
   Everything is in torch space: the barrel runs along -Z from the tail at 0. */
const RIHAND={
  RB:.0186,
  prims(){
    const V=(x,y,z)=>new THREE.Vector3(x,y,z), RB=this.RB, rad=d=>d*Math.PI/180;
    const ring=(r,phi,z)=>V(r*Math.cos(rad(phi)),r*Math.sin(rad(phi)),z);
    /* index, middle, ring, little: station on the barrel, radii, wrap angles */
    const F=[
      {z:-.127,r:[.0098,.0089,.0080],a:[14,-60,-128,-186]},
      {z:-.1065,r:[.0103,.0093,.0083],a:[12,-62,-132,-190]},
      {z:-.0865,r:[.0096,.0087,.0078],a:[10,-60,-126,-180]},
      {z:-.068,r:[.0083,.0075,.0068],a:[6,-54,-114,-162]}];
    const fingers=F.map(f=>{ const K=ring(.0408,f.a[0],f.z);
      const J=[K,ring(RB+f.r[0]*.96,f.a[1],f.z),ring(RB+f.r[1]*.96,f.a[2],f.z),ring(RB+f.r[2]*.95,f.a[3],f.z)];
      return {J,r:f.r}; });
    const Kc=fingers.reduce((s,f)=>s.add(f.J[0]),V(0,0,0)).multiplyScalar(1/4);
    const m=V(.26,-.72,.64).normalize();
    const Wc=Kc.clone().addScaledVector(m,.078);
    const meta=fingers.map(f=>{ const K=f.J[0]; const W=Wc.clone(); W.z+=(K.z-Kc.z)*.32; return [W,K]; });
    const T0=V(.059,-.036,-.083), T1=V(.037,.011,-.141), T2=V(.015,.031,-.151), T3=V(-.011,.0285,-.156);
    const arm=V(.4,-.7,.6).normalize();
    return {fingers,meta,Kc,Wc,T:[T0,T1,T2,T3],arm,m};
  },
  sdf(){
    const P=this.prims(), RB=this.RB;
    const cap=(px,py,pz,a,b,ra,rb)=>{ const bx=b.x-a.x,by=b.y-a.y,bz=b.z-a.z, qx=px-a.x,qy=py-a.y,qz=pz-a.z;
      const h=Math.max(0,Math.min(1,(qx*bx+qy*by+qz*bz)/(bx*bx+by*by+bz*bz)));
      return Math.hypot(qx-bx*h,qy-by*h,qz-bz*h)-(ra+(rb-ra)*h); };
    const smin=(a,b,k)=>{ const h=Math.max(k-Math.abs(a-b),0)/k; return Math.min(a,b)-h*h*k*.25; };
    const ell=(px,py,pz,c,rx,ry,rz)=>{ const x=(px-c.x)/rx,y=(py-c.y)/ry,z=(pz-c.z)/rz; return (Math.hypot(x,y,z)-1)*Math.min(rx,ry,rz); };
    const {fingers,meta,Wc,T,arm}=P;
    const pads=meta.map(([W,K],i)=>{ const mid=W.clone().lerp(K,.55); const tow=new THREE.Vector3(-mid.x,-mid.y,0).normalize();
      return [W.clone().addScaledVector(tow,.011),K.clone().addScaledVector(tow,.013),.0125-.001*i]; });
    const A1=Wc.clone().addScaledVector(arm,.5);
    const hyp=new THREE.Vector3(.04,-.036,-.063), then=new THREE.Vector3(.045,-.012,-.108), sty=Wc.clone().add(new THREE.Vector3(.014,.004,.02));
    const bb=new THREE.Box3();
    const grow=(v,r)=>{ bb.expandByPoint(v.clone().addScalar(r)); bb.expandByPoint(v.clone().addScalar(-r)); };
    fingers.forEach(f=>f.J.forEach(j=>grow(j,.013))); meta.forEach(([a,b])=>{ grow(a,.02); grow(b,.02); }); T.forEach(t=>grow(t,.02));
    grow(Wc,.035); grow(A1,.06);
    const f=(x,y,z)=>{
      let d=1e9;
      for(const fg of fingers){ const J=fg.J, r=fg.r;
        let e=cap(x,y,z,J[0],J[1],r[0]*1.0,r[0]*.97);
        e=smin(e,cap(x,y,z,J[1],J[2],r[0]*.97,r[1]),.004);
        e=smin(e,cap(x,y,z,J[2],J[3],r[1]*.96,r[2]),.0035);
        d=Math.min(d,e); }
      let h=1e9;
      for(const [W,K] of meta) h=smin(h,cap(x,y,z,W,K,.0092,.0082),.012);
      for(const [a,b,r] of pads) h=smin(h,cap(x,y,z,a,b,r*1.15,r),.012);
      h=smin(h,ell(x,y,z,hyp,.017,.021,.018),.012);
      h=smin(h,ell(x,y,z,then,.016,.019,.02),.012);
      d=smin(d,h,.0095);
      let t=cap(x,y,z,T[0],T[1],.0165,.0112);
      t=smin(t,cap(x,y,z,T[1],T[2],.0112,.0103),.004);
      t=smin(t,cap(x,y,z,T[2],T[3],.0101,.0088),.0035);
      d=smin(d,t,.011);
      d=smin(d,cap(x,y,z,Wc,A1,.0255,.05),.02);
      d=smin(d,ell(x,y,z,sty,.007,.007,.007),.006);
      /* the torch is solid: the hand stops on it */
      if(z<.01&&z>-.28){ const b=Math.hypot(x,y)-RB-.0003; d=Math.max(d,-b); }
      /* the arm ends off screen */
      const ax=x-A1.x,ay=y-A1.y,az=z-A1.z; d=Math.max(d,ax*arm.x+ay*arm.y+az*arm.z-.0);
      return d; };
    return {f,bb,P};
  },
  /* surface nets over a block-sparse grid */
  mesh(f,bb,h){
    const nx=Math.ceil((bb.max.x-bb.min.x)/h)+1, ny=Math.ceil((bb.max.y-bb.min.y)/h)+1, nz=Math.ceil((bb.max.z-bb.min.z)/h)+1;
    const X=i=>bb.min.x+i*h, Y=j=>bb.min.y+j*h, Z=k=>bb.min.z+k*h;
    const S=nx*ny, val=new Float32Array(nx*ny*nz), B=4, act=[];
    for(let bk=0;bk<nz-1;bk+=B)for(let bj=0;bj<ny-1;bj+=B)for(let bi=0;bi<nx-1;bi+=B){
      const i1=Math.min(nx-1,bi+B), j1=Math.min(ny-1,bj+B), k1=Math.min(nz-1,bk+B);
      const d=f(X((bi+i1)/2),Y((bj+j1)/2),Z((bk+k1)/2));
      if(Math.abs(d)<h*B*1.1+h*2) act.push([bi,bj,bk,i1,j1,k1]);
      else for(let k=bk;k<=k1;k++)for(let j=bj;j<=j1;j++)for(let i=bi;i<=i1;i++) val[k*S+j*nx+i]=d; }
    for(const [bi,bj,bk,i1,j1,k1] of act) for(let k=bk;k<=k1;k++)for(let j=bj;j<=j1;j++)for(let i=bi;i<=i1;i++) val[k*S+j*nx+i]=f(X(i),Y(j),Z(k));
    const cv=new Int32Array((nx-1)*(ny-1)*(nz-1)).fill(-1), CS=(nx-1)*(ny-1), P=[], N=[], I=[];
    const E=[[0,1],[2,3],[4,5],[6,7],[0,2],[1,3],[4,6],[5,7],[0,4],[1,5],[2,6],[3,7]];
    const co=[[0,0,0],[1,0,0],[0,1,0],[1,1,0],[0,0,1],[1,0,1],[0,1,1],[1,1,1]], g=new Float32Array(8);
    for(const [bi,bj,bk,i1,j1,k1] of act) for(let k=bk;k<k1;k++)for(let j=bj;j<j1;j++)for(let i=bi;i<i1;i++){
      let mask=0; for(let c=0;c<8;c++){ g[c]=val[(k+co[c][2])*S+(j+co[c][1])*nx+i+co[c][0]]; if(g[c]<0) mask|=1<<c; }
      if(mask===0||mask===255) continue;
      let sx=0,sy=0,sz=0,n=0;
      for(const [a,b] of E){ if((g[a]<0)===(g[b]<0)) continue; const t=g[a]/(g[a]-g[b]);
        sx+=co[a][0]+(co[b][0]-co[a][0])*t; sy+=co[a][1]+(co[b][1]-co[a][1])*t; sz+=co[a][2]+(co[b][2]-co[a][2])*t; n++; }
      cv[k*CS+j*(nx-1)+i]=P.length/3; P.push(X(i+sx/n),Y(j+sy/n),Z(k+sz/n)); }
    const C=(i,j,k)=>cv[k*CS+j*(nx-1)+i];
    for(const [bi,bj,bk,i1,j1,k1] of act) for(let k=bk;k<k1;k++)for(let j=bj;j<j1;j++)for(let i=bi;i<i1;i++){
      const v0=val[k*S+j*nx+i];
      const quad=(a,b,c,d,flip)=>{ if(a<0||b<0||c<0||d<0) return; if(flip) I.push(a,b,c,a,c,d); else I.push(a,c,b,a,d,c); };
      if(j>0&&k>0){ const v1=val[k*S+j*nx+i+1]; if((v0<0)!==(v1<0)) quad(C(i,j-1,k-1),C(i,j,k-1),C(i,j,k),C(i,j-1,k),v0<0); }
      if(i>0&&k>0){ const v1=val[k*S+(j+1)*nx+i]; if((v0<0)!==(v1<0)) quad(C(i-1,j,k-1),C(i-1,j,k),C(i,j,k),C(i,j,k-1),v0<0); }
      if(i>0&&j>0){ const v1=val[(k+1)*S+j*nx+i]; if((v0<0)!==(v1<0)) quad(C(i-1,j-1,k),C(i,j-1,k),C(i,j,k),C(i-1,j,k),v0<0); }
    }
    const e=h*.35;
    for(let v=0;v<P.length;v+=3){ const x=P[v],y=P[v+1],z=P[v+2];
      /* pull each vertex onto the true surface, then take the gradient */
      let px=x,py=y,pz=z;
      for(let it=0;it<2;it++){ const d=f(px,py,pz), gx=f(px+e,py,pz)-f(px-e,py,pz), gy=f(px,py+e,pz)-f(px,py-e,pz), gz=f(px,py,pz+e)-f(px,py,pz-e), L=Math.hypot(gx,gy,gz)||1;
        px-=gx/L*d; py-=gy/L*d; pz-=gz/L*d; if(it===1){ N.push(gx/L,gy/L,gz/L); } }
      P[v]=px; P[v+1]=py; P[v+2]=pz; }
    const geo=new THREE.BufferGeometry();
    geo.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); geo.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
    geo.setIndex(P.length/3>65535?new THREE.Uint32BufferAttribute(I,1):new THREE.Uint16BufferAttribute(I,1));
    geo.computeBoundingSphere();
    return geo;
  },
  project(f,p,dir){ const q=p.clone(); for(let i=0;i<6;i++){ const d=f(q.x,q.y,q.z); q.addScaledVector(dir,-d); } return q; },
  grad(f,p){ const e=.0004; return new THREE.Vector3(f(p.x+e,p.y,p.z)-f(p.x-e,p.y,p.z),f(p.x,p.y+e,p.z)-f(p.x,p.y-e,p.z),f(p.x,p.y,p.z+e)-f(p.x,p.y,p.z-e)).normalize(); },
  /* dorsal veins: from the gaps between the knuckles, converging on the wrist
     and running up the forearm, each laid on the skin by projection */
  veins(f,P){
    const segs=[], V=THREE.Vector3;
    const lay=(pts,r)=>{ let prev=null; for(const p of pts){ const g=this.grad(f,p); const q=this.project(f,p.clone().addScaledVector(g,.01),g);
      if(prev) segs.push([prev,q,r]); prev=q; } };
    const {fingers,Wc,arm,m}=P, K=fingers.map(fg=>fg.J[0]);
    const across=new V().crossVectors(arm,new V(0,0,1)).normalize();
    for(let i=0;i<3;i++){ const a=K[i].clone().lerp(K[i+1],.5), pts=[];
      for(let t=0;t<=1.0001;t+=.2){ const q=a.clone().lerp(Wc,t*.85); q.addScaledVector(across,Math.sin(t*5+i*2)*.004+(i-1)*.004*t); pts.push(q); }
      lay(pts,.0021+.0004*i); }
    for(const s of [-1,1]){ const pts=[]; for(let t=0;t<=1.0001;t+=.08){ const q=Wc.clone().addScaledVector(arm,.01+t*.36).addScaledVector(across,s*(.012+t*.01)+Math.sin(t*9+s)*.004); pts.push(q); } lay(pts,s>0?.003:.0026); }
    { const pts=[]; for(let t=0;t<=1.0001;t+=.25){ pts.push(K[1].clone().lerp(Wc,.35).lerp(Wc.clone().addScaledVector(arm,.06).addScaledVector(across,.012),t)); } lay(pts,.0015); }
    return segs;
  },
  hairs(geo,P,count){
    const pos=geo.attributes.position, nor=geo.attributes.normal, idx=geo.index.array, V=THREE.Vector3;
    const {Wc,arm,Kc}=P, R=mulberry(2718), out=[], I=[];
    const tris=[]; let tot=0;
    const a=new V(),b=new V(),c=new V(),n=new V();
    for(let t=0;t<idx.length;t+=3){ a.fromBufferAttribute(pos,idx[t]); b.fromBufferAttribute(pos,idx[t+1]); c.fromBufferAttribute(pos,idx[t+2]);
      const cen=a.clone().add(b).add(c).multiplyScalar(1/3); n.fromBufferAttribute(nor,idx[t]);
      const along=cen.clone().sub(Wc).dot(arm);
      let w=0;
      if(along>-.005&&along<.45) w=.35+.65*Math.max(0,n.y*.6+n.x*.5+.3);          /* forearm */
      else if(cen.clone().sub(Kc).dot(arm)>.015&&n.x+n.y>.4) w=.12;              /* back of the hand */
      if(Math.hypot(cen.x,cen.y)<this.RB+.012&&cen.z<0) w=0;
      if(w<=0) continue;
      const ar=b.clone().sub(a).cross(c.clone().sub(a)).length()/2*w; tot+=ar; tris.push([t,tot]); }
    if(!tris.length) return null;
    const P3=[];
    for(let h=0;h<count;h++){ const r=R()*tot; let lo=0,hi=tris.length-1; while(lo<hi){ const mid=(lo+hi)>>1; if(tris[mid][1]<r) lo=mid+1; else hi=mid; }
      const t=tris[lo][0]; let u=R(),v=R(); if(u+v>1){ u=1-u; v=1-v; }
      a.fromBufferAttribute(pos,idx[t]); b.fromBufferAttribute(pos,idx[t+1]); c.fromBufferAttribute(pos,idx[t+2]);
      const p=a.clone().multiplyScalar(1-u-v).addScaledVector(b,u).addScaledVector(c,v);
      n.fromBufferAttribute(nor,idx[t]).multiplyScalar(1-u-v).add(new V().fromBufferAttribute(nor,idx[t+1]).multiplyScalar(u)).add(new V().fromBufferAttribute(nor,idx[t+2]).multiplyScalar(v)).normalize();
      /* hair lies towards the hand, lifted a little off the skin */
      const d=arm.clone().multiplyScalar(-1).addScaledVector(n,-n.dot(arm.clone().multiplyScalar(-1))).normalize();
      d.applyAxisAngle(n,(R()-.5)*.9).addScaledVector(n,.25+R()*.25).normalize();
      const L=.005+R()*.007, side=new V().crossVectors(d,n).normalize(), wdt=.0001+R()*.00005;
      const p1=p.clone().addScaledVector(d,L*.5).addScaledVector(n,.00025), p2=p.clone().addScaledVector(d,L).addScaledVector(n,-.0002).addScaledVector(side,(R()-.5)*L*.3);
      const base=P3.length/3, sh=R()*.3;
      for(const [q,wd] of [[p.clone().addScaledVector(n,-.0002),wdt],[p1,wdt*.8],[p2,wdt*.15]]){
        P3.push(q.x-side.x*wd,q.y-side.y*wd,q.z-side.z*wd, q.x+side.x*wd,q.y+side.y*wd,q.z+side.z*wd); }
      I.push(base,base+1,base+3,base,base+3,base+2,base+2,base+3,base+5,base+2,base+5,base+4);
      out.push(sh); }
    const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P3,3)); g.setIndex(I); g.computeVertexNormals();
    return g;
  },
  skinMat(veins,P){
    const m=new THREE.MeshPhysicalMaterial({color:0x7a5846,roughness:.58,metalness:0,sheen:.22,sheenRoughness:.6,sheenColor:new THREE.Color(0x7a3426),
      clearcoat:.06,clearcoatRoughness:.45});
    const n=veins.length, arr=[]; for(const [a,b,r] of veins){ arr.push(new THREE.Vector4(a.x,a.y,a.z,r),new THREE.Vector4(b.x,b.y,b.z,r)); }
    const K=P.fingers.map(f=>f.J[0]).concat(P.fingers.map(f=>f.J[1]),[P.T[1],P.T[2]]);
    m.onBeforeCompile=sh=>{
      sh.uniforms.uV={value:arr}; sh.uniforms.uK={value:K};
      sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 vHP;').replace('#include <begin_vertex>','#include <begin_vertex>\nvHP=position;');
      sh.fragmentShader=sh.fragmentShader.replace('#include <common>',`#include <common>
        varying vec3 vHP; uniform vec4 uV[${n*2}]; uniform vec3 uK[${K.length}];
        float hH(vec3 p){ return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453); }
        float hN(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
          return mix(mix(mix(hH(i),hH(i+vec3(1,0,0)),f.x),mix(hH(i+vec3(0,1,0)),hH(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(hH(i+vec3(0,0,1)),hH(i+vec3(1,0,1)),f.x),mix(hH(i+vec3(0,1,1)),hH(i+vec3(1,1,1)),f.x),f.y),f.z); }
        float veinH(vec3 p){ float v=0.;
          for(int i=0;i<${n};i++){ vec3 a=uV[i*2].xyz,b=uV[i*2+1].xyz; float r=uV[i*2].w; vec3 pa=p-a,ba=b-a;
            float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.); float d=length(pa-ba*h); float t=clamp(1.-d/r,0.,1.); v=max(v,t*t*(3.-2.*t)); }
          return v; }`)
        .replace('#include <color_fragment>',`#include <color_fragment>
          float sV=veinH(vHP);
          float sN=hN(vHP*900.)*.5+hN(vHP*260.)*.35+hN(vHP*60.)*.15;
          float kn=0.; for(int i=0;i<${K.length};i++) kn=max(kn,1.-smoothstep(.004,.014,length(vHP-uK[i])));
          diffuseColor.rgb*=.86+.24*hN(vHP*40.)*(.7+.3*hN(vHP*140.));
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(1.12,.82,.78),kn*.55);
          diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*vec3(.55,.66,.92),sV*.7);
          diffuseColor.rgb*=.94+.06*sN;`)
        .replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
          roughnessFactor=clamp(roughnessFactor+(sN-.5)*.25-kn*.08,.3,.8);`)
        .replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
          { float hgt=sV*.0024+(hN(vHP*900.)-.5)*.00005+(hN(vHP*300.)-.5)*.00008;
            vec3 dpx=dFdx(-vViewPosition), dpy=dFdy(-vViewPosition); float hx=dFdx(hgt), hy=dFdy(hgt);
            vec3 r1=cross(dpy,normal), r2=cross(normal,dpx); float det=dot(dpx,r1);
            vec3 grad=sign(det)*(hx*r1+hy*r2); normal=normalize(abs(det)*normal-grad); }`)
        .replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
          reflectedLight.indirectDiffuse+=diffuseColor.rgb*vec3(.09,.028,.018);`);
    };
    m.customProgramCacheKey=()=>'riSkin'+n;
    return m;
  },
  nails(f,P,g){
    const sp=RIspec(RK.plBeige,{c:0xd9b4a0,r:.28,d:0,w:0});
    const put=(a,b,r,len,wd)=>{ const ax=b.clone().sub(a).normalize(); const mid=a.clone().lerp(b,.55);
      const out=new THREE.Vector3(mid.x,mid.y,0).normalize(); out.addScaledVector(ax,-out.dot(ax)).normalize();
      const c=this.project(f,mid.clone().addScaledVector(out,.02),out).addScaledVector(out,.0004);
      const m=new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(ax,out).normalize(),ax,out); m.setPosition(c);
      g.add(RIG.cloth(wd,len,6,6,(x,y)=>[0,0,-Math.pow(x/(wd/2),2)*.0012],false),m.multiply(new THREE.Matrix4().makeRotationX(0)),sp);
      g.add(RIG.box(wd*.8,.0012,.0004),new THREE.Matrix4().copy(m).multiply(MX(0,len/2,0)),RIspec(RK.paper,{c:0xeee3d6,r:.4}));
    };
    const T=P.T; put(T[2],T[3],.0088,.012,.012);
    for(const fg of P.fingers){ const J=fg.J; put(J[2],J[3],fg.r[2],.009,fg.r[2]*1.25); }
  },
  torch(){
    /* aluminium body with diamond knurling, a rubber switch boot, a flared
       head and a bezel; built round +Y, then laid along -Z */
    const g=new GB(), RB=this.RB;
    const prof=[[0,0],[.0165,0],[.0192,.0015],[.0196,.004],[.0196,.03],[.0189,.032],[RB,.034],[RB,.183],[.0195,.186],[.0226,.197],[.0262,.21],
      [.0271,.214],[.0271,.252],[.0288,.254],[.0292,.258],[.0292,.264],[.0262,.266],[.024,.2655]];
    const rows=[]; for(let i=0;i<prof.length-1;i++){ const a=prof[i],b=prof[i+1]; const n=Math.max(1,Math.round(Math.hypot(b[0]-a[0],b[1]-a[1])/.0012));
      for(let k=0;k<n;k++) rows.push([a[0]+(b[0]-a[0])*k/n,a[1]+(b[1]-a[1])*k/n]); } rows.push(prof[prof.length-1]);
    const knurl=y=>(y>.007&&y<.027)||(y>.04&&y<.062)||(y>.158&&y<.18);
    const lat=RIG.lathe(rows.map(r=>[r[0],r[1]]),RIQ.touch?48:96), p=lat.attributes.position;
    for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i),z=p.getZ(i); if(!knurl(y)) continue; const r=Math.hypot(x,z); if(r<.017) continue;
      const th=Math.atan2(z,x), k=Math.abs(Math.sin(th*30+y*900))*Math.abs(Math.sin(th*30-y*900)); const nr=r+.00055*Math.min(1,k*2.2)-.0003; p.setXYZ(i,x/r*nr,y,z/r*nr); }
    lat.computeVertexNormals();
    const body=RIspec(RK.steel,{c:0x2c2f33,r:.42,m:.85,d:0,w:0});
    const toZ=MX(0,0,0,-Math.PI/2,0,0);
    g.add(lat,toZ,body,(x,y,z,c)=>{ const yy=-z; if(knurl(yy)) c.multiplyScalar(.75); if(yy>.252) c.setHex(0xa9aeb3); });
    /* rubber boot for the switch, on top */
    g.add(RIG.sphere(.0085,18,10),new THREE.Matrix4().multiplyMatrices(toZ,MX(0,.148,RB-.0005,0,0,0,1,1.5,.6)).multiply(MX()),RIspec(RK.rubber,{c:0x2a0d0c,r:.62}));
    g.add(RIG.torus(.0086,.0012,6,20),new THREE.Matrix4().multiplyMatrices(toZ,MX(0,.148,RB,0,0,0,1,1.5,1)),RIspec(RK.rubber,{c:0x151515}));
    /* reflector glimpsed behind the glass, and a lanyard ring at the tail */
    g.add(RIG.lathe([[.0235,.2655],[.012,.252],[.004,.246]],32),toZ,RIspec(RK.chrome,{c:0xe8ecef,r:.08}));
    g.add(RIG.torus(.0055,.0011,6,16),MX(.0,-.019,.004,0,Math.PI/2,0),RIspec(RK.steel,{c:0x9aa0a4}));
    return g.geometry();
  }
};
RI.buildView=function(T){
  let t0=performance.now();
  const view=new THREE.Group();
  /* torch */
  const tm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,metalness:1});
  tm.onBeforeCompile=sh=>{ sh.vertexShader=sh.vertexShader.replace('#include <common>','#include <common>\nattribute vec4 pbr; varying vec4 vPbr;').replace('#include <begin_vertex>','#include <begin_vertex>\nvPbr=pbr;');
    sh.fragmentShader=sh.fragmentShader.replace('#include <common>','#include <common>\nvarying vec4 vPbr;').replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=vPbr.x;')
      .replace('#include <metalnessmap_fragment>','#include <metalnessmap_fragment>\nmetalnessFactor=vPbr.y;'); };
  tm.customProgramCacheKey=()=>'riTorchVM';
  const torch=new THREE.Mesh(RIHAND.torch(),tm);
  view.add(torch);
  T.lens=new THREE.Mesh(new THREE.CircleGeometry(.0238,32),new THREE.MeshBasicMaterial({color:0xffedd0,toneMapped:false}));
  T.lens.position.set(0,0,-.2662); T.lens.rotation.y=Math.PI; view.add(T.lens);
  /* hand */
  try{
    const S=RIHAND.sdf(), h=RIQ.touch?(RIQ.low?.0034:.0026):.0019;
    const geo=RIHAND.mesh(S.f,S.bb,h);
    const skin=RIHAND.skinMat(RIHAND.veins(S.f,S.P),S.P);
    const hand=new THREE.Mesh(geo,skin); view.add(hand); T.hand=hand;
    const hg=RIHAND.hairs(geo,S.P,RIQ.touch?2200:7000);
    if(hg){ const hm=new THREE.Mesh(hg,new THREE.MeshStandardMaterial({color:0x1c130d,roughness:.55,metalness:0,side:THREE.DoubleSide})); view.add(hm); }
    const ng=new GB(); RIHAND.nails(S.f,S.P,ng);
    const nm=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.3,metalness:0}); view.add(new THREE.Mesh(ng.geometry(),nm));
    console.log('RI hand',geo.attributes.position.count,'verts',(performance.now()-t0).toFixed(0),'ms');
  }catch(e){ console.warn('RI hand failed',e); }
  view.position.set(.26,-.235,-.3);
  if(T.vm){ T.vm.position.set(.1,.04,-.1); T.vm.distance=1.4; T.vm.intensity=1.5; T.vm.color.setHex(0xfff1e4); }
  view.rotation.set(.05,.30,.02);
  view.scale.setScalar(1);
  view.traverse(o=>{ o.castShadow=false; o.receiveShadow=false; o.renderOrder=2; o.frustumCulled=false; });
  camera.add(view);
  /* the beam itself: a faint cone of lit dust from the lens outwards */
  if(T.spot){
    const L=7.5, R=Math.tan(Math.min(T.spot.angle||.72,.9)*.62)*L;
    const cg=new THREE.CylinderGeometry(.02,R,L,40,24,true); cg.translate(0,-L/2,0); cg.rotateX(Math.PI/2);
    const bm=new THREE.ShaderMaterial({uniforms:{uI:{value:0},uT:{value:0}},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,side:THREE.DoubleSide,
      vertexShader:`varying vec3 vL; varying vec3 vN; varying vec3 vV; void main(){ vL=position; vec4 mv=modelViewMatrix*vec4(position,1.); vV=-mv.xyz; vN=normalMatrix*normal; gl_Position=projectionMatrix*mv; }`,
      fragmentShader:`uniform float uI; uniform float uT; varying vec3 vL; varying vec3 vN; varying vec3 vV;
        float h(vec3 p){ return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
        float n3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f); return mix(mix(mix(h(i),h(i+vec3(1,0,0)),f.x),mix(h(i+vec3(0,1,0)),h(i+vec3(1,1,0)),f.x),f.y),mix(mix(h(i+vec3(0,0,1)),h(i+vec3(1,0,1)),f.x),mix(h(i+vec3(0,1,1)),h(i+vec3(1,1,1)),f.x),f.y),f.z); }
        void main(){ float a=clamp(-vL.z/${L.toFixed(2)},0.,1.);
          float edge=abs(dot(normalize(vN),normalize(vV))); edge=pow(edge,1.6);
          float fall=pow(1.-a,2.2)*smoothstep(0.,.06,a);
          float d=.65+.35*n3(vL*2.2+vec3(0.,uT*.12,uT*.05))+.2*n3(vL*7.-vec3(uT*.2));
          float k=uI*edge*fall*d*.055; gl_FragColor=vec4(vec3(1.,.96,.88)*k,1.); }`});
    const beam=new THREE.Mesh(cg,bm); beam.frustumCulled=false; beam.renderOrder=3;
    beam.position.copy(T.spot.position); beam.lookAt(T.spot.target.position); /* +Z of the cone points at the target */
    beam.rotateY(Math.PI);
    beam.onBeforeRender=()=>{ bm.uniforms.uT.value=performance.now()/1000; bm.uniforms.uI.value=T.on?Math.min(1.4,(T.spot.intensity||0)/Math.max(1e-3,T.power||1)):0; };
    camera.add(beam); T.beam=beam;
  }
  T.view=view; T.body=view; T.viewBase=view.position.clone(); T.torchVM=torch;
};
