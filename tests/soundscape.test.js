import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createAudio} from '../src/audio.js';
import {createSoundscape} from '../src/soundscape.js';
function audioFixture(){
 const nodes=[],param=()=>({value:0,setTargetAtTime(v){this.value=v;},setValueAtTime(v){this.value=v;},exponentialRampToValueAtTime(v){this.value=v;},cancelScheduledValues(){}});
 const node=type=>{const n={kind:type,type,gain:param(),frequency:param(),Q:param(),positionX:param(),positionY:param(),positionZ:param(),connect(){},disconnect(){},start(){},stop(){}};nodes.push(n);return n;};
 const listener={};for(const key of ['positionX','positionY','positionZ','forwardX','forwardY','forwardZ','upX','upY','upZ'])listener[key]=param();
 const context={currentTime:1,sampleRate:30,listener,createGain:()=>node('gain'),createPanner:()=>node('panner'),createBiquadFilter:()=>node('filter'),createOscillator:()=>node('oscillator'),createBufferSource:()=>node('buffer'),createBuffer:()=>({getChannelData:()=>new Float32Array(90)})};
 return {context,nodes};
}
test('spatial ambience listens at the visitor and the moving sound source follows traffic',()=>{
 const {context,nodes}=audioFixture(),scape=createSoundscape(context,{}),position={x:12,z:-7};
 scape.update({position,traffic:{x:44,z:-20,speed:8},time:1},false);
 assert.equal(context.listener.positionX.value,12);assert.equal(context.listener.positionZ.value,-7);assert.equal(context.listener.positionY.value,1.2);
 assert.ok(context.listener.forwardX.value<0&&context.listener.forwardZ.value<0);
 const car=nodes.filter(n=>n.type==='panner').at(-1);assert.equal(car.positionX.value,44);assert.equal(car.positionZ.value,-20);
 scape.update({position,traffic:{x:40,z:-30,speed:3},time:2},false);assert.equal(car.positionX.value,40);assert.equal(car.positionZ.value,-30);
});
test('refueling makes one start/stop event per transition and a paused scene stops pump flow',()=>{
 const {context,nodes}=audioFixture(),scape=createSoundscape(context,{}),state={position:{x:14,z:15},fuel:{refueling:true},time:1};
 const oscillators=()=>nodes.filter(n=>n.kind==='oscillator').length,before=oscillators();
 scape.update(state,false);assert.equal(oscillators(),before+1);
 scape.update(state,false);assert.equal(oscillators(),before+1);
 scape.update(state,true);assert.equal(oscillators(),before+2);
 scape.update(state,true);assert.equal(oscillators(),before+2);
});

test('audio is created only after interaction; mute gates the whole mix and unmute resumes a suspended context',()=>{
 const {context,nodes}=audioFixture();let creations=0,resumes=0,suspends=0;context.destination={};context.resume=()=>{resumes++;return Promise.resolve();};context.suspend=()=>{suspends++;return Promise.resolve();};
 const original=globalThis.AudioContext;globalThis.AudioContext=function(){creations++;return context;};
 try{const audio=createAudio();assert.equal(creations,0);audio.start();assert.equal(creations,1);const master=nodes[0];assert.equal(master.gain.value,0.1);audio.toggle();assert.equal(master.gain.value,0);audio.setHidden(true);assert.equal(suspends,1);audio.setHidden(false);const before=resumes;audio.toggle();assert.equal(resumes,before+1);assert.equal(master.gain.value,0.1);}
 finally{if(original===undefined)delete globalThis.AudioContext;else globalThis.AudioContext=original;}
});
