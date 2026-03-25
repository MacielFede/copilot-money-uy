---
name: Copilot Clone Plan
overview: Build a local-first Copilot Money-style React Native + Expo app using TypeScript, Drizzle ORM over expo-sqlite, and React Query (local DB reads). Implement an Unistyles + React context theme system first, then add 8-tab navigation (dashboard, transactions, accounts, recurrings, savings, budgets, cashflow, investments) and build each feature with screenshot-driven UI, modular services/components, and deterministic seed data.
todos:
  - id: phase1-theme
    content: Implement Unistyles theme + ThemeContext; update root layout to use it.
    status: pending
  - id: phase2-navigation-primitives
    content: Replace 2-tab template with 8 tabs and implement section header pills.
    status: pending
  - id: phase3-db-schema-seed
    content: Create Drizzle+expo-sqlite schema (>=9 required tables) + migrations + deterministic seed.
    status: pending
  - id: phase4-transactions-core
    content: Build Transactions feature (grouped list, selection, edit modals) with local-first services.
    status: pending
  - id: phase4-dashboard-core
    content: Build Dashboard feature (hero charts, to-review, upcoming recurrings, budgets summary).
    status: pending
  - id: phase4-accounts-core
    content: Build Accounts feature (net worth chart + grouped account list).
    status: pending
  - id: phase5-recurrings
    content: Build Recurrings screen (grid + edit modal with occurrences timeline).
    status: pending
  - id: phase5-savings-goals
    content: Build Savings/Goals screen (goal header card + active/ready lists).
    status: pending
  - id: phase5-budgets-categories
    content: Build Budgets tab using Categories UI (rebalance modal + category edit).
    status: pending
  - id: phase6-cashflow
    content: Build Cash Flow screen (net income/spend charts + details modal).
    status: pending
  - id: phase6-investments
    content: Build Investments screen (holdings + display filter sheet).
    status: pending
  - id: phase7-polish
    content: Add empty/loading/error states and performance tuning across all screens.
    status: pending
isProject: false
---

# Copilot Money Clone (Expo + RN + Local-first Drizzle)

## Guiding principles

- Local-first only: all user/business data lives in SQLite via `expo-sqlite` + `drizzle-orm`.
- React Query is used only for reading/querying the local database (caching, derived state, background refresh), never for remote fetching.
- Business logic never lives in UI components; it lives in each feature’s `services/` layer.
- Styling: use Unistyles only (no inline styles). All UI state must include loading/empty/error.

## Mermaid: high-level app architecture

```mermaid
flowchart LR
  UI[React Native UI Screens/Components] -->|calls| FeatureServices[Feature services/*]
  FeatureServices -->|SQL| Drizzle[Drizzle ORM (SQLite)]
  UI -->|hooks| ReactQuery[React Query (local reads)]
  ReactQuery --> FeatureServices
  FeatureServices --> Drizzle
  ThemeCtx[Theme Context (light/dark/system)] --> Unistyles[Unistyles runtime theme tokens]
```

## Project structure (enforced)

- `app/`: Expo Router routes/layouts (tabs + modals)
- `src/db/`: expo-sqlite initialization, Drizzle schema, migrations config, seed
- `src/context/`: global theme context
- `src/hooks/`: shared hooks (e.g., color scheme mapping, query helpers)
- `src/components/`: shared presentational components and navigation primitives
- `src/features/<feature>/`: feature-local `index.ts`, `screens/`, `components/`, `services/`, `utils.ts`

---

## Phase 1: Theme system (first task in plan)

### Task 1.1 — Create Unistyles design tokens + Theme Context

**Why it matters**: Copilot’s premium look depends on consistent typography, spacing, and color across dark/light modes; doing this first prevents visual churn later.

**Screenshot reference(s)**: `[docs/screenshots/dashboard-2.png](docs/screenshots/dashboard-2.png)`, `[docs/screenshots/accounts.png](docs/screenshots/accounts.png)`

**Scope**

- Add Unistyles theme tokens (light/dark) for colors, spacing, typography.
- Provide a global React context for theme mode (system/light/dark).
- Ensure Unistyles runtime is updated when mode changes.

**Technical implementation details**

- Use existing `constants/theme.ts` as the seed token source (text/background/tint/icon and font names).
- Create `src/context/ThemeContext.tsx`:
  - Holds `mode: 'system'|'light'|'dark'` and resolved `colorScheme`.
  - On resolution change, call `UnistylesRuntime.setTheme('light'|'dark')`.
- Create `src/theme/themes.ts`:
  - `lightTheme` + `darkTheme` matching the token names used in Unistyles.
- Configure Unistyles once via `StyleSheet.configure({ themes, settings })`.
  - Unistyles v3 theming supports runtime switching through `UnistylesRuntime.setTheme(...)`.

**Todo checklist**

1. Create `src/context/ThemeContext.tsx` with a provider and `useThemeMode()` hook.
2. Implement `src/theme/themes.ts` with tokens for:

- `colors`: background, card backgrounds, text, muted text, tint, success/error, borders.
- `spacing`: small/medium/large scales.
- `typography`: font families and weights.

1. Configure Unistyles in an initialization module (e.g. `src/theme/unistyles.ts`) using `StyleSheet.configure`.
2. Update `app/_layout.tsx` to remove the template React Navigation `ThemeProvider` and instead wrap the app with `ThemeProvider` (local context provider).
3. Ensure the new theme controls the styles used by the rest of the UI (no leftover RN `StyleSheet` usage for new components).

---

## Phase 2: Navigation + UI primitives

### Task 2.1 — Implement 8-tab navigation and section header pills

**Why it matters**: The screenshots show the active “section” highlighted as a pill at the top of each screen (Dashboard/Transactions/Categories/Recurrings/Goals/Cash flow/Investments). Navigation must match that interaction model.

**Screenshot reference(s)**: `[docs/screenshots/dashboard.png](docs/screenshots/dashboard.png)`, `[docs/screenshots/transactions.png](docs/screenshots/transactions.png)`, `[docs/screenshots/cash-flow.png](docs/screenshots/cash-flow.png)`

**Scope**

- Replace the placeholder 2-tab template with 8 tabs.
- Create a reusable `SectionTabs` component that visually matches the pill-based active section.
- Keep the actual Expo Router tab navigator as the source of navigation truth.

**Technical implementation details**

- Update `app/(tabs)/_layout.tsx`:
  - Define 8 `Tabs.Screen`s:
    - `dashboard`, `transactions`, `accounts`, `recurrings`, `savings`, `budgets`, `cashflow`, `investments`.
  - Hide/show default tab bar as needed so the UI matches screenshots (primary interaction is pills).
- Create `src/components/navigation/SectionTabs.tsx`:
  - Takes the active route name and renders 8 pills.
  - Uses Unistyles tokens for spacing/colors.
  - On press, navigates to the corresponding Expo Router route.
- Ensure each screen uses the same `SectionTabs` header.

**Todo checklist**

1. Add route files under `app/(tabs)/` for the 8 tabs (each will render the matching feature’s `screens/<name>.tsx`).
2. Update `app/(tabs)/_layout.tsx` to register all 8 tab screens.
3. Implement `src/components/navigation/SectionTabs.tsx` with pill styling that matches screenshot highlights.
4. Add header usage to each feature screen root (e.g. Dashboard screen root shows the pills).
5. Confirm the active pill changes correctly when switching tabs.

### Task 2.2 — Build shared premium UI primitives (cards, headers, empty/error shells)

**Why it matters**: Every feature uses a consistent card style, typography scale, and section spacing.

**Screenshot reference(s)**: `[docs/screenshots/transactions-selected.png](docs/screenshots/transactions-selected.png)`, `[docs/screenshots/goals-list.png](docs/screenshots/goals-list.png)`

**Scope**

- Create shared presentational primitives (no business logic):
  - `Card`, `SectionTitle`, `EmptyState`, `ErrorState`, `LoadingSkeleton`.
- Use Unistyles only.

**Technical implementation details**

- Place under `src/components/ui/`.
- Ensure primitives support dark/light via theme tokens.

**Todo checklist**

1. Create `src/components/ui/Card.tsx`.
2. Create `src/components/ui/EmptyState.tsx`, `ErrorState.tsx`, `LoadingSkeleton.tsx`.
3. Ensure these primitives match the layout density seen in screenshots (card padding, rounded corners, muted text).
4. Replace template/demo UI components in the root routes.

---

## Phase 3: Local database foundation (Drizzle + expo-sqlite + seed)

### Task 3.1 — Create SQLite + Drizzle client + schema skeleton

**Why it matters**: Without a correct schema, the app can’t be local-first or deterministic for screenshots.

**Screenshot reference(s)**: `[docs/screenshots/transactions.png](docs/screenshots/transactions.png)`, `[docs/screenshots/accounts.png](docs/screenshots/accounts.png)`

**Scope**

- Add `src/db/` and initialize:
  - expo-sqlite database connection
  - Drizzle schema module(s)
  - query runner helpers

**Technical implementation details**

- Follow Drizzle’s Expo SQLite guidance:
  - use `drizzle-orm/expo-sqlite` and `openDatabaseSync` (or the official Expo SQLite driver integration).
  - If sync constraints cause issues, use `drizzle-orm/sqlite-proxy` workaround.
- Add `src/db/client.ts` and `src/db/schema.ts`.

**Todo checklist**

1. Create `src/db/client.ts` that exports a configured Drizzle DB instance.
2. Add `src/db/schema.ts` with table definitions (see next task for full schema).
3. Add `src/db/migrate.ts` helper if needed for runtime checks.

### Task 3.2 — Define Drizzle schema (>= 9 tables) for all required features

**Why it matters**: Ensures each tab can be implemented without hacks and keeps services deterministic.

**Screenshot reference(s)**: `[docs/screenshots/categories.png](docs/screenshots/categories.png)`, `[docs/screenshots/recurrings.png](docs/screenshots/recurrings.png)`, `[docs/screenshots/investments.png](docs/screenshots/investments.png)`, `[docs/screenshots/cash-flow.png](docs/screenshots/cash-flow.png)`, `[docs/screenshots/goals-list.png](docs/screenshots/goals-list.png)`

**Scope**
Create at least these tables (exact names):

- `accounts`
- `transactions`
- `categories`
- `budgets`
- `recurrings`
- `savings_goals`
- `investments`
- `cashflow_snapshots`
- `settings`

(Optionally additional tables like `tags`, join tables, etc.)

**Technical implementation details**

- Model only fields needed for screenshot-driven UI first.
- Recommended columns (strong typing; no `any`):
  - `accounts`: `id`, `name`, `type` (credit_card|deposit|...|manual_investment), `balance`, `available`, `utilizedPct`, `currency`, `isExcludedFromNetWorth`.
  - `categories`: `id`, `name`, `emoji`, `kind` (regular|excluded).
  - `transactions`: `id`, `date`, `name`, `amount`, `currency`, `accountId`, `categoryId`, `type` (regular|income|transfer), `isExcluded`, `isRecurring`, `tagId?`, `goalId?`, `needsReview`.
  - `budgets`: `id`, `month` (YYYY-MM), `categoryId`, `budgetAmount`, `mode` (same_all_months|per_month), `isExcluded`.
  - `recurrings`: `id`, `name`, `emoji`, `categoryId`, `frequency` (monthly/annual), `expectedDayRange`, `amountMin/Max`, `nextPaymentDate`, `applyToTransactions` (filter rules), etc.
  - `savings_goals`: `id`, `name`, `emoji`, `targetMonth`, `targetAmount`, `savedAmount`, `status` (active|ready_to_spend|archived), `createdAt`.
  - `investments`: `id`, `groupName` (e.g., ETF label), `allocationPct`, `holdingsData` (normalized via holdings table if you prefer; still keep required `investments` table), `displayMode` defaults.
  - `cashflow_snapshots`: `id`, `month`, `income`, `spend`, `excludedSpend`, `netIncome`.
  - `settings`: `id=singleton`, `currency`, `budgetingEnabled`, `netWorthTimeframe`, etc.

**Todo checklist**

1. Implement all required table definitions in `src/db/schema.ts` using Drizzle’s SQLite column types.
2. Create and validate Drizzle relations (at least FK relationships for categoryId/accountId/goalId).
3. Add TypeScript models inferred from schema.

### Task 3.3 — Add migrations + deterministic seed data

**Why it matters**: The app must be usable immediately and consistent with screenshots.

**Screenshot reference(s)**: `[docs/screenshots/dashboard-2.png](docs/screenshots/dashboard-2.png)`, `[docs/screenshots/transactions-selected.png](docs/screenshots/transactions-selected.png)`, `[docs/screenshots/cash-flow-net-income-modal.png](docs/screenshots/cash-flow-net-income-modal.png)`

**Scope**

- Drizzle migrations for the full schema.
- A deterministic seed script that generates coherent data:
  - accounts grouped like screenshot sections
  - transactions grouped by date categories
  - budgets per category month
  - recurrings with expected next payments
  - savings goals with month progress/check circles
  - investments holdings and sparkline series
  - cashflow snapshots to drive charts

**Technical implementation details**

- Create a seed module `src/db/seed/seed.ts`.
- Seed should be deterministic via fixed PRNG seed or fixed lists.
- Seed should also set a singleton row in `settings`.
- Integrate seed execution into app bootstrap (first-run) or as a dev-only trigger.

**Todo checklist**

1. Configure Drizzle Kit for migration generation (and inline SQL bundling if needed for Expo).
2. Create migrations for all schema tables.
3. Implement deterministic seed data generators in `src/db/seed/seed.ts`.
4. Add a bootstrap helper `src/db/seed/runSeedIfEmpty.ts`:

- checks if `settings` singleton exists
- if absent, runs seed

1. Ensure seed values drive key visible metrics shown in screenshots (spent/net worth/net income totals).

---

## Phase 4: Core features first (Dashboard, Transactions, Accounts)

### Task 4.1 — Implement Transactions feature (list, search, selection, edit modals)

**Why it matters**: Transactions are the core dataset; every other tab derives from them.

**Screenshot reference(s)**: `[docs/screenshots/transactions.png](docs/screenshots/transactions.png)`, `[docs/screenshots/transactions-selected.png](docs/screenshots/transactions-selected.png)`, `[docs/screenshots/transactions-add-category.png](docs/screenshots/transactions-add-category.png)`, `[docs/screenshots/transactions:[id]-edit.png](docs/screenshots/transactions:[id]-edit.png)`, `[docs/screenshots/transactions:[id]-edit.png](docs/screenshots/transactions:[id]-edit.png)`

**Scope**
Feature folder: `src/features/transactions/`

- `index.ts`
- `screens/TransactionsScreen.tsx`
- `components/TransactionsList.tsx`, `TransactionRow.tsx`, `TransactionsSelectionBar.tsx`
- `components/TransactionEditModal.tsx` and `components/CategoryPickerModal.tsx`
- `services/transactionsService.ts` and other small service files
- `utils.ts` (date grouping, formatting)

Main flows to implement (functional, local-only):

- Group transactions by day sections (Today/Yesterday/Date label style).
- Search field (local filtering by transaction name).
- Add new transaction button (opens edit modal).
- Multi-select mode (selection bar with “Category”, “Tag”, “…”).
- Transaction edit modal:
  - display transaction date/name/amount/category/account card
  - actions buttons row: Split, Recurring, Tag, Goal (implement as toggles/links that set related IDs)
- Category picker modal including “New category” and “Exclude”.

**Technical implementation details**

- Use React Query for reading transactions list from Drizzle.
  - `useQuery(['transactions', filters], () => transactionsService.list(...))`
- Use FlashList for the grouped transaction list.
- Implement grouping in `utils.ts` as a pure function.
- Business logic in `services/`:
  - list transactions
  - apply search and selection changes
  - save edits (upsert)
- Use router modal routes or in-tree modal components. (For screenshot accuracy, use actual modal bottom sheet style if already used in your app template.)

**Todo checklist**

1. Create `src/features/transactions/` folder structure.
2. Implement `transactionsService.listTransactions({ query, dateRange, groupBy })`.
3. Implement `TransactionsScreen`:

- top search input and right-side icon
- empty state shell
- loading skeleton
- FlashList grouped sections rendering `TransactionRow`.

1. Implement selection logic (local state):

- long-press/tap-to-select
- update selection bar counts.

1. Implement `CategoryPickerModal` with category list rows + “New category” + “Exclude”.
2. Implement `TransactionEditModal` UI matching screenshot layout:

- header “TRANSACTION” and date
- transaction name, amount
- category label and account card
- bottom buttons: Split/Recurring/Tag/Goal.

1. Wire modal actions to save changes using `transactionsService.updateTransaction`.
2. Add query invalidation (`queryClient.invalidateQueries`) after mutations.

### Task 4.2 — Implement Dashboard feature (hero charts, to-review list, upcoming recurrings, budgets summary)

**Why it matters**: It’s the “at-a-glance” experience; screenshot-driven UI needs consistent cards and chart interactions.

**Screenshot reference(s)**: `[docs/screenshots/dashboard.png](docs/screenshots/dashboard.png)`, `[docs/screenshots/dashboard-2.png](docs/screenshots/dashboard-2.png)`

**Scope**
Feature folder: `src/features/dashboard/`

- `screens/DashboardScreen.tsx`
- `components/HeroSpentCard.tsx`, `ToReviewCard.tsx`, `UpcomingRecurringsCard.tsx`, `BudgetsSummaryCard.tsx`
- `services/dashboardService.ts`
- `utils.ts` (formatting & derived metrics)

Implement:

- Hero card that shows “spent this month/last month” + trend line/marker.
- “To Review” list (merchant/name rows with category chips and amounts).
- Upcoming block showing next recurring payments (with link affordance).
- “Net this month” breakdown (Income/Spend/Excluded spend).
- Budgets summary section (dashboard-2) with circular category budget indicators and left-to-budget values.

**Technical implementation details**

- Derive metrics from `transactions`, `budgets`, `recurrings`, `cashflow_snapshots`.
- Use victory-native-xl charts for the hero trend and net-income charts.
- Ensure charts are driven by deterministic seed data.

**Todo checklist**

1. Create `src/features/dashboard/` structure.
2. Implement `dashboardService.getDashboardModel()` returning a typed view model.
3. Build hero spent card:

- match screenshot card spacing and typography
- render a simple line/trend with a highlighted dot

1. Implement to-review list UI (FlashList if needed):

- use `needsReview` transactions
- render row chips like screenshot.

1. Implement upcoming recurrings:

- show next payment entries
- link affordance (press opens transactions/recurrings screen).

1. Implement budgets summary (dashboard-2):

- render category donut indicators and “$X left/under”.

1. Add loading/empty/error shells.

### Task 4.3 — Implement Accounts feature (net worth card + account sections)

**Why it matters**: Accounts are the navigation anchor for understanding balances; net worth graph should update based on seeded data.

**Screenshot reference(s)**: `[docs/screenshots/accounts.png](docs/screenshots/accounts.png)`

**Scope**
Feature folder: `src/features/accounts/`

- `screens/AccountsScreen.tsx`
- `components/NetWorthCard.tsx`, `AccountSection.tsx`, `AccountCard.tsx`
- `services/accountsService.ts`
- `utils.ts` formatting

Implement:

- Net worth graph card with timeframe labels visible (1W/1M/3M/YTD/1Y style).
- Gear icon affordance for grouping/exclusion.
- Account sections list (Credit cards, Depository, etc.) with account cards and “add” button.

**Technical implementation details**

- `accountsService.getNetWorthSeries(timeframe, options)`:
  - compute from `accounts` + optionally `cashflow_snapshots` seed.
- FlashList for account list.

**Todo checklist**

1. Create `src/features/accounts/` structure.
2. Implement net worth chart:

- simple line chart with dot hover disabled (local-only)

1. Implement “Credit cards” and “Depository” sections:

- section header caret
- account cards with chips (CHAS/E etc.)

1. Add loading/empty/error.
2. Add `accountsService.getAccountsGroupedByType()`.

---

## Phase 5: Middle features (Recurrings, Savings/Goals, Budgets/Categories)

### Task 5.1 — Implement Recurrings feature (grid + monthly recurring modal)

**Why it matters**: Recurrings drive “upcoming” and “to pay” experiences and feed transactions/transactions edit actions.

**Screenshot reference(s)**: `[docs/screenshots/recurrings.png](docs/screenshots/recurrings.png)`, `[docs/screenshots/recurrings:[id].png](docs/screenshots/recurrings:[id].png)`

**Scope**
Feature folder: `src/features/recurrings/`

- `screens/RecurringsScreen.tsx`
- `components/RecurringSummaryDonut.tsx`, `RecurringGrid.tsx`, `RecurringCard.tsx`
- `components/RecurringEditModal.tsx`
- `services/recurringsService.ts`
- `utils.ts`

Implement:

- Donut card showing left-to-pay for the month.
- Grid of monthly recurring cards with dates and checkmarks.
- Plus tile for adding new recurring (can open an edit modal in a simplified default state).
- Recurring edit modal for “monthly recurring”:
  - title, description, next payment, timeline bar
  - list of occurrences
  - actions at bottom: Rename, Edit transactions, Delete.

**Technical implementation details**

- `recurringsService.generateMonthlyOccurrences(recurringId, month)` deterministic.
- Map recurring occurrences into transactions updates (e.g., toggling apply/cancel) as future expansion.

**Todo checklist**

1. Create `src/features/recurrings/` structure.
2. Implement `RecurringsScreen`:

- donut card + grid

1. Implement recurring edit modal:

- reuse `CategoryPill` and emoji rendering from shared helpers.

1. Add services for CRUD:

- update recurring fields
- delete recurring

1. Ensure modals are keyboard/gesture safe.

### Task 5.2 — Implement Savings Goals feature (Goals header card + goals list)

**Why it matters**: It’s Copilot’s motivation layer; progress visualization must be accurate and interactive.

**Screenshot reference(s)**: `[docs/screenshots/goals-header.png](docs/screenshots/goals-header.png)`, `[docs/screenshots/goals-list.png](docs/screenshots/goals-list.png)`

**Scope**
Feature folder: `src/features/savings/`

- `screens/SavingsGoalsScreen.tsx`
- `components/GoalHeaderCard.tsx`, `GoalsSectionList.tsx`, `GoalRow.tsx`
- `components/GoalProgressWheel.tsx` (donut style)
- `services/savingsService.ts`
- `utils.ts`

Implement:

- Goals header card:
  - left: “$X saved in ”
  - center donut wheel
  - right: “$Y to go in ”
  - gear icon affordance.
- Goals list:
  - Active section with each goal row:
    - icon + goal name
    - right: “$saved / $target”
    - progress bar
    - “N months left” text and a right-aligned “Dec 2025”-style date
    - monthly check circles for the goal timeline
  - Ready to spend section.

**Technical implementation details**

- Derive header values from `savings_goals` + seed month.
- Render timeline check circles deterministically from goal’s saved/progress.

**Todo checklist**

1. Create `src/features/savings/` structure.
2. Implement `savingsService.getGoalsViewModel({ month })`.
3. Implement header card UI matching screenshot spacing/typography.
4. Implement goals list:

- two grouped sections (Active, Ready to spend)

1. Add interaction:

- tap goal row opens a simplified detail modal (can be stub initially but must not crash).

1. Add loading/empty/error.

### Task 5.3 — Implement Budgets feature via Categories UI (budgets list + rebalance modal + category edit)

**Why it matters**: Budgets affect Dashboard metrics and guide user action. Screenshot-driven rebalancing preview is a key interaction.

**Screenshot reference(s)**: `[docs/screenshots/categories.png](docs/screenshots/categories.png)`, `[docs/screenshots/categories-rebalance-budget.png](docs/screenshots/categories-rebalance-budget.png)`, `[docs/screenshots/categories:[id]-editable.png](docs/screenshots/categories:[id]-editable.png)`, `[docs/screenshots/categories:[id]-transaction.png](docs/screenshots/categories:[id]-transaction.png)`

**Scope**
Feature folder: `src/features/budgets/` (internally uses categories data)

- `screens/BudgetsScreen.tsx` (renders categories/budget view)
- `components/CategoriesSummaryCard.tsx`, `CategoryRow.tsx`
- `components/RebalanceBudgetsModal.tsx`
- `components/CategoryEditModal.tsx`
- `components/CategoryTransactionModal.tsx`
- `services/budgetsService.ts`
- `utils.ts`

Implement:

- Categories/budgets summary:
  - donut showing spent vs budget + total budget label
  - category list split into SPENT and EXCLUDED (with progress bars)
  - bottom buttons: “ADD A CATEGORY” + “REBALANCE BUDGETS”.
- Rebalance budgets modal preview:
  - list items with +$ and percent delta and arrow direction
  - “Only this month” vs “From now on” toggles
  - Save button.
- Category edit modal:
  - category title + budget mode dropdown
  - bar chart of monthly budget
  - key metrics + transactions preview
  - Save button.

**Technical implementation details**

- `budgetsService.getCategoriesBudgetModel()` returns spent/excluded lists.
- `budgetsService.computeRebalanceSuggestions(month)`:
  - based on actual spending derived from `transactions` vs set `budgets`.
- Category edit persists to `budgets` and `categories` as appropriate.

**Todo checklist**

1. Create `src/features/budgets/` structure.
2. Implement `BudgetsScreen`:

- donut card
- FlashList categories list
- footer buttons wired to modals

1. Implement `RebalanceBudgetsModal` UI exactly as screenshot:

- toggles and preview list

1. Implement `CategoryEditModal` UI exactly as screenshot:

- budget dropdown
- monthly bars
- key metrics and transactions preview

1. Implement `CategoryTransactionModal` as an overlay/detail triggered from category transaction selection.
2. Add loading/empty/error.

---

## Phase 6: Advanced features (Cash Flow, Investments)

### Task 6.1 — Implement Cash Flow feature (charts + excluded spend)

**Why it matters**: Cash flow is a core visual insight; it also explains excluded spend behavior.

**Screenshot reference(s)**: `[docs/screenshots/cash-flow.png](docs/screenshots/cash-flow.png)`, `[docs/screenshots/cash-flow-spent.png](docs/screenshots/cash-flow-spent.png)`, `[docs/screenshots/cash-flow-net-income-modal.png](docs/screenshots/cash-flow-net-income-modal.png)`, `[docs/screenshots/cash-flow-net-income-selected.png](docs/screenshots/cash-flow-net-income-selected.png)`

**Scope**
Feature folder: `src/features/cashflow/`

- `screens/CashFlowScreen.tsx`
- `components/NetIncomeCard.tsx`, `SpendCard.tsx`, `CashFlowMonthRangePicker.tsx`
- `components/NetIncomeDetailsModal.tsx`
- `services/cashflowService.ts`
- `utils.ts`

Implement:

- Net income card:
  - show net income value and green/red trend
  - render chart and allow tapping a bar/point to open details.
- Spend card:
  - stacked bar chart for spend
  - timeframe selector (4W, 3M, 1Y, MTD, YTD) shown on screenshot
- Excluded transactions:
  - include a toggle or menu option to incorporate excluded spend in calculations.
- Details modal:
  - list months with total income, expenses and totals (from screenshot).

**Technical implementation details**

- `cashflowService.getCashFlowModel({ range, includeExcluded })` reading from `cashflow_snapshots` and `transactions`.
- Chart rendering with victory-native-xl.

**Todo checklist**

1. Create `src/features/cashflow/` structure.
2. Implement `CashFlowScreen` card layout to match screenshot card spacing.
3. Implement chart components driven by view model data.
4. Implement details modal for net income.
5. Ensure excluded spend toggle updates both Dashboard and Cash Flow derived calculations (via shared service or derived from shared queries).

### Task 6.2 — Implement Investments feature (holdings list + display filter sheet)

**Why it matters**: Investments add another dimension of personal finance; filters/sorting must behave predictably.

**Screenshot reference(s)**: `[docs/screenshots/investments.png](docs/screenshots/investments.png)`, `[docs/screenshots/investments-filters.png](docs/screenshots/investments-filters.png)`

**Scope**
Feature folder: `src/features/investments/`

- `screens/InvestmentsScreen.tsx`
- `components/InvestmentsSummaryCard.tsx`
- `components/HoldingsList.tsx`, `HoldingRow.tsx`
- `components/InvestmentsFilterSheet.tsx`
- `services/investmentsService.ts`
- `utils.ts`

Implement:

- Summary header portion (ETF name + percent).
- Holdings section with rows:
  - ticker + name
  - small sparkline (red/green) and value
- Filter sheet:
  - display options: Last Price / My Equity / Quantity / Equity Allocation.
  - update holdings row values accordingly.

**Technical implementation details**

- Seed investments holdings and a simple sparkline series for each holding.
- Use deterministic transformation based on display filter.

**Todo checklist**

1. Create `src/features/investments/` structure.
2. Implement `investmentsService.getInvestmentsModel(displayOptions)`.
3. Implement holdings list with FlashList.
4. Implement filter sheet UI and persist selection to `settings` or local component state.
5. Add loading/empty/error.

---

## Phase 7: Cross-cutting polish (premium feel + correctness)

### Task 7.1 — Add loading/empty/error states across all screens

**Why it matters**: Copilot consistently communicates system state.

**Screenshot reference(s)**: `[docs/screenshots/categories:[id].png](docs/screenshots/categories:[id].png)`, `[docs/screenshots/transactions-selected.png](docs/screenshots/transactions-selected.png)`

**Scope**

- Loading skeletons for lists/cards.
- Empty states where screenshots already show “No transactions in ” style.
- Error banners/toasts.

**Technical implementation details**

- Use React Query status flags and shared UI primitives from Phase 2.

**Todo checklist**

1. Audit each feature screen for missing UI states.
2. Implement per-feature empty copy that matches screenshot tone.
3. Add error handling to services (typed errors) and show in UI.

### Task 7.2 — Performance and UX tuning (FlashList, memoization, smooth transitions)

**Why it matters**: Finance apps feel premium when scrolling is smooth and transitions are consistent.

**Screenshot reference(s)**: `[docs/screenshots/transactions.png](docs/screenshots/transactions.png)`, `[docs/screenshots/goals-list.png](docs/screenshots/goals-list.png)`

**Scope**

- Ensure FlashList usage where lists can grow.
- Memoize derived view models.
- Add light animations for modal open/close (avoid heavy re-renders).

**Todo checklist**

1. Use `useMemo` for expensive grouping (transactions by day, savings timeline).
2. Use `React.memo` for row components where appropriate.
3. Ensure Unistyles style objects are created only once.
4. Validate no DB calls are made inside components (services only).

---

## Expected milestone outcome

By end of Phase 4, the app has a functional navigation shell plus: Dashboard + Transactions + Accounts working on real local data with deterministic seed. Phases 5–6 add the remaining feature tabs and their modals/charts, with Phase 7 ensuring premium states and performance.
