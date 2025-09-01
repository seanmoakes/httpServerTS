import { pgTable, timestamp, varchar, uuid, text, boolean } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  email: varchar("email", { length: 256 }).unique().notNull(),
  hashedPassword: varchar().default("unset").notNull(),
  isChirpyRed: boolean("is_chirpy_red").default(false),
});

export type NewUser = typeof users.$inferInsert;
export type User = Omit<typeof users.$inferSelect, "hashedPassword">;


export const chirps = pgTable("chirps", {
  id: uuid("id").primaryKey().defaultRandom(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().$onUpdate(() => new Date()),
  body: text().notNull(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" })
});

export type NewChirp = typeof chirps.$inferInsert;
export type Chirp = typeof chirps.$inferSelect;

export const refreshTokens = pgTable("refresh_tokens", {
  token: varchar({ length: 256 }).primaryKey(),
  createdAt: timestamp("created_at")
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
  userId: uuid("user_id")
    .notNull()
    .references(() =>
      users.id,
      { onDelete: "cascade" }
    ),
  expiresAt: timestamp("expires_at")
    .notNull(),
  revokedAt: timestamp("revoked_at"),
});

export type NewRefreshToken = typeof refreshTokens.$inferInsert;
export type RefreshToken = typeof refreshTokens.$inferSelect;
