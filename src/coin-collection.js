export const COIN_PICKUP_RADIUS=1.4;
export const COIN_HEIGHT=1.1;
export function bindCoinPositions(course,frame){
 course.frame=frame;return course.coins.map(coin=>{const f=frame(coin.distance,coin.offset);coin.position={x:f.p.x+f.up.x*COIN_HEIGHT,y:f.p.y+f.up.y*COIN_HEIGHT,z:f.p.z+f.up.z*COIN_HEIGHT};return f;});
}
export function segmentDistanceSquared(point,start,end){
 const x=end.x-start.x,y=end.y-start.y,z=end.z-start.z,length=x*x+y*y+z*z;
 const t=length>1e-12?Math.max(0,Math.min(1,((point.x-start.x)*x+(point.y-start.y)*y+(point.z-start.z)*z)/length)):0;
 return (point.x-start.x-x*t)**2+(point.y-start.y-y*t)**2+(point.z-start.z-z*t)**2;
}
export function coinTouchesRacer(coin,racer,course,before,previousOffset,dt){
 const length=course.length,delta=((coin.distance-before+length/2)%length+length)%length-length/2,travel=racer.distance-before;
 if(delta<Math.min(0,travel)-3||delta>Math.max(0,travel)+3)return false;
 let start,end,point;
 if(course.frame&&coin.position){
  const a=course.frame(before,previousOffset),b=course.frame(racer.distance,racer.offset);
  start={x:a.p.x+a.up.x*.8,y:a.p.y+a.up.y*.8,z:a.p.z+a.up.z*.8};end={x:b.p.x+b.up.x*.8,y:b.p.y+b.up.y*.8,z:b.p.z+b.up.z*.8};point=coin.position;
 }else{start={x:previousOffset,y:0,z:before};end={x:racer.offset,y:0,z:racer.distance};point={x:coin.offset,y:0,z:before+delta};}
 // A reset/teleport is not a driven path through all the coins in between.
 if(Math.abs(travel)>Math.max(12,Math.abs(racer.speed)*dt*3))start=end;
 return segmentDistanceSquared(point,start,end)<COIN_PICKUP_RADIUS**2;
}
