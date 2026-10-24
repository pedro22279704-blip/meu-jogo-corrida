import {PILOTS} from './settings.js';
export const CUP_TRACKS=['valley','harbor'];
export const CUP_POINTS=[10,7,5,3,2,1,0,0];
export const HORIZON_TRACKS=['valley','harbor','fair','sawmill'];
export const HORIZON_POINTS=[15,12,10,9,8,7,6,5];
export function createCup(id='classic'){const horizon=id==='horizon';return {id:horizon?'horizon':'classic',name:horizon?'Copa Horizonte':'Troféu do Vale',tracks:[...(horizon?HORIZON_TRACKS:CUP_TRACKS)],points:[...(horizon?HORIZON_POINTS:CUP_POINTS)],round:0,scores:Array(PILOTS.length).fill(0),places:Array(PILOTS.length).fill(0),results:[]};}
export const cupComplete=cup=>!!cup&&cup.results.length===cup.tracks.length;
export function advanceCup(cup){if(!cup||cupComplete(cup)||cup.results.length!==cup.round+1)return false;cup.round++;return true;}
export function scoreCup(cup,finishers){
 if(cup.round<0||cup.round>=cup.tracks.length||cup.results.length!==cup.round||finishers.length!==PILOTS.length||finishers.some(r=>!r.finished||!Number.isInteger(r.pilot)||r.pilot<0||r.pilot>=PILOTS.length)||new Set(finishers.map(r=>r.pilot)).size!==PILOTS.length)return false;
 cup.results.push(finishers.map(r=>r.pilot));finishers.forEach((r,i)=>{cup.scores[r.pilot]+=cup.points[i];cup.places[r.pilot]+=i+1;});return true;
}
// Empate: menor soma das colocações; depois melhor posição na última corrida.
export function cupStandings(cup){const last=cup.results.at(-1)??PILOTS.map((_,i)=>i);return cup.scores.map((points,pilot)=>({pilot,points})).sort((a,b)=>b.points-a.points||cup.places[a.pilot]-cup.places[b.pilot]||last.indexOf(a.pilot)-last.indexOf(b.pilot));}
