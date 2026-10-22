import {test} from 'node:test';
import assert from 'node:assert/strict';
import {formatTime,readBest,saveBest} from '../src/records.js';
function store(){const values=new Map();return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v)};}
test('cronômetro formata minutos, segundos e milissegundos',()=>{assert.equal(formatTime(65.123),'1:05.123');assert.equal(formatTime(null),'—');assert.equal(formatTime(NaN),'—');});
test('salva apenas recorde mais rápido e lê ao reabrir',()=>{const s=store();assert.equal(readBest(s),null);assert.equal(saveBest(s,90).isNew,true);assert.equal(saveBest(s,95).isNew,false);assert.equal(readBest(s),90);assert.equal(saveBest(s,85).isNew,true);assert.equal(readBest(s),85);assert.equal(saveBest(s,-1).saved,false);});
test('armazenamento bloqueado ou corrompido não quebra corrida',()=>{const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}};assert.equal(readBest(blocked),null);assert.equal(saveBest(blocked,80).saved,false);assert.equal(readBest({getItem:()=>'{broken'}),null);assert.equal(readBest(null),null);});
