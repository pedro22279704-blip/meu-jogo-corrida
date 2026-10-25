import {TIRES,vehicleStats} from './vehicle-stats.js';
import {PILOTS} from './settings.js';
import './physics-garage.css';
export function applyTireVisuals(model,id){
 model?.traverse(node=>{if(!/^Roll_(FL|FR|BL|BR)([._]?\d+)?$/.test(node.name))return;node.userData.tireRestScale??=node.scale.clone();node.scale.copy(node.userData.tireRestScale);node.scale.x*=TIRES[id]?.width??1;});
}
export function createGarage({getSettings,onChange,onContinue}){
 const panel=document.createElement('section');panel.id='page-parts';panel.className='menu-page';panel.hidden=true;
 panel.innerHTML='<h2>Monte o seu kart</h2><div class="garage-layout"><div class="garage-summary"><img id="garagePortrait" alt=""><h3 id="garageName"></h3><dl id="garageStats"></dl><p>Cada moeda dá +1,5% de velocidade, até 10. Ataques tiram até 3 moedas.</p></div><div><fieldset><legend>Escolha os pneus</legend><div id="tireChoices"></div></fieldset><p id="tireDescription"></p><button id="garageContinue" type="button">Escolher piloto →</button></div></div>';
 document.getElementById('page-pilots').after(panel);
 const choices=panel.querySelector('#tireChoices');
 for(const [id,tire] of Object.entries(TIRES)){const button=document.createElement('button');button.type='button';button.className='tire-choice';button.dataset.tires=id;button.innerHTML=`<span aria-hidden="true">◉</span><strong>${tire.name}</strong><small>${tire.description}</small>`;button.onclick=()=>onChange(id);choices.append(button);}
 panel.querySelector('#garageContinue').onclick=onContinue;
 function refresh(){
  const settings=getSettings(),stats=vehicleStats(settings),tire=TIRES[settings.tires];
  const image=panel.querySelector('#garagePortrait');image.src=document.getElementById(`portrait-${settings.pilot}`)?.src??'';image.alt=PILOTS[settings.pilot];
  panel.querySelector('#garageName').textContent=`${PILOTS[settings.pilot]} · ${tire.name}`;
  panel.querySelector('#tireDescription').textContent=tire.description;
  panel.querySelector('#garageStats').replaceChildren();
  for(const [key,label,value,ratio] of [['speed','Velocidade',`${Math.round(stats.speed*3.6)} km/h`,stats.speed/38],['acceleration','Aceleração',`${stats.acceleration.toFixed(1)} m/s²`,stats.acceleration/18],['weight','Peso',stats.weight.toFixed(2),stats.weight/1.6],['handling','Dirigibilidade',`${Math.round(stats.handling*100)}%`,stats.handling/1.3],['offroad','Fora de estrada',`${Math.round(stats.offroad*100)}% da velocidade`,stats.offroad]]){
   const dt=document.createElement('dt');dt.textContent=label;const dd=document.createElement('dd'),meter=document.createElement('meter');meter.min=0;meter.max=1;meter.value=Math.min(1,ratio);meter.setAttribute('aria-label',label);dd.append(document.createTextNode(value),meter);dd.dataset.stat=key;panel.querySelector('#garageStats').append(dt,dd);
  }
  for(const button of choices.children)button.setAttribute('aria-pressed',String(button.dataset.tires===settings.tires));
 }
 return {refresh};
}
