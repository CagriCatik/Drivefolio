import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { createVehicle } from '../src/vehicle.js';
import { createPortfolioCamera } from '../src/camera.js';

test('vehicle drives, brakes, collides and resets without accumulated motion', async () => {
  const v = await createVehicle(new THREE.Scene());
  const step = control => v.update(1 / 60, { throttle: 0, steering: 0, brake: false, ...control });
  for (let i = 0; i < 60; i++) step({ throttle: 1 });
  assert.ok(v.group.position.z < 10, 'forward from spawn points toward projects');
  for (let i = 0; i < 90; i++) step({ brake: true });
  assert.ok(v.speed < 0.05, 'braking permits parking dwell');
  v.reset(); assert.equal(v.group.position.z, 12); assert.equal(v.speed, 0);
  v.addObstacle(0, 3, 4, 1);
  for (let i = 0; i < 300; i++) step({ throttle: 1 });
  assert.ok(v.group.position.z > 4, 'car cannot pass through a building');
  v.reset(); for (let i = 0; i < 30; i++) step({});
  assert.ok(Math.abs(v.group.position.z - 12) < 0.01);
});

test('portfolio camera has Bruno-style FOV and does not rotate with car heading', () => {
  const view = createPortfolioCamera(1.6);
  assert.equal(view.camera.fov, 25);
  const p = new THREE.Vector3(2, 0, 4);
  view.reset(p); view.update(1, p, 0, false);
  const before = view.camera.quaternion.clone();
  view.update(1, p, Math.PI, false);
  assert.ok(before.angleTo(view.camera.quaternion) < 0.001);
  view.resize(0.5); assert.equal(view.camera.aspect, 0.5);
});

test('acceleration reaches cruising speed; boost is faster instead of fighting hidden damping', async () => {
  const v=await createVehicle(new THREE.Scene());
  for(let i=0;i<90;i++)v.update(1/60,{throttle:1,steering:0,brake:false,boost:false});
  assert.ok(v.speed>15 && v.speed<16.1,`cruising speed: ${v.speed}`);
  v.reset();
  for(let i=0;i<120;i++)v.update(1/60,{throttle:1,steering:0,brake:false,boost:true});
  assert.ok(v.speed>24 && v.speed<26.1,`boost speed: ${v.speed}`);
});

test('jump is edge-triggered, lands under gravity and cannot repeat while held',async()=>{
  const v=await createVehicle(new THREE.Scene());
  const step=()=>v.update(1/60,{throttle:0,steering:0,brake:false,jump:true});
  for(let i=0;i<20;i++)step();
  assert.ok(v.group.position.y>1,'jump leaves the ground');
  for(let i=0;i<120;i++)step();
  assert.ok(v.group.position.y<0.03,'holding jump does not trigger more jumps');
});

test('vehicle selection preserves position, changes handling and survives reset',async()=>{
  const v=await createVehicle(new THREE.Scene());
  const before=v.group.position.clone();v.setProfile('sport');
  assert.equal(v.profile,'sport');assert.ok(v.group.position.equals(before));
  for(let i=0;i<90;i++)v.update(1/60,{throttle:1,steering:0,brake:false});
  assert.ok(v.speed>20&&v.speed<21.1);
  assert.throws(()=>v.setProfile('missing'));assert.equal(v.profile,'sport');
  v.reset();assert.equal(v.profile,'sport');assert.equal(v.speed,0);
});

test('a physical ramp launches the car without pressing jump, then gravity brings it down',async()=>{
  const v=await createVehicle(new THREE.Scene());v.addRamp(0,0,5,6,1.8);
  let highest=0;
  for(let i=0;i<190;i++){
    v.update(1/60,{throttle:1,steering:0,brake:false});highest=Math.max(highest,v.group.position.y);
  }
  assert.ok(highest>1.2,`physical ramp peak: ${highest}`);
  assert.ok(v.group.position.y<0.05,'vehicle lands on the floor');
});

test('vehicle keeps its tank through reset and profile changes; empty tank permits a slow return',async()=>{
 const v=await createVehicle(new THREE.Scene());
 for(let i=0;i<60;i++)v.update(1/60,{throttle:1,steering:0,brake:false});
 const remaining=v.fuel.liters;assert.ok(remaining<37.5);v.setProfile('suv');v.reset();assert.equal(v.fuel.liters,remaining);
 v.fuel.update(100000,{x:0,z:12},20,{throttle:1,boost:true});assert.equal(v.fuel.liters,0);
 for(let i=0;i<120;i++)v.update(1/60,{throttle:1,steering:0,brake:false,boost:true});
 assert.ok(v.speed>2&&v.speed<=5.1,'empty tank cannot boost but can reach the station');
});
