'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../services/axios';
import { RouteGuard } from '../../components/auth/RouteGuard';

// Define the User interface based on your API response
interface User {
  id: number;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
  // Add any other fields your API returns
}

export default function ProfilePage() {
  const { token } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/user');
        setUser(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  return (
    <RouteGuard>
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6 text-white">My Profile</h1>
        
        {loading && (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-400 p-4 rounded mb-4">
            {error}
          </div>
        )}
        
        {user && !loading && (
          <Card className="bg-gray-800 border-gray-700 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-gray-400">Name</h3>
                  <p className="text-xl">{user.name}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-400">Email</h3>
                  <p className="text-xl">{user.email}</p>
                </div>
                
                <div>
                  <h3 className="text-gray-400">Account Created</h3>
                  <p>{new Date(user.created_at).toLocaleDateString()}</p>
                </div>

                <div>
                  <h3 className="text-gray-400">Last Updated</h3>
                  <p>{new Date(user.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
    </RouteGuard>
  );
}