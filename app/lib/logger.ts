import { createConsola } from "consola";
import { inject, injectable } from "inversify";
import { FeatureFlags } from "./feature-flags.server";

/**
 * Universal logger using Consola (Singleton)
 * Works in both server and client environments
 *
 * Log Level Configuration (priority order):
 * 1. Vercel Edge Config (real-time, no rebuild) - loaded automatically on first use
 * 2. LOG_LEVEL env variable (requires rebuild)
 * 3. Default based on NODE_ENV
 *
 * Consola levels:
 * - 0: Silent
 * - 1: Fatal
 * - 2: Error
 * - 3: Warn (default production)
 * - 4: Info (default development)
 * - 5: Debug/Verbose
 *
 * The logger automatically loads the level from Edge Config on first use (server-side).
 * Subsequent calls use the cached level for performance.
 */

@injectable("Singleton")
export class Logger {
  private consola: ReturnType<typeof createConsola>;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  constructor(
    @inject(FeatureFlags) private readonly featureFlags: FeatureFlags
  ) {
    // Initialize with env var or default
    this.consola = createConsola({
      level: this.getEnvLogLevel(),
      formatOptions: {
        colors: true,
        date: true,
      },
    });
  }

  /**
   * Get log level from environment or default
   */
  private getEnvLogLevel(): number {
    const envLevel = process.env.LOG_LEVEL;
    if (envLevel) {
      const level = Number.parseInt(envLevel, 10);
      if (!Number.isNaN(level) && level >= 0 && level <= 5) {
        return level;
      }
    }

    // Default to WARN (3) in production, INFO (4) otherwise
    const isProd = process.env.NODE_ENV === "production";
    return isProd ? 3 : 4;
  }

  /**
   * Initialize logger with Edge Config (lazy loading)
   * Only runs once on first log call (server-side)
   */
  private async initialize(): Promise<void> {
    // Skip if already initialized or if initializing
    if (this.initialized || this.initPromise) {
      return this.initPromise || Promise.resolve();
    }

    // Skip on client-side (Edge Config is server-only)
    if (typeof window !== "undefined") {
      this.initialized = true;
      return;
    }

		this.initPromise = (async () => {
			try {
				const { log_level: level } = await this.featureFlags.getFeatureFlags();
				this.consola.level = level;
				this.initialized = true;
			} catch (error) {
        // If feature flags fail, keep env var level
        this.consola.debug("Failed to load log level from feature flags:", error);
        this.initialized = true;
      }
    })();

    return this.initPromise;
  }

  /**
   * Log methods - automatically initialize on first use
   */

  fatal(...args: Parameters<typeof this.consola.fatal>): void {
    void this.initialize().then(() => this.consola.fatal(...args));
  }

  error(...args: Parameters<typeof this.consola.error>): void {
    void this.initialize().then(() => this.consola.error(...args));
  }

  warn(...args: Parameters<typeof this.consola.warn>): void {
    void this.initialize().then(() => this.consola.warn(...args));
  }

  info(...args: Parameters<typeof this.consola.info>): void {
    void this.initialize().then(() => this.consola.info(...args));
  }

  debug(...args: Parameters<typeof this.consola.debug>): void {
    void this.initialize().then(() => this.consola.debug(...args));
  }

  success(...args: Parameters<typeof this.consola.success>): void {
    void this.initialize().then(() => this.consola.success(...args));
  }

  /**
   * Update log level at runtime
   */
  setLevel(level: number): void {
    if (Number.isInteger(level) && level >= 0 && level <= 5) {
      this.consola.level = level;
    }
  }

  /**
   * Get current log level
   */
  get level(): number {
    return this.consola.level;
  }
}
