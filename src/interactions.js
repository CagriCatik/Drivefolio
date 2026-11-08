export const locations = [
  {id:'garage',label:'Garage · Fahrzeug & Lackierung',x:-17,z:16,radius:4},
  {id:'robotics',label:'Robotics-Labor · Projekt entdecken',x:-15,z:1.5,radius:4},
];
export function createInteractions(items=locations) {
  let held=false;
  return {
    update(pose,speed,pressed) {
      const candidates=items.map(item=>({item,distance:Math.hypot(pose.x-item.x,pose.z-item.z)}))
        .filter(hit=>hit.distance<=hit.item.radius).sort((a,b)=>a.distance-b.distance);
      const location=candidates[0]?.item??null;
      const activated=!!pressed&&!held&&location&&Number.isFinite(speed)&&Math.abs(speed)<1.5?location:null;
      held=!!pressed;
      return {location,activated};
    },
    reset(){held=false;},
  };
}
export function rampHeightAt(ramp,x,z) {
  const localX=x-ramp.x,localZ=z-ramp.z;
  if(Math.abs(localX)>ramp.width/2||Math.abs(localZ)>ramp.length/2)return 0;
  return (0.5-localZ/ramp.length)*ramp.height;
}
