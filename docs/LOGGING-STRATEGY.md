# Estratégia de Logs e Monitoramento

## Resumo Executivo

**NÃO precisa rebuild para mudar logs!** O sistema usa:
- **Vercel Edge Config** (recomendado): Muda nível de log em tempo real, sem rebuild 🚀
- **Variável de ambiente** (fallback): Requer rebuild mas funciona offline
- **Consola**: Logger universal com níveis inteligentes

**Configuração:**
- **Produção (padrão)**: Level 3 (WARN) → Apenas avisos, erros e fatals
- **Desenvolvimento**: Level 4 (INFO) → Inclui logs informativos
- **Debug temporário**: Level 5 (DEBUG) → Todos os detalhes (via Edge Config, sem rebuild!)

## Mudar Nível de Log SEM Rebuild

### Opção 1: Edge Config (⚡ Recomendado)

**Vantagens:**
- ✅ Mudança em ~1 segundo
- ✅ Zero downtime
- ✅ Grátis (incluído na Vercel)
- ✅ Altera via dashboard ou API

**Setup rápido:**
1. Acesse: https://vercel.com/dashboard/stores
2. Crie um **Edge Config** chamado `feature-flags`
3. Conecte ao projeto `ai-personal-coach`
4. Adicione o item:
   ```json
   {
     "flags": {
       "log_level": 3
     }
   }
   ```

**Para ativar debug em produção:**
1. Mude para `"log_level": 5` no dashboard
2. Clique em **Save**
3. ✅ Ativo em 1 segundo!

📖 **Guia completo:** [docs/FEATURE-FLAGS.md](./FEATURE-FLAGS.md)

### Opção 2: Variável de Ambiente (Requer Rebuild)

```bash
# Desenvolvimento local
LOG_LEVEL="5"  # Debug completo

# Produção (via Vercel Dashboard)
LOG_LEVEL="3"  # Apenas warnings e errors
```

⚠️ **Desvantagem:** Requer rebuild/redeploy (~5 minutos)

## Níveis de Log (Consola)

O sistema usa **Consola**, uma biblioteca universal de logging que funciona tanto no servidor quanto no cliente.

### Níveis Disponíveis (0-5):

| Level | Nome | Quando aparece | Uso |
|-------|------|----------------|-----|
| **0** | Silent | Nunca | Desabilitar todos os logs |
| **1** | Fatal | Erros fatais que quebram a aplicação | Crashes, falhas críticas |
| **2** | Error | Erros que precisam atenção | Falhas de API, erros recuperáveis |
| **3** | Warn | Avisos importantes (padrão produção) | Modelo falhou, fallback usado |
| **4** | Info | Informações úteis (padrão dev) | "Modelo selecionado: X" |
| **5** | Debug | Logs detalhados | "Testing model...", "Processing..." |

## Configuração Recomendada

### Desenvolvimento Local
```bash
LOG_LEVEL="4"  # ou não defina (4 é o padrão local - INFO)
```

### Produção na Vercel
```bash
LOG_LEVEL="3"  # ou não defina (3 é o padrão em produção - WARN)
```

### Debug Profundo (Temporário)
```bash
LOG_LEVEL="5"  # Debug/Verbose - use apenas para investigação
```

### Silencioso (Não Recomendado)
```bash
LOG_LEVEL="0"  # Silent - desabilita todos os logs
```

## O que é Logado em Cada Nível

### Em Produção (Level 3 - WARN):
```
✅ Modelo selecionado com sucesso → SEM LOG (tudo funcionou)
⚠️  Modelo falhou health check → logger.warn() + Notificação
🚨 Todos modelos falharam → logger.error() + Notificação
💀 Crash na aplicação → logger.fatal() + Notificação
```

### Em Desenvolvimento (Level 4 - INFO):
```
ℹ️  Modelo selecionado: meta-llama/...
ℹ️  Processing 15 models...
⚠️  Modelo falhou health check
❌ Erro na API
```

### Debug Completo (Level 5 - DEBUG):
```
🐛 Buscando modelos da API...
🐛 Recebidos 15 modelos
🐛 Testando modelo: meta-llama/...
🐛 Skipping modelo na blacklist: X
ℹ️  Modelo selecionado: Y
```

## Métodos do Logger (Consola)

## Métodos do Logger (Consola)

```typescript
import { logger } from "~/lib/logger";

// Level 1 - Fatal (erros que quebram a aplicação)
logger.fatal("Database connection failed");

// Level 2 - Error (erros recuperáveis)
logger.error("Failed to fetch models from API", error);

// Level 3 - Warn (avisos importantes)
logger.warn("Model failed health check, trying next one");

// Level 4 - Info (informações úteis)
logger.info("Selected model:", modelId);

// Level 5 - Debug (detalhes verbosos)
logger.debug("Testing model", modelId, "with config", config);

// Sempre visível - Success (como info mas com ícone de sucesso)
logger.success("All models processed successfully");
```

## Notificações Sempre Enviadas

Independente do nível de log, **NotificationService** sempre envia:

1. **Erros Estruturados** (via Vercel logs)
   - Model unavailable
   - All models failed
   - API errors

2. **Webhooks Opcionais** (Discord/Slack)
   - Mesmos erros acima
   - Enviados em tempo real

## Visualização dos Logs

### Vercel Dashboard
1. Acesse projeto → **Logs**
2. Filtros úteis:
   - `fatal` → Erros fatais
   - `error` → Todos os erros
   - `warn` → Avisos
   - `MODEL_ERROR` → Erros de modelo
   - `severity:error` → Filtro nativo Vercel
   - `severity:error` → Filtro nativo Vercel

### CLI da Vercel
```bash
vercel logs --follow          # Tempo real
vercel logs -f severity=error # Apenas erros
```

## Recomendações por Ambiente

| Ambiente | LOG_LEVEL | Webhook | Justificativa |
|----------|-----------|---------|---------------|
| **Local** | 5 (Debug) | ❌ | Ver tudo, entender fluxo |
| **Staging** | 4 (Info) | ✅ | Monitorar comportamento |
| **Produção** | 3 (Warn) | ✅ | Silencioso, alerta só problemas |
| **Investigação** | 4 (Info) | ✅ | Debug temporário em prod |

## Por que Consola?

✅ **Universal**: Funciona no servidor (SSR) e no cliente
✅ **Zero Config**: Funciona sem configuração adicional
✅ **Formatação Rica**: Cores, ícones, timestamps automáticos
✅ **Leve**: ~20KB, sem dependências pesadas
✅ **Níveis Claros**: Sistema numérico 0-5 intuitivo
✅ **Mockable**: Fácil de testar (suporta mocks)

## Custos

- **Logs da Vercel**: Inclusos no plano (retenção de 30 dias)
- **Webhooks**: Grátis (Discord/Slack ilimitado)
- **Performance**: Logs de produção (WARN) têm impacto mínimo (~0.1ms)

## Boas Práticas

### ✅ FAÇA:
- Use nível `3` (WARN) em produção (padrão)
- Configure webhook para erros críticos
- Revise logs semanalmente no dashboard
- Ative nível `5` (DEBUG) apenas quando investigar problema

### ❌ NÃO FAÇA:
- Deixar nível `5` (DEBUG) em produção (muito ruído, logs grandes)
- Desabilitar logs completamente (`LOG_LEVEL=0`)
- Ignorar notificações de "all models failed"
- Logar informações sensíveis (tokens, dados pessoais)

## Troubleshooting

### "Muitos logs na Vercel"
- Altere para `LOG_LEVEL=3` (padrão recomendado)

### "Não vejo nenhum log"
- Verifique se `LOG_LEVEL` não está `0` (Silent)
- Confirme que está olhando o deployment correto

### "Quero ver mais detalhes temporariamente"
- Mude para `LOG_LEVEL=4` (Info) na Vercel
- **Lembre de voltar para `3` (Warn) depois!**

### "Logs desaparecendo"
- Vercel retém logs por 30 dias (plano gratuito)
- Configure webhook para arquivo permanente se precisar

## Exemplo Real

```typescript
// Em produção com LOG_LEVEL=3 (WARN):

// ❌ Não aparece (Level 5 - Debug)
logger.debug("Testing model...");

// ❌ Não aparece (Level 4 - Info)
logger.info("Selected model: X");

// ✅ Aparece (Level 3 - Warn)
logger.warn("Model failed health check");

// ✅ Aparece (Level 2 - Error)
logger.error("API request failed");

// ✅ Aparece (Level 1 - Fatal)
logger.fatal("Database connection lost");
```

## Conclusão

**Em produção, use `LOG_LEVEL=3` (ou não defina nada)**:
- ✅ Silencioso quando tudo funciona
- ✅ Alerta quando tem problema
- ✅ Sem overhead de performance
- ✅ Fácil de revisar no dashboard
- ✅ Funciona no servidor e no cliente (universal)

**Só ative DEBUG (nível 5) quando estiver investigando um problema específico!**
