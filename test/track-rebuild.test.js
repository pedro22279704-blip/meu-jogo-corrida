import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCircuitCurve,trackLength,TUNNELS} from '../src/tracks.js';
import {surfaceProfile} from '../src/surface.js';
import {createRace,stepRace,lapOf,resolveCollisions} from '../src/race.js';
import {createItems,stepItems} from '../src/items.js';
import {draftingTarget} from '../src/drafting.js';
import {recordScope} from '../src/settings.js';
import {saveGhost,readGhost} from '../src/ghost.js';
import {saveBest,readBest} from '../src/records.js';
import {exportProgress,importProgress} from '../src/progress-backup.js';
import {addTrackStructures} from '../src/track-structures.js';
import {safeCameraPosition} from '../src/camera-comfort.js';

test('Vale Neon e Porto Âmbar preservam traçado, comprimento e recordes',()=>{
 const expected={valley:[[0,74],[88.16890449102728,28.84944382756752],[57.12911026241478,-72.99519984337215],[-51.22110348350991,-51.9968404087554],[-100.87960472800727,24.032545601292036]],harbor:[[0,85],[122.7661246811528,33.47118194485417],[91.22665865144361,-80.16608798760103],[-55.91860328130824,-91.73505731040625],[-101.94088221814516,28.058670005214353]]};
 for(const id of ['valley','harbor']){const curve=createCircuitCurve(id);assert.equal(trackLength(id),760);expected[id].forEach(([x,z],i)=>assert.ok(curve.getPointAt(i/5).distanceTo(new THREE.Vector3(x,0,z))<1e-8));assert.equal(recordScope({track:id,difficulty:'medium'}),`${id}-medium`);}
 assert.equal(surfaceProfile(380,'valley').height,10);assert.equal(surfaceProfile(190,'harbor').height,4.4);
});

test('novos traçados são maiores, com curvas distintas e cruzamento do oito separado em altura',()=>{
 for(const [id,length] of Object.entries({fair:1440,sawmill:1680,night:1900})){const curve=createCircuitCurve(id);assert.equal(trackLength(id),length);assert.ok(Math.abs(curve.getLength()-length)<.01);assert.equal(TUNNELS[id].length,2);assert.ok(TUNNELS[id].every(t=>(t.end-t.start)*length>100));}
 const curve=createCircuitCurve('night');assert.ok(curve.getPointAt(.25).distanceTo(curve.getPointAt(.75))<.01);assert.equal(surfaceProfile(.25*1900,'night').height-surfaceProfile(.75*1900,'night').height,24);
 // Non-neighbouring parts of the two ground-level layouts must not cross.
 for(const id of ['fair','sawmill']){const curve=createCircuitCurve(id),samples=curve.getSpacedPoints(400);for(let i=0;i<400;i++)for(let j=i+1;j<400;j++){const gap=Math.min(j-i,400-(j-i))*trackLength(id)/400;if(gap>45)assert.ok(samples[i].distanceTo(samples[j])>19,`${id}: ${i}/${j}`);}}
});

test('voltas e chegada usam a extensão de cada pista, sem terminar no antigo limite',()=>{
 for(const track of ['fair','sawmill','night']){const [r]=createRace({track});r.distance=760;r.speed=32;stepRace([r],{up:true},1/60,1);assert.equal(lapOf(r),1);r.distance=2280;stepRace([r],{up:true},1/60,2);assert.equal(r.finished,false);r.distance=trackLength(track)*3-.1;stepRace([r],{up:true},1/60,3);assert.equal(r.finished,true);assert.equal(r.distance,trackLength(track)*3);}
});

test('itens, vácuo e colisões reconhecem a linha de chegada das pistas maiores',()=>{
 for(const track of ['fair','sawmill','night']){const length=trackLength(track),[a,b]=createRace({track}),items=createItems({track});assert.ok(items.boxes.length<=30&&items.boxes.length>12);assert.ok(items.boxes.some(b=>b.distance>760));a.distance=length-6;b.distance=5;a.offset=b.offset=0;a.speed=b.speed=30;assert.equal(draftingTarget(a,[a,b]),b);a.distance=length-.5;b.distance=.5;resolveCollisions([a,b]);assert.ok(Math.abs(a.distance-(length-.5))>.01||Math.abs(a.offset)>0);a.distance=length+items.boxes.at(-1).distance;a.offset=items.boxes.at(-1).offset;stepItems([a],items,{},.01,1);assert.ok(a.item);}
});

test('backup mantém recordes e fantasmas antigos e novos sem misturá-los',()=>{
 const memory=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};},source=memory(),target=memory();
 for(const track of ['fair','sawmill','night'])for(const legacy of [true,false]){const scope=legacy?`${track}-medium`:recordScope({track,difficulty:'medium'}),length=legacy?760:trackLength(track),time=legacy?90:180,samples=[[0,0,0,0,0,0],[time,length*3,0,0,0,32]];saveBest(source,time,scope);assert.ok(saveGhost(source,scope,time,7,samples));assert.ok(readGhost(source,scope));}
 importProgress(target,exportProgress(source));for(const track of ['fair','sawmill','night']){assert.equal(readBest(target,`${track}-medium`),90);assert.equal(readBest(target,`${track}-r2-medium`),180);assert.equal(readGhost(target,`${track}-r2-medium`).samples.at(-1)[1],trackLength(track)*3);assert.equal(readGhost(target,`${track}-medium`).samples.at(-1)[1],2280);}
});

test('túneis acompanham o relevo e bloqueiam a câmera que tenta atravessar o teto',()=>{
 for(const id of ['fair','sawmill','night']){const curve=createCircuitCurve(id),length=trackLength(id),root=new THREE.Group(),obstacles=[];
  function frame(d,offset=0){const t=((d/length)%1+1)%1,profile=surfaceProfile(d,id),p=curve.getPointAt(t),tangent=curve.getTangentAt(t);tangent.y=profile.grade;tangent.normalize();const normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize().multiplyScalar(Math.cos(profile.bank));normal.y=Math.sin(profile.bank);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();const up=new THREE.Vector3().crossVectors(tangent,normal).normalize();p.y=profile.height;p.addScaledVector(normal,offset);return {p,normal,up,tangent,quaternion:new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,up,tangent))};}
  addTrackStructures(root,frame,id,obstacles);root.updateMatrixWorld(true);assert.ok(obstacles.length>0);
  for(const spec of TUNNELS[id]){const f=frame((spec.start+spec.end)/2*length),target=f.p.clone().addScaledVector(f.up,2),desired=f.p.clone().addScaledVector(f.up,15),safe=safeCameraPosition(target,desired,obstacles);assert.ok(safe.distanceTo(target)<8);assert.ok(safe.distanceTo(target)>5);const inside=f.p.clone().addScaledVector(f.up,6);assert.ok(safeCameraPosition(target,inside,obstacles).distanceTo(inside)<1e-7);}
 }
});
