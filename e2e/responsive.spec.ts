import { expect, test } from "@playwright/test";

test("homepage and interview setup fit a mobile viewport", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const homeOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(homeOverflow).toBe(false);

  await page.goto("/interview/new");
  await expect(page.getByLabel("Target role")).toBeVisible();
  const setupOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  );
  expect(setupOverflow).toBe(false);
});
