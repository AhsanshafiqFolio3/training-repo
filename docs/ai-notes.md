# AI notes

A log of notable AI use during the week. D5-7 asks for three uses (prompt, what I kept,
what I changed and why), one AI mistake and how I caught it, and one thing I wouldn't hand
to AI.

## Log

### 1. Planning the week from the brief (Day 1)

- **Prompt:** "Read The Bug Bazaar PDF and create a plan according to the instructions."
- **Kept:** The day-by-day task list and the idea of a branch per day.
- **Changed:** <!-- your own words: what did you change in the plan and why? -->

### 2. Building the mock API (D1-2)

- **Prompt:** "Mock the shared API contract so the app runs without a backend, with 5,000
  products and every error triggerable."
- **Kept:** The fetch-compatible `mockFetch`, the seeded generator, the controls panel.
- **Changed:** Asked for no extra libraries that the brief doesn't mention, so MSW was dropped
  in favour of a hand-written mock. <!-- add anything else you changed -->

### 3. Debounced search with the Back button (D2-5)

- **Prompt:** "Extract typed custom hooks such as debouncing input, and make search
  update the URL only after typing pauses."
- **Kept:** `useDebouncedValue` and the search box that syncs from the URL.
- **Changed:** <!-- your own words -->

### 4. Cart, checkout and auth with Redux Toolkit (Day 3)

- **Prompt:** "Complete Day 3: Redux cart and session, cart page, checkout that can't create
  a second order on retry, login with protected pages, one way of handling API errors, and
  caching."
- **Kept:** The slices and selectors, the idempotency key on checkout, `RequireAuth`, and the
  single error mapping in `error-messages.ts`.
- **Changed:** The AI first named component files in PascalCase and other files in camelCase.
  I asked for one format everywhere, so every file is now kebab-case and lint enforces it.
  <!-- add anything else you changed -->

### 5. Measuring and speeding up the product list (Day 4)

- **Prompt:** "Start Day 4: accessibility, performance with before and after numbers,
  virtualization for the 5,000-item list, live stock over WebSockets, tests, CI and
  monitoring."
- **Kept:** Measuring before fixing (the numbers in `performance.md`), `memo` plus our own
  window virtualization, the reconnecting stock feed, the two CI workflows.
- **Changed:** <!-- your own words: e.g. anything you questioned or asked to be done differently -->

## AI mistakes caught

### The first debounced search broke the Back button (Day 2)

The AI's first version re-applied the old search after pressing Back. The page test
"saves the search to the URL once typing pauses, and Back clears it" failed and showed
why: React Router's setter changes identity on every navigation, which re-ran the effect.
**Lesson:** write the test for the behaviour you care about (Back works), not only the happy path.

### A git command undid a change (Day 2)

While removing a debug log, the AI ran `git checkout` on a file, which also threw away an
uncommitted edit to that file. The next test run failed and `git diff --stat` showed the
file was missing from the changes, so the edit was re-applied.
**Lesson:** `git checkout <file>` drops every uncommitted change in that file, not just the
line you meant.

### Unused-CSS cleanup removed live styles (Day 1)

The AI wrote a script to delete CSS rules whose class names no longer appear in the source.
The class `active` is never written in our code, because React Router's `NavLink` adds it at
runtime. So the script removed the nav link's active underline. It was caught by reading the
diff of the stylesheet before committing, and the rule was restored.
**Lesson:** a text search can't see class names that libraries add at runtime.

### The performance doc claimed a tool we never used (Day 4)

The first draft of `performance.md` said "React DevTools' Profiler showed why" every card
re-rendered. No one had opened the Profiler: the evidence was the script-time numbers.
It was caught by reading the draft against what had actually been run, and rewritten to
say what the numbers show.
**Lesson:** check every "we measured" and "we saw" in AI-written docs against what was
really done. An evaluator can ask to see it.

### Keyboard jumps broke in the virtual grid (Day 4)

After virtualization, pressing Home far down the list scrolled only part of the way and
focused nothing. The page has `scroll-behavior: smooth`, so `window.scrollTo` animated
instead of jumping, and the card to focus wasn't drawn yet. The unit tests passed, because
the test DOM has no layout or scrolling. It was caught by a check in real Chrome, and fixed
with `behavior: 'instant'`.
**Lesson:** anything that depends on layout (virtualization, scrolling, sizes) needs a check
in a real browser.

### A dependency added only to re-run an effect (Day 4)

To make infinite scroll keep loading on tall screens, the AI added `items.length` to an
effect's dependencies without using it inside. Lint flagged it as an extra dependency.
The fix was to say what we meant: keep "is the button near the screen" in state, and load
whenever it's near and nothing is loading.
**Lesson:** a dependency the effect doesn't read is a sign the logic is hidden somewhere else.

### The wrong minimum Node version since Day 1 (Day 4)

`package.json` said Node `>=22.12`. While choosing a Node version for CI, we read what our
dependencies require: jsdom and React Router need at least 22.22. Someone on 22.12 would
have hit confusing errors. Fixed in the `engines` field and the README.
**Lesson:** when you write down a requirement, check it against the dependencies instead of
copying it from a template.

## Something I wouldn't hand to AI

<!-- your own answer, for D5-7 -->
