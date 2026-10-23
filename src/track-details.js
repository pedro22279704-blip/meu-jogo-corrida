import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';

// Decoração fora do asfalto; as animações usam o relógio da corrida.
export function addTrackDetails(root,track,id,light){
 const animate=[],count=light?6:12;
 function part(parent,geometry,color,pos=[0,0,0],glow=false){const m=new THREE.Mesh(geometry,glow?new THREE.MeshBasicMaterial({color}):toonMaterial(color));m.position.set(...pos);parent.add(m);return m;}
 const box=(p,size,color,pos)=>part(p,new THREE.BoxGeometry(...size),color,pos);
 function place(d,side){const f=track(d,side),g=new THREE.Group();g.position.copy(f.p);g.quaternion.copy(f.quaternion);root.add(g);return g;}
 function sign(parent,text,color,pos){
  let map;if(typeof document!=='undefined'){const c=document.createElement('canvas');c.width=512;c.height=160;const ctx=c.getContext('2d');ctx.fillStyle='#162841';ctx.fillRect(0,0,512,160);ctx.strokeStyle=color;ctx.lineWidth=10;ctx.strokeRect(5,5,502,150);ctx.fillStyle=color;ctx.font='bold 48px sans-serif';ctx.textAlign='center';ctx.fillText(text,256,98,480);map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;}
  const m=new THREE.Mesh(new THREE.PlaneGeometry(5.8,1.8),new THREE.MeshBasicMaterial({map:map??null,color:map?'#ffffff':color}));m.position.set(...pos);parent.add(m);const back=m.clone();back.rotation.y=Math.PI;back.position.z-=.02;parent.add(back);return m;
 }
 if(id==='fair')for(let i=0;i<count;i++){
  const g=place(20+i*60,i%2?15:-15),color=['#e88279','#76cdb8','#eac85f'][i%3];
  box(g,[4.8,1.5,2.4],'#a66e47',[0,.75,0]);for(const x of [-2,2])box(g,[.12,3,.12],'#fff0ca',[x,2,0]);
  for(let j=0;j<6;j++)box(g,[.8,.22,3.2],j%2?'#fff0ca':color,[-2+j*.8,3.5,0]);
  for(let j=0;j<6;j++)part(g,new THREE.SphereGeometry(.24,8,6),j%2?'#edb744':'#ef805d',[-1.8+j*.7,1.75,.6]);
  sign(g,['FEIRA DO VALE','FRUTAS','PASTEL'][i%3],color,[0,4.7,0]);
  const hand=part(g,new THREE.SphereGeometry(.22,8,6),'#ffe1a4',[2.8,2.8,0]);box(g,[.55,1,.4],color,[2.8,1.8,0]);animate.push(t=>hand.position.y=2.8+Math.sin(t*3+i)*.12);
  for(let j=0;j<4;j++){const flag=part(g,new THREE.ConeGeometry(.22,.5,3),j%2?color:'#fff0ca',[-2+j*1.3,4.2,.3]);flag.rotation.z=Math.PI;animate.push(t=>flag.rotation.x=Math.sin(t*2+i+j)*.15);}
 }
 if(id==='sawmill')for(let i=0;i<count;i++){
  const g=place(20+i*60,i%2?17:-17);
  for(let row=0;row<3;row++)for(let j=0;j<3-row;j++){
   const x=(j-(2-row)/2)*1.35,y=.65+row*1.15;
   const log=part(g,new THREE.CylinderGeometry(.63,.63,5.5,12),'#956144',[x,y,0]);log.rotation.x=Math.PI/2;
   const end=part(g,new THREE.CircleGeometry(.59,16),'#e5b47a',[x,y,2.76]);
   for(const r of [.22,.43]){const ring=part(g,new THREE.TorusGeometry(r,.022,4,16),'#b78252',[x,y,2.78]);ring.rotation.z=.1;}
  }
  if(i%3===0){box(g,[6,3.5,4],'#b47648',[0,1.75,-6]);const roof=part(g,new THREE.ConeGeometry(4.7,2,4),'#507d79',[0,4,-6]);roof.rotation.y=Math.PI/4;sign(g,'SERRARIA','#ffe1a4',[0,3,-3.9]);
   const wheel=part(g,new THREE.TorusGeometry(1.2,.18,6,18),'#c48e51',[4,1.6,-5]);for(let j=0;j<6;j++){const paddle=box(wheel,[.25,2.4,.3],'#a86f42',[0,0,0]);paddle.rotation.z=j*Math.PI/3;}animate.push(t=>wheel.rotation.z=-t*.6);}
 }
 if(id==='night')for(let i=0;i<count+4;i++){
  const g=place(15+i*45,i%2?17:-17),color=['#68e2ec','#f888cf','#c4a1ff'][i%3],h=5+i%4*2;
  box(g,[6,h,4],'#354263',[0,h/2,0]);
  for(let floor=0;floor<3;floor++)for(let j=0;j<3;j++)part(g,new THREE.BoxGeometry(.7,.7,.06),color,[-1.8+j*1.8,1.4+floor*1.3,2.04],true);
  const s=sign(g,['VALE NEON','TURBO CLUB','BOA CORRIDA','KARTS'][i%4],color,[0,h+1,0]);animate.push(t=>s.material.color.setScalar(.86+.14*Math.sin(t*.7+i)));
  for(const x of [-2.9,2.9])part(g,new THREE.BoxGeometry(.07,h,.07),color,[x,h/2,2.06],true);
 }
 return time=>{for(const update of animate)update(time);};
}
