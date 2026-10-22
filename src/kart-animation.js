import * as THREE from 'three';
export function bindKart(model){
 const find=name=>{let found;model.traverse(node=>{if(node.name.replace(/[._]?\d+$/,'')===name)found??=node;});return found;};
 const rig={model,driver:find('Driver'),arms:['L','R'].map(s=>find('Arm_'+s)),steering:find('Steering'),front:['L','R'].map(s=>find('Steer_F'+s)),rolls:['FL','FR','BL','BR'].map(s=>find('Roll_'+s)),wheelAngle:0};
 for(const part of [rig.driver,...rig.arms,rig.steering,...rig.front,...rig.rolls])if(part)part.userData.rest=part.quaternion.clone();
 return rig;
}
function rotate(part,axis,angle){if(part)part.quaternion.copy(part.userData.rest).multiply(new THREE.Quaternion().setFromAxisAngle(axis,angle));}
const x=new THREE.Vector3(1,0,0),y=new THREE.Vector3(0,1,0),z=new THREE.Vector3(0,0,1);
export function animateKart(rig,racer,dt,time){
 if(!rig)return;
 rig.wheelAngle=(rig.wheelAngle+(racer.finished?0:racer.speed)*dt/.37)%(Math.PI*2);
 for(const wheel of rig.rolls)rotate(wheel,x,rig.wheelAngle);
 for(const wheel of rig.front)rotate(wheel,y,racer.angle*.65);
 rotate(rig.steering,y,racer.angle*1.3);
 rotate(rig.driver,z,-racer.angle*.24);
 const celebrate=racer.finished&&(racer.podiumPlace??1)<=3;
 rig.arms.forEach((arm,i)=>{rotate(arm,z,celebrate?(i?1:-1)*.45:racer.angle*.25);if(celebrate&&arm)arm.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(x,-2+Math.sin(time*7)*.15));});
}
