'use client';

import { useState } from 'react';

import { Building2, Clock, Plus, Zap } from 'lucide-react';

import { ReferralForm } from '@/components/referral-form';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const popularIntegrations = [
  {
    name: 'Epic MyChart',
    description:
      'Connect with Epic EHR systems for seamless referral processing',
    icon: Building2,
    category: 'EHR Integration',
  },
  {
    name: 'Cerner PowerChart',
    description: 'Direct integration with Cerner electronic health records',
    icon: Building2,
    category: 'EHR Integration',
  },
  {
    name: 'Allscripts',
    description: 'Automated referral processing with Allscripts EHR',
    icon: Building2,
    category: 'EHR Integration',
  },
  {
    name: 'athenahealth',
    description: 'Streamlined referrals through athenahealth network',
    icon: Building2,
    category: 'EHR Integration',
  },
  {
    name: 'eClinicalWorks',
    description: 'Integrated referral workflow with eClinicalWorks',
    icon: Building2,
    category: 'EHR Integration',
  },
  {
    name: 'NextGen Healthcare',
    description: 'Connect with NextGen practice management systems',
    icon: Building2,
    category: 'EHR Integration',
  },
  {
    name: 'HL7 FHIR API',
    description: 'Standards-based integration for any FHIR-compliant system',
    icon: Zap,
    category: 'API Integration',
  },
  {
    name: 'Direct Trust Messaging',
    description: 'Secure messaging for healthcare provider networks',
    icon: Zap,
    category: 'Messaging',
  },
  {
    name: 'Redox Integration',
    description: 'Healthcare data exchange through Redox platform',
    icon: Zap,
    category: 'Data Exchange',
  },
  {
    name: 'Surescripts',
    description: 'Prescription and clinical data network integration',
    icon: Building2,
    category: 'Network',
  },
  {
    name: 'Carequality',
    description: 'Nationwide health information exchange network',
    icon: Building2,
    category: 'Network',
  },
  {
    name: 'CommonWell Health Alliance',
    description: 'Interoperability platform for health data sharing',
    icon: Building2,
    category: 'Network',
  },
];

export default function ReferralPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className='container mx-auto space-y-8 p-6'>
      <div>
        <h1 className='text-3xl font-bold'>Referral Management</h1>
        <p className='text-muted-foreground mt-2'>
          Create new referrals manually or connect with your existing systems
        </p>
      </div>

      {/* Manual Section */}
      <section className='space-y-4'>
        <h2 className='text-2xl font-semibold'>Manual Referrals</h2>
        <Card className='max-w-md'>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5' />
              Create New Referral
            </CardTitle>
            <CardDescription>
              Upload documents and create a referral case manually
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className='w-full'>
                  <Plus className='mr-2 h-4 w-4' />
                  New Referral
                </Button>
              </DialogTrigger>
              <DialogContent className='max-h-[80vh] max-w-3xl overflow-y-auto'>
                <DialogHeader>
                  <DialogTitle>Create New Referral</DialogTitle>
                  <DialogDescription>
                    Upload referral documents to create a new case for
                    processing
                  </DialogDescription>
                </DialogHeader>
                <ReferralForm onSuccess={() => setIsDialogOpen(false)} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </section>

      {/* Integrations Section */}
      <section className='space-y-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-semibold'>Integrations</h2>
          <Badge variant='secondary' className='text-xs'>
            <Clock className='mr-1 h-3 w-3' />
            Coming Soon
          </Badge>
        </div>
        <p className='text-muted-foreground'>
          Connect with popular medical systems to automate your referral
          workflow
        </p>

        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
          {popularIntegrations.map((integration) => {
            const IconComponent = integration.icon;
            return (
              <Card key={integration.name} className='relative opacity-60'>
                <CardHeader>
                  <div className='flex items-start justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='bg-muted rounded-lg p-2'>
                        <IconComponent className='h-5 w-5' />
                      </div>
                      <div>
                        <CardTitle className='text-lg'>
                          {integration.name}
                        </CardTitle>
                        <Badge variant='outline' className='mt-1 text-xs'>
                          {integration.category}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant='secondary' className='text-xs'>
                      Soon
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className='text-sm'>
                    {integration.description}
                  </CardDescription>
                  <Button variant='outline' className='mt-4 w-full' disabled>
                    Connect
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </div>
  );
}
