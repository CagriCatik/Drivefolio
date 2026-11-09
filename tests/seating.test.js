import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {benchFootprint,benchHeading,seatingPlaces,seatingCourts} from '../src/seating-plan.js';
import {roadRects} from '../src/road-network.js';
import {campusFootprints,campusPaths} from '../src/campus-plan.js';
const overlaps=(a,b)=>Math.min(a[1],b[1])-Math.max(a[0],b[0])>1e-6&&Math.min(a[3],b[3])-Math.max(a[2],b[2])>1e-6;
test('every bench fits its own seating court and leaves roads, project footprints and main promenade open',()=>{
 assert.equal(seatingPlaces.length,6);
 for(const place of seatingPlaces){const bounds=benchFootprint(place),pad=seatingCourts[place.court].rect;assert.ok(bounds[0]>=pad[0]&&bounds[1]<=pad[1]&&bounds[2]>=pad[2]&&bounds[3]<=pad[3],place.id+' outside its pad');
  for(const obstacle of [...roadRects,...campusFootprints,[-28.4,-26.9,-55,25]])assert.equal(overlaps(bounds,obstacle),false,place.id+' blocks a through route or occupied site');
 }
 for(const path of campusPaths())for(const court of Object.values(seatingCourts))assert.equal(overlaps(path,court.rect),false,'two pavement surfaces overlap');
});
test('benches face their intended view and fountain benches have at least 0.65 m knee clearance',()=>{
 for(const place of seatingPlaces){const a=benchHeading(place),direction={x:Math.sin(a),z:Math.cos(a)},target={x:place.lookAt.x-place.x,z:place.lookAt.z-place.z};assert.ok(direction.x*target.x+direction.z*target.z>0);}
 for(const place of seatingPlaces.filter(p=>p.court==='fountain')){assert.ok(Math.hypot(place.x-7,place.z-14)-0.35-1.45>=0.65-1e-8);}
});
test('Bruno bench is a complete self-contained textured GLB with reusable local geometry',()=>{
 const bytes=readFileSync('public/models/bruno/benches.glb');assert.equal(bytes.length,bytes.readUInt32LE(8));const n=bytes.readUInt32LE(12),doc=JSON.parse(bytes.toString('utf8',20,20+n));assert.ok(doc.meshes[0].primitives[0].attributes.POSITION!==undefined);assert.ok(doc.images.every(i=>i.bufferView!==undefined));assert.ok(doc.nodes.some(n=>n.name==='benchPhysicalDynamic'));
});
