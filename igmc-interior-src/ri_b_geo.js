
/* ═════════════ geometry kit for the modelled props ═════════════ */
const _riE=new THREE.Euler(), _riQ=new THREE.Quaternion(), _riV=new THREE.Vector3(), _riS=new THREE.Vector3();
function MX(x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){
  _riE.set(rx,ry,rz,'YXZ'); _riQ.setFromEuler(_riE);
  return new THREE.Matrix4().compose(_riV.set(x,y,z),_riQ,_riS.set(sx,sy,sz));
}
/* material spec for a part: colour, roughness, metalness, detail id, wear */
const SP=(c,r,m,d,w)=>({c,r,m,d:d||0,w:w||0});
const RK={
  steel:     SP(0xa9aeb2,.30,.92,2,.12),
  steelDull: SP(0x8d9296,.42,.85,2,.35),
  chrome:    SP(0xdadee1,.12,1.0,0,.05),
  alu:       SP(0xb9bdbf,.34,.9,2,.1),
  paintCream:SP(0xd4cdba,.48,0,1,.38),
  paintWhite:SP(0xe2e0da,.45,0,1,.28),
  paintBlue: SP(0x93aebf,.48,0,1,.34),
  paintGreen:SP(0x6a8374,.52,0,1,.45),
  paintGrey: SP(0x8b9396,.5,0,1,.35),
  paintDark: SP(0x2f3538,.5,0,1,.4),
  paintRed:  SP(0xa3120f,.38,0,1,.2),
  rust:      SP(0x6a4a36,.8,.35,6,.65),
  rubber:    SP(0x141516,.86,0,5,.12),
  plBlack:   SP(0x1a1b1d,.42,0,5,.08),
  plGrey:    SP(0x6d7274,.45,0,5,.1),
  plBeige:   SP(0xcfc6ad,.40,0,5,.18),
  plWhite:   SP(0xdedbd2,.38,0,5,.12),
  vinylBlue: SP(0x2c5470,.46,0,10,.22),
  vinylGreen:SP(0x2b574a,.48,0,10,.22),
  vinylBlack:SP(0x1d1e1f,.5,0,10,.2),
  sheet:     SP(0xd8d5cc,.93,0,3,.18),
  sheetDirty:SP(0xb7ae98,.93,0,3,.5),
  fabBlue:   SP(0x35557a,.9,0,3,.2),
  wood:      SP(0x6a4a2f,.52,0,4,.2),
  woodDark:  SP(0x3e2a1c,.5,0,4,.25),
  lamLight:  SP(0xa38766,.42,0,4,.18),
  glass:     SP(0x0c1012,.06,0,8,0),
  screen:    SP(0x050807,.08,0,8,0),
  brass:     SP(0xb08638,.28,1.0,0,.25),
  paper:     SP(0xd9d0b4,.93,0,9,.1),
  manila:    SP(0xc7b98f,.9,0,9,.25),
  kota:      SP(0x55635c,.35,0,11,.2),
  terr:      SP(0x9a9890,.32,0,11,.2),
  conc:      SP(0x8a8883,.95,0,14,.4),
  ceramic:   SP(0xe8e6df,.1,0,13,.05),
  ledG:      SP(0x21ff5a,.4,0,12,1.6),
  ledR:      SP(0xff2a1a,.4,0,12,1.6),
  ledA:      SP(0xffa21a,.4,0,12,1.3)
};
const RIspec=(base,o)=>Object.assign({},base,o);

class GB{
  constructor(){ this.P=[]; this.N=[]; this.C=[]; this.R=[]; this.I=[]; this.v=0; }
  /* append a three.js geometry through matrix m with part spec s;
     cf(x,y,z,color) may tint individual vertices (stains, stripes, rust) */
  add(geo,m,s,cf){
    const g=geo;
    if(!g.attributes.normal) g.computeVertexNormals();
    const pos=g.attributes.position, nor=g.attributes.normal, n=pos.count;
    const nm=m?new THREE.Matrix3().getNormalMatrix(m):null;
    const col=new THREE.Color(s.c), tmp=new THREE.Color();
    const r=s.r===undefined?.7:s.r, mm=s.m||0, d=s.d||0, w=s.w||0;
    const v=new THREE.Vector3(), nn=new THREE.Vector3();
    const base=this.v;
    for(let i=0;i<n;i++){
      v.fromBufferAttribute(pos,i); if(m) v.applyMatrix4(m);
      this.P.push(v.x,v.y,v.z);
      nn.fromBufferAttribute(nor,i); if(nm) nn.applyMatrix3(nm); nn.normalize();
      this.N.push(nn.x,nn.y,nn.z);
      if(cf){ tmp.copy(col); cf(v.x,v.y,v.z,tmp,nn); this.C.push(tmp.r,tmp.g,tmp.b); }
      else this.C.push(col.r,col.g,col.b);
      this.R.push(r,mm,d,w);
    }
    const flip=m&&m.determinant()<0;
    if(g.index){ const ix=g.index.array;
      for(let i=0;i<ix.length;i+=3){ if(flip) this.I.push(base+ix[i],base+ix[i+2],base+ix[i+1]);
        else this.I.push(base+ix[i],base+ix[i+1],base+ix[i+2]); } }
    else for(let i=0;i<n;i+=3){ if(flip) this.I.push(base+i,base+i+2,base+i+1); else this.I.push(base+i,base+i+1,base+i+2); }
    this.v+=n; g.dispose();
    return this;
  }
  /* append another GB (already in its own space) through m */
  merge(o,m){
    const g=o.geometry(); const s={c:0xffffff};
    const pos=g.attributes.position, nor=g.attributes.normal, col=g.attributes.color, pb=g.attributes.pbr;
    const nm=m?new THREE.Matrix3().getNormalMatrix(m):null;
    const v=new THREE.Vector3(), nn=new THREE.Vector3(), base=this.v;
    for(let i=0;i<pos.count;i++){
      v.fromBufferAttribute(pos,i); if(m) v.applyMatrix4(m); this.P.push(v.x,v.y,v.z);
      nn.fromBufferAttribute(nor,i); if(nm) nn.applyMatrix3(nm); nn.normalize(); this.N.push(nn.x,nn.y,nn.z);
      this.C.push(col.getX(i),col.getY(i),col.getZ(i));
      this.R.push(pb.getX(i),pb.getY(i),pb.getZ(i),pb.getW(i));
    }
    const ix=g.index.array, flip=m&&m.determinant()<0;
    for(let i=0;i<ix.length;i+=3){ if(flip) this.I.push(base+ix[i],base+ix[i+2],base+ix[i+1]); else this.I.push(base+ix[i],base+ix[i+1],base+ix[i+2]); }
    this.v+=pos.count; g.dispose();
    return this;
  }
  empty(){ return this.v===0; }
  geometry(){
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(this.P,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(this.N,3));
    g.setAttribute('color',new THREE.Float32BufferAttribute(this.C,3));
    g.setAttribute('pbr',new THREE.Float32BufferAttribute(this.R,4));
    g.setIndex(this.v>65535?new THREE.Uint32BufferAttribute(this.I,1):new THREE.Uint16BufferAttribute(this.I,1));
    g.computeBoundingBox(); g.computeBoundingSphere();
    return g;
  }
}

const RIG={
  /* a box with truly rounded edges and corners, seg rings per round */
  rbox(w,h,d,r=.01,seg=3){
    seg=RIseg(seg,1);
    const hx=w/2,hy=h/2,hz=d/2;
    r=Math.max(1e-4,Math.min(r,hx-1e-5,hy-1e-5,hz-1e-5));
    const coords=(half)=>{ const a=[]; for(let k=0;k<=seg;k++) a.push(-half+r*k/seg);
      for(let k=seg;k>=0;k--) a.push(half-r*k/seg);
      return a.filter((x,i)=>i===0||Math.abs(x-a[i-1])>1e-7); };
    const cx=coords(hx),cy=coords(hy),cz=coords(hz);
    const P=[],N=[],I=[];
    const faces=[
      {n:[1,0,0],u:[0,0,-1],v:[0,1,0],hn:hx,cu:cz,cv:cy},{n:[-1,0,0],u:[0,0,1],v:[0,1,0],hn:hx,cu:cz,cv:cy},
      {n:[0,1,0],u:[1,0,0],v:[0,0,-1],hn:hy,cu:cx,cv:cz},{n:[0,-1,0],u:[1,0,0],v:[0,0,1],hn:hy,cu:cx,cv:cz},
      {n:[0,0,1],u:[1,0,0],v:[0,1,0],hn:hz,cu:cx,cv:cy},{n:[0,0,-1],u:[-1,0,0],v:[0,1,0],hn:hz,cu:cx,cv:cy}];
    const lim=[hx-r,hy-r,hz-r];
    for(const f of faces){
      const b=P.length/3, nu=f.cu.length, nv=f.cv.length;
      for(let j=0;j<nv;j++)for(let i=0;i<nu;i++){
        const p=[0,1,2].map(k=>f.n[k]*f.hn+f.u[k]*f.cu[i]+f.v[k]*f.cv[j]);
        const inn=p.map((x,k)=>Math.max(-lim[k],Math.min(lim[k],x)));
        let dx=p[0]-inn[0],dy=p[1]-inn[1],dz=p[2]-inn[2]; const L=Math.hypot(dx,dy,dz)||1;
        dx/=L;dy/=L;dz/=L;
        P.push(inn[0]+dx*r,inn[1]+dy*r,inn[2]+dz*r); N.push(dx,dy,dz);
      }
      for(let j=0;j<nv-1;j++)for(let i=0;i<nu-1;i++){
        const a=b+j*nu+i,bb=a+1,c=a+nu+1,d=a+nu;
        I.push(a,bb,c,a,c,d);
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
    g.setIndex(I); return g;
  },
  box(w,h,d){ return new THREE.BoxGeometry(w,h,d); },
  cyl(rt,rb,h,seg=16,open=false,hs=1){ return new THREE.CylinderGeometry(rt,rb,h,RIseg(seg,5),hs,open); },
  /* a cylinder along an arbitrary segment a->b */
  rod(a,b,r,seg=10,open=false){
    const A=new THREE.Vector3(...a),Bv=new THREE.Vector3(...b), d=Bv.clone().sub(A), L=d.length();
    const g=new THREE.CylinderGeometry(r,r,L,RIseg(seg,4),1,open);
    const q=new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),d.normalize());
    g.applyMatrix4(new THREE.Matrix4().compose(A.add(Bv).multiplyScalar(.5),q,new THREE.Vector3(1,1,1)));
    return g;
  },
  lathe(pts,seg=24,phi0=0,phiL=Math.PI*2){
    return new THREE.LatheGeometry(pts.map(p=>new THREE.Vector2(Math.max(0,p[0]),p[1])),RIseg(seg,6),phi0,phiL);
  },
  torus(R,r,rs=10,ts=32,arc=Math.PI*2){ return new THREE.TorusGeometry(R,r,RIseg(rs,4),RIseg(ts,6),arc); },
  sphere(r,ws=16,hs=12){ return new THREE.SphereGeometry(r,RIseg(ws,6),RIseg(hs,4)); },
  disk(r,seg=24){ return new THREE.CircleGeometry(r,RIseg(seg,6)); },
  plane(w,h,sw=1,sh=1){ return new THREE.PlaneGeometry(w,h,sw,sh); },
  /* dense polyline with rounded corners (quadratic arcs) */
  rpath(pts,r=.03,seg=6){
    const V=pts.map(p=>new THREE.Vector3(...p)), out=[V[0].clone()];
    seg=RIseg(seg,2);
    for(let i=1;i<V.length-1;i++){
      const a=V[i-1],p=V[i],b=V[i+1];
      const d1=p.clone().sub(a), d2=b.clone().sub(p);
      const l1=d1.length(), l2=d2.length(); d1.normalize(); d2.normalize();
      const rr=Math.min(r,l1*.49,l2*.49);
      const s=p.clone().addScaledVector(d1,-rr), e=p.clone().addScaledVector(d2,rr);
      for(let k=0;k<=seg;k++){ const t=k/seg, u=1-t;
        out.push(new THREE.Vector3(u*u*s.x+2*u*t*p.x+t*t*e.x,u*u*s.y+2*u*t*p.y+t*t*e.y,u*u*s.z+2*u*t*p.z+t*t*e.z)); }
    }
    out.push(V[V.length-1].clone());
    return out;
  },
  /* smooth curve through points */
  curve(pts,n=32){
    const c=new THREE.CatmullRomCurve3(pts.map(p=>new THREE.Vector3(...p)),false,'centripetal');
    return c.getPoints(RIseg(n,4));
  },
  /* sweep a circle along a polyline (parallel transport frames) */
  sweep(pts,radius,rseg=10,cap=true,closed=false){
    rseg=RIseg(rseg,4);
    const n=pts.length, P=[],N=[],I=[];
    const T=[]; for(let i=0;i<n;i++){
      let t;
      if(closed) t=pts[(i+1)%n].clone().sub(pts[(i-1+n)%n]);
      else if(i===0) t=pts[1].clone().sub(pts[0]); else if(i===n-1) t=pts[n-1].clone().sub(pts[n-2]);
      else t=pts[i+1].clone().sub(pts[i-1]);
      T.push(t.normalize()); }
    let nrm=new THREE.Vector3(0,1,0); if(Math.abs(T[0].y)>.9) nrm.set(1,0,0);
    nrm.sub(T[0].clone().multiplyScalar(nrm.dot(T[0]))).normalize();
    const R=typeof radius==='function'?radius:()=>radius;
    const rings=closed?n:n;
    for(let i=0;i<rings;i++){
      if(i>0){ nrm.sub(T[i].clone().multiplyScalar(nrm.dot(T[i]))); if(nrm.lengthSq()<1e-10) nrm.set(0,1,0).cross(T[i]); nrm.normalize(); }
      const b=new THREE.Vector3().crossVectors(T[i],nrm);
      const rr=R(i/(n-1));
      for(let k=0;k<rseg;k++){ const a=k/rseg*Math.PI*2, c=Math.cos(a), s=Math.sin(a);
        const dx=nrm.x*c+b.x*s, dy=nrm.y*c+b.y*s, dz=nrm.z*c+b.z*s;
        P.push(pts[i].x+dx*rr,pts[i].y+dy*rr,pts[i].z+dz*rr); N.push(dx,dy,dz); }
    }
    const segs=closed?rings:rings-1;
    for(let i=0;i<segs;i++){ const i2=(i+1)%rings;
      for(let k=0;k<rseg;k++){ const k2=(k+1)%rseg;
        const A=i*rseg+k, B=i*rseg+k2, C=i2*rseg+k, D=i2*rseg+k2;
        I.push(A,B,C, B,D,C); } }
    if(cap&&!closed){
      for(const [ri,sg] of [[0,-1],[rings-1,1]]){
        const c=P.length/3; const t=T[ri];
        P.push(pts[ri].x,pts[ri].y,pts[ri].z); N.push(t.x*sg,t.y*sg,t.z*sg);
        const b0=P.length/3;
        for(let k=0;k<rseg;k++){ const j=(ri*rseg+k)*3; P.push(P[j],P[j+1],P[j+2]); N.push(t.x*sg,t.y*sg,t.z*sg); }
        for(let k=0;k<rseg;k++){ const k2=(k+1)%rseg; if(sg>0) I.push(c,b0+k,b0+k2); else I.push(c,b0+k2,b0+k); }
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));
    g.setAttribute('normal',new THREE.Float32BufferAttribute(N,3));
    g.setIndex(I); return g;
  },
  tube(pts,r,rs=10,corner=.03,cseg=6,cap=true){ return this.sweep(this.rpath(pts,corner,cseg),r,rs,cap); },
  /* a displaced sheet: fn(x,y,u,v) -> [dx,dy,dz]; both sides when two */
  cloth(w,h,sw,sh,fn,two=true){
    const g=new THREE.PlaneGeometry(w,h,RIseg(sw,2),RIseg(sh,2));
    const p=g.attributes.position;
    for(let i=0;i<p.count;i++){ const x=p.getX(i),y=p.getY(i);
      const d=fn(x,y,x/w+.5,y/h+.5); p.setXYZ(i,x+d[0],y+d[1],d[2]); }
    g.computeVertexNormals();
    return two?this.twoSided(g):g;
  },
  twoSided(g){
    const ng=g.index?g.toNonIndexed():g;
    const p=ng.attributes.position.array, n=ng.attributes.normal.array;
    const P=new Float32Array(p.length*2), N=new Float32Array(n.length*2);
    P.set(p); N.set(n);
    for(let t=0;t<p.length;t+=9){ /* reversed winding for the back face */
      for(const [dst,src] of [[0,0],[3,6],[6,3]]){
        P[p.length+t+dst]=p[t+src]; P[p.length+t+dst+1]=p[t+src+1]; P[p.length+t+dst+2]=p[t+src+2];
        N[n.length+t+dst]=-n[t+src]; N[n.length+t+dst+1]=-n[t+src+1]; N[n.length+t+dst+2]=-n[t+src+2]; } }
    const out=new THREE.BufferGeometry();
    out.setAttribute('position',new THREE.BufferAttribute(P,3));
    out.setAttribute('normal',new THREE.BufferAttribute(N,3));
    if(ng!==g) ng.dispose(); g.dispose();
    return out;
  },
  /* a rounded rectangle slab extruded along z, with a bevel */
  rrect(w,h,d,r=.02,bev=.004){
    const s=new THREE.Shape(), x=-w/2,y=-h/2; r=Math.min(r,w/2-1e-4,h/2-1e-4);
    s.moveTo(x+r,y); s.lineTo(x+w-r,y); s.quadraticCurveTo(x+w,y,x+w,y+r); s.lineTo(x+w,y+h-r);
    s.quadraticCurveTo(x+w,y+h,x+w-r,y+h); s.lineTo(x+r,y+h); s.quadraticCurveTo(x,y+h,x,y+h-r);
    s.lineTo(x,y+r); s.quadraticCurveTo(x,y,x+r,y);
    const g=new THREE.ExtrudeGeometry(s,{depth:Math.max(1e-4,d-2*bev),bevelEnabled:bev>0,bevelThickness:bev,bevelSize:bev,
      bevelSegments:RIseg(2,1),curveSegments:RIseg(6,2)});
    g.translate(0,0,-(d-2*bev)/2); g.computeVertexNormals();
    return g;
  }
};

/* fit a geometry into the exact bounding box of the prop it replaces, so
   every collision rect, placement height and footprint test stays as it was */
function riFit(g,min,max,mode){
  g.computeBoundingBox(); const b=g.boundingBox;
  const s=[max[0]-min[0],max[1]-min[1],max[2]-min[2]], c=[b.max.x-b.min.x,b.max.y-b.min.y,b.max.z-b.min.z];
  let sx=s[0]/Math.max(c[0],1e-5), sy=s[1]/Math.max(c[1],1e-5), sz=s[2]/Math.max(c[2],1e-5);
  if(mode==='none'){ sx=sy=sz=1; }
  else if(mode==='keepz') sz=1;
  else if(mode==='xz') sy=1;
  else if(mode==='uniform'){ const k=Math.min(sx,sy,sz); sx=sy=sz=k; }
  g.applyMatrix4(new THREE.Matrix4().makeScale(sx,sy,sz)); g.computeBoundingBox();
  const b2=g.boundingBox;
  g.translate((min[0]+max[0])/2-(b2.min.x+b2.max.x)/2, min[1]-b2.min.y, (min[2]+max[2])/2-(b2.min.z+b2.max.z)/2);
  g.computeBoundingBox(); g.computeBoundingSphere();
  return g;
}
