import {trackLength} from './tracks.js';
// Perfil periódico: não há degrau entre a última e a primeira volta.
export function surfaceProfile(distance,trackId='valley'){
 const TRACK_LENGTH=trackLength(trackId),phase=distance/TRACK_LENGTH*Math.PI*2;
 if(trackId==='fair')return {height:4+2*(1-Math.cos(phase*2)),grade:4*Math.sin(phase*2)*Math.PI*2/TRACK_LENGTH,bank:.07*Math.sin(phase*4)};
 if(trackId==='sawmill')return {height:5+11*(1-Math.cos(phase))+3*(1-Math.cos(phase*3)),grade:(11*Math.sin(phase)+9*Math.sin(phase*3))*Math.PI*2/TRACK_LENGTH,bank:.09*Math.sin(phase*3)};
 if(trackId==='night')return {height:16+12*Math.sin(phase),grade:12*Math.cos(phase)*Math.PI*2/TRACK_LENGTH,bank:.07*Math.sin(phase*2)};
 if(trackId==='harbor')return {height:2+1.2*(1-Math.cos(phase*2)),grade:2.4*Math.sin(phase*2)*Math.PI*2/TRACK_LENGTH,bank:.055*Math.sin(phase*3)};
 return {height:2+4*(1-Math.cos(phase)),grade:4*Math.sin(phase)*Math.PI*2/TRACK_LENGTH,bank:.09*Math.sin(phase*2)};
}
