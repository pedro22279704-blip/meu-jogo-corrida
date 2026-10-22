import * as THREE from 'three';
export const TRACKS={valley:{name:'Vale Neon',sky:'#8ccbd3',ground:'#78a879'},harbor:{name:'Porto Âmbar',sky:'#efad91',ground:'#407d89'}};
export function createCircuitCurve(id){
 if(id==='harbor')return new THREE.CatmullRomCurve3([[0,85],[70,85],[120,55],[112,0],[70,-20],[95,-75],[25,-100],[-60,-90],[-115,-40],[-100,30],[-45,35],[-40,85]].map(([x,z])=>new THREE.Vector3(x,0,z)),true,'centripetal');
 const points=[];for(let i=0;i<12;i++){const a=i/12*Math.PI*2,r=1+.14*Math.sin(a*3);points.push(new THREE.Vector3(Math.sin(a)*100*r,0,Math.cos(a)*74*r));}return new THREE.CatmullRomCurve3(points,true,'centripetal');
}
