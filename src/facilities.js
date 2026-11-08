import * as THREE from 'three';

import {mat,block,label} from './scene-primitives.js';
import {createProjectAreas} from './project-areas.js';
import {createExhibitions} from './exhibition-areas.js';

function createGarage(scene,vehicle){
  const group=new THREE.Group();group.position.set(-17,0,14);scene.add(group);
  const wall=mat('#806988'),frame=mat('#4c424e'),floor=mat('#b2a4a1');
  block(group,10,0.08,9,0,0.03,0,floor);
  block(group,0.4,3.5,9,-5,1.75,0,wall);block(group,0.4,3.5,9,5,1.75,0,wall);
  block(group,10,3.5,0.4,0,1.75,-4.5,wall);block(group,10.6,0.35,9.6,0,3.7,0,frame);
  block(group,10,0.65,0.4,0,3.35,4.5,wall);
  const door=block(group,9.3,2.9,0.14,0,1.5,4.5,mat('#c7b9ae'));
  for(let i=0;i<6;i++)block(door,9.3,0.035,0.02,0,-1.25+i*0.45,0.08,frame);
  label(group,'GARAGE',0,3.4,4.73,5.1);
  const welcome=label(group,'E  /  FAHRZEUG WECHSELN',0,0.18,6.2,6.3);welcome.rotation.x=-Math.PI/2;
  const glow=new THREE.MeshStandardMaterial({color:'#b9e0cb',emissive:'#85d7b2',emissiveIntensity:1.8});
  block(group,8.8,0.04,0.15,0,0.09,3.8,glow);
  vehicle.addObstacle(-22,14,0.2,4.5);vehicle.addObstacle(-12,14,0.2,4.5);vehicle.addObstacle(-17,9.5,5,0.2);
  return {update(dt){const p=vehicle.group.position,near=Math.hypot(p.x+17,p.z-18)<10;
    door.position.y=THREE.MathUtils.lerp(door.position.y,near?3:1.5,1-Math.exp(-3*dt));
    door.scale.y=THREE.MathUtils.lerp(door.scale.y,near?0.06:1,1-Math.exp(-3*dt));}};
}

function createRamp(scene,vehicle){
  const x=15,z=14,width=5,length=6,height=1.8;
  const vertices=new Float32Array([-2.5,0,3,2.5,0,3,-2.5,0,-3,2.5,0,-3,-2.5,1.8,-3,2.5,1.8,-3]);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.BufferAttribute(vertices,3));
  geometry.setIndex([0,1,5,0,5,4,0,4,2,1,3,5,2,4,5,2,5,3,0,2,3,0,3,1]);geometry.computeVertexNormals();
  const ramp=new THREE.Mesh(geometry,mat('#b786a0'));ramp.position.set(x,0,z);ramp.castShadow=true;ramp.receiveShadow=true;scene.add(ramp);
  const lines=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-2.3,0.025,3),new THREE.Vector3(-2.3,1.825,-3),new THREE.Vector3(2.3,0.025,3),new THREE.Vector3(2.3,1.825,-3)]);
  const rails=new THREE.LineSegments(lines,new THREE.LineBasicMaterial({color:'#fae3a2'}));rails.position.copy(ramp.position);scene.add(rails);
  const text=label(scene,'BOOST  ↑  JUMP',x,0.12,z+5,5.4,'#624755');text.rotation.x=-Math.PI/2;
  for(let i=0;i<3;i++){
    const stripe=block(scene,3,0.035,0.16,x,0.3+i*0.45+0.03,z+2-i*1.5,mat('#ead49d'));
    stripe.rotation.x=Math.atan(height/length);
  }
  vehicle.addRamp(x,z,width,length,height);
}

function createRoboticsLab(scene,vehicle){
  const x=-15,z=-4,group=new THREE.Group();group.position.set(x,0,z);scene.add(group);
  const dark=mat('#3d5350'),floor=mat('#8ba59a'),walls=mat('#c7cabb');
  block(group,12,0.08,12,0,0.02,0,floor);
  block(group,12,2.5,0.25,0,1.25,-6,dark);
  block(group,0.25,1.3,10,-6,0.65,-1,walls);block(group,0.25,1.3,10,6,0.65,-1,walls);
  label(group,'JETRACER LAB',0,1.65,-5.83,8.4);
  label(group,'ROS 2  /  RC WORKSHOP',0,0.8,-5.8,6.3,'#9de4d0');
  const entrance=label(group,'E  /  PROJEKT ENTDECKEN',0,0.1,6.5,7,'#405d51');entrance.rotation.x=-Math.PI/2;
  vehicle.addObstacle(x,z-6,6,0.15);vehicle.addObstacle(x-6,z-1,0.15,5);vehicle.addObstacle(x+6,z-1,0.15,5);
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
  block(group,5,0.18,1.4,0,0.95,-4.1,mat('#ac805e'));
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
  return {update(time){
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
  const garage=createGarage(scene,vehicle),lab=createRoboticsLab(scene,vehicle),areas=createProjectAreas(scene,vehicle),exhibitions=createExhibitions(scene,vehicle);createRamp(scene,vehicle);
  return {setDemo:exhibitions.setDemo,update(time,dt){garage.update(dt);lab.update(time);areas.update(time);exhibitions.update(time);}};
}
