import "dotenv/config";

import path from "node:path";
import type { PrismaConfig } from "prisma/config";

import { PrismaLibSQL } from "@prisma/adapter-libsql";

export const adapter = new PrismaLibSQL({
	url: `${process.env.TURSO_DATABASE_URL}`,
	authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});

export default {
	earlyAccess: true,
	schema: path.join("prisma", "schema.prisma"),

	migrate: {
		async adapter() {
			return adapter;
		},
	},
} satisfies PrismaConfig;
