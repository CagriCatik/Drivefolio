import {test} from 'node:test';
import assert from 'node:assert/strict';
import {garageSite,garageBounds,serviceApronRects,evChargers} from '../src/service-layout.js';
import {roadRects} from '../src/road-network.js';
import {subtractRects} from '../src/campus-plan.js';
import {distanceToCircuit} from '../src/race-layout.js';
import {createInteractions} from '../src/interactions.js';
const overlap=(a,b)=>Math.min(a[1],b[1])-Math.max(a[0],b[0])>1e-6&&Math.min(a[3],b[3])-Math.max(a[2],b[2])>1e-6;
test('service forecourt joins fuel and garage without duplicated road surfaces or circuit intrusion',()=>{
 const tiles=subtractRects(serviceApronRects,[]),floor=[garageSite.x-5,garageSite.x+5,garageSite.z-4.5,garageSite.z+4.5];
 for(let i=0;i<tiles.length;i++){
  for(const r of [...roadRects,floor,[10,21,8.4,23]])assert.equal(overlap(tiles[i],r),false);
  for(let j=0;j<i;j++)assert.equal(overlap(tiles[i],tiles[j]),false);
  const [l,r,t,b]=tiles[i];for(const x of [l,r])for(const z of [t,b])assert.ok(distanceToCircuit({x,z})>4.8);
 }
 for(const x of garageBounds.slice(0,2))for(const z of garageBounds.slice(2))assert.ok(distanceToCircuit({x,z})>5);
 // A 1.9 m-wide vehicle can pass the chargers through the connecting lane.
 for(const charger of evChargers)assert.ok(22.4+0.95<charger.x-0.35);
});
test('garage activates at its relocated entrance and no longer activates at the former site',()=>{
 const c=createInteractions();assert.equal(c.update({x:-17,z:16},0,true).activated,null);c.reset();assert.equal(c.update(garageSite.entrance,0,true).activated.id,'garage');
 c.reset();assert.equal(c.update(garageSite.entrance,5,true).activated,null);
});
