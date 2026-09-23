import sys, re
SRC = sys.argv[1]; OUT = sys.argv[2]
import os
D = os.path.dirname(os.path.abspath(__file__)) + '/'
s = open(SRC, encoding='utf-8').read()

def rep(old, new, count=1):
    global s
    n = s.count(old)
    if n != count:
        raise SystemExit('anchor count %d != %d for:\n%s' % (n, count, old[:300]))
    s = s.replace(old, new)

ri = ''.join(open(D + f, encoding='utf-8').read() for f in
             ['ri_a_core.js', 'ri_b_geo.js', 'ri_c_props.js', 'ri_d_arch.js', 'ri_e_fx.js'])

# 0. header note
rep('<title>IGMC: NIGHT WATCH — REAL IGMC INTERIOR REDO</title>',
    '<title>IGMC: NIGHT WATCH — HYPER-REAL INTERIOR</title>\n<!-- Interior visual rebuild: GPU-baked PBR surfaces, baked AO, procedurally modelled high-poly hospital props. Layout, missions, Naina and story items unchanged. -->')

# 1. insert the module before the interior section
rep('/* ═════════════ INTERIOR ═════════════ */\nconst Int={',
    ri + '\n/* ═════════════ INTERIOR ═════════════ */\nconst Int={')

# 2. tinted prop materials become per-vertex PBR too
rep("""  const m=new THREE.MeshStandardMaterial({vertexColors:true,color:hex,
    roughness:rough===undefined?0.85:rough,metalness:metal===undefined?0.06:metal});
  tintCache.set(k,m); return m;""",
"""  const m=(typeof RI!=='undefined'&&RI.ready)
    ?RIMat.vpbr({color:hex,defR:rough===undefined?0.85:rough,defM:metal===undefined?0.06:metal})
    :new THREE.MeshStandardMaterial({vertexColors:true,color:hex,
      roughness:rough===undefined?0.85:rough,metalness:metal===undefined?0.06:metal});
  tintCache.set(k,m); return m;""")

# 3. buildFloor: open the dresser
rep("""  const TH=theme(fi);
  const wallCol = TH.wall;""",
"""  const TH=theme(fi);
  const RIC=RI.beginFloor(F,fi,TH,y,CH,{W,FL,CE,PR,MT});
  const wallCol = TH.wall;""")

# 4. walls: record segments and openings, even paint instead of patchy per-face tint
rep("""  const wallX=(zf,from,to,ops,col)=>{
    segments(from,to,ops).forEach(([a,b])=>{
      W.box((a+b)/2,y+CH/2,zf,b-a,CH,WALL_T,col||wallCol,0.42);
      if(TH.stripe) W.box((a+b)/2,y+1.05,zf,b-a,0.24,WALL_T+0.018,TH.stripe,1.25,0.015);
      push(a,zf-WALL_T/2,b,zf+WALL_T/2); });
    ops.forEach(o=>{ W.box(o.at,y+2.35+(CH-2.35)/2,zf,o.w,CH-2.35,WALL_T,col||wallCol,0.42);
      F.openings.push({x:o.at,z:zf}); });
  };
  const wallZ=(xf,from,to,ops,col)=>{
    segments(from,to,ops).forEach(([a,b])=>{
      W.box(xf,y+CH/2,(a+b)/2,WALL_T,CH,b-a,col||wallCol,0.42);
      if(TH.stripe) W.box(xf,y+1.05,(a+b)/2,WALL_T+0.018,0.24,b-a,TH.stripe,1.25,0.015);
      push(xf-WALL_T/2,a,xf+WALL_T/2,b); });
    ops.forEach(o=>{ W.box(xf,y+2.35+(CH-2.35)/2,o.at,WALL_T,CH-2.35,o.w,col||wallCol,0.42);
      F.openings.push({x:xf,z:o.at}); });
  };""",
"""  const wallX=(zf,from,to,ops,col)=>{
    segments(from,to,ops).forEach(([a,b])=>{
      W.box((a+b)/2,y+CH/2,zf,b-a,CH,WALL_T,col||wallCol,0.42,0.02);
      if(TH.stripe) W.box((a+b)/2,y+1.05,zf,b-a,0.24,WALL_T+0.018,TH.stripe,1.25,0.015);
      push(a,zf-WALL_T/2,b,zf+WALL_T/2); RI.wall(RIC,'x',zf,a,b); });
    ops.forEach(o=>{ W.box(o.at,y+2.35+(CH-2.35)/2,zf,o.w,CH-2.35,WALL_T,col||wallCol,0.42,0.02);
      F.openings.push({x:o.at,z:zf}); RI.open(RIC,'x',zf,o.at,o.w); });
  };
  const wallZ=(xf,from,to,ops,col)=>{
    segments(from,to,ops).forEach(([a,b])=>{
      W.box(xf,y+CH/2,(a+b)/2,WALL_T,CH,b-a,col||wallCol,0.42,0.02);
      if(TH.stripe) W.box(xf,y+1.05,(a+b)/2,WALL_T+0.018,0.24,b-a,TH.stripe,1.25,0.015);
      push(xf-WALL_T/2,a,xf+WALL_T/2,b); RI.wall(RIC,'z',xf,a,b); });
    ops.forEach(o=>{ W.box(xf,y+2.35+(CH-2.35)/2,o.at,WALL_T,CH-2.35,o.w,col||wallCol,0.42,0.02);
      F.openings.push({x:xf,z:o.at}); RI.open(RIC,'z',xf,o.at,o.w); });
  };""")

# 5. the flight: modelled stairs instead of stacked blocks
rep("""    for(let i=0;i<RUN_STEPS;i++){
      const t=(i+0.5)/RUN_STEPS, zz=RUN.z0+runLen*t, h=FLOOR_H*(i+1)/RUN_STEPS;
      MT.box((RUN.x0+RUN.x1)/2,y+h-FLOOR_H/RUN_STEPS/2,zz,sWid,FLOOR_H/RUN_STEPS+0.02,
             runLen/RUN_STEPS+0.01,0x7e7d78,1.1,0.08);
    }
    for(let i=0;i<=9;i++){ const t=i/9, zz=lerp(3.4,RUN.z1,t), h=FLOOR_H*((zz-RUN.z0)/runLen);
      MT.box(RUN.x1+0.06,y+h+0.55,zz,0.07,1.05,0.07,0x3f4245,2); }
    push(RUN.x1+0.02,3.4,RUN.x1+0.12,RUN.z1);""",
"""    RI.stairs(RIC); RI.burn(168);
    push(RUN.x1+0.02,3.4,RUN.x1+0.12,RUN.z1);""")
rep("""    for(let i=0;i<7;i++) PR.box(RUN.x0+rnd(0.4,2.8),y+0.2,RUN.z0+rnd(0.5,5.5),
      rnd(0.5,1.3),0.4,rnd(0.5,1.3),0x4b4740,1.2);""",
"""    for(let i=0;i<7;i++){ const px=RUN.x0+rnd(0.4,2.8), pz=RUN.z0+rnd(0.5,5.5), sx=rnd(0.5,1.3), sz=rnd(0.5,1.3), q=RIC.rng; RI.burn(6);
      for(let k=0;k<3;k++){ const s=.18+q()*.32;
        RI.put(RIC,'rub'+((i+k)%3),RI.geo['rub'+((i+k)%3)],MX(px+(q()-.5)*sx,y+s*.28,pz+(q()-.5)*sz,q(),q()*6.28,q(),s*1.5,s,s*1.3)); }
      if(i<3) RI.put(RIC,'tileChunk',RI.geo.tileChunk,MX(px,y+.02+i*.02,pz,(q()-.5)*.5,q()*6.28,(q()-.5)*.5)); }""")

# 6. EXIT signs: a lit box with a real legend
rep("""  const sign=new THREE.Mesh(new THREE.PlaneGeometry(0.76,0.25),MAT.sign);
  sign.position.set(SW_DOOR_X,y+2.55,SWR.z0-0.2); sign.rotation.y=Math.PI; F.group.add(sign);""",
"""  const sign=new THREE.Mesh(new THREE.PlaneGeometry(0.76,0.25),MAT.signExit||MAT.sign);
  sign.position.set(SW_DOOR_X,y+2.55,SWR.z0-WALL_T/2-0.073); sign.rotation.y=Math.PI; F.group.add(sign);
  RI.exitSign(RIC,SW_DOOR_X,y+2.55,SWR.z0-WALL_T/2,Math.PI);""")
rep("""    const rs=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.3),MAT.sign);""",
    """    const rs=new THREE.Mesh(new THREE.PlaneGeometry(1.0,0.3),MAT.signExit||MAT.sign);""")

# 7. the lift
rep("""  MT.box(ELEV.x,y+1.3,zc-0.16,2.6,2.7,0.22,0x565b60,1.1,0.05);
  const doorL=new Builder(); doorL.box(0,0,0,0.62,2.3,0.09,0x8d949a,1.4,0.05);
  const doorR=new Builder(); doorR.box(0,0,0,0.62,2.3,0.09,0x8d949a,1.4,0.05);
  const eL=doorL.mesh(MAT.metal), eR=doorR.mesh(MAT.metal);""",
"""  RI.lift(RIC,zc); RI.burn(24);
  const eL=new THREE.Mesh(RI.geo.elevDoor,MAT.prop), eR=new THREE.Mesh(RI.geo.elevDoor,MAT.prop);
  eR.scale.x=-1; eL.castShadow=eR.castShadow=!IS_TOUCH; eL.receiveShadow=eR.receiveShadow=true;""")
rep("""  MT.box(ELEV.x+1.05,y+1.25,zc-0.30,0.18,0.30,0.06,0x2c3033,2);
""", "")

# 8. doors: modelled flush doors / steel stair door
rep("""    const leaf=new Builder();
    leaf.box(w/2,h/2,0,w,h,t,opts.metal?0x7d848a:0xe4e2d8,1.3,0.06);
    leaf.box(w-0.16,h/2-0.06,0.055,0.1,0.05,0.06,0x2b2d30,3);
    const m=leaf.mesh(opts.metal?MAT.metal:MAT.prop);""",
"""    RI.burn(12);
    const m=new THREE.Mesh(opts.metal?RI.geo.doorMetal:RI.geo.doorLeaf,MAT.prop);
    m.castShadow=!IS_TOUCH; m.receiveShadow=true;""")

# 9. addDeco routes the modelled props to per-floor instancing
rep("""  const addDeco=(name,x,z,ry,opts={})=>{
    const g=PROPS[name]; if(!g) return;
    if(decoV>DECO_BUDGET&&opts.trim) return;""",
"""  const addDeco=(name,x,z,ry,opts={})=>{
    const g=PROPS[name]; if(!g) return;
    { const yy0=(opts.y!==undefined?opts.y:0)+y;
      if(RI.hp.has(name)){
        if(name==='35_hospital_signboard') RIC.boards.push({x,yy:yy0,z,ry:ry||0});
        if(decoV>DECO_BUDGET&&opts.trim) return;
        RI.deco(RIC,name,x,yy0,z,ry||0,opts.rx||0,opts.scale||1,opts.tint);
        decoV+=RI.origV[name]||0;
        if(opts.solid){
          const bb=RI.origBB[name]||g.boundingBox, sc0=opts.scale||1, sx2=(bb.max.x-bb.min.x)*sc0, sz2=(bb.max.z-bb.min.z)*sc0;
          const c2=Math.abs(Math.cos(ry||0)), s2=Math.abs(Math.sin(ry||0));
          const w=(sx2*c2+sz2*s2)/2, d=(sx2*s2+sz2*c2)/2;
          if(w>0.35&&d>0.22) push(x-w*0.85,z-d*0.85,x+w*0.85,z+d*0.85);
        }
        return;
      } }
    if(decoV>DECO_BUDGET&&opts.trim) return;""")

# 9b. addProp: collisions from the original footprint
rep("""    if(opts.solid!==false){
      const bb=g.boundingBox, s=opts.scale||1;""",
"""    if(opts.solid!==false){
      const bb=RI.origBB[name]||g.boundingBox, s=opts.scale||1;""")

# 10. Hindi notice boards get frames
rep("""    const k=SIGN_I[name]; if(k===undefined) return;
    const cx=k%SIGN_COLS, cy=(k/SIGN_COLS)|0;""",
"""    const k=SIGN_I[name]; if(k===undefined) return;
    RI.sign(RIC,x,yy,z,nx,nz,w,h);
    const cx=k%SIGN_COLS, cy=(k/SIGN_COLS)|0;""")

# 11. the 352 "extra props": modelled cartons, jars, stools and tray sets (same rng sequence)
rep("""    if(typ===0){ // cartons / file stacks
      PR.box(px,y+0.12,pz,0.34+rng()*0.28,0.20+rng()*0.22,0.28+rng()*0.30,c,1.2);
      if((i+fi)%3===0) PR.box(px,y+0.34,pz,0.28,0.10,0.24,dp[(i+1)%dp.length],1.2);
    } else if(typ===1){ // medicine / oxygen-like bottles
      PR.cyl(px,y+0.17,pz,0.08+rng()*0.045,0.30+rng()*0.16,6,c,1.0);
    } else if(typ===2){ // stools / bedside blocks
      PR.box(px,y+0.22,pz,0.34,0.42,0.34,c,1.0);
      PR.box(px,y+0.45,pz,0.42,0.07,0.42,dp[(i+2)%dp.length],1.0);
    } else { // trays / low equipment cases
      PR.box(px,y+0.07,pz,0.52+rng()*0.24,0.10,0.34+rng()*0.22,c,1.0);
      PR.box(px,y+0.16,pz,0.18,0.11,0.16,dp[(i+1)%dp.length],1.0);
    }""",
"""    const ryx=(i*2.39+fi*1.3)%6.283;
    if(typ===0){ // cartons / file stacks
      const a=rng(),b=rng(),cc=rng(); RI.burn((i+fi)%3===0?12:6);
      RI.put(RIC,a>.5?'boxB':'boxS',a>.5?RI.geo.boxB:RI.geo.boxS,MX(px,y,pz,0,ryx,0,.85+b*.3,.85+cc*.3,.9+b*.2));
      if((i+fi)%3===0) RI.put(RIC,'boxS',RI.geo.boxS,MX(px+.03,y+(a>.5?.34:.26)*(.85+cc*.3),pz,0,ryx+.4,0,.8,.8,.8));
      RI.aoFoot(RIC,px,pz,.45,.35,ryx,.45);
    } else if(typ===1){ // medicine / oxygen-like bottles
      rng(); rng(); RI.burn(6);
      RI.put(RIC,'jars',RI.geo.jars,MX(px,y,pz,0,ryx,0));
    } else if(typ===2){ // stools / bedside blocks
      RI.burn(12);
      RI.put(RIC,'stool',RI.geo.stool,MX(px,y,pz,0,ryx,0));
      RI.aoFoot(RIC,px,pz,.34,.34,0,.3);
    } else { // trays / low equipment cases
      rng(); rng(); RI.burn(12);
      RI.put(RIC,'traySet',RI.geo.traySet,MX(px,y,pz,0,ryx,0));
      RI.aoFoot(RIC,px,pz,.6,.4,ryx,.35);
    }""")

# 12. ruin rubble
rep("""      for(let i=0;i<8;i++) MT.box(rnd(-HX+4,HX-4),y+0.22,rnd(-HZ+4,HZ-4),
        rnd(0.6,1.8),0.44,rnd(0.6,1.8),0x5a5750,1.2);""",
"""      for(let i=0;i<8;i++){ const px=rnd(-HX+4,HX-4), pz=rnd(-HZ+4,HZ-4), sx=rnd(0.6,1.8), sz=rnd(0.6,1.8), q=RIC.rng; RI.burn(6);
        for(let k=0;k<6;k++){ const s=.1+q()*.22;
          RI.put(RIC,'rub'+(k%3),RI.geo['rub'+(k%3)],MX(px+(q()-.5)*sx,y+s*.28,pz+(q()-.5)*sz,q(),q()*6.28,q(),s*1.5,s,s*1.3)); }
        for(let k=0;k<2;k++) RI.put(RIC,'tileChunk',RI.geo.tileChunk,MX(px+(q()-.5)*1.2,y+.02+k*.015,pz+(q()-.5)*1.2,(q()-.5)*.4,q()*6.28,(q()-.5)*.4));
        RI.aoFoot(RIC,px,pz,sx,sz,0,.35); }""")

# 13. basement service pipes
rep("""    for(let i=0;i<26;i++){ const px=rnd(-HX+2,HX-2), pz=rnd(-HZ+2,HZ-2);
      MT.box(px,y+CH-0.35,pz,rnd(3,9),0.18,0.18,0x4a4d4a,1.6); }""",
"""    for(let i=0;i<26;i++){ const px=rnd(-HX+2,HX-2), pz=rnd(-HZ+2,HZ-2);
      RI.pipe(RIC,px,y+CH-0.35-(i%3)*.2,pz,rnd(3,9)); RI.burn(6); }""")

# 14. emergency lamps: light entries carry userData like every other lamp record
rep("""      F.lights.push({L:RL,tube:{visible:false,material:{color:{setScalar(){}}}},
        base:2.2,phase:rnd(0,9),broken:true,x:p[0],z:p[1],forced:null,red:true});""",
"""      F.lights.push({L:RL,tube:{visible:false,material:{color:{setScalar(){}}}},
        base:2.2,phase:rnd(0,9),broken:true,x:p[0],z:p[1],forced:null,red:true,userData:{}});""")

# 15. ceiling lights: modelled louvred fittings, lit or dead
rep("""  spots.forEach(p=>{
    MT.box(p[0],y+CH-0.12,p[1],1.25,0.09,0.24,0xd8d6cf,1.6);
    if(rng()<TH.lit){
      const L=new THREE.PointLight(TH.lamp,0,15,2);
      L.position.set(p[0],y+CH-0.3,p[1]); F.group.add(L);
      const tube=new THREE.Mesh(new THREE.BoxGeometry(1.2,0.06,0.16),
        new THREE.MeshBasicMaterial({color:TH.lamp,toneMapped:false}));
      tube.position.copy(L.position); F.group.add(tube);
      F.lights.push({L,tube,base:rnd(3.6,7.4),phase:rnd(0,9),broken:rng()<TH.broken,x:p[0],z:p[1],forced:null});
    }
  });""",
"""  spots.forEach(p=>{
    RI.burn(6);
    if(rng()<TH.lit){
      const L=new THREE.PointLight(TH.lamp,0,15,2);
      L.position.set(p[0],y+CH-0.3,p[1]); F.group.add(L);
      const tube=RI.fixture(RIC,p[0],p[1],TH.lamp,true);
      F.lights.push({L,tube,base:rnd(3.6,7.4),phase:rnd(0,9),broken:rng()<TH.broken,x:p[0],z:p[1],forced:null,userData:{}});
    } else RI.fixture(RIC,p[0],p[1],TH.lamp,false);
  });""")

# 16. REDO block fittings
rep("""    const blueBench=(x,z,ry=0)=>{
      const BLUE=0x678fb1, STEEL=0x9aa1a3;""",
"""    const blueBench=(x,z,ry=0)=>{
      RI.put(RIC,'bench',RI.geo.bench,MX(x,y,z,0,ry+Math.PI,0)); RI.aoFoot(RIC,x,z,2.0,.55,ry,.5); RI.burn(84); return;
      const BLUE=0x678fb1, STEEL=0x9aa1a3;""")
rep("""    const notice=(x,z,ry=0,w=2.3)=>{
      bLocal(PR,x,z,ry,0,1.75,0,w,1.06,.055,0xede9dc,.8,.01);""",
"""    const notice=(x,z,ry=0,w=2.3)=>{
      { const zf=Math.abs(z)>HZ-.6?Math.sign(z)*(HZ-WALL_T):z;
        RI.put(RIC,w>2.5?'notice28':'notice24',w>2.5?RI.geo.notice28:RI.geo.notice24,MX(x,y+1.75,zf,0,ry,0),null,false);
        RIC.signs.push({x,yy:y+1.75,z:zf,nx:0,nz:0,w:0,h:0,noFrame:true}); RI.burn(12); return; }
      bLocal(PR,x,z,ry,0,1.75,0,w,1.06,.055,0xede9dc,.8,.01);""")
rep("""    const addCurtain=(x,z,ry=0,w=3.0)=>{
      const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry;""",
"""    const addCurtain=(x,z,ry=0,w=3.0)=>{
      RI.curtain(RIC,x,z,ry,w); return;
      const g=new THREE.Group(); g.position.set(x,y,z); g.rotation.y=ry;""")
rep("""    const addFan=(x,z)=>{
      const g=new THREE.Group(); g.position.set(x,y+CH-.34,z);""",
"""    const addFan=(x,z)=>{
      RI.fan(RIC,x,z); return;
      const g=new THREE.Group(); g.position.set(x,y+CH-.34,z);""")
rep("""    for(let x=-21;x<=21;x+=7){
      MT.box(x,y+CH-.11, zb-CORR/2,1.65,.055,.27,0xe3e4df,1.4,.01);
      MT.box(x,y+CH-.11,-(zb-CORR/2),1.65,.055,.27,0xe3e4df,1.4,.01);
    }""",
"""    for(let x=-21;x<=21;x+=7){
      RI.burn(12);
      if(Math.abs(x/10.5-Math.round(x/10.5))<.05) continue;
      RI.fixture(RIC,x, zb-CORR/2,TH.lamp,false);
      RI.fixture(RIC,x,-(zb-CORR/2),TH.lamp,false);
    }""")

# 17. dress, then close the floor
rep("""  const add=(b,m)=>{ if(!b.empty()){ const mm=b.mesh(m); mm.castShadow=!IS_TOUCH; mm.receiveShadow=true; F.group.add(mm); } };
  add(W,MAT.wall); add(FL,TH.floorMode==='tile'?MAT.floorTile:MAT.floor); add(CE,MAT.ceil); add(PR,MAT.prop); add(MT,MAT.metal);""",
"""  RI.dressFloor(RIC);
  const add=(b,m)=>{ if(!b.empty()){ const mm=b.mesh(m); mm.castShadow=!IS_TOUCH; mm.receiveShadow=true; F.group.add(mm); } };
  add(W,MAT.wall); add(FL,TH.floorMode==='tile'?MAT.floorTile:MAT.floor); add(CE,MAT.ceil); add(PR,MAT.prop); add(MT,MAT.metalI||MAT.metal);""")
rep("""    const dm=new THREE.Mesh(dg,MAT.prop); dm.castShadow=!IS_TOUCH; dm.receiveShadow=true;
    F.group.add(dm);
  }
  buildNav(F);""",
"""    const dm=new THREE.Mesh(dg,MAT.prop); dm.castShadow=!IS_TOUCH; dm.receiveShadow=true;
    F.group.add(dm);
  }
  RI.endFloor(RIC);
  buildNav(F);""")

# 18. boot: bake surfaces, rebuild props, finalize
rep("""    initMaterials();
    set(0.08,'IGMC HOSPITAL');""",
"""    initMaterials();
    await RI.prepare((p,t)=>set(0.06+p*0.02,'INTERIOR · '+t));
    set(0.08,'IGMC HOSPITAL');""")
rep("""    set(0.56,'NAINA');""",
"""    set(0.5,'HIGH-POLY PROPS');
    await new Promise(r=>setTimeout(r,0));
    RI.buildProps();
    set(0.56,'NAINA');""")
rep("""      set(0.64+0.34*((f+1)/(TOP+1)),(f===0?'BASEMENT':'FLOOR '+f));
      await new Promise(r=>setTimeout(r,0));
    }""",
"""      set(0.64+0.34*((f+1)/(TOP+1)),(f===0?'BASEMENT':'FLOOR '+f));
      await new Promise(r=>setTimeout(r,0));
    }
    RI.finalize();""")

# 19. per-frame
rep("""    updateHUD(dt);
    LightBudget.update(dt);
    Quality.adapt(dt);""",
"""    updateHUD(dt);
    LightBudget.update(dt);
    try{ RI.update(dt); }catch(e){ if(!RI._err){ RI._err=1; console.warn('RI update',e); } }
    Quality.adapt(dt);""")

# 20. expose for debugging
rep("""window.IGMC={P,State,Story,Ghost,Torch,Int,Ext,A,Music,Scream,Pandit,ITEMS,MISSIONS,MAT,camera,renderer,scene,key,head,""",
    """window.IGMC={P,State,Story,Ghost,Torch,Int,Ext,A,Music,Scream,Pandit,ITEMS,MISSIONS,MAT,camera,renderer,scene,key,head,RI,RIU,""")

open(OUT, 'w', encoding='utf-8').write(s)
print('patched OK', len(s))
