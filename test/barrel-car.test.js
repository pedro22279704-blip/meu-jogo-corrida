import {driveInput} from './drive-helper.js';
import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createBarrelCar} from '../src/barrel-car.js';
import {bindKart,animateKart} from '../src/kart-animation.js';
import {CHARACTERS,setCharacter} from '../src/characters.js';
import {PILOTS,COLORS,readSettings,writeSettings} from '../src/settings.js';
import {createRace,stepRace,orderRacers} from '../src/race.js';
import {createCup,scoreCup,cupStandings} from '../src/championship.js';
import {saveGhost,readGhost} from '../src/ghost.js';
import {finishChallenges,readChallenges,unlockedPaints} from '../src/challenges.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};

test('Carro Barril é a oitava opção e conserva índices dos sete anteriores',()=>{
 assert.deepEqual(PILOTS.slice(0,7),['Lume','Bia Faísca','Téo Musgo','Nina Cometa','Zeca Brisa','Sol Cobre','Carro 10']);assert.equal(PILOTS[7],'Carro Barril');assert.equal(COLORS.length,8);
 const s=storage();writeSettings(s,{pilot:7,character:'olinda'});assert.equal(readSettings(s).pilot,7);assert.equal(readSettings(s).character,'olinda');
 const race=createRace({pilot:7});assert.equal(race[0].name,'Você · Carro Barril');assert.equal(new Set(race.map(r=>r.pilot)).size,8);assert.ok(race.every(r=>r.style));
 assert.ok(saveGhost(s,'valley-medium',80,7,[[0,0,0,0,0,0],[80,2280,0,0,0,32]]));assert.equal(readGhost(s,'valley-medium').pilot,7);
});

test('barril tem aduelas, duas cintas, quatro rodas de raios e rig animado',()=>{
 const car=createBarrelCar(),rig=bindKart(car),parts=[];car.traverse(p=>parts.push(p));
 assert.equal(parts.filter(p=>p.name.startsWith('BarrelStave')).length,16);assert.equal(parts.filter(p=>p.name==='MetalHoop').length,2);
 assert.equal(parts.filter(p=>p.name==='WoodenRim').length,4);assert.equal(parts.filter(p=>p.name==='WoodenSpoke').length,32);
 const bounds=new THREE.Box3().setFromObject(car);assert.ok(bounds.min.y>=0);assert.ok(bounds.max.x<=1.1&&bounds.min.x>=-1.1);assert.ok(bounds.max.z<=1.75&&bounds.min.z>=-1.75);
 assert.ok(rig.driver&&rig.steering);assert.ok([...rig.rolls,...rig.front,...rig.arms].every(Boolean));
 animateKart(rig,{speed:28,angle:.4,finished:false},.1,1);assert.ok(rig.rolls.every(w=>w.quaternion.angleTo(w.userData.rest)>.1));assert.ok(rig.front.every(w=>w.quaternion.angleTo(w.userData.rest)>.1));
 for(const {id} of CHARACTERS){setCharacter(car,id);const changed=bindKart(car);assert.ok(changed.driver&&changed.arms.every(Boolean));if(id!=='original')assert.equal(changed.driver.userData.character,id);assert.ok(bindKart(car.clone(true)).driver);}
 setCharacter(car,'original');assert.equal(bindKart(car).driver,rig.driver);
});

test('Barril e Carro 10 preservam drift/nitro com atributos próprios',()=>{
 for(const pilot of [6,7]){const r=createRace({pilot})[0];for(let i=0;i<40;i++)stepRace([r],{up:true},1/60,i/60);assert.ok(r.speed>0);r.speed=28;r.heading=0;r.angle=0;r.offset=0;r.driftCharge=.4;
  stepRace([r],{up:true,boost:true},.05,1);assert.ok(r.boosting&&r.nitro<100);
  for(let i=0;i<40;i++)stepRace([r],{up:true,drift:true,steer:.1},1/60,2+i/60);
  stepRace([r],{up:true},1/60,3);assert.ok(r.miniTurbo>0);assert.equal(r.goodDrifts,1);
 }
 assert.notEqual(createRace({pilot:6})[0].stats.speed,createRace({pilot:7})[0].stats.speed);
});

test('oito carros terminam campeonato sem pontuação inválida e vitória preserva conquistas',()=>{
 const cup=createCup(),race=createRace({pilot:7});for(let i=0;i<14000;i++)stepRace(race,driveInput(race[0]),1/60,i/60);assert.ok(race.every(r=>r.finished));
 assert.ok(scoreCup(cup,orderRacers(race)));cup.round=1;assert.ok(scoreCup(cup,[...orderRacers(race)].reverse()));assert.equal(cupStandings(cup).length,8);assert.ok(cup.scores.every(Number.isFinite));
 const s=storage();s.setItem('vale-neon-challenges-v1',JSON.stringify({clean:true,drift:true,wins:[0,1,2,3,4,5,6]}));finishChallenges(s,race[0],1);
 const p=readChallenges(s);assert.equal(p.wins.length,8);assert.ok(unlockedPaints(p).some(p=>p.id==='champion'));
});
