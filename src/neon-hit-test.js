import * as THREE from 'three';
export function pointerToCanvas(clientX,clientY,rect){return new THREE.Vector2((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2);}
export function pickBoard(camera,pointer,boards,raycaster=new THREE.Raycaster()){
 camera.updateMatrixWorld();for(const b of boards)b.updateWorldMatrix(true,true);
 raycaster.setFromCamera(pointer,camera);const hits=raycaster.intersectObjects(boards.map(b=>b.userData.neonBoard.backing),false);return hits[0]?.object.parent??null;
}
