import * as THREE from 'three';

// Original offroader model from Bruno Simon / folio-2025, MIT.
// Its longitudinal axis is +X. Our simulation uses +Z.
export function createCarVisual(model, vehicle) {
  const chassis=model.children.find(n=>/^chassis/i.test(n.name));
  const template=model.children.find(n=>/^wheelContainer/i.test(n.name));
  if(!chassis||!template)throw new Error('Offroader model is missing its chassis or wheel template.');
  const assembly=new THREE.Group();assembly.rotation.y=-Math.PI/2;vehicle.group.add(assembly);
  chassis.position.set(0,0.92,0);assembly.add(chassis);
  const wheels=[];
  for(const [x,z] of [[0.9,0.79],[0.9,-0.79],[-0.9,0.79],[-0.9,-0.79]]) {
    const wheel=template.clone(true);wheel.position.set(x,0.43,z);wheel.rotation.set(0,0,0);wheel.scale.setScalar(1);
    if(z>0)wheel.rotation.y=Math.PI;
    assembly.add(wheel);
    wheels.push({group:wheel,baseY:wheel.rotation.y,front:x>0,roller:wheel.children.find(n=>/^wheelCylinder/i.test(n.name))});
  }
  const brakeLights=[],blinkers=[];
  assembly.traverse(n=>{
    if(!n.isMesh)return;
    n.castShadow=true;n.receiveShadow=true;
    n.material=n.material.clone();
    if(n.material.emissiveIntensity>4)n.material.emissiveIntensity=3;
    if(/^stopLights|backLights/i.test(n.name)){brakeLights.push(n);n.visible=false;}
    if(/^blinker/i.test(n.name)){blinkers.push(n);n.visible=false;}
    if(/^energy|cellsEnergy/i.test(n.name))n.visible=false;
    if(/^wheelSuspension|wheelGuard/i.test(n.name))n.visible=false;
  });
  const left=new THREE.PointLight('#ffca7c',1.5,5);left.position.set(0.6,0.75,1.5);vehicle.group.add(left);
  let roll=0,pitch=0;
  return {group:assembly,paint(color){assembly.traverse(n=>{if(n.isMesh&&/^bodyPainted|wheelPainted/i.test(n.name))n.material.color.set(color);});},dispose(){assembly.removeFromParent();left.removeFromParent();assembly.traverse(n=>{if(n.isMesh)n.material.dispose();});},update(dt,time){
    const motion=vehicle.motion;
    roll=THREE.MathUtils.lerp(roll,-motion.steering*Math.min(motion.speed/12,1)*0.1,1-Math.exp(-8*dt));
    pitch=THREE.MathUtils.lerp(pitch,-motion.acceleration*0.0025,1-Math.exp(-7*dt));
    chassis.rotation.x=roll;chassis.rotation.z=pitch;
    chassis.position.y=0.92+Math.sin(time*18)*Math.min(motion.speed*0.0015,0.025);
    for(const wheel of wheels){
      wheel.group.rotation.y=wheel.baseY+(wheel.front?motion.steering*0.4:0);
      if(wheel.roller)wheel.roller.rotation.z-=motion.signedSpeed*dt/0.4*(wheel.baseY? -1:1);
    }
    brakeLights.forEach(n=>n.visible=motion.input.brake||motion.input.throttle<0);
    blinkers.forEach((n,i)=>n.visible=Math.abs(motion.steering)>0.3&&Math.sin(time*10)>0&&i===(motion.steering>0?0:1));
  }};
}
