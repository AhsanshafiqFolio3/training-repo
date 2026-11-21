# Decisions

For each task: what we used, what else we considered, and why.

## Before Day 1: rename and trim

- **Used:** Renamed the Week 1 store to The Bug Bazaar on a new branch, keeping all history.
  Removed what the brief doesn't ask for: the customer dashboard, the project guide page, the
  hero banner, the Playwright e2e setup and the Week 1 docs.
- **Considered:** Keeping the customer dashboard as a side feature.
- **Why:** Less code to maintain and explain. Everything removed is still in the git history.

## D1-1: Setup

- **Used:** Prettier for formatting, oxlint for linting (with React, hooks, a11y and
  TypeScript rules), and `npm run check` to run everything before pushing. A README with
  scripts, env vars, folder structure and naming conventions. `.env.example` lists every variable.
  A lint rule (`unicorn/filename-case`) enforces file names.
- **Considered:** ESLint instead of oxlint. Husky pre-commit hooks.
- **Why:** oxlint was already set up from Week 1, runs in well under a second, and covers the
  rules we need. Pre-commit hooks can be skipped with `--no-verify`, so the real gate will be
  CI on the pull request (D4-6). The app needs no `.env` file to start, which keeps the
  "clone and run in under 5 minutes" goal easy to meet.

## D1-2: HTTP and API contracts (mock API)

- **Used:** A hand-written mock in `src/mocks/`. `mockFetch` has the same signature as
  `fetch`, reads the URL and method, waits a short time, and returns a real `Response` with
  the right status code. 5,000 products come from a seeded random generator, so the data is
  identical on every load and in every test. A small "Mock API controls" panel makes slow
  responses, 500s and expired sessions happen on purpose.
- **Considered:**
  - **MSW (Mock Service Worker):** intercepts real network requests in a service worker. It's
    the common industry choice, but it's an extra library the brief doesn't mention.
  - **json-server or a small Node/Express server:** a real HTTP server, but it's one more
    process to start and it wouldn't run on a static host.
  - **Static JSON files:** can't do search, paging, auth or errors.
- **Why:** The brief says to mock it however we like. A fetch-compatible function needs no
  extra library, runs in tests and on a static host, and is short enough to explain line by
  line. The trade-off is that requests don't show in the browser's Network tab, because no
  real HTTP request is made.
- **Contract details we had to define:** `sort` values, a page size of 24, and an optional
  `inStock` filter. 409 `details` maps each product id to the stock left, so the UI can
  name the item that ran out (D3-2). All of these are written down in `api-contract.md`.

## D1-3: TypeScript

- **Used:** Strict mode plus `noUncheckedIndexedAccess`. Contract types in
  `src/api/types.ts` match the brief exactly. Request status is a discriminated union:

  ```ts
  type RequestState<TData> =
    | { status: 'idle' }
    | { status: 'loading' }
    | { status: 'success'; data: TData }
    | { status: 'error'; error: ApiRequestError }
  ```

- **Considered:** Separate `isLoading`, `error` and `data` fields.
- **Why:** Separate flags allow impossible combinations, such as `isLoading: true` together
  with an `error`, or `data` alongside an `error`. With the union, `data` only exists when
  `status` is `'success'`, and TypeScript makes us check `status` before using it. Lint bans
  `any` and `@ts-ignore`.

## D1-4: Data (one place for requests)

- **Used:** `src/api/client.ts` exports `apiRequest()`, the only function that sends
  requests. It adds JSON headers and the auth token, and turns every error response into an
  `ApiRequestError` (status, code, details). Small typed functions per endpoint sit on top:
  `getProducts`, `getProduct`, `login`, `getCurrentUser`, `createOrder`, `getOrder`.
  `no-restricted-globals` in lint blocks `fetch`, `XMLHttpRequest` and `WebSocket` outside
  `src/api/`.
- **Considered:** axios. Calling `fetch` inside each hook.
- **Why:** `fetch` is built in and enough here. Keeping it in one file means auth, errors and
  the mock/real switch are each written once. Cancelled requests (`AbortError`) are passed
  through untouched, so a cancelled search is not shown as an error.
- **Known trade-off:** The client trusts the server to follow the contract and does not
  re-check response bodies at runtime. A schema library such as zod could do that; for a
  mock we control, it would add code without catching real bugs.

## D2-1: Product list

- **Used:** A responsive CSS grid of product cards, each with image, name, price, stock and
  rating. Each name links to `/products/:id`. The grid is a `<ul>` so screen readers announce
  "list, 24 items". Tab reaches every link and button. On top of that, arrow keys, Home and
  End move between product links, using the number of columns the CSS grid currently shows.
  Prices are only converted from cents in `formatPrice` (with `Intl.NumberFormat`).
- **Considered:** `role="grid"` with a full roving tabindex, so one Tab stop enters the grid.
- **Why:** `role="grid"` promises spreadsheet behaviour for every cell, including the Add
  buttons, which is a lot to get right. A plain list keeps native Tab order working and adds
  arrow keys as a shortcut, with no change to what screen readers expect.

## D2-2: Filters

- **Used:** Search, category, in-stock and sort live in the URL query string
  (`?search=duck&category=ducks&inStock=true&sort=price-asc&page=2`). `useProductFilters`
  reads them with `readFilters` (unknown values fall back to defaults) and writes them with
  `toProductSearchParams`, the **same** function the API client uses. Category, stock, sort
  and page changes add a history entry. Clear filters keeps the sort. Pagination is
  page-numbered, 24 per page.
- **Considered:** Keeping filters in React state, with or without copying them into
  `localStorage`.
- **Why:** The URL is the one place that survives a refresh, can be copied, and works with
  Back. React state is lost on refresh, and `localStorage` isn't shared by a copied link.
  Since the page URL and the API query use the same format and the same helper, they can't
  drift apart.

## D2-3: UI states

- **Used:** `AsyncContent` takes a `RequestState` and render functions for loading, error,
  empty and success. Every data area (list, details, related products) goes through it, with
  the shared `LoadingGrid`/`LoadingDetails`, `ErrorState` and `EmptyState` views.
  Errors have Try again, except "not found", which links back to the shop instead.
- **How to trigger each state:** Slow response speed in the Mock API controls (loading),
  "Product requests fail with 500" (error), a search like `zzz` (empty), and normal use (success).
- **Considered:** Writing `if (loading) … else if (error) …` in each page.
- **Why:** Doing it in one place means no page can forget a state, and they all look the same.
  The `switch` over `status` is exhaustive, so TypeScript flags a missing case.

## D2-4: useEffect and cleanup

- **Used:** `useAsync` creates an `AbortController` per request and aborts it in the effect
  cleanup. React runs that cleanup when the loader changes (a new product id) and when the page
  unmounts. Results from an old loader are ignored even if the abort doesn't reach the network.
  Back to Top listens to `scroll` (passive) and removes the listener in cleanup.
  "More from this category" lets you switch products quickly to see this in action.
- **Considered:** An `isMounted`/`ignore` flag only, without aborting.
- **Why:** A flag hides the stale result but leaves the request running. Aborting also frees
  the network. We keep both: the abort saves work, and the "is this still the current request"
  check is the safety net.

## D2-5: Custom hooks

| Hook                | What it does                                          | Used in                                                |
| ------------------- | ----------------------------------------------------- | ------------------------------------------------------ |
| `useAsync`          | Runs a loader, tracks `RequestState`, aborts, retries | Product list, product details, related products        |
| `useProductFilters` | Reads/writes filters in the URL                       | List page, filter sidebar, toolbar, search box         |
| `useDebouncedValue` | Returns a value only after it stops changing for N ms | Search box (and any future debounced input)            |
| `useEventListener`  | Adds a window listener, removes it on unmount         | Back to Top (and later the live-stock reconnect, D4-4) |
| `useQuantityInCart` | How many of a product are in the cart                 | Product card, product details                          |

- **Why:** Each one replaces code that was written, or would be written, in more than one place,
  and each is typed with generics or exact event types instead of `any`.
- **A bug the tests caught:** after typing a search and pressing Back, the old search came
  back. React Router's `setSearchParams` gets a new identity on every URL change, so
  `updateFilters` changed too, and the search effect re-ran with the old debounced text.
  The fix keeps `setSearchParams` in a ref so `updateFilters` stays stable.

## D2-6: Race conditions

- **Used:** The mock's "Random" response speed gives each request its own delay
  (0.1–1.5 s), so later requests can finish first. The search waits for typing to pause
  (fewer requests), and `useAsync` aborts the previous request and ignores results that
  aren't from the current loader. `SearchRace.test.tsx` forces "old request slow, new
  request fast" and checks the old results never appear. With the guard removed, the test fails.
- **Considered:** Comparing a request counter (`latestRequestId`) against each response.
- **Why:** That's the same idea. `useAsync` does it by comparing the loader and attempt
  that produced the result with the current ones, and the abort comes from the platform.
  Debouncing alone isn't enough: a pause in typing can still leave two requests in flight.
