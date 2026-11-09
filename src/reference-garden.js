import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {seatingPlaces,seatingCourts,benchHeading,benchFootprint,benchSize} from './seating-plan.js';
import {mat,block} from './scene-primitives.js';
import {worldUV} from './surface-materials.js';
import {switchFixtures} from './fixture-lighting.js';

function paving(deck=false){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle=deck?'#aa9170':'#d9d2c2';ctx.fillRect(0,0,256,256);ctx.strokeStyle=deck?'#7f705d':'#bfb9ab';ctx.lineWidth=deck?2:1.5;
 if(deck){for(let x=0;x<256;x+=32){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,256);ctx.stroke();}}
 else{ctx.strokeRect(0,0,256,256);ctx.beginPath();ctx.moveTo(0,128);ctx.lineTo(256,128);ctx.moveTo(128,0);ctx.lineTo(128,128);ctx.stroke();}
 const map=new THREE.CanvasTexture(canvas);map.wrapS=map.wrapT=THREE.RepeatWrapping;map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=4;return new THREE.MeshStandardMaterial({map,color:deck?'#c6b092':'#f2e8d4',roughness:0.94});
}
function groundShape(rect,hole){
 const [l,r,t,b]=rect,s=new THREE.Shape(),radius=0.18;
 s.moveTo(l+radius,-b);s.lineTo(r-radius,-b);s.quadraticCurveTo(r,-b,r,-b+radius);s.lineTo(r,-t-radius);s.quadraticCurveTo(r,-t,r-radius,-t);s.lineTo(l+radius,-t);s.quadraticCurveTo(l,-t,l,-t-radius);s.lineTo(l,-b+radius);s.quadraticCurveTo(l,-b,l+radius,-b);
 if(hole){const p=new THREE.Path();p.absarc(hole.x,-hole.z,hole.radius,0,Math.PI*2,true);s.holes.push(p);}
 const g=new THREE.ShapeGeometry(s,24);g.rotateX(-Math.PI/2);worldUV(g,0.7);return g;
}
function contactTexture(){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(64,64,12,64,64,62);g.addColorStop(0,'rgba(28,45,38,0.45)');g.addColorStop(0.55,'rgba(28,45,38,0.18)');g.addColorStop(1,'rgba(28,45,38,0)');ctx.fillStyle=g;ctx.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
export async function createReferenceGarden(scene,vehicle){
 const source=await new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/bruno/benches.glb`);
 let template;source.scene.traverse(n=>{if(n.isMesh&&!template)template=n;});if(!template)throw new Error('Bruno bench model is missing its visual mesh');
 // Original world transforms and physics markers belong to Bruno's scene. Use the local visual only.
 const geometry=template.geometry.clone();geometry.computeBoundingBox();const bounds=geometry.boundingBox,size=bounds.getSize(new THREE.Vector3());geometry.translate(-(bounds.min.x+bounds.max.x)/2,-bounds.min.y,-(bounds.min.z+bounds.max.z)/2);
 const material=template.material.clone();material.roughness=0.78;material.metalness=0.03;material.map.magFilter=THREE.NearestFilter;
 const group=new THREE.Group();group.name='Curated arrival and waterfront';scene.add(group);
 const stone=paving(),deck=paving(true),trim=mat('#939f94'),soil=mat('#647863'),leaf=mat('#648775'),grass=mat('#899c72');
 for(const court of Object.values(seatingCourts)){const floor=new THREE.Mesh(groundShape(court.rect,court.hole),court.surface==='deck'?deck:stone);floor.position.y=0.045;floor.receiveShadow=true;group.add(floor);}
 const shadowMat=new THREE.MeshBasicMaterial({map:contactTexture(),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
 for(const place of seatingPlaces){
  const bench=new THREE.Mesh(geometry,material);bench.scale.set(benchSize.width/size.x,benchSize.height/size.y,benchSize.depth/size.z);bench.rotation.y=benchHeading(place);bench.position.set(place.x,0.05,place.z);bench.castShadow=true;bench.receiveShadow=true;bench.name=`Bench / ${place.id}`;group.add(bench);
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(2.75,1.25),shadowMat);shadow.rotation.set(-Math.PI/2,0,-benchHeading(place));shadow.position.set(place.x,0.049,place.z);group.add(shadow);
  const [l,r,t,b]=benchFootprint(place);vehicle.addObstacle((l+r)/2,(t+b)/2,(r-l)/2,(b-t)/2);
 }
 // Layered planting frames the seating groups. Every planter has a supporting plinth.
 const planters=[[6.9,18.35,2.8,0.48],[-14.5,20.3,0.38,1.8],[-24.5,-2.85,1.4,0.38],[-25.8,-23.55,1.8,0.45],[-25.8,23.35,1.8,0.45]];
 for(const [x,z,w,d] of planters){
  block(group,w,0.22,d,x,0.11,z,trim);block(group,w-0.08,0.03,d-0.08,x,0.235,z,soil);
  const n=Math.max(3,Math.ceil(w/0.28));for(let i=0;i<n;i++){
   const shrub=new THREE.Mesh(new THREE.IcosahedronGeometry(0.19+(i%2)*0.025,1),i%3?leaf:grass);shrub.position.set(x-w/2+0.18+i*(w-0.36)/(n-1),0.4,z);shrub.scale.set(1,0.9+(i%3)*0.2,0.8);shrub.castShadow=true;group.add(shrub);
   if(i%2===0){const flower=new THREE.Mesh(new THREE.IcosahedronGeometry(0.055,0),mat('#baa4c5'));flower.position.set(shrub.position.x,0.64,z);group.add(flower);}
  }
 }
 // Fountain surround: a thin stone coping replaces the unarticulated concrete edge.
 const coping=new THREE.Mesh(new THREE.TorusGeometry(1.32,0.085,8,64),mat('#c3bba8'));coping.rotation.x=-Math.PI/2;coping.position.set(7,0.39,14);coping.receiveShadow=true;group.add(coping);
 const baseShadow=new THREE.Mesh(new THREE.PlaneGeometry(3.6,3.6),shadowMat);baseShadow.rotation.x=-Math.PI/2;baseShadow.position.set(7,0.047,14);group.add(baseShadow);
 const luminous=new THREE.MeshStandardMaterial({color:'#f5e3bd',emissive:'#ffe2ad',emissiveIntensity:0});
 for(const [x,z] of [[5.15,18.15],[-26.55,20.3],[-26.55,-22.9]]){block(group,0.12,0.65,0.12,x,0.33,z,mat('#354f50'));block(group,0.15,0.06,0.15,x,0.65,z,luminous);}
 // Soft warm courtyard light; all luminous surfaces follow the existing night switch.
 const light=new THREE.PointLight('#ffe3b1',0,10,1.8);light.position.set(7.1,2.6,17.4);group.add(light);
 return {setNight(value){switchFixtures([light],[luminous],value,16);}};
}
