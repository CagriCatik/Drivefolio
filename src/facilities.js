import {createNeonBoard} from './neon-board.js';
import {environmentMaterial,contactShadow} from './environment-materials.js';
import * as THREE from 'three';

import {garageSite} from './service-layout.js';
import {mat,block,label} from './scene-primitives.js';
import {createWorkshopDetails} from './workshop-details.js';
import {createFuelStation} from './fuel-station.js';
import {createProjectAreas} from './project-areas.js';
import {createExhibitions} from './exhibition-areas.js';
import {createPlanningAreas} from './planning-areas.js';

function createGarage(scene,vehicle){
  const group=new THREE.Group();group.position.set(garageSite.x,0,garageSite.z);group.rotation.y=garageSite.rotation;scene.add(group);
  const wall=environmentMaterial('#d5e3e6'),frame=environmentMaterial('#354c5c'),floor=environmentMaterial('#bdcdd0');
  contactShadow(scene,11.4,10.1,garageSite.x,garageSite.z,0.06,0.28);
  block(group,10,0.08,9,0,0.03,0,floor);
  const covers=[block(group,0.4,3.5,9,-5,1.75,0,wall),block(group,0.4,3.5,9,5,1.75,0,wall),block(group,10,3.5,0.4,0,1.75,-4.5,wall)];
  const roofGlass=new THREE.MeshStandardMaterial({color:'#b4d1cb',transparent:true,opacity:0.13,depthWrite:false,roughness:0.3});
  const roof=block(group,10.6,0.08,9.6,0,3.7,0,roofGlass);roof.castShadow=false;
  for(const x of [-5.2,5.2])block(group,0.16,0.28,9.6,x,3.7,0,frame);
  for(const z of [-4.7,4.7])block(group,10.6,0.28,0.16,0,3.7,z,frame);
  block(group,10,0.65,0.4,0,3.35,4.5,wall);
  // Solar roof, facade fins and a glazed service window.
  for(let i=0;i<5;i++){
    const panel=block(group,1.65,0.08,2.4,-3.7+i*1.85,3.84,-3.2,environmentMaterial('#274e6a'));
    covers.push(panel);
    for(let j=0;j<5;j++)block(panel,1.55,0.012,0.025,0,0.05,-1+j*0.5,environmentMaterial('#7597ac'));
  }
  for(let i=0;i<7;i++)block(group,0.08,2.6,0.08,5.25,1.6,-3.5+i,frame);
  block(group,0.04,1.3,2.8,5.23,1.8,-0.4,new THREE.MeshStandardMaterial({color:'#80b4c5',metalness:0.3,roughness:0.2}));
  const door=block(group,9.3,2.9,0.14,0,1.5,4.5,environmentMaterial('#a9c2c8'));
  for(let i=0;i<6;i++)block(door,9.3,0.035,0.02,0,-1.25+i*0.45,0.08,frame);
  covers.push(door);
  createNeonBoard(group,{title:'GARAGE',x:0,y:3.38,z:4.76,width:5.5,height:0.6});
  const welcome=label(group,'E  /  FAHRZEUG WÄHLEN',0,0.18,6.2,6.3);welcome.rotation.x=-Math.PI/2;
  const glow=new THREE.MeshStandardMaterial({color:'#b9e0cb',emissive:'#85d7b2',emissiveIntensity:0});
  block(group,8.8,0.04,0.15,0,0.09,3.8,glow);
  vehicle.addObstacle(garageSite.x-5,garageSite.z,0.2,4.5);vehicle.addObstacle(garageSite.x+5,garageSite.z,0.2,4.5);vehicle.addObstacle(garageSite.x,garageSite.z+4.5,5,0.2);
  return {group,setShowroom(value){covers.forEach(n=>n.visible=!value);},setNight(value){glow.emissiveIntensity=value?0.9:0;},update(dt){const p=vehicle.group.position,near=Math.hypot(p.x-garageSite.entrance.x,p.z-garageSite.entrance.z)<7;
    door.position.y=THREE.MathUtils.lerp(door.position.y,near?3.1:1.5,1-Math.exp(-3*dt));
    door.scale.y=THREE.MathUtils.lerp(door.scale.y,near?0.06:1,1-Math.exp(-3*dt));}};
}

function createRoboticsLab(scene,vehicle){
  const x=-15,z=-4,group=new THREE.Group();group.name='station-jetracer';group.position.set(x,0,z);scene.add(group);
  const dark=mat('#304d5e'),floor=mat('#c4d9d7'),walls=mat('#e4edeb');
  block(group,12,0.08,11.6,0,0.02,-0.2,floor);
  block(group,12,2.5,0.25,0,1.25,-6,dark);
  block(group,0.25,1.3,10,-6,0.65,-1,walls);block(group,0.25,1.3,10,6,0.65,-1,walls);
  createNeonBoard(group,{title:'JETRACER LAB',subtitle:'ROS 2  /  RC WORKSHOP',y:1.45,z:-5.78,width:11.4,height:1.9});
  const entrance=label(group,'E  /  ROBOTER AUSPROBIEREN',0,0.1,6.5,7,'#345867');entrance.rotation.x=-Math.PI/2;
  vehicle.addObstacle(x,z-6,6,0.15);vehicle.addObstacle(x-6,z-1,0.15,5);vehicle.addObstacle(x+6,z-1,0.15,5);
  const labStrip=new THREE.MeshStandardMaterial({color:'#d8ffff',emissive:'#a9ece9',emissiveIntensity:0});
  const workshop=createWorkshopDetails(group,vehicle,labStrip);
  // Open workshop architecture: a rear canopy leaves the RC demo visible.
  block(group,12.5,0.22,3.5,0,3.6,-4.4,dark);
  for(const sx of [-5.7,5.7]){
    block(group,0.18,3.5,0.18,sx,1.75,-2.7,dark);
    block(group,0.12,0.08,3.0,sx,3.43,-4.3,labStrip);
  }
  // A miniature lift, service cart and pegboard tools beside the bench.
  for(const sx of [-4.8,-3.0]){
    block(group,0.18,2.0,0.22,sx,1.0,-3.4,mat('#538da3'));
    block(group,0.18,0.12,1.7,sx,0.65,-3.0,mat('#538da3'));
  }
  block(group,1.4,0.12,1.6,-3.9,0.74,-3.0,dark);
  block(group,1.0,0.8,0.6,4.2,0.55,-4.2,mat('#417c92'));
  for(let i=0;i<3;i++)block(group,0.8,0.035,0.03,4.2,0.35+i*0.22,-3.88,mat('#cfdee0'));
  for(let i=0;i<5;i++)block(group,0.08,0.4,0.09,2.8+i*0.3,1.7,-5.6,dark);
  vehicle.addObstacle(x-3.9,z-3.3,1.0,0.8);
  vehicle.addObstacle(x+4.2,z-4.2,0.5,0.3);
  const blockers=[];
  for(const [ox,oz,w,d] of [[-4,-1,1.2,1.2],[3,-3,1.6,1],[4,2,0.7,1.5]]){
    blockers.push(block(group,w,1.0,d,ox,0.5,oz,walls));vehicle.addObstacle(x+ox,z+oz,w/2,d/2);
  }
  blockers.push(...group.children.filter(n=>n.isMesh&&n.geometry.type==='BoxGeometry'&&n.position.y>0.6));
  const robot=new THREE.Group();group.add(robot);
  block(robot,0.85,0.22,1.3,0,0.32,0,mat('#e8b368'));
  block(robot,0.55,0.18,0.55,0,0.52,-0.1,dark);
  for(const rx of [-0.48,0.48])for(const rz of [-0.42,0.42])block(robot,0.23,0.38,0.38,rx,0.22,rz,mat('#343941'));
  block(robot,0.23,0.27,0.13,0,0.72,0.35,dark);
  block(robot,0.12,0.10,0.05,0,0.75,0.43,mat('#a3e9dc'));
  // An RC workbench, Jetson board and charging equipment behind the demo loop.
  block(group,5,0.18,1.4,0,0.95,-4.1,mat('#a8b6ba'));
  for(const bx of [-2,2])block(group,0.18,0.9,1.1,bx,0.45,-4.1,dark);
  block(group,1.3,0.09,0.8,-1.1,1.09,-4.1,mat('#46937c'));
  block(group,0.45,0.2,0.4,-1.1,1.24,-4.1,dark);
  for(let i=0;i<5;i++)block(group,0.05,0.24,0.4,-1.3+i*0.1,1.3,-4.1,mat('#9dafa7'));
  block(group,1.4,0.85,0.12,1.2,1.5,-4.55,dark);
  label(group,'ROS 2',1.2,1.5,-4.46,1.2,'#a4efda');
  vehicle.addObstacle(x,z-4.1,2.5,0.7);
  block(robot,0.35,0.12,0.3,0,0.49,0,dark);
  const scanner=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.18,12),new THREE.MeshStandardMaterial({color:'#8cebd2',emissive:'#62cdbb',emissiveIntensity:1}));scanner.position.y=0.62;robot.add(scanner);
  const count=48,scanPositions=new Float32Array(count*6),points=new Float32Array(count*3);
  const scanGeometry=new THREE.BufferGeometry();scanGeometry.setAttribute('position',new THREE.BufferAttribute(scanPositions,3));
  const rays=new THREE.LineSegments(scanGeometry,new THREE.LineBasicMaterial({color:'#79ffdf',transparent:true,opacity:0.27}));rays.frustumCulled=false;scene.add(rays);
  const dotsGeometry=new THREE.BufferGeometry();dotsGeometry.setAttribute('position',new THREE.BufferAttribute(points,3));
  const dots=new THREE.Points(dotsGeometry,new THREE.PointsMaterial({color:'#c6fff0',size:0.09}));dots.frustumCulled=false;scene.add(dots);
  const raycaster=new THREE.Raycaster(),origin=new THREE.Vector3(),direction=new THREE.Vector3();let lastScan=-1;
  return {setNight(value){workshop.setNight(value);},update(time){
    rays.visible=dots.visible=group.visible;
    if(!group.visible)return;
    workshop.update(time);
    robot.position.set(Math.cos(time*0.32)*1.8,0,Math.sin(time*0.32)*1.8);robot.rotation.y=-time*0.32;
    scanner.rotation.y=time*4;
    if(time-lastScan<0.1)return;lastScan=time;
    scene.updateMatrixWorld(true);robot.getWorldPosition(origin);origin.y=0.64;
    for(let i=0;i<count;i++){
      const a=i/count*Math.PI*2+time*0.25;direction.set(Math.sin(a),0,Math.cos(a));raycaster.set(origin,direction);raycaster.far=5;
      const hit=raycaster.intersectObjects(blockers,false)[0];const distance=hit?.distance??5;
      const end=origin.clone().addScaledVector(direction,distance);
      scanPositions.set([origin.x,origin.y,origin.z,end.x,end.y,end.z],i*6);points.set([end.x,end.y,end.z],i*3);
    }
    scanGeometry.attributes.position.needsUpdate=true;dotsGeometry.attributes.position.needsUpdate=true;
  }};
}

export function createFacilities(scene,vehicle){
  const garage=createGarage(scene,vehicle),lab=createRoboticsLab(scene,vehicle),areas=createProjectAreas(scene,vehicle),exhibitions=createExhibitions(scene,vehicle),planning=createPlanningAreas(scene,vehicle);const station=createFuelStation(scene,vehicle);
  return {station,garage,setNight(value){garage.setNight(value);lab.setNight(value);exhibitions.setNight(value);},setDemo(id,stage,progress){exhibitions.setDemo(id,stage,progress);planning.setDemo(id,stage,progress);},update(time,dt,paused){station.update(paused);garage.update(dt);lab.update(time);areas.update(time);exhibitions.update(time);planning.update(time);}};
}
