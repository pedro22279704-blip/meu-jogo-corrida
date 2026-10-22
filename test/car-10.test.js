import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createCar10} from '../src/car-10.js';
import {bindKart,animateKart} from '../src/kart-animation.js';
import {createRace,stepRace} from '../src/race.js';
import {PILOTS,COLORS,readSettings,writeSettings} from '../src/settings.js';
import {readGhost,saveGhost} from '../src/ghost.js';
import {readChallenges,finishChallenges,unlockedPaints} from '../src/challenges.js';
const storage=()=>{const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};};
test('carro 10 preserva os seis pilotos e persiste seleção e fantasma',()=>{
 assert.deepEqual(PILOTS.slice(0,6),['Lume','Bia Faísca','Téo Musgo','Nina Cometa','Zeca Brisa','Sol Cobre']);assert.equal(COLORS.length,7);
 const s=storage();writeSettings(s,{pilot:6});assert.equal(readSettings(s).pilot,6);
 const race=createRace({pilot:6});assert.equal(race[0].name,'Você · Carro 10');assert.equal(new Set(race.map(r=>r.pilot)).size,7);assert.ok(race.every(r=>r.style));
 assert.ok(saveGhost(s,'valley-medium',80,6,[[0,0,0,0,0,0],[80,2280,0,0,0,32]]));assert.equal(readGhost(s,'valley-medium').pilot,6);
});
test('modelo 10 tem rig completo, placa, aerofólio e animação de drift',()=>{
 const model=createCar10(),rig=bindKart(model);assert.ok(rig.driver&&rig.steering);assert.ok([...rig.arms,...rig.front,...rig.rolls].every(Boolean));
 assert.ok(model.getObjectByName('NumberPlate'));assert.ok(model.getObjectByName('RearWing'));
 const racer=createRace({pilot:6})[0];Object.assign(racer,{speed:28,angle:.4,drifting:true});animateKart(rig,racer,.1,1);
 assert.ok(rig.rolls.every(w=>w.quaternion.angleTo(w.userData.rest)>0));assert.ok(rig.front.every(w=>w.quaternion.angleTo(w.userData.rest)>0));
});
test('carro 10 acelera, consome nitro e libera impulso de drift',()=>{
 const racers=[createRace({pilot:6})[0]];for(let i=0;i<180;i++)stepRace(racers,{up:true},1/60,i/60);
 const r=racers[0],speed=r.speed;for(let i=0;i<30;i++)stepRace(racers,{up:true,boost:true},1/60,3+i/60);assert.ok(r.speed>speed&&r.nitro<100);
 r.offset=0;r.speed=28;for(let i=0;i<40;i++)stepRace(racers,{up:true,steer:.1,drift:true},1/60,4+i/60);assert.ok(r.drifting&&r.driftCharge>=.35);
 stepRace(racers,{up:true},1/60,5);assert.ok(r.miniTurbo>0&&r.boosting);
});
test('vitória com carro 10 persiste sem retirar Ouro solar anterior',()=>{
 const s=storage();s.setItem('vale-neon-challenges-v1',JSON.stringify({clean:true,drift:true,wins:[0,1,2,3,4,5]}));
 finishChallenges(s,createRace({pilot:6})[0],1);const p=readChallenges(s);assert.equal(p.wins.length,7);assert.ok(unlockedPaints(p).some(p=>p.id==='champion'));
});
