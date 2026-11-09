import * as THREE from 'three';

// Camera composition adapted from Bruno Simon, folio-2025 / Game/View.js (MIT).
// Keep the world angle stable when the vehicle turns. Perspective, 25-degree FOV.
export function createPortfolioCamera(aspect) {
  const camera = new THREE.PerspectiveCamera(25, aspect, 0.1, 350);
  const focus = new THREE.Vector3(0, 0, 12);
  const desired = focus.clone();
  const offset = new THREE.Vector3();
  let zoom = 1,overview=false,closeView=false;
  function update(dt, position, heading, moving) {
    desired.set(overview?0:position.x, 0, overview?-16:position.z);
    if (moving&&!overview) { desired.x += Math.sin(heading) * 2; desired.z += Math.cos(heading) * 2; }
    focus.lerp(desired, 1 - Math.exp(-3 * dt));
    const narrow = Math.max(0, 1.4 - camera.aspect);
    offset.setFromSphericalCoords(overview?220:closeView?Math.max(30,36/camera.aspect):(38 + narrow * 17) * zoom, Math.PI * 0.27, Math.PI * 0.25);
    camera.position.copy(focus).add(offset);
    camera.lookAt(focus);
  }
  update(0, focus, 0, false);
  return {
    camera, update,
    setCloseView(value){closeView=!!value;},
    setOverview(value){overview=!!value;},
    zoom(delta) { zoom = THREE.MathUtils.clamp(zoom + delta, 0.78, 1.9); },
    resize(aspect) { camera.aspect = aspect; camera.updateProjectionMatrix(); },
    reset(position) { focus.set(position.x, 0, position.z); },
  };
}
