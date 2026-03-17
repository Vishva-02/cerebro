/**
 * README for project structure
 * This document explains the folder organization and architecture
 */

# Quiz App - Project Structure

## Folder Organization

### `/src/app`
- **Next.js App Router** directory
- Contains pages, layouts, and route segments
- `layout.tsx` - Root layout with header, footer, and global styles
- `page.tsx` - Home page
- `globals.css` - Global Tailwind CSS imports and custom styles

### `/src/components`
Reusable React components organized by feature:

- **`/common`** - Shared components used across the app
  - Examples: Button, Card, Modal, Loading, etc.
  - These are generic and context-agnostic

- **`/quiz`** - Quiz-specific components
  - Examples: QuestionCard, AnswerOption, QuizProgress, etc.
  - Feature-focused and domain-specific

### `/src/store`
- **Zustand store** for global state management
- `quizStore.ts` - Main quiz state with actions
- Automatically persisted to localStorage
- Includes devtools for Redux DevTools debugging

### `/src/lib`
- **Utility functions** and helpers
- `utils.ts` - Common functions (formatTime, calculatePercentage, etc.)
- API client functions
- Constants and configurations

### `/src/types`
- **TypeScript type definitions**
- `index.ts` - All app-wide types and interfaces
- Ensures type safety across the entire application
- NO implicit `any` types allowed

### `/src/hooks`
- **Custom React hooks**
- `useQuiz.ts` - Quiz-specific hooks
- Encapsulates complex logic
- Reusable across components

### `/public`
- **Static assets**
- Images, icons, fonts
- Accessible via `/filename` in the app

---

## Architecture Benefits

### ✅ **Scalability**
- **Feature-based organization**: Easy to add new features without cluttering
- **Modular structure**: Each folder has a single responsibility
- **Reusable components**: Common components prevent duplication
- **Custom hooks**: Logic extraction makes components lightweight

### ✅ **Maintainability**
- **Clear separation of concerns**: Types, logic, components are separate
- **Type safety**: Strict TypeScript prevents runtime errors
- **Consistent patterns**: Store, hooks, and utilities follow conventions
- **Easy debugging**: Zustand devtools for state inspection

### ✅ **Performance**
- **Code splitting**: App Router enables automatic splitting
- **Tree shaking**: Unused code is removed during build
- **Lazy loading**: Components can be code-split on demand
- **Asset optimization**: Next.js handles image and font optimization

### ✅ **Developer Experience**
- **Fast development**: Hot reload with next dev
- **Type completion**: Full IntelliSense in IDE
- **Consistent styling**: Tailwind utility-first prevents style conflicts
- **Testability**: Separation of logic makes unit testing easier

---

## Development Workflow

1. **Create page**: Add route in `/app`
2. **Create components**: Add to `/components/{feature}`
3. **Add state**: Use Zustand hooks in `quizStore.ts`
4. **Create hooks**: Extract logic to `/hooks` for reusability
5. **Add types**: Define in `/types/index.ts`
6. **Add utilities**: Add helpers to `/lib/utils.ts`

---

## Running the App

```bash
npm install      # Install dependencies
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
```

Visit `http://localhost:3000` in your browser.

---

## Next Steps

- Add API integration layer
- Create reusable component library
- Implement authentication
- Add real-time quiz functionality
- Deploy to production
