import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace} from '../src/race.js';
import {steerManually,wrapAngle} from '../src/manual-steering.js';

function turn({steer=1,speed=32,drift=false,sensitivity=1}={}){const r=createRace({sensitivity})[0];Object.assign(r,{speed,drifting:drift,driftDirection:1});for(let i=0;i<120;i++)steerManually(r,steer,1/60);return r;}
test('direção consegue contornar curva de vinte metros no ritmo normal',()=>{const r=turn(),radius=r.speed/r.yawRate;assert.ok(radius>16&&radius<22,`raio ${radius}`);});
test('drift fecha mais que direção comum; contravolante abre sem inverter a curva',()=>{const normal=turn(),closed=turn({drift:true}),neutral=turn({drift:true,steer:0}),counter=turn({drift:true,steer:-1});assert.ok(closed.speed/closed.yawRate<normal.speed/normal.yawRate);assert.ok(closed.speed/closed.yawRate>15);assert.ok(neutral.yawRate>counter.yawRate&&neutral.yawRate<closed.yawRate);assert.ok(counter.yawRate>0);assert.ok(closed.driftSlip>.4);});

test('traseira sai para fora nos dois sentidos sem deslocamento lateral imposto pela pose',()=>{
 for(const direction of [-1,1]){
  const r=createRace()[0];Object.assign(r,{distance:10,speed:30,offset:0,heading:0,angle:direction*.5,driftSlip:direction*.5,slide:direction*12,drifting:true,driftDirection:direction});
  stepRace([r],{up:true,steer:0,drift:true},.02,0);
  assert.ok(Math.abs(r.slide)<.2,`velocidade lateral residual ${r.slide}`);assert.ok(Math.abs(r.offset)<.01);
  assert.ok(wrapAngle(r.angle-r.heading)*direction>.4);
 }
});

test('soltar drift recupera aderência e contravolante funciona em alta velocidade',()=>{
 const r=turn({drift:true,speed:49}),before=r.yawRate;
 for(let i=0;i<30;i++)steerManually(r,-1,1/60);
 assert.ok(r.yawRate>0&&r.yawRate<before*.3);
 r.drifting=false;
 for(let i=0;i<30;i++)steerManually(r,0,1/60);
 assert.ok(Math.abs(r.driftSlip)<.002);assert.ok(Math.abs(r.yawRate)<.001);
});

test('drift não muda de comportamento entre 30 e 120 quadros por segundo',()=>{
 const run=hz=>{const r=createRace()[0];Object.assign(r,{speed:32,drifting:true,driftDirection:1});for(let i=0;i<hz;i++)steerManually(r,.6,1/hz);return r;};
 const a=run(30),b=run(120);assert.ok(Math.abs(wrapAngle(a.heading-b.heading))<.03);assert.ok(Math.abs(a.driftSlip-b.driftSlip)<.01);
});
test('pequenos comandos analógicos são progressivos e o nitro não fecha a curva',()=>{const full=turn(),small=turn({steer:.25}),fast=turn({speed:49});assert.ok(small.yawRate>0&&small.yawRate<full.yawRate*.25);assert.ok(fast.yawRate<full.yawRate);const left=turn({steer:-1});assert.ok(Math.abs(left.yawRate+full.yawRate)<1e-8);});
test('soltar o volante interrompe o giro sem corrigir o rumo para a pista',()=>{const r=turn(),before=r.heading;for(let i=0;i<90;i++)steerManually(r,0,1/60);assert.ok(Math.abs(r.yawRate)<1e-6);const held=r.heading;for(let i=0;i<60;i++)steerManually(r,0,1/60);assert.ok(Math.abs(r.heading-held)<1e-6);assert.notEqual(r.heading,0);assert.notEqual(before,0);});
