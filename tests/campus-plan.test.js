import {test} from 'node:test';
import assert from 'node:assert/strict';
import {campusPaths,campusFootprints,gardenBeds,subtractRects} from '../src/campus-plan.js';
import {roadRects} from '../src/road-network.js';
const overlap=(a,b)=>Math.min(a[1],b[1])-Math.max(a[0],b[0])>1e-7&&Math.min(a[3],b[3])-Math.max(a[2],b[2])>1e-7;
test('campus paths have no overlapping surfaces and leave roads, project forecourts and fuel access clear',()=>{
 const paths=campusPaths();assert.ok(paths.length>0);
 for(let i=0;i<paths.length;i++){
  const p=paths[i];assert.ok(p[1]>p[0]&&p[3]>p[2]);
  for(const area of [...roadRects,...campusFootprints])assert.equal(overlap(p,area),false,'walkway covers a road or project footprint');
  for(let j=0;j<i;j++)assert.equal(overlap(p,paths[j]),false,'walkway rectangles overlap');
 }
});
test('planting beds keep the road network and project buildings free',()=>{
 for(const [x,z,w,d] of gardenBeds){const bed=[x-w/2,x+w/2,z-d/2,z+d/2];for(const area of [...roadRects,...campusFootprints])assert.equal(overlap(bed,area),false,`planting at ${x},${z} intersects an occupied area`);}
});
test('rectangular subtraction preserves an entrance cutout exactly',()=>{
 const tiles=subtractRects([[0,10,0,10]],[[4,6,0,10]]);const area=tiles.reduce((sum,[l,r,t,b])=>sum+(r-l)*(b-t),0);assert.equal(area,80);assert.ok(tiles.every(p=>p[1]<=4||p[0]>=6));
});
