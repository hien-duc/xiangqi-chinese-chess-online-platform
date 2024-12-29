# Current to New Structure File Mapping

## Current Structure Analysis

Your current codebase has a good foundation but can be better organized. Here's how your current files map to the new structure:

### App Router (`src/app/`)

Current → New Location:
```
src/app/
├── api/                    → src/app/api/v1/
├── login/                  → src/app/(auth)/login/
├── register/              → src/app/(auth)/register/
├── logout/                → src/app/(auth)/logout/
├── games/                 → src/app/(game)/play/
├── lobby/                 → src/app/(game)/lobby/
├── layout.jsx             → src/app/layout.tsx (convert to TypeScript)
├── page.tsx               → Keep as is
└── providers.tsx          → src/app/_components/Providers.tsx
```

### Components

Current → New Location:
```
src/components/
├── XiangqiBoard.tsx       → src/components/ui/board/Board.tsx
├── LeftPanel.jsx          → src/components/game/panels/LeftPanel.tsx
├── RightPanel.jsx         → src/components/game/panels/RightPanel.tsx
├── Navbar.tsx             → src/components/ui/common/Navbar/
├── LoadingSpinner.tsx     → src/components/ui/common/LoadingSpinner/
├── ForfeitModal.tsx       → src/components/game/modals/ForfeitModal/
├── NewGameModal.tsx       → src/components/game/modals/NewGameModal/
├── PlayModal.tsx          → src/components/game/modals/PlayModal/
├── WinModal.tsx           → src/components/game/modals/WinModal/
├── ProtectedRoute.tsx     → src/components/auth/ProtectedRoute/
└── auth-provider.tsx      → src/features/authentication/components/AuthProvider/
```

### Features to Add

New directories to create:
```
src/features/
├── authentication/        # Move auth-related components and logic here
│   ├── components/
│   ├── hooks/
│   └── services/
└── game-logic/           # Move game-related business logic here
    ├── components/
    ├── hooks/
    └── services/
```

### Refactoring Priority List

1. **High Priority**
   - Convert .jsx files to .tsx
   - Move modals to feature-specific folders
   - Implement proper TypeScript types
   - Set up API versioning

2. **Medium Priority**
   - Create feature-based organization
   - Add proper test structure
   - Implement component documentation
   - Set up environment configurations

3. **Low Priority**
   - Add performance monitoring
   - Implement logging strategy
   - Set up CI/CD pipeline
   - Add feature flags

## Migration Steps

1. **Create New Structure**
```bash
# Create new directories
mkdir -p src/features/{authentication,game-logic}/{components,hooks,services}
mkdir -p src/components/ui/{board,common,pieces}
mkdir -p src/components/game/{panels,modals}
```

2. **Move Files**
```bash
# Move and rename files to their new locations
# Example:
mv src/components/XiangqiBoard.tsx src/components/ui/board/Board.tsx
```

3. **Update Imports**
- Update all import statements to reflect new file locations
- Use proper TypeScript paths aliases

4. **Add TypeScript Types**
```typescript
// src/types/game.ts
export interface GameState {
  // Add game state types
}

// src/types/auth.ts
export interface User {
  // Add user types
}
```

5. **Convert Components**
- Convert .jsx to .tsx
- Add proper TypeScript types
- Split large components into smaller ones

## Best Practices During Migration

1. **File Movement**
   - Move one file at a time
   - Update imports immediately
   - Test after each move
   - Keep git history clean

2. **Type Safety**
   - Add TypeScript types gradually
   - Use proper type inference
   - Avoid using 'any'

3. **Testing**
   - Add tests for each moved component
   - Ensure existing functionality works
   - Add integration tests

4. **Documentation**
   - Document component props
   - Add usage examples
   - Update README.md

This mapping provides a clear path to migrate your current codebase to the new structure while maintaining functionality and improving organization.
