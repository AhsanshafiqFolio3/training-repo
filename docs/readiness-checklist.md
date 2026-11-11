# Readiness and evidence checklist

This maps the 18 final-project requirements to where the evidence lives. The original guide pages weren't available, so the guide references below come from the requirement list rather than the guides themselves.

| #   | Topic             | Guide reference         | Required work                                                      | Type        | Evidence / acceptance                                                                   | Status                           |
| --- | ----------------- | ----------------------- | ------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------- | -------------------------------- |
| 1   | Setup             | Main Guide Final        | React + TypeScript + Vite; push remote                             | Setup       | package.json, strict TS config; https://github.com/AhsanshafiqFolio3/training-repo      | Done                             |
| 2   | Data              | Main Guide Final        | Load 20 products through module                                    | Build       | src/data/products.ts and api.ts; 20-unique-products test; no component-embedded records | Done                             |
| 3   | Product list      | Main Guide Final        | Cards, stable keys, useful empty states                            | Build       | ProductCard keyed by product.id; empty and no-match states                              | Done                             |
| 4   | Filters           | Main Guide Final        | Live search, category and stock inputs; derive results             | Build       | filterProducts; source inputs only; combined-filter tests                               | Done                             |
| 5   | Cart              | Main Guide Final        | Repeated Add increments quantity                                   | Build       | Reducer/component/browser tests prove one row, quantity two                             | Done                             |
| 6   | Cart              | Main Guide Final        | Remove, decrement, count, subtotal, discount, payable total        | Build       | logic.ts; Rs. 5,000 gives zero discount, Rs. 5,001 gives Rs. 500.10 discount            | Done                             |
| 7   | TypeScript        | Main Guide Final        | Product, CartItem, props, responses, return types                  | Build       | Strict compilation; no any in app source; discriminated unions                          | Done                             |
| 8   | UI states         | Main Guide Final        | Loading, empty, error, retry, success                              | Build       | /project state links (dev builds); browser state tests                                  | Done                             |
| 9   | Testing           | Main Guide Final        | Pricing and validation automated tests                             | Build       | npm run test; results in verification.md                                                | Done                             |
| 10  | AI notes          | Main Guide Final        | Prompts, accepted/rejected code, evidence, tests                   | Deliverable | docs/ai-notes.md                                                                        | Done                             |
| 11  | Mock evaluation A | Main Guide Final Part A | Scope, props/state, async/response.ok, auth/authz, state types     | Assessment  | assessment-prep.md Part A with examples                                                 | Written; needs reviewer sign-off |
| 12  | Mock evaluation B | Main Guide Final Part B | Predict all five outputs with reasons                              | Assessment  | Five practice questions; answer key checked by executable tests                         | 5/5 against the practice key     |
| 13  | Mock evaluation C | Main Guide Final Part C | Debug/rewrite Cart without unnecessary state/effect; name tests    | Assessment  | Faulty example, corrected derivation, named test list                                   | Written                          |
| 14  | Mock evaluation D | Main Guide Final Part D | Five scenario answers                                              | Assessment  | Partial failure, duplicate save, race, refresh 404 and AI review                        | Written; needs reviewer sign-off |
| 15  | Supplement mock   | Supplement mock eval    | Theory and scenario answers                                        | Assessment  | Ten practice questions and a dashboard demo script                                      | Written; needs reviewer sign-off |
| 16  | Practical         | Supplement mock eval    | List/detail, UI states, race fix, keyboard modal, export and notes | Build       | Dashboard; tests; bug-trace.md; term-notes.md                                           | Done                             |
| 17  | Review call       | Training Plan rubric    | Explain code, choices, bugs/fixes, AI changes                      | Assessment  | review-call.md demo script and practice rubric                                          | Pending review call              |
| 18  | Readiness         | Both guides             | All final checklist and Supplement coverage items confirmed        | Checkpoint  | This checklist                                                                          | Pending reviewer confirmation    |

## Checks

- [x] Discount, stock, decrement and count rules are written down in the README.
- [x] No real payments, customer writes or sign-in are implied.
- [x] Unit/component tests, browser tests, strict type check and production build pass; numbers are in verification.md.
- [x] Source pushed to the GitHub repository.
- [ ] Reviewer sign-off on Parts A, D and the Supplement.
- [ ] Review call.
