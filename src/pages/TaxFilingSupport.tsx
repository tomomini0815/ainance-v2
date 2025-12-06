import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Upload, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';

const TaxFilingSupport: React.FC = () => {
  const [businessType, setBusinessType] = useState<'individual' | 'corporate'>('individual');
  const [selectedYear, setSelectedYear] = useState('2024');
  const [isGenerating, setIsGenerating] = useState(false);
  const [documents] = useState([
    { id: 1, name: '確定申告書B（第一表）', type: 'individual', status: 'completed', required: true, description: '所得税の申告に使用します。' },
    { id: 2, name: '青色申告決算書', type: 'individual', status: 'pending', required: true, description: '事業所得の計算に使用します。' },
    { id: 3, name: '収支内訳書', type: 'individual', status: 'pending', required: false, description: '白色申告の場合に使用します。' },
    { id: 4, name: '法人税申告書（別表一）', type: 'corporate', status: 'completed', required: true, description: '法人税の申告に使用します。' },
    { id: 5, name: '決算報告書', type: 'corporate', status: 'pending', required: true, description: '貸借対照表、損益計算書など。' },
    { id: 6, name: '勘定科目内訳明細書', type: 'corporate', status: 'pending', required: false, description: '各勘定科目の詳細を記載します。' },
  ]);

  const years = ['2024', '2023', '2022', '2021'];

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
    companyName: '株式会社Ainance',
    representative: '山田 太郎',
    address: '東京都千代田区千代田1-1-1',
    phone: '03-1234-5678'
  };

  const generateTaxDocument = async (documentName: string) => {
    try {
      setIsGenerating(true);

      let pdfBytes: Uint8Array;
      let pdfDoc: PDFDocument;

      // テンプレートPDFの選択
      let templatePath = '';
      if (documentName.includes('確定申告書')) {
        templatePath = '/templates/tax_return_r05.pdf';
      } else if (documentName.includes('青色申告決算書')) {
        templatePath = '/templates/blue_return_r05.pdf';
      } else {
        templatePath = '/templates/tax_return_r05.pdf';
      }

      console.log(`Attempting to load template from: ${templatePath}`);

      try {
        const existingPdfBytes = await fetch(templatePath).then(res => {
          if (!res.ok) throw new Error(`Template fetch failed: ${res.statusText} (${res.status})`);
          return res.arrayBuffer();
        });
        console.log('Template fetched successfully, size:', existingPdfBytes.byteLength);

        // 暗号化されたPDF（編集保護など）も読み込めるようにオプションを追加
        pdfDoc = await PDFDocument.load(existingPdfBytes, { ignoreEncryption: true });
        console.log('PDF loaded successfully');
      } catch (e) {
        console.error('Template load failed:', e);
        alert(`テンプレートの読み込みに失敗しました: ${e}`);
        // フォールバック: 白紙から作成
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([595.28, 841.89]);
      }

      // fontkitの登録
      try {
        pdfDoc.registerFontkit(fontkit);
        console.log('fontkit registered');
      } catch (e) {
        console.error('fontkit registration failed:', e);
      }

      // 日本語フォントの読み込みと埋め込み
      let font;
      try {
        console.log('Attempting to load font from: /fonts/NotoSansCJKjp-Regular.ttf');
        const fontBytes = await fetch('/fonts/NotoSansCJKjp-Regular.ttf').then(res => {
          if (!res.ok) throw new Error(`Font fetch failed: ${res.statusText} (${res.status})`);
          return res.arrayBuffer();
        });
        console.log('Font fetched successfully, size:', fontBytes.byteLength);
        font = await pdfDoc.embedFont(fontBytes);
        console.log('Font embedded successfully');
      } catch (e) {
        console.error('Font load failed, falling back to standard font:', e);
        font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      }

      // フォールバック（白紙作成）かどうかのフラグ
      let isFallback = false;

      let pages;
      try {
        pages = pdfDoc.getPages();
        if (pages.length === 0) throw new Error('PDF has no pages');
      } catch (e) {
        console.error('Error getting pages, falling back to new PDF:', e);
        isFallback = true;
        pdfDoc = await PDFDocument.create();
        pdfDoc.addPage([595.28, 841.89]);

        // フォールバック時は標準フォントをデフォルトにする（日本語フォントがあれば上書き）
        if (!font) {
          font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        }
        pages = pdfDoc.getPages();
      }

      const firstPage = pages[0];
      const { height } = firstPage.getSize();

      // フォールバック（白紙）の場合、レイアウト（枠線や項目名）を描画
      if (isFallback) {
        const titleFont = font; // タイトル用フォント
        firstPage.drawText(documentName, { x: 50, y: height - 50, size: 20, font: titleFont, color: rgb(0, 0, 0) });
        firstPage.drawText(`Year: ${selectedYear} (Fallback Mode)`, { x: 50, y: height - 80, size: 12, font: titleFont, color: rgb(0.5, 0.5, 0.5) });

        // 簡易的な枠線
        firstPage.drawRectangle({
          x: 40, y: height - 600, width: 515, height: 500,
          borderColor: rgb(0, 0, 0), borderWidth: 1,
        });
      }

      // データの埋め込み
      // 日本語フォントが使えない場合（Helveticaの場合）、日本語テキストは描画できないため英語に置換
      const isStandardFont = font.name.includes('Helvetica') || font.name.includes('Times');
      const safeText = (text: string) => isStandardFont ? '***' : text; // 標準フォントなら日本語を隠す（エラー回避）

      if (documentName.includes('確定申告書')) {
        try {
          if (isFallback) {
            // フォールバック時の項目名描画
            let y = height - 120;
            firstPage.drawText('Address:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.address), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Name:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.representative), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Company:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.companyName), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 40;
            firstPage.drawText('Revenue:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.revenue.toLocaleString(), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Income:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.income.toLocaleString(), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Tax:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.taxAmount.toLocaleString(), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
          } else {
            // 公式テンプレートへの描画
            firstPage.drawText(safeText(dashboardData.address), { x: 120, y: height - 120, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.representative), { x: 120, y: height - 140, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.companyName), { x: 350, y: height - 140, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.revenue.toLocaleString(), { x: 400, y: height - 300, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.income.toLocaleString(), { x: 400, y: height - 450, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.taxAmount.toLocaleString(), { x: 400, y: height - 700, size: 10, font, color: rgb(0, 0, 0) });
          }
        } catch (e) {
          console.error('Error drawing text:', e);
          const errorFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          firstPage.drawText(`Error drawing data: ${e}`, { x: 50, y: 50, size: 10, font: errorFont, color: rgb(1, 0, 0) });
        }
      } else if (documentName.includes('青色申告決算書')) {
        // 青色申告決算書の描画ロジック（同様にsafeTextを使用）
        try {
          if (isFallback) {
            let y = height - 120;
            firstPage.drawText('Company:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.companyName), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Representative:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.representative), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 40;
            firstPage.drawText('Revenue:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.revenue.toLocaleString(), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Expenses:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.expenses.toLocaleString(), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
            y -= 20;
            firstPage.drawText('Income:', { x: 50, y, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.income.toLocaleString(), { x: 150, y, size: 10, font, color: rgb(0, 0, 0) });
          } else {
            firstPage.drawText(safeText(dashboardData.companyName), { x: 100, y: height - 100, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(safeText(dashboardData.representative), { x: 300, y: height - 100, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.revenue.toLocaleString(), { x: 350, y: height - 200, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.expenses.toLocaleString(), { x: 350, y: height - 400, size: 10, font, color: rgb(0, 0, 0) });
            firstPage.drawText(dashboardData.income.toLocaleString(), { x: 350, y: height - 600, size: 10, font, color: rgb(0, 0, 0) });
          }
        } catch (e) {
          console.error('Error drawing text:', e);
          const errorFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
          firstPage.drawText(`Error drawing data: ${e}`, { x: 50, y: 50, size: 10, font: errorFont, color: rgb(1, 0, 0) });
        }
      } else {
        firstPage.drawText(`Document: ${documentName}`, { x: 50, y: height - 50, size: 14, font, color: rgb(0, 0, 0) });
        if (!isFallback) { // Only draw company name if not in fallback mode, as fallback already has a title
          firstPage.drawText(safeText(dashboardData.companyName), { x: 50, y: height - 80, size: 12, font, color: rgb(0, 0, 0) });
        }
      }

      // PDFをバイト配列として保存
      pdfBytes = await pdfDoc.save();

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
    link.download = `${documentName}_テンプレート.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
                className={`px-4 py-2 rounded-md transition-colors ${businessType === 'individual'
                  ? 'bg-primary text-white'
                  : 'bg-surface-highlight text-text-muted hover:bg-border'
                  }`}
              >
                個人事業主
              </button>
              <button
                onClick={() => setBusinessType('corporate')}
                className={`px-4 py-2 rounded-md transition-colors ${businessType === 'corporate'
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