export const DRIFT_LEVELS=[{threshold:.35,name:'Amarelo',color:'#ffd75c',duration:.65,speed:38},{threshold:.65,name:'Azul',color:'#70edff',duration:1.05,speed:43},{threshold:.95,name:'Roxo',color:'#d397ff',duration:1.55,speed:49}];
export function driftLevel(charge){return DRIFT_LEVELS.reduce((level,spec,i)=>charge>=spec.threshold?i+1:level,0);}
