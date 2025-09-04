'use client';

import { Edit } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';

import type { Doc } from '../../convex/_generated/dataModel';
import { RulesComboBox } from './rules-combo-box';

interface ProcedureCardProps {
  procedure: Doc<'procedures'>;
}

export function ProcedureCard({ procedure }: ProcedureCardProps) {
  return (
    <div className='border-l py-1 pl-3'>
      <div className='flex items-center justify-between'>
        <div>
          <div className='flex items-center gap-2'>
            <h5 className='text-sm font-medium'>{procedure.name}</h5>
            <RulesComboBox entityType='procedure' entityId={procedure._id}/>
          </div>
          {procedure.description && (
            <p className='text-muted-foreground text-xs'>
              {procedure.description}
            </p>
        )}
        </div>

        <div className='flex items-center space-x-1'>
          <Button variant='ghost' size='sm'>
            <Edit className='h-3 w-3'/>
          </Button>
          <DeleteButton
              id={procedure._id}
              type='procedure'
              name={procedure.name}
          />
        </div>
      </div>
    </div>
  );
}
