// Composição original em oito compassos, sintetizada em um buffer reutilizável.
// O buffer em loop evita timers musicais e duplicação de faixas ao reiniciar.
export function createRetroMusic(context){
 const rate=22050,step=60/132/2,length=64*step;
 const buffer=context.createBuffer(1,Math.ceil(length*rate),rate),data=buffer.getChannelData(0);
 const melody=[72,75,79,82,79,75,74,79,77,80,84,80,79,77,75,74,70,74,77,81,77,74,72,74,71,74,79,83,81,79,74,71];
 const roots=[48,44,46,43];let seed=73;
 const noise=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2147483648-1;};
 function tone(note,start,duration,volume,bass=false){const f=440*2**((note-69)/12),begin=Math.floor(start*rate),count=Math.floor(duration*rate);for(let j=0;j<count&&begin+j<data.length;j++){const t=j/rate,phase=2*Math.PI*f*t;const wave=bass?Math.sin(phase):(.72*Math.sin(phase)+.24*Math.sin(phase*3)+.14*Math.sin(phase*5));const envelope=Math.min(1,t/.008)*Math.max(0,1-j/count)**1.5;data[begin+j]+=wave*envelope*volume;}}
 for(let n=0;n<64;n++){
  const start=n*step;tone(melody[n%32],start,step*.85,.16);
  if(n%2===0)tone(roots[Math.floor(n/16)]+(n%4===2?7:0),start,step*1.6,.22,true);
  const begin=Math.floor(start*rate),count=Math.floor(rate*.11);
  for(let j=0;j<count&&begin+j<data.length;j++){const t=j/rate,env=Math.exp(-t*45);data[begin+j]+=noise()*env*.025;if(n%4===0)data[begin+j]+=Math.sin(2*Math.PI*(70*t+2*(1-Math.exp(-t*30))))*Math.exp(-t*30)*.22;if(n%4===2)data[begin+j]+=noise()*Math.exp(-t*35)*.1;}
 }
 return buffer;
}
