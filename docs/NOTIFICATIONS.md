# Sistema de Notificações de Erro

Este projeto inclui um sistema de notificações automáticas quando modelos da OpenRouter falham.

## Tipos de Notificações

- **model_unavailable**: Um modelo específico falhou no health check
- **all_models_failed**: Todos os modelos testados falharam (usando fallback)
- **model_error**: Erro durante o processo de busca de modelos

## Como Configurar

### 1. Logs da Vercel (Padrão - Grátis)

Por padrão, todos os erros são logados de forma estruturada e aparecem automaticamente no painel da Vercel:

1. Acesse [vercel.com/dashboard](https://vercel.com/dashboard)
2. Selecione seu projeto
3. Vá em **Logs** no menu lateral
4. Filtre por `severity:error` ou procure por `[MODEL_ERROR]`

### 2. Discord Webhook (Opcional - Grátis)

Para receber notificações em tempo real no Discord:

1. Abra seu servidor Discord
2. Vá em **Server Settings** → **Integrations** → **Webhooks**
3. Clique em **New Webhook**
4. Dê um nome (ex: "Model Errors")
5. Selecione o canal onde quer receber as notificações
6. Clique em **Copy Webhook URL**
7. Cole a URL na variável de ambiente `ERROR_NOTIFICATION_WEBHOOK_URL`

Exemplo:
```bash
ERROR_NOTIFICATION_WEBHOOK_URL="https://discord.com/api/webhooks/1234567890/abcdef..."
```

### 3. Slack Webhook (Opcional - Grátis)

Para receber notificações no Slack:

1. Acesse [api.slack.com/apps](https://api.slack.com/apps)
2. Clique em **Create New App** → **From scratch**
3. Dê um nome e selecione o workspace
4. No menu lateral, vá em **Incoming Webhooks**
5. Ative a opção **Activate Incoming Webhooks**
6. Clique em **Add New Webhook to Workspace**
7. Selecione o canal e autorize
8. Copie a **Webhook URL**
9. Cole na variável de ambiente `ERROR_NOTIFICATION_WEBHOOK_URL`

Exemplo:
```bash
ERROR_NOTIFICATION_WEBHOOK_URL="https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXX"
```

### 4. Outros Serviços

Qualquer serviço que aceite webhooks JSON funcionará (Zapier, Make, IFTTT, etc).

## Formato das Notificações

As notificações incluem:

- **Tipo de erro**: model_unavailable, all_models_failed, model_error
- **Model ID**: Qual modelo falhou (quando aplicável)
- **Erro**: Mensagem descritiva
- **Timestamp**: Quando ocorreu
- **Contexto**: Informações adicionais (use case, fase, etc)

### Exemplo de Notificação Discord/Slack:

```
⚠️ Model Unavailable
Model failed health check

Model ID: meta-llama/llama-3.1-405b-instruct:free
Type: model_unavailable
Timestamp: 2026-01-24T10:30:00.000Z
```

## Boas Práticas

1. **Monitore regularmente**: Configure notificações para um canal de monitoramento
2. **Reaja rapidamente**: Quando todos os modelos falham, investigue
3. **Revise a blacklist**: Modelos ficam na blacklist por 8 horas
4. **Use webhook para alertas críticos**: Discord/Slack para notificações em tempo real
5. **Use logs da Vercel para análise**: Histórico completo e filtragem avançada

## Desativando Notificações

Para desativar webhooks, simplesmente remova a variável `ERROR_NOTIFICATION_WEBHOOK_URL` das variáveis de ambiente. Os logs estruturados continuarão sendo enviados para a Vercel.

## Administração via Discord Interactions

Além do webhook de saída, a aplicação também expõe `POST /api/interactions` para comandos administrativos via Discord Interactions.

- A validação de segurança usa assinatura Ed25519 (`x-signature-ed25519`) + timestamp (`x-signature-timestamp`) com janela anti-replay de 5 minutos.
- Configure a chave pública do app Discord em `DISCORD_PUBLIC_KEY`.
- Comando suportado atualmente: `/blacklist add model:<model-id>`.
