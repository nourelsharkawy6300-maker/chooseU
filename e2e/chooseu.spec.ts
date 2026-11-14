import { test, expect } from "@playwright/test";

test.describe("ChooseU — End-to-End Suite", () => {
  test.describe("1. Main Landing Page & Layout Integrity", () => {
    test("should load root page with RTL Arabic layout and essential headers", async ({
      page,
    }) => {
      // Listen for uncaught console errors
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });

      const response = await page.goto("/");
      expect(response?.status()).toBe(200);

      // Verify HTML attributes
      const html = page.locator("html");
      await expect(html).toHaveAttribute("lang", "ar");
      await expect(html).toHaveAttribute("dir", "rtl");

      // Verify title & meta
      await expect(page).toHaveTitle(/ChooseU/i);

      // Check for zero severe JavaScript uncaught errors on initial load
      const criticalErrors = consoleErrors.filter(
        (err) =>
          !err.includes("favicon") &&
          !err.includes("Third-party cookie") &&
          !err.includes("Download the React DevTools")
      );
      expect(criticalErrors).toHaveLength(0);
    });

    test("should render the Floating Glass Dock with 5 main navigation tabs", async ({
      page,
    }) => {
      await page.goto("/");
      const nav = page.locator("nav");
      await expect(nav).toBeVisible();

      // Check all 5 tabs exist in the dock
      await expect(page.getByRole("button", { name: /استكشاف الكليات/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /اختبار الميول/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /مقارنة الكليات/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /دليل التخصصات/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /وظائف المستقبل/i })).toBeVisible();
    });

    test("should switch modes between Score Matching and Exploring", async ({
      page,
    }) => {
      await page.goto("/");

      const scoreBtn = page.getByRole("button", { name: /تنسيقك ومجموعك/i });
      const exploreBtn = page.getByRole("button", { name: /استكشاف بدون درجات/i });

      await expect(scoreBtn).toBeVisible();
      await expect(exploreBtn).toBeVisible();

      // Switch to Exploring mode
      await exploreBtn.click();
      await expect(page.getByText(/وضع الاستكشاف الحر/i)).toBeVisible();

      // Switch back to Score Matching mode
      await scoreBtn.click();
      await expect(page.getByText(/النسبة المئوية في الثانوية/i)).toBeVisible();
    });
  });

  test.describe("2. Gamified Quiz & 6-Axis Radar Persona", () => {
    test("should navigate to Quiz tab and render 6-Axis Radar", async ({
      page,
    }) => {
      await page.goto("/");
      const quizTab = page.getByRole("button", { name: /اختبار الميول/i });
      await quizTab.click();

      // Check Quiz title and question options
      await expect(page.getByText(/اختبار الميول والأبعاد الأكاديمية/i)).toBeVisible();
      await expect(page.getByText(/خريطة ميولك وشخصيتك الأكاديمية/i)).toBeVisible();

      // Verify SVG Radar presence
      const svgRadar = page.locator("svg polygon");
      await expect(svgRadar.first()).toBeVisible();
    });
  });

  test.describe("3. Admin Staff Route Security Gate", () => {
    test("should guard /admin with passcode authentication modal", async ({
      page,
    }) => {
      await page.goto("/admin");
      await expect(page.getByText(/بوابة فريق الإشراف وإدارة الطلبات/i)).toBeVisible();
      await expect(page.getByPlaceholder(/أدخل الرمز السري للإدارة/i)).toBeVisible();

      // Submit incorrect passcode
      const passInput = page.getByPlaceholder(/أدخل الرمز السري للإدارة/i);
      await passInput.fill("wrong-passcode-999");
      await page.getByRole("button", { name: /تسجيل الدخول/i }).click();

      // Error message should appear
      await expect(page.getByText(/رمز المرور غير صحيح/i)).toBeVisible();
    });
  });

  test.describe("4. API Security & Input Validation", () => {
    test("POST /api/orders should reject invalid phone numbers", async ({
      request,
    }) => {
      const res = await request.post("/api/orders", {
        data: {
          studentName: "أحمد محمد",
          stream: "Science",
          scorePct: 88.5,
          facultyId: "sci-1",
          facultyName: "طب المنوفية",
          tcoTotalEgp: 15000,
          serviceTier: "advisor_session",
          priceEgp: 299,
          whatsappPhone: "12345", // INVALID Egyptian phone
        },
      });

      expect(res.status()).toBe(400);
      const json = await res.json();
      expect(json.error).toMatch(/رقم الواتساب غير صحيح/i);
    });

    test("POST /api/orders should reject missing required fields", async ({
      request,
    }) => {
      const res = await request.post("/api/orders", {
        data: {
          studentName: "",
        },
      });

      expect(res.status()).toBe(400);
    });

    test("GET /api/admin/orders should reject unauthenticated requests with 403 Forbidden", async ({
      request,
    }) => {
      const res = await request.get("/api/admin/orders");
      expect(res.status()).toBe(403);
      const json = await res.json();
      expect(json.error).toMatch(/غير مصرح/i);
    });

    test("POST /api/admin/auth should return 401 for bad credentials", async ({
      request,
    }) => {
      const res = await request.post("/api/admin/auth", {
        data: { passcode: "incorrect_passcode" },
      });
      expect(res.status()).toBe(401);
      const json = await res.json();
      expect(json.error).toMatch(/غير صحيح/i);
    });
  });

  test.describe("5. Security Headers Audit", () => {
    test("should return hardened security headers on all responses", async ({
      request,
    }) => {
      const res = await request.get("/");
      const headers = res.headers();

      expect(headers["x-frame-options"]).toBe("DENY");
      expect(headers["x-content-type-options"]).toBe("nosniff");
      expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
      expect(headers["content-security-policy"]).toBeDefined();
    });
  });
});
