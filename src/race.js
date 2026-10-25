import {ROAD_LIMIT,OFFROAD_LIMIT} from './road-width.js';
import {vehicleStats,normalTopSpeed} from './vehicle-stats.js';
import {environmentAt} from './race-environment.js';
import {courseHeading,steerManually,wrapAngle} from './manual-steering.js';
import {trackLength} from './tracks.js';
import {updateDrafting} from './drafting.js';
import {driftLevel,DRIFT_LEVELS,driftChargeRate} from './drift.js';
import {SHORTCUTS,shortcutState} from './shortcuts.js';
import {normalizeSettings,DIFFICULTIES,PILOTS} from './settings.js';
export const LAPS = 3;
export const TRACK_LENGTH = trackLength('valley');
export {ROAD_LIMIT} from './road-width.js';
export const NAMES = PILOTS.map((name,i)=>(i===0?'Você · ':'')+name);
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export function createRace(options={}){
 const settings=normalizeSettings(options),ids=[settings.pilot,...PILOTS.map((_,i)=>i).filter(i=>i!==settings.pilot)];
 return ids.map((pilot,i)=>({name:(i===0?'Você · ':'')+PILOTS[pilot],pilot,settings,stats:vehicleStats({...settings,pilot}),environment:'ground',style:['defender','attacker','explorer','attacker','explorer','defender','attacker','explorer'][pilot],draft:0,draftActive:false,collisions:0,goodDrifts:0,shortcut:false,shortcutLap:-1,shortcutFailed:false,turboLevel:0,lastAttack:null,invincible:0,tripleCharges:null,shield:0,slow:0,boneSpin:0,item:i===0&&settings.character==='gugar'?'bone':null,itemPressed:false,index:i,distance:-Math.floor(i/2)*4-9,speed:0,offset:i%2?2.4:-2.4,coins:0,coinsCollected:0,trackBoost:0,airTime:0,airDuration:1,airKind:null,trickTimer:0,trick:false,angle:0,slide:0,finished:false,finishTime:null,drifting:false,driftDirection:0,driftHop:0,driftCharge:0,miniTurbo:0,boosting:false,hit:0,aiLane:i%2?2.4:-2.4}));
}
export function orderRacers(racers){return [...racers].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:a.finished?-1:b.finished?1:b.distance-a.distance);}
export function lapOf(r){return clamp(Math.floor(Math.max(0,r.distance)/trackLength(r.settings?.track))+1,1,LAPS);}
function wrapGap(a,b,length=TRACK_LENGTH){return ((a-b+length/2)%length+length)%length-length/2;}
function barrier(r){
 if(Math.abs(r.offset)>ROAD_LIMIT){
  r.offset=Math.sign(r.offset)*ROAD_LIMIT;
  if(Math.sign(r.slide)===Math.sign(r.offset))r.slide*=-.22;
  if(r.hit<=0)r.collisions++;
  if(r.index===0){r.wallContact=true;r.speed*=.3;r.slide=0;r.drifting=false;r.driftCharge=0;}else{r.angle*=.55;r.speed*=.82;}r.hit=.3;
 }
}
// Corpos arcade alinhados à pista: resolve também encontros entre voltas diferentes.
export function resolveCollisions(racers){
 for(let pass=0;pass<4;pass++)for(let i=0;i<racers.length;i++)for(let j=i+1;j<racers.length;j++){
  const a=racers[i],b=racers[j];if(a.finished||b.finished||!!a.shortcut!==!!b.shortcut)continue;
  const dz=wrapGap(a.distance,b.distance,trackLength(a.settings?.track)),dx=a.offset-b.offset;
  const overlapZ=3.5-Math.abs(dz),overlapX=2.2-Math.abs(dx);
  if(overlapZ<=0||overlapX<=0)continue;
  if(overlapX<overlapZ&&Math.abs(a.offset)<ROAD_LIMIT-.2&&Math.abs(b.offset)<ROAD_LIMIT-.2){
   const ma=a.stats?.weight??1,mb=b.stats?.weight??1,push=(overlapX+.001)*(dx>=0?1:-1);
   a.offset+=push*mb/(ma+mb);b.offset-=push*ma/(ma+mb);
   a.slide*=.6;b.slide*=.6;
  }else{
   const ma=a.stats?.weight??1,mb=b.stats?.weight??1,push=(overlapZ+.001)*(dz>=0?1:-1);
   a.distance+=push*mb/(ma+mb);b.distance-=push*ma/(ma+mb);
   const shared=(a.speed*ma+b.speed*mb)/(ma+mb);a.speed=shared;b.speed=shared;
  }
  if(a.hit<=0)a.collisions++;if(b.hit<=0)b.collisions++;
  a.hit=b.hit=.2;barrier(a);barrier(b);
 }
}
function driveAI(r,racers,dt,time){
 const difficulty=DIFFICULTIES[r.settings.difficulty],length=trackLength(r.settings.track);
 const ahead=racers.filter(other=>other!==r&&!other.finished).map(other=>({other,gap:wrapGap(other.distance,r.distance,length)})).filter(x=>x.gap>0&&x.gap<22).sort((a,b)=>a.gap-b.gap)[0];
 let targetLane=Math.sin(time*.35+r.index)*2.8;
 if(r.style==='explorer'){const section=SHORTCUTS[r.settings.track],progress=((r.distance%length)+length)%length;if(r.shortcut||progress>=section.start-30&&progress<section.start+3)targetLane=3;}
 const player=racers.find(other=>other.index===0);
 // Recuperação moderada por velocidade, sem alterar posições artificialmente.
 const gapToPlayer=player&&!player.finished?player.distance-r.distance:0;
 const packAdjustment=clamp(gapToPlayer/12,-4,4);
 let targetSpeed=normalTopSpeed(r)-.2+difficulty.pace+r.index*.12+Math.sin(time*.8+r.index)*.6+packAdjustment;
 r.miniTurbo=Math.max(0,r.miniTurbo-dt);
 r.boosting=(r.miniTurbo>0||r.trackBoost>0)&&r.speed>18;
 if(r.trackBoost>0){targetSpeed=44;r.boosting=true;}
 if(r.draftActive)targetSpeed+=4;
 if(r.miniTurbo>0)targetSpeed=Math.max(targetSpeed,DRIFT_LEVELS[Math.min(DRIFT_LEVELS.length-1,Math.max(0,r.turboLevel-1))].speed);
 if(ahead&&Math.abs(ahead.other.offset-r.offset)<2.6){
  const candidates=[-7,-3.5,0,3.5,7].map(lane=>({lane,clear:!racers.some(o=>o!==r&&!o.finished&&Math.abs(wrapGap(o.distance,r.distance,length))<12&&Math.abs(o.offset-lane)<2.4)}));
  const choice=candidates.filter(c=>c.clear).sort((a,b)=>Math.abs(a.lane-r.offset)-Math.abs(b.lane-r.offset))[0];
  if(choice)targetLane=r.style==='explorer'?candidates.filter(c=>c.clear).sort((a,b)=>Math.abs(b.lane)-Math.abs(a.lane))[0].lane:choice.lane;
  else if(ahead.gap<9){targetSpeed=Math.min(targetSpeed,Math.max(8,ahead.other.speed-2));r.boosting=false;}
 }else if(Math.abs(r.aiLane)>2)targetLane=r.aiLane*.96;
 if(r.style==='explorer'){const section=SHORTCUTS[r.settings.track],progress=((r.distance%length)+length)%length;if(r.shortcut||progress>=section.start-30&&progress<section.start+3)targetLane=3;}
 // Pequenos erros determinísticos, sem sorteios a cada quadro.
 const mistake=Math.sin(time*.22+r.index*1.8)>.985;
 if(mistake){targetSpeed-=difficulty.mistake;targetLane+=Math.sin(r.index)*.8;}
 r.aiLane+=(targetLane-r.aiLane)*(1-Math.exp(-dt*2));
 const oldOffset=r.offset;
 r.offset+=clamp(r.aiLane-r.offset,-3.5*dt,3.5*dt);
 r.slide=(r.offset-oldOffset)/dt;r.angle=Math.atan2(r.slide,Math.max(1,r.speed))*.6;
 r.speed+=clamp(targetSpeed-r.speed,-14*dt,(r.boosting?24:difficulty.accel*r.stats.acceleration/14)*dt);
}
export function stepRace(racers,input,dt,time,surface=null){
 dt=clamp(dt,0,.05);if(!dt)return;
 updateDrafting(racers,dt);
 for(const r of racers){
  r.boneSpin=Math.max(0,(r.boneSpin??0)-dt);r.hit=Math.max(0,r.hit-dt);r.powerGesture=Math.max(0,(r.powerGesture??0)-dt);
  if(r.finished){r.speed=Math.max(0,r.speed-dt*15);r.boosting=false;r.drifting=false;r.airTime=0;r.trickTimer=0;continue;}
  const environment=environmentAt(r);r.environment=environment.state;
  if(r.index===0){
   const steer=Number.isFinite(input.steer)?clamp(input.steer,-1,1):Number(!!input.left)-Number(!!input.right);
   const wasDrifting=r.drifting;
   r.driftHop=Math.max(0,(r.driftHop??0)-dt);
   r.drifting=!!input.drift&&r.speed>12&&r.hit<=0&&r.slow<=0&&(wasDrifting||Math.abs(steer)>.05);
   if(r.drifting&&!wasDrifting){r.driftDirection=Math.sign(steer);r.driftHop=0;}
   if(r.drifting&&!r.driftDirection)r.driftDirection=Math.sign(steer)||1;
   r.miniTurbo=Math.max(0,r.miniTurbo-dt);
   if(r.drifting)r.driftCharge=clamp(r.driftCharge+dt*driftChargeRate(steer*r.driftDirection),0,1);
   else if(wasDrifting){
    const level=driftLevel(r.driftCharge);if(!input.drift&&level>0&&r.speed>12&&r.hit<=0&&r.slow<=0){r.turboLevel=level;r.miniTurbo=DRIFT_LEVELS[level-1].duration;r.goodDrifts++;}
    r.driftCharge=0;
   }
   steerManually(r,steer,dt);
   r.boosting=r.miniTurbo>0||r.trackBoost>0;
   r.speed+=dt*(input.up?(r.trackBoost>0?23:r.miniTurbo>0?22:r.draftActive?r.stats.acceleration+4:r.stats.acceleration):input.down?-26:r.miniTurbo>0?12:-6)*environment.acceleration;
   const maximum=r.trackBoost>0?44:r.miniTurbo>0?DRIFT_LEVELS[Math.min(DRIFT_LEVELS.length-1,Math.max(0,r.turboLevel-1))].speed:r.draftActive?normalTopSpeed(r)+4:normalTopSpeed(r);
   const traction=(r.shortcutFailed||!r.shortcut&&Math.abs(r.offset)>OFFROAD_LIMIT)?r.stats.offroad:1;
   r.speed=clamp(r.speed,input.down?-7:0,maximum*environment.speed*traction);
   // The vector of travel differs from the body by driftSlip. Project it into
   // the current road frame, so banking/curvature cannot accumulate a lane push.
   r.slide=Math.sin(r.heading)*r.speed;
   r.offset+=r.slide*dt;
  }else driveAI(r,racers,dt,time);
  const shoulder=!r.shortcut&&Math.abs(r.offset)>OFFROAD_LIMIT,offroad=r.shortcutFailed||shoulder;
  r.offroad=!!offroad;
  const speedLimit=(r.boosting?46:normalTopSpeed(r))*environment.speed*(offroad?r.stats.offroad:1);
  if((offroad||environment.state==='water')&&Math.abs(r.speed)>speedLimit)r.speed=Math.sign(r.speed)*Math.max(speedLimit,Math.abs(r.speed)-dt*(environment.state==='water'?18:28));
  if(surface){const {grade}=surface(r.distance);r.speed-=grade*28*dt;r.speed=clamp(r.speed,-7,r.boosting?46:43);}
  if(r.slow>0)r.speed=Math.min(r.speed,21);
  r.wallContact=false;barrier(r);
  const previousHeading=r.index===0?courseHeading(r.settings.track,r.distance,r.shortcut):0;
  const route=shortcutState(r);if(r.shortcutFailed)r.speed=Math.min(r.speed,normalTopSpeed(r)*r.stats.offroad);
  if(r.index===0){
   const heading=r.heading??r.angle,outward=r.offset*Math.sin(heading)*Math.sign(r.speed)>0;
   // A barrier stops forward progress until the player steers away or reverses.
   if(Math.abs(r.offset)>=ROAD_LIMIT-.015&&outward){r.wallContact=true;r.speed=0;r.slide=0;}
   else r.distance+=r.speed*Math.cos(heading)*dt*route;
   const turn=wrapAngle(courseHeading(r.settings.track,r.distance,r.shortcut)-previousHeading);
   r.heading=wrapAngle(heading-turn);r.angle=wrapAngle(r.heading+(r.driftSlip??0));
  }else r.distance+=r.speed*Math.cos(r.angle)*dt*route;
 }
 resolveCollisions(racers);
 for(const r of racers)if(!r.finished&&r.distance>=trackLength(r.settings?.track)*LAPS){
  r.distance=trackLength(r.settings?.track)*LAPS;r.finished=true;r.finishTime=time;r.boosting=false;r.drifting=false;r.airTime=0;r.trickTimer=0;
 }
}
