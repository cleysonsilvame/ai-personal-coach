---
applyTo: "**/*.ts,**/*.tsx,**/*.spec.ts"
---

# 🧪 Estratégia de Testes

Este projeto utiliza a mesma estratégia de testes do projeto tiny-blockchain, com três camadas:

## 1. Testes Unitários (Vitest)

- **Localização:** Co-localizados com os arquivos de origem (`.spec.ts` no mesmo diretório)
- **Escopo:** Entidades, Mappers e Use Cases testados isoladamente
- **Mocking:** Use `vi.fn()` para mockar repositórios e serviços externos
- **Comando:** `npm test` ou `npx vitest run`

**Estrutura:**
```
app/features/[feature]/
├── entities/goal.spec.ts           # Testa entidades de domínio
├── mappers/goals.spec.ts           # Testa conversão entre camadas
├── use-cases/create-goal.spec.ts   # Testa casos de uso com mocks
└── ...
```

**Exemplo de teste de use case:**
```typescript
import { describe, expect, it, vi } from "vitest";
import { GetGoalsUseCase } from "./get-goals.server";
import type { GoalRepository } from "../repositories/goal";

const makeMockGoalRepository = (): GoalRepository => ({
  setTransaction: vi.fn().mockReturnThis(),
  createGoal: vi.fn(),
  findById: vi.fn(),
  findAll: vi.fn(),
  deleteById: vi.fn(),
  updateById: vi.fn(),
});

describe("GetGoalsUseCase", () => {
  it("should return all goals from repository", async () => {
    const goalRepository = makeMockGoalRepository();
    vi.mocked(goalRepository.findAll).mockResolvedValue([]);

    const useCase = new GetGoalsUseCase(goalRepository);
    const result = await useCase.execute();

    expect(result).toHaveLength(0);
    expect(goalRepository.findAll).toHaveBeenCalledWith({ chatMessage: true });
  });
});
```

## 2. Testes de Integração (Vitest)

- **Localização:** `app/features/integration/*.spec.ts`
- **Escopo:** Múltiplos use cases e repositórios trabalhando juntos
- **Propósito:** Validar fluxos completos de negócio (ex: criar → buscar → deletar)
- **Mocking:** Repositórios e serviços externos ainda são mockados

**Exemplo:**
```typescript
// app/features/integration/goals.spec.ts
describe("Integration Tests: Goals Flow", () => {
  it("should create a goal from message and retrieve it by id", async () => {
    // 1. Create goal from message
    await createUseCase.execute({ messageId: "message-id" });
    // 2. Retrieve goal by id
    const result = await getGoalByIdUseCase.execute("goal-id", false);
    expect(result.goal.title).toBeTruthy();
  });
});
```

## 3. Testes E2E (Playwright)

- **Localização:** `e2e/*.spec.ts`
- **Escopo:** Fluxos completos via UI real no browser
- **Comando:** `npm run test:e2e`

**Exemplo de teste E2E correto:**
```typescript
// ✅ Correto — falha quando o elemento não está presente
test("should navigate to chats list", async ({ page }) => {
  const chatsLink = page.locator('a[href*="chat"]').first();
  await expect(chatsLink).toBeVisible({ timeout: 5000 });
  await chatsLink.click();
  await expect(page.locator('h1:has-text("Chat")')).toBeVisible({ timeout: 5000 });
});

// ❌ Errado — passa silenciosamente quando o elemento não existe
test("should navigate to chats list", async ({ page }) => {
  const chatsLink = page.locator('a[href*="chat"]').first();
  if (await chatsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
    await expect(chatsLink).toBeVisible(); // nunca executado se não visível
  }
});
```

## Regras para Testes

1. Sempre mockar dependências externas (banco de dados, APIs, cache) em testes unitários e de integração
2. Use `vi.fn()` para criar mocks de repositórios
3. Instancie use cases diretamente com mocks (sem o container IoC)
4. Testes E2E devem ser resilientes a ausência de dados (estados vazios)
5. **Nunca use `if (await locator.isVisible().catch(() => false))` em testes E2E** — isso faz o teste passar silenciosamente mesmo quando a UI está ausente, mascarando regressões. Use sempre `await expect(locator).toBeVisible()` para que o teste falhe de forma acionável quando o elemento não existir
6. Se um elemento não estiver sempre disponível (ex: feature flag), use `test.skip()` com uma justificativa clara em vez de um guard condicional
