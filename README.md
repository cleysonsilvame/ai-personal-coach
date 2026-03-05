<h1 align="center">
AI Personal Goals Coach
</h1>

<p align="center">
  <a href="#-tecnologias">Tecnologias</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-projeto">Projeto</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#-layout">Layout</a>&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
  <a href="#memo-licenca">Licença</a>
</p>

<p align="center">
  <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/cleysonsilvame/desafio-03-github-blog-react-2023.svg">
  <img alt="Repository issues" src="https://img.shields.io/github/issues/cleysonsilvame/desafio-03-github-blog-react-2023.svg">
  <img alt="GitHub" src="https://img.shields.io/github/license/cleysonsilvame/desafio-03-github-blog-react-2023.svg">
</p>

<p float="center" align="center">
  <img alt="App AI Personal Goals Coach" src=".github/iframe-notebook.png" width="100%" />
</p>

## 🚀 Tecnologias

Este projeto foi desenvolvido com as seguintes tecnologias:

- React Router 7
- TypeScript
- Vite
- Tailwind CSS
- ShadcnUI
- Drizzle ORM
- SQLite
- OpenAI API

## 💻 Projeto

O AI Personal Goals Coach é uma aplicação que transforma objetivos pessoais em planos estruturados com refinamento automático via IA. O objetivo é permitir que usuários descrevam objetivos pessoais de forma simples e contem com um chatbot especializado em coaching para refinar, estruturar e detalhar cada meta, elevando o nível de clareza e organização para o desenvolvimento pessoal.

### ✨ Funcionalidades Principais

- **Refinamento de Objetivos por Coach IA:** Usuários descrevem objetivos pessoais e recebem uma versão refinada, estruturada e pronta para execução
- **Histórico de Conversas:** Todas as interações com o chatbot coach são salvas e podem ser revisitadas
- **Gestão Completa de Objetivos:** Criação, edição, visualização, exclusão e detalhamento de metas pessoais
- **Painel de Análise:** Visualização de métricas e estatísticas dos objetivos e progresso
- **Acompanhamento de Progresso:** Ferramentas para monitorar o avanço em direção aos objetivos
- **Coach Pessoal Virtual:** IA especializada em desenvolvimento pessoal e estabelecimento de metas

## 🔖 Layout

O layout foi desenvolvido com componentes modernos usando ShadcnUI e Tailwind CSS, proporcionando uma interface responsiva e intuitiva para gerenciamento de objetivos pessoais.

## 📁 Estrutura de Pastas

- `app/` - Código principal da aplicação (componentes, features, rotas, serviços)
- `drizzle/` - Schema, seeds e migrações do banco de dados
- `public/` - Arquivos estáticos
- `.github/instructions/` - Documentação interna e PRDs

## 🚀 Como Rodar Localmente

1. **Clone o repositório:**
   ```bash
   git clone <url-do-repo>
   cd ai-personal-goals-coach
   ```
2. **Instale as dependências:**
   ```bash
   npm install
   ```
3. **Configure o banco de dados:**
   - Edite o arquivo `.env` com a variável `DATABASE_URL` (exemplo: `file:./dev.db`)
   - Rode as migrações:
     ```bash
     npx drizzle-kit migrate
     ```
4. **(Opcional) Popule o banco com dados de exemplo:**
   ```bash
   npm run db:seed
   ```
5. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse em [http://localhost:5173](http://localhost:5173)

## 🐳 Rodando com Docker

```bash
docker build -t ai-personal-goals-coach .
docker run -p 3000:3000 ai-personal-goals-coach
```

## 🛠️ Principais Comandos

- `npm run dev` — Inicia o servidor de desenvolvimento
- `npm run build` — Gera o build de produção
- `npm start` — Sobe o servidor em modo produção
- `npx drizzle-kit studio` — Interface visual para o banco de dados

## ⚙️ Configuração Avançada

### Seleção Automática de Modelos

A aplicação seleciona automaticamente os melhores modelos gratuitos do OpenRouter para cada caso de uso:

- **Chat Service**: Modelo free mais utilizado na última semana para refinar objetivos pessoais com coaching especializado
- **CopilotKit Service**: Modelo free mais utilizado na última semana com suporte a tools para buscas vetoriais e consultas sobre objetivos

#### Como Funciona

1. **Web Scraping**: Na primeira requisição, a aplicação faz scraping das páginas do OpenRouter com modelos ordenados por popularidade semanal:
   - Chat: `https://openrouter.ai/models?fmt=table&max_price=0&order=top-weekly&supported_parameters=response_format`
   - Copilot: `https://openrouter.ai/models?fmt=table&max_price=0&order=top-weekly&supported_parameters=tools`

2. **Health Check**: Antes de selecionar um modelo, a aplicação faz um teste rápido para verificar se ele está disponível:
   ```bash
   curl -X POST https://openrouter.ai/api/v1/chat/completions \
     -H "Authorization: Bearer $API_KEY" \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"system","content":"health check"}],"model":"vendor/model","max_tokens":1}'
   ```

3. **Blacklist Inteligente**: Modelos que falham no health check são colocados em blacklist por 8 horas

4. **Cache Singleton**: O modelo selecionado fica em cache e não é buscado novamente até falhar

5. **Fallback Automático**: Se um modelo ficar indisponível durante o uso:
   - Adiciona modelo atual à blacklist (8 horas)
   - Busca próximo modelo da lista que não esteja na blacklist
   - Faz health check do novo modelo
   - Retenta a operação

#### Comportamento de Fallback

**Exemplo de logs:**
```bash
# Primeira inicialização
Fetching chat models from OpenRouter...
Found 15 models from https://openrouter.ai/models?...
Testing chat model: deepseek/deepseek-chat-v3-0324:free
✓ Selected chat model: deepseek/deepseek-chat-v3-0324:free

# Quando modelo fica indisponível
Chat model deepseek/deepseek-chat-v3-0324:free is unavailable, fetching new model...
Resetting chat model cache: deepseek/deepseek-chat-v3-0324:free
Added deepseek/deepseek-chat-v3-0324:free to blacklist until 2025-12-15T14:30:00.000Z
Fetching chat models from OpenRouter...
Skipping blacklisted model: deepseek/deepseek-chat-v3-0324:free
Testing chat model: google/gemini-flash-1.5:free
✓ Selected chat model: google/gemini-flash-1.5:free
Retrying with new chat model: google/gemini-flash-1.5:free
```

#### Configuração

Apenas configure a API key do OpenRouter no arquivo `.env`:

```bash
OPEN_ROUTER_API_KEY="sua-chave-api"
OPEN_ROUTER_BASE_URL="https://openrouter.ai/api/v1"

# Modelo padrão (usado apenas como fallback se todos os modelos falharem)
OPEN_ROUTER_MODEL="deepseek/deepseek-chat-v3-0324:free"
```

#### Vantagens

- ✅ **Sempre gratuito**: Usa apenas modelos free do OpenRouter
- ✅ **Sempre atualizado**: Seleciona automaticamente os modelos mais populares da semana
- ✅ **Otimizado**: CopilotKit usa modelo com suporte a tools
- ✅ **Validação automática**: Health check garante que modelo está disponível antes de usar
- ✅ **Resiliente**: Blacklist evita tentar modelos indisponíveis repetidamente
- ✅ **Fallback inteligente**: Troca automaticamente quando modelo fica indisponível
- ✅ **Zero configuração**: Funciona automaticamente sem precisar configurar modelos específicos

## 🎯 Exemplos de Uso

**Entrada do usuário:**
"Quero aprender inglês fluente"

**Saída refinada pelo Coach IA:**
- **Título:** "Desenvolver Fluência em Inglês através de Prática Estruturada"
- **Passos de Ação:** Avaliação de nível, rotina diária, curso estruturado...
- **Indicadores de Progresso:** Conversação de 10 min, compreender filme sem legendas...
- **Hábitos Sugeridos:** Estudar 30 min toda manhã, celular em inglês...
- **Estratégias de Motivação:** Marcos mensais, parceiro de estudos, grupos de conversação...

## 📚 Documentação e PRD

- Veja o arquivo `.github/instructions/domain.instructions.md` para detalhes do produto, objetivos, estrutura de dados e exemplos de uso do sistema de refinamento de objetivos pessoais.

### Diagrama ERD do Banco de Dados

O diagrama abaixo representa as principais tabelas e relacionamentos do banco de dados, conforme definido em `drizzle/schema.ts`.

```mermaid
erDiagram
  chats {
    id text PK
    title text
    created_at integer
    updated_at integer
  }
  chat_messages {
    id text PK
    content json
    role text
    created_at integer
    updated_at integer
    chat_id text FK
  }
  goals {
    id text PK
    title text
    description text
    estimated_time text
    action_steps json
    progress_indicators json
    suggested_habits json
    motivation_strategies text
    created_at integer
    updated_at integer
    chat_message_id text FK
  }
  goal_embeddings {
    id text PK
    embedding F31_BLOB(768)
    goal_id text FK
    created_at integer
    updated_at integer
  }
  chats ||--o{ chat_messages : has
  chat_messages |o--|| goals : generates
  goals ||--o{ goal_embeddings : has
```


## :memo: Licença

Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

### Autor

---

<p align="center">
  <a href="https://github.com/cleysonsilvame/" title="Cleyson Silva">
    <img style="border-radius: 50%;" src="https://raw.githubusercontent.com/cleysonsilvame/cleysonsilvame/master/.github/cleyson-rounded.png" width="100px;" alt="Cleyson Silva" />
    <br />
    <sub><b>Cleyson Silva</b></sub> 🚀
  </a>
  <br />
  <a href="https://www.linkedin.com/in/cleyson-silva-639b01188/">
    <img src="https://img.shields.io/badge/-Cleyson_Silva-blue?style=flat-square&logo=Linkedin&logoColor=white" alt="Linkedin Badge" />
  </a>
  <a href="mailto:cleysonsilva.me@gmail.com">
    <img src="https://img.shields.io/badge/-cleysonsilva.me@gmail.com-c14438?style=flat-square&logo=Gmail&logoColor=white" alt="Gmail Badge" />
  </a>
</p>

---

# A fazer (TODO:)

- [ ] Verificar a melhor forma de fazer a validação de dados sem ficar fazer o mapper toda hora. Não sei se é melhor ficar dentro do domain ou infra. No caso usando zod.
- [ ] Melhorar a estrutura de pastas para representar o que é domain, infra e core.
- [ ] Adicionar testes?
