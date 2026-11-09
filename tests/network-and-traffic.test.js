import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rectUnion,trackPoints,offsetLoop,joinedBand,joinedStrip,isInnerAccess,ROAD_Y} from '../src/road-network.js';
import {distanceToCircuit} from '../src/race-layout.js';
import {createPaceDriver} from '../src/pace-driver.js';

test('all campus and pit road triangles end before the circuit interior, at the same height',()=>{
  const {positions,indices}=rectUnion();
  for(let i=0;i<indices.length;i+=3){
    const ids=indices.slice(i,i+3),p={x:0,z:0};
    for(const id of ids){p.x+=positions[id*3]/3;p.z+=positions[id*3+2]/3;assert.equal(positions[id*3+1],ROAD_Y);}
    assert.ok(distanceToCircuit(p)>=3.8-1e-7,`road triangle overlaps racing surface at ${JSON.stringify(p)}`);
  }
});
test('curbs and guardrails share joint vertices including the closed-loop seam',()=>{
  const points=trackPoints(),strip=joinedStrip(points,-3.8,3.8,ROAD_Y),band=joinedBand(points,-5.48,-5.32,0.4,0.6);
  assert.equal(strip.positions.length,points.length*6);assert.equal(strip.indices.length,points.length*6);
  assert.ok(strip.indices.slice(-6).includes(0)&&strip.indices.slice(-6).includes(1));
  assert.ok(band.active.every(Boolean));assert.equal(band.groups.length,points.length);
  assert.ok(band.indices.slice(-18).some(i=>i<4),'last rail section joins the first shared cross-section');
  for(const n of [...strip.positions,...band.positions])assert.ok(Number.isFinite(n));
  for(const z of [1.6,8.4,-38,-34,-12,-8])assert.ok(points.some(p=>Math.abs(p.x-44)<1e-7&&Math.abs(p.z-z)<1e-7));
  assert.equal(isInnerAccess({x:44,z:5}),true);assert.equal(isInnerAccess({x:-44,z:5}),true);assert.equal(isInnerAccess({x:0,z:31}),true);
  assert.equal(isInnerAccess({x:44,z:-25}),false);
});
test('pace car follows complete laps within its lane and pauses without jumping',()=>{
  const driver=createPaceDriver(offsetLoop(trackPoints(),-1.45));
  for(let i=0;i<5000;i++){
    const p=driver.update(1/60,{x:0,z:-16});const distance=distanceToCircuit(p);
    assert.ok(distance>1.35&&distance<1.6,`traffic left lane: ${distance}`);assert.ok(p.speed<=10.01);
  }
  const before=driver.pose;assert.deepEqual(driver.update(4,{x:0,z:0},true),before);
});
test('pace car brakes for a stationary player ahead and resumes once the lane is clear',()=>{
  const driver=createPaceDriver(offsetLoop(trackPoints(),-1.45));
  for(let i=0;i<120;i++)driver.update(0.05,{x:0,z:-16});
  const p=driver.pose,obstacle={x:p.x+Math.sin(p.heading)*10,z:p.z+Math.cos(p.heading)*10};let pose;
  for(let i=0;i<70;i++)pose=driver.update(0.05,obstacle);
  assert.ok(pose.speed<0.1);assert.ok(Math.hypot(pose.x-obstacle.x,pose.z-obstacle.z)>2.7);
  for(let i=0;i<40;i++)pose=driver.update(0.05,{x:0,z:-16});assert.ok(pose.speed>2);
});
