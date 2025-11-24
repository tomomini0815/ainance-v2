import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const DatabaseTest: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('未テスト');
  const [testData, setTestData] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testConnection = async () => {
    try {
      setConnectionStatus('テスト中...');
      setError(null);

      // データベース接続テスト
      const { data, error } = await supabase
        .from('individual_transactions')
        .select('count()');

      if (error) {
        throw error;
      }

      setConnectionStatus('接続成功');
      setTestData(data || []);
    } catch (err) {
      setConnectionStatus('接続失敗');
      setError(err instanceof Error ? err.message : String(err));
      console.error('データベース接続テストエラー:', err);
    }
  };

  const insertTestRecord = async () => {
    try {
      const testRecord = {
        item: 'テスト取引',
        amount: 1000,
        date: new Date().toISOString().split('T')[0],
        category: 'テストカテゴリ',
        type: 'expense',
        description: 'データベーステスト用の取引',
        creator: '00000000-0000-0000-0000-000000000000' // ダミーのUUID
      };

      const { data, error } = await supabase
        .from('individual_transactions')
        .insert([testRecord])
        .select();

      if (error) {
        throw error;
      }

      console.log('テストレコード挿入成功:', data);
      alert('テストレコードが正常に挿入されました');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      console.error('テストレコード挿入エラー:', err);
      alert('テストレコードの挿入に失敗しました: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">データベース接続テスト</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">接続ステータス</h3>
        <p className={`text-lg ${connectionStatus === '接続成功' ? 'text-green-600' : connectionStatus === '接続失敗' ? 'text-red-600' : 'text-gray-600'}`}>
          {connectionStatus}
        </p>
        {error && (
          <p className="text-red-600 mt-2">エラー: {error}</p>
        )}
      </div>

      <div className="flex space-x-4">
        <button
          onClick={testConnection}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          接続テスト
        </button>
        <button
          onClick={insertTestRecord}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          テストレコード挿入
        </button>
      </div>

      {testData.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">テストデータ</h3>
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto">
            {JSON.stringify(testData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

export default DatabaseTest;