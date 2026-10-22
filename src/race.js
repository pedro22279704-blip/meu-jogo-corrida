export const LAPS = 3;
export const TRACK_LENGTH = 760;
export const ROAD_LIMIT = 6.4;
export const NAMES = ['Você · Lume', 'Bia Faísca', 'Téo Musgo', 'Nina Cometa', 'Zeca Brisa', 'Sol Cobre'];
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export function createRace(){
 return NAMES.map((name,i)=>({name,index:i,distance:-Math.floor(i/2)*6-9,speed:0,offset:i%2?2.4:-2.4,nitro:100,angle:0,slide:0,finished:false,finishTime:null,drifting:false,driftCharge:0,miniTurbo:0,boosting:false,hit:0,aiLane:i%2?2.4:-2.4}));
}
export function orderRacers(racers){return [...racers].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:a.finished?-1:b.finished?1:b.distance-a.distance);}
export function lapOf(r){return clamp(Math.floor(Math.max(0,r.distance)/TRACK_LENGTH)+1,1,LAPS);}
function wrapGap(a,b){return ((a-b+TRACK_LENGTH/2)%TRACK_LENGTH+TRACK_LENGTH)%TRACK_LENGTH-TRACK_LENGTH/2;}
function barrier(r){
 if(Math.abs(r.offset)>ROAD_LIMIT){
  r.offset=Math.sign(r.offset)*ROAD_LIMIT;
  if(Math.sign(r.slide)===Math.sign(r.offset))r.slide*=-.22;
  r.angle*=.55;r.speed*=.82;r.hit=.3;
 }
}
// Corpos arcade alinhados à pista: resolve também encontros entre voltas diferentes.
export function resolveCollisions(racers){
 for(let pass=0;pass<4;pass++)for(let i=0;i<racers.length;i++)for(let j=i+1;j<racers.length;j++){
  const a=racers[i],b=racers[j];if(a.finished||b.finished)continue;
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
  a.hit=b.hit=.2;barrier(a);barrier(b);
 }
}
function driveAI(r,racers,dt,time){
 const ahead=racers.filter(other=>other!==r&&!other.finished).map(other=>({other,gap:wrapGap(other.distance,r.distance)})).filter(x=>x.gap>0&&x.gap<22).sort((a,b)=>a.gap-b.gap)[0];
 let targetLane=Math.sin(time*.35+r.index)*1.4;
 let targetSpeed=28+r.index*.5+Math.sin(time*.8+r.index)*1.2;
 if(ahead&&Math.abs(ahead.other.offset-r.offset)<2.6){
  const candidates=[-4,0,4].map(lane=>({lane,clear:!racers.some(o=>o!==r&&!o.finished&&Math.abs(wrapGap(o.distance,r.distance))<12&&Math.abs(o.offset-lane)<2.4)}));
  const choice=candidates.filter(c=>c.clear).sort((a,b)=>Math.abs(a.lane-r.offset)-Math.abs(b.lane-r.offset))[0];
  if(choice)targetLane=choice.lane;
  else if(ahead.gap<9)targetSpeed=Math.min(targetSpeed,Math.max(8,ahead.other.speed-2));
 }else if(Math.abs(r.aiLane)>2)targetLane=r.aiLane*.96;
 // Pequenos erros determinísticos, sem sorteios a cada quadro.
 const mistake=Math.sin(time*.22+r.index*1.8)>.985;
 if(mistake){targetSpeed-=5;targetLane+=Math.sin(r.index)*.8;}
 r.aiLane+=(targetLane-r.aiLane)*(1-Math.exp(-dt*2));
 const oldOffset=r.offset;
 r.offset+=clamp(r.aiLane-r.offset,-3.5*dt,3.5*dt);
 r.slide=(r.offset-oldOffset)/dt;r.angle=Math.atan2(r.slide,Math.max(1,r.speed))*.6;
 r.speed+=clamp(targetSpeed-r.speed,-10*dt,12*dt);
}
export function stepRace(racers,input,dt,time){
 dt=clamp(dt,0,.05);if(!dt)return;
 for(const r of racers){
  r.hit=Math.max(0,r.hit-dt);
  if(r.finished){r.speed=Math.max(0,r.speed-dt*15);r.boosting=false;r.drifting=false;continue;}
  if(r.index===0){
   const steer=Number(!!input.left)-Number(!!input.right);
   const wasDrifting=r.drifting;
   r.drifting=!!input.drift&&!!steer&&r.speed>12;
   r.miniTurbo=Math.max(0,r.miniTurbo-dt);
   if(r.drifting)r.driftCharge=clamp(r.driftCharge+dt*.65,0,1);
   else if(wasDrifting){
    if(!input.drift&&r.driftCharge>=.35)r.miniTurbo=.45+r.driftCharge*.85;
    r.driftCharge=0;
   }
   r.angle+=steer*dt*(r.drifting?1.65:1.18)-r.angle*dt*(r.drifting?1.6:3.2);
   r.angle=clamp(r.angle,-.85,.85);
   const boost=input.boost&&input.up&&r.nitro>1&&r.speed>0;
   r.boosting=!!boost||r.miniTurbo>0;
   r.nitro=clamp(r.nitro+dt*(boost?-27:r.drifting?20:7),0,100);
   r.speed+=dt*(input.up?(boost?24:r.miniTurbo>0?22:14):input.down?-26:r.miniTurbo>0?12:-6);
   r.speed=clamp(r.speed,input.down?-7:0,boost?49:r.miniTurbo>0?43:32);
   const targetSlide=Math.sin(r.angle)*r.speed*(r.drifting?.48:1);
   r.slide+=(targetSlide-r.slide)*(1-Math.exp(-dt*(r.drifting?2.2:7)));
   r.offset+=r.slide*dt;
  }else driveAI(r,racers,dt,time);
  barrier(r);
  r.distance+=r.speed*Math.cos(r.angle)*dt;
 }
 resolveCollisions(racers);
 for(const r of racers)if(!r.finished&&r.distance>=TRACK_LENGTH*LAPS){
  r.distance=TRACK_LENGTH*LAPS;r.finished=true;r.finishTime=time;r.boosting=false;r.drifting=false;
 }
}
