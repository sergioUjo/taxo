"use client";

import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Clock, User, Calendar, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import type { Id } from "../../convex/_generated/dataModel";

function getStatusVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "new":
      return "secondary";
    case "processing":
      return "outline";
    case "pending-info":
      return "outline";
    case "eligible":
      return "default";
    case "scheduled":
      return "default";
    case "completed":
      return "secondary";
    default:
      return "default";
  }
}

function getPriorityVariant(
  priority: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (priority) {
    case "low":
      return "secondary";
    case "medium":
      return "default";
    case "high":
      return "outline";
    case "urgent":
      return "destructive";
    default:
      return "default";
  }
}

export function CasesDashboard() {
  const cases = useQuery(api.cases.getAllCases, {});

  if (!cases) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Loading cases...</p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by creating your first referral case
          </p>
          <Button asChild>
            <Link href="/new-referral">Create New Referral</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">Cases Dashboard</h2>
          <p className="text-muted-foreground">
            {cases.length} total {cases.length === 1 ? "case" : "cases"}
          </p>
        </div>
        <Button asChild>
          <Link href="/new-referral">Create New Referral</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {cases.map((caseItem) => (
          <Card
            key={caseItem._id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      Case #{caseItem._id.slice(-6)}
                    </CardTitle>
                    <Badge variant={getStatusVariant(caseItem.status)}>
                      {caseItem.status.replace("-", " ").toUpperCase()}
                    </Badge>
                    <Badge
                      variant={getPriorityVariant(
                        caseItem.priority || "medium"
                      )}
                    >
                      {(caseItem.priority || "medium").toUpperCase()}
                    </Badge>
                  </div>
                  <CardDescription>
                    Source: {caseItem.referralSource.replace("-", " ")}
                  </CardDescription>
                </div>
                <Link href={`/cases/${caseItem._id}`}>
                  <Button variant="ghost" size="icon">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {caseItem.patient?.name && (
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{caseItem.patient.name}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(caseItem.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                {caseItem.appointmentDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(
                        new Date(caseItem.appointmentDate),
                        "MMM d, yyyy"
                      )}
                    </span>
                  </div>
                )}
                {caseItem.eligibilityStatus && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Insurance:</span>
                    <Badge
                      variant={
                        caseItem.eligibilityStatus === "eligible"
                          ? "default"
                          : caseItem.eligibilityStatus === "not-eligible"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {caseItem.eligibilityStatus.replace("-", " ")}
                    </Badge>
                  </div>
                )}
              </div>
              {caseItem.patient && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium">Patient:</span>{" "}
                  {caseItem.patient.name}
                  {caseItem.patient.email && ` • ${caseItem.patient.email}`}
                  {caseItem.patient.phone && ` • ${caseItem.patient.phone}`}
                  {/* Show key additional data */}
                  {caseItem.patient.additionalData?.find((data) =>
                    data.name.toLowerCase().includes("date of birth")
                  )?.value &&
                    ` • DOB: ${
                      caseItem.patient.additionalData.find((data) =>
                        data.name.toLowerCase().includes("date of birth")
                      )?.value
                    }`}
                </div>
              )}
              {caseItem.notes && (
                <div className="mt-4 text-sm text-muted-foreground">
                  <span className="font-medium">Notes:</span> {caseItem.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
