# Readiness and evidence checklist

This maps all 18 rows and every column from the supplied snapshot to project evidence. Original guide pages were unavailable; source labels identify the snapshot references rather than claiming those documents were consulted. Product data and business rules were created with user approval.

| #   | Topic             | Guide reference         | Required work                                                      | Type        | Evidence / acceptance                                                                   | Status                                              |
| --- | ----------------- | ----------------------- | ------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------- | --------------------------------------------------- |
| 1   | Setup             | Main Guide Final        | React + TypeScript + Vite; push remote                             | Setup       | package.json, strict TS config; Git/hosting result in verification record               | Implemented; remote status in verification          |
| 2   | Data              | Main Guide Final        | Load 20 products through module                                    | Build       | src/data/products.ts and api.ts; 20-unique-products test; no component-embedded records | Implemented                                         |
| 3   | Product list      | Main Guide Final        | Cards, stable keys, useful empty states                            | Build       | Store.tsx uses product.id; empty/no-match demonstrations                                | Implemented                                         |
| 4   | Filters           | Main Guide Final        | Live search, category and stock inputs; derive results             | Build       | filterProducts; source inputs only; combined-filter tests                               | Implemented                                         |
| 5   | Cart              | Main Guide Final        | Repeated Add increments quantity                                   | Build       | Reducer/component/browser tests prove one row, quantity two                             | Implemented                                         |
| 6   | Cart              | Main Guide Final        | Remove, decrement, count, subtotal, discount, payable total        | Build       | logic.ts; Rs. 5,000 gives zero discount, Rs. 5,001 gives Rs. 500.10 discount            | Implemented                                         |
| 7   | TypeScript        | Main Guide Final        | Product, CartItem, props, responses, return types                  | Build       | strict compilation; no any in app source; discriminated unions                          | Implemented                                         |
| 8   | UI states         | Main Guide Final        | Loading, empty, error, retry, success                              | Build       | /project state links; browser state tests                                               | Implemented                                         |
| 9   | Testing           | Main Guide Final        | Pricing and validation automated tests                             | Build       | npm run test; detailed execution results in verification.md                             | Implemented; results recorded separately            |
| 10  | AI notes          | Main Guide Final        | Prompts, accepted/rejected code, evidence, tests                   | Deliverable | docs/ai-notes.md in repository                                                          | Prepared                                            |
| 11  | Mock evaluation A | Main Guide Final Part A | Scope, props/state, async/response.ok, auth/authz, state types     | Assessment  | assessment-prep.md Part A with examples                                                 | Prepared; reviewer sign-off pending                 |
| 12  | Mock evaluation B | Main Guide Final Part B | Predict all five outputs with reasons                              | Assessment  | Five project-created questions and answer key                                           | Prepared; independent 5/5 marking pending           |
| 13  | Mock evaluation C | Main Guide Final Part C | Debug/rewrite Cart without unnecessary state/effect; name tests    | Assessment  | Faulty example, corrected derivation, named test list                                   | Prepared; reviewer acceptance pending               |
| 14  | Mock evaluation D | Main Guide Final Part D | Five scenario answers                                              | Assessment  | Partial failure, duplicate save, race, refresh 404 and AI review                        | Prepared; reviewer sign-off pending                 |
| 15  | Supplement mock   | Supplement mock eval    | Theory and scenario answers                                        | Assessment  | Ten project-created questions and practical demo script                                 | Prepared; reviewer sign-off pending                 |
| 16  | Practical         | Supplement mock eval    | List/detail, UI states, race fix, keyboard modal, export and notes | Build       | Dashboard; tests; bug-trace.md; term-notes.md                                           | Implemented                                         |
| 17  | Review call       | Training Plan rubric    | Explain code, choices, bugs/fixes, AI changes                      | Assessment  | review-call.md script and practice rubric                                               | External score >=70% and weekly submissions pending |
| 18  | Readiness         | Both guides             | All final checklist and Supplement coverage items confirmed        | Checkpoint  | This snapshot-based evidence matrix                                                     | Final reviewer confirmation pending                 |

## Completion checks

- [x] Required implementation and project-created preparation materials are present.
- [x] Discount and stock/decrement/count semantics are explicit in README.
- [x] No production payments, real customer writes or sign-in are implied.
- [x] Final unit/component test result recorded: 43 passed.
- [x] Final browser result, narrow-layout evidence and local route refresh recorded: 9 passed, 16 page/width combinations.
- [x] Final strict type check and production build recorded: passed.
- [ ] Remote commit and publication result recorded, or concrete blockers documented.
- [ ] Human assessments, weekly submissions and final readiness sign-off completed.

The verification record is the source for commands actually executed. External checklist items must remain open until supported by evidence.
