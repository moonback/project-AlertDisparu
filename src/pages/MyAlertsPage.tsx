import React from 'react';
import { MyAlerts } from '../components/Profile/MyAlerts';
import { Layout } from '../components/Layout/Layout';

export const MyAlertsPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <MyAlerts />
        </div>
      </div>
    </Layout>
  );
};
