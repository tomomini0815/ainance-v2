import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import DatabaseTest from '../components/DatabaseTest';

const DatabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">データベーステスト</h1>
        </div>

        <DatabaseTest />
      </main>
    </div>
  );
};

export default DatabaseTestPage;