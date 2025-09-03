import { mutation } from './_generated/server';

export const clearDatabase = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all tables in reverse dependency order
    const rules = await ctx.db.query('rules').collect();
    for (const rule of rules) {
      await ctx.db.delete(rule._id);
    }

    const procedures = await ctx.db.query('procedures').collect();
    for (const procedure of procedures) {
      await ctx.db.delete(procedure._id);
    }

    const treatmentTypes = await ctx.db.query('treatmentTypes').collect();
    for (const treatmentType of treatmentTypes) {
      await ctx.db.delete(treatmentType._id);
    }

    const specialties = await ctx.db.query('specialties').collect();
    for (const specialty of specialties) {
      await ctx.db.delete(specialty._id);
    }

    return {
      message: 'Database cleared successfully',
      deleted: {
        specialties: specialties.length,
        treatmentTypes: treatmentTypes.length,
        procedures: procedures.length,
        rules: rules.length,
      },
    };
  },
});

export const seedClassifications = mutation({
  args: {},
  handler: async (ctx) => {
    const now = new Date().toISOString();

    // Check if we already have specialties to avoid duplicate seeding
    const existingSpecialties = await ctx.db.query('specialties').collect();
    if (existingSpecialties.length > 0) {
      throw new Error(
        'Database already contains specialties. Seeding skipped.'
      );
    }

    // Create Specialties
    const ophthalmologyId = await ctx.db.insert('specialties', {
      name: 'Ophthalmology',
      description: 'Eye care and vision-related procedures',
      createdAt: now,
      updatedAt: now,
    });

    const cardiologyId = await ctx.db.insert('specialties', {
      name: 'Cardiology',
      description: 'Heart and cardiovascular system care',
      createdAt: now,
      updatedAt: now,
    });

    const orthopedicsId = await ctx.db.insert('specialties', {
      name: 'Orthopedics',
      description: 'Musculoskeletal system and joint care',
      createdAt: now,
      updatedAt: now,
    });

    const neurologyId = await ctx.db.insert('specialties', {
      name: 'Neurology',
      description: 'Nervous system and brain disorders',
      createdAt: now,
      updatedAt: now,
    });

    // Create Treatment Types for Ophthalmology
    const ophthoConsultationId = await ctx.db.insert('treatmentTypes', {
      specialtyId: ophthalmologyId,
      name: 'Consultation',
      description: 'Initial patient consultations and evaluations',
      createdAt: now,
      updatedAt: now,
    });

    const ophthoDiagnosticsId = await ctx.db.insert('treatmentTypes', {
      specialtyId: ophthalmologyId,
      name: 'Diagnostics',
      description: 'Diagnostic tests and imaging for eye conditions',
      createdAt: now,
      updatedAt: now,
    });

    const ophthoSurgeryId = await ctx.db.insert('treatmentTypes', {
      specialtyId: ophthalmologyId,
      name: 'Procedure or Surgery',
      description: 'Surgical procedures and interventions',
      createdAt: now,
      updatedAt: now,
    });

    const ophthoFollowUpId = await ctx.db.insert('treatmentTypes', {
      specialtyId: ophthalmologyId,
      name: 'Follow-up/Monitoring',
      description: 'Post-treatment monitoring and routine check-ups',
      createdAt: now,
      updatedAt: now,
    });

    // Create Treatment Types for Cardiology
    const cardioConsultationId = await ctx.db.insert('treatmentTypes', {
      specialtyId: cardiologyId,
      name: 'Consultation',
      description: 'Initial cardiac consultations and evaluations',
      createdAt: now,
      updatedAt: now,
    });

    const cardioDiagnosticsId = await ctx.db.insert('treatmentTypes', {
      specialtyId: cardiologyId,
      name: 'Diagnostics',
      description: 'Cardiac diagnostic tests and procedures',
      createdAt: now,
      updatedAt: now,
    });

    const cardioTherapyId = await ctx.db.insert('treatmentTypes', {
      specialtyId: cardiologyId,
      name: 'Therapy',
      description: 'Non-invasive cardiac treatments and therapies',
      createdAt: now,
      updatedAt: now,
    });

    // Create Procedures for Ophthalmology
    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoConsultationId,
      name: 'Comprehensive Eye Exam',
      description: 'Complete eye examination including vision testing',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoConsultationId,
      name: 'Retinal Consultation',
      description: 'Specialized consultation for retinal conditions',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoDiagnosticsId,
      name: 'OCT Scan',
      description: 'Optical Coherence Tomography imaging',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoDiagnosticsId,
      name: 'Visual Field Test',
      description: 'Perimetry testing for visual field defects',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoSurgeryId,
      name: 'Trabeculectomy',
      description: 'Glaucoma surgery to reduce eye pressure',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoSurgeryId,
      name: 'Cataract Surgery',
      description: 'Removal of clouded lens from the eye',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: ophthoSurgeryId,
      name: 'Vitrectomy',
      description: 'Surgical removal of vitreous gel from the eye',

      createdAt: now,
      updatedAt: now,
    });

    // Create Procedures for Cardiology
    await ctx.db.insert('procedures', {
      treatmentTypeId: cardioConsultationId,
      name: 'Initial Cardiac Assessment',
      description: 'Comprehensive cardiac evaluation and risk assessment',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: cardioDiagnosticsId,
      name: 'Echocardiogram',
      description: 'Ultrasound imaging of the heart',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: cardioDiagnosticsId,
      name: 'Stress Test',
      description: 'Exercise stress testing for heart function',

      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert('procedures', {
      treatmentTypeId: cardioDiagnosticsId,
      name: 'Cardiac Catheterization',
      description: 'Invasive cardiac diagnostic procedure',

      createdAt: now,
      updatedAt: now,
    });

    // Create Sample Rules
    await ctx.db.insert('rules', {
      specialtyId: ophthalmologyId,
      treatmentTypeId: ophthoSurgeryId,
      title: 'Prior Authorization Required - Surgery',
      description:
        'All ophthalmology surgical procedures require prior authorization from insurance provider before scheduling.',
      ruleType: 'approval',
      priority: 'high',

      conditions: {
        requiresPriorAuth: true,
        insuranceTypes: ['commercial', 'medicare', 'medicaid'],
      },
      actions: {
        flagForReview: true,
        requireDocuments: ['referral_letter', 'insurance_verification'],
        estimatedProcessingDays: 5,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });

    await ctx.db.insert('rules', {
      specialtyId: cardiologyId,
      treatmentTypeId: cardioConsultationId,
      title: 'Referral Letter Required',
      description:
        'All cardiology consultations require a referral letter from the primary care physician.',
      ruleType: 'documentation',
      priority: 'medium',

      conditions: {
        requiresReferral: true,
        validReferralSources: ['pcp', 'specialist', 'emergency'],
      },
      actions: {
        flagForReview: true,
        requireDocuments: ['referral_letter'],
        autoSchedule: false,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });

    await ctx.db.insert('rules', {
      specialtyId: cardiologyId,
      treatmentTypeId: cardioDiagnosticsId,
      procedureId: await ctx.db
        .query('procedures')
        .filter((q) => q.eq(q.field('name'), 'Cardiac Catheterization'))
        .first()
        .then((p) => p?._id),
      title: 'High-Risk Procedure Protocol',
      description:
        'Cardiac catheterization requires additional consent forms and pre-procedure evaluation.',
      ruleType: 'workflow',
      priority: 'critical',

      conditions: {
        highRiskProcedure: true,
        requiresSpecialConsent: true,
      },
      actions: {
        requireDocuments: [
          'informed_consent',
          'pre_procedure_evaluation',
          'anesthesia_clearance',
        ],
        requiresPhysicianReview: true,
        schedulingDelay: 3,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });

    await ctx.db.insert('rules', {
      specialtyId: ophthalmologyId,
      title: 'Urgent Case Priority',
      description:
        'Cases with vision loss or acute eye injuries should be prioritized for immediate review.',
      ruleType: 'workflow',
      priority: 'critical',

      conditions: {
        urgentKeywords: [
          'vision loss',
          'sudden blindness',
          'eye injury',
          'acute glaucoma',
          'retinal detachment',
        ],
      },
      actions: {
        setPriority: 'urgent',
        notifyPhysician: true,
        maxWaitTime: 24,
      },
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    });

    return {
      message: 'Successfully seeded classifications database',
      specialties: 4,
      treatmentTypes: 7,
      procedures: 11,
      rules: 4,
    };
  },
});
