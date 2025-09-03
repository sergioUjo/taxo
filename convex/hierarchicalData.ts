import { query } from './_generated/server';

// HIERARCHICAL DATA QUERIES
export const getSpecialtiesWithHierarchy = query({
  args: {},
  handler: async (ctx) => {
    const specialties = await ctx.db
      .query('specialties')
      .order('asc')
      .collect();

    const result = [];

    for (const specialty of specialties) {
      const treatmentTypes = await ctx.db
        .query('treatmentTypes')
        .withIndex('by_specialty', (q) => q.eq('specialtyId', specialty._id))
        .order('asc')
        .collect();

      const treatmentTypesWithProcedures = [];

      for (const treatmentType of treatmentTypes) {
        const procedures = await ctx.db
          .query('procedures')
          .withIndex('by_treatment_type', (q) =>
            q.eq('treatmentTypeId', treatmentType._id)
          )
          .order('asc')
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
