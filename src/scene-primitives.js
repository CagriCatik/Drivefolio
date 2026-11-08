import * as THREE from 'three';
export const mat=color=>new THREE.MeshStandardMaterial({color,roughness:0.85});
export function block(parent,w,h,d,x,y,z,material){const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;}
export function label(parent,text,x,y,z,width,color='#faebd7'){
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=192;
  const ctx=canvas.getContext('2d');ctx.fillStyle=color;ctx.font='bold 68px Arial';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,96,990);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
  const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,width*192/1024),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,side:THREE.DoubleSide}));mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
