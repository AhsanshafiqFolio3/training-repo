# The Bug Bazaar

A small online store for developer gear: rubber ducks, mechanical keyboards, coffee and
stickers. Built with React and TypeScript on top of a mock API, so it runs without a backend.

This project grew out of the Week 1 store project, and its git history is kept.

## Quick start

You need **Node.js 22.22.2, 24.15 or 26 and newer** (check with `node -v`) and npm. CI runs on
Node 26.

```bash
git clone https://github.com/AhsanshafiqFolio3/training-repo.git
cd training-repo
npm ci
npm run dev
```

Open the URL Vite prints, normally <http://127.0.0.1:5173>. That's it: the mock API starts
with the app and no `.env` file is needed.

Demo login: `ada@bugbazaar.dev` / `debug123`.

## Scripts

| Command                | What it does                                                         |
| ---------------------- | -------------------------------------------------------------------- |
| `npm run dev`          | Start the dev server with hot reload                                 |
| `npm run build`        | Type-check, then build the production site into `dist/`              |
| `npm run preview`      | Serve the `dist/` build locally                                      |
| `npm test`             | Run all tests once (Vitest + Testing Library)                        |
| `npm run test:watch`   | Re-run tests as files change                                         |
| `npm run typecheck`    | Strict TypeScript check, no output files                             |
| `npm run lint`         | Lint with oxlint; any warning fails                                  |
| `npm run format`       | Format every file with Prettier                                      |
| `npm run format:check` | Check formatting without changing files                              |
| `npm run check`        | Formatting, lint, type check and tests together (run before pushing) |

## CI and deploy

- **CI** (`.github/workflows/ci.yml`) runs on every pull request and every push to `main`:
  formatting, lint, type check, tests and a production build. Any failure fails the check.
- **Deploy** (`.github/workflows/deploy.yml`) runs on every push to `main`. It runs the
  checks again, builds the site for `/training-repo/`, and publishes it to GitHub Pages.

Two settings have to be switched on once in the repository on GitHub (they can't be set
from code):

1. **Block merges when CI fails:** Settings → Branches → Add branch ruleset (or "Add rule")
   for `main` → turn on **Require status checks to pass** → add the check
   **Lint, type check, test and build**. Also turn on **Require a pull request before merging**.
2. **Publish the site:** Settings → Pages → Source: **GitHub Actions**.

## Environment variables

None are required. To change them, copy `.env.example` to `.env.local`.

| Variable            | Default | Meaning                                                           |
| ------------------- | ------- | ----------------------------------------------------------------- |
| `VITE_USE_MOCK_API` | `true`  | `true` uses the in-browser mock API; `false` calls a real backend |
| `VITE_API_BASE_URL` | `/api`  | Base URL of the API                                               |

## Triggering errors and slow responses

While the mock API is on, a **Mock API controls** panel sits in the bottom-left corner. Use it
to slow responses down, make product requests fail with a 500, expire the session, or take the
live stock server down to watch the app reconnect. The full
list of ways to trigger each error is in [docs/api-contract.md](docs/api-contract.md).

## Folder structure

More detail, with a data flow diagram, is in [docs/architecture.md](docs/architecture.md).

```text
src/
  api/        The only code that talks to the server: client, endpoint functions, types
  app/        App shell and routes
  features/   One folder per feature (store, cart, …) with its components, hooks and tests
  mocks/      The mock API: fetch replacement, seeded data, handlers, controls panel
  shared/     Reusable components, hooks and helpers used by several features
  styles/     CSS, one file per area, imported in order from index.css
  test/       Test setup
docs/         Written tasks: API contract, decisions, AI notes and so on
public/       Static files served as-is (fonts, product images)
```

Tests sit next to the file they test, as `<name>.test.ts` or `<name>.test.tsx`.

## Naming conventions

**Every file and folder name is kebab-case**: components, hooks, slices, tests, CSS, all of
them. A file is named after the main thing it exports.

| What                           | Style             | Example                                           |
| ------------------------------ | ----------------- | ------------------------------------------------- |
| Folders                        | kebab-case        | `features/cart`, `mocks/handlers`                 |
| Files (`.ts`, `.tsx`, `.css`)  | kebab-case        | `product-card.tsx`, `use-async.ts`, `pages.css`   |
| Test files                     | kebab-case        | `cart-slice.test.ts`, `checkout-page.test.tsx`    |
| CSS class names                | kebab-case        | `.product-card`, `.cart-line`                     |
| Components, types              | PascalCase        | `ProductCard` (in `product-card.tsx`), `CartLine` |
| Hooks                          | `use` + camelCase | `useAsync` (in `use-async.ts`)                    |
| Functions and variables        | camelCase         | `getProducts`, `quantityInCart`                   |
| Booleans                       | `is`/`has` prefix | `isSoldOut`, `hasActiveFilters`                   |
| Redux actions                  | past-tense event  | `itemAdded`, `sessionExpired`                     |
| Redux selectors                | `select` + noun   | `selectCartCount`, `selectIsSignedIn`             |
| Fixed values and lookup tables | UPPER_SNAKE_CASE  | `PAGE_SIZE`, `SORT_LABELS`                        |
| API functions                  | HTTP-style verb   | `getProduct`, `createOrder`, `login`              |

Lint enforces kebab-case file names (`unicorn/filename-case`), so a file like
`ProductCard.tsx` fails `npm run lint`. Prettier handles formatting.

## Rules this codebase follows

- Components never call `fetch`. They use the functions in `src/api/`, which all go through
  `src/api/client.ts`. Lint blocks `fetch` anywhere else.
- Prices are whole cents everywhere and are only turned into dollars by `formatPrice`.
- No `any` and no `@ts-ignore`. TypeScript runs in strict mode with
  `noUncheckedIndexedAccess`.

## Docs

- [Architecture](docs/architecture.md): folder structure, data flow, where state lives, design patterns
- [Orders](docs/orders.md): the order service, queue and workers behind checkout
- [API contract](docs/api-contract.md)
- [Decisions](docs/decisions.md): what we chose for each task and why
- [Authentication](docs/auth.md): where the token lives and why
- [Performance](docs/performance.md): what we measured, what we fixed, what we skipped
- [Monitoring](docs/monitoring.md): how errors are caught and logged, and what we'd track
- [AI notes](docs/ai-notes.md)
