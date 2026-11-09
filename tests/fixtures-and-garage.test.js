import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {switchFixtures} from '../src/fixture-lighting.js';
import {vehicles} from '../src/vehicle-catalog.js';

test('street lights and glowing lenses both switch completely off when returning to day',()=>{
  const lights=[new THREE.PointLight(),new THREE.PointLight()],materials=[new THREE.MeshStandardMaterial({emissive:'#ffffff'}),new THREE.MeshStandardMaterial({emissive:'#ffffff'})];
  switchFixtures(lights,materials,true,72);assert.ok(lights.every(l=>l.intensity===72));assert.ok(materials.every(m=>m.emissiveIntensity>0));
  switchFixtures(lights,materials,false,72);assert.ok(lights.every(l=>l.intensity===0));assert.ok(materials.every(m=>m.emissiveIntensity===0));
  switchFixtures(lights,materials,true,30);assert.ok(lights.every(l=>l.intensity===30));
});
test('garage offers four distinct real models and the header shows the exact name without a symbol',()=>{
  assert.equal(vehicles.length,4);assert.equal(new Set(vehicles.map(v=>v.asset)).size,4);
  for(const id of ['suv','race']){
    const profile=vehicles.find(v=>v.id===id),file=readFileSync('public/'+profile.asset),length=file.readUInt32LE(12),json=JSON.parse(file.toString('utf8',20,20+length));
    assert.equal(json.nodes.filter(n=>/^wheel-(front|back)-(left|right)$/.test(n.name??'')).length,4);
  }
  const html=readFileSync('index.html','utf8');assert.ok(!html.includes('brand-symbol'));assert.ok(html.includes('<span>Çağrı Çatık<small>'));
});
