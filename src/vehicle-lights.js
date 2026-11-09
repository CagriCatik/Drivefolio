import * as THREE from 'three';

export function lightState(motion,enabled=true){
  const speed=motion.signedSpeed??0,throttle=motion.input?.throttle??0;
  return {headlights:enabled,reverse:speed < -0.25,braking:!!motion.input?.brake||speed*throttle < -0.5};
}
export function createVehicleLights(vehicle){
  const group=new THREE.Group();vehicle.group.add(group);
  const lamps=[-0.5,0.5].map(x=>{
    const lamp=new THREE.SpotLight('#e1f5ff',55,24,0.40,0.65,1.2);lamp.position.set(x,0.6,1.4);lamp.target.position.set(x,0.04,16);group.add(lamp,lamp.target);return lamp;
  });
  let night=false,enabled=true,binding=null;
  return {lamps,mount(next){
    binding=next;next.parent.add(group);group.position.set(0,0,0);group.rotation.set(0,0,0);group.scale.setScalar(1);
    lamps.forEach((lamp,i)=>{
      const anchor=next.front[i];lamp.position.copy(anchor).addScaledVector(next.direction,0.006);
      lamp.target.position.copy(anchor).addScaledVector(next.direction,12);lamp.target.position.y=next.groundY;
    });
  },setNight(value){night=!!value;},toggle(){enabled=!enabled;return enabled;},get enabled(){return enabled;},update(){
    const state=lightState(vehicle.motion,enabled);
    lamps.forEach(lamp=>{lamp.visible=enabled;lamp.intensity=night?150:55;});
    if(!binding)return;
    if(binding.frontLens){binding.frontLens.visible=enabled;binding.frontLens.material.color.set('#f1f6e1').multiplyScalar(night?1.5:1);}
    if(binding.rearLens){binding.rearLens.visible=enabled||state.braking;binding.rearLens.material.color.set(state.braking?'#ff454c':'#a92b35');}
    if(binding.reverseLens)binding.reverseLens.visible=state.reverse;
  }};
}
