import {steerManually} from '../src/manual-steering.js';
import {driveInput} from './drive-helper.js';
import {test} from 'node:test';
import {PILOTS} from '../src/settings.js';
import {surfaceProfile} from '../src/surface.js';
import assert from 'node:assert/strict';
import {createRace,stepRace,orderRacers,lapOf,TRACK_LENGTH,ROAD_LIMIT,resolveCollisions} from '../src/race.js';
test('oito pilotos aceleram e fazem drift sem nitro manual',()=>{const r=createRace();assert.equal(r.length,PILOTS.length);for(let i=0;i<180;i++)stepRace(r,driveInput(r[0]),1/60,i/60);assert.ok(r[0].speed>10);assert.equal('nitro' in r[0],false);stepRace(r,{up:true,right:true,drift:true},.05,5);assert.ok(r[0].drifting);assert.equal(r[0].steerVisual,-1);});
test('voltas, classificação e corrida completa da IA',()=>{const r=createRace();r[0].distance=TRACK_LENGTH+1;assert.equal(lapOf(r[0]),2);assert.equal(orderRacers(r)[0].index,0);for(let i=0;i<20000;i++)stepRace(r,{},1/60,i/60);assert.ok(r.slice(1).every(p=>p.finished));assert.ok(orderRacers(r)[0].finished);assert.equal(r[0].finished,false);});
test('jogador termina após três voltas, sem acumular voltas após chegada',()=>{const r=createRace();for(let i=0;i<20000;i++)stepRace(r,driveInput(r[0]),1/60,i/60);assert.ok(r[0].finished);assert.equal(r[0].distance,3*TRACK_LENGTH);const time=r[0].finishTime;stepRace(r,driveInput(r[0]),1,200);assert.equal(r[0].finishTime,time);assert.equal(lapOf(r[0]),3);});

test('comandos opostos giram o kart em direções simétricas sem autocentrar',()=>{const left=createRace()[0],right=createRace()[0];left.speed=right.speed=30;for(let i=0;i<20;i++){steerManually(left,1,.02);steerManually(right,-1,.02);}assert.ok(left.heading>0&&right.heading<0);assert.ok(Math.abs(left.heading+right.heading)<1e-8);});

test('drift mantém inércia lateral e recupera aderência suavemente',()=>{const r=createRace();r[0].speed=30;r[0].offset=0;for(let i=0;i<20;i++)stepRace(r,{up:true,left:true,drift:true},1/60,i/60);assert.ok(r[0].drifting);assert.ok(r[0].slide>0);assert.ok(r[0].slide<Math.sin(r[0].angle)*r[0].speed);const before=r[0].offset;stepRace(r,driveInput(r[0]),1/60,1);assert.equal(r[0].drifting,false);assert.ok(r[0].offset>before);assert.ok(Number.isFinite(r[0].slide));});

test('drift carregado libera impulso expira sem nitro manual',()=>{
 const r=[createRace()[0]];r[0].speed=28;r[0].offset=0;r[0].driftCharge=.4;
 for(let i=0;i<40;i++)stepRace(r,{up:true,left:true,drift:true},1/60,i/60);
 assert.ok(r[0].driftCharge>=.35);
 stepRace(r,driveInput(r[0]),1/60,1);assert.ok(r[0].miniTurbo>0);assert.equal(r[0].driftCharge,0);assert.ok(r[0].boosting);
 for(let i=0;i<150;i++)stepRace(r,driveInput(r[0]),1/60,1+i/60);
 assert.equal(r[0].miniTurbo,0);assert.equal(r[0].boosting,false);
});
test('drift curto não dá impulso',()=>{const r=[createRace()[0]];r[0].speed=28;stepRace(r,{up:true,left:true,drift:true},.05,0);stepRace(r,driveInput(r[0]),.05,.05);assert.equal(r[0].miniTurbo,0);});
test('barreira contém o kart e reduz velocidade',()=>{const r=[createRace()[0]];r[0].offset=ROAD_LIMIT-.01;r[0].slide=12;r[0].angle=.5;r[0].speed=30;stepRace(r,{up:true,left:true},.05,0);assert.ok(r[0].offset<=ROAD_LIMIT);assert.ok(r[0].speed<30);assert.ok(r[0].hit>0);assert.ok(r[0].slide<=0);});
test('colisão lateral separa karts; colisão traseira compartilha velocidade',()=>{
 const r=createRace().slice(0,2);r[0].distance=r[1].distance=100;r[0].offset=0;r[1].offset=1;
 resolveCollisions(r);assert.ok(Math.abs(r[0].offset-r[1].offset)>=2.2);
 r[0].offset=r[1].offset=0;r[0].distance=100;r[1].distance=102;r[0].speed=40;r[1].speed=20;
 resolveCollisions(r);assert.ok(Math.abs(r[0].distance-r[1].distance)>=3.5);assert.equal(r[0].speed,r[1].speed);
});
test('colisões detectam karts em voltas diferentes',()=>{const r=createRace().slice(0,2);r[0].distance=100;r[1].distance=100+TRACK_LENGTH;r[0].offset=r[1].offset=0;resolveCollisions(r);assert.ok(Math.abs((r[1].distance-r[0].distance)-TRACK_LENGTH)>=3.5||Math.abs(r[0].offset-r[1].offset)>=2.2);});
test('IA procura faixa de ultrapassagem ao se aproximar de kart lento',()=>{const r=createRace().slice(0,2);r[0].distance=20;r[1].distance=10;r[0].offset=r[1].offset=r[1].aiLane=0;r[1].speed=28;stepRace(r,{},.05,1);assert.ok(Math.abs(r[1].aiLane)>0);assert.ok(Math.abs(r[1].offset)>0);});
test('simulação longa mantém pilotos finitos, contidos e IA chega',()=>{const r=createRace();for(let i=0;i<20000;i++)stepRace(r,{up:true,boost:i%300<50,left:i%800<50,drift:i%800<50},1/60,i/60);for(const p of r){assert.ok(Number.isFinite(p.distance));assert.ok(Number.isFinite(p.speed));assert.ok(Math.abs(p.offset)<=ROAD_LIMIT);}assert.ok(r.slice(1).every(p=>p.finished));});

test('adversários disputam posição durante corrida com direção ativa',()=>{
 const r=createRace();for(let i=0;i<3601;i++){stepRace(r,driveInput(r[0]),1/60,i/60,surfaceProfile);if(i>0&&i%900===0){const nearest=Math.min(...r.slice(1).map(p=>Math.abs(p.distance-r[0].distance)));assert.ok(nearest<30,`Rival longe aos ${i/60}s: ${nearest}`);}}assert.ok(orderRacers(r).findIndex(p=>p.index===0)>0);
});
test('IA não usa nitro e recuperação não teletransporta',()=>{
 const r=createRace().slice(0,2);r[0].distance=100;r[1].distance=20;r[1].offset=4;r[1].speed=30;const before=r[1].distance;
 stepRace(r,{},.05,8);assert.equal(r[1].boosting,false);assert.equal('nitro' in r[1],false);assert.ok(r[1].distance>before&&r[1].distance-before<=49*.05);
});
