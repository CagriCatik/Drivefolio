import * as THREE from 'three';
import { addLandscape, addNameSculpture } from './landscape.js';
import { createVehicleVisuals } from './vehicle-visuals.js';
import { createFacilities } from './facilities.js';

const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, ...extra });
const materials = {
  ground: material('#d99a61'), road: material('#c58c60'), green: material('#a4a651'),
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
  box(scene, 6.8, 0.04, 68, 0, 0.01, -12, materials.road, false);
  box(scene, 43, 0.045, 6.8, 0, 0.015, 5, materials.road, false);
  // Short dashed lines give visitors a quiet visual route through the space.
  for (let z = -43; z <= 20; z += 4) box(scene, 0.13, 0.015, 1.35, 0, 0.04, z, materials.white, false);
  for (let x = -20; x <= 20; x += 4) {
    if (Math.abs(x) < 4) continue;
    box(scene, 1.35, 0.015, 0.13, x, 0.05, 5, materials.white, false);
  }
  box(scene,43,0.045,6.8,0,0.015,-18,materials.road,false);
  for(let x=-20;x<=20;x+=4){if(Math.abs(x)>4)box(scene,1.35,0.015,0.13,x,0.05,-18,materials.white,false);}
  box(scene,47,0.045,6.8,0,0.015,-39,materials.road,false);
  for(let x=-22;x<=22;x+=4){if(Math.abs(x)>4)box(scene,1.35,0.015,0.13,x,0.05,-39,materials.white,false);}
  groundText(scene,'FRENET  ←   AI   →  FMT-MPC',0,-34,11,'#665366');
  groundText(scene,'RADAR  ←    →  AUTONOMY',0,-13,9,'#665366');
  groundText(scene,'AI / MCP / A2A  ↑',0,-37,6.2,'#665366');
  groundText(scene, 'EXPLORE', 0, 21, 5, '#8e9385');
}

export async function createWorld(scene, vehicle) {
  const paving=document.createElement('canvas');paving.width=paving.height=256;
  const ctx=paving.getContext('2d');ctx.fillStyle='#f3e0c5';ctx.fillRect(0,0,256,256);
  ctx.strokeStyle='#dac4a5';ctx.lineWidth=3;ctx.strokeRect(0,0,256,256);ctx.beginPath();ctx.moveTo(0,128);ctx.lineTo(256,128);ctx.moveTo(128,0);ctx.lineTo(128,256);ctx.stroke();
  const texture=new THREE.CanvasTexture(paving);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(55,55);texture.anisotropy=4;materials.ground.map=texture;
  box(scene, 160, 0.16, 160, 0, -0.14, 0, materials.ground, false);
  addRoads(scene);
  const vehicleVisuals=await createVehicleVisuals(vehicle);
  const landscape=addLandscape(scene,vehicle);
  await addNameSculpture(scene);
  const facilities=createFacilities(scene,vehicle);
  return {
    vehicles:vehicleVisuals,
    facilities,
    update(time,dt) {
      landscape.update(time);vehicleVisuals.update(dt,time);facilities.update(time,dt);
    },
  };
}
