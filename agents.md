# Agents Overview

This document defines the agent layer for the Financial Advisor React app. Each agent encapsulates a single responsibility so that the UI can stay declarative and side-effect free while complex financial logic remains testable and reusable.

## Implementation Notes

- **Technology choices:** React + TypeScript for the UI, Zustand or Redux Toolkit for a predictable state layer, Dexie/localForage for IndexedDB abstraction, and Zod/Yup for input validation.
- **Persistence** in local browser.
- **Testing strategy:** Use unit tests for agent logic (pure functions), integration tests for agent orchestration, and Cypress/Playwright for key user journeys (data entry, insight rendering, scenario comparison).
- **Performance:** Memoize heavy calculations (e.g., projections) and debounce persistence writes to reduce IndexedDB pressure.
- **Extensibility:** Agents communicate through typed events/messages to allow future expansion (e.g., hooking a budgeting agent or external APIs) without tight coupling to React components.

## Features

* [ ]  Add a profile view to add details of the user, name, montly income, risk profile, montly expenses
* [ ]  Add a general debt settings view for add new debts. Each debt should have Loan Name, Original Amount, Current Balance, Interest Rate EA (%), Monthly Payment (capital + other cost like insurance) , Months Remaining. For this initial version this loans will be a fixed rate montly cuota.
* [ ]  For each Load and a view where we can see the payment simulation with the reduction of the capital. This view is a table with rows per month and the number of the payment, abono a capital, abono a intereses, insurance cost, total cuota (always fixed), and saldo. At the end of the simulation add some sub total and other imprtant metrics. The data for this view must be calculated when the information debt is stored.
