import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
import {TRACKS} from './tracks.js';
export class WaterVisuals{
 constructor(karts,scene){
  this.scene=scene;this.tint=new THREE.Color();
  this.propellers=karts.map(kart=>{const root=new THREE.Group();root.position.set(0,.65,-1.65);kart.add(root);const hub=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.38,8),toonMaterial('#ffd578'));hub.rotation.x=Math.PI/2;root.add(hub);const blades=new THREE.Group();root.add(blades);for(let i=0;i<3;i++){const blade=new THREE.Mesh(new THREE.BoxGeometry(.16,.8,.1),toonMaterial('#7cf8ef'));blade.rotation.z=i*Math.PI*2/3;blade.position.set(Math.sin(-i*Math.PI*2/3)*.27,Math.cos(i*Math.PI*2/3)*.27,0);blades.add(blade);}root.visible=false;return {root,blades,kart};});
  this.bubbles=new THREE.Group();scene.add(this.bubbles);const geometry=new THREE.SphereGeometry(.12,7,5),material=new THREE.MeshBasicMaterial({color:'#bdfcff',transparent:true,opacity:.55});for(let i=0;i<18;i++){const mesh=new THREE.Mesh(geometry,material);this.bubbles.add(mesh);}this.clock=0;
 }
 update(racers,frame,dt,{active=false,reduced=false,training=false}={}){
  this.clock+=dt;for(const r of racers){const p=this.propellers[r.pilot];if(p.root.parent!==p.kart)p.kart.add(p.root);p.root.visible=active&&r.environment==='water'&&(!training||r.index===0);if(!reduced)p.blades.rotation.z+=dt*(3+Math.abs(r.speed)*.9);}
  const player=racers[0],submerged=active&&player.environment==='water',night=player.settings.track==='night',blend=1-Math.exp(-dt*3);this.tint.set(submerged?'#126779':TRACKS[player.settings.track].sky);this.scene.background?.lerp(this.tint,blend);if(this.scene.fog){this.scene.fog.color.lerp(this.tint,blend);this.scene.fog.near+=((submerged?12:night?220:120)-this.scene.fog.near)*blend;this.scene.fog.far+=((submerged?100:night?650:340)-this.scene.fog.far)*blend;}
  this.bubbles.visible=submerged&&!reduced;
  if(this.bubbles.visible){const f=frame(player);this.bubbles.children.forEach((mesh,i)=>{const age=(this.clock+i*.17)%2;mesh.position.copy(f.p).addScaledVector(f.tangent,-1-age*2).addScaledVector(f.normal,Math.sin(i*4)*1.4).addScaledVector(f.up,.5+age*1.5);mesh.scale.setScalar(.6+age*.4);});}
 }
}
