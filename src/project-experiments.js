import {createRobotExperiment,createRadarExperiment,planTrajectories} from './experiment-models.js';
import {stories} from './project-stories.js';
export function createProjectExperiments(onAction,onComplete){
 const panel=document.getElementById('experiment-panel'),canvas=document.getElementById('experiment-canvas'),ctx=canvas.getContext('2d'),controls=document.getElementById('experiment-controls'),result=document.getElementById('experiment-result');
 let id=null,model=null,running=false,active=false,last=0,acc=0,done=false,phase=0,plan=null;
 const button=(name,action)=>{const b=document.createElement('button');b.type='button';b.textContent=name;b.addEventListener('click',action);controls.append(b);return b;};
 const choose=(name,options,action)=>{const label=document.createElement('label');label.textContent=name;const select=document.createElement('select');for(const [value,text] of options){const o=document.createElement('option');o.value=value;o.textContent=text;select.append(o);}select.addEventListener('change',()=>action(select.value));select.setAttribute('aria-label',name);label.append(select);controls.append(label);return select;};
 const action=()=>onAction(id);
 function complete(){if(done)return;done=true;onComplete(id);}
 const dot=(x,y,color,r=5)=>{ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();};
 const line=(points,color,width=2)=>{if(!points.length)return;ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach((p,i)=>i?ctx.lineTo(...p):ctx.moveTo(...p));ctx.stroke();};
 function background(){ctx.fillStyle='#102b3b';ctx.fillRect(0,0,720,440);ctx.strokeStyle='#244454';ctx.lineWidth=1;for(let x=0;x<720;x+=40){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,440);ctx.stroke();}for(let y=0;y<440;y+=40){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(720,y);ctx.stroke();}}
 function draw(){
  background();ctx.font='15px Arial';ctx.textAlign='left';
  if(id==='jetracer'){
   const s=model.state,point=([x,y])=>[38+x*37,22+y*34];
   for(const cell of s.blocked){const [x,y]=point(cell.split(',').map(Number));ctx.fillStyle='#687f89';ctx.fillRect(x-15,y-14,30,28);}
   line(s.route.map(point),'#70ddc1',3);const [gx,gy]=point([16,1]);dot(gx,gy,'#e9c36c',11);ctx.fillStyle='#f8e8b6';ctx.fillText('ZIEL',gx-19,gy+30);
   const [x,y]=point(s.position);ctx.strokeStyle='#67cbd3';ctx.beginPath();ctx.arc(x,y,67,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#f1be72';ctx.fillRect(x-12,y-9,24,18);dot(x+7,y,'#fff7d8',3);
   result.textContent=s.done?'Ziel erreicht. Der Weg wurde um die belegten Zellen herum geplant.':s.running?`Roboter fährt · Route mit ${s.route.length} Wegpunkten`:s.obstacle?'Durchfahrt versperrt: Die Route führt außen herum.':'Freie Durchfahrt: Der Roboter kann durch die Lücke fahren.';
   if(s.done&&s.obstacle)complete();
  }else if(id==='radar'){
   const s=model.state,p=v=>[300+v[0]*42,220+v[1]*55];
   line(s.history.map(h=>p(h.truth)),'#668398',2);for(const h of s.history)if(h.raw)dot(...p(h.raw),'#eca879',2.5);line(s.history.map(h=>p(h.filtered)),'#83edc7',3);
   const h=s.history.at(-1);if(h){dot(...p(h.truth),'#e2edf6',6);dot(...p(h.filtered),'#83edc7',7);}
   ctx.fillStyle='#e6b58e';ctx.fillText('● Messung',25,30);ctx.fillStyle='#83edc7';ctx.fillText('━ Kalman-Schätzung',170,30);ctx.fillStyle='#a9bdca';ctx.fillText('━ Referenz',395,30);
   result.textContent=s.gap?`Sensor aus: noch ${s.remaining.toFixed(1)} s · Filter sagt Bewegung voraus`:s.history.length?`${running?'Messung läuft':'Messung pausiert'} · Positions-RMSE: Messung ${s.rawError.toFixed(2)} · Filter ${s.filterError.toFixed(2)} Modelleinheiten`:'Starte die Messung. Orange Punkte sind verrauscht, Grün zeigt die Filter-Schätzung.';
   if(s.completed)complete();
  }else if(id==='frenet'){
   const p=v=>[360+v.x*30,220+v.y*48];
   for(const c of plan.candidates)line(c.points.map(p),c.safe?'#486e74':'#754a49',1);
   ctx.fillStyle='#d18f7b';ctx.fillRect(324,plan.wall?35:220+plan.obstacle*48-26,72,plan.wall?370:52);
   ctx.strokeStyle='#e9b59b';ctx.setLineDash([6,5]);ctx.strokeRect(324-plan.margin*30,plan.wall?30:220+plan.obstacle*48-26-plan.margin*48,72+plan.margin*60,plan.wall?380:52+plan.margin*96);ctx.setLineDash([]);
   if(plan.selected){line(plan.selected.points.map(p),'#8deac3',4);const point=p(plan.selected.points[Math.floor(phase)%101]);dot(...point,'#fff0bc',9);}
   ctx.fillStyle='#bbd2dc';ctx.fillText('START',40,245);ctx.fillText('ZIEL',650,245);
   const safe=plan.candidates.filter(c=>c.safe).length;
   result.textContent=plan.selected?`${safe} von 21 Kandidaten kollisionsfrei · Grün: Bahn mit niedrigsten Kosten`:'Keine sichere Bahn: Das Fahrzeug bleibt stehen. Hindernis ändern oder Abstand reduzieren.';
  }
 }
 function open(next){
  id=next;active=['jetracer','radar','frenet'].includes(id);panel.hidden=!active;controls.replaceChildren();done=false;running=false;phase=0;acc=0;last=0;
  if(!active)return;canvas.setAttribute('aria-label',`${id==='jetracer'?'Roboter und geplante Route':id==='radar'?'Radarmessungen und Kalman-Schätzung':'Trajektorienkandidaten und Hindernis'}. Ergebnisse stehen unter der Grafik.`);document.getElementById('experiment-task').textContent=stories[id].task;
  if(id==='jetracer'){
   model=createRobotExperiment();button('Roboter starten',()=>{model.start();action();draw();});const toggle=button('Durchfahrt versperren',()=>{model.toggle();toggle.textContent=model.state.obstacle?'Durchfahrt freigeben':'Durchfahrt versperren';done=false;action();draw();});
  }else if(id==='radar'){
   model=createRadarExperiment();const run=button('Messung starten',()=>{running=!running;run.textContent=running?'Messung pausieren':'Messung fortsetzen';action();draw();});
   const noise=choose('Messrauschen',[['0.6','Mittel'],['0.15','Gering'],['1.5','Stark'],['2.5','Sehr stark']],value=>{model.setNoise(value);done=false;action();draw();});
   button('Sensor 4 s ausschalten',()=>{running=true;run.textContent='Messung pausieren';model.dropout();action();draw();});
  }else{
   let obstacle='0',margin=0.5;plan=planTrajectories(obstacle,margin);const recompute=()=>{plan=planTrajectories(obstacle,margin);phase=0;action();if(plan.selected)complete();draw();};
   choose('Hindernis',[['0','Mitte'],['-1.6','Linke Fahrbahnseite'],['1.6','Rechte Fahrbahnseite'],['wall','Ganze Fahrbahn gesperrt']],v=>{obstacle=v;recompute();});
   const label=document.createElement('label');label.textContent='Sicherheitsabstand';const range=document.createElement('input');range.type='range';range.setAttribute('aria-label','Sicherheitsabstand');range.min='0.2';range.max='1.5';range.step='0.1';range.value='0.5';const value=document.createElement('output');value.textContent='0.5';range.addEventListener('input',()=>{margin=Number(range.value);value.textContent=range.value;recompute();});label.append(range,value);controls.append(label);
  }draw();
 }
 function frame(now){requestAnimationFrame(frame);const visible=active&&document.getElementById('project-dialog').open&&!document.hidden;const dt=last?Math.min(0.1,(now-last)/1000):0;last=now;if(!visible)return;acc+=dt;if(acc<1/30)return;const step=acc;acc=0;if(id==='jetracer')model.update(step);if(id==='radar'&&running)model.update(step);if(id==='frenet'&&!window.matchMedia('(prefers-reduced-motion: reduce)').matches)phase=(phase+step*20)%101;draw();}
 requestAnimationFrame(frame);
 return {open,close(){active=false;running=false;}};
}
