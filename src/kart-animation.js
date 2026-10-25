import * as THREE from 'three';
import {animateCharacter} from './characters.js';
import {personalityPose} from './pilot-personality.js';
export function bindKart(model){
 const find=name=>{let found;model.traverse(node=>{if(!node.userData.originalCharacter&&node.name.replace(/[._]?\d+$/,'')===name)found??=node;});return found;};
 const rig={model,driver:find('Driver'),arms:['L','R'].map(s=>find('Arm_'+s)),steering:find('Steering'),front:['L','R'].map(s=>find('Steer_F'+s)),rolls:['FL','FR','BL','BR'].map(s=>find('Roll_'+s)),wheelAngle:0};
 for(const part of [rig.driver,...rig.arms,rig.steering,...rig.front,...rig.rolls])if(part)part.userData.rest=part.quaternion.clone();
 return rig;
}
function rotate(part,axis,angle){if(part)part.quaternion.copy(part.userData.rest).multiply(new THREE.Quaternion().setFromAxisAngle(axis,angle));}
const x=new THREE.Vector3(1,0,0),y=new THREE.Vector3(0,1,0),z=new THREE.Vector3(0,0,1);
export function animateKart(rig,racer,dt,time,{reduced=false}={}){
 if(!rig)return;
 animateCharacter(rig.driver,racer,time,reduced);
 const pose=personalityPose(racer,time,rig.driver?.userData.character,reduced);
 rig.wheelAngle=(rig.wheelAngle+(racer.finished?0:racer.speed)*dt/.37)%(Math.PI*2);
 for(const wheel of rig.rolls)rotate(wheel,x,rig.wheelAngle);
 const steering=racer.steerVisual??racer.angle;for(const wheel of rig.front)rotate(wheel,y,steering*(racer.drifting?-.45:.55));
 rotate(rig.steering,y,steering*1.1);
 rotate(rig.driver,z,-racer.angle*.24+pose.roll);
 rig.arms.forEach((arm,i)=>{rotate(arm,z,racer.angle*.25+pose.arms[i].z+(racer.powerGesture>0?(i?-.35:.35):0));if(arm)arm.quaternion.multiply(new THREE.Quaternion().setFromAxisAngle(x,pose.arms[i].x));});
}
