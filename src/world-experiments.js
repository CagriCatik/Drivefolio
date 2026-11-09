import * as THREE from 'three';
import {createRobotExperiment,createRadarExperiment,planTrajectories} from './experiment-models.js';
import {mat,block,label} from './scene-primitives.js';
export function createWorldExperiments(scene,onAction,onComplete){
 const panel=document.getElementById('world-lab'),controls=document.getElementById('world-lab-controls'),status=document.getElementById('world-lab-status');
 let group=null,project=null,original=null,model=null,tick=null,completed=false;
 const addButton=(text,action)=>{const b=document.createElement('button');b.textContent=text;b.addEventListener('click',action);controls.append(b);return b;};
 const addSelect=(name,options,action)=>{const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');select.setAttribute('aria-label',name);for(const [v,t] of options){const o=document.createElement('option');o.value=v;o.textContent=t;select.append(o);}select.addEventListener('change',()=>action(select.value));label.append(select);controls.append(label);return select;};
 const acted=()=>onAction(project.id),complete=()=>{if(!completed){completed=true;onComplete(project.id);}};
 function line(points,color){const g=new THREE.BufferGeometry().setFromPoints(points),mesh=new THREE.Line(g,new THREE.LineBasicMaterial({color,transparent:true,opacity:0.8}));group.add(mesh);return mesh;}
 function close(){
  if(original){original.visible=true;original=null;}
  if(group){const geometries=new Set(),materials=new Set(),textures=new Set();group.traverse(n=>{if(n.geometry)geometries.add(n.geometry);if(n.material)for(const m of Array.isArray(n.material)?n.material:[n.material]){materials.add(m);if(m.map)textures.add(m.map);}});group.removeFromParent();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}
  group=null;project=null;model=null;tick=null;panel.hidden=true;controls.replaceChildren();
 }
 function open(p){
  close();project=p;completed=false;original=scene.getObjectByName('station-'+p.id);if(original)original.visible=false;
  group=new THREE.Group();group.position.set(p.position.x,0,p.position.z);scene.add(group);
  block(group,13.5,0.08,10.6,0,0.08,0,mat('#cad4c7'));
  const grid=new THREE.GridHelper(10,20,'#799c91','#a9bdb2');grid.position.y=0.13;group.add(grid);
  label(group,p.title.toUpperCase(),0,0.15,-4.9,11,'#305957').rotation.x=-Math.PI/2;
  document.getElementById('world-lab-title').textContent=p.title+' / 3D-EXPERIMENT';panel.hidden=false;
  if(p.id==='jetracer'){
   model=createRobotExperiment();const map=([x,z])=>new THREE.Vector3((x-8.5)*0.63,0.2,(z-5.5)*0.75),obstacles=new THREE.Group();group.add(obstacles);
   const route=line(model.state.route.map(map),'#3e9587'),robot=new THREE.Group();group.add(robot);block(robot,0.45,0.24,0.6,0,0.21,0,mat('#d4b47d'));block(robot,0.25,0.15,0.2,0,0.4,0,mat('#385b61'));
   const goal=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.23,0.2,12),mat('#d2ae6b'));goal.position.copy(map([16,1]));group.add(goal);
   function rebuild(){const old=[...obstacles.children];for(const n of old){n.removeFromParent();n.geometry.dispose();n.material.dispose();}for(const key of model.state.blocked){const v=map(key.split(',').map(Number));block(obstacles,0.53,0.6,0.63,v.x,0.43,v.z,mat('#738986'));}route.geometry.dispose();route.geometry=new THREE.BufferGeometry().setFromPoints(model.state.route.map(map));}
   rebuild();addButton('Roboter starten',()=>{model.start();acted();});const toggle=addButton('Durchfahrt versperren',()=>{model.toggle();toggle.textContent=model.state.obstacle?'Durchfahrt freigeben':'Durchfahrt versperren';rebuild();acted();});
   tick=dt=>{const previous=map(model.state.position);model.update(dt);const s=model.state,v=map(s.position);if(v.distanceToSquared(previous)>0.000001)robot.rotation.y=Math.atan2(v.x-previous.x,v.z-previous.z);robot.position.set(v.x,0.15,v.z);status.textContent=s.done?'Ziel erreicht – Route um das Hindernis gefunden.':s.running?'Roboter folgt der neu berechneten Route.':s.obstacle?'Durchfahrt zu: Die Route führt außen herum.':'Durchfahrt offen. Starte den Roboter.';if(s.done&&s.obstacle)complete();};
  }else if(p.id==='radar'){
   model=createRadarExperiment();let running=false;
   const count=150,rawPositions=new Float32Array(count*3),filteredPositions=new Float32Array(count*3),rawG=new THREE.BufferGeometry(),filterG=new THREE.BufferGeometry();rawG.setAttribute('position',new THREE.BufferAttribute(rawPositions,3));filterG.setAttribute('position',new THREE.BufferAttribute(filteredPositions,3));
   group.add(new THREE.Points(rawG,new THREE.PointsMaterial({color:'#c28760',size:0.12})));const track=new THREE.Line(filterG,new THREE.LineBasicMaterial({color:'#267c70'}));track.frustumCulled=false;group.add(track);
   const marker=new THREE.Mesh(new THREE.SphereGeometry(0.16,10,8),mat('#d8b676'));group.add(marker);
   const play=addButton('Messung starten',()=>{running=!running;play.textContent=running?'Pausieren':'Fortsetzen';acted();});
   addSelect('Messrauschen',[['0.6','Mittel'],['0.15','Gering'],['1.5','Stark'],['2.5','Sehr stark']],v=>{model.setNoise(v);acted();});
   addButton('Sensor 4 s ausschalten',()=>{model.dropout();running=true;play.textContent='Pausieren';acted();});
   tick=dt=>{if(running)model.update(dt);const s=model.state,raw=s.history.filter(h=>h.raw),hist=s.history;for(let i=0;i<raw.length;i++)rawPositions.set([raw[i].raw[0]*0.65,0.21,raw[i].raw[1]*0.65],i*3);for(let i=0;i<hist.length;i++)filteredPositions.set([hist[i].filtered[0]*0.65,0.24,hist[i].filtered[1]*0.65],i*3);rawG.setDrawRange(0,raw.length);filterG.setDrawRange(0,hist.length);rawG.attributes.position.needsUpdate=true;filterG.attributes.position.needsUpdate=true;rawG.computeBoundingSphere();filterG.computeBoundingSphere();const h=hist.at(-1);marker.visible=!!h;if(h)marker.position.set(h.truth[0]*0.65,0.24,h.truth[1]*0.65);status.textContent=s.gap?`Sensor aus: ${s.remaining.toFixed(1)} s – Filter sagt voraus.`:hist.length?`Positions-RMSE: Messung ${s.rawError.toFixed(2)} · Filter ${s.filterError.toFixed(2)} Modelleinheiten`:'Orange: Messungen · Grün: Kalman-Schätzung · Gold: Referenz';if(s.completed)complete();};
  }else{
   let obstacle='0',margin=0.5,phase=0,plan=planTrajectories(obstacle,margin),lines=[];
   const car=block(group,0.6,0.3,0.32,-5.5,0.3,0,mat('#d2ad75')),blocker=block(group,1.32,0.7,0.94,0,0.48,0,mat('#a77b69'));
   function rebuild(){for(const n of lines){n.removeFromParent();n.geometry.dispose();n.material.dispose();}lines=[];plan=planTrajectories(obstacle,margin);blocker.scale.z=plan.wall?8:1;blocker.position.z=plan.obstacle*0.85;for(const c of plan.candidates){const n=line(c.points.map(v=>new THREE.Vector3(v.x*0.55,0.17,v.y*0.85)),c===plan.selected?'#287c67':c.safe?'#8bad9c':'#b18d81');n.material.opacity=c===plan.selected?1:0.35;lines.push(n);}phase=0;car.position.set(-5.5,0.35,0);}
   addSelect('Hindernis',[['0','Mitte'],['-1.6','Links'],['1.6','Rechts'],['wall','Fahrbahn gesperrt']],v=>{obstacle=v;rebuild();acted();if(plan.selected)complete();});
   addSelect('Sicherheitsabstand',[['0.5','0.5'],['0.2','0.2'],['1','1.0'],['1.5','1.5']],v=>{margin=Number(v);rebuild();acted();if(plan.selected)complete();});
   rebuild();tick=dt=>{if(plan.selected){phase=(phase+dt*18)%101;const index=Math.floor(phase),v=plan.selected.points[index],next=plan.selected.points[Math.min(100,index+1)];car.position.set(v.x*0.55,0.35,v.y*0.85);car.rotation.y=-Math.atan2((next.y-v.y)*0.85,(next.x-v.x)*0.55);}status.textContent=plan.selected?`${plan.candidates.filter(c=>c.safe).length} / 21 Bahnen kollisionsfrei · Grün: niedrigste Kosten`:'Keine sichere Bahn – Fahrzeug bleibt stehen.';};
  }
  tick(0);document.getElementById('world-lab-close').focus();
 }
 return {get active(){return !!project;},get project(){return project;},open,close,update(dt){if(tick)tick(Math.min(dt,0.1));}};
}
