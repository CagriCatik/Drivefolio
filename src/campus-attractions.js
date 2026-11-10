import {createNeonBoard} from './neon-board.js';
import {serviceCabinet} from './service-layout.js';
import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {switchFixtures} from './fixture-lighting.js';
import {projects} from './projects.js';
import {createCourier} from './courier-route.js';

function displayCar(parent,color){
 const g=new THREE.Group();parent.add(g);block(g,1.15,0.28,2.4,0,0.43,0,mat(color));block(g,0.85,0.32,1.0,0,0.73,-0.12,mat('#adc9d2'));
 block(g,1.25,0.08,0.35,0,0.75,-1.0,mat('#334c59'));
 for(const x of [-0.6,0.6])for(const z of [-0.73,0.73]){const w=new THREE.Mesh(new THREE.CylinderGeometry(0.28,0.28,0.18,10),mat('#283c46'));w.rotation.z=Math.PI/2;w.position.set(x,0.28,z);g.add(w);}
 for(const x of [-0.38,0.38])block(g,0.2,0.08,0.025,x,0.45,1.21,mat('#efe5be'));return g;
}
export function createCampusAttractions(scene,vehicle){
 const group=new THREE.Group();group.name='Campus landmarks and service';scene.add(group);
 const steel=mat('#304d5c'),white=mat('#d4e5e2'),teal=mat('#378d8a'),amber=mat('#d6ad6b');
 const glow=new THREE.MeshStandardMaterial({color:'#d6f4e6',emissive:'#b2e4cc',emissiveIntensity:0});
 // Thin, open arrival portal. Its supports sit outside the entire street width.
 for(const x of [-5.5,5.5]){block(group,0.28,4.3,0.32,x,2.15,24.7,steel);vehicle.addObstacle(x,24.7,0.19,0.22);block(group,0.06,3.5,0.03,x,2.15,24.88,glow);}
 block(group,11.8,0.65,0.28,0,4.25,24.7,steel);
 label(group,'ENGINEERING CAMPUS',0,4.27,24.86,10.6,'#e5f8ee');const reverse=label(group,'EXPLORE / BUILD / DISCOVER',0,4.27,24.54,10.6,'#e5f8ee');reverse.rotation.y=Math.PI;
 // A literal map of the seven project stations, oriented north-up.
 const map=document.createElement('canvas');map.width=512;map.height=768;const ctx=map.getContext('2d');ctx.fillStyle='#193747';ctx.fillRect(0,0,512,768);ctx.fillStyle='#c7eee3';ctx.textAlign='center';ctx.font='bold 36px Arial';ctx.fillText('CAMPUS MAP',256,64);
 const mx=x=>256+x*8,mz=z=>110+(z+56)*6;ctx.lineWidth=13;ctx.strokeStyle='#68878f';ctx.beginPath();ctx.moveTo(mx(0),mz(-44));ctx.lineTo(mx(0),mz(26));for(const z of [5,-18,-39]){ctx.moveTo(mx(-23),mz(z));ctx.lineTo(mx(23),mz(z));}ctx.stroke();
 for(const p of projects){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(mx(p.position.x),mz(p.position.z),20,0,Math.PI*2);ctx.fill();ctx.fillStyle='#122d38';ctx.font='bold 22px Arial';ctx.fillText(p.number,mx(p.position.x),mz(p.position.z)+7);}
 ctx.fillStyle='#e5be75';ctx.beginPath();ctx.arc(mx(0),mz(12),10,0,Math.PI*2);ctx.fill();ctx.font='20px Arial';ctx.fillText('START',mx(0)+45,mz(12)+7);
 ctx.textAlign='left';ctx.fillStyle='#bdd8d8';ctx.font='19px Arial';for(const [i,p] of projects.entries())ctx.fillText(`${p.number}  ${p.title}`,28,606+i*22,456);
 const mapTexture=new THREE.CanvasTexture(map);mapTexture.colorSpace=THREE.SRGBColorSpace;
 block(group,2.1,2.9,0.20,-7.6,1.65,25.1,steel);createNeonBoard(group,{title:'CAMPUS MAP',texture:mapTexture,x:-7.6,y:1.65,z:25.24,width:1.9,height:2.7});vehicle.addObstacle(-7.6,25.1,1.1,0.18);
 // Pit cars, mechanics and equipment live inside the existing bays or service apron.
 for(const [i,z] of [-32,-25,-18].entries()){
  const car=displayCar(group,['#bd815f','#4f9893','#b5a2c2'][i]);car.position.set(29.8,0.05,z);car.rotation.y=Math.PI/2;vehicle.addObstacle(29.8,z,1.25,0.67);
  block(group,0.18,0.7,0.18,32.7,0.35,z+0.65,teal);const head=new THREE.Mesh(new THREE.SphereGeometry(0.15,8,6),mat('#dab998'));head.position.set(32.7,0.88,z+0.65);group.add(head);
  block(group,0.7,0.06,0.5,32.4,0.8,z-0.4,steel);for(const x of [32.1,32.7])block(group,0.05,0.8,0.05,x,0.4,z-0.4,steel);
  const helmet=new THREE.Mesh(new THREE.SphereGeometry(0.18,8,6),amber);helmet.position.set(32.4,0.99,z-0.4);group.add(helmet);
  block(group,2.3,0.04,0.10,29.8,2.65,z,glow);
 }
 // Timing tower is behind the garages, not inside the pit lane or the track.
 block(group,0.28,3.8,0.28,26.2,1.9,-37.8,steel);block(group,3.0,2.2,0.18,26.2,3.7,-37.8,steel);vehicle.addObstacle(26.2,-37.8,0.25,0.25);
 createNeonBoard(group,{title:'PIT / TIMING',rows:['01  READY','02  READY','03  READY'],x:26.2,y:3.7,z:-37.65,width:2.8,height:2});
 const flags=[];for(const [x,z] of [[32,-36.8],[32,-10]]){
  block(group,0.05,3.6,0.05,x,1.8,z,steel);const flag=block(group,0.9,0.5,0.025,x+0.45,3.25,z,iMaterial(z));flags.push(flag);vehicle.addObstacle(x,z,0.08,0.08);
 }
 // Fuel wayfinding and a service cabinet, without introducing misleading paid prices.
 block(group,0.9,2.9,0.4,22.1,1.45,10.5,teal);label(group,'FUEL',22.1,2.4,10.72,0.8,'#e4f9ef');label(group,'FREE',22.1,1.85,10.72,0.8,'#e4f9ef');label(group,'50 L',22.1,1.3,10.72,0.8,'#e4f9ef');vehicle.addObstacle(22.1,10.5,0.5,0.28);
 block(group,0.8,1.1,0.65,serviceCabinet.x,0.55,serviceCabinet.z,white);block(group,0.5,0.4,0.05,serviceCabinet.x,0.8,serviceCabinet.z+0.35,steel);label(group,'SERVICE',serviceCabinet.x,1.3,serviceCabinet.z+0.35,1.3,'#3b6d73');vehicle.addObstacle(serviceCabinet.x,serviceCabinet.z,0.5,0.4);
 const paint=new THREE.MeshBasicMaterial({color:'#badbd1',polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 for(const x of [12.3,18.7]){const arrow=new THREE.Shape();arrow.moveTo(-0.28,0.6);arrow.lineTo(0.28,0.6);arrow.lineTo(0.28,-0.15);arrow.lineTo(0.65,-0.15);arrow.lineTo(0,-0.85);arrow.lineTo(-0.65,-0.15);arrow.lineTo(-0.28,-0.15);arrow.closePath();const mark=new THREE.Mesh(new THREE.ShapeGeometry(arrow),paint);mark.rotation.x=-Math.PI/2;mark.position.set(x,0.105,9.2);group.add(mark);}
 // Small delivery robot: service loop, docking pauses and a safe stop for the visitor.
 const courier=createCourier(),robot=new THREE.Group();group.add(robot);block(robot,0.6,0.36,0.8,0,0.4,0,white);block(robot,0.64,0.08,0.84,0,0.62,0,teal);block(robot,0.38,0.15,0.025,0,0.43,0.414,steel);const wheels=[];
 for(const x of [-0.34,0.34])for(const z of [-0.25,0.25]){const wheel=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.13,0.09,8),steel);wheel.rotation.z=Math.PI/2;wheel.position.set(x,0.17,z);robot.add(wheel);wheels.push(wheel);}
 const sensor=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.08,0.10,10),teal);sensor.position.y=0.74;robot.add(sensor);
 const traffic=vehicle.addTraffic(robot,courier.pose,0.36,0.45);traffic.setPose(courier.pose);
 block(group,1.4,0.35,0.5,-24.5,0.18,-10.55,teal);label(group,'LAB SUPPLY',-24.5,0.5,-10.25,1.9,'#396b70');vehicle.addObstacle(-24.5,-10.55,0.75,0.3);
 const lights=[];for(const [x,z,y,power] of [[0,24.7,4,18],[29.8,-32,2.4,12],[29.8,-25,2.4,12],[29.8,-18,2.4,12]]){const l=new THREE.PointLight('#c3e9da',0,9,1.7);l.position.set(x,y,z);l.userData.nightPower=power;group.add(l);lights.push(l);}
 return {setNight(value){switchFixtures([], [glow],value,0);lights.forEach(l=>l.intensity=value?l.userData.nightPower:0);},update(time,dt,paused){const pose=courier.update(dt,vehicle.group.position,paused);traffic.setPose(pose);if(pose.moving)wheels.forEach(w=>w.rotation.x+=dt*6);flags.forEach((f,i)=>{f.rotation.y=Math.sin(time*1.7+i)*0.12;});}};
}
function iMaterial(z){return mat(z<-20?'#c9ddd8':'#d8b06f');}
