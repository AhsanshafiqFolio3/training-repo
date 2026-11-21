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

## Something I wouldn't hand to AI

<!-- your own answer, for D5-7 -->
