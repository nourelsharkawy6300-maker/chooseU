# ChooseU Entry Experience - Progress Tracker

## Session Metadata
- **Current Phase**: Phase 1 (Foundations) — Completed -> Ready for Phase 2
- **Active Branch**: `entry-experience`
- **Last File Touched**: `src/lib/copy-registry.ts`
- **Next Step**: Phase 2: Intro Sequence (Task 2.1: Pinned scroll container and stage)
- **Open Blockers**: None

---

## Master Task Checklist

### Phase 0: Recon and Safety
- [x] Task 0.1: Create branch `entry-experience` and initialize `PROGRESS.md`.
- [x] Task 0.2: Locate and audit the existing logo asset.
- [x] Task 0.3: Inspect current login page implementation and flows.
- [x] Task 0.4: Browse and study reference sites via browser tool / web research.
- [x] Task 0.5: Compile Extracted Patterns list.
- [x] Task 0.6: Conduct security audit of phone/order-code flow.
- [x] Task 0.7: Run baseline checks (tsc, check:terms) and publish Phase 0 Status Report.

### Phase 1: Foundations
- [x] Task 1.1: Design motion tokens, easing curves, and scroll hooks (`useScrollProgress`).
- [x] Task 1.2: Build animatable letter split component (`LogoLetterDispersion` / `ChooseULogoSplit`).
- [x] Task 1.3: Build glassmorphism styling utilities & tier fallback (reduced motion / low-spec detection).
- [x] Task 1.4: Update copy registry (`src/lib/copy-registry.ts`) for all entry & login strings.
- [x] Task 1.5: Micro-step verification (tsc) and commit Phase 1.

### Phase 2: Intro Sequence
- [ ] Task 2.1: Implement pinned scroll container (~250-350vh sticky stage) with Obsidian ambient glow.
- [ ] Task 2.2: Implement symmetric letter dispersion choreography (0-70% scroll).
- [ ] Task 2.3: Implement scroll hint ("اسحب للأسفل"), skip button ("تخطي"), and keyboard controls.
- [ ] Task 2.4: Implement session storage flag ("intro-seen") and prefers-reduced-motion bypass.
- [ ] Task 2.5: Verify 360px mobile responsive touch behavior, run tsc, commit Phase 2.

### Phase 3: Login Redesign
- [ ] Task 3.1: Build Obsidian glass card container with layered shadows and glowing borders.
- [ ] Task 3.2: Rebuild Tab 1: Phone / Order-code login form with RTL logical styling and LTR input dir.
- [ ] Task 3.3: Rebuild Tab 2: Email & Password form with toggle visibility and dark autofill styling.
- [ ] Task 3.4: Integrate calm state feedback (loading, 429 rate limit, network failure, generic error).
- [ ] Task 3.5: Verify WCAG AA contrast on glass, run tsc, commit Phase 3.

### Phase 4: Routing & Handoff
- [ ] Task 4.1: Seamless scroll handoff: 60-100% scroll transition from dispersing logo to rising login card.
- [ ] Task 4.2: Move/preserve marketing landing page to `/discover` without loss of functionality.
- [ ] Task 4.3: Configure `/` entry route (authenticated bypass, return-to query param support).
- [ ] Task 4.4: Keyboard focus handoff (auto-focus first login field upon intro completion).
- [ ] Task 4.5: Run tsc, lint, commit Phase 4.

### Phase 5: Performance, QA & Final Handover
- [ ] Task 5.1: Performance audit: 60fps verification under 4x CPU throttle simulation, CLS < 0.1.
- [ ] Task 5.2: Mobile responsiveness audit (360px viewport) and reduced-motion / reduced-transparency audit.
- [ ] Task 5.3: Legal compliance check (`npm run check:terms` for banned words and inflections).
- [ ] Task 5.4: Full production build test (`npm run build` with dev server stopped).
- [ ] Task 5.5: Final Handover Report and git log verification.
