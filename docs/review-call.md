# Review call and practice rubric

This is a project-created practice rubric. The original training rubric was not supplied. The snapshot's external target remains an overall score of at least 70% with all weekly submissions done.

## Demonstration script

1. Introduce the scope: one Vite React + TypeScript app with a store and customer workspace. Explain fictional data, demo-only writes and session storage limits.
2. Show the data adapter and Product/CartItem types. Trace data to cards keyed by ID.
3. Combine search, category and stock. Explain why the visible list is derived.
4. Add one item twice. Prove a single row has quantity two. Decrement/remove and explain stock limits.
5. Explain the strict discount boundary and show its tests. Distinguish unit count from row count.
6. Open the project guide and demonstrate loading, empty, error, retry and success.
7. Show customer list/detail, rapid selection race prevention, modal focus management, validation, duplicate-save guard and CSV export.
8. Trace one bug through reproduction, cause, fix and regression check.
9. Explain Parts A–D in your own words; predict the five output examples before reading the answers.
10. Open AI notes. Show one accepted approach, one rejected approach and evidence supporting the decision.
11. Run tests, type checking and build. Review limitations and record reviewer feedback.

## Suggested scoring

| Area                                           | Points |
| ---------------------------------------------- | ------ |
| Store behavior and data separation             | 20     |
| Cart and pricing correctness                   | 20     |
| TypeScript, state choices and code explanation | 15     |
| Async UI states, race and recovery             | 15     |
| Dashboard, keyboard modal and export           | 15     |
| Tests, AI notes, bug trace and reasoning       | 15     |
| Total                                          | 100    |

## Reviewer record

- AI technical reviewer: Codex, at the user's request.
- AI review date: 11 November 2026 (Asia/Karachi).
- AI artifact-review score: **92/100**. The rubric's technical target is exceeded; 8 points were reserved for unaided learner explanations during a live review.
- Part A written answers: accepted in AI content review.
- Part B answer key: **5/5 executable cases passed**; reasons accepted in AI review. Learner exam score not awarded.
- Part C delivered rewrite: accepted in AI technical review; regression tests passed.
- Part D written answers: all five accepted in AI review.
- Supplement written answers and practical: accepted in AI review; hosted practical checks passed.
- Current final-project submission: indexed in submissions/README.md.
- AI technical readiness: approved; details and evidence in review-report.md.
- Formal learner review call and human approval: not held; fields in external-approval.md.
- Historical weekly submissions: not supplied, so their completion cannot be verified.

The completed AI artifact assessment is separate from an official review-call score, a record of earlier weekly submissions, or a human signature. No such external outcome has been fabricated.
