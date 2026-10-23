import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTitleMusic} from '../src/title-music.js';
import {RaceAudio} from '../src/audio.js';

function context(){const sources=[],gains=[];return {sources,gains,state:'running',currentTime:1,createBuffer(channels,length,rate){const samples=new Float32Array(length);return {length,sampleRate:rate,getChannelData:()=>samples};},createBufferSource(){const source={connect(){},disconnect(){this.disconnected=true;},start(){this.started=true;},stop(t){this.stopped=t;}};sources.push(source);return source;},createGain(){const gain={gain:{value:0,setTargetAtTime(v){this.value=v;}},connect(){},disconnect(){this.disconnected=true;}};gains.push(gain);return gain;}};}
test('abertura tem composição original de oito compassos a 152 BPM sem amostras inválidas ou saturação',()=>{
 const ctx=context(),buffer=createTitleMusic(ctx),samples=buffer.getChannelData(0);assert.ok(Math.abs(buffer.length/buffer.sampleRate-128*60/152/4)<1/buffer.sampleRate);let energy=0,peak=0;for(const value of samples){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));energy+=value*value;}assert.ok(peak<.79);assert.ok(energy/samples.length>.005);assert.deepEqual(createTitleMusic(context()).getChannelData(0),samples);
});
test('repetir a abertura encerra a fonte anterior; sair para o menu faz fade e libera os nós',async()=>{
 const audio=new RaceAudio(),ctx=context();audio.context=ctx;audio.master={};audio.start=async()=>{};
 await audio.startTitle();const first=audio.titleSource,gain=audio.titleGain;assert.ok(first.loop&&first.started);await audio.startTitle();assert.equal(first.stopped,1.2);assert.notEqual(audio.titleSource,first);first.onended();assert.ok(first.disconnected&&gain.disconnected);const second=audio.titleSource;audio.stopTitle();assert.equal(audio.titleSource,null);assert.equal(second.stopped,1.2);
});
test('sair antes de o áudio desbloquear não inicia música atrasada; volume acompanha a configuração',async()=>{
 const audio=new RaceAudio(),ctx=context();audio.context=ctx;audio.master={};let ready;audio.start=()=>new Promise(resolve=>ready=resolve);const pending=audio.startTitle();audio.stopTitle();ready();assert.equal(await pending,false);assert.equal(ctx.sources.length,0);
 audio.start=async()=>{};await audio.startTitle();audio.setVolumes(.2,.5);assert.ok(Math.abs(audio.titleGain.gain.value-.18)<1e-9);audio.setVolumes(0,.5);assert.equal(audio.titleGain.gain.value,0);audio.stopTitle();
});
