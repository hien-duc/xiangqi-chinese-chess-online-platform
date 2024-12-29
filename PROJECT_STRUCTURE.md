# Xiangqi Project Structure Guide - Enterprise Scale

## Directory Structure

```
xiangqi/
├── src/                        # Application source code
│   ├── app/                    # Next.js 13+ App Router
│   │   ├── (auth)/            # Authentication route group
│   │   │   ├── _components/   # Auth-specific components
│   │   │   ├── login/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── actions.ts # Server actions
│   │   │   ├── register/
│   │   │   └── layout.tsx
│   │   ├── (game)/
│   │   │   ├── _components/   # Game-specific components
│   │   │   ├── play/
│   │   │   │   ├── [gameId]/  # Dynamic game routes
│   │   │   │   ├── new/       # New game creation
│   │   │   │   └── @modal/
│   │   │   └── history/
│   │   ├── api/
│   │   │   ├── v1/           # API versioning
│   │   │   │   ├── auth/
│   │   │   │   └── game/
│   │   │   └── v2/           # Future API versions
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── _lib/        # Component library utilities
│   │   │   ├── board/
│   │   │   ├── pieces/
│   │   │   └── common/
│   │   └── game/
│   ├── features/             # Feature-based modules
│   │   ├── authentication/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   └── services/
│   │   └── game-logic/
│   │       ├── components/
│   │       ├── hooks/
│   │       └── services/
│   ├── lib/
│   │   ├── api/             # API client libraries
│   │   │   ├── client.ts
│   │   │   └── endpoints.ts
│   │   ├── auth/
│   │   ├── db/
│   │   │   ├── prisma/
│   │   │   │   ├── migrations/
│   │   │   │   └── schema.prisma
│   │   │   └── repositories/
│   │   └── game/
│   ├── services/            # Business logic services
│   │   ├── game/
│   │   │   ├── GameService.ts
│   │   │   └── GameValidator.ts
│   │   └── user/
│   ├── types/
│   │   ├── api/
│   │   ├── game/
│   │   └── shared/
│   └── utils/
├── public/
├── tests/
│   ├── __mocks__/
│   ├── fixtures/          # Test data fixtures
│   ├── helpers/           # Test utilities
│   ├── unit/
│   │   ├── components/
│   │   └── services/
│   ├── integration/
│   └── e2e/
├── docs/                   # Documentation
│   ├── api/
│   ├── architecture/
│   └── deployment/
├── scripts/               # Build and deployment scripts
│   ├── deploy/
│   ├── db/
│   └── ci/
└── config/
    ├── environments/     # Environment-specific configs
    │   ├── development.ts
    │   ├── staging.ts
    │   └── production.ts
    └── features/        # Feature flags configuration
```

## Enterprise-Scale Considerations

### 1. Scalability Features

#### Modular Architecture

- Feature-based organization (`features/` directory)
- Independent modules with their own components, hooks, and services
- Clear boundaries between features

#### API Versioning

- Versioned API routes (`api/v1/`, `api/v2/`)
- Backward compatibility support
- API documentation per version

#### Database Scalability

- Repository pattern for database access
- Migration management
- Connection pooling
- Query optimization

### 2. Maintainability

#### Code Organization

- Feature-first approach
- Consistent file naming
- Clear separation of concerns
- Component isolation

#### Documentation

- Architecture decisions records (ADRs)
- API documentation
- Component documentation
- Deployment guides

#### Testing Strategy

- Comprehensive test coverage
- Test fixtures and helpers
- Integration with CI/CD
- Performance testing

### 3. Performance

#### Build Optimization

- Code splitting strategies
- Tree shaking
- Bundle analysis
- Cache optimization

#### Monitoring

- Performance metrics
- Error tracking
- User analytics
- Server monitoring

### 4. Security

#### Authentication & Authorization

- Role-based access control (RBAC)
- JWT token management
- Session handling
- Security headers

#### Data Protection

- Input validation
- XSS prevention
- CSRF protection
- Rate limiting

### 5. CI/CD Pipeline

#### Automated Workflows

- Linting and type checking
- Unit and integration tests
- E2E tests
- Security scanning
- Performance benchmarking

#### Deployment Strategies

- Blue-green deployments
- Canary releases
- Rollback procedures
- Environment management

### 6. Development Workflow

#### Version Control

- Branch strategy
- PR templates
- Code review guidelines
- Commit conventions

#### Quality Assurance

- Code quality gates
- Performance budgets
- Accessibility checks
- Cross-browser testing

### 7. Monitoring & Logging

#### Application Monitoring

- Error tracking
- Performance monitoring
- User analytics
- Server metrics

#### Logging Strategy

- Structured logging
- Log levels
- Log aggregation
- Audit trails

## Best Practices for Scale

1. **Feature Development**

   - Create feature branches
   - Implement feature flags
   - Write comprehensive tests
   - Document API changes

2. **Code Quality**

   - Regular dependency updates
   - Code coverage requirements
   - Performance monitoring
   - Security scanning

3. **Team Collaboration**

   - Clear documentation
   - Code review process
   - Knowledge sharing
   - Team conventions

4. **Production Readiness**
   - Load testing
   - Security audits
   - Performance optimization
   - Monitoring setup

## Project Structure Documentation

### Overview

This project follows Next.js 13+ App Router conventions with a feature-first organization approach. The codebase is structured to maximize code reusability while maintaining clear boundaries between different features.

### Directory Structure

```
xiangqi/
├── src/                      # Application source code
│   ├── app/                  # Next.js app router pages and layouts
│   │   ├── (auth)/          # Authentication route group
│   │   │   ├── login/       # Login page
│   │   │   └── signup/      # Signup page
│   │   ├── games/          # Games route
│   │   │   ├── [gameId]/   # Dynamic game route
│   │   │   └── page.tsx    # Games list page
│   │   ├── api/            # API routes
│   │   │   ├── auth/       # Authentication endpoints
│   │   │   └── game/       # Game-related endpoints
│   │   └── layout.tsx      # Root layout
│   ├── components/         # Shared components
│   │   ├── game/          # Game-specific components
│   │   │   ├── board/     # Board components
│   │   │   └── modals/    # Game-related modals
│   │   └── ui/            # Common UI components
│   ├── features/          # Feature-specific code
│   │   ├── authentication/# Authentication feature
│   │   ├── game/         # Game logic and state
│   │   └── chat/         # Chat feature
│   ├── hooks/            # Shared hooks
│   ├── lib/             # Library code
│   │   ├── db/          # Database models and utils
│   │   └── utils/       # Utility functions
│   ├── styles/          # Global styles
│   └── types/           # TypeScript type definitions
├── public/              # Static assets
├── middleware.ts        # Next.js middleware
├── next.config.js      # Next.js configuration
└── package.json        # Project dependencies
```

### Key Directories

### `src/app`
Contains all Next.js pages and layouts using the App Router. Route groups are used to organize related pages.

### `src/components`
Reusable React components organized by feature and common UI elements.

### `src/features`
Feature-specific code including business logic, components, and hooks that are specific to a feature.

### `src/lib`
Shared utilities, database models, and other library code used across the application.

## File Naming Conventions

- React Components: PascalCase (e.g., `GameBoard.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useGameState.ts`)
- Utilities: camelCase (e.g., `chessRules.ts`)
- Pages: Next.js conventions (e.g., `page.tsx`, `layout.tsx`)
- API Routes: Next.js conventions (e.g., `route.ts`)

## Best Practices

1. **Feature Organization**: Related code is grouped by feature in the `features` directory
2. **Component Reusability**: Common components are placed in `components/ui`
3. **Type Safety**: TypeScript types are properly defined in `types` directory
4. **API Structure**: API routes follow REST conventions and are organized by resource
5. **State Management**: Game state is managed using React hooks and context

## Routing Structure

- `/` - Home page
- `/login` - Login page
- `/signup` - Signup page
- `/games` - Games list
- `/games/[gameId]` - Individual game page
- `/api/*` - API endpoints

This structure allows for easy navigation, clear separation of concerns, and scalable feature development.

This structure is designed for enterprise-scale applications with:

- Multiple teams working simultaneously
- High traffic and performance requirements
- Complex business logic
- Long-term maintainability needs
- Robust security requirements

It provides a foundation that can scale from a small team to multiple teams working on different features while maintaining code quality and performance.
