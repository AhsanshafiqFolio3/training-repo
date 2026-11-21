# The Bug Bazaar

A small online store for developer gear: rubber ducks, mechanical keyboards, coffee and
stickers. Built with React and TypeScript on top of a mock API, so it runs without a backend.

This project grew out of the Week 1 store project, and its git history is kept.

## Quick start

You need **Node.js 22.12 or newer** (check with `node -v`) and npm.

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

## Environment variables

None are required. To change them, copy `.env.example` to `.env.local`.

| Variable            | Default | Meaning                                                           |
| ------------------- | ------- | ----------------------------------------------------------------- |
| `VITE_USE_MOCK_API` | `true`  | `true` uses the in-browser mock API; `false` calls a real backend |
| `VITE_API_BASE_URL` | `/api`  | Base URL of the API                                               |

## Triggering errors and slow responses

While the mock API is on, a **Mock API controls** panel sits in the bottom-left corner. Use it
to slow responses down, make product requests fail with a 500, or expire the session. The full
list of ways to trigger each error is in [docs/api-contract.md](docs/api-contract.md).

## Folder structure

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

- [API contract](docs/api-contract.md)
- [Decisions](docs/decisions.md): what we chose for each task and why
- [Authentication](docs/auth.md): where the token lives and why
- [AI notes](docs/ai-notes.md)
