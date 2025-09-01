"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import type { Id } from "../../convex/_generated/dataModel";

type DocumentDownloadProps = {
  storageId?: Id<"_storage">;
  fileUrl?: string;
  fileName: string;
};

export function DocumentDownload({
  storageId,
  fileUrl,
  fileName,
}: DocumentDownloadProps) {
  const convexFileUrl = useQuery(
    api.cases.getFileUrl,
    storageId ? { storageId } : "skip"
  );

  const downloadUrl = storageId ? convexFileUrl : fileUrl;

  if (!downloadUrl) {
    return (
      <Button size="icon" variant="ghost" disabled>
        <Download className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <a
      href={downloadUrl}
      target="_blank"
      rel="noopener noreferrer"
      download={fileName}
    >
      <Button size="icon" variant="ghost">
        <Download className="h-4 w-4" />
      </Button>
    </a>
  );
}
