CREATE TABLE `goal_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`embedding` F32_BLOB(768) NOT NULL,
	`goal_id` text NOT NULL,
	`created_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`updated_at` integer DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
