import * as THREE from 'three';
import { addLandscape, addNameSculpture } from './landscape.js';
import { createVehicleVisuals } from './vehicle-visuals.js';
import { createFacilities } from './facilities.js';
import {rectUnion} from './road-network.js';
import {createCampusDetails} from './campus-details.js';
import {createRaceTrack} from './race-track.js';

const material = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, ...extra });
const materials = {
  ground: material('#e1e8e7'), road: material('#435b67'), green: material('#a4a651'),
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
  mesh.rotation.set(-Math.PI / 2, 0, angle); mesh.position.set(x, 0.105, z); scene.add(mesh); return mesh;
}

function addRoads(scene){
  const {positions:vertices,indices}=rectUnion();
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();
  const road=new THREE.Mesh(geometry,materials.road);road.receiveShadow=true;scene.add(road);
  for(let z=-44;z<25;z+=4){if([5,-18,-39].some(c=>Math.abs(c-z)<4.4))continue;box(scene,0.12,0.01,1.3,0,0.093,z,materials.white,false);}
  for(const [z,extent] of [[5,38],[-18,23],[-39,23]])for(let x=-extent;x<extent;x+=4){if(Math.abs(x)<4.5)continue;box(scene,1.3,0.01,0.12,x,0.093,z,materials.white,false);}
  groundText(scene,'← FRENET    AI    FMT-MPC →',0,-32,9,'#d5eeef');
  groundText(scene,'← RADAR    AUTONOMY →',0,-11.5,8,'#d5eeef');
  groundText(scene,'CIRCUIT  ↓',0,24,4.8,'#d5eeef');
  groundText(scene,'← CIRCUIT',-30,5,5,'#d5eeef',-Math.PI/2);groundText(scene,'CIRCUIT →',30,5,5,'#d5eeef',-Math.PI/2);
}

export async function createWorld(scene, vehicle) {
  const paving=document.createElement('canvas');paving.width=paving.height=256;
  const ctx=paving.getContext('2d');ctx.fillStyle='#e5ebea';ctx.fillRect(0,0,256,256);
  ctx.strokeStyle='#d3dddc';ctx.lineWidth=1;ctx.strokeRect(0,0,256,256);ctx.beginPath();ctx.moveTo(0,128);ctx.lineTo(256,128);ctx.moveTo(128,0);ctx.lineTo(128,256);ctx.stroke();
  const texture=new THREE.CanvasTexture(paving);texture.colorSpace=THREE.SRGBColorSpace;texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.repeat.set(32,32);texture.anisotropy=4;materials.ground.map=texture;
  box(scene, 160, 0.16, 160, 0, -0.14, 0, materials.ground, false);
  // A green perimeter frames a compact paved campus.
  const lawn=box(scene,160,0.02,160,0,-0.045,0,material('#8cab91'),false);
  box(scene,58,0.025,90,0,-0.025,-17,materials.ground,false);
  addRoads(scene);
  for(const z of [10,-13,-34])for(let i=0;i<6;i++)box(scene,0.55,0.012,1.3,-2.5+i,0.10,z,materials.white,false);
  // The western access crosses the water channel on a small bridge.
  for(const z of [1.1,8.9]){box(scene,7,0.35,0.12,-32,0.65,z,materials.stone);vehicle.addBarrier(-32,z,3.5,0.09,0);}
  const vehicleVisuals=await createVehicleVisuals(vehicle);
  const landscape=addLandscape(scene,vehicle);
  await addNameSculpture(scene);
  const facilities=createFacilities(scene,vehicle);
  const race=createRaceTrack(scene,vehicle);
  const details=createCampusDetails(scene,vehicle);
  return {
    vehicles:vehicleVisuals,
    setOverview(value){scene.fog.near=value?350:85;scene.fog.far=value?500:155;},
    facilities,race,
    setNight(value){vehicleVisuals.setNight(value);landscape.setNight(value);race.setNight(value);},
    update(time,dt,paused) {
      landscape.update(time);vehicleVisuals.update(dt,time);facilities.update(time,dt);race.update(dt,paused);details.update(time,dt);
    },
  };
}
