import * as THREE from 'three';
export const POWER_ART={shield:{column:0,row:0,color:'#6be4ff'},gum:{column:1,row:0,color:'#ff85d8'},pulse:{column:0,row:1,color:'#b7a0ff'},capsule:{column:1,row:1,color:'#ffdb78'}};
export const ATLAS_URL=`${import.meta.env?.BASE_URL??'/'}sprites/powers-atlas.png`;
export function powerTexture(atlas,type){const cell=POWER_ART[type]??POWER_ART.capsule,texture=atlas.clone();texture.repeat.set(.5,.5);texture.offset.set(cell.column*.5,(1-cell.row)*.5);texture.colorSpace=THREE.SRGBColorSpace;texture.needsUpdate=true;return texture;}
export function setPowerIcon(element,type){const cell=POWER_ART[type]??POWER_ART.capsule;element.style.backgroundPosition=`${cell.column?100:0}% ${cell.row?100:0}%`;element.style.setProperty('--power-color',cell.color);}
