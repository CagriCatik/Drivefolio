// Small browser-native teaching models. They do not execute the linked Python/ROS repositories.
export function gridPath(width,height,start,goal,blocked){
 const key=p=>p.join(','),queue=[start],parents=new Map([[key(start),null]]);let i=0;
 while(i<queue.length){const p=queue[i++];if(key(p)===key(goal)){const path=[];for(let q=p;q;q=parents.get(key(q)))path.unshift(q);return path;}
  for(const [dx,dy] of [[1,0],[0,-1],[-1,0],[0,1]]){const n=[p[0]+dx,p[1]+dy],k=key(n);if(n[0]<0||n[1]<0||n[0]>=width||n[1]>=height||blocked.has(k)||parents.has(k))continue;parents.set(k,p);queue.push(n);}}
 return [];
}
export function createRobotExperiment(){
 let obstacle=false,running=false,position=[1,10],route=[],index=0,done=false;
 const blocked=()=>{const cells=new Set();for(let y=1;y<11;y++)if(y!==6||obstacle)cells.add(`8,${y}`);if(obstacle)for(let x=3;x<8;x++)cells.add(`${x},6`);return cells;};
 function reset(){position=[1,10];index=0;done=false;route=gridPath(18,12,[1,10],[16,1],blocked());}
 reset();return {toggle(){obstacle=!obstacle;running=false;reset();},start(){reset();running=true;},update(dt){if(!running||!route.length)return;index=Math.min(route.length-1,index+dt*3.8);const a=route[Math.floor(index)],b=route[Math.min(route.length-1,Math.floor(index)+1)],f=index%1;position=[a[0]+(b[0]-a[0])*f,a[1]+(b[1]-a[1])*f];if(index>=route.length-1){running=false;done=true;}},get state(){return {position,route,blocked:blocked(),obstacle,running,done};}};
}
function axisFilter(position){
 let x=position,v=0,p00=4,p01=0,p10=0,p11=4;
 return {step(dt,measurement,variance){x+=v*dt;const a=p00+dt*(p01+p10)+dt*dt*p11+0.6*dt**3,b=p01+dt*p11,c=p10+dt*p11,d=p11+0.6*dt;p00=a;p01=b;p10=c;p11=d;if(measurement!==null){const s=p00+variance,k0=p00/s,k1=p10/s,residual=measurement-x;x+=k0*residual;v+=k1*residual;p00=(1-k0)*a;p01=(1-k0)*b;p10=c-k1*a;p11=d-k1*b;}return x;}};
}
export function createRadarExperiment(){
 let seed=42,time=0,noise=0.6,gapUntil=0,history=[],sumRaw=0,sumFiltered=0,count=0,completed=false;
 let fx=axisFilter(2),fy=axisFilter(0);
 const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return (seed+1)/4294967297;};
 const gaussian=()=>Math.sqrt(-2*Math.log(random()))*Math.cos(2*Math.PI*random());
 function reset(){time=0;gapUntil=0;history=[];sumRaw=0;sumFiltered=0;count=0;fx=axisFilter(2);fy=axisFilter(0);completed=false;seed=42;}
 return {setNoise(value){noise=Math.max(0.1,Math.min(2.5,Number(value)||0.1));reset();},dropout(){gapUntil=time+4;completed=false;},reset,update(dt){time+=dt;const truth=[2+Math.sin(time*0.55)*4,Math.sin(time*0.32)*2.2],gap=time<gapUntil,raw=gap?null:truth.map(x=>x+gaussian()*noise),filtered=[fx.step(dt,raw?.[0]??null,noise**2),fy.step(dt,raw?.[1]??null,noise**2)];if(raw){sumRaw+=raw.reduce((s,x,i)=>s+(x-truth[i])**2,0);sumFiltered+=filtered.reduce((s,x,i)=>s+(x-truth[i])**2,0);count++;}if(gapUntil>0&&!gap)completed=true;history.push({truth,raw,filtered});if(history.length>150)history.shift();},get state(){return {history,noise,gap:time<gapUntil,remaining:Math.max(0,gapUntil-time),rawError:count?Math.sqrt(sumRaw/count):0,filterError:count?Math.sqrt(sumFiltered/count):0,completed};}};
}
export function planTrajectories(obstacle=0,margin=0.5){
 const wall=obstacle==='wall',oy=Number(obstacle)||0,candidates=[];
 for(let lane=-10;lane<=10;lane++){
  const points=Array.from({length:101},(_,i)=>{const t=i/100;return {x:-10+20*t,y:lane*0.32*16*t*t*(1-t)*(1-t)};});
  const safe=points.every(p=>Math.abs(p.x)>1.2+margin||!wall&&Math.abs(p.y-oy)>0.55+margin);
  const cost=points.reduce((s,p,i)=>s+p.y**2*0.01+(i?Math.abs(p.y-points[i-1].y)*0.25:0),0);
  candidates.push({lane,points,safe,cost});
 }
 const selected=candidates.filter(c=>c.safe).sort((a,b)=>a.cost-b.cost||a.lane-b.lane)[0]??null;
 return {candidates,selected,obstacle:oy,wall,margin};
}
