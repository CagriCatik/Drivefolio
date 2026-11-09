import * as THREE from 'three';
const textures=new Map(),materials=new Map();
function grain(kind){
 if(textures.has(kind))return textures.get(kind);
 const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),pixels=ctx.createImageData(128,128);let seed=723;
 for(let i=0;i<pixels.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const n=kind==='timber'?225+Math.sin((i/4%128)*0.65)*8+(seed%9):229+(seed%20);pixels.data.set([n,n,n,255],i);}
 ctx.putImageData(pixels,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=4;textures.set(kind,t);return t;
}
// Environment only: project exhibits and original vehicle paint keep their own materials.
export function environmentMaterial(color,kind){
 const c=new THREE.Color(color),max=Math.max(c.r,c.g,c.b),min=Math.min(c.r,c.g,c.b);
 kind??=max<0.13?'metal':max-min<0.22?'mineral':'paint';const key=color+kind;if(materials.has(key))return materials.get(key);
 const m=new THREE.MeshStandardMaterial({color,roughness:kind==='metal'?0.53:kind==='timber'?0.82:0.91,metalness:kind==='metal'?0.32:0.015});
 if(kind==='mineral'||kind==='timber'){m.map=grain(kind);m.bumpMap=m.map;m.bumpScale=kind==='timber'?0.009:0.014;}
 materials.set(key,m);return m;
}
let shadowMap;
export function contactShadow(parent,width,depth,x,z,y=0.055,opacity=0.25){
 if(!shadowMap){const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,4,32,32,31);g.addColorStop(0,'rgba(15,28,25,0.8)');g.addColorStop(0.55,'rgba(15,28,25,0.45)');g.addColorStop(1,'rgba(15,28,25,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);shadowMap=new THREE.CanvasTexture(c);}
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(width,depth),new THREE.MeshBasicMaterial({map:shadowMap,transparent:true,opacity,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));mesh.rotation.x=-Math.PI/2;mesh.position.set(x,y,z);parent.add(mesh);return mesh;
}
