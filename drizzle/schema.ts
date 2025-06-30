import { sql } from "drizzle-orm";
import {
	text,
	sqliteTable,
	integer,
	customType,
} from "drizzle-orm/sqlite-core";
import { randomUUID } from "node:crypto";

export const chatMessageRoleEnum = text({
	enum: ["user", "assistant", "system"],
});

export const chats = sqliteTable("chats", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => randomUUID()),
	title: text("title").notNull(),
	created_at: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});

export const chatMessages = sqliteTable("chat_messages", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => randomUUID()),
	content: text({ mode: "json" }).notNull().$type<{
		message: string;
		short_title?: string;
		data?: {
			title: string;
			description: string;
			estimated_time: string;
			action_steps: string[];
			progress_indicators: string[];
			suggested_habits: string[];
			motivation_strategies: string;
		};
	}>(),
	role: chatMessageRoleEnum.notNull().default("user"),
	created_at: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	chat_id: text("chat_id").notNull(),
	goal_id: text("goal_id"),
});

export const goals = sqliteTable("goals", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => randomUUID()),
	title: text("title").notNull(),
	description: text("description").notNull(),
	estimated_time: text("estimated_time").notNull(),
	action_steps: text({ mode: "json" }).notNull().$type<string[]>(),
	progress_indicators: text({ mode: "json" }).notNull().$type<string[]>(),
	suggested_habits: text({ mode: "json" }).notNull().$type<string[]>(),
	motivation_strategies: text("motivation_strategies").notNull(),
	created_at: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	chat_message_id: text("chat_message_id").unique(),
});

const float32Array = customType<{
	data: number[];
	config: { dimensions: number };
	configRequired: true;
	driverData: Buffer;
}>({
	dataType(config) {
		return `F32_BLOB(${config.dimensions})`;
	},
	fromDriver(value: Buffer) {
		return Array.from(new Float32Array(value.buffer));
	},
	toDriver(value: number[]) {
		return sql`vector32(${JSON.stringify(value)})`;
	},
});

export const goalEmbeddings = sqliteTable("goal_embeddings", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$defaultFn(() => randomUUID()),
	embedding: float32Array("embedding", { dimensions: 768 }).notNull(),
	goal_id: text("goal_id")
		.notNull()
		.references(() => goals.id),
	created_at: integer("created_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
	updated_at: integer("updated_at", { mode: "timestamp" })
		.notNull()
		.default(sql`(CURRENT_TIMESTAMP)`),
});
