import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// CASE CLASSIFICATION QUERIES AND MUTATIONS
export const getCaseClassification = query({
  args: { caseId: v.id('cases') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('caseClassifications')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .first();
  },
});

export const createCaseClassification = mutation({
  args: {
    caseId: v.id('cases'),
    specialtyId: v.id('specialties'),
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
    procedureId: v.optional(v.id('procedures')),
    confidence: v.optional(v.number()),
    classifiedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert('caseClassifications', {
      caseId: args.caseId,
      specialtyId: args.specialtyId,
      treatmentTypeId: args.treatmentTypeId,
      procedureId: args.procedureId,
      confidence: args.confidence,
      classifiedBy: args.classifiedBy,
      classifiedAt: now,
    });
  },
});

export const updateCaseClassification = mutation({
  args: {
    id: v.id('caseClassifications'),
    specialtyId: v.optional(v.id('specialties')),
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
    procedureId: v.optional(v.id('procedures')),
    confidence: v.optional(v.number()),
    reviewedBy: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, reviewedBy, ...updates } = args;
    const patchData: any = { ...updates };

    if (reviewedBy) {
      patchData.reviewedBy = reviewedBy;
      patchData.reviewedAt = new Date().toISOString();
    }

    return await ctx.db.patch(id, patchData);
  },
});
