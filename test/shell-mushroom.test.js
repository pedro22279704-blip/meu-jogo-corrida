import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace,ROAD_LIMIT} from '../src/race.js';
import {createItems,stepItems,racerItem} from '../src/items.js';
import {launchShell} from '../src/shell-power.js';

function setup(){const racers=createRace().slice(0,2);racers.forEach((r,i)=>Object.assign(r,{distance:100+i*30,offset:i?3:0,speed:30}));const world=createItems();world.boxes=[];return {racers,world};}
test('cápsulas incluem os dois novos poderes e preservam os anteriores e o especial',()=>{
 const r=createRace()[0],items=new Set(Array.from({length:100},(_,i)=>racerItem(r,1,8,i/100)));
 for(const item of ['shield','gum','pulse','shell','mushroom'])assert.ok(items.has(item),item);
 assert.equal(racerItem(createRace({character:'gugar'})[0],1,8,.2),'bone');
});
test('cogumelo dá impulso temporário sem gastar nitro, sem voo e sem repetir ao segurar E',()=>{
 const {racers,world}=setup(),r=racers[0];r.item='mushroom';stepItems(racers,world,{item:true},.01,0);
 assert.equal(r.item,null);assert.equal(r.miniTurbo,2.3);assert.equal(r.turboLevel,2);assert.equal(r.nitro,100);
 stepRace(racers,{up:true},.05,0);assert.ok(r.speed>30);assert.equal(r.nitro,100);assert.equal(r.airTime,0);
 r.item='mushroom';stepItems(racers,world,{item:true},.01,.1);assert.equal(r.item,'mushroom');r.item=null;
 for(let i=0;i<150;i++)stepRace(racers,{},.02,i*.02);
 assert.equal(r.miniTurbo,0);
});
test('casco persegue faixa do rival, acerta uma vez e preserva dono',()=>{
 const {racers,world}=setup();racers[0].item='shell';stepItems(racers,world,{item:true},.01,0);assert.equal(world.shells[0].target,1);
 for(let i=0;i<60;i++)stepItems(racers,world,{},1/60,i/60);
 assert.equal(world.shells.length,0);assert.equal(racers[1].lastAttack.item,'shell');assert.ok(racers[1].slow>0);assert.equal(racers[0].slow,0);
});
test('bolha bloqueia casco mesmo entre quadros longos',()=>{
 const {racers,world}=setup();racers[0].item='shell';racers[1].shield=6;stepItems(racers,world,{item:true},.5,0);
 assert.equal(world.shells.length,0);assert.equal(racers[1].shield,0);assert.equal(racers[1].slow,0);assert.equal(racers[1].lastAttack.blocked,true);
});
test('casco ignora outra rota, pausa congela e sem alvo rebate e expira',()=>{
 const {racers,world}=setup();racers[1].shortcut=true;racers[0].offset=ROAD_LIMIT-.1;racers[0].angle=.8;
 const shell=launchShell(racers[0],racers);assert.equal(shell.target,null);world.shells.push(shell);const before={...shell};stepItems(racers,world,{},0,0);assert.deepEqual(shell,before);
 stepItems(racers,world,{},.1,.1);assert.equal(shell.bounces,1);
 for(let i=0;i<50;i++)stepItems(racers,world,{},.1,i*.1);
 assert.equal(world.shells.length,0);assert.equal(racers[1].lastAttack,null);
});
