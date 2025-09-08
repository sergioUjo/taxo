'use client';

import Link from 'next/link';

import { useQuery } from 'convex/react';
import { FileText, Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { CaseStatusCell } from './case-status-cell';
import { RulesStatusCell } from './rules-status-cell';

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
            <Link href='/referral'>Create Referral</Link>
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
          <Link href='/referral'>
            <Plus className='mr-2 h-4 w-4' />
            Create Referral
          </Link>
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Provider</TableHead>
              <TableHead>Case Status</TableHead>
              <TableHead>Rules Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cases.map((caseItem) => (
              <TableRow
                key={caseItem._id}
                className='cursor-pointer'
                onClick={() =>
                  (window.location.href = `/cases/${caseItem._id}`)
                }
              >
                <TableCell>
                  <span className='text-sm font-medium'>
                    {caseItem._id.slice(-6)}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='text-sm font-medium'>
                    {caseItem.patient?.name || 'Unknown Patient'}
                  </span>
                </TableCell>
                <TableCell>
                  <span className='text-muted-foreground text-sm'>
                    {caseItem.provider || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  <CaseStatusCell
                    status={caseItem.status}
                    eligibilityStatus={caseItem.eligibilityStatus}
                  />
                </TableCell>
                <TableCell>
                  <RulesStatusCell caseId={caseItem._id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
