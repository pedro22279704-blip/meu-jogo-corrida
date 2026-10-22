import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRace,stepRace,orderRacers} from '../src/race.js';
import {draftingTarget,updateDrafting} from '../src/drafting.js';
import {createCup,scoreCup,cupStandings} from '../src/championship.js';
import {readGhost,captureGhost,saveGhost,ghostAt} from '../src/ghost.js';
import {DrivingEffects} from '../src/driving-effects.js';
test('vácuo exige perseguição alinhada, carrega, perde efeito fora da rota e respeita pausa',()=>{
 const [a,b]=createRace();Object.assign(a,{distance:100,offset:0,speed:30});Object.assign(b,{distance:112,offset:0,speed:30});
 assert.equal(draftingTarget(a,[a,b]),b);for(let i=0;i<20;i++)updateDrafting([a,b],.05);assert.equal(a.draftActive,true);
 const charge=a.draft;updateDrafting([a,b],0);assert.equal(a.draft,charge);
 b.shortcut=true;updateDrafting([a,b],.05);assert.equal(a.draftActive,false);b.shortcut=false;b.offset=3;assert.equal(draftingTarget(a,[a,b]),null);
 b.offset=0;b.finished=true;assert.equal(draftingTarget(a,[a,b]),null);b.finished=false;a.drifting=true;assert.equal(draftingTarget(a,[a,b]),null);
});
test('vácuo aumenta velocidade normal e não permite ultrapassar o limite do nitro',()=>{
 const [a,b]=createRace();Object.assign(a,{distance:100,offset:0,speed:32,draft:1});Object.assign(b,{distance:115,offset:0,speed:36});
 stepRace([a,b],{up:true},.05,1);assert.ok(a.speed>32&&a.speed<=36);
 a.speed=49;a.nitro=100;stepRace([a,b],{up:true,boost:true},.05,2);assert.ok(a.speed<=49);
});
test('campeonato soma as duas pistas uma única vez, espera rivais e desempata pela última etapa',()=>{
 const c=createCup(),racers=createRace();racers.forEach((r,i)=>{r.finished=true;r.finishTime=i+1;});
 racers[5].finished=false;assert.equal(scoreCup(c,racers),false);racers[5].finished=true;
 assert.equal(scoreCup(c,orderRacers(racers)),true);assert.equal(scoreCup(c,racers),false);assert.equal(c.scores[0],10);
 c.round=1;assert.equal(scoreCup(c,[...racers].reverse()),true);assert.equal(cupStandings(c)[0].pilot,5);assert.equal(cupStandings(c)[0].points,11);
});
test('fantasma interpola sem alterar o piloto, persiste por pista e rejeita dados inválidos',()=>{
 const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},r=createRace()[0],samples=[];
 captureGhost(samples,0,r);Object.assign(r,{distance:100,offset:2,angle:.4,speed:30});captureGhost(samples,1,r);r.distance=2280;captureGhost(samples,80,r,true);
 assert.equal(saveGhost(storage,'valley-medium',80,0,samples),true);const g=readGhost(storage,'valley-medium');assert.ok(g);assert.equal(readGhost(storage,'harbor-medium'),null);
 assert.ok(Math.abs(ghostAt(g,.5).offset+.2)<1e-9);assert.equal(r.distance,2280);assert.equal(ghostAt(g,81),null);
 const corrupt=JSON.stringify({...g,samples:[[0,0,0,0,0,0],[0,2280,0,0,0,32]]});assert.equal(readGhost({getItem:()=>corrupt},'x'),null);
 assert.equal(readGhost(null,'x'),null);assert.equal(saveGhost(null,'x',80,0,samples),false);
});
test('marcas e poeira têm limite fixo e congelam na pausa',()=>{
 const effects=new DrivingEffects(new THREE.Scene()),r={distance:30,offset:6,speed:30,drifting:true};
 const frame=(d,o)=>({p:new THREE.Vector3(o,0,d),up:new THREE.Vector3(0,1,0),quaternion:new THREE.Quaternion()});
 for(let i=0;i<500;i++)effects.update(r,frame,.05,{active:true});assert.equal(effects.root.children.length,184);assert.ok(effects.marks.some(p=>p.life>0));assert.ok(effects.dust.some(p=>p.life>0));
 const lives=effects.marks.map(p=>p.life);effects.update(r,frame,0,{active:true});assert.deepEqual(effects.marks.map(p=>p.life),lives);effects.clear();assert.ok(effects.marks.every(p=>!p.mesh.visible));
});
