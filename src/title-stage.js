import * as THREE from 'three';

// The opening uses the actual cars, with its own short-lived renderer.
export class TitleStage{
 constructor(canvas){
  this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.toneMapping=THREE.NeutralToneMapping;this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight('#ffffff','#647bad',2.4));const sun=new THREE.DirectionalLight('#fff1c6',3);sun.position.set(-4,8,7);this.scene.add(sun);
  this.camera=new THREE.PerspectiveCamera(36,1,.1,80);this.cars=[];this.time=0;
 }
 update(dt,sources,reduced){
  const canvas=this.renderer.domElement,w=Math.max(1,canvas.clientWidth),h=Math.max(1,canvas.clientHeight);
  if(w!==this.w||h!==this.h){this.w=w;this.h=h;this.renderer.setSize(w,h,false);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();}
  this.time+=reduced?0:dt;
  sources.forEach((source,i)=>{if(!source)return;let slot=this.cars[i];if(slot?.source!==source){if(slot)this.scene.remove(slot.group);const group=new THREE.Group(),model=source.clone(true);group.add(model);this.scene.add(group);slot=this.cars[i]={source,group};}
   const g=slot.group;g.scale.setScalar(i===1?1.8:1.6);g.position.set((i-1)*4.6,i===1?.15:0,i===1?1.5:-.6);g.position.y+=Math.sin(this.time*2+i)*.08;g.rotation.set(.03,[-.48,.35,.58][i]+Math.sin(this.time*.7+i)*.04,[-.08,.05,.08][i]);
  });
  const distance=Math.max(12,29/this.camera.aspect);this.camera.position.set(0,6,distance);this.camera.lookAt(0,1.6,0);this.renderer.render(this.scene,this.camera);
 }
 dispose(){this.scene.clear();this.renderer.dispose();}
}
