'use client';

import { useState } from 'react';

import { useMutation, useQuery } from 'convex/react';
import { Edit, Plus, Settings } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
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
import type { Doc, Id } from '../../convex/_generated/dataModel';

function EditRuleDialog({ rule }: { rule: Doc<'rules'> }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState(rule.title);
  const [description, setDescription] = useState(rule.description);

  const updateRuleMutation = useMutation(api.rules.updateRule);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateRuleMutation({
        id: rule._id,
        title: title.trim(),
        description: description.trim(),
      });

      // Close dialog
      setOpen(false);
    } catch (error) {
      console.error('Failed to update rule:', error);
      // TODO: Add proper error handling with toast notifications
    }
  };

  const isFormValid = title.trim() && description.trim();
  const hasChanges =
    title.trim() !== rule.title || description.trim() !== rule.description;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Edit className='h-4 w-4' />
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Edit Rule</SheetTitle>
          <SheetDescription>
            Update the rule details to modify your workflow processes.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='edit-title'>Rule Title</Label>
            <Input
              id='edit-title'
              placeholder='Enter rule title...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='edit-description'>Description</Label>
            <Textarea
              id='edit-description'
              placeholder='Enter rule description...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
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
          <Button
            type='submit'
            onClick={handleSubmit}
            disabled={!isFormValid || !hasChanges}
          >
            Update Rule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function AddRuleDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const createRuleMutation = useMutation(api.rules.createRule);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createRuleMutation({
        title: title.trim(),
        description: description.trim(),
      });

      // Reset form and close dialog
      setTitle('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error('Failed to create rule:', error);
      // TODO: Add proper error handling with toast notifications
    }
  };

  const isFormValid = title.trim() && description.trim();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant='ghost' size='sm'>
          <Plus className='mr-1 h-3 w-3' />
          Add Rule
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Rule</SheetTitle>
          <SheetDescription>
            Create a new rule to automate your workflow processes.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='title'>Rule Title</Label>
            <Input
              id='title'
              placeholder='Enter rule title...'
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              placeholder='Enter rule description...'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
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
          <Button type='submit' onClick={handleSubmit} disabled={!isFormValid}>
            Create Rule
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function RulesManagement() {
  const rules = useQuery(api.rules.getRules, {});

  return (
    <div className='space-y-4'>
      {!rules ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>Loading rules...</p>
        </div>
      ) : rules.length === 0 ? (
        <div className='py-8 text-center'>
          <p className='text-muted-foreground'>No rules found.</p>
          <p className='text-muted-foreground mt-2 text-sm'>
            Create rules to automate your workflow processes.
          </p>
        </div>
      ) : (
        rules.map((rule: Doc<'rules'>) => (
          <Card key={rule._id}>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <div>
                  <CardTitle className='text-lg'>{rule.title}</CardTitle>
                  <p className='text-muted-foreground mt-1 text-sm'>
                    {rule.description}
                  </p>
                </div>
                <div className='flex items-center space-x-2'>
                  <EditRuleDialog rule={rule} />
                  <DeleteButton id={rule._id} type='rule' name={rule.title} />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
      <div className='flex justify-center pt-4'>
        <AddRuleDialog />
      </div>
    </div>
  );
}
