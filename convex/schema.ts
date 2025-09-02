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
});
