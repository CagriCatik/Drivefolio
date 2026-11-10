import * as THREE from 'three';
// One coordinated 24-second palette for all campus signs, independent of input.
const palette=['#ffdf00','#102b60'].map(hex=>new THREE.Color(hex));
export function neonCycleColor(seconds,target=new THREE.Color()){
 const phase=((seconds%24)+24)%24/12,index=Math.floor(phase),fraction=phase-index;
 return target.copy(palette[index]).lerp(palette[(index+1)%palette.length],fraction*fraction*(3-2*fraction));
}
