import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { projects } from './projects.js';

const loader = new GLTFLoader();
const base = import.meta.env.BASE_URL;
const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, ...extra });
const materials = {
  ground: material('#e9e3d6'), road: material('#d0ccc0'), green: material('#bdc6a8'),
  white: material('#fffaf0'), stone: material('#b4ad9d'), dark: material('#343b36'),
};

function box(parent, width, height, depth, x, y, z, mat, shadow = true) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, height, depth), mat);
  mesh.position.set(x, y, z); mesh.castShadow = shadow; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}

function textTexture(text, color = '#354139', background = null, size = 80) {
  const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, 1024, 256); }
  ctx.fillStyle = color; ctx.font = `600 ${size}px Arial, sans-serif`;
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text, 512, 128, 990);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function groundText(scene, text, x, z, width, color, angle = 0) {
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, width / 4),
    new THREE.MeshBasicMaterial({ map: textTexture(text, color), transparent: true, depthWrite: false }));
  mesh.rotation.set(-Math.PI / 2, 0, angle); mesh.position.set(x, 0.055, z); scene.add(mesh); return mesh;
}

function addRoads(scene) {
  box(scene, 6.8, 0.04, 58, 0, 0.01, -8, materials.road, false);
  box(scene, 43, 0.045, 6.8, 0, 0.015, 5, materials.road, false);
  // Short dashed lines give visitors a quiet visual route through the space.
  for (let z = -33; z <= 20; z += 4) box(scene, 0.13, 0.015, 1.35, 0, 0.04, z, materials.white, false);
  for (let x = -20; x <= 20; x += 4) {
    if (Math.abs(x) < 4) continue;
    box(scene, 1.35, 0.015, 0.13, x, 0.05, 5, materials.white, false);
  }
  groundText(scene, 'EXPLORE', 0, 21, 5, '#8e9385');
}

function parkingBay(scene, project) {
  const { x, z } = project.position;
  const tint = material(project.color);
  box(scene, 7.6, 0.05, 9.4, x, 0.012, z, material(project.color).clone(), false);
  const stripe = materials.white;
  box(scene, 0.13, 0.02, 8, x - 3.15, 0.065, z, stripe, false);
  box(scene, 0.13, 0.02, 8, x + 3.15, 0.065, z, stripe, false);
  box(scene, 6.4, 0.02, 0.13, x, 0.065, z - 4, stripe, false);
  groundText(scene, 'P', x, z + 0.3, 4.7, '#fffaf0');
  box(scene, 4, 0.16, 0.25, x, 0.13, z - 3.3, materials.stone);
  // This ring doubles as parking progress feedback.
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.91, 40),
    new THREE.MeshBasicMaterial({ color: '#fffaf0', transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.085, z + 2.8); scene.add(ring);
  groundText(scene, project.number, x - 4.6, z + 1.5, 3.7, '#72796a');
  // Slim physical sign behind the bay, turned toward the camera.
  const sign = new THREE.Group(); sign.position.set(x, 0, z - 7.3);
  sign.rotation.y = Math.PI / 4;
  box(sign, 0.12, 2.4, 0.12, -2.4, 1.2, 0, materials.dark);
  box(sign, 0.12, 2.4, 0.12, 2.4, 1.2, 0, materials.dark);
  box(sign, 6.2, 1.45, 0.15, 0, 2.5, 0, tint);
  const face = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.35),
    new THREE.MeshBasicMaterial({ map: textTexture(project.category, '#fffaf0', null, 75), transparent: true }));
  face.position.set(0, 2.5, 0.085); sign.add(face); scene.add(sign);
  return ring;
}

function normalizeModel(model, targetWidth) {
  const bounds = new THREE.Box3().setFromObject(model);
  const size = bounds.getSize(new THREE.Vector3());
  const center = bounds.getCenter(new THREE.Vector3());
  const scale = targetWidth / Math.max(size.x, 0.01);
  model.scale.setScalar(scale);
  model.position.set(-center.x * scale, -bounds.min.y * scale, -center.z * scale);
  model.traverse(child => {
    if (child.isMesh) { child.castShadow = true; child.receiveShadow = true; }
  });
  return model;
}

async function loadModel(name) {
  const folder = name === 'car' ? 'car' : 'city';
  return (await loader.loadAsync(`${base}models/${folder}/${name}.glb`)).scene;
}

function addRobot(scene, x, z) {
  const group = new THREE.Group(); group.position.set(x, 0, z);
  const body = new THREE.Mesh(new THREE.CylinderGeometry(1.05, 1.05, 0.55, 24), materials.white);
  body.position.y = 0.42; body.castShadow = true; group.add(body);
  box(group, 0.7, 0.18, 0.5, 0, 0.8, 0, materials.dark);
  const lidar = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.3, 12), material('#8ba98f'));
  lidar.position.set(0, 1, 0); group.add(lidar); scene.add(group);
}

export async function createWorld(scene, vehicle) {
  const rings = new Map();
  box(scene, 260, 0.16, 260, 0, -0.14, 0, materials.ground, false);
  addRoads(scene);
  projects.forEach(project => rings.set(project.id, parkingBay(scene, project)));
  const [car, garage, trees] = await Promise.all(['car', 'garage', 'trees'].map(loadModel));
  normalizeModel(car, 1.85); vehicle.group.add(car);

  // Each station is composed explicitly; no random city blocks can obstruct a bay.
  for (const p of projects) {
    const holder = new THREE.Group();
    holder.add(normalizeModel(garage.clone(true), 5.2));
    holder.position.set(p.position.x + 7.6, 0, p.position.z - 9.5); scene.add(holder);
    vehicle.addObstacle(holder.position.x, holder.position.z, 2.6, 2.6);
  }
  const treePositions = [[-27, 12], [-25, -17], [-28, -32], [-18, -37], [15, -36], [27, -24], [28, 12], [24, -14], [-10, 22], [13, 22], [9, -46], [-12, -46]];
  for (const [x, z] of treePositions) {
    const tree = normalizeModel(trees.clone(true), 5);
    const holder = new THREE.Group(); holder.add(tree); holder.position.set(x, 0, z); scene.add(holder);
    vehicle.addObstacle(x, z, 1.2, 1.2);
  }
  addRobot(scene, -20, -11.5);
  // Stacked test blocks and a small automotive slalom give each area its own cue.
  for (let i = 0; i < 3; i++) box(scene, 1.15, 1.15, 1.15, -5.7, 0.58 + i * 1.2, -34, material(['#a297c5', '#c5bcdb', '#d6d1e4'][i]));
  for (let i = 0; i < 4; i++) {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.75, 8), material('#cf8b5f'));
    cone.position.set(22 + (i % 2) * 1.8, 0.38, -5 - i * 2); cone.castShadow = true; scene.add(cone);
  }
  return {
    update(time, parking) {
      for (const [id, ring] of rings) {
        const active = parking.bay?.id === id;
        ring.material.opacity = active ? 0.8 : 0.22 + Math.sin(time * 1.6) * 0.08;
        ring.scale.setScalar(active ? 1 + parking.progress * 0.3 : 1);
      }
    },
  };
}
