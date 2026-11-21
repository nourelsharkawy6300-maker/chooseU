# DESIGN.md — ChooseU Design System

## 1. Visual Direction & Philosophy
- **Aesthetic:** Warm Editorial Paper + Crisp Academic Precision (clean, calm, trustworthy for Egyptian high school students & parents).
- **Direction:** Strict Arabic RTL (`dir="rtl"`). Use `dir="ltr"` + `font-mono tabular-nums` ONLY for numbers, percentages, phone numbers, and currency when needed.
- **Copy Tone:** Clear, human, jargon-free Egyptian/Modern Standard Arabic. Never expose internal engineering terms (`STEP 01`, `QUIZ`, `CTF`, `SOC`, `BIS`) to students.

## 2. Color Tokens
| Role | Token / Hex | Usage |
| :--- | :--- | :--- |
| Canvas / Paper | `#faf8f5` | Page background |
| Surface Subtle | `#f2efe9` | Secondary containers, pills, subtle strips |
| Surface Elevated | `#ffffff` | Primary cards, inputs, modals |
| Ink Primary | `#1c1736` | Headings, primary data |
| Ink Secondary | `#48425f` | Body copy, descriptions |
| Ink Muted | `#64748b` | Metadata, helper text |
| Brand Accent | `#377ef0` | Primary CTA, active states, links |
| Border Default | `#dedad0` / `#e6e4dd` | Hairline card borders (1px) |
| Semantic Success | `#059669` (`emerald-600`) | Completed steps, verified badges |

## 3. Typography & Hierarchy
- **Headings:** Bold (`font-bold` / `font-extrabold`), tight tracking, high contrast (`#1c1736`).
- **Body:** `14px–16px` (`text-sm` / `text-base`), generous line-height (`leading-relaxed`) for Arabic legibility.
- **Micro-labels:** `12px` (`text-xs`), medium weight, never smaller than `11px`.

## 4. Layout & Spacing Rhythm
- **Mobile-first (`390px` baseline):** Zero horizontal overflow (`scrollWidth <= clientWidth`).
- **Card Padding:** `p-4 sm:p-5` minimum. When using `BlueprintFrame` with a top floating label, ALWAYS use `pt-11` across all breakpoints to prevent text overlap.
- **Empty States:** Never render placeholder telemetry (`0 ج.م`, `غير محدد`) in global headers before user input.

## 5. Components & Motion
- **Buttons:** Rounded (`rounded-xl` or `rounded-lg`), tactile spring feedback (`whileTap={{ scale: 0.985 }}`), clear loading/disabled states.
- **Cards:** 1px border + `shadow-xs` (avoid heavy blurred drop shadows). Max 1 primary CTA per card.