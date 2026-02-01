import React from 'react';
import { Link } from 'react-router-dom';
import DatabaseTest from '../components/DatabaseTest';
import ManualDBTest from '../components/ManualDBTest';

const DatabaseTestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link to="/dashboard" className="text-primary hover:text-primary/80 flex items-center">
            ← ダッシュボードに戻る
          </Link>
        </div>
        <h1 className="text-2xl font-bold mb-6">データベース接続テスト</h1>
        <div className="grid grid-cols-1 gap-6">
          <DatabaseTest />
          <ManualDBTest />
        </div>
      </div>
    </div>
  );
};

export default DatabaseTestPage;