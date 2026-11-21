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
  page-numbered, 24 per page. (Changed on Day 4: the list now loads more as you scroll, so
  the page number left the URL. See D4-3.)
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
  aren't from the current loader. `search-race.test.tsx` forces "old request slow, new
  request fast" and checks the old results never appear. With the guard removed, the test fails.
- **Considered:** Comparing a request counter (`latestRequestId`) against each response.
- **Why:** That's the same idea. `useAsync` does it by comparing the loader and attempt
  that produced the result with the current ones, and the abort comes from the platform.
  Debouncing alone isn't enough: a pause in typing can still leave two requests in flight.

## D3-1: Redux Toolkit

- **Used:** One store (`src/store/store.ts`) with two slices: `cart` (`cart-slice.ts`) and
  `session` (`session-slice.ts`). State changes only through the slice's actions, named as
  events (`itemAdded`, `quantityChanged`, `stockChecked`, `cartCleared`, `signedIn`,
  `sessionExpired`). The header badge reads `selectCartCount`, a memoised selector
  (`createSelector`) derived from the cart lines; there is no stored count that could drift.
  Typed hooks `useAppDispatch`/`useAppSelector` live in `src/store/hooks.ts`.
- **Considered:** Keeping the Week 1 `useReducer` + Context, or Zustand.
- **Why:** The brief asks for Redux Toolkit. Compared with Context, Redux only re-renders the
  components whose selected value changed, and every change is a named action you can follow
  in Redux DevTools. Immer lets reducers be written as plain updates while state stays
  immutable.
- **What's _not_ in Redux:** server data (products, orders). That lives in the request cache
  (D3-5). Filters live in the URL (D2-2). Redux holds only what the client owns: the cart and
  the session.

## D3-2: Cart

- **Used:**
  - A `/cart` page with −/+ buttons and a number input. The reducer clamps every quantity to
    `0..stock`, so no UI path can exceed stock, and 0 removes the line.
  - The cart is saved to `localStorage` on every change and loaded when the app starts.
  - Checkout (`/checkout`, signed-in only) sends `POST /api/orders` and shows `/orders/:id`.
  - **409:** the error's `details` map product id → units left. The page names each item
    ("only 2 left (you asked for 4)") and **Update my cart** applies the real stock via
    `stockChecked`.
  - **No double orders:** the button is disabled while sending, and a ref blocks a second
    click before re-render. More importantly, each checkout gets an **idempotency key**
    (`crypto.randomUUID()`, made in the action's `prepare` step so the reducer stays pure).
    It is saved with the cart and sent as `Idempotency-Key` on every retry. If the first
    request reached the server but the reply was lost, the retry returns the same order
    instead of creating a second one. Changing the cart clears the key, because it's a
    different order.
- **How to see it:** in Mock API controls tick "Lose the reply to new orders", place an order
  (the order is saved but the app sees a network error), untick it, press **Try again**: you
  get the same order number, and only one order exists.
- **Considered:** Only disabling the button.
- **Why:** Disabling stops double clicks, but not a retry after a timeout, a refresh, or a
  flaky network. Only the server can know "I already did this", and the key is how it knows.

## D3-3: Auth

See [auth.md](auth.md) for the flow and the token storage trade-off (token in Redux, copied
to `sessionStorage`; `httpOnly` cookie in production).

## D3-4: Backend errors

- **Used:** `src/api/error-messages.ts` maps every `ApiRequestError` to one kind, and each
  kind has one response:

  | Status | Kind            | What the user sees                                                 |
  | ------ | --------------- | ------------------------------------------------------------------ |
  | 400    | `invalid-input` | Field errors under each input (`aria-invalid`, `aria-describedby`) |
  | 401    | `signed-out`    | Session cleared, sent to login with "Your session ended"           |
  | 404    | `not-found`     | The Not Found page                                                 |
  | 409    | `out-of-stock`  | The items that ran out, by name, and **Update my cart**            |
  | 500    | `server`        | "Something went wrong on our side" and **Try again**               |
  | none   | `offline`       | "We couldn't reach the store" and **Try again**                    |

  `ApiErrorView` renders this for any page, and the 401 handling happens once in the API
  client.

- **Raw messages never reach the screen:** pages only show text from `error-messages.ts`.
  `error.message` is for developers (logs, D4-7). The only server text shown is 400 field
  details, which the contract defines as short user-facing hints ("Enter your email address.").
  A test checks that no description contains the server's message.
- **Considered:** Handling errors separately in each page.
- **Why:** One mapping means the same status always looks the same, and a new page gets
  correct error handling by using `ApiErrorView`.

## D3-5: Caching

- **Used:** `useAsync` takes an optional cache key. Results are kept in a small in-memory
  cache (`src/shared/request-cache.ts`) for 60 seconds. While a result is fresh, revisiting
  the page shows it immediately and sends no request. **Try again** skips the cache. After an
  order, `invalidateCache('product')` drops every product result, so the next visit shows
  the new stock. Orders and `/api/me` are never cached, because their whole point is the
  current status.
- **When stale data is acceptable:** product names, prices, images and ratings change rarely,
  so a minute-old copy is fine. Stock is the risky field: it can be a minute out of date.
  That's acceptable because the server checks stock again when the order is placed (409),
  and live stock updates come in D4-4. It wouldn't be acceptable for an order's status, a
  payment result, or the signed-in user, so those always come from the server.
- **Considered:** RTK Query (part of Redux Toolkit), which caches by endpoint and argument
  and has tag-based invalidation.
- **Why we didn't:** RTK Query would replace `useAsync`, including the request cancelling and
  race protection built and tested on Day 2. A 40-line cache on top of the existing hook
  gives the behaviour the task asks for, and every line can be explained. What we give up:
  RTK Query also merges identical requests in flight, refreshes in the background, and has
  DevTools support. With more server data or more pages sharing it, we would switch.

## D4-1: Accessibility

- **Used:** Lighthouse's accessibility audit on the production build, then fixed everything
  it reported. Scores went from 95 / 95 / 96 to **100 / 100 / 100** on the home, cart and
  login pages (and 100 on the cart with items in it). The fixes:
  - **Contrast:** the grey text was 3.4:1 against the background; small text needs 4.5:1.
    The `--muted` colour and the nav links are now 5.1:1, the green status text 5.8:1.
  - **Heading order:** the shop went from `h1` straight to `h3` on each card. Cards in the
    shop are now `h2`; related products stay `h3` under their own `h2`.
  - **Button names:** the Add button's visible text is "Add (2)" or "Max added", but its
    screen reader name was "Add … to cart". Voice control users say what they see, so the
    name now starts with the visible text, followed by the product name for screen readers.
- **Form errors are announced:** the login form puts its error summary in `role="alert"`, so
  screen readers read it as soon as it appears. Each field with an error gets
  `aria-invalid` and `aria-describedby` pointing at its message. A test checks all three.
- **Also kept from earlier days:** a skip link, visible focus outlines, keyboard movement in
  the grid (still working with virtualization), and `role="status"` for the live stock badge.
- **Considered:** an automated checker such as axe inside the tests.
- **Why not:** Lighthouse runs the same axe rules, and the brief asks for Lighthouse scores.
  Adding axe to the tests would be one more dependency for checks we already ran.
  **Limits:** automated audits find only part of the real problems. We also checked the
  grid's arrow keys, Home and End in Chrome after virtualization, but we haven't tested the
  whole store with a screen reader. That would be the next step.

## D4-2: Performance

- **Used:** We measured before changing anything, in Chrome on the production build, and
  fixed the two slowest spots we found: every card re-rendering when a page loads (fixed
  with `React.memo` on `ProductCard`), and 5,000 cards in the DOM (fixed with
  virtualization, D4-3). All numbers, before and after each fix, are in
  [performance.md](performance.md).
- **Considered:** Starting with the obvious suspects without measuring, such as the mock
  API filtering and sorting 5,000 products on every request.
- **Why:** Measuring showed the mock's sort takes 0.2 to 2.6 ms, so "optimizing" it would
  have changed nothing. The real costs were in rendering, and they grew with the length of
  the list, which is what the measurements pointed to.

## D4-3: Memoization and virtualization

- **Used:** Infinite scroll (`useProductPages` keeps loading the next page as you scroll,
  with a **Load more products** button for keyboard users), so the list can really reach
  5,000 products. Our own window virtualization (`useVirtualRows` and `VirtualProductGrid`)
  draws only the rows near the screen. `memo` on `ProductCard`, and a stable key handler
  so the memo isn't undone. Each card selects only its own live stock.
- **Considered:** Keeping numbered pages (24 cards, so nothing is ever slow), and libraries
  such as `react-window` or TanStack Virtual.
- **Why:** Numbered pages would avoid the problem rather than solve it, and the task is
  about a 5,000-item list. The libraries solve harder cases (rows of different heights),
  while our rows are all one height, so about 100 lines of our own code do the job and we
  can explain every one. The page number left the URL, since "page 7" means nothing when
  pages pile up; the filters are still in the URL. The cost: a copied link opens at the top
  of the list, not at the same scroll position. What we skipped and why is in
  [performance.md](performance.md).

## D4-4: WebSockets (live stock)

- **Used:** A WebSocket to `/api/stock` (described in [api-contract.md](api-contract.md)).
  The shop watches the products on screen, and the details page watches its product.
  `openStockFeed` (`src/api/stock-feed.ts`) reconnects after a drop, waiting longer after
  each failure (1 s, 2 s, 4 s … up to 15 s, with random jitter). After reconnecting it
  subscribes again, and the server replies with current stock, so nothing missed stays
  wrong. `useLiveStock` opens the feed when a page mounts and closes it in the effect's
  cleanup, which also cancels a planned reconnect. Live values go into a small Redux slice
  (`stock`), and each card selects only its own product's stock. A badge shows "Live stock"
  or "Reconnecting…". The mock runs a pretend socket server, and the mock controls can take
  it down to show the recovery.
- **Considered:** Polling `GET /api/products/:id` every few seconds, and server-sent events
  (SSE).
- **Why:** Polling is the simplest and works through any proxy, but it either asks too
  often (wasted requests when nothing changed) or too rarely (stale stock). It also costs a
  request per product on screen, or a new batch endpoint. SSE would fit too, since data
  only flows one way, but the client also tells the server what it watches, which with SSE
  needs a second channel (a POST). A WebSocket does both on one connection.
  When we'd pick polling instead: rare changes, or a network that blocks WebSockets.
- **Where live stock lives:** in Redux, not inside the page, because the shop, the details
  page and related products all show stock. After an order we reset it along with the
  cache, since the newly fetched data is fresher. The cart doesn't follow live stock; the
  server still checks stock when the order is placed (409).
- **Closing when the page closes:** leaving the page unmounts it, and the cleanup closes the
  socket and removes its listeners (one `AbortController` per connection). When the
  browser tab itself closes, the browser closes every socket. A test checks that no socket
  and no timer is left after the page unmounts.

## D4-5: Testing

- **Used:** Vitest and Testing Library, testing what a user sees and does: tests find
  elements by role and label, click and type with `user-event`, and check the screen, the
  URL and the requests the mock received. They don't check component state or which
  functions were called. 84 tests in total. The areas the brief names:

  | Area                  | Where                                                                    |
  | --------------------- | ------------------------------------------------------------------------ |
  | Cart logic            | `cart-slice.test.ts` (stock limits, totals, checkout key), `cart-page`   |
  | Custom hooks          | `custom-hooks.test.tsx` (debounce, event listener), `use-async.test.tsx` |
  | Login                 | `auth.test.tsx` (redirect back, double submit, 400, 401, logout)         |
  | Filtering             | `filters-page.test.tsx`, `product-filters.test.ts`, `search-race`        |
  | Checkout success, 409 | `checkout-page.test.tsx` (order placed, 409 names the item, retry safe)  |

  Day 4 added tests for the infinite list (including the same race as D2-6, now for a late
  page), live stock (updates, reconnect, nothing left running), and error logging.

- **How we know the tests mean something:** for the important ones we broke the code on
  purpose and checked the test failed: removing the reconnect, and removing both race
  protections from `useProductPages`. Each time the test failed, and passed again once the
  code was put back.
- **Considered:** end-to-end tests in a real browser (Playwright).
- **Why not:** they need a browser download and another tool the brief doesn't mention.
  Testing Library tests run the real pages, routes and store against the mock API, which
  covers the same flows in seconds. What they can't see is layout: virtualization and
  scrolling were checked in Chrome by hand (see performance.md).

## D4-6: Git, CI and CD

- **Used:** GitHub Actions. `ci.yml` runs on every pull request and every push to `main`:
  install with `npm ci`, then formatting, lint, type check, tests and a production build.
  Branch protection on `main` (set in GitHub's settings, steps in the README) makes that
  check required, so a failing test blocks the merge. **Bonus:** `deploy.yml` publishes
  `main` to GitHub Pages after running the checks again.
- **Details:**
  - `npm ci`, not `npm install`: it installs exactly the versions in `package-lock.json` and
    fails if the lock file is out of date, so CI tests what we tested.
  - `concurrency` cancels an older run when a newer commit is pushed to the same branch.
  - CI runs on Node 26, like local development. While choosing it we found our `engines`
    field was wrong (`>=22.12`): jsdom and React Router need at least 22.22, so it now says
    `^22.22.2 || ^24.15.0 || >=26`.
  - GitHub Pages serves the site from `/training-repo/`, so the deploy builds with that
    base path (`BASE_PATH`), the router uses it as `basename`, and the font files use
    relative URLs. Pages has no "send every path to index.html" rule, so the deploy copies
    `index.html` to `404.html` to make deep links work.
- **Considered:** Netlify or Vercel for the deploy.
- **Why:** GitHub Pages needs no extra account, secret or token: the code, the checks and
  the site all stay in the same repository.

## D4-7: Monitoring

- **Used:** Two error boundaries. One around each page, so a crash replaces only that page
  and the header and cart keep working, and one around the whole app as a last resort.
  `componentDidCatch` sends the error to `reportError` (`src/shared/monitoring.ts`), which
  logs a structured report (message, stack, component stack, page, time). Window listeners
  for `error` and `unhandledrejection` catch what boundaries can't: errors in event
  handlers, timers and promises. The mock controls have **Crash this page** to show it.
  The three things we'd track in production are in [monitoring.md](monitoring.md).
- **Considered:** Sentry from the start.
- **Why not yet:** it needs an account and a key, and the brief asks for logging, not a
  service. `reportError` is the one place to change when we add one.
