'use client';

import { useState } from 'react';

import { useMutation } from 'convex/react';
import { Edit, Save, X } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import { RulesComboBox } from './rules-combo-box';

interface ProcedureCardProps {
  procedure: Doc<'procedures'>;
}

export function ProcedureCard({ procedure }: ProcedureCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(procedure.name);
  const [editedDescription, setEditedDescription] = useState(
    procedure.description || ''
  );

  const updateProcedure = useMutation(api.procedures.updateProcedure);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedName(procedure.name);
    setEditedDescription(procedure.description || '');
  };

  const handleSave = async () => {
    if (editedName.trim()) {
      await updateProcedure({
        id: procedure._id,
        name: editedName.trim(),
        description: editedDescription.trim() || undefined,
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedName(procedure.name);
    setEditedDescription(procedure.description || '');
    setIsEditing(false);
  };

  return (
    <div className='border-l py-1 pl-3'>
      <div className='flex items-center justify-between'>
        <div className='flex-1'>
          {isEditing ? (
            <div className='space-y-1'>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                className='h-7 text-sm font-medium'
                placeholder='Procedure name'
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
                <h5 className='text-sm font-medium'>{procedure.name}</h5>
                <RulesComboBox
                  entityType='procedure'
                  entityId={procedure._id}
                />
              </div>
              {procedure.description && (
                <p className='text-muted-foreground text-xs'>
                  {procedure.description}
                </p>
              )}
            </div>
          )}
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
            id={procedure._id}
            type='procedure'
            name={procedure.name}
          />
        </div>
      </div>
    </div>
  );
}
