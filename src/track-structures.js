import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
import {TUNNELS,BRIDGES,trackLength} from './tracks.js';

// Every section follows the same road frame as the karts, including elevation.
export function addTrackStructures(root,track,id,obstacles){
 const length=trackLength(id),night=id==='night';
 const wallColor=night?'#334169':id==='fair'?'#ca936b':'#786a62';
 const accent=night?'#71f2ef':id==='fair'?'#ffe49a':'#e7bd78';
 function part(parent,geometry,color,glow=false){const mesh=new THREE.Mesh(geometry,glow?new THREE.MeshBasicMaterial({color}):toonMaterial(color));parent.add(mesh);return mesh;}
 function frameGroup(d){const f=track(d),g=new THREE.Group();g.position.copy(f.p);g.quaternion.copy(f.quaternion);root.add(g);return g;}
 function shell(start,end){
  const positions=[],indices=[],steps=Math.ceil((end-start)/4),sides=16;
  for(let i=0;i<=steps;i++){const f=track(start+(end-start)*i/steps);
   for(let j=0;j<=sides;j++){const a=j/sides*Math.PI,p=f.p.clone().addScaledVector(f.normal,9.2*Math.cos(a)).addScaledVector(f.up,1.5+8*Math.sin(a));positions.push(p.x,p.y,p.z);}
   if(i<steps)for(let j=0;j<sides;j++){const k=i*(sides+1)+j;indices.push(k,k+1,k+sides+1,k+1,k+sides+2,k+sides+1);}
  }
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals();const roof=part(root,geo,wallColor);roof.name='Tunnel roof';roof.material.side=THREE.DoubleSide;obstacles.push(roof);
  for(let d=start;d<end;d+=4){const span=Math.min(4,end-d),g=frameGroup(d+span/2);
   for(const side of [-1,1]){const wall=part(g,new THREE.BoxGeometry(.5,1.65,span+.15),wallColor);wall.position.set(side*9.2,.75,0);obstacles.push(wall);}
  }
 }
 for(const spec of TUNNELS[id]??[]){
  const start=spec.start*length,end=spec.end*length;shell(start,end);
  for(let d=start;d<=end+1;d+=18){const g=frameGroup(Math.min(d,end)),arch=part(g,new THREE.TorusGeometry(9.2,.18,4,24,Math.PI),accent,night);arch.scale.y=8/9.2;arch.position.y=1.5;
   for(const side of [-1,1]){const lamp=part(g,new THREE.BoxGeometry(.18,.25,6),accent,true);lamp.position.set(side*8.3,3.8,0);}
  }
  for(const d of [start,end]){const g=frameGroup(d),arch=part(g,new THREE.TorusGeometry(9.2,.55,6,24,Math.PI),accent);arch.scale.y=8/9.2;arch.position.y=1.5;
   for(const side of [-1,1]){const pillar=part(g,new THREE.BoxGeometry(1.1,2,1.2),accent);pillar.position.set(side*9.2,1,0);}
  }
 }
 for(const spec of BRIDGES[id]??[])for(let d=spec.start*length;d<spec.end*length;d+=8){const g=frameGroup(d),deck=part(g,new THREE.BoxGeometry(17,.8,8.2),night?'#505c83':'#9a7654');deck.position.y=-.7;
  // Keep the lower lane of the figure-eight clear of bridge supports.
  if(night&&Math.abs(d/length-.25)<.035)continue;
  const height=Math.max(1,track(d).p.y-1);for(const side of [-1,1]){const support=part(g,new THREE.BoxGeometry(1,height,1),wallColor);support.position.set(side*7.8,-height/2-1,0);}
 }
 if(id==='sawmill')for(let i=0;i<22;i++){const d=(.04+i*.0068)*length;for(const side of [-1,1]){const f=track(d,side*(22+i%3*3)),rock=part(root,new THREE.DodecahedronGeometry(7+i%3,0),i%2?'#8e7d66':'#a5967a');rock.position.copy(f.p);rock.scale.y=1.8;}}
}
