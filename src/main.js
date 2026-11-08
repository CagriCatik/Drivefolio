import './style.css';
import * as THREE from 'three';
import { projects } from './projects.js';
import { createParkingController } from './parking.js';
import { createInput } from './input.js';
import { createPortfolioCamera } from './camera.js';
import { createVehicle } from './vehicle.js';
import { createWorld } from './world.js';
import { createDrivingEffects } from './effects.js';
import { createAudio } from './audio.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const $ = id => document.getElementById(id);
const input = createInput();
const parking = createParkingController(projects);
const sound=createAudio();
const visited = new Set();
let vehicle, view, drivingEffects, activeDialog = null, previousFocus = null;
let started = false, ready = false, resetClock = false;
const dialogs = [...document.querySelectorAll('dialog')];

function dismissWelcome() {
  if (started) return;
  started = true;
  sound.start();
  $('welcome').classList.add('dismissed');
  $('welcome').inert = true;
}

function showDialog(dialog) {
  if (activeDialog) activeDialog.close();
  previousFocus = document.activeElement;
  activeDialog = dialog;
  input.setEnabled(false); vehicle?.stop();
  $('parking-hint').hidden = true;
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
    input.setEnabled(true); resetClock = true;
    if (previousFocus instanceof HTMLElement && !previousFocus.closest('[inert]')) previousFocus.focus();
  });
}

function openProject(project) {
  dismissWelcome();
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
  visited.add(project.id);
  sound.chime();
  showDialog($('project-dialog'));
}

for (const project of projects) {
  const button = document.createElement('button'); button.className = 'project-row';
  button.style.setProperty('--project-color', project.color);
  const number = document.createElement('span'); number.className = 'row-number'; number.textContent = project.number;
  const main = document.createElement('span'); main.className = 'row-main';
  const category = document.createElement('small'); category.textContent = project.category;
  const name = document.createElement('strong'); name.textContent = project.title;
  const arrow = document.createElement('span'); arrow.className = 'row-arrow'; arrow.textContent = '↗';
  main.append(category, name); button.append(number, main, arrow);
  button.addEventListener('click', () => openProject(project)); $('project-list').append(button);
}

$('projects-button').addEventListener('click', () => showDialog($('list-dialog')));
$('direct-button').addEventListener('click', () => showDialog($('list-dialog')));
$('about-button').addEventListener('click', () => showDialog($('about-dialog')));
$('credits-button').addEventListener('click', () => showDialog($('credits-dialog')));
$('sound-button').addEventListener('click', () => {
  const enabled=sound.toggle();$('sound-button').textContent=enabled?'Sound an':'Sound aus';$('sound-button').setAttribute('aria-pressed',String(enabled));
});
$('explore-button').disabled = true;
$('explore-button').addEventListener('click', dismissWelcome);
$('zoom-in').addEventListener('click', () => view?.zoom(-0.12));
$('zoom-out').addEventListener('click', () => view?.zoom(0.12));
$('reset-button').addEventListener('click', () => {
  if (!ready) return;
  input.clear(); vehicle.reset(); parking.reset(); view.reset(vehicle.group.position); resetClock = true;
  drivingEffects?.reset();
  $('parking-hint').hidden = true;
  $('toast').textContent = 'Wieder am Start. Gute Fahrt!'; $('toast').hidden = false;
  setTimeout(() => { $('toast').hidden = true; }, 2200);
});
window.addEventListener('keydown', e => { if (e.code === 'Escape' && !activeDialog) input.clear(); });

async function main() {
  const renderer = new THREE.WebGLRenderer({ canvas: $('world'), antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  const scene = new THREE.Scene(); scene.background = new THREE.Color('#cda285');
  scene.fog = new THREE.Fog('#cda285', 57, 115);
  scene.add(new THREE.HemisphereLight('#d1b4fc', '#80506a', 1.45));
  const sun = new THREE.DirectionalLight('#ffd09a', 3.2); sun.position.set(-18, 32, 20);
  sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -65, right: 65, top: 65, bottom: -65, near: 1, far: 160 });
  sun.shadow.normalBias = 0.025; sun.shadow.bias = -0.00015; scene.add(sun);
  view = createPortfolioCamera(window.innerWidth / window.innerHeight);
  vehicle = await createVehicle(scene);
  const world = await createWorld(scene, vehicle);
  drivingEffects=createDrivingEffects(scene,vehicle);
  const composer=new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene,view.camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth,window.innerHeight),0.42,0.35,1.5));
  composer.addPass(new OutputPass());
  ready = true;
  $('loading').hidden = true; $('explore-button').disabled = false;

  function resize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth,window.innerHeight);
    view.resize(window.innerWidth / window.innerHeight);
  }
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => { resetClock = true; input.clear(); vehicle.stop(); });

  let last = 0, accumulator = 0, time = 0;
  let status = { bay: null, progress: 0 };
  const fixed = 1 / 60;
  renderer.setAnimationLoop(now => {
    if (document.hidden) { last = now; accumulator = 0; return; }
    const dt = resetClock || !last ? 0 : Math.min((now - last) / 1000, 0.08);
    if (resetClock) accumulator = 0;
    last = now; resetClock = false; time += dt;
    if (!activeDialog) {
      accumulator += dt;
      let steps = 0;
      while (accumulator >= fixed && steps < 5) {
        const controls = input.read();
        if (controls.throttle || controls.steering) dismissWelcome();
        vehicle.update(fixed, controls);
        status = parking.update(vehicle.group.position, vehicle.speed, fixed);
        accumulator -= fixed; steps++;
        if (status.opened) { openProject(status.opened); accumulator = 0; break; }
      }
      if (!activeDialog) {
        $('parking-hint').hidden = !status.bay;
        if (status.bay) {
          $('parking-message').textContent = status.progress > 0
            ? `${status.bay.title} — einen Moment stehen bleiben …`
            : `${status.bay.title} — hier anhalten · Leertaste zum Bremsen`;
          $('parking-progress').style.width = `${status.progress * 100}%`;
        }
      }
    } else accumulator = 0;
    view.update(dt, vehicle.group.position, vehicle.heading, vehicle.speed > 0.5);
    world.update(time, status,dt);
    drivingEffects.update(dt,time,!!activeDialog);
    sound.update(vehicle.motion,!!activeDialog);
    $('speed-value').textContent=String(Math.round(vehicle.speed*3.6)).padStart(2,'0');
    $('boost-label').classList.toggle('boosting',!!vehicle.motion.input.boost&&vehicle.speed>2);
    composer.render();
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
