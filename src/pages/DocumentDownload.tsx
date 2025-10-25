import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Download, Eye, Printer } from 'lucide-react';

const DocumentDownload: React.FC = () => {
  const location = useLocation();
  const { document } = location.state || {};
  
  const [previewMode, setPreviewMode] = useState<'pdf' | 'image'>('pdf');

  // ダミーデータ
  const documentDetails = {
    id: document?.id || 1,
    name: document?.name || '確定申告書A',
    type: document?.type || 'individual',
    year: '2024',
    description: '個人事業主向けの確定申告書です。必要事項を記入し、所定の場所に印を押印してください。',
    fileSize: '1.2 MB',
    pages: 5,
    lastUpdated: '2024-01-15'
  };

  const handleDownload = () => {
    // 実際のダウンロード処理
    console.log(`Downloading ${documentDetails.name}`);
    alert(`${documentDetails.name}をダウンロードします。`);
  };

  const handlePrint = () => {
    // 印刷処理
    console.log(`Printing ${documentDetails.name}`);
    alert(`${documentDetails.name}を印刷します。`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/tax-filing-support" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{documentDetails.name} ダウンロード</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-medium text-gray-900">書類プレビュー</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPreviewMode('pdf')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        previewMode === 'pdf'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      PDF
                    </button>
                    <button
                      onClick={() => setPreviewMode('image')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        previewMode === 'image'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      画像
                    </button>
                  </div>
                </div>
                
                <div className="bg-gray-100 rounded-lg h-96 flex items-center justify-center">
                  {previewMode === 'pdf' ? (
                    <div className="text-center">
                      <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                        <div className="border border-gray-300 rounded w-48 h-64 flex items-center justify-center mx-auto mb-2">
                          <span className="text-gray-500">PDFプレビュー</span>
                        </div>
                        <p className="text-sm text-gray-600">確定申告書A</p>
                        <p className="text-xs text-gray-500">ページ 1 of {documentDetails.pages}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <div className="bg-white p-2 rounded-lg shadow-md inline-block">
                        <div className="border border-gray-300 rounded w-64 h-48 flex items-center justify-center">
                          <span className="text-gray-500">画像プレビュー</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="border border-gray-200 rounded-lg p-4 mb-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">書類情報</h2>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">書類名</dt>
                    <dd className="text-sm text-gray-900">{documentDetails.name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">業態</dt>
                    <dd className="text-sm text-gray-900">
                      {documentDetails.type === 'individual' ? '個人事業主' : '法人'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">年度</dt>
                    <dd className="text-sm text-gray-900">{documentDetails.year}年分</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ファイルサイズ</dt>
                    <dd className="text-sm text-gray-900">{documentDetails.fileSize}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">ページ数</dt>
                    <dd className="text-sm text-gray-900">{documentDetails.pages}ページ</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">最終更新</dt>
                    <dd className="text-sm text-gray-900">{documentDetails.lastUpdated}</dd>
                  </div>
                </dl>
              </div>
              
              <div className="border border-gray-200 rounded-lg p-4">
                <h2 className="text-lg font-medium text-gray-900 mb-4">操作</h2>
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    ダウンロード
                  </button>
                  <button
                    onClick={handlePrint}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    印刷
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">書類の説明</h2>
          <div className="prose max-w-none">
            <p className="text-gray-600">{documentDetails.description}</p>
            <h3 className="text-md font-medium text-gray-900 mt-4">記入手順</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>1行目には氏名を記入してください</li>
              <li>2行目には住所を記入してください</li>
              <li>3行目には電話番号を記入してください</li>
              <li>必要に応じて、所定の欄に印を押印してください</li>
            </ol>
            <h3 className="text-md font-medium text-gray-900 mt-4">注意事項</h3>
            <ul className="list-disc list-inside space-y-2 text-gray-600">
              <li>記入は黒色のボールペンで行ってください</li>
              <li>訂正は二重線で囲み、訂正印を押してください</li>
              <li>提出期限は{documentDetails.year}年3月15日です</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DocumentDownload;