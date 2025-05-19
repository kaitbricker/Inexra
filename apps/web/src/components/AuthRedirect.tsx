'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function AuthRedirect() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#101a2b] to-[#1a2747]">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return null;
}

// Export as default for dynamic import
export default AuthRedirect; 