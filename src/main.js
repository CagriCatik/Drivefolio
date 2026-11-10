import {setupNeonUI} from './neon-ui.js';
import './style.css';
import {garageSite} from './service-layout.js';
import {createWorldExperiments} from './world-experiments.js';
import {projectEvidence} from './project-evidence.js';
import {createDiscovery,experimentIds} from './discovery.js';
import {stories} from './project-stories.js';
import {createProjectExperiments} from './project-experiments.js';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createDisplayModes} from './display-modes.js';
import {createCampusMap} from './campus-map.js';
import { projects } from './projects.js';
import { createInput } from './input.js';
import { createPortfolioCamera } from './camera.js';
import { createVehicle } from './vehicle.js';
import { createWorld } from './world.js';
import { createDrivingEffects } from './effects.js';
import { createAudio } from './audio.js';
import {createEnvironmentRendering} from './environment-rendering.js';
import { createInteractions } from './interactions.js';
import { createDemoSequence } from './demo-sequence.js';
import { vehicles,paints,getVehicle } from './vehicle-catalog.js';

const $ = id => document.getElementById(id);
const input = createInput();
setupNeonUI();
const sequence=createDemoSequence();
let selectedProject=null;
const interactions=createInteractions();
const sound=createAudio();
let discoveryStorage;try{discoveryStorage=window.localStorage;}catch{}
const discovery=createDiscovery(projects.map(p=>p.id),discoveryStorage);
let destination=null;
const experiments=createProjectExperiments(id=>{discovery.mark(id,'tried');syncDiscovery();},id=>{discovery.mark(id,'completed');$('experiment-achievement').hidden=false;syncDiscovery();});
const campusMap=createCampusMap(projects,openProject);
let vehicle, view, drivingEffects, worldController, activeDialog = null, previousFocus = null;
let started = false, ready = false, resetClock = false, overview=false,showroomMode=false,worldLab=null;
const dialogs = [...document.querySelectorAll('dialog')];

function dismissWelcome() {
  if (started) return;
  started = true;
  sound.start();
  $('discovery-card').hidden=false;syncDiscovery();
  $('welcome').classList.add('dismissed');
  $('welcome').inert = true;
}

function showDialog(dialog) {
  if(showroomMode)closeShowroom();if(worldLab?.active)closeWorldLab();
  if(activeDialog===dialog&&dialog.open)return;
  if(sequence.running)cancelSequence();
  if (activeDialog) activeDialog.close();
  previousFocus = document.activeElement;
  activeDialog = dialog;
  input.setEnabled(false); vehicle?.stop();
  $('interaction-hint').hidden=true;
  dialog.showModal();
}

for (const dialog of dialogs) {
  dialog.querySelectorAll('[data-close]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', e => {
    if (e.target !== dialog) return;
    const box = dialog.getBoundingClientRect();
    if (e.clientX < box.left || e.clientX > box.right || e.clientY < box.top || e.clientY > box.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => {
    if (activeDialog !== dialog) return;
    activeDialog = null;
    experiments.close();
    input.setEnabled(!overview); resetClock = true;
    if (previousFocus instanceof HTMLElement && !previousFocus.closest('[inert]')) previousFocus.focus();
  });
}


function selectShowroomVehicle(id){worldController.vehicles.select(id);drivingEffects?.reset();syncGarage();sound.chime();$('showroom-selection').textContent=`${getVehicle(id).name} ausgewählt`;document.querySelectorAll('[data-showroom-id]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.showroomId===id)));}
function closeShowroom(){showroomMode=false;worldController?.facilities.garage.setShowroom(false);$('showroom-card').hidden=true;view?.setCloseView(false);input.setEnabled(!overview);resetClock=true;}
function openShowroom(){
 if(!ready)return;if(sequence.running)cancelSequence();if(worldLab?.active)closeWorldLab();
 activeDialog?.close();activeDialog=null;experiments.close();dismissWelcome();overview=false;view.setOverview(false);worldController.setOverview(false);$('track-overview').setAttribute('aria-pressed','false');
 showroomMode=true;worldController.facilities.garage.setShowroom(true);input.setEnabled(false);vehicle.stop();view.setCloseView(true);$('showroom-card').hidden=false;selectShowroomVehicle(worldController.vehicles.selected);
 $('showroom-close').focus();
}
$('showroom-open').addEventListener('click',openShowroom);$('showroom-close').addEventListener('click',closeShowroom);
for(const p of vehicles){const b=document.createElement('button');b.textContent=p.name;b.dataset.showroomId=p.id;b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>selectShowroomVehicle(p.id));$('showroom-choices').append(b);}
$('world').addEventListener('pointerdown',e=>{if(!showroomMode)return;const id=worldController.showroom.pick(e,view.camera);if(id)selectShowroomVehicle(id);});
window.addEventListener('keydown',e=>{if(showroomMode){if(e.code==='Escape')closeShowroom();const i=Number(e.key)-1;if(i>=0&&i<vehicles.length&&!e.repeat)selectShowroomVehicle(vehicles[i].id);}else if(worldLab?.active&&e.code==='Escape')closeWorldLab();});
function closeWorldLab(){worldLab?.close();view?.setCloseView(false);input.setEnabled(!overview);resetClock=true;}
function openWorldLab(project){
 if(!ready||!experimentIds.includes(project.id))return;selectedProject=project;discovery.mark(project.id);syncDiscovery();if(showroomMode)closeShowroom();if(sequence.running)cancelSequence();activeDialog?.close();activeDialog=null;experiments.close();dismissWelcome();
 overview=false;view.setOverview(false);worldController.setOverview(false);$('track-overview').setAttribute('aria-pressed','false');vehicle.stop();input.setEnabled(false);view.setCloseView(true);worldLab.open(project);
}
$('world-lab-project').addEventListener('click',()=>{const p=worldLab?.project;if(p){closeWorldLab();openProject(p);}});
$('project-world-lab').addEventListener('click',()=>openWorldLab(selectedProject));$('world-lab-close').addEventListener('click',closeWorldLab);

function openProject(project) {
  dismissWelcome();
  selectedProject=project;
  $('project-world-lab').hidden=!experimentIds.includes(project.id);$('project-world-lab').disabled=!ready;
  const evidence=projectEvidence[project.id];$('project-evidence').hidden=!evidence;
  if(evidence){$('project-evidence-text').textContent=evidence.text;$('project-evidence-link').href=evidence.url;$('project-evidence-link').textContent=evidence.label;$('project-evidence-image').hidden=!evidence.image;if(evidence.image){$('project-evidence-image').src=import.meta.env.BASE_URL+evidence.image;$('project-evidence-image').alt=evidence.alt;}}

  $('project-demo').disabled=!ready;
  $('project-title').textContent = project.title;
  $('project-category').textContent = `${project.number} / ${project.category}`;
  $('project-category-art').textContent = project.category;
  $('project-number').textContent = project.number;
  $('project-short').textContent = project.short;
  $('project-description').textContent = project.description;
  $('project-link').href = project.url;
  $('project-art').style.setProperty('--project-color', project.color);
  $('project-tags').replaceChildren(...project.tags.map(tag => {
    const span = document.createElement('span'); span.textContent = tag; return span;
  }));
  const story=stories[project.id];
  $('project-problem').textContent=story.problem;$('project-use').textContent=story.use;$('project-focus').textContent=story.focus;
  $('project-dialog').classList.toggle('has-experiment',experimentIds.includes(project.id));
  $('project-dialog').querySelector('.project-details').open=false;
  $('experiment-achievement').hidden=!discovery.completed.has(project.id);
  $('project-connection').textContent=story.next;
  const next=projects.find(p=>p.id===discovery.next(project.id));
  $('project-next').textContent=`${next.title} entdecken →`;$('project-next').onclick=()=>openProject(next);
  discovery.mark(project.id);syncDiscovery();
  experiments.open(project.id);
  sound.chime();
  showDialog($('project-dialog'));
  $('project-dialog').scrollTop=0;
  $('project-title').tabIndex=-1;$('project-title').focus({preventScroll:true});
}


function syncDiscovery(){
 $('discovery-count').textContent=`${discovery.viewed.size} / ${projects.length} Projekte entdeckt`;
 $('discovery-experiments').textContent=`${experimentIds.filter(id=>discovery.tried.has(id)).length} / 3 Experimente ausprobiert`;
 document.querySelectorAll('[data-project-id]').forEach(el=>{const seen=discovery.viewed.has(el.dataset.projectId);el.classList.toggle('is-discovered',seen);el.title=el.dataset.projectTitle+(seen?' · bereits entdeckt':'');});
 const next=projects.find(p=>p.id===discovery.next(selectedProject?.id));
 $('discovery-next').textContent=discovery.viewed.size===projects.length?'Weiter experimentieren →':`${next.title} entdecken →`;
 $('discovery-next').onclick=()=>openProject(next);
}
$('project-find').addEventListener('click',()=>{
 destination=selectedProject;activeDialog?.close();experiments.close();
 $('campus-map').hidden=false;$('map-button').setAttribute('aria-expanded','true');
 document.querySelectorAll('.map-project').forEach(el=>el.classList.toggle('is-destination',el.dataset.projectId===destination.id));
 worldController?.setDestination(destination);$('destination-distance').hidden=false;
});

const projectTable=document.createElement('table');projectTable.className='neon-data-table';projectTable.setAttribute('aria-label','Projektübersicht');
const tableHead=document.createElement('thead'),headRow=document.createElement('tr');for(const title of ['Nr.','Projekt / Schwerpunkt','Öffnen']){const th=document.createElement('th');th.scope='col';th.textContent=title;headRow.append(th);}tableHead.append(headRow);const tableBody=document.createElement('tbody');projectTable.append(tableHead,tableBody);$('project-list').append(projectTable);
for(const project of projects){
 const row=document.createElement('tr');row.className='project-row';row.dataset.projectId=project.id;row.dataset.projectTitle=project.title;row.style.setProperty('--project-color',project.color);
 const numberCell=document.createElement('td'),number=document.createElement('span');number.className='row-number';number.textContent=project.number;numberCell.append(number);
 const mainCell=document.createElement('td'),button=document.createElement('button');button.className='project-table-link';button.setAttribute('aria-label',project.title+' öffnen');
 const main=document.createElement('span');main.className='row-main';const category=document.createElement('small');category.textContent=project.category;const name=document.createElement('strong');name.textContent=project.title;main.append(category,name);button.append(main);mainCell.append(button);
 const actionCell=document.createElement('td'),arrow=document.createElement('span');arrow.className='row-arrow';arrow.textContent='↗';arrow.setAttribute('aria-hidden','true');actionCell.append(arrow);row.append(numberCell,mainCell,actionCell);
 row.addEventListener('click',()=>openProject(project));tableBody.append(row);
}

function cancelSequence(){
  sequence.cancel();$('sequence-card').hidden=true;
  worldController?.facilities.setDemo(null,-1,0);input.setEnabled(!overview);resetClock=true;
}
function startDemo(project){
  if(showroomMode)closeShowroom();if(worldLab?.active)closeWorldLab();
  overview=false;view?.setOverview(false);worldController?.setOverview(false);$('track-overview').setAttribute('aria-pressed','false');
  if(!ready||!project)return;
  if(activeDialog){activeDialog.close();activeDialog=null;}
  experiments.close();dismissWelcome();vehicle.stop();input.setEnabled(false);sequence.start(project);sound.chime();
  $('sequence-title').textContent=project.title+' / WELT-DEMO';
  $('sequence-stage').textContent=project.stages[0];
  $('sequence-progress').style.width='0%';
  worldController.facilities.setDemo(project.id,0,0);
  $('interaction-hint').hidden=true;$('sequence-card').hidden=false;
}
$('sequence-cancel').addEventListener('click',cancelSequence);
syncDiscovery();
$('project-demo').addEventListener('click',()=>startDemo(selectedProject));
window.addEventListener('keydown',e=>{if(e.code==='Escape'&&sequence.running)cancelSequence();});

$('track-overview').addEventListener('click',()=>{if(!ready)return;if(showroomMode)closeShowroom();if(worldLab?.active)closeWorldLab();dismissWelcome();overview=!overview;$('interaction-hint').hidden=true;view.setOverview(overview);worldController.setOverview(overview);input.setEnabled(!overview);vehicle.stop();$('track-overview').setAttribute('aria-pressed',String(overview));$('track-overview').textContent=overview?'Zurück ans Steuer':'Streckenübersicht';});
$('projects-button').addEventListener('click', () => showDialog($('list-dialog')));
$('direct-button').addEventListener('click', () => showDialog($('list-dialog')));
$('about-button').addEventListener('click', () => showDialog($('about-dialog')));
$('credits-button').addEventListener('click', () => showDialog($('credits-dialog')));
function syncGarage(){
  if(!worldController)return;
  document.querySelectorAll('input[name="vehicle"]').forEach(r=>r.checked=r.value===worldController.vehicles.selected);
  document.querySelectorAll('input[name="paint"]').forEach(r=>r.checked=r.value===worldController.vehicles.selectedPaint);
  $('vehicle-name').textContent=getVehicle(worldController.vehicles.selected).name.toUpperCase();
}
function openGarage(){if(!ready)return;dismissWelcome();syncGarage();showDialog($('garage-dialog'));}
$('garage-button').disabled=true;
$('garage-button').addEventListener('click',openGarage);
for(const item of vehicles){
  const label=document.createElement('label');label.className='vehicle-choice';
  const radio=document.createElement('input');radio.type='radio';radio.name='vehicle';radio.value=item.id;
  const title=document.createElement('strong');title.textContent=item.name;
  const description=document.createElement('small');description.textContent=item.description;
  const speed=document.createElement('span');speed.textContent=`${Math.round(item.maxSpeed*3.6)} km/h · Boost ${Math.round(item.boostSpeed*3.6)} km/h`;
  radio.addEventListener('change',()=>{if(!worldController)return;worldController.vehicles.select(item.id);drivingEffects.reset();syncGarage();sound.chime();$('garage-status').textContent=`${item.name} ist bereit. Deine Lackierung bleibt erhalten.`;});
  label.append(radio,title,description,speed);$('vehicle-choices').append(label);
}
for(const paint of paints){
  const label=document.createElement('label');label.className='paint-choice';label.style.setProperty('--paint',paint.color);
  const radio=document.createElement('input');radio.type='radio';radio.name='paint';radio.value=paint.id;
  const swatch=document.createElement('span');swatch.className='paint-swatch';
  const text=document.createElement('span');text.textContent=paint.name;
  radio.addEventListener('change',()=>{worldController?.vehicles.paint(paint.id);$('garage-status').textContent=`Lackierung: ${paint.name}`;});
  label.append(radio,swatch,text);$('paint-choices').append(label);
}
function toggleLights(){if(!worldController)return;const enabled=worldController.vehicles.toggleLights();$('lights-button').textContent=enabled?'Scheinwerfer an · L':'Scheinwerfer aus · L';$('lights-button').setAttribute('aria-pressed',String(enabled));}
$('lights-button').addEventListener('click',toggleLights);
window.addEventListener('keydown',e=>{if(e.code==='KeyL'&&!e.repeat&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))toggleLights();});
$('sound-button').addEventListener('click', () => {
  const enabled=sound.toggle();$('sound-button').textContent=enabled?'Sound an':'Sound aus';$('sound-button').setAttribute('aria-pressed',String(enabled));
});
$('explore-button').disabled = true;
$('explore-button').addEventListener('click', dismissWelcome);
$('zoom-in').addEventListener('click', () => view?.zoom(-0.12));
$('zoom-out').addEventListener('click', () => view?.zoom(0.12));
$('reset-button').addEventListener('click', () => {
  if (!ready) return;
  closeShowroom();closeWorldLab();cancelSequence();
  worldController.race.reset();
  input.clear(); vehicle.reset(); view.reset(vehicle.group.position); resetClock = true;
  interactions.reset();
  drivingEffects?.reset();
  if(sequence.running)cancelSequence();
  $('toast').textContent = 'Wieder am Start. Gute Fahrt!'; $('toast').hidden = false;
  setTimeout(() => { $('toast').hidden = true; }, 2200);
});
window.addEventListener('keydown', e => { if (e.code === 'Escape' && !activeDialog) input.clear(); });

async function main() {
  const renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#d4e5eb');
  scene.fog = new THREE.Fog('#d4e5eb', 85, 155);
  const reflectionRoom=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer);
  scene.environment=pmrem.fromScene(reflectionRoom,0.04).texture;scene.environmentIntensity=0.3;reflectionRoom.dispose();pmrem.dispose();
  const sky=new THREE.HemisphereLight('#e6f4ff', '#81998b', 1.9);scene.add(sky);
  const sun = new THREE.DirectionalLight('#fff8ed', 2.5); sun.position.set(-18, 32, 20);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -65, right: 65, top: 65, bottom: -65, near: 1, far: 160 });
  sun.shadow.radius=2.5; sun.shadow.normalBias = 0.035; sun.shadow.bias = -0.00015; scene.add(sun);
  view = createPortfolioCamera(window.innerWidth / window.innerHeight);
  vehicle = await createVehicle(scene);
  const world = await createWorld(scene, vehicle);
  worldController=world;worldLab=createWorldExperiments(scene,id=>{discovery.mark(id,'tried');syncDiscovery();},id=>{discovery.mark(id,'completed');syncDiscovery();});const displayModes=createDisplayModes(renderer,scene,sun,sky,world);syncGarage();$('garage-button').disabled=false;
  drivingEffects=createDrivingEffects(scene,vehicle);
  const composer=createEnvironmentRendering(renderer,scene,view.camera);
  ready = true;
  $('loading').hidden = true; $('explore-button').disabled = false;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth,window.innerHeight);
    view.resize(window.innerWidth / window.innerHeight);
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { resetClock = true; input.clear(); vehicle.stop(); sound.setHidden(document.hidden); });

  let last = 0, accumulator = 0, time = 0;
  let interactionState={location:null,activated:null};
  const fixed = 1 / 60;
  renderer.setAnimationLoop(now => {
    if (document.hidden) { last = now; accumulator = 0; return; }
    const dt = resetClock || !last ? 0 : Math.min((now - last) / 1000, 0.08);
    if (resetClock) accumulator = 0;
    last = now; resetClock = false; time += dt;
    if (!activeDialog && !sequence.running&&!overview&&!showroomMode&&!worldLab?.active) {
      accumulator += dt;
      let steps = 0;
      while (accumulator >= fixed && steps < 5) {
        const controls = input.read();
        if (controls.throttle || controls.steering) dismissWelcome();
        vehicle.update(fixed, controls);
        accumulator -= fixed; steps++;
        interactionState=interactions.update(vehicle.group.position,vehicle.motion.grounded?vehicle.speed:Infinity,controls.interact);
        if(interactionState.activated){
          if(interactionState.activated.action==='fuel')world.facilities.station.interact();
          else if(interactionState.activated.id==='garage')openGarage();
          else {const project=projects.find(p=>p.id===interactionState.activated.id);if(experimentIds.includes(project.id))openWorldLab(project);else startDemo(project);}
          accumulator=0;break;
        }
      }
      if (!activeDialog && !sequence.running&&!overview&&!showroomMode&&!worldLab?.active) {
        $('interaction-hint').hidden=!interactionState.location||interactionState.location.action==='fuel';
        if(interactionState.location)$('interaction-message').textContent=`${interactionState.location.label} · ${Math.abs(vehicle.speed)<(interactionState.location.action==='fuel'?0.5:1.5)?'E drücken':'anhalten'}`;

      }
    } else accumulator = 0;
    view.setIntro(!started&&!overview&&!showroomMode&&!worldLab?.active);
    view.update(dt,showroomMode?garageSite:worldLab?.active?worldLab.project.position:sequence.running?sequence.project.position:vehicle.group.position,vehicle.heading,!sequence.running&&!showroomMode&&!worldLab?.active&&vehicle.speed>0.5);
    if(sequence.running){
      const state=sequence.update(dt);world.facilities.setDemo(sequence.project.id,state.stage,state.progress);
      $('sequence-stage').textContent=state.label;
      $('sequence-progress').style.width=`${state.progress*100}%`;
      if(state.completed){const project=sequence.project;cancelSequence();openProject(project);}
    }
    worldLab?.update(dt);
    world.update(time,dt,!!activeDialog||sequence.running||overview||showroomMode||!!worldLab?.active);
    const fuel=vehicle.fuel;
    $('fuel-level').textContent=`${Math.round(fuel.fraction*100)} %`;
    $('fuel-meter').value=fuel.fraction;
    $('fuel-indicator').classList.toggle('fuel-low',fuel.fraction<0.15);
    $('fuel-indicator').title=fuel.fraction<=0?'Tank leer · Notlauf zur Tankstelle':`${fuel.liters.toFixed(1)} von 50 Litern`;
    $('fuel-status').textContent=fuel.refueling?'TANKT …':fuel.fraction<=0?'NOTLAUF':fuel.fraction<0.15?'RESERVE':'TANK';
    drivingEffects.update(dt,time,!!activeDialog||sequence.running||showroomMode||!!worldLab?.active);
    sound.update(vehicle.motion,!!activeDialog||sequence.running||showroomMode||!!worldLab?.active,{position:vehicle.group.position,heading:view.camera.rotation.y,traffic:world.race.trafficPose,fuel:vehicle.fuel,night:displayModes.night,time});
    $('speed-value').textContent=String(Math.round(vehicle.speed*3.6)).padStart(2,'0');
    $('boost-label').classList.toggle('boosting',!!vehicle.motion.input.boost&&vehicle.speed>2);
    campusMap.update(vehicle.group.position,vehicle.heading,world.race.trafficPose);
    if(destination){const distance=Math.hypot(vehicle.group.position.x-destination.entrance.x,vehicle.group.position.z-destination.entrance.z);$('destination-distance').textContent=distance<3.5?`${destination.title} · anhalten und E drücken`:`Ziel: ${destination.title} · ${Math.round(distance)} m Luftlinie`;}

    world.updateHover(view.camera,!!activeDialog||showroomMode||!!worldLab?.active,dt);
    composer.render({night:displayModes.night,showroom:showroomMode,overview,dt});
  });
}

main().catch(error => {
  console.error('Portfolio konnte nicht gestartet werden:', error);
  $('loading-text').textContent = 'Die 3D-Welt konnte nicht geladen werden. Die Projekte kannst du direkt öffnen.';
  $('loading').querySelector('.spinner')?.remove();
  $('explore-button').textContent = 'Projekte ansehen ↗';
  $('explore-button').disabled = false;
  $('explore-button').addEventListener('click', () => showDialog($('list-dialog')));
});
