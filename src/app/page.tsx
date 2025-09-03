'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to cases page by default
    router.push('/cases');
  }, [router]);

  return null;
}
