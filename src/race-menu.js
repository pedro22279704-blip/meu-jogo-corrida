import {TRACKS,createCircuitCurve,trackLength} from './tracks.js';

const themes={valley:['#166c75','#b5f65b','CAMPOS & CURVAS'],harbor:['#954c65','#ffcc83','SOL & MAR'],fair:['#347f71','#ffe477','FESTA NA VILA'],sawmill:['#865c36','#f8bc66','AVENTURA NA SERRA'],night:['#302d71','#7afff5','LUZES DA METRÓPOLE']};
export function circuitArt(id){
 const curve=createCircuitCurve(id),points=Array.from({length:181},(_,i)=>curve.getPointAt(i/180)),xs=points.map(p=>p.x),zs=points.map(p=>p.z),minX=Math.min(...xs),minZ=Math.min(...zs),scale=Math.min(290/(Math.max(...xs)-minX),155/(Math.max(...zs)-minZ));
 const d=points.map((p,i)=>`${i?'L':'M'}${(55+(p.x-minX)*scale).toFixed(1)},${(35+(p.z-minZ)*scale).toFixed(1)}`).join(' ')+'Z',colors=themes[id];
 return `<svg viewBox="0 0 400 230" aria-hidden="true" focusable="false"><rect width="400" height="230" rx="18" fill="${colors[0]}"/><g opacity=".15" fill="${colors[1]}"><circle cx="365" cy="20" r="80"/><circle cx="30" cy="220" r="85"/><path d="M0 180L400 0V35L0 215Z"/></g><path d="${d}" fill="none" stroke="#091c34" stroke-width="23" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="${colors[1]}" stroke-width="17"/><path d="${d}" fill="none" stroke="#e8f4ed" stroke-width="2" stroke-dasharray="3 7"/><circle cx="${55+(points[0].x-minX)*scale}" cy="${35+(points[0].z-minZ)*scale}" r="8" fill="#fff" stroke="#102738" stroke-width="3"/></svg>`;
}
export function createRaceMenu(){
 const select=document.getElementById('trackSelect'),page=document.getElementById('page-race');
 const hero=document.createElement('div');hero.className='race-hero';hero.innerHTML='<div class="race-hero-copy"><p class="race-overline">SEU PRÓXIMO GRANDE PRÊMIO</p><h2>Escolha seu caminho.<br>Acelere sua história.</h2><p>Cinco circuitos, oito karts e espaço para disputar cada curva.</p><span class="race-badge">🏁 Drift · nitro · ultrapassagens</span></div><div id="selectedCircuitArt" class="selected-circuit-art"></div>';
 page.prepend(hero);
 const heading=document.createElement('h2');heading.className='circuit-heading';heading.textContent='01 / Escolha o circuito';
 const grid=document.createElement('div');grid.className='circuit-grid';grid.setAttribute('role','group');grid.setAttribute('aria-label','Circuitos');
 for(const [id,track] of Object.entries(TRACKS)){
  const button=document.createElement('button');button.type='button';button.className='circuit-card';button.dataset.track=id;button.innerHTML=`${circuitArt(id)}<small>${themes[id][2]}</small><strong>${track.name}</strong><span>${(trackLength(id)/1000).toFixed(2).replace('.',',')} km · 3 voltas</span>`;
  button.onclick=()=>{select.value=id;select.dispatchEvent(new Event('change',{bubbles:true}));};grid.append(button);
 }
 hero.after(heading,grid);
 const modeHeading=document.createElement('h2');modeHeading.className='circuit-heading';modeHeading.textContent='02 / Escolha como correr';page.querySelector('.menu-actions').before(modeHeading);
 for(const [id,icon,title,detail] of [['play','⚑','Corrida rápida','Uma pista. Oito pilotos. Pé na tábua.'],['horizonCup','🏆','Copa Horizonte','Quatro pistas · apresentação cinematográfica'],['cup','★','Duelo clássico','Vale Neon + Porto Âmbar · por pontos'],['learn','↗','Treino livre','Uma volta para dominar o drift']])document.getElementById(id).innerHTML=`<span class="mode-icon" aria-hidden="true">${icon}</span><span><strong>${title}</strong><small>${detail}</small></span><span aria-hidden="true">→</span>`;
 const sync=()=>{for(const button of grid.children)button.setAttribute('aria-pressed',String(button.dataset.track===select.value));document.getElementById('selectedCircuitArt').innerHTML=circuitArt(select.value)+`<strong>${TRACKS[select.value].name}</strong>`;};
 select.addEventListener('change',sync);sync();return {sync};
}
