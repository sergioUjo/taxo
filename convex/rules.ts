import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// RULE QUERIES AND MUTATIONS
export const getRules = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('rules')
      .collect()
      .then((rules) => rules.sort((a, b) => a.title.localeCompare(b.title)));
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
    title: v.string(),
    description: v.string(),
    createdBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('rules', {
      title: args.title,
      description: args.description,
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

// Junction table management functions
export const addRuleToSpecialty = mutation({
  args: {
    specialtyId: v.id('specialties'),
    ruleId: v.id('rules'),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('specialtyRules', {
      specialtyId: args.specialtyId,
      ruleId: args.ruleId,
      createdAt: now,
    });
  },
});

export const removeRuleFromSpecialty = mutation({
  args: {
    specialtyId: v.id('specialties'),
    ruleId: v.id('rules'),
  },
  handler: async (ctx, args) => {
    const junction = await ctx.db
      .query('specialtyRules')
      .withIndex('by_specialty', (q) => q.eq('specialtyId', args.specialtyId))
      .filter((q) => q.eq(q.field('ruleId'), args.ruleId))
      .first();

    if (junction) {
      await ctx.db.delete(junction._id);
    }
  },
});

export const getRulesBySpecialty = query({
  args: { specialtyId: v.id('specialties') },
  handler: async (ctx, args) => {
    const junctions = await ctx.db
      .query('specialtyRules')
      .withIndex('by_specialty', (q) => q.eq('specialtyId', args.specialtyId))
      .collect();

    const ruleIds = junctions.map((j) => j.ruleId);
    const rules = await Promise.all(ruleIds.map((id) => ctx.db.get(id)));

    return rules
      .filter(Boolean)
      .sort((a, b) => (a?.title || '').localeCompare(b?.title || ''));
  },
});

export const addRuleToTreatmentType = mutation({
  args: {
    treatmentTypeId: v.id('treatmentTypes'),
    ruleId: v.id('rules'),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('treatmentTypeRules', {
      treatmentTypeId: args.treatmentTypeId,
      ruleId: args.ruleId,
      createdAt: now,
    });
  },
});

export const removeRuleFromTreatmentType = mutation({
  args: {
    treatmentTypeId: v.id('treatmentTypes'),
    ruleId: v.id('rules'),
  },
  handler: async (ctx, args) => {
    const junction = await ctx.db
      .query('treatmentTypeRules')
      .withIndex('by_treatment_type', (q) =>
        q.eq('treatmentTypeId', args.treatmentTypeId)
      )
      .filter((q) => q.eq(q.field('ruleId'), args.ruleId))
      .first();

    if (junction) {
      await ctx.db.delete(junction._id);
    }
  },
});

export const getRulesByTreatmentType = query({
  args: { treatmentTypeId: v.id('treatmentTypes') },
  handler: async (ctx, args) => {
    const junctions = await ctx.db
      .query('treatmentTypeRules')
      .withIndex('by_treatment_type', (q) =>
        q.eq('treatmentTypeId', args.treatmentTypeId)
      )
      .collect();

    const ruleIds = junctions.map((j) => j.ruleId);
    const rules = await Promise.all(ruleIds.map((id) => ctx.db.get(id)));

    return rules
      .filter(Boolean)
      .sort((a, b) => (a?.title || '').localeCompare(b?.title || ''));
  },
});

export const addRuleToProcedure = mutation({
  args: {
    procedureId: v.id('procedures'),
    ruleId: v.id('rules'),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('procedureRules', {
      procedureId: args.procedureId,
      ruleId: args.ruleId,
      createdAt: now,
    });
  },
});

export const removeRuleFromProcedure = mutation({
  args: {
    procedureId: v.id('procedures'),
    ruleId: v.id('rules'),
  },
  handler: async (ctx, args) => {
    const junction = await ctx.db
      .query('procedureRules')
      .withIndex('by_procedure', (q) => q.eq('procedureId', args.procedureId))
      .filter((q) => q.eq(q.field('ruleId'), args.ruleId))
      .first();

    if (junction) {
      await ctx.db.delete(junction._id);
    }
  },
});

export const getRulesByProcedure = query({
  args: { procedureId: v.id('procedures') },
  handler: async (ctx, args) => {
    const junctions = await ctx.db
      .query('procedureRules')
      .withIndex('by_procedure', (q) => q.eq('procedureId', args.procedureId))
      .collect();

    const ruleIds = junctions.map((j) => j.ruleId);
    const rules = await Promise.all(ruleIds.map((id) => ctx.db.get(id)));

    return rules
      .filter(Boolean)
      .sort((a, b) => (a?.title || '').localeCompare(b?.title || ''));
  },
});
