import * as THREE from 'three';
import {bindKart,animateKart} from './kart-animation.js';
import {toonMaterial} from './cartoon.js';
export class ResultStage{
 constructor(canvas){this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});this.renderer.setSize(640,220,false);this.renderer.setPixelRatio(1);this.renderer.toneMapping=THREE.NeutralToneMapping;this.scene=new THREE.Scene();this.camera=new THREE.PerspectiveCamera(35,640/220,.1,50);this.camera.position.set(0,5,-13);this.camera.lookAt(0,1,0);this.scene.add(new THREE.HemisphereLight(0xf1fcff,0x61747a,1.7));const sun=new THREE.DirectionalLight(0xffe9ca,2.2);sun.position.set(3,6,-4);this.scene.add(sun);this.podium=new THREE.Group();this.scene.add(this.podium);for(let i=0;i<3;i++){const height=[1.2,.8,.45][i],block=new THREE.Mesh(new THREE.BoxGeometry(2.6,height,3),toonMaterial(['#e5b54d','#a2c9d2','#c88d63'][i]));block.position.set([0,-3.3,3.3][i],height/2,0);this.podium.add(block);}this.models=new THREE.Group();this.scene.add(this.models);this.signature='';this.actors=[];}
 update(finishers,karts,dt,time){
 const signature=finishers.slice(0,3).map(r=>`${r.pilot}:${!!karts[r.pilot].userData.rig}`).join(',');
 if(signature!==this.signature){this.signature=signature;this.models.clear();this.actors=[];finishers.slice(0,3).forEach((r,i)=>{const source=karts[r.pilot].userData.rig?.model;if(!source)return;const clone=source.clone(true);clone.traverse(part=>{const original=source.getObjectByName(part.name);if(original?.userData.rest?.isQuaternion)part.quaternion.copy(original.userData.rest);});clone.position.set([0,-3.3,3.3][i],[1.2,.8,.45][i],0);clone.rotation.y=Math.PI;this.models.add(clone);this.actors.push({rig:bindKart(clone),r:{...r,podiumPlace:i+1,angle:0}});});}
 for(const a of this.actors)animateKart(a.rig,a.r,dt,time);this.renderer.render(this.scene,this.camera);
 }
}
