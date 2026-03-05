---
applyTo: "**/*.ts,**/*.tsx"
---

# Arquitetura DDD - Domain-Driven Design

## Padrão Arquitetural

Este projeto implementa **Domain-Driven Design (DDD)**, separando claramente domínio e implementação.

## Regras Críticas

### ✅ SEMPRE FAZER:

1. **Use Cases sempre retornam Entities**
   - Nunca retorne dados do banco diretamente
   - Sempre mapeie para entities do domínio

2. **Repositories sempre retornam Entities**
   - Use mappers para converter dados do banco para entities
   - Mantenha a abstração do repositório

3. **Estrutura de pastas obrigatória:**
   ```
   app/features/[feature]/
   ├── entities/          # Classes de domínio
   ├── repositories/      # Interfaces (abstrações)
   ├── use-cases/         # Lógica de negócio
   ├── mappers/          # Conversão entre camadas
   └── types.ts          # Tipos específicos
   ```

4. **Injeção de dependência**
   - Use `@injectable()` em use cases
   - Use `@inject()` para dependencies
   - Configure no `app/lib/container.ts`

### ❌ NUNCA FAZER:

1. Use cases retornando dados do Prisma diretamente
2. Entities dependendo de infraestrutura
3. Lógica de negócio nos repositories
4. Implementações concretas no domínio

---

## 🏗️ Estrutura Arquitetural Completa

### Camadas da Arquitetura

```
┌─────────────────────────────────────────────────┐
│                   WEB LAYER                     │
│              (Routes, Controllers)              │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│               USE CASES LAYER                   │
│            (Business Logic)                     │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│               DOMAIN LAYER                      │
│            (Entities, Types)                    │
└─────────────────┬───────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────┐
│            INFRASTRUCTURE LAYER                 │
│          (Database, External APIs)              │
└─────────────────────────────────────────────────┘
```

### Estrutura de Pastas Detalhada

```
app/features/[feature]/
├── entities/           # Entidades do domínio
├── repositories/       # Interfaces dos repositórios (abstrações)
├── use-cases/          # Casos de uso (regras de negócio)
├── mappers/            # Mapeamento entre camadas
├── services/           # Serviços de domínio
└── types.ts            # Tipos específicos da feature

app/database/           # Implementações concretas dos repositórios
app/lib/container.ts    # Configuração de injeção de dependência
```

## 🔧 Componentes da Arquitetura

### 1. **Entities (Entidades do Domínio)**

As entidades representam os conceitos centrais do negócio e encapsulam as regras de domínio.

**Exemplo:** `app/features/goals/entities/goal.ts`
```typescript
export class Goal {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  // ... outros campos

  constructor(props: GoalProps) {
    this.id = props.id;
    this.title = props.title;
    // ... inicialização
  }

  static create(props: Omit<GoalProps, "id">) {
    return new Goal({
      ...props,
      id: crypto.randomUUID(),
    });
  }
}
```

**Características:**
- Imutáveis (readonly properties)
- Contêm regras de negócio
- Factory methods para criação (`create`)
- Não dependem de infraestrutura

### 2. **Repository Interfaces (Contratos)**

Abstrações que definem como os dados devem ser acessados, sem especificar a implementação.

**Exemplo:** `app/features/goals/repositories/goal.ts`
```typescript
export abstract class GoalRepository {
  abstract createGoal(goal: Goal): Promise<Goal>;
  abstract findById(id: string): Promise<Goal | null>;
  abstract findAll(): Promise<Goal[]>;
  abstract deleteById(id: string): Promise<void>;
  abstract updateById(id: string, data: UpdateData): Promise<Goal>;
}
```

**Características:**
- Sempre trabalham com **Entities**
- Definem contratos, não implementações
- Localizada na camada de domínio

### 3. **Use Cases (Casos de Uso)**

Encapsulam a lógica de negócio e orquestram as operações entre entities e repositories.

**Exemplo:** `app/features/goals/use-cases/create-goal-from-message.server.ts`
```typescript
@injectable()
export class CreateGoalFromMessageUseCase {
  constructor(
    @inject(GoalRepository)
    private readonly goalRepository: GoalRepository,
    @inject(ChatMessageRepository)
    private readonly chatMessageRepository: ChatMessageRepository,
  ) {}

  async execute({ messageId }: CreateGoalFromMessageInput): Promise<Goal> {
    const message = await this.chatMessageRepository.findById(messageId);

    if (!message?.content?.data) {
      throw new Error("Conteúdo da mensagem não encontrado");
    }

    const goal = Goal.create({
      title: message.content.data.title,
      description: message.content.data.description,
      // ... outros campos
    });

    return await this.goalRepository.createGoal(goal);
  }
}
```

**Características:**
- Sempre retornam **Entities**
- Contêm a lógica de negócio
- Dependem apenas de abstrações (interfaces)
- Usam injeção de dependência

### 4. **Repository Implementations (Implementações Concretas)**

Implementações específicas dos contratos de repository, isoladas da lógica de negócio.

**Exemplo:** `app/database/drizzle/goal.repository.ts`
```typescript
export class DrizzleGoalRepository extends GoalRepository {
  async createGoal(goal: Goal): Promise<Goal> {
    const goalData = await this.db.insert(goalsTable).values(
      GoalsMapper.toPersistence(goal)
    ).returning();

    return GoalsMapper.toDomain(goalData[0]);
  }
}
```

**Características:**
- Implementam as interfaces de repository
- Fazem mapeamento entre entities e dados persistidos
- Sempre retornam **Entities** do domínio
- Isoladas na camada de infraestrutura

### 5. **Mappers (Mapeadores)**

Responsáveis pela conversão entre diferentes representações dos dados.

**Exemplo:** `app/features/goals/mappers/goals.ts`
```typescript
export const GoalsMapper = {
  toDomain(goal: typeof goalsTable.$inferSelect): Goal {
    return new Goal({
      id: goal.id,
      title: goal.title,
      // ... mapeamento completo
    });
  },

  toPersistence(goal: Goal): typeof goalsTable.$inferInsert {
    return {
      id: goal.id,
      title: goal.title,
      // ... mapeamento completo
    };
  }
};
```

### 6. **Dependency Injection Container**

Configura as dependências e resolve as abstrações.

**Exemplo:** `app/lib/container.ts`
```typescript
export const container = new Container({ autobind: true });

container.bind(GoalRepository).to(DrizzleGoalRepository).inTransientScope();
container.bind(ChatService).to(OpenRouterChatService).inSingletonScope();
```

## 🚀 Fluxo de Execução

1. **Route** recebe a requisição
2. **Route** instancia o **Use Case** via container
3. **Use Case** executa a lógica de negócio
4. **Use Case** interage com **Repositories** (abstrações)
5. **Repository Implementation** acessa dados
6. **Mappers** convertem dados para **Entities**
7. **Use Case** retorna **Entity**
8. **Route** pode mapear **Entity** para resposta HTTP

## ✅ Benefícios da Arquitetura

### 1. **Testabilidade**
- Use cases podem ser testados isoladamente
- Repositories podem ser mockados facilmente
- Entities contêm lógica pura

### 2. **Flexibilidade**
- Implementações podem ser trocadas sem afetar o domínio
- Facilita migração de banco de dados
- Permite diferentes estratégias de persistência

### 3. **Manutenibilidade**
- Separação clara de responsabilidades
- Código organizado por contextos de negócio
- Baixo acoplamento entre camadas

### 4. **Escalabilidade**
- Novas features seguem o mesmo padrão
- Facilita trabalho em equipe
- Reduz complexidade cognitiva

## 📋 Exemplo Prático: Criando uma Nova Feature

### 1. Criar a Entity
```typescript
// app/features/tasks/entities/task.ts
export class Task {
  constructor(private props: TaskProps) {}

  static create(props: Omit<TaskProps, "id">) {
    return new Task({ ...props, id: crypto.randomUUID() });
  }
}
```

### 2. Definir o Repository Interface
```typescript
// app/features/tasks/repositories/task.ts
export abstract class TaskRepository {
  abstract create(task: Task): Promise<Task>;
  abstract findById(id: string): Promise<Task | null>;
}
```

### 3. Implementar o Repository
```typescript
// app/database/drizzle/task.repository.ts
export class DrizzleTaskRepository extends TaskRepository {
  async create(task: Task): Promise<Task> {
    const data = await this.db.insert(tasksTable)
      .values(TasksMapper.toPersistence(task))
      .returning();
    return TasksMapper.toDomain(data[0]);
  }
}
```

### 4. Criar Use Case
```typescript
// app/features/tasks/use-cases/create-task.server.ts
@injectable()
export class CreateTaskUseCase {
  constructor(
    @inject(TaskRepository)
    private taskRepository: TaskRepository
  ) {}

  async execute(input: CreateTaskInput): Promise<Task> {
    const task = Task.create(input);
    return await this.taskRepository.create(task);
  }
}
```

### 5. Configurar DI
```typescript
// app/lib/container.ts
container.bind(TaskRepository).to(DrizzleTaskRepository);
```

## 🔄 Status da Migração

Este projeto está em processo de migração para este padrão. Alguns use cases ainda não seguem completamente essas regras e serão refatorados gradualmente.

### Status Atual:
- ✅ Goal domain - Seguindo padrão
- ⚠️ Outros domains - Em refatoração
