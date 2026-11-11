# Current final-project submission package

Assembled on 11 November 2026 (Asia/Karachi). These seven sections organize the current final-project delivery around its seven-day plan. They do not claim seven days of historical work or completion of earlier training weeks.

| Plan section                     | Delivered artifacts                                                                   | Evidence                                                                          |
| -------------------------------- | ------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Day 1: setup and data            | package.json, TypeScript/Vite config, src/data/, shared types                         | Strict build; 20 unique products; private remote in ../repository.md              |
| Day 2: product list and filters  | src/features/store/Store.tsx, logic.ts, shared feedback and styling                   | Stable product keys; derived combined filters; all UI states                      |
| Day 3: cart and pricing          | Cart.tsx, CartContext.tsx, logic.ts and pricing tests                                 | Repeated add, stock, decrement/removal, count and threshold boundaries            |
| Day 4: customer practical        | src/features/customers/, shared Modal and useAsync                                    | List/detail; async race; keyboard behavior; actual CSV snapshot                   |
| Day 5: automated validation      | Seven unit/component test files, e2e/project.spec.ts, scripts/verify-hosted.mjs       | 48 unit/component cases; 9 earlier local browser cases; 11 hosted checks          |
| Day 6: mock evaluation and notes | ../assessment-prep.md, ../ai-notes.md, ../bug-trace.md, ../term-notes.md              | Reviewed Parts A–D and Supplement; executable Part B key 5/5                      |
| Day 7: review and readiness      | ../review-report.md, ../review-call.md, ../verification.md, ../readiness-checklist.md | AI technical review 92/100; hosted refresh passed; external gates explicitly open |

## Delivery contents

The Git repository contains the source, tests, runtime-check script, documentation, local fonts and licenses, and sanitized hosted evidence. Build products, dependencies, credentials and temporary browser traces are excluded from source control.

A portable source ZIP is generated from the final committed revision as `final-project-submission.zip` in the workspace parent. Extract it, run `npm ci`, then `npm run test`, `npm run build` and `npm run dev`. To reproduce the browser suite, install Chromium as described in the README.

The private live URL and exact source commit are recorded in the workspace handoff. The original snapshot's requirement for all weekly submissions cannot be verified from this new package. No past submission dates, recipients, grades or approvals have been invented.

## Historical weekly evidence still needed

For each actual training week, record the week/date, submitted repository or artifact URL, submission date and reviewer acknowledgement. The expected number of weeks and their original task list were not provided, so no fictitious week numbers are assigned here. The reviewer can add verified records to the approval form once supplied.
