import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import * as THREE from 'three';
import {FontLoader} from 'three/addons/loaders/FontLoader.js';
import {nameLandmarkSite as site,createNeonNameGeometry} from '../src/name-landmark.js';
import {createPortfolioCamera} from '../src/camera.js';
import {benchFootprint,seatingPlaces} from '../src/seating-plan.js';
const corners=[];for(const x of [-site.width/2,site.width/2])for(const y of [0.1,3.7])for(const z of [-site.depth/2,site.depth/2])corners.push(new THREE.Vector3(x,y,z).applyAxisAngle(new THREE.Vector3(0,1,0),site.rotation).add(new THREE.Vector3(site.x,0,site.z)));
test('neon outlines use real Turkish glyphs and fit the backing panel without invalid vertices',()=>{
 const font=new FontLoader().parse(JSON.parse(readFileSync('public/fonts/name-bold.json','utf8'))),{body,neon}=createNeonNameGeometry(font);
 for(const geometry of [body,neon]){geometry.computeBoundingBox();const size=geometry.boundingBox.getSize(new THREE.Vector3());assert.ok(size.x<8.1&&size.y<1.3);assert.ok(geometry.attributes.position.count>1000);for(const v of geometry.attributes.position.array)assert.ok(Number.isFinite(v));geometry.dispose();}
});
test('name landmark and its base fit the introduction in desktop and narrow portrait views',()=>{
 for(const aspect of [1.8,1,0.5625,0.46]){const view=createPortfolioCamera(aspect),position=new THREE.Vector3(0,0,12);view.setIntro(true);for(let i=0;i<300;i++)view.update(1/60,position,0,false);view.camera.updateMatrixWorld();for(const corner of corners){const p=corner.clone().project(view.camera);assert.ok(Math.abs(p.x)<0.92&&Math.abs(p.y)<0.85,`${aspect}: clipped landmark ${p.toArray()}`);}view.setIntro(false);for(let i=0;i<300;i++)view.update(1/60,position,0,false);const reference=createPortfolioCamera(aspect);reference.reset(position);reference.update(1,position,0,false);assert.ok(view.camera.position.distanceTo(reference.camera.position)<0.01);}
});
test('name landmark leaves the main sidewalk and arrival seating clear',()=>{
 const minX=Math.min(...corners.map(p=>p.x)),maxX=Math.max(...corners.map(p=>p.x));assert.ok(maxX<-4.7,'intrudes into the sidewalk');
 const arrival=benchFootprint(seatingPlaces.find(p=>p.id==='arrival'));assert.ok(arrival[1]<minX,'arrival bench intersects the landmark');
});
