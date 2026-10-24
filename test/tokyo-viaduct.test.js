import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCircuitCurve,trackLength,TUNNELS} from '../src/tracks.js';
import {surfaceProfile} from '../src/surface.js';
import {viaductPiers,addNeonInfrastructure} from '../src/neon-infrastructure.js';
import {addNeonCity} from '../src/neon-city.js';
const curve=createCircuitCurve('night'),length=trackLength('night');
function track(d,offset=0){const t=((d/length)%1+1)%1,p=curve.getPointAt(t),tangent=curve.getTangentAt(t);p.y=surfaceProfile(d,'night').height;const normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize(),up=new THREE.Vector3(0,1,0);p.addScaledVector(normal,offset);return {p,tangent,normal,up,quaternion:new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,up,tangent))};}
test('pilares chegam ao chão e deixam livre a passagem inferior do oito',()=>{
 const piers=viaductPiers(track);assert.ok(piers.length>25);assert.ok(viaductPiers(track,true).length<piers.length);const lower=track(.75*length).p;
 for(const pier of piers){assert.ok(pier.height>0);if(pier.frame.p.y>20)for(const foot of pier.feet)assert.ok(Math.hypot(foot.x-lower.x,foot.z-lower.z)>17);}
 assert.ok(TUNNELS.night.every(t=>!(t.start<.75&&t.end>.75)));
});
test('viaduto possui laje contínua, vigas e colunas; repetição usa instâncias',()=>{
 const root=new THREE.Group(),obstacles=[];addNeonInfrastructure(root,track,false,obstacles);const deck=root.getObjectByName('Continuous viaduct deck');assert.ok(deck&&obstacles.includes(deck));assert.ok(root.getObjectByName('Grounded viaduct column'));assert.ok(root.getObjectByName('Viaduct crosshead'));assert.ok(root.children.filter(o=>o.isInstancedMesh).length>=4);assert.ok(root.children.length<450);
 const points=deck.geometry.attributes.position,count=points.count;for(let i=0;i<4;i++)for(let axis=0;axis<3;axis++)assert.ok(Math.abs(points.array[i*3+axis]-points.array[(count-4+i)*3+axis])<.001);
});
test('fachadas têm grandes painéis, e modo leve reduz a quantidade',()=>{
 const root=new THREE.Group(),light=new THREE.Group();addNeonCity(root,track,false);addNeonCity(light,track,true);const count=r=>{let n=0;r.traverse(o=>{if(o.name==='Tokyo style illuminated billboard')n++;});return n;};assert.ok(count(root)>20);assert.ok(count(light)<count(root));
});
