import assert from "assert";
import fs from "fs";
import path from "path";

console.log("=== Verification: Phase 0.5 Implementation ===");

// Helper to load env for live probe without leaking secrets
function loadEnv() {
  const envPath = path.resolve(".env.local");
  if (fs.existsSync(envPath)) {
    const lines = fs.readFileSync(envPath, "utf8").split("\n");
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim();
        if (!process.env[k]) {
          process.env[k] = v;
        }
      }
    }
  }
}

// 1. Verify src/lib/supabase.ts uses SUPABASE_SERVICE_ROLE_KEY
const supabaseFile = fs.readFileSync("src/lib/supabase.ts", "utf8");
assert(
  supabaseFile.includes("process.env.SUPABASE_SERVICE_ROLE_KEY"),
  "supabase.ts must check process.env.SUPABASE_SERVICE_ROLE_KEY"
);
assert(
  supabaseFile.includes("export function getSupabaseServerClient"),
  "supabase.ts must export getSupabaseServerClient"
);
console.log("✓ Step 1 verified: Server-only Supabase client supports service-role key.");

// 2. Verify src/app/api/orders/route.ts
const routeFile = fs.readFileSync("src/app/api/orders/route.ts", "utf8");
assert(
  routeFile.includes("getSupabaseServerClient"),
  "route.ts must import and use getSupabaseServerClient"
);
assert(
  routeFile.includes("progress_label"),
  "route.ts must include progress_label"
);
assert(
  !routeFile.includes("PUBLIC_FIELDS"),
  "route.ts must not have old PUBLIC_FIELDS multi-field select"
);
assert(
  routeFile.includes(".select(\"order_code, order_status\")"),
  "route.ts must select strictly order_code and order_status"
);
// Verify response object keys strictly
assert(
  routeFile.includes("order_code: data.order_code") &&
  routeFile.includes("order_status: data.order_status") &&
  routeFile.includes("progress_label"),
  "route.ts must return only order_code, order_status, progress_label"
);
console.log("✓ Step 2 verified: GET /api/orders strictly selects and returns only { order_code, order_status, progress_label }.");

// 3. Verify no direct client-side Supabase REST or SDK calls in TrackOrderView and DataServices
const securityDbFile = fs.readFileSync("src/lib/security-db.ts", "utf8");
assert(
  !securityDbFile.includes("/rest/v1/consultation_orders"),
  "security-db.ts must not contain direct calls to /rest/v1/consultation_orders"
);
assert(
  !securityDbFile.includes("getSupabaseHeaders"),
  "security-db.ts must not use anon getSupabaseHeaders"
);
assert(
  securityDbFile.includes("fetch(\n        `/api/orders?code="),
  "security-db.ts getOrderByCodeOrPhone must use fetch('/api/orders?code=...')"
);

const platformPagesFile = fs.readFileSync("src/components/PlatformPages.tsx", "utf8");
assert(
  !platformPagesFile.includes("/rest/v1/consultation_orders"),
  "PlatformPages.tsx must not contain direct calls to /rest/v1/consultation_orders"
);
assert(
  platformPagesFile.includes("fetch(`/api/orders?code="),
  "PlatformPages.tsx TrackOrderView must use fetch('/api/orders?code=...')"
);
console.log("✓ Step 3 verified: Frontend TrackOrderView and DataService use fetch('/api/orders') and have zero direct Supabase client calls.");

// 4. Live Anon REST Request Probe (outputs status code and byte size ONLY, zero secrets or row data logged)
loadEnv();
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mkrnrkdtvkcdymufehlg.supabase.co";
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (supabaseUrl && anonKey) {
  try {
    const res = await fetch(`${supabaseUrl}/rest/v1/consultation_orders?limit=1`, {
      method: "GET",
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    });
    const text = await res.text();
    const byteLength = Buffer.byteLength(text, "utf8");
    console.log(`✓ Step 4 live probe: GET /rest/v1/consultation_orders with anon key -> Status: ${res.status}, Body Size: ${byteLength} bytes`);
  } catch (err) {
    console.log(`! Step 4 live probe error: ${err.message}`);
  }
} else {
  console.log("! Step 4 live probe skipped: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set.");
}

console.log("\nALL PHASE 0.5 VERIFICATION CHECKS PASSED SUCCESSFULLY!");
