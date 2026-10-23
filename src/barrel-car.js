import * as THREE from 'three';
import {cartoonize,toonMaterial} from './cartoon.js';

// Barril de aduelas curvas, rodas de raios e ferragens feitos em geometria.
// +Z é a frente. Os pivôs seguem o mesmo rig dos outros carros.
export function createBarrelCar(){
 const car=new THREE.Group();car.name='BarrelCar';
 const wood=['#80503a','#986347','#ad7753'].map(toonMaterial);
 wood.forEach((m,i)=>m.name=`Paint_Barrel_${i}`);
 const iron=toonMaterial('#879797'),dark=toonMaterial('#394442'),rim=toonMaterial('#6c4433'),cream=toonMaterial('#efd8ad');
 const box=(name,size,pos,material,parent=car)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);parent.add(m);return m;};
 const ball=(name,size,pos,material,parent=car)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),material);m.name=name;m.scale.set(...size);m.position.set(...pos);parent.add(m);return m;};
 box('Chassis',[1.45,.16,2.25],[0,.36,0],dark);
 // A barriga mais larga que as extremidades caracteriza o barril.
 const radius=z=>.60+.18*Math.cos(z/1.08*Math.PI/2);
 for(let stave=0;stave<16;stave++){
  const positions=[],indices=[];
  for(let row=0;row<=8;row++)for(const edge of [0,1]){
   const z=-1.08+row/8*2.16,angle=(stave+(edge?.94:.06))/16*Math.PI*2;
   // A abertura superior deixa o piloto sentado dentro do barril.
   const r=radius(z);positions.push(Math.sin(angle)*r,.92+Math.cos(angle)*r,z);
  }
  for(let row=0;row<8;row++){const a=row*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
  // As duas aduelas de cima viram bordas curtas ao redor do cockpit.
  const top=stave===0||stave===15;
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(top?indices.filter((_,i)=>Math.floor(i/6)<2||Math.floor(i/6)>5):indices);g.computeVertexNormals();
  const material=wood[stave%3];material.side=THREE.DoubleSide;
  const plank=new THREE.Mesh(g,material);plank.name=`BarrelStave_${stave}`;car.add(plank);
 }
 for(const z of [-1.085,1.085]){
  const end=new THREE.Mesh(new THREE.CylinderGeometry(.60,.60,.055,16),wood[1]);end.name=z>0?'BarrelFront':'BarrelRear';end.rotation.x=Math.PI/2;end.position.set(0,.92,z);car.add(end);
  for(const y of [-.3,0,.3])box('EndGrain',[Math.sqrt(.36-y*y)*1.9,.018,.065],[0,.92+y,z],wood[0]);
 }
 for(const z of [-.72,.72]){
  const hoop=new THREE.Mesh(new THREE.CylinderGeometry(radius(z)+.025,radius(z)+.025,.13,24,1,true),iron);hoop.name='MetalHoop';hoop.rotation.x=Math.PI/2;hoop.position.set(0,.92,z);car.add(hoop);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ball('Rivet',[.038,.038,.038],[Math.sin(a)*(radius(z)+.04),.92+Math.cos(a)*(radius(z)+.04),z],dark);}
 }
 box('Seat',[.52,.42,.20],[0,1.18,-.43],dark);
 for(const [label,x,z] of [['FL',-.9,.72],['FR',.9,.72],['BL',-.9,-.72],['BR',.9,-.72]]){
  const steer=new THREE.Group();steer.name=label[0]==='F'?`Steer_${label}`:`Axle_${label}`;steer.position.set(x,.42,z);car.add(steer);
  const roll=new THREE.Group();roll.name=`Roll_${label}`;steer.add(roll);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.35,.065,6,20),rim);wheel.name='WoodenRim';wheel.rotation.y=Math.PI/2;roll.add(wheel);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=box('WoodenSpoke',[.07,.34,.045],[0,Math.cos(a)*.17,Math.sin(a)*.17],wood[1],roll);spoke.rotation.x=a;}
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.1,.1,.20,10),iron);hub.rotation.z=Math.PI/2;roll.add(hub);
 }
 const driver=new THREE.Group();driver.name='Driver';driver.position.set(0,1,-.22);car.add(driver);
 ball('Suit',[.28,.29,.22],[0,.20,0],wood[0],driver);
 ball('Helmet',[.32,.31,.29],[0,.72,0],wood[1],driver);
 box('Visor',[.45,.13,.10],[0,.74,.27],dark,driver);
 for(const side of [-1,1]){
  const tip=ball('CapTip',[.075,.17,.075],[side*.21,1,.01],wood[0],driver);tip.rotation.z=-side*.25;
  const arm=new THREE.Group();arm.name=side<0?'Arm_L':'Arm_R';arm.position.set(side*.32,.37,.02);driver.add(arm);
  box('Sleeve',[.17,.18,.32],[0,-.04,.13],wood[0],arm);ball('Glove',[.09,.09,.09],[0,-.04,.31],cream,arm);
 }
 const steering=new THREE.Mesh(new THREE.TorusGeometry(.22,.035,6,16),dark);steering.name='Steering';steering.rotation.x=-.5;steering.position.set(0,1.36,.37);car.add(steering);
 return cartoonize(car);
}
