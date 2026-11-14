# ChooseU — Design System Specification & UI Standards (`DESIGN.md`)

> **Core Philosophy:** "One Platform. Every Student. Every Major. Every Future."  
> **Aesthetic Archetype:** Warm Luxury Alabaster × Precision Analytical Glassmorphism  
> **Caliber Standards:** Linear (precision & rhythm), Airbnb (warm hospitality), Duolingo (friendly gamification).

---

## 1. Visual Identity & Foundations

### 1.1 Base Color Palette
| Token Name | Hex Code | Tailwind Equivalent | Usage |
| :--- | :--- | :--- | :--- |
| **Warm Canvas** | `#FAF8F5` | `bg-[#FAF8F5]` / `bg-warm` | Platform base background (warm ivory/alabaster) |
| **Card Surface** | `#FFFFFF` | `bg-white` | Elevated interactive cards, modals, popovers |
| **Surface Muted** | `#F1F5F9` | `bg-slate-100` | Input backgrounds, slider tracks, subtle badges |
| **Obsidian Dark** | `#0F172A` | `bg-[#0F172A]` | Primary buttons, Live DNA Card gradient start, nav logo |
| **Midnight Navy**| `#1E293B` | `bg-[#1E293B]` | Live DNA Card gradient mid-tone, header borders |
| **Text Primary** | `#0F172A` | `text-slate-900` | High-contrast Arabic headings, primary card titles |
| **Text Secondary**| `#475569` | `text-slate-600` | Explanatory descriptions, bylaw text |
| **Text Muted** | `#64748B` | `text-slate-500` | Captions, timestamps, secondary labels |
| **Border Subtle** | `#E2E8F0` | `border-slate-200/80` | Card perimeters, dividers, input borders |

---

### 1.2 Color-Coded Academic Clusters (The 6 Sectors)
Every major, faculty, and quiz option belongs to one of the 6 color-coded clusters:

```
┌────────────────────────────────────────────────────────────────────────┐
│ Medical_Bio      Emerald (#059669)  القطاع الطبي والصحي والحيوي        │
│ Eng_Tech         Royal Blue (#2563EB) القطاع الهندسي والذكاء الاصطناعي   │
│ Media_Lang       Purple (#9333EA)   قطاع الألسن واللغات والإعلام       │
│ Biz_Econ         Amber (#D97706)    قطاع المال والأعمال والاقتصاد و BIS │
│ Law_Edu_Social   Indigo (#4F46E5)   قطاع القانون والتربية والعلوم      │
│ Applied_Agri_Arts Teal (#0D9488)    قطاع العلوم التطبيقية والفنون و GIS│
└────────────────────────────────────────────────────────────────────────┘
```

* **`Medical_Bio`**: Emerald (`text-emerald-700`, `bg-emerald-50`, `border-emerald-200`, accent `#059669`)
* **`Eng_Tech`**: Royal Blue (`text-blue-700`, `bg-blue-50`, `border-blue-200`, accent `#2563EB`)
* **`Media_Lang`**: Purple (`text-purple-700`, `bg-purple-50`, `border-purple-200`, accent `#9333EA`)
* **`Biz_Econ`**: Amber (`text-amber-700`, `bg-amber-50`, `border-amber-200`, accent `#D97706`)
* **`Law_Edu_Social`**: Indigo (`text-indigo-700`, `bg-indigo-50`, `border-indigo-200`, accent `#4F46E5`)
* **`Applied_Agri_Arts`**: Teal (`text-teal-700`, `bg-teal-50`, `border-teal-200`, accent `#0D9488`)

---

## 2. Typography & Numerical Formatting

### 2.1 Typeface
* **Primary Arabic & Latin Font:** `IBM Plex Sans Arabic`
  * Weights: `400` (Regular), `500` (Medium), `600` (SemiBold), `700` (Bold)
  * Fallbacks: `system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`
  * Features: `font-feature-settings: "cv02", "cv03", "cv04", "cv11"`

### 2.2 Numerical & Directional Rules
* **Tabular Numbers (`.tabular-nums`):** Mandatory for all percentages (`83.5%`), currency (`65,000 ج.م`), scores, and timers to prevent layout jitter during live calculation.
* **Directional Discipline:**
  * Document Root: `dir="rtl"` (Arabic natural flow).
  * Numeric Inputs, Codes, Phone Numbers, and Reference IDs: `.dir-ltr.text-left` or `.font-mono`.

### 2.3 Typographic Scale
* `text-[10px]`: Micro-badges, timeline phase counters.
* `text-[11px]`: Cluster pill badges, captions, sub-labels, table footnotes.
* `text-[12px]`: Standard secondary copy, button micro-actions, descriptions.
* `text-[13px]`: Standard body text, form input labels.
* `text-[15px]` – `text-[16px]`: Card titles, modal section labels.
* `text-[18px]` – `text-[20px]`: Tab titles, hero headings, Persona titles.

---

## 3. Geometry, Elevation & Corner Radius Scale

* **Floating Glass Dock:** `rounded-2xl` (`1rem`), padding `p-1.5`, `bg-white/80`, `backdrop-blur-md`, subtle border `border-slate-200/80`.
* **Standard Interactive Cards:** `rounded-3xl` (`1.5rem`), padding `p-5` to `p-6`, `border border-slate-200/80`.
* **Interactive Pills & Badges:** `rounded-full` or `rounded-xl`, padding `px-2.5 py-0.5`.
* **Elevations (Shadows):**
  * Base: `shadow-2xs` (`0 1px 2px 0 rgba(0, 0, 0, 0.04)`)
  * Card: `shadow-xs` / `shadow-sm`
  * Hover Lift: `hover:-translate-y-0.5 hover:shadow-md transition-all duration-200`
  * Live DNA Card: `shadow-xl border border-slate-700/70`

---

## 4. Taste & Impeccable UI Principles

### 4.1 Visual Hierarchy & Clean Whitespace
1. **Primary vs. Secondary Actions:** Maximum of ONE high-contrast `#0F172A` button per viewport. Secondary actions use `bg-white border border-slate-200 hover:bg-slate-50`.
2. **Breathing Room:** Outer view layouts enforce `py-8` to `py-10` with max container width `max-w-7xl mx-auto`.
3. **No Overlapping Fixed Footers:** Bottom page container enforces `pb-32` padding so sticky controls never obscure dropdowns or action buttons.

### 4.2 Smooth Micro-Interactions & Feedback
1. **Option Selection:** Instant feedback via `border-blue-500 ring-2 ring-blue-500/20` and slight scale-up.
2. **Range Sliders (`.enterprise-slider`):**
   * White rounded thumb with `2.5px solid #2563EB` and subtle drop-shadow.
   * `hover:scale-110` with glowing focus ring `box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.15)`.

### 4.3 Accessible Contrast & Zero Visual Clutter
1. Text contrast strictly meets WCAG 2.1 AA standards (minimum 4.5:1 ratio for regular text against `#FAF8F5` and white surfaces).
2. Elimination of raw JSON, Base64 strings, or developer debug buttons from public views.

---

## 5. Signature Component Standards

### 5.1 The Geometric SVG Brand Logo
* **Rules:** `w-10 h-10` container with internal SVG `width="24" height="24"` and `viewBox="0 0 36 36"`.
* **Meaning:** Interlocking architectural node paths in `#FFFFFF` and `#2563EB` representing academic and career pathways.
* **Prohibition:** NEVER use the generic student graduation cap icon.

### 5.2 The 6-Axis SVG Radar Hexagon
* **Rules:** Geometric SVG polygon calculated with KaTeX/trigonometric precision:
  $$\theta_i = \frac{i \times 2\pi}{6} - \frac{\pi}{2}, \quad x_i = x_0 + R \times \cos(\theta_i), \quad y_i = y_0 + R \times \sin(\theta_i)$$
* Concentric guide rings at 25%, 50%, 75%, 100%.
* Translucent blue fill (`rgba(37, 99, 235, 0.22)`) with a clean `2.5px` border.

### 5.3 Three-Ring SVG Circular Progress Meters
* Diameter `44px`, stroke-width `3.2px`, circumference $C = 2\pi r \approx 100.5\text{px}$.
* Ring 1: Personal Affinity Match % (Blue `#2563EB`).
* Ring 2: Admission Score Margin (Safe Green `#059669` or Target Blue `#2563EB` or Stretch Amber `#D97706`).
* Ring 3: Financial Fit Ratio (Green `#059669` or Red `#DC2626`).

### 5.4 Dream vs. Reality Split Card
* A dual-sided comparison module connecting a high-affinity stretch college to its direct accessible alternative in the same sector via an animated glowing connector (`"البديل الواقعي المتاح لمجموعك ←"`).

### 5.5 Head-to-Head "VS Mode" Comparison Arena
* Side-by-side evaluation of 2–3 faculties with dynamic green Winner Badges (`🏆 الفائز في هذا المعيار`) across:
  1. 4-Year TCO Financial Cost
  2. Personal Affinity Match
  3. Admission Margin
  4. Commute & Housing Savings
  5. Starting Salary & Market Demand
