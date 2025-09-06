import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// PROCEDURE QUERIES AND MUTATIONS
export const getProcedures = query({
  args: {
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
  },
  handler: async (ctx, args) => {
    if (args.treatmentTypeId) {
      return await ctx.db
        .query('procedures')
        .withIndex('by_treatment_type', (q) =>
          q.eq('treatmentTypeId', args.treatmentTypeId!)
        )
        .order('asc')
        .collect();
    }

    return await ctx.db.query('procedures').order('asc').collect();
  },
});

export const getProcedureById = query({
  args: { id: v.id('procedures') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createProcedure = mutation({
  args: {
    treatmentTypeId: v.id('treatmentTypes'),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('procedures', {
      treatmentTypeId: args.treatmentTypeId,
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateProcedure = mutation({
  args: {
    id: v.id('procedures'),
    name: v.optional(v.string()),
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

// Cascading delete that removes procedure and all its related data
export const deleteProcedureCascade = mutation({
  args: { id: v.id('procedures') },
  handler: async (ctx, args) => {
    // Delete procedure-rule associations
    const procedureRules = await ctx.db
      .query('procedureRules')
      .withIndex('by_procedure', (q) => q.eq('procedureId', args.id))
      .collect();
    for (const procedureRule of procedureRules) {
      await ctx.db.delete(procedureRule._id);
    }

    // Delete case classifications associated with this procedure
    const procedureClassifications = await ctx.db
      .query('caseClassifications')
      .withIndex('by_procedure', (q) => q.eq('procedureId', args.id))
      .collect();
    for (const classification of procedureClassifications) {
      await ctx.db.delete(classification._id);
    }

    // Finally delete the procedure
    return await ctx.db.delete(args.id);
  },
});
