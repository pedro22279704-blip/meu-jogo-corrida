import {createCircuitCurve,trackLength} from './tracks.js';
import {SHORTCUTS} from './shortcuts.js';

const courses=new Map();
export const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function courseHeading(id,distance,shortcut=false){
 let course=courses.get(id);if(!course){const curve=createCircuitCurve(id),length=trackLength(id),samples=2048,headings=[];for(let i=0;i<=samples;i++){const t=curve.getTangentAt(i/samples);headings.push(Math.atan2(t.x,t.z));}const spec=SHORTCUTS[id],a=curve.getPointAt(spec.start/length),b=curve.getPointAt(spec.end/length);course={length,samples,headings,shortcut:Math.atan2(b.x-a.x,b.z-a.z)};courses.set(id,course);}
 if(shortcut)return course.shortcut;const t=((distance%course.length)+course.length)%course.length/course.length*course.samples,index=Math.floor(t),u=t-index,a=course.headings[index],b=course.headings[index+1];return wrapAngle(a+wrapAngle(b-a)*u);
}
export function steerManually(r,steer,dt){
 r.heading??=r.angle;r.driftSlip??=0;r.yawRate??=0;r.steerVisual=steer;
 const direction=r.speed<-.5?-1:1,speedFactor=Math.max(.4,Math.min(1,Math.abs(r.speed)/16));
 const rate=(r.drifting?r.driftDirection*(.35+.95*steer*r.driftDirection):steer*1.65)*r.settings.sensitivity*speedFactor*direction;
 r.yawRate+=(rate-r.yawRate)*(1-Math.exp(-dt*10));r.heading=wrapAngle(r.heading+r.yawRate*dt);
 const slip=r.drifting?r.driftDirection*(.22+.12*steer*r.driftDirection):0;r.driftSlip+=(slip-r.driftSlip)*(1-Math.exp(-dt*9));r.angle=wrapAngle(r.heading+r.driftSlip);
}
