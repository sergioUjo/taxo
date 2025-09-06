import { v } from 'convex/values';

import { api } from './_generated/api';
import { mutation, query } from './_generated/server';

// TREATMENT TYPE QUERIES AND MUTATIONS
export const getTreatmentTypes = query({
  args: {
    specialtyId: v.optional(v.id('specialties')),
  },
  handler: async (ctx, args) => {
    if (args.specialtyId) {
      return await ctx.db
        .query('treatmentTypes')
        .withIndex('by_specialty', (q) =>
          q.eq('specialtyId', args.specialtyId!)
        )
        .order('asc')
        .collect();
    }

    return await ctx.db.query('treatmentTypes').order('asc').collect();
  },
});

export const getTreatmentTypeById = query({
  args: { id: v.id('treatmentTypes') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createTreatmentType = mutation({
  args: {
    specialtyId: v.id('specialties'),
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('treatmentTypes', {
      specialtyId: args.specialtyId,
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateTreatmentType = mutation({
  args: {
    id: v.id('treatmentTypes'),
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

export const deleteTreatmentType = mutation({
  args: { id: v.id('treatmentTypes') },
  handler: async (ctx, args) => {
    // Check if there are any procedures using this treatment type
    const procedures = await ctx.db
      .query('procedures')
      .withIndex('by_treatment_type', (q) => q.eq('treatmentTypeId', args.id))
      .collect();

    if (procedures.length > 0) {
      throw new Error(
        'Cannot delete treatment type with existing procedures. Please delete or reassign procedures first.'
      );
    }

    return await ctx.db.delete(args.id);
  },
});

// Cascading delete that removes treatment type and all its related data
export const deleteTreatmentTypeCascade = mutation({
  args: { id: v.id('treatmentTypes') },
  handler: async (ctx, args) => {
    // Get all procedures for this treatment type
    const procedures = await ctx.db
      .query('procedures')
      .withIndex('by_treatment_type', (q) => q.eq('treatmentTypeId', args.id))
      .collect();

    // Delete procedures and their rules
    for (const procedure of procedures) {
      // Delete procedure-rule associations
      const procedureRules = await ctx.db
        .query('procedureRules')
        .withIndex('by_procedure', (q) => q.eq('procedureId', procedure._id))
        .collect();
      for (const procedureRule of procedureRules) {
        await ctx.db.delete(procedureRule._id);
      }

      // Delete case classifications associated with this procedure
      const procedureClassifications = await ctx.db
        .query('caseClassifications')
        .withIndex('by_procedure', (q) => q.eq('procedureId', procedure._id))
        .collect();
      for (const classification of procedureClassifications) {
        await ctx.db.delete(classification._id);
      }

      // Delete the procedure
      await ctx.db.delete(procedure._id);
    }

    // Delete treatment type-rule associations
    const treatmentTypeRules = await ctx.db
      .query('treatmentTypeRules')
      .withIndex('by_treatment_type', (q) => q.eq('treatmentTypeId', args.id))
      .collect();
    for (const treatmentTypeRule of treatmentTypeRules) {
      await ctx.db.delete(treatmentTypeRule._id);
    }

    // Delete case classifications associated with this treatment type
    const treatmentTypeClassifications = await ctx.db
      .query('caseClassifications')
      .withIndex('by_treatment_type', (q) => q.eq('treatmentTypeId', args.id))
      .collect();
    for (const classification of treatmentTypeClassifications) {
      await ctx.db.delete(classification._id);
    }

    // Finally delete the treatment type
    return await ctx.db.delete(args.id);
  },
});
