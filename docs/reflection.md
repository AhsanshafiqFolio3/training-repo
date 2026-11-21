# Reflection

How I'd rate myself on each topic, out of 10, and the two gaps I most want to close.

## Scores

| Day | Topic                      | Score /10 | Why this score                                                                                             |
| --- | -------------------------- | --------- | ---------------------------------------------------------------------------------------------------------- |
| 1   | Setup                      | 9         | Clone to running in a few minutes, one `npm run check`, lint enforces naming                               |
| 1   | HTTP and API contracts     | 8         | Every status code is mocked and tested. I'd want more practice with a real backend                         |
| 1   | TypeScript                 | 8         | Strict mode and the `RequestState` union feel natural now. Advanced generics still slow me down            |
| 1   | Data                       | 9         | One client for every request, and I can explain each line of it                                            |
| 2   | Product list               | 8         | Grid, details page and keyboard support work. Arrow-key navigation took a few tries                        |
| 2   | Filters                    | 9         | Filters in the URL means refresh, share and Back all just work                                             |
| 2   | UI states                  | 9         | `AsyncContent` makes it hard to forget a state                                                             |
| 2   | useEffect and cleanup      | 8         | I understand abort and cleanup. The Back button bug showed me effect dependencies can still bite           |
| 2   | Custom hooks               | 8         | Five hooks with real reuse. Knowing when _not_ to make a hook is still a judgement call for me             |
| 2   | Race conditions            | 8         | Abort plus "is this still the current request" is tested, and the test fails without the guard             |
| 3   | Redux Toolkit              | 8         | Slices, selectors and named actions are clear. I haven't used RTK Query in a real project yet              |
| 3   | Cart                       | 9         | Stock limits, saving, 409 handling and the idempotency key all work                                        |
| 3   | Auth                       | 7         | Works, but the token lives in `sessionStorage`. In production I'd want an `httpOnly` cookie                |
| 3   | Backend errors             | 9         | One file maps every error to what the user sees                                                            |
| 3   | Caching                    | 7         | Our own 60-second cache is simple. Background refresh and deduplication I only know in theory              |
| 4   | Accessibility              | 8         | Lighthouse 100 on the main pages, but Lighthouse can't catch everything. A full screen reader pass is next |
| 4   | Performance                | 8         | Measured before and after, and the fixes are backed by numbers                                             |
| 4   | Memoization/virtualization | 7         | It works and I can explain it, but the virtual grid is the hardest code in the project                     |
| 4   | WebSockets                 | 7         | Reconnect with backoff works against the mock. I haven't run it against a real server                      |
| 4   | Testing                    | 7         | 85 tests on the important behaviour, but jsdom missed a layout bug that only showed in Chrome              |
| 4   | Git, CI and CD             | 7         | CI and the Pages deploy are written. Branch protection is a GitHub setting I still have to check           |
| 4   | Monitoring                 | 7         | Errors are caught and logged, but only to the console. No real error tracker yet                           |
| 5   | Architecture               | 8         | I can explain where each kind of state lives and why                                                       |
| 5   | Design patterns            | 8         | Hooks, container/presentational and adapter are all real code I wrote                                      |
| 5   | Queues and microservices   | 6         | I designed the order flow on paper but haven't built a queue or worker myself                              |
| 5   | Architecture vocabulary    | 8         | I can explain each term with an example from the store                                                     |
| 5   | Architecture review        | 7         | Update after reviewing my partner's architecture doc                                                       |
| 5   | Code review                | 7         | Update after the pull request reviews                                                                      |
| 5   | AI workflow                | 8         | AI sped me up a lot. Tests and browser checks caught its mistakes, so I keep both in the loop              |
| 5   | Assessment                 | 8         | This file: honest scores and two gaps with next steps                                                      |
| 5   | Submission                 | 8         | One commit per task, CI on the pull request, and a walkthrough to give                                     |

## Two gaps

### 1. Testing in a real browser

All 85 tests run in jsdom, which has no layout or scrolling. That's why the Home key in the
virtual grid was broken while every test passed. I only found it by checking in Chrome.

**Next step:** add Playwright tests for the full shopping flow (browse, filter, add to cart,
log in, check out) and for keyboard navigation in the long list, and run them in CI on every
pull request.

### 2. Queues and backend work

`orders.md` describes an order service, a queue and workers, but I've never run one. I know
the ideas (at-least-once delivery, dead-letter queues, idempotent workers) only from reading.

**Next step:** build a small Node order service with one payment worker on a real queue
(BullMQ on Redis), then stop the worker halfway through a job and check that the
idempotency key prevents a second charge.
