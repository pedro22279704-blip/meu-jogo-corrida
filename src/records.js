// Nova versão de regras: recordes antigos não são comparados com esta física.
const KEY='vale-neon-best-v3';
export function formatTime(seconds){
 if(!Number.isFinite(seconds)||seconds<0)return '—';
 const ms=Math.floor(seconds*1000);return `${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}.${String(ms%1000).padStart(3,'0')}`;
}
export function readBest(storage){try{const raw=storage.getItem(KEY);if(raw===null)return null;const n=Number(raw);return Number.isFinite(n)&&n>0?n:null;}catch{return null;}}
export function saveBest(storage,time){
 const previous=readBest(storage);
 if(!Number.isFinite(time)||time<=0)return {best:previous,isNew:false,saved:false};
 if(previous!==null&&time>=previous)return {best:previous,isNew:false,saved:true};
 try{storage.setItem(KEY,String(time));return {best:time,isNew:true,saved:true};}catch{return {best:time,isNew:true,saved:false};}
}
