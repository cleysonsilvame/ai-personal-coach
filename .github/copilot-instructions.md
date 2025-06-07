# Diretrizes do Projeto React Router 7

## Visão Geral do Projeto
Este é um projeto React Router 7 com TypeScript, utilizando componentes Shadcn UI e padrões de carregamento de dados do lado do servidor.

## Recursos de Documentação
Consulte as seguintes páginas de documentação para orientação:
- https://reactrouter.com/start/data/routing
- https://reactrouter.com/start/framework/route-module
- https://reactrouter.com/start/framework/rendering
- https://reactrouter.com/start/framework/data-loading
- https://reactrouter.com/start/framework/actions
- https://reactrouter.com/start/framework/navigating

## Regras de Instalação de Pacotes
- **NUNCA** instale pacotes Remix; eles são incompatíveis com React Router 7
- Sempre verifique a compatibilidade antes de sugerir novos pacotes

## Arquitetura de Roteamento
- Este projeto **não** usa roteamento baseado em arquivos
- Todas as rotas devem ser declaradas em `app/routes.ts`
- Módulos de rota devem ser armazenados em `~/routes`
- Módulos de rota devem exportar um componente React padrão
- Exportações opcionais: `loader`, `action`, `ErrorBoundary`

## Padrões de Carregamento de Dados
- **SEMPRE** prefira carregamento de dados do lado do servidor em vez do lado do cliente, a menos que explicitamente necessário
- O carregamento de dados deve ocorrer **APENAS** em módulos de rota, nunca em componentes de feature
- Use loaders para operações GET e actions para operações POST/PUT/DELETE

## Regras de Declarações de Importação
- **SEMPRE** use `~` para importações internas em vez de caminhos relativos
- **SEMPRE** use `'react-router'` para ferramentas React Router, nunca `'react-router-dom'`

Exemplos:
```typescript
// ✅ Correto
import { useLoaderData } from 'react-router';
import { TasksList } from '~/features/tasks/tasks-list';

// ❌ Errado
import { useLoaderData } from 'react-router-dom';
import { TasksList } from '../features/tasks/tasks-list';
```

## Organização de Componentes

### Componentes de Feature
- Devem ser colocados sob `~/features`
- Funções React **NÃO** devem ser exportadas como padrão
- Use apenas exportações nomeadas

Exemplo:
```typescript
// ✅ Correto
export function TasksList() {
  // lógica do componente
}

// ❌ Errado
export default function TasksList() {
  // lógica do componente
}
```

### Componentes UI
- Use **EXCLUSIVAMENTE** Shadcn UI para construir a interface
- Use **EXCLUSIVAMENTE** ícones do Lucide React
- Componentes Shadcn UI instalados estão localizados em `~/components/ui`
- Se um componente estiver faltando, sugira instalá-lo usando o CLI do Shadcn: `npx shadcn-ui@latest add [component-name]`

## Diretrizes de Geração de Código

### Ao criar módulos de rota:
```typescript
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  // Carregamento de dados do lado do servidor
}

export default function ComponentName() {
  const data = useLoaderData<typeof loader>();
  // Lógica do componente
}
```

### Ao criar componentes de feature:
```typescript
interface ComponentNameProps {
  // Interface de props
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Lógica do componente
}
```

### Ao importar componentes:
```typescript
// Componentes UI
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';

// Ícones
import { Plus, Edit, Trash } from 'lucide-react';

// Componentes de feature
import { TasksList } from '~/features/tasks/tasks-list';

// React Router
import { Form, redirect } from 'react-router';
```

## Convenções de Estrutura de Arquivos
- Módulos de rota: `~/routes/[route-name].tsx`
- Componentes de feature: `~/features/[feature]/[component-name].tsx`
- Componentes UI: `~/components/ui/[component-name].tsx`
- Serviços: `~/services/[service-name].server.ts`
- Tipos: `~/features/[feature]/types.ts`
- Utilitários: `~/lib/utils.ts` ou `~/features/[feature]/util.ts`

## Tratamento de Erros
- Sempre inclua exportações ErrorBoundary em módulos de rota quando apropriado
- Use validação do lado do servidor em actions
- Trate estados de carregamento adequadamente

## Considerações de Performance
- Aproveite as capacidades de renderização do lado do servidor
- Use os padrões de carregamento de dados integrados do React Router
- Minimize o carregamento de dados do lado do cliente

## Regras de Qualidade de Código
- Sempre use TypeScript com tipagem adequada
- Siga as regras dos hooks do React
- Use boundaries de erro apropriados
- Implemente estados de carregamento adequados
- Siga as melhores práticas de acessibilidade com componentes Shadcn UI
