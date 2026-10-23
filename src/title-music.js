// Original engine ignition with two rising revs and a soft release.
export function createEngineRev(context){
 const rate=22050,duration=1.5,buffer=context.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);let phase=0,seed=87;
 for(let i=0;i<data.length;i++){
  const t=i/rate,rev=t<.18?45+t*180:t<.67?77+(t-.18)*270:t<.87?209-(t-.67)*570:t<1.15?95+(t-.87)*340:190-(t-1.15)*340;
  phase+=2*Math.PI*Math.max(40,rev)/rate;seed=(seed*1664525+1013904223)>>>0;
  const envelope=Math.min(1,t/.025,Math.max(0,(duration-t)/.25)),ignition=t<.16?(seed/2147483648-1)*Math.exp(-t*28)*.4:0;
  const engine=Math.sin(phase)+.42*Math.sin(phase*2)+.2*Math.sin(phase*3)+.1*Math.sin(phase*5);
  data[i]=Math.tanh((engine*.6+ignition)*envelope)*.8;
 }
 return buffer;
}

// Original fanfare: syncopated brass-like chords, bass and drums at 152 BPM.
export function createTitleMusic(context){
 const rate=22050,step=60/152/4,seconds=128*step,buffer=context.createBuffer(1,Math.ceil(seconds*rate),rate),data=buffer.getChannelData(0);
 let seed=2026;const noise=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/2147483648-1;};
 function note(midi,start,duration,volume,kind='brass'){
  const frequency=440*2**((midi-69)/12),begin=Math.floor(start*rate),count=Math.floor(duration*rate);
  for(let j=0;j<count&&begin+j<data.length;j++){const t=j/rate,p=2*Math.PI*frequency*t,envelope=Math.min(1,t/.008)*Math.min(1,(count-j)/(rate*.035))*Math.exp(-t*(kind==='bass'?3:5));
   const wave=kind==='bass'?Math.sin(p)+.2*Math.sin(p*2):Math.sin(p)+.32*Math.sin(p*2)+.16*Math.sin(p*3)+.08*Math.sin(p*4);data[begin+j]+=wave*envelope*volume;
  }
 }
 const chords=[[50,54,57],[55,59,62],[52,55,59],[57,61,64]],melody=[78,0,81,83,0,81,78,76,74,0,78,81,85,83,81,0,79,0,83,86,0,83,81,79,78,0,76,78,81,0,85,86];
 for(let n=0;n<128;n++){
  const t=n*step,chord=chords[Math.floor(n/16)%4];
  if([0,6,10,14].includes(n%16))for(const pitch of chord)note(pitch+12,t,step*1.7,.075);
  if(n%2===0){const pitch=melody[n/2%32];if(pitch)note(pitch,t,step*1.5,.12);note(chord[0]-12+(n%8===6?7:0),t,step*1.8,.21,'bass');}
  const count=Math.floor(rate*.18),begin=Math.floor(t*rate);
  for(let j=0;j<count&&begin+j<data.length;j++){const time=j/rate;
   if(n%4===0)data[begin+j]+=Math.sin(2*Math.PI*(48*time+2.3*(1-Math.exp(-time*35))))*Math.exp(-time*28)*.34;
   if(n%8===4)data[begin+j]+=noise()*Math.exp(-time*32)*.2;
   if(n%2===0)data[begin+j]+=noise()*Math.exp(-time*140)*.055;
  }
 }
 for(let i=0;i<data.length;i++)data[i]=Math.tanh(data[i]*1.25)*.78;
 return buffer;
}
