import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';

export function createCampusDetails(scene,vehicle){
  const concrete=mat('#cbdade'),steel=mat('#436374'),dark=mat('#274554'),wood=mat('#aa9376'),doors=[];
  // A single service apron connects the three garages, pit lane and campus spur.
  block(scene,6.3,0.04,29,30,0.01,-24,concrete);
  for(const [index,z] of [-32,-25,-18].entries()){
    const group=new THREE.Group();group.position.set(29.8,0,z);scene.add(group);
    block(group,0.15,2.7,5,-1.5,1.35,0,mat('#d6e3e8'));
    for(const side of [-2.5,2.5])block(group,3,2.7,0.15,0,1.35,side,mat('#d6e3e8'));
    block(group,0.15,0.5,5,1.5,2.45,0,mat('#d6e3e8'));
    const pitGlass=new THREE.MeshStandardMaterial({color:'#a1c4cc',transparent:true,opacity:0.17,depthWrite:false,roughness:0.25});
    const roof=block(group,3.4,0.06,5.4,0,2.8,0,pitGlass);roof.castShadow=false;
    for(const x of [-1.65,1.65])block(group,0.10,0.18,5.4,x,2.8,0,dark);
    for(const z of [-2.65,2.65])block(group,3.4,0.18,0.10,0,2.8,z,dark);
    const shutter=block(group,0.06,2.0,3.6,1.55,1.05,0,mat('#7c9da9'));
    for(let i=0;i<6;i++)block(shutter,0.02,0.025,3.55,0.04,-0.8+i*0.3,0,dark);
    doors.push({mesh:shutter,x:31.3,z});
    const text=label(group,`PIT 0${index+1}`,1.61,2.42,0,3.3,'#d9ffff');text.rotation.y=Math.PI/2;
    for(let i=0;i<3;i++)block(group,0.65,0.06,3.7,-0.9+i*0.8,2.94,0,mat('#37657f'));
    vehicle.addObstacle(28.3,z,0.08,2.5);
    for(const side of [-2.5,2.5])vehicle.addObstacle(29.8,z+side,1.5,0.08);
    // One cart, tire rack and tool cabinet belong to each garage.
    block(scene,0.65,0.8,0.55,32.1,0.4,z-1.8,mat('#4b8899'));
    for(const side of [-0.22,0.22])for(const end of [-0.17,0.17])block(scene,0.1,0.14,0.1,32.1+side,0.1,z-1.8+end,dark);
    for(let i=0;i<3;i++){const tire=new THREE.Mesh(new THREE.TorusGeometry(0.22,0.11,6,12),dark);tire.rotation.x=Math.PI/2;tire.position.set(32.1,0.2+i*0.23,z+1.6);scene.add(tire);}
    vehicle.addObstacle(32.1,z-1.8,0.33,0.28);
  }
  for(let z=-36;z<=-10;z+=4){block(scene,0.10,0.014,1.2,35.3,0.095,z,mat('#f4e9aa'));}
  label(scene,'PIT LANE · 30',35.3,0.105,-24,9,'#dbe8e9').rotation.set(-Math.PI/2,0,Math.PI/2);
  // Covered grandstand: stairs, support frame and an actual audience.
  for(const x of [49.8,53.1])for(const z of [-28,-14])block(scene,0.14,3.5,0.14,x,1.75,z,steel);
  block(scene,4.2,0.18,15,51.4,3.6,-21,dark);
  for(let i=0;i<5;i++)block(scene,0.75,0.18+i*0.22,0.65,50.5,0.09+i*0.11,-12.5-i*0.65,concrete);
  const heads=new THREE.InstancedMesh(new THREE.SphereGeometry(0.13,6,5),mat('#c7a58c'),24),bodies=new THREE.InstancedMesh(new THREE.CylinderGeometry(0.13,0.16,0.4,6),mat('#568ba0'),24),dummy=new THREE.Object3D();
  for(let i=0;i<24;i++){
    const row=Math.floor(i/8),x=50+row*1.05,z=-26+(i%8)*1.5;
    dummy.position.set(x,1.12+row*0.45,z);dummy.updateMatrix();heads.setMatrixAt(i,dummy.matrix);
    dummy.position.y-=0.29;dummy.updateMatrix();bodies.setMatrixAt(i,dummy.matrix);
  }scene.add(heads,bodies);
  block(scene,2,0.03,36,52,0.02,-21,concrete);
  // Billboards and safety stations follow the outside perimeter.
  for(const [x,z,text] of [[-51,-17,'ROBOTICS / CONTROL'],[51,-4,'ENGINEERING IN MOTION'],[-15,-71,'Çağrı Çatık']]){
    const sign=new THREE.Group();sign.position.set(x,0,z);sign.rotation.y=x<-45?Math.PI/2:x>45?-Math.PI/2:0;scene.add(sign);
    for(const dx of [-1.7,1.7])block(sign,0.12,2.7,0.12,dx,1.35,0,steel);
    block(sign,4.4,1.5,0.16,0,2.2,0,dark);label(sign,text,0,2.2,0.1,4.0,'#e2ffff');
  }
  // Arrival plaza: a fountain, bike racks and a parked service van.
  const fountain=new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.45,0.35,48),mat('#bab6a5'));fountain.position.set(7,0.2,14);scene.add(fountain);vehicle.addObstacle(7,14,1.45,1.45);
  const water=new THREE.Mesh(new THREE.CircleGeometry(1.2,28),new THREE.MeshStandardMaterial({color:'#609d9e',metalness:0.12,roughness:0.28}));water.rotation.x=-Math.PI/2;water.position.set(7,0.39,14);scene.add(water);
  const jets=[];
  for(let i=0;i<6;i++){const a=i/6*Math.PI*2;const jet=new THREE.Mesh(new THREE.CylinderGeometry(0.035,0.06,0.7,6),new THREE.MeshBasicMaterial({color:'#b4e5eb',transparent:true,opacity:0.6}));jet.position.set(7+Math.cos(a)*0.6,0.75,14+Math.sin(a)*0.6);scene.add(jet);jets.push(jet);}
  for(let i=0;i<4;i++){
    const hoop=new THREE.Mesh(new THREE.TorusGeometry(0.35,0.035,6,16,Math.PI),steel);hoop.position.set(17+i*0.65,0.3,23.5);scene.add(hoop);
  }
  label(scene,'CAMPUS FUEL ↑',15.5,0.12,24.5,5,'#345d6f').rotation.x=-Math.PI/2;
  const van=new THREE.Group();van.position.set(26,0,19);scene.add(van);
  block(van,1.65,1.3,3,0,0.9,0,mat('#d1e5e9'));block(van,1.5,0.55,0.04,0,1.25,1.53,mat('#4b859f'));
  for(const x of [-0.85,0.85])for(const z of [-0.9,0.9]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.3,0.3,0.18,10),dark);wheel.rotation.z=Math.PI/2;wheel.position.set(x,0.3,z);van.add(wheel);}
  vehicle.addObstacle(26,19,0.95,1.6);
  // Drainage channels belong to the street edge, not the driving lane.
  for(const x of [-4.4,4.4])for(const z of [-28,-7,15]){
    block(scene,0.55,0.025,0.9,x,0.035,z,dark);
    for(let i=0;i<7;i++)block(scene,0.45,0.012,0.025,x,0.055,z-0.36+i*0.12,steel);
  }
  // Restrained facade mullions and ventilation grilles add human scale.
  for(const z of [-32,-25,-18]){
    for(let i=0;i<5;i++)block(scene,0.04,0.55,0.04,28.17,1.65,z-1.5+i*0.22,steel);
    block(scene,0.04,0.65,1.8,28.15,1.65,z-0.9,new THREE.MeshStandardMaterial({color:'#76a8bb',metalness:0.45,roughness:0.18}));
  }
  // A solar service garden occupies the strip behind the project buildings.
  block(scene,11,0.06,2.2,-18,0.02,-56.3,concrete);
  for(let i=0;i<7;i++){const panel=block(scene,1.25,0.08,1.9,-22.3+i*1.45,0.5,-56.3,mat('#315c78'));panel.rotation.x=-0.16;block(scene,0.1,0.4,0.8,-22.3+i*1.45,0.2,-56.3,steel);}
  return {update(time,dt){
    doors.forEach(({mesh,x,z})=>{const near=Math.hypot(vehicle.group.position.x-x,vehicle.group.position.z-z)<7;mesh.position.y=THREE.MathUtils.lerp(mesh.position.y,near?2:1.05,1-Math.exp(-3*dt));mesh.scale.y=THREE.MathUtils.lerp(mesh.scale.y,near?0.1:1,1-Math.exp(-3*dt));});
    water.material.roughness=0.2+Math.sin(time)*0.035;jets.forEach((jet,i)=>jet.scale.y=0.8+Math.sin(time*2+i)*0.15);
  }};
}
