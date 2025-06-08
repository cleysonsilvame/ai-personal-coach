import { adapter } from "prisma.config";
import { PrismaClient } from "../generated/prisma";

declare global {
	var prismaClient: PrismaClient;
}

globalThis.prismaClient ??= new PrismaClient({ adapter });

export const prisma = globalThis.prismaClient;
