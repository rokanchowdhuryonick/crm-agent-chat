// src/components/auth/RouteGuard.tsx
'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname(); // Get the current path

  // useEffect(() => {
  //   if (!loading && !isAuthenticated) {
  //     // Redirect to login page if not authenticated and not loading
  //     router.push('/');
  //   }
  // }, [isAuthenticated, loading, router]);

  useEffect(() => {
    // Only run redirect logic if loading is finished
    if (!loading) {
      // If user is NOT authenticated AND is trying to access a PROTECTED route (i.e., NOT the login page '/')
      if (!isAuthenticated && pathname !== '/') {
        console.log('RouteGuard: Not authenticated, not loading, and not on login page. Redirecting to /');
        router.push('/'); // Redirect to login page
      }
      // Optional: Redirect authenticated users away from login page
      // else if (isAuthenticated && pathname === '/') {
      //   console.log('RouteGuard: Authenticated and on login page. Redirecting to dashboard...');
      //   router.push('/dashboard'); // Or your main authenticated route
      // }
    }
  }, [isAuthenticated, loading, router, pathname]); // Add pathname to dependency array

  // if (loading) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen bg-gray-900">
  //       <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
  //     </div>
  //   );
  // }

  // Show loading indicator while checking auth state, unless we are on the public login page
  if (loading && pathname !== '/') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Render children if:
  // 1. User is authenticated
  // 2. Or, user is on the public login page ('/')
  // (The useEffect handles redirecting away if needed)
  if (isAuthenticated || pathname === '/') {
    return <>{children}</>;
 }

 // If not authenticated, not loading, and not on '/', the useEffect should have redirected.
 // Return null or a loader while the redirect occurs.
 return null; // Or the loader component
};