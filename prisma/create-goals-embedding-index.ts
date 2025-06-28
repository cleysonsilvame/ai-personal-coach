import { container } from "~/lib/container";
import { PrismaClient } from "~/lib/prisma-client";

const prisma = container.get(PrismaClient);

console.log("Creating vector index for goal embeddings...");

await prisma.client.$executeRaw`
      CREATE TABLE IF NOT EXISTS goal_embeddings (
        id TEXT PRIMARY KEY NOT NULL,
        embedding F32_BLOB(768) NOT NULL,
        goal_id TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
        FOREIGN KEY (goal_id) REFERENCES goals(id)
      );
    `;

await prisma.client.$executeRaw`
      CREATE INDEX IF NOT EXISTS goal_embeddings_idx ON goal_embeddings (libsql_vector_idx (embedding));
    `;

console.log("✅ Vector index created successfully!");
await prisma.client.$disconnect();
