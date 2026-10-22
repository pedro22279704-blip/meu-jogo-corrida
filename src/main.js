import * as THREE from 'three';
import {createRace,stepRace,orderRacers,lapOf,TRACK_LENGTH,LAPS} from './race.js';
const $=id=>document.getElementById(id);
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
for(let i=0;i<12;i++){for(let j=0;j<2;j++){const {p,tangent}=track(j*1.5,i-5.5);const tile=mesh(new THREE.BoxGeometry(1,.045,physicalLength/TRACK_LENGTH*1.5),(i+j)%2?'#172b37':'#ffffff');tile.position.copy(p);tile.position.y=.075;tile.rotation.y=Math.atan2(tangent.x,tangent.z);}}
const start=track(0);for(const side of [-1,1]){const pillar=mesh(new THREE.CylinderGeometry(.25,.25,7), '#ffe5a3');pillar.position.copy(start.p).addScaledVector(start.normal,side*8);pillar.position.y=3.5;}
const banner=mesh(new THREE.BoxGeometry(16,1.1,.5),'#a9fb59');banner.position.copy(start.p);banner.position.y=7;banner.rotation.y=Math.atan2(start.tangent.x,start.tangent.z);
// Árvores e cristais usam posições determinísticas para manter o vale original.
for(let i=0;i<110;i++){const d=i/110*TRACK_LENGTH;const side=i%2?1:-1;const {p}=track(d,side*(18+(i*17%31)));const tree=new THREE.Group();scene.add(tree);tree.position.copy(p);const trunk=mesh(new THREE.CylinderGeometry(.35,.5,3,6),'#76634b',tree);trunk.position.y=1.5;const crown=mesh(new THREE.ConeGeometry(2.4+(i%3)*.4,7,6),i%3?'#366c62':'#4b8571',tree);crown.position.y=5;}
const colors=['#b4ff5c','#f8829d','#ffc15a','#9b8dff','#5bdddf','#ff9166'];
const karts=colors.map(color=>{const g=new THREE.Group();scene.add(g);const body=mesh(new THREE.BoxGeometry(1.65,.5,2.4),color,g);body.position.y=.65;const nose=mesh(new THREE.BoxGeometry(1.8,.3,.5),color,g);nose.position.set(0,.45,1.2);const seat=mesh(new THREE.BoxGeometry(.8,.8,.5),'#253947',g);seat.position.set(0,1,-.5);const head=mesh(new THREE.SphereGeometry(.44,16,12),color,g);head.position.set(0,1.55,-.15);const visor=mesh(new THREE.BoxGeometry(.65,.17,.15),'#142735',g);visor.position.set(0,1.58,.23);for(const x of [-.94,.94])for(const z of [-.8,.8]){const wheel=mesh(new THREE.CylinderGeometry(.38,.38,.3,12),'#172a35',g);wheel.rotation.z=Math.PI/2;wheel.position.set(x,.38,z);}const flame=mesh(new THREE.ConeGeometry(.35,1.5,8),'#78edff',g);flame.rotation.x=-Math.PI/2;flame.position.set(0,.55,-1.8);flame.visible=false;g.userData.flame=flame;return g;});
let racers=createRace(),mode='menu',elapsed=0,count=3,last=performance.now();const keys={};
function reset(){racers=createRace();elapsed=0;count=3;mode='countdown';for(const k in keys)delete keys[k];$('menu').hidden=true;$('result').hidden=true;$('hud').hidden=false;}
$('play').onclick=reset;$('again').onclick=reset;
addEventListener('keydown',e=>{if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault();keys[e.code]=true;if(e.code==='KeyR'&&mode!=='menu')reset();});addEventListener('keyup',e=>keys[e.code]=false);addEventListener('blur',()=>{for(const k in keys)delete keys[k];});
function input(){return {up:keys.ArrowUp,down:keys.ArrowDown,left:keys.ArrowLeft,right:keys.ArrowRight,drift:keys.Space,boost:keys.ShiftLeft||keys.ShiftRight};}
function list(id,order){$(id).replaceChildren(...order.map(r=>{const li=document.createElement('li');li.textContent=r.name+(r.finished?' 🏁':'');if(!r.index)li.className='player';return li;}));}
function animate(now){requestAnimationFrame(animate);const dt=Math.min((now-last)/1000,.05);last=now;
 if(mode==='countdown'){count-=dt;$('countdown').textContent=Math.ceil(count);if(count<=0){mode='racing';$('countdown').textContent='';}}
 if(mode==='racing'){elapsed+=dt;stepRace(racers,input(),dt,elapsed);if(racers[0].finished){mode='finished';$('resultTitle').textContent=`${orderRacers(racers).findIndex(r=>r.index===0)+1}º lugar!`;$('result').hidden=false;list('finalRanking',orderRacers(racers));}}
 for(const r of racers){const {p,tangent}=track(r.distance,r.offset);karts[r.index].position.copy(p);karts[r.index].rotation.y=Math.atan2(tangent.x,tangent.z)+r.angle;karts[r.index].userData.flame.visible=mode==='racing'&&r.index===0&&input().boost&&input().up&&r.nitro>1;}
 const player=racers[0],frame=track(player.distance,player.offset);const desired=frame.p.clone().addScaledVector(frame.tangent,-11);desired.y=6.8;camera.position.lerp(desired,1-Math.exp(-dt*6));const target=frame.p.clone().addScaledVector(frame.tangent,8);target.y=1;camera.lookAt(target);
 $('lap').textContent=`VOLTA ${lapOf(player)} / ${LAPS}`;$('place').textContent=`${orderRacers(racers).findIndex(r=>!r.index)+1}º / 6`;$('speed').textContent=Math.round(Math.abs(player.speed)*3.6);$('nitro').value=player.nitro;$('drift').textContent=player.drifting?'DRIFT! Recarregando nitro':'Setas: dirigir · Espaço: drift · Shift: nitro';list('ranking',orderRacers(racers));renderer.render(scene,camera);
}
camera.position.copy(track(-9).p).add(new THREE.Vector3(0,7,-10));requestAnimationFrame(animate);
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);});
