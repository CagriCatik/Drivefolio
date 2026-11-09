export function createPaceDriver(points){
  const lengths=points.map((p,i)=>Math.hypot(points[(i+1)%points.length].x-p.x,points[(i+1)%points.length].z-p.z)),total=lengths.reduce((a,b)=>a+b,0);
  function sample(distance){
    let d=((distance%total)+total)%total,i=0;
    while(d>lengths[i]&&i<points.length-1){d-=lengths[i];i++;}
    const a=points[i],b=points[(i+1)%points.length],t=d/lengths[i];
    return {x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t,heading:Math.atan2(b.x-a.x,b.z-a.z)};
  }
  let distance=0,speed=0;
  return {get pose(){return {...sample(distance),speed};},update(dt,player,paused=false){
    if(paused||!Number.isFinite(dt)||dt<=0)return this.pose;
    dt=Math.min(dt,0.1);const pose=sample(distance),ahead=sample(distance+6),turn=Math.atan2(Math.sin(ahead.heading-pose.heading),Math.cos(ahead.heading-pose.heading));
    const dx=player.x-pose.x,dz=player.z-pose.z,forward=dx*Math.sin(pose.heading)+dz*Math.cos(pose.heading),side=dx*Math.cos(pose.heading)-dz*Math.sin(pose.heading);
    const blocked=forward>-0.5&&forward<13&&Math.abs(side)<2.7||Math.hypot(dx,dz)<3.2;
    const target=blocked?0:Math.abs(turn)>0.15?6:10;
    speed+=Math.max(-7*dt,Math.min(2.5*dt,target-speed));distance=(distance+speed*dt)%total;
    return {...sample(distance),speed,braking:blocked,steering:Math.max(-0.5,Math.min(0.5,turn*1.5))};
  }};
}
