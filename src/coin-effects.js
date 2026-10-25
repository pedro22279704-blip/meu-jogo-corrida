import * as THREE from 'three';
export class CoinEffects{
 constructor(parent){
  this.particles=Array.from({length:60},()=>({position:new THREE.Vector3(),velocity:new THREE.Vector3(),life:0}));
  this.mesh=new THREE.InstancedMesh(new THREE.SphereGeometry(.075,5,4),new THREE.MeshBasicMaterial({color:'#ffffff'}),this.particles.length);this.mesh.frustumCulled=false;parent.add(this.mesh);this.transform=new THREE.Object3D();
  for(let i=0;i<this.particles.length;i++)this.mesh.setColorAt(i,new THREE.Color(i%2?'#fff1a0':'#ffffff'));this.update(0);
 }
 burst(position,{light=false,reduced=false}={}){
  if(reduced)return;const count=light?3:5;
  for(let i=0;i<count;i++){const p=this.particles.find(p=>p.life<=0);if(!p)break;const angle=i/count*Math.PI*2;p.life=.4;p.position.copy(position);p.velocity.set(Math.cos(angle)*2,1.4+i*.24,Math.sin(angle)*2);}
 }
 update(dt){
  for(const [i,p] of this.particles.entries()){
   if(dt>0&&p.life>0){const step=Math.min(dt,p.life);p.position.addScaledVector(p.velocity,step);p.velocity.y-=step*4.5;p.life=Math.max(0,p.life-dt);}
   this.transform.position.copy(p.position);this.transform.scale.setScalar(p.life>0?p.life/.4:0);this.transform.updateMatrix();this.mesh.setMatrixAt(i,this.transform.matrix);
  }
  this.mesh.instanceMatrix.needsUpdate=true;
 }
}
