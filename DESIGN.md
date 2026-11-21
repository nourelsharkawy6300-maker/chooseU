# ChooseU — DESIGN.md

## Brand & Audience
- **Language & Direction:** Arabic (`dir="rtl"`), clear parent- and student-friendly copy (no engineering/cyber jargon in UI).
- **Palette:**
  - Paper background: `#faf8f5` / `#f2efe9`
  - Primary Ink: `#1c1736`
  - Secondary Ink: `#48425f`
  - Primary Accent (Action): `#377ef0`
  - Borders: `#dedad0` / `#e6e4dd`
  - Success: `emerald-600` / `emerald-700`
- **Layout Rules:**
  - Mobile-first, generous vertical padding (`pt-11` when using `BlueprintFrame` with top labels).
  - Never show empty telemetry/badges (`0 ج.م`, `غير محدد`) before the user enters data.
  - Keep cards clean: max 1 primary action per card, avoid cluttered secondary badges on mobile.