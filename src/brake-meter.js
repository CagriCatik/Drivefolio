export const handlingBounds={minX:10,maxX:21,minZ:8.4,maxZ:23};
export function insideHandling(p){return p.x>handlingBounds.minX&&p.x<handlingBounds.maxX&&p.z>handlingBounds.minZ&&p.z<handlingBounds.maxZ;}
export function createBrakeMeter(){
  let previous=null,held=false,measuring=false,distance=0,startSpeed=0,result=null;
  return {cancel(){previous=null;held=false;measuring=false;distance=0;},update(p,speed,brake,paused=false){
    const valid=Number.isFinite(p.x)&&Number.isFinite(p.z)&&Number.isFinite(speed);
    const step=previous&&valid?Math.hypot(p.x-previous.x,p.z-previous.z):0;
    if(paused||!valid||step>3){measuring=false;distance=0;}
    else if(brake&&!held&&speed>1){measuring=true;distance=0;startSpeed=speed;}
    else if(measuring){distance+=step;if(speed<0.25){result={distance,startSpeed};measuring=false;}}
    previous=valid?{x:p.x,z:p.z}:null;held=!!brake;
    return {measuring,distance,startSpeed,result};
  }};
}
