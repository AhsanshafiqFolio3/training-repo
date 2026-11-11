# Per-term notes

| Term                        | Meaning                                           | Example in this project                                                                    |
| --------------------------- | ------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| Scope                       | Where an identifier is accessible                 | A request generation is captured by one effect's completion handler                        |
| Props                       | Values passed down by a parent                    | Modal receives `title`, `children` and `onClose`                                           |
| State                       | A component's changing source data                | Search text, selected category and cart lines                                              |
| Derived data                | Values calculated from source data                | Visible products and cart totals                                                           |
| Reducer                     | A pure state transition selected by an action     | Cart add/decrement/remove/clear                                                            |
| Stable key                  | Persistent identity used to reconcile siblings    | `product.id` and `customer.id`                                                             |
| Controlled input            | Input whose value is owned by React state         | Search, customer name and stock toggle                                                     |
| Effect                      | Synchronization with an external system           | Starting/canceling an async load or installing a keyboard handler                          |
| Cleanup                     | Releasing work when an effect changes or unmounts | Abort the previous API load and remove key listeners                                       |
| Async/await                 | Syntax for observing promise completion           | Await export processing before exposing Download CSV                                       |
| HTTP response.ok            | Whether an HTTP status is in the success range    | A future fetch adapter must check it before parsing success data; current API is simulated |
| API adapter                 | Boundary between UI and data transport            | `getProducts`, `getCustomers`, `getCustomer`                                               |
| Discriminated union         | Object variants narrowed by a literal field       | `LoadState` uses loading/error/success; cart actions use distinct type values              |
| Loading/empty/error/success | Different valid states of an async screen         | Demonstrated through `/project` state links                                                |
| Retry                       | Start a new attempt after failure                 | Error-state action clears the demo failure and reloads                                     |
| Race condition              | Correctness depends on completion order           | Slow c01 response arrives after a newer c02 selection                                      |
| Cancellation                | Stop work that is no longer needed                | AbortController passed into API delay                                                      |
| Stale closure               | Callback retains values from an older render      | Old detail request still holds its old customer ID                                         |
| Idempotency                 | Repeating an operation has one intended result    | Ref lock stops duplicate local saves; server idempotency would be needed for real requests |
| Partial failure             | Some operations succeed while others fail         | Discussed in the project-created scenario assessment                                       |
| Authentication              | Proving identity                                  | No real login exists in this frontend demo                                                 |
| Authorization               | Checking allowed actions                          | A production export endpoint would check permission server-side                            |
| Focus trap                  | Keyboard Tab stays inside the open dialog         | Modal loops between first and last focusable elements                                      |
| Focus restoration           | Return focus to the opening control               | Add customer regains focus after closing the modal                                         |
| Validation                  | Reject data outside explicit constraints          | Name/city length, email shape and uniqueness                                               |
| CSV escaping                | Keep a record inside one safe cell                | Quotes, commas, newlines and formula prefixes handled by `csvCell`                         |
| Snapshot                    | Data fixed at one point in time                   | Export uses filtered rows captured when the job starts                                     |
| SPA fallback                | Return the app shell for client routes            | Direct customer-route refresh                                                              |
| Unit test                   | Check a small behavior independently              | Pricing at Rs. 5,000/5,001                                                                 |
| Component test              | Verify rendered interaction                       | Add twice leaves one cart row                                                              |
| End-to-end test             | Exercise the running app in a real browser        | Filter → add → review → simulated checkout                                                 |
| AI review                   | Verify generated work before accepting it         | Compare requirements, inspect state flow, run checks and record evidence                   |
