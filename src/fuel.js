// One shared session tank: changing cars cannot refill it for free.
export const fuelBays=[{x:12.3,z:14.6},{x:18.7,z:14.6}];
export function atFuelPump(p){return fuelBays.some(b=>Math.abs(p.x-b.x)<1.15&&Math.abs(p.z-b.z)<2.4);}
export function createFuel(initial=37.5){
  const capacity=50;let liters=Math.max(0,Math.min(capacity,initial)),refueling=false,delivered=0;
  return {
    get liters(){return liters;},get fraction(){return liters/capacity;},get refueling(){return refueling;},get delivered(){return delivered;},
    start(p,speed,grounded=true){if(!atFuelPump(p)||Math.abs(speed)>=0.5||!grounded||liters>=capacity-0.001)return false;refueling=true;delivered=0;return true;},
    cancel(){refueling=false;},
    update(dt,p,speed,input,grounded=true){
      if(!Number.isFinite(dt)||dt<=0)return;
      if(refueling){
        if(!atFuelPump(p)||Math.abs(speed)>=0.5||!grounded||input.throttle||input.jump){refueling=false;}
        else {const added=Math.min(capacity-liters,dt*4);liters+=added;delivered+=added;if(liters>=capacity-0.001){liters=capacity;refueling=false;}return;}
      }
      if(Math.abs(speed)>0.5||input.throttle)liters=Math.max(0,liters-dt*(0.025+Math.abs(speed)*0.003+(input.boost?0.065:0)));
    },
  };
}
