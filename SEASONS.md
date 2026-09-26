# Bugbound — Season Handoff Document

**Audience:** this file is written for an AI coding agent (Claude Opus 4.8 or later) starting a fresh session with no prior context. If you are that agent: read this whole file before doing anything else. If you are a human: give this file (or its URL) to your agent when kicking off Season 2 or 3.

**Owner:** Brantley Wyche (GitHub: [Brantley-Wyche](https://github.com/Brantley-Wyche)). He is using Bugbound to refamiliarize himself with React after time away, and the repos double as portfolio pieces — design quality matters.

**Season 1 (complete):** https://github.com/Brantley-Wyche/Bugbound-Season-1 — the reference implementation. Everything below builds on it.

---

## ⚠️ Rule zero: blind mode

Bugbound only works if the bugs are a surprise. The agent authors the bugs; the player (Brantley) must never learn them except through gameplay.

- **Never** describe, name, or hint at a specific planted bug in chat, commit messages, code comments, PR descriptions, or file names — the symptom (what the player sees) is fine to state; the cause is not.
- Hints and solutions are always **base64-encoded** in the repo (`src/levels/hints.json`, `SOLUTIONS.md`). Author them in plaintext only in your session scratchpad, encode with a script, and never echo the plaintext into chat.
- If the player asks for help while stuck, coach at the level of the current hint tier. Only reveal the fix if he explicitly asks to be spoiled.
- When verifying that checks pass against fixed code, be aware the fix appears in the chat transcript. Minimize this (verify one early level end-to-end, spot-check the rest by review) and warn him which level got exposed.

## What Bugbound is

A level-based debugging game. Each level = one React concept + one lesson + a live component with intentionally planted bug(s) + an in-app check runner. The player reads the bug report, fixes the code in his own editor (Vite HMR reloads), and runs checks in the browser. All checks green → next level unlocks (progress in `localStorage`). No embedded editor — the real editor/HMR/debugging workflow *is* the pedagogy.

### Season 1 architecture (replicate the spirit, adapt the details)

```
src/shell/        # the game UI — always bug-free, player never edits
  App.jsx           # hash routing, progress state
  LevelMap.jsx      # locked/unlocked level grid
  LevelPage.jsx     # lesson + bug ticket + live preview + checks + hints
  harness.jsx       # mounts level component offscreen via createRoot,
                    #   drives it with native-setter events, returns pass/fail
  ChecksRunner.jsx, HintBox.jsx, ErrorBoundary.jsx, Prose.jsx, progress.js
src/levels/<nn-slug>/
  manifest.js       # the level contract (see below)
  <Component>.jsx   # the buggy component(s) — bugs live ONLY here
  hints.json        # (shared, one file) base64 hints, 3 tiers per level
SOLUTIONS.md      # base64-encoded full solutions
```

### The manifest contract

```js
export default {
  id: 'NN-kebab-slug',
  number: N,
  title: 'Display Name',
  concept: 'Concept Chip Text',
  severity: 'Low' | 'Medium' | 'High' | 'Critical',   // escalates with level
  Component,                    // default import of the buggy component
  vague: true,                  // optional: later levels point at a folder, not a file
  files: ['src/levels/…'],      // where to look (folder path when vague)
  symptom: 'QA-ticket-style description of observable behavior only',
  lesson: ['paragraph', …],     // 3 paragraphs, `backticks` render as <code>
  checks: [{ name, run: async (h) => { … } }],  // h: get/query/all/text/value/
}                               //   attr/click/type/selectOption/pause/ok/ensureNoCrash
```

### Design decisions that must carry forward

1. **Checks are executable specs** — they assert observable behavior, never implementation. They must *fail* against the planted bug and *pass* after any reasonable fix (don't assume one specific fix).
2. **`data-testid` everywhere** checks need to reach; README tells players not to touch them.
3. **No `<StrictMode>`** — its double-invocation breaks render-counting and effect-based checks.
4. **Difficulty ramps two ways**: concepts get harder AND bugs hide better (exact file → multiple files → folder-only, one bug → several interacting).
5. **`main` is the game cartridge** — pristine buggy state, never receives fixes. Player plays on a `playthrough` branch.
6. **Design/aesthetic**: clean, professional, dark theme (see Season 1's `global.css` tokens) — these are portfolio pieces.

---

## Season 2 — Next.js edition (new repo)

A sibling game with the same shell concept, rebuilt for Next.js (App Router), teaching Next-specific concepts with Next-specific planted bugs.

**Curriculum territory** (final level list is the agent's call, keep ~12–15):
file-based routing & layouts · Server vs Client Components and the `"use client"` boundary · hydration mismatches · data fetching & caching (`fetch` cache, `revalidate`, router cache staleness) · Server Actions · streaming/Suspense/`loading.js` · route handlers · `next/image`/`next/link` misuse · metadata · middleware basics · a capstone.

**Bug taxonomy to draw from** (do not tell the player which of these you used where): hydration mismatch from non-deterministic render (dates, `Math.random`, browser-only APIs during SSR) · state/effects/event handlers in a Server Component (or a missing/misplaced `"use client"`) · over-caching so mutated data never appears (missing `revalidatePath`/`revalidateTag`, wrong fetch cache option) · Server Action mutating without revalidating · client component importing a server-only module · params/searchParams misuse · blocking waterfall where parallel fetches were intended.

**Known hard problem — the check harness.** Season 1's harness mounts components client-side with `createRoot`; that cannot exercise server rendering, caching, or hydration. Options to evaluate at kickoff (agent's decision, discuss trade-offs with Brantley):
- (a) checks that `fetch()` rendered HTML from route URLs and assert on the server output, plus client-side DOM checks after navigation — no extra tooling, covers a lot;
- (b) a small Playwright runner (`npm run check <level>`) with results the game page reads — heavier, covers everything including true hydration behavior;
- (c) hybrid: in-page checks where possible, scripted checks for hydration/caching levels.
Whatever is chosen, keep the game-like in-browser experience as the primary loop.

**Also carry over:** level map + progression + localStorage, tiered encoded hints, encoded SOLUTIONS.md, the house rules section in README, `main`-pristine branch workflow.

## Season 3 — bring-your-own-agent (community release)

Goal: anyone clones a Bugbound repo, opens it with *their* coding agent, and the agent generates **fresh, personalized levels** for them — infinite replayability. This was Brantley's idea and is the flagship feature.

**Deliverables:**
1. **A bundled skill** (`.claude/skills/bugbound-levelsmith/SKILL.md` — plus a plain `AGENTS.md`/prompt fallback for non-Claude agents) that instructs the player's agent to:
   - read the manifest contract and an example level;
   - author N new levels on a requested topic/difficulty: buggy component + manifest + checks + 3 base64 hints + encoded solution appended to SOLUTIONS.md;
   - register them in `src/levels/index.js`;
   - **verify** each check fails against the planted bug (run the app or the harness) and passes against the agent's private fix — then discard the fix;
   - obey blind mode: never reveal the bugs to the player it's generating for.
2. **Repo hardening for strangers:** README rewritten for a public audience, LICENSE (suggest MIT), screenshots/GIF of gameplay, maybe a level-authoring guide (`CONTRIBUTING.md`) so humans can submit levels too.
3. **Validation tooling** the skill can lean on: a `npm run validate-levels` script that checks manifest shape, unique ids/numbers, hints present for every level, etc.

**Open questions to settle with Brantley at kickoff:** does Season 3 land inside the Season 1 repo (likely — it's the polished, framework-light one), the Season 2 repo, or both? Should generated levels go in a `src/levels/community/` namespace so `main` stays a known-good cartridge?

---

## Working agreements (how Brantley likes to collaborate)

- Plan collaboratively before building: propose an approach, surface trade-offs, ask for his call on genuine either-way decisions (he'll have opinions — e.g., he chose plain CSS over Tailwind, and JS-first-then-TS).
- Then execute autonomously: scaffold fully, verify end-to-end (build + drive the real app), commit with clear messages.
- He's relearning React — lessons should teach, not just gate. Write them like a good course: concise, concrete, naming the underlying mechanism.
