import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createInteractions,rampHeightAt,locations} from '../src/interactions.js';
import {projects} from '../src/projects.js';
import {getVehicle,getPaint,vehicles} from '../src/vehicle-catalog.js';

test('facilities require proximity, stopping and a fresh press',()=>{
  const c=createInteractions(),p={x:-17,z:16};
  assert.equal(c.update({x:0,z:0},0,true).activated,null);
  assert.equal(c.update(p,0,true).activated,null,'holding E while arriving cannot open a dialog');
  c.update(p,0,false);
  assert.equal(c.update(p,8,true).activated,null,'passing at speed is not an interaction');
  c.update(p,0,false);
  assert.equal(c.update(p,0,true).activated.id,'garage');
  assert.equal(c.update(p,0,true).activated,null,'no repeated opening while held');
  c.reset();assert.equal(c.update(p,0,true).activated.id,'garage');
});

test('laboratory uses an explicit project interaction instead of parking dwell',()=>{
  const c=createInteractions();
  assert.equal(c.update({x:-15,z:1.5},0,false).location.id,'jetracer');
  assert.equal(c.update({x:-15,z:1.5},0,true).activated.id,'jetracer');
});

test('all project terminals are distinct explicit interactions',()=>{
  for(const {id,entrance:{x,z}} of projects){
    const c=createInteractions();assert.equal(c.update({x,z},0,false).activated,null);
    assert.equal(c.update({x,z},0,true).activated.id,id);
  }
});

test('ramp surface rises continuously towards its launch edge and ends outside its footprint',()=>{
  const r={x:15,z:14,width:5,length:6,height:1.8};
  assert.equal(rampHeightAt(r,15,17),0);
  assert.equal(rampHeightAt(r,15,14),0.9);
  assert.equal(rampHeightAt(r,15,11),1.8);
  assert.equal(rampHeightAt(r,18,14),0);
  assert.equal(rampHeightAt(r,15,10),0);
});

test('vehicle and paint selection reject unknown identifiers; sport has a distinct profile',()=>{
  assert.throws(()=>getVehicle('missing'));
  assert.throws(()=>getPaint('missing'));
  assert.ok(getVehicle('sport').maxSpeed>getVehicle('offroader').maxSpeed);
  assert.equal(new Set(vehicles.map(v=>v.id)).size,vehicles.length);
});

test('every project has one reachable terminal and no test specification projects remain',()=>{
  assert.equal(locations.length,projects.length+1);
  assert.equal(new Set(locations.map(l=>l.id)).size,locations.length);
  assert.equal(projects.length,7);
  assert.ok(!JSON.stringify(projects).match(/spectotest|spec2test|testspec/i));
  for(const p of projects)assert.equal(locations.filter(l=>l.id===p.id).length,1);
});
