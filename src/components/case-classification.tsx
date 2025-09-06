'use client';

import { useMutation, useQuery } from 'convex/react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { api } from '../../convex/_generated/api';
import type { Id } from '../../convex/_generated/dataModel';
import { ClassificationDialog } from './classification-dialog';
import { RuleCheckItem } from './rule-check-item';

type CaseClassificationProps = {
  caseId: Id<'cases'>;
};

export function CaseClassification({ caseId }: CaseClassificationProps) {
  // Queries
  const classificationData = useQuery(
    api.case_classifications.getCaseClassificationWithRuleChecks,
    { caseId }
  );

  // Mutations
  const updateRuleStatus = useMutation(
    api.case_classifications.updateRuleCheckStatus
  );

  const handleUpdateRuleStatus = async (
    ruleCheckId: Id<'ruleChecks'>,
    status: string,
    notes?: string
  ) => {
    try {
      await updateRuleStatus({
        ruleCheckId,
        status,
        notes,
        checkedBy: 'user', // In a real app, this would be the current user
      });
    } catch (error) {
      console.error('Error updating rule status:', error);
    }
  };

  if (classificationData === undefined) {
    return (
      <div className='flex min-h-[200px] items-center justify-center'>
        <p className='text-muted-foreground'>Loading classification data...</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle>Current Classification</CardTitle>

          <ClassificationDialog
            caseId={caseId}
            hasExistingClassification={!!classificationData}
          />
        </div>
        <CardDescription>Case classification and rule checks</CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {classificationData && (
          <div className='grid gap-2 md:grid-cols-3'>
            <div>
              <p className='text-muted-foreground text-sm'>Specialty</p>
              <p className='font-medium'>
                {classificationData.specialty?.name}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Treatment Type</p>
              <p className='font-medium'>
                {classificationData.treatmentType?.name}
              </p>
            </div>
            <div>
              <p className='text-muted-foreground text-sm'>Procedure</p>
              <p className='font-medium'>
                {classificationData.procedure?.name}
              </p>
            </div>
          </div>
        )}

        {/* Rule Checks */}
        {classificationData &&
          classificationData.ruleChecks &&
          classificationData.ruleChecks.length > 0 && (
            <div className='mt-6'>
              <h4 className='mb-4 font-semibold'>Rule Checks</h4>
              <div className='divide-y rounded-lg border'>
                {classificationData.ruleChecks.map((ruleCheck) => (
                  <RuleCheckItem
                    key={ruleCheck._id}
                    ruleCheck={ruleCheck}
                    onUpdateStatus={handleUpdateRuleStatus}
                  />
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
