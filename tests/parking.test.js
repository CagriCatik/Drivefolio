import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createParkingController, insideBay } from '../src/parking.js';
import { projects } from '../src/projects.js';

const bay = projects[0], pose = bay.position;
const dwell = controller => { let result; for (let i = 0; i < 55; i++) result = controller.update(pose, 0, 1 / 60); return result; };

test('driving across a project never opens it', () => {
  const c = createParkingController(projects);
  for (let i = 0; i < 200; i++) assert.equal(c.update(pose, 4, 1 / 60).opened, null);
});

test('parking opens once, closing a card cannot immediately reopen it', () => {
  const c = createParkingController(projects);
  const opened = [];
  for (let i = 0; i < 300; i++) {
    const state = c.update(pose, 0, 1 / 60);
    if (state.opened) opened.push(state.opened.id);
  }
  assert.deepEqual(opened, [bay.id]);
  c.update({ x: pose.x + 8, z: pose.z }, 1, 1 / 60);
  for (let i = 0; i < 55; i++) {
    const state = c.update(pose, 0, 1 / 60);
    if (state.opened) opened.push(state.opened.id);
  }
  assert.deepEqual(opened, [bay.id, bay.id]);
});

test('moving or leaving interrupts the dwell; reset removes latch', () => {
  const c = createParkingController(projects);
  for (let i = 0; i < 30; i++) c.update(pose, 0, 1 / 60);
  c.update(pose, 2, 1 / 60);
  assert.equal(c.update(pose, 0, 1 / 60).opened, null);
  dwell(c); c.reset();
  let opened = null;
  for (let i = 0; i < 55; i++) opened ||= c.update(pose, 0, 1 / 60).opened;
  assert.equal(opened.id, bay.id);
});

test('invalid state and long frame cannot fabricate completed parking', () => {
  const c = createParkingController(projects);
  assert.equal(c.update(pose, NaN, 1).opened, null);
  assert.equal(c.update({ x: NaN, z: 0 }, 0, 1).bay, null);
  assert.equal(c.update(pose, 0, 10).opened, null);
  assert.equal(c.update(pose, 0, -1).progress, 0);
});

test('bay detection respects rotation and project links are explicit HTTPS GitHub URLs', () => {
  const b = { position: { x: 0, z: 0 }, heading: Math.PI / 2 };
  assert.equal(insideBay({ x: 3.8, z: 0 }, b), true);
  assert.equal(insideBay({ x: 0, z: 3.8 }, b), false);
  assert.equal(new Set(projects.map(p => p.id)).size, projects.length);
  for (const p of projects) assert.equal(new URL(p.url).origin, 'https://github.com');
});
