import { spawn } from "child_process";
import http from "http";

const PORT = 3005;
const BASE_URL = `http://127.0.0.1:${PORT}`;

function makeRequest(url, options = {}, body = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(url);
    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method: options.method || "GET",
        headers: options.headers || {},
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: data,
          });
        });
      }
    );
    req.on("error", reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });
    if (body) {
      req.write(typeof body === "string" ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function waitForServer(retries = 40, delayMs = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await makeRequest("http://127.0.0.1:" + PORT + "/");
      if (res.statusCode) return true;
    } catch (e) {
      if (i === 10) console.log("Probe error (127.0.0.1):", e.message);
      try {
        const res2 = await makeRequest("http://localhost:" + PORT + "/");
        if (res2.statusCode) return true;
      } catch (e2) {
        if (i === 10) console.log("Probe error (localhost):", e2.message);
      }
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  return false;
}

async function runTestSuite() {
  console.log("🚀 Starting Next.js production server for automated test run on port " + PORT + "...");
  const server = spawn("cmd.exe", ["/c", "npx", "next", "start", "-p", String(PORT)], {
    stdio: "pipe",
    env: { ...process.env, PORT: String(PORT) },
  });

  server.stdout.on("data", (d) => process.stdout.write(d.toString()));
  server.stderr.on("data", (d) => process.stderr.write(d.toString()));

  const isReady = await waitForServer();
  if (!isReady) {
    console.error("❌ Failed to connect to Next.js server on port " + PORT);
    server.kill();
    process.exit(1);
  }
  console.log("✅ Next.js server is up and listening on " + BASE_URL);

  const results = [];

  function record(suite, testName, passed, details = "") {
    results.push({ suite, testName, passed, details });
    const mark = passed ? "✅ PASS" : "❌ FAIL";
    console.log(`${mark} [${suite}] ${testName} ${details ? `(${details})` : ""}`);
  }

  try {
    // 1. Landing Page Test
    const landing = await makeRequest(`${BASE_URL}/`);
    record(
      "Main Route",
      "GET / status code is 200",
      landing.statusCode === 200,
      `Status: ${landing.statusCode}`
    );
    record(
      "Main Route",
      "HTML contains dir='rtl' and lang='ar'",
      landing.body.includes('dir="rtl"') && landing.body.includes('lang="ar"'),
      "RTL & Arabic attributes"
    );
    record(
      "Main Route",
      "IBM Plex Sans Arabic loaded",
      landing.body.includes("IBM+Plex+Sans+Arabic"),
      "Google Font link"
    );
    record(
      "Main Route",
      "Tailwind CDN script included",
      landing.body.includes("cdn.tailwindcss.com"),
      "Instant Tailwind rendering"
    );

    // 2. Security Headers Test
    record(
      "Security Headers",
      "X-Frame-Options is DENY",
      landing.headers["x-frame-options"] === "DENY",
      landing.headers["x-frame-options"]
    );
    record(
      "Security Headers",
      "X-Content-Type-Options is nosniff",
      landing.headers["x-content-type-options"] === "nosniff",
      landing.headers["x-content-type-options"]
    );
    record(
      "Security Headers",
      "Referrer-Policy is strict-origin-when-cross-origin",
      landing.headers["referrer-policy"] === "strict-origin-when-cross-origin",
      landing.headers["referrer-policy"]
    );
    record(
      "Security Headers",
      "Content-Security-Policy header is active",
      typeof landing.headers["content-security-policy"] === "string" &&
        landing.headers["content-security-policy"].length > 20,
      "CSP Policy length: " + (landing.headers["content-security-policy"]?.length || 0)
    );

    // 3. Admin Route
    const admin = await makeRequest(`${BASE_URL}/admin`);
    record(
      "Admin Page",
      "GET /admin status code is 200",
      admin.statusCode === 200,
      `Status: ${admin.statusCode}`
    );
    record(
      "Admin Page",
      "Admin staff gate UI is present",
      admin.body.includes("بوابة فريق الإشراف") || admin.body.includes("الإشراف"),
      "Passcode gate rendered"
    );

    // 4. API Input Validation: POST /api/orders
    const badPhoneRes = await makeRequest(
      `${BASE_URL}/api/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        studentName: "محمود حسن",
        stream: "Science",
        scorePct: 91.2,
        facultyId: "sci-1",
        facultyName: "طب المنوفية",
        tcoTotalEgp: 15000,
        serviceTier: "advisor_session",
        priceEgp: 299,
        whatsappPhone: "12345", // Invalid Egyptian phone
      }
    );
    record(
      "API Security",
      "POST /api/orders rejects invalid phone number (400)",
      badPhoneRes.statusCode === 400,
      `Status: ${badPhoneRes.statusCode}`
    );

    const emptyBodyRes = await makeRequest(
      `${BASE_URL}/api/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {}
    );
    record(
      "API Security",
      "POST /api/orders rejects empty payload (400)",
      emptyBodyRes.statusCode === 400,
      `Status: ${emptyBodyRes.statusCode}`
    );

    const validOrderRes = await makeRequest(
      `${BASE_URL}/api/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      {
        studentName: "سارة إبراهيم",
        stream: "Science",
        scorePct: 92.5,
        facultyId: "sci-1",
        facultyName: "طب بشري المنوفية",
        tcoTotalEgp: 15000,
        serviceTier: "advisor_session",
        priceEgp: 299,
        whatsappPhone: "01012345678", // Valid phone
      }
    );
    const validJson = JSON.parse(validOrderRes.body || "{}");
    record(
      "API Security",
      "POST /api/orders accepts valid payload and creates orderCode",
      validOrderRes.statusCode === 201 && validJson.orderCode?.startsWith("CU-"),
      `OrderCode: ${validJson.orderCode}`
    );

    // 5. Admin RBAC & Session Protection
    const unauthAdmin = await makeRequest(`${BASE_URL}/api/admin/orders`);
    record(
      "RBAC Protection",
      "GET /api/admin/orders rejects unauthenticated requests (403)",
      unauthAdmin.statusCode === 403,
      `Status: ${unauthAdmin.statusCode}`
    );

    const badAuth = await makeRequest(
      `${BASE_URL}/api/admin/auth`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { passcode: "wrong-passcode" }
    );
    record(
      "RBAC Protection",
      "POST /api/admin/auth rejects incorrect passcode (401)",
      badAuth.statusCode === 401,
      `Status: ${badAuth.statusCode}`
    );

  } catch (err) {
    console.error("Test execution error:", err);
  } finally {
    console.log("Shutting down test server...");
    server.kill();
  }

  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;

  console.log("\n==================================================");
  console.log(`📊 TEST REPORT: ${passedCount} PASSED | ${failedCount} FAILED out of ${results.length} checks`);
  console.log("==================================================");
}

runTestSuite();
