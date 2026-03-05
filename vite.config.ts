import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => ({
	plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
	resolve: {
		alias: {
			...(command === "serve"
				? {
						"@tabler/icons-react":
							"@tabler/icons-react/dist/esm/icons/index.mjs", // TODO: temp: https://github.com/tabler/tabler-icons/issues/1233#issuecomment-2428245119
					}
				: {}),
		},
	},
}));
