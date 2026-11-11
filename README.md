# Form — Everyday, considered.

A React + TypeScript + Vite final project implementing the supplied store and customer-dashboard requirements. All products, customer records, business rules and practice assessments are original project material, created with the user's approval because the original guides/dataset were unavailable.

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
| `/project`        | Requirement coverage and links to reproducible UI states                                                         |
| Any unknown route | Useful 404 page with a way back                                                                                  |

Try `?state=slow`, `?state=empty`, or `?state=error` on the store, customer list or detail route. Retry restores normal data. Use `/customers?exportError=1` to simulate export failure. `c01` responds slower than `c02`, making rapid detail navigation a reproducible race scenario.

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

`src/data/` owns the datasets and asynchronous typed API adapters. Components never embed product records. `useAsync` owns request lifetime, aborts old requests and guards response order. The store keeps filter inputs and cart lines as source state; visible products, counts and prices are derived. Cart transitions and pricing are pure functions, separate from UI. The dashboard keeps newly added customers in a shared context so list/detail navigation works throughout a session.

Types cover products, cart items, customer drafts, props, discriminated load states, API responses and function returns. Strict compilation is enabled; no `any` is used in application code. Product art is original SVG rendered in React, with no external product-image dependency. DM Sans and Manrope are served locally with their SIL Open Font Licenses and system-font fallbacks; the app makes no third-party font requests.

## Project documentation

- [Requirement readiness and evidence](docs/readiness-checklist.md)
- [Seven-day plan](docs/project-plan.md)
- [AI notes](docs/ai-notes.md)
- [Bug traces](docs/bug-trace.md)
- [Per-term notes](docs/term-notes.md)
- [Practice assessment Parts A–D and Supplement](docs/assessment-prep.md)
- [Review-call rubric and rehearsal](docs/review-call.md)
- [Completed AI technical review: 92/100](docs/review-report.md)
- [Current submission package index](docs/submissions/README.md)
- [External training approval record](docs/external-approval.md)
- [Verification record](docs/verification.md)
- [Source repository destination](docs/repository.md)

## Hosting and Git

The Sites identity is retained in `.openai/hosting.json`. Static output is `dist/`. A static host must serve `index.html` for non-asset application routes; `public/_redirects` supplies this rule for compatible hosts. Vite already supports direct detail-route navigation in local development. Publication and hosted refresh results belong in the verification record; configuration alone does not prove a host honors fallback behavior.

The Sites source remote, if synchronized successfully, is the project remote. No personal GitHub repository was supplied. To add one later, preserve the existing remote and add a second remote using the user's actual URL.

## Practical limits

This is a frontend training project. Customer records are fictional. Cart and new customers live in memory and reset on refresh. Existing fixture customers remain available after refresh. Checkout collects no payment and sends no order; customer saves and export jobs have no backend. The hosted Site is private through the Sites access boundary; the demo app has no separate sign-in or authorization layer. Assessment materials are project-created equivalents. The completed AI artifact review scored 92/100, and all five practice output predictions were verified. A human training reviewer must still assess the learner's live explanations, verify the earlier weekly submissions and grant formal training approval.

## Hosted verification

The deployed detail route was opened directly and refreshed in Chromium: both returned HTTP 200 and displayed the correct customer. Eleven hosted checks passed, including access protection, cart pricing, race prevention, modal focus and export snapshots. Sanitized results are committed in docs/evidence/hosted-verification.json.

`npm run verify:hosted` is a maintainer verification command. It accepts a JSON object containing the selected Site URL and its short-lived Sites service credential through hidden stdin. It never embeds a credential in source, browser state, evidence or command arguments. Credentials must be obtained from the native Sites tool, sent only to that Site, and never committed. See the verification script for the exact contract.
