import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DatabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('確認中...');
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // Supabaseへの接続テスト
        const { data, error } = await supabase
          .from('individual_transactions')
          .select('count')
          .limit(1);

        if (error) {
          throw error;
        }

        setConnectionStatus('接続成功');
        setTestResult(data);
        setError(null);
      } catch (err: any) {
        setConnectionStatus('接続失敗');
        setError(err.message);
        console.error('Database connection error:', err);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Supabase接続テスト</h2>
      <div className="mb-4">
        <p className="font-semibold">接続状況: <span className={connectionStatus === '接続成功' ? 'text-green-500' : 'text-red-500'}>{connectionStatus}</span></p>
      </div>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          <p className="font-semibold">エラー:</p>
          <p>{error}</p>
        </div>
      )}
      {testResult && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          <p className="font-semibold">テスト結果:</p>
          <pre>{JSON.stringify(testResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;