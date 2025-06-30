PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_goal_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`embedding` F32_BLOB(768) NOT NULL,
	`goal_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_goal_embeddings`("id", "embedding", "goal_id", "created_at", "updated_at") SELECT "id", "embedding", "goal_id", "created_at", "updated_at" FROM `goal_embeddings`;--> statement-breakpoint
DROP TABLE `goal_embeddings`;--> statement-breakpoint
ALTER TABLE `__new_goal_embeddings` RENAME TO `goal_embeddings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;