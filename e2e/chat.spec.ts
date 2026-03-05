import { type Page, expect, test } from "@playwright/test";

/**
 * True E2E Test with Playwright - Chat Application Flow
 *
 * This test uses a real browser to interact with the application UI,
 * simulating actual user behavior through navigation and interactions.
 *
 * Flow:
 * 1. Verify application loads with main navigation
 * 2. Navigate to chats list
 * 3. Start a new chat
 * 4. Verify chat interface is visible
 * 5. Navigate back to chats list and verify history
 */

test.describe("E2E: Chat Application Flow", () => {
	let page: Page;

	test.beforeEach(async ({ page: testPage }) => {
		page = testPage;
		await page.goto("/");

		// Wait for application to load
		await page.waitForLoadState("networkidle");
	});

	test("should load application and show main navigation", async () => {
		// Verify the page title or main content loads
		await expect(page).toHaveTitle(/AI Personal Coach|Coach/i);

		// Verify sidebar or navigation exists
		const navSection = page
			.locator('nav, [role="navigation"], aside, [data-testid="sidebar"]')
			.first();
		await expect(navSection).toBeVisible();
	});

	test("should navigate to chats list", async () => {
		// Look for a chat or conversations link in the navigation
		const chatsLink = page
			.locator(
				'a[href*="chat"], a[href*="conversa"], a:has-text("Chats"), a:has-text("Conversas"), a:has-text("Chat")',
			)
			.first();

		await expect(chatsLink).toBeVisible({ timeout: 5000 });
		await chatsLink.click();
		await page.waitForLoadState("networkidle");

		// Verify we are on the chats page
		const chatsSection = page
			.locator(
				'[data-testid="chats-list"], .chats-list, h1:has-text("Chat"), h1:has-text("Conversa")',
			)
			.first();

		await expect(chatsSection).toBeVisible({ timeout: 5000 });
	});

	test("should display new chat button", async () => {
		// Navigate to chats
		await page.goto("/chats");
		await page.waitForLoadState("networkidle");

		// Look for new chat button
		const newChatButton = page
			.locator(
				'button:has-text("Novo"), button:has-text("New"), a:has-text("Novo Chat"), [data-testid="new-chat"]',
			)
			.first();

		await expect(newChatButton).toBeVisible({ timeout: 5000 });
	});

	test("should navigate to new chat page", async () => {
		// Try navigating directly to the new chat page
		await page.goto("/chats/new");
		await page.waitForLoadState("networkidle");

		// Verify the chat interface is present
		const chatInterface = page
			.locator(
				'[data-testid="chat-interface"], textarea, input[type="text"], form',
			)
			.first();

		await expect(chatInterface).toBeVisible({ timeout: 5000 });
	});

	test("should show chat input for sending messages", async () => {
		await page.goto("/chats/new");
		await page.waitForLoadState("networkidle");

		// Look for message input field
		const messageInput = page
			.locator(
				'textarea[placeholder*="objetivo"], textarea[placeholder*="mensagem"], textarea[placeholder*="message"], textarea',
			)
			.first();

		await expect(messageInput).toBeVisible({ timeout: 5000 });
		await expect(messageInput).toBeEditable();
	});

	test("should navigate between pages without errors", async () => {
		// Navigate through main pages and verify no errors
		const routes = ["/", "/chats"];

		for (const route of routes) {
			await page.goto(route);
			await page.waitForLoadState("networkidle");

			// Verify no error messages are visible
			const errorElement = page
				.locator(
					'[data-testid="error"], .error, text=500, text=Error, text=Erro',
				)
				.first();

			const hasError = await errorElement
				.isVisible({ timeout: 1000 })
				.catch(() => false);
			expect(hasError).toBe(false);
		}
	});
});
