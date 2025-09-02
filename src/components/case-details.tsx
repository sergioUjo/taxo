'use client';

import Link from 'next/link';

import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Clock,
  CreditCard,
  FileText,
  Mail,
  Phone,
  User,
} from 'lucide-react';

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

function getStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'new':
      return 'secondary';
    case 'processing':
      return 'outline';
    case 'pending-info':
      return 'outline';
    case 'eligible':
      return 'default';
    case 'scheduled':
      return 'default';
    case 'completed':
      return 'secondary';
    default:
      return 'default';
  }
}

function getPriorityVariant(
  priority: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (priority) {
    case 'low':
      return 'secondary';
    case 'medium':
      return 'default';
    case 'high':
      return 'outline';
    case 'urgent':
      return 'destructive';
    default:
      return 'default';
  }
}

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
        <Badge variant={getStatusVariant(caseData.status)}>
          {caseData.status.replace('-', ' ').toUpperCase()}
        </Badge>
        <Badge variant={getPriorityVariant(caseData.priority || 'medium')}>
          {(caseData.priority || 'medium').toUpperCase()} PRIORITY
        </Badge>
      </div>

      <div className='grid gap-6 md:grid-cols-2'>
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div>
              <p className='text-muted-foreground text-sm'>Referral Source</p>
              <p className='font-medium'>
                {caseData.referralSource.replace('-', ' ')}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Last Updated</p>
              <p className='font-medium'>
                {format(
                  new Date(caseData.updatedAt),
                  "MMMM d, yyyy 'at' h:mm a"
                )}
              </p>
            </div>
            {caseData.notes && (
              <div>
                <p className='text-muted-foreground text-sm'>Notes</p>
                <p className='font-medium'>{caseData.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Patient Information */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {caseData.patient ? (
              <>
                <div className='flex items-center gap-2'>
                  <User className='text-muted-foreground h-4 w-4' />
                  <div>
                    <p className='text-muted-foreground text-sm'>Name</p>
                    <p className='font-medium'>{caseData.patient.name}</p>
                  </div>
                </div>
                {caseData.patient.email && (
                  <div className='flex items-center gap-2'>
                    <Mail className='text-muted-foreground h-4 w-4' />
                    <div>
                      <p className='text-muted-foreground text-sm'>Email</p>
                      <p className='font-medium'>{caseData.patient.email}</p>
                    </div>
                  </div>
                )}
                {caseData.patient.phone && (
                  <div className='flex items-center gap-2'>
                    <Phone className='text-muted-foreground h-4 w-4' />
                    <div>
                      <p className='text-muted-foreground text-sm'>Phone</p>
                      <p className='font-medium'>{caseData.patient.phone}</p>
                    </div>
                  </div>
                )}
                {/* Additional Patient Data */}
                {caseData.patient.additionalData &&
                  caseData.patient.additionalData.length > 0 && (
                    <div className='space-y-3'>
                      {caseData.patient.additionalData
                        .filter((data) => data.name && data.value) // Only show non-empty data
                        .slice(0, 8) // Limit to first 8 items to avoid clutter
                        .map((data, index) => (
                          <div key={index} className='flex items-start gap-2'>
                            {data.name.toLowerCase().includes('date') && (
                              <Calendar className='text-muted-foreground mt-0.5 h-4 w-4' />
                            )}
                            {data.name.toLowerCase().includes('phone') && (
                              <Phone className='text-muted-foreground mt-0.5 h-4 w-4' />
                            )}
                            {data.name.toLowerCase().includes('email') && (
                              <Mail className='text-muted-foreground mt-0.5 h-4 w-4' />
                            )}
                            {data.name.toLowerCase().includes('insurance') && (
                              <CreditCard className='text-muted-foreground mt-0.5 h-4 w-4' />
                            )}
                            <div className='flex-1'>
                              <p className='text-muted-foreground text-sm'>
                                {data.name}
                              </p>
                              <p className='font-medium'>{data.value}</p>
                              {data.confidence && data.confidence < 0.8 && (
                                <p className='text-xs text-yellow-600'>
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
          <CardContent className='space-y-4'>
            {caseData.patient?.additionalData?.some((data) =>
              data.name.toLowerCase().includes('insurance')
            ) ? (
              <>
                {/* Insurance Information from Additional Data */}
                <div className='space-y-3'>
                  {caseData.patient.additionalData
                    .filter((data) =>
                      data.name.toLowerCase().includes('insurance')
                    )
                    .map((data, index) => (
                      <div key={index} className='flex items-center gap-2'>
                        <CreditCard className='text-muted-foreground h-4 w-4' />
                        <div>
                          <p className='text-muted-foreground text-sm'>
                            {data.name}
                          </p>
                          <p className='font-medium'>{data.value}</p>
                          {data.confidence && data.confidence < 0.8 && (
                            <p className='text-xs text-yellow-600'>
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
                    <p className='text-muted-foreground text-sm'>
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

        {/* Appointment Information */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Information</CardTitle>
          </CardHeader>
          <CardContent className='space-y-4'>
            {caseData.appointmentDate ? (
              <>
                <div className='flex items-center gap-2'>
                  <Calendar className='text-muted-foreground h-4 w-4' />
                  <div>
                    <p className='text-muted-foreground text-sm'>Date</p>
                    <p className='font-medium'>
                      {format(
                        new Date(caseData.appointmentDate),
                        'MMMM d, yyyy'
                      )}
                    </p>
                  </div>
                </div>
                {caseData.appointmentTime && (
                  <div className='flex items-center gap-2'>
                    <Clock className='text-muted-foreground h-4 w-4' />
                    <div>
                      <p className='text-muted-foreground text-sm'>Time</p>
                      <p className='font-medium'>{caseData.appointmentTime}</p>
                    </div>
                  </div>
                )}
                {caseData.provider && (
                  <div className='flex items-center gap-2'>
                    <User className='text-muted-foreground h-4 w-4' />
                    <div>
                      <p className='text-muted-foreground text-sm'>Provider</p>
                      <p className='font-medium'>{caseData.provider}</p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <p className='text-muted-foreground'>
                No appointment scheduled yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

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
