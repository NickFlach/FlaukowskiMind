import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, bigint } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

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
  sourceType: text("source_type").notNull(), // stream, kernel, echo, lifeform
  targetId: integer("target_id").notNull(),
  targetType: text("target_type").notNull(), // stream, kernel, echo, lifeform
  connectionStrength: integer("connection_strength").default(1).notNull(),
  symbolicRelation: text("symbolic_relation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const lifeforms = pgTable("lifeforms", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // cellular, chemical, digital, quantum
  dna: text("dna").notNull(), // genetic code or rules that define this life form
  state: jsonb("state").notNull(), // current state data of the simulation
  generation: integer("generation").default(0).notNull(),
  resonanceCount: integer("resonance_count").default(0).notNull(),
  isCoreMind: boolean("is_core_mind").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const lifeformEvolutions = pgTable("lifeform_evolutions", {
  id: serial("id").primaryKey(),
  lifeformId: integer("lifeform_id").references(() => lifeforms.id),
  previousState: jsonb("previous_state").notNull(),
  newState: jsonb("new_state").notNull(),
  evolutionType: text("evolution_type").notNull(), // mutation, adaptation, emergence, expansion
  generation: integer("generation").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const fileUploads = pgTable("file_uploads", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  fileSize: bigint("file_size", { mode: "number" }).notNull(),
  fileType: text("file_type").notNull(), // MIME type
  filePath: text("file_path").notNull(),
  status: text("status").notNull().default("processing"), // processing, processed, error
  processingResult: jsonb("processing_result"),
  analysisData: jsonb("analysis_data"),
  kernelId: integer("kernel_id").references(() => kernels.id),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  processingStartedAt: timestamp("processing_started_at"),
  processingCompletedAt: timestamp("processing_completed_at"),
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

export const insertLifeformSchema = createInsertSchema(lifeforms).pick({
  userId: true,
  name: true,
  type: true,
  dna: true,
  state: true,
});

export const insertLifeformEvolutionSchema = createInsertSchema(lifeformEvolutions).pick({
  lifeformId: true,
  previousState: true,
  newState: true,
  evolutionType: true,
  generation: true,
});

export const insertFileUploadSchema = createInsertSchema(fileUploads).pick({
  userId: true,
  fileName: true,
  originalName: true,
  fileSize: true,
  fileType: true,
  filePath: true,
  status: true,
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

export type Lifeform = typeof lifeforms.$inferSelect;
export type InsertLifeform = z.infer<typeof insertLifeformSchema>;

export type LifeformEvolution = typeof lifeformEvolutions.$inferSelect;
export type InsertLifeformEvolution = z.infer<typeof insertLifeformEvolutionSchema>;

export type FileUpload = typeof fileUploads.$inferSelect;
export type InsertFileUpload = z.infer<typeof insertFileUploadSchema>;

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  streams: many(streams),
  kernels: many(kernels),
  resonances: many(resonances),
  lifeforms: many(lifeforms),
  fileUploads: many(fileUploads),
}));

export const lifeformsRelations = relations(lifeforms, ({ one, many }) => ({
  user: one(users, {
    fields: [lifeforms.userId],
    references: [users.id],
  }),
  evolutions: many(lifeformEvolutions),
}));

export const lifeformEvolutionsRelations = relations(lifeformEvolutions, ({ one }) => ({
  lifeform: one(lifeforms, {
    fields: [lifeformEvolutions.lifeformId],
    references: [lifeforms.id],
  }),
}));

export const fileUploadsRelations = relations(fileUploads, ({ one }) => ({
  user: one(users, {
    fields: [fileUploads.userId],
    references: [users.id],
  }),
  kernel: one(kernels, {
    fields: [fileUploads.kernelId],
    references: [kernels.id],
  }),
}));

export const kernelsRelations = relations(kernels, ({ one, many }) => ({
  user: one(users, {
    fields: [kernels.userId],
    references: [users.id],
  }),
  fileUploads: many(fileUploads),
}));
