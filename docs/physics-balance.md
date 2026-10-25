# Física e equilíbrio da corrida

O jogo continua com direção manual, sem saltos automáticos e sem planador. O movimento permanece no referencial da pista, sem depender de Unity ou Unreal.

## Montagem

Cada um dos oito chassis tem velocidade (m/s), aceleração (m/s²), peso relativo, dirigibilidade e desempenho fora do asfalto. Os pneus Rua, Aderência e Todo-terreno somam seus modificadores a esses valores. A garagem mostra os resultados e salva a escolha no navegador. Não há uma peça superior em todos os atributos.

A dirigibilidade multiplica a resposta da direção. O peso determina a divisão dos deslocamentos e da velocidade nas colisões entre karts. A velocidade máxima fora do asfalto é a velocidade normal multiplicada pelo atributo fora de estrada; pneus Todo-terreno reduzem essa perda. Nitro e poderes continuam disponíveis.

## Moedas

`velocidade normal = velocidade do conjunto × (1 + 0,015 × moedas)`

O limite é dez moedas. Um ataque não bloqueado tira até três imediatamente. O mesmo ataque não é contado novamente na atualização das moedas. Batidas também mantêm a penalidade anterior. A bolha bloqueia a perda causada por um ataque.

## Drift

A direção do deslocamento e a orientação da carroceria são separadas: a frente aponta para dentro e a traseira sai para fora. O contravolante abre o arco sem inverter o sentido escolhido. Não há impulso lateral artificial nem alinhamento automático à pista.

Virar para dentro carrega mais rápido que manter o volante neutro ou fazer contravolante. A carga varia com o tempo, e não com a quantidade de quadros. Ao soltar o botão, 1,5 s efetivos de carga liberam mini-turbo azul de 0,5 s; 3,5 s efetivos liberam super mini-turbo vermelho de 1,5 s. A liberação ocorre uma única vez. Não há salto inicial, preservando a escolha de jogar sem pulos.

## Itens

Usa-se a diferença de progresso total em metros até o líder, incluindo voltas completas. As probabilidades dos três grupos são interpoladas:

| Distância | Defesa | Ataque/mobilidade | Recuperação |
| --- | ---: | ---: | ---: |
| 0 m | 80% | 20% | 0% |
| 100 m | 20% | 60% | 20% |
| 200 m ou mais | 8% | 42% | 50% |

Defesa oferece bolha/goma; ataque oferece cogumelo/casco; recuperação oferece pulso/Onda Iônica. A Onda Iônica desacelera os rivais ainda correndo à frente, respeitando bolhas. O especial do Gugar é preservado. Não são alteradas as posições artificialmente.

## Água

O Porto Âmbar tem uma descida suave entre 430 e 600 m, com uma seção submersa, portais, corais, hélice e bolhas. Dentro da água, a velocidade recebe fator 0,86, a aceleração 0,78 e a dirigibilidade 0,9. A transição de altura tem derivada contínua e não lança o kart.

Como o kart permanece apoiado na pista, não há física de voo nem saltos de gravidade reduzida. O comportamento subaquático é representado por arrasto, resposta da direção e apresentação visual. A hélice e as bolhas não alteram a trajetória por conta própria.
