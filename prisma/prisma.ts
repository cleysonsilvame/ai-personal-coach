import "dotenv/config"; // TODO: move to lib/prisma/client.ts

import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "../app/generated/prisma";

declare global {
	var prismaClient: PrismaClient;
}

const adapter = new PrismaLibSQL({
	url: `${process.env.TURSO_DATABASE_URL}`,
	authToken: `${process.env.TURSO_AUTH_TOKEN}`,
});

globalThis.prismaClient ??= new PrismaClient({ adapter });

const prisma = globalThis.prismaClient;

export default prisma;
