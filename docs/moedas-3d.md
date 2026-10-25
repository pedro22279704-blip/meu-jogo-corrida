# Moedas 3D e efeito de coleta

As moedas usam cilindro dourado, borda e relevo nas duas faces. Giram e flutuam levemente, respeitando a inclinação da pista. As peças repetidas usam instâncias; suas posições são preparadas uma vez por circuito.

A coleta considera a distância 3D entre a moeda e o segmento percorrido pelo kart desde o quadro anterior. Isso evita perder moedas em passagens rápidas, preserva o relevo e evita recolher uma moeda que esteja em outra altura. Pausas, atalhos e reposicionamentos não geram coletas pelo caminho. Cada moeda entra em recarga por sete segundos e não é contada duas vezes por karts próximos.

Uma coleta do jogador gera cinco partículas brancas/douradas no ponto visual da moeda. O modo leve usa três; movimento reduzido elimina giro, oscilação e partículas, mantendo o realce do contador. O efeito reutiliza um conjunto fixo de sessenta partículas e congela durante a pausa.

O som já existente é preservado. O contador ganha realce e indica MÁX. ao chegar a dez, com descrição acessível da quantidade e do bônus. O limite permanece dez moedas, cada uma valendo +1,5% de velocidade normal; ataques continuam retirando até três. Não há retorno do nitro.
