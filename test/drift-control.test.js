import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace,ROAD_LIMIT} from '../src/race.js';
import {circuitArt} from '../src/race-menu.js';
import {exportProgress,parseBackup} from '../src/progress-backup.js';

function solo(){const r=[createRace()[0]];Object.assign(r[0],{speed:30,offset:0});return r;}
test('drift mantém o lado inicial e carrega com contravolante e direção neutra',()=>{
 const r=solo();for(let i=0;i<12;i++)stepRace(r,{up:true,steer:1,drift:true},1/60,i/60);
 assert.ok(r[0].driftHop>0);const inside=r[0].angle;
 for(let i=0;i<18;i++)stepRace(r,{up:true,steer:-1,drift:true},1/60,i/60);
 assert.ok(r[0].drifting&&r[0].angle>0&&r[0].angle<inside);
 for(let i=0;i<25;i++)stepRace(r,{up:true,steer:0,drift:true},1/60,i/60);
 assert.ok(r[0].driftCharge>.5);assert.equal(r[0].driftHop,0);
 stepRace(r,{up:true},1/60,1);assert.ok(r[0].miniTurbo>0);assert.equal(r[0].goodDrifts,1);
 for(let i=0;i<20;i++)stepRace(r,{up:true},1/60,1+i/60);
 assert.equal(r[0].goodDrifts,1);
});
test('segurar drift em linha reta não cria salto nem impulso; baixa velocidade cancela',()=>{
 const r=solo();for(let i=0;i<80;i++)stepRace(r,{up:true,drift:true},1/60,i/60);
 assert.equal(r[0].drifting,false);assert.equal(r[0].driftCharge,0);
 stepRace(r,{up:true,steer:1,drift:true},1/60,2);r[0].speed=5;
 stepRace(r,{steer:1,drift:true},1/60,2.1);assert.equal(r[0].drifting,false);assert.equal(r[0].miniTurbo,0);
});
test('corredor ampliado permite ultrapassar além da antiga barreira e conserva limite físico',()=>{
 const r=solo();r[0].offset=8;stepRace(r,{up:true},1/60,0);assert.equal(r[0].collisions,0);
 r[0].offset=12;stepRace(r,{up:true},1/60,1);assert.equal(r[0].offset,ROAD_LIMIT);assert.equal(r[0].collisions,1);
});
test('cinco cartões mostram os trajetos próprios e um marco de largada',()=>{
 const arts=['valley','harbor','fair','sawmill','night'].map(circuitArt);assert.equal(new Set(arts).size,5);
 for(const art of arts){assert.ok(!art.includes('NaN'));assert.match(art,/<svg/);assert.match(art,/stroke-dasharray/);}
});
test('backup preserva fantasmas que usam as novas faixas externas',()=>{
 const ghost={version:7,time:90,pilot:7,samples:[[0,-9,8.8,0,0,0],[90,2280,-9.4,0,0,32]]};
 const map=new Map([['vale-neon-best-v7-valley-medium','90'],['vale-neon-ghost-v7-valley-medium',JSON.stringify(ghost)]]);
 const backup=parseBackup(exportProgress({getItem:k=>map.get(k)??null}));
 assert.deepEqual(backup.ghosts['valley-medium'],ghost);
});
