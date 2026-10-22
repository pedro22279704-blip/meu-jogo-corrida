import {TRACK_LENGTH,ROAD_LIMIT,clamp,resolveCollisions,orderRacers} from './race.js';
export const ITEM_LABELS={shield:'Bolha protetora',gum:'Goma de cais',pulse:'Pulso de vento'};
export function createItems(){return {boxes:[80,250,430,610].flatMap(distance=>[-3,0,3].map(offset=>({distance,offset,cooldown:0,picks:0}))),puddles:[],pulse:null};}
const gap=(a,b)=>((a-b+TRACK_LENGTH/2)%TRACK_LENGTH+TRACK_LENGTH)%TRACK_LENGTH-TRACK_LENGTH/2;
export function chooseItem(position,total,roll){const x=((roll%1)+1)%1;const weights=position<=2?[.6,.3,.1]:position>=total-1?[.2,.15,.65]:[.35,.25,.4];return x<weights[0]?'shield':x<weights[0]+weights[1]?'gum':'pulse';}
export function shouldUseItem(r,racers,time){
 if(!r.item)return false;
 const rivals=racers.filter(o=>o!==r&&!o.finished),near=rivals.some(o=>Math.abs(gap(o.distance,r.distance))<22),behind=rivals.some(o=>{const d=gap(r.distance,o.distance);return d>0&&d<18;});
 if(r.item==='shield')return r.shield<=0&&(r.style==='defender'?near:r.slow>0||rivals.some(o=>Math.abs(gap(o.distance,r.distance))<10));
 if(r.item==='gum')return behind;
 return r.style==='attacker'?near||r.slow>0:near||(time+r.index)%7<.15;
}
function hit(r,slow,by,item,time){r.lastAttack={by,item,time,blocked:r.shield>0};if(r.shield>0){r.shield=0;return false;}r.slow=Math.max(r.slow,slow);r.speed*=.7;return true;}
export function stepItems(racers,world,input,dt,time){
 if(dt<=0)return;
 for(const box of world.boxes)box.cooldown=Math.max(0,box.cooldown-dt);
 for(const puddle of world.puddles)puddle.life-=dt;
 world.puddles=world.puddles.filter(p=>p.life>0);
 if(world.pulse){world.pulse.life-=dt;if(world.pulse.life<=0)world.pulse=null;}
 for(const r of racers){
  r.shield=Math.max(0,r.shield-dt);r.slow=Math.max(0,r.slow-dt);if(r.finished)continue;
  for(const box of world.boxes)if(box.cooldown===0&&!r.item&&Math.abs(gap(r.distance,box.distance))<3&&Math.abs(r.offset-box.offset)<1.5){const position=orderRacers(racers).findIndex(p=>p===r)+1;const roll=((box.picks++*37+r.index*17+Math.floor(box.distance)*13)%100)/100;r.item=chooseItem(position,racers.length,roll);box.cooldown=8;}
  const pressed=r.index===0?!!input.item:shouldUseItem(r,racers,time);
  if(pressed&&!r.itemPressed&&r.item){
   const item=r.item;r.item=null;r.powerGesture=.45;
   if(item==='shield')r.shield=6;
   if(item==='gum')world.puddles.push({distance:r.distance-5,offset:r.offset,owner:r.index,ownerName:r.name,life:7});
   if(item==='pulse'){r.miniTurbo=Math.max(r.miniTurbo,.8);r.turboLevel=2;world.pulse={distance:r.distance,offset:r.offset,life:.5};for(const other of racers)if(other!==r&&!other.finished&&Math.abs(gap(other.distance,r.distance))<22&&hit(other,1.3,r.name,'pulse',time)){const side=Math.sign(other.offset-r.offset)||(other.index%2?1:-1);other.offset=clamp(other.offset+side*1.3,-ROAD_LIMIT,ROAD_LIMIT);other.slide=side*5;}}
  }
  r.itemPressed=pressed;
  for(const p of world.puddles)if(p.owner!==r.index&&Math.abs(gap(r.distance,p.distance))<2.5&&Math.abs(r.offset-p.offset)<1.7){hit(r,1.5,p.ownerName??racers.find(o=>o.index===p.owner)?.name??'Rival','gum',time);p.life=0;}
 }
 resolveCollisions(racers);
}
