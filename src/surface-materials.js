import * as THREE from 'three';
let asphalt;
export function asphaltMaterial(){
  if(asphalt)return asphalt;
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;
  const ctx=canvas.getContext('2d'),image=ctx.createImageData(256,256);let seed=91;
  for(let i=0;i<image.data.length;i+=4){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const value=207+(seed%33);image.data.set([value,value,value,255],i);}
  ctx.putImageData(image,0,0);
  const texture=new THREE.CanvasTexture(canvas);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;
  asphalt=new THREE.MeshStandardMaterial({color:'#526b77',map:texture,bumpMap:texture,bumpScale:0.018,roughness:0.94,metalness:0.02,side:THREE.DoubleSide});return asphalt;
}
export function worldUV(geometry,scale=0.25){
  const positions=geometry.getAttribute('position'),uv=new Float32Array(positions.count*2);
  for(let i=0;i<positions.count;i++){uv[i*2]=positions.getX(i)*scale;uv[i*2+1]=positions.getZ(i)*scale;}
  geometry.setAttribute('uv',new THREE.BufferAttribute(uv,2));
}
