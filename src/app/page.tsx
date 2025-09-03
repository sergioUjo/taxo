'use client';

import { useState } from 'react';

import { FileText, Plus, Settings } from 'lucide-react';

import { CasesDashboard } from '@/components/cases-dashboard';
import { NewReferralForm } from '@/components/new-referral-form';
import { RulesClassifications } from '@/components/rules-classifications';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';

type TabType = 'cases' | 'new-referral' | 'rules-classifications';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('cases');

  return (
    <SidebarProvider>
      <div className='flex min-h-screen w-full'>
        <Sidebar>
          <SidebarHeader>
            <h1 className='text-sidebar-foreground text-2xl font-bold'>Taxo</h1>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === 'cases'}
                  onClick={() => setActiveTab('cases')}
                >
                  <FileText />
                  <span>Cases</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === 'new-referral'}
                  onClick={() => setActiveTab('new-referral')}
                >
                  <Plus />
                  <span>New Referral</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === 'rules-classifications'}
                  onClick={() => setActiveTab('rules-classifications')}
                >
                  <Settings />
                  <span>Rules & Classifications</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <SidebarInset>
          <div className='flex flex-1 flex-col gap-4 p-4'>
            <div className='min-h-[100vh] flex-1 rounded-xl p-4'>
              {activeTab === 'cases' && <CasesDashboard />}
              {activeTab === 'new-referral' && <NewReferralForm />}
              {activeTab === 'rules-classifications' && (
                <RulesClassifications />
              )}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
