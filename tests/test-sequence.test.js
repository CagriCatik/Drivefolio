import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTestSequence} from '../src/test-sequence.js';

test('the preview progresses through specification, mapping and code, then completes exactly once',()=>{
  const c=createTestSequence(1);assert.equal(c.update(0).stage,-1);c.start();
  assert.equal(c.update(0.5).stage,0);assert.equal(c.update(0.6).stage,1);
  assert.equal(c.update(1).stage,2);
  const done=c.update(1);assert.equal(done.completed,true);assert.equal(done.stage,3);assert.equal(done.progress,1);
  assert.equal(c.update(5).completed,false);assert.equal(c.running,false);
});
test('cancelling and restarting never inherit progress or trigger an old completion',()=>{
  const c=createTestSequence();c.start();c.update(1.8);c.cancel();
  assert.equal(c.update(10).completed,false);assert.equal(c.update(0).stage,-1);
  c.start();assert.equal(c.update(0.1).stage,0);assert.equal(c.running,true);
});
test('invalid time cannot corrupt a running preview',()=>{
  const c=createTestSequence();c.start();assert.equal(c.update(NaN).progress,0);assert.equal(c.update(-2).progress,0);
});
