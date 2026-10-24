// Original four-cylinder engine: combustion pulses, exhaust resonances and intake noise.
export function createEngineRev(context){
 const rate=22050,duration=2.4,buffer=context.createBuffer(1,Math.ceil(rate*duration),rate),data=buffer.getChannelData(0);
 const rpmCurve=[[0,260],[.14,450],[.24,1150],[.4,1400],[.9,5400],[1.12,2600],[1.65,6500],[2.05,2000],[2.4,1100]];
 const resonator=(frequency,q)=>{const w=2*Math.PI*frequency/rate,alpha=Math.sin(w)/(2*q),a0=1+alpha,b0=alpha/a0,a1=-2*Math.cos(w)/a0,a2=(1-alpha)/a0;let x1=0,x2=0,y1=0,y2=0;return x=>{const y=b0*(x-x2)-a1*y1-a2*y2;x2=x1;x1=x;y2=y1;y1=y;return y;};};
 const low=resonator(105,1.3),body=resonator(270,1.6),rasp=resonator(720,1.1);
 let phase=0,cycle=0,seed=87,air=0,high=0,previous=0,peak=0;
 for(let i=0;i<data.length;i++){
  const t=i/rate;let segment=0;while(segment<rpmCurve.length-2&&t>rpmCurve[segment+1][0])segment++;
  const [a,ra]=rpmCurve[segment],[b,rb]=rpmCurve[segment+1],u=(t-a)/(b-a),rpm=ra+(rb-ra)*(u*u*(3-2*u));
  // Two firing events per crankshaft revolution, with small cylinder differences.
  phase+=rpm/30/rate*(1+.013*Math.sin(t*83)+.006*Math.sin(t*137));if(phase>=1){phase-=1;cycle++;}
  seed=(seed*1664525+1013904223)>>>0;const noise=seed/2147483648-1,throttle=Math.max(0,Math.min(1,(rpm-1000)/5500));
  air+=(noise-air)*(1-Math.exp(-2*Math.PI*(450+throttle*1700)/rate));
  const combustion=(Math.exp(-phase*18)+.22*Math.exp(-phase*7)*Math.sin(phase*27))*[1,.88,1.06,.94][cycle%4];
  const raw=combustion*(t<.2?.35:1)+air*(.08+throttle*.22);
  high=.9915*(high+raw-previous);previous=raw;
  const exhaust=low(high)*1.6+body(high)*1.1+rasp(high)*.55+high*.11;
  const starter=t<.22?noise*Math.exp(-t*12)*.1:0;
  const envelope=Math.min(1,t/.025,Math.max(0,(duration-t)/.23));
  data[i]=Math.tanh((exhaust+starter)*2.2)*envelope;peak=Math.max(peak,Math.abs(data[i]));
 }
 // Bound the peak without hard clipping; DC is filtered before the exhaust.
 if(peak>0)for(let i=0;i<data.length;i++)data[i]*=.78/peak;
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
