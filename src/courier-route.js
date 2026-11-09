// Service route on the west promenade. It never crosses the road network.
export const courierRoute=[[-27.65,-12.8],[-23.5,-12.8],[-23.5,-11.5],[-27.65,-11.5],[-27.65,-3],[-27.65,-12.8]];
export function createCourier(){
 let segment=0,distance=0,dwell=1.8;
 const pose=()=>{const a=courierRoute[segment],b=courierRoute[segment+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]),t=distance/length;return {x:a[0]+(b[0]-a[0])*t,z:a[1]+(b[1]-a[1])*t,heading:Math.atan2(b[0]-a[0],b[1]-a[1])};};
 return {get pose(){return pose();},update(dt,player,paused=false){if(paused||!Number.isFinite(dt)||dt<=0)return {...pose(),moving:false};const p=pose();if(player&&Math.hypot(player.x-p.x,player.z-p.z)<2)return {...p,moving:false};dt=Math.min(dt,0.1);if(dwell>0){dwell=Math.max(0,dwell-dt);return {...p,moving:false};}distance+=dt*0.9;const a=courierRoute[segment],b=courierRoute[segment+1],length=Math.hypot(b[0]-a[0],b[1]-a[1]);if(distance>=length){distance=0;segment=(segment+1)%(courierRoute.length-1);if(segment===0||segment===2)dwell=1.8;}return {...pose(),moving:dwell===0};}};
}
