import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {createKenneyLightBinding,modelLightFaces,faceVertices} from '../src/model-light-mounts.js';
import {createVehicleLights} from '../src/vehicle-lights.js';

function bodyModel(file){
  const bytes=readFileSync(file),size=bytes.readUInt32LE(12),json=JSON.parse(bytes.toString('utf8',20,20+size)),bin=28+size;
  const body=json.nodes.find(n=>n.name==='body'),primitive=json.meshes[body.mesh].primitives[0];
  function values(id){
    const a=json.accessors[id],v=json.bufferViews[a.bufferView],parts={SCALAR:1,VEC3:3}[a.type],stride=v.byteStride??parts*(a.componentType===5126||a.componentType===5125?4:2),offset=bin+(v.byteOffset??0)+(a.byteOffset??0),result=[];
    for(let i=0;i<a.count;i++)for(let k=0;k<parts;k++){const p=offset+i*stride+k*(a.componentType===5123?2:4);result.push(a.componentType===5126?bytes.readFloatLE(p):a.componentType===5125?bytes.readUInt32LE(p):bytes.readUInt16LE(p));}return result;
  }
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(values(primitive.attributes.POSITION),3));geometry.setIndex(values(primitive.indices));
  const model=new THREE.Group(),mesh=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial());mesh.name='body';mesh.position.fromArray(body.translation);model.add(mesh);model.scale.setScalar(1.4);return {model,body:mesh};
}
test('each Kenney vehicle uses actual body surfaces and headlights follow chassis pitch',()=>{
  const origins=[];
  for(const [id,name] of [['sport','car'],['suv','suv'],['race','race']]){
    const {model,body}=bodyModel(`public/models/car/${name}.glb`),binding=createKenneyLightBinding(model,id);
    const expected=faceVertices(body.geometry,modelLightFaces[id].front),overlay=binding.frontLens.geometry.getAttribute('position');
    assert.equal(overlay.count,expected.length);
    expected.forEach((p,i)=>assert.ok(new THREE.Vector3().fromBufferAttribute(overlay,i).distanceTo(p)<1e-6,'lens is flush with the original model surface'));
    assert.equal(binding.frontLens.parent,body);assert.equal(binding.rearLens.parent,body);
    assert.ok(binding.front[0].x<0&&binding.front[1].x>0);origins.push(binding.front[0].toArray().join(','));
    const vehicle={group:new THREE.Group(),motion:{signedSpeed:0,input:{}}};vehicle.group.add(model);
    const lights=createVehicleLights(vehicle);lights.mount(binding);lights.update();
    model.rotation.x=0.2;model.rotation.z=-0.1;model.updateWorldMatrix(true,true);
    for(const [i,light] of lights.lamps.entries()){
      const expectedOrigin=body.localToWorld(binding.front[i].clone().addScaledVector(binding.direction,0.006));
      assert.ok(light.getWorldPosition(new THREE.Vector3()).distanceTo(expectedOrigin)<1e-6);
    }
    lights.toggle();lights.update();assert.equal(binding.frontLens.visible,false);assert.ok(lights.lamps.every(l=>!l.visible));
    vehicle.motion.input.brake=true;lights.update();assert.equal(binding.rearLens.visible,true);
    vehicle.motion.signedSpeed=-2;lights.update();assert.equal(binding.reverseLens.visible,true);
    binding.dispose();
  }assert.equal(new Set(origins).size,3,'no shared universal headlight position');
});
