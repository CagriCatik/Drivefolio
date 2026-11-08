import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lightState} from '../src/vehicle-lights.js';
import {mapPosition} from '../src/campus-map.js';
import {projects} from '../src/projects.js';

test('braking and reversing have distinct lights in both driving directions',()=>{
  assert.deepEqual(lightState({signedSpeed:4,input:{throttle:-1}}),{headlights:true,braking:true,reverse:false});
  assert.deepEqual(lightState({signedSpeed:-4,input:{throttle:-1}},false),{headlights:false,braking:false,reverse:true});
  assert.equal(lightState({signedSpeed:-4,input:{throttle:1}}).braking,true);
  assert.equal(lightState({signedSpeed:0,input:{brake:true}}).braking,true);
  assert.equal(lightState({signedSpeed:0,input:{throttle:-1}}).reverse,false);
});
test('the campus map covers all seven stations and clips the driving boundary',()=>{
  for(const project of projects){const p=mapPosition(project.position.x,project.position.z);assert.ok(p.x>0&&p.x<100&&p.y>0&&p.y<100);}
  assert.deepEqual(mapPosition(-55,-76),{x:0,y:0});assert.deepEqual(mapPosition(55,43),{x:100,y:100});
  assert.deepEqual(mapPosition(100,-100),{x:100,y:0});
});
