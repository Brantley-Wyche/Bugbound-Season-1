# 🐛 Bugbound

> **Learn React by fixing it.** A level-based debugging game where every lesson ships with a real, intentionally planted bug — and you're the engineer on call.

Bugbound is a self-contained React practice app. Instead of watching tutorials, you work **15 escalating levels**: each one teaches a core React concept, then hands you a bug report for a live component that genuinely misbehaves. You open the file in your own editor, fix the code, watch it hot-reload, and run the in-app checks. All green → the next level unlocks.

You use your real editor, Vite HMR, and a local desktop browser. The interface takes the form of an on-call field notebook: an incident register, bug reports, live previews, and verification logs.

> **Use a computer for the intended experience.** The interface is responsive, but Bugbound is
> designed for an editor and browser running side by side.

## How it works

Each level has four parts:

| Part | What it does |
|---|---|
| 📘 **The concept** | A short lesson on one React idea (state snapshots, keys, effect cleanup, …) |
| 🐛 **Bug report** | The symptom, QA-ticket style, plus where to look. Early levels name the exact file; later ones just point at a folder |
| 🔬 **Live preview** | The actual buggy component, running. Reproduce the report yourself |
| ✅ **Checks** | An in-browser test harness that mounts the component in isolation, simulates real clicks and typing, and shows pass/fail with readable failure messages |

Progress is saved to `localStorage` and synchronized between tabs on the same origin. Completions combine across tabs; resetting starts a fresh progress generation so an old check cannot restore cleared progress. Storage failures show a retry action, and completion earned only in this visit is distinguished from saved completion.

Three escalating hints per level are stored **base64-encoded** (decoded only when you click "reveal"), and [SOLUTIONS.md](SOLUTIONS.md) is encoded too. This helps avoid accidental spoilers; it is not encryption.

After an incident is resolved, a short post-incident review asks you to explain the mechanism and
the evidence that led to your fix. Check attempts and hint usage are stored locally as a
spoiler-free learning profile for future personalized practice.

## The curriculum

**Act I — Core React (JavaScript):** rendering & JSX · conditional rendering · props · state & immutability · state updates · lists & keys · controlled forms · effect dependencies · effect cleanup · async race conditions · context · memoization & renders

**Act II — The TypeScript Arc:** typing data (the cost of `any`) · typing custom hooks · a multi-bug reducer capstone with discriminated unions

Difficulty ramps two ways: the concepts get more advanced, *and* the bugs get better at hiding.

## Getting started

```bash
npm install
npm run dev
```

Open the printed URL, start Level 01, and keep your editor open next to the browser.

## House rules

- **Keep your exercise edits in `src/levels/`.** `src/shell/` is application infrastructure, outside the intended lesson scope. All planted bugs live in the level folders.
- **Don't remove `data-testid` attributes or edit the `checks` in a level's `manifest.js`** — they're the executable spec. *Reading* them when stuck is fair game; that's what reading a failing test at work is.
- If a fix doesn't seem to register after hot-reload, refresh the browser tab and re-run the checks.
- **Keep `main` pristine — it's the game cartridge.** Play on your own branch and commit your fixes there:

  ```bash
  git checkout -b playthrough
  ```

  Your commits become a record of what you learned. After saving work you want to keep, `git restore --source=main src/levels/06-musical-chairs/` restores that lesson's source to its starting state. Returning to `main` restores the committed starting source only when your working tree allows it; uncommitted edits may follow you between branches. Browser progress is separate: use Reset progress in the app to clear completion.
- Using an AI assistant? Ask it to **coach, not solve** — the in-app hints exist for a reason.

## Tech notes

- **Vite + React 19 + plain CSS.** Each preview and each check owns a disposable iframe. Inside it, the small check harness (`src/shell/harness.jsx`) mounts the component with `createRoot`, drives native-setter events, and asserts on the DOM. No production test framework is required.
- Leaving a lesson or resetting progress cancels its check run. Checks have a 15-second asynchronous time limit. Removing a frame disposes its timers and module state, including work a faulty component failed to clean up. These same-origin frames are lifecycle isolation, not a security boundary; a synchronous infinite loop can still freeze the tab and require closing or reloading it.
- **No `<StrictMode>`, deliberately** — the harness counts renders and effect firings, and StrictMode's double-invocation would make honest checks report false failures.
- Levels 13–15 are TypeScript. Vite transpiles `.tsx` separately from the compiler. React declarations are installed for useful editor/compiler feedback; type escapes in the starting lessons mean a clean compiler run does not prove the exercise behavior is correct.

## Project checks

Run these independently from the repository root (use `npm.cmd` on Windows if PowerShell blocks `npm`):

| Command | Purpose |
|---|---|
| `npm test` | Shell persistence, telemetry, and frame lifecycle regressions |
| `npm run typecheck:lessons` | TypeScript diagnostics; does not solve or execute lesson checks |
| `npm run validate:levels` | Validate the registry, file references, check names, and encoded hint structure without revealing hints |
| `npm run build` | Build the application and exercise entry points |

In-app check failures on the starting lessons are expected. The shell tests and curriculum validator preserve those deliberate bugs.

## Roadmap

- **Season 1** *(this repo)* — Core React + TypeScript, 15 levels
- **Season 2** — Next.js edition: hydration mismatches, server/client boundary bugs, caching traps
- **Season 3** — Bring-your-own-agent: pull the repo and let your AI coding agent generate fresh, personalized bugs via a bundled skill

## Credits

Game shell, levels, lessons, and every planted bug authored by Claude (Anthropic), designed collaboratively as a learning project. The bugs are modeled on real-world React failure modes you'll meet on the job.
