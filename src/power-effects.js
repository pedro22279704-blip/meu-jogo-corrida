import * as THREE from 'three';
export class PowerEffects{
 constructor(scene){this.group=new THREE.Group();scene.add(this.group);this.previous=new Map();const geometry=new THREE.SphereGeometry(.09,6,4);this.pool=Array.from({length:40},()=>{const mesh=new THREE.Mesh(geometry,new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true}));mesh.visible=false;this.group.add(mesh);return {mesh,life:0,velocity:new THREE.Vector3()};});}
 clear(){this.previous.clear();for(const p of this.pool){p.life=0;p.mesh.visible=false;}}
 update(racers,frame,dt,{light=false,reduced=false}={}){
  if(dt<=0)return;
  for(const r of racers){const before=this.previous.get(r.index);if(before){const attack=r.lastAttack!==before.attack&&r.lastAttack;
   const pop=before.shield>0&&r.shield<=0;
   if(attack||pop){const count=reduced?4:light?8:18,base=frame(r).p;for(let i=0;i<count;i++){const p=this.pool.find(p=>p.life<=0);if(!p)break;const a=i/count*Math.PI*2;p.life=.55;p.mesh.position.copy(base).add(new THREE.Vector3(Math.cos(a)*.7,1+Math.sin(a)*.2,Math.sin(a)*.7));p.velocity.set(Math.cos(a)*3.5,1.5+Math.sin(a*2),Math.sin(a)*3.5);p.mesh.material.color.set(pop?'#8deaff':attack.item==='gum'?'#ff8bdc':'#d2adff');}}
  }this.previous.set(r.index,{shield:r.shield,attack:r.lastAttack});}
  for(const p of this.pool){p.life=Math.max(0,p.life-dt);p.mesh.visible=p.life>0;if(p.life>0){p.mesh.position.addScaledVector(p.velocity,dt);p.velocity.y-=4*dt;p.mesh.scale.setScalar(p.life/.55);p.mesh.material.opacity=p.life/.55;}}
 }
}
