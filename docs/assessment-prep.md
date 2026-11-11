# Practice assessment

These questions and answers were created for this project with the user's approval. They cover the snapshot topics; they are not the unavailable original Main Guide or Supplement. The written answers have now passed AI content review, and the five Part B outputs have passed executable checks. See review-report.md for the completed assessment. The learner's own unaided explanations require a separate live review.

## Part A — Explain with examples

### Scope

JavaScript uses lexical scope: where a function was declared determines the variables it can access. `let` and `const` are block scoped. In `useAsync`, each effect invocation captures its own generation and AbortController. A later render does not change those captured values; comparing the captured generation with the current ref identifies an old completion.

### Props versus state

Props enter a component from its parent, such as Modal's `title` and `onClose`. State belongs to a component/provider and changes through its setters, such as the search input or cart lines. Props should not be mutated. A value fully determined by existing props/state usually belongs in a calculation: visible products and subtotal are derived, not copied into additional state.

### Async and response.ok

An async function returns a promise. Awaiting pauses that function's continuation until settlement; it does not block the entire UI. Our adapters simulate async requests. With real `fetch`, an HTTP 404 or 500 normally resolves to a Response rather than rejecting, so check `response.ok`, handle an unsuccessful status, then parse/validate the body. Catch network errors separately, and ignore cancellation errors from obsolete work.

```ts
const response = await fetch('/api/products', { signal })
if (!response.ok) throw new Error(`Products failed: ${response.status}`)
// Parse the payload as unknown and validate its runtime shape before treating it as Product[].
```

### Authentication versus authorization

Authentication establishes who a user is. Authorization determines which actions that user may perform. A production export service must check export permission on the server, even if its UI button is hidden. This demo implements neither sign-in nor a production permission boundary; fictional local data does not require pretending these exist.

### State types

Source state includes filter inputs and cart lines. Derived values include filtered results and totals. Transient UI state includes a modal's visibility. Async state uses the mutually exclusive variants loading, error and success. URL state includes a customer ID and demo-state query. Server state would come from a real API; the current records come from a typed simulation. Keeping these roles explicit avoids impossible combinations and stale duplicates.

## Part B — Five output questions with reasons

### 1. Scope

```js
let value = 1
function read() {
  let value = 3
  return value
}
console.log(read(), value)
```

Answer: `3 1`. The inner declaration shadows the outer value without changing it.

### 2. Derived filtering

```js
const products = [
  { id: 'a', stock: 0 },
  { id: 'b', stock: 2 },
]
const visible = products.filter((product) => product.stock > 0)
console.log(visible.length, products.length, visible[0].id)
```

Answer: `1 2 b`. Filter creates a new array, preserves the original array, and includes only the in-stock record.

### 3. Cart transitions

```ts
let cart = cartReducer([], { type: 'add', product: products[0] })
cart = cartReducer(cart, { type: 'add', product: products[0] })
console.log(cart.length, cart[0].quantity)
```

Using the imported project dataset, answer: `1 2`. Both actions refer to p01. The second action updates its existing line, rather than appending a line. The local two-item dataset in Question 2 is not the dataset for this question.

### 4. Discount boundary

```ts
const atBoundary = calculateTotals([{ product: { ...products[0], price: 5000 }, quantity: 1 }])
const aboveBoundary = calculateTotals([{ product: { ...products[0], price: 5001 }, quantity: 1 }])
console.log(atBoundary.discount, aboveBoundary.discount, aboveBoundary.total)
```

Answer: `0 500.1 4500.9`. The threshold is strictly greater than 5,000; 10% is applied to the entire eligible subtotal. Currency formatting adds the display decimals separately.

### 5. Promise ordering

```js
console.log('A')
Promise.resolve().then(() => console.log('B'))
console.log('C')
```

Answer, in order: `A`, `C`, `B`. Synchronous work completes before the queued promise continuation.

Result: all five output predictions matched the executable cases in src/test/assessment.test.ts, for an answer-key verification of 5/5. The explanations were accepted in AI review. This verifies the submitted material; it is not an independently awarded learner exam score. The learner should still explain the outputs without relying only on memorization.

## Part C — Debug and rewrite Cart

Deliberately faulty exercise:

```tsx
function BrokenCart({ items }: { items: CartItem[] }) {
  const [subtotal, setSubtotal] = useState(0)
  const [count, setCount] = useState(items.length)
  useEffect(() => {
    setSubtotal(items.reduce((sum, item) => sum + item.product.price * item.quantity, 0))
    setCount(items.length)
  }, [items.length])
  const discount = subtotal >= 5000 ? subtotal * 0.1 : 0
  return (
    <p>
      {count}: {subtotal - discount}
    </p>
  )
}
```

Problems: subtotal and count duplicate source data; an effect introduces a render with stale totals; dependencies miss quantity changes when row count stays constant; count measures rows rather than units; and `>=` violates the discount boundary.

Rewrite:

```tsx
function CartSummary({ items }: { items: CartItem[] }): ReactElement {
  const { count, subtotal, discount, total } = calculateTotals(items)
  return (
    <dl>
      <dt>Items</dt>
      <dd>{count}</dd>
      <dt>Subtotal</dt>
      <dd>{money(subtotal)}</dd>
      <dt>Discount</dt>
      <dd>{money(discount)}</dd>
      <dt>Payable total</dt>
      <dd>{money(total)}</dd>
    </dl>
  )
}
```

No state or effect is needed for these values. The application implements the complete version in `src/features/store/Cart.tsx`, backed by the same pure pricing function.

Tests to name/run: empty cart; same product added twice keeps one row and quantity two; unit count across multiple lines; decrement; removal at zero; explicit remove; stock ceiling; subtotal changes when quantity changes; 4,999/5,000/5,001; two-decimal rounding; and totals after removal. Run `npm run test`, followed by `npm run test:e2e` for rendered checkout behavior.

## Part D — Five scenario answers

### 1. Partial failure

For independent operations, retain successful results and report failures at the relevant item/section. `Promise.allSettled` can collect independent outcomes without discarding successes. Retrying should target failed operations and must avoid duplicating successful writes. If the business operation requires all-or-nothing correctness, use a server transaction or explicit compensation; client-side promise handling cannot supply transaction guarantees.

### 2. Duplicate saves

Take a synchronous in-flight lock, validate before sending, disable repeated submission and show progress. In this demo, duplicate email checking and a ref lock prevent session duplicates. A real service must additionally enforce unique keys and support idempotency tokens so retries or two tabs cannot create duplicate writes. Aborting a request does not prove the server stopped processing it.

### 3. Race

Selection A starts, selection B starts, B resolves, A resolves. Accepting both renders stale A. Cancel the previous request and guard completion by request identity/generation. A test must control completion order and verify that A cannot replace B, even if cancellation is ignored by transport.

### 4. Refresh 404

Internal navigation is handled by React Router; a refresh goes to the host. Configure the host to serve the SPA shell for application routes while preserving static asset errors. Test a direct URL and a reload of `/customers/c02` on the actual host. Vite's local success does not prove production fallback configuration works.

### 5. AI review

Treat AI output as a proposed change. Compare every acceptance criterion with the diff; inspect typed boundaries, derived state, async cleanup, validation and pricing rules; run relevant tests and build; exercise UI states and keyboard flows; record accepted and rejected suggestions. Never claim a reviewer score or unavailable guide compliance from generated answers alone.

## Supplement — Theory and practical scenarios

1. **Why use product IDs as keys?** They preserve identity across filtering/sorting. Array positions can associate existing component state with a different product.
2. **Where should filtered products live?** In a calculation from dataset plus filters. Storing another list creates a second source of truth.
3. **What does an empty list mean?** Distinguish no source records from no filter matches. Keep a clear next action for each.
4. **How do you retry a failed load?** Start a new request, show loading, clear obsolete error state, and ignore old completions.
5. **How is the modal tested?** Open by keyboard, verify initial input focus, cycle forward/backward, dismiss with Escape, and verify trigger focus restoration. Also test field errors and pending-save controls.
6. **What should export capture?** The filtered rows at start time. Keep that snapshot stable if the user edits filters while the fake job runs.
7. **How is an export failure handled?** Display the failure without changing customer data. Reset the injected failure, retry, and expose a download only after success.
8. **What happens on unmount?** Abort detail/export work, remove keyboard listeners, restore body scrolling and avoid state updates from obsolete requests.
9. **What if a newly added customer disappears on refresh?** This demo stores additions in memory. The missing-customer state explains the session limit. A real application requires persistent storage and server-generated IDs.
10. **How would you replace the simulated API?** Keep component contracts, replace adapters with fetch, check status, validate unknown payloads, map failures, and pass cancellation signals.

Practical demonstration order: load customer list; search/filter; navigate to a detail; rapidly choose Next customer; refresh a fixture detail; demonstrate missing/error states; add a customer with invalid then valid fields using only keyboard; start export; change filters while it runs; download the original snapshot; demonstrate injected failure/retry; explain bug trace and per-term notes.
