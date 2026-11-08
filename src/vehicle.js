import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export async function createVehicle(scene) {
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: -19, z: 0 });
  world.createCollider(RAPIER.ColliderDesc.cuboid(160, 0.1, 160).setTranslation(0, -0.1, 0).setFriction(0));
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0.5, 12)
    .setLinearDamping(0.08).setAngularDamping(4).setCcdEnabled(true));
  body.setEnabledTranslations(true, true, true, true);
  body.setEnabledRotations(false, true, false, true);
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.8, 0.42, 1.45).setMass(450).setFriction(0).setRestitution(0.08), body);
  const group = new THREE.Group(); scene.add(group);
  let heading = Math.PI, speed = 0;
  const maxSpeed = 16;
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
    let nextSpeed = speed + input.throttle * (input.boost ? 28 : 19) * dt;
    if (!input.throttle) nextSpeed *= Math.exp(-1.0 * dt);
    if (input.brake) nextSpeed *= Math.exp(-8 * dt);
    nextSpeed = THREE.MathUtils.clamp(nextSpeed, -7, input.boost ? 26 : maxSpeed);
    const lateral = sideSpeed * Math.exp(-(input.brake ? 2.4 : 9) * dt);
    let y = velocity.y;
    if (input.jump && !jumpHeld && body.translation().y < 0.55) y = 7;
    jumpHeld = !!input.jump;
    body.setLinvel({ x: sin * nextSpeed + cos * lateral, y, z: cos * nextSpeed - sin * lateral }, true);
    steering = THREE.MathUtils.lerp(steering, input.steering, 1 - Math.exp(-10 * dt));
    const yaw = steering * Math.min(Math.abs(nextSpeed) / 2, 1) * (input.brake ? 2.6 : 1.75) * Math.sign(nextSpeed);
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
  }
  function addObstacle(x, z, halfX, halfZ) {
    world.createCollider(RAPIER.ColliderDesc.cuboid(halfX, 2, halfZ).setTranslation(x, 0, z));
  }
  function addProp(mesh, x, y, z, half = 0.5) {
    const propBody = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,y,z).setLinearDamping(0.4).setAngularDamping(0.7).setCcdEnabled(true));
    world.createCollider(RAPIER.ColliderDesc.cuboid(half,half,half).setMass(12).setFriction(0.7).setRestitution(0.25), propBody);
    props.push({mesh,body:propBody,spawn:{x,y,z}});
  }
  // World bounds stop visitors from driving into an empty, endless plane.
  addObstacle(-35, -12, 1, 54); addObstacle(35, -12, 1, 54);
  addObstacle(0, 29, 35, 1); addObstacle(0, -53, 35, 1);
  reset();
  return { group, update, reset, stop, addObstacle, addProp,
    get speed() { return speed; }, get heading() { return heading; },
    get motion() { return { speed, signedSpeed, steering, acceleration, impact, input: lastInput, grounded: group.position.y < 0.12 }; },
  };
}
