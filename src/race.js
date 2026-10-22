import {updateDrafting} from './drafting.js';
import {driftLevel,DRIFT_LEVELS} from './drift.js';
import {SHORTCUTS,shortcutState} from './shortcuts.js';
import {normalizeSettings,DIFFICULTIES,PILOTS} from './settings.js';
export const LAPS = 3;
export const TRACK_LENGTH = 760;
export const ROAD_LIMIT = 6.4;
export const NAMES = PILOTS.map((name,i)=>(i===0?'Você · ':'')+name);
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export function createRace(options={}){
 const settings=normalizeSettings(options),ids=[settings.pilot,...PILOTS.map((_,i)=>i).filter(i=>i!==settings.pilot)];
 return ids.map((pilot,i)=>({name:(i===0?'Você · ':'')+PILOTS[pilot],pilot,settings,style:['defender','attacker','explorer','attacker','explorer','defender','attacker'][pilot],draft:0,draftActive:false,collisions:0,goodDrifts:0,shortcut:false,shortcutLap:-1,shortcutFailed:false,turboLevel:0,lastAttack:null,shield:0,slow:0,item:null,itemPressed:false,index:i,distance:-Math.floor(i/2)*4-9,speed:0,offset:i%2?2.4:-2.4,nitro:100,angle:0,slide:0,finished:false,finishTime:null,drifting:false,driftCharge:0,miniTurbo:0,boosting:false,hit:0,aiLane:i%2?2.4:-2.4}));
}
export function orderRacers(racers){return [...racers].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:a.finished?-1:b.finished?1:b.distance-a.distance);}
export function lapOf(r){return clamp(Math.floor(Math.max(0,r.distance)/TRACK_LENGTH)+1,1,LAPS);}
function wrapGap(a,b){return ((a-b+TRACK_LENGTH/2)%TRACK_LENGTH+TRACK_LENGTH)%TRACK_LENGTH-TRACK_LENGTH/2;}
function barrier(r){
 if(Math.abs(r.offset)>ROAD_LIMIT){
  r.offset=Math.sign(r.offset)*ROAD_LIMIT;
  if(Math.sign(r.slide)===Math.sign(r.offset))r.slide*=-.22;
  if(r.hit<=0)r.collisions++;
  r.angle*=.55;r.speed*=.82;r.hit=.3;
 }
}
// Corpos arcade alinhados à pista: resolve também encontros entre voltas diferentes.
export function resolveCollisions(racers){
 for(let pass=0;pass<4;pass++)for(let i=0;i<racers.length;i++)for(let j=i+1;j<racers.length;j++){
  const a=racers[i],b=racers[j];if(a.finished||b.finished||!!a.shortcut!==!!b.shortcut)continue;
  const dz=wrapGap(a.distance,b.distance),dx=a.offset-b.offset;
  const overlapZ=3.5-Math.abs(dz),overlapX=2.2-Math.abs(dx);
  if(overlapZ<=0||overlapX<=0)continue;
  if(overlapX<overlapZ&&Math.abs(a.offset)<ROAD_LIMIT-.2&&Math.abs(b.offset)<ROAD_LIMIT-.2){
   const push=(overlapX+.001)/2*(dx>=0?1:-1);
   a.offset+=push;b.offset-=push;
   a.slide*=.6;b.slide*=.6;
  }else{
   const push=(overlapZ+.001)/2*(dz>=0?1:-1);
   a.distance+=push;b.distance-=push;
   const shared=(a.speed+b.speed)/2;a.speed=shared;b.speed=shared;
  }
  if(a.hit<=0)a.collisions++;if(b.hit<=0)b.collisions++;
  a.hit=b.hit=.2;barrier(a);barrier(b);
 }
}
function driveAI(r,racers,dt,time){
 const difficulty=DIFFICULTIES[r.settings.difficulty];
 const ahead=racers.filter(other=>other!==r&&!other.finished).map(other=>({other,gap:wrapGap(other.distance,r.distance)})).filter(x=>x.gap>0&&x.gap<22).sort((a,b)=>a.gap-b.gap)[0];
 let targetLane=Math.sin(time*.35+r.index)*1.4;
 if(r.style==='explorer'){const section=SHORTCUTS[r.settings.track],progress=((r.distance%TRACK_LENGTH)+TRACK_LENGTH)%TRACK_LENGTH;if(r.shortcut||progress>=section.start-30&&progress<section.start+3)targetLane=3;}
 const player=racers.find(other=>other.index===0);
 // Recuperação moderada por velocidade, sem alterar posições artificialmente.
 const gapToPlayer=player&&!player.finished?player.distance-r.distance:0;
 const packAdjustment=clamp(gapToPlayer/12,-4,4);
 let targetSpeed=31.8+difficulty.pace+r.index*.12+Math.sin(time*.8+r.index)*.6+packAdjustment;
 r.miniTurbo=Math.max(0,r.miniTurbo-dt);
 const turboWindow=(time+r.index*1.7)%9<difficulty.turbo;
 r.boosting=(turboWindow&&r.nitro>8||r.miniTurbo>0)&&r.speed>18;
 if(r.draftActive)targetSpeed+=4;
 if(r.boosting)targetSpeed=42.5+difficulty.pace+clamp(gapToPlayer/20,-3,2);
 if(ahead&&Math.abs(ahead.other.offset-r.offset)<2.6){
  const candidates=[-4,0,4].map(lane=>({lane,clear:!racers.some(o=>o!==r&&!o.finished&&Math.abs(wrapGap(o.distance,r.distance))<12&&Math.abs(o.offset-lane)<2.4)}));
  const choice=candidates.filter(c=>c.clear).sort((a,b)=>Math.abs(a.lane-r.offset)-Math.abs(b.lane-r.offset))[0];
  if(choice)targetLane=r.style==='explorer'?candidates.filter(c=>c.clear).sort((a,b)=>Math.abs(b.lane)-Math.abs(a.lane))[0].lane:choice.lane;
  else if(ahead.gap<9){targetSpeed=Math.min(targetSpeed,Math.max(8,ahead.other.speed-2));r.boosting=false;}
 }else if(Math.abs(r.aiLane)>2)targetLane=r.aiLane*.96;
 if(r.style==='explorer'){const section=SHORTCUTS[r.settings.track],progress=((r.distance%TRACK_LENGTH)+TRACK_LENGTH)%TRACK_LENGTH;if(r.shortcut||progress>=section.start-30&&progress<section.start+3)targetLane=3;}
 r.nitro=clamp(r.nitro+dt*(r.boosting?-27:9),0,100);
 // Pequenos erros determinísticos, sem sorteios a cada quadro.
 const mistake=Math.sin(time*.22+r.index*1.8)>.985;
 if(mistake){targetSpeed-=difficulty.mistake;targetLane+=Math.sin(r.index)*.8;}
 r.aiLane+=(targetLane-r.aiLane)*(1-Math.exp(-dt*2));
 const oldOffset=r.offset;
 r.offset+=clamp(r.aiLane-r.offset,-3.5*dt,3.5*dt);
 r.slide=(r.offset-oldOffset)/dt;r.angle=Math.atan2(r.slide,Math.max(1,r.speed))*.6;
 r.speed+=clamp(targetSpeed-r.speed,-14*dt,(r.boosting?24:difficulty.accel)*dt);
}
export function stepRace(racers,input,dt,time,surface=null){
 dt=clamp(dt,0,.05);if(!dt)return;
 updateDrafting(racers,dt);
 for(const r of racers){
  r.hit=Math.max(0,r.hit-dt);r.powerGesture=Math.max(0,(r.powerGesture??0)-dt);
  if(r.finished){r.speed=Math.max(0,r.speed-dt*15);r.boosting=false;r.drifting=false;continue;}
  if(r.index===0){
   const steer=Number.isFinite(input.steer)?clamp(input.steer,-1,1):Number(!!input.left)-Number(!!input.right);
   const wasDrifting=r.drifting;
   r.drifting=!!input.drift&&!!steer&&r.speed>12;
   r.miniTurbo=Math.max(0,r.miniTurbo-dt);
   if(r.drifting)r.driftCharge=clamp(r.driftCharge+dt*.65,0,1);
   else if(wasDrifting){
    const level=driftLevel(r.driftCharge);if(!input.drift&&level>0){r.turboLevel=level;r.miniTurbo=DRIFT_LEVELS[level-1].duration;r.goodDrifts++;}
    r.driftCharge=0;
   }
   r.angle+=steer*r.settings.sensitivity*dt*(r.drifting?1.65:1.18)-r.angle*dt*(r.drifting?2.0:4.2);
   r.angle=clamp(r.angle,-.85,.85);
   const boost=input.boost&&input.up&&r.nitro>1&&r.speed>0;
   r.boosting=!!boost||r.miniTurbo>0;
   r.nitro=clamp(r.nitro+dt*(boost?-27:r.drifting?20:7),0,100);
   r.speed+=dt*(input.up?(boost?24:r.miniTurbo>0?22:r.draftActive?18:14):input.down?-26:r.miniTurbo>0?12:-6);
   r.speed=clamp(r.speed,input.down?-7:0,boost?49:r.miniTurbo>0?DRIFT_LEVELS[Math.max(0,r.turboLevel-1)].speed:r.draftActive?36:32);
   const targetSlide=Math.sin(r.angle)*r.speed*(r.drifting?.48:.8);
   r.slide+=(targetSlide-r.slide)*(1-Math.exp(-dt*(r.drifting?2.2:9)));
   r.offset+=r.slide*dt;
  }else driveAI(r,racers,dt,time);
  if(surface){const {grade}=surface(r.distance);r.speed-=grade*28*dt;r.speed=clamp(r.speed,-7,r.boosting?49:43);}
  if(r.slow>0)r.speed=Math.min(r.speed,21);
  barrier(r);
  const route=shortcutState(r);if(r.shortcutFailed)r.speed=Math.min(r.speed,18);
  r.distance+=r.speed*Math.cos(r.angle)*dt*route;
 }
 resolveCollisions(racers);
 for(const r of racers)if(!r.finished&&r.distance>=TRACK_LENGTH*LAPS){
  r.distance=TRACK_LENGTH*LAPS;r.finished=true;r.finishTime=time;r.boosting=false;r.drifting=false;
 }
}
