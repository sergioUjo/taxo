import { v } from 'convex/values';

import { api } from './_generated/api';
import { action, mutation, query } from './_generated/server';

// Create a new case
export const createCase = mutation({
  args: {
    referralSource: v.string(),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    patientId: v.optional(v.id('patients')),
  },
  handler: async (ctx, args) => {
    const caseId = await ctx.db.insert('cases', {
      referralSource: args.referralSource,
      status: 'new',
      priority: args.priority || 'medium',
      notes: args.notes,
      patientId: args.patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log the creation
    await ctx.db.insert('activityLogs', {
      caseId,
      action: 'case_created',
      details: `New case created from ${args.referralSource}${args.patientId ? ` for patient ${args.patientId}` : ''}`,
      performedBy: 'system',
      timestamp: new Date().toISOString(),
    });

    return caseId;
  },
});

// Create a new case with patient processing
export const createCaseWithPatientProcessing = mutation({
  args: {
    referralSource: v.string(),
    priority: v.optional(v.string()),
    notes: v.optional(v.string()),
    patientData: v.optional(
      v.object({
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        dateOfBirth: v.optional(v.string()),
        medicalRecordNumber: v.optional(v.string()),
        address: v.optional(v.string()),
        city: v.optional(v.string()),
        state: v.optional(v.string()),
        zipCode: v.optional(v.string()),
        insuranceProvider: v.optional(v.string()),
        insuranceMemberId: v.optional(v.string()),
        insuranceGroupNumber: v.optional(v.string()),
      })
    ),
    existingPatientId: v.optional(v.id('patients')),
  },
  handler: async (ctx, args) => {
    let patientId = args.existingPatientId;

    // Create new patient if patient data is provided and no existing patient ID
    if (args.patientData && !patientId) {
      patientId = await ctx.db.insert('patients', {
        ...args.patientData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Create the case
    const caseId = await ctx.db.insert('cases', {
      referralSource: args.referralSource,
      status: 'new',
      priority: args.priority || 'medium',
      notes: args.notes,
      patientId: patientId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log the creation
    const patientInfo = patientId
      ? args.existingPatientId
        ? 'existing patient'
        : 'new patient'
      : 'no patient';
    await ctx.db.insert('activityLogs', {
      caseId,
      action: 'case_created',
      details: `New case created from ${args.referralSource} with ${patientInfo}${patientId ? ` (${patientId})` : ''}`,
      performedBy: 'system',
      timestamp: new Date().toISOString(),
    });

    return { caseId, patientId };
  },
});

// Get all cases with patient information
export const getAllCases = query({
  args: {
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let cases;
    if (args.status) {
      cases = await ctx.db
        .query('cases')
        .withIndex('by_status', (q) => q.eq('status', args.status!))
        .order('desc')
        .collect();
    } else {
      cases = await ctx.db
        .query('cases')
        .withIndex('by_created')
        .order('desc')
        .collect();
    }

    // Fetch patient information for each case
    const casesWithPatients = await Promise.all(
      cases.map(async (caseData) => {
        let patient = null;
        if (caseData.patientId) {
          patient = await ctx.db.get(caseData.patientId);
        }
        return {
          ...caseData,
          patient,
        };
      })
    );

    return casesWithPatients;
  },
});

// Get a single case with its documents and patient information
export const getCaseWithDocuments = query({
  args: {
    caseId: v.id('cases'),
  },
  handler: async (ctx, args) => {
    const caseData = await ctx.db.get(args.caseId);
    if (!caseData) return null;

    const documents = await ctx.db
      .query('documents')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .collect();

    const activityLogs = await ctx.db
      .query('activityLogs')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .order('desc')
      .collect();

    // Fetch patient information
    let patient = null;
    if (caseData.patientId) {
      patient = await ctx.db.get(caseData.patientId);
    }
    for (const document of documents) {
      const documentUrl = await ctx.storage.getUrl(
        document.storageId as string
      );
      if (!documentUrl) {
        throw new Error('Could not get document URL from storage');
      }
      document.fileUrl = documentUrl;
    }
    return {
      ...caseData,
      patient,
      documents,
      activityLogs,
    };
  },
});

// Update case information
export const updateCase = mutation({
  args: {
    caseId: v.id('cases'),
    updates: v.object({
      status: v.optional(v.string()),
      priority: v.optional(v.string()),
      patientId: v.optional(v.id('patients')),
      eligibilityStatus: v.optional(v.string()),
      appointmentDate: v.optional(v.string()),
      appointmentTime: v.optional(v.string()),
      provider: v.optional(v.string()),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.caseId, {
      ...args.updates,
      updatedAt: new Date().toISOString(),
    });

    // Log the update
    await ctx.db.insert('activityLogs', {
      caseId: args.caseId,
      action: 'case_updated',
      details: `Case updated: ${Object.keys(args.updates).join(', ')}`,
      performedBy: 'system',
      timestamp: new Date().toISOString(),
    });
  },
});

// Generate upload URL for file
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Add document reference to a case using Convex storage
export const addDocumentToCase = mutation({
  args: {
    caseId: v.id('cases'),
    fileName: v.string(),
    storageId: v.id('_storage'),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const documentId = await ctx.db.insert('documents', {
      caseId: args.caseId,
      fileName: args.fileName,
      storageId: args.storageId,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded',
    });

    // Update case status if it's still new
    const caseData = await ctx.db.get(args.caseId);
    if (caseData?.status === 'new') {
      await ctx.db.patch(args.caseId, {
        status: 'processing',
        updatedAt: new Date().toISOString(),
      });
    }

    // Log the document upload
    await ctx.db.insert('activityLogs', {
      caseId: args.caseId,
      action: 'document_uploaded',
      details: `Document uploaded: ${args.fileName}`,
      performedBy: 'system',
      timestamp: new Date().toISOString(),
    });

    return documentId;
  },
});

export const scheduleDocumentProcessing = mutation({
  args: {
    caseId: v.id('cases'),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query('documents')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .collect();
    if (!documents) {
      throw new Error('Documents not found');
    }
    await ctx.scheduler.runAfter(
      0,
      api.processDocumentDirect.processDocumentDirectly,
      {
        caseId: args.caseId,
        documentId: documents[0]._id,
        documentPath: documents[0].storageId as string,
      }
    );
  },
});

// Get case rule checks (rule data is embedded in the rule check)
export const getCaseRuleChecks = query({
  args: {
    caseId: v.id('cases'),
  },
  handler: async (ctx, args) => {
    // Get all rule checks for this case - rule data is now embedded
    const ruleChecks = await ctx.db
      .query('ruleChecks')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .collect();

    // Transform to match expected format with embedded rule data
    const ruleChecksWithDetails = ruleChecks.map((check) => ({
      ...check,
      rule: {
        _id: check.originalRuleId || null,
        title: check.ruleTitle,
        description: check.ruleDescription,
      },
    }));

    // Sort by rule title for consistent ordering
    return ruleChecksWithDetails.sort((a, b) =>
      a.ruleTitle.localeCompare(b.ruleTitle)
    );
  },
});

// Update rule check with processing results
export const updateRuleCheck = mutation({
  args: {
    caseId: v.id('cases'),
    ruleTitle: v.string(),
    status: v.string(),
    reasoning: v.string(),
    requiredAdditionalInfo: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    // Find the rule check for this case and rule title (now stored directly)
    const ruleChecks = await ctx.db
      .query('ruleChecks')
      .withIndex('by_case', (q) => q.eq('caseId', args.caseId))
      .collect();

    // Find the rule check that matches the rule title
    const ruleCheckToUpdate = ruleChecks.find(
      (check) => check.ruleTitle === args.ruleTitle
    );

    if (!ruleCheckToUpdate) {
      throw new Error(
        `Rule check not found for case ${args.caseId} and rule "${args.ruleTitle}"`
      );
    }

    // Update the rule check with the processing results
    await ctx.db.patch(ruleCheckToUpdate._id, {
      status: args.status,
      reasoning: args.reasoning,
      requiredAdditionalInfo: args.requiredAdditionalInfo || [],
      processedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Log the rule processing
    await ctx.db.insert('activityLogs', {
      caseId: args.caseId,
      action: 'rule_processed',
      details: `Rule "${args.ruleTitle}" processed with status: ${args.status}`,
      performedBy: 'ai_agent',
      timestamp: new Date().toISOString(),
    });

    return ruleCheckToUpdate._id;
  },
});

// Get file URL from storage ID
export const getFileUrl = query({
  args: {
    storageId: v.id('_storage'),
  },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
