import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const TaxFilingSupport: React.FC = () => {
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('individual');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [documents] = useState([
    { id: 1, name: '確定申告書A', type: 'individual', status: 'completed', required: true },
    { id: 2, name: '青色申告決算書', type: 'individual', status: 'pending', required: true },
    { id: 3, name: '給与所得者の扶養控除等申告書', type: 'individual', status: 'pending', required: false },
    { id: 4, name: '法人税申告書', type: 'corporate', status: 'completed', required: true },
    { id: 5, name: '決算短信', type: 'corporate', status: 'pending', required: true },
    { id: 6, name: '株主名簿', type: 'corporate', status: 'pending', required: false },
  ]);

  const years = ['2024', '2023', '2022', '2021'];

  const filteredDocuments = documents.filter(doc =>
    doc.type === businessType && (businessType === 'individual' || businessType === 'corporate')
  );

  const handleDownload = (documentId: number) => {
    // ダウンロード処理の実装
    console.log(`Document ${documentId} downloaded`);
  };

  const handleUpload = (documentId: number) => {
    // アップロード処理の実装
    console.log(`Document ${documentId} uploaded`);
  };

  const handleAutoImport = (documentId: number) => {
    // 自動取り込み処理の実装
    console.log(`Document ${documentId} auto-imported`);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
          </Link>
          <h1 className="text-2xl font-bold text-text-main">申告サポート</h1>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="mb-6">
            <label className="block text-sm font-medium text-text-muted mb-2">業態選択</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setBusinessType('individual')}
                className={`px-4 py-2 rounded-md ${businessType === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-surface-highlight text-text-muted hover:bg-border'
                  }`}
              >
                個人事業主
              </button>
              <button
                onClick={() => setBusinessType('corporate')}
                className={`px-4 py-2 rounded-md ${businessType === 'corporate'
                  ? 'bg-primary text-white'
                  : 'bg-surface-highlight text-text-muted hover:bg-border'
                  }`}
              >
                法人
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-muted mb-2">確定申告年度</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full md:w-64 px-3 py-2 bg-background border border-border rounded-md text-text-main focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {years.map(year => (
                <option key={year} value={year}>{year}年分</option>
              ))}
            </select>
          </div>

          <div className="block md:hidden space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-surface p-4 rounded-lg shadow-sm border border-border">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-medium text-text-main">{doc.name}</div>
                  <div>
                    {doc.required ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
                        必須
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-muted">
                        任意
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center mb-3">
                  {doc.status === 'completed' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      完了
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      未完了
                    </span>
                  )}
                </div>

                <div className="flex flex-col space-y-2 pt-2 border-t border-border">
                  <button
                    onClick={() => handleDownload(doc.id)}
                    className="flex items-center justify-center px-3 py-2 border border-border rounded-md text-sm text-text-muted bg-surface hover:bg-surface-highlight"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ダウンロード
                  </button>
                  <button
                    onClick={() => handleUpload(doc.id)}
                    className="flex items-center justify-center px-3 py-2 border border-border rounded-md text-sm text-text-muted bg-surface hover:bg-surface-highlight"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    アップロード
                  </button>
                  <button
                    onClick={() => handleAutoImport(doc.id)}
                    className="flex items-center justify-center px-3 py-2 border border-primary/30 rounded-md text-sm text-primary bg-primary/5 hover:bg-primary/10"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    自動取り込み
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-surface-highlight">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">書類名</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">ステータス</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">必須</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-text-muted uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {filteredDocuments.map((doc) => (
                  <tr key={doc.id}>
                    <td className="px-4 py-3 text-sm font-medium text-text-main">{doc.name}</td>
                    <td className="px-4 py-3 text-sm">
                      {doc.status === 'completed' ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          完了
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-600">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          未完了
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {doc.required ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600">
                          必須
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-muted">
                          任意
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDownload(doc.id)}
                          className="inline-flex items-center px-3 py-1 border border-border rounded-md text-sm text-text-muted bg-surface hover:bg-surface-highlight"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          ダウンロード
                        </button>
                        <button
                          onClick={() => handleUpload(doc.id)}
                          className="inline-flex items-center px-3 py-1 border border-border rounded-md text-sm text-text-muted bg-surface hover:bg-surface-highlight"
                        >
                          <Upload className="w-4 h-4 mr-1" />
                          アップロード
                        </button>
                        <button
                          onClick={() => handleAutoImport(doc.id)}
                          className="inline-flex items-center px-3 py-1 border border-primary/30 rounded-md text-sm text-primary bg-primary/5 hover:bg-primary/10"
                        >
                          <FileText className="w-4 h-4 mr-1" />
                          自動取り込み
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6">
          <h2 className="text-lg font-medium text-text-main mb-4">申告手順</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">1</span>
              </div>
              <h3 className="font-medium text-text-main mb-2">必要な書類をダウンロード</h3>
              <p className="text-sm text-text-muted">上記の書類をダウンロードし、印刷してください。</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">2</span>
              </div>
              <h3 className="font-medium text-text-main mb-2">データを入力・アップロード</h3>
              <p className="text-sm text-text-muted">書類に必要事項を記入し、スキャンしてアップロードしてください。</p>
            </div>
            <div className="border border-border rounded-lg p-4">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                <span className="text-primary font-bold">3</span>
              </div>
              <h3 className="font-medium text-text-main mb-2">自動取り込みと確認</h3>
              <p className="text-sm text-text-muted">アップロードした書類からデータを自動取り込みし、内容を確認してください。</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaxFilingSupport;