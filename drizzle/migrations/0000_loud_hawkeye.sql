CREATE TABLE `chat_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`content` text NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	`chat_id` text NOT NULL,
	`goal_id` text
);
--> statement-breakpoint
CREATE TABLE `chats` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `goal_embeddings` (
	`id` text PRIMARY KEY NOT NULL,
	`embedding` F32_BLOB(768) NOT NULL,
	`goal_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`goal_id`) REFERENCES `goals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `goals` (
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
	`chat_message_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `goals_chat_message_id_unique` ON `goals` (`chat_message_id`);