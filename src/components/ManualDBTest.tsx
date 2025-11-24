import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const ManualDBTest: React.FC = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const runTest = async (testName: string, testFunction: () => Promise<any>) => {
    setIsLoading(true);
    try {
      const result = await testFunction();
      setTestResults(prev => [...prev, { testName, result, error: null }]);
    } catch (error: any) {
      setTestResults(prev => [...prev, { testName, result: null, error: error.message }]);
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    const { data, error } = await supabase.rpc('version');
    if (error) throw error;
    return data;
  };

  const testAuth = async () => {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data;
  };

  const testSelect = async () => {
    const { data, error } = await supabase
      .from('individual_transactions')
      .select('id')
      .limit(1);
    if (error) throw error;
    return data;
  };

  const testInsert = async () => {
    const { data, error } = await supabase
      .from('individual_transactions')
      .insert({
        item: 'Test Item',
        amount: 1000,
        date: '2023-01-01',
        category: 'テスト',
        type: 'expense',
        creator: 'test-user-id'
      })
      .select();
    if (error) throw error;
    return data;
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">手動データベーステスト</h2>
      
      <div className="mb-6">
        <button 
          onClick={() => runTest('接続テスト', testConnection)}
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 mr-2"
        >
          接続テスト
        </button>
        
        <button 
          onClick={() => runTest('認証テスト', testAuth)}
          disabled={isLoading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 mr-2"
        >
          認証テスト
        </button>
        
        <button 
          onClick={() => runTest('SELECTテスト', testSelect)}
          disabled={isLoading}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 mr-2"
        >
          SELECTテスト
        </button>
        
        <button 
          onClick={() => runTest('INSERTテスト', testInsert)}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          INSERTテスト
        </button>
      </div>

      {isLoading && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <p>テスト実行中...</p>
        </div>
      )}

      <div>
        <h3 className="text-xl font-semibold mb-2">テスト結果</h3>
        {testResults.length === 0 ? (
          <p>まだテストが実行されていません</p>
        ) : (
          <div className="space-y-4">
            {testResults.map((test, index) => (
              <div key={index} className="p-3 border rounded">
                <h4 className="font-semibold">{test.testName}</h4>
                {test.error ? (
                  <div className="mt-2 p-2 bg-red-100 text-red-700 rounded">
                    <p>エラー: {test.error}</p>
                  </div>
                ) : (
                  <div className="mt-2 p-2 bg-green-100 text-green-700 rounded">
                    <pre>{JSON.stringify(test.result, null, 2)}</pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManualDBTest;