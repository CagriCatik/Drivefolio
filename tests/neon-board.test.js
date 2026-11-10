import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createNeonBoard,isNeonBoardVisible,neonBoardTheme} from '../src/neon-board.js';
test('unified information boards keep frame and face inside the intended wall footprint',()=>{
 for(const [width,height] of [[11.4,1.9],[1.9,2.7],[3.2,0.46],[7.5,0.7]]){const parent=new THREE.Group(),g=createNeonBoard(parent,{title:'TEST',texture:new THREE.Texture(),width,height});const bounds=new THREE.Box3().setFromObject(g),size=bounds.getSize(new THREE.Vector3());assert.ok(size.x<width+0.9&&size.y<height+0.9);assert.ok(size.z<0.18);assert.ok(g.userData.neonBoard.haloMaterial.transparent);assert.equal(g.userData.neonBoard.backing.parent,g);assert.equal(g.userData.neonBoard.edgeMaterial.type,'MeshBasicMaterial');assert.equal(g.userData.neonBoard.backing.material.color.getHexString(),new THREE.Color(neonBoardTheme.background).getHexString());}
});
test('boards hidden with their project station cannot remain hover targets',()=>{
 const root=new THREE.Group(),station=new THREE.Group();root.add(station);const board=createNeonBoard(station,{title:'RADAR',texture:new THREE.Texture()});assert.equal(isNeonBoardVisible(board),true);station.visible=false;assert.equal(isNeonBoardVisible(board),false);station.visible=true;board.visible=false;assert.equal(isNeonBoardVisible(board),false);board.visible=true;root.visible=false;assert.equal(isNeonBoardVisible(board),false);
});

test('pointer hits the actual 3D board and hover changes its color, including an offset canvas',async()=>{
 const {createNeonBoardsController}=await import('../src/neon-board.js'),{pointerToCanvas}=await import('../src/neon-hit-test.js');
 const scene=new THREE.Scene(),station=new THREE.Group();scene.add(station);station.position.set(15,0,-5);const board=createNeonBoard(station,{title:'DYNAMICS',texture:new THREE.Texture(),y:1.45,z:-6.78});
 const {createPortfolioCamera}=await import('../src/camera.js');const view=createPortfolioCamera(1.8);view.setOverview(true);for(let i=0;i<300;i++)view.update(1/60,new THREE.Vector3(),0,false);view.camera.updateMatrixWorld();scene.updateMatrixWorld(true);
 const ndc=board.getWorldPosition(new THREE.Vector3()).project(view.camera),rect={left:75,top:40,width:1260,height:700},x=rect.left+(ndc.x+1)*rect.width/2,y=rect.top+(1-ndc.y)*rect.height/2;
 assert.ok(pointerToCanvas(x,y,rect).distanceTo(new THREE.Vector2(ndc.x,ndc.y))<1e-8);
 const events=new Map(),canvas={addEventListener:(type,fn)=>events.set(type,fn),getBoundingClientRect:()=>rect},oldDoc=globalThis.document,oldWindow=globalThis.window;
 globalThis.document={getElementById:()=>canvas};globalThis.window={matchMedia:()=>({matches:false})};
 try{const controller=createNeonBoardsController(scene);controller.setNight(true);const before=board.userData.neonBoard.edgeMaterial.color.clone();events.get('pointermove')({pointerType:'mouse',clientX:x,clientY:y});for(let i=0;i<60;i++)controller.update(view.camera,false,1/60);assert.ok(board.userData.neonBoard.hover>0.95);const after=board.userData.neonBoard.edgeMaterial.color;assert.ok(after.r>after.g*2,'hover must be clearly pink, not cyan');assert.ok(before.g>before.r);assert.ok(board.scale.x>1.035);events.get('pointerleave')();for(let i=0;i<60;i++)controller.update(view.camera,false,1/60);assert.ok(board.userData.neonBoard.hover<0.001);}
 finally{if(oldDoc===undefined)delete globalThis.document;else globalThis.document=oldDoc;if(oldWindow===undefined)delete globalThis.window;else globalThis.window=oldWindow;}
});
