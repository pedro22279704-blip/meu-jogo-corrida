import * as THREE from 'three';
import {createWorld} from './world.js';
import {trackLength} from './tracks.js';

export class MenuPanorama{
 constructor(renderer,getModels){this.renderer=renderer;this.getModels=getModels;this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight(0xd4e8ff,0x122338,1.2));const sun=new THREE.DirectionalLight(0xa9caff,1.2);sun.position.set(-60,110,40);this.scene.add(sun);this.camera=new THREE.PerspectiveCamera(48,1,.4,1500);this.cars=[];this.time=0;}
 update(dt,{quality='pretty',reduced=false}={}){
  if(!this.world||this.quality!==quality){this.world?.dispose();this.world=createWorld(this.scene,'night',{quality});this.scene.fog.near=300;this.scene.fog.far=1150;this.quality=quality;}
  this.time+=reduced?0:dt;
  this.getModels().forEach((source,i)=>{if(source&&!this.cars[i]){const model=source.clone(true);this.cars[i]=model;this.scene.add(model);}});
  for(const [i,car] of this.cars.entries()){if(!car)continue;const f=this.world.track((this.time*29+i*trackLength('night')/8)%trackLength('night'),i%2?3:-3);car.position.copy(f.p);car.quaternion.copy(f.quaternion);}
  const aspect=innerWidth/innerHeight,orbit=reduced?.35:.35+Math.sin(this.time*.025)*.22;
  this.camera.aspect=aspect;this.camera.updateProjectionMatrix();const distance=aspect<.8?440:330;this.camera.position.set(Math.cos(orbit)*distance,aspect<.8?220:170,Math.sin(orbit)*distance);this.camera.lookAt(0,12,0);
  this.world.update(this.time,reduced);this.renderer.setRenderTarget(null);this.renderer.render(this.scene,this.camera);
 }
}
