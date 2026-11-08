import * as THREE from 'three';

export function createDrivingEffects(scene, vehicle) {
  const capacity=110,positions=new Float32Array(capacity*3),sizes=new Float32Array(capacity),alphas=new Float32Array(capacity);
  const particles=Array.from({length:capacity},()=>({life:0,age:0,vx:0,vz:0}));
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.BufferAttribute(positions,3));
  geometry.setAttribute('aSize',new THREE.BufferAttribute(sizes,1));geometry.setAttribute('aAlpha',new THREE.BufferAttribute(alphas,1));
  const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,
    uniforms:{uColor:{value:new THREE.Color('#e9b98b')}},
    vertexShader:'attribute float aSize; attribute float aAlpha; varying float vAlpha; void main(){vAlpha=aAlpha;vec4 mv=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mv;gl_PointSize=min(70.0,aSize*500.0/max(1.0,-mv.z));}',
    fragmentShader:'uniform vec3 uColor; varying float vAlpha; void main(){float r=length(gl_PointCoord-0.5)*2.0;float a=smoothstep(1.0,0.1,r)*vAlpha;gl_FragColor=vec4(uColor,a*0.36);}',
  });
  const dust=new THREE.Points(geometry,material);dust.frustumCulled=false;scene.add(dust);
  const trackCount=750,track=new THREE.InstancedMesh(new THREE.PlaneGeometry(0.15,0.45),new THREE.MeshBasicMaterial({color:'#604243',transparent:true,opacity:0.28,depthWrite:false}),trackCount);
  track.frustumCulled=false;const dummy=new THREE.Object3D();dummy.scale.setScalar(0);dummy.updateMatrix();
  for(let i=0;i<trackCount;i++)track.setMatrixAt(i,dummy.matrix);
  scene.add(track);
  let cursor=0,trackCursor=0,spawn=0;
  const lastTrack=new THREE.Vector3(1e5,0,1e5);
  return {
    update(dt,time,paused){
      const m=vehicle.motion,p=vehicle.group.position,s=Math.sin(vehicle.heading),c=Math.cos(vehicle.heading);
      spawn+=dt;
      const skidding=m.input.brake||Math.abs(m.steering)>0.5&&m.speed>7;
      if(!paused&&m.grounded&&m.speed>1&&spawn>0.025){
        spawn=0;
        const index=cursor++%capacity,particle=particles[index],side=cursor%2?1:-1;
        particle.life=0.65+Math.random()*0.5;particle.age=0;
        positions[index*3]=p.x-s*1.2+c*side*0.7;positions[index*3+1]=0.15;positions[index*3+2]=p.z-c*1.2-s*side*0.7;
        particle.vx=-s*m.speed*0.1+(Math.random()-0.5);particle.vz=-c*m.speed*0.1+(Math.random()-0.5);sizes[index]=skidding?1.4:0.75;
      }
      for(let i=0;i<capacity;i++){
        const particle=particles[i];particle.age+=dt;const life=particle.life?particle.age/particle.life:1;
        alphas[i]=Math.max(0,1-life);if(life>=1)continue;
        positions[i*3]+=particle.vx*dt;positions[i*3+1]+=dt*0.6;positions[i*3+2]+=particle.vz*dt;sizes[i]+=dt*0.8;
      }
      geometry.attributes.position.needsUpdate=true;geometry.attributes.aSize.needsUpdate=true;geometry.attributes.aAlpha.needsUpdate=true;
      if(!paused&&m.grounded&&m.speed>1.8&&lastTrack.distanceTo(p)>0.25){
        for(const side of [-1,1]){
          dummy.position.set(p.x-s*1+c*side*0.74,0.08,p.z-c*1-s*side*0.74);
          dummy.rotation.set(-Math.PI/2,0,-vehicle.heading);dummy.scale.set(1,skidding?1.6:0.75,1);dummy.updateMatrix();track.setMatrixAt(trackCursor++%trackCount,dummy.matrix);
        }
        track.instanceMatrix.needsUpdate=true;lastTrack.copy(p);
      }
    },
    reset(){particles.forEach(p=>p.life=0);alphas.fill(0);dummy.scale.setScalar(0);dummy.updateMatrix();for(let i=0;i<trackCount;i++)track.setMatrixAt(i,dummy.matrix);track.instanceMatrix.needsUpdate=true;lastTrack.set(1e5,0,1e5);},
  };
}
