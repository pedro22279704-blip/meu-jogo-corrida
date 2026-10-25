import {trackLength} from './tracks.js';

export function createArcadeCourse(track){const length=trackLength(track);return {track,length,coins:Array.from({length:Math.floor(length/80)},(_,i)=>[-6,-3,0,3,6].map(offset=>({distance:38+i*80,offset,cooldown:0}))).flat(),pads:[.12,.54].map(t=>({distance:t*length})),ramps:[]};}
function crosses(before,after,station,length){if(after<=before)return false;const lap=Math.floor(after/length),point=station+lap*length;return before<point&&after>=point||before<point-length&&after>=point-length;}
export function stepArcade(racers,course,input,dt){
 if(dt<=0)return;for(const coin of course.coins)coin.cooldown=Math.max(0,coin.cooldown-dt);
 for(const r of racers){
  if(r.finished)continue;const before=r.arcadeDistance??r.distance;r.arcadeDistance=r.distance;
  r.trackBoost=Math.max(0,(r.trackBoost??0)-dt);r.trickTimer=Math.max(0,(r.trickTimer??0)-dt);r.coinFlash=Math.max(0,(r.coinFlash??0)-dt);
  const hurt=(r.collisions>(r.arcadeCollisions??r.collisions))||(r.lastAttack&&r.lastAttack!==r.arcadeAttack&&!r.lastAttack.blocked);
  r.arcadeCollisions=r.collisions;r.arcadeAttack=r.lastAttack;if(hurt)r.coins=Math.max(0,(r.coins??0)-3);
  r.airTime=0;r.airKind=null;r.trick=false;r.trickTimer=0;r.driftHop=0;
  if(r.shortcut)continue;
  for(const coin of course.coins){const d=((r.distance%course.length)+course.length)%course.length;if(coin.cooldown===0&&Math.abs(d-coin.distance)<2&&Math.abs(r.offset-coin.offset)<1.25&&r.speed>3){coin.cooldown=7;r.coins=Math.min(10,(r.coins??0)+1);r.coinFlash=.35;r.coinsCollected=(r.coinsCollected??0)+1;}}
  for(const pad of course.pads)if(crosses(before,r.distance,pad.distance,course.length)&&Math.abs(r.offset)<7.8){r.trackBoost=1.15;r.speed=Math.max(r.speed,41);}
 }
}
