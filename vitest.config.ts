import tsconfigPaths from "vite-tsconfig-paths";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [tsconfigPaths()],
	test: {
		globals: true,
		environment: "node",
		setupFiles: ["./test/setup.ts"],
		include: ["app/**/*.spec.ts"],
		exclude: ["node_modules", "build", "e2e"],
		coverage: {
			provider: "v8",
			reporter: ["text", "json", "html"],
			include: ["app/features/**/*.ts"],
			exclude: [
				"app/features/**/*.spec.ts",
				"app/features/**/*.tsx",
				"app/features/**/types.ts",
			],
		},
	},
});
