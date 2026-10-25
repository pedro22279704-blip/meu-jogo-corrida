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
 // Integrate angular velocity and grip in continuous time. The body turns into
 // the corner while the velocity keeps its momentum, rather than adding a
 // sideways force based on the road edge or snapping the kart to a new lane.
 const softened=Math.sign(steer)*Math.abs(steer)**1.15;r.steerVisual=softened;
 const direction=r.speed<-.5?-1:1,speedFactor=Math.max(.4,Math.min(1,Math.abs(r.speed)/16));
 const highSpeed=1-Math.max(0,Math.min(1,(Math.abs(r.speed)-32)/17))*.08;
 const alignment=softened*r.driftDirection;
 const rate=(r.drifting?r.driftDirection*Math.max(.18,.85+.95*alignment):softened*1.65)*r.settings.sensitivity*(r.stats?.handling??1)*(r.environment==='water'?.9:1)*speedFactor*highSpeed*direction;
 const response=Math.abs(steer)>.01?10:14,decay=Math.exp(-dt*response),oldYaw=r.yawRate;
 r.yawRate=rate+(oldYaw-rate)*decay;
 const bodyTurn=rate*dt+(oldYaw-rate)*(1-decay)/response;
 const slip=r.drifting?r.driftDirection*(.42+.14*alignment):0;
 // Rear grip builds progressively on entry; countersteer reduces slip without
 // reversing the chosen drift. Recovery aligns the body to the velocity.
 const grip=r.drifting?5:12,oldSlip=r.driftSlip;
 r.driftSlip=slip+(oldSlip-slip)*Math.exp(-dt*grip);
 const velocityTurn=r.drifting?bodyTurn-(r.driftSlip-oldSlip)*.35:bodyTurn;
 r.heading=wrapAngle(r.heading+velocityTurn);r.angle=wrapAngle(r.heading+r.driftSlip);
}
