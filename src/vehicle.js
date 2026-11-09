import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { getVehicle } from './vehicle-catalog.js';
import { rampHeightAt } from './interactions.js';

export async function createVehicle(scene) {
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: -19, z: 0 });
  world.createCollider(RAPIER.ColliderDesc.cuboid(160, 0.1, 160).setTranslation(0, -0.1, 0).setFriction(0));
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0.5, 12)
    .setLinearDamping(0.08).setAngularDamping(4).setCcdEnabled(true));
  body.setEnabledTranslations(true, true, true, true);
  body.setEnabledRotations(false, true, false, true);
  const chassisCollider=world.createCollider(RAPIER.ColliderDesc.cuboid(0.8, 0.42, 1.45).setMass(450).setFriction(0).setRestitution(0.08), body);
  const group = new THREE.Group(); scene.add(group);
  let heading = Math.PI, speed = 0;
  let profile=getVehicle('offroader');
  const ramps=[];
  const surfaceHeight=()=>Math.max(0,...ramps.map(r=>rampHeightAt(r,group.position.x,group.position.z)));
  const props = [];
  let jumpHeld = false, steering = 0, acceleration = 0, signedSpeed = 0, impact = 0;
  let previousSpeed = 0;
  let lastInput = {};

  function update(dt, input) {
    const velocity = body.linvel();
    const rotation = body.rotation();
    heading = 2 * Math.atan2(rotation.y, rotation.w);
    const sin = Math.sin(heading), cos = Math.cos(heading);
    speed = velocity.x * sin + velocity.z * cos;
    const sideSpeed = velocity.x * cos - velocity.z * sin;
    signedSpeed = speed; lastInput = input;
    let nextSpeed = speed + input.throttle * (input.boost ? profile.acceleration*1.48 : profile.acceleration) * dt;
    if (!input.throttle) nextSpeed *= Math.exp(-1.0 * dt);
    if (input.brake) nextSpeed *= Math.exp(-8 * dt);
    nextSpeed = THREE.MathUtils.clamp(nextSpeed, -7, input.boost ? profile.boostSpeed : profile.maxSpeed);
    const lateral = sideSpeed * Math.exp(-(input.brake ? 2.4 : 9) * dt);
    let y = velocity.y;
    if (input.jump && !jumpHeld && body.translation().y < surfaceHeight()+0.55) y = 7;
    jumpHeld = !!input.jump;
    body.setLinvel({ x: sin * nextSpeed + cos * lateral, y, z: cos * nextSpeed - sin * lateral }, true);
    steering = THREE.MathUtils.lerp(steering, input.steering, 1 - Math.exp(-10 * dt));
    const yaw = steering * Math.min(Math.abs(nextSpeed) / 2, 1) * (input.brake ? 2.6 : profile.steering) * Math.sign(nextSpeed);
    body.setAngvel({ x: 0, y: yaw, z: 0 }, true);
    world.timestep = dt; world.step();
    sync();
    acceleration = THREE.MathUtils.clamp((signedSpeed - previousSpeed) / dt, -25, 25);
    impact = Math.max(0, Math.abs(nextSpeed) - speed - 1.5);
    previousSpeed = signedSpeed;
    for (const prop of props) {
      const p = prop.body.translation(), r = prop.body.rotation();
      prop.mesh.position.set(p.x, p.y, p.z); prop.mesh.quaternion.set(r.x, r.y, r.z, r.w);
    }
  }

  function sync() {
    const p = body.translation(), r = body.rotation();
    group.position.set(p.x, Math.max(0, p.y - 0.42), p.z); group.quaternion.set(r.x, r.y, r.z, r.w);
    heading = 2 * Math.atan2(r.y, r.w);
    const v = body.linvel(); speed = Math.hypot(v.x, v.z);
  }

  function reset() {
    body.setTranslation({ x: 0, y: 0.43, z: 12 }, true);
    body.setRotation({ x: 0, y: 1, z: 0, w: 0 }, true);
    stop(); previousSpeed = 0; signedSpeed = 0; steering = 0; jumpHeld = false; sync();
    for (const prop of props) {
      prop.body.setTranslation(prop.spawn, true); prop.body.setRotation({x:0,y:0,z:0,w:1}, true);
      prop.body.setLinvel({x:0,y:0,z:0}, true); prop.body.setAngvel({x:0,y:0,z:0},true);
    }
  }
  function stop() {
    body.setLinvel({ x: 0, y: 0, z: 0 }, true); body.setAngvel({ x: 0, y: 0, z: 0 }, true); speed = 0;
    signedSpeed=0;previousSpeed=0;acceleration=0;impact=0;lastInput={};steering=0;
  }
  function addObstacle(x, z, halfX, halfZ) {
    world.createCollider(RAPIER.ColliderDesc.cuboid(halfX, 2, halfZ).setTranslation(x, 0, z));
  }
  function addBarrier(x,z,halfLength,halfWidth,angle){
    world.createCollider(RAPIER.ColliderDesc.cuboid(halfLength,0.7,halfWidth).setTranslation(x,0.65,z).setRotation({x:0,y:Math.sin(angle/2),z:0,w:Math.cos(angle/2)}));
  }
  function addTraffic(mesh,initial,halfWidth,halfLength){
    const traffic=world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(initial.x,0.5,initial.z));
    world.createCollider(RAPIER.ColliderDesc.cuboid(halfWidth,0.4,halfLength).setFriction(0.3),traffic);
    return {setPose(pose){
      const rotation={x:0,y:Math.sin(pose.heading/2),z:0,w:Math.cos(pose.heading/2)};
      traffic.setNextKinematicTranslation({x:pose.x,y:0.5,z:pose.z});traffic.setNextKinematicRotation(rotation);
      mesh.position.set(pose.x,0.08,pose.z);mesh.quaternion.set(rotation.x,rotation.y,rotation.z,rotation.w);
    }};
  }
  function addProp(mesh, x, y, z, half = 0.5) {
    const propBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y,z).setLinearDamping(0.4).setAngularDamping(0.7).setCcdEnabled(true));
    world.createCollider(RAPIER.ColliderDesc.cuboid(half,half,half).setMass(12).setFriction(0.7).setRestitution(0.25), propBody);
    props.push({mesh,body:propBody,spawn:{x,y,z}});
  }
  function setProfile(id) {
    const next=getVehicle(id);
    chassisCollider.setShape(new RAPIER.Cuboid(next.halfWidth,0.42,next.halfLength));
    profile=next;stop();previousSpeed=0;signedSpeed=0;
  }
  function addRamp(x,z,width,length,height) {
    const vertices=new Float32Array([-width/2,0,-length/2,width/2,0,-length/2,-width/2,0,length/2,width/2,0,length/2,-width/2,height,-length/2,width/2,height,-length/2]);
    const collider=RAPIER.ColliderDesc.convexHull(vertices);
    if(!collider)throw new Error('Invalid ramp geometry');
    world.createCollider(collider.setTranslation(x,0,z).setFriction(0).setRestitution(0));
    ramps.push({x,z,width,length,height});
  }
  // World bounds stop visitors from driving into an empty, endless plane.
  addObstacle(-55, -17, 1, 65); addObstacle(55, -17, 1, 65);
  addObstacle(0, 43, 55, 1); addObstacle(0, -76, 55, 1);
  reset();
  return { group, update, reset, stop, addObstacle, addBarrier, addTraffic, addProp, addRamp, setProfile,
    get profile(){return profile.id;},
    get speed() { return speed; }, get heading() { return heading; },
    get motion() { return { speed, signedSpeed, steering, acceleration, impact, input: lastInput, grounded: group.position.y-surfaceHeight() < 0.12 }; },
  };
}
