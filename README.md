# Karts do Vale Neon

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
