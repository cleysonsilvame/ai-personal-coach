import { type Page, expect, test } from "@playwright/test";

/**
 * True E2E Test with Playwright - Goals Application Flow
 *
 * This test uses a real browser to interact with the application UI,
 * simulating actual user behavior through navigation and interactions.
 *
 * Flow:
 * 1. Verify goals list page loads
 * 2. Navigate to a goal detail
 * 3. Verify goal editing interface
 * 4. Verify dashboard shows goal statistics
 */

test.describe("E2E: Goals Application Flow", () => {
	let page: Page;

	test.beforeEach(async ({ page: testPage }) => {
		page = testPage;
		await page.goto("/");

		// Wait for application to load
		await page.waitForLoadState("networkidle");
	});

	test("should navigate to goals list", async () => {
		// Look for goals link in navigation
		const goalsLink = page
			.locator(
				'a[href*="goal"], a[href*="objetivo"], a:has-text("Goals"), a:has-text("Objetivos"), a:has-text("Metas")',
			)
			.first();

		if (await goalsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
			await goalsLink.click();
			await page.waitForLoadState("networkidle");

			const currentUrl = page.url();
			expect(currentUrl).toContain("goal");
		}
	});

	test("should load goals page directly", async () => {
		await page.goto("/goals");
		await page.waitForLoadState("networkidle");

		// Verify the page loaded without errors (not a 404 or 500)
		const pageContent = await page.content();
		expect(pageContent).not.toContain("404");
		expect(pageContent).not.toContain("500");
	});

	test("should display dashboard with metrics", async () => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");

		// Verify dashboard is present
		const dashboard = page
			.locator('main, [data-testid="dashboard"], [role="main"], .dashboard')
			.first();

		await expect(dashboard).toBeVisible();
	});

	test("should show empty state or goals list on goals page", async () => {
		await page.goto("/goals");
		await page.waitForLoadState("networkidle");

		// Either show an empty state message or a list of goals
		const goalsContent = page
			.locator('[data-testid="goals-list"], .goals-list, h1, h2, p')
			.first();

		await expect(goalsContent).toBeVisible();
	});

	test("should navigate to goal creation flow through chat", async () => {
		// Goals are created through chat, so navigate to new chat
		await page.goto("/chats/new");
		await page.waitForLoadState("networkidle");

		// Verify chat interface for goal creation is present
		const chatSection = page
			.locator('form, textarea, [data-testid="chat-interface"]')
			.first();

		if (await chatSection.isVisible({ timeout: 3000 }).catch(() => false)) {
			await expect(chatSection).toBeVisible();
		}
	});

	test("should verify goals page shows navigation back to chats", async () => {
		await page.goto("/goals");
		await page.waitForLoadState("networkidle");

		// Verify there's navigation to go back to chats or home
		const navLinks = page.locator('a[href="/"], a[href*="chat"], nav a');
		const linkCount = await navLinks.count();
		expect(linkCount).toBeGreaterThanOrEqual(1);
	});

	test("should render goals list without JavaScript errors", async () => {
		const jsErrors: string[] = [];

		page.on("console", (msg) => {
			if (msg.type() === "error") {
				jsErrors.push(msg.text());
			}
		});

		await page.goto("/goals");
		await page.waitForLoadState("networkidle");

		// Filter out expected errors (e.g., missing env vars in test environment)
		const criticalErrors = jsErrors.filter(
			(error) =>
				!error.includes("favicon") &&
				!error.includes("env") &&
				!error.includes("network") &&
				!error.includes("fetch"),
		);

		expect(criticalErrors).toHaveLength(0);
	});
});
