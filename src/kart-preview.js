import * as THREE from 'three';

export class KartPreview{
 constructor(canvas){
  this.renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.toneMapping=THREE.NeutralToneMapping;this.renderer.outputColorSpace=THREE.SRGBColorSpace;
  this.scene=new THREE.Scene();this.scene.add(new THREE.HemisphereLight(0xf1fcff,0x61747a,1.7));const sun=new THREE.DirectionalLight(0xffe9ca,2.2);sun.position.set(3,6,4);this.scene.add(sun);
  this.turntable=new THREE.Group();this.scene.add(this.turntable);this.camera=new THREE.PerspectiveCamera(38,1,.1,40);this.rotating=true;this.angle=.4;
 }
 setModel(source,{driverVisible=true}={}){
  this.turntable.clear();if(!source)return;
  const model=source.clone(true);model.traverse(part=>{const original=source.getObjectByName(part.name);if(original?.userData.rest?.isQuaternion)part.quaternion.copy(original.userData.rest);});
  if(!driverVisible)model.traverse(part=>{if(/^(Driver|Arm_[LR])([._]?\d+)?$/.test(part.name))part.visible=false;});
  const bounds=new THREE.Box3().setFromObject(model),center=bounds.getCenter(new THREE.Vector3());model.position.sub(center);this.turntable.add(model);this.radius=bounds.getSize(new THREE.Vector3()).length()/2;this.angle=.4;
 }
 update(dt,reduced){
  const canvas=this.renderer.domElement,width=Math.max(1,canvas.clientWidth),height=Math.max(1,canvas.clientHeight);
  if(this.width!==width||this.height!==height){this.width=width;this.height=height;this.renderer.setSize(width,height,false);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();}
  if(this.rotating&&!reduced)this.angle+=dt*.28;
  this.turntable.rotation.y=reduced?.4:this.angle;
  const distance=(this.radius??2)/Math.sin(THREE.MathUtils.degToRad(19))*1.12*Math.max(1,1/this.camera.aspect);this.camera.position.set(0,distance*.3,distance);this.camera.lookAt(0,0,0);this.renderer.render(this.scene,this.camera);
 }
}
