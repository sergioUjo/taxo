import { v } from 'convex/values';

import { api } from './_generated/api';
import { Id } from './_generated/dataModel';
import { action } from './_generated/server';

// Call Next.js API endpoint (which redirects to FastAPI in development)
async function extractPatientFromPDF(caseId: string) {
  console.log(`Extracting patient data from: ${caseId}`);

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
        case_id: caseId,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `FastAPI request failed: ${response.status} ${response.statusText}`
      );
    }

    return 'result';
  } catch (error) {
    console.error('Error calling FastAPI endpoint:', error);
    throw error;
  }
}

// Direct document processing action
export const processDocumentDirectly = action({
  args: {
    caseId: v.id('cases'),
  },
  handler: async (ctx, args) => {
    try {
      await extractPatientFromPDF(args.caseId);
      return '';
    } catch (error) {
      console.error('Direct document processing failed:', error);

      throw error;
    }
  },
});
