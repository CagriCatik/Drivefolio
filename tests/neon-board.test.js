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
