import * as THREE from 'three';
import {createArcadeCourse} from './arcade-race.js';

export class ArcadeVisuals{
 constructor(scene){this.root=new THREE.Group();scene.add(this.root);}
 reset(track,frame){
  this.clear();this.course=createArcadeCourse(track);this.frame=frame;
  const coinGeo=new THREE.CylinderGeometry(.44,.44,.12,14),coinMaterial=new THREE.MeshStandardMaterial({color:'#ffce42',metalness:.35,roughness:.4});coinGeo.rotateX(Math.PI/2);
  this.coins=new THREE.InstancedMesh(coinGeo,coinMaterial,this.course.coins.length);this.root.add(this.coins);
  const padMaterial=new THREE.MeshBasicMaterial({color:'#f8b84c'});
  for(const pad of this.course.pads){const f=frame(pad.distance);const g=new THREE.Group();g.position.copy(f.p);g.quaternion.copy(f.quaternion);this.root.add(g);const plate=new THREE.Mesh(new THREE.BoxGeometry(15,.06,5),padMaterial);plate.position.y=.12;g.add(plate);for(let i=0;i<4;i++)for(const side of [-1,1]){const arrow=new THREE.Mesh(new THREE.BoxGeometry(.24,.03,1.5),new THREE.MeshBasicMaterial({color:'#fff6b8'}));arrow.position.set(side*.45+(i-1.5)*3.1,.17,0);arrow.rotation.y=side*.7;g.add(arrow);}}
 }
 clear(){this.root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});this.root.clear();}
 update(time,reduced){if(!this.coins)return;const transform=new THREE.Object3D();this.course.coins.forEach((coin,i)=>{const f=this.frame(coin.distance,coin.offset);transform.position.copy(f.p).addScaledVector(f.up,1.1+(reduced?0:Math.sin(time*3+i)*.1));transform.quaternion.copy(f.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),reduced?0:time*2+i));transform.scale.setScalar(coin.cooldown>0?0:1);transform.updateMatrix();this.coins.setMatrixAt(i,transform.matrix);});this.coins.instanceMatrix.needsUpdate=true;}
}
