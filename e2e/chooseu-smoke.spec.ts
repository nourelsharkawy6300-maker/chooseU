import { test, expect } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || "https://choose-u.vercel.app";

test.describe("ChooseU Production Smoke & Mobile Layout", () => {
  test("Homepage loads clean for guest without empty header stats", async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    // 1. Arabic RTL check
    const dir = await page.locator("html").getAttribute("dir");
    expect(dir).toBe("rtl");

    // 2. Pricing strip is visible
    await expect(page.getByText("150 ج.م")).toBeVisible();
    await expect(page.getByText("01066594552").first().first()).toBeVisible();

    // 3. Empty guest stats must NOT appear in header
    await expect(page.getByText("المجموع: غير محدد")).toHaveCount(0);
  });

  test("Mobile viewport (390x844) has no horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

    const overflow = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    expect(overflow).toBe(false);
  });

  test("/login page has correct canonical tag and login form", async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: "domcontentloaded" });

    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical).toBe("https://choose-u.vercel.app/login");

    await expect(page.locator("#email")).toBeVisible();
    await expect(page.locator("#password")).toBeVisible();
  });

  test("/api/ai/chat responds with 200 OK", async ({ request }) => {
    const res = await request.post(`${BASE_URL}/api/ai/chat`, {
      headers: {
        Origin: BASE_URL,
        "Content-Type": "application/json",
      },
      data: { message: "اختبار سريع من Playwright" },
    });

    expect(res.status()).toBe(200);
    const json = await res.json();
    expect(json.success).toBe(true);
  });
});