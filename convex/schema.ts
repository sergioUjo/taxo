import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export default defineSchema({
  patients: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),

    // Flexible data array - AI can populate any additional information
    additionalData: v.optional(
      v.array(
        v.object({
          name: v.string(), // Field name (e.g., "Date of Birth", "Medical Record Number", "Insurance Provider")
          value: v.string(), // Field value
          confidence: v.optional(v.number()), // Confidence score from AI extraction (0.0-1.0)
          source: v.optional(v.string()), // Source document or extraction method
          extractedAt: v.optional(v.string()), // When this data was extracted
        })
      )
    ),

    // Metadata
    createdAt: v.string(),
    updatedAt: v.string(),
    notes: v.optional(v.string()),
  })
    .index('by_email', ['email'])
    .index('by_phone', ['phone'])
    .index('by_name', ['name'])
    .index('by_created', ['createdAt']),

  cases: defineTable({
    // Basic case information
    referralSource: v.string(), // email, web-form, ehr, fax, portal
    status: v.string(), // new, processing, pending-info, eligible, scheduled, completed
    priority: v.optional(v.string()), // low, medium, high, urgent

    // Patient reference
    patientId: v.optional(v.id('patients')),

    // Case-specific information
    eligibilityStatus: v.optional(v.string()), // pending, eligible, not-eligible, needs-review

    // Scheduling information
    appointmentDate: v.optional(v.string()),
    appointmentTime: v.optional(v.string()),
    provider: v.optional(v.string()),

    // Metadata
    createdAt: v.string(),
    updatedAt: v.string(),
    notes: v.optional(v.string()),
  })
    .index('by_status', ['status'])
    .index('by_patient', ['patientId'])
    .index('by_created', ['createdAt']),

  documents: defineTable({
    caseId: v.id('cases'),
    fileName: v.string(),
    fileUrl: v.optional(v.string()), // Keep for backward compatibility
    storageId: v.optional(v.id('_storage')), // Convex storage ID
    fileType: v.string(),
    fileSize: v.number(),
    uploadedAt: v.string(),
    extractedData: v.optional(v.any()), // JSON data extracted from document
    status: v.string(), // uploaded, processing, processed, failed
  })
    .index('by_case', ['caseId'])
    .index('by_status', ['status']),

  activityLogs: defineTable({
    caseId: v.id('cases'),
    action: v.string(),
    details: v.optional(v.string()),
    performedBy: v.string(), // system, user email, or agent
    timestamp: v.string(),
  })
    .index('by_case', ['caseId'])
    .index('by_timestamp', ['timestamp']),

  // Classification System
  specialties: defineTable({
    name: v.string(), // e.g., "Ophthalmology", "Cardiology"
    description: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  }).index('by_name', ['name']),

  treatmentTypes: defineTable({
    specialtyId: v.id('specialties'),
    name: v.string(), // e.g., "Consultation", "Diagnostics", "Therapy", "Procedure or Surgery", "Follow-up/Monitoring"
    description: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index('by_specialty', ['specialtyId'])
    .index('by_name', ['name']),

  procedures: defineTable({
    treatmentTypeId: v.id('treatmentTypes'),
    name: v.string(), // e.g., "Trabeculectomy", "MRI brain"
    description: v.optional(v.string()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index('by_treatment_type', ['treatmentTypeId'])
    .index('by_name', ['name']),

  // Rules System - independent entities that can be referenced by specialties, treatments, and procedures
  rules: defineTable({
    title: v.string(),
    description: v.string(),

    createdAt: v.string(),
    updatedAt: v.string(),
    createdBy: v.optional(v.string()),
  }).index('by_title', ['title']),

  // Junction tables for many-to-many relationships
  specialtyRules: defineTable({
    specialtyId: v.id('specialties'),
    ruleId: v.id('rules'),
    createdAt: v.string(),
  })
    .index('by_specialty', ['specialtyId'])
    .index('by_rule', ['ruleId']),

  treatmentTypeRules: defineTable({
    treatmentTypeId: v.id('treatmentTypes'),
    ruleId: v.id('rules'),
    createdAt: v.string(),
  })
    .index('by_treatment_type', ['treatmentTypeId'])
    .index('by_rule', ['ruleId']),

  procedureRules: defineTable({
    procedureId: v.id('procedures'),
    ruleId: v.id('rules'),
    createdAt: v.string(),
  })
    .index('by_procedure', ['procedureId'])
    .index('by_rule', ['ruleId']),

  // Case Classifications - links cases to their classification
  caseClassifications: defineTable({
    caseId: v.id('cases'),
    specialtyId: v.id('specialties'),
    treatmentTypeId: v.optional(v.id('treatmentTypes')),
    procedureId: v.optional(v.id('procedures')),

    // AI confidence and metadata
    confidence: v.optional(v.number()), // 0.0-1.0
    classifiedBy: v.string(), // "ai", "user", "system"
    classifiedAt: v.string(),
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
  })
    .index('by_case', ['caseId'])
    .index('by_specialty', ['specialtyId'])
    .index('by_treatment_type', ['treatmentTypeId'])
    .index('by_procedure', ['procedureId']),

  // Rule Checks - tracks the status of each rule for a case (stores rule copy, not reference)
  ruleChecks: defineTable({
    caseId: v.id('cases'),

    // Rule data (copied when rule check is created)
    ruleTitle: v.string(),
    ruleDescription: v.string(),
    originalRuleId: v.optional(v.id('rules')), // Reference to original rule for audit purposes

    // Processing results
    status: v.string(), // "pending", "valid", "needs_more_information", "deny"
    notes: v.optional(v.string()), // Additional notes about why the rule passed/failed
    reasoning: v.optional(v.string()), // Detailed reasoning from AI processing
    requiredAdditionalInfo: v.optional(v.array(v.string())), // List of additional info needed

    // Metadata
    checkedBy: v.string(), // "ai", "user", "system"
    checkedAt: v.string(),
    processedAt: v.optional(v.string()), // When AI processing completed
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    updatedAt: v.optional(v.string()), // Last updated timestamp

    // Keep track of which classification this rule check was created for (for audit purposes)
    createdForClassificationId: v.optional(v.id('caseClassifications')),
  })
    .index('by_case', ['caseId'])
    .index('by_rule_title', ['ruleTitle'])
    .index('by_status', ['status'])
    .index('by_original_rule', ['originalRuleId']),
});
