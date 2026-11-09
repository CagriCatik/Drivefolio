import {test} from 'node:test';
import assert from 'node:assert/strict';
import {courierRoute,createCourier} from '../src/courier-route.js';
import {roadRects} from '../src/road-network.js';
import {campusFootprints} from '../src/campus-plan.js';
test('delivery route including the robot footprint stays outside roads and existing buildings',()=>{
 for(let i=1;i<courierRoute.length;i++)for(let j=0;j<=100;j++){
  const a=courierRoute[i-1],b=courierRoute[i],t=j/100,x=a[0]+(b[0]-a[0])*t,z=a[1]+(b[1]-a[1])*t;
  for(const [l,r,top,bottom] of [...roadRects,...campusFootprints])assert.ok(x+0.45<=l||x-0.45>=r||z+0.45<=top||z-0.45>=bottom,'delivery robot intrudes into a street or occupied site');
 }
});
test('courier loops continuously, stops for the visitor and respects pause without jumping',()=>{
 const courier=createCourier();let previous=courier.pose,moved=false;
 for(let i=0;i<1800;i++){
  const p=courier.update(1/30,{x:0,z:12});assert.ok(Math.hypot(p.x-previous.x,p.z-previous.z)<=0.031);if(p.moving)moved=true;previous=p;
 }
 assert.ok(moved);const before=courier.pose;
 for(let i=0;i<60;i++)courier.update(1/30,before);assert.deepEqual(courier.pose,before);
 courier.update(10,{x:0,z:12},true);assert.deepEqual(courier.pose,before);
 for(let i=0;i<120;i++)courier.update(1/30,{x:0,z:12});assert.notDeepEqual(courier.pose,before);
});
