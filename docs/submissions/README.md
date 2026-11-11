# Submission index

Where each part of the seven-day plan lives in the repository. The sections follow the plan; they don't claim the work was spread over seven calendar days.

| Plan section                     | Files                                                                                 | Evidence                                                               |
| -------------------------------- | ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Day 1: setup and data            | package.json, TypeScript/Vite config, src/data/, shared types                         | Strict build; 20 unique products; repository link in ../repository.md  |
| Day 2: product list and filters  | src/features/store/, logic.ts, shared feedback and styling                            | Stable product keys; derived combined filters; all UI states           |
| Day 3: cart and pricing          | Cart.tsx, CartProvider.tsx, useCart.ts, logic.ts and pricing tests                    | Repeated add, stock, decrement/removal, count and threshold boundaries |
| Day 4: customer practical        | src/features/customers/, shared Modal and useAsync                                    | List/detail; async race; keyboard behavior; real CSV snapshot          |
| Day 5: automated validation      | Unit/component test files and e2e/project.spec.ts                                     | Results in ../verification.md                                          |
| Day 6: mock evaluation and notes | ../assessment-prep.md, ../ai-notes.md, ../bug-trace.md, ../term-notes.md              | Written answers; executable Part B key 5/5                             |
| Day 7: review and readiness      | ../review-report.md, ../review-call.md, ../verification.md, ../readiness-checklist.md | Practice review and demo script; review call still to come             |

## Running it

Clone the repository, run `npm ci`, then `npm run test`, `npm run build` and `npm run dev`. To run the browser suite, install Chromium as described in the README.

## Course records

Weekly submissions from earlier in the course aren't part of this repository. The optional approval form in ../external-approval.md can hold real submission dates and reviewer acknowledgements; none are filled in yet.
