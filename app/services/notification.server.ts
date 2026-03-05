import { inject, injectable } from "inversify";
import { Config } from "~/lib/config";
import { Logger } from "~/lib/logger";

export interface NotificationPayload {
	type: "model_error" | "model_unavailable" | "all_models_failed";
	modelId?: string;
	error?: string;
	timestamp: string;
	context?: Record<string, unknown>;
}

/**
 * Service for sending notifications about system errors
 * Supports multiple notification channels: logs, webhooks, etc.
 */
@injectable("Singleton")
export class NotificationService {
	constructor(
		@inject(Config) private readonly config: Config,
		@inject(Logger) private readonly logger: Logger,
	) {}

	/**
	 * Send a notification about a model error
	 * Logs to console (captured by Vercel) and optionally sends to webhook
	 */
	async notifyModelError(payload: NotificationPayload): Promise<void> {
		await this.sendToWebhook(payload);
	}
	/**
	 * Send notification to webhook (Discord, Slack, or custom endpoint)
	 */
	private async sendToWebhook(payload: NotificationPayload): Promise<void> {
		if (!this.config.env.ERROR_NOTIFICATION_WEBHOOK_URL) {
			return;
		}

		try {
			const message = this.formatWebhookMessage(payload);

			await fetch(this.config.env.ERROR_NOTIFICATION_WEBHOOK_URL, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(message),
			});
		} catch (error) {
			// Don't throw - notification failure shouldn't break the app
			this.logger.error("Failed to send webhook notification:", error);
		}
	}

	/**
	 * Format message for webhook based on type
	 * Supports Discord webhook format by default
	 */
	private formatWebhookMessage(payload: NotificationPayload): unknown {
		const emoji = this.getEmojiForType(payload.type);
		const title = this.getTitleForType(payload.type);

		// Discord webhook format (works for many webhook services)
		return {
			embeds: [
				{
					title: `${emoji} ${title}`,
					description: payload.error || "No error message provided",
					color: 15548997, // Red color
					fields: [
						...(payload.modelId
							? [{ name: "Model ID", value: payload.modelId, inline: true }]
							: []),
						{ name: "Type", value: payload.type, inline: true },
						{ name: "Timestamp", value: payload.timestamp, inline: true },
					],
					timestamp: payload.timestamp,
				},
			],
		};
	}

	private getEmojiForType(type: NotificationPayload["type"]): string {
		switch (type) {
			case "model_error":
				return "⚠️";
			case "model_unavailable":
				return "🔴";
			case "all_models_failed":
				return "🚨";
			default:
				return "❌";
		}
	}

	private getTitleForType(type: NotificationPayload["type"]): string {
		switch (type) {
			case "model_error":
				return "Model Error";
			case "model_unavailable":
				return "Model Unavailable";
			case "all_models_failed":
				return "All Models Failed - Using Fallback";
			default:
				return "Error";
		}
	}
}
