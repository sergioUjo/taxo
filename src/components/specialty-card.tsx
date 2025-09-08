'use client';

import { useState } from 'react';

import { useMutation } from 'convex/react';
import { ChevronDown, ChevronRight, Edit, Plus, Save, X } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { RulesComboBox } from './rules-combo-box';
import { TreatmentTypeCard } from './treatment-type-card';

interface SpecialtyCardProps {
  specialty: Doc<'specialties'> & { treatmentTypes: any[] };
}

export function SpecialtyCard({ specialty }: SpecialtyCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(specialty.name);
  const [editedDescription, setEditedDescription] = useState(
    specialty.description || ''
  );

  const updateSpecialty = useMutation(api.specialties.updateSpecialty);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(specialty.name);
    setEditedDescription(specialty.description || '');
  };

  const handleSave = async () => {
    if (editedName.trim()) {
      await updateSpecialty({
        id: specialty._id,
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(specialty.name);
    setEditedDescription(specialty.description || '');
    setIsEditing(false);
  };

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
            <div className='flex-1'>
              {isEditing ? (
                <div className='space-y-2'>
                  <Input
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className='text-xl font-semibold'
                    placeholder='Specialty name'
                  />
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    placeholder='Description (optional)'
                    className='text-sm'
                    rows={2}
                  />
                </div>
              ) : (
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
              )}
            </div>
          </div>
          <div className='flex items-center space-x-2'>
            {isEditing ? (
              <>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleSave}
                  disabled={!editedName.trim()}
                >
                  <Save className='h-4 w-4' />
                </Button>
                <Button variant='ghost' size='sm' onClick={handleCancel}>
                  <X className='h-4 w-4' />
                </Button>
              </>
            ) : (
              <Button variant='ghost' size='sm' onClick={handleEdit}>
                <Edit className='h-4 w-4' />
              </Button>
            )}
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
