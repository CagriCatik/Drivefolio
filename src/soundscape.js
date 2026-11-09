// Locally synthesized positional ambience; no recordings, network or autoplay.
export const ambienceSources={fountain:[7,0.6,14],garage:[29.5,1,12],pump:[15.5,1,15],canal:[-32,0.2,-15],trees:[-18,2,13]};
export function createSoundscape(context,master){
 const ambient=context.createGain();ambient.gain.value=0.7;ambient.connect(master);
 const buffer=context.createBuffer(1,context.sampleRate*3,context.sampleRate),data=buffer.getChannelData(0);let seed=71,brown=0;
 for(let i=0;i<data.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const white=seed/2147483648-1;brown=(brown+white*0.025)/1.025;data[i]=brown*3+white*0.12;}
 function source(position,frequency,volume,type='noise'){
  const node=type==='noise'?context.createBufferSource():context.createOscillator();if(type==='noise'){node.buffer=buffer;node.loop=true;}else{node.type=type;node.frequency.value=frequency/4;}
  const filter=context.createBiquadFilter();filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=0.6;
  const gain=context.createGain();gain.gain.value=volume;const pan=context.createPanner();pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=3;pan.maxDistance=45;pan.rolloffFactor=1.8;
  [pan.positionX.value,pan.positionY.value,pan.positionZ.value]=position;
  node.connect(filter);filter.connect(gain);gain.connect(pan);pan.connect(ambient);node.start();return {node,filter,gain,pan};
 }
 const fountain=source(ambienceSources.fountain,950,0.65),canal=source(ambienceSources.canal,460,0.19),trees=source(ambienceSources.trees,1450,0.15),pump=source(ambienceSources.pump,260,0),garage=source(ambienceSources.garage,350,0),traffic=source([0,0.5,0],500,0,'sawtooth');
 let refueling=false,garageNear=false,lastBird=-20;
 function click(position,frequency,volume,duration=0.12){const s=source(position,frequency,volume,'triangle');s.node.frequency.setValueAtTime(frequency,context.currentTime);s.filter.frequency.value=frequency*1.5;s.gain.gain.exponentialRampToValueAtTime(0.0001,context.currentTime+duration);s.node.stop(context.currentTime+duration);s.node.onended=()=>{s.node.disconnect();s.filter.disconnect();s.gain.disconnect();s.pan.disconnect();};}
 const target=(param,value)=>param.setTargetAtTime(value,context.currentTime,0.16);
 return {update({position,traffic:car,fuel,night,time=0},paused){
  if(!position)return;const listener=context.listener,t=context.currentTime;
  // Listener rides with the visitor, oriented to the fixed diagonal camera view.
  listener.positionX.value=position.x;listener.positionY.value=1.2;listener.positionZ.value=position.z;
  listener.forwardX.value=-Math.SQRT1_2;listener.forwardY.value=0;listener.forwardZ.value=-Math.SQRT1_2;listener.upX.value=0;listener.upY.value=1;listener.upZ.value=0;
  target(trees.gain.gain,(night?0.06:0.13)*(0.85+Math.sin(time*0.6)*0.15));target(fountain.gain.gain,0.55+Math.sin(time*1.3)*0.06);
  if(car){traffic.pan.positionX.value=car.x;traffic.pan.positionZ.value=car.z;target(traffic.node.frequency,40+car.speed*8);target(traffic.filter.frequency,220+car.speed*45);target(traffic.gain.gain,paused?0:0.08+car.speed*0.012);}
  const fueling=!!fuel?.refueling&&!paused;target(pump.gain.gain,fueling?0.34:0);
  if(fueling!==refueling){click(ambienceSources.pump,fueling?190:115,0.55);refueling=fueling;}
  const near=Math.hypot(position.x-29.5,position.z-10)<7;
  if(near!==garageNear){garageNear=near;garage.gain.gain.cancelScheduledValues(t);garage.gain.gain.setValueAtTime(0.32,t);garage.gain.gain.setTargetAtTime(0,t+0.7,0.45);}
  if(!night&&time-lastBird>16&&Math.hypot(position.x+18,position.z-13)<23){lastBird=time;click(ambienceSources.trees,1900,0.09,0.18);}
 }};
}
