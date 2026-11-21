# AI notes

I used Claude (in VS Code) through the week. Below are three places where it helped, what I
kept and what I changed, a mistake it made that I caught, and something I wouldn't give it.

## Three times I used AI

### 1. Planning the week (Day 1)

- **Prompt:** "read the bug bazaar pdf and make me a plan, day by day. one branch per day and
  every commit should start with the task id"
- **What I kept:** the task list for each day, and one branch per day where each one starts
  from the day before.
- **What I changed:** my deadline was 23 November, so I squeezed the plan into fewer
  calendar days. I also told it to keep working in my Week 1 repo instead of starting a new
  one, so the history stays, and to drop anything the PDF doesn't ask for (the old customer
  dashboard, the Playwright setup, the hero banner).

### 2. The mock API (D1-2)

- **Prompt:** "mock the api contract from the pdf so the app works without a backend. need
  5000 products and a way to trigger every error, 500, 401, 409, slow responses. don't add
  libraries the pdf doesn't mention"
- **What I kept:** `mockFetch`, which works like `fetch` and returns real `Response`
  objects, the seeded product generator, and the small controls panel for errors.
- **What I changed:** MSW (Mock Service Worker) was the obvious choice. It's a good tool, but
  it's one more library the brief doesn't mention, so I went with a hand-written mock I can
  explain line by line. The trade-off is that mock requests don't show in the browser's
  Network tab.

### 3. Checkout that can't create two orders (D3-2)

- **Prompt:** "how do i stop checkout making 2 orders if someone double clicks or the
  request times out and they press try again? using redux toolkit"
- **What I kept:** the idempotency key. One random key per cart, sent as an
  `Idempotency-Key` header, and the same key on every retry, so the server hands back the
  first order instead of making a new one.
- **What I changed:** the files it created were named in two styles, PascalCase for
  components (`CartPage.tsx`) and camelCase for the rest (`cartSlice.ts`). I wanted one style
  for every file, so everything is kebab-case now (`cart-page.tsx`, `cart-slice.ts`) and a
  lint rule (and so CI) fails if a file breaks it. I also made sure I could explain why
  disabling the button isn't enough on its own: it stops a double click, but not a retry
  after a timeout.

## A mistake I caught

**The search broke the Back button (Day 2).** After I typed a search and pressed Back, the
old search came back. The AI's code looked fine, but my page test ("saves the search to the
URL once typing pauses, and Back clears it") failed. The cause was React Router's
`setSearchParams`: it's a new function after every navigation, so the effect that depended
on it ran again and wrote the old text back into the URL. The fix keeps it in a ref.

What I took from it: test what the user does (type, then press Back), not just the happy
path. The code review alone wouldn't have caught it.

A second one, from Day 4: the first draft of `performance.md` said "React DevTools'
Profiler showed" why every card re-rendered. Nobody had opened the Profiler; the proof was
the timing numbers. I caught it reading the draft against what we had actually run, and
had it rewritten. If a doc says "we measured", it has to be true, because an evaluator can
ask me to show it.

## Something I wouldn't hand to AI

**Secrets.** I don't paste API keys, tokens, passwords or a real `.env` file into Claude or
any other AI tool. Once it's in a chat I've lost control of where it's stored, and the only
safe fix is to change the key. In this project that was easy: the API is mocked, the demo
login is fake, and `.env.example` only has two harmless settings. If the store had a real
payment or email key, it would live in GitHub's repository secrets for CI, and I'd only
ever tell the AI the variable's _name_, never its value.

The same goes for real customer data: if I needed to debug with production data, I'd
replace names, emails and addresses with fake ones first.
