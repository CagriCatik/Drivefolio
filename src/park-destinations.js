import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {block,label} from './scene-primitives.js';
import {environmentMaterial as mat,contactShadow} from './environment-materials.js';
import {switchFixtures} from './fixture-lighting.js';
import {parkSites,duckPose,spectatorTarget} from './park-plan.js';
export async function createParkDestinations(scene,plan){
 const group=new THREE.Group();group.name='Park / pond deck and spectator terrace';scene.add(group);
 const wood=mat('#a88c68','timber'),steel=mat('#3b5050'),gravel=mat('#c6bca4'),stone=mat('#c1c3ad'),white=mat('#e7dcc4'),teal=mat('#52827a');
 const rect=(bounds,material,y=0.03)=>{const [l,r,t,b]=bounds;const floor=new THREE.Mesh(new THREE.PlaneGeometry(r-l,b-t),material);floor.rotation.x=-Math.PI/2;floor.position.set((l+r)/2,y,(t+b)/2);floor.receiveShadow=true;group.add(floor);};
 rect(parkSites.pondLink,gravel);rect(parkSites.spectatorLink,stone,0.032);rect(parkSites.spectator,stone,0.032);
 const [l,r,t,b]=parkSites.deck,cx=(l+r)/2,cz=(t+b)/2;
 block(group,r-l,0.18,b-t,cx,0.16,cz,steel);
 const slats=new THREE.InstancedMesh(new THREE.BoxGeometry(0.22,0.07,b-t),wood,28),dummy=new THREE.Object3D();for(let i=0;i<28;i++){dummy.position.set(l+0.12+i*(r-l-0.24)/27,0.28,cz);dummy.updateMatrix();slats.setMatrixAt(i,dummy.matrix);}slats.receiveShadow=true;group.add(slats);
 for(const x of [l+0.35,r-0.4])for(const z of [t+0.25,b-0.25]){block(group,0.15,0.55,0.15,x,0.05,z,wood);block(group,0.09,0.7,0.09,x,0.66,z,steel);}
 // Rail along the back only: the water-facing tip stays visually open.
 block(group,0.07,0.07,b-t-0.5,r-0.4,0.93,cz,steel);
 block(group,0.7,0.11,2,r+0.25,0.14,cz,wood);
 // Reuse the same original Bruno bench geometry as the campus seating.
 const source=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/bruno/benches.glb`);let template;source.scene.traverse(n=>{if(n.isMesh&&!template)template=n;});if(!template)throw new Error('Missing park bench mesh');
 const geometry=template.geometry.clone();geometry.computeBoundingBox();const bounds=geometry.boundingBox,size=bounds.getSize(new THREE.Vector3());geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);const benchMat=template.material.clone();benchMat.roughness=0.83;
 function bench(x,z,y,heading){const bench=new THREE.Mesh(geometry,benchMat);bench.position.set(x,y,z);bench.rotation.y=heading;bench.scale.set(2.15/size.x,1/size.y,0.7/size.z);bench.castShadow=true;bench.receiveShadow=true;group.add(bench);contactShadow(group,2.6,1.1,x,z,y+0.002,0.25).rotation.z=-heading;}
 bench(-72.6,-24.45,0.315,0);bench(-70.2,-24.45,0.315,0);
 // Modest kiosk beside the grandstand, with a clear aisle along the outer path.
 const kiosk=new THREE.Group();kiosk.position.set(56.7,0,-29.7);group.add(kiosk);
 block(kiosk,3.2,2.15,2.5,0,1.08,0,teal);block(kiosk,3.7,0.14,2.9,0,2.25,0,steel);block(kiosk,2.5,0.85,0.07,0,1.4,1.28,steel);block(kiosk,2.9,0.10,0.62,0,1.0,1.48,wood);label(kiosk,'PIT STOP / COFFEE',0,1.98,1.29,2.9,'#f3ead0');
 for(let i=0;i<3;i++){const cup=new THREE.Mesh(new THREE.CylinderGeometry(0.055,0.045,0.14,8),white);cup.position.set(-0.5+i*0.28,1.13,1.5);kiosk.add(cup);}
 for(const z of [-23,-16.2]){const table=new THREE.Mesh(new THREE.CylinderGeometry(0.57,0.57,0.08,16),wood);table.position.set(56.8,0.78,z);table.castShadow=true;group.add(table);block(group,0.1,0.75,0.1,56.8,0.4,z,steel);block(group,0.06,2.7,0.06,56.8,1.4,z,steel);const umbrella=new THREE.Mesh(new THREE.ConeGeometry(1.6,0.55,8,1,true),new THREE.MeshStandardMaterial({color:'#d6c7a5',side:THREE.DoubleSide,roughness:1}));umbrella.position.set(56.8,2.75,z);umbrella.castShadow=true;group.add(umbrella);bench(55.35,z,0.04,-Math.PI/2);}
 const people=[];
 for(const [i,[x,z]] of [[54.9,-25.5],[54.9,-19.3],[55,-13.4],[57.7,-26.4]].entries()){
  const g=new THREE.Group();g.position.set(x,0.04,z);g.rotation.y=-Math.PI/2;group.add(g);const jacket=mat(i%2?'#667d95':'#b8956b'),head=new THREE.Mesh(new THREE.SphereGeometry(0.14,8,6),mat('#c7a68d'));head.position.y=1.5;g.add(head);block(g,0.34,0.45,0.24,0,1.15,0,jacket);for(const px of [-0.1,0.1])block(g,0.12,0.63,0.14,px,0.59,0,steel);
  const arms=new THREE.Group();arms.position.y=1.25;g.add(arms);for(const px of [-0.23,0.23])block(arms,0.1,0.35,0.12,px,-0.14,0,jacket);if(i===0)block(arms,0.3,0.15,0.13,0,-0.28,0.16,steel);
  people.push({group:g,arms,photographer:i===0,x,z});
 }
 // Low warm fixtures: emitter and actual illumination follow the same night switch.
 const glow=new THREE.MeshStandardMaterial({color:'#ead9b5',emissive:'#ffe1ac',emissiveIntensity:0}),lights=[];
 const fixtures=[[-66,-24.9],[-69.3,-25.3],[58.5,-27],[58.5,-14]];
 for(let i=0;i<plan.trail.length;i+=31){const p=plan.trail[i],dx=p.x,dz=p.z+16,len=Math.hypot(dx,dz);fixtures.push([p.x+dx/len*1.4,p.z+dz/len*1.4]);}
 for(const [x,z] of fixtures){block(group,0.13,0.72,0.13,x,0.36,z,steel);block(group,0.16,0.08,0.16,x,0.72,z,glow);}
 // Four local lights at destinations; the promenade is lit with inexpensive soft ground pools.
 for(const [x,z] of fixtures.slice(0,4)){const light=new THREE.PointLight('#ffe1ac',0,8,1.7);light.position.set(x,1.0,z);group.add(light);lights.push(light);}
 const poolCanvas=document.createElement('canvas');poolCanvas.width=poolCanvas.height=64;const ctx=poolCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,0,32,32,31);gradient.addColorStop(0,'rgba(255,218,157,0.20)');gradient.addColorStop(1,'rgba(255,218,157,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const poolMaterial=new THREE.MeshBasicMaterial({map:new THREE.CanvasTexture(poolCanvas),transparent:true,depthWrite:false,blending:THREE.AdditiveBlending});const pools=new THREE.Group();group.add(pools);
 for(const [x,z] of fixtures){const pool=new THREE.Mesh(new THREE.PlaneGeometry(5,5),poolMaterial);pool.rotation.x=-Math.PI/2;pool.position.set(x,0.045,z);pools.add(pool);}pools.visible=false;
 const ducks=[];
 for(let i=0;i<2;i++){const g=new THREE.Group();group.add(g);const body=new THREE.Mesh(new THREE.SphereGeometry(1,10,7),mat(i?'#ac9675':'#d6c6a1'));body.scale.set(0.19,0.14,0.32);body.position.y=0.16;g.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(0.12,9,7),mat(i?'#9e8b6b':'#426f5e'));head.position.set(0,0.31,0.22);g.add(head);block(g,0.1,0.04,0.15,0,0.28,0.35,mat('#d4a34f'));ducks.push(g);}
 const ripples=[];for(let i=0;i<6;i++){const ripple=new THREE.Mesh(new THREE.RingGeometry(0.9,1,32),new THREE.MeshBasicMaterial({color:'#b5d5c0',transparent:true,opacity:0.18,depthWrite:false,side:THREE.DoubleSide}));ripple.rotation.x=-Math.PI/2;ripple.position.y=0.035;group.add(ripple);ripples.push(ripple);}
 let clock=0;
 return {setNight(night){switchFixtures(lights,[glow],night,11);pools.visible=night;},update(time,dt,paused,visitor){if(!paused)clock+=dt;ducks.forEach((duck,i)=>{const p=duckPose(clock,i,plan.pond);duck.position.set(p.x,0.04+p.bob,p.z);duck.rotation.y=p.heading;});ripples.forEach((ring,i)=>{const p=duckPose(clock,i%2,plan.pond),phase=(clock*0.3+i/6)%1;ring.position.set(p.x-Math.sin(p.heading)*phase*0.5,0.035,p.z-Math.cos(p.heading)*phase*0.5);ring.scale.setScalar(0.2+phase*0.7);ring.material.opacity=(1-phase)*0.15;});if(!visitor||paused)return;people.forEach(p=>{const target=spectatorTarget(p.x,p.z,visitor),delta=Math.atan2(Math.sin(target.heading-p.group.rotation.y),Math.cos(target.heading-p.group.rotation.y));p.group.rotation.y+=delta*(1-Math.exp(-dt*2));p.arms.rotation.x=THREE.MathUtils.lerp(p.arms.rotation.x,p.photographer&&target.photograph?-1.6:0,1-Math.exp(-dt*3));});}};
}
