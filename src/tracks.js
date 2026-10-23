import * as THREE from 'three';
export const TRACKS={
 valley:{name:'Vale Neon',sky:'#8ccbd3',ground:'#78a879'},
 harbor:{name:'Porto Âmbar',sky:'#efad91',ground:'#407d89'},
 fair:{name:'Vila da Feira',sky:'#a3dce4',ground:'#91b56c'},
 sawmill:{name:'Serraria dos Barris',sky:'#d4bfa0',ground:'#8caa76'},
 night:{name:'Avenida Neon',sky:'#151c40',ground:'#28314c'},
};
export function createCircuitCurve(id){
 const routes={fair:[[0,85],[70,95],[105,45],[65,0],[115,-55],[35,-95],[-45,-80],[-100,-35],[-80,35],[-35,60]],sawmill:[[0,95],[90,65],[100,-5],[45,-30],[65,-90],[-25,-105],[-100,-60],[-65,-10],[-115,45],[-50,80]],night:[[0,100],[85,100],[115,35],[80,-15],[105,-85],[25,-110],[-65,-85],[-105,-20],[-70,25],[-105,80]]};
 if(routes[id])return new THREE.CatmullRomCurve3(routes[id].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
 if(id==='harbor')return new THREE.CatmullRomCurve3([[0,85],[70,85],[120,55],[112,0],[70,-20],[95,-75],[25,-100],[-60,-90],[-115,-40],[-100,30],[-45,35],[-40,85]].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
 const points=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=1+.14*Math.sin(a*3);points.push(new THREE.Vector3(Math.sin(a)*100*r,0,Math.cos(a)*74*r));}return new THREE.CatmullRomCurve3(points,true,'centripetal');
}
