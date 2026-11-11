# Form — Everyday, considered.

A React + TypeScript + Vite final project: an online store with a cart and pricing rules, plus a customer dashboard with list/detail routes, a keyboard-accessible modal and a CSV export job.

The original guides and dataset weren't available, so the products, customer records, business rules and practice assessment questions were written for this project. The build requirements are implemented and tested; the assessment sections still need reviewer sign-off.

## Run locally

Use Node.js 22.12+ or 24 LTS and npm. The dependency versions are pinned and the lockfile is committed.

```powershell
cd "D:\UI Trainning Project\final-project"
npm ci
npm run dev
```

Open the Local URL printed by Vite, normally `http://127.0.0.1:5173`.

```powershell
npm run test       # Automated unit and component checks; exits after running
npm run typecheck  # Strict TypeScript compilation
npm run build     # TypeScript + production bundle in dist/
npm run preview   # Serve the production bundle locally
npm run lint      # Oxlint: React hooks, accessibility, TypeScript and Vitest rules
npm run format:check  # Prettier check (npm run format to fix)
npx playwright install chromium --no-shell
npm run test:e2e  # Real Chromium user-flow checks
```

If a managed Windows machine restricts npm/browser caches, point `npm_config_cache` and `PLAYWRIGHT_BROWSERS_PATH` to writable directories. Install and run Playwright with the same browser path.

## Routes and features

| Route             | Experience                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `/`               | Collection of 20 products, live filters, sort, stock limits, cart and demo checkout                              |
| `/customers`      | Customer list, search/status filters, summary metrics, add-customer modal, simulated export job and CSV download |
| `/customers/:id`  | Customer detail, rapid next-customer navigation, loading/error/missing states                                    |
| `/project`        | Project overview and links to reproducible UI states                                                             |
| Any unknown route | Useful 404 page with a way back                                                                                  |

Try `?state=slow`, `?state=empty`, or `?state=error` on the store, customer list or detail route. Retry restores normal data. Use `/customers?exportError=1` to simulate export failure. `c01` responds slower than `c02`, making rapid detail navigation a reproducible race scenario.

These demo switches only work in development (`npm run dev`). A production build ignores them unless it is built with `VITE_DEMO_CONTROLS=true`.

## Business rules

- Prices are PKR, tax inclusive. Delivery is free.
- The discount is **10% of the entire subtotal only when the subtotal is strictly greater than Rs. 5,000**.
- Rs. 5,000: discount Rs. 0, payable Rs. 5,000. Rs. 5,001: discount Rs. 500.10, payable Rs. 4,500.90.
- Subtotal, discount and payable total are rounded to two decimals.
- Cart count means total units. Repeated adds increment one row; quantity cannot exceed available stock. Decrementing one removes the row. Explicit removal removes all units of that product.
- Customer name and city must contain 2–80 trimmed characters. Email must have a valid basic address shape and be at most 254 characters. Email uniqueness is case insensitive across the current dataset/session.
- Saves are simulated, with a synchronous submission lock to prevent duplicate actions. The modal traps Tab/Shift+Tab, closes on Escape when idle and restores trigger focus.
- Export captures the currently filtered rows at job start. It simulates asynchronous processing, then provides an actual CSV file. CSV fields are quoted and potential spreadsheet formulas are escaped.

## Architecture

`src/data/` owns the datasets and asynchronous typed API adapters. Components never embed product records. `useAsync` owns request lifetime, aborts old requests and guards response order. The store keeps filter inputs and cart lines as source state; visible products, counts and prices are derived. Cart transitions and pricing are pure functions, separate from UI. Built-in customers come from the data module; customers added during a session live in `CustomerProvider`. The list and detail pages combine the two through `mergeCustomers` and `nextCustomerId` in `directory.ts`, so no component reads the dataset directly.

Types cover products, cart items, customer drafts, props, discriminated load states, API responses and function returns. Strict compilation is enabled; no `any` is used in application code. Product art is original SVG rendered in React, with no external product-image dependency. Styles live in `src/styles/`, one file per area (store, cart, customers and so on), imported in cascade order from `index.css`; class names are prefixed by area to avoid collisions. DM Sans and Manrope are served locally with their SIL Open Font Licenses and system-font fallbacks; the app makes no third-party font requests.

## Project documentation

- [Requirement readiness and evidence](docs/readiness-checklist.md)
- [Seven-day plan](docs/project-plan.md)
- [AI notes](docs/ai-notes.md)
- [Bug traces](docs/bug-trace.md)
- [Per-term notes](docs/term-notes.md)
- [Practice assessment Parts A–D and Supplement](docs/assessment-prep.md)
- [Review-call rubric and rehearsal](docs/review-call.md)
- [Practice technical review (AI-assisted, not an official score)](docs/review-report.md)
- [Current submission package index](docs/submissions/README.md)
- [Optional course approval form](docs/external-approval.md)
- [Verification record](docs/verification.md)
- [Source repository destination](docs/repository.md)

## Hosting and Git

Source: https://github.com/AhsanshafiqFolio3/training-repo (branch `main`).

`npm run build` writes a static site to `dist/`. Any static host works, as long as it serves `index.html` for application routes such as `/customers/c02`; `public/_redirects` sets this up on hosts that read that file.

## Practical limits

This is a frontend training project with fictional customer records. The cart and newly added customers live in memory and reset on refresh; the built-in customers are always available. Checkout collects no payment and sends no order, and customer saves and export jobs have no backend. There is no sign-in or authorization layer.
