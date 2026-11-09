import * as THREE from 'three';
import {offsetLoop,trackPoints} from './road-network.js';
export function createParkGround(trees){
 const canvas=document.createElement('canvas');canvas.width=canvas.height=1024;const ctx=canvas.getContext('2d');ctx.fillStyle='#dce4c9';ctx.fillRect(0,0,1024,1024);ctx.setTransform(1024/280,0,0,1024/260,512,512);
 let seed=773;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 // Wide, softly blended meadow variations, baked once rather than stacked ground meshes.
 for(let i=0;i<180;i++){const x=(random()-0.5)*270,z=(random()-0.5)*250,r=4+random()*8,g=ctx.createRadialGradient(x,z,0,x,z,r);g.addColorStop(0,i%3?'rgba(109,134,83,0.19)':'rgba(204,190,137,0.22)');g.addColorStop(1,'rgba(150,160,110,0)');ctx.fillStyle=g;ctx.fillRect(x-r,z-r,r*2,r*2);}
 const mown=offsetLoop(trackPoints(),-9.1);ctx.beginPath();mown.forEach((p,i)=>i?ctx.lineTo(p.x,p.z):ctx.moveTo(p.x,p.z));ctx.closePath();ctx.strokeStyle='#c4d3a9';ctx.lineWidth=4.5;ctx.lineJoin='round';ctx.stroke();
 for(const t of trees){const r=t.radius*1.3,g=ctx.createRadialGradient(t.x,t.z,r*0.25,t.x,t.z,r);g.addColorStop(0,'rgba(107,100,74,0.8)');g.addColorStop(0.6,'rgba(131,127,87,0.45)');g.addColorStop(1,'rgba(131,127,87,0)');ctx.fillStyle=g;ctx.fillRect(t.x-r,t.z-r,r*2,r*2);}
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=4;texture.repeat.set(1/140,-1/130);texture.offset.set(0.5,0.5);
 return new THREE.MeshStandardMaterial({color:'#a5b996',map:texture,roughness:1});
}
