# Verification record

Implementation date: 11 November 2026 (Asia/Karachi).

Local and authenticated hosted verification completed successfully. Do not treat feature descriptions or configured scripts as evidence of external reviewer sign-off.

## Recorded development checks

- Initial strict production build passed after correcting the cart action discriminant.
- Initial unit/component suite: 42 passed, one ambiguous query failed. The query was corrected by scoping to the empty-state region; the final suite passed.
- All dependencies are pinned to the installed lockfile. npm reported zero vulnerabilities during installation; this is not a complete security assessment.

## Final checks

- `npm run test`: **48 passed across 7 files**, including five Part B output checks, exit code 0.
- `npm run test:e2e`: **9 passed in Chromium**, exit code 0. Covers combined filtering, repeated cart adds, demo checkout, all store states, validation, focus trap/restoration, customer creation, CSV download, stale detail cancellation, fixture-detail refresh, missing customers, export failure/recovery, and layout overflow.
- Responsive checks: store, customer list, customer detail and project guide at **390, 768, 1,024 and 1,440 px**; all 16 combinations passed. Tables scroll within their own container.
- `npm run build`: strict TypeScript compilation and production bundling passed, exit code 0. Output includes local font assets and SPA redirect configuration. Main JS bundle approximately 322 kB (101 kB gzip).
- Source scan: no `any`, TODO or FIXME in src/.
- Visual review: desktop store, desktop dashboard and mobile dashboard screenshots inspected. Screenshots are generated in ignored `artifacts/` and reproducible with the browser suite.
- Source remote: synchronized successfully to the private Sites-managed repository documented in repository.md. First verified pushed commit: `9bf516ccc8f256eb0b0b120bb45d5bb33da03e29`. Final packaging may include documentation updates; `git rev-parse HEAD` and the saved Site version identify the final commit.
- Private hosting: publication runs after source packaging; its authoritative status and URL are returned by Sites and reported in the handoff. A manifest or build alone does not establish deployment success.
- Hosted direct route refresh: **passed in Chromium**. Direct GET and reload of `/customers/c02` both returned HTTP 200 and showed Omar Farooq. Eleven hosted checks passed, including private access, cart totals, detail race, modal validation/focus, export snapshot, error retry and missing customer. Sanitized evidence: `evidence/hosted-verification.json`.

The first Git synchronization attempt failed because the sandbox could not initialize Windows Schannel credentials. Configuring this repository to use Git's OpenSSL TLS backend resolved it while keeping certificate verification enabled. The retry verified the pushed commit and generated the deployment archive.

The first responsive run identified the hidden-label overflow described in bug-trace.md. After correction the 16-combination check passed. A subsequent combined test exceeded its 30-second budget, so coverage was split into a test per viewport. Fonts were self-hosted to remove an external loading dependency. The final nine-test browser suite passed without retries.

## Project completion

AI content review of Parts A–D and the Supplement is complete. The Part B answer key matched all five executable cases. The AI artifact score is 92/100; see review-report.md. This is not a learner interview score. The user clarified that earlier course records and formal human training approval are outside this final-project delivery. The implementation, project-created assessment, AI review, hosted checks and submission package are complete. No past submissions or human approvals are claimed.
