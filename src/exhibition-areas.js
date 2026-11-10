import {createNeonBoard} from './neon-board.js';
import {createAIPavilion} from './ai-pavilion.js';
import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';

const glow=color=>new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.9,roughness:0.5});
function line(parent,points,color,opacity=1){
  const geometry=new THREE.BufferGeometry().setFromPoints(points.map(p=>new THREE.Vector3(...p)));
  const mesh=new THREE.Line(geometry,new THREE.LineBasicMaterial({color,transparent:opacity<1,opacity}));parent.add(mesh);return mesh;
}
function orb(parent,radius,color,x,y,z){
  const mesh=new THREE.Mesh(new THREE.SphereGeometry(radius,10,8),glow(color));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
function station(scene,vehicle,x,z,title,subtitle,color,width=14,depth=12){
  const group=new THREE.Group();group.name=x===-15&&z===-28?'station-radar':'station-'+title;group.position.set(x,0,z);scene.add(group);
  block(group,width,0.08,depth,0,0.02,0,mat(color));
  block(group,width,2.7,0.25,0,1.35,-depth/2,mat('#344e60'));
  createNeonBoard(group,{title,subtitle,y:1.45,z:-depth/2+0.22});
  vehicle.addObstacle(x,z-depth/2,width/2,0.15);
  const entry=label(group,'E  /  DEMO STARTEN',0,0.12,8,6,'#365a6b');entry.rotation.x=-Math.PI/2;
  for(const sx of [-width/2+0.3,width/2-0.3]){
    block(group,0.22,1.2,0.22,sx,0.6,depth/2,mat('#3c6271'));
    orb(group,0.17,'#d4edca',sx,1.25,depth/2);
  }
  return group;
}

function createRadar(scene,vehicle){
  const group=station(scene,vehicle,-15,-28,'RADAR TRACK BENCH','MESSEN  /  FILTERN  /  VERFOLGEN','#bbcdd4');
  const shell=mat('#e3ecef'),trim=mat('#365668');
  block(group,3.1,2.1,1.5,4.2,1.05,-4.4,shell);
  block(group,3.4,0.16,1.8,4.2,2.18,-4.4,trim);
  block(group,2.7,0.85,0.04,4.2,1.25,-3.62,new THREE.MeshStandardMaterial({color:'#6aa8bf',metalness:0.25,roughness:0.2}));
  for(let i=0;i<3;i++)block(group,0.07,0.95,0.08,3.3+i*0.9,1.25,-3.57,trim);
  label(group,'TRACKING CONTROL',4.2,1.94,-3.55,2.6,'#315463');
  const trackingStatus=label(group,'FAHRZEUG ERFASST',0,0.14,5.2,5.5,'#24746e');trackingStatus.rotation.x=-Math.PI/2;trackingStatus.visible=false;
  vehicle.addObstacle(-10.8,-32.4,1.55,0.75);
  const beamPositions=new Float32Array(6),beamGeometry=new THREE.BufferGeometry();beamGeometry.setAttribute('position',new THREE.BufferAttribute(beamPositions,3));
  const beam=new THREE.Line(beamGeometry,new THREE.LineBasicMaterial({color:'#59cdbb',transparent:true,opacity:0.3}));beam.frustumCulled=false;group.add(beam);
  const tower=new THREE.Group();tower.position.set(-3.6,0,-1.3);group.add(tower);
  block(tower,2.8,0.28,2.8,0,0.18,0,mat('#68798b'));
  for(const x of [-0.8,0.8])for(const z of [-0.8,0.8]){
    const leg=block(tower,0.18,3.2,0.18,x,1.75,z,mat('#d2cab8'));leg.rotation.z=-x*0.16;
  }
  const antenna=new THREE.Group();antenna.position.y=3.5;tower.add(antenna);
  const dishPoints=[];for(let i=0;i<=16;i++){const r=i/16*1.9;dishPoints.push(new THREE.Vector2(r,r*r*0.23));}
  const dish=new THREE.Mesh(new THREE.LatheGeometry(dishPoints,28),new THREE.MeshStandardMaterial({color:'#e9dfcc',side:THREE.DoubleSide,roughness:0.6,metalness:0.15}));
  dish.rotation.x=0.85;antenna.add(dish);
  const rim=new THREE.Mesh(new THREE.TorusGeometry(1.9,0.055,6,40),mat('#8799ab'));rim.rotation.x=Math.PI/2;rim.position.y=0.83;dish.add(rim);
  const feed=block(dish,0.08,1.6,0.08,0,0.8,0,mat('#596b81'));orb(feed,0.14,'#a0ffe0',0,0.9,0);
  vehicle.addObstacle(-18.6,-29.3,1.4,1.4);
  // A horizontal tracking table stays readable from the fixed aerial camera.
  const board=new THREE.Group();board.position.set(2.7,0,0.5);group.add(board);
  block(board,5.2,0.65,6,0,0.35,0,mat('#344959'));
  const disc=new THREE.Mesh(new THREE.CircleGeometry(2.3,48),mat('#254d54'));disc.rotation.x=-Math.PI/2;disc.position.y=0.69;board.add(disc);
  for(const r of [0.75,1.5,2.2]){
    const points=[];for(let i=0;i<=64;i++){const t=i/64*Math.PI*2;points.push([Math.cos(t)*r,0.71,Math.sin(t)*r]);}line(board,points,'#609489',0.6);
  }
  line(board,[[-2.3,0.72,0],[2.3,0.72,0]],'#609489',0.6);line(board,[[0,0.72,-2.3],[0,0.72,2.3]],'#609489',0.6);
  label(group,'MESSUNG  /  FILTERSPUR',2.7,0.15,4.2,4.4,'#355b69').rotation.x=-Math.PI/2;
  const sweep=line(board,[[0,0.74,0],[2.25,0.74,0]],'#b6ffb3');
  const rawGeometry=new THREE.BufferGeometry(),filteredGeometry=new THREE.BufferGeometry();
  const raw=new Float32Array(48*3),filtered=new Float32Array(48*3);
  rawGeometry.setAttribute('position',new THREE.BufferAttribute(raw,3));filteredGeometry.setAttribute('position',new THREE.BufferAttribute(filtered,3));
  const noisy=new THREE.Points(rawGeometry,new THREE.PointsMaterial({color:'#ffbc84',size:0.10}));noisy.frustumCulled=false;board.add(noisy);
  const track=new THREE.Line(filteredGeometry,new THREE.LineBasicMaterial({color:'#b3ffe2'}));track.frustumCulled=false;board.add(track);
  const target=new THREE.Group();group.add(target);orb(target,0.16,'#ffe9a4',0,0,0);
  block(target,1.1,0.08,0.15,0,0,0,mat('#e7d7b3'));block(target,0.15,0.08,0.9,0,0,0,mat('#e7d7b3'));
  vehicle.addObstacle(-12.3,-27.5,2.6,3);
  let last=-1,previousTime=0,smoothedX=0,smoothedZ=0;
  const history=[];
  return {update(time){
    const dt=Math.min(0.1,time-previousTime);previousTime=time;
    const dx=vehicle.group.position.x+15,dz=vehicle.group.position.z+28,near=Math.hypot(dx,dz)<18;
    trackingStatus.visible=near;beam.visible=near;
    if(near){
      const desired=Math.atan2(-dx-3.6,-dz-1.3),delta=Math.atan2(Math.sin(desired-antenna.rotation.y),Math.cos(desired-antenna.rotation.y));antenna.rotation.y+=delta*(1-Math.exp(-4*dt));
      beamPositions.set([-3.6,3.5,-1.3,dx,0.5,dz]);beamGeometry.attributes.position.needsUpdate=true;
    }else antenna.rotation.y+=dt*0.65;
    sweep.rotation.y=-time*1.1;
    target.position.set(Math.cos(time*0.55)*4,4.4+Math.sin(time)*0.25,Math.sin(time*0.55)*2);
    target.rotation.y=-time*0.55;
    if(time-last<0.08)return;last=time;
    const measurementX=near?THREE.MathUtils.clamp(dx/8,-2.1,2.1):Math.cos(time*0.55)*1.8;
    const measurementZ=near?THREE.MathUtils.clamp(dz/8,-2.1,2.1):Math.sin(time*0.55)*1.35;
    smoothedX=THREE.MathUtils.lerp(smoothedX,measurementX,0.35);smoothedZ=THREE.MathUtils.lerp(smoothedZ,measurementZ,0.35);
    history.push({x:measurementX+Math.sin(time*21)*0.16,z:measurementZ+Math.cos(time*17)*0.16,sx:smoothedX,sz:smoothedZ});if(history.length>48)history.shift();
    for(let i=0;i<48;i++){
      const sample=history[Math.min(i,history.length-1)];filtered.set([sample.sx,0.77,sample.sz],i*3);raw.set([sample.x,0.8,sample.z],i*3);
    }
    rawGeometry.attributes.position.needsUpdate=true;filteredGeometry.attributes.position.needsUpdate=true;
  }};
}

function createAutonomy(scene,vehicle){
  const group=station(scene,vehicle,15,-28,'AUTONOMY FIELD','LIDAR  /  MAP  /  PLAN  /  MPC','#cbd7c7');
  const tiles=new THREE.InstancedMesh(new THREE.BoxGeometry(0.62,0.025,0.62),mat('#8e907c'),196);
  const dummy=new THREE.Object3D();const cells=[];
  for(let row=0;row<14;row++)for(let col=0;col<14;col++){
    const x=(col-6.5)*0.69,z=(row-6.5)*0.69;dummy.position.set(x,0.10,z);dummy.updateMatrix();tiles.setMatrixAt(row*14+col,dummy.matrix);cells.push({x,z});tiles.setColorAt(row*14+col,new THREE.Color('#8e907c'));
  }
  group.add(tiles);
  const obstacles=[[-1.8,0,1.5,2],[2.3,-2.6,1.5,1.2],[2.5,2,1.4,1]];
  for(const [x,z,w,d] of obstacles){block(group,w,0.9,d,x,0.55,z,mat('#7c786d'));vehicle.addObstacle(15+x,-28+z,w/2,d/2);}
  const waypoints=[[-4,3],[-4,-3.8],[0,-3.8],[0,0],[4.2,0],[4.2,3.8],[-4,3.8],[-4,3]];
  const route=new THREE.CurvePath();
  for(let i=1;i<waypoints.length;i++)route.add(new THREE.LineCurve3(new THREE.Vector3(waypoints[i-1][0],0.17,waypoints[i-1][1]),new THREE.Vector3(waypoints[i][0],0.17,waypoints[i][1])));
  const path=line(group,route.getSpacedPoints(160).map(v=>v.toArray()),'#f9edb3',0.8);
  const car=new THREE.Group();group.add(car);
  block(car,0.52,0.2,0.95,0,0.26,0,mat('#d9935f'));block(car,0.38,0.2,0.4,0,0.45,-0.1,mat('#3e5d5a'));
  for(const x of [-0.3,0.3])for(const z of [-0.3,0.3])block(car,0.14,0.25,0.24,x,0.19,z,mat('#41434a'));
  orb(car,0.1,'#aeffdf',0,0.65,0);
  const raysGeometry=new THREE.BufferGeometry(),rays=new Float32Array(24*6);raysGeometry.setAttribute('position',new THREE.BufferAttribute(rays,3));
  const scan=new THREE.LineSegments(raysGeometry,new THREE.LineBasicMaterial({color:'#b4ffe0',transparent:true,opacity:0.35}));scan.frustumCulled=false;group.add(scan);
  const status=label(group,'ILLUSTRATIVE KARTIERUNGS-DEMO',0,0.13,5.5,9,'#655941');status.rotation.x=-Math.PI/2;
  let last=-1,progress=null,revealed=new Set();const color=new THREE.Color();
  return {setDemo(stage,p){progress=stage<0?null:p;if(stage===0&&p<0.03)revealed.clear();},update(time){
    const t=progress===null?(time*0.035)%1:progress,p=route.getPointAt(Math.min(t,0.9999)),ahead=route.getPointAt(Math.min(t+0.006,1));
    car.position.copy(p);car.rotation.y=Math.atan2(ahead.x-p.x,ahead.z-p.z);
    if(time-last<0.1)return;last=time;
    cells.forEach((cell,i)=>{
      if(Math.hypot(cell.x-p.x,cell.z-p.z)<2.1)revealed.add(i);
      const occupied=obstacles.some(([x,z,w,d])=>Math.abs(cell.x-x)<w/2+0.2&&Math.abs(cell.z-z)<d/2+0.2);
      color.set(revealed.has(i)?(occupied?'#526874':'#bfd5ac'):'#8e907c');tiles.setColorAt(i,color);
    });tiles.instanceColor.needsUpdate=true;
    for(let i=0;i<24;i++){
      const a=i/24*Math.PI*2,dx=Math.cos(a),dz=Math.sin(a);let distance=2.4;
      // Intersect scan rays with the same axis-aligned props shown in the scene.
      for(let r=0.1;r<=2.4;r+=0.1){const x=p.x+dx*r,z=p.z+dz*r;if(obstacles.some(([ox,oz,w,d])=>Math.abs(x-ox)<w/2&&Math.abs(z-oz)<d/2)){distance=r;break;}}
      rays.set([p.x,0.65,p.z,p.x+dx*distance,0.65,p.z+dz*distance],i*6);
    }raysGeometry.attributes.position.needsUpdate=true;path.material.opacity=0.6+Math.sin(time*2)*0.2;
  }};
}

function createAgents(scene,vehicle){
  const group=station(scene,vehicle,0,-49,'AGENT SWARM','AI AGENTS  /  MCP  /  A2A','#c0ccd9',16);
  const pavilion=createAIPavilion(group,vehicle);
  const frame=mat('#564867');
  const nodes=[[-5,1,'ANALYST'],[-5,-2.5,'KNOWLEDGE'],[5,1,'EXECUTOR'],[5,-2.5,'REVIEWER']];
  const lights=[],packets=[];
  for(const [i,[x,z,name]] of nodes.entries()){
    block(group,2.3,0.65,1.6,x,0.35,z,frame);
    const screen=block(group,1.9,1.2,0.14,x,1.2,z-0.55,glow('#b9a2e4'));lights.push(screen.material);
    label(group,name,x,1.25,z-0.45,1.7);
    vehicle.addObstacle(x,-49+z,1.15,0.8);
    const a=new THREE.Vector3(0,0.2,1.4),b=new THREE.Vector3(x,0.2,z);
    line(group,[a.toArray(),b.toArray()],'#d3a7f1',0.8);
    const c=new THREE.Vector3(0,0.23,-3.8);line(group,[b.toArray(),c.toArray()],'#9de7cf',0.8);
    packets.push({mesh:orb(group,0.13,'#edc4ff',0,0,0),a,b,index:i,kind:'a2a'});
    packets.push({mesh:orb(group,0.11,'#b5ffe0',0,0,0),a:b,b:c,index:i,kind:'mcp'});
  }
  block(group,2,0.7,2,0,0.4,1.4,frame);vehicle.addObstacle(0,-47.6,1,1);
  const core=new THREE.Mesh(new THREE.IcosahedronGeometry(0.8,0),new THREE.MeshStandardMaterial({color:'#d5bbeb',emissive:'#a17cc4',emissiveIntensity:0.6,wireframe:true}));core.position.set(0,1.7,1.4);group.add(core);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(1.05,0.035,6,40),glow('#f1c0f9'));ring.rotation.x=Math.PI/2;ring.position.copy(core.position);group.add(ring);
  label(group,'COORDINATOR',0,0.13,3.4,3.3,'#584764').rotation.x=-Math.PI/2;
  block(group,3,1.4,1.0,0,0.7,-3.8,frame);vehicle.addObstacle(0,-52.8,1.5,0.5);
  for(let i=0;i<4;i++)block(group,2.6,0.06,0.05,0,0.3+i*0.3,-3.27,glow('#a6e9d4'));
  label(group,'MCP TOOLS',0,1.8,-3.3,3.1,'#d4ffe9');
  label(group,'A2A  /  AGENTEN-NACHRICHTEN',-3.7,0.13,5.2,5.6,'#644d79').rotation.x=-Math.PI/2;
  label(group,'MCP  /  WERKZEUGAUFRUFE',3.7,0.13,5.2,5.3,'#365f55').rotation.x=-Math.PI/2;
  let stage=-1;
  return {setNight(value){pavilion.setNight(value);},setDemo(next){stage=next;},update(time){
    core.rotation.y=time*0.6;core.rotation.z=Math.sin(time)*0.2;ring.rotation.z=time*0.3;
    lights.forEach((m,i)=>{const selected=stage<0?Math.floor(time*0.5)%4:stage;m.emissiveIntensity=i===selected?1.5:0.2;});
    packets.forEach(p=>{const selected=stage<0?Math.floor(time*0.5)%4:stage;p.mesh.visible=p.index===selected;p.mesh.position.lerpVectors(p.a,p.b,(time*(p.kind==='mcp'?0.8:0.65)+p.index*0.2)%1);p.mesh.position.y+=0.08;});
  }};
}

export function createExhibitions(scene,vehicle){
  const areas={radar:createRadar(scene,vehicle),autonomy:createAutonomy(scene,vehicle),agents:createAgents(scene,vehicle)};
  return {setNight(value){areas.agents.setNight(value);},setDemo(id,stage,progress){Object.entries(areas).forEach(([key,area])=>area.setDemo?.(key===id?stage:-1,progress));},update(time){Object.values(areas).forEach(area=>area.update(time));}};
}
