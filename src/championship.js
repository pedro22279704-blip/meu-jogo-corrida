export const CUP_TRACKS=['valley','harbor'];
export const CUP_POINTS=[10,7,5,3,2,1];
export function createCup(){return {round:0,scores:Array(6).fill(0),places:Array(6).fill(0),results:[]};}
export function scoreCup(cup,finishers){
 if(cup.results.length>cup.round||finishers.length!==6||finishers.some(r=>!r.finished)||new Set(finishers.map(r=>r.pilot)).size!==6)return false;
 cup.results.push(finishers.map(r=>r.pilot));finishers.forEach((r,i)=>{cup.scores[r.pilot]+=CUP_POINTS[i];cup.places[r.pilot]+=i+1;});return true;
}
// Empate: menor soma das colocações; depois melhor posição na última corrida.
export function cupStandings(cup){const last=cup.results.at(-1)??[0,1,2,3,4,5];return cup.scores.map((points,pilot)=>({pilot,points})).sort((a,b)=>b.points-a.points||cup.places[a.pilot]-cup.places[b.pilot]||last.indexOf(a.pilot)-last.indexOf(b.pilot));}
