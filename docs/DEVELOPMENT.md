# Development Guidelines

This document outlines the coding standards, best practices, and development workflow for the Cohort Enrollment Platform.

## Code Style

### TypeScript

- Use TypeScript for all new files
- Enable strict mode (already configured)
- Avoid `any` types - use proper types or `unknown`
- Use interfaces for object shapes
- Use types for unions and intersections

```typescript
// ✅ Good
interface User {
  id: string
  email: string
  role: 'student' | 'admin'
}

// ❌ Bad
const user: any = { id: '123', email: 'test@example.com' }
```

### React Components

- Use functional components with hooks
- Use TypeScript for props
- Extract reusable logic into custom hooks
- Keep components small and focused

```typescript
// ✅ Good
interface ButtonProps {
  variant?: 'primary' | 'secondary'
  onClick: () => void
  children: React.ReactNode
}

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', onClick, children }) => {
  return (
    <button className={`btn btn-${variant}`} onClick={onClick}>
      {children}
    </button>
  )
}

// ❌ Bad
export const Button = (props: any) => {
  return <button {...props} />
}
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `UserProfile.tsx`)
- Utilities: `camelCase.ts` (e.g., `formatDate.ts`)
- Hooks: `useCamelCase.ts` (e.g., `useAuth.ts`)
- Types: `camelCase.ts` (e.g., `user.ts`)

### Import Organization

```typescript
// 1. React and React-related
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// 2. Third-party libraries
import apiClient from '@/services/apiClient'
import clsx from 'clsx'

// 3. Internal imports (components)
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

// 4. Internal imports (hooks, utils, types)
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/utils/format'
import type { User } from '@/types'

// 5. Styles (if any)
import './Component.css'
```

## Component Structure

### Component Template

```typescript
import React from 'react'
import type { ComponentProps } from '@/types'

interface ComponentNameProps {
  // Props definition
}

export const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2 }) => {
  // 1. Hooks
  const [state, setState] = useState()
  
  // 2. Effects
  useEffect(() => {
    // Effect logic
  }, [])
  
  // 3. Event handlers
  const handleClick = () => {
    // Handler logic
  }
  
  // 4. Render helpers
  const renderContent = () => {
    // Render logic
  }
  
  // 5. Main render
  return (
    <div>
      {/* JSX */}
    </div>
  )
}
```

## State Management

### When to Use Zustand

- Global authentication state
- User profile data
- UI state that needs to be shared across routes
- Cached data that persists across navigation

### When to Use Local State

- Form inputs
- Component-specific UI state (modals, dropdowns)
- Temporary calculations

### Example Zustand Store

```typescript
import { create } from 'zustand'

interface StoreState {
  count: number
  increment: () => void
  decrement: () => void
}

export const useStore = create<StoreState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}))
```

## Styling Guidelines

### Tailwind CSS

- Use Tailwind utility classes
- Use design system colors from `tailwind.config.js`
- Create reusable component classes in `index.css` if needed
- Prefer composition over custom CSS

```typescript
// ✅ Good
<div className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark">
  Button
</div>

// ❌ Bad
<div className="custom-button">Button</div>
```

### Design System Colors

- `primary` - #2563eb (Blue)
- `secondary` - #64748b (Slate Gray)
- `accent` - #059669 (Emerald Green)
- `background` - #f8fafc
- `text` - #1e293b

## Form Handling

### React Hook Form

Always use React Hook Form for forms:

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  })
  
  const onSubmit = async (data) => {
    // Handle submission
  }
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input
        {...register('email')}
        error={errors.email?.message}
      />
      <Input
        type="password"
        {...register('password')}
        error={errors.password?.message}
      />
      <Button type="submit">Login</Button>
    </form>
  )
}
```

## Error Handling

### API Errors

```typescript
const fetchCourses = async () => {
  try {
    const response = await apiClient.get('/courses')
    return response.data
  } catch (error) {
    console.error('Error fetching courses:', error)
    // Show user-friendly error message
    toast.error('Failed to load courses. Please try again.')
    return []
  }
}
```

### Component Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary'

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  )
}

<ErrorBoundary FallbackComponent={ErrorFallback}>
  <YourComponent />
</ErrorBoundary>
```

## Testing Guidelines

### Unit Tests

- Test utility functions
- Test custom hooks
- Test component logic (not implementation details)

### Integration Tests

- Test user flows
- Test API interactions
- Test form submissions

### Example Test

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { Button } from './Button'

describe('Button', () => {
  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)
    
    fireEvent.click(screen.getByText('Click me'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

## Git Workflow

### Branch Naming

- `feature/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `refactor/component-name` - Refactoring
- `docs/documentation-update` - Documentation

### Commit Messages

Follow conventional commits:

```
feat: add course enrollment functionality
fix: resolve payment verification issue
refactor: simplify authentication flow
docs: update setup instructions
style: format code with prettier
test: add tests for enrollment service
```

### Pull Request Process

1. Create feature branch from `main`
2. Make changes and commit
3. Push to remote
4. Create PR with description
5. Request review
6. Address feedback
7. Merge after approval

## Performance Best Practices

1. **Lazy Loading** - Use React.lazy for route components
2. **Memoization** - Use React.memo for expensive components
3. **Code Splitting** - Split large bundles
4. **Image Optimization** - Use appropriate image sizes
5. **Debouncing** - Debounce search inputs
6. **Virtualization** - Use for long lists

## Security Best Practices

1. **Never commit secrets** - Use environment variables
2. **Validate inputs** - Always validate user input
3. **Use Laravel Policies** - Rely on Laravel Policies for data access
4. **Sanitize data** - Sanitize user-generated content
5. **HTTPS only** - Always use HTTPS in production

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] TypeScript types are correct
- [ ] Error handling is implemented
- [ ] Loading states are handled
- [ ] Accessibility considerations
- [ ] No console.logs in production code
- [ ] Environment variables are used correctly
- [ ] Laravel policies are respected
- [ ] Tests pass (if applicable)

## Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Laravel Docs](https://laravel.com/docs)
- [React Hook Form](https://react-hook-form.com)

