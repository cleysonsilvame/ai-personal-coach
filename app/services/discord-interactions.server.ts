import { createPublicKey, verify } from "node:crypto";
import { inject, injectable } from "inversify";
import { Config } from "~/lib/config";
import { Logger } from "~/lib/logger";

const DISCORD_ED25519_PUBLIC_KEY_DER_PREFIX = "302a300506032b6570032100";
const MAX_TIMESTAMP_SKEW_SECONDS = 60 * 5;

@injectable("Singleton")
export class DiscordInteractionsService {
	constructor(
		@inject(Config) private readonly config: Config,
		@inject(Logger) private readonly logger: Logger,
	) {}

	verifyRequestSignature(
		rawBody: string,
		signatureHex: string | null,
		timestamp: string | null,
	): boolean {
		if (!this.config.env.DISCORD_PUBLIC_KEY || !signatureHex || !timestamp) {
			return false;
		}

		const timestampSeconds = Number(timestamp);
		if (!Number.isFinite(timestampSeconds)) {
			return false;
		}

		const currentTimestampSeconds = Math.floor(Date.now() / 1000);
		if (
			Math.abs(currentTimestampSeconds - timestampSeconds) >
			MAX_TIMESTAMP_SKEW_SECONDS
		) {
			return false;
		}

		try {
			const message = Buffer.from(`${timestamp}${rawBody}`);
			const signature = Buffer.from(signatureHex, "hex");
			const publicKey = createPublicKey({
				key: Buffer.from(
					`${DISCORD_ED25519_PUBLIC_KEY_DER_PREFIX}${this.config.env.DISCORD_PUBLIC_KEY}`,
					"hex",
				),
				format: "der",
				type: "spki",
			});

			return verify(null, message, publicKey, signature);
		} catch (error) {
			this.logger.warn("Invalid Discord interaction signature", error);
			return false;
		}
	}
}
