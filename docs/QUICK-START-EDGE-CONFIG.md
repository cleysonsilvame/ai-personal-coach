# Quick Start: Edge Config para Logs em Tempo Real

## 🎯 O que você vai conseguir

Mudar o nível de log em **produção** em **~1 segundo** sem rebuild!

## ⚡ Setup (5 minutos)

### 1. Criar Edge Config

1. Acesse: https://vercel.com/dashboard/stores
2. Clique em **"Create Store"**
3. Selecione **"Edge Config"**
4. Nome: `feature-flags` (ou qualquer nome)
5. Clique em **"Create"**

### 2. Conectar ao Projeto

1. Na página do Edge Config criado, clique em **"Connect to Project"**
2. Selecione: `ai-personal-coach`
3. ✅ Pronto! A variável `EDGE_CONFIG` foi adicionada automaticamente

### 3. Adicionar Configuração de Log

1. Na página do Edge Config, clique em **"Edit Items"**
2. Cole este JSON:

```json
{
  "flags": {
    "log_level": 3
  }
}
```

3. Clique em **"Save"**
4. ✅ Feito! Sistema ativo!

## 🚀 Usar

### Logger Automático (Zero Config!)

**O logger carrega automaticamente o nível do Edge Config!**

```typescript
import { logger } from "~/lib/logger";

// Primeira chamada: carrega do Edge Config automaticamente
logger.info("Hello world");

// Pronto! Não precisa de mais nada.
```

**Funcionamento:**
1. Na primeira chamada ao logger (server-side)
2. Ele carrega o nível do Edge Config
3. Mantém em cache para performance
4. Mudanças no Edge Config aplicam no próximo cold start

**Nenhuma configuração manual necessária!** ✨

### Mudar Nível de Log (Exemplo Real)

**Situação:** Bug em produção, precisa ver logs detalhados

1. Acesse seu Edge Config: https://vercel.com/dashboard/stores
2. Clique em **"Edit Items"**
3. Mude de:
   ```json
   {"flags": {"log_level": 3}}
   ```
   Para:
   ```json
   {"flags": {"log_level": 5}}
   ```
4. Clique em **"Save"**
5. **Aguarde 1 segundo** ⚡
6. ✅ Logs detalhados ativos!

**Investigar o bug...**

7. Volte ao Edge Config
8. Mude para `"log_level": 3`
9. Clique em **"Save"**
10. ✅ Voltou ao normal!

**Total:** ~1 minuto, zero deploys! 🎉

## 📊 Níveis Disponíveis

```json
{
  "flags": {
    "log_level": 0  // Silent (nenhum log)
    "log_level": 1  // Fatal (apenas crashes)
    "log_level": 2  // Error (erros)
    "log_level": 3  // Warn (recomendado produção) ⭐
    "log_level": 4  // Info (informações úteis)
    "log_level": 5  // Debug (tudo!) 🐛
  }
}
```

## 🎬 Demo Visual

**Antes (Variável de Ambiente):**
```
Mudar LOG_LEVEL → Commit → Push → Deploy → Esperar 5min ⏱️
```

**Agora (Edge Config):**
```
Abrir Dashboard → Mudar valor → Save → 1 segundo → ✅ Pronto!
```

## ✅ Verificar se está Funcionando

### Método 1: Vercel Logs
1. Acesse: https://vercel.com/dashboard → Seu projeto → Logs
2. Mude log_level para `5` no Edge Config
3. Faça uma request qualquer no app
4. Veja logs detalhados aparecendo! 🎉

### Método 2: Local (não funciona)
⚠️ **Edge Config só funciona em produção/preview Vercel**

Para testar localmente, use variável de ambiente:
```bash
LOG_LEVEL=5 npm run dev
```

## 🔍 Troubleshooting

### "Mudança não aplica"
- ✅ Aguarde ~1 segundo após salvar
- ✅ Verifique sintaxe JSON (sem vírgula no final)
- ✅ Confirme que Edge Config está conectado ao projeto

### "Erro: Edge Config not available"
- ✅ Verifique se criou e conectou ao projeto
- ✅ Confirme que está testando em produção (não local)
- ✅ Veja variável `EDGE_CONFIG` nas env vars do projeto

### "Logs ainda aparecem depois de mudar para 0"
- ✅ Aguarde próxima request (cache pode ter 1-2s)
- ✅ NotificationService sempre envia erros (independente do nível)

## 🎓 Próximos Passos

**Documentação Completa:**
- [docs/FEATURE-FLAGS.md](./FEATURE-FLAGS.md) - Guia detalhado, API, casos de uso
- [docs/LOGGING-STRATEGY.md](./LOGGING-STRATEGY.md) - Estratégia de logs

**Adicionar Mais Flags:**
```json
{
  "flags": {
    "log_level": 3,
    "enable_beta_features": true,
    "maintenance_mode": false
  }
}
```

## 💰 Custos

**Edge Config (Plano Free):**
- ✅ 1 Edge Config por projeto
- ✅ Leituras ilimitadas
- ✅ 1.000 escritas/mês (suficiente para ~33 mudanças/dia)
- ✅ 512 KB de storage

**Custo total:** $0 💸

## 🎉 Pronto!

Agora você pode mudar logs em produção instantaneamente! 🚀

Qualquer dúvida, veja a [documentação completa](./FEATURE-FLAGS.md).
