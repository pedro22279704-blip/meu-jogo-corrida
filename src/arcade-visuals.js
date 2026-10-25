import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
import {createArcadeCourse,flightHeight} from './arcade-race.js';

export function createGlider(){
 const group=new THREE.Group();group.name='NeonGlider';const sail=new THREE.BufferGeometry();sail.setAttribute('position',new THREE.Float32BufferAttribute([-3,0,-.4,0,.55,.75,0,0,-.9,0,.55,.75,3,0,-.4,0,0,-.9],3));sail.computeVertexNormals();const material=toonMaterial('#65e9d5');material.side=THREE.DoubleSide;group.add(new THREE.Mesh(sail,material));
 const emblem=new THREE.Mesh(new THREE.BoxGeometry(.55,.04,.75),toonMaterial('#ffcc66'));emblem.position.set(0,.57,.2);group.add(emblem);
 const spar=new THREE.Mesh(new THREE.BoxGeometry(5.9,.07,.08),toonMaterial('#f2d77a'));spar.position.z=-.4;group.add(spar);
 for(const side of [-1,1]){const mast=new THREE.Mesh(new THREE.CylinderGeometry(.035,.035,1.7,5),toonMaterial('#dce9f2'));mast.position.set(side*.7,-.8,0);mast.rotation.z=side*.27;group.add(mast);}
 group.position.y=3;group.visible=false;return group;
}
export class ArcadeVisuals{
 constructor(scene){this.root=new THREE.Group();scene.add(this.root);this.gliders=[];}
 reset(track,frame){
  this.clear();this.course=createArcadeCourse(track);this.frame=frame;
  const coinGeo=new THREE.CylinderGeometry(.44,.44,.12,14),coinMaterial=new THREE.MeshStandardMaterial({color:'#ffce42',metalness:.35,roughness:.4});coinGeo.rotateX(Math.PI/2);
  this.coins=new THREE.InstancedMesh(coinGeo,coinMaterial,this.course.coins.length);this.root.add(this.coins);
  const padMaterial=new THREE.MeshBasicMaterial({color:'#f8b84c'}),rampMaterial=toonMaterial('#2695a9');
  for(const pad of this.course.pads){const f=frame(pad.distance);const g=new THREE.Group();g.position.copy(f.p);g.quaternion.copy(f.quaternion);this.root.add(g);const plate=new THREE.Mesh(new THREE.BoxGeometry(15,.06,5),padMaterial);plate.position.y=.12;g.add(plate);for(let i=0;i<4;i++)for(const side of [-1,1]){const arrow=new THREE.Mesh(new THREE.BoxGeometry(.24,.03,1.5),new THREE.MeshBasicMaterial({color:'#fff6b8'}));arrow.position.set(side*.45+(i-1.5)*3.1,.17,0);arrow.rotation.y=side*.7;g.add(arrow);}}
  for(const ramp of this.course.ramps){const f=frame(ramp.distance-3),g=new THREE.Group();g.position.copy(f.p);g.quaternion.copy(f.quaternion);this.root.add(g);const shape=new THREE.BufferGeometry();shape.setAttribute('position',new THREE.Float32BufferAttribute([-7.8,.1,-3,7.8,.1,-3,-7.8,.85,3,7.8,.1,-3,7.8,.85,3,-7.8,.85,3],3));shape.computeVertexNormals();g.add(new THREE.Mesh(shape,rampMaterial));for(const side of [-1,1]){const lamp=new THREE.Mesh(new THREE.BoxGeometry(.18,1.7,.3),new THREE.MeshBasicMaterial({color:ramp.kind==='glide'?'#8dfff0':'#fff5aa'}));lamp.position.set(side*8,1,2.7);g.add(lamp);}}
 }
 clear(){this.root.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});this.root.clear();}
 update(time,reduced){if(!this.coins)return;const transform=new THREE.Object3D();this.course.coins.forEach((coin,i)=>{const f=this.frame(coin.distance,coin.offset);transform.position.copy(f.p).addScaledVector(f.up,1.1+(reduced?0:Math.sin(time*3+i)*.1));transform.quaternion.copy(f.quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),reduced?0:time*2+i));transform.scale.setScalar(coin.cooldown>0?0:1);transform.updateMatrix();this.coins.setMatrixAt(i,transform.matrix);});this.coins.instanceMatrix.needsUpdate=true;}
 kart(kart,r,frame,reduced){
  if(!kart.userData.glider){kart.userData.glider=createGlider();kart.add(kart.userData.glider);}
  const glider=kart.userData.glider;glider.visible=r.airTime>0&&r.airKind==='glide';
  kart.position.addScaledVector(frame.up,flightHeight(r));if(glider.visible&&!reduced)glider.rotation.z=-r.angle*.3;
  if(r.trickTimer>0&&!reduced)kart.rotateZ((1-r.trickTimer/.65)*Math.PI*2);
 }
}
