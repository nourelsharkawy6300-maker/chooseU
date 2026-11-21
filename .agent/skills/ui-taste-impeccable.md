# Skill: UI Taste & Impeccable Standards

Apply these rules whenever creating or refactoring any UI component in this repository.

## Anti-AI-Slop Rules (NEVER DO)
- **No generic neon/purple-blue gradients** on backgrounds, text, or buttons. Stick strictly to `DESIGN.md` tokens.
- **No badge soup:** Do not attach multiple pills, tags, or category badges inside quiz options or mobile cards.
- **No decorative clutter:** Every icon, border, and label must serve a clear user comprehension goal.
- **No English developer labels** in Arabic user-facing UI (`PROGRESS`, `ENGINE`, `QUIZ`, `SYSTEM`).

## Impeccable Polish Checklist (ALWAYS DO)
1. **Optical Alignment:** Ensure icons align cleanly with Arabic text baselines (`items-center gap-2`).
2. **State Completeness:** Every interactive element must define `default`, `hover`, `active`, `focus-visible`, `disabled`, and `loading` states.
3. **Responsive Integrity:** Verify grids collapse cleanly to `grid-cols-1` on mobile (`390px`) with comfortable tap targets (`min-h-[44px]`).
4. **Progressive Disclosure:** Show only what the user needs at the current step; reveal detailed breakdowns on demand.
5. **Consistency Check:** Before finishing any UI edit, cross-check colors, border radii, and spacing against `DESIGN.md`.