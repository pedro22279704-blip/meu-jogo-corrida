import * as THREE from 'three';
import {cartoonize,toonMaterial} from './cartoon.js';

// Modelo procedural baseado nas vistas frontal, traseira e superior do desenho.
// +Z é a frente; a hierarquia segue o rig dos seis karts originais.
export function createCar10(){
 const car=new THREE.Group();car.name='Car10';
 const blue=toonMaterial('#3808ef');blue.name='Paint_Car10';
 const gray=toonMaterial('#84909c'),black=toonMaterial('#171923'),red=toonMaterial('#ff2635'),white=toonMaterial('#fff8df');
 const box=(name,size,position,material,parent=car)=>{
  const part=new THREE.Mesh(new THREE.BoxGeometry(...size),material);part.name=name;part.position.set(...position);parent.add(part);return part;
 };
 box('Chassis',[1.85,.18,2.9],[0,.32,0],gray);
 box('Body',[1.7,.42,1.75],[0,.59,0],blue);
 // Nariz afilado e escudo frontal largo, como no esboço.
 const nose=new THREE.Mesh(new THREE.CylinderGeometry(.47,.84,.88,4),blue);nose.name='Nose';nose.rotation.x=Math.PI/2;nose.rotation.z=Math.PI/4;nose.scale.z=.5;nose.position.set(0,.57,1.05);car.add(nose);
 box('FrontShield',[2.28,.2,.36],[0,.31,1.57],gray);
 box('Seat',[.68,.82,.26],[0,.88,-.59],black);
 for(const side of [-1,1]){
  box('SidePod',[.28,.32,1.3],[side*.83,.52,-.05],blue);
  box('WingSupport',[.1,.65,.13],[side*.62,.83,-1.22],gray);
 }
 box('RearWing',[2.22,.13,.54],[0,1.19,-1.26],gray);
 for(const side of [-1,1])box('WingEndplate',[.1,.29,.57],[side*1.08,1.22,-1.26],blue);
 for(const [label,x,z] of [['FL',-1.02,.98],['FR',1.02,.98],['BL',-1.02,-.94],['BR',1.02,-.94]]){
  const pivot=new THREE.Group();pivot.name=label[0]==='F'?`Steer_${label}`:`Axle_${label}`;pivot.position.set(x,.4,z);car.add(pivot);
  const roll=new THREE.Group();roll.name=`Roll_${label}`;pivot.add(roll);
  const tire=new THREE.Mesh(new THREE.CylinderGeometry(.4,.4,.4,12),black);tire.rotation.z=Math.PI/2;roll.add(tire);
  const hub=new THREE.Mesh(new THREE.CylinderGeometry(.19,.19,.42,10),gray);hub.rotation.z=Math.PI/2;roll.add(hub);
 }
 const driver=new THREE.Group();driver.name='Driver';driver.position.set(0,.78,-.24);car.add(driver);
 box('Suit',[.58,.54,.43],[0,.25,0],red,driver);
 const helmet=new THREE.Mesh(new THREE.SphereGeometry(.37,12,10),red);helmet.name='Helmet';helmet.position.y=.83;driver.add(helmet);
 box('Visor',[.57,.18,.13],[0,.85,.31],black,driver);
 for(const [s,x] of [['L',-.36],['R',.36]]){const arm=new THREE.Group();arm.name=`Arm_${s}`;arm.position.set(x,.46,.03);driver.add(arm);box('Sleeve',[.19,.2,.48],[0,-.06,.18],red,arm);}
 const steering=new THREE.Mesh(new THREE.TorusGeometry(.23,.045,6,12),black);steering.name='Steering';steering.rotation.x=-.5;steering.position.set(0,1.1,.43);car.add(steering);
 // Placa e algarismos em geometria: não dependem de fonte, canvas ou textura externa.
 const badge=new THREE.Mesh(new THREE.CircleGeometry(.34,24),white);badge.name='NumberPlate';badge.position.set(0,.66,1.51);car.add(badge);
 const ink=toonMaterial('#253047');
 box('Number1',[.055,.36,.018],[-.12,.66,1.525],ink);
 for(const [size,pos] of [[[.055,.36,.018],[.1,.66,1.525]],[[.055,.36,.018],[.28,.66,1.525]],[[.23,.055,.018],[.19,.82,1.525]],[[.23,.055,.018],[.19,.50,1.525]]])box('Number0',size,pos,ink);
 for(const side of [-1,1]){const exhaust=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.26,10),black);exhaust.rotation.x=Math.PI/2;exhaust.position.set(side*.35,.5,-1.51);car.add(exhaust);}
 return cartoonize(car,{outlines:true});
}
