import { v } from 'convex/values';

import { mutation, query } from './_generated/server';

// SPECIALTY QUERIES AND MUTATIONS
export const getSpecialties = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query('specialties').order('name').collect();
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

// TREATMENT TYPE QUERIES AND MUTATIONS
export const getTreatmentTypes = query({
  args: {
    specialtyId: v.optional(v.id('specialties')),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('treatmentTypes');

    if (args.specialtyId) {
      query = query.withIndex('by_specialty', (q) =>
        q.eq('specialtyId', args.specialtyId)
      );
    }

    return await query.order('name').collect();
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

// PROCEDURE QUERIES AND MUTATIONS
export const getProcedures = query({
  args: {
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query('procedures');

    if (args.treatmentTypeId) {
      query = query.withIndex('by_treatment_type', (q) =>
        q.eq('treatmentTypeId', args.treatmentTypeId)
      );
    }

    return await query.order('name').collect();
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

export const deleteProcedure = mutation({
  args: { id: v.id('procedures') },
  handler: async (ctx, args) => {
    return await ctx.db.delete(args.id);
  },
});

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

// HIERARCHICAL DATA QUERIES
export const getSpecialtiesWithHierarchy = query({
  args: {},
  handler: async (ctx) => {
    const specialties = await ctx.db
      .query('specialties')
      .order('name')
      .collect();

    const result = [];

    for (const specialty of specialties) {
      const treatmentTypes = await ctx.db
        .query('treatmentTypes')
        .withIndex('by_specialty', (q) => q.eq('specialtyId', specialty._id))
        .order('name')
        .collect();

      const treatmentTypesWithProcedures = [];

      for (const treatmentType of treatmentTypes) {
        const procedures = await ctx.db
          .query('procedures')
          .withIndex('by_treatment_type', (q) =>
            q.eq('treatmentTypeId', treatmentType._id)
          )
          .order('name')
          .collect();

        treatmentTypesWithProcedures.push({
          ...treatmentType,
          procedures,
        });
      }

      result.push({
        ...specialty,
        treatmentTypes: treatmentTypesWithProcedures,
      });
    }

    return result;
  },
});

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
