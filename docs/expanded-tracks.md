# Pistas ampliadas — revisão 3

As distâncias de corrida são exatamente o dobro da revisão anterior. A geometria é normalizada para a mesma escala de metros usada pela corrida.

| Pista | Antes | Agora | Traçado e relevo |
| --- | ---: | ---: | --- |
| Vale Neon | 760 m | 1.520 m | Circuito de velocidade, retas planas e grandes curvas inclinadas |
| Porto Âmbar | 760 m | 1.520 m | Arcos costeiros, cais alto e trecho submerso entre 860 e 1.200 m |
| Vila da Feira | 1.440 m | 2.880 m | Praças, curvas em S e galerias |
| Serraria dos Barris | 1.680 m | 3.360 m | Subida, planaltos e descida com túneis e viaduto |
| Avenida Neon | 1.900 m | 3.800 m | Oito com arcos largos e 28 m de diferença entre as passagens do cruzamento |

Os cantos dos polígonos são arredondados antes da interpolação, evitando cotovelos. A validação geométrica verifica o raio das curvas contra o giro disponível no drift, inclusive em velocidade de nitro. As regras da direção, do drift e da carga dos turbos permanecem iguais.

A inclinação transversal depende da curvatura: o lado externo fica mais alto, com limite de 0,4 rad (aproximadamente 23°). Nas retas, a inclinação diminui. O perfil de altura usa transições de quinta ordem, com patamares planos e derivadas suaves nas entradas e saídas. Não há saltos automáticos nem planador.

Atalhos, água, túneis, itens, minimapa e câmeras usam a nova extensão. Aumentou-se a distância de visão das apresentações. Terrenos laterais conectam os trechos elevados das pistas terrestres ao chão. A cidade acompanha a extensão do circuito e as colunas do viaduto são agrupadas em instâncias.

Os recordes novos usam escopos r3. Backups continuam preservando os escopos sem revisão e os r2, com as distâncias históricas dos fantasmas; recordes de percursos diferentes não são comparados como se fossem da mesma pista.

Referências visuais consultadas: [Mario Kart 7 — Nintendo](https://www.nintendo.co.jp/3ds/amkj/index.html), [Rock Rock Mountain](https://www.mariowiki.com/Rock_Rock_Mountain) e [Wuhu Loop](https://www.mariowiki.com/Wuhu_Loop). Os traçados, relevos e elementos adicionados são próprios do projeto; não foram importados modelos ou pistas desses jogos.
