// Mapeamento padrão da Gamepad API (Xbox/XInput e dispositivos equivalentes).
export function axisWithDeadzone(value,deadzone=.18){
 if(!Number.isFinite(value))return 0;
 const magnitude=Math.min(1,Math.abs(value));return magnitude<=deadzone?0:Math.sign(value)*(magnitude-deadzone)/(1-deadzone);
}
export function readStandardPad(pad){
 if(!pad||pad.connected===false||pad.mapping!=='standard')return null;
 const down=i=>!!pad.buttons?.[i]?.pressed||(pad.buttons?.[i]?.value??0)>.15;
 const axis=axisWithDeadzone(pad.axes?.[0]??0);
 const digital=Number(down(14))-Number(down(15));
 return {steer:digital||-axis,up:down(7),down:down(6),drift:down(0)||down(4),item:down(1),pause:down(9),confirm:down(0),back:down(1),navX:Number(down(15))-Number(down(14))||Math.sign(Math.abs(pad.axes?.[0]??0)>.6?pad.axes[0]:0),navY:Number(down(13))-Number(down(12))||Math.sign(Math.abs(pad.axes?.[1]??0)>.6?pad.axes[1]:0)};
}
export class GamepadInput{
 constructor(getPads=()=>navigator.getGamepads?.()??[]){this.getPads=getPads;this.index=null;this.previous={};this.nav=null;this.navTime=0;this.hadPad=false;}
 poll(time){
  let pads;try{pads=Array.from(this.getPads()??[]);}catch{pads=[];}
  const compatible=pads.filter(p=>p&&p.connected!==false&&p.mapping==='standard');
  const pad=compatible.find(p=>p.index===this.index)??compatible[0];
  const controls=readStandardPad(pad),changed=this.index!==(pad?.index??null),disconnected=this.hadPad&&!pad;
  this.index=pad?.index??null;this.hadPad=!!pad;
  const pressed={};for(const key of ['pause','confirm','back'])pressed[key]=!!controls?.[key]&&!this.previous[key]&&!changed;
  this.previous=controls??{};
  const nav=controls?.navY?{axis:'y',value:controls.navY}:controls?.navX?{axis:'x',value:controls.navX}:null;
  let navigation=null;const signature=nav?`${nav.axis}:${nav.value}`:null;
  if(signature!==this.nav){this.nav=signature;this.navTime=time+.45;if(nav&&!changed)navigation=nav;}else if(nav&&time>=this.navTime){navigation=nav;this.navTime=time+.15;}
  return {controls,pressed,navigation,connected:!!pad,changed,disconnected,unsupported:pads.some(p=>p&&p.connected!==false&&p.mapping!=='standard')};
 }
}
