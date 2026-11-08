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

function createCompilerStation(scene,vehicle){
  const group=new THREE.Group();group.position.set(0,0,-28);scene.add(group);
  const frame=mat('#665376'),floor=mat('#ad9db7'),panel=mat('#e5d9c7');
  block(group,14,0.08,11,0,0.03,0,floor);
  block(group,14,3.0,0.25,0,1.5,-5.5,frame);
  label(group,'SPEC TO TEST',0,2.35,-5.32,9.8);
  label(group,'SPEC  →  MAPPING  →  PYTHON',0,1.35,-5.3,10.7,'#d5bde4');
  label(group,'ANIMIERTE PROJEKTVORSCHAU',0,0.6,-5.28,9.2,'#c9c5be');
  vehicle.addObstacle(0,-33.5,7,0.15);
  const pedestals=[],lights=[];
  for(let i=0;i<3;i++){
    const x=(i-1)*4;
    block(group,2.7,0.8,2.5,x,0.4,-1,panel);
    const light=new THREE.MeshStandardMaterial({color:'#b2a8c3',emissive:'#9d7cc4',emissiveIntensity:0.15});
    const screen=block(group,2.5,1.65,0.2,x,1.65,-1.9,frame);
    const glass=block(group,2.2,1.35,0.05,x,1.65,-1.77,light);lights.push(light);
    label(group,['.TXT','.TOML','.PY'][i],x,1.65,-1.7,1.9);
    vehicle.addObstacle(x,-29,1.35,1.25);pedestals.push(glass);
  }
  block(group,10.5,0.25,0.7,0,0.6,1.5,frame);
  const tokens=[];
  for(let i=0;i<3;i++)tokens.push(block(group,0.45,0.45,0.45,-4+i,0.98,1.5,mat('#d1b6df')));
  block(group,1.3,0.95,0.7,0,0.48,4.2,frame);
  const startLight=block(group,0.3,0.12,0.3,0,1.0,4.2,new THREE.MeshStandardMaterial({color:'#c1e4c4',emissive:'#82b98a',emissiveIntensity:0.7}));
  vehicle.addObstacle(0,-23.8,0.65,0.35);
  const entry=label(group,'E  /  DEMO STARTEN',0,0.12,7.5,6.5,'#664f76');entry.rotation.x=-Math.PI/2;
  let stage=-1,progress=0;
  return {setStage(next,value){stage=next;progress=value;},update(time){
    lights.forEach((m,i)=>{const done=stage===3||stage>i;m.color.set(done?'#a8d4aa':stage===i?'#d6b8ed':'#a5a0ae');m.emissive.set(done?'#6bb583':stage===i?'#af75d9':'#635770');m.emissiveIntensity=stage===i?1+Math.sin(time*7)*0.2:done?0.75:0.12;});
    tokens.forEach((mesh,i)=>{mesh.position.x=stage>=0?((progress*9+i*0.9)%9)-4.5:-4+i*0.8;mesh.rotation.y=time*0.5;});
    startLight.material.emissiveIntensity=stage>=0&&stage<3?0.3+Math.sin(time*5)*0.3:0.7;
  }};
}

export function createProjectAreas(scene,vehicle){
  const dynamics=createDynamicsArea(scene,vehicle),testing=createCompilerStation(scene,vehicle);
  return {setTestingStage(stage,progress){testing.setStage(stage,progress);},update(time){dynamics.update(time);testing.update(time);}};
}
