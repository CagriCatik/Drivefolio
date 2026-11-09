import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {vehicles} from './vehicle-catalog.js';
import {createCarVisual} from './car-visual.js';
import {garageSite} from './service-layout.js';
import {block,label,mat} from './scene-primitives.js';
export async function createShowroom(garage,vehicle){
 const loader=new GLTFLoader(),picks=[],pads=[];
 const models=await Promise.all(vehicles.map(p=>loader.loadAsync(`${import.meta.env.BASE_URL}${p.asset}`)));
 for(let i=0;i<vehicles.length;i++){
  const profile=vehicles[i],normalizer=new THREE.Group(),model=models[i].scene;
  if(profile.id==='offroader'){
   const visual=createCarVisual(model,{group:normalizer,motion:{speed:0,signedSpeed:0,steering:0,acceleration:0,input:{}}});visual.paint('#b8bda8');visual.update(0,0,false);
  }else normalizer.add(model);
  normalizer.traverse(n=>{if(n.isMesh){n.castShadow=true;n.receiveShadow=true;}});
  normalizer.updateWorldMatrix(true,true);const bounds=new THREE.Box3().setFromObject(normalizer),size=bounds.getSize(new THREE.Vector3()),center=bounds.getCenter(new THREE.Vector3());
  const scale=Math.min(1.75/size.x,3.4/size.z);normalizer.scale.setScalar(scale);normalizer.position.set(-center.x*scale,-bounds.min.y*scale,-center.z*scale);
  const holder=new THREE.Group();holder.position.set(-3.6+i*2.4,0.085,0);holder.userData.showroomVehicle=profile.id;holder.add(normalizer);garage.add(holder);picks.push(holder);
  const material=new THREE.MeshBasicMaterial({color:'#526c68',transparent:true,opacity:0.38});
  const pad=new THREE.Mesh(new THREE.PlaneGeometry(2.05,4.1),material);pad.rotation.x=-Math.PI/2;pad.position.set(holder.position.x,0.081,0);garage.add(pad);pads.push({id:profile.id,material});
  label(garage,`${i+1} / ${profile.name.toUpperCase()}`,holder.position.x,0.10,2.65,2.05,'#2b595a').rotation.x=-Math.PI/2;
  vehicle.addObstacle(garageSite.x-holder.position.x,garageSite.z,0.9,1.7);
 }
 const raycaster=new THREE.Raycaster(),point=new THREE.Vector2();
 return {pick(event,camera){point.set(event.clientX/window.innerWidth*2-1,-event.clientY/window.innerHeight*2+1);raycaster.setFromCamera(point,camera);for(const hit of raycaster.intersectObjects(picks,true)){let node=hit.object;while(node&&!node.userData.showroomVehicle)node=node.parent;if(node?.userData.showroomVehicle)return node.userData.showroomVehicle;}return null;},update(selected){pads.forEach(p=>{p.material.color.set(p.id===selected?'#74c9af':'#526c68');p.material.opacity=p.id===selected?0.65:0.3;});}};
}
