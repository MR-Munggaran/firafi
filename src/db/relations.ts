import { relations } from "drizzle-orm";
import {
  users, couples, coupleMembers,
  wallets, transactions, budgets, goals, moments,
} from "./schema";

export const usersRelations = relations(users, ({ many }) => ({
  coupleMembers: many(coupleMembers),
  wallets:       many(wallets),
  transactions:  many(transactions),
  moments:       many(moments),
}));

export const couplesRelations = relations(couples, ({ many }) => ({
  members:      many(coupleMembers),
  wallets:      many(wallets),
  transactions: many(transactions),
  budgets:      many(budgets),
  goals:        many(goals),
  moments:      many(moments),
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
  couple:  one(couples, { fields: [transactions.coupleId],  references: [couples.id] }),
  wallet:  one(wallets, { fields: [transactions.walletId],  references: [wallets.id] }),
  user:    one(users,   { fields: [transactions.userId],    references: [users.id]   }),
  moments: many(moments),
}));

export const budgetsRelations = relations(budgets, ({ one }) => ({
  couple: one(couples, { fields: [budgets.coupleId], references: [couples.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  couple: one(couples, { fields: [goals.coupleId], references: [couples.id] }),
}));

export const momentsRelations = relations(moments, ({ one }) => ({
  couple:      one(couples,      { fields: [moments.coupleId],      references: [couples.id]       }),
  uploader:    one(users,        { fields: [moments.uploaderId],    references: [users.id]         }),
  transaction: one(transactions, { fields: [moments.transactionId], references: [transactions.id]  }),
}));