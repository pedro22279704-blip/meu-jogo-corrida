const KEY='vale-neon-challenges-v1';
export const PAINTS=[{id:'original',name:'Original',color:null},{id:'clean',name:'Pérola',color:'#e7edff'},{id:'drift',name:'Chama roxa',color:'#a85bff'},{id:'champion',name:'Ouro solar',color:'#ffcf4c'}];
export function readChallenges(storage){try{const v=JSON.parse(storage.getItem(KEY));return {clean:!!v?.clean,drift:!!v?.drift,wins:[...new Set((Array.isArray(v?.wins)?v.wins:[]).filter(n=>Number.isInteger(n)&&n>=0&&n<6))]};}catch{return {clean:false,drift:false,wins:[]};}}
export function unlockedPaints(progress){return PAINTS.filter(p=>p.id==='original'||p.id==='clean'&&progress.clean||p.id==='drift'&&progress.drift||p.id==='champion'&&progress.wins.length===6);}
export function finishChallenges(storage,racer,place,previous=null){
 const progress=previous?{clean:previous.clean,drift:previous.drift,wins:[...previous.wins]}:readChallenges(storage),before=new Set(unlockedPaints(progress).map(p=>p.id));
 if(racer.collisions===0)progress.clean=true;if(racer.goodDrifts>=3)progress.drift=true;if(place===1&&!progress.wins.includes(racer.pilot))progress.wins.push(racer.pilot);
 let saved=true;try{storage.setItem(KEY,JSON.stringify(progress));}catch{saved=false;}
 return {progress,saved,unlocked:unlockedPaints(progress).filter(p=>!before.has(p.id))};
}
