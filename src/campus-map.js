export function mapPosition(x,z){return {x:Math.max(0,Math.min(100,(x+55)/110*100)),y:Math.max(0,Math.min(100,(z+76)/119*100))};}
export function createCampusMap(projects,openProject){
  const panel=document.getElementById('campus-map'),canvas=document.getElementById('campus-map-canvas'),toggle=document.getElementById('map-button'),marker=document.getElementById('map-car');
  toggle.addEventListener('click',()=>{panel.hidden=!panel.hidden;toggle.setAttribute('aria-expanded',String(!panel.hidden));});
  for(const project of projects){
    const button=document.createElement('button'),p=mapPosition(project.position.x,project.position.z);button.className='map-project';button.style.left=p.x+'%';button.style.top=p.y+'%';button.textContent=project.number;button.title=project.title;button.setAttribute('aria-label',project.title+' öffnen');button.addEventListener('click',()=>openProject(project));canvas.append(button);
  }
  return {update(position,heading){if(panel.hidden)return;const p=mapPosition(position.x,position.z);marker.style.left=p.x+'%';marker.style.top=p.y+'%';marker.style.transform=`translate(-50%,-50%) rotate(${-heading*180/Math.PI+180}deg)`;}};
}
