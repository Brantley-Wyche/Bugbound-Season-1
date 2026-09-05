<!-- installing-frontend-workflow:start -->
## Frontend workflow

Apply this workflow automatically whenever work changes React components, routes, styles, UI behavior, accessibility, responsive behavior, or frontend performance. Do not run the full workflow for backend-only, documentation-only, or non-UI test changes.

1. Use `$impeccable` as the product, UX, and visual-design authority. Preserve the project's established product requirements, design system, components, and visual identity for narrow refinements. Follow Impeccable's discovery and shaping workflow before creating a new surface or replacing the visual system.
2. Use `$vercel-react-best-practices` while writing or refactoring React code. Prioritize waterfalls, bundle size, server behavior, data fetching, and rendering before low-impact micro-optimizations. Inspect the actual framework, versions, adapters, and deployment target; apply framework-specific APIs only when supported.
3. Once implementation is stable, use `$web-design-guidelines` as an independent audit of the changed UI files, and perform a focused React Best Practices review of the same change. Treat findings as review input rather than automatic edits.
4. Classify findings by severity and applicability. Reject findings that conflict with explicit product requirements, accessibility or correctness, the established design system, or verified framework constraints. Feed valid findings through the appropriate Impeccable remediation workflow, such as polish, harden, adapt, clarify, or optimize.
5. Run repository-defined verification and browser QA at desktop and mobile sizes when the result is visual or interactive. Re-run the two targeted audits once on the final changed files; do not create an open-ended polish loop.

Resolve conflicts in this order: explicit user and product requirements; accessibility, correctness, security, and data integrity; established product and design documentation; verified framework behavior and measured performance; general checklist guidance; aesthetic preference.
<!-- installing-frontend-workflow:end -->

## Required design review

- After a frontend redesign or substantive UI change is implemented and has passed repository checks and desktop/mobile browser QA, offer a formal `$impeccable critique` pass. Ask the user whether to start it and wait for their go-ahead; do not silently run it or describe implementation QA as a completed critique.
- Once authorized, follow the full critique workflow, including its independent design assessment and detector/browser assessment. Keep their evidence independent until synthesis. Report the method, limitations, prioritized findings, and recommendations.
- Include a focused `$vercel-react-best-practices` review and `$web-design-guidelines` audit of changed UI files. Apply only recommendations compatible with React/Vite and the learning contracts below.
- Use the applicable Impeccable remediation guidance (`harden`, `layout`, `adapt`, `colorize`, `clarify`, `optimize`, then `polish`) for approved findings. Do not claim every command ran when only its guidance was consulted.
- Preserve the simple Season 1 implementation: plain CSS, no Tailwind or SCSS system, and minimal dependencies. Base UI is approved only if a concrete interaction benefits from its unstyled primitives; do not add it preemptively.

## Learning-project boundaries

- Bugbound teaches React through intentional bugs in `src/levels/`. Preserve those bugs unless the user explicitly requests a lesson fix or curriculum change. Separate planted lesson behavior from defects in `src/shell/` and shared UI when auditing.
- Preserve level `data-testid` attributes and manifest checks: they are the executable learning contract. Do not change them merely to make an audit or validation pass.
- The absence of React `StrictMode` is deliberate because the check harness measures renders and effect firings. Do not enable it as a general best-practice cleanup.
- Keep audit findings spoiler-free unless the user requests solutions. Classify expected lesson failures separately from shell, test, and environment failures.
