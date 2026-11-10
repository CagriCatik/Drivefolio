import * as THREE from 'three';
export const neonBoardTheme={background:'#142f35',title:'#e0f7ed',text:'#acd4c8',edge:'#89ddc5',hover:'#beffec',radius:0.12};
function outline(w,h,r){const shape=new THREE.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);return shape;}
export function fitBoardFont(ctx,text,size,maxWidth){let font=size;ctx.font=`600 ${font}px Arial`;while(ctx.measureText(text).width>maxWidth&&font>10){font--;ctx.font=`600 ${font}px Arial`;}return font;}
export function createNeonBoard(parent,{title='',subtitle='',rows=[],texture=null,x=0,y=0,z=0,width=11.4,height=1.9,rotation=0}){
 const g=new THREE.Group();g.name='Neon board / '+(title||'Campus map');g.position.set(x,y,z);g.rotation.y=rotation;parent.add(g);
 const radius=Math.min(neonBoardTheme.radius,height*0.18),shape=outline(width,height,radius),geometry=new THREE.ExtrudeGeometry(shape,{depth:0.06,bevelEnabled:true,bevelSize:0.025,bevelThickness:0.015,bevelSegments:1,steps:1,curveSegments:5});geometry.translate(0,0,-0.07);
 const backing=new THREE.Mesh(geometry,new THREE.MeshStandardMaterial({color:neonBoardTheme.background,roughness:0.5,metalness:0.18}));backing.castShadow=false;g.add(backing);
 if(!texture){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=256;const ctx=canvas.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';const lines=rows.length?rows:subtitle?[subtitle]:[];ctx.fillStyle=neonBoardTheme.title;fitBoardFont(ctx,title,lines.length?66:136,940);ctx.fillText(title,512,lines.length?65:128);if(lines.length){ctx.strokeStyle='#3f6964';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(50,113);ctx.lineTo(974,113);ctx.stroke();ctx.fillStyle=neonBoardTheme.text;const step=114/lines.length;lines.forEach((text,i)=>{fitBoardFont(ctx,text,lines.length>1?30:38,930);ctx.fillText(text,512,133+step*(i+0.5));});}texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;}
 const faceMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false});const face=new THREE.Mesh(new THREE.PlaneGeometry(width-0.16,height-0.12),faceMaterial);face.position.z=0.018;g.add(face);
 const curve=new THREE.CatmullRomCurve3(outline(width-0.1,height-0.1,radius).getPoints(6).slice(0,-1).map(p=>new THREE.Vector3(p.x,p.y,0.035)),true,'centripetal'),edgeMaterial=new THREE.MeshBasicMaterial({color:neonBoardTheme.edge});g.add(new THREE.Mesh(new THREE.TubeGeometry(curve,96,Math.min(0.018,height*0.025),5,true),edgeMaterial));
 g.userData.neonBoard={backing,faceMaterial,edgeMaterial,hover:0};return g;
}
export function isNeonBoardVisible(node){for(let n=node;n;n=n.parent)if(!n.visible)return false;return true;}
export function createNeonBoardsController(scene){
 const boards=[];scene.traverse(n=>{if(n.userData.neonBoard)boards.push(n);});
 const ray=new THREE.Raycaster(),pointer=new THREE.Vector2(),canvas=document.getElementById('world'),hoverColor=new THREE.Color(neonBoardTheme.hover);let pointing=false,night=false;
 canvas.addEventListener('pointermove',e=>{if(e.pointerType==='touch')return;pointing=true;pointer.set(e.clientX/window.innerWidth*2-1,1-e.clientY/window.innerHeight*2);},{passive:true});canvas.addEventListener('pointerleave',()=>pointing=false);
 function paint(board){const b=board.userData.neonBoard;b.edgeMaterial.color.set(neonBoardTheme.edge).lerp(hoverColor,b.hover).multiplyScalar((night?1.5:0.65)+b.hover*0.55);b.faceMaterial.color.setScalar((night?1.12:1)+b.hover*0.12);}
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 return {setNight(value){night=!!value;boards.forEach(paint);},update(camera,blocked,dt){let target=null;if(pointing&&!blocked){camera.updateMatrixWorld();ray.setFromCamera(pointer,camera);const hits=ray.intersectObjects(boards.filter(isNeonBoardVisible).map(b=>b.userData.neonBoard.backing),false);if(hits.length)target=hits[0].object.parent;}
 boards.forEach(board=>{const b=board.userData.neonBoard;b.hover=reduced.matches?Number(board===target):THREE.MathUtils.lerp(b.hover,Number(board===target),1-Math.exp(-8*dt));paint(board);});}};
}
