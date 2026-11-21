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
