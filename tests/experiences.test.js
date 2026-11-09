import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDiscovery} from '../src/discovery.js';
import {projects} from '../src/projects.js';
import {createRobotExperiment,createRadarExperiment,gridPath,planTrajectories} from '../src/experiment-models.js';

test('robot replans through the free gap and around a blocked gap without crossing occupied cells',()=>{
 const robot=createRobotExperiment(),first=robot.state.route;assert.ok(first.some(([x,y])=>x===8&&y===6));
 robot.toggle();const s=robot.state;assert.ok(s.route.length>first.length);assert.ok(s.route.every(p=>!s.blocked.has(p.join(','))));
 robot.start();for(let i=0;i<1000;i++)robot.update(1/30);assert.equal(robot.state.done,true);assert.deepEqual(robot.state.position,[16,1]);
 assert.deepEqual(gridPath(3,3,[0,1],[2,1],new Set(['1,0','1,1','1,2'])),[]);
});
test('radar predicts during a dropout and recovers on real new synthetic measurements',()=>{
 const radar=createRadarExperiment();for(let i=0;i<180;i++)radar.update(1/30);radar.dropout();radar.update(1/30);assert.equal(radar.state.gap,true);assert.equal(radar.state.history.at(-1).raw,null);
 const first=radar.state.history.at(-1).filtered;for(let i=0;i<60;i++)radar.update(1/30);assert.notDeepEqual(radar.state.history.at(-1).filtered,first);
 for(let i=0;i<120;i++)radar.update(1/30);assert.equal(radar.state.completed,true);assert.ok(radar.state.history.at(-1).raw);assert.ok(Number.isFinite(radar.state.filterError));
 radar.setNoise(1.5);assert.equal(radar.state.completed,false);assert.equal(radar.state.history.length,0);
});
test('planner selects collision-free candidates and stops when all routes are blocked',()=>{
 for(const obstacle of [-1.6,0,1.6])for(const margin of [0.2,0.5,1.5]){
  const result=planTrajectories(obstacle,margin);assert.equal(result.candidates.length,21);assert.ok(result.selected?.safe);assert.ok(result.selected.points.every(p=>Math.abs(p.x)>1.2+margin||Math.abs(p.y-obstacle)>0.55+margin));
  assert.ok(result.candidates.filter(c=>c.safe).every(c=>c.cost>=result.selected.cost));
 }
 assert.equal(planTrajectories('wall').selected,null);
 assert.equal(planTrajectories(-1.6).selected.lane,0);assert.equal(planTrajectories(1.6).selected.lane,0);assert.notEqual(planTrajectories(0).selected.lane,0);
});
test('discovery persists valid distinct visits and actions, excludes unknown saved ids and recommends another project',()=>{
 let value='{"viewed":["jetracer","unknown","jetracer"]}';const storage={getItem:()=>value,setItem:(_,v)=>value=v};
 const ids=projects.map(p=>p.id),d=createDiscovery(ids,storage);assert.equal(d.viewed.size,1);assert.equal(d.tried.size,0);assert.equal(d.next('jetracer'),'radar');
 d.mark('radar','completed');d.mark('radar','completed');d.mark('bad','completed');assert.equal(d.completed.size,1);assert.equal(d.viewed.size,2);
 const loaded=createDiscovery(ids,storage);assert.ok(loaded.tried.has('radar'));assert.ok(loaded.completed.has('radar'));assert.equal(loaded.next('jetracer'),'autonomy');
 const blocked=createDiscovery(ids,{getItem(){throw Error();},setItem(){throw Error();}});blocked.mark('frenet','tried');assert.equal(blocked.tried.size,1);
});
