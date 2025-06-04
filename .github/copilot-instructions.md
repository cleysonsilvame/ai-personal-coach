# React Router 7 Project Guidelines

## Project Overview
This is a React Router 7 project with TypeScript, using Shadcn UI components and server-side data loading patterns.

## Documentation Resources
Refer to the following documentation pages for guidance:
- https://reactrouter.com/start/data/routing
- https://reactrouter.com/start/framework/route-module
- https://reactrouter.com/start/framework/rendering
- https://reactrouter.com/start/framework/data-loading
- https://reactrouter.com/start/framework/actions
- https://reactrouter.com/start/framework/navigating

## Package Installation Rules
- **NEVER** install Remix packages; they are incompatible with React Router 7
- Always check compatibility before suggesting new packages

## Routing Architecture
- This project **does not** use file-based routing
- All routes must be declared in `app/routes.ts`
- Route modules should be stored in `~/routes`
- Route modules must export a default React component
- Optional exports: `loader`, `action`, `ErrorBoundary`

## Data Loading Patterns
- **ALWAYS** prefer server-side data loading over client-side unless explicitly required
- Data loading should **ONLY** occur in route modules, never in feature components
- Use loaders for GET operations and actions for POST/PUT/DELETE operations

## Import Statement Rules
- **ALWAYS** use `~` for internal imports instead of relative paths
- **ALWAYS** use `'react-router'` for React Router tools, never `'react-router-dom'`

Examples:
```typescript
// ✅ Correct
import { useLoaderData } from 'react-router';
import { TasksList } from '~/features/tasks/tasks-list';

// ❌ Wrong
import { useLoaderData } from 'react-router-dom';
import { TasksList } from '../features/tasks/tasks-list';
```

## Component Organization

### Feature Components
- Must be placed under `~/features`
- React functions should **NOT** be exported as default
- Use named exports only

Example:
```typescript
// ✅ Correct
export function TasksList() {
  // component logic
}

// ❌ Wrong
export default function TasksList() {
  // component logic
}
```

### UI Components
- **EXCLUSIVELY** use Shadcn UI for building the UI
- **EXCLUSIVELY** use icons from Lucide React
- Installed Shadcn UI components are located in `~/components/ui`
- If a component is missing, suggest installing it using Shadcn's CLI: `npx shadcn-ui@latest add [component-name]`

## Code Generation Guidelines

### When creating route modules:
```typescript
import type { LoaderFunctionArgs } from 'react-router';
import { useLoaderData } from 'react-router';

export async function loader({ params }: LoaderFunctionArgs) {
  // Server-side data loading
}

export default function ComponentName() {
  const data = useLoaderData<typeof loader>();
  // Component logic
}
```

### When creating feature components:
```typescript
interface ComponentNameProps {
  // Props interface
}

export function ComponentName({ ...props }: ComponentNameProps) {
  // Component logic
}
```

### When importing components:
```typescript
// UI components
import { Button } from '~/components/ui/button';
import { Card } from '~/components/ui/card';

// Icons
import { Plus, Edit, Trash } from 'lucide-react';

// Feature components
import { TasksList } from '~/features/tasks/tasks-list';

// React Router
import { Form, redirect } from 'react-router';
```

## File Structure Conventions
- Route modules: `~/routes/[route-name].tsx`
- Feature components: `~/features/[feature]/[component-name].tsx`
- UI components: `~/components/ui/[component-name].tsx`
- Services: `~/services/[service-name].server.ts`
- Types: `~/features/[feature]/types.ts`
- Utilities: `~/lib/utils.ts` or `~/features/[feature]/util.ts`

## Error Handling
- Always include ErrorBoundary exports in route modules when appropriate
- Use server-side validation in actions
- Handle loading states appropriately

## Performance Considerations
- Leverage server-side rendering capabilities
- Use React Router's built-in data loading patterns
- Minimize client-side data fetching

## Code Quality Rules
- Always use TypeScript with proper typing
- Follow React hooks rules
- Use proper error boundaries
- Implement proper loading states
- Follow accessibility best practices with Shadcn UI components
