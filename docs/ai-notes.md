# AI notes

## Prompts and authorization

1. The user supplied two training-plan snapshots and requested a plan before implementation.
2. The user asked whether every column was covered. The plan was expanded to preserve all 18 rows, their guide, work type and acceptance evidence.
3. The user instructed: “As per plan start implmentations”.
4. Asked for the unavailable guides, dataset, discount rate and remote, the user replied: “no i dont have you can create by yourself”. This authorized original data and project-defined rules. It does not establish that the original assessment has been passed.

## Accepted AI-assisted work

| Change                                         | Reason accepted                                                                             | Evidence                                                                       |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| 20-product dataset and 8 fictional customers   | Independent data modules meet the required separation and allow reproducible demonstrations | Dataset uniqueness/filter tests; API module                                    |
| Explicit 10% discount strictly above Rs. 5,000 | Resolves the missing rate with an understandable documented rule                            | Pricing tests for 4,999, 5,000, 5,000.01, 5,001 and 10,000                     |
| Reducer for cart mutations                     | Repeated Add updates quantity in one row and stock limits apply in one place                | Reducer and rendered-cart tests                                                |
| Derived filtering and totals                   | Avoids synchronization bugs from duplicate state                                            | Pure filter/pricing functions and combined-filter interactions                 |
| Abort plus generation guard                    | Stops stale updates even when a transport does not obey cancellation                        | Deferred-response regression test and browser rapid-navigation check           |
| Keyboard modal and customer validation         | Provides accessible entry and avoids duplicate session records                              | Tab/Shift+Tab/Escape/focus tests, field validation, duplicate-email/save tests |
| CSV export snapshot                            | Gives a real reviewable output after a simulated job                                        | CSV quoting/formula tests and browser download flow                            |
| Original SVG product illustrations             | Keeps assets self-contained and consistent                                                  | Browser review screenshots and production build                                |

## Rejected approaches and reasons

- Storing visible products, cart count, subtotal or discount in separate state: these values can be derived and otherwise drift out of sync.
- Pushing a new cart line for every Add: violates the unchanged row-count requirement.
- Using `subtotal >= 5000`: applies the discount at the wrong boundary.
- A cancellation flag without handling request identity: transport cancellation alone may not prevent a late callback. Keep both abort and a generation check.
- Disabling a Save button as the only duplicate guard: state updates are asynchronous; use a synchronous ref lock too. A production server would also require idempotency and uniqueness enforcement.
- Claiming original-guide answers or reviewer sign-off: the source documents and human assessment were not provided. Practice material and pending external items are labeled accordingly.

## Review and corrections during implementation

- Initial compilation caught a TypeScript discriminated-union issue: grouping `remove | decrement` in one union branch did not narrow away the `product`-less branch. Each action now has its own discriminant.
- A filter interaction test found two valid “Clear filters” controls. The test now scopes its query to the empty-state region instead of assuming a unique global button.
- Dependency versions were pinned to the installed lockfile for repeatable installs.
- Browser and build outcomes are recorded in `verification.md` after execution. Described features do not substitute for passing checks.

## AI review procedure

Read the diff; trace source and derived state; check threshold, stock and validation boundaries; inspect failure/unmount paths; run tests and strict build; exercise keyboard and narrow layouts; record remaining external assessments. Reject generated statements that are not supported by the actual implementation or test evidence.
