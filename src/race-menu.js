import {previousSelectionStage,modeTracks} from './selection-flow.js';
import {TRACKS,createCircuitCurve,trackLength} from './tracks.js';

const themes={valley:['#166c75','#b5f65b','CAMPOS & CURVAS'],harbor:['#954c65','#ffcc83','SOL & MAR'],fair:['#347f71','#ffe477','FESTA NA VILA'],sawmill:['#865c36','#f8bc66','AVENTURA NA SERRA'],night:['#302d71','#7afff5','LUZES DA METRÓPOLE']};
export function circuitArt(id){
 const curve=createCircuitCurve(id),points=Array.from({length:181},(_,i)=>curve.getPointAt(i/180)),xs=points.map(p=>p.x),zs=points.map(p=>p.z),minX=Math.min(...xs),minZ=Math.min(...zs),scale=Math.min(290/(Math.max(...xs)-minX),155/(Math.max(...zs)-minZ));
 const d=points.map((p,i)=>`${i?'L':'M'}${(55+(p.x-minX)*scale).toFixed(1)},${(35+(p.z-minZ)*scale).toFixed(1)}`).join(' ')+'Z',colors=themes[id];
 return `<svg viewBox="0 0 400 230" aria-hidden="true" focusable="false"><rect width="400" height="230" rx="18" fill="${colors[0]}"/><g opacity=".15" fill="${colors[1]}"><circle cx="365" cy="20" r="80"/><circle cx="30" cy="220" r="85"/><path d="M0 180L400 0V35L0 215Z"/></g><path d="${d}" fill="none" stroke="#091c34" stroke-width="23" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${colors[1]}" stroke-width="17"/><path d="${d}" fill="none" stroke="#e8f4ed" stroke-width="2" stroke-dasharray="3 7"/><circle cx="${55+(points[0].x-minX)*scale}" cy="${35+(points[0].z-minZ)*scale}" r="8" fill="#fff" stroke="#102738" stroke-width="3"/></svg>`;
}
export function createRaceMenu({onStart,onCarStage,onPilotStage}){
 const $=id=>document.getElementById(id),select=$('trackSelect');
 let stage='home',selectedMode='quick';
 const headings={cars:'01 / Escolha seu carro',characters:'02 / Escolha seu piloto',tracks:'03 / Escolha a pista'};
 const grid=document.createElement('div');grid.className='circuit-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label','Pistas para iniciar');
 for(const [id,track] of Object.entries(TRACKS)){
  const button=document.createElement('button');button.type='button';button.className='circuit-card';button.dataset.track=id;
  button.innerHTML=`${circuitArt(id)}<small>${themes[id][2]}</small><strong>${track.name}</strong><span>${(trackLength(id)/1000).toFixed(2).replace('.',',')} km · iniciar →</span>`;
  button.onclick=()=>{select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));onStart(selectedMode,id);};grid.append(button);
 }
 const heading=document.createElement('h2');heading.textContent='Escolha a pista';$('page-race').prepend(heading,grid);
 const note=document.createElement('p');note.id='cupTrackHint';$('page-race').append(note);
 for(const [id,icon,title,mode] of [['play','⚑','Rápida','quick'],['horizonCup','🏆','Copa','horizon'],['cup','★','Duelo','classic'],['learn','↗','Treino','training']]){
  const button=$(id);button.innerHTML=`<span class="mode-icon" aria-hidden="true">${icon}</span><strong>${title}</strong><span aria-hidden="true">→</span>`;
  button.onclick=()=>{selectedMode=mode;show('cars');};
 }
 for(const button of document.querySelectorAll('.pilot-choice'))button.addEventListener('click',()=>show('characters'));
 function allowed(id){return modeTracks(selectedMode).includes(id);}
 function sync(){for(const button of grid.children){button.setAttribute('aria-pressed',String(button.dataset.track===select.value));button.hidden=!allowed(button.dataset.track);}note.textContent=selectedMode==='horizon'?'A pista escolhida abre a Copa Horizonte. As outras três vêm em seguida.':selectedMode==='classic'?'Escolha a primeira pista do duelo. A outra vem na segunda etapa.':'';}
 function show(next){
  stage=next;const page=next==='cars'?'pilots':next==='tracks'?'race':next;
  for(const id of ['home','pilots','characters','race','options','challenges'])$('page-'+id).hidden=id!==page;
  $('menu').dataset.stage=next;$('menu').scrollTop=0;
  $('pilotsBack').hidden=next==='home';$('pilotsBack').textContent=['characters','tracks'].includes(next)?'← Voltar':'← Menu';
  $('flowProgress').hidden=!headings[next];$('flowProgress').textContent=headings[next]??'';
  for(const tab of document.querySelectorAll('[data-page]')){const active=tab.dataset.page===(next==='home'?'race':next);tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
  if(next==='cars')onCarStage();if(next==='characters')onPilotStage();sync();
  const panel=$('page-'+page),first=next==='home'?$('play'):next==='cars'?panel.querySelector('.pilot-choice'):next==='characters'?panel.querySelector('.character-card[aria-pressed=true]')??panel.querySelector('.character-card'):next==='tracks'?panel.querySelector('.circuit-card[aria-pressed=true]:not([hidden])')??panel.querySelector('.circuit-card:not([hidden])'):panel.querySelector('select,button,input');first?.focus({preventScroll:true});
 }
 function back(){show(previousSelectionStage(stage));}
 select.addEventListener('change',sync);
 return {show,back,sync,get stage(){return stage;},get selectedMode(){return selectedMode;}};
}
