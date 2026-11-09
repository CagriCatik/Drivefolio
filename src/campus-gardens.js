import {environmentMaterial as mat} from './environment-materials.js';
import * as THREE from 'three';
import {campusPaths,gardenBeds} from './campus-plan.js';
import {block,label} from './scene-primitives.js';
import {worldUV} from './surface-materials.js';
import {switchFixtures} from './fixture-lighting.js';

export function createCampusGardens(scene,vehicle){
 const group=new THREE.Group();group.name='Connected campus landscape';scene.add(group);
 const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const ctx=canvas.getContext('2d');ctx.fillStyle='#e2dbcc';ctx.fillRect(0,0,256,256);ctx.strokeStyle='#c7c1b6';ctx.lineWidth=2;ctx.strokeRect(0,0,256,256);ctx.beginPath();ctx.moveTo(128,0);ctx.lineTo(128,256);ctx.moveTo(0,128);ctx.lineTo(256,128);ctx.stroke();
 const paving=new THREE.CanvasTexture(canvas);paving.wrapS=paving.wrapT=THREE.RepeatWrapping;paving.colorSpace=THREE.SRGBColorSpace;paving.anisotropy=4;
 const positions=[],indices=[];for(const [l,r,t,b] of campusPaths()){const n=positions.length/3;positions.push(l,0.045,t,r,0.045,t,l,0.045,b,r,0.045,b);indices.push(n,n+2,n+1,n+1,n+2,n+3);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();worldUV(geometry,0.4);
 const paths=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#f2e7d4',map:paving,roughness:0.95}));paths.receiveShadow=true;group.add(paths);
 const stone=mat('#c2ccbf'),soil=mat('#58725b'),steel=mat('#34515a'),wood=mat('#a79070');
 const shrubs=[],flowers=[];
 for(const [index,[x,z,w,d]] of gardenBeds.entries()){
  block(group,w+0.22,0.07,d+0.22,x,0.005,z,stone);block(group,w,0.08,d,x,0.05,z,soil);
  const count=Math.ceil(d/0.7);for(let i=0;i<count;i++){
   const px=x+Math.sin(i*2.4+index)*w*0.24,pz=z-d/2+0.4+i*(d-0.8)/Math.max(1,count-1);
   shrubs.push({x:px,z:pz,scale:0.27+(i%4)*0.04,color:index%3});
   if(i%2===0)flowers.push({x:px+0.12,z:pz+0.12,color:index%2});
  }
 }
 const dummy=new THREE.Object3D();
 for(const [index,color] of ['#65947a','#789b70','#4c806c'].entries()){
  const items=shrubs.filter(s=>s.color===index),mesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1,0),mat(color),items.length);
  items.forEach((s,i)=>{dummy.position.set(s.x,0.2+s.scale*0.5,s.z);dummy.scale.set(s.scale*1.5,s.scale*0.85,s.scale*1.2);dummy.rotation.set(0,i*0.6,0);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=true;group.add(mesh);
 }
 for(const [index,color] of ['#b99fd0','#ebd39c'].entries()){
  const items=flowers.filter(s=>s.color===index),mesh=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.10,0),mat(color),items.length);
  items.forEach((s,i)=>{dummy.position.set(s.x,0.61,s.z);dummy.scale.set(1,1,1);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});group.add(mesh);
 }
 const luminous=new THREE.MeshStandardMaterial({color:'#e1efcf',emissive:'#e9e4b3',emissiveIntensity:0});
 for(const z of [-48,-31,-10,20]){block(group,0.16,0.85,0.16,-28.15,0.43,z,steel);block(group,0.19,0.08,0.19,-28.15,0.82,z,luminous);}
 // One light pool covers each pair of low promenade fixtures.
 const lights=[];for(const z of [-39,-1]){const light=new THREE.PointLight('#ffe3af',0,20,1.8);light.position.set(-27.5,1.4,z);group.add(light);lights.push(light);}
 for(const [x,z,text] of [[-5.4,0,'ROBOTICS ←'],[5.4,-23,'AUTONOMY →'],[-5.4,-44,'PLANNING ←']]){
  block(group,0.10,1.6,0.10,x,0.8,z,steel);block(group,2,0.5,0.10,x,1.6,z,steel);label(group,text,x,1.6,z+0.061,1.8,'#d6eee2');vehicle.addObstacle(x,z,0.15,0.15);
 }
 return {setNight(value){switchFixtures(lights,[luminous],value,13);}};
}
