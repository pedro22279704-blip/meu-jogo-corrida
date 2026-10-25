import {trackLength,lapProgress} from './tracks.js';
export const SHORTCUTS={valley:{start:330,end:525,name:'Corte dos Cristais'},harbor:{start:960,end:1170,name:'Passarela dos Guindastes'},fair:{start:1380,end:1605,name:'Travessa do Mercado'},sawmill:{start:3960,end:4170,name:'Corte da Floresta'},night:{start:2460,end:2670,name:'Beco dos Hologramas'}};
export function shortcutState(r){
 const spec=SHORTCUTS[r.settings.track],progress=lapProgress(r.distance,r.settings.track),lap=Math.floor(r.distance/trackLength(r.settings.track));
 if(r.shortcut&&(progress>spec.end||lap!==r.shortcutLap)){r.shortcut=false;r.shortcutFailed=false;}
 if(!r.shortcut&&r.shortcutLap!==lap&&progress>=spec.start&&progress<=spec.start+3&&r.offset>2&&r.offset<4&&r.speed>18&&(r.drifting||(r.index>0&&r.style==='explorer'))){r.shortcut=true;r.shortcutLap=lap;r.shortcutFailed=false;}
 if(r.shortcut&&(r.offset<1.7||r.offset>4.3||r.speed<12))r.shortcutFailed=true;
 return r.shortcut?(r.shortcutFailed?.55:1.18):1;
}
