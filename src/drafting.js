// Só há vácuo entre karts na mesma rota, em movimento e alinhados.
export function draftingTarget(r,racers){
 if(r.finished||r.speed<14||r.drifting)return null;
 return racers.filter(o=>o!==r&&!o.finished&&o.speed>14&&!!o.shortcut===!!r.shortcut)
 .map(o=>({r:o,gap:((o.distance-r.distance)%760+1140)%760-380}))
 .filter(o=>o.gap>4&&o.gap<22&&Math.abs(o.r.offset-r.offset)<1.5&&Math.abs(o.r.angle-r.angle)<.3)
 .sort((a,b)=>a.gap-b.gap)[0]?.r??null;
}
export function updateDrafting(racers,dt){
 const targets=racers.map(r=>draftingTarget(r,racers));
 racers.forEach((r,i)=>{r.draft=targets[i]?Math.min(1,(r.draft??0)+dt/.9):Math.max(0,(r.draft??0)-dt*2.5);r.draftActive=!!targets[i]&&r.draft>=1;});
}
