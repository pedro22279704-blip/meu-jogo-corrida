import {test} from 'node:test';
import assert from 'node:assert/strict';
import {exportProgress,importProgress,parseBackup,MAX_BACKUP_BYTES} from '../src/progress-backup.js';
const key='vale-neon-challenges-v1',record='vale-neon-best-v7-valley-medium',ghost='vale-neon-ghost-v7-valley-medium';
function memory(entries=[]){const map=new Map(entries);return {map,getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};}
const fixture=()=>({game:'karts-do-vale-neon',version:1,challenges:{clean:true,drift:false,wins:[0,6,7]},records:{'valley-medium':80,'night-hard':95},ghosts:{'valley-medium':{version:7,time:80,pilot:7,samples:[[0,0,0,0,0,0],[80,2280,0,0,0,32]]}}});

test('backup exporta e recupera conquistas, recordes e fantasma em outro navegador',()=>{
 const source=memory();importProgress(source,JSON.stringify(fixture()));const text=exportProgress(source),target=memory();importProgress(target,text);
 assert.deepEqual(target.map,source.map);assert.equal(JSON.parse(target.getItem(key)).wins.length,3);assert.equal(target.getItem('vale-neon-best-v7-night-hard'),'95');assert.ok(target.getItem(ghost));
});
test('recuperação reúne conquistas e preserva o melhor recorde e seu fantasma',()=>{
 const source=memory([[record,'70'],[ghost,'meu-fantasma'],[key,JSON.stringify({clean:false,drift:true,wins:[1]})],['preferencia-de-outro-app','preservar']]);
 importProgress(source,JSON.stringify(fixture()));assert.equal(source.getItem(record),'70');assert.equal(source.getItem(ghost),'meu-fantasma');assert.deepEqual(JSON.parse(source.getItem(key)),{clean:true,drift:true,wins:[1,0,6,7]});assert.equal(source.getItem('preferencia-de-outro-app'),'preservar');
});
test('recorde importado melhor substitui fantasma incompatível e recupera fantasia válida em empate',()=>{
 const backup=fixture(),source=memory([[record,'90'],[ghost,'antigo']]);delete backup.ghosts['valley-medium'];importProgress(source,JSON.stringify(backup));assert.equal(source.getItem(record),'80');assert.equal(source.getItem(ghost),null);
 importProgress(source,JSON.stringify(fixture()));assert.equal(JSON.parse(source.getItem(ghost)).time,80);
});
test('arquivos inválidos e versões desconhecidas não escrevem nenhum dado',()=>{
 const source=memory([[record,'70']]),before=[...source.map];
 for(const text of ['{',JSON.stringify({...fixture(),version:2}),JSON.stringify({...fixture(),records:{'outro-app':4}}),JSON.stringify({...fixture(),challenges:{clean:true,drift:false,wins:[500]}}),' '.repeat(MAX_BACKUP_BYTES+1)]){assert.throws(()=>importProgress(source,text));assert.deepEqual([...source.map],before);}
 const bad=fixture();bad.ghosts['valley-medium'].samples[1][0]=0;assert.throws(()=>parseBackup(JSON.stringify(bad)));
});
test('falha de escrita desfaz alterações parciais e informa armazenamento bloqueado',()=>{
 const source=memory([[key,JSON.stringify({clean:false,drift:false,wins:[1]})],[record,'100'],[ghost,'anterior']]),before=new Map(source.map),write=source.setItem;let count=0;
 source.setItem=(k,v)=>{if(++count===3)throw Error('quota');write(k,v);};assert.throws(()=>importProgress(source,JSON.stringify(fixture())),/anterior foi mantido/);assert.deepEqual(source.map,before);
 assert.throws(()=>exportProgress(null));assert.throws(()=>importProgress(null,JSON.stringify(fixture())));
});
test('sem progresso ainda é possível criar um backup vazio válido',()=>{const backup=parseBackup(exportProgress(memory()));assert.deepEqual(backup.records,{});assert.deepEqual(backup.challenges,{clean:false,drift:false,wins:[]});});
