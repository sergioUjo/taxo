'use client';

import { usePathname, useRouter } from 'next/navigation';

import { FileText, Plus, Settings } from 'lucide-react';

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

export function AppSidebar({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

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
                  isActive={pathname === '/cases'}
                  onClick={() => router.push('/cases')}
                >
                  <FileText />
                  <span>Cases</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === '/referral'}
                  onClick={() => router.push('/referral')}
                >
                  <Plus />
                  <span>Referral</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === '/rules-classifications'}
                  onClick={() => router.push('/rules-classifications')}
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
              {children}
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
