'use client';

import { useQuery } from 'convex/react';

import { AddSpecialtyDialog } from '@/components/add-specialty-dialog';

import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { SpecialtyCard } from './specialty-card';

export function ClassificationsManagement() {
  // Fetch data from Convex
  const specialties = useQuery(
    api.hierarchicalData.getSpecialtiesWithHierarchy
  );

  return (
    <div className='space-y-4'>
      {!specialties ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>Loading specialties...</p>
        </div>
      ) : (
        specialties.map(
          (specialty: Doc<'specialties'> & { treatmentTypes: any[] }) => (
            <SpecialtyCard key={specialty._id} specialty={specialty} />
          )
        )
      )}
      {specialties && specialties.length > 0 && (
        <div className='flex justify-center pt-4'>
          <AddSpecialtyDialog />
        </div>
      )}
    </div>
  );
}
