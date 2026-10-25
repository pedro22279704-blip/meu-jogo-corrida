import * as THREE from 'three';
import {createArcadeCourse} from './arcade-race.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {bindCoinPositions,COIN_HEIGHT} from './coin-collection.js';
import {CoinEffects} from './coin-effects.js';

export class ArcadeVisuals{
 constructor(scene){this.root=new THREE.Group();scene.add(this.root);}
 reset(track,frame){
  this.clear();this.course=createArcadeCourse(track);this.frame=frame;
  this.frames=bindCoinPositions(this.course,frame);
  const coinGeo=new THREE.CylinderGeometry(.49,.49,.14,18),coinMaterial=new THREE.MeshStandardMaterial({color:'#ffc52d',metalness:.7,roughness:.26,emissive:'#855014',emissiveIntensity:.14});coinGeo.rotateX(Math.PI/2);
  this.coins=new THREE.InstancedMesh(coinGeo,coinMaterial,this.course.coins.length);this.root.add(this.coins);
  const ring=new THREE.TorusGeometry(.37,.045,4,12),front=ring.clone().translate(0,0,.085),back=ring.clone().translate(0,0,-.085),ringGeo=mergeGeometries([front,back]);ring.dispose();front.dispose();back.dispose();
  this.rims=new THREE.InstancedMesh(ringGeo,new THREE.MeshStandardMaterial({color:'#fff0a4',metalness:.55,roughness:.25}),this.course.coins.length);this.root.add(this.rims);
  const emblem=new THREE.OctahedronGeometry(.18,0);emblem.scale(.75,1.25,.12);const face=emblem.clone().translate(0,0,.09),reverse=emblem.clone().translate(0,0,-.09),emblemGeo=mergeGeometries([face,reverse]);emblem.dispose();face.dispose();reverse.dispose();
  this.emblems=new THREE.InstancedMesh(emblemGeo,new THREE.MeshBasicMaterial({color:'#fff4bd'}),this.course.coins.length);this.root.add(this.emblems);this.effects=new CoinEffects(this.root);this.transform=new THREE.Object3D();this.spin=new THREE.Quaternion();this.upAxis=new THREE.Vector3(0,1,0);
  const padMaterial=new THREE.MeshBasicMaterial({color:'#f8b84c'});
  for(const pad of this.course.pads){const f=frame(pad.distance);const g=new THREE.Group();g.position.copy(f.p);g.quaternion.copy(f.quaternion);this.root.add(g);const plate=new THREE.Mesh(new THREE.BoxGeometry(15,.06,5),padMaterial);plate.position.y=.12;g.add(plate);for(let i=0;i<4;i++)for(const side of [-1,1]){const arrow=new THREE.Mesh(new THREE.BoxGeometry(.24,.03,1.5),new THREE.MeshBasicMaterial({color:'#fff6b8'}));arrow.position.set(side*.45+(i-1.5)*3.1,.17,0);arrow.rotation.y=side*.7;g.add(arrow);}}
 }
 clear(){const geometries=new Set(),materials=new Set();this.root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])materials.add(m);if(o.isInstancedMesh)o.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());this.root.clear();this.coins=null;this.rims=null;this.emblems=null;this.effects=null;this.frames=[];this.course=null;}
 update(time,reduced,dt=0,{light=false}={}){
  if(!this.coins)return;const transform=this.transform;
  for(const event of this.course.coinEvents??[]){if(event.racer!==0)continue;const f=this.frames[event.coinIndex],position=f.p.clone().addScaledVector(f.up,COIN_HEIGHT+(reduced?0:Math.sin(time*3+event.coinIndex)*.1));this.effects.burst(position,{light,reduced});}
  if(this.course.coinEvents)this.course.coinEvents.length=0;this.effects.update(dt);this.rims.visible=!light;
  this.course.coins.forEach((coin,i)=>{const f=this.frames[i];transform.position.copy(f.p).addScaledVector(f.up,COIN_HEIGHT+(reduced?0:Math.sin(time*3+i)*.1));transform.quaternion.copy(f.quaternion).multiply(this.spin.setFromAxisAngle(this.upAxis,reduced?0:time*2+i));transform.scale.setScalar(coin.cooldown>0?0:1);transform.updateMatrix();for(const mesh of [this.coins,this.rims,this.emblems])mesh.setMatrixAt(i,transform.matrix);});
  for(const mesh of [this.coins,this.rims,this.emblems])mesh.instanceMatrix.needsUpdate=true;
 }
}
