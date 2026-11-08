import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createDemoSequence} from '../src/demo-sequence.js';
import {projects} from '../src/projects.js';

test('each project preview completes once and names its own stages',()=>{
  for(const project of projects){
    const c=createDemoSequence(1);assert.equal(c.update(0).stage,-1);c.start(project);
    for(let i=0;i<project.stages.length;i++){
      const state=c.update(i===0?0.5:1);assert.equal(state.stage,i);assert.equal(state.label,project.stages[i]);
    }
    const done=c.update(1);assert.equal(done.completed,true);assert.equal(done.progress,1);
    assert.equal(c.update(10).completed,false);assert.equal(c.running,false);
  }
});
test('cancel, switch and restart cannot inherit an old completion or project',()=>{
  const c=createDemoSequence(1);c.start(projects[0]);c.update(2);c.cancel();
  assert.equal(c.project,null);assert.equal(c.update(99).completed,false);assert.equal(c.update(0).stage,-1);
  c.start(projects[4]);assert.equal(c.project.id,'agents');assert.equal(c.update(0.1).stage,0);
  c.start(projects[2]);assert.equal(c.project.id,'radar');assert.equal(c.update(0).progress,0);
});
test('invalid timing and empty demos cannot corrupt the controller',()=>{
  assert.throws(()=>createDemoSequence(0));const c=createDemoSequence();assert.throws(()=>c.start({stages:[]}));
  c.start(projects[0]);assert.equal(c.update(NaN).progress,0);assert.equal(c.update(-1).progress,0);
});
