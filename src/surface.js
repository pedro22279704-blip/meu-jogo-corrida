import {harborDive} from './race-environment.js';
import {trackLength,lapProgress,createCircuitCurve} from './tracks.js';
const elevation={
 valley:[[0,4],[.12,4],[.25,16],[.38,16],[.52,4],[.7,4],[.85,10],[.96,4],[1,4]],
 harbor:[[0,3],[.18,3],[.3,13],[.4,13],[.48,3],[.8,3],[.9,8],[1,3]],
 fair:[[0,4],[.16,4],[.28,14],[.38,14],[.48,4],[.62,4],[.75,10],[.86,4],[1,4]],
 sawmill:[[0,5],[.10,5],[.32,38],[.46,38],[.64,9],[.74,9],[.84,20],[.94,5],[1,5]],
 night:[[0,14],[.08,14],[.2,34],[.3,34],[.44,14],[.56,14],[.7,6],[.8,6],[.94,14],[1,14]],
};
const curves=new Map(),wrap=a=>Math.atan2(Math.sin(a),Math.cos(a));
export function curveBank(distance,id){
 let curve=curves.get(id);if(!curve){curve=createCircuitCurve(id);curves.set(id,curve);}
 const length=trackLength(id),at=d=>curve.getTangentAt(lapProgress(d,id)/length),a=at(distance-8),b=at(distance+8);
 const curvature=wrap(Math.atan2(b.x,b.z)-Math.atan2(a.x,a.z))/16;
 return -Math.max(-.4,Math.min(.4,curvature*(id==='valley'?40:22)));
}
export function surfaceProfile(distance,trackId='valley'){
 const length=trackLength(trackId),t=lapProgress(distance,trackId)/length,knots=elevation[trackId]??elevation.valley;
 let i=0;while(i<knots.length-2&&t>knots[i+1][0])i++;
 const [start,a]=knots[i],[end,b]=knots[i+1],u=(t-start)/(end-start),blend=u*u*u*(u*(u*6-15)+10),derivative=30*u*u*(u-1)*(u-1);
 let height=a+(b-a)*blend,grade=(b-a)*derivative/((end-start)*length);
 if(trackId==='harbor'){const dive=harborDive(distance);height-=dive.depth;grade-=dive.grade;}
 return {height,grade,bank:curveBank(distance,trackId)};
}