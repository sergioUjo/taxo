import { Loader2 } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface CaseStatusCellProps {
  status: string;
  eligibilityStatus?: string;
}

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

export function CaseStatusCell({
  status,
  eligibilityStatus,
}: CaseStatusCellProps) {
  return (
    <div className='flex flex-wrap gap-1'>
      <Badge
        variant={getStatusVariant(status)}
        className='inline-flex items-center gap-1 text-xs'
      >
        {status === 'processing' && (
          <Loader2 className='h-3 w-3 animate-spin' />
        )}
        {status.replace('-', ' ')}
      </Badge>
      {eligibilityStatus && (
        <Badge
          variant={
            eligibilityStatus === 'eligible'
              ? 'default'
              : eligibilityStatus === 'not-eligible'
                ? 'destructive'
                : 'secondary'
          }
          className='text-xs'
        >
          {eligibilityStatus.replace('-', ' ')}
        </Badge>
      )}
    </div>
  );
}
