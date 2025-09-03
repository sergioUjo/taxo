'use client';

import { useState } from 'react';

import { useMutation } from 'convex/react';
import { Trash2 } from 'lucide-react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

type DeleteType = 'specialty' | 'treatmentType' | 'procedure' | 'rule';

interface DeleteButtonProps {
  id: string;
  type: DeleteType;
  name: string;
}

export function DeleteButton({ id, type, name }: DeleteButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Get the appropriate delete mutation based on type
  const deleteSpecialty = useMutation(api.specialties.deleteSpecialtyCascade);
  const deleteTreatmentType = useMutation(
    api.treatments.deleteTreatmentTypeCascade
  );
  const deleteProcedure = useMutation(api.procedures.deleteProcedureCascade);
  const deleteRuleMutation = useMutation(api.rules.deleteRule);

  const handleDelete = async () => {
    try {
      switch (type) {
        case 'specialty':
          await deleteSpecialty({ id: id as Id<'specialties'> });
          break;
        case 'treatmentType':
          await deleteTreatmentType({ id: id as Id<'treatmentTypes'> });
          break;
        case 'procedure':
          await deleteProcedure({ id: id as Id<'procedures'> });
          break;
        case 'rule':
          await deleteRuleMutation({ id: id as Id<'rules'> });
          break;
      }

      setIsOpen(false);
    } catch (error) {
      console.error(`Failed to delete ${type}:`, error);
      // TODO: Add proper error handling with toast notifications
    }
  };

  const getDeleteMessage = () => {
    switch (type) {
      case 'specialty':
        return `This will permanently delete the specialty "${name}" and all its treatment types, procedures, rules, and case classifications. This action cannot be undone.`;
      case 'treatmentType':
        return `This will permanently delete the treatment type "${name}" and all its procedures, rules, and case classifications. This action cannot be undone.`;
      case 'procedure':
        return `This will permanently delete the procedure "${name}" and all its associated rules and case classifications. This action cannot be undone.`;
      case 'rule':
        return `This will permanently delete the rule "${name}". This action cannot be undone.`;
      default:
        return `This will permanently delete "${name}". This action cannot be undone.`;
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='text-destructive hover:text-destructive'
        >
          <Trash2 className='h-4 w-4' />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete {type.charAt(0).toUpperCase() + type.slice(1)}
          </AlertDialogTitle>
          <AlertDialogDescription>{getDeleteMessage()}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
