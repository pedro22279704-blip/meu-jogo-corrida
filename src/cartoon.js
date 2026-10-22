import * as THREE from 'three';
// Uma textura minúscula compartilhada define quatro faixas de iluminação.
const gradient=new THREE.DataTexture(new Uint8Array([70,140,205,255]),4,1,THREE.RedFormat);
gradient.minFilter=gradient.magFilter=THREE.NearestFilter;gradient.generateMipmaps=false;gradient.needsUpdate=true;
export function toonMaterial(color){return new THREE.MeshToonMaterial({color,gradientMap:gradient});}
const outlineMaterial=new THREE.MeshBasicMaterial({color:'#1c3042',side:THREE.BackSide});
outlineMaterial.onBeforeCompile=shader=>{shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed += normal * 0.025;');};
outlineMaterial.customProgramCacheKey=()=> 'vale-cartoon-outline-v1';
export function cartoonize(root,{outlines=false}={}){
 const cache=new Map(),parts=[];root.traverse(part=>{if(part.isMesh&&!part.userData.cartoonOutline)parts.push(part);});
 for(const part of parts){
  const convert=original=>{if(!original||original.isMeshToonMaterial)return original;if(cache.has(original))return cache.get(original);const material=toonMaterial(original.color??'#ffffff');material.name=original.name;material.map=original.map??null;material.transparent=original.transparent;material.opacity=original.opacity;material.side=original.side;cache.set(original,material);return material;};
  part.material=Array.isArray(part.material)?part.material.map(convert):convert(part.material);
  // Somente as grandes silhuetas: evita duplicar todas as rodas e acessórios.
  if(outlines&&/^(Body|Helmet|Nose|Front.?shield|Seat)/i.test(part.name)&&!part.children.some(c=>c.userData.cartoonOutline)){
   const outline=new THREE.Mesh(part.geometry,outlineMaterial);outline.name='CartoonContour';outline.userData.cartoonOutline=true;outline.raycast=()=>{};part.add(outline);
  }
 }
 return root;
}
export function contactShadow(){
 const size=64,data=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const i=(y*size+x)*4,r=Math.hypot((x-size/2)/(size/2),(y-size/2)/(size/2));data[i]=19;data[i+1]=40;data[i+2]=47;data[i+3]=Math.round(Math.max(0,1-r)**1.5*95);}
 const texture=new THREE.DataTexture(data,size,size,THREE.RGBAFormat);texture.needsUpdate=true;
 return new THREE.Mesh(new THREE.PlaneGeometry(2.6,3),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
}
