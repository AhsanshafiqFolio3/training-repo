# Final Project: Seven-Day Plan

Status: final-project delivery complete. Implementation, validation, project-created assessments, AI review, hosting and source submission are delivered. The user clarified that earlier course records and formal training approval are outside this delivery scope.

Implementation decision: the user confirmed the original guides/dataset were unavailable and authorized creating project materials. The app uses 20 original products, a 10% discount strictly above Rs. 5,000, and clearly labeled project-created practice assessments. This seven-day schedule remains the planning baseline.

This plan is based on the two supplied snapshots. The referenced Main Guide, Supplement, training rubric, product dataset, and assessment questions have not been supplied. Their exact rules must be checked before claiming full compliance.

## Deliverables

1. A React + TypeScript store created with Vite.
2. A customer dashboard for the Supplement practical, kept in a separate area of the same application unless the guide requires a separate project.
3. Automated tests for pricing, validation, and important user interactions.
4. Repository documentation: setup instructions, AI notes, dashboard bug trace, term notes, and assessment preparation.
5. A Git remote link once the remote destination is provided and the project is pushed.

## Proposed implementation

- React + TypeScript + Vite, with strict TypeScript checking.
- A routing library for store, dashboard list, and customer detail routes.
- Plain CSS or CSS modules for responsive styling; choose the visual direction before implementation.
- Vitest and React Testing Library for automated tests.
- A data/API module between components and product/customer data. Use the provided product dataset when available.
- React state for user inputs and cart contents. Derive filtered products, counts, subtotal, discount, and payable total; do not duplicate them in state.
- Pure pricing and validation functions so business rules can be tested independently.

Suggested organization:

```text
src/
  app/                  # App entry, routes, shared layout
  features/
    store/              # Product list, filters, cart, pricing, tests
    customers/          # Dashboard, detail route, modal, export, tests
  data/                 # Dataset and API adapters
  shared/               # Reusable UI, utilities, types where appropriate
docs/
  ai-notes.md
  bug-trace.md
  term-notes.md
  assessment-prep.md
  readiness-checklist.md
README.md
```

## Day 1 — Setup, scope, and data

- Review the supplied guides and dataset when available; map their rules to the readiness checklist.
- Create the Vite React + TypeScript project and enable strict checking.
- Set up routing, shared layout, styling foundations, and the test runner.
- Define `Product`, `CartItem`, customer, API response, and relevant prop types. Explicitly type function returns as required by the snapshot; avoid `any`.
- Load the supplied 20 products through a data/API module, with an asynchronous interface and a way to demonstrate loading and failures.
- Initialize source control and push once the Git remote is known.
- Start AI notes and update them throughout the project.

Completion checks: app starts, type checking and build pass, the data module returns the expected 20 products, and setup instructions are recorded. Remote push is verified if a destination has been supplied.

## Day 2 — Product list, filters, and UI states

- Render responsive product cards using `product.id` as the React key.
- Add live search, category selection, and an in-stock toggle.
- Keep only filter inputs in state and derive visible products from the source data.
- Provide loading, success, source-empty, no-matching-results, error, and retry states.
- Add labels, keyboard access, and clear feedback to the store controls.

Completion checks: filters work together, no filtered product array is stored in state, stable IDs are used as keys, and every required UI state can be demonstrated.

## Day 3 — Cart and pricing

- Add products to the cart; adding the same product again increases its quantity in the existing row.
- Support decrement and explicit removal. Confirm the guide's rule for decrementing quantity one before finalizing that behavior.
- Derive cart count, subtotal, discount, and payable total from cart contents.
- Apply the guide's discount only when the subtotal is strictly above Rs. 5,000. The discount rate and rounding rule still need to be supplied.
- Cover the empty cart and quantity boundaries.
- Write meaningful tests for duplicate adds, decrement/removal, counts, pricing, and the Rs. 5,000/Rs. 5,001 boundary.

Completion checks: repeated add leaves the row count unchanged, quantity increases correctly, and Rs. 5,000 receives no threshold discount while Rs. 5,001 qualifies under the confirmed rate.

## Day 4 — Customer dashboard practical

- Build the customer list and detail route using a data/API module.
- Handle loading, empty, error, retry, success, and unknown-customer states.
- Prevent stale asynchronous responses from overwriting newer customer selections; reproduce the race before recording the fix.
- Build the required modal with an accessible name, initial focus, contained tab navigation, Escape dismissal, and restored focus on close.
- Implement a simulated export job with visible progress and a clear result. Add failure/retry behavior if required by the Supplement.
- Record reproduction steps, cause, fix, and verification in the bug trace. Maintain per-term notes linked to concrete examples.

Completion checks: customer navigation works, rapid selection cannot show stale details, the modal is usable by keyboard, and the fake export can be demonstrated.

## Day 5 — Tests, validation, and integration

- Implement and test the guide's validation rules after confirming the required fields and constraints.
- Complete pricing tests, including threshold, empty-cart, quantity, and rounding behavior.
- Test key interactions: combined filters, repeated add, removal, error/retry, and the dashboard race fix.
- Check modal keyboard behavior and direct navigation/refresh on detail routes. Configure the intended host's SPA fallback once the hosting target is known.
- Run `npm run test` in a mode that exits, TypeScript checking, and the production build.
- Review responsive layouts, accessibility, console errors, and unnecessary state/effects.

Completion checks: tests, type checking, and build pass; required states are reproducible; unresolved issues are recorded with their impact.

## Day 6 — Mock evaluations and explanation practice

- Main Guide Part A: prepare explanations and examples for scope, props versus state, async behavior and `response.ok`, authentication versus authorization, and state types.
- Main Guide Part B: answer the actual five output questions with reasons once supplied; target 5/5 correct.
- Main Guide Part C: debug and rewrite the provided Cart component without unnecessary state/effects, then name and run the relevant tests.
- Main Guide Part D: answer the actual five scenario questions on partial failure, duplicate saves, races, refresh 404s, and AI review.
- Supplement: answer the supplied theory/scenario questions and rehearse the dashboard demonstration.
- Review AI notes: prompts, accepted code, rejected suggestions, reasons, and evidence from tests or manual checks.

Completion checks: preparation covers every listed assessment section. Actual question answers are checked against the supplied materials; reviewer sign-off remains external.

## Day 7 — Review rehearsal and final handoff

- Rehearse explaining the code, state choices, data flow, bugs, fixes, and AI-assisted changes.
- Run final tests, type checking, and production build after the last changes.
- Verify a fresh-install workflow from the README and check the Git remote contains the final code.
- Finish AI notes, bug trace, term notes, and readiness evidence.
- Check all weekly submissions and both guides' final checklists once those records/materials are available.
- Prepare the review call demonstration and collect reviewer feedback/sign-off.

Completion checks: repo and documentation are ready for review; each checklist item links to evidence. The rubric requires an overall score of at least 70% and all weekly submissions complete; these cannot be claimed until assessed/verified.

## Requirement coverage: all 18 snapshot rows

Each row preserves the five columns in the supplied detail snapshot and adds its planned day. All rows belong to Final Project (7 days). This table tracks planned coverage, not completed implementation or earned sign-off.

| Topic           | Source guide            | Requirement                                                                                                                   | Work type   | Acceptance evidence / target                                           | Planned day      |
| --------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------- | ---------------------------------------------------------------------- | ---------------- |
| Setup           | Main Guide Final        | Create the React + TypeScript store with Vite and push to the Git remote                                                      | Setup       | Repository link                                                        | 1, verified 7    |
| Data            | Main Guide Final        | Load the provided 20 products through a data/API module                                                                       | Build       | Products load from the module; no product data hardcoded in components | 1                |
| Product list    | Main Guide Final        | Render product cards with stable keys and useful empty states                                                                 | Build       | Keys use `product.id`; empty states can be demonstrated                | 2                |
| Filters         | Main Guide Final        | Live search, category filter, and in-stock toggle as source state; derive visible products                                    | Build       | No stored filtered list                                                | 2                |
| Cart            | Main Guide Final        | Add to cart; repeated Add increases quantity                                                                                  | Build       | Test proves the row count stays the same while quantity increases      | 3, verified 5    |
| Cart            | Main Guide Final        | Remove, decrement, count, subtotal, discount above Rs. 5,000, and payable total                                               | Build       | Rs. 5,000/Rs. 5,001 boundary is correct                                | 3, verified 5    |
| TypeScript      | Main Guide Final        | Type `Product`, `CartItem`, props, API responses, and function return types                                                   | Build       | No `any`; compiles cleanly                                             | 1–5, verified 7  |
| UI states       | Main Guide Final        | Handle loading, empty, error, retry, and success states                                                                       | Build       | Each state demonstrated                                                | 2, 4–5           |
| Testing         | Main Guide Final        | Write automated tests for pricing and validation logic                                                                        | Build       | Tests pass with `npm run test`                                         | 3, 5, verified 7 |
| AI notes        | Main Guide Final        | Maintain prompts, accepted code, rejected suggestions, evidence, and tests                                                    | Deliverable | AI notes file in the repository                                        | 1–7              |
| Mock evaluation | Main Guide Final Part A | Explain scope, props versus state, async/`response.ok`, authentication versus authorization, and state types through examples | Assessment  | Reviewer sign-off                                                      | 6–7              |
| Mock evaluation | Main Guide Final Part B | Predict all five output questions with reasons                                                                                | Assessment  | 5/5 correct                                                            | 6                |
| Mock evaluation | Main Guide Final Part C | Debug and rewrite the Cart component without unnecessary state/effect; name the tests to run                                  | Assessment  | Correct rewrite and named relevant tests                               | 6                |
| Mock evaluation | Main Guide Final Part D | Answer the five scenario-reasoning questions: partial failure, duplicate saves, race, refresh 404, and AI review              | Assessment  | Reviewer sign-off                                                      | 6–7              |
| Mock evaluation | Supplement mock eval    | Answer Supplement theory and scenario questions                                                                               | Assessment  | Reviewer sign-off                                                      | 6–7              |
| Practical       | Supplement mock eval    | Build customer list, detail route, UI states, race fix, keyboard-tested modal, fake export job, and notes                     | Build       | Dashboard, bug trace, and per-term notes                               | 4–5              |
| Review call     | Training Plan rubric    | Explain code, choices, bugs, fixes, and AI-assisted changes                                                                   | Assessment  | Overall score at least 70%, with all weekly submissions done           | 7                |
| Readiness       | Both guides             | Confirm every Main Guide final readiness item and Supplement coverage item                                                    | Checkpoint  | All items confirmed with reviewer                                      | 7                |

## Details to obtain before dependent work

- Main Guide Final, Supplement mock evaluation, training rubric, and both readiness checklists. The snapshots summarize these documents but do not include the actual questions or all acceptance rules.
- The provided 20-product dataset or API source.
- Discount percentage/formula, rounding policy, cart count meaning, stock/quantity constraints, and decrement-at-one behavior.
- Validation requirements, dashboard data, modal purpose, and fake export expectations from the Supplement.
- Git remote destination and intended hosting target, if deployment is required.
- Any prescribed visual reference or styling restriction. Otherwise, use a clean, responsive store with a consistent dashboard style.

Setup and UI scaffolding can begin while these details are gathered. Do not present temporary data, assumed business rules, or practice questions as the supplied assessment materials.
