import React from 'react';
import { EditReport } from '../components/Reports/EditReport';
import { Layout } from '../components/Layout/Layout';

export const EditReportPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <EditReport />
      </div>
    </Layout>
  );
};
