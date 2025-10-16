# Agents Overview

This document defines the agent layer for the Financial Advisor React app. Each agent encapsulates a single responsibility so that the UI can stay declarative and side-effect free while complex financial logic remains testable and reusable.

## Implementation Notes

- **Technology choices:** React + TypeScript for the UI, Zustand or Redux Toolkit for a predictable state layer, Dexie/localForage for IndexedDB abstraction, and Zod/Yup for input validation.
- **Testing strategy:** Use unit tests for agent logic (pure functions), integration tests for agent orchestration, and Cypress/Playwright for key user journeys (data entry, insight rendering, scenario comparison).
- **Performance:** Memoize heavy calculations (e.g., projections) and debounce persistence writes to reduce IndexedDB pressure.
- **Extensibility:** Agents communicate through typed events/messages to allow future expansion (e.g., hooking a budgeting agent or external APIs) without tight coupling to React components.

## Features

* [ ]  Add a profile view to add details of the user, name, montly income, risk profile, montly expenses
* [ ]  Add a general debt settings view for
