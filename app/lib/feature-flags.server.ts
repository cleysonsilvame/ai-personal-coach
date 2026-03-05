import { createClient } from "@vercel/edge-config";
import { inject, injectable } from "inversify";
import { Config, type Flags, flagsSchema } from "./config";

/**
 * Feature Flags using Vercel Edge Config
 *
 * Advantages over environment variables:
 * - ✅ Change in real-time without rebuild/redeploy
 * - ✅ Free tier included in Vercel
 * - ✅ Can be updated via Vercel Dashboard or API
 * - ✅ Edge runtime compatible (global distribution)
 *
 * Setup:
 * 1. Create Edge Config in Vercel Dashboard: https://vercel.com/dashboard/stores
 * 2. Add EDGE_CONFIG env variable (automatically set by Vercel)
 * 3. Add keys in Edge Config dashboard:
 *    - log_level: number (0-5)
 *    - chat_use_dynamic_model_selection: boolean
 *    - copilot_use_dynamic_model_selection: boolean
 */

@injectable("Singleton")
export class FeatureFlags {
	private client: ReturnType<typeof createClient> | null = null;

	constructor(@inject(Config) private readonly config: Config) {
		if (this.config.env.EDGE_CONFIG) {
			this.client = createClient(this.config.env.EDGE_CONFIG);
		}
	}
	/**
	 * Get all feature flags from Edge Config
	 */
	async getFeatureFlags(): Promise<Flags> {
		if (!this.client) {
			if (!this.config.env.EDGE_CONFIG) {
				throw new Error("EDGE_CONFIG is not configured");
			}
			this.client = createClient(this.config.env.EDGE_CONFIG);
		}

		try {
			const flags = flagsSchema.parse(await this.client.get<Flags>("flags"));

			if (this.config.env.LOCAL_FEATURE_FLAGS) {
				Object.assign(flags, this.config.env.LOCAL_FEATURE_FLAGS);
			}

			return flags;
		} catch (error) {
			console.error("Failed to fetch feature flags:", error);
			throw error;
		}
	}
}
