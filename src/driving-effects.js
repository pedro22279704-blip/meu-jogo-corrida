import * as THREE from 'three';
export class DrivingEffects{
 constructor(scene){this.clock=0;this.cursor=0;this.root=new THREE.Group();scene.add(this.root);const geo=new THREE.PlaneGeometry(.18,1);this.marks=Array.from({length:160},()=>{const mesh=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({color:'#33404b',transparent:true,opacity:0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3}));this.root.add(mesh);return {mesh,life:0};});const dustGeo=new THREE.SphereGeometry(.16,5,4);this.dust=Array.from({length:24},()=>{const mesh=new THREE.Mesh(dustGeo,new THREE.MeshBasicMaterial({color:'#d9bc8d',transparent:true,depthWrite:false}));this.root.add(mesh);return {mesh,life:0};});this.clear();}
 clear(){this.clock=0;for(const p of [...this.marks,...this.dust]){p.life=0;p.mesh.visible=false;}}
 update(r,frame,dt,{active=false,light=false,reduced=false}={}){
 if(dt<=0)return;
 for(const p of this.marks){p.life=Math.max(0,p.life-dt);p.mesh.visible=p.life>0;p.mesh.material.opacity=Math.min(.42,p.life*.18);}
 for(const p of this.dust){p.life=Math.max(0,p.life-dt);p.mesh.visible=p.life>0;if(p.life>0){p.mesh.position.y+=dt*.6;p.mesh.scale.setScalar(1+(.6-p.life)*3);p.mesh.material.opacity=p.life*.65;}}
 this.clock+=dt;if(!active||r.speed<10||this.clock<(light||reduced?.16:.07))return;this.clock=0;
 for(const side of [-1,1]){
 const f=frame(r.distance-.8,r.offset+side*.88);
 if(r.drifting){const p=this.marks[this.cursor++%(light?64:160)];p.life=5;p.mesh.visible=true;p.mesh.position.copy(f.p).addScaledVector(f.up,.055);p.mesh.quaternion.copy(f.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1,0,0),-Math.PI/2));p.mesh.scale.y=Math.max(.7,r.speed*(light||reduced?.18:.085));}
 // A faixa de terra é a margem externa, além do asfalto.
 if(Math.abs(r.offset)>5.4&&!reduced){const p=this.dust.find(p=>p.life<=0);if(p){p.life=.6;p.mesh.visible=true;p.mesh.position.copy(f.p).addScaledVector(f.up,.25);}}
 }
 }
}
