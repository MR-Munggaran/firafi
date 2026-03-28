import {
  pgTable,
  serial,
  text,
  integer,
  numeric,
  timestamp,
  pgEnum,
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { relations, sql } from "drizzle-orm";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const transactionTypeEnum = pgEnum("transaction_type", ["income", "expense"]);
export const coupleRoleEnum      = pgEnum("couple_role", ["owner", "partner"]);
export const coupleStatusEnum    = pgEnum("couple_status", ["active", "inactive"]);
export const walletTypeEnum      = pgEnum("wallet_type", ["cash", "bank", "ewallet", "investment", "other"]);
export const goalStatusEnum      = pgEnum("goal_status", ["ongoing", "completed", "paused"]);

// ─── Users ────────────────────────────────────────────────────────────────────

export const users = pgTable("users", {
  id:        uuid("id").primaryKey(),
  name:      text("name").notNull(),
  email:     text("email").notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Couples ──────────────────────────────────────────────────────────────────

export const couples = pgTable("couples", {
  id:         serial("id").primaryKey(),
  name:       text("name").notNull(),
  inviteCode: text("invite_code").notNull().unique(),
  status:     coupleStatusEnum("status").default("active").notNull(),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const coupleMembers = pgTable(
  "couple_members",
  {
    id:       serial("id").primaryKey(),
    coupleId: integer("couple_id").notNull().references(() => couples.id, { onDelete: "cascade" }),
    userId:   uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role:     coupleRoleEnum("role").notNull(),
    joinedAt: timestamp("joined_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueMember: uniqueIndex("unique_couple_member").on(t.coupleId, t.userId),
  })
);

// ─── Wallets ──────────────────────────────────────────────────────────────────

export const wallets = pgTable("wallets", {
  id:        serial("id").primaryKey(),
  coupleId:  integer("couple_id").references(() => couples.id, { onDelete: "cascade" }), // nullable: support solo
  ownerId:   uuid("owner_id").references(() => users.id),
  name:      text("name").notNull(),
  type:      walletTypeEnum("type").default("cash").notNull(),
  balance:   numeric("balance", { precision: 15, scale: 2 }).default("0").notNull(),
  color:     text("color").default("#f43f5e"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Transactions ─────────────────────────────────────────────────────────────

export const transactions = pgTable("transactions", {
  id:         serial("id").primaryKey(),
  coupleId:   integer("couple_id").references(() => couples.id, { onDelete: "cascade" }), // nullable: support solo
  walletId:   integer("wallet_id").notNull().references(() => wallets.id),
  userId:     uuid("user_id").notNull().references(() => users.id),
  type:       transactionTypeEnum("type").notNull(),
  amount:     numeric("amount", { precision: 15, scale: 2 }).notNull(),
  category:   text("category").notNull(),
  note:       text("note"),
  date:       timestamp("date", { withTimezone: true }).notNull(),
  receiptUrl: text("receipt_url"),
  createdAt:  timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Budgets ──────────────────────────────────────────────────────────────────

export const budgets = pgTable("budgets", {
  id:        serial("id").primaryKey(),
  coupleId:  integer("couple_id").references(() => couples.id, { onDelete: "cascade" }), // nullable: support solo
  userId:    uuid("user_id").references(() => users.id),                                  // untuk filter solo
  category:  text("category").notNull(),
  amount:    numeric("amount", { precision: 15, scale: 2 }).notNull(),
  month:     integer("month").notNull(),
  year:      integer("year").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Allocation Templates ─────────────────────────────────────────────────────

export const allocationTemplates = pgTable(
  "allocation_templates",
  {
    id:        serial("id").primaryKey(),
    coupleId:  integer("couple_id").references(() => couples.id, { onDelete: "cascade" }), // nullable: support solo
    userId:    uuid("user_id").references(() => users.id),                                  // untuk filter solo
    name:      text("name").notNull(),
    isDefault: integer("is_default").default(0).notNull(),
    rules:     text("rules").notNull(), // JSON: AllocationRule[]
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    uniqueDefault: uniqueIndex("unique_default_template")
      .on(t.coupleId, t.isDefault)
      .where(sql`is_default = 1`),
  })
);

// ─── Goals ────────────────────────────────────────────────────────────────────

export const goals = pgTable("goals", {
  id:           serial("id").primaryKey(),
  coupleId:     integer("couple_id").references(() => couples.id, { onDelete: "cascade" }), // nullable: support solo
  userId:       uuid("user_id").references(() => users.id),                                  // untuk filter solo
  name:         text("name").notNull(),
  targetAmount: numeric("target_amount", { precision: 15, scale: 2 }).notNull(),
  savedAmount:  numeric("saved_amount",  { precision: 15, scale: 2 }).default("0").notNull(),
  targetDate:   timestamp("target_date", { withTimezone: true }),
  emoji:        text("emoji").default("🎯"),
  status:       goalStatusEnum("status").default("ongoing").notNull(),
  createdAt:    timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Moments ──────────────────────────────────────────────────────────────────

export const moments = pgTable("moments", {
  id:            serial("id").primaryKey(),
  coupleId:      integer("couple_id").references(() => couples.id, { onDelete: "cascade" }), // nullable: support solo
  uploaderId:    uuid("uploader_id").notNull().references(() => users.id),
  transactionId: integer("transaction_id").references(() => transactions.id, { onDelete: "set null" }),
  imageUrl:      text("image_url").notNull(),
  caption:       text("caption"),
  date:          timestamp("date", { withTimezone: true }).defaultNow().notNull(),
  createdAt:     timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ─── Relations ────────────────────────────────────────────────────────────────

export const usersRelations = relations(users, ({ many }) => ({
  memberships:         many(coupleMembers),
  wallets:             many(wallets),
  transactions:        many(transactions),
  moments:             many(moments),
  budgets:             many(budgets),
  goals:               many(goals),
  allocationTemplates: many(allocationTemplates),
}));

export const couplesRelations = relations(couples, ({ many }) => ({
  members:             many(coupleMembers),
  wallets:             many(wallets),
  transactions:        many(transactions),
  budgets:             many(budgets),
  goals:               many(goals),
  moments:             many(moments),
  allocationTemplates: many(allocationTemplates),
}));

export const coupleMembersRelations = relations(coupleMembers, ({ one }) => ({
  couple: one(couples, { fields: [coupleMembers.coupleId], references: [couples.id] }),
  user:   one(users,   { fields: [coupleMembers.userId],   references: [users.id]   }),
}));

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  couple:       one(couples, { fields: [wallets.coupleId], references: [couples.id] }),
  owner:        one(users,   { fields: [wallets.ownerId],  references: [users.id]   }),
  transactions: many(transactions),
}));

export const transactionsRelations = relations(transactions, ({ one, many }) => ({
  couple:  one(couples, { fields: [transactions.coupleId], references: [couples.id] }),
  wallet:  one(wallets, { fields: [transactions.walletId], references: [wallets.id] }),
  user:    one(users,   { fields: [transactions.userId],   references: [users.id]   }),
  moments: many(moments),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  couple: one(couples, { fields: [budgets.coupleId], references: [couples.id] }),
  user:   one(users,   { fields: [budgets.userId],   references: [users.id]   }),
}));

export const allocationTemplatesRelations = relations(allocationTemplates, ({ one }) => ({
  couple: one(couples, { fields: [allocationTemplates.coupleId], references: [couples.id] }),
  user:   one(users,   { fields: [allocationTemplates.userId],   references: [users.id]   }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  couple: one(couples, { fields: [goals.coupleId], references: [couples.id] }),
  user:   one(users,   { fields: [goals.userId],   references: [users.id]   }),
}));

export const momentsRelations = relations(moments, ({ one }) => ({
  couple:      one(couples,      { fields: [moments.coupleId],      references: [couples.id]      }),
  uploader:    one(users,        { fields: [moments.uploaderId],    references: [users.id]        }),
  transaction: one(transactions, { fields: [moments.transactionId], references: [transactions.id] }),
}));