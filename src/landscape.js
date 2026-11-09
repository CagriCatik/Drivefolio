import * as THREE from 'three';
import {switchFixtures} from './fixture-lighting.js';
import {ownerName} from './identity.js';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {mat,block,label} from './scene-primitives.js';

export function addLandscape(scene,vehicle){
  const concrete=mat('#d8e2e3'),metal=mat('#334a54'),timber=mat('#a88c6b');
  const crowns=[],trees=[[-8,11],[8,21],[-25,14],[25,20],[-26,-5],[26,-6],[-26,-29],[26,-29],[-27,-52],[27,-52],[-8,-12],[8,-12],[-8,-33],[8,-33]];
  const crownGeometry=new THREE.IcosahedronGeometry(1,2),leafMaterials=['#4a856d','#60967b','#75a181'].map(mat);
  for(const [i,[x,z]] of trees.entries()){
    block(scene,3.4,0.22,3.4,x,0.08,z,concrete);
    block(scene,3.0,0.08,3.0,x,0.22,z,mat('#688a70'));
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.13,0.22,2.6,8),timber);trunk.position.set(x,1.5,z);trunk.castShadow=true;scene.add(trunk);
    const canopy=new THREE.Group();canopy.position.set(x,3.3+(i%3)*0.18,z);canopy.rotation.y=i*0.71;canopy.scale.set(i%3===0?0.8:1,i%3===0?1.35:1,i%3===0?0.8:1);scene.add(canopy);crowns.push(canopy);
    for(let n=0;n<4;n++){
      const mesh=new THREE.Mesh(crownGeometry,leafMaterials[(i+n)%3]);mesh.position.set(Math.cos(n*2.4)*0.65,n===3?0.6:0,Math.sin(n*2.4)*0.65);mesh.scale.set(1.2,1.25,1.2);mesh.castShadow=true;canopy.add(mesh);
    }
    vehicle.addObstacle(x,z,0.25,0.25);
    for(const side of [-1,1]){
      const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(0.42,1),leafMaterials[i%3]);shrub.position.set(x+side*1.1,0.52,z+0.9);shrub.scale.y=0.7;scene.add(shrub);
    }
  }
  // Landscape beds are flush with the paving and leave every road and entrance open.
  for(const [x,z,w,d] of [[-8,0,3,5],[8,0,3,5],[-8,-25,2,8],[8,-25,2,8],[-27,-18,4,13],[27,-18,4,13],[-27,-42,4,10],[27,-42,4,10]]){
    block(scene,w+0.3,0.08,d+0.3,x,-0.01,z,concrete);block(scene,w,0.08,d,x,0.035,z,mat('#84a88c'));
  }
  for(const [x,z] of [[6,18],[-25,10.5],[25,10.5],[-25,-17],[25,-39]]){
    block(scene,2.5,0.14,0.7,x,0.55,z,timber);block(scene,2.5,0.5,0.1,x,0.85,z-0.3,timber);
    for(const side of [-0.9,0.9])block(scene,0.1,0.5,0.55,x+side,0.26,z,metal);
    vehicle.addObstacle(x,z,1.3,0.4);
  }
  const nightLights=[];
  const lightMaterial=new THREE.MeshStandardMaterial({color:'#e4fbff',emissive:'#b9eaff',emissiveIntensity:0});
  for(const [x,z] of [[-4.6,15],[4.6,8],[-4.6,-9],[4.6,-25],[-4.6,-35],[4.6,-42],[-24,9.8],[24,9.8]]){
    {const light=new THREE.PointLight('#bce4ff',0,18,1.5);light.position.set(x,3.4,z);scene.add(light);nightLights.push(light);}
    block(scene,0.12,3.7,0.12,x,1.85,z,metal);block(scene,1.5,0.10,0.5,x+0.5,3.7,z,metal);block(scene,1.25,0.04,0.35,x+0.5,3.63,z,lightMaterial);
  }
  // EV chargers and a pergola make the arrival court feel inhabited.
  for(const x of [23,26]){
    block(scene,0.8,1.5,0.5,x,0.75,14,concrete);block(scene,0.55,0.65,0.04,x,1.0,14.27,metal);block(scene,0.1,0.5,0.08,x+0.55,0.75,14.2,mat('#31aa9b'));
    label(scene,'EV',x,1.05,14.31,0.48,'#a8f2e4');vehicle.addObstacle(x,14,0.65,0.35);
  }
  const pergola=new THREE.Group();pergola.position.set(24,0,22.8);scene.add(pergola);
  for(const x of [-2,2])for(const z of [-1.5,1.5])block(pergola,0.12,2.8,0.12,x,1.4,z,metal);
  for(let i=0;i<9;i++)block(pergola,4.5,0.12,0.16,0,2.85,-1.7+i*0.42,timber);
  const canal=new THREE.Mesh(new THREE.PlaneGeometry(6,88),new THREE.MeshStandardMaterial({color:'#5d9fa9',roughness:0.24,metalness:0.25}));canal.rotation.x=-Math.PI/2;canal.position.set(-32,-0.025,-16);scene.add(canal);
  for(const x of [-28.9,-35.1])block(scene,0.25,0.10,88,x,0,-16,concrete);
  return {setNight(value){switchFixtures(nightLights,[lightMaterial],value,30);},update(time){crowns.forEach((c,i)=>c.rotation.z=Math.sin(time*0.8+i)*0.015);canal.material.color.setHSL(0.52,0.25,0.49+Math.sin(time*0.4)*0.01);}};
}

export async function addNameSculpture(scene){
  const font=await new FontLoader().loadAsync(`${import.meta.env.BASE_URL}fonts/name-bold.json`);
  const geometry=new TextGeometry(ownerName,{font,size:0.95,depth:0.24,curveSegments:3,bevelEnabled:true,bevelThickness:0.035,bevelSize:0.02,bevelSegments:1});geometry.center();
  const text=new THREE.Mesh(geometry,[mat('#f4f9fa'),mat('#237c87')]);text.position.set(-8,0.8,19.5);text.rotation.y=Math.PI/4;text.castShadow=true;scene.add(text);
  const plinth=block(scene,9,0.32,1.45,-8,0.16,19.5,mat('#456373'));plinth.rotation.y=Math.PI/4;
  const strip=block(scene,8.6,0.04,0.1,-8,0.34,19.7,new THREE.MeshStandardMaterial({color:'#b8f5e9',emissive:'#69c7ba',emissiveIntensity:0.6}));strip.rotation.y=Math.PI/4;
}
