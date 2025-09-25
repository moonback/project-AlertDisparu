import React from 'react';
import { MyAlerts } from '../components/Profile/MyAlerts';
import { Layout } from '../components/Layout/Layout';

export const MyAlertsPage: React.FC = () => {
  return (
    <Layout showFooter={false}>
      <div className="min-h-screen relative">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Header avec effet glass */}
          <div className="glass-hero p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-gray-900 mb-2 glass-shimmer">Mes Alertes</h1>
                <p className="text-gray-700 text-lg">Gérez vos alertes et notifications personnalisées</p>
              </div>
            </div>
          </div>
          
          <MyAlerts />
        </div>
      </div>
    </Layout>
  );
};
