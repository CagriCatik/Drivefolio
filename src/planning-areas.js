import {createNeonBoard} from './neon-board.js';
import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';

function path(parent,points,color,opacity=1){
  const geometry=new THREE.BufferGeometry().setFromPoints(points);
  const mesh=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:true,opacity}));parent.add(mesh);return mesh;
}
function car(parent,color){
  const group=new THREE.Group();parent.add(group);
  block(group,0.5,0.2,0.95,0,0.25,0,mat(color));block(group,0.38,0.18,0.4,0,0.44,-0.08,mat('#435654'));
  for(const x of [-0.29,0.29])for(const z of [-0.3,0.3])block(group,0.13,0.25,0.25,x,0.18,z,mat('#36393c'));
  return group;
}
function field(scene,vehicle,x,title,subtitle,color){
  const group=new THREE.Group();group.name=x<0?'station-frenet':'station-fmt';group.position.set(x,0,-49);scene.add(group);
  block(group,14,0.08,12,0,0.02,0,mat(color));
  block(group,14,2.5,0.25,0,1.25,-6,mat('#344e60'));
  createNeonBoard(group,{title,subtitle,y:1.45,z:-5.78});
  label(group,'E  /  DEMO STARTEN',0,0.12,8,6,'#365a6b').rotation.x=-Math.PI/2;
  vehicle.addObstacle(x,-55,7,0.15);
  return group;
}
function follow(mesh,curve,t){
  const p=curve.getPointAt(t),direction=curve.getTangentAt(Math.min(t,0.9999));mesh.position.copy(p);mesh.rotation.y=Math.atan2(direction.x,direction.z);
}

function createFrenet(scene,vehicle){
  const group=field(scene,vehicle,-16,'FRENET TRAJECTORY PLANNER','REFERENZ  /  KANDIDATEN  /  AUSWAHL','#c8d4d7');
  block(group,11.6,0.03,7.7,0,0.09,0,mat('#6d6b70'));
  const candidates=[];
  for(let lane=-2;lane<=2;lane++){
    const points=[];
    for(let i=0;i<=90;i++){
      const t=i/90,x=-5+t*10,bend=Math.sin(t*Math.PI)*0.35;
      const z=bend+lane*Math.sin(t*Math.PI)**2*1.25;points.push(new THREE.Vector3(x,0.15,z));
    }
    const chosen=lane===-2;
    candidates.push({mesh:path(group,points,chosen?'#b8f5ce':lane===0?'#f2ab91':'#e5c789',chosen?1:0.45),lane});
  }
  for(const z of [-3.1,3.1])path(group,[new THREE.Vector3(-5.7,0.14,z),new THREE.Vector3(5.7,0.14,z)],'#e8dcc9',0.75);
  for(let i=0;i<9;i++)block(group,0.55,0.02,0.08,-5+i*1.2,0.15,0,mat('#ded6c7'));
  const obstacle=car(group,'#a87572');obstacle.position.set(0.6,0.02,0.3);obstacle.rotation.y=Math.PI/2;
  vehicle.addObstacle(-15.4,-48.7,0.55,0.35);
  const trajectory=new THREE.CatmullRomCurve3(Array.from({length:70},(_,i)=>{
    const t=i/69;return new THREE.Vector3(-5+10*t,0.2,Math.sin(t*Math.PI)*0.35-2.5*Math.sin(t*Math.PI)**2);
  }));
  const ego=car(group,'#a9d6b4');
  const origin=new THREE.Vector3(-4.6,0.25,2.1);
  path(group,[origin,new THREE.Vector3(-2.7,0.25,2.1)],'#f0dba5');path(group,[origin,new THREE.Vector3(-4.6,0.25,3.3)],'#b1e8d7');
  label(group,'s →',-3.5,0.2,2.8,1.3,'#fff0c6').rotation.x=-Math.PI/2;
  label(group,'d ↑',-5.1,0.2,3.1,1.2,'#b9f3de').rotation.x=-Math.PI/2;
  label(group,'KANDIDATEN  /  GEWÄHLTE BAHN',0,0.15,5,11,'#5f4e49').rotation.x=-Math.PI/2;
  let stage=-1,progress=null;
  return {setDemo(next,p){stage=next;progress=next<0?null:p;},update(time){
    const t=progress===null?(time*0.075)%1:Math.max(0,Math.min(1,(progress-0.55)/0.45));follow(ego,trajectory,t);
    candidates.forEach(({mesh,lane})=>{mesh.visible=stage!==0||lane===0;mesh.material.opacity=lane===-2?0.9+Math.sin(time*3)*0.1:stage>=2?0.18:0.5;});
  }};
}

function createFMT(scene,vehicle){
  const group=field(scene,vehicle,16,'FMT-MPC','SUCHBAUM  /  KORRIDOR  /  VORSCHAU','#bdcfc9');
  block(group,11.5,0.025,8.2,0,0.1,0,mat('#778d83'));
  const obstacles=[[-1.5,-2.5,1.8,1.3],[0,1.4,1.6,2.3],[3.3,-0.2,1.3,1.8]];
  for(const [x,z,w,d] of obstacles){
    block(group,w+0.6,0.03,d+0.6,x,0.14,z,mat('#c8b37e'));
    block(group,w,0.85,d,x,0.56,z,mat('#697575'));vehicle.addObstacle(16+x,-49+z,w/2,d/2);
  }
  const points=[new THREE.Vector3(-4.9,0.2,3.3)];
  let seed=19;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
  const edges=[];
  const blocked=(x,z)=>obstacles.some(([ox,oz,w,d])=>Math.abs(x-ox)<w/2+0.35&&Math.abs(z-oz)<d/2+0.35);
  for(let i=0;i<130;i++){
    const p=new THREE.Vector3((random()-0.5)*10,0.2,(random()-0.5)*7);
    if(blocked(p.x,p.z))continue;
    const neighbours=points.map(q=>({q,d:q.distanceTo(p)})).sort((a,b)=>a.d-b.d);
    const nearest=neighbours.find(({q})=>Array.from({length:16},(_,j)=>q.clone().lerp(p,j/15)).every(v=>!blocked(v.x,v.z)));
    if(!nearest)continue;
    points.push(p);edges.push(path(group,[nearest.q,p],'#bfdfc6',0.3));
  }
  const curve=new THREE.CatmullRomCurve3([[-4.9,3.3],[-3.4,0.5],[-1.8,-0.8],[0.2,-1.6],[2.2,-2.3],[4.5,-3.3]].map(([x,z])=>new THREE.Vector3(x,0.24,z)));
  const corridor=path(group,curve.getPoints(100),'#ffe8a6');
  const ego=car(group,'#e9b875');
  const horizonPoints=new Float32Array(18*3),geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(horizonPoints,3));
  const horizon=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:'#a1fff1'}));horizon.frustumCulled=false;group.add(horizon);
  for(const [x,z,text] of [[-4.9,3.3,'START'],[4.5,-3.3,'ZIEL']]){
    const beacon=new THREE.Mesh(new THREE.CylinderGeometry(0.2,0.3,0.45,10),mat('#f6d78c'));beacon.position.set(x,0.3,z);group.add(beacon);
    label(group,text,x,0.16,z+0.55,1.5,'#f7ebc9').rotation.x=-Math.PI/2;
  }
  label(group,'BAUM  /  KORRIDOR  /  MPC-HORIZONT',0,0.15,5,12,'#435b52').rotation.x=-Math.PI/2;
  let stage=-1,progress=null;
  return {setDemo(next,p){stage=next;progress=next<0?null:p;},update(time){
    const phase=progress===null?(time*0.05)%1:progress;
    const growth=Math.min(1,phase/0.5);edges.forEach((edge,i)=>edge.visible=i<growth*edges.length);
    corridor.visible=stage<0||stage>=2;
    const t=progress===null?(time*0.06)%1:Math.max(0,Math.min(1,(progress-0.6)/0.4));follow(ego,curve,t);
    for(let i=0;i<18;i++){const point=curve.getPointAt(Math.min(1,t+i*0.008));horizonPoints.set([point.x,0.33,point.z],i*3);}
    geometry.attributes.position.needsUpdate=true;horizon.visible=stage<0||stage>=3;
  }};
}

export function createPlanningAreas(scene,vehicle){
  const areas={frenet:createFrenet(scene,vehicle),fmt:createFMT(scene,vehicle)};
  return {setDemo(id,stage,progress){Object.entries(areas).forEach(([key,area])=>area.setDemo(key===id?stage:-1,progress));},update(time){Object.values(areas).forEach(area=>area.update(time));}};
}
