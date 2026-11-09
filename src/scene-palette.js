import * as THREE from 'three';
// Shared surface families keep architecture, paving and fixtures in one palette.
export function surfaceParameters(value){
 const c=new THREE.Color(value),max=Math.max(c.r,c.g,c.b),min=Math.min(c.r,c.g,c.b),saturation=max?1-min/max:0;
 if(saturation<0.28&&max>0.5)return {color:new THREE.Color('#d6d4c5'),roughness:0.88,metalness:0};
 if(max<0.14)return {color:new THREE.Color('#34494d'),roughness:0.64,metalness:0.12};
 return {color:c,roughness:0.83,metalness:0.02};
}
