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

## AI mistakes caught

### Unused-CSS cleanup removed live styles (Day 1)

The AI wrote a script to delete CSS rules whose class names no longer appear in the source.
The class `active` is never written in our code, because React Router's `NavLink` adds it at
runtime. So the script removed the nav link's active underline. It was caught by reading the
diff of the stylesheet before committing, and the rule was restored.
**Lesson:** a text search can't see class names that libraries add at runtime.

## Something I wouldn't hand to AI

<!-- your own answer, for D5-7 -->
