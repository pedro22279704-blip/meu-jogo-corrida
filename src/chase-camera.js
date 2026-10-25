import * as THREE from 'three';
import {safeCameraPosition} from './camera-comfort.js';

// Exact critically damped spring for a fixed target: stable at different frame rates.
export function dampVector(position,velocity,target,omega,dt){
 if(dt<=0)return;
 const delta=position.clone().sub(target),change=velocity.clone().addScaledVector(delta,omega),decay=Math.exp(-omega*dt);
 position.copy(target).addScaledVector(delta,decay).addScaledVector(change,dt*decay);
 velocity.addScaledVector(change,-omega*dt).multiplyScalar(decay);
}
export class ChaseCamera{
 constructor(camera){this.camera=camera;this.velocity=new THREE.Vector3();this.lookVelocity=new THREE.Vector3();this.look=new THREE.Vector3();this.direction=new THREE.Vector3();this.ready=false;}
 reset(){this.ready=false;this.velocity.set(0,0,0);this.lookVelocity.set(0,0,0);}
 update(racer,frameAt,dt,{reduced=false,obstacles=[]}={}){
  if(this.ready&&dt<=0)return;
  const camera=this.camera,frame=frameAt(racer.distance,racer.offset),heading=racer.heading??racer.angle??0;
  const travel=frame.tangent.clone().multiplyScalar(Math.cos(heading)).addScaledVector(frame.normal,Math.sin(heading)).normalize();
  if(!this.ready)this.direction.copy(travel);else{
   const alpha=1-Math.exp(-dt*(reduced?18:8)),currentYaw=Math.atan2(this.direction.x,this.direction.z),targetYaw=Math.atan2(travel.x,travel.z),yaw=currentYaw+Math.atan2(Math.sin(targetYaw-currentYaw),Math.cos(targetYaw-currentYaw))*alpha;
   const vertical=this.direction.y+(travel.y-this.direction.y)*alpha,horizontal=Math.sqrt(Math.max(0,1-vertical*vertical));this.direction.set(Math.sin(yaw)*horizontal,vertical,Math.cos(yaw)*horizontal);
  }
  const boosting=racer.boosting&&!reduced,back=boosting?11.8:10.4;
  const desired=frame.p.clone().addScaledVector(this.direction,-back).addScaledVector(new THREE.Vector3(0,1,0),4.7);
  // A small turn offset follows travel, rather than chasing the sideways drift pose.
  if(!reduced)desired.addScaledVector(frame.normal,-Math.sin(heading)*.65);
  const behind=frameAt(racer.distance-back/(frame.metersPerUnit??1),racer.offset);
  desired.y=Math.max(desired.y,behind.p.y+2);
  const target=frame.p.clone().addScaledVector(this.direction,10).add(new THREE.Vector3(0,1.4,0));
  if(!this.ready){camera.position.copy(desired);this.look.copy(target);camera.fov=60;this.ready=true;}
  else{dampVector(camera.position,this.velocity,desired,reduced?18:12,dt);dampVector(this.look,this.lookVelocity,target,reduced?20:15,dt);}
  const safe=safeCameraPosition(frame.p.clone().addScaledVector(frame.up,1.2),camera.position,obstacles);
  if(safe.distanceToSquared(camera.position)>.0001){camera.position.copy(safe);this.velocity.set(0,0,0);}
  camera.fov+=((boosting?67:60)-camera.fov)*(1-Math.exp(-dt*4));camera.updateProjectionMatrix();
  camera.up.set(0,1,0);camera.lookAt(this.look);
 }
}
