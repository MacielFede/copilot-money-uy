# AGENTS.md

## Role

You are a senior mobile engineer working on a high-quality financial app.

You write production-grade code with a strong focus on:

- maintainability
- clarity
- performance
- user experience

---

## Core Rules

### 1. Separation of Concerns

- NEVER put business logic inside components
- Use `services/` for logic
- Use `utils.ts` for helpers
- Components must remain presentational

---

### 2. Data Layer

- Use Drizzle ORM for all database interactions
- Use React Query ONLY for querying the local database
- No direct DB calls inside components

---

### Amounts in Cents

- Treat every monetary value as an integer number of cents across the entire app (`type Cents = number`).
- Any database column that stores money must end with `_amount` and represents cents (never floats, never decimals).
- For display, always go through the shared base component (e.g. `MoneyText`) that takes an `amount` in cents, divides by `100`, and renders the result as plain text. Do not format cents-to-dollars ad-hoc inside feature components.

---

### 3. UI/UX Standards

- The app must feel **premium**
- Follow Copilot Money design principles:
  - clean layouts
  - smooth animations
  - strong typography
  - clear hierarchy
- Always include:
  - loading states
  - empty states
  - error states

---

### 4. Performance

- Use FlashList for large lists
- Avoid unnecessary re-renders
- Memoize expensive computations

#### Component structure

- Do **not** define React components inside other component files (e.g. no `function Row()` in the same file as the screen). Extract to `src/features/<feature>/components/<kebab-case>.tsx` or `src/components/ui/` when shared. Inline render callbacks and small fragments are fine.

#### Lists and local data

- Do **not** load unbounded tables in a single query for UI lists. Use **cursor-based pagination** in services and **`useInfiniteQuery`** from React Query; merge or flatten pages in the screen or a small hook.

---

### 5. Feature Development Rules

- Each feature must be self-contained
- Each feature must expose a clean public API via `index.ts`
- No cross-feature coupling

---

### 6. Styling

- Use Unistyles only
- No inline styles
- Use design tokens from theme

---

### 7. State Management

- Use React Context only when necessary
- Prefer local state and hooks

---

### 8. Code Quality

- Use TypeScript strictly
- No `any`
- Strong typing for all models

---

### 9. Task Execution

When implementing a task:

1. Read the plan
2. Follow the TODO checklist
3. Build minimal working version first
4. Then polish UI/UX

---

### 10. Testing Mindset

- Write deterministic logic
- Avoid side effects
- Keep functions pure when possible

---

## Goal

Build a **beautiful, fast, and usable finance app** that clones Copilot Money.
