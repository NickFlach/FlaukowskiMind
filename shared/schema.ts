import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  resonancePoints: integer("resonance_points").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const streams = pgTable("streams", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").references(() => users.id),
  content: text("content").notNull(),
  type: text("type").notNull(), // thought, dream, code, question, prediction
  tags: text("tags").array(),
  resonanceCount: integer("resonance_count").default(0).notNull(),
  isCoreMind: boolean("is_core_mind").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kernels = pgTable("kernels", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull(), // dream, code, audio
  symbolicData: jsonb("symbolic_data").notNull(),
  resonanceCount: integer("resonance_count").default(0).notNull(),
  isCoreMind: boolean("is_core_mind").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resonances = pgTable("resonances", {
  id: serial("id").primaryKey(), 
  userId: integer("user_id").references(() => users.id),
  streamId: integer("stream_id").references(() => streams.id),
  kernelId: integer("kernel_id").references(() => kernels.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const echoes = pgTable("echoes", {
  id: serial("id").primaryKey(), 
  content: text("content").notNull(),
  type: text("type").notNull(), // insight, riddle, coordinate, task
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const synapticConnections = pgTable("synaptic_connections", {
  id: serial("id").primaryKey(),
  sourceId: integer("source_id").notNull(),
  sourceType: text("source_type").notNull(), // stream, kernel, echo
  targetId: integer("target_id").notNull(),
  targetType: text("target_type").notNull(), // stream, kernel, echo
  connectionStrength: integer("connection_strength").default(1).notNull(),
  symbolicRelation: text("symbolic_relation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStreamSchema = createInsertSchema(streams).pick({
  userId: true,
  content: true,
  type: true,
  tags: true,
});

export const insertKernelSchema = createInsertSchema(kernels).pick({
  userId: true,
  title: true,
  content: true,
  type: true,
  symbolicData: true,
});

export const insertResonanceSchema = createInsertSchema(resonances).pick({
  userId: true,
  streamId: true,
  kernelId: true,
});

export const insertEchoSchema = createInsertSchema(echoes).pick({
  content: true,
  type: true,
});

export const insertSynapticConnectionSchema = createInsertSchema(synapticConnections).pick({
  sourceId: true,
  sourceType: true,
  targetId: true,
  targetType: true,
  connectionStrength: true,
  symbolicRelation: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Stream = typeof streams.$inferSelect;
export type InsertStream = z.infer<typeof insertStreamSchema>;

export type Kernel = typeof kernels.$inferSelect;
export type InsertKernel = z.infer<typeof insertKernelSchema>;

export type Resonance = typeof resonances.$inferSelect;
export type InsertResonance = z.infer<typeof insertResonanceSchema>;

export type Echo = typeof echoes.$inferSelect;
export type InsertEcho = z.infer<typeof insertEchoSchema>;

export type SynapticConnection = typeof synapticConnections.$inferSelect;
export type InsertSynapticConnection = z.infer<typeof insertSynapticConnectionSchema>;
