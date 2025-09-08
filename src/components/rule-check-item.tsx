'use client';

import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

import type { Id } from '../../convex/_generated/dataModel';

type RuleCheckItemProps = {
  ruleCheck: any; // The rule check with rule details
  onUpdateStatus: (
    ruleCheckId: Id<'ruleChecks'>,
    status: string,
    notes?: string
  ) => void;
};

function getRuleStatusVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'valid':
      return 'default';
    case 'needs_more_information':
      return 'outline';
    case 'deny':
      return 'destructive';
    case 'pending':
      return 'secondary';
    default:
      return 'secondary';
  }
}

function getBadgeClass(status: string): string {
  switch (status) {
    case 'valid':
      return 'bg-green-500 text-white border-green-500';
    case 'needs_more_information':
      return 'bg-amber-500 text-white border-amber-500';
    case 'deny':
      return 'bg-red-500 text-white border-red-500';
    case 'pending':
      return 'bg-blue-500 text-white border-blue-500 animate-pulse';
    default:
      return '';
  }
}

export function RuleCheckItem({
  ruleCheck,
  onUpdateStatus,
}: RuleCheckItemProps) {
  const [notes, setNotes] = useState(ruleCheck.notes || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(ruleCheck._id, newStatus, notes);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div>
      {/* Compact Header */}
      <div
        className='hover:bg-muted/50 flex cursor-pointer items-center justify-between px-2 py-1'
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className='min-w-0 flex-1'>
          <h5 className='truncate text-sm font-medium'>
            {ruleCheck.rule?.title}
          </h5>
          <p className='text-muted-foreground mt-1 line-clamp-2 text-xs'>
            {ruleCheck.rule?.description}
          </p>
        </div>
        <div className='ml-3 flex items-center gap-2'>
          <Badge
            variant={getRuleStatusVariant(ruleCheck.status)}
            className={`text-xs ${getBadgeClass(ruleCheck.status)}`}
          >
            {ruleCheck.status.replace('_', ' ').toUpperCase()}
          </Badge>
          <svg
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M19 9l-7 7-7-7'
            />
          </svg>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className='space-y-3 border-t p-3'>
          {/* Rule Description */}

          {/* AI Reasoning (if processed by AI) */}
          {ruleCheck.reasoning && (
            <div>
              <label className='text-sm font-medium'>Reasoning</label>
              <p className='text-muted-foreground bg-muted mt-1 rounded p-2 text-sm'>
                {ruleCheck.reasoning}
              </p>
            </div>
          )}

          {/* Required Additional Information */}
          {ruleCheck.requiredAdditionalInfo &&
            ruleCheck.requiredAdditionalInfo.length > 0 && (
              <div>
                <label className='text-sm font-medium'>
                  Required Additional Information
                </label>
                <ul className='text-muted-foreground mt-1 space-y-1 text-sm'>
                  {ruleCheck.requiredAdditionalInfo.map(
                    (info: string, index: number) => (
                      <li key={index} className='flex items-start gap-2'>
                        <span className='mt-0.5 text-blue-500'>•</span>
                        {info}
                      </li>
                    )
                  )}
                </ul>
              </div>
            )}

          {/* Processing Information */}
          <div className='text-muted-foreground grid grid-cols-2 gap-4 text-xs'>
            {ruleCheck.checkedBy && (
              <div>
                <span className='font-medium'>Checked by:</span>{' '}
                {ruleCheck.checkedBy}
              </div>
            )}
            {ruleCheck.updatedAt && (
              <div>
                <span className='font-medium'>Last updated:</span>{' '}
                {new Date(ruleCheck.updatedAt).toLocaleString()}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className='text-sm font-medium'>Notes</label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder='Add notes about this rule check...'
              className='mt-1 text-sm'
              rows={3}
            />
          </div>

          {/* Action Buttons */}
          <div className='flex gap-2'>
            <Button
              size='sm'
              variant={ruleCheck.status === 'valid' ? 'default' : 'outline'}
              onClick={() => handleStatusChange('valid')}
              disabled={isUpdating}
              className='text-xs'
            >
              Valid
            </Button>
            <Button
              size='sm'
              variant={
                ruleCheck.status === 'needs_more_information'
                  ? 'default'
                  : 'outline'
              }
              onClick={() => handleStatusChange('needs_more_information')}
              disabled={isUpdating}
              className='text-xs'
            >
              Needs More Info
            </Button>
            <Button
              size='sm'
              variant={ruleCheck.status === 'deny' ? 'destructive' : 'outline'}
              onClick={() => handleStatusChange('deny')}
              disabled={isUpdating}
              className='text-xs'
            >
              Deny
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
