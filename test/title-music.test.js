import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createTitleMusic,createEngineRev} from '../src/title-music.js';
import {RaceAudio} from '../src/audio.js';

function context(){const sources=[],gains=[];return {sources,gains,state:'running',currentTime:1,createBuffer(channels,length,rate){const samples=new Float32Array(length);return {length,sampleRate:rate,getChannelData:()=>samples};},createBufferSource(){const source={connect(){},disconnect(){this.disconnected=true;},start(){this.started=true;},stop(t){this.stopped=t;}};sources.push(source);return source;},createGain(){const gain={gain:{value:0,setTargetAtTime(v){this.value=v;}},connect(){},disconnect(){this.disconnected=true;}};gains.push(gain);return gain;}};}
test('abertura tem composição original de oito compassos a 152 BPM sem amostras inválidas ou saturação',()=>{
 const ctx=context(),buffer=createTitleMusic(ctx),samples=buffer.getChannelData(0);assert.ok(Math.abs(buffer.length/buffer.sampleRate-128*60/152/4)<1/buffer.sampleRate);let energy=0,peak=0;for(const value of samples){assert.ok(Number.isFinite(value));peak=Math.max(peak,Math.abs(value));energy+=value*value;}assert.ok(peak<.79);assert.ok(energy/samples.length>.005);assert.deepEqual(createTitleMusic(context()).getChannelData(0),samples);
});
test('repetir a abertura encerra a fonte anterior; encerrar a trilha faz fade e libera os nós',async()=>{
 const audio=new RaceAudio(),ctx=context();audio.context=ctx;audio.master={};audio.start=async()=>{};
 await audio.startTitle();const first=audio.titleSource,gain=audio.titleGain;assert.ok(first.loop&&first.started);await audio.startTitle();assert.equal(first.stopped,1.2);assert.notEqual(audio.titleSource,first);first.onended();assert.ok(first.disconnected&&gain.disconnected);const second=audio.titleSource;audio.stopTitle();assert.equal(audio.titleSource,null);assert.equal(second.stopped,1.2);
});

test('menu preserva a mesma música, reduz volume e não duplica fontes ao alternar abas',async()=>{
 const audio=new RaceAudio(),ctx=context();audio.context=ctx;audio.master={};audio.start=async()=>{};
 await audio.startTitle();const source=audio.titleSource,opening=audio.titleGain.gain.value;audio.menuMusic();assert.equal(audio.titleSource,source);assert.ok(audio.titleGain.gain.value<opening);assert.ok(Math.abs(audio.titleGain.gain.value/opening-2/3)<1e-9);for(let i=0;i<10;i++)audio.menuMusic();assert.equal(ctx.sources.length,1);audio.setVolumes(.5,.8);assert.equal(audio.titleGain.gain.value,.3);
 audio.stopTitle();
});

test('entrar durante o desbloqueio de áudio mantém a faixa pendente no volume do menu',async()=>{
 const audio=new RaceAudio(),ctx=context();audio.context=ctx;audio.master={};let ready;audio.start=()=>new Promise(resolve=>ready=resolve);const pending=audio.startTitle();audio.menuMusic();ready();assert.ok(await pending);assert.equal(ctx.sources.length,1);assert.equal(audio.titleMode,'menu');assert.equal(audio.titleGain.gain.value,.6*.7);audio.stopTitle();
});

test('iniciar a corrida encerra a trilha do menu; voltar recria apenas uma faixa baixa',async()=>{
 const audio=new RaceAudio(),ctx=context(),param=()=>({setTargetAtTime(value){this.value=value;}});audio.context=ctx;audio.master={};audio.start=async()=>{};await audio.startTitle('menu');const source=audio.titleSource;
 audio.engine={frequency:param()};audio.music={playbackRate:param()};audio.musicGain={gain:param()};audio.engineGain={gain:param()};audio.skid={gain:param()};audio.turboGain={gain:param()};audio.turbo={frequency:param()};
 audio.update({speed:20},true,true,false,false);assert.equal(audio.titleSource,null);assert.equal(source.stopped,1.2);assert.equal(audio.musicGain.gain.value,.65*.7);
 audio.update({speed:0},false,false,false,true);await Promise.resolve();assert.ok(audio.titleSource);assert.equal(audio.titleMode,'menu');assert.equal(audio.titleGain.gain.value,.6*.7);assert.equal(audio.musicGain.gain.value,0);audio.stopTitle();
});

test('motor original tem duração finita, termina em silêncio e é liberado após tocar',async()=>{
 const ctx=context(),buffer=createEngineRev(ctx),samples=buffer.getChannelData(0);assert.equal(buffer.length/buffer.sampleRate,1.5);let energy=0;for(const sample of samples){assert.ok(Number.isFinite(sample)&&Math.abs(sample)<.81);energy+=sample*sample;}assert.ok(energy/samples.length>.05);assert.ok(Math.abs(samples.at(-1))<.001);
 const audio=new RaceAudio();audio.context=ctx;audio.master={};audio.effects={};audio.start=async()=>{};await audio.startTitle('title',true);const source=audio.revSource;assert.ok(source.started);assert.equal(source.buffer, audio.revBuffer);assert.ok(!source.loop);source.onended();assert.equal(audio.revSource,null);assert.ok(source.disconnected);audio.stopTitle();
});
test('sair antes de o áudio desbloquear não inicia música atrasada; volume acompanha a configuração',async()=>{
 const audio=new RaceAudio(),ctx=context();audio.context=ctx;audio.master={};let ready;audio.start=()=>new Promise(resolve=>ready=resolve);const pending=audio.startTitle();audio.stopTitle();ready();assert.equal(await pending,false);assert.equal(ctx.sources.length,0);
 audio.start=async()=>{};await audio.startTitle();audio.setVolumes(.2,.5);assert.ok(Math.abs(audio.titleGain.gain.value-.18)<1e-9);audio.setVolumes(0,.5);assert.equal(audio.titleGain.gain.value,0);audio.stopTitle();
});
