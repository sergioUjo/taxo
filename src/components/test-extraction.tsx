"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function TestExtraction() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const processDocumentDirectly = useMutation(
    api.processDocumentDirect.processDocumentDirectly
  );

  const handleTest = async () => {
    setIsProcessing(true);
    setResult(null);

    try {
      // Test with mock data - you'd normally have actual case and document IDs
      const testResult = await processDocumentDirectly({
        caseId: "test-case-id" as any, // This would be a real case ID
        documentId: "test-doc-id" as any, // This would be a real document ID
        documentPath: "test-path", // This would be a real storage path
      });

      setResult(testResult);
    } catch (error) {
      setResult({ error: error.message });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Test LangChain Patient Extraction</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTest} disabled={isProcessing} className="w-full">
          {isProcessing ? "Processing..." : "Test Patient Extraction"}
        </Button>

        {result && (
          <div className="p-4 bg-gray-50 rounded">
            <h3 className="font-semibold mb-2">Result:</h3>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
