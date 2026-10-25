export function createTutorial(){return {accelerate:false,steer:false,drift:false,item:false};}
export function updateTutorial(state,racer,input){
 if(racer.speed>10)state.accelerate=true;
 if(state.accelerate&&(Math.abs(input.steer??0)>.15||input.left||input.right))state.steer=true;
 if(racer.goodDrifts>0)state.drift=true;
 if(input.item&&state.heldItem&&!racer.item)state.item=true;state.heldItem=racer.item;
 return state;
}
export function tutorialMessage(state,pad=false){
 if(!state.accelerate)return pad?'1/4 · Segure RT para acelerar.':'1/4 · Segure W ou ↑ para acelerar.';
 if(!state.steer)return pad?'2/4 · Mova o analógico para experimentar a direção.':'2/4 · Use A/D ou ←/→ para virar suavemente.';
 if(!state.drift)return pad?'3/4 · Segure A/LB + curva; carregue e solte para impulsionar.':'3/4 · Segure Espaço + curva; carregue e solte para impulsionar.';
 if(!state.item)return pad?'4/4 · Pegue uma cápsula e aperte B para usar o poder.':'4/4 · Pegue uma cápsula e aperte E para usar o poder.';
 return 'Muito bem! Complete esta volta para concluir o treino.';
}
