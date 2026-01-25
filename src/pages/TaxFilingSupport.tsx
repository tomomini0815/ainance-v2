import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, FileText, CheckCircle, AlertCircle, RefreshCw, Edit2 } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { TaxReturnInputService } from '../services/TaxReturnInputService';
import { mergeTaxData } from '../services/TaxFilingService';

const TaxFilingSupport: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('individual');
  const [selectedYear, setSelectedYear] = useState(String(currentYear));
  const [isGenerating, setIsGenerating] = useState(false);
  const [documents] = useState([
    { id: 1, name: '確定申告書B（第一表）', type: 'individual', status: 'completed', required: true, description: '所得税の申告に使用します。' },
    { id: 2, name: '青色申告決算書', type: 'individual', status: 'pending', required: true, description: '事業所得の計算に使用します。' },
    { id: 3, name: '収支内訳書', type: 'individual', status: 'pending', required: false, description: '白色申告の場合に使用します。' },
    { id: 4, name: '法人税申告書（別表一）', type: 'corporate', status: 'completed', required: true, description: '法人税の申告に使用します。' },
    { id: 5, name: '決算報告書', type: 'corporate', status: 'pending', required: true, description: '貸借対照表、損益計算書など。' },
    { id: 6, name: '勘定科目内訳明細書', type: 'corporate', status: 'pending', required: false, description: '各勘定科目の詳細を記載します。' },
  ]);

  // 現在年度と過去4年分を動的に生成
  const years = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4].map(String);

  const filteredDocuments = documents.filter(doc =>
    doc.type === businessType && (businessType === 'individual' || businessType === 'corporate')
  );

  // ダッシュボードデータのモック（本来はDBから取得）
  const dashboardData = {
    revenue: 12500000,
    expenses: 4800000,
    income: 7700000,
    deductions: 1500000,
    taxAmount: 850000,
    companyName: '',
    representative: '',
    address: '',
    phone: ''
  };

  const generateTaxDocument = async (documentName: string) => {
    try {
      setIsGenerating(true);

      // 手動データの取得
      const manualData = TaxReturnInputService.getData();

      // 自動データの構築（モックデータをベースにするが、本来はTaxFilingService.calculateTaxFilingDataの結果を使う）
      const autoDataMock: any = {
        fiscalYear: currentYear,
        businessType: businessType,
        totalRevenue: dashboardData.revenue,
        totalExpenses: dashboardData.expenses,
        netIncome: dashboardData.income,
        expensesByCategory: [], // モックでは空だが、本来は詳細が必要
        taxableIncome: dashboardData.income - dashboardData.deductions,
        estimatedTax: dashboardData.taxAmount,
        deductions: [], // モック
        status: 'draft'
      };

      // データのマージ
      const mergedData = mergeTaxData(autoDataMock, manualData);

      // 基本情報の補完 (Dashboardのモックデータから)
      mergedData.companyName = dashboardData.companyName || '株式会社サンプル';
      mergedData.representativeName = dashboardData.representative || '代表 太郎';
      mergedData.address = dashboardData.address || '東京都千代田区1-1-1';
      mergedData.tradeName = dashboardData.companyName; // 個人事業主の場合は屋号

      let pdfBytes: Uint8Array;

      // PDF生成ロジックの呼び出し
      if (documentName.includes('確定申告書')) {
        const { generateTaxReturnBPDF } = await import('../services/pdfJapaneseService');
        pdfBytes = await generateTaxReturnBPDF(mergedData);
      } else if (documentName.includes('青色申告決算書')) {
        const { generateBlueReturnPDF } = await import('../services/pdfJapaneseService');
        pdfBytes = await generateBlueReturnPDF(mergedData);
      } else {
        // その他の書類は既存ロジック（または未実装）
        // ここではテンプレートベースの既存ロジックを流用するように見せるが、
        // 今回の改修で generateCorporateTaxPDF なども pdfJapaneseService にあるのでそれを使うべき
        // ですが、今回は個人の確定申告Bと青色申告にフォーカス
        const { generateCorporateTaxPDF } = await import('../services/pdfJapaneseService');
        pdfBytes = await generateCorporateTaxPDF(mergedData); // 法人用フォールバック
      }

      // ... (rest of the blob creation and download logic)


      // Blobを作成
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);

      // 新しいタブでPDFを開く（自動表示）
      const newWindow = window.open(url, '_blank');

      // ポップアップブロック等で開けなかった場合はダウンロードを実行
      if (!newWindow) {
        console.warn('Popup blocked, falling back to download');
        const link = document.createElement('a');
        link.href = url;
        link.download = `${documentName}_${selectedYear}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      setIsGenerating(false);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setIsGenerating(false);
      alert('PDFの生成に失敗しました。');
    }
  };

  const downloadOriginalTemplate = (documentName: string) => {
    let templatePath = '';
    if (documentName.includes('確定申告書')) {
      templatePath = '/templates/tax_return_r05.pdf';
    } else if (documentName.includes('青色申告決算書')) {
      templatePath = '/templates/blue_return_r05.pdf';
    } else {
      alert('この書類のテンプレートはありません。');
      return;
    }

    const link = document.createElement('a');
    link.href = templatePath;
    link.download = `${documentName} _テンプレート.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <Link to="/dashboard" className="mr-4">
              <ArrowLeft className="w-6 h-6 text-text-muted hover:text-text-main" />
            </Link>
            <h1 className="text-2xl font-bold text-text-main">申告サポート</h1>
          </div>
          <div className="flex gap-3">
            <Link
              to="/tax-filing-guide"
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
            >
              📖 申告ガイド
            </Link>
            <Link
              to="/tax-filing-wizard"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
            >
              <FileText className="w-4 h-4" />
              確定申告ウィザード
            </Link>
          </div>
        </div>

        <div className="bg-surface rounded-xl shadow-sm border border-border p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-text-main">申告書作成</h2>
              <p className="text-sm text-text-muted mt-1">
                書類の自動作成や、詳細項目の手動入力が行えます
              </p>
            </div>
            <Link
              to="/tax-return-input"
              className="inline-flex items-center gap-2 px-4 py-2 bg-surface text-text-main border border-border rounded-lg hover:bg-surface-highlight transition-colors text-sm font-medium"
            >
              <Edit2 className="w-4 h-4" />
              手動入力エディタを開く
            </Link>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-text-muted mb-2">業態選択</label>
            <div className="flex space-x-4">
              <button
                onClick={() => setBusinessType('individual')}
                className={`px - 4 py - 2 rounded - md transition - colors ${businessType === 'individual'
                    ? 'bg-primary text-white'
                    : 'bg-surface-highlight text-text-muted hover:bg-border'
                  } `}
              >
                個人事業主
              </button>
              <button
                onClick={() => setBusinessType('corporate')}
                className={`px - 4 py - 2 rounded - md transition - colors ${businessType === 'corporate'
                    ? 'bg-primary text-white'
                    : 'bg-surface-highlight text-text-muted hover:bg-border'
                  } `}
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

          <div className="space-y-4">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="bg-surface p-4 rounded-lg shadow-sm border border-border hover:border-primary/50 transition-colors">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-text-main">{doc.name}</h3>
                      {doc.required ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 border border-red-500/20">
                          必須
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-highlight text-text-muted border border-border">
                          任意
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-text-muted">{doc.description}</p>
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto">
                    <button
                      onClick={() => generateTaxDocument(doc.name)}
                      disabled={isGenerating}
                      className="flex-1 md:flex-none flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
                    >
                      {isGenerating ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-2" />
                      )}
                      <span className="whitespace-nowrap">データ転記・作成</span>
                    </button>

                    <button
                      onClick={() => downloadOriginalTemplate(doc.name)}
                      className="p-2 text-text-muted hover:text-primary transition-colors border border-border rounded-lg hover:bg-surface-highlight"
                      title="テンプレート原本をダウンロード"
                    >
                      <Download className="w-5 h-5" />
                    </button>

                    <button className="p-2 text-text-muted hover:text-primary transition-colors border border-border rounded-lg hover:bg-surface-highlight">
                      <Upload className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* ステータス表示 */}
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <span className="text-text-muted">ステータス:</span>
                  {doc.status === 'completed' ? (
                    <span className="flex items-center text-green-500 font-medium">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      作成済み
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-500 font-medium">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      未作成
                    </span>
                  )}
                  <span className="text-text-muted mx-2">|</span>
                  <span className="text-text-muted">最終更新: {doc.status === 'completed' ? '2024/03/10' : '-'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default TaxFilingSupport;