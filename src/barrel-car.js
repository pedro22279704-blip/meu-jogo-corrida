import * as THREE from 'three';
import {cartoonize,toonMaterial} from './cartoon.js';

// Barril de aduelas curvas, rodas de raios e ferragens feitos em geometria.
// +Z é a frente. Os pivôs seguem o mesmo rig dos outros carros.
export function createBarrelCar(){
 const car=new THREE.Group();car.name='BarrelCar';
 const wood=['#bc743f','#d9904e','#edac65'].map(toonMaterial);
 wood.forEach((m,i)=>m.name=`Paint_Barrel_${i}`);
 const iron=toonMaterial('#8bcbd0'),dark=toonMaterial('#2e4853'),rim=toonMaterial('#8a4f32'),cream=toonMaterial('#fff0be');
 const box=(name,size,pos,material,parent=car)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(...size),material);m.name=name;m.position.set(...pos);parent.add(m);return m;};
 const ball=(name,size,pos,material,parent=car)=>{const m=new THREE.Mesh(new THREE.SphereGeometry(1,20,12),material);m.name=name;m.scale.set(...size);m.position.set(...pos);parent.add(m);return m;};
 // Eixos discretos no lugar da antiga placa preta sob o barril.
 for(const z of [-.72,.72]){const axle=new THREE.Mesh(new THREE.CylinderGeometry(.055,.055,1.8,10),iron);axle.name='WheelAxle';axle.rotation.z=Math.PI/2;axle.position.set(0,.45,z);car.add(axle);}
 // A barriga mais larga que as extremidades caracteriza o barril.
 const radius=z=>.60+.18*Math.cos(z/1.08*Math.PI/2);
 for(let stave=0;stave<16;stave++){
  const positions=[],indices=[];
  for(let row=0;row<=8;row++)for(let edge=0;edge<=4;edge++){
   const z=-1.08+row/8*2.16,angle=(stave+.035+edge/4*.93)/16*Math.PI*2;
   // A abertura superior deixa o piloto sentado dentro do barril.
   const r=radius(z);positions.push(Math.sin(angle)*r,.92+Math.cos(angle)*r,z);
  }
  const top=stave===0||stave===15;
  for(let row=0;row<8;row++)for(let edge=0;edge<4;edge++){if(top&&row>=2&&row<=5)continue;const a=row*5+edge;indices.push(a,a+5,a+1,a+1,a+5,a+6);}
  // As duas aduelas de cima viram bordas curtas ao redor do cockpit.
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();
  const material=wood[stave%3];material.side=THREE.DoubleSide;
  const plank=new THREE.Mesh(g,material);plank.name=`BarrelStave_${stave}`;car.add(plank);
 }
 for(const z of [-1.085,1.085]){
  const end=ball(z>0?'BarrelFront':'BarrelRear',[.60,.60,.10],[0,.92,z],wood[1]);end.userData.cartoonSilhouette=true;
  const lip=new THREE.Mesh(new THREE.TorusGeometry(.585,.045,8,32),wood[0]);lip.name='BarrelLip';lip.position.set(0,.92,z);car.add(lip);
  for(const y of [-.3,0,.3])box('EndGrain',[Math.sqrt(.36-y*y)*1.9,.018,.02],[0,.92+y,z+Math.sign(z)*.09],wood[0]);
 }
 for(const z of [-.72,.72]){
  const hoop=new THREE.Mesh(new THREE.CylinderGeometry(radius(z)+.025,radius(z)+.025,.17,32,1,true),iron);hoop.name='MetalHoop';hoop.rotation.x=Math.PI/2;hoop.position.set(0,.92,z);car.add(hoop);
  for(const edge of [-1,1]){const bead=new THREE.Mesh(new THREE.TorusGeometry(radius(z)+.025,.025,6,32),dark);bead.name='HoopEdge';bead.position.set(0,.92,z+edge*.075);car.add(bead);}
  for(let i=0;i<8;i++){const a=i*Math.PI/4;ball('Rivet',[.052,.052,.052],[Math.sin(a)*(radius(z)+.04),.92+Math.cos(a)*(radius(z)+.04),z],cream);}
 }
 box('Seat',[.52,.42,.20],[0,1.18,-.43],dark);
 for(const [label,x,z] of [['FL',-.9,.72],['FR',.9,.72],['BL',-.9,-.72],['BR',.9,-.72]]){
  const steer=new THREE.Group();steer.name=label[0]==='F'?`Steer_${label}`:`Axle_${label}`;steer.position.set(x,.45,z);car.add(steer);
  const roll=new THREE.Group();roll.name=`Roll_${label}`;steer.add(roll);
  const wheel=new THREE.Mesh(new THREE.TorusGeometry(.33,.085,10,28),rim);wheel.name='WoodenRim';wheel.rotation.y=Math.PI/2;wheel.userData.cartoonSilhouette=true;roll.add(wheel);
  for(let i=0;i<8;i++){const a=i*Math.PI/4;const spoke=box('WoodenSpoke',[.085,.32,.065],[0,Math.cos(a)*.16,Math.sin(a)*.16],wood[2],roll);spoke.rotation.x=a;}
  const hub=ball('WheelHub',[.13,.13,.13],[0,0,0],iron,roll);hub.userData.cartoonSilhouette=true;
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
 return cartoonize(car,{outlines:true});
}
