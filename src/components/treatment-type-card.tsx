'use client';

import { useState } from 'react';

import { ChevronDown, ChevronRight, Edit, Plus } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';

import type { Doc } from '../../convex/_generated/dataModel';
import { ProcedureCard } from './procedure-card';
import { RulesComboBox } from './rules-combo-box';

interface TreatmentTypeCardProps {
  treatmentType: Doc<'treatmentTypes'> & {
    procedures: any[];
  };
}

export function TreatmentTypeCard({ treatmentType }: TreatmentTypeCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className='border-l-2 pl-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center space-x-3'>
          <button
            onClick={toggleExpanded}
            className='rounded p-1 hover:bg-gray-100'
          >
            {isExpanded ? (
              <ChevronDown className='h-3 w-3' />
            ) : (
              <ChevronRight className='h-3 w-3' />
            )}
          </button>
          <div>
            <div className='flex items-center gap-2'>
              <h4 className='font-medium'>{treatmentType.name}</h4>
              <RulesComboBox
                entityType='treatmentType'
                entityId={treatmentType._id}
              />
            </div>
            {treatmentType.description && (
              <p className='text-muted-foreground text-xs'>
                {treatmentType.description}
              </p>
            )}
          </div>
        </div>
        <div className='flex items-center space-x-1'>
          <Button variant='ghost' size='sm'>
            <Edit className='h-3 w-3' />
          </Button>
          <DeleteButton
            id={treatmentType._id}
            type='treatmentType'
            name={treatmentType.name}
          />
        </div>
      </div>

      {isExpanded && (
        <div className='mt-2 ml-6 space-y-2'>
          {treatmentType.procedures.map((procedure) => (
            <ProcedureCard key={procedure._id} procedure={procedure} />
          ))}
          <Button variant='ghost' size='sm' className='ml-3'>
            <Plus className='mr-1 h-3 w-3' />
            Add Procedure
          </Button>
        </div>
      )}
    </div>
  );
}
