import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace,resolveCollisions} from '../src/race.js';
import {CHASSIS,TIRES,vehicleStats,normalTopSpeed,coinMultiplier} from '../src/vehicle-stats.js';
import {normalizeSettings,writeSettings,readSettings} from '../src/settings.js';
import {itemWeights,distanceItem,leaderGap} from '../src/item-balance.js';
import {createItems,stepItems} from '../src/items.js';
import {createArcadeCourse,stepArcade} from '../src/arcade-race.js';
import {environmentAt,harborDive} from '../src/race-environment.js';
import {surfaceProfile} from '../src/surface.js';
import {DRIFT_LEVELS,driftLevel,driftChargeRate} from '../src/drift.js';
import {driveInput} from './drive-helper.js';

test('oito chassis e três pneus combinam atributos sem modificar os catálogos',()=>{
 const before=JSON.stringify({CHASSIS,TIRES});
 for(let pilot=0;pilot<8;pilot++)for(const tires of Object.keys(TIRES)){const s=vehicleStats({pilot,tires});assert.equal(s.speed,CHASSIS[pilot].speed+TIRES[tires].speed);assert.equal(s.handling,CHASSIS[pilot].handling+TIRES[tires].handling);assert.ok(Object.values(s).every(Number.isFinite));assert.ok(s.offroad<=1&&s.weight>0);}
 assert.equal(JSON.stringify({CHASSIS,TIRES}),before);
});
test('escolha de pneus persiste e dados antigos recebem Rua',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 writeSettings(storage,{pilot:7,tires:'trail'});assert.equal(readSettings(storage).tires,'trail');assert.equal(readSettings(storage).pilot,7);
 assert.equal(normalizeSettings({tires:'inválido'}).tires,'street');assert.equal(normalizeSettings({}).tires,'street');
});
test('atributos alteram aceleração e direção de verdade',()=>{
 const street=createRace({tires:'street'})[0],grip=createRace({tires:'grip'})[0];
 for(const r of [street,grip]){Object.assign(r,{speed:20,offset:0,distance:20});stepRace([r],{up:true,steer:.4},.05,0);}
 assert.ok(grip.speed>street.speed);assert.ok(grip.yawRate>street.yawRate);assert.ok(grip.stats.speed<street.stats.speed);
});
test('pneus todo-terreno preservam mais velocidade no acostamento',()=>{
 const a=createRace({tires:'street'})[0],b=createRace({tires:'trail'})[0];
 for(const r of [a,b]){Object.assign(r,{distance:10,offset:8.7,speed:32});for(let i=0;i<12;i++){r.heading=0;r.offset=8.7;stepRace([r],{up:true},.05,i*.05);}}
 assert.ok(b.speed>a.speed);assert.ok(a.offroad&&b.offroad);
});
test('peso maior sofre menos deslocamento numa colisão lateral',()=>{
 const [heavy,light]=createRace().slice(0,2);Object.assign(heavy,{distance:100,offset:0,speed:25,stats:{...heavy.stats,weight:2}});Object.assign(light,{distance:100,offset:1,speed:25,stats:{...light.stats,weight:1}});
 resolveCollisions([heavy,light]);assert.ok(Math.abs(heavy.offset)<Math.abs(light.offset-1));assert.ok(Math.abs(heavy.offset-light.offset)>=2.2);
});
test('moedas dão 1,5% cada até dez; ataque tira três imediatamente e só uma vez',()=>{
 const r=createRace()[0];assert.equal(coinMultiplier(0),1);assert.equal(coinMultiplier(10),1.15);assert.equal(coinMultiplier(100),1.15);
 r.coins=10;assert.equal(normalTopSpeed(r),r.stats.speed*1.15);
 const racers=createRace().slice(0,2),world=createItems(),course=createArcadeCourse('valley');world.boxes=[];racers.forEach((p,i)=>Object.assign(p,{distance:100+i*8,offset:0,speed:30,coins:10}));racers[0].item='pulse';stepItems(racers,world,{item:true},.01,0);assert.equal(racers[1].coins,7);
 stepArcade(racers,course,{},.01);assert.equal(racers[1].coins,7);assert.equal(normalTopSpeed(racers[1]),racers[1].stats.speed*1.105);
});
test('probabilidades somam 100% e favorecem defesa perto e recuperação longe',()=>{
 for(let d=0;d<=300;d++){const w=itemWeights(d);assert.ok(Math.abs(w.defense+w.attack+w.recovery-1)<1e-10);assert.ok(Object.values(w).every(x=>x>=0&&x<=1));}
 assert.ok(itemWeights(0).defense>itemWeights(100).defense);assert.ok(itemWeights(100).attack>itemWeights(0).attack);assert.ok(itemWeights(200).recovery>itemWeights(100).recovery);
 const samples=d=>Array.from({length:1000},(_,i)=>distanceItem(d,i/1000));assert.ok(!samples(0).includes('storm'));assert.ok(samples(200).filter(i=>i==='storm').length>200);
});
test('distância ao líder considera voltas e não confunde classificação com distância',()=>{
 const a={distance:30},b={distance:830};assert.equal(leaderGap(a,[a,b]),800);assert.equal(leaderGap(b,[a,b]),0);
 assert.notEqual(distanceItem(5,.8),distanceItem(200,.8));
});
test('onda atinge somente rivais à frente; bolha protege e pausa congela',()=>{
 const racers=createRace().slice(0,4),world=createItems();world.boxes=[];
 racers.forEach((r,i)=>Object.assign(r,{distance:[100,220,250,80][i],offset:i*2,speed:30,coins:8}));racers[0].item='storm';racers[2].shield=6;
 stepItems(racers,world,{item:true},.01,0);assert.equal(racers[1].coins,5);assert.ok(racers[1].slow>0);assert.equal(racers[2].coins,8);assert.equal(racers[2].shield,0);assert.equal(racers[3].slow,0);assert.equal(racers[3].coins,8);
 const life=world.storm.life;stepItems(racers,world,{},0,1);assert.equal(world.storm.life,life);stepItems(racers,world,{},1,2);assert.equal(world.storm,null);
});
test('trecho subaquático entra e sai sem degraus e muda física só na água',()=>{
 const r=createRace({track:'harbor'})[0];for(const d of [0,420,610,760]){r.distance=d;assert.equal(environmentAt(r).state,'ground');}
 r.distance=510;assert.equal(environmentAt(r).state,'water');assert.ok(surfaceProfile(510,'harbor').height<0);assert.ok(environmentAt(r).speed<1&&environmentAt(r).acceleration<1);
 r.shortcut=true;assert.equal(environmentAt(r).state,'ground');
 for(const d of [430,470,560,600])assert.ok(Math.abs(harborDive(d-.001).depth-harborDive(d+.001).depth)<.002);
 for(const d of [445,460,575,590]){const numerical=(surfaceProfile(d+.001,'harbor').height-surfaceProfile(d-.001,'harbor').height)/.002;assert.ok(Math.abs(numerical-surfaceProfile(d,'harbor').grade)<1e-5);}
});
test('arrasto subaquático reduz velocidade sem lançar o kart',()=>{
 const wet=createRace({track:'harbor'})[0],dry=createRace({track:'valley'})[0];
 for(const r of [wet,dry]){Object.assign(r,{distance:510,offset:0,speed:32});stepRace([r],{up:true},.05,0);assert.equal(r.airTime,0);}
 assert.equal(wet.environment,'water');assert.ok(wet.speed<dry.speed);
});
test('mini-turbo azul dura 0,5 s e vermelho 1,5 s, sem terceiro nível nem salto',()=>{
 assert.deepEqual(DRIFT_LEVELS.map(s=>s.duration),[.5,1.5]);assert.equal(driftLevel(.99),1);assert.equal(driftLevel(1),2);assert.equal(driftLevel(1),2);
 for(const [charge,duration] of [[.5,.5],[1,1.5]]){const r=createRace()[0];Object.assign(r,{speed:25,drifting:true,driftCharge:charge});stepRace([r],{up:true},.01,0);assert.equal(r.miniTurbo,duration);assert.equal(r.goodDrifts,1);assert.equal(r.driftHop,0);stepRace([r],{up:true},.01,.01);assert.equal(r.goodDrifts,1);}
});

test('carga atinge azul em 1,5 s e vermelho em 3,5 s, independente dos FPS',()=>{
 for(const hz of [30,60,120]){let charge=0;for(let i=0;i<hz*3.5;i++){charge=Math.min(1,charge+driftChargeRate(.1)/hz);if(i+1===hz*1.5)assert.equal(driftLevel(charge),1);if(i+1<hz*1.5)assert.equal(driftLevel(charge),0);}assert.equal(driftLevel(charge),2);}
 assert.ok(driftChargeRate(.1)>driftChargeRate(0));assert.ok(driftChargeRate(0)>driftChargeRate(-1));
});

test('todas as 24 montagens completam corrida com direção manual e perfil do terreno',()=>{
 for(let pilot=0;pilot<8;pilot++)for(const [i,tires] of Object.keys(TIRES).entries()){
  const track=['valley','harbor','night'][(pilot+i)%3],r=createRace({pilot,tires,track})[0];let water=false;
  for(let frame=0;frame<10000&&!r.finished;frame++){stepRace([r],driveInput(r),.05,frame*.05,d=>surfaceProfile(d,track));water||=r.environment==='water';assert.ok(Number.isFinite(r.speed));assert.equal(r.airTime,0);}
  assert.equal(r.finished,true,`${pilot}/${tires}/${track}`);if(track==='harbor')assert.ok(water);
 }
});
