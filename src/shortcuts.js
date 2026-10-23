import {trackLength,lapProgress} from './tracks.js';
export const SHORTCUTS={valley:{start:110,end:175,name:'Corte dos Cristais'},harbor:{start:320,end:390,name:'Passarela dos Guindastes'},fair:{start:460,end:535,name:'Travessa do Mercado'},sawmill:{start:1320,end:1390,name:'Corte da Floresta'},night:{start:820,end:890,name:'Beco dos Hologramas'}};
export function shortcutState(r){
 const spec=SHORTCUTS[r.settings.track],progress=lapProgress(r.distance,r.settings.track),lap=Math.floor(r.distance/trackLength(r.settings.track));
 if(r.shortcut&&(progress>spec.end||lap!==r.shortcutLap)){r.shortcut=false;r.shortcutFailed=false;}
 if(!r.shortcut&&r.shortcutLap!==lap&&progress>=spec.start&&progress<=spec.start+3&&r.offset>2&&r.offset<4&&r.speed>18&&(r.drifting||(r.index>0&&r.style==='explorer'))){r.shortcut=true;r.shortcutLap=lap;r.shortcutFailed=false;}
 if(r.shortcut&&(r.offset<1.7||r.offset>4.3||r.speed<12))r.shortcutFailed=true;
 return r.shortcut?(r.shortcutFailed?.55:1.18):1;
}
