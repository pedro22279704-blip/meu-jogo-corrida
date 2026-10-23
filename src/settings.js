import {normalizeCharacter} from './characters.js';
export const PILOTS=['Lume','Bia Faísca','Téo Musgo','Nina Cometa','Zeca Brisa','Sol Cobre','Carro 10','Carro Barril'];
export const COLORS=['#b4ff5c','#f8829d','#ffc15a','#9b8dff','#5bdddf','#ff9166','#3808ef','#986347'];
export const DIFFICULTIES={easy:{name:'Fácil',pace:-3.2,turbo:.7,mistake:5,accel:12},medium:{name:'Média',pace:0,turbo:1.4,mistake:2.5,accel:16},hard:{name:'Difícil',pace:2,turbo:2.2,mistake:1,accel:18}};
export function normalizeSettings(value={}){
 const number=(v,fallback,min,max)=>Number.isFinite(Number(v))?Math.max(min,Math.min(max,Number(v))):fallback;
 return {character:normalizeCharacter(value.character),ghostEnabled:value.ghostEnabled!==false,quality:value.quality==='light'?'light':'pretty',reducedMotion:value.reducedMotion===true,pilot:Math.round(number(value.pilot,0,0,PILOTS.length-1)),difficulty:Object.hasOwn(DIFFICULTIES,value.difficulty)?value.difficulty:'medium',track:value.track==='harbor'?'harbor':'valley',sensitivity:number(value.sensitivity,1,.5,1.5),musicVolume:number(value.musicVolume,.7,0,1),effectsVolume:number(value.effectsVolume,.8,0,1)};
}
export function readSettings(storage){try{return normalizeSettings(JSON.parse(storage.getItem('vale-neon-settings'))??{});}catch{return normalizeSettings();}}
export function writeSettings(storage,value){try{storage.setItem('vale-neon-settings',JSON.stringify(normalizeSettings(value)));}catch{/* Configurações continuam válidas nesta sessão. */}}
export function recordScope(settings){return `${settings.track}-${settings.difficulty}`;}
