---
applyTo: "**/*.ts,**/*.tsx"
---

# 🏗️ Arquitetura em Camadas: Domínio vs Infra

Este documento descreve a separação entre a camada de **Domínio** (regras de negócio) e a camada de **Infraestrutura** (implementações técnicas).

---

## 📊 Estrutura de Camadas

```
app/
├── features/              ← DOMÍNIO (lógica de negócio)
│   ├── goals/
│   ├── chats/
│   └── core/
├── database/             ← INFRAESTRUTURA (persistência)
│   └── drizzle/
├── services/             ← INFRAESTRUTURA (implementações)
├── lib/                  ← INFRAESTRUTURA (utilitários)
└── routes/               ← APRESENTAÇÃO (UI)
```

---

## 🎯 Camada de Domínio (`~/features`)

### Responsabilidades
- ✅ Definir regras de negócio e lógica
- ✅ Abstrair interfaces (contratos)
- ✅ Independente de frameworks e tecnologias
- ✅ Fácil de testar e reutilizar

### Estrutura
```
features/
├── [feature]/
│   ├── aggregates/          # Agregações e entidades
│   ├── entities/            # Objetos de valor e entidades
│   ├── repositories/        # Interfaces de repositório
│   ├── services/            # Interfaces de serviço
│   ├── use-cases/           # Casos de uso
│   └── types.ts             # Tipos do domínio
└── core/
    └── services/            # Serviços abstratos
```

### Exemplos de Domínio

#### 1. Interface de Repositório
```typescript
// features/goals/repositories/goal.ts
export interface GoalRepository {
  findById(id: string): Promise<Goal | null>;
  save(goal: Goal): Promise<void>;
  findAll(): Promise<Goal[]>;
}
```

#### 2. Interface de Serviço
```typescript
// features/goals/services/cache.ts
export interface GoalCacheService {
  getSimilarGoals(goalId: string): Promise<SimilarGoal[] | null>;
  setSimilarGoals(goalId: string, value: SimilarGoal[], ttl?: number): Promise<void>;
  invalidateSimilarGoals(goalId: string): Promise<void>;
}
```

#### 3. Use Case
```typescript
// features/goals/use-cases/search-goals-by-similarity.server.ts
export class SearchGoalsBySimilarityUseCase {
  constructor(
    @inject(GoalRepository) private goalRepository: GoalRepository,
    @inject(GoalCacheService) private cacheService: GoalCacheService,
    @inject(EmbeddingService) private embeddingService: EmbeddingService,
  ) {}

  async execute(goalId: string): Promise<SimilarGoal[]> {
    // Lógica de negócio pura
  }
}
```

---

## ⚙️ Camada de Infraestrutura (`~/services`, `~/database`, `~/lib`)

### Responsabilidades
- ✅ Implementar interfaces do domínio
- ✅ Lidar com tecnologias específicas (BD, APIs, cache)
- ✅ Gerenciar comunicação externa
- ✅ Cuidar de persistência e side effects

### Estrutura
```
services/
├── cache.server.ts                    # Implementação Redis
├── chat.server.ts                     # Implementação OpenAI
├── model-blacklist.server.ts          # Implementação Redis para blacklist
├── embedding.server.ts                # Implementação Gemini
├── notification.server.ts             # Implementação de notificações
└── ...

database/drizzle/
├── base.repository.ts                 # Base para repositórios
├── goal.repository.ts                 # Implementação com Drizzle
└── ...

lib/
├── container.ts                       # Injeção de dependência
├── config.ts                          # Configuração
└── ...
```

### Exemplos de Infraestrutura

#### 1. Implementação de Cache (Infra)
```typescript
// services/cache.server.ts
@injectable()
export class RedisGoalCacheService implements GoalCacheService {
  constructor(@inject(RedisClient) private redis: RedisClient) {}

  async setSimilarGoals(goalId: string, value: SimilarGoal[]): Promise<void> {
    // Implementação específica do Redis
    await this.redis.set(...);
  }
}
```

#### 2. Implementação de Blacklist (Infra)
```typescript
// services/model-blacklist.server.ts
@injectable()
export class RedisModelBlacklistService {
  constructor(@inject(RedisClient) private redis: RedisClient) {}

  async isBlacklisted(model: string): Promise<boolean> {
    return this.redis.exists(...);
  }
}
```

#### 3. Implementação de Repositório (Infra)
```typescript
// database/drizzle/goal.repository.ts
@injectable()
export class DrizzleGoalRepository extends BaseRepository implements GoalRepository {
  async findById(id: string): Promise<Goal | null> {
    // Implementação específica do Drizzle/SQLite
  }
}
```

---

## 🔄 Fluxo de Injeção de Dependência

```
Domínio (Use Case)
    ↓ (depende de)
Domínio (Interface)
    ↓ (implementado por)
Infraestrutura (Classe concreta)
    ↓ (registrada em)
Container (lib/container.ts)
```

### Exemplo Prático

```typescript
// 1. Use Case (Domínio) depende de interfaces
export class SearchGoalsBySimilarityUseCase {
  constructor(
    @inject(GoalRepository) private repo: GoalRepository,
    @inject(GoalCacheService) private cache: GoalCacheService,
  ) {}
}

// 2. Container (Infra) conecta interfaces a implementações
container.bind(GoalRepository).to(DrizzleGoalRepository);
container.bind(GoalCacheService).to(RedisGoalCacheService);

// 3. Em runtime, as implementações são injetadas
```

---

## ✅ Checklist de Classificação

### É Domínio se:
- [ ] Define regras de negócio
- [ ] É uma interface/contrato
- [ ] Está em `~/features`
- [ ] Não depende de framework específico
- [ ] É fácil de testar isoladamente
- [ ] Poderia ser reutilizado em outro projeto

### É Infraestrutura se:
- [ ] Implementa uma interface do domínio
- [ ] Usa tecnologia específica (Redis, BD, API)
- [ ] Está em `~/services`, `~/database`, `~/lib`
- [ ] Lida com side effects
- [ ] Gerencia recursos externos
- [ ] Seria diferente se mudássemos a tecnologia

---

## 📋 Exemplos Classificados

### Domínio ✅
```
~/features/goals/repositories/goal.ts          (Interface)
~/features/goals/services/cache.ts             (Interface)
~/features/goals/services/embedding.ts         (Interface)
~/features/goals/use-cases/...ts               (Lógica de negócio)
~/features/goals/entities/similar-goal.ts      (Entidade)
~/features/core/services/unit-of-work.ts       (Interface)
```

### Infraestrutura ⚙️
```
~/services/cache.server.ts                     (Redis)
~/services/model-blacklist.server.ts           (Redis)
~/services/embedding.server.ts                 (Gemini API)
~/services/chat.server.ts                      (OpenAI)
~/database/drizzle/goal.repository.ts          (Drizzle/SQLite)
~/lib/redis-client.ts                          (Cliente Redis)
~/lib/container.ts                             (DI Container)
~/lib/config.ts                                (Configuração)
```

---

## 🎓 Princípios

### Dependency Inversion (DIP)
- Código de alto nível (use cases) **não depende** de código de baixo nível (BD, APIs)
- Ambos dependem de abstrações (interfaces)

### Single Responsibility (SRP)
- Domínio: responsável por regras de negócio
- Infra: responsável por como implementar essas regras

### Interface Segregation (ISP)
- Cada interface define um contrato específico
- Implementações podem ser trocadas facilmente

---

## 🚀 Benefícios dessa Arquitetura

✅ **Testabilidade**: Use cases podem ser testados sem infraestrutura real
✅ **Flexibilidade**: Trocar Redis por Memcached sem afetar o domínio
✅ **Clareza**: Claro o que é regra de negócio vs técnica
✅ **Reutilização**: Domínio pode ser usado em diferentes contextos
✅ **Manutenção**: Mudanças de tecnologia não afetam a lógica

---

## ⚠️ Erros Comuns a Evitar

### ❌ Errado
```typescript
// Domínio depende de Infra (acoplamento)
export class SearchGoalsUseCase {
  constructor(private redis: RedisClient) {}
}
```

### ✅ Correto
```typescript
// Domínio depende de abstração (desacoplado)
export class SearchGoalsUseCase {
  constructor(@inject(GoalCacheService) private cache: GoalCacheService) {}
}
```

### ❌ Errado
```typescript
// Lógica técnica no use case
export class CreateGoalUseCase {
  async execute(data) {
    const json = JSON.stringify(data);  // ← Técnica
    await redis.set(key, json);         // ← Técnica
  }
}
```

### ✅ Correto
```typescript
// Lógica de negócio pura no use case
export class CreateGoalUseCase {
  async execute(data: GoalData) {
    const goal = new Goal(data);        // ← Negócio
    await this.repository.save(goal);   // ← Abstração
  }
}
```
