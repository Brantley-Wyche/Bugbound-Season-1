# Bugbound family design

Bugbound is one game across seasons. Each season should read as the next step from the one before: the same family, with a new working metaphor expressed through structure and capability rather than decoration. This file holds what every season shares. Each season's own `DESIGN.md` holds everything else.

Keep this file identical in all three repositories. When a family rule changes, update all three copies in the same change.

## Constants

1. **Graphite and amber.** A graphite ground, warm off-white reading text, and amber as the one accent. Amber marks the next thing to do: the primary command, the open incident, the incident numeral.
2. **The incident is the unit.** Interface copy says "incident", not lesson, exercise or level. Each incident has a two-digit folio (01) shown large beside its title and a `BUG-###` ID that matches it.
3. **Status is a word.** Pass, Fail, Open, Locked, and the season's finished word. Color and icons reinforce the word; they never carry the state alone.
4. **One finished word per season.** A finished incident has exactly one state word everywhere in that season. "Not saved yet" is the only qualifier, used when the browser couldn't store it.
5. **Saved is not verified.** A recorded finish is history. Only a run verifies the current source, and a later run never undoes the recorded finish.
6. **A record, not a banner.** Finishing an incident is recorded where verification happens, never announced in a banner at the top of the page.
7. **Ruled, not boxed.** Sections are separated by rules and whitespace. The live preview is the one framed element. No card grids, colored side-border cards, decorative shadows, or costume (terminal chrome, typewriter faces, stamps, paper textures).
8. **Monospace is for references.** Folios, IDs, paths, routes, times, counts and error detail. Never prose, never labels.
9. **A 12px floor.** No interface text smaller than 12px at any width.
10. **Desktop-first, honestly.** Solving needs a local editor and a desktop browser. Phones and touch devices can browse and get a notice saying so; a narrow desktop window beside an editor does not.
11. **Motion shows state.** Transitions only for state changes, at most one authored moment per season, and reduced motion always honored.
12. **The owner's mark.** The supplied bug mark in amber, shown beside a live-text "Bugbound" wordmark. Never redrawn or recolored.
13. **Blind mode.** Interface, docs and design work never reveal a planted bug's cause. Hints and solutions stay encoded.

## Seasons

| | Season 1 | Season 2 | Season 3 |
|---|---|---|---|
| Metaphor | On-call field notebook | Investigation desk | Engineering lab |
| Framework | React (Vite) | Next.js App Router | See its `DESIGN.md` |
| Structure it adds | Ledger register, field notes, resolution recorded in the verification log, sticky workbench | Incident rail, always-open Concept reference, framed live route, verification record with the Closed entry, case log, docket register, header progress strip, numbered collapsed rail | A precise instrument for self-directed investigations (see its `DESIGN.md`) |
| Its own accent | Sage for resolved, pale blue for code | Teal for tools and focus, sage for Closed | Muted teal |
| Type | Public Sans, Cascadia Mono | Geist, Geist Mono; Source Serif 4 for Concept prose | Segoe UI Variable, Cascadia |
| Finished word | Resolved | Closed | Defined in its `DESIGN.md` |

## Evolving the family

- A new season keeps every constant and changes the metaphor through what the interface can do and how its information is organized.
- Before adding a season-specific signature, check it against these constants. If a constant has to change, change it here first, in all three copies.
- Record each season's decisions in that repository's `DESIGN.md`. This file only names the shared rules and points to them.
