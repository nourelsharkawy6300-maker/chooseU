# ChooseU — Design System (`DESIGN.md`)

## Brand Direction
High-clarity Egyptian EdTech & university decision platform. Confident, modern, executive-clean — **Obsidian Ink + Crisp Signal Yellow + Warm Paper**.

## Color Tokens
- **Primary Action Fill:** `#FACC15` (Hover: `#EAB308`) — ALWAYS paired with `#09090B` (`text-slate-950`) text for high WCAG contrast.
- **Readable Gold Accent (on light surfaces):** `#B45309` (`text-amber-700`) / `#92400E` (`text-amber-800`).
- **Dark Surface / Hero Canvas:** `#09090B` (`bg-zinc-950`) and `#18181B` (`bg-zinc-900`) with subtle `border-white/10`.
- **Light Surface / App Canvas:** `#FAFAF9` / `#FFFFFF` with crisp `border-slate-200`.
- **Semantic Status:** Emerald (`#059669`) for Safe/Funded, Amber (`#D97706`) for Target/Warning, Rose (`#E11D48`) for Risk/Gap.
- **Forbidden:** Legacy `blue-*`, `indigo-*`, `sky-*`, `cyan-*`, and white text on yellow fills.

## Typography & Hierarchy (RTL Arabic)
- Headings: Tight tracking, `font-extrabold`, clear contrast between Hero display (`text-4xl sm:text-5xl lg:text-6xl`), section titles (`text-2xl`), and card headers (`text-[15px]`).
- Numeric Data (Scores, TCO, EGP, Years): Always use `tabular-nums` for aligned scanning.
- Max 2 visual emphasis points per card; avoid stacked badges and redundant micro-copy.

## Motion & 60fps Rules
- Animate GPU-composited properties only (`transform`, `opacity`). Never animate `top/left/width/height`.
- Ambient background orbs must stay `pointer-events-none`, subtle opacity (`0.14–0.32`), slow organic drift (`16s–26s`), and respect `prefers-reduced-motion`.
- Interactive springs: crisp and restrained (`duration: 0.18–0.35`, `ease: [0.22, 1, 0.36, 1]`).