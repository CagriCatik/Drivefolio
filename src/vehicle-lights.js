import * as THREE from 'three';
import {getVehicle} from './vehicle-catalog.js';

export function lightState(motion,enabled=true){
  const speed=motion.signedSpeed??0,throttle=motion.input?.throttle??0;
  return {headlights:enabled,reverse:speed < -0.25,braking:!!motion.input?.brake||speed*throttle < -0.5};
}
export function createVehicleLights(vehicle){
  const group=new THREE.Group();vehicle.group.add(group);
  function pair(color,y){
    return [-1,1].map(side=>{const material=new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.4,roughness:0.3});const mesh=new THREE.Mesh(new THREE.BoxGeometry(0.25,0.11,0.05),material);mesh.position.set(side*0.58,y,0);group.add(mesh);return mesh;});
  }
  const front=pair('#d9f4ff',0.66),rear=pair('#dc454c',0.6),reverse=pair('#f5fbff',0.47);
  const lamp=new THREE.SpotLight('#d8f2ff',9,12,0.48,0.65,1.2);lamp.position.set(0,0.72,1);lamp.target.position.set(0,0,8);group.add(lamp,lamp.target);
  let enabled=true;
  return {toggle(){enabled=!enabled;return enabled;},get enabled(){return enabled;},update(){
    const state=lightState(vehicle.motion,enabled),length=getVehicle(vehicle.profile).halfLength;
    front.forEach(m=>{m.position.z=length+0.03;m.material.emissiveIntensity=enabled?1.1:0.05;});
    rear.forEach(m=>{m.position.z=-length-0.03;m.material.emissiveIntensity=state.braking?2.5:0.35;});
    reverse.forEach(m=>{m.position.z=-length-0.04;m.visible=state.reverse;});lamp.visible=enabled;
  }};
}
