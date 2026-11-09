import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createFuel,atFuelPump} from '../src/fuel.js';
const bay={x:12.3,z:14.6},idle={throttle:0};
test('fuel is consumed by driving and boost; stationary vehicles do not drain',()=>{
 const normal=createFuel(),boost=createFuel();normal.update(30,bay,0,idle);assert.equal(normal.liters,37.5);
 normal.update(30,bay,10,{throttle:1});boost.update(30,bay,10,{throttle:1,boost:true});assert.ok(boost.liters<normal.liters);assert.ok(normal.liters<37.5);
});
test('refueling requires a stopped grounded car at a pump, caps at full and counts delivered liters',()=>{
 const fuel=createFuel(45);assert.equal(atFuelPump({x:15.5,z:14.6}),false);assert.equal(fuel.start({x:0,z:12},0),false);assert.equal(fuel.start(bay,1),false);assert.equal(fuel.start(bay,0,false),false);
 assert.equal(fuel.start(bay,0),true);fuel.update(1,bay,0,idle);assert.equal(fuel.liters,49);assert.equal(fuel.delivered,4);fuel.update(1,bay,0,idle);assert.equal(fuel.liters,50);assert.equal(fuel.delivered,5);assert.equal(fuel.refueling,false);assert.equal(fuel.start(bay,0),false);
});
test('leaving, driving, jumping and cancellation immediately stop fuel flow',()=>{
 for(const [p,input,grounded] of [[{x:0,z:12},idle,true],[bay,{throttle:1},true],[bay,{jump:true},true],[bay,idle,false]]){
  const fuel=createFuel(20);fuel.start(bay,0);fuel.update(1,p,0,input,grounded);assert.equal(fuel.refueling,false);assert.ok(fuel.liters<=20);
 }
 const fuel=createFuel(20);fuel.start(bay,0);fuel.cancel();fuel.update(1,bay,0,idle);assert.equal(fuel.liters,20);fuel.update(-1,bay,0,idle);assert.equal(fuel.liters,20);
});
