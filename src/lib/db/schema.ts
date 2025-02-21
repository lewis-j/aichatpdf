import {
  pgTable,
  timestamp,
  varchar,
  serial,
  text,
  integer,
  pgEnum,
} from "drizzle-orm/pg-core";
export const userSystemEnum = pgEnum("user_system_enum", ["system", "user"]);

export const chats = pgTable("chats", {
  id: serial("id").primaryKey(),
  fileName: text("pdf_name").notNull(),
  fileUrl: text("pdf_url").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  fileKey: text("file_key").notNull(),
});

export type DrizzleChat = typeof chats.$inferSelect;

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  chatId: integer("chat_id").references(() => chats.id),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  role: userSystemEnum("role").notNull(),
});
