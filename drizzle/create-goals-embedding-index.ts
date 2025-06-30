import { DrizzleClient } from "~/lib/drizzle-client";
import { container } from "~/lib/container";
import { sql } from "drizzle-orm";

const drizzle = container.get(DrizzleClient);

console.log("Creating vector index for goal embeddings...");

await drizzle.client.run(sql`
  CREATE INDEX IF NOT EXISTS goal_embeddings_idx ON goal_embeddings (libsql_vector_idx (embedding));
`);

console.log("✅ Vector index created successfully!");
