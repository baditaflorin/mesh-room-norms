import { expect, test } from "@playwright/test";
import { openTwoPeers } from "@baditaflorin/mesh-common/testing";

test("an agreement reaches every person in the room", async ({ browser, baseURL }) => {
  const { a, b, cleanup } = await openTwoPeers(browser, baseURL ?? "", {
    storagePrefix: "mesh-room-norms",
  });
  try {
    const agreement = "Name the concern, not the person.";
    await a.getByRole("textbox", { name: "What would help this group?" }).fill(agreement);
    await a.getByRole("button", { name: "Share norm" }).click();
    await expect(
      b.getByLabel("Keep the agreements visible").getByText(agreement, { exact: true }),
    ).toBeVisible({ timeout: 10_000 });
  } finally {
    await cleanup();
  }
});

test("mobile entry keeps the live agreement board and action visible", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("./", { waitUntil: "domcontentloaded" });

  await expect(page.locator(".norms-launch")).toBeVisible();
  await expect(page.locator(".agreement-preview")).toBeVisible();
  await expect(
    page.getByRole("group", { name: "Launch actions" }).getByRole("button").first(),
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
});

test("short desktop keeps the first agreement action above the fold", async ({ page }) => {
  await page.setViewportSize({ width: 1141, height: 602 });
  await page.goto("./", { waitUntil: "domcontentloaded" });

  const primaryAction = page
    .getByRole("group", { name: "Launch actions" })
    .getByRole("button")
    .first();
  await expect(primaryAction).toBeVisible();
  const box = await primaryAction.boundingBox();
  expect(box).not.toBeNull();
  expect((box?.y ?? Number.POSITIVE_INFINITY) + (box?.height ?? 0)).toBeLessThanOrEqual(602);
});
