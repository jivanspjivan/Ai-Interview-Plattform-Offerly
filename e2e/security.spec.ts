import { expect, test } from "@playwright/test";

test("protected dashboard routes redirect guests to login", async ({ page }) => {
  await page.goto("/dashboard/admin");
  await expect(page).toHaveURL(/\/login\?error=configuration$/);
  await expect(
    page.getByText(/Account access is not configured yet/i),
  ).toBeVisible();
});

test("responses include browser security headers", async ({ request }) => {
  const response = await request.get("/");
  expect(response.status()).toBe(200);
  expect(response.headers()["x-content-type-options"]).toBe("nosniff");
  expect(response.headers()["x-frame-options"]).toBe("DENY");
  expect(response.headers()["referrer-policy"]).toBe(
    "strict-origin-when-cross-origin",
  );
  expect(response.headers()["content-security-policy"]).toContain(
    "frame-ancestors 'none'",
  );
  expect(response.headers()["permissions-policy"]).toContain(
    "microphone=(self)",
  );
  const apiResponse = await request.get("/api/sessions");
  expect(apiResponse.headers()["x-trace-id"]).toMatch(
    /^[a-zA-Z0-9_-]{8,80}$/,
  );
});

test("legal and support pages are publicly available", async ({ page }) => {
  for (const path of ["/privacy", "/terms", "/refund-policy", "/support"]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  }
});

test("invalid interview session links return to setup", async ({ page }) => {
  await page.goto("/interview/session?role=&type=invalid&duration=99");
  await expect(page).toHaveURL(/\/interview\/new$/);
});
