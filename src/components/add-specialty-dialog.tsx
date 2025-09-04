import { useState } from 'react';

import { useMutation } from 'convex/react';
import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
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
        <Button variant='ghost' size='sm'>
          <Plus className='mr-1 h-3 w-3' />
          Add Specialty
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

export { AddSpecialtyDialog };
