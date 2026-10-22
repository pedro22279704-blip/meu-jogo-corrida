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
