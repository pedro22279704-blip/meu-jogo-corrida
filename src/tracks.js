import * as THREE from 'three';
export const PREVIOUS_LENGTHS={valley:760,harbor:760,fair:1440,sawmill:1680,night:1900};
export const REVISION3_LENGTHS={valley:1520,harbor:1520,fair:2880,sawmill:3360,night:3800};
export const TRACKS={
 valley:{name:'Vale Neon',sky:'#8ccbd3',ground:'#78a879',length:2280,revision:4,description:'2,28 km · retas planas, colinas e curvas largas inclinadas de alta velocidade.'},
 harbor:{name:'Porto Âmbar',sky:'#efad91',ground:'#407d89',length:2280,revision:4,description:'2,28 km · arcos costeiros, cais elevado e descida contínua ao trecho subaquático.'},
 fair:{name:'Vila da Feira',sky:'#a3dce4',ground:'#91b56c',length:4320,revision:4,description:'4,32 km · praças planas, curvas em S e duas galerias, com espaço para carregar o drift.'},
 sawmill:{name:'Serraria dos Barris',sky:'#d4bfa0',ground:'#8caa76',length:5040,revision:4,description:'5,04 km · subida da serra, planaltos, descida, curvas inclinadas e túneis.'},
 night:{name:'Avenida Neon',sky:'#151c40',ground:'#28314c',length:5700,revision:4,description:'5,70 km · grandes arcos em oito, avenidas planas e viaduto com passagem inferior.'},
};
export const trackLength=id=>TRACKS[id]?.length??2280;
export const lapProgress=(distance,id)=>((distance%trackLength(id))+trackLength(id))%trackLength(id);
// Historical ghosts retain their original distance scale.
export function lengthForScope(scope=''){
 for(const id of Object.keys(TRACKS)){
  if(scope.startsWith(id+'-r4-'))return trackLength(id);
  if(scope.startsWith(id+'-r3-'))return REVISION3_LENGTHS[id];
  if(scope.startsWith(id+'-r2-'))return PREVIOUS_LENGTHS[id];
 }
 return 760;
}
export const TUNNELS={
 valley:[{start:.59,end:.66,name:'Túnel dos Cristais'}],harbor:[],
 fair:[{start:.045,end:.145,name:'Galeria dos Arcos'},{start:.53,end:.63,name:'Passagem da Praça'}],
 sawmill:[{start:.045,end:.20,name:'Túnel da Pedreira'},{start:.60,end:.72,name:'Mina dos Barris'}],
 night:[{start:.04,end:.17,name:'Metrô Neon'},{start:.60,end:.70,name:'Túnel do Viaduto'}],
};
export const BRIDGES={valley:[{start:.24,end:.30}],harbor:[],fair:[],sawmill:[{start:.36,end:.49}],night:[{start:.20,end:.30}]};
const routes={
 valley:[[0,160],[130,160],[210,110],[235,20],[210,-90],[130,-150],[0,-160],[-130,-160],[-220,-100],[-235,0],[-210,100],[-130,160]],
 harbor:[[0,210],[160,210],[260,130],[280,10],[160,-80],[230,-220],[100,-300],[-80,-270],[-210,-170],[-250,-20],[-170,120],[-80,210]],
 fair:[[0,220],[180,220],[280,150],[290,30],[160,-20],[100,-120],[220,-180],[160,-300],[-40,-310],[-160,-230],[-140,-100],[-270,-40],[-300,100],[-180,210]],
 sawmill:[[0,260],[180,260],[300,180],[320,40],[210,-20],[120,40],[20,-20],[80,-120],[240,-140],[290,-260],[120,-340],[-80,-330],[-200,-230],[-320,-140],[-330,40],[-220,180],[-100,220]],
};
function rounded(points){
 let p=points.map(([x,z])=>new THREE.Vector3(x,0,z));
 for(let pass=0;pass<2;pass++)p=p.flatMap((a,i)=>{const b=p[(i+1)%p.length];return [a.clone().lerp(b,.25),a.clone().lerp(b,.75)];});
 return p;
}
export function createCircuitCurve(id){
 const points=id==='night'?Array.from({length:48},(_,i)=>{const t=-Math.PI/2+i/48*Math.PI*2;return new THREE.Vector3(280*Math.sin(t),0,-170*Math.sin(t*2));}):rounded(routes[id]??routes.valley);
 const curve=new THREE.CatmullRomCurve3(points,true,'centripetal');curve.arcLengthDivisions=3200;
 const scale=trackLength(id)/curve.getLength();curve.points.forEach(p=>p.multiplyScalar(scale));curve.updateArcLengths();return curve;
}
