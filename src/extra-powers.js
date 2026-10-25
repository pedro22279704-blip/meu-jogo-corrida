import * as THREE from 'three';
import {toonMaterial} from './cartoon.js';
export function createPeelModel(){const g=new THREE.Group(),gold=toonMaterial('#ffce4c'),inside=toonMaterial('#fff1ac');for(let i=0;i<3;i++){const leaf=new THREE.Mesh(new THREE.ConeGeometry(.3,1.3,5),i%2?inside:gold);leaf.rotation.z=.95;const arm=new THREE.Group();arm.rotation.y=i*Math.PI*2/3;leaf.position.set(.4,.3,0);arm.add(leaf);g.add(arm);}const stem=new THREE.Mesh(new THREE.CylinderGeometry(.13,.22,.7,6),gold);stem.position.y=.5;g.add(stem);return g;}
