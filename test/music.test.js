import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createRetroMusic} from '../src/music.js';
test('música gera loop de oito compassos, finito e sem saturação',()=>{let samples,rate;const buffer=createRetroMusic({createBuffer(channels,length,sampleRate){assert.equal(channels,1);samples=new Float32Array(length);rate=sampleRate;return {getChannelData:()=>samples,length};}});assert.ok(Math.abs(buffer.length/rate-64*60/132/2)<1/rate);let energy=0;for(const v of samples){assert.ok(Number.isFinite(v));assert.ok(Math.abs(v)<1);energy+=v*v;}assert.ok(energy/samples.length>.001);});
