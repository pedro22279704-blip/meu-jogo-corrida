import {courseHeading,wrapAngle} from '../src/manual-steering.js';
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
// Test-only driver: sends steering/braking inputs, never edits the kart's position.
export function driveInput(r,extra={}){
 const id=r.settings.track,d=r.distance,curvature=wrapAngle(courseHeading(id,d+5)-courseHeading(id,d+3))/2;
 const ahead=Math.abs(wrapAngle(courseHeading(id,d+15)-courseHeading(id,d+5))/10),target=Math.min(32,.95/Math.max(.001,ahead));
 const steer=clamp((curvature*r.speed-(r.heading??0)*3-r.offset*.18)/1.65,-1,1);
 return {...extra,up:r.speed<target+.5,down:r.speed>target+1,steer};
}
