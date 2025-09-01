import { CaseDetails } from "@/components/case-details";
import type { Id } from "../../../../convex/_generated/dataModel";

type PageProps = {
  params: Promise<{
    caseId: string;
  }>;
};

export default async function CaseDetailPage({ params }: PageProps) {
  const resolvedParams = await params;
  return (
    <div className="container mx-auto py-8 px-4">
      <CaseDetails caseId={resolvedParams.caseId as Id<"cases">} />
    </div>
  );
}
