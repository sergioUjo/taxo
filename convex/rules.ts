import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// RULE QUERIES AND MUTATIONS
export const getRules = query({
  args: {
    specialtyId: v.optional(v.id('specialties')),
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
    procedureId: v.optional(v.id('procedures')),
    ruleType: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let rules = await ctx.db.query('rules').collect();

    // Filter by classification level
    if (args.specialtyId) {
      rules = rules.filter((rule) => rule.specialtyId === args.specialtyId);
    }
    if (args.treatmentTypeId) {
      rules = rules.filter(
        (rule) => rule.treatmentTypeId === args.treatmentTypeId
      );
    }
    if (args.procedureId) {
      rules = rules.filter((rule) => rule.procedureId === args.procedureId);
    }

    // Filter by rule type
    if (args.ruleType) {
      rules = rules.filter((rule) => rule.ruleType === args.ruleType);
    }

    return rules.sort((a, b) => a.title.localeCompare(b.title));
  },
});

export const getRuleById = query({
  args: { id: v.id('rules') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createRule = mutation({
  args: {
    specialtyId: v.optional(v.id('specialties')),
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
    procedureId: v.optional(v.id('procedures')),
    title: v.string(),
    description: v.string(),
    ruleType: v.string(),
    priority: v.string(),
    conditions: v.optional(v.any()),
    actions: v.optional(v.any()),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('rules', {
      specialtyId: args.specialtyId,
      treatmentTypeId: args.treatmentTypeId,
      procedureId: args.procedureId,
      title: args.title,
      description: args.description,
      ruleType: args.ruleType,
      priority: args.priority,
      conditions: args.conditions,
      actions: args.actions,
      createdAt: now,
      updatedAt: now,
      createdBy: args.createdBy,
    });
  },
});

export const updateRule = mutation({
  args: {
    id: v.id('rules'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    ruleType: v.optional(v.string()),
    priority: v.optional(v.string()),
    conditions: v.optional(v.any()),
    actions: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    return await ctx.db.patch(id, {
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const deleteRule = mutation({
  args: { id: v.id('rules') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});
