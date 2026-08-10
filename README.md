# Dashboard — Esporte Clube Noroeste

## Como hospedar na Vercel (sem linha de comando)

1. **Crie uma conta no GitHub** (github.com), se ainda não tiver.
2. No GitHub, clique em **New repository** → dê um nome (ex: `noroeste-dashboard`) → **Create repository**.
3. Na página do repositório vazio, clique em **"uploading an existing file"**.
4. **Extraia o .zip** que você baixou no seu computador (duplo clique nele) e **arraste todos os arquivos e pastas** (package.json, index.html, vite.config.js, src/, README.md) para a área de upload do GitHub.
5. Clique em **Commit changes**.
6. Vá para **vercel.com** → **Sign up** (entre com sua conta do GitHub) → **Add New Project**.
7. Selecione o repositório que você acabou de criar → Vercel detecta automaticamente que é um projeto Vite → clique em **Deploy**.
8. Em ~1 minuto seu site estará no ar em um link tipo `noroeste-dashboard.vercel.app`.
9. Para usar um domínio próprio (ex: `scouting.noroeste.com.br`): dentro do projeto na Vercel, vá em **Settings → Domains**, adicione o domínio e siga as instruções de DNS que a Vercel mostra (geralmente só copiar um registro CNAME para onde seu domínio está registrado).

## Importante sobre os dados

Este projeto salva os atletas no **armazenamento local do navegador** (localStorage). Isso significa:
- Os dados persistem entre visitas, mas **ficam salvos no navegador de quem está usando**, não em um servidor central.
- Se o departamento inteiro precisa ver e editar a mesma base (múltiplas pessoas, múltiplos computadores), o próximo passo é conectar um banco de dados real (ex: Neon/Postgres) — posso preparar isso quando quiser.
