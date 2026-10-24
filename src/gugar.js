import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';

export function createGugar(){
 const root=new THREE.Group();root.name='Driver';root.userData.character='gugar';
 const skin='#b98d76',hairColor='#332824',beard='#654c41',ochre='#d5a14d',ink='#241f26';
 function ell(name,pos,size,color,parent=root){const m=new THREE.Mesh(new THREE.SphereGeometry(1,14,10),toonMaterial(color));m.name=name;m.position.set(...pos);m.scale.set(...size);parent.add(m);return m;}
 function box(name,pos,size,color,parent=root){const m=new THREE.Mesh(new THREE.BoxGeometry(...size),toonMaterial(color));m.name=name;m.position.set(...pos);parent.add(m);return m;}
 ell('SpottedTunic',[0,.29,0],[.39,.38,.27],ochre);
 for(const [x,y,z,s] of [[-.22,.43,.23,.09],[.16,.47,.25,.12],[-.05,.24,.27,.1],[.24,.16,.2,.09],[-.28,.15,.19,.11],[.02,.56,.15,.065]]){const spot=ell('TunicSpot',[x,y,z],[s,s*.85,.025],hairColor);spot.rotation.z=x*4;}
 box('BlueShorts',[0,-.01,.06],[.59,.22,.43],'#087bf0');
 for(const side of [-1,1]){
  ell('Knee',[side*.18,-.13,.21],[.13,.13,.16],skin);ell('BareFoot',[side*.18,-.25,.35],[.14,.09,.22],skin);
  const arm=new THREE.Group();arm.name=side<0?'Arm_L':'Arm_R';arm.position.set(side*.39,.44,.01);root.add(arm);
  ell('Sleeve',[0,-.06,.06],[.14,.17,.13],ochre,arm);ell('Forearm',[0,-.13,.18],[.105,.12,.19],skin,arm);ell('Glove',[0,-.13,.34],[.13,.12,.12],skin,arm);
 }
 ell('Head',[0,.91,0],[.35,.39,.29],skin);ell('Beard',[0,.70,.09],[.34,.26,.27],beard);
 for(const side of [-1,1]){ell('Ear',[side*.35,.92,0],[.08,.12,.08],skin);ell('Cheek',[side*.22,.85,.23],[.14,.15,.10],skin);ell('Eye',[side*.14,1.005,.255],[.105,.075,.045],'#fff8e8');ell('Pupil',[side*.14+.012,1.005,.296],[.04,.045,.019],ink);const brow=box('Brow',[side*.14,1.115,.27],[.24,.065,.045],hairColor);brow.rotation.z=side*.22;}
 ell('Nose',[0,.92,.32],[.12,.14,.15],skin);
 const smile=box('Smile',[0,.76,.322],[.30,.045,.03],ink);smile.rotation.z=-.08;
 box('BigTooth',[.07,.767,.343],[.08,.065,.028],'#fff4d5');
 const hair=new THREE.Group();hair.name='CharacterHair';root.add(hair);
 // Cobertura contínua na nuca, com cachos sobrepostos vistos pela câmera de corrida.
 ell('BackHair',[0,1.035,-.13],[.355,.335,.245],hairColor,hair);
 for(const [x,y,z,r] of [[-.24,1.16,-.22,.20],[0,1.23,-.25,.23],[.24,1.15,-.22,.20],[-.24,.96,-.22,.17],[0,1.00,-.30,.20],[.24,.95,-.22,.17],[-.16,.80,-.18,.14],[.08,.80,-.23,.15],[.25,.82,-.15,.12]])ell('BackCurl',[x,y,z],[r,r*.95,r*.85],hairColor,hair);
 for(const [x,y,z,r] of [[-.29,1.20,.04,.23],[-.12,1.39,-.03,.24],[.15,1.37,-.04,.25],[.33,1.22,-.03,.23],[.03,1.23,.18,.19],[-.31,1.07,-.15,.16],[.32,1.05,-.15,.15]]){const curl=ell('DarkCurl',[x,y,z],[r,r*.95,r*.9],hairColor,hair);curl.rotation.z=x;}
 const clasp=ell('BoneClasp',[.25,.50,.24],[.085,.025,.025],'#fff0d1');clasp.rotation.z=-.3;
 for(const side of [-1,1])ell('BoneClaspEnd',[.25+side*.08,.50-side*.02,.24],[.034,.04,.03],'#fff0d1');
 return root;
}
