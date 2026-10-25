const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
export function itemWeights(distance){
 const d=clamp(Number(distance)||0,0,200),t=d<=100?d/100:(d-100)/100;
 const a=d<=100?[.8,.2,0]:[.2,.6,.2],b=d<=100?[.2,.6,.2]:[.08,.42,.5];
 const [defense,attack,recovery]=a.map((v,i)=>v+(b[i]-v)*t);return {defense,attack,recovery};
}
export function distanceItem(distance,roll){
 const {defense,attack}=itemWeights(distance),value=Number.isFinite(roll)?roll:0,x=((value%1)+1)%1;
 if(x<defense)return x<defense*.65?'shield':'gum';
 if(x<defense+attack)return (x-defense)/attack<.55?'mushroom':'shell';
 return (x-defense-attack)/(1-defense-attack)<.55?'pulse':'storm';
}
// Race progress is unwrapped: a lap behind must not look like a nearby rival.
export const leaderGap=(r,racers)=>Math.max(0,...racers.map(other=>other.distance-r.distance));

