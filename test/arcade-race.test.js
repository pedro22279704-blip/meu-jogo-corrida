import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createArcadeCourse,stepArcade,flightHeight} from '../src/arcade-race.js';
import {createRace,stepRace,resolveCollisions} from '../src/race.js';
import {createRoadRibbon} from '../src/road-surface.js';
import {captureGhost,readGhost,ghostAt} from '../src/ghost.js';
import {exportProgress,parseBackup} from '../src/progress-backup.js';
import {TUNNELS,trackLength} from '../src/tracks.js';

function racer(track='valley'){const r=createRace({track})[0];Object.assign(r,{speed:32,offset:0});return r;}
test('cinco pistas têm moedas, duas faixas e rampas fora dos túneis',()=>{
 for(const track of ['valley','harbor','fair','sawmill','night']){const c=createArcadeCourse(track);assert.equal(c.ramps.length,2);assert.equal(c.pads.length,2);assert.ok(c.coins.length>=45);for(const ramp of c.ramps){assert.ok(ramp.distance>30&&ramp.distance<c.length);for(const tunnel of TUNNELS[track]??[])assert.ok(ramp.distance+ramp.duration*49<tunnel.start*c.length||ramp.distance>tunnel.end*c.length);}}
});
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
test('rampa abre planagem, Space no ar faz manobra e pouso libera turbo uma vez',()=>{
 const r=racer(),c=createArcadeCourse('valley'),ramp=c.ramps[0];r.arcadeDistance=ramp.distance-1;r.distance=ramp.distance+1;
 stepArcade([r],c,{},.05);assert.equal(r.airKind,'glide');assert.equal(r.airTime,3.8);r.airTime=1.9;assert.ok(flightHeight(r)>9);stepArcade([r],c,{drift:true},.05);assert.equal(r.trick,true);assert.ok(r.trickTimer>0);r.airTime=.04;stepArcade([r],c,{drift:true},.05);assert.equal(r.airTime,0);assert.ok(r.miniTurbo>=1);assert.equal(r.trick,false);r.miniTurbo=.2;stepArcade([r],c,{},.05);assert.equal(r.miniTurbo,.2);
});
test('segurar Space antes do salto não ganha manobra automaticamente, nem carrega drift no ar',()=>{
 const r=racer(),c=createArcadeCourse('valley');r.arcadeDistance=c.ramps[0].distance-1;r.distance=c.ramps[0].distance+1;stepArcade([r],c,{drift:true},.05);stepRace([r],{up:true,drift:true,left:true},.05,1);stepArcade([r],c,{drift:true},.05);assert.equal(r.trick,false);assert.equal(r.drifting,false);assert.equal(r.driftCharge,0);
});
test('karts em alturas diferentes não colidem; chegada recolhe a asa',()=>{
 const a=racer(),b={...racer(),index:1};a.distance=b.distance=100;a.offset=b.offset=0;a.airDuration=3.8;a.airTime=1.9;a.airKind='glide';resolveCollisions([a,b]);assert.equal(a.collisions,0);a.airTime=0;resolveCollisions([a,b]);assert.ok(a.collisions>0);a.distance=trackLength('valley')*3-.1;a.speed=32;a.airTime=1.9;stepRace([a],{up:true},.05,1);assert.equal(a.finished,true);assert.equal(a.airTime,0);
});
test('pausa congela moedas, impulso e voo; atalhos não ativam faixa nem rampa',()=>{
 const r=racer(),c=createArcadeCourse('valley');r.trackBoost=1;r.airTime=2;r.airDuration=3.8;r.airKind='glide';c.coins[0].cooldown=3;stepArcade([r],c,{drift:true},0);assert.equal(r.airTime,2);assert.equal(r.trackBoost,1);assert.equal(c.coins[0].cooldown,3);r.airTime=0;r.trackBoost=0;r.shortcut=true;r.arcadeDistance=c.ramps[0].distance-1;r.distance=c.ramps[0].distance+1;stepArcade([r],c,{},.05);assert.equal(r.airTime,0);
});
test('fantasma e backup preservam altura e asa; amostras antigas continuam legíveis',()=>{
 const r=racer(),samples=[];r.distance=0;captureGhost(samples,0,r);Object.assign(r,{distance:100,airTime:1.9,airDuration:3.8,airKind:'glide'});captureGhost(samples,1,r);r.distance=2280;r.airTime=0;captureGhost(samples,90,r,true);
 const g={version:7,time:90,pilot:0,samples},map=new Map([['vale-neon-best-v7-valley-medium','90'],['vale-neon-ghost-v7-valley-medium',JSON.stringify(g)]]),storage={getItem:k=>map.get(k)??null};assert.ok(readGhost(storage,'valley-medium'));assert.equal(ghostAt(g,1).gliding,true);assert.ok(ghostAt(g,1).height>9);assert.deepEqual(parseBackup(exportProgress(storage)).ghosts['valley-medium'],g);const old={...g,samples:samples.map(s=>s.slice(0,6))};assert.ok(readGhost({getItem:()=>JSON.stringify(old)},'valley-medium'));assert.equal(ghostAt(old,1).height,0);
});
test('asfalto tem UVs finitas e acostamento continua separado',()=>{
 const frame=(d,o)=>({p:new THREE.Vector3(o,0,d)}),g=createRoadRibbon(frame,100,20,18);assert.equal(g.attributes.uv.count,g.attributes.position.count);assert.ok([...g.attributes.uv.array].every(Number.isFinite));
});
test('simulação dos cinco circuitos mantém voo, moedas e posição finitos',()=>{
 for(const track of ['valley','harbor','fair','sawmill','night']){const r=racer(track),c=createArcadeCourse(track);let flew=false,boosted=false;for(let i=0;i<6000&&!r.finished;i++){const input={up:true,drift:i%100===1};stepRace([r],input,.05,i*.05);stepArcade([r],c,input,.05);flew||=r.airTime>0;boosted||=r.trackBoost>0;assert.ok(Number.isFinite(r.distance)&&Number.isFinite(flightHeight(r)));assert.ok(r.coins>=0&&r.coins<=10);}assert.ok(flew&&boosted);assert.equal(r.finished,true);}
});
