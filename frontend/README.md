# Financial Advisor Agents

A React + TypeScript single-page app that demonstrates an agent-oriented layer for capturing client profiles, modeling debts, and generating fixed-cuota amortization schedules. State is orchestrated with Zustand, persisted to IndexedDB via Dexie, and validated with Zod so the UI stays declarative while business logic remains portable and testable.

## Getting Started

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and the app will load existing data from IndexedDB or start with empty state.

## Available Scripts

- `npm run dev` – start the Vite dev server with hot module replacement
- `npm run build` – type-check and produce a production build
- `npm run lint` – run ESLint across the project
- `npm run test` – execute Vitest in watch/interactive mode
- `npm run test:coverage` – run the Vitest suite once and emit coverage (text, HTML, LCOV)

## Feature Tour

- **Profile view** – Collects a client's name, monthly income/expenses, and risk profile using Zod validation before persisting to IndexedDB.
- **Debt settings** – Add, edit, and delete fixed-rate debts (original amount, current balance, EA rate, monthly cuota, insurance cost, remaining term). All inputs are validated and synced to storage.
- **Simulation view** – Renders the amortization table per month with capital/interest/insurance splits, running balance, and summary metrics (total principal, total interest, total insurance, payoff horizon/date).

## Agents Layer

- `agents/profileAgent.ts` encapsulates profile persistence and validation.
- `agents/debtAgent.ts` manages debt persistence plus the amortization engine used across the UI and tests.
- `store/useFinancialStore.ts` composes agents inside a Zustand store, memoizing simulation results and coordinating selection state for the UI.

## Testing Strategy

The Vitest suite focuses on pure agent logic:

- `src/agents/schemas.test.ts` asserts schema normalization and safeguards.
- `src/agents/debtAgent.test.ts` checks the amortization math and failure modes for insufficient payments.

Run `npm run test` after adjusting financial formulas to guard against regressions.

## Data Persistence

All domain entities live in the browser's IndexedDB (`financialAdvisorDB`). Dexie handles schema migrations and simple CRUD while the agents serialize data into browser-friendly shapes. Because the simulations are derived data, they are recomputed in-memory to avoid bloating storage.
