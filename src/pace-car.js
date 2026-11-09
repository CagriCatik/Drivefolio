import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {offsetLoop} from './road-network.js';
import {createPaceDriver} from './pace-driver.js';
import {createSportVisual} from './vehicle-visuals.js';
import {createVehicleLights} from './vehicle-lights.js';
import {getVehicle} from './vehicle-catalog.js';
import {contactShadow} from './environment-materials.js';

export async function createPaceCar(scene,vehicle,points){
 const profile=getVehicle('sport'),driver=createPaceDriver(offsetLoop(points,-1.45)),group=new THREE.Group();group.name='AI / Kenney Sports Sedan';scene.add(group);
 let pose=driver.pose,night=false;
 const proxy={group,get motion(){return {speed:pose.speed,signedSpeed:pose.speed,steering:pose.steering??0,acceleration:0,input:{brake:pose.braking}};}};
 const model=(await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}${profile.asset}`)).scene;
 const visual=createSportVisual(model,proxy,profile);visual.paint('#e4ded0');
 const lights=createVehicleLights(proxy);lights.mount(visual.lighting);lights.toggle();
 const shadow=contactShadow(group,2.35,4.1,0,0,0.014,0.38);
 const traffic=vehicle.addTraffic(group,pose,profile.halfWidth,profile.halfLength);traffic.setPose(pose);
 return {get pose(){return pose;},setNight(value){if(night!==!!value)lights.toggle();night=!!value;lights.setNight(night);lights.update();},update(dt,paused){
  pose=driver.update(dt,vehicle.group.position,paused);traffic.setPose(pose);visual.update(paused?0:dt);lights.update();shadow.material.opacity=night?0.19:0.38;
 }};
}
