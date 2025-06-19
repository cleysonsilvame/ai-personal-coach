import { PrismaClient as PrismaClientType } from "generated/prisma";
import { inject, injectable } from "inversify";
import { adapter } from "prisma.config";
import { Config } from "./config";

declare global {
	var prismaClient: PrismaClientType;
}

@injectable("Singleton")
export class PrismaClient {
	client: PrismaClientType;

	constructor(@inject(Config) private readonly config: Config) {
		globalThis.prismaClient ??= new PrismaClientType({
			adapter,
			log: this.config.env.PRISMA_LOG_LEVEL,
		});

		this.client = globalThis.prismaClient;
	}
}
