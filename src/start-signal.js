export function signalPhase(remaining){const number=Math.max(0,Math.min(3,Math.ceil(remaining)));return {number,lit:number?4-number:3,green:number===0,label:number?String(number):'JÁ!'};}
export class StartSignal{
 constructor(audio){this.audio=audio;this.root=document.getElementById('countdown');this.lamps=[...this.root.querySelectorAll('.start-lamp')];this.label=document.getElementById('startLabel');this.lastStage=null;this.active=false;this.goAge=0;}
 begin(){this.lastStage=null;this.active=true;this.goAge=0;this.root.hidden=false;this.show(3);}
 show(remaining){const phase=signalPhase(remaining);this.root.dataset.green=String(phase.green);this.lamps.forEach((lamp,i)=>lamp.dataset.lit=String(i<phase.lit));if(this.label.textContent!==phase.label){this.label.textContent=phase.label;this.root.setAttribute('aria-label',phase.green?'Largada liberada':`Largada em ${phase.number}`);}if(phase.number!==this.lastStage&&this.audio.startSignal(phase.number))this.lastStage=phase.number;}
 update(mode,remaining,dt){if(!this.active)return;if(mode==='countdown'){this.show(remaining);return;}if(mode==='racing'){this.show(0);this.goAge+=dt;if(this.goAge>.85)this.hide();}else if(mode!=='paused')this.hide();}
 hide(){this.active=false;this.root.hidden=true;}
}
