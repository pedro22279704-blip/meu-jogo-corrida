import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createCircuitCurve,trackLength} from '../src/tracks.js';
import {citySites,addNeonCity} from '../src/neon-city.js';

const curve=createCircuitCurve('night'),length=trackLength('night');
function track(d,offset=0){const t=((d/length)%1+1)%1,p=curve.getPointAt(t),tangent=curve.getTangentAt(t),normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize();p.addScaledVector(normal,offset);return {p,tangent};}
test('prédios preservam espaço livre em toda a pista, inclusive no cruzamento do oito',()=>{
 const sites=citySites(track);assert.ok(sites.length>25);assert.ok(sites.some(s=>s.height>=90));for(const site of sites)for(let i=0;i<length;i++){const p=track(i).p;assert.ok(Math.hypot(site.x-p.x,site.z-p.z)>site.radius+10);}
 assert.deepEqual(citySites(track),sites);
});
test('modo leve reduz edifícios; janelas são agrupadas e a cidade fica apoiada no chão',()=>{
 const root=new THREE.Group(),lightRoot=new THREE.Group(),sites=addNeonCity(root,track,false),light=addNeonCity(lightRoot,track,true);assert.ok(light.length<sites.length);assert.ok(root.children.every(g=>g.position.y===0));let instanced=0;root.traverse(o=>{if(o.isInstancedMesh){instanced++;assert.ok(o.count>0);}});assert.equal(instanced,sites.length);
});
