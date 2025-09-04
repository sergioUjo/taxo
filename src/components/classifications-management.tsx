'use client';

import { useState } from 'react';

import { useMutation, useQuery } from 'convex/react';
import { ChevronDown, ChevronRight, Edit, Plus } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';

function AddSpecialtyDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const createSpecialtyMutation = useMutation(api.specialties.createSpecialty);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createSpecialtyMutation({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      // Reset form and close dialog
      setName('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create specialty:', error);
      // TODO: Add proper error handling with toast notifications
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button>
          <Plus className='mr-2 h-4 w-4' />
          Add New
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Specialty</SheetTitle>
          <SheetDescription>
            Create a new medical specialty with its description.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Specialty Name</Label>
            <Input
              id='name'
              placeholder='Enter specialty name...'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Enter specialty description...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </form>
        <SheetFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type='submit' onClick={handleSubmit} disabled={!name.trim()}>
            Create Specialty
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function ClassificationsManagement() {
  const [expandedSpecialties, setExpandedSpecialties] = useState<Set<string>>(
    new Set()
  );
  const [expandedTreatmentTypes, setExpandedTreatmentTypes] = useState<
    Set<string>
  >(new Set());

  // Fetch data from Convex
  const specialties = useQuery(
    api.hierarchicalData.getSpecialtiesWithHierarchy
  );

  const toggleSpecialty = (id: string) => {
    const newExpanded = new Set(expandedSpecialties);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSpecialties(newExpanded);
  };

  const toggleTreatmentType = (id: string) => {
    const newExpanded = new Set(expandedTreatmentTypes);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedTreatmentTypes(newExpanded);
  };

  return (
    <div className='space-y-4'>
      {!specialties ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>Loading specialties...</p>
        </div>
      ) : specialties.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>No specialties found.</p>
          <p className='text-muted-foreground mt-2 text-sm'>
            Create your first specialty to get started.
          </p>
        </div>
      ) : (
        specialties.map(
          (specialty: Doc<'specialties'> & { treatmentTypes: any[] }) => (
            <Card key={specialty._id}>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center space-x-3'>
                    <button
                      onClick={() => toggleSpecialty(specialty._id)}
                      className='rounded p-1 hover:bg-gray-100'
                    >
                      {expandedSpecialties.has(specialty._id) ? (
                        <ChevronDown className='h-4 w-4' />
                      ) : (
                        <ChevronRight className='h-4 w-4' />
                      )}
                    </button>
                    <div>
                      <CardTitle className='text-xl'>
                        {specialty.name}
                      </CardTitle>
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

              {expandedSpecialties.has(specialty._id) && (
                <CardContent>
                  <div className='ml-6 space-y-3'>
                    {specialty.treatmentTypes.map(
                      (
                        treatmentType: Doc<'treatmentTypes'> & {
                          procedures: any[];
                        }
                      ) => (
                        <div
                          key={treatmentType._id}
                          className='border-l-2 pl-4'
                        >
                          <div className='flex items-center justify-between'>
                            <div className='flex items-center space-x-3'>
                              <button
                                onClick={() =>
                                  toggleTreatmentType(treatmentType._id)
                                }
                                className='rounded p-1 hover:bg-gray-100'
                              >
                                {expandedTreatmentTypes.has(
                                  treatmentType._id
                                ) ? (
                                  <ChevronDown className='h-3 w-3' />
                                ) : (
                                  <ChevronRight className='h-3 w-3' />
                                )}
                              </button>
                              <div>
                                <h4 className='font-medium'>
                                  {treatmentType.name}
                                </h4>
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

                          {expandedTreatmentTypes.has(treatmentType._id) && (
                            <div className='mt-2 ml-6 space-y-2'>
                              {treatmentType.procedures.map(
                                (procedure: Doc<'procedures'>) => (
                                  <div
                                    key={procedure._id}
                                    className='border-l py-1 pl-3'
                                  >
                                    <div className='flex items-center justify-between'>
                                      <div>
                                        <h5 className='text-sm font-medium'>
                                          {procedure.name}
                                        </h5>
                                        {procedure.description && (
                                          <p className='text-muted-foreground text-xs'>
                                            {procedure.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className='flex items-center space-x-1'>
                                        <Button variant='ghost' size='sm'>
                                          <Edit className='h-3 w-3' />
                                        </Button>
                                        <DeleteButton
                                          id={procedure._id}
                                          type='procedure'
                                          name={procedure.name}
                                        />
                                      </div>
                                    </div>
                                  </div>
                                )
                              )}
                              <Button
                                variant='ghost'
                                size='sm'
                                className='ml-3'
                              >
                                <Plus className='mr-1 h-3 w-3' />
                                Add Procedure
                              </Button>
                            </div>
                          )}
                        </div>
                      )
                    )}
                    <Button variant='ghost' size='sm' className='ml-6'>
                      <Plus className='mr-1 h-3 w-3' />
                      Add Treatment Type
                    </Button>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        )
      )}
    </div>
  );
}

export { AddSpecialtyDialog };
