# Xiangqi Implementation Guide

## Getting Started

### 1. Initial Setup

```bash
# Initialize Next.js project with TypeScript
npx create-next-app@latest xiangqi --typescript --tailwind --app

# Install key dependencies
npm install @prisma/client next-auth axios zustand @tanstack/react-query
npm install -D prisma @types/node @types/react @testing-library/react jest
```

## Implementation Steps

### 1. Authentication Setup (`src/app/(auth)`)

```typescript
// src/app/(auth)/login/page.tsx
'use client'
import { signIn } from 'next-auth/react'

// Implement login form with credentials
```

Key files to create:
- `layout.tsx`: Auth layout with shared styling
- `login/actions.ts`: Server actions for authentication
- `register/page.tsx`: Registration form
- `_components/`: Shared auth components

### 2. Game Implementation (`src/app/(game)`)

1. Create core game components:
```typescript
// src/components/ui/board/Board.tsx
export const Board = () => {
  // Implement game board with grid
}

// src/components/ui/pieces/Piece.tsx
export const Piece = ({ type, position }) => {
  // Implement piece rendering and movement
}
```

2. Set up game state management:
```typescript
// src/features/game-logic/services/GameService.ts
export class GameService {
  initializeGame() { }
  makeMove() { }
  validateMove() { }
}
```

### 3. API Structure (`src/app/api`)

1. Create API routes with versioning:
```typescript
// src/app/api/v1/game/route.ts
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  // Handle game state updates
}
```

2. Implement authentication endpoints:
```typescript
// src/app/api/v1/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth'

export const authOptions = {
  // Configure auth providers
}
```

### 4. Database Setup (`src/lib/db`)

1. Initialize Prisma:
```bash
npx prisma init
```

2. Create schema:
```prisma
// prisma/schema.prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  games     Game[]
}

model Game {
  id        String   @id @default(cuid())
  players   User[]
  moves     Move[]
}
```

### 5. Component Organization

1. UI Components (`src/components/ui`):
- Create atomic components
- Implement with Tailwind
- Add proper TypeScript types
- Include unit tests

2. Feature Components (`src/features`):
- Group by feature (auth, game)
- Include feature-specific logic
- Keep components focused

### 6. Testing Setup

1. Configure Jest:
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
}
```

2. Create test structure:
```typescript
// tests/unit/components/Board.test.tsx
import { render, screen } from '@testing-library/react'
import { Board } from '@/components/ui/board/Board'

describe('Board', () => {
  it('renders correctly', () => {
    render(<Board />)
    // Add assertions
  })
})
```

### 7. Configuration Management

1. Environment setup:
```typescript
// config/environments/development.ts
export const config = {
  api: {
    baseUrl: 'http://localhost:3000',
    timeout: 5000,
  },
  game: {
    defaultTimeControl: 600,
  },
}
```

2. Feature flags:
```typescript
// config/features/index.ts
export const features = {
  enableAI: process.env.ENABLE_AI === 'true',
  enableTournaments: false,
}
```

## Development Workflow

### 1. Starting Development

```bash
# Start development server
npm run dev

# Start Prisma Studio for database management
npx prisma studio
```

### 2. Making Changes

1. Create feature branch:
```bash
git checkout -b feature/game-moves
```

2. Follow component creation pattern:
```
1. Create component directory
2. Add component file
3. Add test file
4. Add types
5. Add documentation
```

### 3. Testing

```bash
# Run unit tests
npm test

# Run E2E tests
npm run test:e2e

# Check types
npm run type-check
```

### 4. Deployment

1. Build application:
```bash
npm run build
```

2. Deploy with proper environment variables:
```bash
# Production deployment
npm run deploy:prod
```

## Best Practices Checklist

### Code Quality
- [ ] TypeScript strict mode enabled
- [ ] ESLint rules followed
- [ ] Tests written for new features
- [ ] Documentation updated

### Performance
- [ ] Images optimized
- [ ] Code splitting implemented
- [ ] Server components used where possible
- [ ] Proper caching strategies

### Security
- [ ] Authentication implemented
- [ ] API routes protected
- [ ] Input validation added
- [ ] Environment variables secured

## Maintenance Tasks

### Regular Updates
1. Update dependencies monthly
2. Review and update documentation
3. Monitor performance metrics
4. Review security alerts

### Code Reviews
1. Check for:
   - Type safety
   - Test coverage
   - Performance implications
   - Security considerations

This guide provides a step-by-step approach to implementing the enterprise-scale structure. Follow it sequentially to build a maintainable and scalable application.
