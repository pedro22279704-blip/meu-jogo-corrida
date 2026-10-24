import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
import {trackLength} from './tracks.js';

// Conservative planar clearance also keeps towers out of both levels of the eight.
export function citySites(track,light=false){
 const length=trackLength('night'),road=Array.from({length:256},(_,i)=>track(i/256*length).p),sites=[];
 for(const distant of [false,true]){
  const count=distant?(light?12:24):(light?24:48),candidates=count/2;
  for(let i=0;i<candidates*2;i++){
   const side=i%2?1:-1,d=((Math.floor(i/2)+.28)/candidates*length+(distant?13:0))%length,offset=side*(distant?80+i%4*17:26+i%3*5),f=track(d,offset),width=distant?16:10+i%3*2,depth=distant?16:10,radius=Math.hypot(width,depth)/2;
   if(road.some(p=>Math.hypot(p.x-f.p.x,p.z-f.p.z)<radius+15))continue;
   if(sites.some(s=>Math.hypot(s.x-f.p.x,s.z-f.p.z)<s.radius+radius+3))continue;
   sites.push({x:f.p.x,z:f.p.z,angle:Math.atan2(f.tangent?.x??0,f.tangent?.z??1),width,depth,radius,height:distant?58+i%5*14:28+i%7*7,distant,index:i});
  }
 }
 return sites;
}

export function addNeonCity(root,track,light){
 const sites=citySites(track,light),windowGeometry=new THREE.PlaneGeometry(1,1.5),windowMaterial=new THREE.MeshBasicMaterial({color:'#ffffff'}),transform=new THREE.Object3D();
 const materials=new Map(),palettes=['#35425e','#536275','#6a5361','#4d536b','#6a625a'];
 function part(parent,geometry,color,x,y,z){let material=materials.get(color);if(!material){material=toonMaterial(color);materials.set(color,material);}const m=new THREE.Mesh(geometry,material);m.position.set(x,y,z);parent.add(m);return m;}
 for(const site of sites){
  const {width:w,depth:d,height:h,index:i}=site,g=new THREE.Group();g.name='Neon city building';g.userData.citySite=site;g.position.set(site.x,0,site.z);g.rotation.y=site.angle;root.add(g);
  part(g,new THREE.BoxGeometry(w+2,.5,d+2),'#59667c',0,.15,0);
  part(g,new THREE.BoxGeometry(w,h,d),palettes[i%palettes.length],0,h/2,0);
  for(const y of [3,h*.5,h])part(g,new THREE.BoxGeometry(w+.35,.4,d+.35),'#8490a1',0,y,0);
  if(i%3===0){for(let level=0;level<3;level++)part(g,new THREE.BoxGeometry(w*(.75-level*.17),5,d*(.75-level*.17)),'#8792a5',0,h+2.5+level*5,0);part(g,new THREE.ConeGeometry(1,14,4),'#b8c9de',0,h+22,0);}
  else if(!site.distant&&i%2===0){for(const x of [-1.4,1.4])for(const z of [-1.4,1.4])part(g,new THREE.BoxGeometry(.18,3,.18),'#303e53',x,h+1.5,z);part(g,new THREE.CylinderGeometry(2,2,3.8,10),'#936c55',0,h+4.8,0);part(g,new THREE.ConeGeometry(2.25,1.2,10),'#536776',0,h+7.3,0);}
  const columns=Math.floor(w/2.3),floors=Math.floor((h-4)/3.1),windows=new THREE.InstancedMesh(windowGeometry,windowMaterial,columns*floors*4);let n=0;
  for(let face=0;face<4;face++)for(let floor=0;floor<floors;floor++)for(let col=0;col<columns;col++){
   if((floor*17+col*7+face*3+i)%5===0)continue;
   const across=(col-(columns-1)/2)*2.3,y=5+floor*3.1,side=face<2?1:-1;
   if(face%2===0){transform.position.set(across,y,side*(d/2+.03));transform.rotation.set(0,side===1?0:Math.PI,0);}else{transform.position.set(side*(w/2+.03),y,across);transform.rotation.set(0,side*Math.PI/2,0);}
   transform.updateMatrix();windows.setMatrixAt(n,transform.matrix);windows.setColorAt(n++,new THREE.Color((floor+col+i)%7===0?'#76e9ef':(floor+i)%3?'#ffe2a1':'#d8c6ff'));
  }
  windows.count=n;g.add(windows);
  if(!site.distant){
   // Fire escape landings and a zigzag stair silhouette on the street-facing facade.
   if(!light&&i%2)for(let floor=1;floor<Math.min(floors,10);floor++){const y=floor*3.1;part(g,new THREE.BoxGeometry(3,.12,1.1),'#24364b',0,y,d/2+.6);const stair=part(g,new THREE.BoxGeometry(.14,3.7,.14),'#a3a6a1',0,y+1.55,d/2+.9);stair.rotation.z=floor%2?.55:-.55;}
   const awning=part(g,new THREE.BoxGeometry(w*.7,.35,1.5),i%2?'#df6d96':'#65c5c9',0,3,d/2+.6);awning.rotation.x=.15;
   for(const x of [-w*.28,w*.28])part(g,new THREE.BoxGeometry(1.6,2,.12),'#e4bd76',x,1.5,d/2+.04);
  }
 }
 return sites;
}
