import {PILOTS} from './settings.js';
export const CUP_TRACKS=['valley','harbor'];
export const CUP_POINTS=[10,7,5,3,2,1,0];
export function createCup(){return {round:0,scores:Array(PILOTS.length).fill(0),places:Array(PILOTS.length).fill(0),results:[]};}
export function scoreCup(cup,finishers){
 if(cup.results.length>cup.round||finishers.length!==PILOTS.length||finishers.some(r=>!r.finished||!Number.isInteger(r.pilot)||r.pilot<0||r.pilot>=PILOTS.length)||new Set(finishers.map(r=>r.pilot)).size!==PILOTS.length)return false;
 cup.results.push(finishers.map(r=>r.pilot));finishers.forEach((r,i)=>{cup.scores[r.pilot]+=CUP_POINTS[i];cup.places[r.pilot]+=i+1;});return true;
}
// Empate: menor soma das colocações; depois melhor posição na última corrida.
export function cupStandings(cup){const last=cup.results.at(-1)??PILOTS.map((_,i)=>i);return cup.scores.map((points,pilot)=>({pilot,points})).sort((a,b)=>b.points-a.points||cup.places[a.pilot]-cup.places[b.pilot]||last.indexOf(a.pilot)-last.indexOf(b.pilot));}
