# Season 1 frontend audit and redesign: handoff for the Season 2 audit

Dates: 2026-09-24 to 2026-09-26 · Branch: `main` · Auditor: Claude Code (Opus 5.5, with Sonnet 5 sub-agents)
Starting point: `7a299cf` (after Codex's audit; its handoff is in the gitignored `docs/superpowers/phase2-remediation/restore-backup/`)
End point: the commit that adds this file. The shell changes are `d709706` through `27606fe`, and `9c82bd8` keeps the critique snapshots.

This document is spoiler-free. It does not contain hint text or lesson solutions.

## 1. What was asked

1. Check Codex's audit claims, then run a focused frontend audit of the field-notebook style using the AGENTS.md workflow (`$impeccable`, `$vercel-react-best-practices`, `$web-design-guidelines`).
2. Fix what the audit found, then mock up and build design ideas that push the field-notebook identity.
3. Do a real solve of a lesson to find hidden shell bugs, then revert the solve.
4. Run the rounds of implement fixes → commit → Impeccable critique until the returns flattened.

## 2. Contracts preserved (verify these first in Season 2)

- The intentional bugs in `src/levels/` are untouched. Every test solve (always Incident 01) was reverted with `git checkout`, and localStorage was cleared afterwards.
- The level `data-testid`s, manifests, checks and `hints.json` are unchanged.
- There is no React StrictMode. The check harness counts renders and effect firings.
- The styling is still plain CSS. No new dependencies were added.
- AGENTS.md rules still hold: no card grids, no colored side-border cards, no shadows, no decorative motion.
- The desktop notice stays prominent on phones and touch devices (owner requirement). It is triggered by `(hover: none) and (pointer: coarse), (max-width: 600px)`, so a narrow desktop window beside an editor no longer gets it.

## 3. Commits in order

| Commit | Summary |
|---|---|
| `d709706` | **P1 fixes and preview hardening.** Tab now reaches the concept `<details>` again (a `tabIndex` was removing its summary from the tab order). The desktop notice no longer shows on narrow desktop windows. The preview's error boundary retries after each hot update, so a lesson that crashes on load recovers once fixed. Run checks keeps keyboard focus during a run by using `aria-disabled` instead of `disabled`. |
| `2aeeff9` | **Design ideas #1, #2 and #4.** Adds a compact lesson heading, a sticky **workbench** (last result, Run checks, Next), **resolution recorded inside the verification log** (no banner) and **field notes** (runs, hints, last worked, resolved date). These are backed by a subscribable telemetry store (`learning.js`). The naming unit becomes **"incident"**. Adds a shared drawn `<Arrow/>`. |
| `c44c789` | Critique round 1 fixes. The workbench status jumps to the run summary. When several checks fail from the same crash, the crash is shown once and the later rows point back to it. Hint tier names stay visible while a hint is open. Sets a **12px type floor**. "Resolved" becomes the single state word. Adds dev-only **Open in editor** and **Copy path** (`FileReference.jsx`). |
| `e49e3ea` | The answer hint asks for confirmation the first time it is opened. Adds a **Ctrl+Enter / ⌘ Enter** shortcut to run the checks. Pressing Run during a run is announced. Adds a first-visit orientation line. |
| `e743db3` | The preview crash is announced (`role="alert"`). Reset asks for confirmation inline, replacing `confirm()`, with managed focus and Escape. Notes are capped at a 60ch measure. |
| `469efea` | The resolving run scrolls to and focuses the "Resolved." record. The first-visit state is decided once per visit, so the page doesn't shift. The loop verbs are fixed as Learn · Reproduce · Repair · Verify. Ctrl+Enter is forwarded from inside the preview iframe. Jump targets get focus outlines. |
| `2b878a3` | Escape now dismisses the answer-hint warning from its toggle too. **Each surface has one job**: preview note, empty log, metadata and standing note no longer repeat the loop or the resolved state. |
| `27606fe` | **Design ideas #5 and #7.** The register becomes a **ledger**: column headings, BUG IDs in every row, a sage ✓ Resolved with its date, "Opens after NN", progress counted per act, and an amber current segment in the header strip. **Returning learners** land on their current incident and its record instead of the pitch, and a finished season shows a season record. **Next button:** while a later run on a resolved incident fails, Run checks is amber and Next is outlined. |
| `9c82bd8` | Keeps the six critique snapshots in `.impeccable/critique/`. |

The source of truth for every rule is `DESIGN.md`, which was updated in each commit. Useful sections to start from:
- The rules: the Incident Naming Rule, the Loop Rule, the Status Text Rule, and the 12px floor.
- The component sections: Workbench, Resolution and continuation, Field notes, File references, First-visit orientation, and Incident register (ledger and returning hero).

## 4. Files added to the shell

- `src/shell/FileReference.jsx`: the Copy path and dev-only Open in editor buttons. Open in editor calls Vite's `/__open-in-editor`, which always returns 200, so the message is worded as a hint. It needs a running editor or `LAUNCH_EDITOR` (see README).
- `src/shell/FieldNotes.jsx`: the learner's own record on the lesson page.
- `src/shell/check-results.js`: `markRepeatedFailures`, which folds repeated crashes into one.
- `src/shell/format.js`: shared day, time and plural wording.
- `src/shell/Arrow.jsx`.
- Tests: `tests/learning.test.mjs` and `tests/check-results.test.mjs`. The suite is now **29 tests**, all passing.
- `learning.js` now exposes a `useSyncExternalStore` store: `getLearningSnapshot` and `subscribeLearning` (one `storage` listener, with a notify on write). It also has `activityFor`, and `recordCheckRun(..., { resolves })`, which stamps `resolvedAt` and `resolvedRun`.

## 5. Verification method (repeatable)

- **Repository checks:** `npm test`, `npm run typecheck:lessons`, `npm run validate:levels` and `npm run build`, plus `npx impeccable detect --json src/shell src/styles/shell.css index.html`, which currently reports nothing.
- **Real solve every round:**
  1. Fix Incident 01 in the source.
  2. Run the checks in the browser pane and confirm the resolution record, its focus and the copy.
  3. Revert the source and re-run to see the failing-after-resolve state.
  4. Then `git checkout -- src/levels/01-broken-badge/ProfileBadge.jsx` and `localStorage.clear()`.
- **Season-complete and after-reset states:** seed `bugbound:progress:v2:initial:<id>` = `"1"` and `bugbound:learning:v1` in localStorage. Don't click **Clear progress** or **Open in editor** during automated tests.
- **Viewports:** desktop at 1280 and 1440, and 960 (half of a 1080p screen). Phone at 375 is checked for overflow only (see section 7).
- **Detector notes:**
  - Rendered-URL mode needs `$env:IMPECCABLE_BROWSER` set to the Edge path, run from PowerShell.
  - The live-server overlay always fails, because the bundled `detect.js` is truncated.
  - Afterwards, stop any stray headless Edge processes whose command line contains `impeccable_dev_chrome_profile`.
- **Line endings:** the repo uses `autocrlf=true` and the shell files are CRLF. Python `read_text`/`write_text` and some `sed -i` runs silently change CRLF to LF, so normalize after scripted edits.

## 6. Critique history and why it stopped

| Round | Score /40 | Design reviewer | Headline |
|---|---|---|---|
| 1 | 29 | Opus | Verify step and success moment out of view; log goes stale |
| 2 | 29 | Opus | Run results still off-screen; one crash printed in every row |
| 3 | 33 | Sonnet | Answer-hint gate skipped in order; no Run shortcut |
| 4 | 34 | Sonnet | Preview crash not announced; native `confirm()` for reset |
| 5 | 31 | Opus | Resolution off-screen while Next is pinned; first action shifts the page |
| 6 | 30 | Opus | Escape gap on the answer warning; repeated copy |

The score stopped improving after round 4. The swings track **which model did the review and how it graded** more than real quality changes. Several late findings came from our own earlier fixes: the repeated copy came from orientation text added in rounds 3–5, and the Escape gap from the answer confirmation added after round 1. We stopped scored rounds deliberately, in line with AGENTS.md's "no open-ended polish loop". **Recommendation for Season 2:** run one critique at the start as a baseline and one after substantive UI work, not one per fix. Get real learner feedback (someone working through 3–4 incidents) before chasing scores.

## 7. Open items (known, not done)

**From critique round 6 (P3 and minor):**
- **Concept and workbench can't be reached by heading or landmark navigation.** Suggested fix: a visually hidden "Concept" `h2`, the workbench as `role="region"` with `aria-label="Verification controls"`, and a hidden "Hints:" prefix on the hints heading.
- Section-jump links still look like captions.
- The "Start here" concept label stays amber after it has been opened.
- Reset progress is offered at 0/15.
- "Retry after editing" on the preview crash implies a manual step, though hot reload retries on its own.
- Restart preview gives no feedback.

**Other items:**
- **Phones and tablets are deliberately low priority.** The project can't run there. Keep the notice prominent and pages without horizontal overflow, and skip phone-only polish (the owner decided this on 2026-09-26).
- **Design idea #3, the notebook margin, was not built.** It is a margin column on the lesson page for the folio, BUG ID, severity and notes. It sits close to DESIGN.md's ban on side-border cards, so it needs an owner decision and a rule change first.
- **Doc drift:** DESIGN.md says Next shows "whenever the incident is complete and checks are not running", but `Workbench` also renders it during a run (outlined while Run is amber). Align the doc or the code.
- **Lesson styles:** `src/styles/exercises.css:88` uses `10.5px`, which is off the DESIGN.md scale. It's an advisory detector finding in lesson styling, outside the shell's 12px floor, so decide deliberately before changing it.
- **Not verified:** screen-reader speech (the live regions and the iframe alert), real touch devices, browser zoom beyond defaults, Firefox and Safari. Open in editor with a real editor running.

## 8. Guidance for Season 2's design

Keep the parts that now carry the identity:
- Folio numerals and BUG IDs.
- The ruled ledger register with dated resolutions.
- Text statuses (color only reinforces the words).
- The single boxed preview.
- Field notes and the in-log resolution record.
- The one-job-per-surface copy rule.

Grow toward a **case file**: more density and tooling, the learner's own record kept prominent, and no cards, shadows or banners. Reuse `format.js` and the `learning.js` store rather than adding new state paths. Keep "incident" as the unit and Learn · Reproduce · Repair · Verify as the loop verbs.
