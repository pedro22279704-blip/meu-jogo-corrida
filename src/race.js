export const LAPS = 3;
export const TRACK_LENGTH = 760;
export const NAMES = ['Você · Lume', 'Bia Faísca', 'Téo Musgo', 'Nina Cometa', 'Zeca Brisa', 'Sol Cobre'];
export const clamp = (v,a,b) => Math.max(a,Math.min(b,v));
export function createRace(){return NAMES.map((name,i)=>({name,index:i,distance:-Math.floor(i/2)*6-9,speed:0,offset:i%2?2.4:-2.4,nitro:100,angle:0,finished:false,finishTime:null,drifting:false}));}
export function orderRacers(racers){return [...racers].sort((a,b)=>a.finished&&b.finished?a.finishTime-b.finishTime:a.finished?-1:b.finished?1:b.distance-a.distance);}
export function lapOf(r){return clamp(Math.floor(Math.max(0,r.distance)/TRACK_LENGTH)+1,1,LAPS);}
export function stepRace(racers,input,dt,time){
 for(const r of racers){
  if(r.finished){r.speed=Math.max(0,r.speed-dt*15);continue;}
  if(r.index===0){
   const steer=Number(!!input.right)-Number(!!input.left);
   r.drifting=!!input.drift&&!!steer&&r.speed>12;
   r.angle+=steer*dt*(r.drifting?1.65:1.18)-r.angle*dt*(r.drifting?1.6:3.2);
   r.angle=clamp(r.angle,-.85,.85);
   const boost=input.boost&&input.up&&r.nitro>1&&r.speed>0;
   r.nitro=clamp(r.nitro+dt*(boost?-27:r.drifting?20:7),0,100);
   r.speed+=dt*(input.up? (boost?24:14):input.down?-26:-6);
   r.speed=clamp(r.speed,input.down?-7:0,boost?49:32);
   r.offset+=Math.sin(r.angle)*r.speed*dt;
   if(Math.abs(r.offset)>6.3)r.speed*=Math.exp(-dt*2.2);
   r.offset=clamp(r.offset,-10,10);
  }else{
   const target=27.5+r.index*.48+Math.sin(time*.8+r.index)*1.5;
   r.speed+=clamp(target-r.speed,-10*dt,12*dt);
   r.offset+=(Math.sin(time*.45+r.index)*3-r.offset)*dt*.7;
   r.angle=0;
  }
  r.distance+=r.speed*Math.cos(r.angle)*dt;
  if(r.distance>=TRACK_LENGTH*LAPS){r.distance=TRACK_LENGTH*LAPS;r.finished=true;r.finishTime=time;}
 }
}
