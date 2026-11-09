export const parkSites={
 deck:[-74,-67.2,-25,-21],
 pondLink:[-67.2,-61.6,-24,-22],
 spectator:[54.5,59.1,-32,-12],
 spectatorLink:[59.1,59.4,-19,-17],
};
export function parkFootprintClear(x,z,radius=0){return !Object.values(parkSites).some(([l,r,t,b])=>x>l-radius&&x<r+radius&&z>t-radius&&z<b+radius);}
export function duckPose(time,index,pond){
 const a=time*0.13+Math.sin(time*0.05)*0.25+index*Math.PI;
 const x=pond.x-pond.rx*0.08+Math.sin(a)*pond.rx*0.32,z=pond.z+Math.cos(a)*pond.rz*0.4;
 const dx=Math.cos(a)*pond.rx*0.32,dz=-Math.sin(a)*pond.rz*0.4;
 return {x,z,heading:Math.atan2(dx,dz),bob:Math.sin(time*2+index)*0.015};
}
export function spectatorTarget(x,z,visitor){const distance=Math.hypot(visitor.x-x,visitor.z-z);return {heading:distance<24?Math.atan2(visitor.x-x,visitor.z-z):-Math.PI/2,photograph:distance<22};}

export const deckRailSegments=[[parkSites.deck[2]+0.25,parkSites.deck[2]+0.9],[parkSites.deck[3]-0.9,parkSites.deck[3]-0.25]];
