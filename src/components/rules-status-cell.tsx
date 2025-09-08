'use client';

import { useQuery } from 'convex/react';

import { Badge } from '@/components/ui/badge';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';

interface RulesStatusCellProps {
  caseId: Id<'cases'>;
}

export function RulesStatusCell({ caseId }: RulesStatusCellProps) {
  const classification = useQuery(
    api.case_classifications.getCaseClassificationWithRuleChecks,
    { caseId }
  );

  if (!classification?.ruleChecks) {
    return <span className='text-sm font-medium'>—</span>;
  }

  const total = classification.ruleChecks.length;
  const passed = classification.ruleChecks.filter(
    (check: any) => check.status === 'valid'
  ).length;

  const statuses = classification.ruleChecks.map((check: any) => check.status);
  const hasDeny = statuses.includes('deny');
  const allValid = total > 0 && statuses.every((s: string) => s === 'valid');

  if (hasDeny) {
    return (
      <Badge className='border-red-500 bg-red-500 text-xs text-white'>
        Denied
      </Badge>
    );
  }

  if (allValid) {
    return (
      <Badge className='border-green-500 bg-green-500 text-xs text-white'>
        Valid
      </Badge>
    );
  }

  return (
    <span className='text-sm font-medium'>
      {passed}/{total}
    </span>
  );
}
