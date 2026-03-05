---
applyTo: "**/*.ts,**/*.tsx"
---

# 📌 PRD: Funcionalidade de Objetivos Pessoais com Refinamento por Chatbot

## Visão Geral

A funcionalidade de **Objetivos Pessoais** permite que os usuários enviem descrições simples de objetivos e metas pessoais que são automaticamente refinadas por um chatbot especializado em desenvolvimento pessoal e coaching. O objetivo é elevar a descrição ao nível de um coach experiente, fornecendo uma saída estruturada e acionável para o crescimento pessoal.

Esse recurso utiliza a **API da OpenAI** para refinar objetivos por meio de um modelo de linguagem (LLM) especializado em desenvolvimento pessoal.

---

## 🎯 Objetivos

- Permitir que os usuários enviem descrições básicas de objetivos pessoais.
- Refinar automaticamente as descrições usando um LLM especializado em coaching.
- Retornar os objetivos refinados em formato JSON estruturado.
- Armazenar sugestões de refinamento e histórico de conversas.
- Suportar melhorias iterativas com base no feedback do usuário.
- Permitir salvar objetivos finalizados.
- Converter objetivos em markdown, fragmentar o conteúdo e armazenar como embeddings vetoriais para consultas futuras por chatbot.

---

## 🧱 Stack Tecnológica

- **Frontend:** React Router 7 (Modo Framework)
- **Banco de Dados:** SQLite
- **ORM:** Prisma ORM
- **API LLM:** OpenAI (para refinamento de objetivos pessoais)
- **Armazenamento Vetorial:** Solução compatível com SQLite

---

## 📥 Entrada do Usuário

Usuários fornecem:

- Uma descrição simples do objetivo pessoal (ex: "quero aprender inglês fluente", "melhorar minha saúde física").

---

## 🤖 Processamento pelo Chatbot

O sistema envia a descrição do objetivo juntamente com o contexto de desenvolvimento pessoal para a **OpenAI**, instruindo o modelo a responder como um coach de vida experiente.

### Exemplo de Prompt:

```
Você é um coach de vida experiente especializado em desenvolvimento pessoal e estabelecimento de metas.
Por favor, refine o seguinte objetivo pessoal e retorne um objeto JSON com:
título, descrição, passos_de_acao, tempo_estimado, indicadores_de_progresso, habitos_sugeridos e estrategias_de_motivacao.

Objetivo original: "quero aprender inglês fluente"
```

---

## 📤 Saída JSON Esperada

```json
{
  "title": "Desenvolver Fluência em Inglês através de Prática Estruturada",
  "description": "Estabelecer um plano estruturado para alcançar fluência em inglês através de prática diária, imersão cultural e uso de ferramentas variadas de aprendizado.",
  "estimated_time": "12-18 meses",
  "action_steps": [
    "Avaliar nível atual através de teste de proficiência",
    "Estabelecer rotina diária de 30 minutos de estudo",
    "Inscrever-se em curso online estruturado",
    "Praticar conversação semanal com falantes nativos",
    "Consumir mídia em inglês (filmes, podcasts, livros)",
    "Fazer avaliações mensais de progresso"
  ],
  "progress_indicators": [
    "Conseguir manter conversação de 10 minutos sem pausas",
    "Compreender 80% de um filme sem legendas",
    "Ler um livro completo em inglês",
    "Obter pontuação específica em teste oficial (ex: TOEFL 100+)"
  ],
  "suggested_habits": [
    "Estudar inglês 30 minutos toda manhã",
    "Mudar idioma do celular para inglês",
    "Escrever diário pessoal em inglês",
    "Assistir notícias em inglês durante café da manhã"
  ],
  "motivation_strategies": "Definir marcos mensais com recompensas, encontrar parceiro de estudos, participar de grupos de conversação, visualizar objetivos futuros que requerem inglês (viagens, trabalho internacional)."
}
```

---

## 💬 Histórico de Conversas

- Todas as conversas com o chatbot são salvas na tabela **`chats`**.
- Cada mensagem individual é armazenada na tabela **`chat_messages`** com roles específicos (user, assistant, system).
- Usuários podem acessar e continuar conversas anteriores através do histórico.
- Cada conversa é registrada com data/hora e pode estar associada a uma tarefa específica.

---

## 📚 Estrutura de Armazenamento e Banco de Dados

### Tabelas

#### `chats`

| Campo      | Tipo     | Descrição                         |
| ---------- | -------- | --------------------------------- |
| id         | string   | UUID do chat                      |
| title      | string?  | Título opcional da conversa       |
| created_at | datetime | Data de criação                   |
| updated_at | datetime | Data da última modificação        |

#### `chat_messages`

| Campo         | Tipo     | Descrição                                      |
| ------------- | -------- | ---------------------------------------------- |
| id            | string   | UUID da mensagem                               |
| content       | string   | Conteúdo da mensagem                           |
| role          | enum     | Papel da mensagem (user, assistant, system)   |
| chat_id       | string   | Chave estrangeira para `chats`                 |
| created_at    | datetime | Data de criação                                |
| updated_at    | datetime | Data da última modificação                     |

#### `goals` (renomeado de `tasks`)

| Campo                     | Tipo     | Descrição                                    |
| ------------------------- | -------- | -------------------------------------------- |
| id                        | string   | UUID do objetivo                             |
| title                     | string   | Título refinado do objetivo                  |
| description               | string   | Descrição detalhada do objetivo              |
| action_steps              | string?  | Lista de passos de ação a serem executados  |
| estimated_time            | string   | Tempo estimado (ex: "3 meses")               |
| motivation_strategies     | string?  | Estratégias para manter motivação            |
| progress_indicators       | string?  | Indicadores para medir progresso             |
| suggested_habits          | string?  | Hábitos sugeridos para alcançar objetivo    |
| chat_message_id           | string?  | Chave estrangeira para `chat_messages`       |
| created_at                | datetime | Data de criação                              |
| updated_at                | datetime | Data da última modificação                   |

### Relacionamentos

- **Chat ↔ ChatMessage**: Um chat pode ter múltiplas mensagens (1:N)
- **ChatMessage ↔ Goal**: Uma mensagem pode estar associada a um objetivo (1:1)

### Enum: ChatMessageRole

- `user`: Mensagem enviada pelo usuário
- `assistant`: Resposta do chatbot/coach IA
- `system`: Mensagens de sistema ou configuração

#### `embeddings` (Planejado para Fase Vetorial)

| Campo      | Tipo     | Descrição                                   |
| ---------- | -------- | ------------------------------------------- |
| id         | string   | UUID do embedding                           |
| goal_id    | string   | Chave estrangeira para `goals`              |
| vector     | vector   | Representação vetorial para busca semântica |
| created_at | datetime | Data de criação do embedding                |

---

## 🧠 Funcionalidade Vetorial com IA (Futuro)

- Todos os objetivos finalizados serão armazenados como embeddings vetoriais.
- Um segundo chatbot poderá futuramente responder a perguntas como:
  - "Quais objetivos envolvem desenvolvimento de habilidades?"
  - "Liste objetivos relacionados à saúde e bem-estar."
  - "Mostre estratégias que funcionaram para objetivos similares."

---

## 🖼️ Interface do Usuário

- Interface de chatbot para envio e refinamento de objetivos pessoais.
- Exibição do JSON refinado de forma legível e inspiradora.
- Botão "Salvar Objetivo" para persistir a meta estruturada.
- Dashboard de acompanhamento de progresso.

---

## 📈 Métricas de Sucesso

- Percentual de objetivos refinados mais de uma vez.
- Tempo médio para definir um objetivo estruturado.
- Quantidade de objetivos com embeddings armazenados.
- Engajamento com sugestões e acompanhamento de progresso.
- Taxa de conclusão de objetivos estabelecidos.

---

## 📅 Roteiro Proposto

| Fase          | Entregas Principais                                          |
| ------------- | ------------------------------------------------------------ |
| MVP           | Entrada de objetivos, integração com OpenAI, JSON, persistência |
| Iterações     | Histórico de conversa, refinamentos, UI de coaching          |
| Fase Vetorial | Embeddings vetoriais, chatbot com busca de objetivos similares |

---

## 📝 Considerações Finais

Este recurso transforma significativamente como as pessoas definem e perseguem seus objetivos pessoais, permitindo que qualquer pessoa transforme ideias vagas em planos estruturados e acionáveis. Atua como um coach pessoal virtual, oferecendo orientação profissional para o desenvolvimento pessoal com apoio de IA especializada.

