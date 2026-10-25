import {PILOTS,DIFFICULTIES} from './settings.js';
import {TRACKS} from './tracks.js';
import {readGhost} from './ghost.js';
import {readChallenges} from './challenges.js';

const CHALLENGES='vale-neon-challenges-v1';
const scopes=Object.keys(TRACKS).flatMap(track=>Object.keys(DIFFICULTIES).flatMap(d=>[`${track}-${d}`,`${track}-r3-${d}`,...(['fair','sawmill','night'].includes(track)?[`${track}-r2-${d}`]:[]),...(TRACKS[track].revision?[`${track}-r${TRACKS[track].revision}-${d}`]:[])]));
const bestKey=scope=>`vale-neon-best-v7-${scope}`,ghostKey=scope=>`vale-neon-ghost-v7-${scope}`;
export const MAX_BACKUP_BYTES=8_000_000;
function challenges(value){
 if(!value||typeof value.clean!=='boolean'||typeof value.drift!=='boolean'||!Array.isArray(value.wins)||value.wins.some(p=>!Number.isInteger(p)||p<0||p>=PILOTS.length))throw Error('Conquistas inválidas no arquivo.');
 return {clean:value.clean,drift:value.drift,wins:[...new Set(value.wins)]};
}
export function parseBackup(text){
 if(typeof text!=='string'||text.length>MAX_BACKUP_BYTES)throw Error('Arquivo grande demais. Limite: 8 MB.');
 let value;try{value=JSON.parse(text);}catch{throw Error('Esse arquivo não é um backup válido.');}
 if(value?.game!=='karts-do-vale-neon'||value.version!==1)throw Error('Backup de outro jogo ou versão não compatível.');
 const progress=challenges(value.challenges),records={},ghosts={};
 if(!value.records||typeof value.records!=='object'||Array.isArray(value.records)||!value.ghosts||typeof value.ghosts!=='object'||Array.isArray(value.ghosts))throw Error('Recordes inválidos no arquivo.');
 for(const [scope,time] of Object.entries(value.records)){
  if(!scopes.includes(scope)||!Number.isFinite(time)||time<=0||time>86400)throw Error('Recorde inválido no arquivo.');records[scope]=time;
 }
 for(const [scope,g] of Object.entries(value.ghosts)){
  if(!scopes.includes(scope)||!readGhost({getItem:()=>JSON.stringify(g)},scope)||records[scope]!==g.time)throw Error('Fantasma inválido no arquivo.');ghosts[scope]=g;
 }
 return {game:value.game,version:1,challenges:progress,records,ghosts};
}
export function exportProgress(storage){
 if(!storage)throw Error('O navegador não permite acessar o progresso salvo.');
 const records={},ghosts={};
 for(const scope of scopes){const raw=storage.getItem(bestKey(scope)),time=raw===null?null:Number(raw);if(Number.isFinite(time)&&time>0){records[scope]=time;const ghost=readGhost(storage,scope);if(ghost?.time===time)ghosts[scope]=ghost;}}
 const raw=storage.getItem(CHALLENGES),progress=raw?challenges(JSON.parse(raw)):{clean:false,drift:false,wins:[]};
 const text=JSON.stringify({game:'karts-do-vale-neon',version:1,createdAt:new Date().toISOString(),challenges:progress,records,ghosts},null,2);
 if(text.length>MAX_BACKUP_BYTES)throw Error('O progresso ultrapassou o limite de 8 MB do backup.');return text;
}
// Mescla conquistas e mantém os menores tempos; desfaz a escrita se houver falha.
export function importProgress(storage,text){
 const backup=parseBackup(text);if(!storage)throw Error('O navegador não permite salvar o progresso.');
 const current=readChallenges(storage);
 const writes=new Map([[CHALLENGES,JSON.stringify({clean:!!current.clean||backup.challenges.clean,drift:!!current.drift||backup.challenges.drift,wins:[...new Set([...(Array.isArray(current.wins)?current.wins:[]),...backup.challenges.wins])].filter(p=>Number.isInteger(p)&&p>=0&&p<PILOTS.length)})]]);
 for(const [scope,time] of Object.entries(backup.records)){
  const raw=storage.getItem(bestKey(scope)),old=raw===null?null:Number(raw);
  if(!Number.isFinite(old)||old<=0||time<old){writes.set(bestKey(scope),String(time));writes.set(ghostKey(scope),backup.ghosts[scope]?JSON.stringify(backup.ghosts[scope]):null);}
  else if(time===old&&backup.ghosts[scope]&&!readGhost(storage,scope))writes.set(ghostKey(scope),JSON.stringify(backup.ghosts[scope]));
 }
 const before=new Map([...writes.keys()].map(k=>[k,storage.getItem(k)]));
 try{for(const [key,value] of writes)value===null?storage.removeItem(key):storage.setItem(key,value);}
 catch{let restored=true;for(const [key,value] of before)try{value===null?storage.removeItem(key):storage.setItem(key,value);}catch{restored=false;}throw Error(restored?'Não foi possível salvar. Seu progresso anterior foi mantido.':'O navegador interrompeu a recuperação. Guarde seu backup e tente novamente.');}
 return backup;
}
