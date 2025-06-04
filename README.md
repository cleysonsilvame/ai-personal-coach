# AI Task Manager

Gerencie tarefas de forma inteligente com refinamento automático via IA! Este projeto permite que usuários descrevam tarefas de forma simples e contem com um chatbot para refinar, estruturar e detalhar cada tarefa, elevando o nível de clareza e organização para equipes de desenvolvimento.

## ✨ Funcionalidades Principais

- **Refinamento de Tarefas por Chatbot:** Usuários descrevem tarefas e recebem uma versão refinada, estruturada e pronta para desenvolvimento, com etapas, critérios de aceitação, testes sugeridos e sugestões de implementação.
- **Histórico de Conversas:** Todas as interações com o chatbot são salvas e podem ser revisitadas.
- **Gestão Completa de Tarefas:** Criação, edição, visualização, exclusão e detalhamento de tarefas.
- **Painel de Análise:** Visualização de métricas e estatísticas das tarefas.
- **Upload e Gerenciamento de Arquivos:** Permite anexar arquivos às tarefas.
- **Controle de Acesso:** Apenas usuários autenticados podem acessar e manipular tarefas.
- **Interface Moderna e Responsiva:** UI construída com React Router 7, Tailwind CSS e componentes Radix UI.

## 🧱 Tecnologias Utilizadas

- **Frontend:** React Router 7 (modo framework), Tailwind CSS, Radix UI, ShadcnUI
- **Backend:** Node.js, API da OpenAI (para refinamento de tarefas)
- **Banco de Dados:** SQLite
- **ORM:** Prisma ORM
- **Armazenamento Vetorial:** Compatível com SQLite
- **Outros:** Docker, Vite, TypeScript

## 📁 Estrutura de Pastas

- `app/` - Código principal da aplicação (componentes, features, rotas, serviços)
- `prisma/` - Schema, seeds e migrações do banco de dados
- `public/` - Arquivos estáticos
- `local-docs/` - Documentação interna e PRDs

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```fish
   git clone <url-do-repo>
   cd ai-task-manager
   ```

2. **Instale as dependências:**
   ```fish
   npm install
   ```

3. **Configure o banco de dados:**
   - Edite o arquivo `.env` com a variável `DATABASE_URL` (exemplo: `file:./dev.db`)
   - Rode as migrações:
     ```fish
     npx prisma migrate deploy
     ```

4. **(Opcional) Popule o banco com dados de exemplo:**
   ```fish
   npx prisma db seed
   ```

5. **Inicie o servidor de desenvolvimento:**
   ```fish
   npm run dev
   ```
   Acesse em [http://localhost:5173](http://localhost:5173)

## 🐳 Rodando com Docker

```fish
docker build -t ai-task-manager .
docker run -p 3000:3000 ai-task-manager
```

## 🛠️ Principais Comandos

- `npm run dev` — Inicia o servidor de desenvolvimento
- `npm run build` — Gera o build de produção
- `npm start` — Sobe o servidor em modo produção
- `npx prisma studio` — Interface visual para o banco de dados

## 🤖 Como Contribuir

1. Faça um fork do projeto
2. Crie uma branch: `git checkout -b minha-feature`
3. Faça suas alterações e commits
4. Envie um PR detalhando sua contribuição

## 📚 Documentação e PRD

- Veja o arquivo `local-docs/PRD_Refinamento_Tarefas.md` para detalhes do produto, objetivos, estrutura de dados e exemplos de uso.

---
