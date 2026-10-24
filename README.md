# Kart Speed Racers

## Garagem, pistas e progresso

- **Chegada limpa:** os painéis da corrida somem ao terminar. O resultado destaca o pódio, tempo, recorde e recompensas; a classificação completa pode ser expandida. Durante a corrida, **Ver classificação e mapa** alterna entre painéis compactos e completos.
- **Garagem:** na aba Pilotos, a prévia grande gira devagar e acompanha a escolha de carro, personagem e pintura. **Pausar giro** congela a rotação. Movimento reduzido também mantém a prévia parada.
- **Personalidade:** os oito pilotos têm poses próprias; Olinda acena, Tico sacode os punhos e Juma dança. Nitro, batidas, cabelo e olhos têm reações distintas. Movimento reduzido mantém poses estáveis.
- **Três circuitos novos:** Vila da Feira (barracas, frutas, bandeiras e público), Serraria dos Barris (pilhas de troncos e rodas de moinho) e Avenida Neon (noite, prédios e letreiros). Todos possuem trajeto e atalho próprios, recordes separados e sons sintetizados distintos. As pistas originais e o campeonato original de duas etapas continuam disponíveis; os circuitos novos são escolhidos nas corridas avulsas e no treino.
- **Backup:** em Opções, clique em **Baixar progresso**. O arquivo `kart-speed-racers-progresso.json` guarda conquistas, recordes e fantasmas. Para usar em outro navegador, clique em **Recuperar arquivo** e selecione o JSON. A recuperação reúne conquistas e mantém o menor tempo em cada pista/dificuldade; suas configurações atuais são preservadas. Arquivos incompatíveis são recusados antes de gravar; falhas de escrita tentam restaurar o estado anterior. Limite: 8 MB. Não é necessário criar conta.

## Carro Barril

O **Carro Barril** é a oitava escolha da aba **Pilotos**, adicionada depois do Carro 10 sem substituir nenhum veículo. O modelo original segue o desenho de referência: aduelas de madeira formando um barril curvo, duas cintas metálicas com rebites e quatro rodas abertas de raios. É construído em `src/barrel-car.js`, sem arquivos ou dependências externos.

As rodas giram e esterçam, os braços acompanham o volante e a chegada tem comemoração. Dona Olinda, Tico Rebite e Juma Vagalume também podem dirigir o barril. Aceleração, drift, nitro e colisões usam as mesmas regras dos outros carros. Os índices anteriores e as chaves de recordes/conquistas são preservados. Ouro solar continua exigindo os seis pilotos originais, mantendo conquistas existentes. O campeonato aceita oito participantes, com pontos 10 / 7 / 5 / 3 / 2 / 1 / 0 / 0.

## Novos personagens

Na aba **Pilotos**, escolha um dos sete karts e depois **Personagem no seu kart**:

- **Dona Olinda**: inventora aposentada, cachos prateados assimétricos, laço coral lateral, brincos e olhar determinado.
- **Tico Rebite**: mecânico de topete de cobre, óculos redondos e sorriso torto.
- **Juma Vagalume**: locutora de tranças elétricas, fones verdes e microfone.

Os personagens são modelos originais feitos em geometria Three.js. A inspiração visual usa apenas a energia cartunesca, o volume do cabelo e a expressividade do desenho de referência; não reproduz personagens de outras obras. Não há imagens externas nem dependências novas.

O retrato mostra a escolha no carro. O personagem reage ao nitro, às batidas e ao drift, acompanha braços e comemoração no pódio e pode ser usado inclusive no **Carro 10**. A seleção é salva no navegador; **Piloto original** restaura o visual anterior. Os sete carros, pinturas, desafios, recordes, física, drift e nitro mantêm suas regras. O nome da classificação continua sendo o do piloto/kart escolhido. Fantasmas antigos não armazenam a aparência do personagem.

Jogo original de kart 3D para navegador, feito com JavaScript e Three.js. Os modelos são construídos com formas geométricas, sem imagens ou personagens de terceiros.

## Como jogar no computador

1. Instale o **Node.js 22 ou mais recente** (inclui npm), disponível em https://nodejs.org.
2. Abra um terminal na pasta `meu-jogo-corrida`.
3. Execute `npm ci` para instalar as dependências.
4. Execute `npm run dev` e abra no navegador o endereço indicado pelo Vite.
5. Clique em **Jogar**. A corrida começa após três segundos.

É necessário navegador com WebGL e teclado. Não abra `index.html` diretamente: use o servidor acima. Para encerrar o servidor, pressione Ctrl+C no terminal.

| Tecla | Ação |
| --- | --- |
| W ou ↑ | Acelerar |
| S ou ↓ | Frear; manter pressionado para dar ré |
| A / D ou ← / → | Virar para os lados |
| Espaço + ← / → | Drift em movimento |
| Shift + ↑ | Usar nitro |
| R | Reiniciar a corrida |
| P ou Esc | Pausar / continuar |

São seis pilotos e três voltas no Circuito do Vale. O nitro recarrega com o tempo e mais rapidamente durante o drift. As barreiras mantêm os karts na pista; bater reduz a velocidade. A posição considera o progresso na pista e a ordem de chegada. Ao terminar, a tela mostra sua colocação e a classificação naquele instante.

Esta primeira versão usa direção arcade assistida: o kart acompanha a orientação da pista, enquanto WASD ou as setas controlam o deslocamento lateral. Drift aumenta o ângulo de deslize. Os cinco adversários buscam faixas livres, tentam ultrapassar e fazem pequenos erros ocasionais. Há colisões arcade entre karts e barreiras. Ainda não há itens ou controles de toque.

## Verificar e gerar versão de produção

```sh
npm test
npm run build
npm run preview
```

O build fica em `dist/` e pode ser hospedado em um serviço de sites estáticos. `npm run preview` serve para conferir o build localmente.

## Arquivos principais

- `src/main.js`: cenário, pista, karts, câmera, teclado e telas.
- `src/race.js`: velocidade, drift, nitro, voltas e classificação.
- `src/audio.js`: sons sintetizados de motor, derrapagem, turbo e chegada.
- `src/records.js`: cronômetro e recordes locais.
- `src/style.css`: menu e painel da corrida.
- `test/race.test.js`: testes da simulação, executados com o Node.js.

As dependências estão fixadas em `package-lock.json`. Não são necessárias chaves, contas pagas ou serviços externos em tempo de execução.

## Jogar online com GitHub Pages

O site é publicado gratuitamente em:
https://pedro22279704-blip.github.io/meu-jogo-corrida/

O endereço fica disponível após a primeira publicação bem-sucedida. Não é necessário instalar programas para jogar online; use um computador com teclado e navegador compatível com WebGL.

A configuração `vite.config.js` define o caminho `/meu-jogo-corrida/`, necessário para carregar os arquivos no GitHub Pages.

### Publicar ou atualizar

1. No GitHub, abra **Settings → Pages** e selecione **GitHub Actions** como origem em **Build and deployment**.
2. Incorpore o Pull Request à branch `main` usando **Merge pull request → Confirm merge**.
3. Abra a aba **Actions** e acompanhe **Publicar jogo no GitHub Pages**. Aguarde os trabalhos **Testar e compilar** e **Publicar** ficarem verdes.
4. Abra o endereço do site acima. A primeira publicação pode levar alguns minutos.

O workflow testa os Pull Requests sem publicá-los. Cada atualização na `main` testa, compila e publica o site automaticamente. Também é possível iniciar manualmente em **Actions → Publicar jogo no GitHub Pages → Run workflow**, selecionando `main`.

Se aparecer uma solicitação de aprovação do ambiente `github-pages`, aprove em **Review deployments**. Se a execução falhar, abra a etapa vermelha para consultar o erro; não é necessário criar tokens ou adicionar senhas ao código.

## Modelo Blender e drift

Os seis karts usam modelos originais próprios `public/models/kart-0.glb` até `kart-5.glb`, criados no Blender, com carrocerias, capacetes e roupas diferentes. O arquivo editável está em `art/vale-kart.blend`; o script `art/create_kart.py` permite reproduzi-lo com `blender --background --python art/create_kart.py`. O Blender é necessário apenas para editar/recriar o modelo, não para jogar ou publicar. O GLB já está incluído no repositório e o Vite o copia para o site.

Segure Espaço + A/D (ou setas) em velocidade para iniciar o drift: a carroceria gira antes da trajetória, o kart conserva movimento lateral e recupera aderência gradualmente ao soltar. Faíscas indicam o drift. Velocidade máxima, aceleração e consumo de nitro mantêm os valores anteriores. Se o modelo não carregar, o kart geométrico continua disponível como reserva.


## Drift com impulso, sons e recordes

- Segure Espaço + A/D em velocidade. A barra **DRIFT** carrega; depois de aproximadamente 0,54 segundo, as faíscas ficam azuis e a mensagem pede para soltar Espaço. Ao soltar, o kart ganha um impulso curto, proporcional à carga, sem gastar nitro. Um toque muito curto não gera impulso.
- O botão **Som: ligado/desligado** controla motor, derrapagem, turbo e melodia de chegada. O áudio começa após clicar em Jogar, conforme as regras dos navegadores. Ao ocultar a aba, o som é silenciado e o tempo não avança.
- O cronômetro aparece durante a corrida. Ao chegar, a tela mostra o tempo e o melhor resultado. O recorde fica apenas neste navegador, usando armazenamento local; limpar os dados do site apaga o recorde. Se o armazenamento estiver bloqueado, a corrida continua e a tela informa que não foi possível salvar.
- As regras novas têm sua própria versão de recordes. Recordes feitos antes de mudanças futuras de física podem ser separados para manter a comparação justa.
- Os pilotos têm modelos Blender distintos com peças articuladas. Cristais e moinhos completam o cenário. A câmera amplia suavemente a visão durante o turbo; partículas indicam derrapagem e movimento das rodas.
- As colisões são uma aproximação arcade em coordenadas da pista, sem simulação de capotamento ou danos.


## Pilotos articulados e Vale em 3D

O arquivo `art/vale-kart.blend` reúne seis pilotos/karts e os objetos do cenário. Para reconstruir os GLBs, execute `blender -b -P art/create_kart.py` na raiz. Não é necessário executar Blender no GitHub Actions: os modelos exportados já estão salvos em `public/models/`.

- Lume: carroceria arredondada e crista no capacete.
- Bia: kart esportivo, aerofólio e protetores laterais no capacete.
- Téo: painéis reaproveitados de madeira e óculos metálicos.
- Nina: capô arredondado e antenas no capacete.
- Zeca: turbinas decorativas e capacete com aba.
- Sol: para-choque largo e capacete com três aletas.

Todos compartilham o mesmo envelope de colisão e regras de velocidade; as diferenças dos veículos são visuais. As rodas giram conforme a velocidade e viram nas curvas. O volante e os braços acompanham a direção, o corpo inclina e os pilotos levantam os braços na chegada. As animações são controladas pelo código sobre peças articuladas, sem animações de esqueleto.

Árvores, portal de chegada, placas, arquibancadas, ponte e túnel são modelos Blender reutilizados. A pista tem relevo suave (2 a 10 metros) e curvas inclinadas em até aproximadamente cinco graus. Karts e câmera acompanham a superfície; a gravidade reduz um pouco a velocidade nas subidas e aumenta nas descidas. A condução continua assistida, sem saltos ou capotamento. O perfil da pista é calculado no código para coincidir com a simulação, em vez de ser uma malha de pista importada do Blender.

A nova pista usa a versão 3 de recordes para não comparar tempos do circuito plano anterior. Os dados antigos não são apagados, mas o recorde exibido começa separado para estas regras.

## Pausa e música retrô

Clique em **Pausar ⏸** durante a contagem regressiva ou corrida, ou pressione **P** / **Esc**. Use **Continuar ▶**, P ou Esc para retomar. A pausa congela pilotos, contagem regressiva, cronômetro, efeitos e áudio. Ao trocar para outra aba, a corrida pausa automaticamente e só continua quando você pedir. As teclas de direção são liberadas na pausa para evitar aceleração presa ao retornar.

Uma composição original chiptune animada (132 BPM, melodia, baixo e bateria) acompanha a corrida. Ela é sintetizada no navegador, começa após clicar em Jogar e repete sem baixar arquivos. O botão **Som** silencia tanto a música quanto os efeitos. Reiniciar reutiliza a mesma faixa, sem sobrepor músicas. O navegador precisa permitir Web Audio para reproduzir som; o jogo continua funcionando sem áudio se essa capacidade estiver indisponível.


## Adversários mais competitivos

A largada tem um grid mais compacto. Os adversários aceleram mais rápido, usam nitro em janelas diferentes e ajustam moderadamente a velocidade para disputar posições perto do jogador. A recuperação é limitada a quatro unidades de velocidade para mais ou para menos; os rivais não são reposicionados nem teleportados. Se você parar, eles continuam a corrida. A condução, drift e limites de velocidade do jogador não mudaram.

A classificação mostra quantos metros de progresso cada rival está à frente ou atrás, e destaca o adversário mais próximo. A informação continua útil quando o rival sai da câmera. Os recordes desta dificuldade usam a versão 4, separada das regras anteriores.

## Menu de corrida, Porto Âmbar e itens

Antes de clicar em **Jogar**, escolha um dos seis pilotos pelos retratos dos modelos reais, a pista e a dificuldade. Todos os pilotos têm as mesmas capacidades: a escolha muda personagem e kart, não o equilíbrio. A sensibilidade de 50% a 150% ajusta o quanto a direção responde; a recuperação da direção e do drift foi suavizada. As preferências ficam salvas neste navegador quando o armazenamento está disponível.

- **Fácil:** adversários mais lentos, menos turbo e mais erros.
- **Média:** disputa próxima baseada no equilíbrio anterior.
- **Difícil:** adversários mais rápidos, com mais turbo e menos erros.
- **Vale Neon:** circuito original com relevo, moinhos e túnel.
- **Porto Âmbar:** novo traçado ao pôr do sol, com cais, água, barcos, guindastes e contêineres. São três voltas, com o mesmo comprimento lógico do Vale, mas curvas e relevo próprios.

O minimapa mostra o traçado e os seis pilotos nas cores dos karts. Seu marcador tem uma borda branca. O quadro de classificação continua mostrando a distância de cada rival.

Passe por uma cápsula luminosa para carregar um item e pressione **E** para usar:

| Item | Efeito |
| --- | --- |
| Bolha protetora | Dura até seis segundos e absorve um ataque de goma ou pulso; não impede colisões de karts ou barreiras. |
| Goma de cais | Deixa uma poça atrás do kart por até sete segundos, que desacelera um rival. |
| Pulso de vento | Empurra lateralmente e desacelera rivais próximos, a até 22 unidades de progresso na pista. |

Você carrega um item por vez. Cápsulas recarregam após oito segundos, e os adversários também pegam e usam itens. A distribuição é determinística, sem compras ou vantagens pagas. A pausa congela também os timers dos itens. A reserva visual de poças mostra até 12 ao mesmo tempo.

Os controles **Música** e **Efeitos** são independentes e estão no menu e na pausa. **Som** continua sendo o botão geral de silenciar. Na pausa ou no resultado, **Menu e opções** permite trocar piloto, pista ou dificuldade para uma nova corrida.

Recordes usam a versão 5 e ficam separados por pista e dificuldade. Tempos de versões anteriores permanecem armazenados, mas não são comparados com as novas regras de itens e direção.

## Controle de PC (GameSir e outros)

O jogo suporta a **Gamepad API com mapeamento padrão**, incluindo controles GameSir que o Windows/navegador reconheça como Xbox/XInput. Não depende da marca; o suporte depende do modo do controle e do navegador. Não há garantia para todos os modelos ou modos proprietários.

1. Conecte o controle ao Windows por USB, Bluetooth ou receptor próprio, conforme o manual do seu modelo.
2. Se houver escolha de modo, use **PC/XInput/Xbox**. A combinação de botões varia por modelo; consulte o manual do seu GameSir.
3. Abra o jogo no Chrome ou Edge, clique na página e pressione um botão no controle. O menu deve indicar **Controle conectado**.
4. Se a música não começar ao iniciar só pelo controle, clique uma vez no jogo: navegadores podem exigir um clique/tecla para liberar áudio.

| Controle (posição padrão Xbox) | Ação |
| --- | --- |
| Analógico esquerdo ou direcional | Dirigir |
| RT | Acelerar |
| LT | Frear / ré |
| A (botão inferior) ou LB | Drift + direção |
| X (botão esquerdo) ou RB | Nitro |
| B (botão direito) | Usar item |
| Start / Menu | Pausar / continuar; iniciar corrida no menu/resultado |

A direção analógica é gradual, com zona morta de 18%, e respeita a sensibilidade do menu. Os gatilhos acionam acelerar/frear a partir de um pequeno limiar. Teclado e mouse continuam funcionando; a direção do teclado prevalece quando uma tecla lateral está pressionada.

Nos menus, use direcional/analógico para mover o foco, esquerda/direita para ajustar seletores e barras e **A** para ativar o botão focado. **B** continua uma corrida pausada ou volta ao menu após o resultado. A primeira pressão ao conectar serve apenas para reconhecimento, sem iniciar ações acidentalmente. Se desconectar durante a corrida, o jogo pausa e limpa a entrada do controle. Reconectar não retoma automaticamente.

O suporte foi validado com entradas simuladas no Chromium e testes automatizados; um GameSir físico ainda precisa ser conferido no seu PC. Se aparecer a mensagem de mapeamento não padrão, confira o modo XInput e reinicie a conexão. A Gamepad API pode estar indisponível em navegadores sem suporte ou com permissões restritas.

## Drifts em três níveis e atalhos

A barra de drift passa por três faixas de carga: **amarelo** a partir de 35%, **azul** a partir de 65% e **roxo** a partir de 95%. Solte o drift para liberar o impulso: respectivamente 0,65, 1,05 e 1,55 segundo, com limites de velocidade de 38, 43 e 49 unidades. A interface mostra o nível e as faíscas mudam de cor. Drift sem carga mínima não concede impulso.

Cada pista tem uma rota estreita indicada em roxo no minimapa e por cones na entrada/saída: **Corte dos Cristais** no Vale e **Passarela dos Guindastes** no Porto. Aproxime-se pelo lado esquerdo e entre em drift acima de 18 unidades de velocidade. Ao entrar, mantenha o kart na faixa e endireite a direção. A rota corta o caminho entre dois pontos da pista, com perfil de passarela. A simulação concede 18% de avanço extra na rota; sair da faixa ou perder muita velocidade reduz a velocidade e o avanço até a saída. Não é possível entrar repetidamente no mesmo atalho na mesma volta. A condução continua arcade, sem queda física da passarela.

## Disputa, desafios e pinturas

Os itens passam a depender da classificação. Os dois primeiros têm mais probabilidade de receber bolha; os dois últimos têm mais chance de receber pulso. O pulso também dá um pequeno impulso ao usuário para ajudar na recuperação. A distribuição usa uma sequência determinística ponderada. Os adversários têm estilos por piloto: Lume/Sol priorizam defesa, Bia/Nina ataque e Téo/Zeca exploram laterais e atalhos. Eles guardam ou usam itens conforme a proximidade dos rivais.

Quando você é atingido, um aviso informa **o item e o piloto responsável**, inclusive quando a bolha bloqueia o ataque. Na última volta, a música fica 15% mais rápida e a interface destaca um rival próximo. Ao chegar, uma apresentação mostra os três primeiros conforme terminam; esses pilotos comemoram, com melodias diferentes para a colocação do jogador.

Desafios ficam salvos neste navegador e liberam pinturas selecionáveis no menu, sem mudar o desempenho:

- Termine uma corrida sem colisões com karts/barreiras: **Pérola**.
- Libere três drifts carregados em uma corrida: **Chama roxa**.
- Vença ao menos uma corrida com cada um dos seis pilotos: **Ouro solar**.

O resultado informa batidas, drifts e pinturas novas. Se o armazenamento estiver bloqueado, o progresso fica apenas nesta sessão. Pinturas precisam ser selecionadas no menu e não são aplicadas automaticamente. Os recordes destas regras usam a versão 6, separados dos anteriores.

## Visual cartoon e sprites dos poderes

Os karts e objetos usam sombreamento toon em quatro faixas, com contornos nas grandes silhuetas dos karts. Luzes, cores do cenário, nuvens, retratos, botões e painéis foram ajustados para um visual cartoon mais coeso. Sombras de contato suaves ajudam a ligar os veículos ao chão, sem mapas de sombras ou pós-processamento pesado. Os contornos usam uma segunda casca apenas em algumas peças; isso ainda tem custo de renderização, então desempenho depende do computador. A física e as regras da corrida não foram alteradas nesta atualização.

Os sprites originais estão em `public/sprites/powers-atlas.png`, um PNG RGBA transparente de 1254 × 1254 pixels, criado especificamente para este projeto. O arquivo `powers-atlas.json` descreve os quatro recortes de 627 × 627:

| Posição no atlas | Sprite |
| --- | --- |
| Superior esquerda | Bolha protetora azul com escudo |
| Superior direita | Goma rosa |
| Inferior esquerda | Pulso de vento turquesa/roxo |
| Inferior direita | Cápsula dourada de coleta |

A mesma arte aparece no guia do menu, no indicador de poder e na pista: cápsulas, bolha ativa, goma no asfalto e pulso. Os sprites são imagens estáticas; flutuação, escala e apresentação são animadas pelo jogo. O indicador continua mostrando o nome e a tecla de uso, sem depender só da cor ou da imagem. Se a textura falhar, as cápsulas e os efeitos geométricos continuam funcionando e os textos identificam os poderes.

O atlas tem aproximadamente 1,7 MiB e é reutilizado pela interface e pelos efeitos. Não é necessário um serviço de imagens durante o jogo. O caminho do atlas respeita `/meu-jogo-corrida/` no GitHub Pages.

## Menu organizado, treino e acabamento

O menu tem quatro páginas: **Correr** (pista, dificuldade e início), **Pilotos** (personagem e pinturas), **Opções** (direção, gráficos, câmera e volumes) e **Desafios** (progresso e recompensas). Use clique, teclado (Tab e setas nas abas) ou controle com confirmação por A.

Em **Correr → Aprender · 1 volta**, o treino acontece sozinho na pista escolhida. Mensagens curtas acompanham aceleração, direção, drift carregado, nitro e uso de item. A volta pode ser concluída mesmo sem realizar todas as ações: o resultado mostra quantas foram experimentadas e permite repetir. **Sair do treino** ou o menu de pausa permite voltar. O treino não grava recordes nem conquistas e não tem adversários; uma corrida normal continua tendo seis pilotos e três voltas.

Em **Opções**, os ajustes gráficos são salvos no navegador:

- **Bonito:** resolução até duas vezes a resolução CSS, contornos dos karts e cenário mais completo.
- **Leve:** resolução CSS, menos árvores, nuvens e espectadores animados; desativa contornos e sombras de contato, e reduz partículas. A física é igual.
- **Movimento reduzido:** remove o zoom do nitro, usa acompanhamento de câmera mais direto e deixa animações decorativas estáticas. Rodas, direção e animações essenciais do jogo permanecem.

A câmera verifica paredes do túnel, portal e grandes estruturas do porto para reduzir obstruções, aproximando-se quando necessário. É uma proteção simples, não uma garantia para toda combinação de objetos/ângulos.

Bandeiras ondulam, barcos balançam e espectadores saltam, com animações leves. Ataques de goma e pulso geram partículas no kart atingido; a bolha estoura visualmente ao bloquear ou expirar. O pulso tem ondas de impacto. A pausa congela esses efeitos.

A tela de resultado mostra os modelos reais dos pilotos e karts em um pódio 3D, além de tempo, classificação, batidas, drifts, recordes e pinturas novas. O pódio é preenchido conforme os três primeiros terminam. No treino, aparece apenas o piloto treinado. O renderer do resultado só é criado ao chegar, com resolução limitada para conter o custo.

### Circuitos maiores com túneis

Vale Neon e Porto Âmbar preservam seus percursos e recordes. Os três circuitos seguintes têm traçados novos e comprimentos próprios por volta:

- **Vila da Feira — 1,44 km:** chicanes entre praças e duas galerias cobertas.
- **Serraria dos Barris — 1,68 km:** curvas em S, subida de serra, viaduto e dois túneis na pedreira.
- **Avenida Neon — 1,90 km:** circuito em oito com cruzamento em níveis separados por 24 metros e dois túneis iluminados.

As corridas continuam com três voltas, todos os oito carros, drift e nitro. Itens, minimapa, atalhos, colisões e vácuo usam o comprimento da pista escolhida. Túneis acompanham curvas e relevo; suas paredes e tetos participam da proteção da câmera. O treino usa uma volta do traçado escolhido. O campeonato permanece nas duas pistas originais.

Os novos tempos e fantasmas usam escopos `fair-r2-*`, `sawmill-r2-*` e `night-r2-*`. Os recordes e fantasmas dos traçados antigos permanecem armazenados e também entram no backup; não são comparados com os novos. Backups anteriores continuam aceitos.

### Avenida Neon: ruas, viaduto e painéis de Tóquio

A cidade tem quarteirões com ruas no chão, faixas de pista, calçadas e passagens de pedestres. O circuito elevado possui laje contínua com faces inferiores, vigas longitudinais, travessas, colunas e bases apoiadas no solo. Os apoios preservam espaço para a pista inferior do oito. O segundo túnel termina antes do cruzamento para revelar o viaduto por baixo.

Grandes painéis originais nas fachadas, letreiros verticais e janelas iluminadas dão um clima de metrópole noturna inspirada em Tóquio. Os anúncios são fictícios e estáticos, sem flashes. A cidade é mais densa; o modo Leve reduz prédios, painéis, postes e pilares. Repetições de vigas, faixas e luminárias usam instâncias para reduzir chamadas de desenho. O traçado e os recordes permanecem iguais.

### Abertura de Kart Speed Racers

Ao abrir o jogo, uma tela de título central mostra o nome em destaque e três karts reais em 3D: Bia Faísca, Carro 10 e Carro Barril. **Ligar motores** (clique, toque, Enter ou A no controle) toca uma partida de motor de 2,4 segundos, com pulsos de combustão, ressonância de escapamento e duas aceleradas de giro progressivo e inicia uma composição original de oito compassos a 152 BPM, com baixo, bateria e fanfarra sintetizada. Depois, **Entrar no jogo** abre o menu. **Pular abertura** ou Esc leva diretamente ao menu, sem espera obrigatória. Em **Opções → Ver abertura**, a apresentação pode ser revista.

O áudio aguarda uma interação para respeitar o bloqueio de reprodução automática do navegador. A abertura respeita o volume de música, o botão de som e movimento reduzido; suspende o áudio quando a aba fica oculta. Ao entrar nos menus, a mesma faixa continua sem reiniciar, com dois terços do volume da abertura; iniciar uma corrida faz a transição para a trilha de corrida. O motor respeita o volume de efeitos e a música respeita seu próprio volume, sem duplicar fontes ao alternar abas. A versão para telas menores mantém botões acessíveis. O visual e a composição são próprios; a referência de energia e apresentação foi o [site oficial de Mario Kart 8 Deluxe](https://mariokart8deluxe.nintendo.com/), sem importar arte, marcas ou música da Nintendo.

### Pull requests automáticos

Ao enviar commits para branches `feat/**` ou `fix/**`, o workflow **Abrir PR automaticamente** instala dependências, testa e compila o jogo. Se tudo passar, abre um PR para `main` ou mostra o PR já existente. Não faz merge nem publica a branch diretamente. O link aparece no resumo da execução em Actions.

Em **Settings → Actions → General → Workflow permissions**, habilite **Allow GitHub Actions to create and approve pull requests** e salve. As permissões de escrita necessárias ficam limitadas ao job de abertura do PR; não é necessário cadastrar um token pessoal. PRs abertos pelo `GITHUB_TOKEN` não disparam outro workflow de `pull_request`, por isso a validação ocorre no próprio envio da branch. Cada novo envio repete a validação. Após revisão e merge, o workflow de publicação existente testa e publica `main`.

### Vácuo, efeitos de pilotagem, campeonato e fantasma

Siga um kart em movimento, na mesma rota, entre 4 e 22 unidades da pista e com menos de 1,5 unidade de diferença lateral. Após 0,9 segundo alinhado, o **vácuo** eleva o limite normal do jogador de 32 para 36; os rivais recebem a mesma ajuda de velocidade. O HUD indica a carga e o momento de ultrapassar. Drift, saída do alinhamento e chegada interrompem a ajuda. Nitro e impulsos existentes mantêm seus limites.

Derrapagens deixam marcas temporárias dos pneus. As rodas na margem de terra levantam poeira, e o piloto reage às colisões e ao usar um poder. Os efeitos usam pools limitados (160 marcas e 24 partículas), congelam na pausa e são limpos ao reiniciar. O modo Leve usa menos marcas; movimento reduzido diminui a emissão e elimina a poeira.

Em **Correr → Campeonato · 2 pistas**, dispute Vale Neon e depois Porto Âmbar com o mesmo piloto e dificuldade. As colocações rendem **10 / 7 / 5 / 3 / 2 / 1** pontos. A próxima pista fica disponível depois que os seis terminam; cada etapa pontua uma única vez. Empates usam a menor soma das colocações e, persistindo, o melhor resultado na segunda pista. O resultado final mostra a classificação acumulada e o pódio dos campeões com um troféu 3D. O campeonato é uma sessão: voltar ao menu abandona a copa e R não reinicia etapas. Os tempos e desafios de cada corrida continuam valendo normalmente.

Ao estabelecer um novo recorde, o jogo tenta salvar também a trajetória do jogador, com amostras a cada 0,1 segundo (limite de 9.000). Na próxima corrida, o **fantasma** translúcido reproduz esse trajeto usando o relógio da corrida; não participa das colisões, itens, vácuo nem classificação. Atalhos são reproduzidos na rota correspondente. A opção **Mostrar fantasma do melhor tempo** é salva no navegador. Os dados são separados por pista e dificuldade, validados ao carregar e ficam apenas neste navegador. Sem armazenamento disponível, a corrida continua normalmente, mas o fantasma não persiste. Treinos não gravam trajetórias. A física com vácuo usa recordes v7; tempos v6 permanecem armazenados separadamente e não são comparados.


### Carro 10

O sétimo veículo, **Carro 10**, é inspirado no desenho de referência: carroceria azul-violeta, piloto vermelho, pneus pretos expostos, escudo frontal cinza, placa branca com o número 10 e aerofólio traseiro com suportes. Selecione-o na aba **Pilotos**. Usa os mesmos controles e física dos karts originais: Espaço + curva para drift, Shift para nitro e E para item.

O modelo cartoon é criado em `src/car-10.js`, sem downloads ou exportação pelo Blender. Os seis modelos GLB originais permanecem intactos. Corridas e campeonato agora têm sete participantes; o sétimo lugar soma zero pontos. Ouro solar continua exigindo vitórias com os seis pilotos originais, preservando as conquistas anteriores; vitórias e fantasmas do Carro 10 também são salvos.


### Copa Horizonte e apresentação das pistas

Em **Correr → Copa Horizonte · 4 pistas**, dispute Vale Neon, Porto Âmbar, Vila da Feira e Serraria dos Barris, nesta ordem, com o mesmo piloto e dificuldade. Cada etapa tem três voltas e oito pilotos. A pontuação por colocação é **15 / 12 / 10 / 9 / 8 / 7 / 6 / 5**; vence a maior soma após quatro etapas. Empates usam a menor soma das colocações e depois o resultado da última corrida. A próxima etapa espera todos terminarem e cada corrida pontua uma única vez. Na final, o pódio usa a classificação da copa e exibe o troféu. O campeonato curto de duas pistas continua disponível.

Antes da primeira largada, uma apresentação de aproximadamente 29 segundos percorre as quatro pistas com três tomadas por pista: panorama aéreo, passagem próxima do circuito e enquadramento da largada. As etapas seguintes têm uma introdução curta da pista atual. A música da abertura acompanha a cena. **Pausar** ou P/Start interrompe apresentação e áudio; **Pular apresentação**, Esc ou A/B leva à contagem de largada; **Voltar ao menu** abandona a copa e restaura a pista selecionada antes da cena. Não há espera obrigatória.

A apresentação usa o próprio mundo 3D do jogo, com uma pista carregada por vez, proteção contra obstruções nas câmeras próximas e uma interface adaptada ao celular. Movimento reduzido usa vistas aéreas estáticas, quatro segundos por pista. Ocultar a aba congela a cena. A copa é uma sessão: sair ao menu abandona seus pontos, enquanto recordes e conquistas das corridas continuam seguindo as regras existentes.

Referência de formato: [Grand Prix no guia oficial de Mario Kart 8 Deluxe](https://www.nintendo.com/jp/ichikara/aabpa/index_en.html). Nome, cenários, interface, troféu e trilha utilizados são os do Kart Speed Racers.


### Pistas suaves e semáforo de largada

As faixas de asfalto e acostamento possuem geometrias separadas, evitando superfícies sobrepostas que produziam listras e cintilação à distância. O tratamento de profundidade mantém a ordem visual entre terreno, acostamento e asfalto. As curvas, medidas e regras de corrida são preservadas.

No modo Bonito, a cena usa suavização multiamostrada e um filtro de bordas direcional após a conversão de cor, inclusive durante a apresentação da copa. O modo Leve usa o desenho direto e a correção geométrica, sem o pós-processamento extra. O tamanho dos buffers é limitado para conter consumo de memória em telas grandes e de alta densidade. Redimensionar a janela ou trocar qualidade atualiza os buffers e libera os recursos anteriores.

Todas as largadas (corrida, treino e copa) mostram um semáforo com três lentes: uma luz vermelha em 3, duas em 2, três em 1 e todas verdes em JÁ. Tons originais acompanham a sequência e respeitam mudo/volume de efeitos. O sinal verde desaparece após cerca de 0,85 segundo. Pausar congela a contagem e não repete os tons; reiniciar cria uma nova sequência. Os karts continuam esperando a liberação da contagem original de três segundos.
