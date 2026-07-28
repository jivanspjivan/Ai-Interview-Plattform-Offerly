import { expect, test } from "@playwright/test";

test("homepage leads candidates into interview setup", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", {
      level: 1,
      name: /Great answers are built, not memorized/i,
    }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Start a practice session" }).click();

  await expect(page).toHaveURL(/\/interview\/new$/);
  await expect(
    page.getByRole("heading", {
      level: 1,
      name: "Make this session feel like the real one.",
    }),
  ).toBeVisible();
});

test("interview setup validates and carries the selected configuration", async ({
  page,
}) => {
  await page.goto("/interview/new");

  const role = page.getByLabel("Target role");
  await page.getByRole("button", { name: "Start interview" }).click();
  await expect(role).toBeFocused();
  await expect(role).toHaveJSProperty("validity.valid", false);

  await role.fill("Frontend");
  await page
    .getByRole("button", {
      name: "Frontend Developer Use this role",
      exact: true,
    })
    .click();
  await page.getByText("Technical", { exact: true }).click();
  await page.getByLabel("Experience level").selectOption("Senior");
  await page.getByText("30 min", { exact: true }).click();
  await page.getByRole("button", { name: "Start interview" }).click();

  await expect(page).toHaveURL(
    /\/interview\/session\?role=Frontend\+Developer&type=technical&experience=Senior&duration=30/,
  );
  await expect(page.getByText("Frontend Developer", { exact: true })).toBeVisible();
  await expect(page.getByText("Senior", { exact: true })).toBeVisible();
  await expect(page.getByText(/Question 1 of/)).toBeVisible();
});

test("plans page exposes all plan choices", async ({ page }) => {
  await page.goto("/plans");
  await expect(page.getByText("Basic", { exact: true })).toBeVisible();
  await expect(page.getByText("Premium", { exact: true })).toBeVisible();
  await expect(page.getByText("Premium Plus", { exact: true })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Choose Premium", exact: true }),
  ).toHaveAttribute("href", "/dashboard/billing?plan=premium");
});
