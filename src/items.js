import {distanceItem,leaderGap} from './item-balance.js';
import {loseCoins} from './vehicle-stats.js';
import {trackLength} from './tracks.js';
import {launchBone,advanceBones,boneTarget} from './bone-power.js';
import {launchShell,advanceShells} from './shell-power.js';
import {TRACK_LENGTH,ROAD_LIMIT,clamp,resolveCollisions,orderRacers} from './race.js';
export const ITEM_LABELS={shield:'Bolha protetora',gum:'Goma de cais',pulse:'Pulso de vento',bone:'Osso Perseguidor',mushroom:'Cogumelo Relâmpago',shell:'Casco Estelar',storm:'Onda Iônica',banana:'Casca Escorregadia',star:'Estrela Neon',triple:'Cogumelos Triplos'};
export function createItems(settings={}){const length=trackLength(settings.track),stations=length===760?[80,250,430,610]:Array.from({length:Math.round(length/190)},(_,i)=>(i+.5)*length/Math.round(length/190));return {boxes:stations.flatMap(distance=>[-3,0,3].map(offset=>({distance,offset,cooldown:0,picks:0}))),puddles:[],bones:[],shells:[],pulse:null};}
const gap=(a,b,length=TRACK_LENGTH)=>((a-b+length/2)%length+length)%length-length/2;
export function chooseItem(position,total,roll){const x=((roll%1)+1)%1;const weights=position<=2?[.6,.3,.1]:position>=total-1?[.2,.15,.65]:[.35,.25,.4];return x<weights[0]?'shield':x<weights[0]+weights[1]?'gum':'pulse';}
export function racerItem(r,position,total,roll,distance=null){if(r.index===0&&r.settings?.character==='gugar'&&roll<.45)return 'bone';if(distance!==null)return distanceItem(distance,roll);return roll>=.7?(roll<.85?'mushroom':'shell'):chooseItem(position,total,roll/.7);}
export function shouldUseItem(r,racers,time){
 if(!r.item)return false;
 const rivals=racers.filter(o=>o!==r&&!o.finished),near=rivals.some(o=>Math.abs(gap(o.distance,r.distance,trackLength(r.settings?.track)))<22),behind=rivals.some(o=>{const d=gap(r.distance,o.distance,trackLength(r.settings?.track));return d>0&&d<18;});
 if(r.item==='shield')return r.shield<=0&&(r.style==='defender'?near:r.slow>0||rivals.some(o=>Math.abs(gap(o.distance,r.distance,trackLength(r.settings?.track)))<10));
 if(r.item==='gum'||r.item==='banana')return behind;
 if(r.item==='star')return r.speed>10&&(r.invincible??0)<=0;
 if(r.item==='triple')return r.speed>10&&r.slow<=0&&(time+r.index)%1.2<.2;
 if(r.item==='bone')return !!boneTarget(r,racers);
 if(r.item==='shell')return !!boneTarget(r,racers);
 if(r.item==='storm')return racers.some(other=>other!==r&&!other.finished&&other.distance>r.distance+20);
 if(r.item==='mushroom')return r.speed>10&&r.slow<=0;
 return r.style==='attacker'?near||r.slow>0:near||(time+r.index)%7<.15;
}
function hit(r,slow,by,item,time){r.lastAttack={by,item,time,blocked:r.shield>0||(r.invincible??0)>0};if((r.invincible??0)>0)return false;if(r.shield>0){r.shield=0;return false;}loseCoins(r);r.arcadeAttack=r.lastAttack;r.slow=Math.max(r.slow,slow);r.speed*=.7;return true;}
export function stepItems(racers,world,input,dt,time){
 if(dt<=0)return;
 world.bones??=[];
 world.shells??=[];
 for(const box of world.boxes)box.cooldown=Math.max(0,box.cooldown-dt);
 for(const puddle of world.puddles)puddle.life-=dt;
 world.puddles=world.puddles.filter(p=>p.life>0);
 if(world.storm){world.storm.life-=dt;if(world.storm.life<=0)world.storm=null;}
 if(world.pulse){world.pulse.life-=dt;if(world.pulse.life<=0)world.pulse=null;}
 for(const r of racers){
  r.invincible=Math.max(0,(r.invincible??0)-dt);r.shield=Math.max(0,r.shield-dt);r.slow=Math.max(0,r.slow-dt);if(r.finished)continue;
  for(const box of world.boxes)if(box.cooldown===0&&!r.item&&Math.abs(gap(r.distance,box.distance,trackLength(r.settings?.track)))<3&&Math.abs(r.offset-box.offset)<1.5){const position=orderRacers(racers).findIndex(p=>p===r)+1;const roll=((box.picks++*37+r.index*17+Math.floor(box.distance)*13)%100)/100;r.item=racerItem(r,position,racers.length,roll,leaderGap(r,racers));box.cooldown=8;}
  const pressed=r.index===0?!!input.item:shouldUseItem(r,racers,time);
  if(pressed&&!r.itemPressed&&r.item){
   const item=r.item;r.item=null;r.powerGesture=.45;
   if(item==='shield')r.shield=6;
   if(item==='star'){r.invincible=5;r.trackBoost=Math.max(r.trackBoost??0,5);r.slow=0;}
   if(item==='banana')world.puddles.push({distance:r.distance-5,offset:r.offset,owner:r.index,ownerName:r.name,life:12,type:'banana',shortcut:!!r.shortcut});
   if(item==='triple'){r.tripleCharges=(r.tripleCharges??3)-1;r.miniTurbo=Math.max(r.miniTurbo,1.4);r.turboLevel=2;if(r.tripleCharges>0)r.item='triple';else r.tripleCharges=null;}
   if(item==='bone')world.bones.push(launchBone(r,racers));
   if(item==='shell')world.shells.push(launchShell(r,racers));
   if(item==='mushroom'){r.miniTurbo=Math.max(r.miniTurbo,2.3);r.turboLevel=2;}
   if(item==='storm'){world.storm={life:.65};for(const other of racers)if(other!==r&&!other.finished&&other.distance>r.distance)hit(other,1.4,r.name,'storm',time);}
   if(item==='gum')world.puddles.push({distance:r.distance-5,offset:r.offset,owner:r.index,ownerName:r.name,life:7,shortcut:!!r.shortcut});
   if(item==='pulse'){r.miniTurbo=Math.max(r.miniTurbo,.8);r.turboLevel=2;world.pulse={distance:r.distance,offset:r.offset,life:.5};for(const other of racers)if(other!==r&&!other.finished&&Math.abs(gap(other.distance,r.distance,trackLength(r.settings?.track)))<22&&hit(other,1.3,r.name,'pulse',time)){const side=Math.sign(other.offset-r.offset)||(other.index%2?1:-1);other.offset=clamp(other.offset+side*1.3,-ROAD_LIMIT,ROAD_LIMIT);other.slide=side*5;}}
  }
  r.itemPressed=pressed;
  for(const p of world.puddles)if(p.life>0&&p.owner!==r.index&&!!r.shortcut===!!p.shortcut&&Math.abs(gap(r.distance,p.distance,trackLength(r.settings?.track)))<2.5&&Math.abs(r.offset-p.offset)<1.7){hit(r,1.5,p.ownerName??racers.find(o=>o.index===p.owner)?.name??'Rival',p.type??'gum',time);p.life=0;}
 }
 advanceBones(racers,world,dt,time,hit,ROAD_LIMIT);
 advanceShells(racers,world,dt,time,hit,ROAD_LIMIT);
 resolveCollisions(racers);
}
