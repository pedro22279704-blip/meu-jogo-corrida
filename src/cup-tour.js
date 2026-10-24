import * as THREE from 'three';
import {TRACKS,trackLength} from './tracks.js';

export const TOUR_SHOT_SECONDS=2.4;
export function tourFrame(time,tracks,reduced=false){
 const shots=reduced?1:3,shotSeconds=reduced?4:TOUR_SHOT_SECONDS,total=tracks.length*shots*shotSeconds;
 const clamped=Math.max(0,Math.min(time,total)),step=Math.min(tracks.length*shots-1,Math.floor(clamped/shotSeconds)),index=Math.floor(step/shots);
 return {track:tracks[index],index,shot:step%shots,u:Math.min(1,(clamped-step*shotSeconds)/shotSeconds),progress:clamped/total,done:time>=total};
}

export function tourCamera(world,id,shot,u,reduced=false){
 const length=trackLength(id),ease=reduced?.5:u*u*(3-2*u),anchors={valley:.29,harbor:.43,fair:.37,sawmill:.38},target=new THREE.Vector3(),position=new THREE.Vector3();
 if(shot===0){const points=world.curve.getSpacedPoints(32),bounds=new THREE.Box3().setFromPoints(points),center=bounds.getCenter(new THREE.Vector3()),size=bounds.getSize(new THREE.Vector3()),radius=Math.max(size.x,size.z)*.62;center.y=world.track(length*.25).p.y;const angle=-.65+ease*.4;position.copy(center).add(new THREE.Vector3(Math.cos(angle)*radius,radius*.85+30,Math.sin(angle)*radius));target.copy(center);}
 else if(shot===1){const d=(anchors[id]??.3)*length+ease*35,f=world.track(d,-19);position.copy(f.p).addScaledVector(f.up,9);target.copy(world.track(d+28).p).addScaledVector(f.up,2);}
 else{const f=world.track(0);position.copy(f.p).addScaledVector(f.tangent,-29+ease*7).addScaledVector(f.normal,18-ease*9).addScaledVector(f.up,11-ease*3);target.copy(f.p).addScaledVector(f.tangent,13).addScaledVector(f.up,2);}
 return {position,target,fov:shot===0?52:shot===1?58:48};
}

export class CupTour{
 constructor({onTrack,onFinish,onCancel,reduced,onPause=()=>{}}){
  this.onPause=onPause;
  this.onTrack=onTrack;this.onFinish=onFinish;this.onCancel=onCancel;this.reduced=reduced;this.root=document.getElementById('cupTour');this.pauseButton=document.getElementById('tourPause');this.skipButton=document.getElementById('tourSkip');this.cancelButton=document.getElementById('tourCancel');
  this.pauseButton.onclick=()=>this.toggle();this.skipButton.onclick=()=>this.finish();this.cancelButton.onclick=()=>this.cancel();
  this.root.addEventListener('keydown',e=>{if(e.code!=='Tab')return;const buttons=[this.pauseButton,this.skipButton,this.cancelButton];if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1).focus();}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0].focus();}});
 }
 start(tracks,name,offset=0,total=tracks.length){this.tracks=[...tracks];this.offset=offset;this.total=total;this.time=0;this.active=true;this.paused=false;this.lastTrack=null;this.reduce=this.reduced();this.root.hidden=false;document.getElementById('tourCupTitle').textContent=name;this.pauseButton.textContent='Pausar';document.getElementById('tourItinerary').replaceChildren(...tracks.map(id=>{const span=document.createElement('span');span.textContent=TRACKS[id].name;return span;}));this.skipButton.focus();}
 toggle(){this.paused=!this.paused;this.pauseButton.textContent=this.paused?'Continuar':'Pausar';this.onPause(this.paused);}
 update(dt){if(!this.active)return null;if(!this.paused)this.time+=dt;const frame=tourFrame(this.time,this.tracks,this.reduce);if(frame.done){this.finish();return null;}if(frame.track!==this.lastTrack){this.lastTrack=frame.track;this.onTrack(frame.track);document.getElementById('tourTrackName').textContent=TRACKS[frame.track].name;document.getElementById('tourTrackNumber').textContent=`${String(frame.index+this.offset+1).padStart(2,'0')} / ${String(this.total).padStart(2,'0')}`;[...document.getElementById('tourItinerary').children].forEach((span,i)=>span.classList.toggle('current',i===frame.index));}
  document.getElementById('tourViewName').textContent=['VISTA AÉREA','POR DENTRO DO CIRCUITO','PREPARE-SE PARA A LARGADA'][frame.shot];document.getElementById('tourProgress').value=frame.progress;this.root.style.setProperty('--tour-fade',this.reduce?0:Math.max(0,1-Math.min(frame.u,1-frame.u)*14));return frame;
 }
 finish(){if(!this.active)return;this.active=false;this.root.hidden=true;this.onFinish();}
 cancel(){if(!this.active)return;this.active=false;this.root.hidden=true;this.onCancel();}
}
