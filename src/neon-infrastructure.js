import {ROAD_SCALE} from './road-width.js';
import * as THREE from 'three';
import {trackLength,TUNNELS} from './tracks.js';
import {toonMaterial} from './cartoon.js';
import {citySites} from './neon-city.js';

export function viaductPiers(track,light=false){
 const length=trackLength('night'),samples=Array.from({length:380},(_,i)=>track(i/380*length).p),piers=[];
 for(let d=12;d<length;d+=light?60:36){const f=track(d),feet=[-12.5,12.5].map(side=>track(d,side).p);
  // Footings must clear the lower road and its tunnel, even below the crossing.
  if(feet.some(foot=>samples.some(p=>p.y<f.p.y-8&&Math.hypot(p.x-foot.x,p.z-foot.z)<20)))continue;
  piers.push({distance:d,frame:f,feet,height:Math.max(1,f.p.y-2)});
 }
 return piers;
}

export function addNeonInfrastructure(root,track,light,obstacles){
 const firstChild=root.children.length;
 const length=trackLength('night'),concrete=toonMaterial('#8b9eaf'),dark=toonMaterial('#35495c'),road=new THREE.MeshBasicMaterial({color:'#3c4e60'}),sidewalk=new THREE.MeshBasicMaterial({color:'#6c7c88'}),paint=new THREE.MeshBasicMaterial({color:'#e0d1a1'});
 function mesh(geometry,material){const m=new THREE.Mesh(geometry,material);root.add(m);return m;}
 const sites=citySites(track,light),streetTile=new THREE.BoxGeometry(18,.025,14),cityPaint=new THREE.BoxGeometry(.22,.02,6);
 // Cross streets occupy the gaps between city blocks, never the building footprints.
 const streetExtent=Math.ceil(Math.max(...sites.map(s=>Math.max(Math.abs(s.x),Math.abs(s.z))))/126)*126+126;
 for(let axis=0;axis<2;axis++)for(let across=-streetExtent;across<=streetExtent;across+=126)for(let along=-streetExtent;along<=streetExtent;along+=14){const x=axis?along:across,z=axis?across:along;if(sites.some(s=>Math.abs(x-s.x)<(axis?7:9)+Math.abs(Math.cos(s.angle))*s.width/2+Math.abs(Math.sin(s.angle))*s.depth/2+1&&Math.abs(z-s.z)<(axis?9:7)+Math.abs(Math.sin(s.angle))*s.width/2+Math.abs(Math.cos(s.angle))*s.depth/2+1))continue;
  const tile=mesh(streetTile,road);tile.name='Ground city street';tile.position.set(x,.005,z);tile.rotation.y=axis*Math.PI/2;
  for(const offset of [-.7,.7]){const line=mesh(cityPaint,paint);line.position.set(x+(axis?0:offset),.035,z+(axis?offset:0));line.rotation.y=axis*Math.PI/2;}
 }
 function ribbon(offset,width,y,material){const positions=[],indices=[],steps=500;for(let i=0;i<=steps;i++)for(const side of [-1,1]){const p=track(i/steps*length,offset+side*width/2).p;positions.push(p.x,y,p.z);if(side===1&&i<steps){const k=i*2;indices.push(k,k+2,k+1,k+1,k+2,k+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,material);}
 // Real streets at ground level make the space under the elevated circuit legible.
 ribbon(0,36,.03,road);for(const side of [-1,1])ribbon(side*21,6,.045,sidewalk);
 const stripeGeometry=new THREE.BoxGeometry(.2,.025,4),crossGeometry=new THREE.BoxGeometry(2.5,.025,.7);
 for(let d=0;d<length;d+=11){const f=track(d),yaw=Math.atan2(f.tangent.x,f.tangent.z);for(const offset of [-5,5]){const p=track(d,offset).p,m=mesh(stripeGeometry,paint);m.position.set(p.x,.08,p.z);m.rotation.y=yaw;}}
 for(let d=32;d<length;d+=190){const f=track(d);for(let offset=-15;offset<=15;offset+=3.3){const p=track(d,offset).p,m=mesh(crossGeometry,paint);m.position.set(p.x,.09,p.z);m.rotation.y=Math.atan2(f.tangent.x,f.tangent.z);}}
 // Continuous slab: road surface, deep side fascia and visible underside.
 const positions=[],indices=[],steps=Math.ceil(length/5);
 for(let i=0;i<=steps;i++){const f=track(i/steps*length);for(const [offset,drop] of [[-12.25,.15],[12.25,.15],[-12.25,1.35],[12.25,1.35]]){const p=f.p.clone().addScaledVector(f.normal,offset*ROAD_SCALE).addScaledVector(f.up,-drop);positions.push(...p.toArray());}
  if(i<steps){const a=i*4,b=a+4;indices.push(a,b,a+1,a+1,b,b+1,a+2,a+3,b+2,a+3,b+3,b+2,a,a+2,b,a+2,b+2,b,a+1,b+1,a+3,a+3,b+1,b+3);}}
 const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const deck=mesh(geo,concrete);deck.name='Continuous viaduct deck';deck.material.side=THREE.DoubleSide;obstacles.push(deck);
 const beamGeometry=new THREE.BoxGeometry(.65,1,5.3);
 for(let d=0;d<length;d+=5){const f=track(d);for(const side of [-1,1]){const beam=mesh(beamGeometry,dark);beam.position.copy(f.p).addScaledVector(f.normal,side*10.5*ROAD_SCALE).addScaledVector(f.up,-1.55);beam.quaternion.copy(f.quaternion);}}
 const headGeo=new THREE.BoxGeometry(28*ROAD_SCALE,1.4,3.6),shaftGeo=new THREE.CylinderGeometry(1.05,1.4,1,8),baseGeo=new THREE.BoxGeometry(4.8,.7,4.2),bearingGeo=new THREE.BoxGeometry(2.5,.45,3);
 for(const {frame:f,feet,height} of viaductPiers(track,light)){
  const head=mesh(headGeo,concrete);head.name='Viaduct crosshead';head.position.copy(f.p).addScaledVector(f.up,-2);head.quaternion.copy(f.quaternion);
  for(const foot of feet){
   const shaft=mesh(shaftGeo,concrete);shaft.scale.y=height;shaft.name='Grounded viaduct column';shaft.position.set(foot.x,height/2,foot.z);
   const base=mesh(baseGeo,concrete);base.position.set(foot.x,.35,foot.z);
   const bearing=mesh(bearingGeo,dark);bearing.position.set(foot.x,height-.1,foot.z);
  }
 }
 // Lamps stay outside the driving lane and do not intrude into tunnel roofs.
 const glow=new THREE.MeshBasicMaterial({color:'#a4f7ff'}),poleGeometry=new THREE.CylinderGeometry(.1,.16,5,6),lampGeometry=new THREE.BoxGeometry(1.8,.18,.6);
 for(let d=15;d<length;d+=light?72:36){if(TUNNELS.night.some(t=>d>t.start*length-12&&d<t.end*length+12))continue;for(const side of [-1,1]){const f=track(d,side*11.7),pole=mesh(poleGeometry,dark);pole.position.copy(f.p).add(new THREE.Vector3(0,2.5,0));const lamp=mesh(lampGeometry,glow);lamp.position.copy(f.p).add(new THREE.Vector3(0,5,0));}}
 // Batch the repeated beams, lane markings and lamps into a handful of draw calls.
 const batches=new Map();for(const object of root.children.slice(firstChild)){if(!object.isMesh||object===deck)continue;const key=object.geometry.uuid+object.material.uuid;if(!batches.has(key))batches.set(key,[]);batches.get(key).push(object);}
 for(const objects of batches.values()){if(objects.length<4)continue;const batch=new THREE.InstancedMesh(objects[0].geometry,objects[0].material,objects.length);batch.name=objects[0].name;objects.forEach((object,i)=>{object.updateMatrix();batch.setMatrixAt(i,object.matrix);root.remove(object);});root.add(batch);}
}
