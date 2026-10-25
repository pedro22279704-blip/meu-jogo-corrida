// Chassis values + tire deltas. Speed is m/s, acceleration m/s², mass is relative.
export const CHASSIS=[
 {speed:32,acceleration:14,weight:1,handling:1,offroad:.66},
 {speed:31,acceleration:16,weight:.85,handling:1.08,offroad:.65},
 {speed:31.5,acceleration:14,weight:1.1,handling:.98,offroad:.8},
 {speed:33,acceleration:13,weight:.9,handling:.98,offroad:.65},
 {speed:32,acceleration:14.5,weight:1,handling:1.03,offroad:.7},
 {speed:33.5,acceleration:12.5,weight:1.2,handling:.94,offroad:.7},
 {speed:33,acceleration:13.5,weight:1.1,handling:.98,offroad:.65},
 {speed:30.5,acceleration:15,weight:1.35,handling:.92,offroad:.9},
];
export const TIRES={
 street:{name:'Rua',description:'Equilíbrio para qualquer circuito.',speed:0,acceleration:0,weight:0,handling:0,offroad:0,width:1},
 grip:{name:'Aderência',description:'Mais curva e recuperação; um pouco menos de velocidade.',speed:-.7,acceleration:1,weight:-.1,handling:.1,offroad:.08,width:1.12},
 trail:{name:'Todo-terreno',description:'Menos perda no acostamento e nos atalhos; mais peso.',speed:-1,acceleration:.5,weight:.15,handling:-.03,offroad:.22,width:1.23},
};
export const normalizeTires=id=>Object.hasOwn(TIRES,id)?id:'street';
export function vehicleStats(settings={}){
 const chassis=CHASSIS[settings.pilot]??CHASSIS[0],tires=TIRES[normalizeTires(settings.tires)];
 return Object.fromEntries(Object.keys(chassis).map(key=>[key,key==='offroad'?Math.min(.98,chassis[key]+tires[key]):chassis[key]+tires[key]]));
}
export const coinMultiplier=coins=>1+Math.max(0,Math.min(10,Number(coins)||0))*.015;
export const normalTopSpeed=r=>(r.stats??vehicleStats(r.settings)).speed*coinMultiplier(r.coins);
export function loseCoins(r){const before=r.coins??0;r.coins=Math.max(0,before-3);r.coinLossFlash=.6;return before-r.coins;}

