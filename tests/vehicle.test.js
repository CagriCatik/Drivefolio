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
