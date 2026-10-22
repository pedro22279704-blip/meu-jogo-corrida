import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {CHARACTERS,setCharacter} from '../src/characters.js';
import {bindKart,animateKart} from '../src/kart-animation.js';
import {createCar10} from '../src/car-10.js';
import {normalizeSettings,writeSettings,readSettings} from '../src/settings.js';

test('seleção persiste sem alterar piloto, recordes ou configurações antigas',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)};
 assert.equal(normalizeSettings({}).character,'original');
 assert.equal(normalizeSettings({character:'inválido'}).character,'original');
 for(const {id} of CHARACTERS){writeSettings(storage,{pilot:6,character:id});const settings=readSettings(storage);assert.equal(settings.character,id);assert.equal(settings.pilot,6);}
});

for(let i=0;i<7;i++)test(`personagens no kart ${i}: preservam carro, articulações, restauração e clones`,async()=>{
 let model=createCar10();
 if(i<6){const data=await readFile(new URL(`../public/models/kart-${i}.glb`,import.meta.url));model=(await new GLTFLoader().parseAsync(data.buffer.slice(data.byteOffset,data.byteOffset+data.byteLength),'')).scene;}
 let body;model.traverse(p=>{if(/^Body(?:[._]?\d+)?$/.test(p.name))body??=p;});
 const original=bindKart(model),geometry=body.geometry;
 const origin=original.driver.getWorldPosition(original.driver.position.clone());
 for(const {id} of CHARACTERS.slice(1)){
  setCharacter(model,id);const rig=bindKart(model);
  assert.equal(rig.driver.userData.character,id);assert.notEqual(rig.driver,original.driver);
  assert.ok(rig.driver.getWorldPosition(origin.clone()).distanceTo(origin)<1e-6);
  assert.ok(rig.arms.every(Boolean));assert.equal(rig.steering,original.steering);assert.deepEqual(rig.rolls,original.rolls);
  assert.equal(body.geometry,geometry);assert.equal(original.driver.visible,false);
  animateKart(rig,{speed:20,angle:.4,boosting:true,drifting:true,hit:0},.1,1);
  assert.equal(rig.driver.getObjectByName('Smile').scale.y,1.8);
  animateKart(rig,{speed:0,angle:0,finished:true,podiumPlace:1},.1,2);
  assert.ok(rig.arms.every(a=>a.quaternion.angleTo(a.userData.rest)>1));
  assert.equal(bindKart(model.clone(true)).driver.userData.character,id);
  setCharacter(model,id);assert.equal(bindKart(model).driver,rig.driver);
 }
 setCharacter(model,'original');const restored=bindKart(model);
 assert.equal(restored.driver,original.driver);assert.equal(restored.driver.visible,true);
 assert.equal(model.children.filter(c=>c.userData.character).length,0);
});
