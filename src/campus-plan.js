import {roadRects} from './road-network.js';
export const campusTrees=[[-8,11],[8,21],[-25,14],[25,20],[-25,-5],[26,-6],[-25,-29],[26,-29],[-25.1,-52],[27,-52],[-8,-12],[8,-12],[-8,-33],[8,-33]];
// Ground footprints: paths stop at forecourts instead of covering them.
export const campusFootprints=[[-22.2,-11.8,9.3,18.7],[-21.2,-8.8,-10.2,1.6],[7.8,22.2,-12.2,2.1],[-22.2,-7.8,-34.2,-21.8],[7.8,22.2,-34.2,-21.8],[-23.2,-8.8,-55.2,-42.8],[-8.2,8.2,-55.2,-42.8],[8.8,23.2,-55.2,-42.8],[10,21,8.4,23],
 ...campusTrees.map(([x,z])=>[x-1.8,x+1.8,z-1.8,z+1.8])];
export const gardenBeds=[[-6.5,-5.4,1.7,7.6],[6.5,-5.4,1.7,7.6],[-6.5,-27.5,1.7,7.2],[6.5,-27.5,1.7,7.2],[-24.4,-25,2,3.4],[24.4,-25,2,3.4],[-24.5,-46,1.8,6],[24.5,-46,1.8,6],[-16,23,8,3]];
export const contains=(r,x,z)=>x>r[0]&&x<r[1]&&z>r[2]&&z<r[3];
export function subtractRects(includes,excludes){
 const rects=[...includes,...excludes],xs=[...new Set(rects.flatMap(r=>r.slice(0,2)))].sort((a,b)=>a-b),zs=[...new Set(rects.flatMap(r=>r.slice(2)))].sort((a,b)=>a-b),tiles=[];
 for(let i=0;i<xs.length-1;i++)for(let j=0;j<zs.length-1;j++){
  const x=(xs[i]+xs[i+1])/2,z=(zs[j]+zs[j+1])/2;
  if(includes.some(r=>contains(r,x,z))&&!excludes.some(r=>contains(r,x,z)))tiles.push([xs[i],xs[i+1],zs[j],zs[j+1]]);
 }return tiles;
}
export function campusPaths(){
 const streets=roadRects.slice(0,4),expanded=streets.map(([l,r,t,b])=>[Math.max(-26,l-1.3),Math.min(26,r+1.3),Math.max(-55,t-1.3),Math.min(26,b+1.3)]);
 const promenade=[-28.4,-26.9,-55,25],links=[[-27,-23,9.2,10.5],[-27,-23,-14.5,-13.2],[-27,-23,-35.5,-34.2]];
 return subtractRects([...expanded,promenade,...links],[...roadRects,...campusFootprints,...gardenBeds.map(([x,z,w,d])=>[x-w/2-0.15,x+w/2+0.15,z-d/2-0.15,z+d/2+0.15])]);
}
