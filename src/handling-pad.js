import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {asphaltMaterial,worldUV} from './surface-materials.js';
import {insideHandling,createBrakeMeter} from './brake-meter.js';

export function createHandlingPad(scene,vehicle){
  const geometry=new THREE.PlaneGeometry(11,14.6);geometry.rotateX(-Math.PI/2);geometry.translate(15.5,0.08,15.7);worldUV(geometry);
  const floor=new THREE.Mesh(geometry,asphaltMaterial());floor.receiveShadow=true;scene.add(floor);
  const paint=new THREE.MeshBasicMaterial({color:'#c1d9d7',polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  for(const x of [10.4,20.6])block(scene,0.10,0.01,13.6,x,0.095,15.7,paint);
  const zone=new THREE.Mesh(new THREE.PlaneGeometry(6.4,4.8),new THREE.MeshBasicMaterial({color:'#75b59a',transparent:true,opacity:0.25,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));zone.rotation.x=-Math.PI/2;zone.position.set(15.5,0.105,20.2);scene.add(zone);
  for(let i=0;i<3;i++){
    const x=i%2?16.8:14.2,z=11.1+i*2.7,group=new THREE.Group();scene.add(group);
    block(group,0.5,0.06,0.5,0,-0.12,0,mat('#344c59'));
    const cone=new THREE.Mesh(new THREE.ConeGeometry(0.18,0.5,10),mat('#ec9d65'));cone.position.y=0.13;group.add(cone);
    const stripe=new THREE.Mesh(new THREE.CylinderGeometry(0.095,0.13,0.10,10),mat('#eff6f7'));stripe.position.y=0.14;group.add(stripe);vehicle.addProp(group,x,0.25,z,0.24);
  }
  label(scene,'SLALOM  ↓',15.5,0.12,9.3,4,'#c9e8e4').rotation.x=-Math.PI/2;
  label(scene,'BREMSZONE',15.5,0.12,20.5,5,'#deece7').rotation.x=-Math.PI/2;
  for(let i=0;i<6;i++)block(scene,0.7,0.012,0.12,12.7+i*1.1,0.11,22.3,paint);
  const consoleMaterial=mat('#344e60');block(scene,0.7,1.1,0.7,20,0.55,21,consoleMaterial);vehicle.addObstacle(20,21,0.35,0.35);
  block(scene,0.55,0.32,0.04,20,1.18,21.38,new THREE.MeshStandardMaterial({color:'#9ed2d0',emissive:'#3b8d8c',emissiveIntensity:0.4}));
  label(scene,'HANDLING LAB',10.9,0.12,15.7,8,'#c5dedc').rotation.set(-Math.PI/2,0,Math.PI/2);
  const meter=createBrakeMeter(),hud=document.getElementById('handling-hud'),message=document.getElementById('handling-message');
  return {update(paused){
    const p=vehicle.group.position,inside=insideHandling(p);hud.hidden=!inside||paused;
    if(!inside){meter.cancel();return;}
    const state=meter.update(p,vehicle.speed,vehicle.motion.input.brake,paused);
    message.textContent=state.measuring?`Bremsweg ${state.distance.toFixed(2)} m · Start ${Math.round(state.startSpeed*3.6)} km/h`:state.result?`Stopp: ${state.result.distance.toFixed(2)} m aus ${Math.round(state.result.startSpeed*3.6)} km/h`:'Slalom fahren · mit Leertaste bremsen';
  }};
}
