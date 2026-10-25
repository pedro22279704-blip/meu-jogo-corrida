import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {TRACKS,PREVIOUS_LENGTHS,REVISION3_LENGTHS,createCircuitCurve,trackLength,lengthForScope} from '../src/tracks.js';
import {surfaceProfile} from '../src/surface.js';
import {createEmbankment} from '../src/track-landscape.js';
import {createItems} from '../src/items.js';
import {saveBest,readBest} from '../src/records.js';
import {saveGhost,readGhost} from '../src/ghost.js';
import {exportProgress,importProgress} from '../src/progress-backup.js';

const wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
test('comprimento geométrico e anunciado crescem mais 50% nas cinco pistas',()=>{
 for(const id of Object.keys(TRACKS)){const curve=createCircuitCurve(id);assert.equal(trackLength(id),REVISION3_LENGTHS[id]*1.5);assert.ok(Math.abs(curve.getLength()-trackLength(id))<.001);assert.ok(curve.getPointAt(0).distanceTo(curve.getPointAt(1))<1e-8);}
});

test('curvas têm raio suficiente para o drift atual, sem cotovelos apertados',()=>{
 for(const id of Object.keys(TRACKS)){const curve=createCircuitCurve(id),length=trackLength(id);let minimum=Infinity;
  for(let i=0;i<2400;i++){const t=i/2400,a=curve.getTangentAt((t-.00025+1)%1),b=curve.getTangentAt((t+.00025)%1),turn=Math.abs(wrap(Math.atan2(b.x,b.z)-Math.atan2(a.x,a.z))),radius=.0005*length/Math.max(1e-9,turn);minimum=Math.min(minimum,radius);}
  assert.ok(minimum>30,`${id}: raio ${minimum}`);
  // Even at the maximum power-up speed, the tightest bend fits the available full-drift yaw.
  assert.ok(46/minimum<1.8*.89*.92,`${id}: drift exigiria giro excessivo`);
 }
});

test('relevo inclui planícies, elevações e curvas inclinadas, sem degraus na volta',()=>{
 for(const id of Object.keys(TRACKS)){const length=trackLength(id);let flat=0,min=Infinity,max=-Infinity,bank=0;
  for(let i=0;i<600;i++){const p=surfaceProfile(i*length/600,id);assert.ok(Object.values(p).every(Number.isFinite));assert.ok(Math.abs(p.grade)<.35);assert.ok(Math.abs(p.bank)<=.400001);if(Math.abs(p.grade)<1e-8)flat++;min=Math.min(min,p.height);max=Math.max(max,p.height);bank=Math.max(bank,Math.abs(p.bank));}
  assert.ok(flat>60,id);assert.ok(max-min>=6,id);assert.ok(bank>.12,id);
  const a=surfaceProfile(-.001,id),b=surfaceProfile(length-.001,id),c=surfaceProfile(.001,id);for(const key of ['height','grade','bank']){assert.ok(Math.abs(a[key]-b[key])<1e-8);assert.ok(Math.abs(a[key]-c[key])<.01);}
 }
 assert.ok(Math.abs(surfaceProfile(trackLength('valley')*.6655,'valley').bank)>.3);
});

test('cápsulas continuam distribuídas pelo percurso inteiro',()=>{
 for(const id of Object.keys(TRACKS)){const length=trackLength(id),stations=[...new Set(createItems({track:id}).boxes.map(b=>b.distance))];assert.ok(stations.length>=8);assert.ok(stations.at(-1)>length*.9);assert.ok(stations[0]<110);for(let i=1;i<stations.length;i++)assert.ok(stations[i]-stations[i-1]<=205);}
});

test('aterros fazem transição do piso elevado para o chão e deixam intervalos livres',()=>{
 const frame=(d,o)=>({p:new THREE.Vector3(o,20+o*.1,d)}),g=createEmbankment(frame,100,{steps:20,skip:d=>d>40&&d<60}),full=createEmbankment(frame,100,{steps:20});
 assert.ok([...g.attributes.position.array,...g.attributes.normal.array].every(Number.isFinite));assert.ok(g.index.count<full.index.count);
 for(let i=8;i<g.attributes.position.count;i+=9)assert.ok(Math.abs(g.attributes.position.getY(i)+.12)<1e-6);
 g.dispose();full.dispose();
});

test('backup mantém as quatro gerações de recordes e fantasmas em suas distâncias originais',()=>{
 const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};},a=storage(),b=storage(),cases=[];
 for(const id of Object.keys(TRACKS))for(const version of [1,2,3,4]){
  if(version===2&&!['fair','sawmill','night'].includes(id))continue;
  const scope=id+(version===1?'':'-r'+version)+'-medium',length=version===1?760:version===2?PREVIOUS_LENGTHS[id]:version===3?REVISION3_LENGTHS[id]:trackLength(id),time=length*3/25;
  assert.equal(lengthForScope(scope),length);saveBest(a,time,scope);assert.ok(saveGhost(a,scope,time,0,[[0,0,0,0,0,0],[time,length*3,0,0,0,25]]));cases.push({scope,time,length});
 }
 importProgress(b,exportProgress(a));for(const {scope,time,length} of cases){assert.equal(readBest(b,scope),time);assert.equal(readGhost(b,scope).samples.at(-1)[1],length*3);}
});
