import {neonCycleColor} from './neon-cycle.js';
import {pointerToCanvas} from './neon-hit-test.js';
import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {TextGeometry} from 'three/addons/geometries/TextGeometry.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ownerName} from './identity.js';
import {block,label} from './scene-primitives.js';
export const nameLandmarkSite={x:-8.7,z:16.8,rotation:Math.PI/4,width:9.4,depth:1};
function roundedOutline(w,h,r){const s=new THREE.Shape();s.moveTo(-w/2+r,-h/2);s.lineTo(w/2-r,-h/2);s.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);s.lineTo(w/2,h/2-r);s.quadraticCurveTo(w/2,h/2,w/2-r,h/2);s.lineTo(-w/2+r,h/2);s.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);s.lineTo(-w/2,-h/2+r);s.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return s;}
export function createNeonNameGeometry(font){
 const body=new TextGeometry(ownerName,{font,size:1,depth:0.08,curveSegments:6,bevelEnabled:true,bevelThickness:0.008,bevelSize:0.008,bevelSegments:2});body.computeBoundingBox();const size=body.boundingBox.getSize(new THREE.Vector3()),center=body.boundingBox.getCenter(new THREE.Vector3()),scale=Math.min(7.9/size.x,1.18/size.y);body.translate(-center.x,-center.y,-center.z);body.scale(scale,scale,scale);
 const parts=[];for(const shape of font.generateShapes(ownerName,1))for(const path of [shape,...shape.holes]){const pts=path.getPoints(7);if(pts.length<3)continue;const points=pts.map(p=>new THREE.Vector3((p.x-center.x)*scale,(p.y-center.y)*scale,0.065));if(points[0].distanceTo(points.at(-1))<0.0001)points.pop();const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');parts.push(new THREE.TubeGeometry(curve,Math.max(24,points.length*2),0.018,6,true));}
 const neon=mergeGeometries(parts);parts.forEach(g=>g.dispose());return {body,neon};
}
export async function createNameLandmark(scene,vehicle){
 const font=await new FontLoader().loadAsync(`${import.meta.env.BASE_URL}fonts/name-bold.json`),group=new THREE.Group();group.name='Çağrı Çatık / neon arrival landmark';group.position.set(nameLandmarkSite.x,0,nameLandmarkSite.z);group.rotation.y=nameLandmarkSite.rotation;scene.add(group);
 const dark=new THREE.MeshStandardMaterial({color:'#142f35',metalness:0.32,roughness:0.42}),stone=new THREE.MeshStandardMaterial({color:'#566765',roughness:0.88});
 block(group,9.4,0.22,1,0,0.11,0,stone);block(group,9.1,0.07,0.82,0,0.255,0,dark);
 for(const x of [-3.65,3.65])block(group,0.14,0.9,0.18,x,0.71,-0.02,dark);
 const panelGeo=new THREE.ExtrudeGeometry(roundedOutline(9,2.7,0.18),{depth:0.16,bevelEnabled:true,bevelThickness:0.035,bevelSize:0.035,bevelSegments:2,steps:1,curveSegments:6});panelGeo.translate(0,2.25,-0.13);const panel=new THREE.Mesh(panelGeo,dark);panel.castShadow=true;panel.receiveShadow=true;group.add(panel);
 const {body,neon}=createNeonNameGeometry(font),letters=new THREE.Group();letters.position.set(0,2.35,0.12);group.add(letters);
 const opal=new THREE.MeshStandardMaterial({color:'#7aada7',emissive:'#308f8b',emissiveIntensity:0.15,metalness:0.12,roughness:0.3});letters.add(new THREE.Mesh(body,opal));
 const neonMaterial=new THREE.MeshBasicMaterial({color:new THREE.Color('#9bffec').multiplyScalar(2.6)});letters.add(new THREE.Mesh(neon,neonMaterial));
 const frameCurve=new THREE.CatmullRomCurve3(roundedOutline(8.65,2.37,0.18).getPoints(9).slice(0,-1).map(p=>new THREE.Vector3(p.x,p.y+2.25,0.095)),true,'centripetal');
 const frameMat=new THREE.MeshBasicMaterial({color:new THREE.Color('#edc591').multiplyScalar(1.4)});group.add(new THREE.Mesh(new THREE.TubeGeometry(frameCurve,160,0.014,6,true),frameMat));
 label(group,'ENGINEERING IN MOTION',0,3.15,0.10,4.0,'#c6d6c9');label(group,'ROBOTICS  /  AUTOMOTIVE  /  AI',0,1.42,0.10,6.3,'#a7c3be');
 const stripMat=new THREE.MeshStandardMaterial({color:'#a8ddd1',emissive:'#70e5cf',emissiveIntensity:0});block(group,8.4,0.025,0.025,0,0.29,0.42,stripMat);
 const spill=new THREE.PointLight('#74ffe0',0,6,2);spill.position.set(0,0.7,0.8);group.add(spill);
 vehicle.addBarrier(nameLandmarkSite.x,nameLandmarkSite.z,4.7,0.5,nameLandmarkSite.rotation);
 const pointer=new THREE.Vector2(),raycaster=new THREE.Raycaster(),canvas=document.getElementById('world');let pointing=false,night=false,hover=0,time=0;
 canvas.addEventListener('pointermove',event=>{if(event.pointerType==='touch')return;pointing=true;pointer.copy(pointerToCanvas(event.clientX,event.clientY,canvas.getBoundingClientRect()));},{passive:true});canvas.addEventListener('pointerleave',()=>pointing=false);
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)'),cycleColor=new THREE.Color();
 function apply(){neonCycleColor(reduced.matches?0:time,cycleColor);neonMaterial.color.copy(cycleColor).multiplyScalar(night?2.8:1.7);frameMat.color.copy(cycleColor).multiplyScalar(night?1.8:1.1);opal.emissive.copy(cycleColor);opal.emissiveIntensity=night?0.3:0.18;letters.scale.setScalar(reduced.matches?1:1+hover*0.06);stripMat.emissive.copy(cycleColor);stripMat.emissiveIntensity=night?1.8:0.4;spill.color.copy(cycleColor);spill.intensity=night?4:0;}

 return {setNight(value){night=!!value;apply();},updateHover(camera,blocked,dt){time+=dt;let hit=false;if(pointing&&!blocked){camera.updateMatrixWorld();panel.updateWorldMatrix(true,false);raycaster.setFromCamera(pointer,camera);hit=raycaster.intersectObject(panel,false).length>0;}hover=reduced.matches?Number(hit):THREE.MathUtils.lerp(hover,Number(hit),1-Math.exp(-18*dt));apply();return hit?'Çağrı Çatık':null;}};
}
