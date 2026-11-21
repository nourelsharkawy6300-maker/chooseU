# ChooseU Agent Skills (React/Next.js + Supabase + Testing)

## 1. Vercel & React Best Practices
- Prefer Server Components by default; add `"use client"` only for interactive state/hooks.
- Avoid waterfall fetches; parallelize independent async calls with `Promise.all`.
- After Supabase auth mutations (login/logout), use `window.location.assign(...)` so Middleware receives fresh cookies.
- Keep bundle lean: rely on `optimizePackageImports` for `lucide-react` and `framer-motion`.

## 2. Supabase & Postgres Best Practices
- Enforce Row Level Security (RLS) on every public table; never expose `service_role` to the browser.
- Validate all inputs and prices server-side with `zod` before writing to Postgres.
- Use parameterized queries / RPCs; never interpolate raw user input into SQL.

## 3. Web App Testing (Playwright CLI)
- Run `npx playwright test` before major production deploys.
- Cover critical flows: `/login` -> `/workspace` redirect, empty-state header for guests, `/api/ai/chat` 200 response, and mobile viewport (`390x844`) overlap checks.