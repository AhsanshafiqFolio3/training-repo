# Verification record

This lists the checks that were actually run. Passing checks are not the same as reviewer sign-off.

## During development

- The first strict production build failed on a cart action type and passed once that was corrected.
- The first unit/component run had 42 passing tests and one ambiguous query. Scoping the query to the empty-state region fixed it.
- Dependencies are pinned in the lockfile. npm reported zero vulnerabilities at install time; that is not a full security review.
- The first responsive run found the hidden-label overflow described in bug-trace.md. After the fix all 16 page/width combinations passed. One combined browser test went over its 30-second budget, so it was split into one test per viewport.
- Fonts were self-hosted to remove the external font request.

## Earlier hosted deployment

The app was briefly deployed to a private preview host. Opening `/customers/c02` directly and refreshing it both returned HTTP 200 with the right customer, and the cart, race, modal, export and error-retry flows passed there too. That deployment has since been retired, so those results are historical and are not repeated here.

## Audit fixes

- Demo checkout: focus moves to "Back to the collection" when the order is placed, and returns to the "Your bag" heading on close, because the "Review order" trigger is disabled once the bag is empty. Covered by a Modal unit test and the store browser test.
- Failed export: the banner shows an alert icon instead of a success check, and "Try again" restarts the export directly. Covered by the dashboard browser test.
- Product sort and customer status filter are typed unions with runtime guards instead of plain strings. Sorting moved into a pure `sortProducts` function with unit tests.

## Architecture review fixes

- Error boundary around the routes, reset on navigation.
- Demo switches (`?state=`, `?exportError=`, slow `c01`) only active in dev or with `VITE_DEMO_CONTROLS=true`; retry removes only its own query parameter.
- Detail page gets the customer order from the data module instead of importing the dataset; merging session customers goes through `directory.ts`.
- Store and customer pages split into smaller components and a `useExportJob` hook.
- Customer save and checkout delays are cancelled on unmount.
- Prettier added with `format` and `format:check` scripts.

## Current checks

- `npm run test`: 59 passed across 10 files, including the five Part B output checks.
- `npm run test:e2e`: 9 passed in Chromium. Covers combined filtering, repeated cart adds, demo checkout focus, all store states, validation, focus trap/restoration, customer creation, CSV download, stale detail cancellation, direct refresh, missing customers, export failure/retry and layout overflow at 390, 768, 1,024 and 1,440 px.
- `npm run build`: strict TypeScript compilation and production bundle pass.
- `npm run lint`: Oxlint with the React, hooks, jsx-a11y, TypeScript and Vitest plugins, zero warnings. typescript-eslint doesn't support TypeScript 7 yet, which is why Oxlint is used.
- `npm run format:check`: clean.
- No `any`, TODO or FIXME in `src/`.

## Assessment status

The Part B answer key matches all five executable cases. Parts A, C, D and the Supplement have written answers; review-report.md is an AI-assisted practice review (92/100), not a reviewer's score. Reviewer sign-off for the assessment sections and the review call is still to come.
