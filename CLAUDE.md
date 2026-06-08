# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server at http://localhost:5173
npm run build      # production build to dist/
npm run preview    # serve the production build locally
npm run lint       # run ESLint
npm test           # run all tests (vitest run — single pass)
npm run test:watch # run tests in watch mode
```

To run a single test file: `npx vitest run src/utils/storage.test.js`

## Architecture

Single-page budget tracker app (React 19 + Vite + Tailwind CSS v4). No backend — all state lives in `localStorage`.

**Data flow:**
- `src/utils/storage.js` — pure read/write helpers for `localStorage`. Exports `CATEGORIES` (the fixed list of 6 categories). No React here.
- `src/hooks/useTransactions.js` — single custom hook that owns all app state: transactions array, monthly limit, and selected month. Computes derived values (`filteredTransactions`, `totalSpent`, `spentByCategory`, `remaining`) with `useMemo`. All mutations call the corresponding `save*()` from `storage.js` immediately (no `useEffect` for persistence).
- `src/App.jsx` — calls the hook, owns only `editingTransaction` UI state, renders all components.
- `src/components/` — four presentational components: `MonthlySummary`, `TransactionForm`, `TransactionList`, `CategoryBadge`. They receive props from `App`; none manage their own business logic state.

**Key constraints:**
- Amounts are always stored as positive floats. Date is always `YYYY-MM-DD` ISO string — month filtering uses `t.date.startsWith(selectedMonth)`, no date library needed.
- `crypto.randomUUID()` is used for IDs (no library).
- Tailwind v4 is loaded via `@tailwindcss/vite` plugin — there is no `tailwind.config.js`. Tailwind is imported in `src/index.css` with `@import "tailwindcss"`.
- Category color mappings are defined locally in each component that needs them (`CategoryBadge.jsx` for pills, `MonthlySummary.jsx` for dots/bars) rather than in a shared file.

## Tests

**Stack:** Vitest 4 + React Testing Library + jsdom. Config lives in `vite.config.js` (`test` key). Setup file: `src/test/setup.js` — provides a `localStorage` mock (required because Vitest 4 + jsdom doesn't expose `localStorage.clear` natively) and imports `@testing-library/jest-dom`.

**Structure:**
- `src/utils/storage.test.js` — unit tests for all storage helpers and the `CATEGORIES` constant
- `src/hooks/useTransactions.test.js` — unit tests for the hook using `renderHook` + `act`; uses `vi.setSystemTime` to pin the current month
- `src/components/TransactionForm.test.jsx` — component tests for add/edit modes, validation, and form reset
- `src/components/TransactionList.test.jsx` — component tests for empty state, sort order, edit/delete callbacks, and `window.confirm` handling
- `src/components/MonthlySummary.test.jsx` — component tests for limit visibility, progress bar, and remaining amount color
- `src/App.test.jsx` — integration tests covering full add/edit/delete/filter/persist flows through the real UI

**Conventions:** `beforeEach` calls `localStorage.clear()` and sets a deterministic system time via `vi.setSystemTime`. `afterEach` calls `vi.useRealTimers()`. `window.confirm` is mocked with `vi.spyOn(window, 'confirm')` in delete tests.

## Git & GitHub Workflow

After every meaningful change, commit and push to GitHub:

```bash
git add <changed files>
git commit -m "type: short description of what changed and why"
git push
```

**Commit message conventions:**
- `feat:` new feature or behaviour
- `fix:` bug fix
- `refactor:` code restructure with no behaviour change
- `test:` adding or updating tests
- `chore:` tooling, config, dependency updates
- `docs:` documentation only

Keep messages concise but descriptive — explain *what* changed and *why*, not *how*. Never use `git add -A` or `git add .` blindly; always stage specific files to avoid committing secrets or build artifacts.
