const { test, expect } = require("@playwright/test");
const fs = require("fs");

async function freshWithFixtures(page) {
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  const fixtures = page.locator("#loadFixturesBtn");
  await expect(fixtures).toBeEnabled();
  await fixtures.click();
  await expect(page.locator(".candidate-card")).toHaveCount(4);
}

test("real offers -> price lineage -> decisions", async ({ page }) => {
  await freshWithFixtures(page);

  await expect(page.locator("#portfolioStats")).toContainText("4 всего");

  await page.getByRole("button", { name: "HOLD", exact: true }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(2);

  await page.getByRole("button", { name: "Отсев", exact: true }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(2);

  await page.getByRole("button", { name: "Сильные", exact: true }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(1);
  await expect(page.locator(".candidate-card")).toContainText("De Alm Kruiser");

  await page.getByRole("button", { name: "Все", exact: true }).click();
  await expect(page.locator(".candidate-card")).toHaveCount(4);

  await page.getByRole("button", { name: /De Alm Kruiser/ }).click();
  await expect(page.locator("#verdict")).toContainText("ПАУЗА");
  await expect(page.locator("#candidateSnapshot")).toContainText("Комфортно");
  await expect(page.locator("#candidateSnapshot")).toContainText("?");
  await expect(page.locator("#currentOfferSummary")).toContainText("5,750");
  await expect(page.locator("#currentOfferSummary")).toContainText("7.002");
  await expect(page.locator("#openListingBtn")).toHaveAttribute("href", /boatauction\.com/);
  await expect(page.locator("#offerHistory .offer-history-row")).toHaveCount(1);

  await page.getByRole("button", { name: /ANKA/ }).click();
  await expect(page.locator("#candidateSnapshot")).toContainText("?");
  await expect(page.locator("#currentOfferSummary")).toContainText("46,500");
  await expect(page.locator("#currentOfferSummary")).toContainText("10.814");
  await expect(page.locator("#offerHistory .offer-history-row")).toHaveCount(3);
  await expect(page.locator("#offerHistory")).toContainText("63,500");
  await expect(page.locator("#offerHistory")).toContainText("65,000");

  await page.getByRole("button", { name: "Месяц", exact: true }).click();
  await expect(page.locator("#marinaPreset")).toBeEnabled();
  expect(await page.locator("#marinaPreset option").count()).toBeGreaterThan(0);

  await page.getByRole("button", { name: /De Alm Kruiser/ }).click();
  await page.getByRole("button", { name: "Предложение", exact: true }).click();
  await page.locator('[data-field="legalGate"]').selectOption("FAIL");
  await expect(page.locator("#verdict")).toContainText("ОТМЕСТИ");
  await page.locator('[data-field="legalGate"]').selectOption("UNKNOWN");
  await expect(page.locator("#verdict")).toContainText("ПАУЗА");

  await expect(page.locator("#metrics")).toContainText("Cost-to-Habitable");
  await expect(page.locator("#metrics")).toContainText("Cash Required");
  await expect(page.locator("#metrics")).toContainText("Emergency Reserve");

  await page.getByRole("button", { name: "После заселения", exact: true }).click();
  await page.locator("#addImprovementBtn").click();
  await expect(page.locator(".improvement-row")).toHaveCount(1);
  await page.locator('.improvement-row [data-imp="cashEUR"]').fill("500");
  await page.locator('.improvement-row [data-imp="diyHours"]').fill("10");
  await page.locator('.improvement-row [data-imp="upliftEUR"]').fill("2000");
  await expect(page.locator("#improvementTotals")).toContainText("2.000");

  const downloadPromise = page.waitForEvent("download");
  await page.locator("#exportBtn").click();
  const download = await downloadPromise;
  const exportPath = await download.path();
  expect(exportPath).toBeTruthy();
  await page.locator("#importInput").setInputFiles(exportPath);
  await expect(page.locator(".candidate-card")).toHaveCount(4);
});

test("desktop tablet mobile screenshots have no page overflow", async ({ page }) => {
  fs.mkdirSync("test-results/screenshots", { recursive: true });
  await freshWithFixtures(page);

  const views = [
    ["desktop", 1440, 1000],
    ["tablet", 900, 1100],
    ["mobile", 390, 844]
  ];

  for (const [name, width, height] of views) {
    await page.setViewportSize({ width, height });
    await page.waitForTimeout(100);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
    expect(overflow, name + " should not have page-level horizontal overflow").toBeFalsy();
    await page.screenshot({ path: "test-results/screenshots/" + name + ".png", fullPage: true });
  }
});
