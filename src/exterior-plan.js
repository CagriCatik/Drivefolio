import {trackPoints,offsetLoop} from './road-network.js';
// Signed distance to the rounded-rectangle racing centreline; positive is outside.
export function exteriorDistance(x,z){return Math.hypot(Math.max(Math.abs(x)-30,0),Math.max(Math.abs(z+16)-33,0))-14;}
export const exteriorPond={x:-77,z:-23,rx:7.8,rz:4.8};
const reserved=[[-56,56,-74,-68],[48,56,-30,-10],[-55,-48,-47,-39],[48,55,9,17],[-55,-48,-21,-12],[-28,25,36,42]];
export function exteriorClear(x,z,radius=0){return exteriorDistance(x,z)>8.8+radius&&!reserved.some(([l,r,t,b])=>x>l-radius&&x<r+radius&&z>t-radius&&z<b+radius);}
export function createExteriorPlan(){
 let seed=4217;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 const ring=offsetLoop(trackPoints(),-29),trail=offsetLoop(trackPoints(),-16.5),trees=[],shrubs=[],meadow=[],rocks=[];
 const inPond=(x,z,margin=0)=>((x-exteriorPond.x)/(exteriorPond.rx+margin))**2+((z-exteriorPond.z)/(exteriorPond.rz+margin))**2<1;
 function trailDistance(x,z){let d=Infinity;for(let i=0;i<trail.length;i++){const p=trail[i],q=trail[(i+1)%trail.length],dx=q.x-p.x,dz=q.z-p.z,t=Math.max(0,Math.min(1,((x-p.x)*dx+(z-p.z)*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-p.x-t*dx,z-p.z-t*dz));}return d;}
 for(let i=0;i<ring.length;i+=15){const anchor=ring[i];for(let j=0;j<3;j++){
  const x=anchor.x+(random()-0.5)*12,z=anchor.z+(random()-0.5)*12,radius=1.6+random()*0.65;
  if(exteriorClear(x,z,radius)&&trailDistance(x,z)>radius+2.2&&!inPond(x,z,2)&&!trees.some(t=>Math.hypot(t.x-x,t.z-z)<3.5))trees.push({x,z,radius,height:3.8+random()*2.2,type:i%3});
 }}
 const hedge=offsetLoop(trackPoints(),-11.7);
 for(let i=0;i<hedge.length;i+=5){const p=hedge[i],x=p.x+(random()-0.5)*0.6,z=p.z+(random()-0.5)*0.6;if(exteriorClear(x,z,0.65))shrubs.push({x,z,size:0.55+random()*0.35});}
 for(let i=0;i<12000;i++){const x=-96+random()*192,z=-111+random()*190,d=exteriorDistance(x,z);if(d<10||d>43||!exteriorClear(x,z,0.25)||trailDistance(x,z)<1.7||inPond(x,z,0.7))continue;meadow.push({x,z,height:0.22+random()*0.48,angle:random()*6.28,flower:i%13===0});}
 for(let i=0;i<18;i++){const a=i/18*Math.PI*2,x=exteriorPond.x+Math.cos(a)*(exteriorPond.rx+0.35),z=exteriorPond.z+Math.sin(a)*(exteriorPond.rz+0.4);rocks.push({x,z,size:0.3+random()*0.4});}
 return {trail,trees,shrubs,meadow,rocks,pond:exteriorPond};
}
export function exteriorTrailMesh(points){
 const positions=[],indices=[];
 points.forEach((p,i)=>{const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length],dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);for(const side of [-1,1])positions.push(p.x-dz/l*side*1.1,0.025,p.z+dx/l*side*1.1);const j=(i+1)%points.length;indices.push(i*2,i*2+1,j*2,j*2,i*2+1,j*2+1);});
 return {positions,indices};
}
