export const stages=['Spezifikation lesen','Operationen zuordnen','Python-Testcode erzeugen'];
export function createTestSequence(duration=0.85){
  let elapsed=0,running=false;
  return {
    start(){elapsed=0;running=true;},
    cancel(){elapsed=0;running=false;},
    update(dt){
      let completed=false;
      if(running&&Number.isFinite(dt)&&dt>=0){elapsed+=dt;if(elapsed>=stages.length*duration){elapsed=stages.length*duration;running=false;completed=true;}}
      const stage=running?Math.min(stages.length-1,Math.floor(elapsed/duration)):(elapsed>0?stages.length:-1);
      return {stage,label:stages[Math.min(stage,stages.length-1)]??'',progress:elapsed/(stages.length*duration),completed};
    },
    get running(){return running;},
  };
}
