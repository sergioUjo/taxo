import { v } from 'convex/values';

import type { Id } from './_generated/dataModel';
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

// Classify a case with a procedure and create rule checks
export const classifyCaseWithProcedure = mutation({
  args: {
    caseId: v.id('cases'),
    specialtyId: v.id('specialties'),
    treatmentTypeId: v.id('treatmentTypes'),
    procedureId: v.id('procedures'),
    classifiedBy: v.string(),
    confidence: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    // First, check if there's already a classification for this case
    const existingClassification = await ctx.db
      .query('caseClassifications')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .first();

    let classificationId: Id<'caseClassifications'>;

    if (existingClassification) {
      // Update existing classification
      await ctx.db.patch(existingClassification._id, {
        specialtyId: args.specialtyId,
        treatmentTypeId: args.treatmentTypeId,
        procedureId: args.procedureId,
        confidence: args.confidence,
        classifiedBy: args.classifiedBy,
        classifiedAt: now,
      });
      classificationId = existingClassification._id;

      // Don't delete existing rule checks - they are now associated with the case, not the classification
    } else {
      // Create new classification
      classificationId = await ctx.db.insert('caseClassifications', {
        caseId: args.caseId,
        specialtyId: args.specialtyId,
        treatmentTypeId: args.treatmentTypeId,
        procedureId: args.procedureId,
        confidence: args.confidence,
        classifiedBy: args.classifiedBy,
        classifiedAt: now,
      });
    }

    // Get all rules for this procedure
    const procedureRules = await ctx.db
      .query('procedureRules')
      .withIndex('by_procedure', (q) => q.eq('procedureId', args.procedureId))
      .collect();

    // Get existing rule checks for this case
    const existingRuleChecks = await ctx.db
      .query('ruleChecks')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .collect();

    const existingRuleIds = new Set(
      existingRuleChecks.map((check) => check.ruleId)
    );

    // Create rule checks for new rules only (initially set to "needs_information")
    const ruleCheckIds = [];
    for (const procedureRule of procedureRules) {
      if (!existingRuleIds.has(procedureRule.ruleId)) {
        const ruleCheckId = await ctx.db.insert('ruleChecks', {
          caseId: args.caseId,
          ruleId: procedureRule.ruleId,
          status: 'needs_information',
          checkedBy: 'system',
          checkedAt: now,
          createdForClassificationId: classificationId,
        });
        ruleCheckIds.push(ruleCheckId);
      }
    }

    // Log the classification
    await ctx.db.insert('activityLogs', {
      caseId: args.caseId,
      action: 'case_classified',
      details: `Case classified with procedure and ${procedureRules.length} rules to check`,
      performedBy: args.classifiedBy,
      timestamp: now,
    });

    return { classificationId, ruleCheckIds };
  },
});

// Get case classification with rule checks
export const getCaseClassificationWithRuleChecks = query({
  args: { caseId: v.id('cases') },
  handler: async (ctx, args) => {
    const classification = await ctx.db
      .query('caseClassifications')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .first();

    if (!classification) return null;

    // Get rule checks
    const ruleChecks = await ctx.db
      .query('ruleChecks')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .collect();

    // Get rule details for each check
    const ruleChecksWithDetails = await Promise.all(
      ruleChecks.map(async (check) => {
        const rule = await ctx.db.get(check.ruleId);
        return {
          ...check,
          rule,
        };
      })
    );

    // Get specialty, treatment type, and procedure details
    const specialty = classification.specialtyId
      ? await ctx.db.get(classification.specialtyId)
      : null;
    const treatmentType = classification.treatmentTypeId
      ? await ctx.db.get(classification.treatmentTypeId)
      : null;
    const procedure = classification.procedureId
      ? await ctx.db.get(classification.procedureId)
      : null;

    return {
      ...classification,
      specialty,
      treatmentType,
      procedure,
      ruleChecks: ruleChecksWithDetails,
    };
  },
});

// Update rule check status
export const updateRuleCheckStatus = mutation({
  args: {
    ruleCheckId: v.id('ruleChecks'),
    status: v.string(), // "passed", "needs_information", "denied"
    notes: v.optional(v.string()),
    checkedBy: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();

    return await ctx.db.patch(args.ruleCheckId, {
      status: args.status,
      notes: args.notes,
      checkedBy: args.checkedBy,
      checkedAt: now,
    });
  },
});
