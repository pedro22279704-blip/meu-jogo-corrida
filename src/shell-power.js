import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
import {launchBone,advanceBones} from './bone-power.js';

// Shares swept collision and route separation with the bone, with its own artwork and hit label.
export function launchShell(owner,racers){return {...launchBone(owner,racers),speed:Math.max(64,owner.speed+24),life:4};}
export function advanceShells(racers,world,dt,time,hit,roadLimit){
 const projectiles={bones:world.shells??[]};
 advanceBones(racers,projectiles,dt,time,(r,slow,by,_item,t)=>hit(r,slow,by,'shell',t),roadLimit);
 world.shells=projectiles.bones;
}
export function createShellModel(){
 const root=new THREE.Group(),red=toonMaterial('#ef375a'),cream=toonMaterial('#ffe6af'),dark=toonMaterial('#742844');
 const dome=new THREE.Mesh(new THREE.SphereGeometry(.67,16,10,0,Math.PI*2,0,Math.PI/2),red);root.add(dome);
 const rim=new THREE.Mesh(new THREE.TorusGeometry(.65,.12,8,20),cream);rim.rotation.x=Math.PI/2;root.add(rim);
 for(let i=0;i<6;i++){const seam=new THREE.Mesh(new THREE.BoxGeometry(.045,.48,.045),dark);seam.position.set(Math.cos(i*Math.PI/3)*.46,.3,Math.sin(i*Math.PI/3)*.46);root.add(seam);}
 const star=new THREE.Mesh(new THREE.OctahedronGeometry(.19),cream);star.position.y=.72;root.add(star);return root;
}
