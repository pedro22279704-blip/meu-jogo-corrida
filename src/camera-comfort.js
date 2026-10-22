import * as THREE from 'three';
const ray=new THREE.Raycaster();
export function safeCameraPosition(target,desired,obstacles){
 const direction=desired.clone().sub(target),length=direction.length();if(length<.001||!obstacles.length)return desired.clone();
 ray.set(target,direction.normalize());ray.near=.15;ray.far=length;
 for(const object of obstacles)object.updateWorldMatrix(true,true);
 const hit=ray.intersectObjects(obstacles,true)[0];
 return hit?target.clone().addScaledVector(direction,Math.max(.3,hit.distance-.5)):desired.clone();
}
