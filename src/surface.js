import {TRACK_LENGTH} from './race.js';
// Perfil periódico: não há degrau entre a última e a primeira volta.
export function surfaceProfile(distance,trackId='valley'){
 const phase=distance/TRACK_LENGTH*Math.PI*2;
 if(['fair','sawmill','night'].includes(trackId)){const amplitude={fair:1.8,sawmill:3,night:1.2}[trackId];return {height:2+amplitude*(1-Math.cos(phase*2)),grade:amplitude*2*Math.sin(phase*2)*Math.PI*2/TRACK_LENGTH,bank:.055*Math.sin(phase*3)};}
 if(trackId==='harbor')return {height:2+1.2*(1-Math.cos(phase*2)),grade:2.4*Math.sin(phase*2)*Math.PI*2/TRACK_LENGTH,bank:.055*Math.sin(phase*3)};
 return {height:2+4*(1-Math.cos(phase)),grade:4*Math.sin(phase)*Math.PI*2/TRACK_LENGTH,bank:.09*Math.sin(phase*2)};
}
