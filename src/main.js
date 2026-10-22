import * as THREE from 'three';
import {GamepadInput} from './gamepad.js';
import {createWorld} from './world.js';
import {PILOTS,COLORS,normalizeSettings,readSettings,writeSettings,recordScope} from './settings.js';
import {createItems,stepItems,ITEM_LABELS} from './items.js';
import {drawMinimap} from './minimap.js';
import {bindKart,animateKart} from './kart-animation.js';
import {RaceAudio} from './audio.js';
import {readBest,saveBest,formatTime} from './records.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createRace,stepRace,orderRacers,lapOf,TRACK_LENGTH,LAPS} from './race.js';
const $=id=>document.getElementById(id);
const audio=new RaceAudio();
const gamepad=new GamepadInput();let padControls=null;
let storage;try{storage=window.localStorage;}catch{storage=null;}
let settings=readSettings(storage);
let best=readBest(storage,recordScope(settings));
$('bestTime').textContent=`Recorde: ${formatTime(best)}`;
$('sound').onclick=()=>{const muted=audio.toggle();$('sound').textContent=muted?'Som: desligado':'Som: ligado';$('sound').setAttribute('aria-pressed',String(muted));};
const scene=new THREE.Scene();scene.background=new THREE.Color('#8ccbd3');scene.fog=new THREE.Fog('#8ccbd3',120,340);
const camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,600);
const renderer=new THREE.WebGLRenderer({antialias:true});renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;$('game').appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight(0xe9ffff,0x4b6441,2.5));const sun=new THREE.DirectionalLight(0xffedbe,3);sun.position.set(60,100,40);scene.add(sun);
let world=createWorld(scene,settings.track);
const track=(distance,offset=0)=>world.track(distance,offset);
const mat=(color)=>new THREE.MeshStandardMaterial({color,roughness:.75});
function mesh(geo,color,parent=scene){const m=new THREE.Mesh(geo,mat(color));parent.add(m);return m;}
const colors=COLORS;
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
// Cada GLB tem hierarquia própria de rodas, braços e piloto.
const loader=new GLTFLoader();
karts.forEach((kart,i)=>loader.load(`${import.meta.env.BASE_URL}models/kart-${i}.glb`,gltf=>{
 for(const child of [...kart.children])if(child!==kart.userData.flame&&child!==kart.userData.bubble)kart.remove(child);
 kart.add(gltf.scene);kart.userData.rig=bindKart(gltf.scene);renderPortrait(gltf.scene,i);
},undefined,error=>console.warn('Usando kart de reserva.',error)));
const sparks=Array.from({length:36},()=>{const p=mesh(new THREE.SphereGeometry(.055,5,4),'#ffce64');p.visible=false;return {mesh:p,life:0,velocity:new THREE.Vector3()};});
let sparkClock=0;
let items=createItems();
let racers=createRace(settings),mode='menu',elapsed=0,count=3,last=performance.now(),visualTime=0,pausedMode=null;const keys={};
// Retratos dos seis modelos: um renderer compartilhado produz imagens estáticas.
const portraitRenderer=new THREE.WebGLRenderer({alpha:true,antialias:true});portraitRenderer.setSize(160,100);portraitRenderer.setPixelRatio(1);
const portraitScene=new THREE.Scene();portraitScene.add(new THREE.HemisphereLight(0xffffff,0x59634a,3));const portraitLight=new THREE.DirectionalLight(0xffedce,3);portraitLight.position.set(3,5,-3);portraitScene.add(portraitLight);
const portraitCamera=new THREE.PerspectiveCamera(38,1.6,.1,30);portraitCamera.position.set(3,2.7,-4.6);portraitCamera.lookAt(0,1,0);
function renderPortrait(model,i){const clone=model.clone(true);portraitScene.add(clone);portraitRenderer.render(portraitScene,portraitCamera);const image=$(`portrait-${i}`);if(image)image.src=portraitRenderer.domElement.toDataURL('image/png');portraitScene.remove(clone);}
for(const [i,name] of PILOTS.entries()){
 const button=document.createElement('button');button.type='button';button.className='pilot-choice';button.dataset.pilot=String(i);button.setAttribute('aria-pressed',String(settings.pilot===i));
 const image=document.createElement('img');image.id=`portrait-${i}`;image.alt=`Kart de ${name}`;const text=document.createElement('span');text.textContent=name;button.append(image,text);button.onclick=()=>{settings.pilot=i;applyMenu();};$('pilotChoices').append(button);
}
$('trackSelect').value=settings.track;$('difficultySelect').value=settings.difficulty;$('sensitivity').value=settings.sensitivity;
function showSettings(){
 $('sensitivityValue').textContent=`${Math.round(settings.sensitivity*100)}%`;
 document.querySelectorAll('.pilot-choice').forEach(button=>button.setAttribute('aria-pressed',String(Number(button.dataset.pilot)===settings.pilot)));
 document.querySelectorAll('.music-volume').forEach(slider=>slider.value=settings.musicVolume);
 document.querySelectorAll('.effects-volume').forEach(slider=>slider.value=settings.effectsVolume);
 audio.setVolumes(settings.musicVolume,settings.effectsVolume);writeSettings(storage,settings);
 best=readBest(storage,recordScope(settings));$('bestTime').textContent=`Recorde nesta pista / dificuldade: ${formatTime(best)}`;
 $('trackName').textContent=$('trackSelect').selectedOptions[0].textContent;
}
function applyMenu(){
 const next=normalizeSettings({...settings,track:$('trackSelect').value,difficulty:$('difficultySelect').value,sensitivity:Number($('sensitivity').value)});
 if(next.track!==settings.track){world.dispose();world=createWorld(scene,next.track);camera.position.copy(world.track(-9).p).add(new THREE.Vector3(0,7,-10));}
 settings=next;racers=createRace(settings);items=createItems();showSettings();
}
$('trackSelect').onchange=applyMenu;$('difficultySelect').onchange=applyMenu;$('sensitivity').oninput=applyMenu;
for(const slider of document.querySelectorAll('.music-volume'))slider.oninput=()=>{settings.musicVolume=Number(slider.value);showSettings();};
for(const slider of document.querySelectorAll('.effects-volume'))slider.oninput=()=>{settings.effectsVolume=Number(slider.value);showSettings();};
function backToMenu(){mode='menu';pausedMode=null;for(const key in keys)delete keys[key];$('pauseMenu').hidden=true;$('result').hidden=true;$('hud').hidden=true;$('pause').hidden=true;$('menu').hidden=false;audio.setPaused(false);applyMenu();}
$('backMenu').onclick=backToMenu;$('resultMenu').onclick=backToMenu;
showSettings();
const itemVisualRoot=new THREE.Group();scene.add(itemVisualRoot);
const capsuleGeometry=new THREE.OctahedronGeometry(.65),capsuleMaterial=mat('#b4fffd');
const capsules=items.boxes.map(()=>{const o=new THREE.Mesh(capsuleGeometry,capsuleMaterial);itemVisualRoot.add(o);return o;});
const bubbles=karts.map(kart=>{const bubble=new THREE.Mesh(new THREE.SphereGeometry(1.6,16,12),new THREE.MeshStandardMaterial({color:'#76dcff',transparent:true,opacity:.24,depthWrite:false}));bubble.position.y=.9;kart.add(bubble);kart.userData.bubble=bubble;return bubble;});
const puddleGeometry=new THREE.CylinderGeometry(1.6,1.6,.06,16),puddleMaterial=mat('#e685cd');
const puddleVisuals=Array.from({length:12},()=>{const o=new THREE.Mesh(puddleGeometry,puddleMaterial);scene.add(o);return o;});
const pulseVisual=new THREE.Mesh(new THREE.TorusGeometry(1,.05,6,40),new THREE.MeshBasicMaterial({color:'#88ffff',transparent:true,opacity:.7}));pulseVisual.rotation.x=Math.PI/2;scene.add(pulseVisual);
function updateItemVisuals(){
 items.boxes.forEach((box,i)=>{const o=capsules[i];o.visible=box.cooldown<=0;const f=track(box.distance,box.offset);o.position.copy(f.p).addScaledVector(f.up,1.2+Math.sin(visualTime*3+i)*.2);o.rotation.y=visualTime;});
 for(const r of racers)bubbles[r.pilot].visible=r.shield>0;
 puddleVisuals.forEach((o,i)=>{const puddle=items.puddles[i];o.visible=!!puddle;if(puddle){const f=track(puddle.distance,puddle.offset);o.position.copy(f.p).addScaledVector(f.up,.1);o.quaternion.copy(f.quaternion);}});
 pulseVisual.visible=!!items.pulse;if(items.pulse){const f=track(items.pulse.distance,items.pulse.offset);pulseVisual.position.copy(f.p).addScaledVector(f.up,.3);pulseVisual.scale.setScalar((.5-items.pulse.life)*40+1);}
}
function unlockAudio(){if(mode!=='menu'&&mode!=='paused'&&!document.hidden&&audio.context?.state==='suspended')audio.context.resume().catch(()=>{});}
addEventListener('pointerdown',unlockAudio);addEventListener('keydown',unlockAudio);
function reset(){pausedMode=null;$('pauseMenu').hidden=true;$('pause').hidden=false;audio.start();racers=createRace(settings);items=createItems();elapsed=0;count=3;mode='countdown';for(const k in keys)delete keys[k];$('menu').hidden=true;$('result').hidden=true;$('hud').hidden=false;}
function pauseRace(){
 if(mode!=='racing'&&mode!=='countdown')return;
 pausedMode=mode;mode='paused';for(const k in keys)delete keys[k];audio.setPaused(true);$('pauseMenu').hidden=false;$('resume').focus();
}
function resumeRace(){
 if(mode!=='paused')return;
 mode=pausedMode;pausedMode=null;last=performance.now();audio.setPaused(false);$('pauseMenu').hidden=true;$('pause').focus();
}
$('pause').onclick=pauseRace;$('resume').onclick=resumeRace;
$('pauseMenu').addEventListener('keydown',e=>{if(e.key==='Tab'){const controls=[...$('pauseMenu').querySelectorAll('button,input')],first=controls[0],last=controls.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
$('play').onclick=reset;$('again').onclick=reset;
addEventListener('keydown',e=>{if(['KeyP','Escape'].includes(e.code)){e.preventDefault();if(!e.repeat){if(mode==='paused')resumeRace();else pauseRace();}return;}if(mode==='paused'||mode==='menu')return;if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','KeyW','KeyA','KeyS','KeyD','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='KeyR'&&mode!=='menu')reset();});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>{for(const k in keys)delete keys[k];});
function input(){
 const left=keys.ArrowLeft||keys.KeyA,right=keys.ArrowRight||keys.KeyD;
 return {up:keys.ArrowUp||keys.KeyW||padControls?.up,down:keys.ArrowDown||keys.KeyS||padControls?.down,steer:left||right?Number(!!left)-Number(!!right):padControls?.steer??0,drift:keys.Space||padControls?.drift,item:keys.KeyE||padControls?.item,boost:keys.ShiftLeft||keys.ShiftRight||padControls?.boost};
}
function handleGamepad(now){
 const state=gamepad.poll(now/1000);padControls=state.controls;
 const status=state.connected?'Controle conectado · RT: acelerar · LT: frear · A/LB: drift · X/RB: nitro · B: item · Start: pausa':state.unsupported?'Controle detectado sem mapeamento padrão. Ative o modo XInput/Xbox no controle.':'Controle: conecte por USB ou Bluetooth e aperte um botão (modo XInput/Xbox).';
 if($('gamepadStatus').textContent!==status)$('gamepadStatus').textContent=status;
 $('gamepadHud').textContent=state.connected?(audio.context?.state==='suspended'&&mode!=='paused'?'🎮 Clique no jogo para ativar o som':'🎮 Controle conectado'):state.disconnected?'Controle desconectado · use o teclado':'';
 if(state.disconnected){padControls=null;pauseRace();return;}
 if(state.changed&&state.connected){const target=mode==='menu'?$('play'):mode==='paused'?$('resume'):mode==='finished'?$('again'):null;target?.focus();}
 if(document.hidden)return;
 if(state.pressed.pause){if(mode==='paused')resumeRace();else if(mode==='menu'||mode==='finished')reset();else pauseRace();return;}
 if(mode!=='menu'&&mode!=='paused'&&mode!=='finished')return;
 const panel=mode==='menu'?$('menu'):mode==='paused'?$('pauseMenu'):$('result');
 const controls=[...panel.querySelectorAll('button,select,input')].filter(e=>!e.disabled&&e.getClientRects().length);
 let focused=controls.includes(document.activeElement)?document.activeElement:controls[0];
 const nav=state.navigation;
 if(nav){
  if(nav.axis==='x'&&(focused.tagName==='SELECT'||focused.type==='range')){
   if(focused.tagName==='SELECT'){focused.selectedIndex=Math.max(0,Math.min(focused.options.length-1,focused.selectedIndex+nav.value));focused.dispatchEvent(new Event('change',{bubbles:true}));}
   else{focused.value=String(Math.max(Number(focused.min),Math.min(Number(focused.max),Number(focused.value)+Number(focused.step||1)*nav.value)));focused.dispatchEvent(new Event('input',{bubbles:true}));}
  }else{const index=Math.max(0,controls.indexOf(focused));focused=controls[(index+nav.value+controls.length)%controls.length];focused.focus();focused.scrollIntoView({block:'nearest'});}
 }
 if(state.pressed.confirm){focused.focus();if(focused.tagName==='BUTTON')focused.click();}
 if(state.pressed.back){if(mode==='paused')resumeRace();else if(mode==='finished')backToMenu();}
}

function list(id,order){$(id).replaceChildren(...order.map(r=>{const li=document.createElement('li');const gap=Math.round(r.distance-racers[0].distance);li.textContent=r.name+(r.finished?' 🏁':r.index===0?'':` · ${Math.abs(gap)} m ${gap>=0?'à frente':'atrás'}`);if(!r.index)li.className='player';return li;}));}
function animate(now){requestAnimationFrame(animate);handleGamepad(now);const dt=document.hidden||mode==='paused'?0:Math.min((now-last)/1000,.05);last=now;visualTime+=dt;
 if(mode==='countdown'){count-=dt;$('countdown').textContent=Math.ceil(count);if(count<=0){mode='racing';$('countdown').textContent='';}}
 if(mode==='racing'){elapsed+=dt;stepRace(racers,input(),dt,elapsed,world.profile);stepItems(racers,items,input(),dt,elapsed);if(racers[0].finished){mode='finished';$('pause').hidden=true;audio.finish();const record=saveBest(storage,racers[0].finishTime,recordScope(settings));best=record.best;$('bestTime').textContent=`Recorde: ${formatTime(best)}`;$('raceTime').textContent=`Tempo: ${formatTime(racers[0].finishTime)}`;$('recordResult').textContent=(record.isNew?'Novo recorde! ':'Recorde: ')+formatTime(best)+(record.saved?'':' · Não foi possível salvar neste navegador.');$('resultTitle').textContent=`${orderRacers(racers).findIndex(r=>r.index===0)+1}º lugar!`;$('result').hidden=false;list('finalRanking',orderRacers(racers));}}
 for(const r of racers){const {p,tangent}=track(r.distance,r.offset);karts[r.pilot].position.copy(p);karts[r.pilot].quaternion.copy(track(r.distance,r.offset).quaternion).multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),r.angle));animateKart(karts[r.pilot].userData.rig,r,dt,visualTime);karts[r.pilot].userData.flame.visible=mode==='racing'&&r.boosting;}
 const drifting=mode==='racing'&&racers[0].drifting;
 sparkClock+=dt;
 if(mode==='racing'&&(drifting||racers[0].speed>15)&&sparkClock>.035){sparkClock=0;for(const side of [-1,1]){const particle=sparks.find(s=>s.life<=0);if(particle){particle.life=.35;particle.mesh.material.color.set(drifting?(racers[0].driftCharge>=.35?'#70edff':'#ffce64'):'#a3b6b9');particle.mesh.position.copy(karts[racers[0].pilot].localToWorld(new THREE.Vector3(side*.95,.15,-.8)));particle.velocity.set((Math.random()-.5)*2,1+Math.random(),(Math.random()-.5)*2);}}}
 for(const s of sparks){s.life-=dt;s.mesh.visible=s.life>0;if(s.life>0){s.mesh.position.addScaledVector(s.velocity,dt);s.velocity.y-=5*dt;s.mesh.scale.setScalar(s.life/.35);}}
 for(const rotor of world.windmills)rotor.rotation.z+=dt*.7;
 const player=racers[0],frame=track(player.distance,player.offset);const desired=frame.p.clone().addScaledVector(frame.tangent,player.boosting?-12.4:-11);desired.y+=6.8;camera.fov+=((player.boosting?69:60)-camera.fov)*(1-Math.exp(-dt*4));camera.updateProjectionMatrix();camera.position.lerp(desired,1-Math.exp(-dt*6));const target=frame.p.clone().addScaledVector(frame.tangent,8);target.y+=1;camera.lookAt(target);
 audio.update(player,mode==='racing'&&!document.hidden,mode==='racing'||mode==='countdown');$('timer').textContent=formatTime(elapsed);$('driftCharge').value=player.driftCharge;
 $('lap').textContent=`VOLTA ${lapOf(player)} / ${LAPS}`;$('place').textContent=`${orderRacers(racers).findIndex(r=>!r.index)+1}º / 6`;$('speed').textContent=Math.round(Math.abs(player.speed)*3.6);$('nitro').value=player.nitro;$('drift').textContent=player.miniTurbo>0?'IMPULSO DO DRIFT!':player.drifting?(player.driftCharge>=.35?'Solte Espaço para ganhar impulso!':'DRIFT! Carregando impulso'):'WASD / setas: dirigir · Espaço: drift · Shift: nitro';const rivals=racers.filter(r=>r.index!==0&&!r.finished).sort((a,b)=>Math.abs(a.distance-player.distance)-Math.abs(b.distance-player.distance));const nearest=rivals[0];$('rivalGap').textContent=nearest?`Rival mais próximo: ${nearest.name} · ${Math.round(Math.abs(nearest.distance-player.distance))} m ${nearest.distance>=player.distance?'à frente':'atrás'}`:'Todos os adversários chegaram';drawMinimap($('minimap'),world.curve,racers);$('itemStatus').textContent=player.item?`${ITEM_LABELS[player.item]} · E para usar`:player.shield>0?'Bolha protetora ativa':'Pegue uma cápsula · E para usar';updateItemVisuals();list('ranking',orderRacers(racers));renderer.render(scene,camera);
}
document.addEventListener('visibilitychange',()=>{last=performance.now();if(document.hidden){pauseRace();for(const k in keys)delete keys[k];audio.update(racers[0],false);}});
camera.position.copy(track(-9).p).add(new THREE.Vector3(0,7,-10));requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
