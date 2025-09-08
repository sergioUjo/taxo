'use client';

import { useState } from 'react';

import { useMutation } from 'convex/react';
import { ChevronDown, ChevronRight, Edit, Plus, Save, X } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../convex/_generated/api';
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
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(treatmentType.name);
  const [editedDescription, setEditedDescription] = useState(
    treatmentType.description || ''
  );

  const updateTreatmentType = useMutation(api.treatments.updateTreatmentType);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(treatmentType.name);
    setEditedDescription(treatmentType.description || '');
  };

  const handleSave = async () => {
    if (editedName.trim()) {
      await updateTreatmentType({
        id: treatmentType._id,
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(treatmentType.name);
    setEditedDescription(treatmentType.description || '');
    setIsEditing(false);
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
          <div className='flex-1'>
            {isEditing ? (
              <div className='space-y-1'>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className='h-8 text-sm font-medium'
                  placeholder='Treatment type name'
                />
                <Textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder='Description (optional)'
                  className='text-xs'
                  rows={2}
                />
              </div>
            ) : (
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
            )}
          </div>
        </div>
        <div className='flex items-center space-x-1'>
          {isEditing ? (
            <>
              <Button
                variant='ghost'
                size='sm'
                onClick={handleSave}
                disabled={!editedName.trim()}
              >
                <Save className='h-3 w-3' />
              </Button>
              <Button variant='ghost' size='sm' onClick={handleCancel}>
                <X className='h-3 w-3' />
              </Button>
            </>
          ) : (
            <Button variant='ghost' size='sm' onClick={handleEdit}>
              <Edit className='h-3 w-3' />
            </Button>
          )}
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
