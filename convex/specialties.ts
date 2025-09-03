import { v } from 'convex/values';

import { mutation, query } from './_generated/server';
import { deleteTreatmentTypeCascade } from './treatments';
import {api} from "./_generated/api";

// SPECIALTY QUERIES AND MUTATIONS
export const getSpecialties = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('specialties').order('asc').collect();
  },
});

export const getSpecialtyById = query({
  args: { id: v.id('specialties') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const createSpecialty = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('specialties', {
      name: args.name,
      description: args.description,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateSpecialty = mutation({
  args: {
    id: v.id('specialties'),
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

export const deleteSpecialty = mutation({
  args: { id: v.id('specialties') },
  handler: async (ctx, args) => {
    // Check if there are any treatment types using this specialty
    const treatmentTypes = await ctx.db
      .query('treatmentTypes')
      .withIndex('by_specialty', (q) => q.eq('specialtyId', args.id))
      .collect();

    if (treatmentTypes.length > 0) {
      throw new Error(
        'Cannot delete specialty with existing treatment types. Please delete or reassign treatment types first.'
      );
    }

    return await ctx.db.delete(args.id);
  },
});

// Cascading delete that removes specialty and all its related data
export const deleteSpecialtyCascade = mutation({
  args: { id: v.id('specialties') },
  handler: async (ctx, args) => {
    // Get all treatment types for this specialty
    const treatmentTypes = await ctx.db
      .query('treatmentTypes')
      .withIndex('by_specialty', (q) => q.eq('specialtyId', args.id))
      .collect();

    // For each treatment type, delete its procedures and rules
    for (const treatmentType of treatmentTypes) {
      void ctx.runMutation(api.treatments.deleteTreatmentTypeCascade, {
        id: treatmentType._id,
      });
    }

    // Finally delete the specialty
    return await ctx.db.delete(args.id);
  },
});
