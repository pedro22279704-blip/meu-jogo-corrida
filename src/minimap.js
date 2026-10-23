import {trackLength} from './tracks.js';
import {COLORS} from './settings.js';
export function drawMinimap(canvas,curve,racers,route=null){
 const ctx=canvas.getContext('2d');if(!ctx)return;
 const points=curve.getSpacedPoints(100),xs=points.map(p=>p.x),zs=points.map(p=>p.z);
 const minX=Math.min(...xs),maxX=Math.max(...xs),minZ=Math.min(...zs),maxZ=Math.max(...zs),scale=Math.min((canvas.width-28)/(maxX-minX),(canvas.height-28)/(maxZ-minZ));
 const project=p=>[canvas.width/2+(p.x-(minX+maxX)/2)*scale,canvas.height/2+(p.z-(minZ+maxZ)/2)*scale];
 ctx.clearRect(0,0,canvas.width,canvas.height);ctx.strokeStyle='#7796a6';ctx.lineWidth=8;ctx.lineJoin='round';ctx.beginPath();points.forEach((p,i)=>{const [x,y]=project(p);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);});ctx.closePath();ctx.stroke();
 if(route){ctx.strokeStyle='#d397ff';ctx.lineWidth=3;ctx.beginPath();for(let i=0;i<=20;i++){const p=route.frame(route.spec.start+(route.spec.end-route.spec.start)*i/20,3).p;const [x,y]=project(p);if(i)ctx.lineTo(x,y);else ctx.moveTo(x,y);}ctx.stroke();}
 const start=project(curve.getPointAt(0));ctx.fillStyle='#fff';ctx.fillRect(start[0]-3,start[1]-5,6,10);
 for(const r of [...racers.slice(1),racers[0]]){const t=((r.distance/trackLength(r.settings?.track))%1+1)%1,[x,y]=project(r.shortcut&&route?route.frame(r.distance,r.offset).p:curve.getPointAt(t));ctx.beginPath();ctx.arc(x,y,r.index===0?5:3.5,0,Math.PI*2);ctx.fillStyle=COLORS[r.pilot];ctx.fill();if(r.index===0){ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();}}
}
