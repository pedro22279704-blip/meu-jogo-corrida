import test from 'node:test';
import assert from 'node:assert/strict';
import {createRace,stepRace,ROAD_LIMIT} from '../src/race.js';
import {createArcadeCourse,stepArcade} from '../src/arcade-race.js';
import {courseHeading,wrapAngle} from '../src/manual-steering.js';
import {driveInput} from './drive-helper.js';
import {surfaceProfile} from '../src/surface.js';

for(const track of ['valley','harbor','fair','sawmill','night']){
 test(`${track}: acelerar com nitro e poderes de pista não completa corrida sozinho`,()=>{
  const r=createRace({track})[0],c=createArcadeCourse(track);
  for(let i=0;i<8000;i++){stepRace([r],{up:true,boost:true},.05,i*.05);stepArcade([r],c,{up:true},.05);}
  assert.equal(r.finished,false);assert.ok(r.collisions>0);assert.ok(Math.abs(r.offset)<=ROAD_LIMIT);assert.ok(r.distance<c.length);assert.equal(r.speed,0);
 });
 test(`${track}: entradas de direção e freio permitem completar três voltas`,()=>{
  const r=createRace({track})[0];
  for(let i=0;i<10000&&!r.finished;i++)stepRace([r],driveInput(r),.05,i*.05);
  assert.equal(r.finished,true,`${track}: d=${r.distance} offset=${r.offset} heading=${r.heading}`);
 });
}
test('sem virar, o rumo global é preservado na curva',()=>{
 const r=createRace()[0];Object.assign(r,{speed:25,offset:0,distance:40});
 const before=courseHeading('valley',r.distance);for(let i=0;i<10;i++)stepRace([r],{up:true},.02,i*.02);
 const after=courseHeading('valley',r.distance)+(r.heading??0);assert.ok(Math.abs(wrapAngle(after-before))<1e-5);
});
test('barreira não alinha o kart nem concede avanço, mas direção permite sair',()=>{
 const r=createRace()[0];Object.assign(r,{distance:100,offset:ROAD_LIMIT,angle:.6,heading:.6,speed:30});
 stepRace([r],{up:true},.05,0);const d=r.distance;assert.equal(r.speed,0);assert.ok(r.heading>.5);
 for(let i=0;i<100;i++)stepRace([r],{up:true},.05,i*.05);assert.equal(r.distance,d);
 for(let i=0;i<70;i++)stepRace([r],{up:true,right:true},.05,i*.05);assert.ok(r.offset<ROAD_LIMIT-1);assert.ok(r.distance>d);
});
test('adversários não carregam o jogador até a chegada sem direção',()=>{
 for(const track of ['valley','harbor','fair','sawmill','night']){const racers=createRace({track}),course=createArcadeCourse(track);for(let i=0;i<7000;i++){stepRace(racers,{up:true,boost:true},.05,i*.05,d=>surfaceProfile(d,track));stepArcade(racers,course,{up:true},.05);}assert.equal(racers[0].finished,false,track);assert.ok(racers.slice(1).every(r=>r.finished),track);}
});
