import Link from 'next/link';

import {
  Activity,
  Bell,
  Calendar,
  CheckCircle,
  FileText,
  Inbox,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export default function Home() {
  return (
    <div className='min-h-screen'>
      {/* Navigation */}
      <nav className='border-b'>
        <div className='container mx-auto px-4 py-4'>
          <div className='flex items-center justify-between'>
            <h1 className='text-2xl font-bold'>Taxo</h1>
            <div className='flex gap-4'>
              <Link href='/new-referral'>
                <Button variant='ghost'>New Referral</Button>
              </Link>
              <Link href='/cases'>
                <Button variant='ghost'>Cases</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='container mx-auto px-4 py-16'>
        <div className='mx-auto max-w-3xl text-center'>
          <h2 className='mb-6 text-5xl font-bold'>
            Streamline Your Healthcare Referral Process
          </h2>
          <p className='text-muted-foreground mb-8 text-xl'>
            An intelligent system that captures referrals, extracts key
            information, verifies insurance eligibility, and schedules patients
            automatically.
          </p>
          <div className='flex justify-center gap-4'>
            <Link href='/new-referral'>
              <Button size='lg'>Create New Referral</Button>
            </Link>
            <Link href='/cases'>
              <Button size='lg' variant='outline'>
                View Cases
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='container mx-auto px-4 py-16'>
        <h3 className='mb-12 text-center text-3xl font-bold'>How It Works</h3>
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          <Card>
            <CardHeader>
              <Inbox className='text-primary mb-4 h-10 w-10' />
              <CardTitle>Capture Referrals</CardTitle>
              <CardDescription>
                Accept referrals from multiple sources including secure email,
                web forms, EHR systems, fax, and portal uploads.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <FileText className='text-primary mb-4 h-10 w-10' />
              <CardTitle>Extract Information</CardTitle>
              <CardDescription>
                Automatically read documents and extract key patient
                information, insurance details, and medical requirements.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CheckCircle className='text-primary mb-4 h-10 w-10' />
              <CardTitle>Verify Eligibility</CardTitle>
              <CardDescription>
                Check insurance eligibility in real-time and flag any missing
                information for follow-up.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Activity className='text-primary mb-4 h-10 w-10' />
              <CardTitle>Track Status</CardTitle>
              <CardDescription>
                Monitor case progress with a comprehensive dashboard showing all
                referrals and their current status.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className='text-primary mb-4 h-10 w-10' />
              <CardTitle>Schedule Patients</CardTitle>
              <CardDescription>
                Once eligibility is confirmed, automatically schedule patients
                with available providers.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Bell className='text-primary mb-4 h-10 w-10' />
              <CardTitle>Notify Parties</CardTitle>
              <CardDescription>
                Send notifications to all involved parties via email, SMS, and
                dashboard updates.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className='container mx-auto px-4 py-16'>
        <Card className='bg-primary text-primary-foreground'>
          <CardContent className='py-12 text-center'>
            <h3 className='mb-4 text-3xl font-bold'>
              Ready to Streamline Your Referral Process?
            </h3>
            <p className='mb-8 text-lg opacity-90'>
              Start capturing and processing referrals more efficiently today.
            </p>
            <Link href='/new-referral'>
              <Button size='lg' variant='secondary'>
                Get Started
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
