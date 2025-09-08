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
  const updateRuleCheck = useMutation(api.cases.updateRuleCheck);
  const removeRuleCheck = useMutation(api.cases.removeRuleCheck);

  const handleUpdateRuleStatus = async (
    ruleCheckId: Id<'ruleChecks'>,
    status: string,
    notes?: string
  ) => {
    try {
      // Find the rule check to get its title
      const ruleCheck = classificationData?.ruleChecks?.find(
        (rc) => rc._id === ruleCheckId
      );
      if (!ruleCheck) return;

      await updateRuleCheck({
        caseId,
        ruleTitle: ruleCheck.ruleTitle,
        status,
        reasoning: notes || '',
        requiredAdditionalInfo: [],
      });
    } catch (error) {
      console.error('Error updating rule check:', error);
    }
  };

  const handleRemoveRuleCheck = async (ruleCheckId: Id<'ruleChecks'>) => {
    try {
      await removeRuleCheck({
        ruleCheckId,
        caseId,
      });
      // The UI will automatically update since we're using queries
    } catch (error) {
      console.error('Error removing rule check:', error);
      throw error; // Re-throw to let the component handle it
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
          <div className='space-y-4'>
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
          </div>
        )}

        {/* Rule Checks */}
        {classificationData &&
          classificationData.ruleChecks &&
          classificationData.ruleChecks.length > 0 && (
            <div className='mt-6'>
              <div className='mb-4 flex items-center justify-between'>
                <h4 className='font-semibold'>Rule Checks</h4>
                <div className='text-muted-foreground flex gap-2 text-xs'>
                  <span>Total: {classificationData.ruleChecks.length}</span>
                  <span>•</span>
                  <span>
                    Valid:{' '}
                    {
                      classificationData.ruleChecks.filter(
                        (rc) => rc.status === 'valid'
                      ).length
                    }
                  </span>
                  <span>•</span>
                  <span>
                    Pending:{' '}
                    {
                      classificationData.ruleChecks.filter(
                        (rc) => rc.status === 'pending'
                      ).length
                    }
                  </span>
                  <span>•</span>
                  <span>
                    Needs Info:{' '}
                    {
                      classificationData.ruleChecks.filter(
                        (rc) => rc.status === 'needs_more_information'
                      ).length
                    }
                  </span>
                  <span>•</span>
                  <span>
                    Denied:{' '}
                    {
                      classificationData.ruleChecks.filter(
                        (rc) => rc.status === 'deny'
                      ).length
                    }
                  </span>
                </div>
              </div>
              <div className='divide-y rounded-lg border'>
                {classificationData.ruleChecks.map((ruleCheck) => (
                  <RuleCheckItem
                    key={ruleCheck._id}
                    ruleCheck={ruleCheck}
                    onUpdateStatus={handleUpdateRuleStatus}
                    onRemoveRuleCheck={handleRemoveRuleCheck}
                  />
                ))}
              </div>
            </div>
          )}
      </CardContent>
    </Card>
  );
}
