'use client';

import { useState } from 'react';

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

import type { Id } from '../../convex/_generated/dataModel';

type RemoveRuleCheckButtonProps = {
  ruleCheckId: Id<'ruleChecks'>;
  caseId: Id<'cases'>;
  ruleTitle: string;
  onRemove: (ruleCheckId: Id<'ruleChecks'>) => void;
  disabled?: boolean;
};

export function RemoveRuleCheckButton({
  ruleCheckId,
  caseId,
  ruleTitle,
  onRemove,
  disabled = false,
}: RemoveRuleCheckButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onRemove(ruleCheckId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error removing rule check:', error);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button
          size='sm'
          variant='destructive'
          disabled={disabled || isRemoving}
          className='text-xs opacity-70 hover:opacity-100'
        >
          <Trash2 className='mr-1 h-3 w-3' />
          Remove
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Remove Rule Check</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to remove the rule check for "{ruleTitle}"?
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isRemoving}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={isRemoving}
            className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
          >
            {isRemoving ? 'Removing...' : 'Remove'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
