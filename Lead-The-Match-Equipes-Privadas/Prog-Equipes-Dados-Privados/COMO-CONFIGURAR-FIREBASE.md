# Configuração do login e dos dados privados

## O que já está preparado no site

- O login usa Firebase Authentication com e-mail e senha.
- “Manter conectado” salva a sessão neste navegador; sem marcar, a sessão vale até fechar o navegador.
- As páginas do site redirecionam para `login.html` quando não há uma sessão ativa.
- O botão “Sair” encerra a sessão.
- Scout, Pit Scout e Estatísticas usam coleções do Cloud Firestore separadas pelo UID da conta.
- O arquivo `firestore.rules` permite que cada conta leia e altere somente as próprias coleções.
- Cronograma e ranking continuam usando as fontes compartilhadas existentes.
- A configuração pública do app Web está em `firebase.js`. Não coloque senhas nesse arquivo.

## Antes de testar no site publicado

1. No Firebase, abra **Authentication → Configurações → Domínios autorizados**.
2. Confirme que `team1772.github.io` está na lista (sem `https://` e sem caminhos).
3. Em **Authentication → Usuários**, confirme que a conta de teste está cadastrada e ativa.
4. Abra **Firestore Database**. Se ainda não houver banco, crie-o em modo de produção. Para o Brasil, `southamerica-east1 (São Paulo)` é a opção regional mais próxima. A região não pode ser alterada depois de criar o banco.
5. Na aba **Regras** do Firestore, substitua o conteúdo pelas regras do arquivo `firestore.rules` e clique em **Publicar**.
6. Só depois de publicar as regras, envie os arquivos atualizados do site pelo GitHub Pages.
7. Entre pelo endereço HTTPS do GitHub Pages e teste salvar um Pit Scout e um Scout. Confira se aparecem em Estatísticas nessa mesma conta.
8. Crie uma segunda conta de teste, entre nela e confira se ela não enxerga os registros da primeira.

Para criar cada acesso, use **Authentication → Usuários → Adicionar usuário**. Cada equipe precisa de um e-mail válido e uma senha próprios. O login atual usa e-mail, não apenas nome de usuário. Não coloque senhas no código nem as envie em chats. A senha pode ser redefinida no Firebase.

## Sobre os dados das equipes

Os novos registros de Scout e Pit Scout serão salvos no Firestore. As respostas antigas continuam nas planilhas e não são importadas automaticamente; mantenha-as como histórico até decidir como atribuí-las às contas. Cronograma e ranking continuam compartilhados. Restrinja o compartilhamento das planilhas antigas de Scout e Pit Scout para que somente a organização tenha acesso; o login não protege arquivos do Google que permaneçam públicos.
