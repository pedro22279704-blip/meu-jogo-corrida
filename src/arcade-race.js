import {loseCoins} from './vehicle-stats.js';
import {trackLength} from './tracks.js';
import {coinTouchesRacer} from './coin-collection.js';

export function createArcadeCourse(track){const length=trackLength(track);return {track,length,coins:Array.from({length:Math.floor(length/80)},(_,i)=>[-6,-3,0,3,6].map(offset=>({distance:38+i*80,offset,cooldown:0}))).flat(),pads:[.12,.54].map(t=>({distance:t*length})),ramps:[]};}
function crosses(before,after,station,length){if(after<=before)return false;const lap=Math.floor(after/length),point=station+lap*length;return before<point&&after>=point||before<point-length&&after>=point-length;}
export function stepArcade(racers,course,input,dt){
 if(dt<=0)return;for(const coin of course.coins)coin.cooldown=Math.max(0,coin.cooldown-dt);
 course.coinEvents??=[];course.coinEvents.length=0;
 for(const r of racers){
  if(r.finished)continue;const before=r.arcadeDistance??r.distance,previousOffset=r.arcadeOffset??r.offset,wasShortcut=r.arcadeShortcut??false;r.arcadeDistance=r.distance;r.arcadeOffset=r.offset;r.arcadeShortcut=!!r.shortcut;
  r.trackBoost=Math.max(0,(r.trackBoost??0)-dt);r.trickTimer=Math.max(0,(r.trickTimer??0)-dt);r.coinFlash=Math.max(0,(r.coinFlash??0)-dt);
  const hurt=(r.collisions>(r.arcadeCollisions??r.collisions))||(r.lastAttack&&r.lastAttack!==r.arcadeAttack&&!r.lastAttack.blocked);
  r.arcadeCollisions=r.collisions;r.arcadeAttack=r.lastAttack;if(hurt)loseCoins(r);r.coinLossFlash=Math.max(0,(r.coinLossFlash??0)-dt);
  r.airTime=0;r.airKind=null;r.trick=false;r.trickTimer=0;r.driftHop=0;
  if(r.shortcut)continue;
  if(!wasShortcut)for(const [coinIndex,coin] of course.coins.entries())if(coin.cooldown===0&&Math.abs(r.speed)>3&&coinTouchesRacer(coin,r,course,before,previousOffset,dt)){
   coin.cooldown=7;r.coins=Math.min(10,(r.coins??0)+1);r.coinFlash=.35;r.coinsCollected=(r.coinsCollected??0)+1;course.coinEvents.push({racer:r.index,coinIndex,distance:coin.distance,offset:coin.offset});
  }
  for(const pad of course.pads)if(crosses(before,r.distance,pad.distance,course.length)&&Math.abs(r.offset)<7.8){r.trackBoost=1.15;r.speed=Math.max(r.speed,41);}
 }
}
