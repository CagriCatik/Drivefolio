import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {switchFixtures} from './fixture-lighting.js';
export function createAIPavilion(group,vehicle){
 const frame=mat('#4f526b'),glow=new THREE.MeshStandardMaterial({color:'#ddcbee',emissive:'#c5a4e4',emissiveIntensity:0});
 // Slender open ribs form a landmark while leaving all four agent nodes visible.
 for(const z of [-4.8,0,4.6]){
  const points=Array.from({length:41},(_,i)=>{const a=i/40*Math.PI;return new THREE.Vector3(Math.cos(a)*7.4,0.2+Math.sin(a)*4.4,z);});
  const rib=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),40,0.075,6,false),frame);rib.castShadow=true;group.add(rib);
  for(const x of [-7.4,7.4])vehicle.addObstacle(x,-49+z,0.14,0.14);
 }
 const glass=new THREE.MeshStandardMaterial({color:'#c1badb',transparent:true,opacity:0.17,depthWrite:false,roughness:0.3,side:THREE.DoubleSide});
 for(const x of [-7.3,7.3]){
  const pane=block(group,0.035,1.4,6.2,x,1.2,-0.5,glass);pane.castShadow=false;block(group,0.07,0.08,6.3,x,1.95,-0.5,frame);block(group,0.08,0.05,6.3,x,0.1,-0.5,glow);vehicle.addObstacle(x,-49.5,0.10,3.2);
 }
 label(group,'AI / MCP / A2A',0,4.0,4.69,6.4,'#e5d8ef');
 const light=new THREE.PointLight('#c9b5ef',0,15,1.8);light.position.set(0,3.4,-0.7);group.add(light);
 return {setNight(value){switchFixtures([light],[glow],value,26);}};
}
