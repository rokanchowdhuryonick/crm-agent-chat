'use client';

import { useAuth } from '../contexts/AuthContext';
import { AuthScreen } from '../components/auth/AuthScreen';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { RouteGuard } from '@/components/auth/RouteGuard'; // Import RouteGuard

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect to dashboard if authenticated and not in a loading state
    if (!loading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, loading, router]);

  // For the login/register page, we ALWAYS show AuthScreen
  // RouteGuard is still used but only affects protected routes, not '/'
  return (
    <RouteGuard>
      {/* Always render AuthScreen on the root path */}
      <AuthScreen />
    </RouteGuard>
  );
}