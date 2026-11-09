import * as THREE from 'three';
import {createExteriorPlan} from './exterior-plan.js';
import {environmentMaterial as mat} from './environment-materials.js';
import {createVegetationWind} from './vegetation-wind.js';
import {block} from './scene-primitives.js';
export function createExteriorLandscape(scene){
 const plan=createExteriorPlan(),group=new THREE.Group();group.name='Circuit exterior / landscape park';scene.add(group);
 const dummy=new THREE.Object3D(),tint=new THREE.Color(),wind={value:0},sway=createVegetationWind(wind,0.75);let seed=68;
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 function instances(geometry,material,items,place,shadow=true){const mesh=new THREE.InstancedMesh(geometry,material,items.length);items.forEach((item,i)=>{dummy.position.set(0,0,0);dummy.rotation.set(0,0,0);dummy.scale.set(1,1,1);place(item,i);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);});mesh.castShadow=shadow;mesh.receiveShadow=true;group.add(mesh);return mesh;}
 instances(new THREE.CylinderGeometry(0.08,0.19,1,7),mat('#857258','timber'),plan.trees,t=>{dummy.position.set(t.x,t.height*0.35,t.z);dummy.scale.set(1,t.height*0.7,1);});
 const shape=new THREE.Shape();shape.moveTo(0,-0.6);shape.quadraticCurveTo(-0.48,0,0,0.6);shape.quadraticCurveTo(0.48,0,0,-0.6);
 const foliageMaterial=new THREE.MeshStandardMaterial({color:'#e0e6cc',roughness:0.95,side:THREE.DoubleSide});foliageMaterial.onBeforeCompile=sway;foliageMaterial.customProgramCacheKey=()=> 'exterior-foliage-wind';
 const leafItems=[];for(const t of plan.trees)for(let i=0;i<145;i++)leafItems.push(t);
 const leaves=instances(new THREE.ShapeGeometry(shape,3),foliageMaterial,leafItems,t=>{const a=random()*6.28,v=random()*2-1,r=Math.cbrt(random()),h=Math.sqrt(1-v*v)*r;dummy.position.set(t.x+Math.cos(a)*h*t.radius,t.height*0.78+v*r*t.radius*(t.type===0?1.25:0.85),t.z+Math.sin(a)*h*t.radius*0.9);dummy.rotation.set(random()*3.14,random()*6.28,random()*6.28);dummy.scale.setScalar(0.43+random()*0.32);});
 for(let i=0;i<leafItems.length;i++){tint.setHSL(0.24+(i%9)*0.008,0.25+(i%5)*0.025,0.28+(i%7)*0.018);leaves.setColorAt(i,tint);}
 const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,side:THREE.DoubleSide});depth.onBeforeCompile=sway;depth.customProgramCacheKey=()=> 'exterior-foliage-shadow';leaves.customDepthMaterial=depth;
 instances(new THREE.IcosahedronGeometry(1,1),mat('#617c58'),plan.shrubs,s=>{dummy.position.set(s.x,s.size*0.35,s.z);dummy.scale.set(s.size*1.3,s.size*0.65,s.size);dummy.rotation.y=s.x;});
 const grassGeometry=new THREE.BufferGeometry(),bladeVertices=[];for(const a of [0,2.1,4.2])for(const [x,y,z] of [[-0.065,0,0],[0.065,0,0],[0.025,1,0.04]])bladeVertices.push(x*Math.cos(a)+z*Math.sin(a),y,-x*Math.sin(a)+z*Math.cos(a));grassGeometry.setAttribute('position',new THREE.Float32BufferAttribute(bladeVertices,3));grassGeometry.computeVertexNormals();
 const grassMaterial=new THREE.MeshStandardMaterial({color:'#8b9d6c',roughness:1,side:THREE.DoubleSide});grassMaterial.onBeforeCompile=sway;grassMaterial.customProgramCacheKey=()=> 'exterior-meadow-wind';
 instances(grassGeometry,grassMaterial,plan.meadow,m=>{dummy.position.set(m.x,0,m.z);dummy.scale.set(1,m.height,1);dummy.rotation.y=m.angle;},false);
 instances(new THREE.IcosahedronGeometry(0.085,0),mat('#ded3a5'),plan.meadow.filter(m=>m.flower),m=>{dummy.position.set(m.x,m.height,m.z);dummy.scale.set(1,0.55,1);},false);
 // The trail is a single strip outside all circuit barriers, following the same rounded loop.
 const points=plan.trail,positions=[],indices=[];
 points.forEach((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);for(const side of [-1,1])positions.push(p.x-dz/l*side*1.1,0.025,p.z+dx/l*side*1.1);const j=(i+1)%points.length;indices.push(i*2,j*2,i*2+1,j*2,j*2+1,i*2+1);});
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const path=new THREE.Mesh(geo,mat('#c6bca4'));path.receiveShadow=true;group.add(path);
 // Rounded grassy berms sit beyond the forest belt, below the tree line in driving views.
 for(const [x,z,sx,sy,sz] of [[-103,-61,13,2.8,10],[-105,17,12,2.3,15],[101,-51,13,3.1,12],[104,15,11,2.3,13],[-19,93,18,2.6,10],[28,-119,22,2.7,8],[-29,-120,17,2.2,8],[32,93,13,2.2,9]]){const hill=new THREE.Mesh(new THREE.SphereGeometry(1,24,12),mat('#8a9f7d'));hill.position.set(x,-sy*0.45,z);hill.scale.set(sx,sy,sz);hill.receiveShadow=true;group.add(hill);}
 const pond=new THREE.Mesh(new THREE.CircleGeometry(1,64),new THREE.MeshStandardMaterial({color:'#648e89',roughness:0.24,metalness:0.2}));pond.rotation.x=-Math.PI/2;pond.position.set(plan.pond.x,0.02,plan.pond.z);pond.scale.set(plan.pond.rx,plan.pond.rz,1);group.add(pond);
 instances(new THREE.IcosahedronGeometry(1,1),mat('#969c8b'),plan.rocks,r=>{dummy.position.set(r.x,r.size*0.3,r.z);dummy.scale.set(r.size*1.3,r.size*0.65,r.size);dummy.rotation.y=r.z;});
 // Reeds form short clusters at the water edge, rather than a uniform fence.
 const reeds=[];for(let i=0;i<70;i++){const a=1.8+random()*2.6;reeds.push({x:plan.pond.x+Math.cos(a)*(plan.pond.rx+random()*0.8),z:plan.pond.z+Math.sin(a)*(plan.pond.rz+random()*0.8),height:0.5+random()*0.6,angle:a});}
 instances(grassGeometry,grassMaterial,reeds,m=>{dummy.position.set(m.x,0,m.z);dummy.scale.set(1,m.height,1);dummy.rotation.y=m.angle;},false);
 const lengths=points.map((p,i)=>Math.hypot(points[(i+1)%points.length].x-p.x,points[(i+1)%points.length].z-p.z)),total=lengths.reduce((a,b)=>a+b,0);
 function sample(distance){let d=((distance%total)+total)%total,i=0;while(d>lengths[i]&&i<points.length-1){d-=lengths[i];i++;}const p=points[i],q=points[(i+1)%points.length],t=d/lengths[i];return {x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t,heading:Math.atan2(q.x-p.x,q.z-p.z)};}
 const visitors=[];
 for(let i=0;i<5;i++){const person=new THREE.Group();group.add(person);const cyclist=i<2,color=mat(i%2?'#507784':'#bc8f6d'),head=new THREE.Mesh(new THREE.SphereGeometry(0.13,8,6),mat('#c4a58b'));head.position.y=cyclist?1.4:1.48;person.add(head);block(person,0.30,0.45,0.22,0,cyclist?1.05:1.12,0,color);const legs=[];for(const x of [-0.09,0.09])legs.push(block(person,0.1,0.5,0.12,x,0.63,0,mat('#3b4d51')));
  if(cyclist){for(const z of [-0.42,0.42]){const wheel=new THREE.Mesh(new THREE.TorusGeometry(0.32,0.025,5,14),mat('#3c4c4a'));wheel.rotation.y=Math.PI/2;wheel.position.set(0,0.35,z);person.add(wheel);}const frame=block(person,0.06,0.05,0.8,0,0.7,0,color);frame.rotation.x=0.35;block(person,0.45,0.05,0.06,0,1.0,0.43,mat('#435b5b'));}
  visitors.push({group:person,legs,distance:i*total/5,speed:cyclist?3.4:0.95,phase:i});}
 const birds=[];for(let i=0;i<4;i++){const g=new THREE.Group();group.add(g);const wings=[];for(const side of [-1,1]){const wing=block(g,0.35,0.025,0.13,side*0.14,0,0,mat('#53625c'));wings.push({mesh:wing,side});}birds.push({group:g,wings,phase:i*1.3});}
 let clock=0;
 return {update(time,dt,paused){wind.value=time;if(!paused)clock+=dt;visitors.forEach(v=>{if(!paused)v.distance+=dt*v.speed;const p=sample(v.distance);v.group.position.set(p.x,0.03,p.z);v.group.rotation.y=p.heading;v.legs.forEach((leg,i)=>leg.rotation.x=Math.sin(clock*v.speed*3+v.phase+i*Math.PI)*0.35);});birds.forEach(b=>{const a=clock*0.15+b.phase;b.group.position.set(-72+Math.cos(a)*9,8+Math.sin(a*2)*0.6,-23+Math.sin(a)*9);b.group.rotation.y=-a;b.wings.forEach(w=>w.mesh.rotation.z=w.side*(0.2+Math.sin(clock*5+b.phase)*0.4));});pond.material.roughness=0.25+Math.sin(time*0.6)*0.025;}};
}
