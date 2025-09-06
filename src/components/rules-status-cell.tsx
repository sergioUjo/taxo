'use client';

import { useQuery } from 'convex/react';

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
    (check: any) => check.status === 'passed'
  ).length;

  return (
    <span className='text-sm font-medium'>
      {passed}/{total}
    </span>
  );
}
