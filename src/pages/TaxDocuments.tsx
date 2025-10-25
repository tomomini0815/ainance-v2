import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, Calendar, Download, Eye, Heart, HeartOff, Archive } from 'lucide-react';
import { getTaxDocuments } from '../services/TaxFilingService';

const TaxDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [taxDocuments, setTaxDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('individual');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [favoriteDocuments, setFavoriteDocuments] = useState<string[]>([]);

  // ユーザーIDの取得
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUserId(userData.id);
      } catch (error) {
        console.error('ユーザー情報の解析に失敗しました:', error);
      }
    }
  }, []);

  // お気に入りドキュメントの取得
  useEffect(() => {
    const favorites = localStorage.getItem('favoriteTaxDocuments');
    if (favorites) {
      try {
        setFavoriteDocuments(JSON.parse(favorites));
      } catch (error) {
        console.error('お気に入りドキュメントの解析に失敗しました:', error);
      }
    }
  }, []);

  // 申告書データの取得
  useEffect(() => {
    if (userId) {
      fetchTaxDocuments();
    }
  }, [userId, businessType, selectedYear]);

  const fetchTaxDocuments = async () => {
    if (!userId) return;
    
    try {
      setLoading(true);
      const documents = await getTaxDocuments(userId, businessType, selectedYear);
      setTaxDocuments(documents);
    } catch (error) {
      console.error('申告書データの取得に失敗しました:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: any) => {
    // 申告書の詳細表示ロジックをここに実装
    console.log('申告書を表示:', document);
    // 実際のアプリケーションでは、PDFプレビューや詳細画面に遷移する
  };

  const handleDownloadDocument = (document: any) => {
    // 申告書のダウンロードロジックをここに実装
    console.log('申告書をダウンロード:', document);
    // 実際のアプリケーションでは、PDFファイルを生成してダウンロードする
  };

  const handleBulkDownload = () => {
    if (selectedDocuments.length === 0) {
      alert('ダウンロードする書類を選択してください。');
      return;
    }
    
    // 選択されたドキュメントを一括ダウンロード
    console.log('選択されたドキュメントを一括ダウンロード:', selectedDocuments);
    // 実際のアプリケーションでは、選択されたドキュメントをZIPファイルにまとめてダウンロードする
    alert(`${selectedDocuments.length}件の書類をダウンロードします。`);
  };

  const toggleDocumentSelection = (documentId: string) => {
    if (selectedDocuments.includes(documentId)) {
      setSelectedDocuments(selectedDocuments.filter(id => id !== documentId));
    } else {
      setSelectedDocuments([...selectedDocuments, documentId]);
    }
  };

  const toggleFavoriteDocument = (documentId: string) => {
    let newFavorites;
    if (favoriteDocuments.includes(documentId)) {
      newFavorites = favoriteDocuments.filter(id => id !== documentId);
    } else {
      newFavorites = [...favoriteDocuments, documentId];
    }
    
    setFavoriteDocuments(newFavorites);
    localStorage.setItem('favoriteTaxDocuments', JSON.stringify(newFavorites));
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/tax-filing-support" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">申告書一覧</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">業態選択</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => setBusinessType('individual')}
                  className={`flex-1 px-4 py-2 rounded-md ${
                    businessType === 'individual'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  個人事業主
                </button>
                <button
                  onClick={() => setBusinessType('corporate')}
                  className={`flex-1 px-4 py-2 rounded-md ${
                    businessType === 'corporate'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  法人
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">年度</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}年分</option>
                ))}
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={fetchTaxDocuments}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                検索
              </button>
              <button
                onClick={handleBulkDownload}
                disabled={selectedDocuments.length === 0}
                className={`flex-1 px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  selectedDocuments.length > 0
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Download className="h-4 w-4 inline mr-1" />
                一括ダウンロード
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">データを読み込んでいます...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                      <input
                        type="checkbox"
                        checked={selectedDocuments.length === taxDocuments.length && taxDocuments.length > 0}
                        onChange={() => {
                          if (selectedDocuments.length === taxDocuments.length) {
                            setSelectedDocuments([]);
                          } else {
                            setSelectedDocuments(taxDocuments.map(doc => doc.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                      />
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">書類名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">年度</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">作成日</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {taxDocuments.length > 0 ? (
                    taxDocuments.map((document) => (
                      <tr key={document.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedDocuments.includes(document.id)}
                            onChange={() => toggleDocumentSelection(document.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 h-4 w-4"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 text-gray-400 mr-3" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{document.document_type}</div>
                              <div className="text-sm text-gray-500">
                                {document.business_type === 'individual' ? '個人事業主' : '法人'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {document.year}年分
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                            {new Date(document.created_at).toLocaleDateString('ja-JP')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewDocument(document)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              表示
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(document)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              ダウンロード
                            </button>
                            <button
                              onClick={() => toggleFavoriteDocument(document.id)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50"
                            >
                              {favoriteDocuments.includes(document.id) ? (
                                <HeartOff className="h-4 w-4 mr-1 text-red-500" />
                              ) : (
                                <Heart className="h-4 w-4 mr-1" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <FileText className="mx-auto h-12 w-12 text-gray-400" />
                        <h3 className="mt-2 text-sm font-medium text-gray-900">申告書が見つかりません</h3>
                        <p className="mt-1 text-sm text-gray-500">条件に一致する申告書がありません。</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {favoriteDocuments.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Heart className="h-5 w-5 text-red-500 mr-2" />
              お気に入りの書類
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {taxDocuments
                .filter(doc => favoriteDocuments.includes(doc.id))
                .map((document) => (
                  <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900">{document.document_type}</h3>
                        <p className="text-sm text-gray-500">
                          {document.business_type === 'individual' ? '個人事業主' : '法人'} • {document.year}年分
                        </p>
                      </div>
                      <button
                        onClick={() => toggleFavoriteDocument(document.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <HeartOff className="h-5 w-5" />
                      </button>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(document.created_at).toLocaleDateString('ja-JP')}
                      </span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDocument(document)}
                          className="text-sm text-blue-600 hover:text-blue-800"
                        >
                          表示
                        </button>
                        <button
                          onClick={() => handleDownloadDocument(document)}
                          className="text-sm text-green-600 hover:text-green-800"
                        >
                          ダウンロード
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default TaxDocuments;