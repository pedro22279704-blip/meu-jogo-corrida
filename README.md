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
| ↑ | Acelerar |
| ↓ | Frear; manter pressionado para dar ré |
| ← / → | Virar para os lados |
| Espaço + ← / → | Drift em movimento |
| Shift + ↑ | Usar nitro |
| R | Reiniciar a corrida |

São seis pilotos e três voltas no Circuito do Vale. O nitro recarrega com o tempo e mais rapidamente durante o drift. Sair do asfalto reduz a velocidade. A posição considera o progresso na pista e a ordem de chegada. Ao terminar, a tela mostra sua colocação e a classificação naquele instante.

Esta primeira versão usa direção arcade assistida: o kart acompanha a orientação da pista, enquanto as setas controlam o deslocamento lateral. Drift aumenta o ângulo de deslize. Os cinco adversários seguem trajetórias automáticas com velocidades diferentes. Ainda não há colisões entre karts, áudio, itens ou controles de toque.

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
