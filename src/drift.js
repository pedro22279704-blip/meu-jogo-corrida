export const DRIFT_SECONDS=3.5;
export const DRIFT_LEVELS=[{threshold:1.5/DRIFT_SECONDS,name:'Mini-turbo azul',color:'#70edff',duration:.5,speed:38},{threshold:1,name:'Super mini-turbo vermelho',color:'#ff6475',duration:1.5,speed:46}];
export const driftChargeRate=alignment=>(alignment>.05?1:alignment<-.05?.2:.3)/DRIFT_SECONDS;
export function driftLevel(charge){return DRIFT_LEVELS.reduce((level,spec,i)=>charge>=spec.threshold-1e-9?i+1:level,0);}
