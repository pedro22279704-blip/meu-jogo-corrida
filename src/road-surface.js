import * as THREE from 'three';

// Disjoint shoulder/road bands avoid coplanar surfaces fighting at a distance.
export function roadBands(width,innerWidth=0){return innerWidth>0?[[-width/2,-innerWidth/2],[innerWidth/2,width/2]]:[[-width/2,width/2]];}
export function createRoadRibbon(track,length,steps,width,{innerWidth=0,height=0,skip=()=>false}={}){
 const positions=[],indices=[],bands=roadBands(width,innerWidth);
 for(const band of bands){const base=positions.length/3;for(let i=0;i<=steps;i++){
  for(const offset of band){const p=track(i/steps*length,offset).p;positions.push(p.x,p.y+height,p.z);}
  if(i<steps&&!skip((i+.5)/steps*length)){const a=base+i*2;indices.push(a,a+2,a+1,a+1,a+2,a+3);}
 }}
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
