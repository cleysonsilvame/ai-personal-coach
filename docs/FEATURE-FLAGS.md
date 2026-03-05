# Feature Flags com Vercel Edge Config

## Por que usar Feature Flags?

**Problema com variáveis de ambiente:**
- ❌ Requer rebuild e redeploy para mudar qualquer configuração
- ❌ Downtime durante deploy
- ❌ Impossível testar rapidamente diferentes configurações em produção

**Solução com Feature Flags (Edge Config):**
- ✅ **Mudanças em tempo real** sem rebuild
- ✅ **Zero downtime**
- ✅ **Grátis** (incluído no plano Vercel)
- ✅ **Global** (distribuído na edge)
- ✅ **Alterável via Dashboard ou API**

## Setup (5 minutos)

### 1. Criar Edge Config na Vercel

1. Acesse: https://vercel.com/dashboard/stores
2. Clique em **Create Store** → **Edge Config**
3. Nome sugerido: `feature-flags` ou `config`
4. Clique em **Create**

### 2. Conectar ao Projeto

1. Na página do Edge Config, clique em **Connect to Project**
2. Selecione seu projeto: `ai-personal-coach`
3. A variável `EDGE_CONFIG` será automaticamente adicionada

### 3. Adicionar Flags

Na página do Edge Config, clique em **Edit Items** e adicione:

```json
{
  "flags": {
    "log_level": 3,
    "chat_use_dynamic_model_selection": false,
    "copilot_use_dynamic_model_selection": false
  }
}
```

**Clique em Save** → Mudança ativa em ~1 segundo globalmente! 🚀

## Uso

### Automático (Recomendado)

**O logger carrega automaticamente o nível do Edge Config na primeira vez que é usado!**

```typescript
import { logger } from "~/lib/logger";

// Primeira chamada: carrega level do Edge Config automaticamente
logger.info("Hello world");

// Chamadas subsequentes: usa o level em cache (performance)
logger.debug("Debug info");
logger.error("Error message");
```

Nenhuma configuração manual necessária! ✨

### Manual (Quando Necessário)

Se precisar forçar atualização do level:

```typescript
import { logger } from "~/lib/logger";

// Forçar um nível específico
logger.setLevel(5);

logger.debug("Agora debug está ativo");
```

**Cenário:** Você quer investigar um problema em produção temporariamente

#### Antes (com variável de ambiente):
```bash
# 1. Mudar no Vercel Dashboard ou CLI
vercel env add LOG_LEVEL 5

# 2. Fazer redeploy
vercel --prod

# 3. Esperar build (2-5 minutos)
# 4. Investigar problema
# 5. Reverter (mais 2-5 minutos de build)
```
⏱️ **Tempo total:** ~10 minutos + downtime

#### Agora (com Edge Config):
```bash
# 1. Abrir Edge Config no dashboard
# 2. Mudar "log_level": 5
# 3. Clicar em Save

# ✅ Ativo em 1 segundo!
# 4. Investigar problema
# 5. Voltar para "log_level": 3
```
⏱️ **Tempo total:** ~30 segundos, zero downtime

### Via API (Automação)

```typescript
// Exemplo: Script para ativar debug em produção
const EDGE_CONFIG_ID = "ecfg_xxx"; // Pegar no dashboard
const VERCEL_TOKEN = "xxx"; // Token de acesso

const response = await fetch(
  `https://api.vercel.com/v1/edge-config/${EDGE_CONFIG_ID}/items`,
  {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          operation: "update",
          key: "flags",
          value: { log_level: 5 },
        },
      ],
    }),
  }
);
```

## Prioridade de Configuração

O sistema usa a seguinte ordem de prioridade:

1. **Edge Config** (tempo real) ← Recomendado em produção
2. **Variável de ambiente** `LOG_LEVEL` (requer rebuild)
3. **Padrão automático** (WARN em prod, INFO em dev)

```typescript
// No código
import { getLogLevel } from "~/lib/feature-flags.server";

// Busca na ordem: Edge Config → ENV → Default
const level = await getLogLevel();
```

## Flags Disponíveis

| Flag | Tipo | Padrão | Descrição |
|------|------|--------|-----------|
| `log_level` | `number` | 3 | Nível de log (0-5) |
| `chat_use_dynamic_model_selection` | `boolean` | `false` | Quando `true`, chat usa detecção dinâmica de modelos; quando `false`, usa `OPEN_ROUTER_MODEL`. |
| `copilot_use_dynamic_model_selection` | `boolean` | `false` | Quando `true`, copilot usa detecção dinâmica de modelos; quando `false`, usa `OPEN_ROUTER_MODEL`. |

### Adicionar Novas Flags

1. Atualizar interface em `app/lib/feature-flags.server.ts`:

```typescript
interface FeatureFlags {
  log_level?: number;
  enable_new_feature?: boolean; // Nova flag
}
```

2. Adicionar no Edge Config dashboard:

```json
{
  "flags": {
    "log_level": 3,
    "enable_new_feature": true
  }
}
```

3. Usar no código:

```typescript
import { getFeatureFlags } from "~/lib/feature-flags.server";

const flags = await getFeatureFlags();
if (flags.enable_new_feature) {
  // Código da nova feature
}
```

## Limites (Plano Free)

| Recurso | Limite Grátis |
|---------|---------------|
| Edge Configs | 1 por projeto |
| Tamanho | 512 KB |
| Leituras/mês | Ilimitadas |
| Escritas/mês | 1.000 |
| Latência | ~1-2ms |
| Propagação | ~1 segundo |

**Nota:** 1.000 escritas/mês = ~33/dia = suficiente para ajustes manuais

## Casos de Uso

### 1. Debug em Produção
```json
// Ativar temporariamente
{"flags": {"log_level": 5}}

// Investigar...

// Desativar
{"flags": {"log_level": 3}}
```

### 2. Feature Toggle
```json
{
  "flags": {
    "enable_ai_coach": true,
    "enable_voice_mode": false
  }
}
```

### 3. A/B Testing
```json
{
  "flags": {
    "variant": "A",
    "show_new_ui": false
  }
}
```

### 4. Manutenção
```json
{
  "flags": {
    "maintenance_mode": false,
    "maintenance_message": "Sistema em manutenção"
  }
}
```

## Desenvolvimento Local

Edge Config **não funciona localmente** (apenas em produção Vercel).

Durante desenvolvimento:
- Use variável de ambiente `LOG_LEVEL`
- Ou teste em preview deployment

## Monitoramento

### Ver Mudanças Recentes

1. Acesse Edge Config no dashboard
2. Aba **Activity Log**
3. Veja histórico de mudanças

### Alertas

Configure webhooks para receber notificações quando flags mudam:
- Discord
- Slack
- Email
- Custom endpoint

## Boas Práticas

### ✅ FAÇA:
- Use Edge Config para valores que mudam com frequência
- Mantenha flags simples e documentadas
- Tenha valores padrão seguros no código
- Reverta mudanças após investigações

### ❌ NÃO FAÇA:
- Armazenar dados sensíveis (use env vars)
- Criar flags que nunca são usadas
- Deixar debug ativado permanentemente
- Depender 100% de Edge Config (tenha fallbacks)

## Troubleshooting

### "Edge Config not available"
- Verifique se `EDGE_CONFIG` está definida
- Confirme que Edge Config está conectado ao projeto
- Veja logs de erro no console

### "Mudanças não aplicam"
- Aguarde ~1 segundo para propagação
- Verifique JSON no Edge Config (sintaxe correta)
- Veja logs do servidor

### "Atingi limite de escritas"
- Plano free: 1.000/mês
- Solução: Upgrade ou use menos mudanças
- Ou combine com variáveis de ambiente para valores estáveis

## Recursos

- [Docs Oficial Edge Config](https://vercel.com/docs/storage/edge-config)
- [SDK Edge Config](https://github.com/vercel/edge-config)
- [API Reference](https://vercel.com/docs/rest-api/endpoints/edge-config)

## Conclusão

**Use Edge Config quando:**
- ✅ Precisa mudar configurações rapidamente
- ✅ Quer testar diferentes valores sem rebuild
- ✅ Precisa de feature toggles em produção

**Use variáveis de ambiente quando:**
- ✅ Valores nunca ou raramente mudam
- ✅ Dados sensíveis (secrets, API keys)
- ✅ Configurações de infraestrutura

**Melhor prática:** Use Edge Config para flags + env vars para secrets! 🎯
