import * as THREE from 'three';
import {createGugar} from './gugar.js';
import {toonMaterial} from './cartoon.js';

export const CHARACTERS=[
 {id:'original',name:'Piloto original',bio:'O companheiro de sempre do seu kart.'},
 {id:'gugar',name:'Gugar',bio:'Explorador das cavernas: cabelo rebelde, barba farta e túnica de manchas. Especial: Osso Perseguidor. Começa com um osso; lance com E ou B no controle.'},
 {id:'olinda',name:'Dona Olinda',bio:'Inventora aposentada. Cabelo de nuvem, olhar de quem já venceu e um laço de oficina.'},
 {id:'tico',name:'Tico Rebite',bio:'Mecânico de ideias enormes. Topete de cobre, óculos redondos e sorriso torto.'},
 {id:'juma',name:'Juma Vagalume',bio:'Locutora das madrugadas. Tranças elétricas e sobrancelhas que narram cada curva.'},
];
export const normalizeCharacter=id=>CHARACTERS.some(c=>c.id===id)?id:'original';

// Geometria original em +Y (cima), +Z (frente), compatível com os karts.
export function createCharacter(id){
 if(normalizeCharacter(id)==='original')return null;
 if(id==='gugar')return createGugar();
 const root=new THREE.Group();root.name='Driver';root.userData.character=id;
 const skin=id==='olinda'?'#ba8268':id==='tico'?'#e1ad78':'#79503e';
 const suit=id==='olinda'?'#347c80':id==='tico'?'#eea43a':'#ae64d9';
 const ink='#263144';
 function ell(name,pos,size,color,parent=root){const m=new THREE.Mesh(new THREE.SphereGeometry(1,12,8),toonMaterial(color));m.name=name;m.position.set(...pos);m.scale.set(...size);parent.add(m);return m;}
 function bar(name,pos,size,color,parent=root){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),toonMaterial(color));m.name=name;m.position.set(...pos);parent.add(m);return m;}
 ell('Suit',[0,.25,0],[.34,.36,.24],suit);
 ell('Collar',[0,.53,0],[.23,.08,.24],'#fff1cf');
 ell('Head',[0,.88,0],[id==='olinda'?.33:.29,.38,.27],skin);
 ell('Chin',[.04,.65,.13],[.23,.15,.18],skin);
 ell('Nose',[.025,.88,.29],[.105,.12,id==='olinda'?.20:.12],skin);
 for(const side of [-1,1]){
  ell('Ear',[side*.3,.88,0],[.08,.12,.08],skin);
  ell('Eye',[side*.135,.98,.235],[.105,.075,.046],'#fff8e8');
  ell('Pupil',[side*.135+.018,.98,.278],[.035,.044,.018],ink);
  const brow=bar('Brow',[side*.135,1.085,.26],[.22,.045,.045],ink);brow.rotation.z=side*.22;
  const arm=new THREE.Group();arm.name=side<0?'Arm_L':'Arm_R';arm.position.set(side*.37,.43,.03);root.add(arm);
  ell('Sleeve',[0,-.07,.12],[.11,.13,.23],suit,arm);
  ell('Glove',[0,-.11,.30],[.10,.10,.11],'#fff1cf',arm);
 }
 const mouth=bar('Smile',[.035,.735,.269],[.24,.035,.035],ink);mouth.rotation.z=.13;
 const hair=new THREE.Group();hair.name='CharacterHair';root.add(hair);
 if(id==='olinda'){
  // Nuvem assimétrica de cachos e laço lateral: silhueta própria.
  for(const [x,y,z,s] of [[-.3,1.13,0,.23],[0,1.27,-.04,.29],[.28,1.23,-.03,.24],[.37,1.49,-.09,.26],[.08,1.51,-.1,.23],[-.21,1.38,-.1,.22]])ell('SilverCurl',[x,y,z],[s,s*.85,s*.8],'#bdc7cc',hair);
  for(const side of [-1,1]){const loop=ell('Ribbon',[.37+side*.12,1.32,.14],[.14,.09,.065],'#df4d42',hair);loop.rotation.z=side*.35;}
  ell('RibbonKnot',[.37,1.32,.20],[.065,.065,.05],'#ffab64',hair);
  for(const side of [-1,1])ell('Earring',[side*.34,.76,.04],[.045,.065,.035],'#ffc75c');
 }else if(id==='tico'){
  for(let i=0;i<4;i++){const tuft=ell('CopperTuft',[-.23+i*.13,1.22+i*.035,0],[.11,.19,.19],'#a64f28',hair);tuft.rotation.z=-.45;}
  for(const side of [-1,1]){const rim=new THREE.Mesh(new THREE.TorusGeometry(.12,.025,6,14),toonMaterial('#386d78'));rim.position.set(side*.135,.98,.29);root.add(rim);}
  bar('GlassesBridge',[0,.98,.30],[.07,.025,.025],'#386d78');
  bar('Tooth',[.09,.735,.29],[.06,.055,.02],'#fff8e8');
 }else{
  ell('HairCap',[0,1.15,-.07],[.33,.19,.27],'#273754',hair);
  for(const side of [-1,1])for(let i=0;i<3;i++)ell('Braid',[side*(.32+i*.055),1.03-i*.15,-.02],[.095,.12,.10],i===2?'#69e4bf':'#273754',hair);
  for(const side of [-1,1])ell('Headphone',[side*.34,.98,0],[.09,.14,.14],'#69e4bf');
  ell('Mic',[.23,.76,.32],[.055,.055,.055],ink);
 }
 return root;
}

// Preserva o modelo original para poder alternar sem reconstruir o veículo.
export function setCharacter(model,id){
 id=normalizeCharacter(id);
 const previous=model.children.find(c=>c.userData.character);
 if(previous?.userData.character===id||(!previous&&id==='original'))return false;
 if(previous){model.remove(previous);previous.traverse(p=>{p.geometry?.dispose();p.material?.dispose();});}
 let original;model.traverse(p=>{if(p.name.replace(/[._]?\d+$/,'')==='Driver'&&!p.userData.character)original??=p;});
 if(!original)return false;
 original.visible=id==='original';original.traverse(p=>p.userData.originalCharacter=id!=='original');
 if(id==='original')return true;
 model.updateWorldMatrix(true,true);
 const character=createCharacter(id);
 character.position.copy(model.worldToLocal(original.getWorldPosition(new THREE.Vector3())));
 model.add(character);
 return true;
}

export function animateCharacter(driver,racer,time,reduced=false){
 if(!driver?.userData.character)return;
 const excited=racer.boosting||racer.finished;
 const smile=driver.getObjectByName('Smile');smile.scale.y=racer.hit>0?2.5:excited?1.8:1;
 driver.children.filter(c=>c.name==='Brow').forEach((b,i)=>b.rotation.z=(i?1:-1)*(racer.hit>0?.55:excited?-.12:.22));
 const hair=driver.getObjectByName('CharacterHair'),id=driver.userData.character;
 hair.rotation.z=racer.drifting?-racer.angle*.12:reduced?0:racer.hit>0?Math.sin(time*20)*.16:racer.finished?Math.sin(time*(id==='juma'?5:3))*.08:0;
 hair.rotation.x=racer.boosting?(id==='tico'?-.25:-.14):reduced?0:Math.sin(time*2)*.015;
 const blink=!reduced&&Math.sin(time*.9+(id==='olinda'?1:id==='tico'?2:3))>.997;
 driver.children.filter(c=>c.name==='Eye').forEach(eye=>eye.scale.y=.075*(blink?.15:racer.hit>0?1.35:1));
}
