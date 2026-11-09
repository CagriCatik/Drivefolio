import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {offsetLoop} from './road-network.js';
import {createPaceDriver} from './pace-driver.js';

export function createPaceCar(scene,vehicle,points){
  const driver=createPaceDriver(offsetLoop(points,-1.45)),group=new THREE.Group();scene.add(group);
  const blue=mat('#328ca8'),dark=mat('#263b48'),white=mat('#e5f3f6');
  block(group,1.25,0.4,2.55,0,0.5,0,blue);block(group,0.95,0.36,1.15,0,0.86,-0.15,dark);
  block(group,0.15,0.03,2.55,0,0.72,0,white);block(group,1.35,0.08,0.26,0,0.95,-1.1,dark);
  const wheelGroups=[];
  for(const x of [-0.7,0.7])for(const z of [-0.8,0.8]){
    const pivot=new THREE.Group();pivot.position.set(x,0.3,z);group.add(pivot);
    const roller=new THREE.Group();pivot.add(roller);
    const tire=new THREE.Mesh(new THREE.CylinderGeometry(0.29,0.29,0.2,12),dark);tire.rotation.z=Math.PI/2;roller.add(tire);
    const hub=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.16,0.21,10),white);hub.rotation.z=Math.PI/2;roller.add(hub);wheelGroups.push({pivot,roller,front:z>0});
  }
  const brakeMaterial=new THREE.MeshStandardMaterial({color:'#ed5c67',emissive:'#ec3451',emissiveIntensity:0.4});
  for(const x of [-0.42,0.42]){block(group,0.25,0.10,0.04,x,0.6,-1.3,brakeMaterial);block(group,0.25,0.10,0.04,x,0.6,1.3,new THREE.MeshStandardMaterial({color:'#dbffff',emissive:'#bcefff',emissiveIntensity:1.3}));}
  const beacon=block(group,0.7,0.12,0.25,0,1.12,-0.1,new THREE.MeshStandardMaterial({color:'#89e7ff',emissive:'#49a7e1',emissiveIntensity:1.3}));
  label(group,'PACE CAR',0,0.75,1.32,1.1,'#f7ffff');
  const traffic=vehicle.addTraffic(group,driver.pose,0.74,1.35);
  let time=0;
  return {get pose(){return driver.pose;},update(dt,paused){
    const pose=driver.update(dt,vehicle.group.position,paused);traffic.setPose(pose);
    if(!paused){time+=dt;for(const w of wheelGroups){w.pivot.rotation.y=w.front?(pose.steering??0):0;w.roller.rotation.x=(w.roller.rotation.x+pose.speed*dt/0.29)%(Math.PI*2);}}
    brakeMaterial.emissiveIntensity=pose.braking?2:0.4;beacon.material.emissiveIntensity=1+Math.sin(time*5)*0.3;
  }};
}
