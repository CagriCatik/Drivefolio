import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createCarVisual } from './car-visual.js';
import {createWheelRig} from './wheel-rig.js';
import {createVehicleLights} from './vehicle-lights.js';
import { vehicles,getVehicle,getPaint } from './vehicle-catalog.js';

function createSportVisual(model,vehicle,profile) {
  const holder=new THREE.Group();holder.add(model);vehicle.group.add(holder);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=(profile.visualWidth??1.8)/size.x;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  model.traverse(n=>{if(n.isMesh){n.material=n.material.clone();n.castShadow=true;n.receiveShadow=true;}});
  const wheelRig=createWheelRig(model,scale);
  const painted=[];model.traverse(n=>{if(n.isMesh&&/^(body|spoiler)$/.test(n.name))painted.push(n);});
  const paintMask=profile.paintFamily==='green'?'sampledDiffuseColor.g>0.12 && sampledDiffuseColor.r<sampledDiffuseColor.g*0.65 && sampledDiffuseColor.g>sampledDiffuseColor.b*1.25':'sampledDiffuseColor.r>0.12 && sampledDiffuseColor.g>0.04 && sampledDiffuseColor.r>sampledDiffuseColor.g*1.1 && sampledDiffuseColor.g>sampledDiffuseColor.b*1.4';
  const paintUniform={value:new THREE.Color('#db3b32')};
  for(const part of painted){
    part.material.roughness=0.42;part.material.metalness=0.15;
    part.material.customProgramCacheKey=()=>`drivefolio-paint-${profile.paintFamily??'red'}`;
    part.material.onBeforeCompile=shader=>{
      shader.uniforms.uBodyPaint=paintUniform;
      shader.fragmentShader='uniform vec3 uBodyPaint;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        #ifdef USE_MAP
          if(${paintMask}){
            diffuseColor.rgb=uBodyPaint*(0.6+0.4*max(sampledDiffuseColor.r,sampledDiffuseColor.g));
          }
        #endif`);
    };
  }
  let pitch=0;
  return {group:holder,
    paint(color){paintUniform.value.set(color);},
    update(dt){const m=vehicle.motion;pitch=THREE.MathUtils.lerp(pitch,-m.acceleration*0.002,1-Math.exp(-8*dt));holder.rotation.x=pitch;holder.rotation.z=-m.steering*Math.min(m.speed/15,1)*0.06;wheelRig.update(dt,m.signedSpeed,m.steering);},
    dispose(){wheelRig.dispose();holder.removeFromParent();model.traverse(n=>{if(n.isMesh)n.material.dispose();});},
  };
}

export async function createVehicleVisuals(vehicle) {
  const loader=new GLTFLoader(),templates=new Map();
  await Promise.all(vehicles.map(async item=>templates.set(item.id,(await loader.loadAsync(`${import.meta.env.BASE_URL}${item.asset}`)).scene)));
  const lights=createVehicleLights(vehicle);
  let active=null,selected='offroader',paint='red';
  function select(id) {
    getVehicle(id);
    const clone=templates.get(id).clone(true);
    const next=id==='offroader'?createCarVisual(clone,vehicle):createSportVisual(clone,vehicle,getVehicle(id));
    next.paint(getPaint(paint).color);
    vehicle.setProfile(id);active?.dispose();active=next;selected=id;
  }
  select(selected);
  return {select,toggleLights:lights.toggle,setNight:lights.setNight,
    paint(id){const next=getPaint(id);active.paint(next.color);paint=id;},
    update(dt,time){active.update(dt,time,lights.enabled);lights.update();},
    get selected(){return selected;},get selectedPaint(){return paint;},
  };
}
