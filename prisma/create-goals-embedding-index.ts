import { container } from "~/lib/container";
import { PrismaClient } from "~/lib/prisma-client";

const prisma = container.get(PrismaClient);

console.log("Creating vector index for goal embeddings...");

await prisma.client.$executeRaw`
      CREATE INDEX IF NOT EXISTS goal_embeddings_idx ON goal_embeddings (libsql_vector_idx (embedding));
    `;

console.log("✅ Vector index created successfully!");
await prisma.client.$disconnect();
