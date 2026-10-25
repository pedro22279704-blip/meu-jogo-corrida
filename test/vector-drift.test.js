import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace,ROAD_LIMIT} from '../src/race.js';
import {steerManually,wrapAngle} from '../src/manual-steering.js';
import {driftColor,DRIFT_LEVELS} from '../src/drift.js';

function kart(direction=1){const r=createRace()[0];return Object.assign(r,{speed:30,distance:200,offset:0,heading:0,drifting:true,driftDirection:direction});}
test('entrada conserva embalo e gira a carroceria para dentro nos dois lados',()=>{
 for(const d of [-1,1]){const r=kart(d);for(let i=0;i<6;i++)steerManually(r,d,1/60);
 assert.ok(r.angle*d>.1);assert.ok(wrapAngle(r.angle-r.heading)*d>.15);
 assert.ok(Math.abs(r.heading)<Math.abs(r.angle)*.4);
 // Velocity really differs from body direction, not just a change to wheel pose.
 const bodyX=Math.sin(r.angle)*r.speed,travelX=Math.sin(r.heading)*r.speed;
 assert.ok((bodyX-travelX)*d>4);
 }
});
test('drift não acrescenta força dependente da proximidade da borda',()=>{
 const a=kart(),b=kart();b.offset=6;
 for(let i=0;i<15;i++){stepRace([a],{up:true,steer:.3,drift:true},1/120,i/120);stepRace([b],{up:true,steer:.3,drift:true},1/120,i/120);}
 assert.ok(Math.abs((b.offset-a.offset)-6)<1e-8);assert.equal(a.heading,b.heading);
});
test('comandos fecham e abrem o raio sem inverter lado; recuperação não dá tranco',()=>{
 const run=steer=>{const r=kart();r.driftSlip=.42;for(let i=0;i<60;i++)steerManually(r,steer,1/60);return r;};
 const inner=run(1),neutral=run(0),outer=run(-1);
 assert.ok(inner.heading>neutral.heading&&neutral.heading>outer.heading);assert.ok(outer.heading>0);
 const before=inner.heading;inner.drifting=false;steerManually(inner,0,1/120);
 assert.ok(Math.abs(wrapAngle(inner.heading-before))<.02);
 for(let i=0;i<120;i++)steerManually(inner,0,1/120);
 assert.ok(Math.abs(inner.driftSlip)<.001);
});
test('entrada vetorial tem mesmo resultado a 30, 60 e 120 FPS',()=>{
 const run=hz=>{const r=kart();for(let i=0;i<hz;i++)steerManually(r,.7,1/hz);return r;};
 const a=run(30);for(const hz of [60,120]){const b=run(hz);assert.ok(Math.abs(a.heading-b.heading)<1e-9);assert.ok(Math.abs(a.angle-b.angle)<1e-9);}
});
test('batida, lentidão e baixa velocidade cancelam carga sem prêmio ao soltar',()=>{
 for(const state of [{hit:.4},{slow:1},{speed:5}]){const r=kart();Object.assign(r,{driftCharge:1},state);stepRace([r],{up:true},1/60,0);assert.equal(r.drifting,false);assert.equal(r.miniTurbo,0);assert.equal(r.goodDrifts,0);}
 const r=kart();Object.assign(r,{offset:ROAD_LIMIT,heading:.6,driftCharge:1});stepRace([r],{up:true,drift:true,steer:1},1/60,0);assert.equal(r.driftCharge,0);stepRace([r],{},1/60,.02);assert.equal(r.miniTurbo,0);
});
test('pausa congela carga, direção e turbo',()=>{const r=kart();r.driftCharge=.6;const before=JSON.stringify(r);stepRace([r],{up:true,drift:true,steer:1},0,10);assert.equal(JSON.stringify(r),before);});
test('faíscas só ficam azuis após carga e depois vermelhas',()=>{assert.equal(driftColor(0),'#ffce64');assert.equal(driftColor(.42),'#ffce64');assert.equal(driftColor(.5),DRIFT_LEVELS[0].color);assert.equal(driftColor(1),DRIFT_LEVELS[1].color);});
