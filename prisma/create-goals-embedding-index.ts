import { prisma } from "~/lib/prisma-client";

console.log("Creating vector index for goal embeddings...");

await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS goal_embeddings_idx ON goal_embeddings (libsql_vector_idx (embedding));
    `;

console.log("✅ Vector index created successfully!");
await prisma.$disconnect();
