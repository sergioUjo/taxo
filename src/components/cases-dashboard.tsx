'use client';

import Link from 'next/link';

import { useQuery } from 'convex/react';
import { format } from 'date-fns';
import { Edit2, FileText, Plus } from 'lucide-react';

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

function getPatientDOB(patient: any): string {
  if (!patient?.additionalData) return '';
  const dobData = patient.additionalData.find(
    (data: any) =>
      data.name.toLowerCase().includes('date of birth') ||
      data.name.toLowerCase().includes('dob')
  );
  return dobData?.value || '';
}

function getPatientGender(patient: any): string {
  if (!patient?.additionalData) return '';
  const genderData = patient.additionalData.find(
    (data: any) =>
      data.name.toLowerCase().includes('gender') ||
      data.name.toLowerCase().includes('sex')
  );
  return genderData?.value || '';
}

function getInsuranceProvider(patient: any): string {
  if (!patient?.additionalData) return '';
  const insuranceData = patient.additionalData.find(
    (data: any) =>
      data.name.toLowerCase().includes('insurance') ||
      data.name.toLowerCase().includes('provider')
  );
  return insuranceData?.value || '';
}

export function CasesDashboard() {
  const cases = useQuery(api.cases.getAllCases, {});

  if (!cases) {
    return (
      <div className='flex min-h-[400px] items-center justify-center'>
        <p className='text-muted-foreground'>Loading cases...</p>
      </div>
    );
  }

  if (cases.length === 0) {
    return (
      <Card>
        <CardContent className='flex flex-col items-center justify-center py-12'>
          <FileText className='text-muted-foreground mb-4 h-12 w-12' />
          <h3 className='mb-2 text-lg font-semibold'>No cases yet</h3>
          <p className='text-muted-foreground mb-4 text-center'>
            Get started by creating your first referral case
          </p>
          <Button asChild>
            <Link href='/new-referral'>Create New Referral</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold'>Cases Dashboard</h2>
          <p className='text-muted-foreground'>
            {cases.length} total {cases.length === 1 ? 'case' : 'cases'}
          </p>
        </div>
        <Button asChild>
          <Link href='/new-referral'>
            <Plus className='mr-2 h-4 w-4' />
            Create New Referral
          </Link>
        </Button>
      </div>

      <Card>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-border/40 border-b'>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  ID
                </th>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  Name
                </th>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  DOB
                </th>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  Gender
                </th>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  Provider
                </th>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  Insurer
                </th>
                <th className='text-muted-foreground px-4 py-3 text-left text-sm font-medium'>
                  Prior Authorizations
                </th>
                <th className='text-muted-foreground px-4 py-3 text-center text-sm font-medium'>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {cases.map((caseItem, index) => (
                <tr
                  key={caseItem._id}
                  className={`border-border/20 hover:bg-muted/30 border-b transition-colors ${
                    index % 2 === 0 ? 'bg-background' : 'bg-muted/10'
                  }`}
                >
                  <td className='px-4 py-3'>
                    <span className='text-sm font-medium'>
                      {caseItem._id.slice(-6)}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-sm font-medium'>
                      {caseItem.patient?.name || 'Unknown Patient'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-muted-foreground text-sm'>
                      {getPatientDOB(caseItem.patient) || '—'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-muted-foreground text-sm'>
                      {getPatientGender(caseItem.patient) || '—'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-muted-foreground text-sm'>
                      {caseItem.provider || '—'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <span className='text-muted-foreground text-sm'>
                      {getInsuranceProvider(caseItem.patient) || '—'}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex flex-wrap gap-1'>
                      <Badge
                        variant={getStatusVariant(caseItem.status)}
                        className='text-xs'
                      >
                        {caseItem.status.replace('-', ' ')}
                      </Badge>
                      {caseItem.eligibilityStatus && (
                        <Badge
                          variant={
                            caseItem.eligibilityStatus === 'eligible'
                              ? 'default'
                              : caseItem.eligibilityStatus === 'not-eligible'
                                ? 'destructive'
                                : 'secondary'
                          }
                          className='text-xs'
                        >
                          {caseItem.eligibilityStatus.replace('-', ' ')}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center justify-center gap-1'>
                      <Button
                        variant='ghost'
                        size='sm'
                        className='h-8 w-8 p-0'
                        asChild
                      >
                        <Link href={`/cases/${caseItem._id}`}>
                          <Edit2 className='h-3 w-3' />
                          <span className='sr-only'>Edit case</span>
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
