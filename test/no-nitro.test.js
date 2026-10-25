import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace} from '../src/race.js';
import {createItems,stepItems} from '../src/items.js';
import {readStandardPad} from '../src/gamepad.js';
import {createTutorial,updateTutorial,tutorialMessage} from '../src/tutorial.js';

test('comando legado de nitro é ignorado e karts não têm tanque ou recarga',()=>{
 const a=createRace()[0],b=createRace()[0];
 for(let i=0;i<100;i++){const input={up:true,steer:.1};stepRace([a],input,.02,i*.02);stepRace([b],{...input,boost:true},.02,i*.02);assert.equal('nitro' in a,false);assert.equal('nitro' in b,false);}
 assert.deepEqual(a,b);assert.equal(a.boosting,false);
});

test('adversários também perdem nitro automático, mas mantêm impulsos dos poderes',()=>{
 const ai=createRace()[1];ai.distance=100;ai.offset=0;ai.speed=25;
 for(let i=0;i<120;i++){stepRace([ai],{},.02,i*.02);assert.equal(ai.boosting,false);assert.equal('nitro' in ai,false);}
 ai.miniTurbo=.5;ai.turboLevel=2;stepRace([ai],{},.02,3);assert.equal(ai.boosting,true);
});

test('X e RB não acionam nitro nem outro comando de corrida',()=>{
 const pad={connected:true,mapping:'standard',axes:[0,0],buttons:Array.from({length:17},()=>({pressed:false,value:0}))};pad.buttons[2].pressed=true;pad.buttons[5].pressed=true;
 const state=readStandardPad(pad);assert.equal('boost' in state,false);for(const key of ['up','down','drift','item'])assert.equal(state[key],false);
});

test('treino tem quatro passos e termina sem pedir nitro',()=>{
 const state=createTutorial(),r=createRace()[0];assert.match(tutorialMessage(state),/1\/4/);r.speed=20;updateTutorial(state,r,{left:true});r.goodDrifts=1;updateTutorial(state,r,{});assert.match(tutorialMessage(state),/4\/4/);
 r.item='shield';updateTutorial(state,r,{});r.item=null;updateTutorial(state,r,{item:true});assert.match(tutorialMessage(state),/Complete/);assert.equal('boost' in state,false);
});

test('cogumelo continua dando impulso mesmo sem o sistema de nitro',()=>{
 const r=createRace()[0],world=createItems();world.boxes=[];r.speed=25;r.item='mushroom';stepItems([r],world,{item:true},.01,0);stepRace([r],{up:true},.01,0);
 assert.ok(r.miniTurbo>2);assert.equal(r.boosting,true);assert.ok(r.speed>25);assert.equal('nitro' in r,false);
});
