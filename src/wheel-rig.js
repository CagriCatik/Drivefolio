import * as THREE from 'three';

// Steer about vertical Y, then roll about the axle X. Never combine both
// rotations on the mesh's Euler angles: rolling would tilt its steering axis.
export function createWheelRig(model){
  const meshes=[];model.traverse(node=>{if(node.isMesh&&/^wheel-(front|back)-/.test(node.name))meshes.push(node);});
  const wheels=meshes.map(mesh=>{
    mesh.geometry=mesh.geometry.clone();mesh.geometry.computeBoundingBox();
    const center=mesh.geometry.boundingBox.getCenter(new THREE.Vector3());
    const pivot=new THREE.Group();pivot.name=mesh.name+'-steering';
    pivot.position.copy(mesh.position).add(center.clone().multiply(mesh.scale).applyQuaternion(mesh.quaternion));
    const roller=new THREE.Group();roller.name=mesh.name+'-axle';mesh.parent.add(pivot);pivot.add(roller);roller.add(mesh);
    mesh.geometry.translate(-center.x,-center.y,-center.z);mesh.position.set(0,0,0);
    return {pivot,roller,mesh,front:/front/.test(mesh.name)};
  });
  return {wheels,update(dt,signedSpeed,steering){
    for(const wheel of wheels){wheel.pivot.rotation.y=wheel.front?steering*0.42:0;wheel.roller.rotation.x=(wheel.roller.rotation.x+signedSpeed*dt/0.415)%(Math.PI*2);}
  },dispose(){wheels.forEach(w=>w.mesh.geometry.dispose());}};
}
