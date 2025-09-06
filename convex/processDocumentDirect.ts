import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action } from './_generated/server';

// Call Next.js API endpoint (which redirects to FastAPI in development)
async function extractPatientFromPDF(pdfUrl: string, caseId: string) {
  console.log(`Extracting patient data from: ${pdfUrl}`);

  // Get the app URL from environment variables
  const appUrl = process.env.APP_URL;
  const apiEndpoint = `${appUrl}/api/process-pdf`;

  console.log(`Making request to: ${apiEndpoint}`);

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdf_path: pdfUrl,
        case_id: caseId,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `FastAPI request failed: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log('FastAPI response:', result);

    return result;
  } catch (error) {
    console.error('Error calling FastAPI endpoint:', error);
    throw error;
  }
}

// Direct document processing action
export const processDocumentDirectly = action({
  args: {
    caseId: v.id('cases'),
    documentId: v.id('documents'),
    documentPath: v.string(), // Storage ID for the document
  },
  handler: async (ctx, args) => {
    try {
      console.log(
        `Processing document directly: ${args.documentId}`,
        args.documentPath,
        args.caseId
      );

      // Get the document URL from storage
      const documentUrl = await ctx.storage.getUrl(args.documentPath);
      if (!documentUrl) {
        throw new Error('Could not get document URL from storage');
      }

      // Extract patient data directly
      let patientData: {
        name?: string;
        email?: string;
        phone?: string;
        additionalData?: { name: string; value: string }[];
      } = await extractPatientFromPDF(documentUrl, args.caseId);

      if (!patientData.email) {
        delete patientData.email;
      }
      if (!patientData.phone) {
        delete patientData.phone;
      }
      if (!patientData.name) {
        delete patientData.name;
      }
      console.log('Extracted patient data:', patientData);

      const patientId: Id<'patients'> = await ctx.runMutation(
        api.patients.createPatient,
        patientData as any
      );
      await ctx.runMutation(api.cases.updateCase, {
        caseId: args.caseId,
        updates: {
          patientId: patientId,
        },
      });

      return {
        success: true,
        patientId,
        extractedData: patientData,
      };
    } catch (error) {
      console.error('Direct document processing failed:', error);

      throw error;
    }
  },
});
