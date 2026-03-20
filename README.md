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
🧠 CEREBRO – AI-Powered Quiz Application

CEREBRO is a modern, AI-driven quiz application built with Next.js that dynamically generates quizzes based on user input. It is designed to provide an interactive and customizable learning experience with a focus on performance, clean UI, and real-world scalability.

🚀 Live Demo

🔗 https://cerebro-sepia.vercel.app
 (update if needed)

📦 Setup Instructions
1. Clone the Repository
git clone https://github.com/your-username/cerebro.git
cd cerebro
2. Install Dependencies
npm install
3. Configure Environment Variables

Create a .env.local file in the root directory and add:

NEXTAUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

AI_API_KEY=your_ai_api_key
4. Run the Development Server
npm run dev

App will run at:

http://localhost:3000
5. Build for Production
npm run build
npm start
🤖 AI Service Integration

Integrated with an AI API (e.g., Google Gemini / OpenAI)

AI generates:

Quiz questions

4 options per question

Correct answers

API is called via Next.js API routes to:

Hide API keys

Handle errors and retries

Implemented:

Loading states during generation

Error handling for failed responses

Basic caching to avoid duplicate requests

🏗 Architecture Decisions
📁 Project Structure
app/
components/
features/quiz/
hooks/
services/
types/
utils/
⚙️ Key Decisions

Next.js App Router
Used for better routing and server-side capabilities

TypeScript
Ensures type safety and maintainability

Component-Based Architecture
Reusable UI components for scalability

State Management
Used (Context API / Zustand) to manage:

Quiz state

Answers

Timer

History

API Layer (Next.js Routes)
Handles AI requests securely

✨ Features Implemented
🎯 Core Features
AI-powered quiz generation
Custom quiz setup:
Topic input
Difficulty selection (Easy / Medium / Hard)
Number of questions
Timer option
Negative marking
Quiz interface:
One question at a time
Next / Previous navigation
Skip question option
Progress tracking
Timer with visual alerts
Auto-save progress

📊 Results & Analytics
Total questions
Answered / Skipped / Not answered
Correct / Wrong answers
Score calculation (with negative marking)
Performance summary

💾 Persistence
Quiz history stored in localStorage
Tracks:
Topic
Score
Difficulty
Date
Option to review past attempts

🎨 UI/UX
Clean and minimal design
Ocean Mint theme
Fully responsive (mobile-first)
Smooth transitions and interactions

⚠️ Known Limitations
AI responses may occasionally be inconsistent or malformed
No backend database (uses localStorage for persistence)
Authentication is basic / optional (if implemented)
Limited question validation from AI responses
Performance depends on external AI API latency

SCREENSHOTS
<img width="1490" height="807" alt="image" src="https://github.com/user-attachments/assets/e0efc38c-1dc1-417e-9a9f-8bc0811abd8a" />
<img width="1575" height="840" alt="image" src="https://github.com/user-attachments/assets/fa2751db-61a6-4d53-93d7-7673da2d2888" />
<img width="1661" height="863" alt="image" src="https://github.com/user-attachments/assets/eb7963c2-0a15-4ff4-84ae-c9edc6a8f726" />
<img width="1423" height="699" alt="image" src="https://github.com/user-attachments/assets/086ebc58-94ae-400a-a280-5e5aff3fac46" />



