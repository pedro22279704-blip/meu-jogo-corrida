import {flightHeight} from './arcade-race.js';
import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
import {trackLength} from './tracks.js';
import {SHORTCUTS} from './shortcuts.js';

export function boneTarget(owner,racers){return racers.filter(r=>r!==owner&&!r.finished&&flightHeight(r)<2.2&&!!r.shortcut===!!owner.shortcut&&r.distance>owner.distance&&r.distance-owner.distance<140).sort((a,b)=>a.distance-b.distance)[0]??null;}
export function launchBone(owner,racers){const target=boneTarget(owner,racers);return {owner:owner.index,ownerName:owner.name,height:flightHeight(owner),shortcut:!!owner.shortcut,target:target?.index??null,distance:owner.distance+2.3,offset:owner.offset,speed:Math.max(58,owner.speed+18),slide:Math.sin(owner.angle)*8,life:5,age:0,bounces:0};}
export function advanceBones(racers,world,dt,time,hit,roadLimit){
 const length=trackLength(racers[0]?.settings?.track),gap=(a,b)=>((a-b+length/2)%length+length)%length-length/2;
 for(const bone of world.bones){
  bone.height=Math.max(0,(bone.height??0)-dt*6);bone.life-=dt;bone.age+=dt;if(bone.life<=0)continue;
  const progress=((bone.distance%length)+length)%length,spec=SHORTCUTS[racers[0]?.settings?.track];
  if(bone.shortcut&&spec&&(progress<spec.start||progress>spec.end))bone.shortcut=false;
  const target=racers.find(r=>r.index===bone.target&&!r.finished&&flightHeight(r)<2.2&&!!r.shortcut===!!bone.shortcut);
  const oldOffset=bone.offset,before=bone.distance,travel=bone.speed*dt;
  if(target&&target.distance>before-2&&target.distance-before<160)bone.offset+=Math.max(-8*dt,Math.min(8*dt,target.offset-bone.offset));else{bone.target=null;bone.offset+=bone.slide*dt;}
  const edge=roadLimit-.6;if(Math.abs(bone.offset)>edge){bone.offset=Math.sign(bone.offset)*edge;bone.slide*=-1;bone.bounces++;if(bone.bounces>3)bone.life=0;}
  bone.distance+=travel;
  const candidates=racers.filter(r=>r.index!==bone.owner&&!r.finished&&flightHeight(r)<2.2&&!!r.shortcut===!!bone.shortcut).map(r=>({r,d:gap(r.distance,before)})).filter(({d})=>d>=-1.4&&d<=travel+1.4).sort((a,b)=>a.d-b.d);
  for(const {r,d} of candidates){if(bone.height>1.5)continue;const u=Math.max(0,Math.min(1,d/Math.max(.001,travel))),offset=oldOffset+(bone.offset-oldOffset)*u;if(Math.abs(r.offset-offset)>1.65)continue;
   if(hit(r,1.6,bone.ownerName,'bone',time)){r.hit=.55;r.boneSpin=.65;}bone.life=0;break;
  }
 }
 world.bones=world.bones.filter(b=>b.life>0);
}
export function createBoneModel(){
 const root=new THREE.Group(),material=toonMaterial('#fff1cc'),shaft=new THREE.Mesh(new THREE.CylinderGeometry(.16,.19,1.55,10),material);shaft.rotation.z=Math.PI/2;root.add(shaft);
 const cap=new THREE.SphereGeometry(.27,10,8);for(const side of [-1,1])for(const bump of [-1,1]){const joint=new THREE.Mesh(cap,material);joint.position.set(side*.76,bump*.14,0);root.add(joint);}
 const stripe=new THREE.Mesh(new THREE.TorusGeometry(.19,.045,5,12),toonMaterial('#e7a446'));stripe.rotation.y=Math.PI/2;root.add(stripe);return root;
}
