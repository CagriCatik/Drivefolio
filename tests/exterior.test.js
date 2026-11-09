import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createExteriorPlan,exteriorDistance,exteriorClear,exteriorTrailMesh} from '../src/exterior-plan.js';
import {distanceToCircuit} from '../src/race-layout.js';
import {trackPoints} from '../src/road-network.js';
const plan=createExteriorPlan(),track=trackPoints();
function distanceToPath(x,z){let d=Infinity;for(let i=0;i<plan.trail.length;i++){const a=plan.trail[i],b=plan.trail[(i+1)%plan.trail.length],dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-a.x-t*dx,z-a.z-t*dz));}return d;}
test('exterior planting is deterministic and stays outside barriers, buildings and signs',()=>{
 assert.deepEqual(createExteriorPlan(),plan);assert.ok(plan.trees.length>30&&plan.meadow.length>700);
 for(const t of plan.trees){assert.ok(exteriorClear(t.x,t.z,t.radius));assert.ok(exteriorDistance(t.x,t.z)>8.8+t.radius);assert.ok(distanceToPath(t.x,t.z)>t.radius+2);}
 for(const s of plan.shrubs)assert.ok(exteriorClear(s.x,s.z,0.65));
 for(const m of plan.meadow){assert.ok(exteriorDistance(m.x,m.z)>9.9);assert.ok(distanceToPath(m.x,m.z)>1.5);}
});
test('the full exterior trail leaves clearance beyond the rail and lamp line, including curved joints',()=>{
 for(let i=0;i<plan.trail.length;i++){const p=plan.trail[i],q=plan.trail[(i+1)%plan.trail.length];for(const t of [0,0.5,1]){const v={x:p.x+(q.x-p.x)*t,z:p.z+(q.z-p.z)*t};assert.ok(exteriorDistance(v.x,v.z)>16.3);assert.ok(distanceToCircuit(v,track)>16.3);}}
});
test('pond and shore stay outside the circuit and tree roots do not enter the water',()=>{
 const p=plan.pond;assert.ok(exteriorDistance(p.x,p.z)>p.rx+10);
 for(const t of plan.trees)assert.ok(((t.x-p.x)/(p.rx+2))**2+((t.z-p.z)/(p.rz+2))**2>=1);
 for(const r of plan.rocks)assert.ok(exteriorClear(r.x,r.z,r.size));
});

test('exterior trail triangles face upward and close their seam so the walking surface is visible',()=>{
 const {positions:p,indices}=exteriorTrailMesh(plan.trail);assert.equal(indices.length,plan.trail.length*6);assert.ok(indices.slice(-6).includes(0));
 for(let i=0;i<indices.length;i+=3){const [a,b,c]=indices.slice(i,i+3).map(v=>v*3),abx=p[b]-p[a],abz=p[b+2]-p[a+2],acx=p[c]-p[a],acz=p[c+2]-p[a+2];assert.ok(abz*acx-abx*acz>0,'upward face winding');}
});
