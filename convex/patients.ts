import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new patient
export const createPatient = mutation({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    additionalData: v.optional(
      v.array(
        v.object({
          name: v.string(),
          value: v.string(),
          confidence: v.optional(v.number()),
          source: v.optional(v.string()),
          extractedAt: v.optional(v.string()),
        })
      )
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const patientId = await ctx.db.insert("patients", {
      ...args,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return patientId;
  },
});

// Find existing patients by various criteria
export const findPatientByEmail = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return patient;
  },
});

export const findPatientByPhone = query({
  args: {
    phone: v.string(),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db
      .query("patients")
      .withIndex("by_phone", (q) => q.eq("phone", args.phone))
      .first();

    return patient;
  },
});

// Find patient by medical record number in additionalData
export const findPatientByMRN = query({
  args: {
    medicalRecordNumber: v.string(),
  },
  handler: async (ctx, args) => {
    const allPatients = await ctx.db.query("patients").collect();

    // Search through additionalData for medical record number
    const patient = allPatients.find((patient) =>
      patient.additionalData?.some(
        (data) =>
          data.name.toLowerCase().includes("medical record") &&
          data.value === args.medicalRecordNumber
      )
    );

    return patient || null;
  },
});

// Search patients by name (fuzzy search)
export const searchPatientsByName = query({
  args: {
    nameQuery: v.string(),
  },
  handler: async (ctx, args) => {
    const allPatients = await ctx.db
      .query("patients")
      .withIndex("by_name")
      .collect();

    // Simple fuzzy search - in production you might want to use a more sophisticated search
    const searchTerm = args.nameQuery.toLowerCase();
    return allPatients.filter((patient) =>
      patient.name?.toLowerCase().includes(searchTerm)
    );
  },
});

// Find potential duplicate patients
export const findPotentialDuplicatePatients = query({
  args: {
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    additionalDataToMatch: v.optional(
      v.array(
        v.object({
          name: v.string(),
          value: v.string(),
        })
      )
    ),
  },
  handler: async (ctx, args) => {
    const potentialMatches = [];

    // Check by email
    if (args.email) {
      const emailMatch = await ctx.db
        .query("patients")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .first();
      if (emailMatch)
        potentialMatches.push({ patient: emailMatch, matchType: "email" });
    }

    // Check by phone
    if (args.phone) {
      const phoneMatch = await ctx.db
        .query("patients")
        .withIndex("by_phone", (q) => q.eq("phone", args.phone))
        .first();
      if (phoneMatch)
        potentialMatches.push({ patient: phoneMatch, matchType: "phone" });
    }

    // Check by name and additional data (like DOB)
    if (args.name && args.additionalDataToMatch) {
      const allPatients = await ctx.db.query("patients").collect();

      for (const patient of allPatients) {
        if (patient.name === args.name) {
          // Check if any of the additional data matches
          const hasMatchingData = args.additionalDataToMatch.some(
            (searchData) =>
              patient.additionalData?.some(
                (patientData) =>
                  patientData.name.toLowerCase() ===
                    searchData.name.toLowerCase() &&
                  patientData.value === searchData.value
              )
          );

          if (hasMatchingData) {
            potentialMatches.push({
              patient,
              matchType: "name_and_additional_data",
            });
          }
        }
      }
    }

    // Remove duplicates (same patient found by different criteria)
    const uniqueMatches = potentialMatches.filter(
      (match, index, self) =>
        index === self.findIndex((m) => m.patient._id === match.patient._id)
    );

    return uniqueMatches;
  },
});

// Update patient information
export const updatePatient = mutation({
  args: {
    patientId: v.id("patients"),
    updates: v.object({
      name: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      additionalData: v.optional(
        v.array(
          v.object({
            name: v.string(),
            value: v.string(),
            confidence: v.optional(v.number()),
            source: v.optional(v.string()),
            extractedAt: v.optional(v.string()),
          })
        )
      ),
      notes: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.patientId, {
      ...args.updates,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Add or update specific additional data for a patient
export const updatePatientAdditionalData = mutation({
  args: {
    patientId: v.id("patients"),
    dataToAdd: v.array(
      v.object({
        name: v.string(),
        value: v.string(),
        confidence: v.optional(v.number()),
        source: v.optional(v.string()),
        extractedAt: v.optional(v.string()),
      })
    ),
    mergeStrategy: v.optional(v.string()), // "replace", "merge", "append"
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) {
      throw new Error("Patient not found");
    }

    let newAdditionalData = args.dataToAdd;
    const strategy = args.mergeStrategy || "merge";

    if (strategy === "merge" && patient.additionalData) {
      // Merge strategy: update existing fields, add new ones
      const existingData = patient.additionalData;
      const updatedData = [...existingData];

      args.dataToAdd.forEach((newItem) => {
        const existingIndex = updatedData.findIndex(
          (existing) =>
            existing.name.toLowerCase() === newItem.name.toLowerCase()
        );

        if (existingIndex >= 0) {
          // Update existing item
          updatedData[existingIndex] = {
            ...updatedData[existingIndex],
            ...newItem,
            extractedAt: newItem.extractedAt || new Date().toISOString(),
          };
        } else {
          // Add new item
          updatedData.push({
            ...newItem,
            extractedAt: newItem.extractedAt || new Date().toISOString(),
          });
        }
      });

      newAdditionalData = updatedData;
    } else if (strategy === "append" && patient.additionalData) {
      // Append strategy: add all new data to existing
      newAdditionalData = [
        ...patient.additionalData,
        ...args.dataToAdd.map((item) => ({
          ...item,
          extractedAt: item.extractedAt || new Date().toISOString(),
        })),
      ];
    }
    // "replace" strategy uses dataToAdd as-is

    await ctx.db.patch(args.patientId, {
      additionalData: newAdditionalData,
      updatedAt: new Date().toISOString(),
    });
  },
});

// Get patient by ID
export const getPatient = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.patientId);
  },
});

// Get all patients
export const getAllPatients = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("patients")
      .withIndex("by_created")
      .order("desc")
      .collect();
  },
});

// Get patient with their cases
export const getPatientWithCases = query({
  args: {
    patientId: v.id("patients"),
  },
  handler: async (ctx, args) => {
    const patient = await ctx.db.get(args.patientId);
    if (!patient) return null;

    const cases = await ctx.db
      .query("cases")
      .withIndex("by_patient", (q) => q.eq("patientId", args.patientId))
      .order("desc")
      .collect();

    return {
      ...patient,
      cases,
    };
  },
});
