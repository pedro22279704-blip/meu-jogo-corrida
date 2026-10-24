import * as THREE from 'three';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';

// Compact directional FXAA: fixed taps avoid driver-dependent gradient loops.
const edgeShader={uniforms:{tDiffuse:{value:null},resolution:{value:new THREE.Vector2(1,1)}},vertexShader:`varying vec2 uvScene;void main(){uvScene=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`
 uniform sampler2D tDiffuse;uniform vec2 resolution;varying vec2 uvScene;
 vec3 pixel(vec2 p){return texture2D(tDiffuse,p).rgb;}
 float edgeBrightness(vec3 c){return dot(c,vec3(0.299,0.587,0.114));}
 void main(){
  vec3 center=pixel(uvScene);float c=edgeBrightness(center);
  float nw=edgeBrightness(pixel(uvScene+resolution*vec2(-1.0,-1.0))),ne=edgeBrightness(pixel(uvScene+resolution*vec2(1.0,-1.0))),sw=edgeBrightness(pixel(uvScene+resolution*vec2(-1.0,1.0))),se=edgeBrightness(pixel(uvScene+resolution));
  float lo=min(c,min(min(nw,ne),min(sw,se))),hi=max(c,max(max(nw,ne),max(sw,se)));
  vec2 direction=vec2(sw+se-nw-ne,nw+sw-ne-se);
  float stability=max((nw+ne+sw+se)*0.03125,0.0078125);
  direction=clamp(direction/(min(abs(direction.x),abs(direction.y))+stability),vec2(-8.0),vec2(8.0))*resolution;
  vec3 narrow=(pixel(uvScene-direction/6.0)+pixel(uvScene+direction/6.0))*0.5;
  vec3 wide=narrow*0.5+(pixel(uvScene-direction*0.5)+pixel(uvScene+direction*0.5))*0.25;
  float candidate=edgeBrightness(wide);gl_FragColor=vec4(candidate<lo||candidate>hi?narrow:wide,1.0);
 }`};

export function renderPixelRatio(quality,ratio,width,height){const cap=Math.sqrt(2_100_000/(width*height));return quality==='light'?Math.min(1,cap):Math.min(Math.max(1,ratio),2,cap);}

export class SmoothRenderer{
 constructor(renderer,scene,camera){this.renderer=renderer;this.scene=scene;this.camera=camera;this.enabled=false;}
 setQuality(quality){
  const enabled=quality!=='light';if(this.enabled===enabled)return;this.enabled=enabled;
  if(!enabled){this.dispose();return;}
  const type=this.renderer.extensions.has('EXT_color_buffer_float')?THREE.HalfFloatType:THREE.UnsignedByteType;
  const target=new THREE.WebGLRenderTarget(1,1,{type,samples:Math.min(2,this.renderer.capabilities.maxSamples)});
  this.composer=new EffectComposer(this.renderer,target);this.composer.addPass(new RenderPass(this.scene,this.camera));this.composer.addPass(new OutputPass());this.fxaa=new ShaderPass(edgeShader);this.composer.addPass(this.fxaa);this.resize();
 }
 resize(){if(!this.composer)return;const size=this.renderer.getSize(new THREE.Vector2()),ratio=this.renderer.getPixelRatio();this.composer.setPixelRatio(ratio);this.composer.setSize(size.x,size.y);this.fxaa.uniforms.resolution.value.set(1/(size.x*ratio),1/(size.y*ratio));}
 render(){if(this.enabled&&this.composer)this.composer.render();else this.renderer.render(this.scene,this.camera);}
 dispose(){if(this.composer){for(const pass of this.composer.passes)pass.dispose?.();this.composer.dispose();}this.composer=null;this.fxaa=null;}
}
