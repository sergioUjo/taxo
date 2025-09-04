'use client';

import { useState } from 'react';

import { useMutation, useQuery } from 'convex/react';
import { Check, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';

interface RulesComboBoxProps {
  entityType: 'specialty' | 'treatmentType' | 'procedure';
  entityId: Id<'specialties'> | Id<'treatmentTypes'> | Id<'procedures'>;
}

export function RulesComboBox({ entityType, entityId }: RulesComboBoxProps) {
  const [open, setOpen] = useState(false);

  // Fetch all rules and rules for this entity
  const allRules = useQuery(api.rules.getRules);

  // Get entity-specific rules based on type
  const entityRules =
    entityType === 'specialty'
      ? useQuery(api.rules.getRulesBySpecialty, {
          specialtyId: entityId as Id<'specialties'>,
        })
      : entityType === 'treatmentType'
        ? useQuery(api.rules.getRulesByTreatmentType, {
            treatmentTypeId: entityId as Id<'treatmentTypes'>,
          })
        : useQuery(api.rules.getRulesByProcedure, {
            procedureId: entityId as Id<'procedures'>,
          });

  // Get appropriate mutations based on entity type
  const addRuleMutation = useMutation(
    entityType === 'specialty'
      ? api.rules.addRuleToSpecialty
      : entityType === 'treatmentType'
        ? api.rules.addRuleToTreatmentType
        : api.rules.addRuleToProcedure
  );

  const removeRuleMutation = useMutation(
    entityType === 'specialty'
      ? api.rules.removeRuleFromSpecialty
      : entityType === 'treatmentType'
        ? api.rules.removeRuleFromTreatmentType
        : api.rules.removeRuleFromProcedure
  );

  const handleRuleToggle = async (
    ruleId: Id<'rules'>,
    isCurrentlyLinked: boolean
  ) => {
    if (isCurrentlyLinked) {
      if (entityType === 'specialty') {
        await removeRuleMutation({
          specialtyId: entityId as Id<'specialties'>,
          ruleId,
        });
      } else if (entityType === 'treatmentType') {
        await removeRuleMutation({
          treatmentTypeId: entityId as Id<'treatmentTypes'>,
          ruleId,
        });
      } else {
        await removeRuleMutation({
          procedureId: entityId as Id<'procedures'>,
          ruleId,
        });
      }
    } else {
      if (entityType === 'specialty') {
        await addRuleMutation({
          specialtyId: entityId as Id<'specialties'>,
          ruleId,
        });
      } else if (entityType === 'treatmentType') {
        await addRuleMutation({
          treatmentTypeId: entityId as Id<'treatmentTypes'>,
          ruleId,
        });
      } else {
        await addRuleMutation({
          procedureId: entityId as Id<'procedures'>,
          ruleId,
        });
      }
    }
  };

  if (!allRules || !entityRules) {
    return (
      <Button variant='ghost' size='sm' disabled>
        <ShieldCheck className='h-4 w-4' />
      </Button>
    );
  }

  const linkedRuleIds = new Set(
    entityRules.filter((rule) => rule !== null).map((rule) => rule._id)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='relative text-blue-600 hover:text-blue-700'
          aria-expanded={open}
        >
          <ShieldCheck />
          {linkedRuleIds.size > 0 && (
            <p className='absolute top-1 right-1 text-xs'>
              {linkedRuleIds.size}
            </p>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-80 p-0'>
        <Command>
          <CommandInput placeholder='Search rules...' />
          <CommandList>
            <CommandEmpty>No rules found.</CommandEmpty>
            <CommandGroup>
              {allRules
                .filter((rule) => rule !== null)
                .map((rule) => {
                  const isLinked = linkedRuleIds.has(rule._id);
                  return (
                    <CommandItem
                      key={rule._id}
                      value={rule.title}
                      onSelect={() => handleRuleToggle(rule._id, isLinked)}
                      className='cursor-pointer'
                    >
                      <Check
                        className={`mr-2 h-4 w-4 ${
                          isLinked ? 'opacity-100' : 'opacity-0'
                        }`}
                      />
                      <div className='flex-1'>
                        <div className='font-medium'>{rule.title}</div>
                        {rule.description && (
                          <div className='text-muted-foreground truncate text-sm'>
                            {rule.description}
                          </div>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
