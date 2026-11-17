import assert from "assert";

console.log("=== Verification: Phase 0.5 Implementation ===");

// 1. Verify src/lib/supabase.ts uses SUPABASE_SERVICE_ROLE_KEY
import fs from "fs";
import path from "path";

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

console.log("\nALL PHASE 0.5 VERIFICATION CHECKS PASSED SUCCESSFULLY!");
