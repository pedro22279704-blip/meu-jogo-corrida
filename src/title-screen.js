import {TitleStage} from './title-stage.js';

export function createTitleScreen({audio,getModels,reduced,onEnter}){
 const root=document.getElementById('titleScreen'),start=document.getElementById('titleStart'),skip=document.getElementById('titleSkip'),sound=document.getElementById('titleSound'),status=document.getElementById('titleStatus');
 let stage=null,active=false,started=false,failed=false;
 function enter(){if(!active)return;active=false;root.hidden=true;document.body.classList.remove('title-open');audio.stopTitle();stage?.dispose();stage=null;onEnter();}
 function activate(){if(!active)return;if(started){enter();return;}started=true;root.classList.add('title-running');audio.startTitle().then(ok=>{if(active)status.textContent=ok?'Motores ligados. A corrida é sua!':'Pronto para correr!';});start.textContent='Entrar no jogo →';skip.textContent='Ir ao menu';}
 function show(){active=true;started=false;failed=false;root.hidden=false;document.getElementById('menu').inert=true;root.classList.remove('title-running','title-no-3d');document.body.classList.add('title-open');start.textContent='Ligar motores';skip.textContent='Pular abertura';status.textContent='Toque ou aperte Enter para ouvir a abertura';sound.textContent=audio.muted?'Som: desligado':'Som: ligado';sound.setAttribute('aria-pressed',String(audio.muted));start.focus({preventScroll:true});}
 start.onclick=activate;skip.onclick=enter;sound.onclick=()=>{const muted=audio.toggle();sound.textContent=muted?'Som: desligado':'Som: ligado';sound.setAttribute('aria-pressed',String(muted));};
 root.addEventListener('keydown',e=>{if(e.code==='Escape'){e.preventDefault();e.stopPropagation();enter();}else if(e.code==='Enter'&&e.target===root){e.preventDefault();activate();}else if(e.code==='Tab'){const buttons=[sound,start,skip];if(e.shiftKey&&document.activeElement===sound){e.preventDefault();skip.focus();}else if(!e.shiftKey&&document.activeElement===skip){e.preventDefault();sound.focus();}}});
 document.addEventListener('visibilitychange',()=>{if(active&&started)audio.setPaused(document.hidden);});
 return {show,enter,activate,get active(){return active;},update(dt){if(!active||document.hidden)return;root.classList.toggle('title-reduced',reduced());if(failed)return;try{stage??=new TitleStage(document.getElementById('titleCars'));stage.update(dt,getModels(),reduced());}catch{failed=true;root.classList.add('title-no-3d');stage?.dispose();stage=null;}},dispose(){audio.stopTitle();stage?.dispose();}};
}
