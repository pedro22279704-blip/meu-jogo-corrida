import {driveInput} from './drive-helper.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createArcadeCourse,stepArcade} from '../src/arcade-race.js';
import {createRace,stepRace,resolveCollisions} from '../src/race.js';
import {createRoadRibbon} from '../src/road-surface.js';
import {captureGhost,readGhost,ghostAt} from '../src/ghost.js';
import {exportProgress,parseBackup} from '../src/progress-backup.js';
import {TUNNELS,trackLength} from '../src/tracks.js';

function racer(track='valley'){const r=createRace({track})[0];Object.assign(r,{speed:32,offset:0});return r;}
test('cinco pistas preservam moedas e faixas, sem rampas de lançamento',()=>{for(const id of ['valley','harbor','fair','sawmill','night']){const c=createArcadeCourse(id);assert.equal(c.ramps.length,0);assert.equal(c.pads.length,2);assert.ok(c.coins.length>=45);}});

test('moedas limitam em dez, não repetem enquanto escondidas e retornam',()=>{
 const r=racer(),c=createArcadeCourse('valley');r.coins=9;r.distance=38;r.arcadeDistance=37;
 stepArcade([r],c,{},.05);assert.equal(r.coins,10);assert.equal(r.coinsCollected,1);stepArcade([r],c,{},.05);assert.equal(r.coinsCollected,1);
 stepArcade([r],c,{},7);assert.equal(r.coinsCollected,2);assert.equal(r.coins,10);
});
test('colisão ou item tira até três moedas uma vez, Bolha bloqueada preserva moedas',()=>{
 const r=racer(),c=createArcadeCourse('valley');r.coins=8;stepArcade([r],c,{},.05);r.collisions++;stepArcade([r],c,{},.05);assert.equal(r.coins,5);stepArcade([r],c,{},.05);assert.equal(r.coins,5);r.lastAttack={blocked:true};stepArcade([r],c,{},.05);assert.equal(r.coins,5);r.lastAttack={blocked:false};stepArcade([r],c,{},.05);assert.equal(r.coins,2);
});
test('faixa é ativada na travessia e novamente na próxima volta, sem gastar nitro',()=>{
 const r=racer(),c=createArcadeCourse('valley'),d=c.pads[0].distance;r.arcadeDistance=d-1;r.distance=d+1;r.nitro=50;stepArcade([r],c,{},.05);assert.ok(r.trackBoost>1);stepRace([r],{up:true},.05,0);assert.equal(r.boosting,true);assert.ok(r.nitro>=50);const t=r.trackBoost;stepArcade([r],c,{},.05);assert.ok(r.trackBoost<t);r.arcadeDistance=d+c.length-1;r.distance=d+c.length+1;stepArcade([r],c,{},.05);assert.ok(r.trackBoost>1);
});
test('antigos pontos de salto e planagem não lançam nenhum dos oito karts',()=>{
 const old={valley:[.36,.80],harbor:[.08,.65],fair:[.78,.23],sawmill:[.80,.23],night:[.33,.82]};
 for(const [track,points] of Object.entries(old))for(const point of points){const c=createArcadeCourse(track),racers=createRace({track});racers.forEach((r,i)=>Object.assign(r,{distance:point*c.length+1,arcadeDistance:point*c.length-1,speed:32,offset:i%2?3:-3}));stepArcade(racers,c,{drift:true},.05);for(const r of racers){assert.equal(r.airTime,0);assert.equal(r.trickTimer,0);assert.equal(r.driftHop,0);assert.equal(r.airKind,null);}}
});
test('estado aéreo antigo é limpo sem conceder turbo de pouso',()=>{const r=racer(),c=createArcadeCourse('valley');Object.assign(r,{airTime:1.9,airKind:'glide',trick:true,trickTimer:.5,driftHop:.3});stepArcade([r],c,{drift:true},.05);assert.equal(r.airTime,0);assert.equal(r.trickTimer,0);assert.equal(r.driftHop,0);assert.equal(r.miniTurbo,0);});
test('pausa congela moedas e impulso; atalhos não ativam faixa',()=>{const r=racer(),c=createArcadeCourse('valley');r.trackBoost=1;c.coins[0].cooldown=3;stepArcade([r],c,{},0);assert.equal(r.trackBoost,1);assert.equal(c.coins[0].cooldown,3);r.trackBoost=0;r.shortcut=true;r.arcadeDistance=c.pads[0].distance-1;r.distance=c.pads[0].distance+1;stepArcade([r],c,{},.05);assert.equal(r.trackBoost,0);});
test('fantasmas novos são gravados no chão e backups com voo antigo continuam aceitos',()=>{
 const r=racer(),samples=[];r.distance=0;captureGhost(samples,0,r);Object.assign(r,{distance:100,airTime:1.9,airKind:'glide'});captureGhost(samples,1,r);r.distance=2280;captureGhost(samples,90,r,true);assert.ok(samples.every(s=>s.length===6));
 const g={version:7,time:90,pilot:0,samples:samples.map((s,i)=>[...s,i===1?10:0,i===1?1:0])},map=new Map([['vale-neon-best-v7-valley-medium','90'],['vale-neon-ghost-v7-valley-medium',JSON.stringify(g)]]),storage={getItem:k=>map.get(k)??null};assert.ok(readGhost(storage,'valley-medium'));assert.deepEqual(parseBackup(exportProgress(storage)).ghosts['valley-medium'],g);
});

test('asfalto tem UVs finitas e acostamento continua separado',()=>{
 const frame=(d,o)=>({p:new THREE.Vector3(o,0,d)}),g=createRoadRibbon(frame,100,20,18);assert.equal(g.attributes.uv.count,g.attributes.position.count);assert.ok([...g.attributes.uv.array].every(Number.isFinite));
});
test('cinco circuitos completos mantêm jogador e rivais no chão, sem perder o impulso',()=>{
 for(const track of ['valley','harbor','fair','sawmill','night']){const racers=createRace({track}),c=createArcadeCourse(track);let boosted=false;for(let i=0;i<10000&&!racers.every(r=>r.finished);i++){const input=driveInput(racers[0]);stepRace(racers,input,.05,i*.05);stepArcade(racers,c,input,.05);boosted||=racers[0].trackBoost>0;for(const r of racers){assert.ok(Number.isFinite(r.distance));assert.equal(r.airTime,0);assert.equal(r.driftHop,0);assert.ok(r.coins>=0&&r.coins<=10);}}assert.ok(boosted);assert.ok(racers.every(r=>r.finished),track);}
});
