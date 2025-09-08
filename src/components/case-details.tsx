'use client';

import Link from 'next/link';

import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import {
  Activity,
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  Mail,
  Phone,
  User,
} from 'lucide-react';

import { CaseClassification } from '@/components/case-classification';
import { DocumentDownload } from '@/components/document-download';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { CaseStatusCell } from './case-status-cell';

export function CaseDetails({ caseId }: { caseId: Id<'cases'> }) {
  const caseData = useQuery(api.cases.getCaseWithDocuments, { caseId });

  if (!caseData) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <p className='text-muted-foreground'>Loading case details...</p>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      <div className='mb-6 flex items-center gap-4'>
        <Link href='/cases'>
          <Button variant='ghost' size='icon'>
            <ArrowLeft className='h-4 w-4' />
          </Button>
        </Link>
        <div className='flex-1'>
          <h1 className='text-3xl font-bold'>Case #{caseData._id.slice(-6)}</h1>
          <p className='text-muted-foreground'>
            Created{' '}
            {format(new Date(caseData.createdAt), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </div>
        <CaseStatusCell status={caseData.status} />
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {caseData.patient ? (
              <>
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-3 w-3' />
                    <div>
                      <p className='text-muted-foreground text-xs'>Name</p>
                      <p className='text-sm font-medium'>
                        {caseData.patient.name}
                      </p>
                    </div>
                  </div>
                  {caseData.patient.email && (
                    <div className='flex items-center gap-2'>
                      <Mail className='text-muted-foreground h-3 w-3' />
                      <div>
                        <p className='text-muted-foreground text-xs'>Email</p>
                        <p className='text-sm font-medium'>
                          {caseData.patient.email}
                        </p>
                      </div>
                    </div>
                  )}
                  {caseData.patient.phone && (
                    <div className='flex items-center gap-2'>
                      <Phone className='text-muted-foreground h-3 w-3' />
                      <div>
                        <p className='text-muted-foreground text-xs'>Phone</p>
                        <p className='text-sm font-medium'>
                          {caseData.patient.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Additional Patient Data */}
                {caseData.patient.additionalData &&
                  caseData.patient.additionalData.length > 0 && (
                    <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                      {caseData.patient.additionalData
                        .filter((data) => data.name && data.value) // Only show non-empty data
                        .slice(0, 8) // Limit to first 8 items to avoid clutter
                        .map((data, index) => (
                          <div key={index} className='flex items-start gap-2'>
                            {data.name.toLowerCase().includes('date') && (
                              <Calendar className='text-muted-foreground mt-0.5 h-3 w-3' />
                            )}
                            {data.name.toLowerCase().includes('phone') && (
                              <Phone className='text-muted-foreground mt-0.5 h-3 w-3' />
                            )}
                            {data.name.toLowerCase().includes('email') && (
                              <Mail className='text-muted-foreground mt-0.5 h-3 w-3' />
                            )}
                            {data.name.toLowerCase().includes('insurance') && (
                              <CreditCard className='text-muted-foreground mt-0.5 h-3 w-3' />
                            )}
                            <div className='flex-1'>
                              <p className='text-muted-foreground text-xs'>
                                {data.name}
                              </p>
                              <p className='text-sm font-medium'>
                                {data.value}
                              </p>
                              {data.confidence && data.confidence < 0.8 && (
                                <p className='text-[10px] text-yellow-600'>
                                  Confidence:{' '}
                                  {Math.round(data.confidence * 100)}%
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
              </>
            ) : (
              <p className='text-muted-foreground'>
                Patient information not yet extracted from documents
              </p>
            )}
          </CardContent>
        </Card>

        {/* Insurance Information */}
        <Card>
          <CardHeader>
            <CardTitle>Insurance Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            {caseData.patient?.additionalData?.some((data) =>
              data.name.toLowerCase().includes('insurance')
            ) ? (
              <>
                {/* Insurance Information from Additional Data */}
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2'>
                  {caseData.patient.additionalData
                    .filter((data) =>
                      data.name.toLowerCase().includes('insurance')
                    )
                    .map((data, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <CreditCard className='text-muted-foreground h-3 w-3' />
                        <div>
                          <p className='text-muted-foreground text-xs'>
                            {data.name}
                          </p>
                          <p className='text-sm font-medium'>{data.value}</p>
                          {data.confidence && data.confidence < 0.8 && (
                            <p className='text-[10px] text-yellow-600'>
                              Confidence: {Math.round(data.confidence * 100)}%
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>

                {/* Case-level eligibility status */}
                {caseData.eligibilityStatus && (
                  <div>
                    <p className='text-muted-foreground text-xs'>
                      Eligibility Status
                    </p>
                    <Badge
                      variant={
                        caseData.eligibilityStatus === 'eligible'
                          ? 'default'
                          : caseData.eligibilityStatus === 'not-eligible'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {caseData.eligibilityStatus
                        .replace('-', ' ')
                        .toUpperCase()}
                    </Badge>
                  </div>
                )}
              </>
            ) : (
              <p className='text-muted-foreground'>
                Insurance information not yet extracted from documents
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Case Classification */}
      <CaseClassification caseId={caseId} />
      {/* Documents */}
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            {caseData.documents.length} document
            {caseData.documents.length !== 1 ? 's' : ''} uploaded
          </CardDescription>
        </CardHeader>
        <CardContent>
          {caseData.documents.length > 0 ? (
            <div className='space-y-2'>
              {caseData.documents.map((doc) => (
                <div
                  key={doc._id}
                  className='flex items-center justify-between rounded-lg border p-3'
                >
                  <div className='flex items-center gap-3'>
                    <FileText className='text-muted-foreground h-5 w-5' />
                    <div>
                      <p className='font-medium'>{doc.fileName}</p>
                      <p className='text-muted-foreground text-sm'>
                        {(doc.fileSize / 1024 / 1024).toFixed(2)} MB •{' '}
                        {doc.fileType} • Uploaded{' '}
                        {format(new Date(doc.uploadedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Badge
                      variant={
                        doc.status === 'processed' ? 'default' : 'secondary'
                      }
                    >
                      {doc.status}
                    </Badge>
                    <DocumentDownload
                      storageId={doc.storageId}
                      fileUrl={doc.fileUrl}
                      fileName={doc.fileName}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className='text-muted-foreground'>No documents uploaded</p>
          )}
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
          <CardDescription>
            Complete history of all actions taken on this case
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-4'>
            {caseData.activityLogs.map((log) => (
              <div key={log._id} className='flex gap-3'>
                <div className='mt-0.5'>
                  <Activity className='text-muted-foreground h-4 w-4' />
                </div>
                <div className='flex-1'>
                  <p className='text-sm font-medium'>
                    {log.action.replace('_', ' ')}
                  </p>
                  {log.details && (
                    <p className='text-muted-foreground text-sm'>
                      {log.details}
                    </p>
                  )}
                  <p className='text-muted-foreground mt-1 text-xs'>
                    {format(new Date(log.timestamp), "MMM d, yyyy 'at' h:mm a")}{' '}
                    • by {log.performedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
