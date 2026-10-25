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
 // Capô simétrico com topo inclinado: a antiga pirâmide girada deixava
 // pontas atravessando a carroceria e a placa frontal.
 const hood=new THREE.BufferGeometry();
 hood.setAttribute('position',new THREE.Float32BufferAttribute([-.8,.4,.5,.8,.4,.5,-.42,.4,1.46,.42,.4,1.46,-.8,.8,.5,.8,.8,.5,-.42,.62,1.46,.42,.62,1.46],3));
 hood.setIndex([4,6,5,5,6,7,2,3,6,3,7,6,0,4,1,1,4,5,0,1,2,1,3,2,0,2,4,2,6,4,1,5,3,3,5,7]);
 const flatHood=hood.toNonIndexed();flatHood.computeVertexNormals();hood.dispose();
 const nose=new THREE.Mesh(flatHood,blue);nose.name='Nose';car.add(nose);
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
 const numberMount=new THREE.Group();numberMount.name='HoodNumber';numberMount.position.set(0,.717,1.03);numberMount.rotation.x=-Math.atan2(1,.18/.96);car.add(numberMount);
 const badge=new THREE.Mesh(new THREE.CircleGeometry(.28,24),white);badge.name='NumberPlate';numberMount.add(badge);
 const ink=toonMaterial('#253047');
 box('Number1',[.045,.28,.012],[-.13,0,.012],ink,numberMount);
 for(const [size,pos] of [[[.04,.28,.012],[.005,0,.012]],[[.04,.28,.012],[.175,0,.012]],[[.21,.04,.012],[.09,.12,.012]],[[.21,.04,.012],[.09,-.12,.012]]])box('Number0',size,pos,ink,numberMount);
 for(const side of [-1,1]){const exhaust=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.26,10),black);exhaust.rotation.x=Math.PI/2;exhaust.position.set(side*.35,.5,-1.51);car.add(exhaust);}
 return cartoonize(car,{outlines:true});
}
