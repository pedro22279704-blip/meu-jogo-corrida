import * as THREE from 'three';

export function createTrackSampler(curve,length,profileAt){
 const physicalLength=curve.getLength(),metersPerUnit=physicalLength/length;
 return (distance,offset=0)=>{
  const t=((distance/length)%1+1)%1,profile=profileAt(distance),p=curve.getPointAt(t),tangent=curve.getTangentAt(t).normalize();
  tangent.y=profile.grade/metersPerUnit;tangent.normalize();
  const normal=new THREE.Vector3(tangent.z,0,-tangent.x).normalize().multiplyScalar(Math.cos(profile.bank));normal.y=Math.sin(profile.bank);normal.addScaledVector(tangent,-normal.dot(tangent)).normalize();
  const up=new THREE.Vector3().crossVectors(tangent,normal).normalize();
  const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(normal,up,tangent));
  p.y=profile.height;p.addScaledVector(normal,offset);return {p,tangent,normal,up,quaternion,metersPerUnit};
 };
}
