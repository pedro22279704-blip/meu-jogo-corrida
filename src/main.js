import * as THREE from 'three';
import {RaceAudio} from './audio.js';
import {readBest,saveBest,formatTime} from './records.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createRace,stepRace,orderRacers,lapOf,TRACK_LENGTH,LAPS} from './race.js';
const $=id=>document.getElementById(id);
const audio=new RaceAudio();
let storage;try{storage=window.localStorage;}catch{storage=null;}
let best=readBest(storage);
$('bestTime').textContent=`Recorde: ${formatTime(best)}`;
$('sound').onclick=()=>{const muted=audio.toggle();$('sound').textContent=muted?'Som: desligado':'Som: ligado';$('sound').setAttribute('aria-pressed',String(muted));};
const scene=new THREE.Scene();scene.background=new THREE.Color('#8ccbd3');scene.fog=new THREE.Fog('#8ccbd3',120,340);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe9ffff,0x4b6441,2.5));const sun=new THREE.DirectionalLight(0xffedbe,3);sun.position.set(60,100,40);scene.add(sun);
const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.75});
function mesh(geo,color,parent=scene){const m=new THREE.Mesh(geo,mat(color));parent.add(m);return m;}
const ground=mesh(new THREE.PlaneGeometry(2000,2000),'#78a879');ground.rotation.x=-Math.PI/2;ground.position.y=-.15;
const points=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const radius=1+.14*Math.sin(a*3);points.push(new THREE.Vector3(Math.sin(a)*100*radius,0,Math.cos(a)*74*radius));}
const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');const physicalLength=curve.getLength();
function track(distance,offset=0){const t=((distance/TRACK_LENGTH)%1+1)%1;const p=curve.getPointAt(t);const tangent=curve.getTangentAt(t).normalize();const normal=new THREE.Vector3(tangent.z,0,-tangent.x);return {p:p.addScaledVector(normal,offset),tangent,normal};}
function ribbon(width,color,y){const positions=[],indices=[];for(let i=0;i<=500;i++){for(const side of [-1,1]){const {p}=track(i/500*TRACK_LENGTH,side*width/2);positions.push(p.x,y,p.z);}if(i<500){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,color);}
ribbon(16,'#ebd7ac',.01);ribbon(12,'#354b5a',.03);
for(let i=0;i<130;i++){for(const side of [-1,1]){const {p,tangent}=track(i/130*TRACK_LENGTH,side*6.5);const curb=mesh(new THREE.BoxGeometry(.65,.16,physicalLength/130*.8),i%2?'#f4edcf':'#ef806b');curb.position.copy(p);curb.position.y=.1;curb.rotation.y=Math.atan2(tangent.x,tangent.z);}}
// Barreiras contínuas acompanham o limite de colisão dos karts.
const rails=new THREE.InstancedMesh(new THREE.BoxGeometry(.3,.65,physicalLength/200+.12),mat('#ffffff'),400);
const railTransform=new THREE.Object3D();let railIndex=0;
for(let i=0;i<200;i++)for(const side of [-1,1]){const {p,tangent}=track(i/200*TRACK_LENGTH,side*7.65);railTransform.position.copy(p);railTransform.position.y=.55;railTransform.rotation.y=Math.atan2(tangent.x,tangent.z);railTransform.updateMatrix();rails.setMatrixAt(railIndex,railTransform.matrix);rails.setColorAt(railIndex++,new THREE.Color(i%4?'#375e68':'#a9fb59'));}scene.add(rails);
// Marcos do vale: cristais e pequenos moinhos, criados para esta pista.
const windmills=[];
for(let i=0;i<18;i++){
 const {p}=track(i/18*TRACK_LENGTH,(i%2?1:-1)*(24+i%4*5));
 const crystal=mesh(new THREE.OctahedronGeometry(1.4+i%3),'#77d7d3');crystal.position.copy(p);crystal.position.y=2;crystal.scale.y=2;
 if(i%3===0){const base=p.clone().add(new THREE.Vector3(6,0,4));const tower=mesh(new THREE.CylinderGeometry(.5,1.2,9,6),'#e8d3a6');tower.position.copy(base);tower.position.y=4.5;const rotor=new THREE.Group();rotor.position.copy(base);rotor.position.y=8;scene.add(rotor);for(let j=0;j<3;j++){const arm=new THREE.Group();arm.rotation.z=j*Math.PI*2/3;rotor.add(arm);const blade=mesh(new THREE.BoxGeometry(.7,4,.18),'#f5b86d',arm);blade.position.y=2;}windmills.push(rotor);}
}
for(let i=0;i<12;i++){for(let j=0;j<2;j++){const {p,tangent}=track(j*1.5,i-5.5);const tile=mesh(new THREE.BoxGeometry(1,.045,physicalLength/TRACK_LENGTH*1.5),(i+j)%2?'#172b37':'#ffffff');tile.position.copy(p);tile.position.y=.075;tile.rotation.y=Math.atan2(tangent.x,tangent.z);}}
const start=track(0);for(const side of [-1,1]){const pillar=mesh(new THREE.CylinderGeometry(.25,.25,7), '#ffe5a3');pillar.position.copy(start.p).addScaledVector(start.normal,side*8);pillar.position.y=3.5;}
const banner=mesh(new THREE.BoxGeometry(16,1.1,.5),'#a9fb59');banner.position.copy(start.p);banner.position.y=7;banner.rotation.y=Math.atan2(start.tangent.x,start.tangent.z);
// Árvores e cristais usam posições determinísticas para manter o vale original.
for(let i=0;i<110;i++){const d=i/110*TRACK_LENGTH;const side=i%2?1:-1;const {p}=track(d,side*(18+(i*17%31)));const tree=new THREE.Group();scene.add(tree);tree.position.copy(p);const trunk=mesh(new THREE.CylinderGeometry(.35,.5,3,6),'#76634b',tree);trunk.position.y=1.5;const crown=mesh(new THREE.ConeGeometry(2.4+(i%3)*.4,7,6),i%3?'#366c62':'#4b8571',tree);crown.position.y=5;}
const colors=['#b4ff5c','#f8829d','#ffc15a','#9b8dff','#5bdddf','#ff9166'];
const karts=colors.map(color=>{const g=new THREE.Group();scene.add(g);const body=mesh(new THREE.BoxGeometry(1.65,.5,2.4),color,g);body.position.y=.65;const nose=mesh(new THREE.BoxGeometry(1.8,.3,.5),color,g);nose.position.set(0,.45,1.2);const seat=mesh(new THREE.BoxGeometry(.8,.8,.5),'#253947',g);seat.position.set(0,1,-.5);const head=mesh(new THREE.SphereGeometry(.44,16,12),color,g);head.position.set(0,1.55,-.15);const visor=mesh(new THREE.BoxGeometry(.65,.17,.15),'#142735',g);visor.position.set(0,1.58,.23);for(const x of [-.94,.94])for(const z of [-.8,.8]){const wheel=mesh(new THREE.CylinderGeometry(.38,.38,.3,12),'#172a35',g);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.38,z);}const flame=mesh(new THREE.ConeGeometry(.35,1.5,8),'#78edff',g);flame.rotation.x=-Math.PI/2;flame.position.set(0,.55,-1.8);flame.visible=false;g.userData.flame=flame;return g;});
function personalize(kart,i){
 const details=new THREE.Group();details.name='personality';kart.add(details);
 const accent=['#ffffff','#fff17d','#53d0c7','#ff91c4','#d3a7ff','#fff0ae'][i];
 // Silhuetas de capacetes e acessórios próprios para cada piloto.
 for(let j=0;j<=i%3;j++){const fin=mesh(new THREE.BoxGeometry(.1,.18+(i%3)*.08,.5),accent,details);fin.position.set((j-i%3/2)*.19,2.04,-.04);}
 if(i%2){const spoiler=mesh(new THREE.BoxGeometry(1.8,.12,.5),accent,details);spoiler.position.set(0,1.05,-1.2);for(const x of [-.6,.6]){const post=mesh(new THREE.BoxGeometry(.1,.5,.1),'#283f4b',details);post.position.set(x,.8,-1.2);}}
 else{for(const x of [-.72,.72]){const pod=mesh(new THREE.BoxGeometry(.22,.3,1.2),accent,details);pod.position.set(x,.65,0);}}
 const plate=mesh(new THREE.BoxGeometry(.5,.25,.08),accent,details);plate.position.set(0,.65,-1.24);
}
karts.forEach(personalize);
// O modelo Blender substitui a geometria de reserva após carregar.
new GLTFLoader().load(`${import.meta.env.BASE_URL}models/vale-kart.glb`,gltf=>{
 karts.forEach((kart,i)=>{
  const model=gltf.scene.clone(true);
  model.traverse(part=>{if(part.isMesh){part.material=part.material.clone();if(part.material.name==='Paint')part.material.color.set(colors[i]);}});
  for(const child of [...kart.children])if(child!==kart.userData.flame)kart.remove(child);
  model.scale.set(1+(i%3)*.015,1,1-(i%2)*.025);kart.add(model);personalize(kart,i);
 });
},undefined,error=>console.warn('Modelo indisponível; usando kart de reserva.',error));
const sparks=Array.from({length:36},()=>{const p=mesh(new THREE.SphereGeometry(.055,5,4),'#ffce64');p.visible=false;return {mesh:p,life:0,velocity:new THREE.Vector3()};});
let sparkClock=0;
let racers=createRace(),mode='menu',elapsed=0,count=3,last=performance.now();const keys={};
function reset(){audio.start();racers=createRace();elapsed=0;count=3;mode='countdown';for(const k in keys)delete keys[k];$('menu').hidden=true;$('result').hidden=true;$('hud').hidden=false;}
$('play').onclick=reset;$('again').onclick=reset;
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='KeyR'&&mode!=='menu')reset();});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>{for(const k in keys)delete keys[k];});
function input(){return {up:keys.ArrowUp||keys.KeyW,down:keys.ArrowDown||keys.KeyS,left:keys.ArrowLeft||keys.KeyA,right:keys.ArrowRight||keys.KeyD,drift:keys.Space,boost:keys.ShiftLeft||keys.ShiftRight};}
function list(id,order){$(id).replaceChildren(...order.map(r=>{const li=document.createElement('li');li.textContent=r.name+(r.finished?' 🏁':'');if(!r.index)li.className='player';return li;}));}
function animate(now){requestAnimationFrame(animate);const dt=document.hidden?0:Math.min((now-last)/1000,.05);last=now;
 if(mode==='countdown'){count-=dt;$('countdown').textContent=Math.ceil(count);if(count<=0){mode='racing';$('countdown').textContent='';}}
 if(mode==='racing'){elapsed+=dt;stepRace(racers,input(),dt,elapsed);if(racers[0].finished){mode='finished';audio.finish();const record=saveBest(storage,racers[0].finishTime);best=record.best;$('bestTime').textContent=`Recorde: ${formatTime(best)}`;$('raceTime').textContent=`Tempo: ${formatTime(racers[0].finishTime)}`;$('recordResult').textContent=(record.isNew?'Novo recorde! ':'Recorde: ')+formatTime(best)+(record.saved?'':' · Não foi possível salvar neste navegador.');$('resultTitle').textContent=`${orderRacers(racers).findIndex(r=>r.index===0)+1}º lugar!`;$('result').hidden=false;list('finalRanking',orderRacers(racers));}}
 for(const r of racers){const {p,tangent}=track(r.distance,r.offset);karts[r.index].position.copy(p);karts[r.index].rotation.y=Math.atan2(tangent.x,tangent.z)+r.angle;karts[r.index].userData.flame.visible=mode==='racing'&&r.boosting;}
 const drifting=mode==='racing'&&racers[0].drifting;
 sparkClock+=dt;
 if(mode==='racing'&&(drifting||racers[0].speed>15)&&sparkClock>.035){sparkClock=0;for(const side of [-1,1]){const particle=sparks.find(s=>s.life<=0);if(particle){particle.life=.35;particle.mesh.material.color.set(drifting?(racers[0].driftCharge>=.35?'#70edff':'#ffce64'):'#a3b6b9');particle.mesh.position.copy(karts[0].localToWorld(new THREE.Vector3(side*.95,.15,-.8)));particle.velocity.set((Math.random()-.5)*2,1+Math.random(),(Math.random()-.5)*2);}}}
 for(const s of sparks){s.life-=dt;s.mesh.visible=s.life>0;if(s.life>0){s.mesh.position.addScaledVector(s.velocity,dt);s.velocity.y-=5*dt;s.mesh.scale.setScalar(s.life/.35);}}
 for(const rotor of windmills)rotor.rotation.z+=dt*.7;
 const player=racers[0],frame=track(player.distance,player.offset);const desired=frame.p.clone().addScaledVector(frame.tangent,player.boosting?-12.4:-11);desired.y=6.8;camera.fov+=((player.boosting?69:60)-camera.fov)*(1-Math.exp(-dt*4));camera.updateProjectionMatrix();camera.position.lerp(desired,1-Math.exp(-dt*6));const target=frame.p.clone().addScaledVector(frame.tangent,8);target.y=1;camera.lookAt(target);
 audio.update(player,mode==='racing'&&!document.hidden);$('timer').textContent=formatTime(elapsed);$('driftCharge').value=player.driftCharge;
 $('lap').textContent=`VOLTA ${lapOf(player)} / ${LAPS}`;$('place').textContent=`${orderRacers(racers).findIndex(r=>!r.index)+1}º / 6`;$('speed').textContent=Math.round(Math.abs(player.speed)*3.6);$('nitro').value=player.nitro;$('drift').textContent=player.miniTurbo>0?'IMPULSO DO DRIFT!':player.drifting?(player.driftCharge>=.35?'Solte Espaço para ganhar impulso!':'DRIFT! Carregando impulso'):'WASD / setas: dirigir · Espaço: drift · Shift: nitro';list('ranking',orderRacers(racers));renderer.render(scene,camera);
}
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){for(const k in keys)delete keys[k];audio.update(racers[0],false);}});
camera.position.copy(track(-9).p).add(new THREE.Vector3(0,7,-10));requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
