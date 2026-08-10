# Dashboard — Esporte Clube Noroeste

## Como hospedar na Vercel (sem linha de comando)

1. Crie uma conta no GitHub (github.com), se ainda não tiver.
2. Crie um repositório novo e faça upload de todos os arquivos deste projeto (arraste tudo pela opção "uploading an existing file" e clique em **Commit changes**).
3. Em vercel.com, entre com sua conta do GitHub → **Add New Project** → selecione o repositório → **Deploy**.

## Como conectar o banco de dados real (Neon), sem linha de comando

Agora o dashboard salva os atletas em um banco de dados de verdade (Postgres, via Neon), compartilhado entre qualquer dispositivo que acessar o site. Para ligar isso:

1. Abra o seu projeto na Vercel.
2. No menu do projeto, clique na aba **Storage**.
3. Clique em **Create Database** (ou "Connect Store").
4. Escolha **Neon** (Serverless Postgres) na lista de opções.
5. Siga o assistente — a Vercel cria o banco e **já conecta automaticamente** a variável de ambiente do projeto (normalmente chamada `DATABASE_URL` ou `POSTGRES_URL`). Você não precisa copiar nem colar nada manualmente.
6. Depois de conectado, vá em **Deployments**, clique nos "..." do último deployment e escolha **Redeploy** — isso é necessário para o projeto "enxergar" a nova variável de ambiente.
7. Pronto. Na primeira vez que alguém abrir o site, o sistema cria a tabela sozinho e já preenche com os 24 atletas de exemplo. Depois disso, tudo que for cadastrado, editado ou excluído no dashboard fica salvo no banco — e aparece igual em qualquer navegador ou dispositivo que acessar o mesmo link.

Se o site mostrar a mensagem "Banco de dados não conectado", é sinal de que o passo do Storage/Neon ainda não foi feito (ou o redeploy ainda não rodou).
