PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_goals` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`estimated_time` text NOT NULL,
	`action_steps` text NOT NULL,
	`progress_indicators` text NOT NULL,
	`suggested_habits` text NOT NULL,
	`motivation_strategies` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`chat_message_id` text,
	FOREIGN KEY (`chat_message_id`) REFERENCES `chat_messages`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
INSERT INTO `__new_goals`("id", "title", "description", "estimated_time", "action_steps", "progress_indicators", "suggested_habits", "motivation_strategies", "created_at", "updated_at", "chat_message_id") SELECT "id", "title", "description", "estimated_time", "action_steps", "progress_indicators", "suggested_habits", "motivation_strategies", "created_at", "updated_at", "chat_message_id" FROM `goals`;--> statement-breakpoint
DROP TABLE `goals`;--> statement-breakpoint
ALTER TABLE `__new_goals` RENAME TO `goals`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `goals_chat_message_id_unique` ON `goals` (`chat_message_id`);