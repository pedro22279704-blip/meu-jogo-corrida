import {lapProgress} from './tracks.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
const derivative=x=>x>0&&x<1?6*x*(1-x):0;
export function harborDive(distance){
 const d=lapProgress(distance,'harbor'),a=(d-860)/80,b=(1200-d)/80;
 return {depth:12*smooth(a)*smooth(b),grade:12*(derivative(a)*smooth(b)-smooth(a)*derivative(b))/80};
}
export function environmentAt(r){
 const underwater=r.settings.track==='harbor'&&!r.shortcut&&harborDive(r.distance).depth>6;
 return {state:underwater?'water':'ground',speed:underwater?.86:1,acceleration:underwater?.78:1,handling:underwater?.9:1};
}
