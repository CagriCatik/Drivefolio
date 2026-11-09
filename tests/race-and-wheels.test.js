import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createWheelRig} from '../src/wheel-rig.js';
import {createVehicleLights} from '../src/vehicle-lights.js';
import {circuitPoints,distanceToCircuit,createLapTimer} from '../src/race-layout.js';

test('steering axis and wheel center stay fixed while front wheels roll',()=>{
  const model=new THREE.Group();
  for(const [name,x,z] of [['wheel-front-left',0.3,0.66],['wheel-front-right',-0.3,0.66],['wheel-back-left',0.3,-0.66],['wheel-back-right',-0.3,-0.66]]){
    const mesh=new THREE.Mesh(new THREE.BoxGeometry(0.3,0.6,0.6).translate(0.12,0,0));mesh.name=name;mesh.position.set(x,0.3,z);model.add(mesh);
  }
  const rig=createWheelRig(model),positions=rig.wheels.map(w=>w.pivot.position.clone());
  for(let frame=0;frame<1000;frame++)rig.update(1/60,12,0.7);
  model.updateMatrixWorld(true);
  for(const [i,w] of rig.wheels.entries()){
    assert.ok(w.pivot.position.distanceTo(positions[i])<1e-9);
    assert.ok(new THREE.Vector3(0,1,0).applyQuaternion(w.pivot.quaternion).distanceTo(new THREE.Vector3(0,1,0))<1e-9,'steering axis remains vertical');
    assert.equal(w.pivot.rotation.y,w.front?0.7*0.42:0);
    w.mesh.geometry.computeBoundingBox();assert.ok(w.mesh.geometry.boundingBox.getCenter(new THREE.Vector3()).length()<1e-6);
  }
  rig.dispose();
});
test('both headlights illuminate forward, toggle together and survive either profile at night',()=>{
  for(const profile of ['sport','offroader','suv','race']){
    const vehicle={group:new THREE.Group(),profile,motion:{signedSpeed:0,input:{}}},lights=createVehicleLights(vehicle);
    lights.setNight(true);lights.update();assert.equal(lights.lamps.length,2);
    assert.ok(lights.lamps[0].position.x<0&&lights.lamps[1].position.x>0);
    assert.equal(lights.lamps[0].intensity,lights.lamps[1].intensity);
    for(const lamp of lights.lamps){assert.ok(lamp.visible);assert.ok(lamp.target.position.z>lamp.position.z);assert.ok(lamp.intensity>=100);}
    lights.toggle();lights.update();assert.ok(lights.lamps.every(l=>!l.visible));
  }
});
test('the circuit is continuous, outside the campus and has a drivable width',()=>{
  const points=circuitPoints();
  for(let i=0;i<points.length;i++){
    const p=points[i],q=points[(i+1)%points.length];assert.ok(Math.hypot(q.x-p.x,q.z-p.z)<1.6);
    assert.ok(distanceToCircuit(p,points)<1e-7);
  }
  assert.ok(distanceToCircuit({x:0,z:-16},points)>30);
  assert.ok(distanceToCircuit({x:44,z:5},points)<0.01);
});
test('lap timing requires all checkpoints in order and cancels shortcuts through the campus',()=>{
  const timer=createLapTimer();timer.update(0.1,{x:-12,z:31},4);
  assert.equal(timer.update(0.1,{x:-12,z:31},4).laps,0);
  for(const p of [{x:-44,z:-16},{x:0,z:-63},{x:44,z:-16}])assert.equal(timer.update(0.1,p,10).laps,0);
  const lap=timer.update(0.1,{x:-12,z:31},10);assert.equal(lap.laps,1);assert.ok(lap.best>0);
  assert.equal(timer.update(0.1,{x:0,z:0},10).running,false);
  timer.reset();assert.equal(timer.update(0,{x:0,z:0},0).running,false);
});
