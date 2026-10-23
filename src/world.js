import * as THREE from 'three';
import {addTrackStructures} from './track-structures.js';
import {addTrackDetails} from './track-details.js';
import {toonMaterial,cartoonize} from './cartoon.js';
import {SHORTCUTS} from './shortcuts.js';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {surfaceProfile} from './surface.js';
import {createCircuitCurve,TRACKS,trackLength,TUNNELS} from './tracks.js';
export function createWorld(scene,id,{quality='pretty'}={}){
 const root=new THREE.Group();scene.add(root);let alive=true;
 const TRACK_LENGTH=trackLength(id),rebuilt=!!TRACKS[id]?.revision;
 const harbor=id==='harbor',light=quality==='light',theme=TRACKS[id],windmills=[],loader=new GLTFLoader(),obstacles=[],ambient=[];
 scene.background=new THREE.Color(theme.sky);scene.fog=new THREE.Fog(theme.sky,120,340);
 for(const light of scene.children){if(light.isHemisphereLight)light.intensity=id==='night'?1.2:1.7;if(light.isDirectionalLight){light.intensity=id==='night'?1.1:2.2;light.color.set(id==='night'?'#a9b9ff':'#ffe9ca');}}
 const mat=toonMaterial;
 function mesh(geometry,color,parent=root){const object=new THREE.Mesh(geometry,mat(color));parent.add(object);return object;}
 const ground=mesh(new THREE.PlaneGeometry(2000,2000),theme.ground);ground.rotation.x=-Math.PI/2;ground.position.y=-.15;
 const curve=createCircuitCurve(id),physicalLength=curve.getLength();
 const shortcut=SHORTCUTS[id];
function track(distance,offset=0){
 const t=((distance/TRACK_LENGTH)%1+1)%1,profile=surfaceProfile(distance,id);
 const p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();
 tangent.y=profile.grade*TRACK_LENGTH/physicalLength;tangent.normalize();
 const normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize().multiplyScalar(Math.cos(profile.bank));normal.y=Math.sin(profile.bank);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();
 const up=new THREE.Vector3().crossVectors(tangent,normal).normalize();
 const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,up,tangent));
 p.y=profile.height;p.addScaledVector(normal,offset);
 return {p,tangent,normal,up,quaternion};
}
function shortcutFrame(distance,offset=0){
 const u=Math.max(0,Math.min(1,(((distance%TRACK_LENGTH)+TRACK_LENGTH)%TRACK_LENGTH-shortcut.start)/(shortcut.end-shortcut.start)));
 const a=track(shortcut.start,offset),b=track(shortcut.end,offset),p=a.p.clone().lerp(b.p,u);
 p.y+=1.7*Math.sin(Math.PI*u)**2;const tangent=b.p.clone().sub(a.p);tangent.y+=1.7*Math.PI*Math.sin(2*Math.PI*u);tangent.normalize();const normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize(),up=new THREE.Vector3().crossVectors(tangent,normal).normalize();
 return {p,tangent,normal,up,quaternion:new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,up,tangent))};
}
const roadSteps=rebuilt?Math.ceil(physicalLength/2.5):500;
function ribbon(width,color,y){const positions=[],indices=[];for(let i=0;i<=roadSteps;i++){for(const side of [-1,1]){const {p}=track(i/roadSteps*TRACK_LENGTH,side*width/2);positions.push(p.x,p.y+y,p.z);}if(i<roadSteps&&!(width>=100&&i/roadSteps*TRACK_LENGTH>=shortcut.start&&i/roadSteps*TRACK_LENGTH<=shortcut.end)){const j=i*2;indices.push(j,j+2,j+1,j+1,j+2,j+3);}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setIndex(indices);g.computeVertexNormals();return mesh(g,color);}
ribbon(rebuilt?21:harbor?23:100,harbor?'#e0bb86':id==='night'?'#303950':'#89c57a',-.25);ribbon(16,id==='night'?'#6a71ab':'#ebd7ac',.01);ribbon(12,id==='night'?'#39425d':'#597886',.03);
const curbCount=rebuilt?Math.ceil(physicalLength/4):130;
for(let i=0;i<curbCount;i++){for(const side of [-1,1]){if(side===1&&i/curbCount*TRACK_LENGTH>=shortcut.start&&i/curbCount*TRACK_LENGTH<=shortcut.end)continue;const {p,tangent}=track(i/curbCount*TRACK_LENGTH,side*6.5);const curb=mesh(new THREE.BoxGeometry(.65,.16,physicalLength/curbCount*.8),i%2?'#f4edcf':'#ef806b');curb.position.copy(p);curb.position.y+=.1;curb.rotation.y=Math.atan2(tangent.x,tangent.z);}}
// Barreiras contínuas acompanham o limite de colisão dos karts.
const railCount=rebuilt?Math.ceil(physicalLength/4):200;
const rails=new THREE.InstancedMesh(new THREE.BoxGeometry(.3,.65,physicalLength/railCount+.12),mat('#ffffff'),railCount*2);
const railTransform=new THREE.Object3D();let railIndex=0;
for(let i=0;i<railCount;i++)for(const side of [-1,1]){if(side===1&&i/railCount*TRACK_LENGTH>=shortcut.start&&i/railCount*TRACK_LENGTH<=shortcut.end)continue;const {p,tangent}=track(i/railCount*TRACK_LENGTH,side*7.65);railTransform.position.copy(p);railTransform.position.y+=.55;railTransform.rotation.y=Math.atan2(tangent.x,tangent.z);railTransform.updateMatrix();rails.setMatrixAt(railIndex,railTransform.matrix);rails.setColorAt(railIndex++,new THREE.Color(i%4?'#375e68':'#a9fb59'));}rails.count=railIndex;root.add(rails);
// Marcos do vale: cristais e pequenos moinhos, criados para esta pista.

for(let i=0;i<(id==='valley'?18:0);i++){
 const {p}=track(i/18*TRACK_LENGTH,(i%2?1:-1)*(24+i%4*5));
 const crystal=mesh(new THREE.OctahedronGeometry(1.4+i%3),'#77d7d3');crystal.position.copy(p);crystal.position.y+=2;crystal.scale.y=2;
 if(i%3===0){const base=p.clone().add(new THREE.Vector3(6,0,4));const tower=mesh(new THREE.CylinderGeometry(.5,1.2,9,6),'#e8d3a6');tower.position.copy(base);tower.position.y+=4.5;const rotor=new THREE.Group();rotor.position.copy(base);rotor.position.y+=8;root.add(rotor);for(let j=0;j<3;j++){const arm=new THREE.Group();arm.rotation.z=j*Math.PI*2/3;rotor.add(arm);const blade=mesh(new THREE.BoxGeometry(.7,4,.18),'#f5b86d',arm);blade.position.y=2;}windmills.push(rotor);}
}
for(let i=0;i<12;i++){for(let j=0;j<2;j++){const {p,tangent}=track(j*1.5,i-5.5);const tile=mesh(new THREE.BoxGeometry(1,.045,physicalLength/TRACK_LENGTH*1.5),(i+j)%2?'#172b37':'#ffffff');tile.position.copy(p);tile.position.y+=.075;tile.rotation.y=Math.atan2(tangent.x,tangent.z);}}
const start=track(0);for(const side of [-1,1]){const pillar=mesh(new THREE.CylinderGeometry(.25,.25,7), '#ffe5a3');pillar.position.copy(start.p).addScaledVector(start.normal,side*8);pillar.position.y+=3.5;}
const banner=mesh(new THREE.BoxGeometry(16,1.1,.5),'#a9fb59');banner.position.copy(start.p);banner.position.y+=7;banner.rotation.y=Math.atan2(start.tangent.x,start.tangent.z);
// Árvores e cristais usam posições determinísticas para manter o vale original.
const treeCount=harbor||id==='night'?0:light?24:id==='fair'?28:80;
for(let i=0;i<treeCount;i++){const d=i/treeCount*TRACK_LENGTH;const side=i%2?1:-1;const {p}=track(d,side*(24+(i*17%31)));const tree=new THREE.Group();root.add(tree);tree.position.copy(p);const trunk=mesh(new THREE.CylinderGeometry(.35,.5,3,6),'#76634b',tree);trunk.position.y=1.5;const crown=mesh(new THREE.ConeGeometry(2.4+(i%3)*.4,7,6),i%3?'#366c62':'#4b8571',tree);crown.position.y=5;}
function loadProp(name,placements){loader.load(`${import.meta.env.BASE_URL}models/prop-${name}.glb`,gltf=>{if(!alive)return;cartoonize(gltf.scene);placements.forEach(({distance,offset=0,scale=1})=>{
 const frame=track(distance,offset),object=gltf.scene.clone(true);object.position.copy(frame.p);object.quaternion.copy(frame.quaternion);object.scale.setScalar(scale);root.add(object);if(name==='portal'||name==='tunnel')obstacles.push(object);if(name==='grandstand'){let count=0;object.traverse(part=>{if(/^Spectator/.test(part.name)&&count++<(light?6:21)){const base=part.position.clone(),phase=count;ambient.push(t=>{part.position.y=base.y+Math.max(0,Math.sin(t*4+phase))*.16;});}});}
});},undefined,error=>console.warn('Objeto decorativo indisponível.',error));}
if(!harbor&&id!=='night')loadProp('tree',Array.from({length:light?16:32},(_,i)=>({distance:i/32*TRACK_LENGTH,offset:(i%2?1:-1)*(26+i%4*3),scale:.8+i%3*.15})));
loadProp('portal',[{distance:0}]);root.remove(banner);banner.geometry.dispose();banner.material.dispose();
loadProp('sign',[80,210,400,600].map(distance=>({distance:rebuilt?distance/760*TRACK_LENGTH:distance,offset:rebuilt?15:10})).filter(({distance})=>!rebuilt||!TUNNELS[id].some(t=>distance>t.start*TRACK_LENGTH-20&&distance<t.end*TRACK_LENGTH+20)));
loadProp('grandstand',[{distance:35,offset:17},{distance:65,offset:-17}]);
if(!harbor&&!rebuilt)loadProp('bridge',[{distance:TRACK_LENGTH*.25}]);
if(!harbor&&!rebuilt)loadProp('tunnel',[{distance:TRACK_LENGTH*.63}]);

 if(harbor){
  const sun=mesh(new THREE.SphereGeometry(16,20,12),'#ffe0a1');sun.position.set(-160,32,-200);
  for(let i=0;i<20;i++){
   const f=track(i/20*TRACK_LENGTH,(i%2?1:-1)*(19+i%3*7));
   const dock=new THREE.Group();dock.position.copy(f.p);dock.quaternion.copy(f.quaternion);root.add(dock);obstacles.push(dock);
   const platform=mesh(new THREE.BoxGeometry(10,.5,6),'#a88462',dock);platform.position.y=-.4;for(const x of [-4,4]){const piling=mesh(new THREE.CylinderGeometry(.3,.35,f.p.y+1,8),'#685a46',dock);piling.position.set(x,-(f.p.y+1)/2,0);}
   const box=mesh(new THREE.BoxGeometry(7,3.5,3),['#d46d55','#537e91','#d2a65b'][i%3],dock);box.position.y=1.75;
   for(let j=0;j<5;j++){const rib=mesh(new THREE.BoxGeometry(.12,3.6,3.05),'#c4b7a0',dock);rib.position.set(-3+j*1.5,1.75,0);}
   if(i%5===0){const mast=mesh(new THREE.BoxGeometry(.6,15,.6),'#e1b66b',dock);mast.position.y=7.5;const arm=mesh(new THREE.BoxGeometry(13,.5,.5),'#e1b66b',dock);arm.position.set(4,15,0);const cable=mesh(new THREE.BoxGeometry(.08,9,.08),'#344857',dock);cable.position.set(9,10.5,0);}
  }
  for(let i=0;i<7;i++){const boat=mesh(new THREE.ConeGeometry(3,10,4),'#e6c4a1');const f=track(i/7*TRACK_LENGTH, i%2?42:-42);boat.position.copy(f.p);boat.position.y=.5;boat.rotation.x=Math.PI/2;boat.rotation.z=i;ambient.push(t=>{boat.position.y=.5+Math.sin(t*1.2+i)*.18;boat.rotation.z=i+Math.sin(t*.7+i)*.04;});}
 }
 const cloudGeometry=new THREE.SphereGeometry(1,10,6),cloudMaterial=new THREE.MeshBasicMaterial({color:harbor?'#ffe1ba':'#f7ffff',fog:true});
 for(let i=0;i<(light?6:12);i++){const a=i/12*Math.PI*2,cloud=new THREE.Group();cloud.position.set(Math.cos(a)*240,45+i%3*9,Math.sin(a)*240);root.add(cloud);for(let j=0;j<3;j++){const puff=new THREE.Mesh(cloudGeometry,cloudMaterial);puff.position.x=(j-1)*8;puff.scale.set(12-j%2*2,5+j%2*3,6);cloud.add(puff);}}
 // Bandeiras leves junto aos trechos de público.
 for(let i=0;i<(light?3:8);i++){const f=track(30+i*85,i%2?11:-11),pole=mesh(new THREE.CylinderGeometry(.06,.06,4,6),'#e7dbb2');pole.position.copy(f.p).addScaledVector(f.up,2);const flag=mesh(new THREE.PlaneGeometry(2.5,1.2,8,2),i%2?'#ed987d':'#b4ff62');flag.material.side=THREE.DoubleSide;flag.position.copy(f.p).addScaledVector(f.up,3.4);flag.position.x+=1.25;const positions=flag.geometry.attributes.position;ambient.push(t=>{for(let j=0;j<positions.count;j++)positions.setZ(j,Math.sin(t*3+positions.getX(j)*2)*.16*(positions.getX(j)+1.25)/2.5);positions.needsUpdate=true;});}
 // Faixa estreita de terra: entrada e saída coincidem com a pista principal.
 const routePositions=[],routeIndices=[];
 for(let i=0;i<=40;i++){const d=shortcut.start+(shortcut.end-shortcut.start)*i/40;for(const offset of [1.7,4.3]){const p=shortcutFrame(d,offset).p;routePositions.push(p.x,p.y+.065,p.z);}if(i<40){const j=i*2;routeIndices.push(j,j+2,j+1,j+1,j+2,j+3);}}
 const routeGeo=new THREE.BufferGeometry();routeGeo.setAttribute('position',new THREE.Float32BufferAttribute(routePositions,3));routeGeo.setIndex(routeIndices);routeGeo.computeVertexNormals();const routeMesh=mesh(routeGeo,'#d4ad69');routeMesh.material.side=THREE.DoubleSide;
 for(const d of [shortcut.start-7,shortcut.end])for(const offset of [1.4,4.6]){const f=track(d,offset),gate=mesh(new THREE.ConeGeometry(.7,2,4),'#db9bff');gate.position.copy(f.p).addScaledVector(f.up,1);}
 if(rebuilt)addTrackStructures(root,track,id,obstacles);
 const updateDetails=addTrackDetails(root,track,id,light);
 return {root,track,shortcutFrame,curve,windmills,obstacles,update(time,reduced){const t=reduced?0:time;for(const rotor of windmills)rotor.rotation.z=t*.7;for(const animate of ambient)animate(t);updateDetails(t);},profile:distance=>surfaceProfile(distance,id),dispose(){alive=false;root.removeFromParent();const geometries=new Set(),materials=new Set(),textures=new Set();root.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if(m.map)textures.add(m.map);}});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());}};
}
