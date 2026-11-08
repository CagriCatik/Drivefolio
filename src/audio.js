// Synthesized locally: no downloaded recordings, autoplay or external requests.
export function createAudio() {
  let context,master,engine,engineGain,filter,noiseGain,enabled=false,lastHorn=false;
  function start(){
    if(!context){
      context=new AudioContext();master=context.createGain();master.gain.value=0.1;master.connect(context.destination);
      engine=context.createOscillator();engine.type='sawtooth';engine.frequency.value=45;
      engineGain=context.createGain();engineGain.gain.value=0;
      filter=context.createBiquadFilter();filter.type='lowpass';filter.frequency.value=180;
      engine.connect(filter);filter.connect(engineGain);engineGain.connect(master);engine.start();
      const buffer=context.createBuffer(1,context.sampleRate*2,context.sampleRate),data=buffer.getChannelData(0);
      for(let i=0;i<data.length;i++)data[i]=(Math.random()*2-1)*0.4;
      const noise=context.createBufferSource();noise.buffer=buffer;noise.loop=true;
      const lowpass=context.createBiquadFilter();lowpass.type='lowpass';lowpass.frequency.value=1100;
      noiseGain=context.createGain();noiseGain.gain.value=0;noise.connect(lowpass);lowpass.connect(noiseGain);noiseGain.connect(master);noise.start();
    }
    context.resume().catch(()=>{});enabled=true;return enabled;
  }
  function tone(freq,duration,level){
    if(!context||!enabled)return;
    const o=context.createOscillator(),g=context.createGain();o.frequency.value=freq;o.type='triangle';g.gain.value=level;
    g.gain.exponentialRampToValueAtTime(0.001,context.currentTime+duration);o.connect(g);g.connect(master);o.start();o.stop(context.currentTime+duration);
  }
  return {
    start,
    toggle(){if(!context)return start();enabled=!enabled;master.gain.setTargetAtTime(enabled?0.1:0,context.currentTime,0.04);return enabled;},
    update(motion,paused){
      if(!context)return;
      const t=context.currentTime,moving=!paused&&motion.speed>0.1;
      engine.frequency.setTargetAtTime(37+motion.speed*7+(motion.input.boost?55:0),t,0.12);
      filter.frequency.setTargetAtTime(140+motion.speed*50,t,0.1);
      engineGain.gain.setTargetAtTime(paused?0:0.08+Math.min(motion.speed/50,0.3),t,0.15);
      noiseGain.gain.setTargetAtTime(moving&&motion.input.brake?Math.min(motion.speed/20,0.5):0,t,0.06);
      if(motion.input.horn&&!lastHorn)tone(220,0.3,0.8);lastHorn=motion.input.horn;
      if(motion.impact>2)tone(65,0.15,Math.min(motion.impact/10,0.7));
    },
    chime(){tone(660,0.18,0.5);setTimeout(()=>tone(880,0.3,0.4),110);},
  };
}
