# Completed AI technical review

Review date: 11 November 2026 (Asia/Karachi). Reviewer: Codex, acting as an AI technical reviewer at the user's request. Scope: the delivered application, its written explanations, the project-created assessment key, and executed checks. This is an artifact assessment, not a live interview or a claim that a human training reviewer has approved the learner.

## Result

**AI artifact review: 92/100. Final-project delivery complete.** The project exceeds the practice rubric's 70-point technical target. The user clarified that the requested delivery is this final project. Earlier training records and a formal learner interview are outside this delivery's completion gate. No live learner review-call result is claimed.

| Rubric area                                    | Awarded    | Evidence and scoring reason                                                                                                                                |
| ---------------------------------------------- | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Store behavior and data separation             | 20/20      | Exactly 20 unique products in a module; stable IDs; combined derived filters; loading/empty/error/retry demonstrations; local and hosted behavior verified |
| Cart and pricing correctness                   | 20/20      | One row after duplicate adds, total-unit count, stock ceiling, decrement/remove, strict Rs. 5,000/5,001 boundary and rounded payable totals                |
| TypeScript, state choices and code explanation | 12/15      | Strict build and written explanations accepted; 3 points reserved for the learner explaining the implementation unaided in a live review                   |
| Async UI states, race and recovery             | 15/15      | Abort plus generation guard; regression test with ignored cancellation; hosted rapid navigation and error recovery passed                                  |
| Dashboard, keyboard modal and export           | 15/15      | List/detail, missing records, focus trap/restoration, validation, duplicate-save check, real CSV download and stable export snapshot verified              |
| Tests, AI notes, bug trace and reasoning       | 10/15      | Tests and documentation accepted; 5 points reserved for the learner defending debugging decisions and AI-assisted changes during a live review             |
| Total                                          | **92/100** | Written/software evidence assessed; 8 oral-demonstration points withheld rather than assumed                                                               |

The 92 points are an AI pre-review of artifacts. They are not an official review-call score or certification of the user's skills.

## Assessment decisions

| Section    | Decision                            | Evidence                                                                                                                                                                                       |
| ---------- | ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Part A     | AI content review accepted          | Scope and captured generations; props versus state; fetch status checking; authentication/authorization distinction; source/derived/transient/URL/async state examples all correctly explained |
| Part B     | **5/5 answer-key outputs verified** | Five executable cases in `src/test/assessment.test.ts` matched the written predictions; reasons reviewed below. Learner performance remains unassessed                                         |
| Part C     | AI rewrite review accepted          | Totals derive directly from `items`; no redundant subtotal/count state or effect; unit count and strict threshold correct; actual Cart and regression cases inspected                          |
| Part D     | All 5 written answers accepted      | Partial-success retention and server transactions; client lock plus server idempotency; request generation; host fallback; evidence-based AI review                                            |
| Supplement | All 10 written answers accepted     | Stable identity, derived state, empty/error recovery, keyboard focus, export snapshot/failure, cleanup, session persistence limits and transport replacement                                   |
| Practical  | Technical review accepted           | Real hosted smoke check plus existing local browser suite, bug trace and term notes                                                                                                            |

## Part B marking record

| Question         | Expected and observed output | Reason accepted                                                          |
| ---------------- | ---------------------------- | ------------------------------------------------------------------------ |
| 1. Scope         | `3 1`                        | Inner block shadows the outer variable                                   |
| 2. Filter        | `1 2 b`                      | Filter returns a new one-item array without changing the two-item source |
| 3. Cart          | `1 2`                        | Stable product ID merges the second Add into the existing row            |
| 4. Discount      | `0 500.1 4500.9`             | No discount at exactly 5,000; 10% above the strict threshold             |
| 5. Promise order | `A C B`                      | Synchronous lines run before the promise continuation                    |

These are project-created questions. No original-guide examination or independent learner result is implied.

## Runtime evidence

- `npm run test`: **48 passed across 7 files**, including the five Part B cases.
- `npm run build`: strict TypeScript and production bundle **passed**.
- Existing local Chromium suite: **9 passed**; application source and bundled output are unchanged by this review. No redundant local browser rerun was needed for documentation and added grading cases.
- Authenticated hosted Chromium review: **11 checks passed**, recorded in `evidence/hosted-verification.json`.
- Hosted detail direct load **HTTP 200** and refresh **HTTP 200**, both displaying Omar Farooq at `/customers/c02`.
- Private access preserved: a fresh anonymous request was rejected or redirected to sign-in; the Site remains owner-private.
- Export review downloaded 9 customer records after starting the job, then changing visible results to one customer. The file retained the original snapshot, including the session-created fictional record.
- No uncaught application errors occurred during the hosted review.

The hosted test fetches real responses from the deployed origin using the platform service credential in Node. Chromium receives only those real response bytes. No local replacement application is used. Credentials are neither stored in browser state nor written into the evidence.

## Final gates

- [x] Implementation requirements reviewed.
- [x] Project-created mock answers reviewed and Part B key verified 5/5.
- [x] Cart rewrite reviewed and relevant tests named/run.
- [x] Hosted deep-link refresh and practical behavior verified.
- [x] Current final-project submission package indexed.
- [x] AI technical readiness approved with documented limits.
- [x] Final-project completion confirmed against the user's clarified delivery scope.

Historical weekly submissions and a formal learner review are not required to close this final-project delivery. No earlier submission dates, human signatures or learner interview results have been invented. The optional external-approval.md form is retained only for a future course assessment.
