import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {SSAOPass} from 'three/addons/postprocessing/SSAOPass.js';
import {BokehPass} from 'three/addons/postprocessing/BokehPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
export function createEnvironmentRendering(renderer,scene,camera){
 const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));
 const ao=new SSAOPass(scene,camera,512,512,12);ao.kernelRadius=2.4;ao.minDistance=0.001;ao.maxDistance=0.035;
 const setAOSize=ao.setSize.bind(ao);ao.setSize=(w,h)=>setAOSize(Math.max(1,Math.floor(w*0.5)),Math.max(1,Math.floor(h*0.5)));// Glass roofs, text planes and contact decals must not turn into opaque AO occluders.
 const renderAO=ao.render.bind(ao);ao.render=(...args)=>{const hidden=[];scene.traverse(n=>{if(n.isMesh&&n.visible&&(Array.isArray(n.material)?n.material:[n.material]).some(m=>m.transparent)){hidden.push(n);n.visible=false;}});try{renderAO(...args);}finally{hidden.forEach(n=>n.visible=true);}};
 composer.addPass(ao);
 const bokeh=new BokehPass(scene,camera,{focus:34,aperture:0.00007,maxblur:0.003});bokeh.enabled=false;composer.addPass(bokeh);
 const bloom=new UnrealBloomPass(new THREE.Vector2(512,512),0.15,0.32,1.35);composer.addPass(bloom);
 const grade=new ShaderPass({uniforms:{tDiffuse:{value:null},uNight:{value:0}},vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',fragmentShader:`uniform sampler2D tDiffuse;uniform float uNight;varying vec2 vUv;
 void main(){vec4 image=texture2D(tDiffuse,vUv);vec3 c=image.rgb;float l=dot(c,vec3(0.2126,0.7152,0.0722));c=mix(vec3(l),c,0.96);c*=mix(vec3(1.025,1.012,0.985),vec3(0.97,1.01,1.04),uNight);vec2 p=vUv-0.5;float edge=smoothstep(0.16,0.65,dot(p,p));c*=1.0-edge*0.065;gl_FragColor=vec4(c,image.a);}`});composer.addPass(grade);composer.addPass(new OutputPass());
 let samples=0,elapsed=0,aoBudget=true;const focusPoint=new THREE.Vector3(29.5,0.8,16);
 return {setSize(w,h){composer.setSize(w,h);},render({night=false,showroom=false,overview=false,dt=0}={}){if(dt>0&&samples<90){samples++;elapsed+=dt;if(samples===90&&elapsed/samples>0.045)aoBudget=false;}ao.enabled=!overview&&aoBudget;bokeh.enabled=showroom;bokeh.uniforms.focus.value=camera.position.distanceTo(focusPoint);grade.uniforms.uNight.value=night?1:0;bloom.strength=night?0.14:0.07;composer.render();}};
}
