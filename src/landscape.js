import * as THREE from 'three';
import {evChargers,pergolaSite} from './service-layout.js';
import {createEnvironmentVegetation} from './environment-vegetation.js';
import {environmentMaterial as mat} from './environment-materials.js';
import {createCampusGardens} from './campus-gardens.js';
import {switchFixtures} from './fixture-lighting.js';
import {block,label} from './scene-primitives.js';

export function addLandscape(scene,vehicle){
  const concrete=mat('#d8e2e3'),metal=mat('#334a54'),timber=mat('#a88c6b');
  const gardens=createCampusGardens(scene,vehicle);
  const vegetation=createEnvironmentVegetation(scene,vehicle);
  const nightLights=[];
  const lightMaterial=new THREE.MeshStandardMaterial({color:'#e4fbff',emissive:'#b9eaff',emissiveIntensity:0});
  for(const [x,z] of [[-4.6,15],[4.6,8],[-4.6,-9],[4.6,-25],[-4.6,-35],[4.6,-42],[-24,9.8],[24,9.8]]){
    {const light=new THREE.PointLight('#bce4ff',0,18,1.5);light.position.set(x,3.4,z);scene.add(light);nightLights.push(light);}
    block(scene,0.12,3.7,0.12,x,1.85,z,metal);block(scene,1.5,0.10,0.5,x+0.5,3.7,z,metal);block(scene,1.25,0.04,0.35,x+0.5,3.63,z,lightMaterial);
  }
  // EV chargers and a pergola make the arrival court feel inhabited.
  for(const {x,z} of evChargers){
    const charger=new THREE.Group();charger.position.set(x,0,z);charger.rotation.y=-Math.PI/2;scene.add(charger);
    block(charger,0.8,1.5,0.5,0,0.75,0,concrete);block(charger,0.55,0.65,0.04,0,1.0,0.27,metal);block(charger,0.1,0.5,0.08,0.55,0.75,0.2,mat('#31aa9b'));
    label(charger,'EV',0,1.05,0.31,0.48,'#a8f2e4');vehicle.addObstacle(x,z,0.35,0.7);
  }
  const pergola=new THREE.Group();pergola.position.set(pergolaSite.x,0,pergolaSite.z);scene.add(pergola);
  for(const x of [-2,2])for(const z of [-1.5,1.5])block(pergola,0.12,2.8,0.12,x,1.4,z,metal);
  for(let i=0;i<9;i++)block(pergola,4.5,0.12,0.16,0,2.85,-1.7+i*0.42,timber);
  const canal=new THREE.Mesh(new THREE.PlaneGeometry(6,88),new THREE.MeshStandardMaterial({color:'#5d9fa9',roughness:0.24,metalness:0.25}));canal.rotation.x=-Math.PI/2;canal.position.set(-32,-0.025,-16);scene.add(canal);
  for(const x of [-28.9,-35.1])block(scene,0.25,0.10,88,x,0,-16,concrete);
  return {setNight(value){gardens.setNight(value);switchFixtures(nightLights,[lightMaterial],value,30);},update(time){vegetation.update(time);canal.material.color.setHSL(0.52,0.25,0.49+Math.sin(time*0.4)*0.01);}};
}

