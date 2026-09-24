/* ═════════════ HYPER-REAL INTERIOR ═════════════
   A visual layer over the interior. The floor plan, collisions, nav grid,
   doors, missions, Naina and every story item are exactly what they were;
   this only changes what the building LOOKS like:
   - GPU-baked PBR surface sets: trowelled plaster, polished terrazzo,
     vitrified tile, mineral-fibre ceiling tiles, micro-detail for props
   - world-space surface shading: per-floor decay, water stains, drips,
     peeling paint down to brick, mould, grime, wet floors, missing tiles
   - a baked ambient-occlusion atlas per floor (walls, corners, furniture)
   - procedurally modelled high-poly furniture and equipment, instanced
   - architecture: skirting, frames, flush doors, windows onto a Shimla
     night, troffers, switchboards, conduits, stairs, lift portal, signage
   - atmosphere: a real torch cookie and dust hanging in the beam          */
const RIQ={
  touch:IS_TOUCH, low:LOW_END,
  /* baked texture sizes — the bake runs on the GPU, so size costs nothing
     at load, only memory */
  tex:IS_TOUCH?(LOW_END?512:1024):2048,
  texS:IS_TOUCH?(LOW_END?256:512):1024,
  pano:IS_TOUCH?1024:2048,
  /* geometry density for the modelled props */
  seg:IS_TOUCH?(LOW_END?0.5:0.72):1.0,
  aniso:1
};
const RIseg=(n,min=3)=>Math.max(min,Math.round(n*RIQ.seg));

/* ---------- GLSL: hashes and noise shared by bake + runtime ---------- */
const RI_NOISE=`
float riH12(vec2 p){ vec3 p3=fract(vec3(p.xyx)*.1031); p3+=dot(p3,p3.yzx+33.33); return fract((p3.x+p3.y)*p3.z); }
vec2 riH22(vec2 p){ vec3 p3=fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3+=dot(p3,p3.yzx+33.33); return fract((p3.xx+p3.yz)*p3.zy); }
float riH13(vec3 p3){ p3=fract(p3*.1031); p3+=dot(p3,p3.zyx+31.32); return fract((p3.x+p3.y)*p3.z); }
float riVN(vec2 p,vec2 per){ vec2 i=floor(p),f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(riH12(mod(i,per)),riH12(mod(i+vec2(1.,0.),per)),u.x),
             mix(riH12(mod(i+vec2(0.,1.),per)),riH12(mod(i+vec2(1.,1.),per)),u.x),u.y); }
float riFBM(vec2 p,vec2 per,int o){ float s=0.,a=.5,t=0.;
  for(int i=0;i<8;i++){ if(i>=o)break; s+=a*riVN(p,per); t+=a; p*=2.; per*=2.; a*=.5; } return s/t; }
vec3 riVor(vec2 p,vec2 per){ vec2 i=floor(p),f=fract(p); float d1=8.,d2=8.,id=0.;
  for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){ vec2 g=vec2(float(x),float(y)); vec2 c=mod(i+g,per);
    vec2 o=riH22(c); vec2 r=g+o-f; float d=dot(r,r);
    if(d<d1){d2=d1;d1=d;id=riH12(c+7.13);} else if(d<d2){d2=d;} }
  return vec3(sqrt(d1),sqrt(d2),id); }
float riN3(vec3 p){ vec3 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(mix(riH13(i),riH13(i+vec3(1.,0.,0.)),f.x),mix(riH13(i+vec3(0.,1.,0.)),riH13(i+vec3(1.,1.,0.)),f.x),f.y),
             mix(mix(riH13(i+vec3(0.,0.,1.)),riH13(i+vec3(1.,0.,1.)),f.x),mix(riH13(i+vec3(0.,1.,1.)),riH13(i+vec3(1.,1.,1.)),f.x),f.y),f.z); }
float riF3(vec3 p){ return .5333*riN3(p)+.2667*riN3(p*2.03+1.7)+.1333*riN3(p*4.01+3.1)+.0667*riN3(p*8.03+5.3); }
vec3 riToSRGB(vec3 c){ c=clamp(c,0.,1.); return mix(c*12.92,1.055*pow(c,vec3(1./2.4))-.055,step(.0031308,c)); }
vec3 riFromSRGB(vec3 c){ return mix(c/12.92,pow((c+.055)/1.055,vec3(2.4)),step(.04045,c)); }
vec2 riPackH(float h){ h=clamp(h,0.,.99998)*255.; return vec2(floor(h)/255.,fract(h)); }
`;

/* ═════════════ GPU bake ═════════════
   Every surface set is rendered once into a render target with mipmaps and
   sampled from there: no CPU pixel loops, no readback, 2K on a desktop in a
   few milliseconds. Height goes through a 16-bit (hi/lo) intermediate so
   the normal maps derived from it never show 8-bit terracing.            */
const RIBake={
  scene:null, cam:null, quad:null,
  init(){
    if(this.scene) return;
    this.scene=new THREE.Scene(); this.cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    this.quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),null); this.quad.frustumCulled=false;
    this.scene.add(this.quad);
  },
  rt(w,h,mip){
    return new THREE.WebGLRenderTarget(w,h,{wrapS:THREE.RepeatWrapping,wrapT:THREE.RepeatWrapping,
      magFilter:mip?THREE.LinearFilter:THREE.NearestFilter,
      minFilter:mip?THREE.LinearMipmapLinearFilter:THREE.NearestFilter,
      generateMipmaps:!!mip, anisotropy:mip?RIQ.aniso:1, depthBuffer:false, stencilBuffer:false,
      type:THREE.UnsignedByteType, format:THREE.RGBAFormat});
  },
  run(w,h,body,uniforms,mip=true){
    this.init();
    const target=this.rt(w,h,mip);
    const mat=new THREE.ShaderMaterial({
      uniforms:Object.assign({uRes:{value:new THREE.Vector2(w,h)}},uniforms||{}),
      vertexShader:'void main(){ gl_Position=vec4(position.xy,0.,1.); }',
      fragmentShader:'precision highp float;\nuniform vec2 uRes;\n'+RI_NOISE+body+
        '\nvoid main(){ vec2 uv=gl_FragCoord.xy/uRes; gl_FragColor=bake(uv); }',
      depthTest:false, depthWrite:false });
    this.quad.material=mat;
    const prev=renderer.getRenderTarget(), prevAC=renderer.autoClear;
    renderer.autoClear=true;
    renderer.setRenderTarget(target); renderer.render(this.scene,this.cam);
    renderer.setRenderTarget(prev); renderer.autoClear=prevAC;
    mat.dispose();
    return target;
  },
  /* a material set: H (height, hi/lo + 2 masks) -> A (look) -> N (normal + roughness) */
  set(size,meters,hMeters,fnSrc,aBody,nRough){
    const H=this.run(size,size,fnSrc+`
      vec4 bake(vec2 uv){ vec4 m=matH(uv); return vec4(riPackH(m.x),m.y,m.z); }`,null,false);
    const A=this.run(size,size,fnSrc+aBody,null,true);
    const N=this.run(size,size,`
      uniform sampler2D uH; uniform float uTexM, uHm;
      float hAt(vec2 uv){ vec4 t=texture2D(uH,uv); return t.x+t.y/255.; }
      vec4 bake(vec2 uv){
        vec2 e=vec2(1./uRes.x,0.);
        float dx=hAt(uv+e.xy)-hAt(uv-e.xy), dy=hAt(uv+e.yx)-hAt(uv-e.yx);
        float k=uHm/(2.*uTexM);
        vec3 n=normalize(vec3(-dx*k,-dy*k,1.));
        vec4 c=texture2D(uH,uv); float h=c.x+c.y/255.;
        float rough=${nRough};
        return vec4(n*.5+.5,clamp(rough,0.,1.));
      }`,{uH:{value:H.texture},uTexM:{value:meters/size},uHm:{value:hMeters}},true);
    H.dispose();
    return {A:A.texture,N:N.texture,rtA:A,rtN:N};
  }
};

/* ---------- the surface sets ---------- */
const RI_SRC={
  /* trowelled institutional plaster, 2.4 m per repeat */
  plaster:`
    float plCrack(vec2 uv){
      vec2 w=vec2(riFBM(uv*7.,vec2(7.),3),riFBM(uv*7.+3.3,vec2(7.),3))-.5;
      vec3 c=riVor(uv*4.+w*.9,vec2(4.));
      float line=1.-smoothstep(.0,.009,c.y-c.x);
      float m=smoothstep(.64,.76,riFBM(uv*3.+11.,vec2(3.),3));
      return line*m;
    }
    vec4 matH(vec2 uv){
      float h=.46*riFBM(uv*6.,vec2(6.),5)+.30*riFBM(uv*40.,vec2(40.),3)+.14*riVN(uv*190.,vec2(190.));
      vec3 v=riVor(uv*70.,vec2(70.));
      float pit=(1.-smoothstep(.0,.16,v.x))*step(.9,v.z);
      float cr=plCrack(uv);
      h=h-.30*pit-.40*cr+.25;
      return vec4(h,cr,pit,0.);
    }`,
  plasterA:`
    vec4 bake(vec2 uv){
      vec4 m=matH(uv);
      float mot=.5+.9*(riFBM(uv*3.,vec2(3.),4)-.5)+.25*(riVN(uv*120.,vec2(120.))-.5);
      float dirt=riFBM(uv*2.+5.,vec2(2.),5);
      return vec4(clamp(mot,0.,1.),clamp(m.x,0.,1.),m.y,dirt);
    }`,
  plasterR:'.87+.09*(riVN(uv*60.,vec2(60.))-.5)-.10*c.z+.05*c.w',

  /* polished terrazzo with marble chips, 1.2 m per panel */
  terrazzo:`
    vec3 tzChip(float id){
      if(id<.34) return vec3(.86,.85,.81);
      if(id<.58) return vec3(.50,.50,.48);
      if(id<.71) return vec3(.075,.075,.08);
      if(id<.83) return vec3(.78,.72,.60);
      if(id<.93) return vec3(.60,.43,.37);
      return vec3(.33,.42,.35);
    }
    float tzScr(vec2 uv,vec2 d,float F,float f2,float th){
      vec2 q=vec2(dot(uv,d)*F,dot(uv,vec2(-d.y,d.x))*f2);
      return smoothstep(th,1.,riVN(q,vec2(F,f2)));
    }
    vec4 tzLayers(vec2 uv,out vec3 col){
      vec3 c=vec3(.60,.595,.57)*(.93+.12*riFBM(uv*30.,vec2(30.),3));
      float chipH=0.;
      for(int L=0;L<3;L++){
        float fq=L==0?36.:(L==1?92.:220.); float cov=L==0?.42:(L==1?.55:.45);
        vec3 v=riVor(uv*fq+float(L)*17.,vec2(fq));
        float e=v.y-v.x;
        float chip=smoothstep(.07,.14,e)*step(1.-cov,fract(v.z*37.1));
        vec3 cc=tzChip(fract(v.z*13.7))*(.88+.24*fract(v.z*71.3));
        cc*=.93+.1*riVN(uv*fq*3.+float(L),vec2(fq*3.));
        c=mix(c,cc,chip); chipH=max(chipH,chip);
      }
      vec3 pv=riVor(uv*160.+3.,vec2(160.));
      float pit=(1.-smoothstep(.0,.2,pv.x))*step(.93,pv.z);
      float s=max(max(tzScr(uv,vec2(1.,0.),900.,5.,.985),tzScr(uv,vec2(0.,1.),900.,7.,.987)),
                  tzScr(uv,vec2(2.,1.),420.,3.,.988));
      col=c*(1.-.55*pit);
      return vec4(chipH,pit,s,0.);
    }
    vec4 matH(vec2 uv){ vec3 c; vec4 l=tzLayers(uv,c);
      float h=.62+.12*l.x-.45*l.y-.22*l.z+.05*riFBM(uv*8.,vec2(8.),3);
      return vec4(h,l.z,l.y,0.); }`,
  terrazzoA:`
    vec4 bake(vec2 uv){ vec3 c; vec4 l=tzLayers(uv,c); return vec4(riToSRGB(c),1.); }`,
  terrazzoR:'.13+.30*c.z+.35*c.w+.10*riFBM(uv*5.,vec2(5.),3)',

  /* vitrified 300 mm tiles, 4x4 per 1.2 m repeat */
  tile:`
    vec4 tileF(vec2 uv,out vec3 alb){
      vec2 t=uv*4.; vec2 id=floor(t); vec2 f=fract(t);
      float hs=riH12(id+3.1), hs2=riH12(id+9.7);
      float g=min(min(f.x,1.-f.x),min(f.y,1.-f.y));
      float grout=1.-smoothstep(.0045,.0085,g);
      float bev=smoothstep(.0045,.028,g);
      vec3 base=vec3(.80,.785,.74)*(.95+.10*hs);
      vec3 sp=riVor(uv*420.,vec2(420.));
      float speck=(1.-smoothstep(.0,.28,sp.x))*step(.70,sp.z);
      base*=1.-.32*speck*(.5+.5*hs2);
      base*=.965+.07*riFBM(uv*24.+hs*9.,vec2(24.),3);
      base*=mix(.84,1.,smoothstep(.0085,.05,g));
      float cr=0.;
      if(hs2>.86){ vec3 cv=riVor(uv*14.+hs*5.,vec2(14.)); cr=1.-smoothstep(0.,.018,cv.y-cv.x); }
      vec2 cn=min(f,1.-f); float chipC=step(.93,hs)*(1.-smoothstep(.02,.05,length(cn)));
      vec3 gc=vec3(.29,.28,.25)*(.75+.5*riFBM(uv*90.,vec2(90.),2));
      alb=mix(base,gc,max(grout,chipC*.8)); alb=mix(alb,alb*.42,cr*(1.-grout));
      float h=mix(.06,.90+.07*bev,1.-grout)-.28*cr-.5*chipC+.015*riVN(uv*300.,vec2(300.));
      h*=mix(.4,1.,bev);
      return vec4(h,grout,cr,chipC);
    }
    vec4 matH(vec2 uv){ vec3 a; vec4 r=tileF(uv,a); return vec4(r.x,r.y,r.z,r.w); }`,
  tileA:`
    vec4 bake(vec2 uv){ vec3 a; vec4 r=tileF(uv,a); return vec4(riToSRGB(a),1.); }`,
  tileR:'mix(mix(.10+.06*riVN(uv*40.,vec2(40.)),.88,c.z),.62,max(c.w,step(.5,h)*0.))',

  /* one 600 mm fissured mineral-fibre ceiling tile */
  ceil:`
    vec4 matH(vec2 uv){
      float h=.86;
      float n1=riFBM(uv*9.,vec2(9.),4); float fis=1.-smoothstep(.0,.03,abs(n1-.5));
      float n2=riFBM(uv*17.+4.,vec2(17.),3); fis=max(fis,(1.-smoothstep(0.,.022,abs(n2-.5)))*.7);
      h-=.42*fis;
      vec3 v=riVor(uv*110.,vec2(110.)); float pin=(1.-smoothstep(.0,.2,v.x))*step(.55,v.z);
      h-=.36*pin;
      h+=.07*riVN(uv*260.,vec2(260.));
      float e=min(min(uv.x,1.-uv.x),min(uv.y,1.-uv.y));
      h*=mix(.55,1.,smoothstep(.0,.022,e));
      return vec4(h,fis,pin,0.);
    }`,
  ceilA:`
    vec4 bake(vec2 uv){ vec4 m=matH(uv);
      float a=.9-.18*m.y-.3*m.z+.06*(riFBM(uv*6.,vec2(6.),3)-.5);
      return vec4(a,m.x,m.y,1.); }`,
  ceilR:'.93+.05*c.z',

  /* generic micro detail for modelled props */
  detail:`
    vec4 matH(vec2 uv){
      float h=.6*riFBM(uv*8.,vec2(8.),5)+.4*riFBM(uv*40.,vec2(40.),3);
      return vec4(h,0.,0.,0.);
    }`,
  detailA:`
    vec4 bake(vec2 uv){
      float fine=riVN(uv*128.,vec2(128.));
      float coarse=riFBM(uv*4.,vec2(4.),5);
      float med=riFBM(uv*16.,vec2(16.),4);
      float h=matH(uv).x;
      return vec4(fine,coarse,med,h);
    }`,
  detailR:'.5'
};

/* macro variation for the runtime shaders: four tileable noise fields,
   read with one texture fetch instead of dozens of hash evaluations */
const RI_MACRO=`
  vec4 bake(vec2 uv){
    return vec4(riFBM(uv*4.,vec2(4.),5),riFBM(uv*8.+3.7,vec2(8.),5),riVN(uv*64.,vec2(64.)),riFBM(uv*16.+1.3,vec2(16.),4));
  }`;
/* the view from the windows: Shimla hills at night, lights on the ridges */
const RI_PANO=`
  float ridge(float u,float base,float amp,float fq,float seed){
    return base+amp*(riFBM(vec2(u*fq+seed,seed),vec2(fq,64.),5)-.5)*2.;
  }
  vec3 lightsOn(vec2 uv,float el,float top,float fq,float dens,float seed,float sz){
    vec2 g=vec2(uv.x*fq,el*fq*.5+seed);
    vec2 id=floor(g), f=fract(g);
    vec2 o=riH22(id+seed)*.7+.15;
    float h=riH12(id+seed*1.7);
    float town=smoothstep(.45,.75,riFBM(vec2(uv.x*6.+seed,el*4.),vec2(6.,64.),3));
    float nearRidge=smoothstep(.0,.03,top-el)*(1.-smoothstep(.02,.22,top-el)*.55);
    float on=step(1.-dens*(.25+1.1*town)*nearRidge,h);
    float d=length(f-o);
    float b=on*exp(-d*d/(sz*sz));
    vec3 col=h>.985?vec3(.75,.85,1.):(h>.93?vec3(1.,.78,.5):vec3(1.,.56,.22));
    return col*b*(.5+.8*fract(h*37.));
  }
  vec4 bake(vec2 uv){
    float el=(uv.y-.5)*3.14159265;
    vec3 c=mix(vec3(.030,.034,.046),vec3(.007,.009,.016),smoothstep(-.02,.9,el));
    float cl=riFBM(vec2(uv.x*7.,el*5.),vec2(7.,64.),6);
    float glow=exp(-max(el,0.)*5.);
    c+=vec3(.045,.03,.02)*smoothstep(.45,.8,cl)*glow;
    c+=vec3(.012,.014,.02)*smoothstep(.3,.7,cl)*(1.-glow*.5);
    float mu=uv.x-.31; float md=length(vec2(mu*6.2832*cos(.35),el-.38));
    c+=vec3(.05,.055,.065)*exp(-md*md*14.)*(.35+.65*smoothstep(.35,.65,cl));
    c+=vec3(.05,.03,.012)*exp(-abs(el)*7.)*.8;
    float r3=ridge(uv.x,.02,.035,5.,1.3), r2=ridge(uv.x,-.03,.06,3.,7.7), r1=ridge(uv.x,-.10,.07,2.,3.1);
    if(el<r3){ c=mix(vec3(.018,.02,.026),c,.35); c+=lightsOn(uv,el,r3,900.,.08,3.,.16); }
    if(el<r2){ c=vec3(.011,.012,.016)+vec3(.02,.013,.008)*exp(-(r2-el)*12.); c+=lightsOn(uv,el,r2,620.,.10,11.,.2); }
    if(el<r1){ c=vec3(.006,.0065,.008); c+=lightsOn(uv,el,r1,380.,.12,23.,.22)*1.2; }
    return vec4(riToSRGB(c),1.);
  }`;

/* shared runtime uniforms: the same {value} objects are handed to every
   material, so one assignment per frame updates the whole building */
const RIU={
  uRItime:{value:0}, uRIpow:{value:1}, uRIflash:{value:0},
  uRIdmg:{value:new Array(11).fill(0)},
  uRIAO:{value:null}, uRIAOi:{value:new THREE.Vector4(4,3,HX,HZ)},
  uRIplA:{value:null}, uRIplN:{value:null},
  uRItzA:{value:null}, uRItzN:{value:null},
  uRItiA:{value:null}, uRItiN:{value:null},
  uRIceA:{value:null}, uRIceN:{value:null},
  uRIdetA:{value:null}, uRIdetN:{value:null},
  uRIpano:{value:null}, uRImac:{value:null}
};

const RI_VS_PARS=`
varying vec3 vRIw; varying vec3 vRIwn;
`;
const RI_VS_MAIN=`
{ vec4 rp=vec4(transformed,1.);
  vec3 rn=objectNormal;
  #ifdef USE_INSTANCING
  rp=instanceMatrix*rp; rn=mat3(instanceMatrix)*rn;
  #endif
  vRIw=(modelMatrix*rp).xyz; vRIwn=normalize(mat3(modelMatrix)*rn); }
`;
const RI_FS_PARS=`
varying vec3 vRIw; varying vec3 vRIwn;
uniform float uRItime; uniform float uRIpow; uniform float uRIflash;
uniform float uRIdmg[11];
uniform sampler2D uRIAO; uniform vec4 uRIAOi;
uniform sampler2D uRImac;
`+RI_NOISE+`
vec4 riMx(vec2 p){ return texture2D(uRImac,p); }
float riFloorOf(float y){ return clamp(floor((y+.3)/3.6)+1.,0.,10.); }
float riDmgOf(float fi){ return uRIdmg[int(fi)]; }
vec3 riAOs(vec3 p){
  float fi=riFloorOf(p.y);
  float col=mod(fi,uRIAOi.x), row=floor(fi/uRIAOi.x);
  vec2 l=clamp(vec2((p.x+uRIAOi.z)/(2.*uRIAOi.z),(p.z+uRIAOi.w)/(2.*uRIAOi.w)),.001,.999);
  return texture2D(uRIAO,(vec2(col,row)+l)/uRIAOi.xy).rgb;
}
`;

/* one place that knows how to splice into three's standard shader */
function riPatch(mat,key,o){
  mat.customProgramCacheKey=()=>'ri-'+key;
  mat.onBeforeCompile=(sh)=>{
    for(const k in RIU) sh.uniforms[k]=RIU[k];
    if(o.uniforms) Object.assign(sh.uniforms,o.uniforms);
    let vs=sh.vertexShader.replace('#include <common>','#include <common>\n'+RI_VS_PARS+(o.vsPars||''))
      .replace('#include <project_vertex>','#include <project_vertex>\n'+RI_VS_MAIN+(o.vsMain||''));
    let fs='precision highp float;\n'+sh.fragmentShader.replace('#include <common>','#include <common>\n'+RI_FS_PARS+(o.fsPars||''));
    for(const [anchor,code,mode] of (o.fs||[])){
      if(!fs.includes(anchor)){ console.warn('RI patch anchor missing',key,anchor); continue; }
      fs=fs.replace(anchor, mode==='replace'?code:(mode==='before'?code+'\n'+anchor:anchor+'\n'+code));
    }
    sh.vertexShader=vs; sh.fragmentShader=fs;
    mat.userData.shader=sh;
  };
  mat.needsUpdate=true;
  return mat;
}

/* ---------- walls: plaster, paint, age ---------- */
const RI_WALL_COLOR=`
vec3 riWN=normalize(vRIwn);
float riFi=riFloorOf(vRIw.y);
float riLy=vRIw.y-(riFi-1.)*3.6;
float riDm=riDmgOf(riFi);
vec2 riUV=(abs(riWN.y)>.7)?vRIw.xz:((abs(riWN.x)>abs(riWN.z))?vec2(vRIw.z,vRIw.y):vec2(vRIw.x,vRIw.y));
vec4 riA=texture2D(uRIplA,riUV/2.4);
vec4 riN=texture2D(uRIplN,riUV/2.4);
vec3 riC=diffuseColor.rgb;
#ifdef USE_COLOR
float riSat=max(max(vColor.r,vColor.g),vColor.b)-min(min(vColor.r,vColor.g),vColor.b);
#else
float riSat=0.;
#endif
float riGloss=smoothstep(.08,.2,riSat);
riC*=.88+.2*riA.r;
vec2 riFo=vec2(riFi*.37,riFi*.61);
float riM1=riMx(riUV*.0825+riFo).r;
float riTop=smoothstep(1.6,3.05,riLy);
float riSV=riM1*.85+riTop*.32*riDm+riA.w*.08;
float riSt=smoothstep(.58,.70,riSV)*(.22+.78*riDm);
float riRing=(smoothstep(.57,.60,riSV)-smoothstep(.60,.655,riSV))*(.3+.7*riDm);
riC=mix(riC,riC*vec3(.80,.71,.54),riSt*.55);
riC*=1.-riRing*.2;
float riDr=smoothstep(.70,.95,riMx(vec2(riUV.x*.234,riLy*.0052)+riFo).b)*smoothstep(.4,2.6,riLy)*riDm;
riC=mix(riC,riC*vec3(.76,.72,.64),riDr*.55);
float riKick=1.-smoothstep(.0,.42,riLy);
float riSc=smoothstep(.76,.92,riMx(vec2(riUV.x*.078,riLy*.219)+riFo.yx).b)*(1.-smoothstep(.1,.85,riLy));
riC*=1.-.16*riKick*(.4+riDm)-.24*riSc*(1.-riGloss*.5);
float riDamp=max(1.-smoothstep(.15,1.1,riLy),riSt*1.2)+riDm*.35;
float riPf=riMx(riUV*.65+riFo*1.3).r*.66+riMx(riUV*.5625+.3).a*.22+riMx(riUV*.594+.7).b*.12+riA.w*.05;
float riPth=.83-.12*riDm-.09*clamp(riDamp,0.,1.);
float riPeel=smoothstep(riPth,riPth+.012,riPf)*step(.12,riDm);
float riDeep=smoothstep(riPth+.095,riPth+.105,riPf)*step(.5,riDm);
float riPeelEdge=smoothstep(riPth-.012,riPth,riPf)*(1.-riPeel)*step(.12,riDm);
vec3 riBare=vec3(.50,.50,.485)*(.78+.3*riA.r)*(.85+.15*riMx(riUV*.219).b);
riC=mix(riC,riBare,riPeel);
riC*=1.-.22*riPeelEdge;
vec2 riBk=vec2(riUV.x/.235,riLy/.085); riBk.x+=mod(floor(riBk.y),2.)*.5;
vec2 riBf=fract(riBk);
float riMortar=1.-smoothstep(.05,.11,min(min(riBf.x,1.-riBf.x)*2.76,min(riBf.y,1.-riBf.y)));
vec3 riBrick=mix(vec3(.25,.115,.07)*(.62+.5*riH12(floor(riBk)))*(.7+.45*riA.r),vec3(.33,.31,.28),riMortar);
riBrick=mix(riBrick,riBare*.8,smoothstep(.55,.8,riMx(riUV*.75+.3).g)*.6);
riBrick*=.75+.25*smoothstep(.0,.6,riLy);
riC=mix(riC,riBrick,riDeep);
riC*=1.-riA.z*(.10+.30*riDm)*(1.-riDeep);
float riMo=smoothstep(.62,.8,riMx(riUV*.6+.5).r)*(1.-smoothstep(.0,1.1,riLy))*riDm;
riC=mix(riC,vec3(.10,.11,.08),riMo*.6);
diffuseColor.rgb=riC;
`;
const RI_WALL_ROUGH=`
roughnessFactor=mix(riN.a,.40,riGloss*(1.-riPeel));
roughnessFactor=mix(roughnessFactor,.96,max(riPeel,riDeep));
roughnessFactor=clamp(roughnessFactor-riSt*.05,.3,1.);
`;
const RI_WALL_NORMAL=`
{
  vec3 T,B;
  if(abs(riWN.y)>.7){T=vec3(1.,0.,0.);B=vec3(0.,0.,1.);}
  else if(abs(riWN.x)>abs(riWN.z)){T=vec3(0.,0.,1.);B=vec3(0.,1.,0.);}
  else {T=vec3(1.,0.,0.);B=vec3(0.,1.,0.);}
  vec3 tn=riN.xyz*2.-1.;
  tn.xy*=mix(1.,.3,riGloss*(1.-riPeel));
  vec3 nw=normalize(T*tn.x+B*tn.y+riWN*tn.z);
  vec3 nv=normalize((viewMatrix*vec4(nw,0.)).xyz);
  float riPh=riPeel*.55+riDeep*(.7+(1.-riMortar)*.6);
  vec2 dH=vec2(dFdx(riPh),dFdy(riPh))*.018;
  vec3 sp=-vViewPosition; vec3 sx=normalize(dFdx(sp)), sy=normalize(dFdy(sp));
  vec3 R1=cross(sy,nv), R2=cross(nv,sx); float det=dot(sx,R1);
  vec3 gr=sign(det)*(dH.x*R1+dH.y*R2);
  normal=normalize(abs(det)*nv-gr);
}
`;
const RI_WALL_AO=`
{
  vec3 riAo=riAOs(vRIw+riWN*.32);
  float o=(1.-.40*(1.-smoothstep(0.,.36,riLy)))*(1.-.26*smoothstep(2.74,3.05,riLy));
  o*=1.-clamp((riAo.b-.17)*1.35,0.,.42);
  reflectedLight.directDiffuse*=o; reflectedLight.indirectDiffuse*=o;
  reflectedLight.directSpecular*=mix(1.,o,.6);
}
`;

/* ---------- floors: terrazzo / tile ---------- */
const RI_FLOOR_COLOR=`
vec3 riWN=normalize(vRIwn);
float riFi=riFloorOf(vRIw.y); float riDm=riDmgOf(riFi);
float riTop=step(.5,riWN.y);
vec2 riUV=vRIw.xz;
#ifdef RI_TERRAZZO
vec4 riA=texture2D(uRItzA,riUV/1.2); vec4 riN=texture2D(uRItzN,riUV/1.2);
vec2 riGg=abs(fract(riUV/1.2+.5)-.5)*1.2;
float riStrip=(1.-smoothstep(.0022,.0042,min(riGg.x,riGg.y)))*riTop;
float riPid=riH12(floor(riUV/1.2)+riFi*3.);
#else
vec4 riA=texture2D(uRItiA,riUV/1.2); vec4 riN=texture2D(uRItiN,riUV/1.2);
float riStrip=0.;
float riPid=riH12(floor(riUV/.3)+riFi*3.);
#endif
vec3 riC=diffuseColor.rgb*riFromSRGB(riA.rgb)*1.12;
riC*=.965+.07*riPid;
vec2 riFo=vec2(riFi*.37,riFi*.61);
float riM=riMx(riUV*.105+riFo).r;
float riM2=riMx(riUV*.2375+riFo.yx).g;
vec3 riAo=riAOs(vRIw+vec3(0.,.05,0.));
float riDirt=clamp(riAo.r*1.1+riAo.g*.7,0.,1.);
riC*=1.-.34*riDirt*(.5+.5*riM2)-.13*smoothstep(.45,.8,riM)*(.3+riDm);
float riWet=smoothstep(.69-.12*riDm,.715-.12*riDm,riMx(riUV*.1375+riFo*1.7+.13).r+riM2*.12)*smoothstep(.12,.3,riDm)*riTop;
riC*=1.-.38*riWet;
riC=mix(riC,vec3(.60,.44,.21)*(.55+.35*riM2),riStrip);
diffuseColor.rgb=riC;
`;
const RI_FLOOR_ROUGH=`
roughnessFactor=clamp(riN.a+.20*riDirt+.14*smoothstep(.4,.75,riM)*(.4+riDm)+.07*riDm,.05,1.);
roughnessFactor=mix(roughnessFactor,.34,riStrip);
roughnessFactor=mix(roughnessFactor,.03,riWet);
`;
const RI_FLOOR_METAL=`metalnessFactor=mix(metalnessFactor,.92,riStrip);`;
const RI_FLOOR_NORMAL=`
{ vec3 tn=riN.xyz*2.-1.; tn.xy*=(1.-riWet*.92)*riTop;
  vec3 nw=normalize(vec3(tn.x,0.,tn.y)+riWN*tn.z);
  normal=normalize((viewMatrix*vec4(nw,0.)).xyz); }
`;
const RI_FLOOR_COAT=`
#ifdef USE_CLEARCOAT
material.clearcoat*=clamp(1.-riDirt*.7-riStrip,0.,1.)*riTop*(1.-.5*smoothstep(.4,.75,riM)*riDm)+riWet*.6;
#endif
`;
const RI_FLOOR_AO=`
{ float o=(1.-.60*riAo.r)*(1.-.72*riAo.g)*(1.-.24*riAo.b); o=mix(1.,o,riTop);
  reflectedLight.directDiffuse*=o; reflectedLight.indirectDiffuse*=o;
  reflectedLight.directSpecular*=mix(1.,o,.7); }
`;

/* ---------- ceilings: 600 mm tiles on a T-bar grid ---------- */
const RI_CEIL_COLOR=`
vec3 riWN=normalize(vRIwn);
float riFi=riFloorOf(vRIw.y); float riDm=riDmgOf(riFi);
float riBot=step(riWN.y,-.5);
vec2 riT=vRIw.xz/.6; vec2 riId=floor(riT); vec2 riF=fract(riT);
float riHh=riH12(riId+riFi*11.);
float riR=floor(riHh*4.);
vec2 riTF=riF;
if(riR==1.)riTF=vec2(1.-riF.y,riF.x); else if(riR==2.)riTF=1.-riF; else if(riR==3.)riTF=vec2(riF.y,1.-riF.x);
vec2 riDx=dFdx(riT), riDy=dFdy(riT);
vec4 riA=textureGrad(uRIceA,riTF,riDx,riDy);
vec4 riN=textureGrad(uRIceN,riTF,riDx,riDy);
vec2 riE=min(riF,1.-riF)*.6;
float riEd=min(riE.x,riE.y);
float riBar=(1.-smoothstep(.0112,.0128,riEd))*riBot;
float riGr=((1.-smoothstep(.0128,.022,riEd))*riBot)-riBar;
float riMiss=step(1.-.05*riDm*riDm-.003,riH12(riId+riFi*5.+.7))*riBot;
float riStn=step(1.-.12*riDm-.02,riH12(riId+riFi*2.+3.3))*riBot;
vec2 riScn=vec2(riH12(riId+1.1),riH12(riId+2.2))*.6+.2;
vec2 riSq=(riF-riScn)*vec2(1.+.6*riH12(riId+4.4),1.+.6*riH12(riId+5.5));
vec2 riFo=vec2(riFi*.37,riFi*.61);
float riSd=length(riSq)+.22*(riMx(riT*.0625+riFo).b-.5)+.10*(riMx(riT*.172+riFo+.5).b-.5);
float riStain=riStn*(1.-smoothstep(.18,.34,riSd));
float riStR=riStn*(smoothstep(.26,.31,riSd)-smoothstep(.31,.37,riSd));
vec3 riC=diffuseColor.rgb*mix(1.,.74+.3*riA.r,riBot);
riC=mix(riC,riC*vec3(.83,.74,.57),riStain*.55);
riC*=1.-riStR*.26;
riC*=1.-.32*riGr;
riC=mix(riC,diffuseColor.rgb*.92*(.86+.1*riMx(riT*.625).b),riBar);
riC=mix(riC,vec3(.010,.010,.012),riMiss*(1.-riBar));
float riMac=riMx(vRIw.xz*.125+riFo).r;
riC*=1.-.12*smoothstep(.5,.8,riMac)*(.3+riDm);
diffuseColor.rgb=riC;
`;
const RI_CEIL_ROUGH=`
roughnessFactor=mix(mix(.9,riN.a,riBot),.52,riBar); roughnessFactor=mix(roughnessFactor,1.,riMiss);
`;
const RI_CEIL_NORMAL=`
{ vec3 T=vec3(1.,0.,0.),B=vec3(0.,0.,1.);
  if(riR==1.){T=vec3(0.,0.,-1.);B=vec3(1.,0.,0.);} else if(riR==2.){T=vec3(-1.,0.,0.);B=vec3(0.,0.,-1.);}
  else if(riR==3.){T=vec3(0.,0.,1.);B=vec3(-1.,0.,0.);}
  vec3 tn=riN.xyz*2.-1.; tn.xy*=riBot*(1.-riBar)*(1.-riMiss);
  vec3 nw=normalize(T*tn.x+B*tn.y+riWN*tn.z);
  normal=normalize((viewMatrix*vec4(nw,0.)).xyz); }
`;
const RI_CEIL_AO=`
{ vec3 riAo=riAOs(vRIw-vec3(0.,.05,0.));
  float o=(1.-.48*riAo.r)*(1.-.24*riAo.b)*(1.-.3*riGr);
  reflectedLight.directDiffuse*=o; reflectedLight.indirectDiffuse*=o; reflectedLight.directSpecular*=o; }
`;

/* ---------- modelled props: per-vertex PBR + procedural micro-detail ----------
   Every prop vertex carries pbr = (roughness, metalness, detail id, wear).
   One material draws the whole prop library, so instancing and merging keep
   working, and paint, chrome, rubber and cloth still read as themselves.  */
const RI_VP_VS_PARS=`
attribute vec4 pbr;
varying vec4 vRIpbr; varying vec3 vRIo; varying vec3 vRIon;
varying vec3 vRIax; varying vec3 vRIay; varying vec3 vRIaz;
`;
const RI_VP_VS_MAIN=`
vRIpbr=pbr; vRIo=transformed; vRIon=objectNormal;
{ mat3 rim=mat3(1.);
  #ifdef USE_INSTANCING
  rim=mat3(instanceMatrix);
  #endif
  vRIax=normalize(normalMatrix*(rim*vec3(1.,0.,0.)));
  vRIay=normalize(normalMatrix*(rim*vec3(0.,1.,0.)));
  vRIaz=normalize(normalMatrix*(rim*vec3(0.,0.,1.))); }
`;
const RI_VP_FS_PARS=`
varying vec4 vRIpbr; varying vec3 vRIo; varying vec3 vRIon;
varying vec3 vRIax; varying vec3 vRIay; varying vec3 vRIaz;
uniform sampler2D uRIdetA; uniform sampler2D uRIdetN;
uniform vec4 uRIdef; uniform vec2 uRIrm;
`;
const RI_VP_COLOR=`
vec4 riP4=vRIpbr; bool riHas=riP4.x>.001;
float riRo=riHas?riP4.x:uRIdef.x; float riMe=riHas?riP4.y:uRIdef.y;
float riId=riHas?floor(riP4.z+.5):uRIdef.z; float riWr=riHas?riP4.w:uRIdef.w;
vec3 riON=normalize(vRIon);
vec3 riBW=pow(abs(riON),vec3(4.)); riBW/=riBW.x+riBW.y+riBW.z+1e-5;
float riScl=(riId==3.)?9.:((riId==2.)?2.:4.);
vec3 riOp=vRIo*riScl;
vec4 riDX=texture2D(uRIdetA,riOp.zy), riDY=texture2D(uRIdetA,riOp.xz), riDZ=texture2D(uRIdetA,riOp.xy);
vec4 riD=riDX*riBW.x+riDY*riBW.y+riDZ*riBW.z;
vec2 riNX=texture2D(uRIdetN,riOp.zy).xy*2.-1., riNY=texture2D(uRIdetN,riOp.xz).xy*2.-1., riNZ=texture2D(uRIdetN,riOp.xy).xy*2.-1.;
vec3 riDN=vec3(0.,riNX.y,riNX.x)*riBW.x+vec3(riNY.x,0.,riNY.y)*riBW.y+vec3(riNZ.x,riNZ.y,0.)*riBW.z;
float riNs=.12, riEm=0.;
vec3 riC=diffuseColor.rgb;
float riWm=smoothstep(.52,.86,riD.g+riWr*.3)*riWr;
if(riId==1.){
  riNs=.10;
  float ch=smoothstep(.9-.2*riWr,.92-.2*riWr,riD.g*.7+riD.b*.3)*smoothstep(.2,.36,riWr)*smoothstep(.56,.72,riMx(vRIo.xy*.45+vRIo.z*.31+.2).r);
  riC=mix(riC,mix(vec3(.15,.145,.14),vec3(.30,.13,.06),clamp(riWr*1.3,0.,1.)),ch);
  riRo=mix(riRo,.66,ch); riMe=mix(riMe,.45,ch*(1.-riWr));
} else if(riId==2.){
  float br=texture2D(uRIdetA,vec2(riOp.x*.15,riOp.y*14.)).r*riBW.z+texture2D(uRIdetA,vec2(riOp.z*.15,riOp.y*14.)).r*riBW.x+texture2D(uRIdetA,vec2(riOp.x*.15,riOp.z*14.)).r*riBW.y;
  riC*=.86+.28*br; riRo=clamp(riRo+(br-.5)*.14,.08,1.); riNs=.04;
} else if(riId==3.){
  vec3 q=vRIo*420.; float wv=.5+.5*sin(q.x+q.z)*sin(q.y-q.z*.7);
  riC*=.85+.22*wv; riNs=.28; riRo=max(riRo,.84);
} else if(riId==4.){
  float g=riMx(vec2((vRIo.x+vRIo.z)*.75,vRIo.y*10.5)).r;
  riC*=.76+.34*(.5+.5*sin(g*26.)); riNs=.08;
} else if(riId==5.){
  riNs=.07; riC*=.95+.1*riD.r;
} else if(riId==6.){
  float rs=smoothstep(.34,.7,riD.g*.7+riD.b*.3+riWr*.22);
  riC=mix(riC,mix(vec3(.22,.085,.04),vec3(.40,.19,.075),riD.r),rs);
  riRo=mix(riRo,.9,rs); riMe=mix(riMe,.12,rs); riNs=.22+.3*rs;
} else if(riId==7.){
  vec2 pq=(abs(riON.x)>.5?vRIo.zy:(abs(riON.y)>.5?vRIo.xz:vRIo.xy))*70.; pq.x+=mod(floor(pq.y),2.)*.5;
  float dt=1.-smoothstep(.22,.3,length(fract(pq)-.5));
  riC*=1.-.82*dt; riRo=mix(riRo,1.,dt); riNs=.05;
} else if(riId==8.){
  riRo*=.6; riNs=0.;
} else if(riId==9.){
  riC*=.9+.16*riD.r; riRo=.93; riNs=.16;
} else if(riId==10.){
  riNs=.30; riC*=.9+.18*riD.b; riRo=clamp(riRo+(riD.b-.5)*.2,.3,1.);
} else if(riId==11.){
  vec4 s=texture2D(uRIdetA,riOp.xz*3.1)*riBW.y+texture2D(uRIdetA,riOp.xy*3.1)*riBW.z+texture2D(uRIdetA,riOp.zy*3.1)*riBW.x;
  float sp=step(.74,s.r); riC*=mix(.92+.14*s.g,.5,sp*.6); riNs=.05;
} else if(riId==12.){
  riEm=riWr; riWr=0.; riWm=0.; riNs=0.;
} else if(riId==13.){
  riRo=min(riRo,.12); riNs=.02;
} else if(riId==14.){
  riC*=.78+.36*riD.g; riRo=.95; riNs=.38;
}
riC*=1.-.42*riWm;
riRo=clamp(riRo+.24*riWm,.03,1.);
vec3 riAo=riAOs(vRIw);
float riLyp=vRIw.y-(riFloorOf(vRIw.y)-1.)*3.6;
float riOcc=(1.-.34*riAo.r)*(1.-.22*riAo.b)*(.70+.30*smoothstep(0.,.32,riLyp));
diffuseColor.rgb=riC;
`;
const RI_VP_ROUGH=`roughnessFactor=clamp(riRo*uRIrm.x,.03,1.);`;
const RI_VP_METAL=`metalnessFactor=clamp(riMe*uRIrm.y,0.,1.);`;
const RI_VP_NORMAL=`normal=normalize(normal+(vRIax*riDN.x+vRIay*riDN.y+vRIaz*riDN.z)*riNs);`;
const RI_VP_EMIT=`totalEmissiveRadiance+=riC*riEm*uRIpow;`;
const RI_VP_AO=`reflectedLight.directDiffuse*=riOcc; reflectedLight.indirectDiffuse*=riOcc; reflectedLight.directSpecular*=mix(1.,riOcc,.6); reflectedLight.indirectSpecular*=riOcc;`;

/* ---------- window glass: the night outside, rain on the pane ---------- */
const RI_GLASS_EMIT=`
{
  vec3 riWN=normalize(vRIwn);
  vec2 gp=(abs(riWN.x)>abs(riWN.z))?vec2(vRIw.z*sign(riWN.x),vRIw.y):vec2(-vRIw.x*sign(riWN.z),vRIw.y);
  vec3 T=(abs(riWN.x)>abs(riWN.z))?vec3(0.,0.,sign(riWN.x)):vec3(-sign(riWN.z),0.,0.);
  /* static beads, then drops sliding down */
  vec2 q=gp*26.; vec2 id=floor(q); vec2 f=fract(q)-.5; vec2 rr=riH22(id)-.5;
  float s=.10+.16*riH12(id+3.);
  vec2 dv=f-rr*.55; float bead=(1.-smoothstep(s*.65,s,length(dv)))*step(.5,riH12(id+7.));
  vec2 off=dv*bead*1.4;
  float cx=floor(gp.x*7.); float sp=.25+.5*riH12(vec2(cx,4.));
  vec2 q2=vec2(gp.x*7.,gp.y*1.6+uRItime*sp); vec2 id2=floor(q2); vec2 f2=fract(q2)-.5;
  float hx=riH12(id2+.3); float px=(hx-.5)*.5;
  float wob=sin(q2.y*9.+hx*6.)*.04;
  float dx=(f2.x-px-wob)*2.4;
  float head=(1.-smoothstep(.07,.12,length(vec2(dx,(f2.y+.25)*.6))))*step(.45,hx);
  float trail=(1.-smoothstep(.015,.04,abs(dx)))*smoothstep(-.2,.45,f2.y)*step(.45,hx)*.6;
  off+=vec2(dx*.5,-.3)*head;
  float wetm=max(bead,max(head,trail));
  vec3 V=normalize(vRIw-cameraPosition);
  vec3 d=normalize(V+(T*off.x+vec3(0.,1.,0.)*off.y)*.22);
  float u=atan(d.x,-d.z)/6.2831853+.5; float v=asin(clamp(d.y,-1.,1.))/3.14159265+.5;
  float u2=fract(u+.5)-.5;
  vec2 g1=vec2(dFdx(u),dFdy(u)), g2=vec2(dFdx(u2),dFdy(u2));
  vec2 gx=vec2(abs(g1.x)<abs(g2.x)?g1.x:g2.x,dFdx(v)), gy=vec2(abs(g1.y)<abs(g2.y)?g1.y:g2.y,dFdy(v));
  vec3 pano=riFromSRGB(textureGrad(uRIpano,vec2(u,v),gx,gy).rgb);
  float tw=.82+.18*riN3(vec3(u*300.,v*300.,uRItime*1.7));
  float dirt=smoothstep(.45,.85,riMx(gp*.75+.2).r);
  vec3 em=pano*tw*2.2*(1.+uRIflash*7.)+vec3(.30,.34,.42)*uRIflash*.22;
  em*=mix(1.,.5,dirt)*(1.-.25*wetm);
  em+=vec3(.012,.014,.018)*dirt;
  totalEmissiveRadiance+=em;
  diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.10,.10,.09),dirt*.4);
}
`;

/* ---------- material factory ---------- */
const RIMat={
  vpbr(o={}){
    const m=new THREE.MeshStandardMaterial({vertexColors:true,color:o.color!==undefined?o.color:0xffffff,
      roughness:1,metalness:0,side:o.side||THREE.FrontSide});
    if(typeof RI!=='undefined'&&RI.env){ m.envMap=RI.env; m.envMapIntensity=.32; (RI.envMats||(RI.envMats=[])).push(m); }
    const u={uRIdef:{value:new THREE.Vector4(o.defR!==undefined?o.defR:.8,o.defM!==undefined?o.defM:.04,o.defD||0,o.defW||0)},
             uRIrm:{value:new THREE.Vector2(o.rMul||1,o.mMul||1)},
             uRIdetA:RIU.uRIdetA,uRIdetN:RIU.uRIdetN};
    m.userData.riU=u;
    return riPatch(m,'vpbr',{uniforms:u,vsPars:RI_VP_VS_PARS,vsMain:RI_VP_VS_MAIN,fsPars:RI_VP_FS_PARS,fs:[
      ['#include <color_fragment>',RI_VP_COLOR],
      ['#include <roughnessmap_fragment>',RI_VP_ROUGH],
      ['#include <metalnessmap_fragment>',RI_VP_METAL],
      ['#include <normal_fragment_maps>',RI_VP_NORMAL,'replace'],
      ['#include <emissivemap_fragment>',RI_VP_EMIT],
      ['#include <lights_fragment_end>',RI_VP_AO]]});
  },
  wall(){
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.9,metalness:0});
    return riPatch(m,'wall',{fsPars:'uniform sampler2D uRIplA; uniform sampler2D uRIplN;\n',fs:[
      ['#include <color_fragment>',RI_WALL_COLOR],
      ['#include <roughnessmap_fragment>',RI_WALL_ROUGH],
      ['#include <normal_fragment_maps>',RI_WALL_NORMAL,'replace'],
      ['#include <lights_fragment_end>',RI_WALL_AO]]});
  },
  floor(terrazzo){
    const phys=!IS_TOUCH;
    const m=phys?new THREE.MeshPhysicalMaterial({vertexColors:true,roughness:.3,metalness:0,
               clearcoat:terrazzo?.42:.3,clearcoatRoughness:terrazzo?.10:.07})
              :new THREE.MeshStandardMaterial({vertexColors:true,roughness:.3,metalness:0});
    if(terrazzo) m.defines=Object.assign({},m.defines||{},{RI_TERRAZZO:''});
    return riPatch(m,'floor'+(terrazzo?'T':'L')+(phys?'p':'s'),{fsPars:'uniform sampler2D uRItzA; uniform sampler2D uRItzN; uniform sampler2D uRItiA; uniform sampler2D uRItiN;\n',fs:[
      ['#include <color_fragment>',RI_FLOOR_COLOR],
      ['#include <roughnessmap_fragment>',RI_FLOOR_ROUGH],
      ['#include <metalnessmap_fragment>',RI_FLOOR_METAL],
      ['#include <normal_fragment_maps>',RI_FLOOR_NORMAL,'replace'],
      ['#include <lights_physical_fragment>',RI_FLOOR_COAT],
      ['#include <lights_fragment_end>',RI_FLOOR_AO]]});
  },
  ceil(){
    const m=new THREE.MeshStandardMaterial({vertexColors:true,roughness:.92,metalness:0});
    return riPatch(m,'ceil',{fsPars:'uniform sampler2D uRIceA; uniform sampler2D uRIceN;\n',fs:[
      ['#include <color_fragment>',RI_CEIL_COLOR],
      ['#include <roughnessmap_fragment>',RI_CEIL_ROUGH],
      ['#include <normal_fragment_maps>',RI_CEIL_NORMAL,'replace'],
      ['#include <lights_fragment_end>',RI_CEIL_AO]]});
  },
  glass(){
    const m=new THREE.MeshStandardMaterial({color:0x06080a,roughness:.05,metalness:0});
    return riPatch(m,'glass',{fsPars:'uniform sampler2D uRIpano;\n',fs:[['#include <emissivemap_fragment>',RI_GLASS_EMIT]]});
  }
};
