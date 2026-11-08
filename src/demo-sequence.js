export function createDemoSequence(duration=2.2){
  let elapsed=0,running=false,project=null;
  if(!Number.isFinite(duration)||duration<=0)throw new Error('Invalid demo duration');
  return {
    start(next){if(!next?.stages?.length)throw new Error('Demo needs stages');project=next;elapsed=0;running=true;},
    cancel(){elapsed=0;running=false;project=null;},
    update(dt){
      let completed=false;
      if(running&&Number.isFinite(dt)&&dt>=0){elapsed=Math.min(elapsed+dt,project.stages.length*duration);if(elapsed>=project.stages.length*duration){running=false;completed=true;}}
      const stage=project?(running?Math.floor(elapsed/duration):(elapsed>0?project.stages.length:-1)):-1;
      return {stage,label:project?.stages[Math.min(stage,project.stages.length-1)]??'',progress:project?elapsed/(project.stages.length*duration):0,completed};
    },
    get running(){return running;},get project(){return project;},
  };
}
