import {driveInput} from './drive-helper.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TRACKS,createCircuitCurve,trackLength} from '../src/tracks.js';
import {surfaceProfile} from '../src/surface.js';
import {SHORTCUTS} from '../src/shortcuts.js';
import {createRace,stepRace,TRACK_LENGTH} from '../src/race.js';
import {createItems,stepItems} from '../src/items.js';
import {personalityPose} from '../src/pilot-personality.js';
import {addTrackDetails} from '../src/track-details.js';

test('cinco circuitos fechados têm perfil contínuo e atalho válido',()=>{
 assert.equal(Object.keys(TRACKS).length,5);
 for(const id of Object.keys(TRACKS)){const curve=createCircuitCurve(id);assert.ok(curve.getPointAt(0).distanceTo(curve.getPointAt(1))<1e-7);const a=surfaceProfile(0,id),b=surfaceProfile(trackLength(id),id);for(const k of ['height','grade','bank'])assert.ok(Math.abs(a[k]-b[k])<1e-8);assert.ok(SHORTCUTS[id].start<SHORTCUTS[id].end);assert.equal(createRace({track:id})[0].settings.track,id);}
});
test('as nove combinações das três pistas novas completam corridas com itens',()=>{
 for(const track of ['fair','sawmill','night'])for(const difficulty of ['easy','medium','hard']){const race=createRace({track,difficulty,pilot:7}),items=createItems({track});for(let i=0;i<54000&&!race.every(r=>r.finished);i++){stepRace(race,driveInput(race[0]),1/60,i/60,d=>surfaceProfile(d,track));stepItems(race,items,{item:i%180===0},1/60,i/60);}assert.ok(race.every(r=>r.finished),`${track}/${difficulty}`);}
});
test('Olinda, Tico e Juma têm poses diferentes e movimento reduzido mantém pose estável',()=>{
 const racer={pilot:0,finished:true,podiumPlace:1},poses=['olinda','tico','juma'].map(id=>JSON.stringify(personalityPose(racer,1,id)));assert.equal(new Set(poses).size,3);
 for(let pilot=0;pilot<8;pilot++){const r={...racer,pilot};assert.deepEqual(personalityPose(r,1,null,true),personalityPose(r,99,null,true));}
});
test('cenários novos têm decoração fora da pista e modo leve reduz objetos',()=>{
 const frame=(d,offset)=>({p:new THREE.Vector3(offset,0,d),quaternion:new THREE.Quaternion()});
 for(const id of ['fair','sawmill','night']){const root=new THREE.Group(),light=new THREE.Group();const animate=addTrackDetails(root,frame,id,false);addTrackDetails(light,frame,id,true);assert.ok(root.children.length>light.children.length);assert.ok(root.children.every(c=>Math.abs(c.position.x)>=15));animate(1);animate(0);}
});
