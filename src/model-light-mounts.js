import * as THREE from 'three';

// Native body triangle IDs of the shipped, immutable Kenney meshes. These are
// the actual yellow front lenses / red rear lenses, not the collision bounds.
export const modelLightFaces={
  sport:{front:[708,709,710,711],rear:[694,695,696,697]},
  suv:{front:Array.from({length:44},(_,i)=>756+i),rear:[810,811,812,813]},
  race:{front:[270,271,272,273],rearPanel:{x0:-0.24,x1:0.24,y0:0.47,y1:0.52,z:-1.279886245727539}},
};
export function faceVertices(geometry,faces){
  const p=geometry.getAttribute('position'),index=geometry.index,result=[];
  for(const face of faces)for(let corner=0;corner<3;corner++){
    const id=index?index.getX(face*3+corner):face*3+corner;result.push(new THREE.Vector3().fromBufferAttribute(p,id));
  }return result;
}
function clippedBelow(vertices,y){
  const out=[];
  for(let i=0;i<vertices.length;i+=3){
    const input=vertices.slice(i,i+3),poly=[];
    for(let k=0;k<3;k++){
      const a=input[k],b=input[(k+1)%3],inside=a.y<=y,next=b.y<=y;
      if(inside)poly.push(a.clone());
      if(inside!==next)poly.push(a.clone().lerp(b,(y-a.y)/(b.y-a.y)));
    }
    for(let j=1;j<poly.length-1;j++)out.push(poly[0],poly[j],poly[j+1]);
  }return out;
}
function surface(parent,vertices,color,offset=-1){
  const geometry=new THREE.BufferGeometry().setFromPoints(vertices);
  const material=new THREE.MeshBasicMaterial({color,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:offset,polygonOffsetUnits:offset});
  const mesh=new THREE.Mesh(geometry,material);mesh.name='integrated-light-surface';parent.add(mesh);return mesh;
}
function lensCenter(vertices){
  const total=new THREE.Vector3();let weight=0;
  for(let i=0;i<vertices.length;i+=3){
    const [a,b,c]=vertices.slice(i,i+3),area=b.clone().sub(a).cross(c.clone().sub(a)).length()/2;
    total.add(a.clone().add(b).add(c).multiplyScalar(area/3));weight+=area;
  }return total.divideScalar(weight||1);
}
export function createKenneyLightBinding(model,id){
  const config=modelLightFaces[id],body=model.getObjectByName('body');
  if(!config||!body?.isMesh)throw new Error(`Missing native light mount: ${id}`);
  body.geometry=body.geometry.clone();
  const frontVertices=faceVertices(body.geometry,config.front);
  const halves=[-1,1].map(side=>frontVertices.filter((_,i)=>Math.sign(frontVertices[Math.floor(i/3)*3].x)===side));
  const front=halves.map(lensCenter);
  let rearVertices;
  if(config.rearPanel){
    const {x0,x1,y0,y1,z}=config.rearPanel;
    rearVertices=[[x0,y0,z],[x1,y0,z],[x0,y1,z],[x1,y0,z],[x1,y1,z],[x0,y1,z]].map(p=>new THREE.Vector3(...p));
  }else rearVertices=faceVertices(body.geometry,config.rear);
  const yMin=Math.min(...rearVertices.map(v=>v.y)),yMax=Math.max(...rearVertices.map(v=>v.y));
  const frontLens=surface(body,frontVertices,'#f1f6e1'),rearLens=surface(body,rearVertices,'#bd343e'),reverseLens=surface(body,clippedBelow(rearVertices,(yMin+yMax)/2),'#f4ffff',-2);
  // Preserve the original lens colors when the body is repainted.
  const eligibility=new Float32Array(body.geometry.getAttribute('position').count).fill(1);
  for(const face of [...config.front,...(config.rear??[])])for(let k=0;k<3;k++){const n=body.geometry.index?body.geometry.index.getX(face*3+k):face*3+k;eligibility[n]=0;}
  body.geometry.setAttribute('aPaintEligible',new THREE.BufferAttribute(eligibility,1));
  return {parent:body,front,direction:new THREE.Vector3(0,0,1),groundY:-body.position.y,frontLens,rearLens,reverseLens,
    dispose(){for(const mesh of [frontLens,rearLens,reverseLens]){mesh.removeFromParent();mesh.geometry.dispose();mesh.material.dispose();}body.geometry.dispose();}};
}
export function createBrunoLightBinding(chassis){
  chassis.updateWorldMatrix(true,true);const inverse=chassis.matrixWorld.clone().invert(),vertices=[];
  chassis.traverse(mesh=>{if(!mesh.isMesh||!/^headlights/i.test(mesh.name))return;const p=mesh.geometry.getAttribute('position');for(let i=0;i<p.count;i++)vertices.push(new THREE.Vector3().fromBufferAttribute(p,i).applyMatrix4(mesh.matrixWorld).applyMatrix4(inverse));});
  const front=[-1,1].map(side=>{
    const half=vertices.filter(v=>Math.sign(v.z)===side),max=Math.max(...half.map(v=>v.x)),face=half.filter(v=>v.x>max-0.015);
    return face.length?face.reduce((a,b)=>a.add(b),new THREE.Vector3()).divideScalar(face.length):new THREE.Vector3(1.35,-0.15,side*0.55);
  });
  return {parent:chassis,front,direction:new THREE.Vector3(1,0,0),groundY:-chassis.position.y};
}
