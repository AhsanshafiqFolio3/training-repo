# Monitoring

## What happens to an error today

| Where the error happens               | What the user sees                                                                                                                 | Where it is logged                                                |
| ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| While rendering a page                | That page is replaced by "This page hit a bug." with **Try again** and **Back to the shop**. Header, footer and cart keep working. | `ErrorBoundary.componentDidCatch` → `reportError`                 |
| While rendering the header or router  | A full-page fallback with **Try again** and a link that reloads the shop                                                           | The outer `ErrorBoundary` in `main.tsx` → `reportError`           |
| In an event handler, timer or promise | Nothing changes on screen (React keeps running)                                                                                    | `window` `error` / `unhandledrejection` listeners → `reportError` |
| A failed API request                  | The page's error state (D3-4)                                                                                                      | Not logged as a crash: it is expected and handled                 |

`reportError` (`src/shared/monitoring.ts`) writes one structured entry to the console:

```json
{
  "source": "render",
  "message": "Error: Test crash from the mock controls",
  "path": "/cart",
  "time": "2026-11-21T10:15:02.120Z",
  "stack": "...",
  "componentStack": "at CrashTrigger ... at ErrorBoundary ..."
}
```

It also keeps the last 20 reports in memory (`readErrorReports()`), which the tests use. In
production, `reportError` is the one place to change: send the report to an error tracker
such as Sentry, with `navigator.sendBeacon` so the report survives the page closing.

**Try it:** open **Mock API controls** and press **Crash this page (render error)**. The page
shows the fallback, the header still works, and the console shows the report.

Why the page boundary has `key={pathname}`: after a crash, going to another page gives the
boundary a new key, so it starts fresh instead of staying on the fallback.

## Three things we'd track in production

### 1. Crash rate, by page and by release

- **What:** reports from `reportError` per 1,000 page views, split by `path` and by app
  version.
- **Why:** a crash means a user saw a fallback instead of the store. Splitting by release
  shows whether a deploy caused it; splitting by page shows where to look.
- **Alert when:** the rate for the new release is clearly above the previous release's, in
  the first hour after a deploy.

### 2. Checkout success rate

- **What:** of the users who press **Place order**, how many reach the confirmation page.
  Broken down by outcome: success, 409 out of stock, 401 signed out, 5xx and network
  errors, and how many succeed only after **Try again**.
- **Why:** this is where the store makes money, and every failure here is a lost order.
  A rise in 409s means stock data is too stale (D3-5, D4-4). A rise in retries means the
  idempotency key is saving duplicate orders.
- **Alert when:** success drops below its normal level, or 5xx responses on `POST /api/orders`
  go above about 1%.

### 3. How fast the shop feels to real users

- **What:** Core Web Vitals from real visits: **LCP** (how soon the main content shows),
  **INP** (how quickly clicks and key presses respond), and **CLS** (how much the layout
  jumps). Plus how often the live stock socket has to reconnect.
- **Why:** our performance numbers (docs/performance.md) come from one fast machine. Real
  users have slower phones and networks. INP on the product list would show at once if a
  change undid the memoization or virtualization.
- **Alert when:** the 75th percentile goes past Google's "good" limits (LCP 2.5 s, INP 200 ms,
  CLS 0.1), or reconnects per session jump, which points to a server or proxy problem.
