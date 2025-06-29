# AI Personal Goals Coach

Transforme seus objetivos pessoais em planos estruturados com refinamento automático via IA! Este projeto permite que usuários descrevam objetivos pessoais de forma simples e contem com um chatbot especializado em coaching para refinar, estruturar e detalhar cada meta, elevando o nível de clareza e organização para o desenvolvimento pessoal.

## ✨ Funcionalidades Principais

- **Refinamento de Objetivos por Coach IA:** Usuários descrevem objetivos pessoais e recebem uma versão refinada, estruturada e pronta para execução, com passos de ação, indicadores de progresso, hábitos sugeridos e estratégias de motivação.
- **Histórico de Conversas:** Todas as interações com o chatbot coach são salvas e podem ser revisitadas.
- **Gestão Completa de Objetivos:** Criação, edição, visualização, exclusão e detalhamento de metas pessoais.
- **Painel de Análise:** Visualização de métricas e estatísticas dos objetivos e progresso.
- **Acompanhamento de Progresso:** Ferramentas para monitorar o avanço em direção aos objetivos.
- **Coach Pessoal Virtual:** IA especializada em desenvolvimento pessoal e estabelecimento de metas.
- **Interface Moderna e Responsiva:** UI construída com React Router 7, Tailwind CSS e componentes Radix UI.

## 🧱 Tecnologias Utilizadas

- **Frontend:** React Router 7 (modo framework), Tailwind CSS, Radix UI, ShadcnUI
- **Backend:** Node.js, API da OpenAI (para refinamento de objetivos pessoais)
- **Banco de Dados:** SQLite
- **ORM:** Prisma ORM
- **Armazenamento Vetorial:** Compatível com SQLite (planejado)
- **Outros:** Docker, Vite, TypeScript

## 📁 Estrutura de Pastas

- `app/` - Código principal da aplicação (componentes, features, rotas, serviços)
- `prisma/` - Schema, seeds e migrações do banco de dados
- `public/` - Arquivos estáticos
- `.github/instructions/` - Documentação interna e PRDs

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```fish
   git clone <url-do-repo>
   cd ai-personal-goals-coach
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
docker build -t ai-personal-goals-coach .
docker run -p 3000:3000 ai-personal-goals-coach
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

- Veja o arquivo `.github/instructions/domain.instructions.md` para detalhes do produto, objetivos, estrutura de dados e exemplos de uso do sistema de refinamento de objetivos pessoais.

## 🎯 Exemplos de Uso

**Entrada do usuário:**
"Quero aprender inglês fluente"

**Saída refinada pelo Coach IA:**
- **Título:** "Desenvolver Fluência em Inglês através de Prática Estruturada"
- **Passos de Ação:** Avaliação de nível, rotina diária, curso estruturado...
- **Indicadores de Progresso:** Conversação de 10 min, compreender filme sem legendas...
- **Hábitos Sugeridos:** Estudar 30 min toda manhã, celular em inglês...
- **Estratégias de Motivação:** Marcos mensais, parceiro de estudos, grupos de conversação...

---
# A fazer (TODO:)

- [ ] Verificar a melhor forma de fazer a validação de dados sem ficar fazer o mapper toda hora. Não sei se é melhor ficar dentro do domain ou infra. No caso usando zod.
- [ ] Melhorar a estrutura de pastas para representar o que é domain, infra e core.
- [ ] No database, fixar uma pasta para o prisma e implementar o drizzle.
- [ ] Adicionar testes?
