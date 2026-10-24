export const PILOT_PERSONALITIES=[
 {name:'Lume',bio:'Otimista: abre os braços para receber a bandeirada.',phase:0,roll:.07,left:-2,right:-2.1},
 {name:'Bia Faísca',bio:'Competitiva: comemora com os punhos alternados.',phase:1,roll:.09,left:-2.3,right:-1.5},
 {name:'Téo Musgo',bio:'Tranquilo: balança o corpo e agradece à torcida.',phase:2,roll:.12,left:-1.4,right:-1.8},
 {name:'Nina Cometa',bio:'Elétrica: festeja com os dois braços no alto.',phase:3,roll:.06,left:-2.5,right:-2.4},
 {name:'Zeca Brisa',bio:'Descontraído: surfa a comemoração com um aceno.',phase:4,roll:.16,left:-1.3,right:-2.1},
 {name:'Sol Cobre',bio:'Teatral: abre os braços e faz pose para a torcida.',phase:5,roll:.1,left:-1.7,right:-1.7},
 {name:'Carro 10',bio:'Determinado: celebra com punhos firmes e postura de campeão.',phase:6,roll:.04,left:-2.2,right:-2.2},
 {name:'Carro Barril',bio:'Brincalhão: balança os braços como um barril dançante.',phase:7,roll:.16,left:-1.6,right:-2.3},
];
export const CHARACTER_PERSONALITIES={
 gugar:{name:'Gugar',bio:'Bate no peito, abre um sorriso e sacode a cabeleira. Seu Osso Perseguidor vai atrás do rival à frente.',phase:1.8,roll:.17,left:-2.35,right:-1.7},
 olinda:{name:'Dona Olinda',bio:'Comemora com um aceno majestoso e seu cabelo acompanha cada reação.',phase:2.4,roll:.10,left:-1.35,right:-2.05},
 tico:{name:'Tico Rebite',bio:'Sacode os punhos de alegria; o topete dispara para trás com o nitro.',phase:.5,roll:.15,left:-2.4,right:-2.15},
 juma:{name:'Juma Vagalume',bio:'Dança no pódio e acompanha o ritmo com as tranças.',phase:4,roll:.19,left:-1.6,right:-1.85},
};
export function personalityFor(pilot,character){return CHARACTER_PERSONALITIES[character]??PILOT_PERSONALITIES[pilot]??PILOT_PERSONALITIES[0];}
export function personalityPose(racer,time,character,reduced=false){
 const p=personalityFor(racer.pilot,character),wave=reduced?0:Math.sin(time*5+p.phase),celebrate=racer.finished&&(racer.podiumPlace??1)<=3;
 return {roll:celebrate?wave*p.roll:racer.hit>0?wave*p.roll*.8:racer.boosting&&!reduced?Math.sin(time*12+p.phase)*.025:0,
  arms:[p.left,p.right].map((angle,i)=>({x:celebrate?angle+wave*(i?-.16:.16):racer.hit>0?-.2:racer.boosting?-.08:0,z:celebrate?(i?1:-1)*(.35+p.roll):racer.hit>0?(i?-.2:.2):0}))};
}
