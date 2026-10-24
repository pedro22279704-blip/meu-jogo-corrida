import * as THREE from 'three';

// Original fictional signs: no film logos, advertising brands or flashing effects.
export function billboardTexture(index){
 if(typeof document==='undefined')return null;
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=768;const ctx=canvas.getContext('2d'),colors=['#ff3bbd','#2de3f1','#ffaf4a','#a78aff'],color=colors[index%4];
 ctx.fillStyle='#07162d';ctx.fillRect(0,0,512,768);ctx.strokeStyle=color;ctx.lineWidth=20;ctx.strokeRect(12,12,488,744);ctx.fillStyle=color;ctx.fillRect(22,30,468,110);ctx.fillStyle='#08182b';ctx.font='900 66px sans-serif';ctx.textAlign='center';ctx.fillText(['NEON','DRIFT','TURBO','NIGHT'][index%4],256,108);
 ctx.strokeStyle=color;ctx.lineWidth=15;ctx.beginPath();ctx.arc(256,350,138,0,Math.PI*2);ctx.stroke();ctx.lineWidth=5;ctx.beginPath();ctx.arc(256,350,112,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#eaffff';ctx.beginPath();ctx.moveTo(285,190);ctx.lineTo(168,365);ctx.lineTo(250,356);ctx.lineTo(218,510);ctx.lineTo(346,323);ctx.lineTo(263,338);ctx.closePath();ctx.fill();
 ctx.fillStyle=color;ctx.font='900 46px sans-serif';ctx.fillText(['ネオン','ドリフト','ターボ','ナイト'][index%4],256,576);ctx.fillStyle='#f7efff';ctx.font='bold 28px sans-serif';ctx.fillText(['MIDNIGHT RUN','SIDEWAYS CLUB','FULL THROTTLE','AFTER DARK'][index%4],256,635);ctx.font='900 36px sans-serif';ctx.fillText('SPEED RACERS',256,697);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}

export function addCityBillboards(building,site,light,textures){
 if(site.distant&&site.index%3)return;
 const i=site.index,color=['#ff3bbd','#2de3f1','#ffaf4a','#a78aff'][i%4],width=site.width*.85,height=Math.min(22,site.height*.48),y=Math.min(site.height-height/2-2,23+ i%3*4);
 const texture=textures[i%4],material=new THREE.MeshBasicMaterial({map:texture,color:texture?'#ffffff':color}),frame=new THREE.MeshBasicMaterial({color});
 for(const face of (light?[0]:[0,1])){
  const group=new THREE.Group();group.rotation.y=face*Math.PI;group.position.y=y;building.add(group);
  const backing=new THREE.Mesh(new THREE.BoxGeometry(width+.7,height+.7,.35),frame);backing.position.z=site.depth/2+.3;group.add(backing);
  const panel=new THREE.Mesh(new THREE.PlaneGeometry(width,height),material);panel.name='Tokyo style illuminated billboard';panel.position.z=site.depth/2+.5;group.add(panel);
 }
 if(!site.distant&&!light){const blade=new THREE.Mesh(new THREE.BoxGeometry(1.3,17,1.3),frame);blade.position.set(site.width/2+.7,19,site.depth/2);building.add(blade);}
}
