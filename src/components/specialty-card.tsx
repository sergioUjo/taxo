'use client';

import { useState } from 'react';

import { ChevronDown, ChevronRight, Edit, Plus } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import type { Doc } from '../../convex/_generated/dataModel';
import { RulesComboBox } from './rules-combo-box';
import { TreatmentTypeCard } from './treatment-type-card';

interface SpecialtyCardProps {
  specialty: Doc<'specialties'> & { treatmentTypes: any[] };
}

export function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <Card key={specialty._id}>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className='rounded p-1 hover:bg-gray-100'
            >
              {isExpanded ? (
                <ChevronDown className='h-4 w-4' />
              ) : (
                <ChevronRight className='h-4 w-4' />
              )}
            </button>
            <div>
              <div className='flex items-center gap-2'>
                <CardTitle className='text-xl'>{specialty.name}</CardTitle>
                <RulesComboBox
                  entityType='specialty'
                  entityId={specialty._id}
                />
              </div>
              {specialty.description && (
                <p className='text-muted-foreground mt-1 text-sm'>
                  {specialty.description}
                </p>
              )}
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='ghost' size='sm'>
              <Edit className='h-4 w-4' />
            </Button>
            <DeleteButton
              id={specialty._id}
              type='specialty'
              name={specialty.name}
            />
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          <div className='ml-6 space-y-3'>
            {specialty.treatmentTypes.map((treatmentType) => (
              <TreatmentTypeCard
                key={treatmentType._id}
                treatmentType={treatmentType}
              />
            ))}
            <Button variant='ghost' size='sm' className='ml-6'>
              <Plus className='mr-1 h-3 w-3' />
              Add Treatment Type
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
