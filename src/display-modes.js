export function createDisplayModes(renderer,scene,sun,sky,world){
  const nightButton=document.getElementById('night-button'),darkButton=document.getElementById('dark-button');
  const read=key=>{try{return localStorage.getItem(key)==='true';}catch{return false;}};
  const save=(key,value)=>{try{localStorage.setItem(key,String(value));}catch{/* preferences are optional */}};
  let night=read('drivefolio-night'),dark=read('drivefolio-dark');
  function applyNight(){
    const color=night?'#0a1527':'#d4e5eb';scene.background.set(color);scene.fog.color.set(color);
    sky.intensity=night?0.38:1.45;sky.color.set(night?'#537ba8':'#f0eddf');sky.groundColor.set(night?'#142632':'#829780');
    sun.intensity=night?0.28:2.1;sun.color.set(night?'#9cc3ff':'#fff8ed');renderer.toneMappingExposure=night?1.25:1;
    scene.environmentIntensity=night?0.035:0.22;
    world.setNight(night);nightButton.setAttribute('aria-pressed',String(night));nightButton.textContent=night?'Nachtmodus an':'Nachtmodus aus';
  }
  function applyDark(){document.documentElement.dataset.theme=dark?'dark':'light';darkButton.setAttribute('aria-pressed',String(dark));darkButton.textContent=dark?'Dark Mode an':'Dark Mode aus';}
  nightButton.disabled=false;darkButton.disabled=false;
  nightButton.addEventListener('click',()=>{night=!night;applyNight();save('drivefolio-night',night);});
  darkButton.addEventListener('click',()=>{dark=!dark;applyDark();save('drivefolio-dark',dark);});applyNight();applyDark();
}
