import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastSeen: timestamp("last_seen").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Message schema - now with userId
export const messages = pgTable("messages", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to users
  role: text("role").notNull(), // "user" or "assistant"
  content: text("content").notNull(),
  timestamp: timestamp("timestamp").notNull(),
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
});

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

// User profile schema for storing preferences - now with userId
export const userProfile = pgTable("user_profile", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(), // Foreign key to users
  interests: text("interests").array(),
  communicationStyle: text("communication_style"),
  preferences: jsonb("preferences"),
});

export const insertUserProfileSchema = createInsertSchema(userProfile).omit({
  id: true,
});

export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type UserProfile = typeof userProfile.$inferSelect;
