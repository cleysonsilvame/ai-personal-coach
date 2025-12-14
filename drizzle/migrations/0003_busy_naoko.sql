DROP INDEX "goals_chat_message_id_unique";--> statement-breakpoint
ALTER TABLE `goal_embeddings` ALTER COLUMN "embedding" TO "embedding" F32_BLOB(3072) NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX `goals_chat_message_id_unique` ON `goals` (`chat_message_id`);