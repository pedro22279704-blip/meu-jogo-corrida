import * as THREE from 'three';
import {trackLength} from './tracks.js';
import {toonMaterial} from './cartoon.js';

export function asphaltTexture(){
 const size=64,data=new Uint8Array(size*size*4);let seed=117;
 for(let i=0;i<size*size;i++){seed=(seed*1664525+1013904223)>>>0;const c=190+(seed%35);data[i*4]=data[i*4+1]=data[i*4+2]=c;data[i*4+3]=255;}
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.magFilter=THREE.LinearFilter;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.generateMipmaps=true;texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;
}
export function addCourseFinish(root,track,id,light){
 const length=trackLength(id),count=Math.ceil(length/8),geometry=new THREE.BoxGeometry(.15,.018,3.2),material=new THREE.MeshBasicMaterial({color:id==='night'?'#adf6ef':'#f5ead0'}),lines=new THREE.InstancedMesh(geometry,material,count*3),object=new THREE.Object3D();
 let index=0;for(let i=0;i<count;i++)for(const side of [-8.25,0,8.25]){const f=track(i/count*length,side);object.position.copy(f.p).addScaledVector(f.up,.10);object.quaternion.copy(f.quaternion);object.updateMatrix();lines.setMatrixAt(index++,object.matrix);}root.add(lines);
 if(id==='valley'||id==='fair'||id==='sawmill'){
  const samples=Array.from({length:180},(_,i)=>track(i/180*length).p),geo=new THREE.SphereGeometry(1,16,10),colors=id==='sawmill'?['#718e60','#597d62']:['#a0d76b','#6eae68'];
  for(let i=0;i<(light?8:18);i++){const radius=18+i%4*6,f=track(i/18*length,(i%2?1:-1)*(65+radius));if(samples.some(p=>Math.hypot(p.x-f.p.x,p.z-f.p.z)<radius+18))continue;const hill=new THREE.Mesh(geo,toonMaterial(colors[i%2]));hill.position.set(f.p.x,-1,f.p.z);hill.scale.set(radius,10+i%4*5,radius*.9);root.add(hill);}
 }
 // Original trackside banners with racing chevrons, batched by shared geometry.
 const posts=new THREE.InstancedMesh(new THREE.CylinderGeometry(.12,.14,5,6),toonMaterial('#c9dfe5'),16),boards=new THREE.InstancedMesh(new THREE.BoxGeometry(4,1.35,.22),toonMaterial(id==='night'?'#bd72ed':'#54a8a4'),8);let pi=0;
 for(let i=0;i<8;i++){const f=track((i+.5)/8*length,i%2?14:-14);for(const offset of [-1.6,1.6]){object.position.copy(f.p).addScaledVector(f.normal,offset).addScaledVector(f.up,2.5);object.quaternion.copy(f.quaternion);object.scale.set(1,1,1);object.updateMatrix();posts.setMatrixAt(pi++,object.matrix);}object.position.copy(f.p).addScaledVector(f.up,4.5);object.updateMatrix();boards.setMatrixAt(i,object.matrix);}root.add(posts,boards);
}
