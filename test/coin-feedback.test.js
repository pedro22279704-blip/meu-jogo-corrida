import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRace} from '../src/race.js';
import {createArcadeCourse,stepArcade} from '../src/arcade-race.js';
import {segmentDistanceSquared,bindCoinPositions} from '../src/coin-collection.js';
import {ArcadeVisuals} from '../src/arcade-visuals.js';
import {CoinEffects} from '../src/coin-effects.js';
import {createCircuitCurve,trackLength} from '../src/tracks.js';
import {createTrackSampler} from '../src/track-frame.js';
import {surfaceProfile} from '../src/surface.js';

const flat=(d,o=0)=>({p:new THREE.Vector3(o,0,d),up:new THREE.Vector3(0,1,0),quaternion:new THREE.Quaternion()});
function setup(){const r=createRace()[0],course=createArcadeCourse('valley');course.coins=[{distance:38,offset:0,cooldown:0}];Object.assign(r,{distance:38,arcadeDistance:37,offset:0,speed:30});return {r,course};}

test('distância ao segmento é finita com kart parado e detecta passagem intermediária',()=>{
 const a={x:0,y:0,z:0},b={x:0,y:0,z:10};assert.equal(segmentDistanceSquared({x:0,y:0,z:5},a,b),0);assert.equal(segmentDistanceSquared({x:2,y:0,z:5},a,b),4);assert.equal(segmentDistanceSquared({x:0,y:1,z:0},a,a),1);
});

test('coleta varrida não perde moeda em alta velocidade nem em ré',()=>{
 for(const reverse of [false,true]){const {r,course}=setup();r.arcadeDistance=reverse?43:33;r.distance=reverse?33:43;r.speed=reverse?-100:100;stepArcade([r],course,{},.1);assert.equal(r.coins,1);assert.equal(course.coinEvents.length,1);}
});

test('distância 3D impede coletar uma moeda muito acima do kart',()=>{
 const {r,course}=setup();bindCoinPositions(course,flat);course.coins[0].position.y+=15;stepArcade([r],course,{},.05);assert.equal(r.coins,0);assert.equal(course.coinEvents.length,0);
});

test('coleta continua correta no relevo e banking das cinco pistas',()=>{
 for(const track of ['valley','harbor','fair','sawmill','night']){const frame=createTrackSampler(createCircuitCurve(track),trackLength(track),d=>surfaceProfile(d,track)),course=createArcadeCourse(track),coin=course.coins[Math.floor(course.coins.length*.61)];course.coins=[coin];bindCoinPositions(course,frame);const r=createRace({track})[0];Object.assign(r,{distance:coin.distance+.9,arcadeDistance:coin.distance-.9,offset:coin.offset,speed:32});stepArcade([r],course,{},.05);assert.equal(r.coins,1,track);}
});

test('coleta 3D atravessa a linha de chegada sem falhar por causa da volta',()=>{
 const course=createArcadeCourse('valley'),length=course.length,frame=createTrackSampler(createCircuitCurve('valley'),length,d=>surfaceProfile(d,'valley'));course.coins=[{distance:length-.5,offset:0,cooldown:0}];bindCoinPositions(course,frame);const r=createRace()[0];Object.assign(r,{distance:length+.5,arcadeDistance:length-1,offset:0,speed:32});stepArcade([r],course,{},.05);assert.equal(r.coins,1);assert.equal(course.coinEvents.length,1);
});

test('uma moeda gera só uma coleta entre dois karts e continua respeitando dez moedas',()=>{
 const {r,course}=setup(),other=createRace()[1];Object.assign(other,{distance:38,offset:0,speed:30});r.coins=10;stepArcade([r,other],course,{},.05);assert.equal(r.coins,10);assert.equal(r.coinsCollected,1);assert.equal(other.coins,0);assert.equal(course.coinEvents.length,1);stepArcade([r,other],course,{},.05);assert.equal(r.coinsCollected,1);assert.equal(course.coinEvents.length,0);
});

test('teleporte e atalho não coletam moedas pelo caminho',()=>{
 const {r,course}=setup();r.arcadeDistance=20;r.distance=60;r.speed=10;stepArcade([r],course,{},.05);assert.equal(r.coins,0);r.distance=38;r.shortcut=true;stepArcade([r],course,{},.05);assert.equal(r.coins,0);r.shortcut=false;stepArcade([r],course,{},.05);assert.equal(r.coins,0);
});

test('coleta gera cinco partículas uma vez, esconde todas as partes e pausa congela efeito',()=>{
 const visuals=new ArcadeVisuals(new THREE.Scene());visuals.reset('valley',flat);const r=createRace()[0],coin=visuals.course.coins.find(c=>c.offset===0);Object.assign(r,{distance:coin.distance,arcadeDistance:coin.distance-1,offset:0,speed:30});stepArcade([r],visuals.course,{},.05);visuals.update(0,false,.016);assert.equal(visuals.effects.particles.filter(p=>p.life>0).length,5);assert.equal(visuals.course.coinEvents.length,0);
 const matrix=new THREE.Matrix4(),scale=new THREE.Vector3();for(const mesh of [visuals.coins,visuals.rims,visuals.emblems]){mesh.getMatrixAt(visuals.course.coins.indexOf(coin),matrix);scale.setFromMatrixScale(matrix);assert.equal(scale.length(),0);}
 const before=visuals.effects.particles.map(p=>({life:p.life,position:p.position.toArray()}));visuals.update(0,false,0);assert.deepEqual(visuals.effects.particles.map(p=>({life:p.life,position:p.position.toArray()})),before);visuals.update(1,false,1);assert.equal(visuals.effects.particles.filter(p=>p.life>0).length,0);visuals.clear();
});

test('posições da pista são preparadas uma vez e movimento reduzido elimina giro e partículas',()=>{
 let samples=0;const frame=(d,o)=>{samples++;return flat(d,o);},visuals=new ArcadeVisuals(new THREE.Scene());visuals.reset('valley',frame);const count=samples;visuals.update(0,true,.016);const a=new THREE.Matrix4(),b=new THREE.Matrix4();visuals.coins.getMatrixAt(0,a);visuals.update(10,true,.016);visuals.coins.getMatrixAt(0,b);assert.equal(samples,count);assert.deepEqual(a.elements,b.elements);visuals.effects.burst(new THREE.Vector3(),{reduced:true});assert.ok(visuals.effects.particles.every(p=>p.life===0));visuals.clear();assert.equal(visuals.root.children.length,0);visuals.update(0,false,.016);
});

test('efeitos reutilizam no máximo sessenta partículas e modo leve usa três',()=>{
 const effects=new CoinEffects(new THREE.Group());effects.burst(new THREE.Vector3(),{light:true});assert.equal(effects.particles.filter(p=>p.life>0).length,3);for(let i=0;i<30;i++)effects.burst(new THREE.Vector3());assert.equal(effects.particles.length,60);assert.equal(effects.particles.filter(p=>p.life>0).length,60);effects.update(1);assert.ok(effects.particles.every(p=>p.life===0));
});
