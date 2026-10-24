import * as THREE from 'three';
export const TRACKS={
 valley:{name:'Vale Neon',sky:'#8ccbd3',ground:'#78a879'},
 harbor:{name:'Porto Âmbar',sky:'#efad91',ground:'#407d89'},
 fair:{name:'Vila da Feira',sky:'#a3dce4',ground:'#91b56c',length:1440,revision:2,description:'Chicanes entre praças e duas galerias cobertas. 1,44 km por volta.'},
 sawmill:{name:'Serraria dos Barris',sky:'#d4bfa0',ground:'#8caa76',length:1680,revision:2,description:'Subida da serra, curvas em S, viaduto e dois túneis na pedreira. 1,68 km por volta.'},
 night:{name:'Avenida Neon',sky:'#151c40',ground:'#28314c',length:1900,revision:2,description:'Metrópole neon inspirada em Tóquio: painéis gigantes, avenidas e viaduto em oito com túneis. 1,90 km por volta.'},
};
export const trackLength=id=>TRACKS[id]?.length??760;
export const lapProgress=(distance,id)=>((distance%trackLength(id))+trackLength(id))%trackLength(id);
export function lengthForScope(scope=''){const id=Object.keys(TRACKS).find(id=>scope.startsWith(`${id}-r2-`));return id?trackLength(id):760;}
export const TUNNELS={
 fair:[{start:.045,end:.145,name:'Galeria dos Arcos'},{start:.53,end:.63,name:'Passagem da Praça'}],
 sawmill:[{start:.045,end:.20,name:'Túnel da Pedreira'},{start:.60,end:.72,name:'Mina dos Barris'}],
 night:[{start:.04,end:.17,name:'Metrô Neon'},{start:.60,end:.70,name:'Túnel do Viaduto'}],
};
export const BRIDGES={fair:[],sawmill:[{start:.36,end:.49}],night:[{start:.20,end:.30}]};
export function createCircuitCurve(id){
 const routes={
  fair:[[0,180],[110,180],[170,130],[170,40],[90,30],[90,-45],[185,-65],[195,-150],[100,-200],[-30,-190],[-70,-120],[-170,-125],[-210,-40],[-150,25],[-200,105],[-100,180]],
  sawmill:[[0,220],[140,210],[230,130],[140,70],[70,105],[20,45],[125,-10],[230,-100],[180,-200],[60,-240],[-80,-200],[-140,-100],[-230,-35],[-220,90],[-110,170]],
  night:[[-180,0],[-130,100],[0,0],[130,-100],[180,0],[130,100],[0,0],[-130,-100]],
 };
 if(routes[id]){const curve=new THREE.CatmullRomCurve3(routes[id].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');curve.arcLengthDivisions=1600;const scale=trackLength(id)/curve.getLength();curve.points.forEach(p=>p.multiplyScalar(scale));curve.updateArcLengths();return curve;}
 if(id==='harbor')return new THREE.CatmullRomCurve3([[0,85],[70,85],[120,55],[112,0],[70,-20],[95,-75],[25,-100],[-60,-90],[-115,-40],[-100,30],[-45,35],[-40,85]].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
 const points=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=1+.14*Math.sin(a*3);points.push(new THREE.Vector3(Math.sin(a)*100*r,0,Math.cos(a)*74*r));}return new THREE.CatmullRomCurve3(points,true,'centripetal');
}
