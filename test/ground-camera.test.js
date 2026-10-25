import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {kartGroundPose} from '../src/kart-grounding.js';
import {ChaseCamera,dampVector} from '../src/chase-camera.js';
import {createTrackSampler} from '../src/track-frame.js';
import {createCircuitCurve,trackLength} from '../src/tracks.js';
import {surfaceProfile} from '../src/surface.js';

function plane(grade=0,bank=0,scale=1){return (d,o=0)=>{
 const p=new THREE.Vector3(o,grade*d*scale+bank*o,d*scale),tangent=new THREE.Vector3(0,grade,1).normalize(),normal=new THREE.Vector3(1,bank,0).normalize(),up=new THREE.Vector3().crossVectors(tangent,normal).normalize();normal.crossVectors(up,tangent).normalize();
 return {p,tangent,normal,up,metersPerUnit:scale,quaternion:new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,up,tangent))};
};}
const kart=(distance=0)=>({distance,offset:0,heading:0,angle:0,boosting:false});
const axes=q=>[new THREE.Vector3(1,0,0),new THREE.Vector3(0,1,0),new THREE.Vector3(0,0,1)].map(v=>v.applyQuaternion(q));

test('apoio acompanha subida e inclinação lateral sem mudar progresso ou posição horizontal',()=>{
 for(const grade of [-.3,0,.3])for(const bank of [-.12,0,.12]){const frameAt=plane(grade,bank),pose=kartGroundPose(frameAt,40,2,.4),frame=frameAt(40,2),expectedUp=new THREE.Vector3(-bank,1,-grade).normalize();
  assert.equal(pose.position.x,frame.p.x);assert.equal(pose.position.z,frame.p.z);assert.ok(Math.abs(pose.position.y-frame.p.y-.045)<1e-8);assert.ok(pose.up.dot(expectedUp)>.999);
  const [right,up,forward]=axes(pose.quaternion);assert.ok(Math.abs(right.dot(forward))<1e-9);assert.ok(up.dot(expectedUp)>.999);assert.ok(up.y>0);
 }
});

test('rotação de drift permanece visível no apoio ao terreno',()=>{
 const frame=plane(),a=kartGroundPose(frame,0,0,.55),b=kartGroundPose(frame,0,0,-.55);
 assert.ok(Math.abs(axes(a.quaternion)[2].x-Math.sin(.55))<1e-9);assert.ok(Math.abs(axes(b.quaternion)[2].x+Math.sin(.55))<1e-9);
});

test('cinco pistas mantêm apoio finito, próximo do piso e sem inversões nas voltas',()=>{
 for(const id of ['valley','harbor','fair','sawmill','night']){
  const length=trackLength(id),sample=createTrackSampler(createCircuitCurve(id),length,d=>surfaceProfile(d,id));
  for(let i=0;i<=100;i++)for(const offset of [-7,0,7]){const d=i*length/100,pose=kartGroundPose(sample,d,offset,.4);assert.ok([...pose.position,...pose.quaternion].every(Number.isFinite));assert.ok(pose.up.y>.7);assert.ok(Math.abs(pose.position.y-sample(d,offset).p.y)<.15,`${id} ${d}`);}
  assert.ok(kartGroundPose(sample,-.001,0).position.distanceTo(kartGroundPose(sample,length-.001,0).position)<1e-7);
 }
});

test('mola converge sem ultrapassar alvo e independe da taxa de quadros',()=>{
 const runs=[30,60,120].map(hz=>{const p=new THREE.Vector3(),v=new THREE.Vector3(),target=new THREE.Vector3(10,4,-8);for(let i=0;i<hz;i++){dampVector(p,v,target,12,1/hz);assert.ok(p.x<=10&&p.x>=0);}return p;});
 assert.ok(runs[0].distanceTo(runs[2])<1e-10);assert.ok(runs[1].distanceTo(new THREE.Vector3(10,4,-8))<.002);
});

test('câmera suaviza a curva e mira a trajetória, sem perseguir o ângulo da traseira',()=>{
 const a=new THREE.PerspectiveCamera(),b=new THREE.PerspectiveCamera(),fa=new ChaseCamera(a),fb=new ChaseCamera(b),r=kart();fa.update(r,plane(),.016);fb.update(r,plane(),.016);
 r.distance=2;r.heading=.8;r.angle=1.3;fa.update(r,plane(),.016);r.angle=-.5;fb.update(r,plane(),.016);
 assert.ok(a.position.distanceTo(b.position)<1e-10);assert.ok(a.quaternion.toArray().every((value,i)=>Math.abs(value-b.quaternion.toArray()[i])<1e-12));assert.ok(fa.direction.x>0&&fa.direction.x<Math.sin(.8));
 assert.ok(fa.look.x>0&&fa.look.x<Math.sin(.8)*10);
});

test('pausa congela câmera e reinício não carrega movimento da corrida anterior',()=>{
 const camera=new THREE.PerspectiveCamera(),follow=new ChaseCamera(camera),r=kart();follow.update(r,plane(),.016);r.distance=20;follow.update(r,plane(),.05);const p=camera.position.clone(),q=camera.quaternion.clone(),fov=camera.fov;
 r.distance=500;follow.update(r,plane(),0);assert.ok(camera.position.equals(p));assert.ok(camera.quaternion.equals(q));assert.equal(camera.fov,fov);
 follow.reset();follow.update(r,plane(),.016);assert.ok(camera.position.z>480);assert.equal(follow.velocity.length(),0);
});

test('câmera respeita parede atrás do kart e mantém horizonte estável',()=>{
 const camera=new THREE.PerspectiveCamera(),follow=new ChaseCamera(camera),wall=new THREE.Mesh(new THREE.BoxGeometry(8,8,.5),new THREE.MeshBasicMaterial());wall.position.set(0,2,-5);
 follow.update(kart(),plane(),.016,{obstacles:[wall]});assert.ok(camera.position.z>-4.75);assert.deepEqual(camera.up.toArray(),[0,1,0]);
});

test('modo de movimento reduzido evita zoom e direção atravessa meia-volta sem travar',()=>{
 const camera=new THREE.PerspectiveCamera(),follow=new ChaseCamera(camera),r=kart();follow.update(r,plane(),.016,{reduced:true});r.boosting=true;r.heading=Math.PI;
 for(let i=0;i<120;i++)follow.update(r,plane(),1/60,{reduced:true});assert.equal(camera.fov,60);assert.ok(follow.direction.z<-.99);assert.ok(Number.isFinite(camera.quaternion.w));
});
