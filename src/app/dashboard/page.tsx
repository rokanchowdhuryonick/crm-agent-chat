'use client';

import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RouteGuard } from '../../components/auth/RouteGuard';

export default function DashboardHome() {
  return (
    <RouteGuard>
    <DashboardLayout>
      <div className="container mx-auto p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Dashboard Overview</h3>
            <p className="text-gray-400">
              Welcome to your dashboard. Content will be added here soon.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Recent Activity</h3>
            <p className="text-gray-400">
              Your recent activities will appear here.
            </p>
          </div>
          
          <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-semibold mb-2">Quick Stats</h3>
            <p className="text-gray-400">
              Statistics and metrics will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </RouteGuard>
  );
}