import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, AlertCircle, RefreshCw, Eye, Save, Download, Upload, X, AlertTriangle } from 'lucide-react';
import { createWorker } from 'tesseract.js';
import { convertTransactionToTaxData, saveTaxDocument, processAutoImportData, getTaxDocumentTemplateById, mapOcrResultsToTemplate, validateImportData, saveImportHistory, ValidationRule } from '../services/TaxFilingService';

const AutoImport: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { document } = location.state || {};
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [importResults, setImportResults] = useState<any[]>([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [templates, setTemplates] = useState<any[]>([]);
  const [validationErrors, setValidationErrors] = useState<number>(0);

  // ダミーデータ
  const documentDetails = {
    id: document?.id || 1,
    name: document?.name || '確定申告書A',
    type: document?.type || 'individual',
    year: '2024'
  };

  const processingSteps = [
    'ファイル解析中...',
    'データ抽出中...',
    'データ検証中...',
    'データ変換中...',
    '取り込み完了'
  ];

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

  // テンプレートの取得
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        // 実際のアプリケーションでは、APIからテンプレートを取得します
        // ここではダミーデータを使用
        const dummyTemplates = [
          { id: '1', name: '確定申告書Aテンプレート' },
          { id: '2', name: '青色申告決算書テンプレート' },
          { id: '3', name: '法人税申告書テンプレート' }
        ];
        setTemplates(dummyTemplates);
      } catch (error) {
        console.error('テンプレートの取得に失敗しました:', error);
      }
    };
    
    fetchTemplates();
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setUploadedFiles(files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploadedFiles(files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  const handleStartImport = async () => {
    if (uploadedFiles.length === 0) {
      alert('ファイルをアップロードしてください。');
      return;
    }

    setIsOcrProcessing(true);
    setOcrProgress(0);
    
    try {
      // OCR処理
      const worker = await createWorker('jpn', 1, {
        logger: (m: any) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        },
      });
      
      const ocrResults: any[] = [];
      
      for (let i = 0; i < uploadedFiles.length; i++) {
        const file = uploadedFiles[i];
        const { data: { text } } = await worker.recognize(file);
        ocrResults.push({ fileName: file.name, text });
      }
      
      await worker.terminate();
      
      // OCR結果を解析してフィールドに変換
      let parsedResults;
      
      if (selectedTemplate) {
        // テンプレートが選択されている場合、テンプレートを使用してマッピング
        try {
          const template = await getTaxDocumentTemplateById(selectedTemplate);
          parsedResults = mapOcrResultsToTemplate(ocrResults, template);
        } catch (error) {
          console.error('テンプレートの取得またはマッピングに失敗しました:', error);
          // フォールバックとして基本的な解析を行う
          parsedResults = parseOcrResultsBasic(ocrResults);
        }
      } else {
        // テンプレートが選択されていない場合、基本的な解析を行う
        parsedResults = parseOcrResultsBasic(ocrResults);
      }
      
      // データ検証
      const validationRules: ValidationRule[] = [
        { field: '事業所得', rule: 'min', value: 0, message: '事業所得は0以上である必要があります' },
        { field: '必要経費', rule: 'min', value: 0, message: '必要経費は0以上である必要があります' },
        { field: '所得金額', rule: 'min', value: 0, message: '所得金額は0以上である必要があります' },
        // 他の検証ルールもここに追加できます
      ];
      
      const validatedResults = validateImportData(parsedResults, validationRules);
      
      // 検証エラーの数をカウント
      const errorCount = validatedResults.filter(result => result.status === 'warning').length;
      setValidationErrors(errorCount);
      
      setIsOcrProcessing(false);
      setIsProcessing(true);
      setProcessingStep(0);
      setImportResults(validatedResults);
      setIsCompleted(false);
      
      // シミュレートされた処理
      const interval = setInterval(() => {
        setProcessingStep(prev => {
          if (prev >= processingSteps.length - 1) {
            clearInterval(interval);
            setIsProcessing(false);
            setIsCompleted(true);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (error) {
      console.error('OCR処理中にエラーが発生しました:', error);
      setIsOcrProcessing(false);
      alert('ファイルの処理中にエラーが発生しました。');
    }
  };

  // OCR結果を解析してフィールドに変換する基本関数
  const parseOcrResultsBasic = (ocrResults: any[]) => {
    // 実際のアプリケーションでは、OCRで読み取ったテキストを解析して
    // 申告書の各フィールドにマッピングするロジックを実装します
    
    // ここでは簡単な例として、テキストから数値とラベルを抽出します
    const results: any[] = [];
    
    ocrResults.forEach((result, index) => {
      // テキストを解析してフィールドを抽出
      const lines = result.text.split('\n');
      
      lines.forEach((line: string) => {
        // 金額を含む行を検出
        const amountMatch = line.match(/([^\d]*)[:：]?\s*[¥￥]?\s*([\d,]+)[円]?\s*(.*)/);
        if (amountMatch) {
          results.push({
            field: amountMatch[1].trim() || `金額${results.length + 1}`,
            value: `${amountMatch[2]}円`,
            status: 'success'
          });
        }
        
        // 数値を含む行を検出
        const numberMatch = line.match(/([^\d]*)[:：]?\s*([\d,]+)\s*(.*)/);
        if (numberMatch && !amountMatch) {
          results.push({
            field: numberMatch[1].trim() || `数値${results.length + 1}`,
            value: numberMatch[2],
            status: 'success'
          });
        }
      });
    });
    
    // ダミーデータを追加（実際のOCR結果がない場合）
    if (results.length === 0) {
      return [
        { field: '氏名', value: '山田太郎', status: 'success' },
        { field: '住所', value: '東京都渋谷区桜丘町1-1', status: 'success' },
        { field: '電話番号', value: '03-1234-5678', status: 'success' },
        { field: 'メールアドレス', value: 'yamada@example.com', status: 'success' },
        { field: '事業所得', value: '5,000,000円', status: 'success' },
        { field: '必要経費', value: '2,000,000円', status: 'success' },
        { field: '所得金額', value: '3,000,000円', status: 'success' },
        { field: '控除額', value: '500,000円', status: 'warning' },
        { field: '税額', value: '300,000円', status: 'success' }
      ];
    }
    
    return results;
  };

  const handleSaveResults = async () => {
    if (!userId) {
      alert('ユーザー情報が取得できません。ログインしてください。');
      return;
    }

    try {
      // 自動取り込みデータを処理
      const savedTransactions = await processAutoImportData(importResults, userId);
      
      // 取引データを申告書形式に変換
      const taxData = convertTransactionToTaxData(savedTransactions, documentDetails.type as 'individual' | 'corporate');
      
      // 申告書データを保存
      await saveTaxDocument(taxData, userId, documentDetails.type as 'individual' | 'corporate', parseInt(documentDetails.year), documentDetails.name);
      
      // インポート履歴を保存
      await saveImportHistory(userId, 
        uploadedFiles.map(f => f.name).join(', '), 
        'success', 
        { results: importResults, errors: validationErrors }
      );
      
      alert('取り込んだデータを保存しました。');
    } catch (error) {
      console.error('データの保存に失敗しました:', error);
      
      // インポート履歴を保存（失敗として）
      if (userId) {
        try {
          await saveImportHistory(userId, 
            uploadedFiles.map(f => f.name).join(', '), 
            'failed', 
            { error: (error as Error).message }
          );
        } catch (historyError) {
          console.error('インポート履歴の保存に失敗しました:', historyError);
        }
      }
      
      alert('データの保存に失敗しました。');
    }
  };

  const handleRetry = () => {
    setUploadedFiles([]);
    setIsCompleted(false);
    setImportResults([]);
    setValidationErrors(0);
  };

  const handleViewTaxDocuments = () => {
    navigate('/tax-documents');
  };

  const handleDownloadTemplate = () => {
    if (!selectedTemplate) {
      alert('テンプレートを選択してください。');
      return;
    }
    
    // テンプレートのダウンロードロジックをここに実装
    console.log('テンプレートをダウンロード:', selectedTemplate);
    alert('テンプレートをダウンロードします。');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center mb-6">
          <Link to="/tax-filing-support" className="mr-4">
            <ArrowLeft className="w-6 h-6 text-gray-600 hover:text-gray-900" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">{documentDetails.name} 自動取り込み</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">ファイルアップロード</h2>
              
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  <span className="font-medium text-blue-600">クリックしてファイルを選択</span>またはドラッグ＆ドロップ
                </p>
                <p className="text-xs text-gray-500">PDF、PNG、JPG形式に対応</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.png,.jpg,.jpeg"
                  multiple
                />
              </div>
              
              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">アップロードされたファイル</h3>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <li key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm text-gray-900 truncate">{file.name}</span>
                        <button
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-6">
                <button
                  onClick={handleStartImport}
                  disabled={uploadedFiles.length === 0 || isOcrProcessing}
                  className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                    uploadedFiles.length > 0 && !isOcrProcessing
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isOcrProcessing ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      OCR処理中... {ocrProgress}%
                    </>
                  ) : (
                    <>
                      <FileText className="h-5 w-5 mr-2" />
                      自動取り込みを開始
                    </>
                  )}
                </button>
              </div>
              
              {isProcessing && (
                <div className="mt-6">
                  <div className="text-center py-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center">
                          <RefreshCw className="h-12 w-12 text-blue-600 animate-spin" />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <h3 className="text-lg font-medium text-gray-900">{processingSteps[processingStep]}</h3>
                      <div className="mt-4 w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
                          style={{ width: `${((processingStep + 1) / processingSteps.length) * 100}%` }}
                        ></div>
                      </div>
                      <p className="mt-2 text-sm text-gray-500">
                        {processingStep + 1} / {processingSteps.length} ステップ完了
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {isCompleted && (
                <div>
                  <div className="text-center py-4">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="mt-4 text-lg font-medium text-gray-900">自動取り込みが完了しました</h3>
                    <p className="mt-2 text-sm text-gray-500">
                      書類からデータを正常に取り込みました。内容を確認してください。
                    </p>
                    {validationErrors > 0 && (
                      <div className="mt-3 flex items-center justify-center text-yellow-700 bg-yellow-50 p-2 rounded-md">
                        <AlertTriangle className="h-5 w-5 mr-2" />
                        <span>{validationErrors}件の検証警告があります。内容を確認してください。</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="text-md font-medium text-gray-900 mb-3">取り込み結果</h4>
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">フィールド</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">値</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ステータス</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {importResults.map((result, index) => (
                            <tr key={index} className={result.status === 'warning' ? 'bg-yellow-50' : ''}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{result.field}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{result.value}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {result.status === 'success' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    成功
                                  </span>
                                ) : (
                                  <div>
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                      <AlertTriangle className="h-3 w-3 mr-1" />
                                      要確認
                                    </span>
                                    {result.message && (
                                      <p className="text-xs text-yellow-700 mt-1">{result.message}</p>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap justify-end space-x-3">
                    <button
                      onClick={handleRetry}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      再実行
                    </button>
                    <button
                      onClick={handleViewTaxDocuments}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      申告書を表示
                    </button>
                    <button
                      onClick={handleSaveResults}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      結果を保存
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
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
              </dl>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">テンプレート</h2>
              <div className="space-y-3">
                <select
                  value={selectedTemplate}
                  onChange={(e) => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">テンプレートを選択（オプション）</option>
                  {templates.map((template) => (
                    <option key={template.id} value={template.id}>
                      {template.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleDownloadTemplate}
                  disabled={!selectedTemplate}
                  className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center ${
                    selectedTemplate
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <Download className="h-4 w-4 mr-2" />
                  テンプレートをダウンロード
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">自動取り込みガイド</h2>
              <ul className="space-y-3 text-sm text-gray-600">
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>アップロードされた書類からデータを自動的に抽出します</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>OCR技術を使用して画像からテキストを読み取ります</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>テンプレートを使用してデータを自動的にマッピングします</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>抽出されたデータは自動的に検証されます</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>取り込み結果は手動で確認・修正できます</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>取り込んだデータは取引履歴に自動的に反映されます</span>
                </li>
                <li className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span>データは申告書形式に変換され、保存されます</span>
                </li>
              </ul>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h3 className="text-md font-medium text-gray-900 mb-2">注意事項</h3>
                <ul className="space-y-2 text-xs text-gray-500">
                  <li>• 書類の品質が悪い場合、正確な取り込みができないことがあります</li>
                  <li>• 取り込み結果は必ず確認してください</li>
                  <li>• 要確認と表示された項目は手動で修正してください</li>
                  <li>• 保存されたデータは申告書作成時に使用されます</li>
                  <li>• テンプレートを使用するとデータのマッピングが効率化されます</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AutoImport;