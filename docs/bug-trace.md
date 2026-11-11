# Bug traces

## 1. Customer detail race

Reproduction: open `/customers/c01` and immediately choose Next customer. The API deliberately gives c01 a 1,100 ms delay and c02 a 220 ms delay. The selected route should show Omar Farooq (c02).

The naive implementation would issue A, issue B, render B, then render A when the slower response resolves. The route remains B but A's details overwrite it. This is a reproduction model of the bug, not a claim that a previously deployed version contained it.

| Relative time       | Request/route                         | Naive result       | Correct result                            |
| ------------------- | ------------------------------------- | ------------------ | ----------------------------------------- |
| 0 ms                | c01 starts                            | Loading            | Loading                                   |
| Shortly after       | Navigate to c02                       | A still pending    | A is aborted; loader changes              |
| ~220 ms after c02   | c02 resolves                          | Omar               | Omar                                      |
| ~1,100 ms after c01 | c01 completes if cancellation ignored | Incorrectly Ayesha | Response rejected by abort/identity guard |

Cause: asynchronous work does not complete in navigation order. A closed-over request can update a component that now represents a different selection.

Fix: `useAsync` creates an AbortController for each loader run and ignores any result that settles after its controller was aborted. Each stored result is tagged with the loader and retry attempt that produced it; the hook only shows a result whose tag matches the current loader and attempt, and reports loading otherwise. Loading is therefore derived during render instead of being set inside the effect. Cleanup aborts the prior request and prevents updates after unmount. `getCustomer` accepts the signal.

Verification: the deferred-response regression deliberately ignores transport cancellation, resolves the newer request first and the old request last, and asserts that the newer data remains. The real-browser scenario navigates immediately, waits past the old delay and refreshes the selected route. See `verification.md` for executed results.

## 2. Duplicate cart rows

Faulty approach: append `{ product, quantity: 1 }` on every Add. Two Adds produce two rows, complicate removal and violate the rubric.

Fix: look up the stable product ID. Increment the existing quantity immutably; create a row only if no matching row exists. Reject additions at the stock limit.

Verification: both reducer and rendered interaction tests assert one row, quantity two and correct discounted totals after two Adds.

## 3. Discount boundary

Faulty condition: `subtotal >= 5000`. It incorrectly discounts an order of exactly Rs. 5,000.

Fix: `subtotal > 5000`; round currency outputs to two decimals. Test both sides and the exact boundary. Rs. 5,001 produces discount Rs. 500.10 and payable Rs. 4,500.90.

## 4. Duplicate customer saves

Risk: two submits can occur before an asynchronous disabled-button update reaches the DOM. Case variants of the same email could also create a duplicate customer.

Fix: validate trimmed values and case-insensitive email uniqueness, take a synchronous ref lock before awaiting, and disable the controls while saving. There is no actual server here; a production API additionally needs uniqueness constraints and an idempotency key.

Verification: invalid fields and duplicate email are rejected. A double-click saves once and produces normalized values.

## 5. Refresh 404

Cause: a static server looks for a physical `/customers/c02` file instead of serving the SPA shell.

Fix: configure fallback to `index.html` for application routes, preserve genuine asset errors, then let React Router resolve the page. `_redirects` covers compatible hosts. Vite development supports this already. Browser refresh is checked locally; hosted verification must be recorded separately.

## 6. Mobile page overflow

The initial browser layout check found `/customers` wider than a 390 px viewport. The table was correctly scrollable, but an absolutely positioned visually hidden column label had its containing block outside that scroll region. Its static position expanded document overflow.

Fix: make table header cells positioned containers. The hidden label now stays within the horizontally scrollable table. No page-level overflow masking is used. The responsive regression checks store, customer list, customer detail and project guide at 390, 768, 1,024 and 1,440 px. The rerun passed all 16 combinations.
