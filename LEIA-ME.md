# Lead The Match — guia para testar e publicar

## Qual pasta usar

Esta pasta contém uma única versão: login e dados privados por conta no Firebase.
Abra a pasta que contém `login.html`, `firebase.js` e `firestore.rules` juntos.
As pastas antigas `Lead-The-Match-Firebase` e `Lead-The-Match-Equipes-Privadas`
não precisam ficar dentro desta versão. Guarde o projeto anterior como backup.

## Rodar no computador do mentor

Opção com VS Code:

1. Extraia a pasta do projeto e abra-a em **Arquivo → Abrir Pasta**.
2. Com a extensão Live Server instalada, clique com o botão direito em `login.html`.
3. Escolha **Open with Live Server**.
4. Entre com uma conta de teste já criada no Firebase.

Opção com Node.js instalado:

1. Abra o terminal na pasta que contém `package.json`.
2. Execute `npm start`. Não é necessário `npm install`.
3. Abra `http://127.0.0.1:5500/login.html`.
4. Para encerrar, pressione Ctrl+C no terminal.

O site roda localmente, mas precisa de internet para autenticação, Firestore,
planilha de cronograma/ranking e biblioteca dos gráficos. Testes salvam dados reais
na conta utilizada: use a conta de teste. Abrir o HTML com duplo clique (`file://`)
não substitui o servidor. Nenhuma configuração do Firebase foi alterada nesta revisão.

## Publicar no GitHub Pages

Primeiro confirme com o mentor qual repositório será o oficial.
A pasta local atual aponta para `cassioo-oli/Lead-The-Match`.

1. Guarde um backup do projeto antigo fora da pasta que será publicada.
2. Coloque os arquivos desta revisão na pasta de publicação, com `index.html` na
   raiz. Não coloque o ZIP, nem várias versões completas dentro umas das outras.
3. No VS Code, confira o diff em **Controle do Código-Fonte**. Preserve a pasta
   `.git` do repositório existente e qualquer alteração recente do mentor.
4. Faça os commits, por exemplo:
   - `Remove avaliacao de defesa do Scout`
   - `Corrige layout e estados vazios das estatisticas`
   - `Organiza arquivos e documenta execucao local`
5. Envie os commits para o GitHub com **Sincronizar Alterações**.
6. No repositório, abra **Settings → Pages → Build and deployment**.
7. Em **Source**, escolha **Deploy from a branch**; selecione **main** e **/(root)**
   e clique em **Save**.
8. Acompanhe a publicação em **Actions**. Quando terminar, use o link mostrado
   em **Settings → Pages**; não confunda o endereço do repositório com o do site.
9. Teste login, Scout, Pit Scout, Estatísticas, Lista de Partidas e Ranking no link.

Se aparecer `auth/unauthorized-domain`, o responsável pelo Firebase deve conferir
o domínio exato do site em Domínios autorizados. `team1772.github.io` e
`cassioo-oli.github.io` são domínios diferentes. Esta revisão não altera essa lista.

Guia oficial: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## O que mudou nesta revisão

- `scout.html`: retirada a pergunta de defesa e ajustada a descrição da seção.
- `scouting-envio.js`: retirado o mapeamento da defesa; salvamento no Firestore preservado.
- `estatisticas.js`: retirada a defesa do desempenho; mensagens e gráficos alternam
  corretamente; limpar a seleção limpa a equipe anterior; rótulos longos quebram
  linha. Respostas de desempenho baixo passam a contar como zero e perguntas não
  preenchidas continuam sem nota.
- `estatisticas.css`: corrigido o conflito entre `hidden` e `display:flex`; cartões,
  textos do Pit e títulos ajustam-se à largura disponível.
- `estatisticas.html`: textos de apoio ajustados.
- `package.json` e `scripts/serve.js`: comando `npm start` para execução local.
- `.gitignore`, `.nojekyll` e este guia: organização e publicação.

Retirados desta cópia: `cronograma-jogos.html` (cronograma antigo duplicado),
`ranking.css` e `scheduleP.css` (sem referência nas páginas atuais).
Os originais continuam no backup. `schedule.css`, `ranking.js`, `ranking.test.js`,
`login.css`, `login-firebase.css`, imagens e demais arquivos usados foram mantidos.

## Forms, planilhas e dados antigos

Nesta versão, Scout e Pit Scout são salvos no Firestore. Os Forms antigos e suas
`entries` não participam desse envio. Não é necessário alterar a planilha para a
retirada da defesa funcionar no site. Nenhuma pergunta do Forms, coluna de Sheets
ou resposta histórica foi apagada nesta revisão. Registros antigos de defesa
podem continuar no banco, mas não são exibidos no gráfico nem coletados pelo formulário novo.

Se o mentor também usa o Google Forms diretamente, a retirada das perguntas antigas
precisa ser feita separadamente no Forms e validada antes de limpar colunas históricas.
Cronograma e ranking continuam consultando as fontes compartilhadas já existentes.
