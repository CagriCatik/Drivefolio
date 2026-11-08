import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createCarVisual } from './car-visual.js';
import {createVehicleLights} from './vehicle-lights.js';
import { vehicles,getVehicle,getPaint } from './vehicle-catalog.js';

function createSportVisual(model,vehicle) {
  const holder=new THREE.Group();holder.add(model);vehicle.group.add(holder);
  const bounds=new THREE.Box3().setFromObject(model),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=1.8/size.x;model.scale.setScalar(scale);model.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  const wheels=[];
  model.traverse(n=>{if(!n.isMesh)return;n.material=n.material.clone();n.castShadow=true;n.receiveShadow=true;if(/^wheel/i.test(n.name))wheels.push({mesh:n,base:n.rotation.y,front:/front/i.test(n.name)});});
  const painted=[];model.traverse(n=>{if(n.isMesh&&/^(body|spoiler)$/.test(n.name))painted.push(n);});
  const paintUniform={value:new THREE.Color('#db3b32')};
  for(const part of painted){
    part.material.onBeforeCompile=shader=>{
      shader.uniforms.uBodyPaint=paintUniform;
      shader.fragmentShader='uniform vec3 uBodyPaint;\n'+shader.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
        #ifdef USE_MAP
          if(sampledDiffuseColor.r>0.12 && sampledDiffuseColor.g>0.04 && sampledDiffuseColor.r>sampledDiffuseColor.g*1.1 && sampledDiffuseColor.g>sampledDiffuseColor.b*1.4){
            diffuseColor.rgb=uBodyPaint*(0.6+0.4*sampledDiffuseColor.r);
          }
        #endif`);
    };
  }
  let pitch=0;
  return {group:holder,
    paint(color){paintUniform.value.set(color);},
    update(dt){const m=vehicle.motion;pitch=THREE.MathUtils.lerp(pitch,-m.acceleration*0.002,1-Math.exp(-8*dt));holder.rotation.x=pitch;holder.rotation.z=-m.steering*Math.min(m.speed/15,1)*0.06;for(const w of wheels){w.mesh.rotation.x+=m.signedSpeed*dt/0.33;w.mesh.rotation.y=w.base+(w.front?m.steering*0.35:0);}},
    dispose(){holder.removeFromParent();model.traverse(n=>{if(n.isMesh)n.material.dispose();});},
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
    const next=id==='offroader'?createCarVisual(clone,vehicle):createSportVisual(clone,vehicle);
    next.paint(getPaint(paint).color);
    vehicle.setProfile(id);active?.dispose();active=next;selected=id;
  }
  select(selected);
  return {select,toggleLights:lights.toggle,
    paint(id){const next=getPaint(id);active.paint(next.color);paint=id;},
    update(dt,time){active.update(dt,time,lights.enabled);lights.update();},
    get selected(){return selected;},get selectedPaint(){return paint;},
  };
}
