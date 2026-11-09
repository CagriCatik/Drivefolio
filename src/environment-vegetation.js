import * as THREE from 'three';
import {campusTrees,gardenBeds} from './campus-plan.js';
import {environmentMaterial,contactShadow} from './environment-materials.js';
export function createEnvironmentVegetation(scene,vehicle){
 const group=new THREE.Group();group.name='Campus / living vegetation';scene.add(group);let seed=105;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const leafShape=new THREE.Shape();leafShape.moveTo(0,-0.65);leafShape.quadraticCurveTo(-0.42,0,0,0.65);leafShape.quadraticCurveTo(0.42,0,0,-0.65);
 const leafGeometry=new THREE.ShapeGeometry(leafShape,3),wind={value:0};
 function windShader(shader){shader.uniforms.uCampusWind=wind;shader.vertexShader='uniform float uCampusWind;\n'+shader.vertexShader.replace('#include <project_vertex>',`vec4 mvPosition=vec4(transformed,1.0);
 #ifdef USE_INSTANCING
 mvPosition=instanceMatrix*mvPosition;
 #endif
 float sway=sin(uCampusWind*0.85+mvPosition.x*0.38+mvPosition.z*0.31);
 mvPosition.x+=sway*0.065*min(mvPosition.y,4.0);
 mvPosition.z+=sin(uCampusWind*0.67+mvPosition.z*0.4)*0.035*min(mvPosition.y,4.0);
 mvPosition=modelViewMatrix*mvPosition;
 gl_Position=projectionMatrix*mvPosition;`);}
 const leavesMaterial=new THREE.MeshStandardMaterial({color:'#e2ead4',roughness:0.9,side:THREE.DoubleSide});leavesMaterial.onBeforeCompile=windShader;leavesMaterial.customProgramCacheKey=()=> 'campus-leaf-wind-v1';
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});depth.onBeforeCompile=windShader;depth.customProgramCacheKey=()=> 'campus-leaf-depth-v1';
 const count=campusTrees.length*180,leaves=new THREE.InstancedMesh(leafGeometry,leavesMaterial,count),dummy=new THREE.Object3D(),tint=new THREE.Color();let index=0;
 leaves.customDepthMaterial=depth;leaves.castShadow=true;leaves.receiveShadow=true;leaves.frustumCulled=false;group.add(leaves);
 for(const [i,[x,z]] of campusTrees.entries()){
  const slim=i%3===0,radius=slim?0.95:1.3,height=slim?2.7:2.3,small=x===8&&z===21?0.78:1;
  const bed=new THREE.Mesh(new THREE.CylinderGeometry(radius,radius+0.12,0.11,20),environmentMaterial('#c9cec2'));bed.position.set(x,0.04,z);bed.receiveShadow=true;group.add(bed);
  const soil=new THREE.Mesh(new THREE.CylinderGeometry(radius-0.1,radius-0.1,0.035,20),environmentMaterial('#52634c'));soil.position.set(x,0.115,z);group.add(soil);contactShadow(group,radius*3,radius*3,x,z,0.105,0.25);
  const trunkMaterial=environmentMaterial('#89725a','timber'),trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.08,0.17,height,8),trunkMaterial);trunk.position.set(x,height/2+0.1,z);trunk.castShadow=true;group.add(trunk);
  for(let b=0;b<3;b++){const branch=new THREE.Mesh(new THREE.CylinderGeometry(0.025,0.065,1,6),trunkMaterial),a=b*2.1+i;branch.position.set(x+Math.sin(a)*0.22,height-0.15,z+Math.cos(a)*0.22);branch.rotation.set(Math.cos(a)*0.5,0,Math.sin(a)*0.5);branch.castShadow=true;group.add(branch);}
  for(let n=0;n<180;n++){
   const a=random()*Math.PI*2,v=random()*2-1,r=Math.cbrt(random()),horizontal=Math.sqrt(1-v*v)*r;
   dummy.position.set(x+Math.cos(a)*horizontal*(slim?0.86:1.35)*small,height+0.55+v*r*(slim?1.6:0.98)*small,z+Math.sin(a)*horizontal*(slim?0.86:1.2)*small);
   dummy.rotation.set(random()*Math.PI,random()*6.28,random()*6.28);const scale=(0.32+random()*0.28)*small;dummy.scale.set(scale,scale*(1+random()*0.45),scale);dummy.updateMatrix();leaves.setMatrixAt(index,dummy.matrix);tint.setHSL(0.25+random()*0.1,0.19+random()*0.18,0.29+random()*0.15);leaves.setColorAt(index++,tint);
  }
  vehicle.addObstacle(x,z,0.25,0.25);
 }
 // Seeded grass and flowering perennials stay inside existing beds, never in access lanes.
 const blades=[],blooms=[];
 for(const [x,z,w,d] of gardenBeds){for(let n=0;n<Math.floor(w*d*18);n++){const bx=x+(random()-0.5)*(w-0.28),bz=z+(random()-0.5)*(d-0.28);blades.push([bx,bz,0.2+random()*0.4,random()*6.28]);if(n%18===0)blooms.push([bx,bz,0.42+random()*0.16]);}}
 const bladeGeo=new THREE.BufferGeometry();bladeGeo.setAttribute('position',new THREE.Float32BufferAttribute([-0.045,0,0,0.045,0,0,0.012,1,0.035],3));bladeGeo.computeVertexNormals();
 const grassMat=new THREE.MeshStandardMaterial({color:'#71875a',roughness:1,side:THREE.DoubleSide});grassMat.onBeforeCompile=windShader;grassMat.customProgramCacheKey=()=> 'campus-grass-wind-v1';
 const grass=new THREE.InstancedMesh(bladeGeo,grassMat,blades.length);blades.forEach(([x,z,h,a],i)=>{dummy.position.set(x,0.1,z);dummy.rotation.set(0,a,0);dummy.scale.set(1,h,1);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);tint.setHSL(0.2+random()*0.1,0.22,0.30+random()*0.15);grass.setColorAt(i,tint);});grass.frustumCulled=false;group.add(grass);
 const flowers=new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.055,0),environmentMaterial('#b6a2c0'),blooms.length);blooms.forEach(([x,z,h],i)=>{dummy.position.set(x,h,z);dummy.rotation.set(0,0,0);dummy.scale.set(1,0.8,1);dummy.updateMatrix();flowers.setMatrixAt(i,dummy.matrix);});group.add(flowers);
 return {update(time){wind.value=time;}};
}
