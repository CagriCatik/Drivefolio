import {test} from 'node:test';
import assert from 'node:assert/strict';
import {duckPose,parkSites,parkFootprintClear,spectatorTarget,deckRailSegments} from '../src/park-plan.js';
import {createExteriorPlan,exteriorDistance} from '../src/exterior-plan.js';
import {benchFootprint} from '../src/seating-plan.js';
test('park destinations leave the circuit and outer path clear and vegetation leaves the new footprints free',()=>{
 const plan=createExteriorPlan();
 for(const [l,r,t,b] of Object.values(parkSites))for(const x of [l,r])for(const z of [t,b])assert.ok(exteriorDistance(x,z)>9);
 for(const tree of plan.trees)assert.ok(parkFootprintClear(tree.x,tree.z,tree.radius));
 for(const shrub of plan.shrubs)assert.ok(parkFootprintClear(shrub.x,shrub.z,0.65));
 for(const grass of plan.meadow)assert.ok(parkFootprintClear(grass.x,grass.z,0.25));
 for(const rock of plan.rocks)assert.ok(parkFootprintClear(rock.x,rock.z,rock.size));
 const deck=parkSites.deck;
 for(const x of [-72.6,-70.2]){const [l,r,t,b]=benchFootprint({x,z:-24.45,lookAt:{x,z:-20}});assert.ok(l>deck[0]&&r<deck[1]&&t>deck[2]&&b<deck[3]);}
 for(const [from,to] of deckRailSegments)assert.ok(to<=parkSites.pondLink[2]||from>=parkSites.pondLink[3]);
 assert.equal(parkSites.pondLink[0],deck[1]);assert.equal(parkSites.pondLink[1],-61.6);
});
test('ducks remain inside the pond, clear of the deck, and headings are finite for long simulations',()=>{
 const pond=createExteriorPlan().pond;
 for(let t=0;t<1600;t+=0.5)for(let i=0;i<2;i++){const p=duckPose(t,i,pond);assert.ok(((p.x-pond.x)/pond.rx)**2+((p.z-pond.z)/pond.rz)**2<0.5);assert.ok(Number.isFinite(p.heading));assert.ok(parkFootprintClear(p.x,p.z,0.4));const other=duckPose(t,1-i,pond);assert.ok(Math.hypot(other.x-p.x,other.z-p.z)>3.5);}
});
test('spectators face nearby passing visitors and return to watching the track at a distance',()=>{
 const p=spectatorTarget(55,-20,{x:44,z:-20});assert.equal(p.photograph,true);assert.equal(p.heading,-Math.PI/2);
 const q=spectatorTarget(55,-20,{x:44,z:-11});assert.ok(q.heading>-Math.PI/2&&q.heading<0);
 const far=spectatorTarget(55,-20,{x:0,z:12});assert.equal(far.photograph,false);assert.equal(far.heading,-Math.PI/2);
});
