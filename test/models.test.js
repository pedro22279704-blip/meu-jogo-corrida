import {driveInput} from './drive-helper.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {bindKart,animateKart} from '../src/kart-animation.js';
import {createRace,stepRace,TRACK_LENGTH} from '../src/race.js';
import {surfaceProfile} from '../src/surface.js';
for(let i=0;i<6;i++)test(`modelo Blender ${i}: articulações e animação`,async()=>{
 const data=await readFile(new URL(`../public/models/kart-${i}.glb`,import.meta.url));
 const gltf=await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'');
 const rig=bindKart(gltf.scene);assert.ok(rig.driver);assert.ok(rig.steering);assert.ok(rig.front.every(Boolean));assert.ok(rig.rolls.every(Boolean));assert.ok(rig.arms.every(Boolean));
 const racer=createRace()[i];racer.speed=20;racer.angle=.4;
 animateKart(rig,racer,.1,1);assert.ok(rig.rolls[0].quaternion.angleTo(rig.rolls[0].userData.rest)>.1);assert.ok(rig.front[0].quaternion.angleTo(rig.front[0].userData.rest)>.1);assert.ok(rig.driver.quaternion.angleTo(rig.driver.userData.rest)>.01);
 racer.finished=true;animateKart(rig,racer,.1,2);assert.ok(rig.arms.every(arm=>arm.quaternion.angleTo(arm.userData.rest)>1));
});
test('relevo e inclinação contínuos na linha de chegada',()=>{const a=surfaceProfile(0),b=surfaceProfile(TRACK_LENGTH);for(const key of ['height','grade','bank'])assert.ok(Math.abs(a[key]-b[key])<1e-10);for(let i=0;i<TRACK_LENGTH;i++){const p=surfaceProfile(i);assert.ok(p.height>=4&&p.height<=16);assert.ok(Math.abs(p.bank)<=.400001);}});
test('subida reduz e descida aumenta velocidade, e corrida completa continua possível',()=>{
 const uphill=[createRace()[0]],downhill=[createRace()[0]];for(const r of [uphill,downhill]){r[0].speed=20;r[0].offset=0;}
 stepRace(uphill,{up:true},.05,0,()=>({grade:.04}));stepRace(downhill,{up:true},.05,0,()=>({grade:-.04}));assert.ok(uphill[0].speed<downhill[0].speed);
 const racers=createRace();for(let i=0;i<20000;i++)stepRace(racers,driveInput(racers[0]),1/60,i/60,surfaceProfile);assert.ok(racers.every(r=>r.finished));
});
