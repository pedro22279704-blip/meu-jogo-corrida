import {createCircuitCurve,trackLength} from './tracks.js';
import {SHORTCUTS} from './shortcuts.js';

const courses=new Map();
export const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function courseHeading(id,distance,shortcut=false){
 let course=courses.get(id);if(!course){const curve=createCircuitCurve(id),length=trackLength(id),samples=2048,headings=[];for(let i=0;i<=samples;i++){const t=curve.getTangentAt(i/samples);headings.push(Math.atan2(t.x,t.z));}const spec=SHORTCUTS[id],a=curve.getPointAt(spec.start/length),b=curve.getPointAt(spec.end/length);course={length,samples,headings,shortcut:Math.atan2(b.x-a.x,b.z-a.z)};courses.set(id,course);}
 if(shortcut)return course.shortcut;const t=((distance%course.length)+course.length)%course.length/course.length*course.samples,index=Math.floor(t),u=t-index,a=course.headings[index],b=course.headings[index+1];return wrapAngle(a+wrapAngle(b-a)*u);
}
export function steerManually(r,steer,dt){
 r.heading??=r.angle;r.driftSlip??=0;r.yawRate??=0;
 // Heading is the direction of travel; driftSlip turns the body inward so the rear swings out.
 const softened=Math.sign(steer)*Math.abs(steer)**1.15;r.steerVisual=softened;
 const direction=r.speed<-.5?-1:1,speedFactor=Math.max(.4,Math.min(1,Math.abs(r.speed)/16));
 const highSpeed=1-Math.max(0,Math.min(1,(Math.abs(r.speed)-32)/17))*.08;
 const alignment=softened*r.driftDirection;
 const rate=(r.drifting?r.driftDirection*Math.max(.18,.85+.95*alignment):softened*1.65)*r.settings.sensitivity*(r.stats?.handling??1)*(r.environment==='water'?.9:1)*speedFactor*highSpeed*direction;
 r.yawRate+=(rate-r.yawRate)*(1-Math.exp(-dt*(Math.abs(steer)>.01?10:14)));r.heading=wrapAngle(r.heading+r.yawRate*dt);
 const slip=r.drifting?r.driftDirection*(.42+.14*alignment):0;r.driftSlip+=(slip-r.driftSlip)*(1-Math.exp(-dt*(r.drifting?9:12)));r.angle=wrapAngle(r.heading+r.driftSlip);
}
