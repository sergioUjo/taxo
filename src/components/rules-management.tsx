'use client';

import { useQuery } from 'convex/react';
import { Edit, Settings } from 'lucide-react';

import { DeleteButton } from '@/components/delete-button';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';

const getRulePriorityColor = (priority: string) => {
  switch (priority) {
    case 'critical':
      return 'bg-red-100 text-red-800';
    case 'high':
      return 'bg-orange-100 text-orange-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getRuleTypeColor = (type: string) => {
  switch (type) {
    case 'eligibility':
      return 'bg-blue-100 text-blue-800';
    case 'workflow':
      return 'bg-purple-100 text-purple-800';
    case 'documentation':
      return 'bg-indigo-100 text-indigo-800';
    case 'scheduling':
      return 'bg-teal-100 text-teal-800';
    case 'approval':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

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
                  <div className='mt-3 flex items-center space-x-2'>
                    <Badge className={getRuleTypeColor(rule.ruleType)}>
                      {rule.ruleType}
                    </Badge>
                    <Badge className={getRulePriorityColor(rule.priority)}>
                      {rule.priority}
                    </Badge>
                    {rule.specialtyId && (
                      <Badge variant='outline'>Specialty Rule</Badge>
                    )}
                  </div>
                </div>
                <div className='flex items-center space-x-2'>
                  <Button variant='ghost' size='sm'>
                    <Settings className='h-4 w-4' />
                  </Button>
                  <Button variant='ghost' size='sm'>
                    <Edit className='h-4 w-4' />
                  </Button>
                  <DeleteButton id={rule._id} type='rule' name={rule.title} />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))
      )}
    </div>
  );
}
