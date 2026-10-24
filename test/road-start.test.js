import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {createRoadRibbon} from '../src/road-surface.js';
import {signalPhase,StartSignal} from '../src/start-signal.js';
import {renderPixelRatio} from '../src/smooth-renderer.js';
import {RaceAudio} from '../src/audio.js';

test('acostamentos deixam o centro livre, sem superfícies amarelas sob o asfalto',()=>{
 const track=(d,offset)=>({p:new THREE.Vector3(offset,0,d)}),g=createRoadRibbon(track,100,10,16,{innerWidth:12,height:.01});const p=g.attributes.position;for(let i=0;i<p.count;i++)assert.ok(Math.abs(p.getX(i))>=6);let area=0;const a=new THREE.Vector3(),b=new THREE.Vector3(),c=new THREE.Vector3();for(let i=0;i<g.index.count;i+=3){a.fromBufferAttribute(p,g.index.getX(i));b.fromBufferAttribute(p,g.index.getX(i+1));c.fromBufferAttribute(p,g.index.getX(i+2));area+=b.sub(a).cross(c.sub(a)).length()/2;}assert.ok(Math.abs(area-400)<.001);assert.ok([...p.array].every(Number.isFinite));
});
test('resolução respeita modo leve e limita memória em telas de alta densidade',()=>{
 assert.equal(renderPixelRatio('light',3,1920,1080),1);assert.equal(renderPixelRatio('pretty',1,1280,720),1);assert.ok(renderPixelRatio('pretty',3,1920,1080)<=1.01);assert.equal(renderPixelRatio('pretty',3,390,844),2);assert.ok(renderPixelRatio('pretty',2,3840,2160)<1);
});
test('semáforo acende uma, duas e três luzes; verde libera a largada',()=>{
 for(const [remaining,lit] of [[3,1],[2.1,1],[2,2],[1.1,2],[1,3]]){const p=signalPhase(remaining);assert.equal(p.lit,lit);assert.equal(p.green,false);}assert.equal(signalPhase(0).green,true);assert.equal(signalPhase(-.1).label,'JÁ!');
});
test('pausa não repete sinais; nova largada reinicia e áudio bloqueado é tentado novamente',()=>{
 const lamps=Array.from({length:3},()=>({dataset:{}})),label={textContent:''},root={dataset:{},hidden:true,querySelectorAll:()=>lamps,setAttribute(){}},previous=globalThis.document;globalThis.document={getElementById:id=>id==='countdown'?root:label};
 try{let ready=false;const sounds=[],signal=new StartSignal({startSignal:n=>{if(!ready)return false;sounds.push(n);return true;}});signal.begin();ready=true;signal.update('countdown',2.9,.1);signal.update('countdown',2.8,.1);signal.update('paused',2.8,0);signal.update('countdown',2,.1);signal.update('countdown',1,.1);signal.update('racing',0,.1);assert.deepEqual(sounds,[3,2,1,0]);signal.update('racing',0,1);assert.ok(root.hidden);signal.begin();assert.equal(sounds.at(-1),3);assert.equal(root.hidden,false);}finally{globalThis.document=previous;}
});
test('sinais sonoros são originais, curtos e liberam seus nós ao terminar',()=>{
 const osc=[],audio=new RaceAudio(),parameter=()=>({setValueAtTime(){},linearRampToValueAtTime(){},exponentialRampToValueAtTime(){}});audio.effects={};audio.context={state:'running',currentTime:0,createOscillator(){const node={frequency:{},connect(){return this;},disconnect(){this.disconnected=true;},start(){},stop(t){this.end=t;}};osc.push(node);return node;},createGain:()=>({gain:parameter(),connect(){},disconnect(){}})};assert.ok(audio.startSignal(3));assert.ok(audio.startSignal(0));assert.ok(osc[2].frequency.value>osc[0].frequency.value);assert.ok(osc[2].end>osc[0].end);for(const o of osc){o.onended();assert.ok(o.disconnected);}
});
