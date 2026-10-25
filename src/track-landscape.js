import * as THREE from 'three';
// Sloped terrain joins elevated land circuits to the ground, outside the kerbs.
export function createEmbankment(frame,length,{steps=500,skip=()=>false}={}){
 const positions=[],indices=[],strips=8;
 for(const side of [-1,1]){const base=positions.length/3;
  for(let i=0;i<=steps;i++)for(let j=0;j<=strips;j++){
   const u=j/strips,p=frame(i/steps*length,side*(13+57*u)).p,blend=u*u*(3-2*u);
   p.y=Math.max(-.12,p.y*(1-blend)-.12*blend);positions.push(p.x,p.y,p.z);
   if(i<steps&&j<strips&&!skip((i+.5)/steps*length)){const a=base+i*(strips+1)+j,b=a+strips+1;if(side===1)indices.push(a,b,a+1,a+1,b,b+1);else indices.push(a,a+1,b,a+1,b+1,b);}
  }
 }
 const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}
