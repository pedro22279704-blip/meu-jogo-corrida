import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace} from '../src/race.js';
import {steerManually} from '../src/manual-steering.js';

function turn({steer=1,speed=32,drift=false,sensitivity=1}={}){const r=createRace({sensitivity})[0];Object.assign(r,{speed,drifting:drift,driftDirection:1});for(let i=0;i<120;i++)steerManually(r,steer,1/60);return r;}
test('direção cheia descreve curva mais larga que a regulagem anterior',()=>{const r=turn();assert.ok(r.yawRate>1&&r.yawRate<1.2);assert.ok(r.speed/r.yawRate>r.speed/1.65*1.35);});
test('drift aberto amplia raio, mas mantém contravolante e sentido escolhido',()=>{const closed=turn({drift:true}),neutral=turn({drift:true,steer:0}),counter=turn({drift:true,steer:-1});assert.ok(closed.yawRate>.7&&closed.yawRate<.9);assert.ok(closed.speed/closed.yawRate>closed.speed/1.3*1.5);assert.ok(neutral.yawRate>0&&neutral.yawRate<closed.yawRate);assert.ok(counter.yawRate<0);assert.ok(closed.driftSlip>.2);});
test('pequenos comandos analógicos são progressivos e o nitro não fecha a curva',()=>{const full=turn(),small=turn({steer:.25}),fast=turn({speed:49});assert.ok(small.yawRate>0&&small.yawRate<full.yawRate*.25);assert.ok(fast.yawRate<full.yawRate);const left=turn({steer:-1});assert.ok(Math.abs(left.yawRate+full.yawRate)<1e-8);});
test('soltar o volante interrompe o giro sem corrigir o rumo para a pista',()=>{const r=turn(),before=r.heading;for(let i=0;i<90;i++)steerManually(r,0,1/60);assert.ok(Math.abs(r.yawRate)<1e-6);const held=r.heading;for(let i=0;i<60;i++)steerManually(r,0,1/60);assert.ok(Math.abs(r.heading-held)<1e-6);assert.notEqual(r.heading,0);assert.notEqual(before,0);});
