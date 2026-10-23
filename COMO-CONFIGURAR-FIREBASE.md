# Configuração do login do Lead The Match

## O que já está preparado no site

- O login usa Firebase Authentication com e-mail e senha.
- “Manter conectado” salva a sessão neste navegador; sem marcar, a sessão vale até fechar o navegador.
- As páginas do site redirecionam para `login.html` quando não há uma sessão ativa.
- O botão “Sair” encerra a sessão.
- A configuração pública do app Web está em `firebase.js`. Não coloque senhas nesse arquivo.

## Antes de testar no site publicado

1. No Firebase, abra **Authentication → Configurações → Domínios autorizados**.
2. Adicione `team1772.github.io` (sem `https://` e sem caminhos).
3. Em **Authentication → Usuários**, confirme que a conta de teste está cadastrada e ativa.
4. Publique estes arquivos junto com os demais arquivos do site e acesse pelo endereço HTTPS do GitHub Pages.
5. Entre usando o e-mail da conta e a senha cadastrada no Firebase Authentication.

Para criar outras contas, use **Authentication → Usuários → Adicionar usuário**. Cada equipe precisa de um e-mail de acesso e uma senha próprios. A senha é gerenciada pelo Firebase e não deve ser incluída no código.

## Sobre os dados das equipes

Esta etapa liga o login e restringe o acesso às páginas. Os envios de Scouting e Pit Scouting ainda continuam conectados aos Google Forms e as Estatísticas ainda leem as planilhas compartilhadas. Por isso, os dados dessas planilhas não ficam privados por equipe só por causa do login.

Para cada conta acessar somente os próprios registros, a próxima etapa precisa migrar gravação e leitura dos dados para um serviço com regras por usuário, como Cloud Firestore. Não compartilhe as planilhas como públicas se os dados precisarem ser privados.
