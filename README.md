# 🐛 Bugbound

> **Learn React by fixing it.** A level-based debugging game where every lesson ships with a real, intentionally planted bug — and you're the engineer on call.

Bugbound is a self-contained React practice app. Instead of watching tutorials, you work **15 escalating levels**: each one teaches a core React concept, then hands you a bug report for a live component that genuinely misbehaves. You open the file in your own editor, fix the code, watch it hot-reload, and run the in-app checks. All green → the next level unlocks.

No embedded code editor, no sandbox — you use your real editor, real Vite HMR, and real debugging workflow, because that *is* the skill being practiced.

## How it works

Each level has four parts:

| Part | What it does |
|---|---|
| 📘 **The concept** | A short lesson on one React idea (state snapshots, keys, effect cleanup, …) |
| 🐛 **Bug report** | The symptom, QA-ticket style, plus where to look. Early levels name the exact file; later ones just point at a folder |
| 🔬 **Live preview** | The actual buggy component, running. Reproduce the report yourself |
| ✅ **Checks** | An in-browser test harness that mounts the component in isolation, simulates real clicks and typing, and shows pass/fail with readable failure messages |

Progress is saved to `localStorage`. Three escalating hints per level are stored **base64-encoded** (decoded only when you click "reveal"), and [SOLUTIONS.md](SOLUTIONS.md) is encoded too — you can't spoil yourself by accident.

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

- **Don't edit anything in `src/shell/`** — that's the game itself, and it's bug-free. All planted bugs live in `src/levels/`.
- **Don't remove `data-testid` attributes or edit the `checks` in a level's `manifest.js`** — they're the executable spec. *Reading* them when stuck is fair game; that's what reading a failing test at work is.
- If a fix doesn't seem to register after hot-reload, refresh the browser tab and re-run the checks.
- Commit as you go — `git diff` of your fixes becomes a record of what you learned, and `git checkout` is your level-reset button.
- Using an AI assistant? Ask it to **coach, not solve** — the in-app hints exist for a reason.

## Tech notes

- **Vite + React 19 + plain CSS.** No test framework: the check harness (`src/shell/harness.jsx`) mounts each level component into an offscreen root with `createRoot`, drives it with native-setter events (so React's synthetic `onChange` fires exactly like real input), and asserts on the DOM.
- **No `<StrictMode>`, deliberately** — the harness counts renders and effect firings, and StrictMode's double-invocation would make honest checks report false failures.
- Levels 13–15 are TypeScript. Vite compiles `.tsx` without type-checking, which is the point: those levels are about bugs that *runtime* tolerates but a well-typed program can't express.

## Roadmap

- **Season 1** *(this repo)* — Core React + TypeScript, 15 levels
- **Season 2** — Next.js edition: hydration mismatches, server/client boundary bugs, caching traps
- **Season 3** — Bring-your-own-agent: pull the repo and let your AI coding agent generate fresh, personalized bugs via a bundled skill

## Credits

Game shell, levels, lessons, and every planted bug authored by Claude (Anthropic), designed collaboratively as a learning project. The bugs are modeled on real-world React failure modes you'll meet on the job.
