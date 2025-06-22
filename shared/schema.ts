import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const downloads = pgTable("downloads", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title").notNull(),
  author: text("author"),
  duration: text("duration"),
  thumbnail: text("thumbnail"),
  quality: text("quality").notNull(),
  format: text("format").notNull(),
  fileSize: text("file_size"),
  status: text("status").notNull().default("pending"), // pending, downloading, completed, failed
  progress: integer("progress").default(0),
  downloadSpeed: text("download_speed"),
  timeRemaining: text("time_remaining"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertDownloadSchema = createInsertSchema(downloads).omit({
  id: true,
  createdAt: true,
});

export const videoInfoSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertDownload = z.infer<typeof insertDownloadSchema>;
export type Download = typeof downloads.$inferSelect;
export type VideoInfo = z.infer<typeof videoInfoSchema>;
