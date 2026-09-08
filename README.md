# Dashboard — Esporte Clube Noroeste

## Como hospedar na Vercel (sem linha de comando)

1. Crie uma conta no GitHub (github.com), se ainda não tiver.
2. Crie um repositório novo e faça upload de todos os arquivos deste projeto (arraste tudo pela opção "uploading an existing file" e clique em **Commit changes**).
3. Em vercel.com, entre com sua conta do GitHub → **Add New Project** → selecione o repositório → **Deploy**.

## Como conectar o banco de dados real (Neon), sem linha de comando

1. Abra o seu projeto na Vercel.
2. Na aba **Storage**, clique em **Create Database** → escolha **Neon**.
3. Siga o assistente (nome, região São Paulo, plano Free) e aceite.
4. Em **Connect to Project**, selecione o projeto do dashboard e confirme.
5. Vá em **Deployments** → "..." do último deployment → **Redeploy**.
6. Pronto — na primeira visita o sistema cria as tabelas sozinho e preenche com os 24 atletas de exemplo (só uma vez). Tudo que for cadastrado, editado ou excluído depois fica salvo no banco, e aparece igual em qualquer navegador ou dispositivo.

Se o site mostrar "Banco de dados não conectado", o passo do Storage/Neon ainda não foi feito ou o redeploy ainda não rodou.

## Ícone e prévia ao compartilhar (WhatsApp, etc.)

O escudo já está configurado como ícone da aba do navegador (favicon) e como imagem de prévia quando o link é compartilhado no WhatsApp, Facebook, etc.

Se você conectar um domínio próprio (ex: `scouting.noroeste.com.br`) depois, é preciso atualizar as linhas `og:image`, `og:url` e `twitter:image` no arquivo `index.html`, trocando `noroeste-dashboard-v5.vercel.app` pelo novo domínio — senão a prévia do link continua puxando do endereço antigo.
