import * as THREE from 'three';
export function pointerToCanvas(clientX,clientY,rect){return new THREE.Vector2((clientX-rect.left)/rect.width*2-1,1-(clientY-rect.top)/rect.height*2);}
// A thin sign can occupy only a few pixels in the overview. Allow a small,
// constant CSS-pixel margin around its projected edges, regardless of zoom.
export function pickBoard(camera,pointer,boards,raycaster=new THREE.Raycaster(),rect=null){
 camera.updateMatrixWorld();for(const b of boards)b.updateWorldMatrix(true,true);
 raycaster.setFromCamera(pointer,camera);
 const hit=raycaster.intersectObjects(boards.map(b=>b.userData.neonBoard.backing),false)[0];
 if(hit)return hit.object.parent;
 if(!rect)return null;
 const p=new THREE.Vector2((pointer.x+1)*rect.width/2,(1-pointer.y)*rect.height/2);
 let nearest=null,best=14;
 for(const board of boards){
  const mesh=board.userData.neonBoard.backing;mesh.geometry.computeBoundingBox();const box=mesh.geometry.boundingBox;
  const corners=[[box.min.x,box.min.y],[box.max.x,box.min.y],[box.max.x,box.max.y],[box.min.x,box.max.y]].map(([x,y])=>mesh.localToWorld(new THREE.Vector3(x,y,box.max.z)).project(camera));
  if(corners.some(c=>c.z< -1||c.z>1))continue;
  const points=corners.map(c=>new THREE.Vector2((c.x+1)*rect.width/2,(1-c.y)*rect.height/2));
  let distance=Infinity;
  for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4],ab=b.clone().sub(a),t=THREE.MathUtils.clamp(p.clone().sub(a).dot(ab)/Math.max(ab.lengthSq(),1e-8),0,1);distance=Math.min(distance,p.distanceTo(a.clone().addScaledVector(ab,t)));}
  if(distance<best){best=distance;nearest=board;}
 }
 return nearest;
}
