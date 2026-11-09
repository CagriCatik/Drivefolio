import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {switchFixtures} from './fixture-lighting.js';
export function createWorkshopDetails(group,vehicle,stripMaterial){
 const steel=mat('#304d5b'),silver=mat('#8fa8ac'),warm=mat('#bc9b75'),teal=mat('#3f9893');
 const glow=new THREE.MeshStandardMaterial({color:'#f7e8c8',emissive:'#ffda9b',emissiveIntensity:0});
 // Low glazing on the workshop flank keeps the demonstration visible from above.
 const glass=new THREE.MeshStandardMaterial({color:'#a5d6d8',transparent:true,opacity:0.20,depthWrite:false,roughness:0.22,metalness:0.1,side:THREE.DoubleSide});
 for(const z of [-4.4,-2.5,-0.6]){
  const pane=block(group,0.035,1.3,1.72,-5.82,1.95,z,glass);pane.castShadow=false;
  block(group,0.08,2.5,0.08,-5.82,1.25,z-0.9,steel);
 }block(group,0.09,0.09,5.6,-5.82,2.65,-2.5,steel);
 // Open entrance: only edge columns and a thin lintel, never a gate across the road.
 for(const x of [-5.6,5.6]){block(group,0.16,2.9,0.16,x,1.45,4.7,steel);vehicle.addObstacle(-15+x,0.7,0.15,0.15);}
 block(group,11.4,0.18,0.22,0,2.95,4.7,steel);
 label(group,'ROBOTICS / OPEN WORKSHOP',0,2.95,4.83,9,'#d7f4ec');
 // Wheel and sensor storage, with open shelves instead of empty wall space.
 for(const y of [0.35,0.95,1.55]){
  block(group,0.9,0.08,2.0,-5, y,1.3,silver);
  for(let i=0;i<3;i++)block(group,0.48,0.28,0.42,-5,y+0.18,0.65+i*0.62,i%2?warm:teal);
 }for(const z of [0.25,2.35])for(const x of [-5.4,-4.6])block(group,0.06,1.8,0.06,x,0.9,z,steel);
 vehicle.addObstacle(-20,-2.7,0.5,1.1);
 // A working-looking fabrication bench; its print head travels only inside the frame.
 block(group,1.6,0.12,1.6,4.3,0.78,-0.9,warm);
 for(const x of [3.65,4.95])for(const z of [-1.55,-0.25])block(group,0.08,0.72,0.08,x,0.36,z,steel);
 for(const x of [3.7,4.9])for(const z of [-1.5,-0.3])block(group,0.06,1.35,0.06,x,1.5,z,steel);
 block(group,1.3,0.08,1.3,4.3,2.18,-0.9,steel);block(group,1.15,0.08,1.15,4.3,0.92,-0.9,silver);
 const gantry=new THREE.Group();gantry.position.set(4.3,1.7,-0.9);group.add(gantry);block(gantry,1.15,0.06,0.08,0,0,0,steel);
 const head=block(gantry,0.24,0.27,0.22,0,-0.14,0,teal);block(head,0.05,0.12,0.05,0,-0.17,0,silver);
 const printed=new THREE.Mesh(new THREE.CylinderGeometry(0.21,0.29,0.35,10),teal);printed.position.set(4.3,1.12,-0.9);group.add(printed);
 label(group,'FABRICATION',4.3,0.72,-0.05,1.45,'#284c58');vehicle.addObstacle(-10.7,-4.9,0.85,0.85);
 // Pegboard and recognisable hand tools behind the lift.
 block(group,2.4,1.1,0.06,-4.2,1.9,-5.75,warm);
 for(let i=0;i<6;i++){block(group,0.07,0.42,0.08,-5.1+i*0.35,1.9,-5.68,silver);block(group,0.22,0.08,0.09,-5.1+i*0.35,2.1,-5.67,steel);}
 block(group,4.8,0.04,0.12,0,3.42,-3.5,glow);
 const lights=[];const light=new THREE.PointLight('#ffe4b5',0,12,1.7);light.position.set(0,2.9,-3.5);group.add(light);lights.push(light);
 // Floor grid and safety perimeter show this is an active demonstration bay.
 const paint=new THREE.MeshBasicMaterial({color:'#4c928b',transparent:true,opacity:0.24,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 for(let i=-2;i<=2;i++){block(group,0.025,0.006,5.5,i,0.076,0,paint);block(group,5.5,0.006,0.025,0,0.076,i,paint);}
 const ring=new THREE.Mesh(new THREE.RingGeometry(2.65,2.70,64),new THREE.MeshBasicMaterial({color:'#bba36c',side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4}));ring.rotation.x=-Math.PI/2;ring.position.set(0,0.082,0);group.add(ring);
 return {setNight(value){switchFixtures(lights,[glow,stripMaterial],value,28);},update(time){head.position.x=Math.sin(time*0.8)*0.36;gantry.position.z=-0.9+Math.sin(time*0.52)*0.32;}};
}
