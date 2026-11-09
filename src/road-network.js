import {circuitPoints} from './race-layout.js';
export const ROAD_Y=0.08,TRACK_HALF_WIDTH=3.8;
export const roadRects=[[-3.4,3.4,-46,27.2],[-40.2,40.2,1.6,8.4],[-24,24,-21.4,-14.6],[-24,24,-42.4,-35.6],
  [33.3,37.3,-38,-8],[35.3,40.2,-38,-34],[35.3,40.2,-12,-8],[24,37.3,-20,-16]];
export function rectUnion(rects=roadRects){
  const xs=[...new Set(rects.flatMap(r=>r.slice(0,2)))].sort((a,b)=>a-b),zs=[...new Set(rects.flatMap(r=>r.slice(2)))].sort((a,b)=>a-b),positions=[],indices=[];
  for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
    const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;
    if(!rects.some(([l,r,t,b])=>x>l&&x<r&&z>t&&z<b))continue;
    const n=positions.length/3;positions.push(xs[i],ROAD_Y,zs[j],xs[i+1],ROAD_Y,zs[j],xs[i],ROAD_Y,zs[j+1],xs[i+1],ROAD_Y,zs[j+1]);indices.push(n,n+2,n+1,n+1,n+2,n+3);
  }return {positions,indices};
}
// Insert exact access boundaries into the polyline, rather than dropping entire
// curb blocks near an entrance. Both adjacent ribbons use these same vertices.
export function trackPoints(){
  const base=circuitPoints(),points=[];
  for(let i=0;i<base.length;i++){
    const a=base[i],b=base[(i+1)%base.length],cuts=[0];
    for(const [axis,values] of [['x',[-3.4,3.4]],['z',[1.6,8.4,-38,-34,-12,-8]]]){
      if(Math.abs(b[axis]-a[axis])<1e-9)continue;
      for(const value of values){const t=(value-a[axis])/(b[axis]-a[axis]);if(t>1e-8&&t<1-1e-8)cuts.push(t);}
    }
    for(const t of [...new Set(cuts)].sort((a,b)=>a-b))points.push({x:a.x+(b.x-a.x)*t,z:a.z+(b.z-a.z)*t});
  }return points;
}
export function offsetLoop(points,distance){
  return points.map((p,i)=>{
    const a=points[(i+points.length-1)%points.length],b=points[(i+1)%points.length];
    const l0=Math.hypot(p.x-a.x,p.z-a.z),l1=Math.hypot(b.x-p.x,b.z-p.z);
    const n0={x:-(p.z-a.z)/l0,z:(p.x-a.x)/l0},n1={x:-(b.z-p.z)/l1,z:(b.x-p.x)/l1};
    const scale=distance/(1+n0.x*n1.x+n0.z*n1.z);
    return {x:p.x+(n0.x+n1.x)*scale,z:p.z+(n0.z+n1.z)*scale};
  });
}
export function isInnerAccess(p){
  return Math.abs(p.x)>40&&(p.z>1.6&&p.z<8.4||p.x>40&&(p.z>-38&&p.z<-34||p.z>-12&&p.z<-8))||p.z>30&&Math.abs(p.x)<3.4;
}
export function joinedStrip(points,from,to,y){
  const a=offsetLoop(points,from),b=offsetLoop(points,to),positions=[],indices=[];
  for(let i=0;i<points.length;i++){positions.push(a[i].x,y,a[i].z,b[i].x,y,b[i].z);const n=i*2,m=((i+1)%points.length)*2;indices.push(n,n+1,m,n+1,m+1,m);}return {positions,indices};
}
// Cross-section extrusion: top, inner and outer faces share every joint.
export function joinedBand(points,from,to,bottom,top,enabled=()=>true){
  const a=offsetLoop(points,from),b=offsetLoop(points,to),positions=[],indices=[],groups=[];
  const active=points.map((p,i)=>enabled({x:(p.x+points[(i+1)%points.length].x)/2,z:(p.z+points[(i+1)%points.length].z)/2}));
  for(let i=0;i<points.length;i++)positions.push(a[i].x,bottom,a[i].z,a[i].x,top,a[i].z,b[i].x,bottom,b[i].z,b[i].x,top,b[i].z);
  let distance=0;
  for(let i=0;i<points.length;i++){
    const j=(i+1)%points.length,start=indices.length,n=i*4,m=j*4;
    if(active[i]){
      indices.push(n+1,m+1,n+3,n+3,m+1,m+3,n,m,n+1,n+1,m,m+1,n+2,n+3,m+2,n+3,m+3,m+2);
      if(!active[(i+points.length-1)%points.length])indices.push(n,n+1,n+2,n+1,n+3,n+2);
      if(!active[j])indices.push(m,m+2,m+1,m+1,m+2,m+3);
      groups.push({start,count:indices.length-start,materialIndex:Math.floor(distance/2.5)%2});
    }
    distance+=Math.hypot(points[j].x-points[i].x,points[j].z-points[i].z);
  }return {positions,indices,groups,active};
}
