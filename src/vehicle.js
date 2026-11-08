import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';

export async function createVehicle(scene) {
  await RAPIER.init();
  const world = new RAPIER.World({ x: 0, y: 0, z: 0 });
  const body = world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(0, 0, 12)
    .setLinearDamping(2.8).setAngularDamping(6).setCcdEnabled(true));
  body.setEnabledTranslations(true, false, true, true);
  body.setEnabledRotations(false, true, false, true);
  world.createCollider(RAPIER.ColliderDesc.cuboid(0.86, 0.5, 1.65).setMass(850).setFriction(0.2).setRestitution(0.08), body);
  const group = new THREE.Group(); scene.add(group);
  let heading = Math.PI, speed = 0;
  const maxSpeed = 12;

  function update(dt, input) {
    const velocity = body.linvel();
    const rotation = body.rotation();
    heading = 2 * Math.atan2(rotation.y, rotation.w);
    const sin = Math.sin(heading), cos = Math.cos(heading);
    speed = velocity.x * sin + velocity.z * cos;
    const sideSpeed = velocity.x * cos - velocity.z * sin;
    let nextSpeed = speed + input.throttle * 10 * dt;
    // Rolling resistance and strong braking make project parking forgiving.
    if (!input.throttle) nextSpeed *= Math.exp(-2.2 * dt);
    if (input.brake) nextSpeed *= Math.exp(-14 * dt);
    nextSpeed = THREE.MathUtils.clamp(nextSpeed, -5, maxSpeed);
    const lateral = sideSpeed * Math.exp(-15 * dt);
    body.setLinvel({ x: sin * nextSpeed + cos * lateral, y: 0, z: cos * nextSpeed - sin * lateral }, true);
    const yaw = input.steering * Math.min(Math.abs(nextSpeed) / 3, 1) * 1.65 * Math.sign(nextSpeed);
    body.setAngvel({ x: 0, y: yaw, z: 0 }, true);
    world.timestep = dt; world.step();
    sync();
  }

  function sync() {
    const p = body.translation(), r = body.rotation();
    group.position.set(p.x, 0.04, p.z); group.quaternion.set(r.x, r.y, r.z, r.w);
    heading = 2 * Math.atan2(r.y, r.w);
    const v = body.linvel(); speed = Math.hypot(v.x, v.z);
  }

  function reset() {
    body.setTranslation({ x: 0, y: 0, z: 12 }, true);
    body.setRotation({ x: 0, y: 1, z: 0, w: 0 }, true);
    stop(); sync();
  }
  function stop() {
    body.setLinvel({ x: 0, y: 0, z: 0 }, true); body.setAngvel({ x: 0, y: 0, z: 0 }, true); speed = 0;
  }
  function addObstacle(x, z, halfX, halfZ) {
    world.createCollider(RAPIER.ColliderDesc.cuboid(halfX, 2, halfZ).setTranslation(x, 0, z));
  }
  // World bounds stop visitors from driving into an empty, endless plane.
  addObstacle(-35, -12, 1, 54); addObstacle(35, -12, 1, 54);
  addObstacle(0, 29, 35, 1); addObstacle(0, -53, 35, 1);
  reset();
  return { group, update, reset, stop, addObstacle, get speed() { return speed; }, get heading() { return heading; } };
}
