import * as THREE from 'three';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const mat = color => new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
const wood = mat('#67444b'), stone = mat('#aaa0ba');
function block(parent, x, y, z, w, h, d, material) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
  mesh.position.set(x,y,z); mesh.castShadow = true; mesh.receiveShadow = true; parent.add(mesh); return mesh;
}
function random(seed) { let n=seed; return () => { n=(Math.imul(n,1664525)+1013904223)>>>0; return n/4294967296; }; }

export function addLandscape(scene, vehicle) {
  const rng=random(42), dummy=new THREE.Object3D(), treeGroups=[];
  const centers=[[-7,16],[7,17],[-7,6],[8,7],[-24,1],[-24,-9],[-10,-13],[24,-12],[23,4],[-25,-20],[8,-37],[-7,-36],[-25,-36],[26,-35],[-26,18],[24,21]];
  const leafColors=['#e6927f','#f5b48c','#ce7189','#c3ba5a'];
  const leafCanvas=document.createElement('canvas');leafCanvas.width=leafCanvas.height=64;
  const leafContext=leafCanvas.getContext('2d');leafContext.fillStyle='#ffffff';leafContext.beginPath();leafContext.ellipse(32,32,28,12,-0.4,0,Math.PI*2);leafContext.fill();
  const leafTexture=new THREE.CanvasTexture(leafCanvas);
  const foliage=leafColors.map(color=>new THREE.InstancedMesh(new THREE.PlaneGeometry(0.4,0.3),new THREE.MeshStandardMaterial({color,emissive:color,emissiveIntensity:0.3,map:leafTexture,alphaTest:0.5,side:THREE.DoubleSide,roughness:1}),centers.length*500));
  const counts=[0,0,0,0];
  const grass=new THREE.InstancedMesh(new THREE.ConeGeometry(0.15,0.95,3),new THREE.MeshStandardMaterial({color:'#bdbe68',emissive:'#555622',emissiveIntensity:0.3,roughness:1}),centers.length*500);
  let grassIndex=0;
  for(let ti=0;ti<centers.length;ti++) {
    const [x,z]=centers[ti], height=3.1+rng()*1.2;
    const trunk=new THREE.Mesh(new THREE.CylinderGeometry(0.16,0.26,height,7),wood);
    trunk.position.set(x,height/2,z);trunk.castShadow=true;scene.add(trunk);
    vehicle.addObstacle(x,z,0.3,0.3);
    for(let branch=0;branch<3;branch++) {
      const limb=new THREE.Mesh(new THREE.CylinderGeometry(0.07,0.13,1.8,5),wood);
      limb.position.set(x+(branch-1)*0.45,height-0.6,z);limb.rotation.z=(branch-1)*0.65;scene.add(limb);
    }
    for(let i=0;i<1100;i++) {
      const a=rng()*Math.PI*2, r=Math.cbrt(rng())*2.25, v=(rng()-0.5)*2;
      const px=x+Math.cos(a)*r*Math.sqrt(1-v*v), py=height+v*1.55, pz=z+Math.sin(a)*r*Math.sqrt(1-v*v);
      const color=ti%4===3?3:Math.floor(rng()*3);
      dummy.position.set(px,py,pz);dummy.rotation.set(rng()*6.28,rng()*6.28,rng()*6.28);dummy.scale.setScalar(0.7+rng()*0.85);dummy.updateMatrix();
      foliage[color].setMatrixAt(counts[color]++,dummy.matrix);
    }
    for(let i=0;i<500;i++) {
      const a=rng()*Math.PI*2,r=0.5+Math.sqrt(rng())*3.1;
      dummy.position.set(x+Math.cos(a)*r,0.37,z+Math.sin(a)*r);
      dummy.rotation.set(0,rng()*6.3,(rng()-0.5)*0.25);dummy.scale.set(0.8,0.5+rng()*0.9,0.8);dummy.updateMatrix();grass.setMatrixAt(grassIndex++,dummy.matrix);
    }
    // Rounded stones break up the edge of the vegetation.
    for(let i=0;i<3;i++) {
      const rock=new THREE.Mesh(new THREE.DodecahedronGeometry(0.25+rng()*0.25,0),stone);
      rock.position.set(x+2+rng(),0.18,z+(rng()-0.5)*4);rock.scale.y=0.65;rock.castShadow=true;scene.add(rock);
    }
  }
  foliage.forEach((mesh,i)=>{
    mesh.count=counts[i];mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;scene.add(mesh);
    const time={value:0};
    mesh.material.onBeforeCompile=shader=>{
      shader.uniforms.uWindTime=time;
      shader.vertexShader='uniform float uWindTime;\n'+shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\n transformed.x += sin(uWindTime*1.3 + instanceMatrix[3].x*0.5 + instanceMatrix[3].z)*0.075;');
    };
    treeGroups.push(time);
  });
  grass.count=grassIndex;grass.receiveShadow=true;scene.add(grass);
  // Low fences and benches make the world feel inhabited.
  for(const [x,z] of [[-7,21],[6,-15],[-24,-18],[22,12],[-8,-39]]) {
    for(let i=-1;i<=1;i++)block(scene,x+i*1.7,0.8,z,0.18,1.6,0.18,wood);
    block(scene,x,0.6,z,3.6,0.15,0.16,wood);block(scene,x,1.2,z,3.6,0.15,0.16,wood);
    vehicle.addObstacle(x,z,1.9,0.18);
  }
  for(const [x,z] of [[4,18],[-21,-11],[21,-18],[-7,-31]]) {
    block(scene,x,0.65,z,2.6,0.2,0.7,wood);block(scene,x,1.1,z-0.3,2.6,0.7,0.13,wood);
    block(scene,x-0.9,0.3,z,0.12,0.6,0.6,wood);block(scene,x+0.9,0.3,z,0.12,0.6,0.6,wood);
    vehicle.addObstacle(x,z,1.3,0.45);
  }
  const lampPositions=[[-4,15],[4,4],[-21,2],[21,2],[-4,-23],[4,-34]];
  const glow=new THREE.MeshStandardMaterial({color:'#ffc97e',emissive:'#ffb44f',emissiveIntensity:4});
  lampPositions.forEach(([x,z],i)=>{
    block(scene,x,1.4,z,0.13,2.8,0.13,wood);block(scene,x,2.9,z,0.55,0.7,0.55,glow);
    block(scene,x,3.3,z,0.75,0.13,0.75,wood);block(scene,x,2.5,z,0.75,0.13,0.75,wood);
    if(i<3){const light=new THREE.PointLight('#ffb45e',8,10,2);light.position.set(x,2.5,z);scene.add(light);}
  });
  const crateColors=['#b66849','#9c6b92','#b78e46'];
  for(let i=0;i<15;i++) {
    const x=i<6?-5+(i%3)*1.05:9+(i%3)*1.05,z=i<6?22:-18-Math.floor(i/3)*1.2;
    const crate=block(scene,x,0.52,z,1,1,1,mat(crateColors[i%3]));
    const band=block(crate,0,0,0,1.02,0.13,1.02,wood); // child coordinates are local
    vehicle.addProp(crate,x,0.52,z,0.5);
  }
  // A decorative stream stays outside the driving routes.
  const river=new THREE.Mesh(new THREE.PlaneGeometry(9,85,6,25),new THREE.MeshStandardMaterial({color:'#5a9a9a',roughness:0.3,metalness:0.18}));
  river.rotation.x=-Math.PI/2;river.position.set(-31,-0.015,-10);scene.add(river);
  const ripple=new THREE.Mesh(new THREE.PlaneGeometry(8.4,85),new THREE.MeshBasicMaterial({color:'#c5edc4',wireframe:true,transparent:true,opacity:0.08}));
  ripple.rotation.x=-Math.PI/2;ripple.position.copy(river.position);ripple.position.y+=0.01;scene.add(ripple);
  return {update(time){treeGroups.forEach(t=>t.value=time);river.material.color.setHSL(0.49,0.26,0.42+Math.sin(time*0.6)*0.015);}};
}

export async function addNameSculpture(scene) {
  const font=await new FontLoader().loadAsync(`${import.meta.env.BASE_URL}fonts/helvetiker-bold.json`);
  const geometry=new TextGeometry('CAGRI CATIK',{font,size:0.95,depth:0.24,curveSegments:3,bevelEnabled:true,bevelThickness:0.035,bevelSize:0.02,bevelSegments:1});
  geometry.center();
  const text=new THREE.Mesh(geometry,[mat('#f4d1bf'),mat('#aa769a')]);
  text.position.set(-2.2,0.58,18.8);text.rotation.y=Math.PI/4;text.castShadow=true;scene.add(text);
}
