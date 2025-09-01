"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { useMutation } from "convex/react";
import { CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

type UploadedFile = {
  storageId: Id<"_storage">;
  fileName: string;
  fileSize: number;
  fileType: string;
};

export function NewReferralForm() {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdCaseId, setCreatedCaseId] = useState<Id<"cases"> | null>(null);
  const [uploadError, setUploadError] = useState<string>("");

  const createCaseWithPatientProcessing = useMutation(
    api.cases.createCaseWithPatientProcessing
  );
  const scheduleDocumentProcessing = useMutation(
    api.cases.scheduleDocumentProcessing
  );
  const addDocumentToCase = useMutation(api.cases.addDocumentToCase);
  addDocumentToCase;
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create the case (patient processing will happen in the background via agents)
      const result = await createCaseWithPatientProcessing({
        referralSource: "web-form",
      });

      const caseId = result.caseId;

      // Add all uploaded documents to the case
      for (const file of uploadedFiles) {
        await addDocumentToCase({
          caseId,
          fileName: file.fileName,
          storageId: file.storageId,
          fileType: file.fileType,
          fileSize: file.fileSize,
        });
      }
      await scheduleDocumentProcessing({
        caseId,
      });
      setCreatedCaseId(caseId);
      // Navigate to cases dashboard after a short delay
      setTimeout(() => {
        router.push("/cases");
      }, 2000);
    } catch (error) {
      console.error("Error creating case:", error);
      setIsSubmitting(false);
    }
  };

  if (createdCaseId) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center space-y-4 py-8">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <h3 className="text-2xl font-semibold">
              Case Created Successfully!
            </h3>
            <p className="text-muted-foreground">
              Patient information will be extracted from your documents
              automatically. Redirecting to cases dashboard...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create New Referral Case</CardTitle>
        <CardDescription>
          Upload referral documents and create a new case for processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Upload Documents</Label>
          <FileUpload
            onFilesUploaded={setUploadedFiles}
            onUploadError={setUploadError}
            disabled={isSubmitting}
          />
          {uploadError && (
            <p className="text-sm text-destructive">{uploadError}</p>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || uploadedFiles.length === 0}
          className="w-full"
        >
          {isSubmitting ? "Creating Case..." : "Create Case"}
        </Button>
      </CardContent>
    </Card>
  );
}
