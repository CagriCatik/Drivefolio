import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {circuitPoints,createLapTimer,distanceToCircuit} from './race-layout.js';

export function createRaceTrack(scene,vehicle){
  const points=circuitPoints(),n=points.length,vertices=[],indices=[],outer=[],inner=[];
  for(let i=0;i<n;i++){
    const prev=points[(i+n-1)%n],p=points[i],next=points[(i+1)%n],dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    for(const side of [-1,1])vertices.push(p.x+nx*3.8*side,0.08,p.z+nz*3.8*side);
    outer.push({x:p.x-nx*5.3,z:p.z-nz*5.3});inner.push({x:p.x+nx*4.15,z:p.z+nz*4.15});
    const a=i*2,b=((i+1)%n)*2;indices.push(a,a+1,b,a+1,b+1,b);
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const asphalt=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:'#354753',roughness:0.92,side:THREE.DoubleSide}));asphalt.receiveShadow=true;scene.add(asphalt);
  const borderMaterials=[mat('#e25e61'),mat('#e6eef0')],barrier=mat('#7895a4');
  for(let i=0;i<n;i+=3){
    const p=points[i],q=points[(i+3)%n],angle=Math.atan2(-(q.z-p.z),q.x-p.x),length=Math.hypot(q.x-p.x,q.z-p.z);
    const prev=points[(i+n-1)%n],next=points[(i+1)%n],dx=next.x-prev.x,dz=next.z-prev.z,len=Math.hypot(dx,dz),nx=-dz/len,nz=dx/len;
    for(const side of [-1,1]){
      // Open barriers and edge paint where the access roads meet the circuit.
      const access=Math.abs(p.x)>40&&Math.abs(p.z-5)<5||Math.abs(p.z-31)<1&&Math.abs(p.x)<5;
      if(!access){const curb=block(scene,length*0.98,0.08,0.65,p.x+nx*4.05*side,0.07,p.z+nz*4.05*side,borderMaterials[Math.floor(i/3)%2]);curb.rotation.y=angle;}
    }
    const o=outer[i],access=Math.abs(o.x)>40&&Math.abs(o.z-5)<5||Math.abs(p.z-31)<1&&Math.abs(p.x)<5;
    if(!access){
      const rail=block(scene,length,0.45,0.16,o.x,0.65,o.z,barrier);rail.rotation.y=angle;
      block(scene,0.12,0.8,0.12,o.x,0.4,o.z,barrier);vehicle.addBarrier(o.x,o.z,length/2,0.12,angle);
    }
    if(i%9===0){const marker=block(scene,1.1,0.012,0.1,p.x,0.095,p.z,mat('#9fb5bc'));marker.rotation.y=angle;}
  }
  // Start/finish, grid boxes and an overhead timing gantry on the south straight.
  for(let row=0;row<8;row++)for(let col=0;col<2;col++)block(scene,0.55,0.015,0.95,-12.55+col*0.55,0.105,27.7+row*0.95,mat((row+col)%2?'#eff5f6':'#24343d'));
  for(const z of [26.6,35.6])block(scene,0.18,4.0,0.18,-12,2,z,barrier);
  block(scene,0.32,0.55,9.2,-12,4.1,31,mat('#284557'));
  const gantry=label(scene,'CAMPUS CIRCUIT',-11.8,4.1,31,7,'#d9fff3');gantry.rotation.y=Math.PI/2;
  for(let i=0;i<5;i++){const light=new THREE.Mesh(new THREE.SphereGeometry(0.1,8,6),new THREE.MeshStandardMaterial({color:'#72e8b4',emissive:'#2bc998',emissiveIntensity:1}));light.position.set(-12,3.65,29.4+i*0.8);scene.add(light);}
  for(let i=0;i<6;i++){
    const x=-5+i*3;
    for(const z of [29,33]){block(scene,1.4,0.015,0.09,x,0.10,z,mat('#b6cdd4'));block(scene,0.09,0.015,1.1,x-0.7,0.10,z+0.5,mat('#b6cdd4'));}
  }
  // Grandstand outside the east straight, tire walls and marshal cabins.
  for(let row=0;row<3;row++){
    block(scene,1.1,0.5+row*0.45,12,50+row*1.05,(0.5+row*0.45)/2,-21,mat('#92aab6'));
    for(let j=0;j<8;j++)block(scene,0.65,0.2,0.65,50+row*1.05,0.65+row*0.45,-26+j*1.5,mat(j%2?'#377b91':'#d4e4e8'));
  }
  for(const [x,z] of [[-49,-51],[49,17]]){
    block(scene,2.2,1.8,2.4,x,0.9,z,mat('#d7e5e9'));block(scene,2.5,0.16,2.7,x,1.88,z,mat('#31596c'));block(scene,1.8,0.55,0.05,x,1.3,z+1.23,mat('#4e92ac'));vehicle.addObstacle(x,z,1.1,1.2);
  }
  const rubber=mat('#273740');
  for(const [cx,cz] of [[-34,-67],[34,-67],[-35,36],[35,36]])for(let i=0;i<5;i++){
    const tire=new THREE.Mesh(new THREE.TorusGeometry(0.3,0.14,6,12),rubber);tire.rotation.x=Math.PI/2;tire.position.set(cx+i*0.6,0.24,cz);scene.add(tire);
  }
  const nightLights=[];
  for(const [x,z] of [[-49,-36],[49,-36],[-25,37],[25,-69]]){
    block(scene,0.16,6,0.16,x,3,z,barrier);block(scene,2,0.35,0.6,x,6,z,mat('#d0e6ec'));
    const light=new THREE.PointLight('#a9d8ff',0,28,1.4);light.position.set(x,5.5,z);scene.add(light);nightLights.push(light);
  }
  const timer=createLapTimer(),hud=document.getElementById('race-hud'),format=t=>`${Math.floor(t/60).toString().padStart(2,'0')}:${(t%60).toFixed(1).padStart(4,'0')}`;
  return {setNight(value){nightLights.forEach(l=>l.intensity=value?45:0);},reset:timer.reset,update(dt,paused){
    const state=timer.update(paused?0:dt,vehicle.group.position,paused?0:vehicle.speed);
    hud.hidden=distanceToCircuit(vehicle.group.position,points)>13&&!state.running;
    document.getElementById('race-time').textContent=state.running?format(state.elapsed):'START / ZIEL';
    document.getElementById('race-best').textContent=state.best===null?'Rundkurs · Campus-Zufahrten bei den Querstraßen':`Bestzeit ${format(state.best)} · ${state.laps} Runden`;
  }};
}
