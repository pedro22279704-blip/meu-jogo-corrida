import * as THREE from 'three';

// Samples the same surface used to draw the road, including bank and shortcuts.
// Only the displayed pose changes; steering, race progress and drift stay untouched.
export function kartGroundPose(frameAt,distance,offset,yaw=0){
 const frame=frameAt(distance,offset),scale=frame.metersPerUnit??1,c=Math.cos(yaw),s=Math.sin(yaw);
 const sample=(x,z)=>frameAt(distance+(z*c-x*s)/scale,offset+x*c+z*s).p;
 const fl=sample(-.8,1.05),fr=sample(.8,1.05),bl=sample(-.8,-1.05),br=sample(.8,-1.05);
 const across=fr.clone().add(br).sub(fl).sub(bl),along=fl.clone().add(fr).sub(bl).sub(br);
 const up=new THREE.Vector3().crossVectors(along,across).normalize();if(up.y<0)up.negate();
 // At a very tight inner curb the four samples can fold over each other.
 // Keep the surface normal in that case instead of tipping the kart sideways.
 if(up.lengthSq()<.5||up.dot(frame.up)<.9)up.copy(frame.up);
 const forward=frame.tangent.clone().multiplyScalar(c).addScaledVector(frame.normal,s);forward.addScaledVector(up,-forward.dot(up)).normalize();
 const right=new THREE.Vector3().crossVectors(up,forward).normalize();
 const quaternion=new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(right,up,forward));
 const position=frame.p.clone();position.y=(fl.y+fr.y+bl.y+br.y)/4+.045;
 return {position,quaternion,up,frame};
}
