import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCup,scoreCup,cupStandings,cupComplete,advanceCup,HORIZON_TRACKS,HORIZON_POINTS} from '../src/championship.js';
import {createRace,stepRace,orderRacers} from '../src/race.js';
import {createItems,stepItems} from '../src/items.js';
import {createCircuitCurve,trackLength} from '../src/tracks.js';
import {surfaceProfile} from '../src/surface.js';
import {tourFrame,tourCamera,TOUR_SHOT_SECONDS} from '../src/cup-tour.js';

test('Copa Horizonte usa as quatro primeiras pistas; campeonato clássico continua disponível',()=>{
 const cup=createCup('horizon');assert.deepEqual(cup.tracks,['valley','harbor','fair','sawmill']);assert.deepEqual(cup.points,[15,12,10,9,8,7,6,5]);assert.deepEqual(createCup().tracks,['valley','harbor']);cup.tracks.pop();cup.points[0]=99;assert.equal(HORIZON_TRACKS.length,4);assert.equal(HORIZON_POINTS[0],15);
});
test('etapas esperam todos, pontuam uma vez e não avançam além da final',()=>{
 const cup=createCup('horizon'),race=createRace();race.forEach((r,i)=>{r.finished=true;r.finishTime=i+1;});assert.equal(advanceCup(cup),false);
 for(let round=0;round<4;round++){race[7].finished=false;assert.equal(scoreCup(cup,race),false);race[7].finished=true;assert.equal(scoreCup(cup,race),true);assert.equal(scoreCup(cup,race),false);assert.equal(cupComplete(cup),round===3);assert.equal(advanceCup(cup),round<3);}
 assert.equal(cup.scores[0],60);assert.equal(cupStandings(cup)[0].pilot,0);assert.equal(cup.results.length,4);assert.equal(scoreCup(cup,race),false);
});
test('os oito pilotos completam as quatro corridas com itens e acumulam a copa inteira',()=>{
 const cup=createCup('horizon');do{const track=cup.tracks[cup.round],race=createRace({track,pilot:7,difficulty:'medium'}),items=createItems({track});for(let i=0;i<24000&&!race.every(r=>r.finished);i++){stepRace(race,{up:true},1/60,i/60,d=>surfaceProfile(d,track));stepItems(race,items,{item:i%180===0},1/60,i/60);}assert.ok(race.every(r=>r.finished),track);assert.ok(scoreCup(cup,orderRacers(race)));}while(advanceCup(cup));assert.ok(cupComplete(cup));assert.equal(cup.scores.reduce((a,b)=>a+b,0),HORIZON_POINTS.reduce((a,b)=>a+b,0)*4);assert.equal(new Set(cupStandings(cup).map(r=>r.pilot)).size,8);
});
test('apresentação percorre doze tomadas e movimento reduzido usa quatro vistas estáticas',()=>{
 for(let i=0;i<12;i++){const frame=tourFrame((i+.1)*TOUR_SHOT_SECONDS,HORIZON_TRACKS);assert.equal(frame.track,HORIZON_TRACKS[Math.floor(i/3)]);assert.equal(frame.shot,i%3);assert.equal(frame.done,false);}assert.ok(tourFrame(12*TOUR_SHOT_SECONDS,HORIZON_TRACKS).done);
 for(let i=0;i<4;i++){const frame=tourFrame(i*4+.1,HORIZON_TRACKS,true);assert.equal(frame.index,i);assert.equal(frame.shot,0);}assert.ok(tourFrame(16,HORIZON_TRACKS,true).done);
});
test('câmeras das quatro pistas são finitas e movimento reduzido fixa o enquadramento',()=>{
 for(const id of HORIZON_TRACKS){const curve=createCircuitCurve(id),length=trackLength(id),world={curve,track(d,offset=0){const t=((d/length)%1+1)%1,p=curve.getPointAt(t),tangent=curve.getTangentAt(t),normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize(),up=new THREE.Vector3(0,1,0);p.y=surfaceProfile(d,id).height;p.addScaledVector(normal,offset);return {p,tangent,normal,up};}};const signatures=[];
  for(let shot=0;shot<3;shot++){for(const u of [0,.5,1]){const view=tourCamera(world,id,shot,u);assert.ok([...view.position.toArray(),...view.target.toArray(),view.fov].every(Number.isFinite));assert.ok(view.position.distanceTo(view.target)>1);}signatures.push(tourCamera(world,id,shot,.5).position.toArray().join(','));assert.deepEqual(tourCamera(world,id,shot,0,true),tourCamera(world,id,shot,1,true));}assert.equal(new Set(signatures).size,3);
 }
});
