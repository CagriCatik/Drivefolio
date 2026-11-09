import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {createLapTimer,distanceToCircuit} from './race-layout.js';
import {trackPoints,offsetLoop,joinedStrip,joinedBand,isInnerAccess,ROAD_Y} from './road-network.js';
import {asphaltMaterial,worldUV} from './surface-materials.js';
import {switchFixtures} from './fixture-lighting.js';
import {createPaceCar} from './pace-car.js';

function meshFromData(scene,data,materials){
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(data.positions,3));
  if(data.groups&&Array.isArray(materials)){
    const sorted=[];
    for(let color=0;color<materials.length;color++){
      const start=sorted.length;for(const group of data.groups)if(group.materialIndex===color)sorted.push(...data.indices.slice(group.start,group.start+group.count));
      geometry.addGroup(start,sorted.length-start,color);
    }geometry.setIndex(sorted);
  }else geometry.setIndex(data.indices);
  geometry.computeVertexNormals();
  if(materials===asphaltMaterial())worldUV(geometry);
  const mesh=new THREE.Mesh(geometry,materials);mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
export function createRaceTrack(scene,vehicle){
  const points=trackPoints(),n=points.length;
  meshFromData(scene,joinedStrip(points,-3.8,3.8,ROAD_Y),asphaltMaterial());
  const curbMaterials=['#d95c62','#e9f2f3'].map(color=>new THREE.MeshStandardMaterial({color,roughness:0.9,side:THREE.DoubleSide}));
  meshFromData(scene,joinedBand(points,-4.5,-3.8,ROAD_Y,0.18),curbMaterials);
  meshFromData(scene,joinedBand(points,3.8,4.5,ROAD_Y,0.18,p=>!isInnerAccess(p)),curbMaterials);
  const barrier=new THREE.MeshStandardMaterial({color:'#88a1ad',metalness:0.5,roughness:0.5,side:THREE.DoubleSide});
  const postPositions=[];
  for(const [offset,enabled] of [[-5.4,()=>true],[5.4,p=>!isInnerAccess(p)]]){
    // Each rail is one joined extrusion. Posts, physical segments and rail
    // vertices all derive from the very same offset polyline.
    for(const [bottom,top] of [[0.42,0.61],[0.82,1.01]])meshFromData(scene,joinedBand(points,offset-0.08,offset+0.08,bottom,top,enabled),barrier);
    const rail=offsetLoop(points,offset);let sincePost=100;
    for(let i=0;i<n;i++){
      const p=rail[i],q=rail[(i+1)%n],a=points[i],b=points[(i+1)%n],length=Math.hypot(q.x-p.x,q.z-p.z),mid={x:(a.x+b.x)/2,z:(a.z+b.z)/2};
      sincePost+=length;if(!enabled(mid))continue;
      if(sincePost>3.5){postPositions.push(p);sincePost=0;}
      vehicle.addBarrier((p.x+q.x)/2,(p.z+q.z)/2,length/2+0.005,0.10,Math.atan2(-(q.z-p.z),q.x-p.x));
    }
  }
  const posts=new THREE.InstancedMesh(new THREE.BoxGeometry(0.13,1.05,0.13),barrier,postPositions.length),postDummy=new THREE.Object3D();
  postPositions.forEach((p,i)=>{postDummy.position.set(p.x,0.525,p.z);postDummy.updateMatrix();posts.setMatrixAt(i,postDummy.matrix);});posts.castShadow=true;scene.add(posts);
  for(let i=0;i<n;i+=10){
    const p=points[i],q=points[(i+1)%n];const marker=block(scene,0.9,0.01,0.10,p.x,0.095,p.z,mat('#acc3cc'));marker.rotation.y=Math.atan2(-(q.z-p.z),q.x-p.x);
  }
  // Start/finish, grid boxes and an overhead timing gantry on the south straight.
  for(let row=0;row<8;row++)for(let col=0;col<2;col++)block(scene,0.55,0.015,0.95,-12.55+col*0.55,0.105,27.7+row*0.95,mat((row+col)%2?'#eff5f6':'#24343d'));
  for(const z of [25.95,36.05])block(scene,0.18,4.0,0.18,-12,2,z,barrier);
  block(scene,0.32,0.55,10.5,-12,4.1,31,mat('#284557'));
  const gantry=label(scene,'CAMPUS CIRCUIT',-11.8,4.1,31,7,'#d9fff3');gantry.rotation.y=Math.PI/2;
  for(let i=0;i<5;i++){const light=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),new THREE.MeshStandardMaterial({color:'#72e8b4',emissive:'#2bc998',emissiveIntensity:1}));light.position.set(-12,3.65,29.4+i*0.8);scene.add(light);}
  for(let i=0;i<6;i++){
    const x=-5+i*3;
    for(const z of [29,33]){block(scene,1.4,0.015,0.09,x,0.10,z,mat('#b6cdd4'));block(scene,0.09,0.015,1.1,x-0.7,0.10,z+0.5,mat('#b6cdd4'));}
  }
  // Grandstand outside the east straight, tire walls and marshal cabins.
  for(let row=0;row<3;row++){
    block(scene,1.1,0.5+row*0.45,12,50+row*1.05,(0.5+row*0.45)/2,-21,mat('#92aab6'));
    for(let j=0;j<8;j++)block(scene,0.65,0.2,0.65,50+row*1.05,0.65+row*0.45,-26+j*1.5,mat(j%2?'#377b91':'#d4e4e8'));
  }
  for(const [x,z] of [[-51,-43],[51,13]]){
    block(scene,2.2,1.8,2.4,x,0.9,z,mat('#d7e5e9'));block(scene,2.5,0.16,2.7,x,1.88,z,mat('#31596c'));block(scene,1.8,0.55,0.05,x,1.3,z+1.23,mat('#4e92ac'));vehicle.addObstacle(x,z,1.1,1.2);
  }
  const rubber=mat('#273740');
  for(const [cx,cz] of [[-22,-70],[16,-70],[-25,39],[17,39]])for(let i=0;i<5;i++){
    const tire=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.14,6,12),rubber);tire.rotation.x=Math.PI/2;tire.position.set(cx+i*0.6,0.24,cz);scene.add(tire);
  }
  const nightLights=[],fixtureMaterial=new THREE.MeshStandardMaterial({color:'#d8e6e7',emissive:'#ffedc7',emissiveIntensity:0,roughness:0.3});
  const lampLine=offsetLoop(points,-7.3);let lampDistance=100;
  for(let i=0;i<points.length;i++){
    const p=points[i],q=points[(i+1)%points.length];lampDistance+=Math.hypot(q.x-p.x,q.z-p.z);
    if(lampDistance<38||p.x>40&&p.z>-30&&p.z<-12)continue;lampDistance=0;
    const foot=lampLine[i],dx=p.x-foot.x,dz=p.z-foot.z,len=Math.hypot(dx,dz),nx=dx/len,nz=dz/len;
    block(scene,0.16,6,0.16,foot.x,3,foot.z,barrier);
    const arm=block(scene,4.8,0.13,0.4,foot.x+nx*2.4,6,foot.z+nz*2.4,barrier);arm.rotation.y=Math.atan2(-nz,nx);
    const lens=block(scene,1.0,0.12,0.6,foot.x+nx*4.25,5.88,foot.z+nz*4.25,fixtureMaterial);lens.rotation.y=arm.rotation.y;
    const light=new THREE.PointLight('#fff0d8',0,34,1.6);light.position.set(foot.x+nx*4.2,5.7,foot.z+nz*4.2);scene.add(light);nightLights.push(light);
  }
  const pace=createPaceCar(scene,vehicle,points);
  const timer=createLapTimer(),hud=document.getElementById('race-hud'),format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toFixed(1).padStart(4,'0')}`;
  return {get trafficPose(){return pace.pose;},setNight(value){switchFixtures(nightLights,[fixtureMaterial],value,72);},reset:timer.reset,update(dt,paused){
    pace.update(dt,paused);
    const state=timer.update(paused?0:dt,vehicle.group.position,paused?0:vehicle.speed);
    hud.hidden=distanceToCircuit(vehicle.group.position,points)>13&&!state.running;
    document.getElementById('race-time').textContent=state.running?format(state.elapsed):'START / ZIEL';
    document.getElementById('race-best').textContent=state.best===null?'Rundkurs · Campus-Zufahrten bei den Querstraßen':`Bestzeit ${format(state.best)} · ${state.laps} Runden`;
  }};
}
