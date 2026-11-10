// One shared pointer spotlight for interface panels; native focus/click behavior stays intact.
export function setupNeonUI(){
 const selector='.welcome,.campus-map,.discovery-card,.world-lab,.showroom-card,.sequence-card,.fuel-station-hud,.race-hud,dialog';
 document.querySelectorAll(selector).forEach(panel=>panel.classList.add('neon-panel'));
 if(!window.matchMedia('(hover: hover) and (pointer: fine)').matches)return;
 document.addEventListener('pointermove',event=>{const panel=event.target.closest?.('.neon-panel');if(!panel)return;const rect=panel.getBoundingClientRect();panel.style.setProperty('--neon-x',`${event.clientX-rect.left}px`);panel.style.setProperty('--neon-y',`${event.clientY-rect.top}px`);},{passive:true});
}
