import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';

function modelCar(parent,color){
  const group=new THREE.Group(),body=mat(color),rubber=mat('#363740');
  block(group,0.9,0.28,1.75,0,0.33,0,body);block(group,0.7,0.28,0.75,0,0.58,-0.1,mat('#bbcdcc'));
  const wheels=[];
  for(const x of [-0.49,0.49])for(const z of [-0.55,0.55]){
    const wheel=block(group,0.15,0.35,0.35,x,0.2,z,rubber);wheels.push({mesh:wheel,front:z>0});
  }
  parent.add(group);return {group,wheels};
}

function createDynamicsArea(scene,vehicle){
  const group=new THREE.Group();group.position.set(15,0,-5);scene.add(group);
  const asphalt=mat('#716c77'),frame=mat('#62516b'),white=mat('#e6d3b7');
  block(group,14,0.08,14,0,0.03,0,asphalt);
  block(group,14,2.6,0.25,0,1.3,-7,frame);
  label(group,'VEHICLE DYNAMICS',0,1.8,-6.84,10.4);
  label(group,'2WS / 4WS  ·  MODELL-DEMO',0,0.8,-6.82,8.7,'#e0c1a4');
  const entry=label(group,'E  /  TESTGELAENDE ENTDECKEN',0,0.11,8,8.5,'#684952');entry.rotation.x=-Math.PI/2;
  vehicle.addObstacle(15,-12,7,0.15);
  const models=[modelCar(group,'#dcaa79'),modelCar(group,'#85cfbe')];
  models.forEach((car,index)=>{
    const center=index?2.5:-2.5,amplitude=index?0.65:1.05;
    const points=[];
    for(let i=0;i<180;i++){const t=i/180*Math.PI*2;points.push(new THREE.Vector3(center+Math.sin(t*3)*amplitude,0.095,Math.cos(t)*4));}
    const geometry=new THREE.BufferGeometry().setFromPoints(points);group.add(new THREE.LineLoop(geometry,new THREE.LineBasicMaterial({color:index?'#9bf0d3':'#ebbd8e',transparent:true,opacity:0.6})));
    const text=label(group,index?'4WS':'2WS',center,0.12,5.8,2.6);text.rotation.x=-Math.PI/2;
  });
  for(let i=0;i<6;i++){
    const x=21.2,z=-10+i*1.8;
    const cone=new THREE.Mesh(new THREE.ConeGeometry(0.24,0.65,8),mat('#e7a462'));
    cone.position.set(x,0.33,z);cone.castShadow=true;scene.add(cone);vehicle.addProp(cone,x,0.33,z,0.23);
  }
  block(group,1.1,1.0,0.65,0,0.5,6.3,frame);
  const screen=block(group,0.85,0.45,0.05,0,1.18,6.62,new THREE.MeshStandardMaterial({color:'#99d4c8',emissive:'#62b7a8',emissiveIntensity:0.6}));
  vehicle.addObstacle(15,1.3,0.55,0.35);
  return {update(time){
    const t=time*0.5;
    models.forEach((car,index)=>{
      const center=index?2.5:-2.5,amplitude=index?0.65:1.05;
      car.group.position.set(center+Math.sin(t*3)*amplitude,0.08,Math.cos(t)*4);
      car.group.rotation.y=Math.atan2(Math.cos(t*3)*amplitude*3,-Math.sin(t)*4);
      const steering=Math.sin(t*3)*0.4;
      car.wheels.forEach(w=>{w.mesh.rotation.y=w.front?steering:(index?-steering:0);});
    });
    screen.material.emissiveIntensity=0.5+Math.sin(time)*0.15;
  }};
}

export function createProjectAreas(scene,vehicle){
  return createDynamicsArea(scene,vehicle);
}
