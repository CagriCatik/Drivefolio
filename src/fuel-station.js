import * as THREE from 'three';
import {mat,block,label} from './scene-primitives.js';
import {asphaltMaterial,worldUV} from './surface-materials.js';
import {switchFixtures} from './fixture-lighting.js';
import {atFuelPump,fuelBays} from './fuel.js';

export function createFuelStation(scene,vehicle){
  const group=new THREE.Group();scene.add(group);
  const dark=mat('#243e4d'),white=mat('#dce9e8'),teal=mat('#237e83'),yellow=mat('#e6bc6b');
  const floorGeometry=new THREE.PlaneGeometry(11,14.6);floorGeometry.rotateX(-Math.PI/2);floorGeometry.translate(15.5,0.08,15.7);worldUV(floorGeometry);
  const floor=new THREE.Mesh(floorGeometry,asphaltMaterial());floor.receiveShadow=true;group.add(floor);
  const stripe=new THREE.MeshBasicMaterial({color:'#bcd8d7',polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
  for(const x of [10.2,20.8])block(group,0.08,0.01,14,x,0.098,15.7,stripe);
  // A compact central island leaves two full-width vehicle lanes and a turning apron.
  block(group,1.45,0.18,8.2,15.5,0.09,14.5,white);
  for(const z of [10.6,18.4]){
    block(group,0.24,3.6,0.24,15.5,1.9,z,dark);vehicle.addObstacle(15.5,z,0.22,0.22);
    for(const x of [14.65,16.35]){block(group,0.1,0.7,0.1,x,0.4,z,yellow);vehicle.addObstacle(x,z,0.08,0.08);}
  }
  block(group,10.7,0.30,9.2,15.5,3.85,14.5,white);
  block(group,10.8,0.26,9.3,15.5,3.62,14.5,teal);
  label(group,'CAMPUS FUEL',15.5,3.65,19.19,7.5,'#edf9f7');
  const frontSign=label(group,'CAMPUS FUEL',15.5,3.65,9.81,7.5,'#edf9f7');frontSign.rotation.y=Math.PI;
  const glow=new THREE.MeshStandardMaterial({color:'#e5fff4',emissive:'#bdebdc',emissiveIntensity:0});
  const nightLights=[];
  for(const x of [12.3,18.7]){
    block(group,0.18,0.04,6.6,x,3.46,14.5,glow);
    const light=new THREE.PointLight('#d5fff1',0,12,1.7);light.position.set(x,3.2,14.5);group.add(light);nightLights.push(light);
  }
  const displayCanvas=document.createElement('canvas');displayCanvas.width=512;displayCanvas.height=256;
  const ctx=displayCanvas.getContext('2d'),texture=new THREE.CanvasTexture(displayCanvas);texture.colorSpace=THREE.SRGBColorSpace;
  const screen=new THREE.MeshBasicMaterial({map:texture});
  for(const z of [13,16]){
    block(group,0.95,1.55,0.85,15.5,0.95,z,white);block(group,1.02,0.18,0.92,15.5,1.8,z,teal);vehicle.addObstacle(15.5,z,0.6,0.55);
    for(const side of [-1,1]){
      const panel=new THREE.Mesh(new THREE.PlaneGeometry(0.65,0.5),screen);panel.rotation.y=side*Math.PI/2;panel.position.set(15.5+side*0.481,1.25,z);group.add(panel);
      // Short rubber hose and a holstered nozzle on each accessible side.
      const points=[new THREE.Vector3(15.5+side*0.51,1.5,z+0.27),new THREE.Vector3(15.5+side*0.78,0.9,z+0.4),new THREE.Vector3(15.5+side*0.72,0.45,z),new THREE.Vector3(15.5+side*0.53,1.05,z-0.26)];
      const hose=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points),16,0.035,6,false),dark);group.add(hose);
      block(group,0.13,0.24,0.12,15.5+side*0.55,1.13,z-0.26,teal);
    }
  }
  for(const bay of fuelBays){
    for(const x of [bay.x-1.25,bay.x+1.25])block(group,0.07,0.01,5.6,x,0.105,bay.z,stripe);
    label(group,'E / TANKEN',bay.x,0.12,17.9,2.2,'#b8e6d6').rotation.x=-Math.PI/2;
  }
  // Service kiosk sits behind the turning apron, outside both pump lanes.
  block(group,8.5,2.5,1.7,15.5,1.25,22.1,white);block(group,8.9,0.18,2.1,15.5,2.6,22.1,dark);vehicle.addObstacle(15.5,22.1,4.25,0.85);
  block(group,5.5,1.3,0.04,14.7,1.5,21.23,new THREE.MeshStandardMaterial({color:'#548895',metalness:0.35,roughness:0.22}));
  block(group,1.1,2.0,0.05,18.5,1.05,21.22,dark);label(group,'FUEL / SERVICE',15.5,2.27,21.2,5.7,'#24515c').rotation.y=Math.PI;
  for(const x of [11.6,19.4])block(group,0.35,0.6,0.45,x,0.3,20.9,dark);
  const hud=document.getElementById('fuel-station-hud'),message=document.getElementById('fuel-station-message'),progress=document.getElementById('fuel-progress');
  let lastDisplay='';
  return {
    setNight(night){switchFixtures(nightLights,[glow],night,36);},
    interact(){if(vehicle.fuel.refueling)vehicle.fuel.cancel();else vehicle.fuel.start(vehicle.group.position,vehicle.speed,vehicle.motion.grounded);},
    update(paused){
      if(paused)vehicle.fuel.cancel();
      const fuel=vehicle.fuel,near=atFuelPump(vehicle.group.position);hud.hidden=!near||paused;
      message.textContent=fuel.refueling?`Tankt … ${fuel.delivered.toFixed(1)} l · E zum Beenden`:fuel.fraction>0.999?'Vollgetankt. Gute Fahrt!':vehicle.speed>=0.5?'An der Zapfsäule anhalten':`E drücken zum Tanken · ${fuel.liters.toFixed(1)} / 50 l`;
      progress.value=fuel.fraction;
      const text=`${fuel.refueling?'TANKT …':'SUPER / 95'}|${fuel.liters.toFixed(1)} l|${fuel.delivered.toFixed(1)} l`;
      if(text!==lastDisplay){lastDisplay=text;ctx.fillStyle='#172e37';ctx.fillRect(0,0,512,256);ctx.textAlign='center';ctx.fillStyle='#98efcc';ctx.font='bold 34px monospace';ctx.fillText(text.split('|')[0],256,55);ctx.font='bold 65px monospace';ctx.fillText(text.split('|')[1],256,145);ctx.font='26px monospace';ctx.fillText(`GETANKT ${text.split('|')[2]}`,256,213);texture.needsUpdate=true;}
    },
  };
}
