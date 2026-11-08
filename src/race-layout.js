export function circuitPoints(){
  const points=[];
  const line=(ax,az,bx,bz)=>{const n=Math.ceil(Math.hypot(bx-ax,bz-az)/1.5);for(let i=0;i<n;i++)points.push({x:ax+(bx-ax)*i/n,z:az+(bz-az)*i/n});};
  const arc=(x,z,start)=>{for(let i=0;i<20;i++){const a=start+i/20*Math.PI/2;points.push({x:x+14*Math.cos(a),z:z+14*Math.sin(a)});}};
  line(30,31,-30,31);arc(-30,17,Math.PI/2);line(-44,17,-44,-49);arc(-30,-49,Math.PI);line(-30,-63,30,-63);arc(30,-49,Math.PI*1.5);line(44,-49,44,17);arc(30,17,0);
  return points;
}
export function distanceToCircuit(position,points=circuitPoints()){
  let best=Infinity;
  for(let i=0;i<points.length;i++){
    const a=points[i],b=points[(i+1)%points.length],dx=b.x-a.x,dz=b.z-a.z;
    const t=Math.max(0,Math.min(1,((position.x-a.x)*dx+(position.z-a.z)*dz)/(dx*dx+dz*dz)));
    best=Math.min(best,Math.hypot(position.x-a.x-t*dx,position.z-a.z-t*dz));
  }
  return best;
}
export function createLapTimer(){
  const gates=[{x:-44,z:-16},{x:0,z:-63},{x:44,z:-16},{x:-12,z:31}];
  let running=false,elapsed=0,next=0,best=null,laps=0,atStart=false;
  return {reset(){running=false;elapsed=0;next=0;atStart=false;},update(dt,p,speed){
    const onStart=Math.abs(p.x+12)<3&&Math.abs(p.z-31)<3;
    if(running){elapsed+=Math.max(0,Math.min(dt,0.1));if(distanceToCircuit(p)>7){running=false;elapsed=0;next=0;}
      else if(Math.hypot(p.x-gates[next].x,p.z-gates[next].z)<5){next++;if(next===gates.length){laps++;best=best===null?elapsed:Math.min(best,elapsed);elapsed=0;next=0;}}
    }else if(onStart&&!atStart&&speed>1){running=true;elapsed=0;next=0;}
    atStart=onStart;return {running,elapsed,next,best,laps};
  }};
}
