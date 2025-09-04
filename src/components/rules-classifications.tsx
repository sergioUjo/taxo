'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import {
  AddSpecialtyDialog,
  ClassificationsManagement,
} from './classifications-management';
import { RulesManagement } from './rules-management';

export function RulesClassifications() {
  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>
            Rules & Classifications
          </h1>
          <p className='text-muted-foreground'>
            Manage medical specialties, treatment types, procedures, and
            business rules
          </p>
        </div>
        <AddSpecialtyDialog />
      </div>

      <Tabs defaultValue='specialties'>
        <TabsList>
          <TabsTrigger value='specialties'>Classifications</TabsTrigger>
          <TabsTrigger value='rules'>Rules</TabsTrigger>
        </TabsList>

        <TabsContent value='specialties'>
          <ClassificationsManagement />
        </TabsContent>

        <TabsContent value='rules'>
          <RulesManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
