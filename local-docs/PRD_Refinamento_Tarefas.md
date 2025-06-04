# 📌 PRD: Funcionalidade de Tarefas com Refinamento por Chatbot

## Visão Geral

A funcionalidade de **Tarefas** permite que os usuários enviem descrições simples de tarefas que são automaticamente refinadas por um chatbot com base na stack tecnológica do projeto. O objetivo é elevar a descrição ao nível de um gerente de produto experiente, fornecendo uma saída estruturada e acionável para as equipes de desenvolvimento.

Esse recurso utiliza a **API da OpenAI** para refinar descrições por meio de um modelo de linguagem (LLM).

---

## 🎯 Objetivos

- Permitir que os usuários enviem descrições básicas de tarefas.
- Refinar automaticamente as descrições usando um LLM.
- Retornar as tarefas refinadas em formato JSON estruturado.
- Armazenar sugestões de refinamento e histórico de conversas.
- Suportar melhorias iterativas com base no feedback do usuário.
- Permitir salvar tarefas finalizadas.
- Converter tarefas em markdown, fragmentar o conteúdo e armazenar como embeddings vetoriais para consultas futuras por chatbot.

---

## 🧱 Stack Tecnológica

- **Frontend:** React Router 7 (Modo Framework)
- **Banco de Dados:** SQLite
- **ORM:** Prisma ORM
- **API LLM:** OpenAI (para refinamento de tarefas)
- **Armazenamento Vetorial:** Solução compatível com SQLite

---

## 📥 Entrada do Usuário

Usuários fornecem:

- Uma descrição simples da tarefa (ex: "criar formulário de login com autenticação").

---

## 🤖 Processamento pelo Chatbot

O sistema envia a descrição da tarefa juntamente com o contexto da stack do projeto para a **OpenAI**, instruindo o modelo a responder como um gerente de produto experiente.

### Exemplo de Prompt:

```
Este projeto utiliza React Router 7 (modo framework), SQLite e Prisma ORM.
Por favor, refine a seguinte descrição de tarefa e retorne um objeto JSON com:
título, descrição, etapas, tempo_estimado, critérios_de_aceitação, testes_sugeridos e sugestão_de_implementação.

Descrição original: "criar formulário de login com autenticação"
```

---

## 📤 Saída JSON Esperada

```json
{
  "title": "Formulário de Login Seguro com Autenticação",
  "description": "Implementar um formulário de login moderno com validação de campos, autenticação baseada em sessão e feedback de erro em tempo real.",
  "estimated_time": "2 dias",
  "steps": [
    "Criar componente de formulário com React",
    "Adicionar validação de campos com biblioteca apropriada",
    "Conectar backend para autenticação de usuários",
    "Persistir sessões usando SQLite",
    "Testar fluxo completo de login e logout"
  ],
  "suggested_tests": [
    "it('deve renderizar o formulário corretamente')",
    "it('deve validar os campos de entrada')",
    "it('deve autenticar credenciais válidas')",
    "it('deve negar acesso com credenciais inválidas')"
  ],
  "acceptance_criteria": [
    "Formulário de login exibido corretamente com campos obrigatórios",
    "Entradas inválidas devem ser sinalizadas",
    "Usuários válidos podem fazer login e manter a sessão",
    "Usuários são redirecionados após login e logout"
  ],
  "implementation_suggestion": "Usar React Hook Form para validação, Prisma ORM para gestão de usuários e configurar rotas protegidas com React Router 7."
}
```

---

## 💬 Histórico de Conversas

- Todas as conversas com o chatbot serão salvas na tabela **`chats`**.
- Usuários poderão acessar e continuar conversas anteriores.
- Cada conversa será registrada com data/hora e associada ao usuário e à tarefa correspondente.

---

## 📚 Estrutura de Armazenamento e Banco de Dados

### Tabelas

#### `tasks`

| Campo                     | Tipo     | Descrição                                    |
| ------------------------- | -------- | -------------------------------------------- |
| id                        | string   | UUID da tarefa                               |
| title                     | string   | Título refinado da tarefa                    |
| description               | string   | Descrição detalhada da tarefa                |
| steps                     | string   | Lista de etapas a serem executadas           |
| estimated_time            | string   | Exemplo: "2 dias"                            |
| implementation_suggestion | string   | Abordagem e ferramentas sugeridas            |
| acceptance_criteria       | string   | Critérios para considerar a tarefa concluída |
| suggested_tests           | string   | Testes sugeridos                             |
| content                   | string   | Conteúdo completo em formato markdown        |
| chat_history              | json     | Representação JSON do histórico de conversa  |
| created_at                | datetime | Data de criação                              |
| updated_at                | datetime | Data da última modificação                   |

#### `embeddings`

| Campo      | Tipo     | Descrição                                   |
| ---------- | -------- | ------------------------------------------- |
| id         | string   | UUID do embedding                           |
| task_id    | string   | Chave estrangeira para `tasks`              |
| vector     | vector   | Representação vetorial para busca semântica |
| created_at | datetime | Data de criação do embedding                |

---

## 🧠 Funcionalidade Vetorial com IA (Futuro)

- Todas as tarefas finalizadas serão armazenadas como embeddings vetoriais.
- Um segundo chatbot poderá futuramente responder a perguntas como:
  - "Quais tarefas envolvem autenticação?"
  - "Liste tarefas relacionadas à validação de formulários."

---

## 🖼️ Interface do Usuário

- Interface de chatbot para envio e refinamento de tarefas.
- Exibição do JSON refinado de forma legível.
- Botão "Salvar Tarefa" para persistir a sugestão.

---

## 📈 Métricas de Sucesso

- Percentual de tarefas refinadas mais de uma vez.
- Tempo médio para finalizar uma tarefa.
- Quantidade de tarefas armazenadas com embeddings.
- Engajamento com sugestões e histórico de conversas.

---

## 📅 Roteiro Proposto

| Fase          | Entregas Principais                                          |
| ------------- | ------------------------------------------------------------ |
| MVP           | Entrada da tarefa, integração com OpenAI, JSON, persistência |
| Iterações     | Histórico de conversa, refinamentos, UI aprimada             |
| Fase Vetorial | Embeddings vetoriais, chatbot com busca semântica            |

---

## 📝 Considerações Finais

Este recurso melhora significativamente a clareza das tarefas e o alinhamento da equipe, permitindo que até usuários não técnicos definam tarefas prontas para desenvolvimento com mínima fricção. Atua como uma ponte entre a ideia e a implementação, com apoio de IA para refinamento.
