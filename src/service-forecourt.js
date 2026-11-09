import * as THREE from 'three';
import {serviceApronRects,garageSite} from './service-layout.js';
import {subtractRects} from './campus-plan.js';
import {asphaltMaterial,worldUV} from './surface-materials.js';
import {block,label} from './scene-primitives.js';
export function createServiceForecourt(scene){
 const vertices=[],indices=[];
 for(const [l,r,t,b] of subtractRects(serviceApronRects,[])){const n=vertices.length/3;vertices.push(l,0.08,t,r,0.08,t,l,0.08,b,r,0.08,b);indices.push(n,n+2,n+1,n+1,n+2,n+3);}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setIndex(indices);geometry.computeVertexNormals();worldUV(geometry);
 const floor=new THREE.Mesh(geometry,asphaltMaterial());floor.receiveShadow=true;scene.add(floor);
 const paint=new THREE.MeshBasicMaterial({color:'#c7dfd5',polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4});
 for(const x of [21.15,24.32])block(scene,0.07,0.008,12.1,x,0.095,17.9,paint);
 label(scene,'FUEL / GARAGE →',22.65,0.11,10.15,4.6,'#d6e8de').rotation.x=-Math.PI/2;
 label(scene,'GARAGE',garageSite.x,0.11,23.1,4.2,'#d6e8de').rotation.x=-Math.PI/2;
}
