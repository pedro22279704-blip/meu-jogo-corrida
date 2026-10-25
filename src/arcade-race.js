import {trackLength} from './tracks.js';

export const COURSE_FEATURES={valley:{glide:.36,jump:.80},harbor:{glide:.08,jump:.65},fair:{glide:.78,jump:.23},sawmill:{glide:.80,jump:.23},night:{glide:.33,jump:.82}};
export function createArcadeCourse(track){const length=trackLength(track),feature=COURSE_FEATURES[track]??COURSE_FEATURES.valley;return {track,length,coins:Array.from({length:Math.floor(length/80)},(_,i)=>[-6,-3,0,3,6].map(offset=>({distance:38+i*80,offset,cooldown:0}))).flat(),pads:[.12,.54].map(t=>({distance:t*length})),ramps:[{distance:feature.glide*length,kind:'glide',duration:3.8},{distance:feature.jump*length,kind:'jump',duration:1.35}]};}
export function flightHeight(r){if(!(r.airTime>0))return 0;const u=1-r.airTime/r.airDuration;return Math.sin(Math.PI*u)*(r.airKind==='glide'?10:3.2);}
function crosses(before,after,station,length){if(after<=before)return false;const lap=Math.floor(after/length),point=station+lap*length;return before<point&&after>=point||before<point-length&&after>=point-length;}
export function stepArcade(racers,course,input,dt){
 if(dt<=0)return;for(const coin of course.coins)coin.cooldown=Math.max(0,coin.cooldown-dt);
 for(const r of racers){
  if(r.finished)continue;const before=r.arcadeDistance??r.distance;r.arcadeDistance=r.distance;
  r.trackBoost=Math.max(0,(r.trackBoost??0)-dt);r.trickTimer=Math.max(0,(r.trickTimer??0)-dt);r.coinFlash=Math.max(0,(r.coinFlash??0)-dt);
  const hurt=(r.collisions>(r.arcadeCollisions??r.collisions))||(r.lastAttack&&r.lastAttack!==r.arcadeAttack&&!r.lastAttack.blocked);
  r.arcadeCollisions=r.collisions;r.arcadeAttack=r.lastAttack;if(hurt)r.coins=Math.max(0,(r.coins??0)-3);
  const pressed=r.index===0?!!input.drift:false;
  if(r.airTime>0){
   r.airTime=Math.max(0,r.airTime-dt);
   if(pressed&&!r.arcadeTrickPressed&&!r.trick){r.trick=true;r.trickTimer=.65;}
   if(r.airTime===0&&r.trick){r.miniTurbo=Math.max(r.miniTurbo,1);r.turboLevel=2;r.trick=false;r.landingFlash=.8;r.successfulTricks=(r.successfulTricks??0)+1;}
  }
  r.landingFlash=Math.max(0,(r.landingFlash??0)-dt);r.arcadeTrickPressed=pressed;
  if(r.shortcut)continue;
  if(!(r.airTime>0))for(const coin of course.coins){const d=((r.distance%course.length)+course.length)%course.length;if(coin.cooldown===0&&Math.abs(d-coin.distance)<2&&Math.abs(r.offset-coin.offset)<1.25&&r.speed>3){coin.cooldown=7;r.coins=Math.min(10,(r.coins??0)+1);r.coinFlash=.35;r.coinsCollected=(r.coinsCollected??0)+1;}}
  for(const pad of course.pads)if(crosses(before,r.distance,pad.distance,course.length)&&Math.abs(r.offset)<7.8){r.trackBoost=1.15;r.speed=Math.max(r.speed,41);}
  for(const ramp of course.ramps)if(!(r.airTime>0)&&r.speed>15&&Math.abs(r.offset)<7.8&&crosses(before,r.distance,ramp.distance,course.length)){r.airTime=r.airDuration=ramp.duration;r.airKind=ramp.kind;r.trick=false;r.trickTimer=0;r.drifting=false;r.driftCharge=0;}
 }
}
