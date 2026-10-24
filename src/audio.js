import {createTitleMusic,createEngineRev} from './title-music.js';
import {createRetroMusic} from './music.js';
// Áudio sintetizado localmente: não há arquivos ou serviços de terceiros.
export class RaceAudio{
 constructor(){this.muted=false;this.context=null;this.musicVolume=.7;this.effectsVolume=.8;}
 async start(){
  try{
   if(!this.context){
    const Audio=window.AudioContext||window.webkitAudioContext;if(!Audio)return;
    const ctx=this.context=new Audio();this.master=ctx.createGain();this.master.gain.value=this.muted?0:.22;this.master.connect(ctx.destination);this.effects=ctx.createGain();this.effects.gain.value=this.effectsVolume;this.effects.connect(this.master);
    this.engine=ctx.createOscillator();this.engine.type='sawtooth';this.engineGain=ctx.createGain();this.engineGain.gain.value=0;
    const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=600;
    this.engine.connect(filter).connect(this.engineGain).connect(this.effects);this.engine.start();
    const buffer=ctx.createBuffer(1,ctx.sampleRate,ctx.sampleRate);const data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
    const noise=ctx.createBufferSource();noise.buffer=buffer;noise.loop=true;
    const high=ctx.createBiquadFilter();high.type='bandpass';high.frequency.value=1800;
    this.skid=ctx.createGain();this.skid.gain.value=0;noise.connect(high).connect(this.skid).connect(this.effects);noise.start();
    this.turbo=ctx.createOscillator();this.turbo.type='sine';this.turbo.frequency.value=420;this.turboGain=ctx.createGain();this.turboGain.gain.value=0;this.turbo.connect(this.turboGain).connect(this.effects);this.turbo.start();
    this.musicGain=ctx.createGain();this.musicGain.gain.value=0;this.musicGain.connect(this.master);
    this.music=ctx.createBufferSource();this.music.buffer=createRetroMusic(ctx);this.music.loop=true;this.music.connect(this.musicGain);this.music.start();
   }
   await this.setPaused(false);
  }catch{ /* Corrida continua se o navegador bloquear áudio. */ }
 }
 async startTitle(mode='title',rev=false){
  this.stopTitle();this.titleMode=mode;this.titlePending=true;const generation=this.titleGeneration;await this.start();if(generation!==this.titleGeneration)return false;this.titlePending=false;if(!this.context)return false;
  const ctx=this.context;this.titleBuffer??=createTitleMusic(ctx);this.titleSource=ctx.createBufferSource();this.titleSource.buffer=this.titleBuffer;this.titleSource.loop=true;this.titleGain=ctx.createGain();this.titleGain.gain.value=this.titleLevel()*this.musicVolume;this.titleGain.connect(this.master);this.titleSource.connect(this.titleGain);this.titleSource.start();if(rev)this.revEngine();return ctx.state==='running';
 }
 titleLevel(){return this.titleMode==='menu'?.6:.9;}
 menuMusic(){
  if(this.titleMode==='menu'&&(this.titleSource||this.titlePending))return;
  this.titleMode='menu';if(this.titleGain)this.titleGain.gain.setTargetAtTime(.6*this.musicVolume,this.context.currentTime,.25);
  else if(!this.titlePending)this.startTitle('menu');
 }
 revEngine(){
  if(!this.context||!this.effects)return;
  this.revSource?.stop();const ctx=this.context,source=ctx.createBufferSource();this.revBuffer??=createEngineRev(ctx);source.buffer=this.revBuffer;source.connect(this.effects);source.onended=()=>{source.disconnect();if(this.revSource===source)this.revSource=null;};this.revSource=source;source.start();
 }
 stopTitle(){
  this.titleMode='off';this.titlePending=false;this.titleGeneration=(this.titleGeneration??0)+1;const source=this.titleSource,gain=this.titleGain;this.titleSource=null;this.titleGain=null;if(!source)return;
  const t=this.context.currentTime;gain.gain.setTargetAtTime(0,t,.04);source.onended=()=>{source.disconnect();gain.disconnect();};source.stop(t+.2);
 }
 setVolumes(music,effects){this.musicVolume=Math.max(0,Math.min(1,music));this.effectsVolume=Math.max(0,Math.min(1,effects));if(this.titleGain)this.titleGain.gain.setTargetAtTime(this.titleLevel()*this.musicVolume,this.context.currentTime,.05);if(this.effects)this.effects.gain.setTargetAtTime(this.effectsVolume,this.context.currentTime,.05);}
 setPaused(paused){
  this.playback=(this.playback??Promise.resolve()).then(async()=>{if(this.context&&this.context.state!=='closed'){if(paused)await this.context.suspend();else await this.context.resume();}}).catch(()=>{});
  return this.playback;
 }
 toggle(){this.muted=!this.muted;if(this.master)this.master.gain.setTargetAtTime(this.muted?0:.22,this.context.currentTime,.04);return this.muted;}
 setTrack(track){if(this.track!==track){this.track=track;this.ambientNext=0;}}
 ambience(active){
  if(!active||!this.context||this.context.currentTime<(this.ambientNext??0))return;
  const t=this.context.currentTime,patterns={valley:[950,1250,'sine'],harbor:[330,495,'sine'],fair:[660,880,'triangle'],sawmill:[110,165,'triangle'],night:[220,330,'sine']},[a,b,type]=patterns[this.track]??patterns.valley;
  this.ambientNext=t+3.5;
  for(const [i,freq] of [a,b].entries()){const osc=this.context.createOscillator(),gain=this.context.createGain(),start=t+i*.17;osc.type=type;osc.frequency.setValueAtTime(freq,start);osc.frequency.exponentialRampToValueAtTime(freq*.85,start+.18);gain.gain.setValueAtTime(.001,start);gain.gain.linearRampToValueAtTime(.08,start+.02);gain.gain.exponentialRampToValueAtTime(.001,start+.22);osc.connect(gain).connect(this.effects);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(start);osc.stop(start+.24);}
 }
 update(r,active,musicActive=active,lastLap=false,menuActive=false){if(!this.engine)return;if(menuActive)this.menuMusic();else if(this.titleSource||this.titlePending)this.stopTitle();const t=this.context.currentTime;this.music.playbackRate.setTargetAtTime(lastLap?1.15:1,t,.4);this.musicGain?.gain.setTargetAtTime(musicActive?.65*this.musicVolume:0,t,.15);this.engine.frequency.setTargetAtTime(48+Math.abs(r.speed)*5,t,.08);this.engineGain.gain.setTargetAtTime(active?.13:0,t,.08);this.skid.gain.setTargetAtTime(active&&r.drifting?.16:0,t,.05);this.turboGain.gain.setTargetAtTime(active&&r.boosting?.12:0,t,.05);this.turbo.frequency.setTargetAtTime(420+Math.abs(r.speed)*8,t,.08);}
 startSignal(number){
  if(!this.context||this.context.state!=='running')return false;const ctx=this.context,t=ctx.currentTime,duration=number===0?.34:.13;
  for(const harmonic of [1,1.5]){const osc=ctx.createOscillator(),gain=ctx.createGain();osc.type='sine';osc.frequency.value=(number===0?980:490)*harmonic;gain.gain.setValueAtTime(.001,t);gain.gain.linearRampToValueAtTime(harmonic===1?.2:.07,t+.012);gain.gain.exponentialRampToValueAtTime(.001,t+duration);osc.connect(gain).connect(this.effects);osc.onended=()=>{osc.disconnect();gain.disconnect();};osc.start(t);osc.stop(t+duration+.02);}return true;
 }
 finish(place=1){if(!this.context)return;const ctx=this.context;const notes=place===1?[523,659,784,1047,1319]:place===2?[494,622,740,988]:place===3?[440,554,659,880]:[392,494,587];notes.forEach((freq,i)=>{const osc=ctx.createOscillator(),gain=ctx.createGain();const t=ctx.currentTime+i*.14;osc.frequency.value=freq;gain.gain.setValueAtTime(.25,t);gain.gain.exponentialRampToValueAtTime(.001,t+.35);osc.connect(gain).connect(this.effects);osc.start(t);osc.stop(t+.36);});}
}
