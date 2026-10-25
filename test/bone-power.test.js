import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,ROAD_LIMIT} from '../src/race.js';
import {createItems,stepItems,racerItem} from '../src/items.js';
import {boneTarget,launchBone} from '../src/bone-power.js';
import {createBarrelCar} from '../src/barrel-car.js';
import {setCharacter} from '../src/characters.js';
import {bindKart} from '../src/kart-animation.js';
import {SHORTCUTS} from '../src/shortcuts.js';

function setup(){const racers=createRace({character:'gugar'});racers.forEach((r,i)=>Object.assign(r,{distance:100+i*30,offset:i?3:0,speed:30,finished:i>1}));const world=createItems();world.boxes=[];return {racers,world};}
test('especial é exclusivo do Gugar, preserva os oito carros e os outros itens',()=>{
 assert.equal(createRace({character:'gugar'})[0].item,'bone');assert.equal(createRace({character:'gugar',pilot:7})[0].item,'bone');
 assert.equal(createRace({character:'olinda'})[0].item,null);assert.ok(createRace({character:'gugar'}).slice(1).every(r=>r.item===null));
 const g=createRace({character:'gugar'})[0];assert.equal(racerItem(g,1,8,.2),'bone');assert.notEqual(racerItem(g,1,8,.8),'bone');assert.notEqual(racerItem(createRace()[0],1,8,.2),'bone');
 const model=createBarrelCar(),original=bindKart(model);setCharacter(model,'gugar');const rig=bindKart(model);assert.equal(rig.driver.userData.character,'gugar');assert.equal(rig.steering,original.steering);assert.equal(rig.rolls.length,4);
});
test('osso escolhe o rival mais próximo à frente e ignora dono, chegada e atalho',()=>{
 const {racers}=setup();assert.equal(boneTarget(racers[0],racers),racers[1]);racers[1].shortcut=true;assert.equal(boneTarget(racers[0],racers),null);racers[1].shortcut=false;racers[1].distance=90;assert.equal(boneTarget(racers[0],racers),null);
});
test('perseguição muda de faixa, acerta uma vez e consome o osso',()=>{
 const {racers,world}=setup();stepItems(racers,world,{item:true},1/60,0);assert.equal(racers[0].item,null);assert.equal(world.bones[0].target,1);
 for(let i=0;i<50;i++)stepItems(racers,world,{item:true},1/60,i/60);
 assert.equal(world.bones.length,0);assert.ok(racers[1].slow>0);assert.ok(racers[1].boneSpin>0);assert.equal(racers[1].lastAttack.item,'bone');assert.equal(racers[1].lastAttack.blocked,false);assert.equal(racers[0].slow,0);
 const attack=racers[1].lastAttack;stepItems(racers,world,{},.1,1);assert.equal(racers[1].lastAttack,attack);
});
test('Bolha bloqueia o osso sem lentidão nem giro',()=>{
 const {racers,world}=setup();racers[1].shield=6;stepItems(racers,world,{item:true},.5,0);
 assert.equal(world.bones.length,0);assert.equal(racers[1].shield,0);assert.equal(racers[1].slow,0);assert.equal(racers[1].boneSpin,0);assert.equal(racers[1].lastAttack.blocked,true);
});
test('colisão varrida não atravessa rival entre quadros',()=>{
 const {racers,world}=setup();stepItems(racers,world,{item:true},.5,0);assert.equal(world.bones.length,0);assert.ok(racers[1].slow>0);
});
test('pausa congela projétil, borda rebate e sem alvo expira',()=>{
 const {racers,world}=setup();racers[1].finished=true;racers[0].offset=ROAD_LIMIT-.1;racers[0].angle=.8;
 const bone=launchBone(racers[0],racers);world.bones.push(bone);const before={...bone};stepItems(racers,world,{},0,0);assert.deepEqual(bone,before);
 stepItems(racers,world,{},.1,.1);assert.equal(bone.bounces,1);assert.ok(Math.abs(bone.offset)<=ROAD_LIMIT-.6);
 for(let i=0;i<60;i++)stepItems(racers,world,{},.1,i*.1);assert.equal(world.bones.length,0);assert.equal(racers[0].slow,0);
});
test('segurar E não lança novamente ao receber outro osso até soltar',()=>{
 const {racers,world}=setup();stepItems(racers,world,{item:true},.01,0);racers[0].item='bone';stepItems(racers,world,{item:true},.01,.01);assert.equal(racers[0].item,'bone');stepItems(racers,world,{item:false},.01,.02);stepItems(racers,world,{item:true},.01,.03);assert.equal(racers[0].item,null);assert.equal(world.bones.length,2);
});
test('oito da Avenida Neon não acerta outro nível; perseguição funciona ao cruzar a linha',()=>{
 const racers=createRace({character:'gugar',track:'night'});racers.forEach((r,i)=>Object.assign(r,{finished:i>1,offset:0,speed:30}));
 const world=createItems({track:'night'});world.boxes=[];racers[0].distance=475;racers[1].distance=1425;
 stepItems(racers,world,{item:true},.1,0);assert.equal(racers[1].lastAttack,null);assert.equal(world.bones[0].target,null);
 world.bones=[];racers[0].item='bone';racers[0].itemPressed=false;racers[0].distance=1890;racers[1].distance=1910;
 stepItems(racers,world,{item:true},.4,1);assert.equal(world.bones.length,0);assert.equal(racers[1].lastAttack.item,'bone');
});
test('osso lançado no atalho permanece na rota e ignora rival na pista principal',()=>{
 const {racers,world}=setup();racers[0].distance=SHORTCUTS.valley.start+4;racers[0].shortcut=true;racers[0].offset=3;racers[1].distance=racers[0].distance+12;racers[1].shortcut=true;racers[1].offset=3;
 racers[2].finished=false;racers[2].distance=racers[0].distance+6;racers[2].offset=3;
 assert.equal(boneTarget(racers[0],racers),racers[1]);stepItems(racers,world,{item:true},.05,0);assert.equal(world.bones[0].shortcut,true);
 for(let i=0;i<8;i++)stepItems(racers,world,{},.05,i*.05);
 assert.equal(racers[1].lastAttack.item,'bone');assert.equal(racers[2].lastAttack,null);
});
test('osso lançado na planagem desce antes de acertar karts no chão',()=>{
 const {racers,world}=setup();Object.assign(racers[0],{airTime:1.9,airDuration:3.8,airKind:'glide'});racers[1].distance=110;
 stepItems(racers,world,{item:true},.1,0);assert.ok(world.bones[0].height>9);assert.equal(racers[1].lastAttack,null);
});
