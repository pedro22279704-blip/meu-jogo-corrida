import {TRACK_LENGTH} from './race.js';
// Perfil periódico: não há degrau entre a última e a primeira volta.
export function surfaceProfile(distance){
 const phase=distance/TRACK_LENGTH*Math.PI*2;
 return {height:2+4*(1-Math.cos(phase)),grade:4*Math.sin(phase)*Math.PI*2/TRACK_LENGTH,bank:.09*Math.sin(phase*2)};
}
