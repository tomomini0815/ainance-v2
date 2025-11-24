import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DatabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [testResult, setTestResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        // データベース接続テスト
        const { data, error } = await supabase
          .from('individual_transactions')
          .select('count')
          .limit(1);

        if (error) {
          throw error;
        }

        setConnectionStatus('connected');
        setTestResult(data);
      } catch (err) {
        console.error('データベース接続テスト失敗:', err);
        setConnectionStatus('disconnected');
        setError(err instanceof Error ? err.message : '不明なエラー');
      }
    };

    testConnection();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">データベース接続テスト</h2>
      
      <div className="mb-4">
        <p className="font-semibold">接続状態:</p>
        {connectionStatus === 'checking' && <p className="text-yellow-600">確認中...</p>}
        {connectionStatus === 'connected' && <p className="text-green-600">接続成功</p>}
        {connectionStatus === 'disconnected' && <p className="text-red-600">接続失敗</p>}
      </div>

      {error && (
        <div className="mb-4">
          <p className="font-semibold">エラー:</p>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {testResult && (
        <div>
          <p className="font-semibold">テスト結果:</p>
          <pre className="bg-gray-100 p-2 rounded mt-2 overflow-auto">
            {JSON.stringify(testResult, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;